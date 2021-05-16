var express = require("express");
const PageController = require("../controllers/PageController");

var router = express.Router();

router.get("/allpages", PageController.getAllPageData);
router.put("/:pagename", PageController.updataPage);
module.exports = router;