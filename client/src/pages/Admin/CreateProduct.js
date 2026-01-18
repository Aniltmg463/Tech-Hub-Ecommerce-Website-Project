import React, { useState, useEffect } from "react";
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import axios from "axios";
import { Select } from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const CreateProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState(false);
  const [photo, setPhoto] = useState("");

  //get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/category/get-category`
      );
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something weny wrong in getting category");
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  // Validation function
  const validateProduct = () => {
    // Name validation
    if (!name || name.trim().length < 3) {
      toast.error("Product name must be at least 3 characters");
      return false;
    }
    if (name.trim().length > 100) {
      toast.error("Product name must not exceed 100 characters");
      return false;
    }

    // Description validation
    if (!description || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return false;
    }
    if (description.trim().length > 2000) {
      toast.error("Description must not exceed 2000 characters");
      return false;
    }

    // Price validation
    if (!price || isNaN(price) || Number(price) <= 0) {
      toast.error("Please enter a valid price greater than 0");
      return false;
    }
    if (Number(price) > 1000000) {
      toast.error("Price cannot exceed 1,000,000");
      return false;
    }

    // Quantity validation
    if (!quantity && quantity !== "0" && quantity !== 0) {
      toast.error("Please enter a quantity");
      return false;
    }
    if (isNaN(quantity) || Number(quantity) < 0) {
      toast.error("Please enter a valid quantity (0 or more)");
      return false;
    }
    if (!Number.isInteger(Number(quantity))) {
      toast.error("Quantity must be a whole number");
      return false;
    }

    // Category validation
    if (!category) {
      toast.error("Please select a category");
      return false;
    }

    // Shipping validation
    if (shipping === "" || shipping === null || shipping === undefined) {
      toast.error("Please select shipping option");
      return false;
    }

    // Photo validation
    if (!photo) {
      toast.error("Please upload a product photo");
      return false;
    }
    if (photo.size > 1000000) {
      toast.error("Photo size must be less than 1MB");
      return false;
    }

    return true;
  };

  //create product function
  const handleCreate = async (e) => {
    e.preventDefault();

    // Validate before submission
    if (!validateProduct()) {
      return;
    }

    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("quantity", quantity);
      productData.append("photo", photo);
      productData.append("category", category);
      productData.append("shipping", shipping ? "1" : "0");

      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/product/create-product`,
        productData
      );

      if (data?.success) {
        toast.success(data?.message || "Product Created Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message || "Failed to create product");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong while creating product");
      }
    }
  };

  return (
    <Layout title={"Dashboard - Create Products"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Create Product</h1>
            <div className="m-1">
              <Select
                bordered={false}
                placeholder="Select a category"
                size="large"
                showSearch
                className="form-select mb-3"
                onChange={(value) => {
                  setCategory(value);
                }}
              >
                {categories?.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
              <div className="mb-3">
                <label className="btn btn-outline-secondary col-md-12">
                  {photo ? photo.name : "Upload Photo"}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    hidden
                  />
                </label>
              </div>
              <div className="mb-3">
                {photo && (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="product_photo"
                      height={"200px"}
                      className="img img-responsive"
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  value={name}
                  placeholder="write a name"
                  className="form-control"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <textarea
                  type="text"
                  value={description}
                  placeholder="write a description"
                  className="form-control"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <input
                  type="number"
                  value={price}
                  placeholder="write a Price"
                  className="form-control"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  value={quantity}
                  placeholder="write a quantity"
                  className="form-control"
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Select
                  bordered={false}
                  placeholder="Select Shipping "
                  size="large"
                  showSearch
                  className="form-select mb-3"
                  onChange={(value) => {
                    setShipping(value === "1");
                  }}
                  value={shipping ? "1" : "0"}
                >
                  <Option value="0">No</Option>
                  <Option value="1">Yes</Option>
                </Select>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary" onClick={handleCreate}>
                  CREATE PRODUCT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
