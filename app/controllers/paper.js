var mongoose = require('mongoose');
var Problem = require('../models/problem');
var User = require('../models/user');
var userAnswer = require('../models/userAnswer');
var Paper = require('../models/paper');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var join = path.join;


exports.new = function (req, res) {
  var paper = {
    _id:'',
    name: '',    // 试卷名
    brief: '',   // 试卷概述
    time: '',    // 考试时间
    problems: [] // 相关试题
  };

  res.render('admin-addpaper', {
    title: '新建试卷',
    user: req.session.user,

  });
};

exports.preview = function (req, res) {
  var id = req.params.id;
  var user = req.session.user;
  Paper.findById(id, function(err, paper) {
    if (err) {
      console.log(err);
      res.render('error', {
      message: err.message,
      error: err
      });
    }

    res.render('paper-preview', {
      title: '试卷',
      user: user,
      paper: paper
    });

  });
}

exports.edit = function (req, res) {
  var id = req.params.id;
  var user = req.session.user;
  Paper.findById(id, function(err, paper) {
    if (err) {
      console.log(err);
      res.render('error', {
      message: err.message,
      error: err
      });
    }
      res.render('paper-edit', {
        title: '编辑试卷',
        user: user,
        paper: paper
      });
  });
};

exports.save = function (req, res) {
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);
  var id = req.body.paper._id;
  var paperObj = req.body.paper;
  var _paper;
  paperObj = _.extend(paperObj, _paper);

  // 更新题目
  if (id) {
    Paper.findById(id, function(err, paper) {
      if(err) {
        console.log(err);
      }
      // 将现更新的 paperObj 的属性加到数据库原有的 paper 上
      _paper = _.extend(paper, paperObj);
      _paper.save(function(err, paper) {
        if(err) {
          console.log(err);
        }
        // res.redirect('/admin/paper/preview/' + paper.id);
        res.redirect('/admin/paperBank/list');
      });
    });
  } else {
      _paper = new Paper(paperObj);
      _paper.save(function(err, paper) {
        if(err) {
          console.log(err);
        }
        res.redirect('/admin/paperBank/list');
        // res.redirect('/admin/paper/preview/' + paper._id);
      });

    }
};
exports.list = function (req, res) {
  var user = req.session.user;
  // Paper
  //   .find({})
  //   .populate({path: 'problem'})
  //   .exec (function (err, papers) {
  //     if (err) {
  //       console.log('index err:', err);
  //     }
  //     console.log('user in session:', req.session.user);
  //     res.render('admin-paperlist', {
  //       title: '试卷列表',
  //       user: req.session.user,
  //       papers: papers
  //     });
  // })
  Paper.find( function (err, papers) {
    if (err) {
      console.log(err);
    }
    else {
      res.render('admin-paperlist',{
        title: '试卷列表',
        user: user,
        papers: papers
      });
    }
  });
};
exports.del = function (req, res) {
  var id = req.query.id;
  if (id) {
    Paper.remove({_id: id}, function (err, paper) {
      if (err) {
        console.log(err);
      }  else {
        res.json({ success: 1 });
      }
    });
  }
};
