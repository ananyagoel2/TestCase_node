/**
 * Created by ananyagoel on 22/07/17.
 */


var aws = require('aws-sdk');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');

var Promise = require('bluebird');
var request = require('request');
var base64 = require('base64-url');

var jwt = require('../util/jwt_util');
var config = require('../config');
var model = require('../models/model');
var user_model = model.user;
var upload_model = model.upload_schema;
var elastic = require('../util/elasticsearch_util');


aws.config.update({
    accessKeyId: config.access_key_id,
    secretAccessKey: config.access_key_secret
});

var s3 = new aws.S3();


var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'testcaseplotlabs',
        acl: 'public-read',
        key: function(req, file, cb){
            var fileNameFormatted = file.originalname.replace(/\s+/g, '-').toLowerCase();
            var uploadDate =Date.now().toString()
                cb(null,  uploadDate + fileNameFormatted);
        }
    }),
        fileFilter: function(req, file, cb) {
            if (!file.originalname.match(/\.(txt)$/)) {
                req.fileValidationError = 'goes wrong on the mimetype';
                return cb(null, false, new Error('goes wrong on the mimetype'));
            }
            cb(null, true);
        }

})


router.route('/')
    .post(upload.array('file',1), function (req, res, next) {
        if(req.fileValidationError){
            res.end(req.fileValidationError);
        }
        else{

            var temp = req.headers.authorization;
            var part = temp.split(' ');
            Promise.resolve(jwt.decodeToken(part[1]))
                .then(function (decoded) {
                    console.log("decoded")
                    try{

                        jwt.verifyToken(part[1])

                    }

                    catch(err){
                        console.log(err);
                        return res.status(401).send(err);
                    }



                    var uploadedFiles = req.files;
                    console.log(uploadedFiles[0].key)
                    console.log(uploadedFiles);

                    var textinfile;
                    request.get(uploadedFiles[0].location, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var document = {
                                base64string:body,
                                uploaded_by_user:decoded._id
                            }
                            elastic.addDocument(document)
                                .then(function (result) {
                                    console.log("result"+result)

                                    var new_upload = upload_model({
                                        upload_url:uploadedFiles[0].location,
                                        upload_by_user:decoded._id
                                    })
                                    new_upload.save()
                                        .then(function(){
                                            console.log("inside find by id"+decoded._id)
                                            user_model.findByIdAndUpdate(decoded._id,{$push:{'uploads':{_id:new_upload._id,ref:'upload_model'}}},{safe: true, upsert: true})
                                                .then(function (user) {
                                                    upload_model.findById(new_upload._id)
                                                        .populate('upload_by_user')
                                                        .exec(function (err, post) {
                                                            if(err){
                                                                res.status(400).send(err);
                                                            }
                                                            else{
                                                                res.status(200).send(post)
                                                            }
                                                        })
                                                })
                                                .catch(function (err) {
                                                    res.status(400).send({error:err})

                                                })
                                        }).catch(function(){
                                        res.status(400).send({error:err})

                                    })
                                })

                        }
                        else {
                            res.status(400).send("Error indexing file");

                        }
                    });
                })
                .catch(function (err) {
                    console.log(err);
                    return res.status(401).send(err);
                })
        }
        })

module.exports = router;

