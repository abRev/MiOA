var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
	name:{type:String},
	headImageKey:{type:String},
	password:{type:String,default:'123456'},
	phone:{type:String},
	createTime:{type:Date,default:Date.now}
});

module.exports = mongoose.model('User',UserSchema);
