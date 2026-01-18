import slugify from "slugify";
import { jaccardDetailed } from "../helpers/jaccard.js";
import { fuzzyMatchProducts } from "../helpers/fuzzySearch.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_ID,
  privateKey: process.env.BRAINTREE_PRIVATE_ID,
});

// Create product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is Required" });
      case name.trim().length < 3:
        return res.status(400).send({ error: "Name must be at least 3 characters" });
      case name.trim().length > 100:
        return res.status(400).send({ error: "Name must not exceed 100 characters" });
      case !description:
        return res.status(400).send({ error: "Description is Required" });
      case description.trim().length < 10:
        return res.status(400).send({ error: "Description must be at least 10 characters" });
      case description.trim().length > 2000:
        return res.status(400).send({ error: "Description must not exceed 2000 characters" });
      case !price:
        return res.status(400).send({ error: "Price is Required" });
      case isNaN(price):
        return res.status(400).send({ error: "Price must be a valid number" });
      case Number(price) <= 0:
        return res.status(400).send({ error: "Price must be greater than 0" });
      case Number(price) > 1000000:
        return res.status(400).send({ error: "Price must not exceed 1,000,000" });
      case !category:
        return res.status(400).send({ error: "Category is Required" });
      case !quantity && quantity !== 0:
        return res.status(400).send({ error: "Quantity is Required" });
      case isNaN(quantity):
        return res.status(400).send({ error: "Quantity must be a valid number" });
      case Number(quantity) < 0:
        return res.status(400).send({ error: "Quantity cannot be negative" });
      case !Number.isInteger(Number(quantity)):
        return res.status(400).send({ error: "Quantity must be a whole number" });
      case !photo || photo.size > 1000000:
        return res
          .status(400)
          .send({ error: "Photo is Required and should be less than 1MB" });
    }

    // Validate category exists in database
    const categoryExists = await categoryModel.findById(category);
    if (!categoryExists) {
      return res.status(400).send({ error: "Invalid category selected" });
    }

    const product = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

// Get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      // .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      totalCount: products.length,
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

// Get single product
export const getSingleProductController = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try to find by slug first, then by ID if slug doesn't work
    let product = await productModel
      .findOne({ slug: slug })
      .select("-photo")
      .populate("category");
    
    // If not found by slug, try by ID (for backward compatibility)
    if (!product) {
      product = await productModel
        .findById(slug)
        .select("-photo")
        .populate("category");
    }
    
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found for the given ID or slug",
      });
    }
    
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
    });
  }
};

// Get product photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

// Delete product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid);
    res.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

// Update product
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is Required" });
      case name.trim().length < 3:
        return res.status(400).send({ error: "Name must be at least 3 characters" });
      case name.trim().length > 100:
        return res.status(400).send({ error: "Name must not exceed 100 characters" });
      case !description:
        return res.status(400).send({ error: "Description is Required" });
      case description.trim().length < 10:
        return res.status(400).send({ error: "Description must be at least 10 characters" });
      case description.trim().length > 2000:
        return res.status(400).send({ error: "Description must not exceed 2000 characters" });
      case !price:
        return res.status(400).send({ error: "Price is Required" });
      case isNaN(price):
        return res.status(400).send({ error: "Price must be a valid number" });
      case Number(price) <= 0:
        return res.status(400).send({ error: "Price must be greater than 0" });
      case Number(price) > 1000000:
        return res.status(400).send({ error: "Price must not exceed 1,000,000" });
      case !category:
        return res.status(400).send({ error: "Category is Required" });
      case !quantity && quantity !== 0:
        return res.status(400).send({ error: "Quantity is Required" });
      case isNaN(quantity):
        return res.status(400).send({ error: "Quantity must be a valid number" });
      case Number(quantity) < 0:
        return res.status(400).send({ error: "Quantity cannot be negative" });
      case !Number.isInteger(Number(quantity)):
        return res.status(400).send({ error: "Quantity must be a whole number" });
      case photo && photo.size > 1000000:
        return res
          .status(400)
          .send({ error: "Photo should be less than 1MB" });
    }

    // Validate category exists in database
    const categoryExists = await categoryModel.findById(category);
    if (!categoryExists) {
      return res.status(400).send({ error: "Invalid category selected" });
    }

    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    // Check if product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found with the given ID",
      });
    }

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};

// Filter products
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};

    // Filter by categories
    if (checked.length > 0) {
      args.category = { $in: checked }; // Use $in to match any of the checked categories
    }

    // Filter by price range
    if (radio.length === 2) {
      args.price = { $gte: radio[0], $lte: radio[1] }; // Ensure radio has exactly 2 values
    }

    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error sin product count",
      error,
      success: false,
    });
  }
};

// product per page controller
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in per page ctrl",
      error,
    });
  }
};

