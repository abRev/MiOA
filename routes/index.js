var express = require('express');
var router = express.Router();

var Apply = require('../models/apply')
/* GET home page. */
router.get('/', function(req, res, next) {
	Apply.find((err,applies)=>{
		if(err){
			console.log(err);
			res.json(err);
		}else{
			res.render('index',{
				title:'申请列表',
				applies:applies,
				pretty:true
			})
		}
	})
});

router.get('/getRequestNum',(req,res,next)=>{
	Apply.find({status:0}).exec((err,applies)=>{
		if(err){
			res.json({error:true})
		}else{
			if(applies){
				res.json({error:false,length:applies.length})
			}
		}
	})
})

router.post('/submitRequest',(req,res,next)=>{
	if(!req.body._id){
		res.json({error:true,message:'未传输ID'});
	}
	
	Apply.findOne({_id:req.body._id}).exec((err,apply)=>{
		console.log(apply);
		if(!req.body.status){
			apply.status=2;
			apply.refuseReason=req.body.refuseReason;
			apply.save((err)=>{
				if(err){
					res.json({error:true,message:"保存失败"})
				}else{
					res.json({error:false})
				}
			})
		}else{
			apply.status=1;
			apply.save((err)=>{
				if(err){
					res.json({error:true,message:'保存失败'})
				}else{
					res.json({error:false})
				}
			})
		}
	})
})

router.get('/getRequest/:sortBy',(req,res,next)=>{
	var sortBy='';
	if(req.params.sortBy==undefined){
		sortBy='date';
	}else{
		sortBy = req.params.sortBy;
	}

	var condition={};
	if(req.query.query!==undefined){
		condition.class=req.query.query;
	}
	Apply.find(condition).sort(sortBy).exec((err,applies)=>{
		if(err){
			console.log(err);
			res.json({error:true,applies:[]});
		}else{
			res.json({error:false,applies:applies})
		}
	})
})

router.post('/apply',function(req,res,next){
	console.log(req.body);
	var apply = new Apply({
		class:req.body.applyClass,
		price:req.body.price,
		reason:req.body.myReason
	});
	
	apply.save((error)=>{
		if(error){
			console.log(error);
			res.json({success:0});
		}else{
			console.log(error);
      res.json({success:1});
		}
	})
})

module.exports = router;
