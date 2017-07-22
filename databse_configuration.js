/**
 * Created by ananyagoel on 21/07/17.
 */

var mongoose= require('mongoose');

var config = require('./config');

var db;

db = mongoose.createConnection(config.url,config.options)


db.on('error', function(err){
    if(err) throw err;
});

db.once('open', function callback () {
    console.info('Mongo db connected successfully');
});

module.exports = db;