// search product with fuzzy matching
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const fuzzyEnabled = process.env.FUZZY_MATCHING_ENABLED !== "false";
    const fuzzyThreshold = parseInt(process.env.FUZZY_THRESHOLD || "70");

    // Tier 1: Exact/Regex Match (Fast - MongoDB)
    const exactMatches = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { keywords: { $in: [new RegExp(keyword, "i")] } },
        ],
      })
      .select("-photo")
      .populate("category");

    // If fuzzy disabled or enough exact matches, return immediately
    if (!fuzzyEnabled || exactMatches.length >= 10) {
      return res.json(exactMatches);
    }

    // Tier 2: Fuzzy Matching (Backend Processing)
    // Fetch limited candidate set for fuzzy matching
    const candidates = await productModel
      .find({})
      .select("-photo")
      .populate("category")
      .limit(50);

    const fuzzyResults = fuzzyMatchProducts(keyword, candidates, fuzzyThreshold);

    // Tier 3: Merge and deduplicate
    const exactIds = new Set(exactMatches.map((p) => p._id.toString()));
    const uniqueFuzzy = fuzzyResults
      .filter((item) => !exactIds.has(item.product._id.toString()))
      .sort((a, b) => b.score - a.score)
      .map((item) => ({
        ...item.product.toObject(),
        isFuzzyMatch: true,
        fuzzyScore: item.score,
      }));

    // Combine: exact matches first, then fuzzy matches
    const combined = [...exactMatches, ...uniqueFuzzy];

    res.json(combined);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

//Similar Product
// export const relatedProductController = async (req, res) => {
//   try {
//     const { pid, cid } = req.params;
//     const limit = Number(req.query.limit ?? 3);
//     // Fetch the current product (to compare text fields)
//     const current = await productModel
//       .findById(pid)
//       .select("name description keywords category");

//     // Fetch candidates in same category excluding current product
//     const candidates = await productModel
//       .find({ category: cid, _id: { $ne: pid } })
//       .select("-photo name description keywords")
//       .populate("category");

//     // If current product missing or no candidates, return empty
//     if (!current || candidates.length === 0) {
//       return res.status(200).send({ success: true, products: [] });
//     }

//     // Compute Jaccard similarity using keywords if provided, else fall back to name+description tokens
//     const baseTokens = Array.isArray(current.keywords) && current.keywords.length
//       ? current.keywords
//       : `${current.name || ""} ${current.description || ""}`;
//     const scored = candidates
//       .map((p) => {
//         const targetTokens = Array.isArray(p.keywords) && p.keywords.length
//           ? p.keywords
//           : `${p.name || ""} ${p.description || ""}`;
//         const det = jaccardDetailed(baseTokens, targetTokens);
//         return { product: p, score: det.score, details: det };
//       })
//       .sort((a, b) => b.score - a.score)
//       .slice(0, Math.max(0, limit));

//     // Return only products (and optional score if you want)
//     res.status(200).send({
//       success: true,
//       products: scored.map((s) => ({ ...s.product.toObject(), relatedScore: s.score })),
//     });
//   } catch (error) {
//     console.log(error);
//     res.status({
//       success: false,
//       message: "error while getting related data",
//       error,
//     });
//   }
// };

export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const limit = Number(req.query.limit ?? 6);
    
    // Fetch the current product
    const current = await productModel
      .findById(pid)
      .select("name description keywords category");

    if (!current) {
      return res.status(404).send({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Fetch candidate products in same category (excluding current)
    const candidates = await productModel
      .find({ 
        category: cid, 
        _id: { $ne: pid } 
      })
      .select("name description keywords price")
      .populate("category");

    // If no candidates found, return empty
    if (candidates.length === 0) {
      return res.status(200).send({ 
        success: true, 
        products: [] 
      });
    }

    // Determine base tokens for comparison
    const baseTokens = Array.isArray(current.keywords) && current.keywords.length > 0
      ? current.keywords
      : `${current.name || ""} ${current.description || ""}`;

    // Calculate Jaccard similarity for each candidate
    const scored = candidates
      .map((p) => {
        const targetTokens = Array.isArray(p.keywords) && p.keywords.length > 0
          ? p.keywords
          : `${p.name || ""} ${p.description || ""}`;
        
        const similarity = jaccardDetailed(baseTokens, targetTokens);
        
        return { 
          product: p, 
          score: similarity.score,
          commonKeywords: similarity.intersection,
          totalKeywords: similarity.union.length
        };
      })
      .filter(item => item.score > 0) // Only include products with some similarity
      .sort((a, b) => b.score - a.score) // Sort by highest similarity
      .slice(0, Math.max(0, limit)); // Limit results

    // Return products with similarity scores
    const products = scored.map((s) => ({
      ...s.product.toObject(),
      similarityScore: s.score,
      commonKeywords: s.commonKeywords
    }));

    res.status(200).send({
      success: true,
      products
    });
    
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related products",
      error: error.message
    });
  }
};

// get product by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while Getting products",
      error,
    });
  }
};

// //payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
