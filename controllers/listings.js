const { types } = require("joi");
const Listing = require("../models/listing.js");
const axios = require("axios");
const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {

  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({ path: "reviews", populate: { path: "author" } }).populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    // 1. Geocode the location
    const geoRes = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json`,
      {
        params: {
          key: MAPTILER_API_KEY,
          limit: 1,
        },
      }
    );

    const geoData = geoRes.data;

    // 2. Create new listing object from form data
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // 3. Assign image (uploaded or default fallback via schema)
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      newListing.image = {
        url: "", // triggers Mongoose `set()` to apply default
        filename: ""
      };
    }

    // 4. Assign geometry from MapTiler geocoding
    if (geoData.features && geoData.features.length > 0) {
      const coordinates = geoData.features[0].geometry.coordinates; // [lng, lat]
      newListing.geometry = {
        type: "Point",
        coordinates: coordinates,
      };
    } else {
      req.flash("error", "Could not geocode location.");
      return res.redirect("/listings/new");
    }

    // 5. Save to DB
    await newListing.save();
    req.flash("success", "New Listing created!");
    res.redirect(`/listings/${newListing._id}`);

  } catch (err) {
    console.error("Create Listing Error:", err);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditFrom = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_200");
  res.render('listings/edit.ejs', { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // Find existing listing
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Update listing fields
  const updatedData = req.body.listing;
  listing.title = updatedData.title;
  listing.description = updatedData.description;
  listing.price = updatedData.price;
  listing.country = updatedData.country;

  // ⚠️ Check if location has changed and re-geocode
  if (updatedData.location && updatedData.location !== listing.location) {
    listing.location = updatedData.location;

    try {
      const geoRes = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(updatedData.location)}.json`,
        {
          params: {
            key: MAPTILER_API_KEY,
            limit: 1,
          },
        }
      );

      const features = geoRes.data.features;
      if (features && features.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: features[0].geometry.coordinates,
        };
      } else {
        req.flash("error", "Could not geocode new location.");
        return res.redirect(`/listings/${id}/edit`);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      req.flash("error", "Geocoding failed.");
      return res.redirect(`/listings/${id}/edit`);
    }
  }

  // 🖼️ Update image if new one is uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await listing.save();

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};