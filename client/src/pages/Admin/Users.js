import React, { useState, useEffect, useCallback } from "react";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import axios from "../../config/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

const Users = () => {
  const [auth] = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: 0
  });
  
  // Delete confirmation state
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add user state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: 0,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Fetch all users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");

      if (!auth?.token) {
        toast.error("Please login to view users");
        return;
      }

      if (auth?.user?.role !== 1) {
        toast.error("Admin access required to view users");
        return;
      }

      const { data } = await axios.get("/api/v1/auth/all-users");

      if (data?.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        // toast.success(`Loaded ${data.users.length} users successfully`);
      } else {
        toast.error(data?.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized: Please login as admin");
      } else if (error.response?.status === 403) {
        toast.error("Forbidden: Admin access required");
      } else {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Validation functions for add user form
  const validateName = (name) => {
    // return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name); // Only letters and spaces
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
    const phoneRegex = /^[0-9]{7,13}$/;
    return phoneRegex.test(phone);
  };

  const validateAddress = (address) => {
    return !address || address.trim().length >= 5; // Optional, but if provided must be 5+ chars
  };

  // Check if username already exists
  const checkUsernameExists = async (username) => {
    if (!validateName(username)) return false;

    setIsCheckingUsername(true);
    try {
      const response = await axios.post(
        "/api/v1/auth/check-username",
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
              setAddErrors(prev => ({
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

  // Real-time validation handlers for add user form
  const handleAddNameChange = (e) => {
    const value = e.target.value;
    setAddForm({ ...addForm, name: value });

    if (value && !validateName(value)) {
      setAddErrors(prev => ({
        ...prev,
        name: "Name must be at least 2 characters long and contain only letters and spaces"
      }));
    } else if (value && validateName(value)) {
      setAddErrors(prev => ({ ...prev, name: "" }));
      debounceUsernameCheck(value);
    } else {
      setAddErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleAddEmailChange = (e) => {
    const value = e.target.value;
    setAddForm({ ...addForm, email: value });

    if (value && !validateEmail(value)) {
      setAddErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setAddErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handleAddPasswordChange = (e) => {
    const value = e.target.value;
    setAddForm({ ...addForm, password: value });

    if (value && !validatePassword(value)) {
      setAddErrors(prev => ({ ...prev, password: "Password must be at least 6 characters long" }));
    } else {
      setAddErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleAddPhoneChange = (e) => {
    const value = e.target.value;
    setAddForm({ ...addForm, phone: value });

    if (value && !validatePhone(value)) {
      setAddErrors(prev => ({ ...prev, phone: "Phone number must be 7-13 digits" }));
    } else {
      setAddErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handleAddAddressChange = (e) => {
    const value = e.target.value;
    setAddForm({ ...addForm, address: value });

    if (value && !validateAddress(value)) {
      setAddErrors(prev => ({ ...prev, address: "Address must be at least 5 characters long" }));
    } else {
      setAddErrors(prev => ({ ...prev, address: "" }));
    }
  };

  // Validate entire add user form
  const validateAddForm = async () => {
    const newErrors = {};

    if (!addForm.name) {
      newErrors.name = "Name is required";
    } else if (!validateName(addForm.name)) {
      newErrors.name = "Name must be at least 2 characters long and contain only letters and spaces";
    } else {
      const usernameExists = await checkUsernameExists(addForm.name);
      if (usernameExists) {
        newErrors.name = "Username already exists. Please choose a different username.";
      }
    }

    if (!addForm.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(addForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!addForm.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(addForm.password)) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!addForm.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(addForm.phone)) {
      newErrors.phone = "Phone number must be 7-13 digits";
    }

    if (addForm.address && !validateAddress(addForm.address)) {
      newErrors.address = "Address must be at least 5 characters long";
    }

    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || "",
      role: user.role
    });
    setShowEditModal(true);
  };

  // Handle edit form submission
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔄 Updating user:', editingUser._id, editForm);
      
      const { data } = await axios.put(`/api/v1/auth/update-user/${editingUser._id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        role: editForm.role
      });

      console.log('✅ Update response:', data);

      if (data?.success) {
        toast.success("User updated successfully");
        
        // Update users list
        const updatedUsers = users.map(user => 
          user._id === editingUser._id 
            ? { ...user, ...editForm }
            : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Close modal
        setShowEditModal(false);
        setEditingUser(null);
        
        // Refresh the users list to get updated data from server
        getAllUsers();
      } else {
        toast.error(data?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("💥 Error updating user:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else {
        toast.error("Network error - please check your connection");
      }
    }
  };

  // Handle delete user confirmation
  const handleDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting user:', userToDelete._id);
      
      const { data } = await axios.delete(`/api/v1/auth/delete-user/${userToDelete._id}`);

      console.log('✅ Delete response:', data);

      if (data?.success) {
        toast.success("User deleted successfully");
        
        // Remove user from list
        const updatedUsers = users.filter(user => user._id !== userToDelete._id);
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Close modal
        setShowDeleteModal(false);
        setUserToDelete(null);
        
        // Refresh the users list
        getAllUsers();
      } else {
        toast.error(data?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("💥 Error deleting user:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else {
        toast.error("Network error - please check your connection");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!(await validateAddForm())) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      setIsCreating(true);
      console.log("Creating new user:", addForm);

      const { data } = await axios.post("/api/v1/auth/create-user", {
        name: addForm.name.trim(),
        email: addForm.email.toLowerCase().trim(),
        password: addForm.password,
        phone: addForm.phone.trim(),
        address: addForm.address.trim(),
        role: addForm.role,
      });

      console.log("Create response:", data);

      if (data?.success) {
        toast.success("User created successfully");

        // Reset form and errors
        setAddForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          role: 0,
        });
        setAddErrors({});

        // Close modal
        setShowAddModal(false);

        // Refresh users list
        getAllUsers();
      } else {
        toast.error(data?.message || "Failed to create user");

        // Handle backend validation errors if present
        if (data.errors && Array.isArray(data.errors)) {
          const newErrors = {};
          data.errors.forEach(err => {
            newErrors[err.field] = err.message;
          });
          setAddErrors(prev => ({ ...prev, ...newErrors }));
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);

      // Handle 400 Bad Request (validation errors)
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const newErrors = {};
        error.response.data.errors.forEach(err => {
          newErrors[err.field] = err.message;
          toast.error(err.message);
        });
        setAddErrors(prev => ({ ...prev, ...newErrors }));
      }
      // Handle 409 Conflict (duplicate email or username)
      else if (error.response?.status === 409) {
        const message = error.response.data.message;
        const field = error.response.data.field;

        toast.error(message);

        if (field === 'name' || message.toLowerCase().includes('username')) {
          setAddErrors(prev => ({ ...prev, name: message }));
        } else {
          setAddErrors(prev => ({ ...prev, email: message }));
        }
      }
      // Handle other errors
      else if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else {
        toast.error("Network error - please check your connection");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Fetch users on component mount
  useEffect(() => {
    if (auth?.token) {
      getAllUsers();
    }
  }, [auth?.token]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get role badge
  const getRoleBadge = (role) => {
    if (role === 1) {
      return <span className="badge bg-danger">Admin</span>;
    }
    return <span className="badge bg-primary">User</span>;
  };

  return (
    <Layout title={"Dashboard - All Users"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1>All Users</h1>
              <button
                className="btn btn-success"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add New User
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Loading State */}
            {!auth?.token ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Checking authentication...</p>
              </div>
            ) : loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading users...</p>
              </div>
            ) : (
              <>

                {/* Summary Stats */}
                <div className="row mt-4">
                  <div className="col-md-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h5 className="card-title">Total Users</h5>
                        <h3>{users.length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success text-white">
                      <div className="card-body text-center">
                        <h5 className="card-title">Regular Users</h5>
                        <h3>{users.filter(user => user.role === 0).length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-danger text-white">
                      <div className="card-body text-center">
                        <h5 className="card-title">Admins</h5>
                        <h3>{users.filter(user => user.role === 1).length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-info text-white">
                      <div className="card-body text-center">
                        <h5 className="card-title">Filtered</h5>
                        <h3>{filteredUsers.length}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <br></br>

                {/* Users Table */}
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted">
                            {searchTerm ? "No users found matching your search" : "No users found"}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <tr key={user._id}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                     style={{ width: "35px", height: "35px", fontSize: "14px" }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-bold">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <a href={`mailto:${user.email}`} className="text-decoration-none">
                                {user.email}
                              </a>
                            </td>
                            <td>
                              <a href={`tel:${user.phone}`} className="text-decoration-none">
                                {user.phone}
                              </a>
                            </td>
                            <td>
                              <span className="text-muted" style={{ maxWidth: "200px", display: "inline-block" }}>
                                {user.address || "Not provided"}
                              </span>
                            </td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>
                              <small className="text-muted">
                                {formatDate(user.createdAt)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group" aria-label="User actions">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  title="Edit User"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete User"
                                  onClick={() => handleDeleteConfirmation(user)}
                                  disabled={user._id === auth?.user?._id}
                                >
                                  <i className="fas fa-trash"></i> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User - {editingUser?.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editName" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editName"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editEmail" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="editEmail"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editPhone" className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editPhone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editAddress" className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      id="editAddress"
                      rows="3"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editRole" className="form-label">Role</label>
                    <select
                      className="form-control"
                      id="editRole"
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: parseInt(e.target.value)})}
                    >
                      <option value={0}>User</option>
                      <option value={1}>Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user?</p>
                <div className="alert alert-warning">
                  <strong>User:</strong> {userToDelete?.name}<br />
                  <strong>Email:</strong> {userToDelete?.email}<br />
                  <strong>Role:</strong> {userToDelete?.role === 1 ? 'Admin' : 'User'}
                </div>
                <p className="text-danger">
                  <i className="fas fa-exclamation-triangle"></i> This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash"></i> Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setAddErrors({});
            }
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Add New User
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddErrors({});
                  }}
                ></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="addName" className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className={`form-control ${addErrors.name ? 'is-invalid' : addForm.name && !addErrors.name && !isCheckingUsername ? 'is-valid' : ''}`}
                        id="addName"
                        value={addForm.name}
                        onChange={handleAddNameChange}
                        required
                        disabled={isCreating}
                      />
                      {isCheckingUsername && (
                        <div className="position-absolute" style={{right: '10px', top: '50%', transform: 'translateY(-50%)'}}>
                          <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Checking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {addErrors.name && (
                      <div className="invalid-feedback d-block">{addErrors.name}</div>
                    )}
                    {isCheckingUsername && !addErrors.name && (
                      <div className="form-text text-muted">
                        <small>Checking if username is available...</small>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="addEmail" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${addErrors.email ? 'is-invalid' : addForm.email && !addErrors.email ? 'is-valid' : ''}`}
                      id="addEmail"
                      value={addForm.email}
                      onChange={handleAddEmailChange}
                      required
                      disabled={isCreating}
                    />
                    {addErrors.email && (
                      <div className="invalid-feedback">{addErrors.email}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="addPassword" className="form-label">
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${addErrors.password ? 'is-invalid' : addForm.password && !addErrors.password ? 'is-valid' : ''}`}
                      id="addPassword"
                      value={addForm.password}
                      onChange={handleAddPasswordChange}
                      required
                      placeholder="Minimum 6 characters"
                      disabled={isCreating}
                    />
                    {addErrors.password && (
                      <div className="invalid-feedback">{addErrors.password}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="addPhone" className="form-label">
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${addErrors.phone ? 'is-invalid' : addForm.phone && !addErrors.phone ? 'is-valid' : ''}`}
                      id="addPhone"
                      value={addForm.phone}
                      onChange={handleAddPhoneChange}
                      required
                      placeholder="7-13 digits"
                      disabled={isCreating}
                    />
                    {addErrors.phone && (
                      <div className="invalid-feedback">{addErrors.phone}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="addAddress" className="form-label">
                      Address
                    </label>
                    <textarea
                      className={`form-control ${addErrors.address ? 'is-invalid' : addForm.address && !addErrors.address ? 'is-valid' : ''}`}
                      id="addAddress"
                      rows="3"
                      value={addForm.address}
                      onChange={handleAddAddressChange}
                      placeholder="Optional (minimum 5 characters if provided)"
                      disabled={isCreating}
                    />
                    {addErrors.address && (
                      <div className="invalid-feedback">{addErrors.address}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="addRole" className="form-label">
                      Role <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      id="addRole"
                      value={addForm.role}
                      onChange={(e) =>
                        setAddForm({ ...addForm, role: parseInt(e.target.value) })
                      }
                    >
                      <option value={0}>User</option>
                      <option value={1}>Admin</option>
                    </select>
                  </div>
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <small>
                      Security answer will be auto-set to "admin-created". User can
                      update it later.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddErrors({});
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isCreating || Object.values(addErrors).some(error => error) || isCheckingUsername}
                  >
                    {isCreating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Users;
