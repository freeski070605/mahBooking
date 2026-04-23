const express = require("express");
const {
  register,
  login,
  logout,
  me,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  authLoginSchema,
  authRegisterSchema,
} = require("../validators/schemas");

const router = express.Router();

router.post("/register", validate(authRegisterSchema), register);
router.post("/login", validate(authLoginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
