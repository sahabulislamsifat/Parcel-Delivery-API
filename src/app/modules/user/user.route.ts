import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
import {
  createUserZodSchema,
  updateUserZodSchema,
  blockUserZodSchema,
} from "./user.validation";
import { UserController } from "./user.controller";
import { checkOwnershipOrAdmin } from "../../middleware/checkOwnership";

const router = Router();

// Public routes
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

// Admin only routes
router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);
router.patch(
  "/block/:id",
  checkAuth(Role.ADMIN),
  validateRequest(blockUserZodSchema),
  UserController.blockUserController
);
router.delete("/delete/:id", checkAuth(Role.ADMIN), UserController.deleteUser);

// Authenticated user routes (own profile or admin)
router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(Role.ADMIN, Role.SENDER, Role.RECEIVER),
  checkOwnershipOrAdmin,
  UserController.updateUser
);

export const UserRoutes = router;
