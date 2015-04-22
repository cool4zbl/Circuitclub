// admin.js
var router = require('express').Router();
var _ = require('lodash');
var Question = require('../models/question');
var User = require('../models/user');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var path = require('path');
var join = path.join;

router.route('/')
.get(function (req, res) {
	console.log('session:', req.session, 'session.name:', req.session.name);
	if (req.session.logged_in) {
		return res.render('admin', {
			title: '管理员控制面板',
			user: req.session.name
		});
	} else {
		res.writeHead(403),
		res.end('Not Authoried');
	}
});
// 题库列表查看
router.route('/questionBank/list')
.get(function (req, res) {
	Question.find( function (err, questions) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('question-list',{
				title: '题目列表',
				user: req.session.name,
				questions: questions
			});
		}
	});
	// console.log(questions);
})
.delete( function (req, res) {
	var id = req.query.id;

	if (id) {
		Question.remove({_id: id}, function (err, question) {
			if (err) {
				console.log(err);
			}  else {
			  res.json({success: 1});
			}
		});
	}
})
// 学生列表查看
router.route('/userlist')
.get(function (req, res) {
	User.find( function (err, users) {
		if (err) {
			console.log(err);
		}
		else {
			res.render('userlist',{
				title: '学生列表查看',
				user: req.session.name,
				users: users
			});
		}
	});
	// console.log(questions);
})
.delete( function (req, res) {
	var id = req.query.id;

	if (id) {
		User.remove({_id: id}, function (err, user) {
			if (err) {
				console.log(err);
			}  else {
			  res.json({success: 1});
			}
		});
	}
})

router.route('/question/preview/:id')
.get(function (req, res) {
	var id = req.params.id; 
	Question.findById(id, function(err, question) {
		if (err) {
			console.log(err);
			res.render('error', {
      message: err.message,   
      error: err
      });
		}
		// if (question) {
			res.render('quespreview', {
				title: '题目预览',
				user: req.session.name,
				question: question
			});
		// } else {
		// 	res.redirect('/');
		// }
	});
});
router.route('/question/edit/:id')
.get(function (req, res) {
	var id = req.params.id; 
	Question.findById(id, function(err, question) {
		if (err) {
			console.log(err);
			res.render('error', {
      message: err.message,   
      error: err
      });
		}
		// if (question) {
			res.render('quesedit', {
				title: '编辑题目',
				user: req.session.name,
				question: question
			});
		// } else {
		// 	res.redirect('/');
		// }
	});
});

router.route('/question/new')
.get(function (req, res) {
	var question = {
			_id:'',
			index: '',   // 题目序号
			type: '',			// 题目类型
			chapter:'',		// 题目章节
			difficulty: '',		// 题目难度系数
			content: '',  // 题目内容
			pic:'',
			answer: ''    // 题目答案
		};

	res.render('admin-newques', {
		title: '题目录入',
		user: req.session.user,
		question: question
	});
})
.post(multipartMiddleware, function (req, res, next) {

	console.log(req.body.question);
	var id = req.body.question._id;
	console.log("id",id);
	var questionObj = req.body.question;
	var _question;
	// 更新题目
	if (id) {
		Question.findById(id, function(err, question) {
			if(err) {
				console.log(err);
			} 
			// 将现更新的 questionObj 的属性加到数据库原有的 question 上
			_question = _.extend(question, questionObj);
			_question.save(function(err, question) {
				if(err) {
					console.log(err);
				}
				res.redirect('/admin/question/preview/' + question.id);
			});
		});
	}
	else {
		var img = req.files.image.img;
		// var name = questionObj.index + '-image';
		console.log('img:',img);
		var path = join(__dirname,'/public/images', img.name);
		console.log('img.path:', img.path);
		console.log('path:', path);

		fs.rename(img.path, path, function(err){
			if (err) return next(err);
			
			_question = new Question(questionObj);
			_question.save(function(err, question) {
				if(err) {
					console.log(err);
				}

				res.redirect('/admin/question/preview/' + question._id);
			});	
		});
	}
});


module.exports = router;