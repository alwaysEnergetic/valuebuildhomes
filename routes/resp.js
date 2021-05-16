var express = require("express");
const ResponsibilityController = require("../controllers/ResponsibilityController");

var router = express.Router();

router.get("/responsibilities", ResponsibilityController.Responsibilities);
router.post("/", ResponsibilityController.addResponsibility);
router.put("/:id", ResponsibilityController.responsibilityUpdate);
router.delete("/:id", ResponsibilityController.responsibilityDelete);

module.exports = router;