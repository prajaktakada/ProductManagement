
//
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required:"fname required"
    },
    lname: {
        type: String,
        required:"lname required"
    },
    email: {
        type: String,
        required:"email required",
        unique: true,
        validate: {
            validator: function (v) {
                return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        }
    },
    profileImage: {
        type: String,
        required:"image is required",
    },
    phone: {
        type: String,
        required:"phone no.is required",
        unique: true,
        validate: {
            validator: function(mobile) {
                return (/^\d{10}$/.test(mobile))
            },
            message: 'Please fill a valid mobile number',
           
        }
    },
     password: {
        type: String,
        required: true
       
    },
    address: {
        shipping: {
        street: { type: String,required: true},
        city: { type: String,required: true},
        pincode: { type: String,required: true }
    },
      billing: {
      street: { type: String,required: true },
      city: {type: String,required: true },
      pincode: {type:Number,required: true }
}
},
createdAt: {
    type: Date,
    default: Date.now
},
updatedAt:{
    type: Date,
    default: null
},

}, { timestamps: true });

module.exports = mongoose.model('userpro5', userSchema)