var mongoose = require('mongoose');
var User = require('../models/user');
var Problem = require('../models/problem');
var _ = require('lodash');

// middleware for user
exports.loginRequired = function(req, res, next) {
  var user = req.session.user;

  if (!user) {
    req.flash('info', '请登录');
    return res.redirect('/');
  } else {
    next();
  }
};

exports.showSignup = function(req, res) {
  res.render('signup', {
    title: '注册',
    message: req.flash('info')
  });
};

exports.showSignin = function(req, res) {
  res.render('login', {
    title: '登录',
    message: req.flash('info')
  });
};

// Ajax signup
exports.signup = function(req, res) {
  var data = req.body;
  console.log(data);

  User.findOne({ username: data.username }, function (err, user) {
    if (err) return next(err);
    if (user) {
      return res.json({ err: 1 });    // 用户名已被占用
    } else {
        user = new User(data);
        if (data.username === 'admin') {
          user.role = 'admin';
        }
        user.save(function (err, user) {
          if (err) {
            console.log(err);
          }
          req.session.user = user;
          console.log('session:', req.session);
          res.json({success: 1});
        });
      }
  });
  // console.log('body: ' + JSON.stringify(req.body));
};

// login 登录
exports.login = function(req, res) {
  var data = req.body;

  console.log('postdata:', data);
  User.findOne({ username: data.username }, function (err, user) {
    if (err) return next(err);
    if (!user) {
      return res.json({ err: 1 });    // 用户不存在
    } else {
      user.comparePassword(data.password, function(err, isMatch) {
        if (err) {
          console.log(err)
        }

        if (isMatch) {
          req.session.user = user;
          console.log('session:', req.session);
          return res.json({ success: 1 });
          // return res.redirect('/');
        } else {
          return res.json({ err: 2 });  // 密码错误
        }
      })
    }
  // console.log('body: ' + JSON.stringify(req.body));
  });

}

// logout
exports.logout =  function(req, res) {
  delete req.session.user
  req.flash('info', '成功退出！');
  res.redirect('/')
}

//  学生主页
exports.index = function (req, res) {
  var user = req.session.user;

  res.render('std', {
      user: user,
      title: user.name + '的主页',
    });
};
exports.profile = function (req, res) {
  var user = req.session.user;
  res.render('std-profile', {
    title:'个人资料修改',
    user: user
  });
}
exports.setProfile = function (req, res) {
  var user = req.session.user;
  var id = user._id;
  var userObj = req.body.user;
  var _user;
  User.findById(id, function(err, user) {
    if(err) {
        console.log(err);
     }
      // 将现更新的 problemObj 的属性加到数据库原有的 problem 上
      _user = _.extend(user, userObj);
      _user.save(function(err, user) {
        if(err) {
          console.log(err);
        }
        req.session.user = user;
        res.render('std-profile', {
          title:'个人资料修改',
          user: user
        });
      });
  });
}

// 考试信息
exports.examInfo = function (req, res) {
  var user = req.session.user;
  res.render('paperInfo', {
    title: '考试信息',
    user: user
  });
};
// 正式考试
exports.examStart = function (req, res) {
  var user = req.session.user;
  Problem.find( function (err, problems) {
    if (err) {
      console.log(err);
    }
    else {
      res.render('exam', {
        title: '正式考试',
        user: user,
        problems: problems
      });
    }
  });
};


// userlist page
exports.list = function(req, res) {
  User.fetch(function(err, users) {
    if (err) {
      console.log(err)
    }

    res.render('userlist', {
      title: '学生用户列表页',
      users: users
    });
  });
}

