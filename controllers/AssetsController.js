// const PageModel = require("../models/PageModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const fileUploader = require("../helpers/fileUploader");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

exports.uploadImage = [
	async (req, res)=>{
		try {
			fileUploader.awsImageUpload(req.body.base64data, req.body.name,req.body.new_name,res)
            
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.uploadFile = [
	async (req, res)=>{
		try {
			fileUploader.awsFileUpload(req,res)
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
