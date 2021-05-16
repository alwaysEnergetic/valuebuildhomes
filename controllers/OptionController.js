const OptionModel = require("../models/OptionModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// question Schema

function OptionData(data) {
    let {_id, title , category, type, desc, check, price, unit, help_img, help_desc, select, number, selections} = data
	this.id = _id
	this.title= title
	this.category = category
	this.type = type
	this.desc = desc
    this.check = check
    this.price = price
    this.unit = unit
    this.help_img = help_img
    this.help_desc = help_desc
    this.select = select
    this.number = number
    this.selections = selections
}

/**
 * question List.
 * 
 * @returns {Object}
 */
exports.getOptions = [
	function (req, res) {
		try {
			OptionModel.find({}).then((options)=>{
				if(options.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", options);
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
exports.addOption = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
            if(1){
                var new_option = new OptionModel(
                    { title: req.body.title,
                        category: req.body.category,
                        type: req.body.type,
                        desc:req.body.desc,
                        check:false,
                        price:req.body.price,
                        unit:req.body.unit,
                        help_img:req.body.help_img,
                        help_desc:req.body.desc,
                        select:0,
                        number:0,
                        selections:req.body.selections
                    });
                    console.log(req.body.selections)
    
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    //Save question.
                    new_option.save(function (err) {
                        if (err) { return apiResponse.ErrorResponse(res, err); }
                        let optionData = new OptionData(new_option);
                        return apiResponse.successResponseWithData(res,"Option add Success.", optionData);
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
exports.optionUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
            if(req.user.scope == "admin"){
                var new_option = new OptionModel(
                    { title: req.body.title,
                        category: req.body.category,
                        type: req.body.type,
                        desc:req.body.desc,
                        check:false,
                        price:req.body.price,
                        unit:req.body.unit,
                        help_img:req.body.help_img,
                        help_desc:req.body.desc,
                        select:0,
                        number:0,
                        selections:req.body.selections,
                        _id:req.params.id
                    });
    
                if (!errors.isEmpty()) {
                    return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                }
                else {
                    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
                        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
                    }else{
                        OptionModel.findById(req.params.id, function (err, foundOption) {
                            if(foundOption === null){
                                return apiResponse.notFoundResponse(res,"Option not exists with this id");
                            }else{
                                //Check authorized user
                                OptionModel.findByIdAndUpdate(req.params.id, new_option, {},function (err) {
                                    if (err) { 
                                        return apiResponse.ErrorResponse(res, err); 
                                    }else{
                                        let optionData = new OptionData(new_option);
                                        return apiResponse.successResponseWithData(res,"Question update Success.", optionData);
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
exports.optionDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
            if(req.user.scope=="admin"){
                OptionModel.findById(req.params.id, function (err, foundOption) {
                    if(foundOption === null){
                        return apiResponse.notFoundResponse(res,"Option not exists with this id");
                    }else{
                        OptionModel.findByIdAndRemove(req.params.id,function (err) {
                            if (err) { 
                                return apiResponse.ErrorResponse(res, err); 
                            }else{
                                return apiResponse.successResponse(res,"Option delete Success.");
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