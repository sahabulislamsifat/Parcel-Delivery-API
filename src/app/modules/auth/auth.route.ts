import { Router } from "express";
import { Role } from "../user/user.interface";
import { checkAuth } from "../../middleware/checkAuth";
import passport from "passport";
import { authControllers } from "./auth.controller";

const router = Router();

router.post("/login", authControllers.credentialsLogin);
router.post("/refresh-token", authControllers.getNewAccessToken);
router.post("/logout", authControllers.logout);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  authControllers.resetPassword
);

// Google OAuth
router.get("/google", (req, res, next) => {
  const redirect = req.query.redirect || "";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect as string,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authControllers.googleCallbackController
);

export const AuthRoutes = router;
