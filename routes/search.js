/**
 * Created by ananyagoel on 23/07/17.
 */

var aws = require('aws-sdk');
var express = require('express');
var router = express.Router();

var request = require('request');

var jwt = require('../util/jwt_util');
var config = require('../config');
var elastic = require('../util/elasticsearch_util');


router.route('/')
    .post(function (req,res) {

        var temp = req.headers.authorization;
        var part = temp.split(' ');
        var decoded = jwt.decodeToken(part[1]);

        try{

            jwt.verifyToken(part[1]);
        }
        catch(err){
            console.log(err);
            return res.status(401).send(err);
        }
        var document ={
            search_query:req.body.search,
            uploader_id: decoded._id
        }
        elastic.searchDocument(document)
            .then(function (result) {
                res.send(result)
            }).catch(function (err) {
            console.log(err)
            res.send({"error":err})
        })

    });

module.exports = router;
