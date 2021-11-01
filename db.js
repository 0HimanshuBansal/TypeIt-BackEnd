const mongoose = require('mongoose');
const mongoURI = "mongodb://localhost:27017/TypeIt?readPreference=primary&appname=MongoDB%20Compass&ssl=false";

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connect To Mongo");
    })
}

module.exports = connectToMongo;