/**
 * Created by ananyagoel on 23/07/17.
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
    user_model.findOne({email:req.body.email},function (err, user) {
        if(err){
            res.status(400).send(err);
        }
        else{
            if(user)
            {
                res.status(400).send({message:"email already taken!"})
            }
            else{
                var new_user = user_model({
                    password:req.body.password,
                    email:req.body.email

                });
                new_user.save(function(err,user_added) {
                    if(err)
                    {
                        res.status('400').send(err);
                    }
                    else
                    {
                        user_model.findById(user_added._id)
                            .exec(function (err, user_data) {
                                if(err){
                                    res.status(400).send(err);
                                }
                                else{
                                    return Promise.resolve(jwt.createToken(jwt.generatePayload(user_data)))
                                        .then(function (token) {
                                            res.status(200).send({
                                                user: user_data,
                                                access_token: token} )
                                        })                                }
                            })
                    }

                })
            }
        }
    })
});

module.exports = router;