import express from "express";
import { validateRequest } from "../../middleware/validationRequest";
import {
  blockUserZodSchema,
  createUserZodSchema,
  updateUserZodSchema,
} from "./user.validation";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
import { checkUserOwnershipOrAdmin } from "../../middleware/checkUserOwnershipOrAdmin";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

router.get("/me", checkAuth(...Object.values(Role)), UserController.getMe);

// Admin routes FIRST (static)
router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
router.patch(
  "/block/:id",
  checkAuth(Role.ADMIN),
  validateRequest(blockUserZodSchema),
  UserController.blockUserController
);
router.delete("/delete/:id", checkAuth(Role.ADMIN), UserController.deleteUser);

// Dynamic routes (last)
router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  UserController.getSingleUser
);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(Role.ADMIN, Role.SENDER, Role.RECEIVER),
  checkUserOwnershipOrAdmin,
  UserController.updateUser
);

export const UserRoutes = router;
