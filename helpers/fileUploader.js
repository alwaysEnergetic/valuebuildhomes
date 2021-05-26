/**
 * This gist was inspired from https://gist.github.com/homam/8646090 which I wanted to work when uploading an image from
 * a base64 string.
 * Updated to use Promise (bluebird)
 * Web: https://mayneweb.com
 *
 * @param  {string}  base64 Data
 * @return {string}  Image url
 */
 const utility = require("./utility");
 const apiResponse = require("./apiResponse");
 const Busboy = require('busboy');
 const AWS = require('aws-sdk');
 const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET ,CLOUDFRONT_PREFIX} = process.env;
 AWS.config.update({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: AWS_REGION });
  
 exports.awsImageUpload = async (base64,name,new_name,res) => {
    console.log('awsImageUpload  called..............')
    // You can either "yarn add aws-sdk" or "npm i aws-sdk"
    
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require('bluebird'));

    // Create an s3 instance
    const s3 = new AWS.S3();
  
    // Ensure that you POST a base64 data to your server.
    // Let's assume the variable "base64" is one.
    const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  
    // Getting the file type, ie: jpeg, png or gif
    const type = base64.split(';')[0].split('/')[1];
  
    // Generally we'd have an userId associated with the image
    // For this example, we'll simulate one
    //const userId = 1;
    let file_name = name
    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a different Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
    let params = {
      Bucket: S3_BUCKET,
      Key: `${file_name}.${type}`, // type is not required
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}` // required. Notice the back ticks
    }
  
    // The upload() is used instead of putObject() as we'd need the location url and assign that to our user profile/database
    // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
    let location = '';
    let key = '';

    const upload = async ()=>{
        
        try {
            const { Location, Key } = await s3.upload(params).promise();
            location = Location;
            key = Key;
            console.log("upload()")
            return location
        } catch (error) {
            console.log(error)
            return apiResponse.ErrorResponse(res, err);
        }
    }

    try {
            let temp_result = await s3.headObject( {Bucket: S3_BUCKET,Key: `${file_name}.${type}`}).promise()
            console.log('temp_result:'+temp_result)
            console.log("File Found in S3")
            await s3.deleteObject({Bucket: S3_BUCKET,Key: `${file_name}.${type}`}, async(err, data)=>{
                if (err) {
                    console.log(err, err.stack);  // error
                }else{
                    console.log('deleted');                 // deleted
                    if(new_name){
                        file_name = utility.randomNumber(6)
                    }
                    params.Key= `${file_name}.${type}`
                    await upload()
                    return apiResponse.successResponseWithData(res, "Operation success", {location:CLOUDFRONT_PREFIX+key,name:file_name});
                }     
            });
        } catch (err) {
            console.log("File not Found ERROR : " + err)
            await upload()
            return apiResponse.successResponseWithData(res, "Operation success", {location:CLOUDFRONT_PREFIX+key,name:file_name});
    }
    // Save the Location (url) to your database and Key if needs be.
    // As good developers, we should return the url and let other function do the saving to database etc
    console.log(location, key);
    // To delete, see: https://gist.github.com/SylarRuby/b3b1430ca633bc5ffec29bbcdac2bd52
  }

  exports.awsFileUpload = async (req,res) => {
      console.log(req)
    let chunks = [], fname, ftype, fEncoding;
    let busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        fname = filename.replace(/ /g,"_");
        ftype = mimetype;
        fEncoding = encoding;
        file.on('data', function(data) {
            // you will get chunks here will pull all chunk to an array and later concat it.
            console.log (chunks.length);
            chunks.push(data)
        });
        file.on('end', function() {
            console.log('File [' + filename + '] Finished');
        });
    });
    busboy.on('finish', function() {
        const S3 = new AWS.S3();
        const params = {
            Bucket: S3_BUCKET, // your s3 bucket name
            Key: `${fname}`, 
            Body: Buffer.concat(chunks), // concatinating all chunks
            ACL: 'public-read',
            ContentEncoding: fEncoding, // optional
            ContentType: ftype // required
        }
        // we are sending buffer data to s3.
        S3.upload(params, (err, s3res) => {
            if (err){
                return apiResponse.ErrorResponse(res, err);
            } else {
                console.log(s3res, "upload success")
                return apiResponse.successResponseWithData(res, "Operation success", {location:CLOUDFRONT_PREFIX+s3res.key,name:s3res.key});
            }
        });
        
    });
    req.pipe(busboy);
  }