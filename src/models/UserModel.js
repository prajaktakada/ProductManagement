// // const { constants } = require("fs");
// const mongoose = require('mongoose')

// //User Model UserModel.js
// //  const regexpincode =  "^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$";

// // const validatepincode = function(pincode) {
// //     return regexpincode.test(pincode)
// // }

// const regexphone = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

// const validatephone = function(phone) {
//     return regexphone.test(phone)
// }

// const UserSchema = new mongoose.Schema({

// fname:{
//     type:String,
//     required:'first name is required',
//     trim:true
// },
// lname:{
//     type:String,
//     required:'last name last name',
//     trim:true
// },
// email:{
//     type:String,
//     required:true,
//     trim:true,
//     validate: {
//                 validator: function (v) {
//                  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
//              },
//          message: "Please enter a valid email"
        
//                 },
//             },
// profileImage :{type:String,required:true},
// phone: {
//     type:String,
//     trim: true,
//     required: 'phone number is required',
//     unique: true,
//     validate: {
//         validator:  validatephone, message: 'Please fill a valid number', isAsync: false
//     }
// },
// password: {
//     type:Number,
//     required:'password is required',
//     minlength: 8,
//     maxlength: 15,
//     trim:true
// },
//  address:{
//                 shipping:{
//                         street:{ type:String,required:true },
//                          city:{ type:String, required:true },
//                          pincode:{ type:String, required:true},

//                        }
//                 },

//                 billing:{
//                     street:{type:String,required:true},
//                     city:{ type:String, required:true },
//                     pincode: { type: String,required:true}
//                 },





//             },{ timestamps: true })

//             module.exports = mongoose.model('User', UserSchema)


const mongoose = require('mongoose');
//const bcrypt=require("bcrypt");

// const { Schema } = mongoose;
// const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
    "fname": {
        type: String,
        required: true
    },
    "lname": {
        type: String,
        required: true
    },
    "email": {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        }
    },
    "profileImage": {
        type: String,
        required: true,
    },
    "phone": {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(mobile) {
                return (/^\d{10}$/.test(mobile))
            },
            message: 'Please fill a valid mobile number',
           
        }
    },
     "password": {
        type: String,
        required: true
       
    },
    "address": {
        "shipping": {
        street: { type: String,required: true},
        city: { type: String,required: true},
        pincode: { type: String,required: true }
    },
      "billing": {
      street: { type: String,required: true },
      city: {type: String,required: true },
      pincode: {type:Number,required: true }
}
},
"createdAt": {
    type: Date,
    default: Date.now
},
"updatedAt":{
    type: Date,
    default: null
},

}, { timestamps: true });

module.exports = mongoose.model('userpro5', userSchema)