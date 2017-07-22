/**
 * Created by ananyagoel on 22/07/17.
 */


var aws = require('aws-sdk');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var multerS3 = require('multer-s3');
var config = require('../config');

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
        // metadata: function (req, file, cb) {
        //     cb(null, {fieldName: file.fieldname});
        // },

        key: function(req, file, cb){
            var fileNameFormatted = file.originalname.replace(/\s+/g, '-').toLowerCase();
            var uploadDate =Date.now().toString()
                cb(null,  uploadDate + fileNameFormatted);
        }

    }),
        fileFilter: function(req, file, cb) {
            if (!file.originalname.match(/\.(txt)$/)) {
                return cb('File Selected is not supported');
            }
            cb(null, true);
        }

})

router.route('/')
    .post(upload.array('file',1), function (req, res, next) {
        var uploadedFiles = req.files;

        console.log(uploadedFiles[0].key)
        console.log(uploadedFiles);

        res.send("Uploaded!");

        })

module.exports = router;

