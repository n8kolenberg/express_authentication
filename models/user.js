const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
    username: String,
    // email: String,
    password: String
});


//The following will add a bunch of methods from the 
//passport-local-mongoose package to the UserSchema
//We'll need to use these in order to have user authentication
UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", UserSchema);