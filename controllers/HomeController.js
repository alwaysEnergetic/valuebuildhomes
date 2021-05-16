const HomeModel = require("../models/HomeModel");
const PartModel = require("../models/PartModel");
const MaterialModel = require("../models/MaterialModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Book Schema
function HomeData(data) {
	this.id = data._id;
	this.title= data.title;
	this.desc = data.desc;
    this.size=data.size;
    this.beds=data.beds;
    this.baths=data.baths;
    this.garage=data.garage;
    this.baseprice=data.baseprice;
	this.options=data.options;
    this.subdesigns=data.subdesigns;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */

exports.homes = [
	function (req, res) {
		try {
			HomeModel.find({}).then((homes)=>{
				if(homes.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", homes);
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

exports.getSingleHomeData = [
	function(req, res){
		try {
			HomeModel.findOne({_id: req.params.id}).then((home)=>{                
				if(home !== null){
					let homeData = new HomeData(home);
					return apiResponse.successResponseWithData(res, "Operation success", homeData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (error) {
			
		}
	}
];

exports.getPartsMaterials = [
	function(req, res){
		let temp_parts = []
		let temp_materials = []
		try {
			PartModel.find({}).then((parts)=>{
				if(parts.length > 0){
					temp_parts = parts
				}else{
					temp_parts = []
				}

				MaterialModel.find({}).then((materials)=>{
					if(materials.length > 0){
						temp_materials = materials
					}else{
						temp_materials = []
					}
					return apiResponse.successResponseWithData(res, "Operation success", {parts:temp_parts, materials:temp_materials});
				});
			});
			
			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

// /**
//  * Book Detail.
//  * 
//  * @param {string} id
//  * 
//  * @returns {Object}
//  */

// exports.bookDetail = [
// 	auth,
// 	function (req, res) {
// 		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
// 			return apiResponse.successResponseWithData(res, "Operation success", {});
// 		}
// 		try {
// 			Book.findOne({_id: req.params.id,user: req.user._id},"_id title description isbn createdAt").then((book)=>{                
// 				if(book !== null){
// 					let bookData = new BookData(book);
// 					return apiResponse.successResponseWithData(res, "Operation success", bookData);
// 				}else{
// 					return apiResponse.successResponseWithData(res, "Operation success", {});
// 				}
// 			});
// 		} catch (err) {
// 			//throw error in json response with status 500. 
// 			return apiResponse.ErrorResponse(res, err);
// 		}
// 	}
// ];

/**
 * Book store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */


exports.addHome = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var new_home = new HomeModel(
				{ title: req.body.title,
                    desc:req.body.desc,
                    size:req.body.size,
                    beds:req.body.beds,
                    baths:req.body.baths,
                    garage:req.body.garage,
                    baseprice:req.body.baseprice,
                    options:req.body.options,
                    subdesigns:req.body.subdesigns
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				let temp_subdesigns = JSON.parse(req.body.subdesigns)
							
				temp_subdesigns.forEach(element => {
					element.styles.forEach(style =>{
						style.parts.forEach(part=>{
							console.log(part)
							PartModel.findOne({part: part.part}).then((foundpart)=>{                
								if(foundpart !== null){
								}else{
									let new_part = new PartModel({
										part:part.part,
										category:part.category
									})
									new_part.save()
								}
							});
							MaterialModel.findOne({colorname: part.colorname}).then((material)=>{                
								if(material !== null){
								}else{
									let new_material = new MaterialModel({
										colorname:part.colorname,
										color:part.color,
										material:part.material
									})
									new_material.save()
								}
							});
						})
					})
				});
				//Save book.
				new_home.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let homeData = new HomeData(new_home);
					return apiResponse.successResponseWithData(res,"Home add Success.", homeData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, "err");
		}
	}
];

exports.updateHome = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var new_home = new HomeModel(
				{ 
					_id:req.params.id,
					title: req.body.title,
                    desc:req.body.desc,
                    size:req.body.size,
                    beds:req.body.beds,
                    baths:req.body.baths,
                    garage:req.body.garage,
                    baseprice:req.body.baseprice,
                    options:req.body.options,
                    subdesigns:req.body.subdesigns
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					HomeModel.findById(req.params.id, function (err, foundHome) {
						if(foundHome === null){
							return apiResponse.notFoundResponse(res,"Home not exists with this id");
						}else{
							let temp_subdesigns = JSON.parse(req.body.subdesigns)
							
							temp_subdesigns.forEach(element => {
								element.styles.forEach(style =>{
									style.parts.forEach(part=>{
										console.log(part)
										PartModel.findOne({part: part.part}).then((foundpart)=>{                
											if(foundpart !== null){
											}else{
												let new_part = new PartModel({
													part:part.part,
													category:part.category
												})
												new_part.save()
											}
										});
										MaterialModel.findOne({colorname: part.colorname}).then((material)=>{                
											if(material !== null){
											}else{
												let new_material = new MaterialModel({
													colorname:part.colorname,
													color:part.color,
													material:part.material
												})
												new_material.save()
											}
										});
									})
								})
							});

							HomeModel.findByIdAndUpdate(req.params.id, new_home, {},function (err) {
								if (err) { 
									return apiResponse.ErrorResponse(res, err); 
								}else{
									let homeData = new HomeData(new_home);
									return apiResponse.successResponseWithData(res,"Home update Success.", homeData);
								}
							});
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];
// /**
//  * Book update.
//  * 
//  * @param {string}      title 
//  * @param {string}      description
//  * @param {string}      isbn
//  * 
//  * @returns {Object}
//  */
// exports.bookUpdate = [
// 	auth,
// 	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
// 	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
// 	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
// 		return Book.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(book => {
// 			if (book) {
// 				return Promise.reject("Book already exist with this ISBN no.");
// 			}
// 		});
// 	}),
// 	sanitizeBody("*").escape(),
// 	(req, res) => {
// 		try {
// 			const errors = validationResult(req);
// 			var book = new Book(
// 				{ title: req.body.title,
// 					description: req.body.description,
// 					isbn: req.body.isbn,
// 					_id:req.params.id
// 				});

// 			if (!errors.isEmpty()) {
// 				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
// 			}
// 			else {
// 				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
// 					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
// 				}else{
// 					Book.findById(req.params.id, function (err, foundBook) {
// 						if(foundBook === null){
// 							return apiResponse.notFoundResponse(res,"Book not exists with this id");
// 						}else{
// 							//Check authorized user
// 							if(foundBook.user.toString() !== req.user._id){
// 								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
// 							}else{
// 								//update book.
// 								Book.findByIdAndUpdate(req.params.id, book, {},function (err) {
// 									if (err) { 
// 										return apiResponse.ErrorResponse(res, err); 
// 									}else{
// 										let bookData = new BookData(book);
// 										return apiResponse.successResponseWithData(res,"Book update Success.", bookData);
// 									}
// 								});
// 							}
// 						}
// 					});
// 				}
// 			}
// 		} catch (err) {
// 			//throw error in json response with status 500. 
// 			return apiResponse.ErrorResponse(res, err);
// 		}
// 	}
// ];

// /**
//  * Book Delete.
//  * 
//  * @param {string}      id
//  * 
//  * @returns {Object}
//  */
exports.homeDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
            if(req.user.scope=="admin"){
                HomeModel.findById(req.params.id, function (err, foundHome) {
                    if(foundHome === null){
                        return apiResponse.notFoundResponse(res,"Question not exists with this id");
                    }else{
                        HomeModel.findByIdAndRemove(req.params.id,function (err) {
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