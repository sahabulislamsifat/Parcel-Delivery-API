import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validationRequest";
import { ParcelValidation } from "./parcel.validation";
import { ParcelController } from "./parcel.controller";

const router = express.Router();

router.post(
  "/create",
  checkAuth(Role.SENDER),
  validateRequest(ParcelValidation.createParcelValidationSchema),
  ParcelController.createParcel
);

router.get("/", checkAuth(Role.ADMIN), ParcelController.getAllParcels);

router.get(
  "/sender",
  checkAuth(Role.SENDER),
  ParcelController.getParcelsBySender
);

router.get(
  "/receiver",
  checkAuth(Role.RECEIVER),
  ParcelController.getParcelsByReceiver
);

router.patch(
  "/status/:id",
  checkAuth(Role.SENDER, Role.RECEIVER, Role.ADMIN),
  validateRequest(ParcelValidation.updateParcelValidationSchema),
  ParcelController.updateParcelStatus
);

router.patch(
  "/block/:id",
  checkAuth(Role.ADMIN),
  ParcelController.blockUnblockParcel
);

router.delete("/:id", checkAuth(Role.ADMIN), ParcelController.deleteParcel);

export const ParcelRoutes = router;
