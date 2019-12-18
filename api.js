const express=require("express")
const app=new express()
const ObjectId = require("mongodb").ObjectID;
app.use("/upload",express.static("upload"))
//引入mongodb,进行数据库操作
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://localhost:27017';
app.get("/list",function(req,res){
    MongoClient.connect(url,function(err,client){
        let collection=client.db("wx").collection("add");
        collection.find({}).toArray(function(err,result){
            result.forEach((item)=>{
                item.image="http://localhost:3001/"+item.image.replace(/\\/g,'/')
            })
            res.writeHead(200,{'Content-Type':'application/json'})
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})
app.get("/classification",function(req,res){
    MongoClient.connect(url,function(err,client){
        let collection=client.db("wx").collection("add");
        collection.find({}).toArray(function(err,result){
            result.forEach((item)=>{
                item.image="http://localhost:3001/"+item.image.replace(/\\/g,'/')
            })
            res.writeHead(200,{'Content-Type':'application/json'})
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})
app.get("/detail",function(req,res){
    let _id = req.query.id
    MongoClient.connect(url,function(err,client){
        let collection=client.db("wx").collection("add");
        collection.find(ObjectId(_id)).toArray(function(err,result){
            result.forEach((item)=>{
                item.image="http://localhost:3001/"+item.image.replace(/\\/g,'/')
            })
            res.writeHead(200,{'Content-Type':'application/json'})
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})
app.listen(3001,()=>{
    console.log("api")
})