const UserModel = require("../models/UserModel");
const HomeModel = require("../models/HomeModel");
const OptionModel = require("../models/OptionModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const { expect } = require("chai");
mongoose.set("useFindAndModify", false);
mongoose.set('toJSON', { virtuals: true });

// Book Schema
function UserData(data) {
	this.id = data._id;
	this.title= data.title;
	this.description = data.description;
	this.isbn = data.isbn;
	this.createdAt = data.createdAt;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */

exports.customerList = [
	auth,
	function (req, res) {
        if(req.user.scope=="admin"){
            try {
                UserModel.find({scope: "customer"}).then((customers)=>{
                    if(customers.length > 0){
						HomeModel.find({},"_id title subdesigns").then((homes)=>{
							if(homes.length > 0){
								OptionModel.find({}).then((options)=>{
									if(options.length>0){
										return apiResponse.successResponseWithData(res, "Operation success", {homes:homes, customers:customers, options:options});
									}
								})
							}else{
								return apiResponse.successResponseWithData(res, "Operation success", []);
							}
						});
                    }else{
                        return apiResponse.successResponseWithData(res, "Operation success", []);
                    }
                });
            } catch (err) {
                //throw error in json response with status 500. 
                return apiResponse.ErrorResponse(res, err);
            }
        }else{
            return apiResponse.ErrorResponse(res, "Invalid User");
        }
	}
];

exports.myLandInformation = [
    auth,
	function (req, res) {
		try {
			UserModel.findOne({_id:req.user._id},"landInfo").then((info)=>{
				if(info!=null){
					return apiResponse.successResponseWithData(res, "Operation success", info);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", null);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.myRespInformation = [
    auth,
	function (req, res) {
		try {
			UserModel.findOne({_id:req.user._id},"respInfo").then((info)=>{
				if(info!=null){
					return apiResponse.successResponseWithData(res, "Operation success", info);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", null);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.myAllInformation = [
    auth,
	function (req, res) {
		try {
			UserModel.findOne({_id:req.user._id},"customizedHomes favoriteHomes landInfo respInfo homeCost landCost respCost totalCost").then((info)=>{
				if(info!=null){
					return apiResponse.successResponseWithData(res, "Operation success", info);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", null);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

