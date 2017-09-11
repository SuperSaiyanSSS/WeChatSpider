

// module.exports = {
//     token: Date.now(),
//     summary: function () {
//         var tip = "the default rule for AnyProxy.";
//         return tip;
//     },
//
//     shouldUseLocalResponse: function (req, reqBody) {
//         //intercept all options request
//         var simpleUrl = (req.headers.host || "") + (req.url || "");
//         mapConfig.map(function (item) {
//             var key = item.keyword;
//             if (simpleUrl.indexOf(key) >= 0) {
//                 req.anyproxy_map_local = item.local;
//                 return false;
//             }
//         });
//
//
//         return !!req.anyproxy_map_local;
//     },
//
//     dealLocalResponse: function (req, reqBody, callback) {
//         if (req.anyproxy_map_local) {
//             fs.readFile(req.anyproxy_map_local, function (err, buffer) {
//                 if (err) {
//                     callback(200, {}, "[AnyProxy failed to load local file] " + err);
//                 } else {
//                     var header = {
//                         'Content-Type': utils.contentType(req.anyproxy_map_local)
//                     };
//                     callback(200, header, buffer);
//                 }
//             });
//         }
//     },
//
//     replaceRequestProtocol: function (req, protocol) {
//     },
//
//     replaceRequestOption: function (req, option) {
//     },
//
//     replaceRequestData: function (req, data) {
//     },
//
//     replaceResponseStatusCode: function (req, res, statusCode) {
//     },
//
//     replaceResponseHeader: function (req, res, header) {
//     },
//
//     getPosts: function (rawList) {
//         var list = JSON.parse(rawList);
//         return list.list;
//     },
//     savePosts: function (rawList) {
//         var that = this;
//         var list = this.getPosts(rawList);
//         list.forEach(function (item) {
//             if (item["app_msg_ext_info"] === undefined) {
//                 return;
//             }
//             var idx = 1;
//             var msgInfo = item.app_msg_ext_info;
//             var datetime = item.comm_msg_info.datetime;
//             msgInfo.idx = idx;
//             msgInfo.datetime = datetime;
//             that.writePost(msgInfo);
//             // 解决一次多篇文章的问题
//             if (item["app_msg_ext_info"]["multi_app_msg_item_list"] === undefined) {
//                 return;
//             }
//             var multiList = item["app_msg_ext_info"]["multi_app_msg_item_list"];
//             multiList.forEach(function (item) {
//                 item.idx = ++idx;
//                 item.datetime = datetime;
//                 that.writePost(item);
//             });
//         })
//     },
//
//     splitOnce: function (input, splitBy) {
//         var i = input.indexOf(splitBy);
//
//         return [input.slice(0, i), input.slice(i + 1)];
//     },
//
//     parseQuery: function (qstr) {
//         var query = {};
//         var a = qstr.split('&');
//         for (var i = 0; i < a.length; i++) {
//             var b = this.splitOnce(a[i], '=');
//             query[b[0]] = b[1] || '';
//         }
//         return query;
//     },
//
//     getRawQuery: function (webUrl) {
//         var url = require('url');
//         var parsedUrl = url.parse(webUrl);
//         var query = parsedUrl.query;
//         query = this.parseQuery(query);
//         delete query.frommsgid;
//         delete query.count;
//         delete query.f;
//         var result = '';
//         for (var key in query) {
//             if (query.hasOwnProperty(key)) {
//                 result += key + '=' + query[key] + '&';
//             }
//         }
//
//         return result;
//     },
//
//     getNextUrl: function (currentUrl, rawList) {
//
//         var list = this.getPosts(rawList);
//         if (!list) {
//             return '';
//         }
//         var lastOne = list.pop();
//         if (!lastOne) {
//             //如果列表中没有数据，开始抓文章
//             var nextUrl = 'https://www.lijinma.com/wechat_begin.html';
//             return nextUrl;
//         }
//         var rawQuery = '';
//         var rawQuery = this.getRawQuery(currentUrl);
//
//         var lastId = lastOne.comm_msg_info.id;
//         var nextUrl = "http://mp.weixin.qq.com/mp/getmasssendmsg?" + rawQuery + "frommsgid=" + lastId + "&count=10"
//         return nextUrl;
//     },
//
//     getBizFromUrl: function (url) {
//         var rawQuery = this.getRawQuery(url);
//         var parsedQuery = this.parseQuery(rawQuery);
//         return parsedQuery.__biz;
//     },
//
//     getIdxFromUrl: function (url) {
//         var rawQuery = this.getRawQuery(url);
//         var parsedQuery = this.parseQuery(rawQuery);
//         return parsedQuery.idx;
//     },
//
//     getMidFromUrl: function (url) {
//         var rawQuery = this.getRawQuery(url);
//         var parsedQuery = this.parseQuery(rawQuery);
//         if (parsedQuery.mid) {
//             return parsedQuery.mid;
//         } else if (parsedQuery['amp;mid']) {
//             return parsedQuery['amp;mid']
//         } else if (parsedQuery['amp;amp;mid']) {
//             return parsedQuery['amp;amp;mid']
//         } else {
//             return parsedQuery.appmsgid;
//         }
//     },
//
//     writePost: function (msgInfo) {
//         var author = msgInfo.author;
//         var title = msgInfo.title;
//         var contentUrl = msgInfo.content_url;
//         contentUrl = msgInfo.content_url.replace(/amp;/g, "");
//         var biz = this.getBizFromUrl(contentUrl);
//         var appmsgid = this.getMidFromUrl(contentUrl);
//         var cover = msgInfo.cover; //.replace(/\\\//g, "/");
//         var digest = msgInfo.digest;
//         var idx = msgInfo.idx;
//         var sourceUrl = msgInfo.source_url;
//         var createTime = new Date(msgInfo.datetime * 1000);
//
//         db.insertOne(author, biz, appmsgid, title, contentUrl, cover, digest, idx, sourceUrl, createTime);
//     },
//
//     getNextChunk: function (url, delay, nonce) {
//         if (nonce) {
//             var next = '<script nonce="' + nonce + '" type="text/javascript">';
//         } else {
//             var next = '<script type="text/javascript">';
//         }
//         next += 'setTimeout(function(){window.location.href="' + url + '";},' + delay + ');';
//         next += 'setTimeout(function(){window.location.href="' + url + '";},10000);';
//         next += '</script>';
//         return next;
//     },
//
//     getNotification: function () {
//         return '<h1 style="color:red; font-size:20px; text-align: center; margin-top: 10px; margin-bottom: 10px;">3秒后没有自动刷新请手动刷新</h1>';
//     },
//
//     getNextPostUrl: function (appmsgid, nonce, callback) {
//         db.getNextUnupdatedPostContentUrl(appmsgid, nonce, callback);
//     },
//
//     getContentUrl: function (reqUrl) {
//         return 'http://mp.weixin.qq.com' + reqUrl;
//     },
//
//     //替换服务器响应的数据
//     replaceServerResDataAsync: function (req, res, serverResData, callback) {
//         var that = this;
//         console.log("?????????????????????????????????????????????????????");
//         if(/mp\/profile_ext\?action=home/i.test(req.url)){
//             try{
//                 var historyHomePage = /var msgList = \'(.*?)\';\r\n/;
//                 var historyHomePageString = historyHomePage.exec(serverResData.toString());
//                 if(!historyHomePageString){
//                     callback(serverResData);
//                     return;
//                 }
//                 console.log(historyHomePageString);
//             }
//         }
//         else{
//             callback(serverResData);
//         }
//     },
//     pauseBeforeSendingResponse: function (req, res) {
//     },
//
//     shouldInterceptHttpsReq: function (req) {
//         return interceptFlag;
//     },
//
//     //[beta]
//     //fetch entire traffic data
//     fetchTrafficData: function (id, info) {
//     },
//
//     setInterceptFlag: function (flag) {
//         interceptFlag = flag;
//     },
//
//     _plugIntoWebinterface: function (app, cb) {
//
//         app.get("/filetree", function (req, res) {
//             try {
//                 var root = req.query.root || utils.getUserHome() || "/";
//                 utils.filewalker(root, function (err, info) {
//                     res.json(info);
//                 });
//             } catch (e) {
//                 res.end(e);
//             }
//         });
//
//         app.use(bodyParser.json());
//         app.get("/getMapConfig", function (req, res) {
//             res.json(mapConfig);
//         });
//         app.post("/setMapConfig", function (req, res) {
//             mapConfig = req.body;
//             res.json(mapConfig);
//
//             saveMapConfig(mapConfig);
//         });
//         cb();
//     },
//
//     _getCustomMenu: function () {
//         return [
//             // {
//             //     name:"test",
//             //     icon:"uk-icon-lemon-o",
//             //     url :"http://anyproxy.io"
//             // }
//         ];
//     }
// };
//






