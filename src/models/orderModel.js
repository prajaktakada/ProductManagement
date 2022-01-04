//orderModel.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userpro5',
        required: true,
        trim: true
    },
    items: [{
        productId: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product', 
            required: true,
            trim: true
        },
        quantity: {
            type:Number,
            required: true,
            min:1,
            trim: true 
        }                                             // min 1
      }],
      
      totalPrice: {
        type:Number, 
        required: true,                              //comment: "Holds total price of all the items in the cart"
        trim: true 
       }, 
       totalItems: {
        type:Number, 
        required: true,                               //comment: "Holds total number of items in the cart"
        trim: true 
       },
       totalQuantity: {
        type:Number, 
        required: true,                               //comment: "Holds total number of items in the cart"
        trim: true 
       },
       cancellable: {
        type:Boolean, 
        default: true,                               
        
       },
       status: {
        type:String, 
        default:'pending',
        enum: ["pending", "completed", "cancled"] ,                              
        trim: true 
       },
       deletedAt: {  // when the document is deleted
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true }
)

module.exports = mongoose.model('order', orderSchema)