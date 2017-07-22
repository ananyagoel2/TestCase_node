/**
 * Created by ananyagoel on 21/07/17.
 */

var Promise = require("bluebird");

var config = {};


config.url = "mongodb://localhost:27017/TestCase_pl";

config.options={
    db: { native_parser: true },
    server: { poolSize: 5 },
    promiseLibrary: Promise
}


config.JWT_SECRET_KEY = "xmbJLiOzQWqsYoHhMaf7";
config.JWT_EXPIRATION_DELTA = "1000m"; // 100 days
config.BCRYPT_LOG_ROUNDS = 7; // 7 rounds
config.access_key_id = "AKIAIQC5T3K4BPFNPRGA";
config.access_key_secret = "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";


module.exports= config;