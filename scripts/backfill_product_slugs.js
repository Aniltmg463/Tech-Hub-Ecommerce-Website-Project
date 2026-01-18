import dotenv from "dotenv";
import slugify from "slugify";
import connectDB from "../config/db.js";
import productModel from "../models/productModel.js";

dotenv.config();

async function run() {
  try {
    await connectDB();
    const products = await productModel.find({ $or: [{ slug: { $exists: false } }, { slug: "" }] });
    console.log(`Found ${products.length} products missing slug`);
    for (const p of products) {
      const base = p.name || "product";
      const s = slugify(base, { lower: true, strict: true });
      p.slug = s;
      await p.save();
      console.log(`Updated ${p._id} -> ${s}`);
    }
    console.log("Done.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();


