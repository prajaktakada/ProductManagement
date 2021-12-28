const express = require('express');

const router = express.Router();


const usercontroller=require("../controllers/usercontroller")
 const Middleware=require("../middleware/Authentication")
 const productcontroller=require("../controllers/productcontroller")

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
router.get('/products',productcontroller.getProduct)//
router.delete('/products/:productId',productcontroller.deleteProduct)






// router.post('/write-file-aws',awscontroller.awsCreat)





module.exports = router;