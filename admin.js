//引入express
const express = require("express")
//引入express-sesion
const session = require("express-session")
//实例化express
const app = new express()
const path = require('path')

const ejs = require("ejs")
const fs = require("fs")

//设置静态资源文件，存放上传的图片
//定义静态路由
// app.use(express.static(path.join(__dirname,"static")))
app.use(express.static("static"));
app.use('/upload',express.static(path.join(__dirname,"upload")))  //放在最前面，未登录时，可以加载资源

//使用和设置seesion(用于登录的cookie来设置session)
app.use(session({
    secret: 'keyboard cat', //加密方式
    cookie: {
        maxAge: 60000 * 30 //失效时间(毫秒)
    }
}))
//检测是否登录(检测是否设置了session) -------对应登录
app.use(function (req, res, next) {
    // app.locals.userinfo={}
    if (req.url == "/login" || req.url == "/doLogin") {
        next();
    } else {
        // 检测session中是否有user信息或username是否为空
        if (req.session.userinfo && req.session.userinfo.username != "") {
            // 如果登录满足条件，就进行下一步
            next();
        } else {
            //如果登录失败，就跳转去登录
            res.redirect("/login")
            // next()
        }
    }
})
//引入ejs

app.engine("html", ejs.__express)
app.set('view engine', 'html')

//引入multiparty，对表单进行解析
var multiparty = require("multiparty")
// 引入数据库，进行对数据库的曹操作
const MongoClient = require("mongodb").MongoClient
const ObjectID = require("mongodb").ObjectID;

const url = "mongodb://localhost:27017"

// 渲染添加页面
app.get("/add", function (req, res) {
    res.render("add")
})
// 进行添加
app.post("/doAdd", function (req, res) {
    // console.log("---001---")
    var form = new multiparty.Form()
    // 制定上传目录
    form.uploadDir = "upload"

    form.parse(req, function (err, fields, files) {
        // console.log(fields)
        // return;
    //     // 获取form表单数据
        
        var title = fields.title[0];
        var content = fields.content[0];
        var image = files.image[0].path;
        var price=fields.price[0];
        var old_price=fields.old_price[0]
        // console.log({
        //         title: title,
        //         content: content,
        //         image: image
        //     })
        // return;
    //     console.log(fields)
    //     // 把form表单数据添加到mongodb数据库内
        MongoClient.connect(url, function (err, client) {
            let collection = client.db("wx").collection("add");
            // 进行添加
            collection.insertOne({
                title: title,
                content: content,
                image: image,
                price:price,
                old_price:old_price
            }, function (err, result) {
                if (err) {
                    console.log(err)
                    return;
                }
                // 添加成功并提示
                res.send("<script>alert('添加成功');location.href='/';</script>")
            })
        })
    })
})
// 列表页
app.get("/", function (req, res) {
    // 连接数据库，读取数据库信息
    MongoClient.connect(url, function (err, client) {
        if (err) {
            console.log(err)
            return;
        }
        // 获取集合
        const collection = client.db("wx").collection("add");
        collection.find({}).toArray(function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            // 把数据渲染到页面
            res.render("list", {
                result
            })
        })
    })
    // res.render("list")
})
// 修改
app.get("/edit", function (req, res) {
    let id = ObjectID(req.query.id);
    // console.log(id)
    MongoClient.connect(url, function (err, client) {
        const collection = client.db("wx").collection("add");
        collection.find({
            _id: id
        }).toArray(function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result)
            res.render("edit", {
                //前面的result就是渲染到修改页面时的result.xxxx
                "result": result[0]
            })
        })
    })
})
app.post("/doEdit", function (req, res) {
    console.log("------doedit-----")
    var form = new multiparty.Form();
    form.uploadDir = "upload";
    form.parse(req, function (err, fields, files) {
        var id = ObjectID(fields.id[0]);
        console.log(fields,1111);
        console.log(files,222)
        // console.log(req.query.id)
        var title = fields.title[0]
        var content = fields.content[0];
        var price = fields.price[0];
        var old_price = fields.old_price[0];
        var originalFilename = files.image[0].originalFilename;
        var image = files.image[0].path;

        if (originalFilename == '') {
            //没有图片
            var updateData = {
                title: title,
                content: content,
                price:price,
                old_price:old_price
            }
        } else {
            //有图片
            var updateData = {
                title: title,
                content: content,
                price:price,
                old_price:old_price,
                image: image
            }
        }

        MongoClient.connect(url, function (err, client) {
            var collection = client.db("wx").collection("add");
            // var id = ObjectID(fields.id[0]);
            collection.updateOne({
                _id: id
            }, {
                $set: updateData
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("修改成功")
                res.send("<script>alert('修改成功');location.href='/';</script>")
            })
        })
    })
})
// 删除
app.get("/del", function (req, res) {
    // 接收id，转换成对象
    let id = ObjectID(req.query.id)
    //连接数据库
    MongoClient.connect(url, function (err, client) {
        //删除本地文件
        let collection = client.db("wx").collection("add")
        collection.findOne({
            _id: id
        }, function (err, result) {
            let image = result.image;
            if (image) {
                fs.unlinkSync(image)
            }
        })
        //删除数据库中的记录
        collection.removeOne({
            _id: id
        }, function (err, result) {
            if (err) {
                console.log(err)
                return;
            }
            // 提示用户删除成功
            res.send("<script>alert('删除成功');location.href='/';</script>")
        })
    })
})

//登录
//渲染登录页面
app.get("/login", function (req, res) {
    res.render("login")
})
//执行登录
app.post("/doLogin", function (req, res) {
    var form = new multiparty.Form()
    form.parse(req, function (err, fields) {
        let username = fields.username[0];
        let password = fields.password[0];
        // console.log(fields)
        console.log({
            username,
            password
        })
        // 查询数据库，查询用户是否存在。如果存在，设置session,如果不存在：提示用户账号或密码错误，重新登录（跳转到登录页面）
        MongoClient.connect(url, function (err, client) {
            let collection = client.db("wx").collection("users");
            collection.findOne({
                username,
                password
            }, function (err, result) {
                console.log(err)
                // console.log(result)
                if (result == null) {
                    //登录失败
                    res.send("<script>alert('用户名或密码错误');history.back();</script>")
                } else {
                    //登录成功  需要设置session，然后跳转
                    console.log("登录成功")
                    req.session.userinfo = result;
                    app.locals['userinfo'] = result;
                    res.redirect("/")
                }
            })
        })
    })
})
//退出登录
app.get("/logout", function (req, res) {
    req.session.userinfo = null;
    res.redirect("/login")
})
app.listen(3000, () => {
    console.log("启动成功")
})