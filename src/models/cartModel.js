//cartModel.js

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userpro5',
        required: true,
        unique:true
    },
    items:[ {
              _id:false,       
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            //unique:true
        },
        quantity:{type:Number,unique:true} //default:1
    }],
    totalPrice: {
        type:Number,
        required:"email required",
        comment:String
    },
    totalItems: {
        type:Number,
        required:"email required",
        comment:String
    }
  
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema)