var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var ApiServ = require("../../utils/ApiService.js");
const app = getApp();

Page({
  data: {
    tabs: ["待处理", "已处理"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    var page = this;
    ApiServ.sendPost("getToDo", {},function(res){
      page.setData({
        "todoList": res.data.response_params.data
      });
    });
    ApiServ.sendPost("getHaveDone", {}, function (res) {
      page.setData({
        "haveDoneList": res.data.response_params.data
      });
    });

    
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  }
});