/**
 * Created by ananyagoel on 21/07/17.
 */

/**
 * Created by shankar on 21/5/16.
 */

var path     = require('path'),
    util     = require('util'),
    config   = require("../config"),
    Promise  = require('bluebird');
var jwt      = Promise.promisifyAll(require('jsonwebtoken'));


var createToken = function (payload) {
    return jwt.signAsync(payload, config.JWT_SECRET_KEY, {
        algorithm: 'HS256',
        expiresIn: config.JWT_EXPIRATION_DELTA,
        issuer: 'testcaseapp'
    });
};

var generatePayload = function (user) {
    return {
        _id: user.get('_id'),
        email: user.get('email')
    };
};

var verifyToken = function (token) {
    return jwt.verify(token, config.JWT_SECRET_KEY);
};

var decodeToken = function(token){
    return jwt.decode(token);
};

module.exports = {
    createToken: createToken,
    generatePayload: generatePayload,
    verifyToken: verifyToken,
    decodeToken: decodeToken
};