const express = require('express');

const router = express.Router();


const usercontroller=require("../controllers/usercontroller")
 const Middleware=require("../middleware/Authentication")
 const productcontroller=require("../controllers/productcontroller")
const cartcontroller=require("../controllers/cartcontroller")
const ordercontroller=require("../controllers/ordercontroller")
 //USER API
 router.post('/registerUser',usercontroller.createuser)//
 router.post('/login',usercontroller.login)
router.get('/user/:userId/profile',Middleware.Auth,usercontroller.getUser)
 router.put('/user/:userId/profile',Middleware.Auth,usercontroller.UpdateUser)

//produnct
router.post('/products',productcontroller.createproducts)
router.get('/products/:productId',productcontroller.getproductById)
router.put('/products/:productId',productcontroller.updateProduct)
router.put('/products/:productId',productcontroller.updateProduct)
router.get('/products',productcontroller.getProduct)
router.delete('/products/:productId',productcontroller.deleteProduct)

//cart
router.post('/users/:userId/cart',Middleware.Auth,cartcontroller.createCart)
router.put('/users/:userId/cart',Middleware.Auth,cartcontroller.updateCart)
router.get('/users/:userId/cart',Middleware.Auth,cartcontroller.getCart)
router.delete('/users/:userId/cart',Middleware.Auth,cartcontroller.deleteCart)

//order
router.post('/users/:userId/orders',Middleware.Auth,ordercontroller.createOrder)
router.put('/users/:userId/orders',Middleware.Auth,ordercontroller.updateorder)






module.exports = router;