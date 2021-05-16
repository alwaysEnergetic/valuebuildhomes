const PageModel = require("../models/PageModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Book Schema
function PageData(data) {
}

/**
 * Book List.
 * 
 * @returns {Object}
 */

exports.getAllPageData = [
	function (req, res) {
		try {
			PageModel.find({}).then((pagedata)=>{
				if(pagedata.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", pagedata);
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

exports.updataPage = [
	auth,
	(req, res) => {
        if(req.user.scope=='admin'){
            try {
                    PageModel.find({pageName:req.params.pagename}).then((pages)=>{
                        if(pages.length >0){
                            let page_id = pages[0]._id
    
                            var updatePage = new PageModel(
                            { 
                                _id:page_id,
                                pageName:req.body.page_name,
                                pageContents:req.body.page_contents
                            });
                            
                            PageModel.findByIdAndUpdate(page_id, updatePage, {},function (err) {
                                if (err) {
                                    return apiResponse.ErrorResponse(res, err); 
                                }else{
                                    return apiResponse.successResponseWithData(res,"Page contents update Success.", {success:1,error:0});
                                }
                            });
                        }else{
                            let new_page = new PageModel({
                                pageName:req.body.page_name,
                                pageContents:req.body.page_contents
                            })
                            new_page.save(function (err) {
                                if (err) { return apiResponse.ErrorResponse(res, err); }
                                return apiResponse.successResponseWithData(res,"Page contents add Success.",{success:1,error:0});
                            });
                        }
                    });
                
            } catch (err) {
                //throw error in json response with status 500. 
                return apiResponse.ErrorResponse(res, err);
            }
        }
	}
];