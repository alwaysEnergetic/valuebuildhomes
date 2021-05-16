const RefreshTokenModel = require("../models/RefreshTokenModel");
const apiResponse = require("./apiResponse");
const jwt = require("jsonwebtoken");

exports.generateRefreshToken = function (userData) {
	let refresh_token = jwt.sign(userData, process.env.REFRESH_TOKEN_SECRET, {expiresIn:process.env.REFRESH_TOKEN_LIFE});
    var token_record = new RefreshTokenModel(
        {   userid:userData._id,
            user: userData,
            token: refresh_token,
            createdAt:Date.now()
        });
    token_record.save();
    return refresh_token;
};

exports.refreshToken = function (res,rToken) {
    RefreshTokenModel.findOne({token : rToken},"user").then((rt)=>{                
        if(rt !== null){
            let new_token = jwt.sign(rt.user, process.env.JWT_SECRET, {expiresIn:process.env.JWT_TIMEOUT_DURATION});
            return apiResponse.successResponseRawData(res,{token:new_token});
        }else{
            return apiResponse.ErrorResponse(res, "Invalid or Expired refresh token");
        }
    });
};

exports.removeRefreshToken = function (userid) {
    RefreshTokenModel.deleteMany({userid:userid});
};