var express = require("express");
const HomeController = require("../controllers/HomeController");

var router = express.Router();

router.get("/homes", HomeController.homes);
router.get("/parts_materials", HomeController.getPartsMaterials);
router.post("/", HomeController.addHome);
router.put("/:id", HomeController.updateHome);
router.get("/:id", HomeController.getSingleHomeData);
router.delete("/:id", HomeController.homeDelete);
module.exports = router;