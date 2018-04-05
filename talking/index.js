/**
 * Created by ibm on 2017/6/14.
 */
var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(__dirname));
app.get('/',function(req,res){//请求  响应
    res.sendFile(path.join(__dirname,'index.html'))
})
app.get('/about',function(req,res){
    res.sendFile(path.join(__dirname,'about.html'))
})
//创建http服务，与express绑定
var server = require('http').createServer(app);
//创建socket.io 服务，传入http服务实例
var io = require('socket.io')(server)
//存储每一个scoket对象
var clients = {};
//监听客户端连接，连接成功回调scoket对象
io.on('connection',function(socket){
var username;
    socket.send({user:"系统消息",content:'请输入用户名'})
    socket.on('message',function(message){
        var result = message.match(/^@(.+)\s(.+)$/);
        if(result){
            var toUser = result[1];
            if(clients[toUser]){
                socket.send({user:username,content:'[私聊]'+message});
                clients[toUser].send({user:username,content:'[私聊]'+message})
            }else{
                socket.send({user:'系统消息',content:'该用户不存在或已离线'});
            }
        }else{
            if(username){
                for(var attr in clients){
                    clients[attr].send({user:username,content:message})
                }
            }
            else{
                username = message
                if(clients[username]){
                    socket.send({user:'系统消息',content:'当前用户名已存在'})
                    username='';
                }else{
                    clients[username] = socket;
                    socket.send({user:"系统消息",content:"欢迎你，"+username})
                }
            }


        }
    })
})
server.listen(7777);