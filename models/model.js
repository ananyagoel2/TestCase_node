/**
 * Created by ananyagoel on 21/07/17.
 */

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var db= require('../databse_configuration')

var salt_work_factor = 10;

var user_model = new schema({
    created_at: {
        type:Date
    },
    updated_at:{
        type:Date
    },
    email:{
        type: String,
        trim:true,
        required: true,
        uniqie: true
    },
    password:{
        type: String,
        select:false
    }

})


user_model.pre('save', function(next) {

    var currentDate = new Date();


    this.updated_at = currentDate;


    if (!this.created_at)
        this.created_at = currentDate;

    next();
});


user_model.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(salt_work_factor, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

user_model.methods.compare_password = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

user_model.index({email:1},{unique:true,sparse:true});


var user = db.model('user', user_model);

module.exports= user;