const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAdmin } = require("../middleware/middleware");
const passport = require("passport");
const {
  caseList,
  showUserCases,
  createCase,
  showCreationForm,
  showUpdateForm,
  showUserMain,
  showCase,
  updateCase,
  deleteCase,
} = require("../controllers/case");
router
  .route("/")
  .get(isLoggedIn, isAdmin, catchAsync(caseList))
  .post(isLoggedIn, isAdmin, catchAsync(createCase));
router.route("/new").get(isLoggedIn, isAdmin, catchAsync(showCreationForm));
router
  .route("/:id")
  .get(isLoggedIn, catchAsync(showCase))
  .put(isLoggedIn, isAdmin, catchAsync(updateCase))
  .delete(isLoggedIn, isAdmin, catchAsync(deleteCase));
  
router.route("/:id/profit").put(isLoggedIn, isAdmin, catchAsync(updateCase));
router.route("/:id/cases").get(isLoggedIn, catchAsync(showUserCases));
router.route("/:id/edit").get(isLoggedIn, isAdmin, catchAsync(showUpdateForm));
router.route("/:id/main").get(isLoggedIn, catchAsync(showUserMain));
module.exports = router;
