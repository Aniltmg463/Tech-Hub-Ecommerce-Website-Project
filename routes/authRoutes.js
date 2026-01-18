import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  getAllUsersController,
  checkEmailController,
  checkUsernameController,
  updateUserController,
  deleteUserController,
  createUserController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authmiddleware.js";
import { registerValidationRules, validate } from "../middlewares/validationMiddleware.js";

const router = express.Router(); //

// REGISTER || METHOD POST
router.post("/register", registerValidationRules, validate, registerController);

// LOGIN || METHOD POST
router.post("/login", loginController);

// CHECK EMAIL || METHOD POST
router.post("/check-email", checkEmailController);

// CHECK USERNAME || METHOD POST
router.post("/check-username", checkUsernameController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//test router
router.get("/test", requireSignIn, isAdmin, testController);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

//order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

//get all users
router.get("/all-users", requireSignIn, isAdmin, getAllUsersController);

//update user (admin only)
router.put("/update-user/:id", requireSignIn, isAdmin, updateUserController);

//delete user (admin only)
router.delete("/delete-user/:id", requireSignIn, isAdmin, deleteUserController);

//create user (admin only)
router.post("/create-user", requireSignIn, isAdmin, createUserController);

export default router;
