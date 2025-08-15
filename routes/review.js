const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../views/middleware.js");
const reviewController = require("../controllers/reviews.js");

//Post Review route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete review route
router.delete("/:reviewId" ,isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;