module.exports = {
        token: Date.now(),
        summary: function () {
            var tip = "the default rule for AnyProxy.";
            return tip;
        },

        replaceServerResDataAsync: function (req, res, serverResData, callback) {
            var that = this;
            console.log("4444444444444444444444444444444444444444444444444444444444444");
            if(/mp\/profile_ext\?action=home/i.test(req.url)){
                try{
                    var historyHomePage = /var msgList = \'(.*?)\';/;
                    console.log("66666666666666666666622");
                    var historyHomePageList = historyHomePage.exec(serverResData.toString());
                    if(!historyHomePageList){
                        callback(serverResData);
                        return;
                    }
                   // console.log(historyHomePageList[1]);
                    historyHomePageList[1] = historyHomePageList[1].replace(/&quot;/g, "'");
                   // console.log(historyHomePageList[1]);
                    var historyHomePageObj = eval("("+historyHomePageList[1]+")");
                    var articleLinkArr = [];
                    //TODO: 抓包显示有8个介绍界面，但只在historyHomePageList中获取到4个，原因是正则匹配时有问题？？
                    for(var item in historyHomePageObj['list']){
                        console.log(item);
                        console.log(historyHomePageObj['list'][item]["app_msg_ext_info"]["content_url"]);
                        var link = historyHomePageObj['list'][item]["app_msg_ext_info"]["content_url"];
                        articleLinkArr.push(link);
                    }
                    console.log("666666666666666666666__end");
                    callback(serverResData);
                }
                catch (e){
                    callback(serverResData);
                }
            }
            else{
                callback(serverResData);
            }


            // if (/mp\/getmasssendmsg/i.test(req.url)) {
            //     try {
            //         var reg = /msgList = (.*?);\r\n/;
            //         var ret = reg.exec(serverResData.toString());
            //         if (!ret) {
            //             callback(serverResData);
            //             return;
            //         }
            //         ret = ret[1]
            //         this.savePosts(ret)
            //
            //         var nextUrl = this.getNextUrl(req.url, ret);
            //         if (nextUrl) {
            //             var next = this.getNextChunk(nextUrl, 1000);
            //             var note = that.getNotification();
            //             serverResData = note + serverResData + next;
            //             callback(serverResData);
            //         }
            //         callback(serverResData);
            //     } catch (e) {
            //         console.log(e);
            //     }
            // } else {
            //     callback(serverResData);
            // }
        }

};