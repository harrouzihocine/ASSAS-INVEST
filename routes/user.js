const express = require("express");
const passport = require("passport");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
// const multer = require("multer");
// const { profilePictures } = require("../cloudinary");

// const upload = multer({ storage: profilePictures });
const { isLoggedIn,isAdmin } = require("../middleware/middleware");
const {
  login,
  register,
  showUsers,
  showUserForm,
  showRegisterForm,
  showProfile,
  showLoginForm,
  logout,
  updateUser,
  deleteUser,
} = require("../controllers/user");

router.route("/").get(isLoggedIn, isAdmin, catchAsync(showUsers));
router
  .route("/register")
  .get(isLoggedIn, isAdmin, catchAsync(showRegisterForm))
  .post(isLoggedIn, isAdmin, catchAsync(register));
router
  .route("/login")
  .get(catchAsync(showLoginForm))
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/user/login",
    }),
    login
  );

// router.route.("/auth/facebook")
router.route("/logout").get(isLoggedIn, logout);
// router
//   .route("/:id")
//   .get(catchAsync(showUserForm))
//   .put(upload.single("picture"), catchAsync(updateUser))
//   .delete(catchAsync(deleteUser));
// router.route("/:id/profile").get(catchAsync(showProfile));
module.exports = router;
