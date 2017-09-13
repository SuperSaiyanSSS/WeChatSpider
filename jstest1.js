
var firstContent;
var firstLink;
var firstheader;
var firstres;
var firstcookies;
var nowOffset;

var flag = true;

var http = require('http');

module.exports = {
        token: Date.now(),
        summary: function () {
            var tip = "哈工大(威海) 基于中间人攻击的微信爬虫";
            return tip;
        },


        getNextChunk: function (url, delay, nonce) {
            if (nonce) {
                var next = '<script nonce="' + nonce + '" type="text/javascript">';
            } else {
                var next = '<script type="text/javascript">';
            }
            next += 'setTimeout(function(){window.location.href="' + url + '";},' + delay + ');';
            next += 'setTimeout(function(){window.location.href="' + url + '";},10000);';
            next += '</script>';
            return next;
        },

        getNotification: function () {
            return '<h1 style="color:red; font-size:20px; text-align: center; margin-top: 10px; margin-bottom: 10px;">' +
                '哈工大(威海)提示：10秒后没有自动刷新请手动刷新</h1>';
        },

        getNextUrl: function (currentUrl, rawList, appmsg_token) {
            console.log("开始捕获下一页历史消息、、、、、、");
            if (!rawList) {
                return '';
            }
            var currentUrlArr = currentUrl.split("&");
            var nextHistoryPageArr = [];
            for(var item in currentUrlArr){
                //console.log(currentUrlArr[item]);
                if(currentUrlArr[item].substring(0,5)=="/mp/p"||currentUrlArr[item].substring(0,5)=="__biz"||
                    currentUrlArr[item].substring(0,5)=="scene"|| currentUrlArr[item].substring(0,5)=="pass_"){
                        nextHistoryPageArr.push(currentUrlArr[item]);
                }
            }

            nextHistoryPageUrl = nextHistoryPageArr.join('&');
            nextHistoryPageUrl += "&f=json";
            //TODO
            nextHistoryPageUrl += "&offset=10";
            nextHistoryPageUrl += "&count=10&is_ok=1";
            nextHistoryPageUrl += "&uin=777&key=777";
            nextHistoryPageUrl += "&wxtoken=";
            nextHistoryPageUrl += "&appmsg_token=";
            nextHistoryPageUrl += appmsg_token;
            nextHistoryPageUrl = "https://mp.weixin.qq.com" + nextHistoryPageUrl;
            nextHistoryPageUrl = nextHistoryPageUrl.replace("home", "getmsg");


            console.log("this is raw!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(nextHistoryPageUrl);
            firstLink = nextHistoryPageUrl;
            return nextHistoryPageUrl;
        },

        replaceResponseHeader: function(req,res,header){
            header = header || {};
            console.log("开始：报头由json改为html")
            if(flag && /mp\/profile_ext\?action=getmsg/i.test(req.url)) {
          //      console.log(res);
                console.log("we have re[.p;ace1");
                header['content-type'] = "text/html; charset=UTF-8";
            }
            console.log("成功结束：报头由json改为html")
            return header;
        },



        replaceServerResDataAsync: function (req, res, serverResData, callback) {
            var that = this;
            console.log("抓捕到数据包。。。");
            if(/mp\/profile_ext\?action=home/i.test(req.url)){
                try{
                    var historyHomePage = /var msgList = \'(.*?)\';/;
                    var historyHomePageList = historyHomePage.exec(serverResData.toString());
                    if(!historyHomePageList){
                        callback(serverResData);
                        console.log("抓捕到空包！！");
                        return;
                    }
                    historyHomePageList[1] = historyHomePageList[1].replace(/&quot;/g, "'");
                    var historyHomePageObj = eval("("+historyHomePageList[1]+")");
                    var articleLinkArr = [];

                    //问题：抓包显示有8个介绍界面，但只在historyHomePageList中获取到4个，原因是正则匹配时有问题？？
                    //解决：列表中间的一个historyHomePageObj['list'][item]["app_msg_ext_info"]为undefined, 异常阻止了其他
                    //     介绍页面的获取！
                    for(var item in historyHomePageObj['list']){
                        console.log(item);
                        if(historyHomePageObj['list'][item]["app_msg_ext_info"]==undefined){
                            continue;
                        }
                        console.log(historyHomePageObj['list'][item]["app_msg_ext_info"]["content_url"]);
                        var link = historyHomePageObj['list'][item]["app_msg_ext_info"]["content_url"];
                        articleLinkArr.push(link);
                    }

                    var appmsg_token_pattern = /window.appmsg_token = \"(.*?)\";/;
                    var appmsg_token = appmsg_token_pattern.exec(serverResData.toString())[1];

                    var nextHistoryPageUrl = this.getNextUrl(req.url, historyHomePageList, appmsg_token);

                    firstheader = res.headers;
                    firstContent = serverResData;

                    var next = this.getNextChunk(nextHistoryPageUrl, 6000);
                    var note = this.getNotification();
                    serverResData = note + serverResData + next;
                    firstres = res;
                    firstcookies = res.headers['set-cookie'];
                    nowOffset = 0;

                    console.log("成功获取到第一页历史消息页面666666666666666666666__end");
                    callback(serverResData);
                }
                catch (e){
                    callback(serverResData);
                }

            }

            else if(/mp\/profile_ext\?action=getmsg/i.test(req.url)){
                try {

                    nowOffset += 10;
                    firstLink = firstLink.replace("&offset="+nowOffset.toString(), "&offset="+(nowOffset+10).toString());
                    var note = this.getNotification();
                    var next = this.getNextChunk(firstLink, 6000);
                    var newContent = note + firstContent + next;

                    console.log(serverResData.toString());
                    flag = true;
                    console.log("已成功保存下一页历史消息（原json）");

                    callback(newContent);
                }
                catch (e){
                    console.log("waht??????????????????????????????????????????2");
                    callback(serverResData);
                }

            }
            else{
                callback(serverResData);
            }


        }

};