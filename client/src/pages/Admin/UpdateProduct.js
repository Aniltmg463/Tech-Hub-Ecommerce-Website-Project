import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import toast from "react-hot-toast";
import axios from "../../config/axios";
import { Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Option } = Select;

const UpdateProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shipping, setShipping] = useState(false);
  const [photo, setPhoto] = useState("");
  const [id, setId] = useState("");

  //get single Product
  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/product/get-product/${params.slug}`
      );
      setName(data.product.name);
      setId(data.product._id);
      setDescription(data.product.description);
      setPrice(data.product.price);
      setQuantity(data.product.quantity);
      setShipping(Boolean(data.product.shipping));
      setCategory(data.product.category._id);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    }
  };

  useEffect(() => {
    getSingleProduct();
    //eslint-disable-next-line
  }, []);

  //get all category
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`/api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Something went wrong in getting category");
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

    // Photo validation (optional for update, but check size if provided)
    if (photo && photo.size > 1000000) {
      toast.error("Photo size must be less than 1MB");
      return false;
    }

    return true;
  };

  //update product function
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate before submission
    if (!validateProduct()) {
      return;
    }

    try {
      console.log('🔄 Updating product:', id);

      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("quantity", quantity);
      productData.append("shipping", shipping ? "1" : "0");
      photo && productData.append("photo", photo);
      productData.append("category", category);
      
      // Add await keyword - this was the main issue!
      const { data } = await axios.put(
        `/api/v1/product/update-product/${id}`,
        productData
      );
      
      console.log('✅ Update response:', data);
      
      // Fix the success logic - it was reversed!
      if (data?.success) {
        toast.success(data?.message || "Product Updated Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message || "Failed to update product");
      }
    } catch (error) {
      console.error('💥 Error updating product:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else {
        toast.error("Network error - please check your connection");
      }
    }
  };

  //delete product
  const handleDelete = async () => {
    try {
      let answer = window.confirm("Are you sure you want to delete this product? This action cannot be undone.");
      if (!answer) return;
      
      console.log('🗑️ Deleting product:', id);
      
      const { data } = await axios.delete(`/api/v1/product/delete-product/${id}`);
      
      console.log('✅ Delete response:', data);
      
      if (data?.success) {
        toast.success("Product Deleted Successfully");
        navigate("/dashboard/admin/products");
      } else {
        toast.error(data?.message || "Failed to delete product");
      }
    } catch (error) {
      console.error('💥 Error deleting product:', error);
      if (error.response) {
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else {
        toast.error("Network error - please check your connection");
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
            <h1>Update Products</h1>
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
                value={category}
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
                {photo ? (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="product_photo"
                      height={"200px"}
                      className="img img-responsive"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={`${axios.defaults.baseURL}/api/v1/product/product-photo/${id}`}
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
                    setShipping(value);
                  }}
                  value={shipping ? "Yes" : "No"}
                >
                  <Option value="0">No</Option>
                  <Option value="1">Yes</Option>
                </Select>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary" onClick={handleUpdate}>
                  UPDATE PRODUCT
                </button>
              </div>
              <div className="mb-3">
                <button className="btn btn-danger" onClick={handleDelete}>
                  DELETE PRODUCT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateProduct;
