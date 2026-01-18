import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/cart";

const ProductDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [cart, setCart] = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product details
  const getProduct = async () => {
    try {
      if (!params.slug || params.slug === "undefined") {
        throw new Error("Invalid product slug");
      }
      setLoading(true);
      setError(null);
      console.log("Fetching product for slug/ID:", params.slug);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/product/get-product/${params.slug}`
      );
      if (!data?.success || !data?.product) {
        throw new Error("Product not found");
      }
      console.log("Product data:", data.product);
      setProduct(data.product);
      if (data.product?._id && data.product?.category?._id) {
        getSimilarProduct(data.product._id, data.product.category._id);
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
      setRelatedProducts([]);
      setError(error.response?.status === 404 ? "Product not found for the given ID or slug" : error.message || "Failed to load product details");
      toast.error(error.response?.status === 404 ? "Product not found" : "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch similar products
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/product/related-product/${pid}/${cid}`
      );
      const products = (data?.products || []).map((p) => ({
        ...p,
        slug: p.slug || p._id, // Fallback to _id if slug is missing
      }));
      console.log("Related products:", products);
      setRelatedProducts(products);
    } catch (error) {
      console.error("Error fetching similar products:", error);
      setRelatedProducts([]);
      toast.error("Failed to load similar products");
    }
  };

  // Handle "Add to Cart"
  const handleAddToCart = (p) => {
    setCart([...cart, p]);
    localStorage.setItem("cart", JSON.stringify([...cart, p]));
    toast.success("Item Added to Cart");
  };

  // Handle "More Details" navigation with slug validation
  const handleNavigateToDetails = (p) => {
    const slug = p.slug && p.slug !== p._id ? p.slug : p._id;
    if (!slug || slug === "undefined") {
      console.warn(`Product with ID ${p._id} has no valid slug:`, p);
      toast.error("Cannot navigate: Product details unavailable");
      return;
    }
    console.log("Navigating to product:", { id: p._id, slug });
    navigate(`/product/${slug}`);
  };

  // Fetch product when slug changes
  useEffect(() => {
    if (params?.slug) {
      setProduct(null);
      setRelatedProducts([]);
      setError(null);
      getProduct();
    }
  }, [params?.slug]);

  return (
    <Layout title={product ? `${product.name} - Details` : "Product Details"}>
      <div className="container-fluid py-4">
        <h1 className="text-center mb-4 text-primary">Product Details</h1>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : !product ? (
          <p className="text-center text-danger">Product not found</p>
        ) : (
          <div className="row g-4">
            <div className="col-md-6">
              <img
                src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${product._id}`}
                className="card-img-top img-fluid rounded"
                alt={product.name}
                style={{ maxHeight: "300px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/images/fallback.jpg";
                }}
              />
            </div>
            <div className="col-md-6">
              <h2>{product.name}</h2>
              <p className="text-muted">{product.description}</p>
              <p className="fw-bold text-success">${product.price?.toFixed(2) || "N/A"}</p>
              <p>Category: {product.category?.name || "N/A"}</p>
              <button
                className="btn btn-primary"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
        <hr className="my-4" />
        <div className="row">
          <h4 className="mb-3 text-primary">Similar Products</h4>
          {loading ? (
            <p className="text-center text-muted">Loading similar products...</p>
          ) : relatedProducts.length < 1 ? (
            <p className="text-center text-muted">No similar products found</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {relatedProducts.map((p) => (
                <div className="col" key={p._id}>
                  <div className="card h-100 shadow-sm hover-scale">
                    <img
                      src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top rounded-top"
                      alt={p.name}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = "/images/fallback.jpg";
                      }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{p.name}</h5>
                      <p className="card-text text-muted">
                        {p.description?.length > 30
                          ? `${p.description.substring(0, 30)}...`
                          : p.description || "No description"}
                      </p>
                      <p className="fw-bold text-success">${p.price?.toFixed(2) || "N/A"}</p>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary flex-grow-1"
                          onClick={() => handleNavigateToDetails(p)}
                        >
                          More Details
                        </button>
                        <button
                          className="btn btn-primary flex-grow-1"
                          onClick={() => handleAddToCart(p)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;