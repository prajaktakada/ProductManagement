//cartcontroller.js

const mongoose = require("mongoose")
const productModel= require("../models/productModel.js")
const userModel= require("../models/UserModel.js")
let validator = require('../controllers/validateController')
let cartModel = require('../models/cartModel.js')
const jwt = require("jsonwebtoken")

 
// //
// const createCart = async function (req, res) {
//     try{
//         let userId= req.params.userId
//         let decodedtokenUserId=req.user
//         let cart = req.body
      
//         if (!validator.isValidRequestBody(cart)) {
//             res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
//             return
//         }

//     if (!decodedtokenUserId === userId) {
//         res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
//     }


//     if (!(validator.isValid(userId))) {
//         return res.status(400).send({ status: false, message: 'Please provide valid userId' })
//     }
    
//     let cartAlreadyCreatedForUser = await cartModel.findOne({userId:userId})

//     // if(cartAlreadyCreatedForUser){
//     //     res.status(400).send({status:false,message:'not allow to create multiple carts'})
//     // }
   

//     const {items,totalPrice,totalItems} = req.body

//     // if (!validator.isValid(items)) {
//     //     return res.status(400).send({ status: false, message:'Please provide items' })
//     // }
//     // if (!validator.isValid(totalPrice)) {
//     //     return res.status(400).send({ status: false, message:'Please provide totalPrice' })
//     // }
//     // if (!validator.isValid(totalItems)) {
//     //     return res.status(400).send({status:false, message:'Please provide items' })
//     // }
    
     
//      let cartDetails= {userId,items,totalPrice:totalPrice,totalItems:totalItems}
//    if(items){
//         if('items.productId'){
//         if (!validator.validString(items.productId)) {
//                     return res.status(400).send({ status: false, message: ' Please provide productId' })
//                 }
//                 cartDetails[items.productId]=items.productId
//             }
//             if('items.quantity'){
//                 if (!validator.validString(items.quantity)) {
//                     return res.status(400).send({ status: false, message: ' Please provide quantity' })
//                 }
//                 cartDetails[items.quantity]=items.quantity
//             }
//         }
        
    
//     let userExit = await userModel.findById({_id: userId})
//    // console.log(userExit)
//     if(!userExit){
//         return res.status(404).send({ status: false, message: 'user does not exist' })
//     }
    
//       let cartChecking = await cartModel.findOne({_id:userId})  
//       //console.log(cartChecking)
//       if(!cartChecking){
//         let cart= req.body
//         let  totalPrice=0
//         let totalItems = cart.items.length
//        // console.log(totalItems)
//         for (let i=0; i<totalItems ; i++) {
//         let demo = await productModel.findOne({_id:(cart.items[i].productId), isDeleted:false})
//        // console.log(demo)
    
//         totalPrice= totalPrice + (demo.price)* cart.items[i].quantity   
//         //console.log(totalPrice)
       
//        cart.totalItems = totalItems
//       // console.log(totalItems)
//        cart.totalPrice = totalPrice
//        //console.log(totalPrice)
// //------
// if(cartAlreadyCreatedForUser){
//     let totalPrize = cartAlreadyCreatedForUser.totalPrice + totalPrice
//     let totalItez = cartAlreadyCreatedForUser.totalItems + 1
//     const cartdetail = await cartModel.findOneAndUpdate({ userId:cartAlreadyCreatedForUser.userId },{ $addToSet: { items: { $each: items } },totalPrice:totalPrize ,totalItems:totalItez},{ new: true })
//     return res.status(200).send({ status: true, msg: "successfully updated", data:cartdetail  })
// }else{

   
//        let savedcart = await cartModel.create({userId,items,totalPrice:totalPrice,totalItems:totalItems});
//        console.log(savedcart)
//        res.status(201).send({ status: true, message: "cart created successfully", data: savedcart });  
   
// }

//     }
// }
               
// }catch (err) {
// res.status(500).send({ status: false, msg:err.message })
// }
// }

// module.exports.createCart= createCart
////


