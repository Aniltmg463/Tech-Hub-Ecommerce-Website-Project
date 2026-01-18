import React, { useState, useCallback } from "react";
import Layout from "./../../components/Layout/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AuthStyles.css";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [answer, setAnswer] = useState("");
  const [role, setRole] = useState("0");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validatePhone = (phone) => {
    // const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    const phoneRegex = /^[0-9]{7,13}$/;
    return phoneRegex.test(phone);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 5;
  };

  const validateAnswer = (answer) => {
    return answer.trim().length >= 2;
  };

  // Check if email already exists
  const checkEmailExists = async (email) => {
    if (!validateEmail(email)) return false;
    
    setIsCheckingEmail(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/auth/check-email`,
        { email: email.toLowerCase().trim() }
      );
      return response.data.exists;
    } catch (error) {
      console.log('Error checking email:', error);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Check if username already exists
  const checkUsernameExists = async (username) => {
    if (!validateName(username)) return false;

    setIsCheckingUsername(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/auth/check-username`,
        { name: username.trim() }  // Case-sensitive, only trim whitespace
      );
      return response.data.exists;
    } catch (error) {
      console.log('Error checking username:', error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced email check
  const debounceEmailCheck = useCallback(
    (() => {
      let timeoutId;
      return (email) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (email && validateEmail(email)) {
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
              setErrors(prev => ({ 
                ...prev, 
                email: "Email already exists. Please use a different email address." 
              }));
              // Show warning toast immediately
            //   toast.error(`⚠️ Email "${email}" is already registered. Please use a different email address.`, 
            //     {
            //     duration: 4000
            //   });
            // } else {
            //   setErrors(prev => ({ ...prev, email: "" }));
            //   // Show success toast for available email
            //   toast.success(`✅ Email "${email}" is available!`, {
            //     duration: 2000
            //   });
            }
          }
        }, 1000); // 1 second delay
      };
    })(),
    []
  );

  // Debounced username check
  const debounceUsernameCheck = useCallback(
    (() => {
      let timeoutId;
      return (username) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (username && validateName(username)) {
            const usernameExists = await checkUsernameExists(username);
            if (usernameExists) {
              setErrors(prev => ({
                ...prev,
                name: "Username already exists. Please choose a different username."
              }));
            }
          }
        }, 1000);
      };
    })(),
    []
  );

  // Real-time validation handlers
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    if (value && !validateName(value)) {
      setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters long" }));
    } else if (value && validateName(value)) {
      setErrors(prev => ({ ...prev, name: "" }));
      debounceUsernameCheck(value);
    } else {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
    } else if (value && validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "" }));
      debounceEmailCheck(value);
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

    // Also validate confirm password if it exists
    if (confirmPassword && value !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else if (confirmPassword && value === confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && value !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    
    if (value && !validatePhone(value)) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number" }));
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value && !validateAddress(value)) {
      setErrors(prev => ({ ...prev, address: "Address must be at least 5 characters long" }));
    } else {
      setErrors(prev => ({ ...prev, address: "" }));
    }
  };

  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setAnswer(value);
    
    if (value && !validateAnswer(value)) {
      setErrors(prev => ({ ...prev, answer: "Answer must be at least 2 characters long" }));
    } else {
      setErrors(prev => ({ ...prev, answer: "" }));
    }
  };

  // Form validation
  const validateForm = async () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = "Name is required";
    } else if (!validateName(name)) {
      newErrors.name = "Name must be at least 2 characters long";
    } else {
      const usernameExists = await checkUsernameExists(name);
      if (usernameExists) {
        newErrors.name = "Username already exists. Please choose a different username.";
      }
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    } else {
      // Final check for existing email
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        newErrors.email = "Email already exists. Please use a different email address.";
      }
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!address) {
      newErrors.address = "Address is required";
    } else if (!validateAddress(address)) {
      newErrors.address = "Address must be at least 5 characters long";
    }

    if (!answer) {
      newErrors.answer = "Security answer is required";
    } else if (!validateAnswer(answer)) {
      newErrors.answer = "Answer must be at least 2 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validateForm())) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/auth/register`,
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          phone: phone.trim(),
          address: address.trim(),
          answer: answer.trim(),
          role: Number(role)
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      } else {
        toast.error(res.data.message);

        // Handle backend validation errors if present
        if (res.data.errors && Array.isArray(res.data.errors)) {
          const newErrors = {};
          res.data.errors.forEach(err => {
            newErrors[err.field] = err.message;
          });
          setErrors(prev => ({ ...prev, ...newErrors }));
        }
      }
    } catch (error) {
      console.log(error);

      // Handle 400 Bad Request (validation errors)
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const newErrors = {};
        error.response.data.errors.forEach(err => {
          newErrors[err.field] = err.message;
          toast.error(err.message);
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
      }
      // Handle 409 Conflict (duplicate email or username)
      else if (error.response?.status === 409) {
        const message = error.response.data.message;
        const field = error.response.data.field;

        toast.error(message);

        if (field === 'name' || message.toLowerCase().includes('username')) {
          setErrors(prev => ({ ...prev, name: message }));
        } else {
          setErrors(prev => ({ ...prev, email: message }));
        }
      }
      // Handle other errors
      else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Register Tech Hub App">
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <h1>Register Page</h1>
          <div className="mb-3">
            <div className="position-relative">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className={`form-control ${errors.name ? 'is-invalid' : name && !errors.name && !isCheckingUsername ? 'is-valid' : ''}`}
                id="name"
                placeholder="Enter Your Name"
                required
                disabled={isSubmitting}
              />
              {isCheckingUsername && (
                <div className="position-absolute" style={{right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Checking...</span>
                  </div>
                </div>
              )}
            </div>
            {errors.name && (
              <div className="invalid-feedback d-block" style={{display: 'block !important'}}>
                {errors.name}
              </div>
            )}
            {isCheckingUsername && !errors.name && (
              <div className="form-text text-muted">
                <small>Checking if username is available...</small>
              </div>
            )}
          </div>
          <div className="mb-3">
            <div className="position-relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`form-control ${errors.email ? 'is-invalid' : email && !errors.email && !isCheckingEmail ? 'is-valid' : ''}`}
                id="email"
                placeholder="Enter Your Email"
                required
                disabled={isSubmitting}
              />
              {isCheckingEmail && (
                <div className="position-absolute" style={{right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Checking...</span>
                  </div>
                </div>
              )}
            </div>
            {errors.email && (
              <div className="invalid-feedback d-block" style={{display: 'block !important'}}>
                {errors.email}
              </div>
            )}
            {isCheckingEmail && !errors.email && (
              <div className="form-text text-muted">
                <small>Checking if email is available...</small>
              </div>
            )}
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
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : confirmPassword && !errors.confirmPassword ? 'is-valid' : ''}`}
              id="confirmPassword"
              placeholder="Confirm Your Password"
              required
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>
          <div className="mb-3">
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className={`form-control ${errors.phone ? 'is-invalid' : phone && !errors.phone ? 'is-valid' : ''}`}
              id="phone"
              placeholder="Enter Your Phone Number"
              required
              disabled={isSubmitting}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              className={`form-control ${errors.address ? 'is-invalid' : address && !errors.address ? 'is-valid' : ''}`}
              id="address"
              placeholder="Enter Your Address"
              required
              disabled={isSubmitting}
            />
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={answer}
              onChange={handleAnswerChange}
              className={`form-control ${errors.answer ? 'is-invalid' : answer && !errors.answer ? 'is-valid' : ''}`}
              id="answer"
              placeholder="What is Your Favorite Sport? (Security Question)"
              required
              disabled={isSubmitting}
            />
            {errors.answer && <div className="invalid-feedback">{errors.answer}</div>}
          </div>
          {/* <div className="mb-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
              id="role"
              required
              disabled={isSubmitting}
            >
              <option value="0">User</option>
              <option value="1">Admin</option>
            </select>
          </div> */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || Object.values(errors).some(error => error) || isCheckingEmail || isCheckingUsername}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};