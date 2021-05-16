const Responsibility = require("../models/ResponsibilityModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// question Schema
function ResponsibilityData(data) {
	this.id = data._id;
    this.category = data.category;
	this.title= data.title;
	this.subtitle = data.subtitle;
	this.range = data.range;
}

/**
 * question List.
 * 
 * @returns {Object}
 */
exports.Responsibilities = [
	function (req, res) {
		try {
			Responsibility.find({},"_id category title subtitle range").then((res_items)=>{
				if(res_items.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", res_items);
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
exports.addResponsibility = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
            if(req.user.scope=="admin"){
                var res_item = new Responsibility(
                    { title: req.body.title,
                        category: req.body.category,
                        subtitle: req.body.subtitle,
                        range:req.body.range,
                    });

                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    //Save question.
                    res_item.save(function (err) {
                        if (err) { return apiResponse.ErrorResponse(res, err); }
                        let resData = new ResponsibilityData(res_item);
                        return apiResponse.successResponseWithData(res,"Land question add Success.", resData);
                    });
                }
            }else{
                return apiResponse.validationErrorWithData(res, "Validation Error.", "Invalid User");
            }			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * question update.
 * @param {string}      title
 * @param {string}      description
 * @param {string}      isbn
 * @returns {Object}
 */
exports.responsibilityUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
            if(req.user.scope == "admin"){
                var res_item = new Responsibility(
                    { title: req.body.title,
                        category: req.body.category,
                        subtitle: req.body.subtitle,
                        range:req.body.range,
                        _id:req.params.id
                    });
    
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                    }else{
                        Responsibility.findById(req.params.id, function (err, foundRes) {
                            if(foundRes === null){
                                return apiResponse.notFoundResponse(res,"Question not exists with this id");
                            }else{
                                //Check authorized user
                                Responsibility.findByIdAndUpdate(req.params.id, res_item, {},function (err) {
                                    if (err) { 
                                        return apiResponse.ErrorResponse(res, err); 
                                    }else{
                                        let resData = new ResponsibilityData(res_item);
                                        return apiResponse.successResponseWithData(res,"Question update Success.", resData);
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
exports.responsibilityDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
            if(req.user.scope=="admin"){
                Responsibility.findById(req.params.id, function (err, foundRes) {
                    if(foundRes === null){
                        return apiResponse.notFoundResponse(res,"Question not exists with this id");
                    }else{
                        Responsibility.findByIdAndRemove(req.params.id,function (err) {
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