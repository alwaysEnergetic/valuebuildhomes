var express = require("express");
const AssetsController = require("../controllers/AssetsController");

var router = express.Router();

router.post("/upload_image", AssetsController.uploadImage);
router.post("/upload_file", AssetsController.uploadFile);

module.exports = router;