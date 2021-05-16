const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const tokenManager = require("../helpers/tokenManager");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const auth = require("../middlewares/jwt");


function UserData(data) {
	this.id = data._id;
	this.scope = data.scope;
	this.email = data.email;
}
/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					let scope = "customer";
					if(req.body.scope){
						if(req.body.scope == "admin"){
							scope = "admin";
						}
					}
					var user = new UserModel(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							email: req.body.email,
							scope:scope,
							password: hash,
							confirmOTP: otp
						}
					);
					// Html email body
					let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
					// Send confirmation email
					// mailer.send(
					// 	constants.confirmEmails.from, 
					// 	req.body.email,
					// 	"Confirm Account",
					// 	html
					// ).then(function(){
					// 	// Save user.
					// 	user.save(function (err) {
					// 		if (err) { return apiResponse.ErrorResponse(res, err); }
					// 		let userData = {
					// 			_id: user._id,
					// 			firstName: user.firstName,
					// 			lastName: user.lastName,
					// 			email: user.email
					// 		};
					// 		return apiResponse.successResponseWithData(res,"Registration Success.", userData);
					// 	});
					// }).catch(err => {
					// 	console.log(err);
					// 	return apiResponse.ErrorResponse(res,err);
					// }) ;

					user.save(function (err) {
						if (err) { return apiResponse.ErrorResponse(res, err); }
						let userData = {
							_id: user._id,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
							scope:user.scope,
						};
						return apiResponse.successResponseWithData(res,"Registration Success.", userData);
					});
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];


exports.submitWithHomeData = [
	function (req, res) {
		try {
			bcrypt.hash(req.body.password,10,function(err, hash) {
				// generate OTP for confirmation
				let otp = utility.randomNumber(4);
				// Create User object with escaped and trimmed data
				let scope = "customer";
				if(req.body.scope){
					if(req.body.scope == "admin"){
						scope = "admin";
					}
				}
				let temp_home_info = {}
				req.body.customized_homes.forEach(home => {
					if(home.id==req.body.last_customized_home){
						temp_home_info = {...home}
						return false
					}
				});
				var user = new UserModel(
					{
						phone:req.body.phone,
						email: req.body.email,
						scope:scope,
						password: hash,
						confirmOTP: otp,
						customizedHomes:req.body.customized_homes,
						favoriteHomes:req.body.favorite_homes,
						homeCost:req.body.home_cost,
						landCost:req.body.land_cost,
						respCost:req.body.resp_cost,
						totalCost:parseInt(req.body.home_cost)+parseInt(req.body.land_cost)+parseInt(req.body.resp_cost),
						landInfo:req.body.land_information,
						respInfo:req.body.resp_information,
						homeInfo:temp_home_info
					}
				);
				
				// Html email body
				let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
				// Send confirmation email
				// mailer.send(
				// 	constants.confirmEmails.from, 
				// 	req.body.email,
				// 	"Confirm Account",
				// 	html
				// ).then(function(){
				// 	// Save user.
				// 	user.save(function (err) {
				// 		if (err) { return apiResponse.ErrorResponse(res, err); }
				// 		let userData = {
				// 			_id: user._id,
				// 			firstName: user.firstName,
				// 			lastName: user.lastName,
				// 			email: user.email
				// 		};
				// 		return apiResponse.successResponseWithData(res,"Registration Success.", userData);
				// 	});
				// }).catch(err => {
				// 	console.log(err);
				// 	return apiResponse.ErrorResponse(res,err);
				// }) ;

				user.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let userData = {
						_id: user._id,
						email: user.email
					};
					return apiResponse.successResponseWithData(res,"Registration Success.", userData);
				});
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}	
	}
];


exports.submitHomeData = [
	auth,
	function (req, res) {
		try {
				let temp_home_info = {}
				req.body.customized_homes.forEach(home => {
					if(home.id==req.body.last_customized_home){
						temp_home_info = {...home}
						return false
					}
				});

				UserModel.findOneAndUpdate(
					{_id: req.user._id}, 
					{customizedHomes:req.body.customized_homes,
						favoriteHomes:req.body.favorite_homes,
						homeCost:req.body.home_cost,
						landCost:req.body.land_cost,
						respCost:req.body.resp_cost,
						totalCost:parseInt(req.body.home_cost)+parseInt(req.body.land_cost)+parseInt(req.body.resp_cost),
						landInfo:req.body.land_information,
						respInfo:req.body.resp_information,
						homeInfo:temp_home_info
					},
					function(err, user) {
						if (err) { return apiResponse.ErrorResponse(res, err); }
						return apiResponse.successResponseWithData(res,"Submit Success.", {id:req.user._id});
				});
				
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}	
	}
];
/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.findOne({email : req.body.email}).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								//Check account confirmation.
								if(user.isConfirmed){
									// Check User's account active or not.
									if(user.status) {
										let userData = {
											_id: user._id,
											firstName: user.firstName,
											lastName: user.lastName,
											scope:user.scope,
											email: user.email,
										};

										//Prepare JWT token for authentication
										const jwtPayload = userData;
										const jwtData = {
											expiresIn: process.env.JWT_TIMEOUT_DURATION,
										};
										const secret = process.env.JWT_SECRET;
										//Generated JWT token with Payload and secret.
										let loginSuccessData = {};
										loginSuccessData.user = userData;
										loginSuccessData.token = jwt.sign(jwtPayload, secret, jwtData);

										loginSuccessData.refresh_token = tokenManager.generateRefreshToken(userData);

										return apiResponse.successResponseRawData(res,loginSuccessData);
									}else {
										return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
									}
								}else{
									return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
								}
							}else{
								return apiResponse.unauthorizedResponse(res, "Wrong Password");
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res, "Account with this email doesn't exist.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

exports.refreshToken = [
	(req, res) => {
		tokenManager.refreshToken(res, req.body.refresh);
	},
];

exports.logout = [
	auth,
	(req, res) => {
		tokenManager.removeRefreshToken(req.user._id);
		return apiResponse.successResponseRawData(res,{message:"Good bye!"});
	},
];

exports.user = [
	auth,
	(req, res) => {
		try {
			UserModel.findOne({_id: req.user._id},"_id firstName lastName email scope").then((user)=>{
				if(user !== null){
					let userData = new UserData(user);
					let responseData = {};
					responseData.user = userData;
					return apiResponse.successResponseRawData(res,responseData);
				}else{
					return apiResponse.successResponseRawData(res,{});
				}
			});
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							//Check account confirmation.
							if(user.confirmOTP == req.body.otp){
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null 
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								return apiResponse.successResponse(res,"Account confirmed success.");
							}else{
								return apiResponse.unauthorizedResponse(res, "Otp does not match");
							}
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	sanitizeBody("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							// Generate otp
							let otp = utility.randomNumber(4);
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
							// Send confirmation email
							mailer.send(
								constants.confirmEmails.from, 
								req.body.email,
								"Confirm Account",
								html
							).then(function(){
								user.isConfirmed = 0;
								user.confirmOTP = otp;
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									return apiResponse.successResponse(res,"Confirm otp sent.");
								});
							});
						}else{
							return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
						}
					}else{
						return apiResponse.unauthorizedResponse(res, "Specified email not found.");
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];