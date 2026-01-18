import React from "react";
import Layout from "./../components/Layout/Layout";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

const Search = () => {
  const [values, setValues] = useSearch();
  const navigate = useNavigate();
  const [cart, setCart] = useCart();

  // Handle navigation to product details
  const handleNavigateToDetails = (p) => {
    const slug = p.slug && p.slug !== p._id ? p.slug : p._id;
    if (!slug || slug === "undefined") {
      toast.error("Cannot navigate: Product details unavailable");
      return;
    }
    navigate(`/product/${slug}`);
  };

  // Handle add to cart
  const handleAddToCart = (p) => {
    setCart([...cart, p]);
    localStorage.setItem("cart", JSON.stringify([...cart, p]));
    toast.success("Item Added to Cart");
  };

  return (
    <Layout title={"Search results"}>
      <div className="container">
        <h1>Search Results</h1>
        <h6>
          {values?.results.length < 1
            ? "No product Found"
            : `Found ${values?.results.length}`}
        </h6>
        <div className="row">
          {values?.results.map((p) => (
            <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={p._id}>
              <div className="card border-0 shadow-sm">
                <img
                  src={`${process.env.REACT_APP_API}/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top rounded-top"
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = "/path/to/fallback-image.jpg";
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">
                    {p.name}
                    {p.isFuzzyMatch && (
                      <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                        Similar match
                      </span>
                    )}
                  </h5>
                  <p className="card-text text-muted">
                    {p.description.length > 30
                      ? p.description.substring(0, 30) + "..."
                      : p.description}
                  </p>
                  <h6 className="text-primary">$ {p.price}</h6>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleNavigateToDetails(p)}
                    >
                      More Details
                    </button>
                    <button
                      className="btn btn-primary"
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
      </div>
    </Layout>
  );
};

export default Search;
