var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY=require('./config').access_key;
qiniu.conf.SECRET_KEY=require('./config').secret_key;

exports.getImageUrl=function(url){
	var policy = new qiniu.rs.GetPolicy();
	var downloadUrl = policy.makeRequest(url);
	return downloadUrl;
}

exports.uploadImage = function(bucket,keyName,localPath,callback){
	var token = uptoken(bucket,keyName);
	uploadFile(token,keyName,localPath,callback);
}

function uptoken(bucket,key){
	var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
	return putPolicy.token();
}

function uploadFile(uptoken,keyName,localPath,callback){
	var extra = new qiniu.io.PutExtra();
	qiniu.io.putFile(uptoken,keyName,localPath,extra,function(err,ret){
		if(err){
			callback(err);
		}else{
			callback(null,ret.key);
		}
	})
}
