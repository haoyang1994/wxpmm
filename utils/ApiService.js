var globalConfig = require("../config.js").config

var apiConfig = {
  "getKey": "/api/sfa/account/getKey",
  "wxLogin": "/api/sfa/wxaccount/wxLogin",
  "getToDo":"/api/sfa/flowengine/getMyTodoList",
  "getHaveDone": "/api/sfa/flowengine/getHaveDoneList",
  "queryBiz":"/api/sfa/flowengine/getBizData",
  "queryResultByDs":"/api/sfa/datasource/queryResult",
  "queryWxFormList": "/api/sfa/wxform/quickQueryForms",
  "getForm": "/api/sfa/wxform/queryFormConfig"
}

var get = function (url) {
  return globalConfig.protocol+"://" + globalConfig.gateway+ apiConfig[url];
}

var sendPost = function(urlKey,data,success,header,fail){
  wx.showLoading({
    title: '',
  });
  if(!header){
    var header = {
      //可能需要加上JSessionID。
      "token": getApp().globalData.token,
      "usernumber": getApp().globalData.usernumber,
      "enterprisenumber": getApp().globalData.enterprisenumber,
      "clientType":2
    }
  }
  wx.request({
    url: this.get(urlKey),
    method: "post",
    data: data,
    success: function(res){
      success(res);
      wx.hideLoading();
    },
    header:header,
    fail:fail
  });
}

module.exports.get = get
module.exports.sendPost = sendPost
