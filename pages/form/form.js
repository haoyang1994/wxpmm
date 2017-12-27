
const app = getApp();
var ApiServ = require("../../utils/ApiService.js");

Page({
  data: {
  },
  onLoad: function (option) {
    if (!!(option.bizId)){
      this.data.bizId = option.bizId;
    }

    if (!!option.formId) {
      console.log("formId=======>"+option.formId);
      this.data.formId = option.formId;
      var page = this;
      ApiServ.sendPost("getForm",{
        "id":this.data.formId
      },function(e){
        var res = e.data.response_params;
        page.data.form = new Object();
        page.data.form.id = res.id;
        page.data.form.name = res.name;
        page.data.form.jsonConfig = JSON.parse(res.jsonConfig);

        page.setData({
          mername: res.name
        })
        wx.setNavigationBarTitle({
          title: res.name
        });

        //调用一次表单查询数据源
        var qdsList = page.data.form.jsonConfig.qds;
        page.refreshForm(qdsList);

        for (var config of page.data.form.jsonConfig.form) {
          //处理九宫格控件
          if (config.type == "grid") {
            page.refreshGrid(config,res.id);
          }

          //处理表格控件
          if (config.type == "table" && config.qds != null) {
            page.refreshTable(config);
          }

          //处理列表控件
          if (config.type == "list" &&config.qds != null ){
            page.refreshList(config);
          }
          //处理下拉控件
          if (config.type == "select" && config.itemSetting.items == null && config.itemSetting.ds != null) {
            page.refreshDropDown(config)
          }
        }
        page.setData(page.data);
        
      });


    }

  },
  refreshGrid(config,pid){
    var page = this;
    ApiServ.sendPost("queryResultByDs", {
      "datasourceid":"2ef464b7-8821-48b9-b7d8-d30dff04b46f",
      "curFormId":pid
    }, function (e) {
      var res = e.data.response_params;
      config.datas = res;
      for (var data of config.datas) {
        data.formId = config.formId;
      }
      var item = page.data.form.jsonConfig.form.find(function (e) {
        return e.id == config.id;
      });
      if (!!item) {
        item.common = config.datas;
      }
      page.setData(page.data);
    });
  },
  refreshDropDown(config){
    var page = this;
    ApiServ.sendPost("queryResultByDs", {
      "datasourceid": config.itemSetting.ds.dataSourceId
    }, function (e) {
      var selectControls = new Array();
      var res = e.data.response_params;
      var selectControl = new Object();
      selectControl.id = config.id;
      selectControl.items = new Array();
      var items = new Array();
      for (var item of res) {
        selectControl.items.push({
          "key": item[config.itemSetting.ds.keyName],
          "value": item[config.itemSetting.ds.valueName]
        })
      };
      selectControls.push(selectControl);
      page.refreshSelect(selectControls);
    });
  },
  refreshList(config){
    var page = this;
    ApiServ.sendPost("queryResultByDs", {
      "datasourceid": config.qds,
      "bizId": page.data.bizId
    }, function (e) {
      var res = e.data.response_params;
      config.datas = res;
      for (var data of config.datas) {
        data.formId = config.formId;
      }
      var item = page.data.form.jsonConfig.form.find(function (e) {
        return e.id == config.id;
      });
      if (!!item) {
        item.datas = config.datas;
      }
      page.setData(page.data);
    });
  },
  refreshTable(config) {
    var page = this;
    ApiServ.sendPost("queryResultByDs", {
      "datasourceid": config.qds,
      "bizId": page.data.bizId
    }, function (e) {
      var res = e.data.response_params;
      config.listData = res;
      for (var data of config.listData) {
        data.formId = config.formId;
      }
      var item = page.data.form.jsonConfig.form.find(function (e) {
        return e.id == config.id;
      });
      if (!!item) {
        item.listData = config.listData;
      }
      page.setData(page.data);
    });
  },
  refreshForm(qdsList){
    var page = this;
    if (qdsList != null && qdsList.length > 0) {
      for (var qds of qdsList) {
        page.refreshFormBySingleQds(qds);
      }
    }
  },
  refreshFormBySingleQds(qds){
    var page = this;
    ApiServ.sendPost("queryResultByDs", {
      "datasourceid": qds,
      "bizId": this.data.bizId
    }, function (e) {
      var res = e.data.response_params[0];
      for(var x in res){
        var item = page.data.form.jsonConfig.form.find(function (e) {
          return e.id == x;
        });
        if (!!item) {
          item.value = res[x];
        }
      }
      page.setData(page.data);
    });
    
  },
  refreshSelect(selectControls){
    console.log(selectControls);
    for (var selectControl of selectControls) {
      var item = this.data.form.jsonConfig.form.find(function (e) {
        return e.id == selectControl.id;
      });
      if (!!item) {
        item.itemSetting.items = selectControl.items;
      }
    }
    this.setData(this.data);
  },
  bindDataChange: function (e) {
    var targetId = e.target.id;
    var item = this.data.form.jsonConfig.form.find(function (e) {
      return e.id == targetId;
    });
    if (!!item) {
      item.value = e.detail.value;
    }
    this.setData(
      this.data
    );
    console.log(this.data);
  },
  selectChange: function (e) {
    var targetId = e.target.id;
    var item = this.data.form.jsonConfig.form.find(function (e) {
      return e.id == targetId;
    });
    if (!!item) {
      item.key = item.itemSetting.items[e.detail.value].key;
      item.value = item.itemSetting.items[e.detail.value].value;
    }
    this.setData(
      this.data
    );
    console.log(this.data);
  },
  navigateToForm: function () {
    wx.navigateTo({
      url: "index?formid=" + this.data.formIdInput.value
    })
  },
  summit:function(e){
    this.data.hasSummit=true;
    var targetId = e.target.id;
    var item = this.data.form.jsonConfig.summit.find(function (e) {
      return e.id == targetId;
    });
    var params = new Object();
    if (!!item) {
      params.datasourceid = item.ds;
      params.bizId = this.data.bizId;
      var formData = this.data.form.jsonConfig.form;
      for (var param of formData){
        if(param.required&&!param.value){
          wx.showModal({
            content: "还有内容没有填写哦！",
            showCancel: false,
            confirmColor: "#000000",
            confirmText:"OK"
          });
          return;
        }
        params[param.id] = param.value;
      }
    }
    ApiServ.sendPost("queryResultByDs", params,function(res){
      console.log(res);
      wx.navigateTo({
        url: "/pages/success/success",
      })
    })
    delete params.datasourceid;

  }
})