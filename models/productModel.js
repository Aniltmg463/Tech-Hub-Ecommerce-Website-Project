import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    keywords: {
      type: [String],
      default: [],
      index: false,
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, "Price must be greater than 0"],
      max: [1000000, "Price cannot exceed 1,000,000"],
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    shipping: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

// Add text index for better search performance
productSchema.index(
  {
    name: "text",
    description: "text",
    keywords: "text",
  },
  {
    weights: {
      name: 10,      // Name matches weighted highest
      keywords: 5,   // Keywords weighted medium
      description: 1, // Description weighted lowest
    },
  }
);

export default mongoose.model("Products", productSchema);
