var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
var util = require('util');
var path = require('path');

var router = express.Router();


var User = require('../models/user');
var qiniu = require('../lib/qiniu');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/getImageUrl',function(req,res,next){
	if(!req.query.userID){
		return res.json({error:true,message:'用户ID不能为空'});
	}
	User.findOne({_id:req.query.userID},(err,user)=>{
		if(err){
			return next(err);
		}
		if(user&&user.headImageKey){
			var ImageUrl = qiniu.getImageUrl("http://olcbwiykm.bkt.clouddn.com/"+user.headImageKey);
			res.json({error:false,image:ImageUrl});
		}else{
			res.json({error:false,image:"loadingHeadImage"});
		}
	})
})

router.post('/uploadImage',(req,res,next)=>{
	var form = new formidable.IncomingForm();
	form.uploadDir = __dirname+'/../uploadDir';
	form.keepExtensions=true;
	form.multiples=true;
	form.parse(req,function(err,fields,files){
		console.log(files.images.name);
		fs.renameSync(files.images.path,path.dirname(files.images.path)+"/"+files.images.name);		
			
		let bucket = 'mioa';

		let keyName = files.images.name;
		let localImagePath=
		qiniu.uploadImage(bucket,keyName,path.dirname(files.images.path)+"/"+files.images.name,function(err,keyId){
			if(err){
				res.json({error:true,message:err})
			}else{
				fs.unlinkSync(path.dirname(files.images.path)+"/"+files.images.name)
				User.findOne({_id:req.query.userID},function(err,user){
					if(err){
						return next(err);
					}
					if(user){
						user.headImageKey = keyName;
						user.save((err)=>{
							if(err){
								return next(err);
							}
							res.json({err:false})
						})
					}
				})
			}
		})
	})
})

router.post('/sign',function(req,res,next){
	if(!req.body.phone||!req.body.password){
      console.log('用户名和密码不能为空');
      res.json({error:true,message:'用户名和密码不能为空'})
  }else{
		User.findOne({$or:[{name:req.body.userName},{phone:req.body.phone}]}).exec((err,user)=>{
			if(err){
				console.log(err);
				next(err);
			}else{
				if(user){
					res.json({error:true,message:'该用户已存在'});
				}else{
					var user = new User({
						name:req.body.userName,
						phone:req.body.phone,
						password:req.body.password
					});

					user.save((err,user)=>{
						if(err){
							console.log(err);next(err);
						}else{
							res.json({error:false});
						}
					})
				}
			}
		})
	}
})

router.post('/login',(req,res,next)=>{
	if(!req.body.phone||!req.body.password){
		console.log('账号和密码不能为空');
		res.json({error:true,message:'账号和密码不能为空'})
	}else{
		User.findOne({phone:req.body.phone,password:req.body.password}).exec((err,user)=>{
			if(err){
				console.log(err);
				res.json({error:true,message:err});
			}else{
				if(user){
					res.json({error:false,userID:user._id});
				}
				else{
					res.json({error:true,message:'用户名或者密码错误'});
				}
			}
		})
	}
})

router.get('/getUserByID',(req,res,next)=>{
	if(!req.query.userID){
		return res.json({error:true,message:"请输入用户ID"});
	}
	User.findById(req.query.userID,{name:1,phone:1,_id:0},(err,user)=>{
		if(err){
			res.json({error:true,message:err})
		}else{
			if(user){
				res.json({error:false,user:user})
			}else{
				res.json({error:true,message:"未找到此用户"})
			}
		}
	})
	
})
module.exports = router;