//POST /users/:userId/cart (Add to cart)
const createCart = async (req, res) => {
    try{
    let requestbody = req.body
    const cartId = req.body.cartId;
    const UserId = req.params.userId
    TokenDetail = req.user

    if (!(validator.isValidObjectId(UserId))) {
        return res.status(400).send({ status: false, message: 'Please provide valid userId' })
    }

    if (!(TokenDetail == UserId)) {
        res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
    }
    if (!validator.isValidRequestBody(requestbody)) {
        res.status(400).send({ status: false, message: 'Please provide Cart(Items) details' })
        return
    }

    if (!validator.isValid(requestbody.items[0].productId)) {
        return res.status(400).send({ status: false, message: ' Please provide productId' })
    }


    if (!validator.isValid(requestbody.items[0].quantity)) {
        return res.status(400).send({ status: false, message: ' Please provide quantity' })
    }


if(!(requestbody.items[0].quantity>=1)){
    return res.status(400).send({status:false,msg:'provide quentity greter than 1'})
}


    let findCart = await cartModel.findOne({ userId: UserId });
    if (findCart) {
        const { items } = requestbody;
        for (let i = 0; i < items.length; i++) {
            const product = await productModel.findOne({ _id: (items[i].productId) })
            console.log(product)

            let ProductIndex = findCart.items.findIndex(p => p.productId == items[i].productId)
            if (ProductIndex > -1) {
                findCart.items[ProductIndex].quantity = findCart.items[ProductIndex].quantity + items[i].quantity;
                await findCart.save();
                findCart.totalPrice = findCart.totalPrice + ((items[i].quantity) * (product.price))
                await findCart.save();
                return res.status(200).send({ status: true, data: findCart })

            } else {

                TotalPrice = findCart.totalPrice + ((items[i].quantity) * (product.price))
                TotalItems = findCart.totalItems + 1;
                const cartdetail = await cartModel.findOneAndUpdate({ userId: findCart.userId }, { $addToSet: { items: { $each: items } }, totalPrice: TotalPrice, totalItems: TotalItems }, { new: true })

                return res.status(200).send({ status: true, data: cartdetail })
            }

        }

    }
    if (!findCart) {
        const { items } = requestbody;
        for (let i = 0; i < items.length; i++) {
            const product = await productModel.findOne({ _id: (items[i].productId) })
            let price = product.price;
            let total = (items[i].quantity) * price;
            let TotalItems = 1
            const newCart = {
                userId: UserId,
                items: [{ productId: items[i].productId, quantity: items[i].quantity }],
                totalPrice: total,
                totalItems: TotalItems
            }
            const data = await cartModel.create(newCart);
            return res.status(201).send({ status: true, data: data })
        }
    }
}catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
}
}




 //GET /users/:userId/cart
const getCart = async(req,res) =>{
    try{
        let userId = req.params.userId
        
        let decodedtokenUserId=req.user
      
      if (!(decodedtokenUserId === userId)) {
        res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
    }

        if (!(validator.isValidObjectId(userId))&&validator.isValidObjectId(decodedtokenUserId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }

        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }
        let cartFound =  await cartModel.findOne({userId:userId})
        //console.log(cartFound)
        if(!cartFound ) {
            return res.status(404).send({status:false, msg:"No cart exist with this id"});
        }
        return res.status(200).send({ status: true, message: 'cart list', data: cartFound});
    }catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
}
}


