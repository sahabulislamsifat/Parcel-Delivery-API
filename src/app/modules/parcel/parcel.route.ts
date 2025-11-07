import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validationRequest";
import { ParcelValidation } from "./parcel.validation";
import { ParcelController } from "./parcel.controller";
import { checkParcelOwnershipOrAdmin } from "../../middleware/checkParcelOwnershipOrAdmin";

const router = express.Router();

// Sender routes
router.post(
  "/create",
  checkAuth(Role.SENDER),
  validateRequest(ParcelValidation.createParcelValidationSchema),
  ParcelController.createParcel
);

router.get(
  "/my-parcels",
  checkAuth(Role.SENDER),
  ParcelController.getParcelsBySender
);

router.patch(
  "/cancel/:id",
  checkAuth(Role.SENDER),
  checkParcelOwnershipOrAdmin,
  ParcelController.cancelParcel
);

// Receiver routes
router.get(
  "/incoming-parcels",
  checkAuth(Role.RECEIVER),
  ParcelController.getParcelsByReceiver
);
// Delivered parcels for sender
router.get(
  "/delivered",
  checkAuth(Role.RECEIVER), // or ADMIN if admin view
  ParcelController.getDeliveredParcels
);

router.patch(
  "/confirm-delivery/:id",
  checkAuth(Role.RECEIVER),
  checkParcelOwnershipOrAdmin,
  ParcelController.confirmDelivery
);
// Receiver statistics
router.get(
  "/receiver-statistics",
  checkAuth(Role.RECEIVER),
  ParcelController.getReceiverStatistics
);

// Admin routes
router.get(
  "/all-parcels",
  checkAuth(Role.ADMIN),
  ParcelController.getAllParcels
);

router.get(
  "/statistics",
  checkAuth(Role.ADMIN),
  ParcelController.getStatistics
);

router.get("/search", checkAuth(Role.ADMIN), ParcelController.searchParcels);

router.patch(
  "/status/:id",
  checkAuth(Role.ADMIN),
  validateRequest(ParcelValidation.updateParcelStatusValidationSchema),
  ParcelController.updateParcelStatus
);

router.patch(
  "/block-unblock/:id",
  checkAuth(Role.ADMIN),
  validateRequest(ParcelValidation.blockParcelValidationSchema),
  ParcelController.blockUnblockParcel
);

router.patch(
  "/payment/:id",
  checkAuth(Role.ADMIN),
  validateRequest(ParcelValidation.paymentValidationSchema),
  ParcelController.updatePaymentStatus
);

router.patch(
  "/assign-driver/:id",
  checkAuth(Role.ADMIN),
  validateRequest(ParcelValidation.assignDriverValidationSchema),
  ParcelController.assignDriver
);

router.delete("/:id", checkAuth(Role.ADMIN), ParcelController.deleteParcel);

// Public routes
router.get("/track/:trackingId", ParcelController.getParcelByTrackingId);

// Authenticated user routes (with ownership check)
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SENDER, Role.RECEIVER),
  checkParcelOwnershipOrAdmin,
  ParcelController.getParcelById
);

export const ParcelRoutes = router;
