import { Router } from "express";
import { validateRequest } from "../../middleware/validationRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { UserController } from "./user.controller";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

router.get("/all-users", checkAuth("ADMIN"), UserController.getAllUsers);

router.patch(
  "/:id",
  validateRequest(updateUserZodSchema),
  checkAuth(...Object.values(Role)),
  UserController.updateUser
);

export const UserRoutes = router;
