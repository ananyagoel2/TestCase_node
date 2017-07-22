var express = require('express');
var router = express.Router();

var user = require('../models/model');



/* GET home page. */
router.get('/users', function(req, res, next) {

    // user.find({})
    //     .then(function(user){
    //     res.status(200).send(user)
    //         })
    //     .catch(function(error){
    //           console.log(error)
    //         })

  res.render('index', { title: 'Express' });
});

module.exports = router;
