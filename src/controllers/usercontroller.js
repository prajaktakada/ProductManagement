const mongoose = require("mongoose")
  const userModel= require("../models/UserModel.js")
  let validator = require('../controllers/validateController')
  const  upload=require('../controllers/awscontroller')
 const bcrypt =require('bcrypt')

const jwt = require("jsonwebtoken")


 //POST /register
const createuser = async function (req, res) {
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

        const {fname,lname, email, phone,password,address} = req.body
          
         
         if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: ' Please provide fname' })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: ' Please provide lname' })
        }
       
        const isphoneAlreadyUsed = await userModel.findOne({ phone });

        if (isphoneAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${phone} phone is already registered` })
        }

        const isEmailAlreadyUsed = await userModel.findOne({ email }); // {email: email} object shorthand property

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email} email address is already registered` })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: ' Please provide password' })
        }
        if (!(password.trim().length > 7 && password.trim().length < 16)) {
            return res.status(400).send({ status: false, message: ' Please provide valid password' })
        }

        const userDetails= { fname,lname, email,profileImage:uploadedFileURL, phone,password, address  }

           // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
         // now we set user password to hashed password
userDetails.password = await bcrypt.hash(userDetails.password, salt);

       
        if(address){
            if(address.shipping){

            if('address.shipping.street'){
                if (!validator.validString(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: ' Please provide street' })
                }
                userDetails[address.shipping.street]=address.shipping.street
            }
            if('address.shipping.city'){
                if (!validator.validString(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: ' Please provide city' })
                }
                userDetails[address.shipping.city]=address.shipping.city
            }
            if('address.shipping.pincode'){
                if (!validator.validString(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: ' Please provide pincode' })
                }
                userDetails[address.shipping.pincode]=address.shipping.pincode
            }
        }
        if(address.billing){

            if('address.billing.street'){
                if (!validator.validString(address.billing.street)) {
                    return res.status(400).send({ status: false, message: ' Please provide street' })
                }
                userDetails[address.billing.street]=address.billing.street
            }
            if('address.billing.city'){
                if (!validator.validString(address.billing.city)) {
                    return res.status(400).send({ status: false, message: ' Please provide city' })
                }
                userDetails[address.billing.city]=address.billing.city
            }
            if('address.billing.pincode'){
                if (!validator.validString(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: ' Please provide pincode' })
                }
                userDetails[address.billing.pincode]=address.billing.pincode
            }
        }
    }
        
        let saveduser = await userModel.create(userDetails);
    

        res.status(201).send({ status: true, message: "User created successfully", data: saveduser });

} catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg:err.message })
    }
}
module.exports.createuser = createuser



