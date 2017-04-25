var mongoose  = require('mongoose');

var ApplySchema = mongoose.Schema({
	class:{type:String},
	date:{type:Date,default:Date.now},
	price:{type:Number,default:0.0},
	reason:{type:String},
	status:{type:Number,default:0},
	refuseReason:{type:String,default:""}
});

module.exports = mongoose.model('Apply',ApplySchema)
