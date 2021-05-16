var express = require("express");
const UserController = require("../controllers/UserController");

var router = express.Router();

router.get("/customers", UserController.customerList);
router.get("/mylandinfo", UserController.myLandInformation);
router.get("/myrespinfo", UserController.myRespInformation);
router.get("/myallinfo", UserController.myAllInformation);

module.exports = router;