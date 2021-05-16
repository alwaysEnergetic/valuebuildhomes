var express = require("express");
const OptionController = require("../controllers/OptionController");

var router = express.Router();

router.get("/options", OptionController.getOptions);
router.post("/", OptionController.addOption);
router.put("/:id", OptionController.optionUpdate);
router.delete("/:id", OptionController.optionDelete);

module.exports = router;