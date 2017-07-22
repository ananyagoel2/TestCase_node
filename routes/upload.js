/**
 * Created by ananyagoel on 22/07/17.
 */


var aws = require('aws-sdk');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var config = require('../config');


var model = require('../models/model');
var user_model = model.user;
var upload_model = model.upload_schema;
var jwt = require('../util/jwt_util');
var Promise = require('bluebird');


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
            var decoded = jwt.decodeToken(part[1]);
            console.log(decoded);

            try{

                jwt.verifyToken(part[1]);
            }
            catch(err){
                console.log(err);
                return res.status(401).send(err);
            }


            var uploadedFiles = req.files;
            console.log(uploadedFiles[0].key)
            console.log(uploadedFiles);

            var new_upload = upload_model({
                upload_url:uploadedFiles[0].location,
                upload_by_user:decoded._id
            })
            new_upload.save(function (err) {
                if(err)
                {
                    res.status(400).send({error:err})
                }
                else
                {
                    user_model.findByIdAndUpdate(decoded._id,{$push:{'uploads':{_id:new_upload._id,ref:'upload_model'}}},{safe: true, upsert: true},function (err, user) {
                        if(err){
                            res.status(400).send({error:err})
                        }
                        else{
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
                        }

                    })
                }
            })
        }
        })

module.exports = router;

