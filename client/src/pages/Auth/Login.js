import React, { useState } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "../../config/axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";
import { useAuth } from "../../context/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && !validatePassword(value)) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 6 characters long" }));
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await axios.post(
        '/api/v1/auth/login',
        { email: email.toLowerCase().trim(), password }
      );
      
      if (res.data.success) {
        toast.success(res.data.message);
        setAuth({
          user: res.data.user,
          token: res.data.token,
          loading: false,  // Ensure loading is false after successful login
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
        navigate(location.state || "/");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Login Page">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h1>Login Page</h1>
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`form-control ${errors.email ? 'is-invalid' : email && !errors.email ? 'is-valid' : ''}`}
              id="email"
              placeholder="Enter Your Email"
              required
              disabled={isSubmitting}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className={`form-control ${errors.password ? 'is-invalid' : password && !errors.password ? 'is-valid' : ''}`}
              id="password"
              placeholder="Enter Your Password (min 6 characters)"
              required
              disabled={isSubmitting}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                navigate("/forgot-password");
              }}
              disabled={isSubmitting}
            >
              Forgot Password
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || Object.values(errors).some(error => error)}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
