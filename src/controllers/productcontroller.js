//const mongoose = require("mongoose")
  const productModel= require("../models/productModel.js")
  const  upload=require('../controllers/awscontroller')
  let validator = require('../controllers/validateController')


 //POST /products
const createproducts = async function (req, res) {
    try {
        let data=req.body
        let files= req.files;

           // console.log(files)
        if (!validator.isValidRequestBody(data)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
            return
        }

      

        if(files && files.length > 0){
          var uploadedFileURL = await upload.uploadFile(files[0]);
        }else{
            res.status(400).send({status:false,message:"nothing to write"})
        }

        

        //const {title,description,price:Number(price).toFixed(2),currencyId,currencyFormat,style,availableSizes,installments} = req.body
          
        const {title,description,price,currencyId,currencyFormat,style,availableSizes,installments} = req.body

let availSiz = JSON.parse(availableSizes)

          if (!validator.isValid(title)) {
            return res.status(400).send({status:false, message:'Please provide title' })
        }

        const istitleAlreadyUsed = await productModel.findOne({title});

        if (istitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${title} title is already registered` })
        }

        if (!validator.isValid(description)) {
            return res.status(400).send({status:false, message:'Please provide description' })
        }

        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message:'Please provide currencyId' })
        }

        if (currencyId !== 'INR') {
            res.status(400).send({ status: false, message: 'provide valid currencyId' })
            return

        }
      
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: ' Please provide price' })
        }
       
        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message:'Please provide currencyFormat' })
        }

        if (currencyFormat !== '₹') {
            res.status(400).send({ status: false, message: 'provide valid currencyFormat' })
            return
        }

        if (!validator.isValid(style)) {
            return res.status(400).send({ status: false, message:'Please provide style' })
        }
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message:'Please provide availableSizes' })
        }
     
        if (!validator.isValid(installments)) {
            return res.status(400).send({ status: false, message:'Please provide installments' })
        }
        const userDetails= {title,description,price,currencyId,currencyFormat, productImage:uploadedFileURL,style,availableSizes:availSiz,installments}


        let saveduser = await productModel.create(userDetails);
    

        res.status(201).send({ status: true, message: "product created successfully", data: saveduser });

} catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg:err.message })
    }
}



//GET /products

const getProduct = async function(req,res){
    try{

        if(req.query.size || req.query.name || req.query.priceGreaterThan || req.query.priceLessThan ){
            let availableSizes = req.query.size
            let title = req.query.name
            let priceGreaterThan = req.query.priceGreaterThan
            let priceLessThan = req.query.priceLessThan
            obj = {}
            if(availableSizes){
                obj.availableSizes = availableSizes.toUpperCase()
            }
       
            if(title){
                obj.title = {  $regex: '.*' + title.toLowerCase() + '.*' }
            }
            if(priceGreaterThan){
                obj.price = { $gt: priceGreaterThan}
            }
            if(priceLessThan){
                obj.price = { $lt: priceLessThan}
            }
            obj.isDeleted = false
            obj.deletedAt = null

            console.log(obj)
            const getProductsList = await productModel.find(obj).sort({price : 1})
            // console.log(getProductsList)
            if(!getProductsList || getProductsList.length == 0){
                res.status(400).send({status: false, message: `product is not available right now.`})
            }else{
                res.status(200).send({status: true, message:'Success', data: getProductsList})
            }
        }else{
            const getListOfProducts = await productModel.find({isDeleted:false, deletedAt: null}).sort({price:1})
            res.status(200).send({status: true, message:'Success', data: getListOfProducts })
        }
    }catch(err){
        res.status(500).send({status: false, msg : err.message})
    }

}


//GET /products/:productId
const getproductById = async (req, res) => {
    try {
        const productId = req.params.productId

        if (!(validator.isValid(productId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid productId' })
        }
        let productFound = await productModel.findOne({ _id:productId,isDeleted:false, deletedAt:null })
        if (!productFound) {
            return res.status(404).send({ status: false, msg: "There is no product exist with this id" });
        }
        return res.status(200).send({ status: true, message: 'Product list', data: productFound });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//PUT /products/:productId
const updateProduct = async function (req, res) {
    try {

        let productId = req.params.productId;
        const requestBody = req.body;
        const productImage = req.files

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified' })
        }

        let productDetails = await productModel.findOne({ _id: req.params.productId })


        if (!productDetails) {
            return res.status(404).send({ status: false, message: `productDetails not found with given UserId` })
        }


        const { title, description, price,isFreeShipping, currencyId, currencyFormat, style, availableSizes, installments } = requestBody

        if (productDetails.isDeleted === false) {

            if(!validator.isValid(title)){
                res.status(400).send({status: false, message: "please enter valid title"})
                return
            }

            const istitleAlreadyUsed = await productModel.findOne({ title });

            if (istitleAlreadyUsed) {
                res.status(400).send({ status: false, message: `${title} these title is already registered` })
                return
            }
        }

        if (productImage && productImage.length > 0) {
            var uploadedFileURL = await upload.uploadFile(productImage[0]);
            console.log(uploadedFileURL)
            requestBody.productImage = uploadedFileURL
        };



        const productValue = { title, description, price,isFreeShipping, currencyId, currencyFormat, productImage: uploadedFileURL, style, availableSizes, installments }

        const upatedProduct = await productModel.findOneAndUpdate({ _id: productId }, productValue, { new: true })
        res.status(200).send({ status: true, message: 'User updated successfully', data: upatedProduct });


    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


//DELETE /products/:productId
const deleteProduct = async (req, res) => {
    try {

        const params = req.params.productId;

        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid bookId." })
        }

        const findproduct = await productModel.findById({ _id: params })

        if (!findproduct) {

            return res.status(404).send({ status: false, message: `No product found ` })

        }

        else if (findproduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: `product has been already deleted.` })
        } else {
            const deleteData = await productModel.findOneAndUpdate({ _id: { $in: findproduct } }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
            return res.status(200).send({ status: true, message: "product deleted successfullly.", data: deleteData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}




module.exports = {createproducts,getproductById,updateProduct,getProduct,deleteProduct}
