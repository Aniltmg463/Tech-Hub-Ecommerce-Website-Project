//with changes in UI desgina and rst filter button
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/category/get-category`
      );
      if (data?.success) setCategories(data?.category || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Get total product count
  const getTotal = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/product/product-count`
      );
      setTotal(data?.total || 0);
    } catch (error) {
      console.error("Error fetching total:", error);
    }
  };

  // Get products with pagination
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/api/v1/product/product-list/${page}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      setLoading(false);
      setProducts(page === 1 ? data.products : [...products, ...data.products]);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };

  // Filter products
  const filterProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/product/product-filters`,
        { checked, radio }
      );
      setLoading(false);
      setProducts(data?.products || []);
    } catch (error) {
      setLoading(false);
      console.error("Error filtering products:", error);
      toast.error("Failed to filter products");
    }
  };

  // Handle category filter
  const handleFilter = (value, id) => {
    setChecked((prev) =>
      value ? [...prev, id] : prev.filter((c) => c !== id)
    );
  };

  // Reset filters
  const resetFilters = () => {
    setChecked([]);
    setRadio([]);
    setPage(1);
    setProducts([]); // Clear products temporarily
    getAllProducts(); // Fetch all products again
  };

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Initial load
  useEffect(() => {
    getAllCategory();
    getTotal();
    getAllProducts();
  }, []);

  // Load products when page changes
  useEffect(() => {
    if (!checked.length && !radio.length) getAllProducts();
  }, [page]);

  // Apply filters
  useEffect(() => {
    if (checked.length || radio.length) {
      setPage(1);
      filterProduct();
    }
  }, [checked, radio]);

  return (
    <Layout title="All Products - Best Offer">
      <div className="container-fluid py-4 ">
        <div className="row g-4">
          <aside className="col-md-3">
            <div className="card shadow-sm p-3">
              <h4 className="mb-3 text-primary">Filters</h4>
              <div className="mb-4">
                <h5 className="text-secondary mb-2">Categories</h5>
                <div className="d-flex flex-column gap-2">
                  {categories.map((c) => (
                    <Checkbox
                      key={c._id}
                      onChange={(e) => handleFilter(e.target.checked, c._id)}
                      checked={checked.includes(c._id)}
                    >
                      {c.name}
                    </Checkbox>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h5 className="text-secondary mb-2">Price Range</h5>
                <Radio.Group
                  onChange={(e) => setRadio(e.target.value)}
                  value={radio}
                  className="d-flex flex-column gap-2"
                >
                  {Prices?.map((p) => (
                    <Radio key={p._id} value={p.array}>
                      {p.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
              <button
                className="btn btn-outline-danger w-100"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </aside>
          <section className="col-md-9">
            <h2 className="text-center mb-4 text-primary">All Products</h2>
            {loading && page === 1 ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  {products.map((p) => (
                    <div className="col" key={p._id}>
                      <div className="card h-100 shadow-sm hover-scale">
                        <img
                          src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                          className="card-img-top"
                          alt={p.name}
                          onError={(e) => {
                            e.target.src = "/images/fallback.jpg";
                          }}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{p.name}</h5>
                          <p className="card-text text-muted">
                            {p.description.length > 30
                              ? `${p.description.substring(0, 30)}...`
                              : p.description}
                          </p>
                          <p className="card-text fw-bold text-success">
                            ${p.price.toFixed(2)}
                          </p>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary flex-grow-1"
                              onClick={() => navigate(`/product/${p.slug}`)}
                            >
                              More Details
                            </button>
                            <button
                              className="btn btn-primary flex-grow-1"
                              onClick={() => {
                                setCart([...cart, p]);
                                localStorage.setItem(
                                  "cart",
                                  JSON.stringify([...cart, p])
                                );
                                toast.success("Item Added to Cart");
                              }}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {products.length < total && (
                  <div className="text-center mt-4">
                    <button
                      className="btn btn-warning px-4 py-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((prev) => prev + 1);
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-grow spinner-grow-sm me-2"
                            role="status"
                          />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