// login
const login = async function (req, res) {
    try {

        const requestBody = req.body
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }

        let useremail = req.body.email
        let userpassword = req.body.password

        if (!validator.isValid(useremail)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide valid email' })
            return
        }
        

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(useremail))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }

        if (!validator.isValid(userpassword)) {
            res.status(400).send({ status: false, message: 'password must be present' })
            return
        }

        if (useremail  && userpassword) {
            let User = await userModel.findOne({ email:useremail})

            if (User) {
                const{_id,name,password}=User

                const passvalid = await bcrypt.compare(userpassword,password)

                const Token = jwt.sign({
                    userId: User._id,
                     
              iat: Math.floor(Date.now() / 1000), //	The iat (issued at) identifies the time at which the JWT was issued. [Date.now() / 1000 => means it will give time that is in seconds(for January 1, 1970)] (abhi ka time de gha jab bhi yhe hit hugha)
              exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60 //The exp (expiration time) identifies the expiration time on or after which the token MUST NOT be accepted for processing.   (abhi ke time se 10 ganta tak jalee gha ) Date.now() / 1000=> seconds + 60x60min i.e 1hr and x10 gives 10hrs.
                }, "Group9")
                res.header('authorization', Token)

                

                res.status(200).send({ status: true, msg: "User login successfull",data:{userId:User._id,Token:Token}})
            } else {
                res.status(400).send({ status: false, Msg: "Invalid Credentials" })
            }
        } else {
            res.status(400).send({ status: false, msg: "request body must contain  email as well as password" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.login = login


//GET /user/:userId/profile 
const getUser = async function (req, res) {
    try {
        let decodedtokenUserId=req.user
        const userId = req.params.userId

        if (!(validator.isValid(userId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }

        if (!validator.isValidObjectId(userId) && !isValidObjectId(decodedtokenUserId)) {
            return res.status(404).send({ status: false, message: "userId or token is not valid" })
        }
        const searchprofile = await userModel.findOne({ _id:userId})
        if (!searchprofile) {
            return res.status(404).send({ status: false, message: 'profile does not exist' })
        }
        
        if (!decodedtokenUserId === userId) {
            res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
        }

        const Data = await userModel.find({ _id: userId})
        return res.status(200).send({ status: true, message: 'user profile details', data: Data })
        
    } catch (error) {

        return res.status(500).send({ success: false, error: error.message });
    }
}


 module.exports.getUser = getUser;



 //PUT /user/:userId/profile (Authentication required)
 
 const UpdateUser = async (req, res) => {

    userId = req.params.userId;
    const requestBody = req.body;
    const profileImage = req.files
    TokenDetail=req.user

    if (!validator.isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified' })
    }
    const UserFound = await userModel.findOne({ _id: userId})
    

    if (!UserFound) {
        return res.status(404).send({ status: false, message: `User not found with given UserId` })
    }
    if (!TokenDetail === userId) {
        res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
    }



    var {fname,lname,email,phone,password}=requestBody

    if (Object.prototype.hasOwnProperty.call(requestBody, 'email')) {
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(requestBody.email))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        };
      

        const isEmailAlreadyUsed = await userModel.findOne({ email: requestBody.email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${requestBody.email} email address is already registered` })
            return
        };
    }
   // console.log(Object.prototype.hasOwnProperty.call(requestBody, 'password'))

    if (Object.prototype.hasOwnProperty.call(requestBody, 'password')) {
        requestBody.password = requestBody.password.trim();
        if (!(requestBody.password.length > 7 && requestBody.password.length < 16)) {
            res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
            return
        };

        var salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(requestBody.password, salt)
        console.log(password)
        requestBody.password = password;
    }
    if (profileImage && profileImage.length > 0) {
        var uploadedFileURL = await upload.uploadFile(profileImage[0]);
        console.log(uploadedFileURL)
        requestBody.profileImage = uploadedFileURL
    };

    
    if(requestBody.address){
        requestBody.address=JSON.parse(requestBody.address)
    if(requestBody.address.shipping)
    {
        if(requestBody.address.shipping.street)
        {
            UserFound.address.shipping.street=requestBody.address.shipping.street
            await UserFound.save()
        }
        if(requestBody.address.shipping.city)
        {
            UserFound.address.shipping.city=requestBody.address.shipping.city
            await UserFound.save()
        }
        if(requestBody.address.shipping.pincode)
        {
            UserFound.address.shipping.pincode=requestBody.address.shipping.pincode
            await UserFound.save()
        }
    }

    if(requestBody.address.billing)
    {
        if(requestBody.address.billing.street)
        {
            UserFound.address.billing.street=requestBody.address.billing.street
            await UserFound.save()
        }
        if(requestBody.address.billing.city)
        {
            UserFound.address.billing.city=requestBody.address.billing.city
            await UserFound.save()
        }
        if(requestBody.address.billing.pincode)
        {
            UserFound.address.billing.pincode=requestBody.address.billing.pincode
            await UserFound.save()
        }
    }
 }
    requestBody.UpdatedAt = new Date()
    const UpdateData={fname,profileImage:uploadedFileURL,lname,email,phone,password}
    const upatedUser = await userModel.findOneAndUpdate({ _id: userId }, UpdateData, { new: true })
    res.status(200).send({ status: true, message: 'User updated successfully', data: upatedUser });

}

module.exports.UpdateUser =UpdateUser 











