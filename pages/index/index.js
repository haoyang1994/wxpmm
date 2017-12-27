//index.js
//获取应用实例
const app = getApp();
var ApiServ = require("../../utils/ApiService.js");
var RSAUtils = require("../../asset/scripts/security.js");
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasBind: false,
    apiPrefix: app.globalData.apiPrefix,
    formList:[]
  }
  ,
  //登录后台
  login: function() {
    var page = this;
    var usernumber=this.data.usernumber;
    var password = this.data.password;
    var jcaptchaCode = this.data.jcaptchaCode;

    
    if (!usernumber ||!password){
      wx.showModal({
        content: "账号、密码不能为空！",
        showCancel: false,
        confirmColor: "#000000",
        confirmText: "OK"
      });
      return;
    }

    var params = {
      "userNumber": usernumber
    };
    ApiServ.sendPost("getKey", params, function (res) {
      console.log(res);
      res = res.data.response_params;
      var publicKey = RSAUtils.getKeyPair(res.exponent, '', res.modulus);
      var encryptPassword = RSAUtils.encryptedString(publicKey, password);
      var requestParams = {
        "userNumber": usernumber,
        "password": encryptPassword
      };
      ApiServ.sendPost("wxLogin", requestParams, function (e) {
        if(e.data.status == "0"){
          wx.showModal({
            content:e.data.error_msg,
            showCancel: false,
            confirmColor: "#000000",
            confirmText: "确定"
          });
          return;
        }
        console.log(e);
        app.globalData.token = e.data.response_params.sessionid;
        app.globalData.usernumber = e.data.response_params.usernumber;
        app.globalData.enterprisenumber = e.data.response_params.enterprisenumber;
        app.globalData.username = e.data.response_params.username;
        app.globalData.roles = e.data.response_params.roles;
        app.globalData.hasBind = true;
        page.data.hasBind = true;
        page.data.roles = app.globalData.roles;
        if (!!page.data.roles) {
          page.data.curRoleIndex = 0;
          page.data.curRole = page.data.roles[page.data.curRoleIndex];
          page.refreshForm();
        }
        page.setData(page.data);

      }, {"jcaptchaCode": ""});
    },{})

  },
  refreshForm: function () {
    var page = this;
    ApiServ.sendPost("queryWxFormList",
      { "roleId": this.data.curRole.roleId },
      function (e) {
        var formList = new Object();
        formList.special = new Array();
        formList.common = new Array();
        var rawList = e.data.response_params ;
        for(var i = 0;i<3&&i<rawList.length;i++){
          formList.special.push(rawList[i]);
        }
        for (var i = 3;i < rawList.length; i++) {
          formList.common.push(rawList[i]);
        }
        page.setData(
          { "formList": formList}
        );
      }
    );
    console.log(this.data);
  },
  onLoad: function () {

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      })
    }

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  setUsernumber:function(e){
    console.log(e)
    this.data.usernumber = e.detail.value;
  },
  setPassword: function (e) {
    console.log(e)
    this.data.password = e.detail.value;
  },
  setJcaptchaCode: function (e) {
    console.log(e)
    this.data.jcaptchaCode = e.detail.value;
  },
  unBind: function(e){
    var page = this;
    wx.showModal({
      title: "退出当前账号吗？",
      success:function(res){
        if(res.confirm){
          //清除用户登录信息
          page.setData({
            "hasBind": false
          });
          delete app.globalData.token;
          delete app.globalData.usernumber;
          delete app.globalData.username;
          delete app.globalData.roles;
        }
      }
    })

  }
})
