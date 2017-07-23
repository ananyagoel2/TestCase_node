/**
 * Created by ananyagoel on 21/07/17.
 */

var model = require('../models/model');
var user_model = model.user;
var jwt = require('../util/jwt_util');

var config = require('../config');
var express = require('express');
var _ = require('lodash');
var Promise = require('bluebird');

var router = express.Router();

router.route('/')
    .post(function (req, res) {
        user_model.findOne({email: req.body.email})
            .select('+password')
            .then(function (user) {
                user.compare_password(req.body.password, function (err, is_match) {
                    if (is_match) {
                        var user_updated=_.omit(user.toObject(),'password');

                        return Promise.resolve(jwt.createToken(jwt.generatePayload(user)))
                            .then(function (token) {
                                res.status(200).send({
                                    user: user_updated,
                                    access_token: token} )
                            })

                    }
                    else {
                        res.status(400).send({error: "Credentials don't match"})
                    }
                })
            })
            .catch(function () {
                res.status(404).send({error: "email not found"})
            })
    })

router.route('/posts')
    .get(function (req,res) {

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

        user_model.findById(decoded._id)
            .populate('uploads')
            .exec(function (err, user_data) {
                if(err){
                    res.status(400).send(err);
                }
                else{
                    res.status(200).send(user_data)
                }
            })

    });


module.exports = router;