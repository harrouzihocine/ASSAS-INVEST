const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAdmin } = require("../middleware/middleware");
const {
  profitsList,
  createProfits,
  showCreationForm,
  showProfits,
  updateProfits,
  deleteProfits,
} = require("../controllers/case");
router
  .route("/")
  .get(isLoggedIn, isAdmin, catchAsync(profitsList))
  .post(isLoggedIn, isAdmin, catchAsync(createProfits));
router.route("/new").get(isLoggedIn, isAdmin, catchAsync(showCreationForm));
router
  .route("/:id")
  .get(isLoggedIn, catchAsync(showProfits))
  .put(isLoggedIn, isAdmin, catchAsync(updateProfits))
  .delete(isLoggedIn, isAdmin, catchAsync(deleteProfits));

module.exports = router;