//DELETE /users/:userId/cart
const deleteCart = async (req,res) => {
    try{
        
        let userId = req.params.userId
        
       /// console.log(userId)
        let decodedtokenUserId=req.user
        //console.log(decodedtokenUserId)
         
      if (!(decodedtokenUserId === userId)) {
        res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
    }
    
   if (!(validator.isValidObjectId(userId))) {
       return res.status(400).send({ status: false, message: 'Please provide  objectId' })
    }

    if (!(validator.isValid(userId))) {
        return res.status(400).send({ status: false, message: 'Please provide valid userId' })
    }

       let cart = await cartModel.findOne({ userId:userId});//cart.items.splice(0,cart.length)
    
       //cart.items.splice(0,cart.length)
      
       if (!cart) {
          return res.status(404).send({ status: false, message: "id does not exits" });
        }

        let AlreadyDeleatCart = await cartModel.findOne({isDeleted:true})
            if(AlreadyDeleatCart ){
                res.status(400).send({status:false, message:"data already deleted"})
            
        }

       const deleteCart = await cartModel.findOneAndUpdate({userId:userId},{totalPrice:0,totalItems:0,items:0,isDeleted: true}, { new: true })
        // const deleteCart = await cartModel.findOneAndUpdate({userId:userId},{cart}, { new: true })
        return res.status(200).send({ status: true, message: 'data deleted Successfully',data:deleteCart});
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};


//PUT /users/:userId/cart 
const updateCart = async (req, res) => {
    try {
        let requestbody = req.body;
        const UserId = req.params.userId
        TokenDetail = req.user

        if (!(validator.isValidObjectId(UserId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid UserId' })
        }

        const userFound = await userModel.findOne({ _id: UserId })
        if (!userFound) {
            return res.status(404).send({ status: false, message: `User Details not found with given userId` })
        }

        if (!(TokenDetail == UserId)) {
            res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
        }


        if (!(validator.isValidObjectId(requestbody.cartId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid cartId' })
        }

        const findCartDetails = await cartModel.findOne({ _id: requestbody.cartId })
        console.log(findCartDetails)
        if (!findCartDetails ) {
            return res.status(404).send({ status: false, message: `Cart Details not found with given cartId` })
        }

        if (!(validator.isValidObjectId(requestbody.productId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid Product Id' })
        }

        const ProductFound = await productModel.findOne({ _id: requestbody.productId, isDeleted: false })
        if (!ProductFound) {
            return res.status(404).send({ status: false, message: "Product not found in the cart" });
        }

        if (!(requestbody.removeProduct == 1 || requestbody.removeProduct == 0)) {
            return res.status(404).send({ status: false, message: "removeProduct value should be either 0 or 1." });
        }
     
        if(findCartDetails.items.length<=0)
        {
            return res.status(400).send({ status: false, message: "No Product is available in cart to update" });
        }
        let ProductIndex = findCartDetails.items.findIndex(x => x.productId == requestbody.productId)
        if (ProductIndex > -1) {
            if (requestbody.removeProduct == 0) {
                if(findCartDetails.items[ProductIndex].quantity==0)
                {
                    return res.status(400).send({status:false,message:"Product is not available in db"})
                }
                let DecPrice = (findCartDetails .items[ProductIndex].quantity) * (ProductFound.price) //quantity*prise
                findCartDetails.items[ProductIndex].quantity = 0; //cartId=findCartDetails 
                findCartDetails.totalItems = findCartDetails.totalItems - 1;
                findCartDetails.totalPrice = findCartDetails.totalPrice - DecPrice;
                findCartDetails.updatedAt=new Date()
                await findCartDetails.save();
                return res.status(200).send({ status: true, message: "Updated Successfully", data: findCart })
            }
            if (requestbody.removeProduct == 1) {
                if(findCartDetails.items[ProductIndex].quantity==0)
                {
                    return res.status(400).send({status:false,message:"Product is not available in db"})
                }
                findCartDetails.items[ProductIndex].quantity = findCartDetails .items[ProductIndex].quantity - 1;
                findCartDetails.totalPrice = findCartDetails.totalPrice - ProductFound.price;
                if (findCartDetails.items[ProductIndex].quantity == 0) {
                 
                    findCartDetails.totalItems =findCartDetails.totalItems - 1;
                  
                    findCartDetails.updatedAt=new Date()
                    await findCartDetails.save()
                    return res.status(200).send({ status: true, message: "Updated Successfully", data: findCartDetails})
                }
                findCartDetails.updatedAt=new Date()
                await findCartDetails.save();
                return res.status(200).send({ status: true, message: "Updated Successfully", data:findCartDetails})
            }
        } else {
            return res.status(500).send({ status: false, message: "Unmodified Crate. No product found in the Cart" })
        }
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



module.exports = {createCart,getCart,deleteCart,updateCart}