const LandQuestion = require("../models/LandQuestionModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// question Schema
function LandQuestionData(data) {
	this.id = data._id;
	this.title= data.title;
	this.parent = data.parent;
	this.check = data.check;
	this.amount = data.amount;
}

/**
 * question List.
 * 
 * @returns {Object}
 */
exports.landQuestions = [
	function (req, res) {
		try {
			LandQuestion.find({},"_id title parent check amount").then((questions)=>{
				if(questions.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", questions);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];



/**
 * question store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.addLandQuestion = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("parent", "Parent must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
            if(req.user.scope=="admin"){
                var question = new LandQuestion(
                    { title: req.body.title,
                        parent: req.body.parent,
                        check: req.body.check,
                        amount:req.body.amount,
                    });
    
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    //Save question.
                    question.save(function (err) {
                        if (err) { return apiResponse.ErrorResponse(res, err); }
                        let questionData = new LandQuestionData(question);
                        return apiResponse.successResponseWithData(res,"Land question add Success.", questionData);
                    });
                }
            }else{
                return apiResponse.validationErrorWithData(res, "Validation Error.", []);
            }			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * question update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.landQuestionUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
            if(req.user.scope == "admin"){
                var question = new LandQuestion(
                    { title: req.body.title,
                        parent: req.body.parent,
                        check: req.body.check,
                        amount:req.body.amount,
                        _id:req.params.id
                    });
    
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                    }else{
                        LandQuestion.findById(req.params.id, function (err, foundQuestion) {
                            if(foundQuestion === null){
                                return apiResponse.notFoundResponse(res,"Question not exists with this id");
                            }else{
                                //Check authorized user
                                LandQuestion.findByIdAndUpdate(req.params.id, question, {},function (err) {
                                    if (err) { 
                                        return apiResponse.ErrorResponse(res, err); 
                                    }else{
                                        let questionData = new LandQuestionData(question);
                                        return apiResponse.successResponseWithData(res,"Question update Success.", questionData);
                                    }
                                });
                            }
                        });
                    }
                }
            }else{
                return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid User");
            }
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * question Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.questionDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
            if(req.user.scope=="admin"){
                LandQuestion.findById(req.params.id, function (err, foundQuestion) {
                    if(foundQuestion === null){
                        return apiResponse.notFoundResponse(res,"Question not exists with this id");
                    }else{
                        LandQuestion.findByIdAndRemove(req.params.id,function (err) {
                            if (err) { 
                                return apiResponse.ErrorResponse(res, err); 
                            }else{
                                return apiResponse.successResponse(res,"Question delete Success.");
                            }
                        });
                    }
                });
            }else{
                return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid User");
            }
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];