const express=require('express')
const req=require('request')
const path=require('path')
const fs=require('fs')
const validator=require('validator')
//const mongoose=require('mongoose')
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');
    var connection = mongoose.createConnection("mongodb://127.0.0.1:27017/Server",{
        useNewUrlParser: true,
        useCreateIndex: true, 
    });
 
autoIncrement.initialize(connection);
 

const app=express()
//const validator=require('validator')

var userschema= new Schema({
    userId:
    {
        type:Number
       
    },
    uname:
    {
        type:String,
        trim:true,
        require:true,
        trim:true
    },
    uteam:
    {
         type:Number,
        // trim:true
    },
    uemail:
    {
        type:String,
        require:true,
        lowercase:true,
        trim:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            throw new Error('Email is invalid')
        }
    },
    umob:
    {
        type:String,
        require:true,
        validate(value)
        {
            if(!validator.isMobilePhone(value))
            throw new Error('mobile is invalid')
        }
    },
    upasswd:
    {
        type:String,
        require:true,
        minlength:7,
        trim:true
        

    },
    uorg:
    {
        type:String,
        trim:true
    },
    taskcom:
    {
        type:Number
    },
    tasktodo:
    {
        type:String,
        trim: true
    },
    utype:
    {
        type:String,
        trim:true
    }


})
userschema.plugin(autoIncrement.plugin, { model: 'user', field: 'userId' })
var user = connection.model('user', userschema)
module.exports=user