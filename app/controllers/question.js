var mongoose = require('mongoose');
var Question = require('../models/question');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var join = path.join;

exports.findAns = function (req, res) {
 Question.find( function (err, questions) {
    if (err) {
      console.log(err);
    }
    else {
      var arr = [];
      _.each(questions, function (ques, key) {
        var ans = ques.answer;
        return arr.push(ans);
      });
      res.json(arr);
      console.log('arr:', arr);
    }
  }); 
  // body...
}

exports.new = function (req, res) {
  var question = {
      _id:'',
      index: '',   // 题目序号
      type: '',     // 题目类型
      chapter:'',   // 题目章节
      difficulty: '',   // 题目难度系数
      content: '',  // 题目内容
      image: {},
      answer: ''    // 题目答案
    };

  res.render('admin-newques', {
    title: '题目录入',
    user: req.session.user,
    question: question
  });
};
exports.preview = function (req, res) {
  var id = req.params.id; 
  var user = req.session.user;
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
        user: user,
        question: question
      });
    // } else {
    //  res.redirect('/');
    // }
  });
}

exports.edit = function (req, res) {
  var id = req.params.id;
  var user = req.session.user;
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
        user: user,
        question: question
      });
    // } else {
    //  res.redirect('/');
    // }
  });
};

exports.save = function (req, res) {
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);
  var image = req.files.image;
  var id = req.body.question._id;
  var questionObj = req.body.question;
  var _question;
  if (image) {
    _question = {
      image: {
        name: image.name,
        path: image.path.slice(6)
      }
    }
  };
  questionObj = _.extend(questionObj, _question);
  // console.log('questionObj:', questionObj);
  // console.log('_question', _question);
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
  } else {
      _question = new Question(questionObj);
      _question.save(function(err, question) {
        if(err) {
          console.log(err);
        }

        res.redirect('/admin/question/preview/' + question._id);
      }); 
    
    }
};
exports.list = function (req, res) {
  var user = req.session.user;
  Question.find( function (err, questions) {
    if (err) {
      console.log(err);
    }
    else {
      res.render('queslist',{
        title: '题目列表',
        user: user,
        questions: questions
      });
    }
  });
};
exports.del = function (req, res) {
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
};

