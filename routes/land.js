var express = require("express");
const LandQuestionController = require("../controllers/LandQuestionController");

var router = express.Router();

router.get("/questions", LandQuestionController.landQuestions);
router.post("/", LandQuestionController.addLandQuestion);
router.put("/:id", LandQuestionController.landQuestionUpdate);
router.delete("/:id", LandQuestionController.questionDelete);

module.exports = router;