const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validator.middleware");
const { authenticateToken } = require("../middleware/auth.middleware");

// Route d'inscription
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
  ],
  validate,
  authController.register
);

// Route de connexion
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate,
  authController.login
);

// Route de vérification du token
router.get("/verify", authController.verifyToken);

// Route de déconnexion
router.post("/logout", authController.logout);

// Routes protégées (nécessitent un token)
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, authController.updateProfile);

// Route de vérification email
router.post('/verify-email',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 })
  ],
  validate,
  authController.verifyEmail
);

// Route pour renvoyer le code de vérification
router.post('/resend-verification',
  [
    body('email').isEmail().normalizeEmail()
  ],
  validate,
  authController.resendVerificationCode
);

// Route pour demander la réinitialisation du mot de passe
router.post('/request-password-reset',
  [
    body('email').isEmail().normalizeEmail()
  ],
  validate,
  authController.requestPasswordReset
);

// Route pour réinitialiser le mot de passe
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
