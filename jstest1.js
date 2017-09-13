
var firstContent;
var firstLink;
var nowOffset;
var articleLinkArr = [];
var flag = true;

var http = require('http');

module.exports = {
        token: Date.now(),
        summary: function () {
            var tip = "哈工大(威海) 基于中间人攻击的微信公众号爬虫";
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
            //偏移量将在主函数中由函数自动修改 这里不必更改
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
                console.log("we have re[.p;ace1");
                header['content-type'] = "text/html; charset=UTF-8";
            }
            console.log("成功结束：报头由json改为html")
            return header;
        },


        //入口函数
        replaceServerResDataAsync: function (req, res, serverResData, callback) {
            console.log("抓捕到数据包。。。");
            console.log(articleLinkArr.size);
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


                    //问题：抓包显示有8个介绍界面，但只在historyHomePageList中获取到4个，原因是正则匹配时有问题？？
                    //解决：列表中间的一个historyHomePageObj['list'][item]["app_msg_ext_info"]为undefined, 异常阻止了其他
                    //     介绍页面的获取！
                    for(var item in historyHomePageObj['list']){
                        console.log(item);
                        if(historyHomePageObj['list'][item]["app_msg_ext_info"]==undefined){
                            continue;
                        }

                        console.log(historyHomePageObj['list'][item]["app_msg_ext_info"]["content_url"]);

                        var title = historyHomePageObj.list[item].app_msg_ext_info.title;
                        var author = historyHomePageObj.list[item].app_msg_ext_info.author;
                        var content_url = historyHomePageObj['list'][item]["app_msg_ext_info"]["content_url"];
                        var datetime = historyHomePageObj.list[item].comm_msg_info.datetime;
                        var id = historyHomePageObj.list[item].comm_msg_info.id;
                        console.log(title);

                        //公众号名称
                        var nickname_pattern = /var nickname = \"(.*?)\"/;
                        var nickname = nickname_pattern.exec(serverResData.toString())[1];
                        console.log("公众号的名字是————————", nickname);

                        //当前历史页的文章各种信息
                        var articleJson = {
                            "title": title,
                            "author": author,
                            "content_url": content_url,
                            "datetime": datetime,
                            "id": id
                        };

                        articleLinkArr.push(nickname);
                        articleLinkArr.push(articleJson);
                    }

                    var appmsg_token_pattern = /window.appmsg_token = \"(.*?)\";/;
                    var appmsg_token = appmsg_token_pattern.exec(serverResData.toString())[1];

                    var nextHistoryPageUrl = this.getNextUrl(req.url, historyHomePageList, appmsg_token);

                    firstContent = serverResData;

                    //注入跳转下一历史页面的js
                    var next = this.getNextChunk(nextHistoryPageUrl, 6000);
                    var note = this.getNotification();
                    serverResData = note + serverResData + next;

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
                    if(!serverResData){
                        console.log("抓取公众号全部历史文章结束！");
                        return;
                    }

                    nowOffset += 10;
                    firstLink = firstLink.replace("&offset="+nowOffset.toString(), "&offset="+(nowOffset+10).toString());

                    //注入跳转再下一页的js
                    var note = this.getNotification();
                    var next = this.getNextChunk(firstLink, 6000);
                    var newContent = note + firstContent + next;
                    var newData = serverResData;
                    var ResDataobj = JSON.parse(newData.toString());
                    var general_msg_list = ResDataobj['general_msg_list'];
                    var listJson = JSON.parse(general_msg_list);

                    for(var artileIndex in listJson.list){
                        try {
                            var title = listJson.list[artileIndex].app_msg_ext_info.title;
                            var author = listJson.list[artileIndex].app_msg_ext_info.author;
                            var content_url = listJson.list[artileIndex].app_msg_ext_info.content_url;
                            var datetime = listJson.list[artileIndex].comm_msg_info.datetime;
                            var id = listJson.list[artileIndex].comm_msg_info.id;
                            console.log(title);
                            console.log(content_url);
                            console.log(id);
                            console.log(datetime);

                            //当前历史页的文章各种信息
                            var articleJson = {
                                "title": title,
                                "author": author,
                                "content_url": content_url,
                                "datetime": datetime,
                                "id": id
                            };

                            articleLinkArr.push(articleJson);

                        }
                        catch (e){
                            console.log(listJson.list[artileIndex]);
                            console.log("获取某个属性时出错！ 可能为短消息，不是历史文章", 'red');
                        }
                    }
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