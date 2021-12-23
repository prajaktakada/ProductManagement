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

        //---
        if(files && files.length > 0){

        var uploadedFileURL = await upload.uploadFile(files[0]);
           // data.profileImage = uploadedFileURL;
        }else{
            res.status(400).send({status:false,message:"nothing to write"})
        }
//-----
        const {fname,lname, email, phone,password,address} = req.body
           //const{profileImage} = files
         
         if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: ' Please provide fname' })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: ' Please provide lname' })
        }
        //  console.log(req.files.profileImage)
        // if (!validator.isValid(req.files.profileImage)) {
        //     return res.status(400).send({ status: false, message: ' Please provide profileImage' })
        // }

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
//-------
           // generate salt to hash password
      const salt = await bcrypt.genSalt(10);
         // now we set user password to hashed password
userDetails.password = await bcrypt.hash(userDetails.password, salt);

       //
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
                    // iat: Math.floor(Date.now() / 1000), //issue date
                    // exp: Math.floor(Date.now() / 1000) + 30 * 60
                }, "Group9")
                res.header('x-api-key', Token)

                

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

        // if(!(validator.isValidObjectId(decodedtokenUserId)&&validator.isValidObjectId(userId))){
        //     return res.status(400).send({status:false,message:"wrong tonken or userid"})
        // }
        const searchprofile = await userModel.findOne({ _id:userId})
        if (!searchprofile) {
            return res.status(404).send({ status: false, message: 'profile does not exist' })
        }
        
        if (searchprofile._id != decodedtokenUserId.userId) {
            return res.status(403).send({status: false,message: "Unauthorized access."})
        } 

        const Data = await userModel.find({ _id: userId})
        return res.status(200).send({ status: true, message: 'user profile details', data: Data })
        
    } catch (error) {

        return res.status(500).send({ success: false, error: error.message });
    }
}


 module.exports.getUser = getUser;



 //PUT /user/:userId/profile (Authentication required)
 
 const update = async function (req, res) {
    try {
        
        let decodedtokenUserId=req.user
        const userId = req.params.userId
        //
        const requestBody=req.body
        let files = req.files
        //
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'value in request body is required' })
            return
        }

        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }

        const updateprofile = await userModel.findOne({ _id:userId})

        if (!updateprofile) {
            return res.status(404).send({ status: false, message: 'profile does not exist' })
        }
        
        if (updateprofile._id != decodedtokenUserId.userId) {
            return res.status(403).send({status: false,message: "Unauthorized access."})
        } 
//
        {
            var uploadedFileURL = await upload.uploadFile(files[0]);
                        // var uploadedFileURL = await uploadFile(files[0]);
                        console.log(uploadedFileURL)
                     requestBody.profileImage=uploadedFileURL
                    
        }
 //         
         
    
// const updateDetails = await userModel.findOneAndUpdate({ _id: userId },requestBody,{ new: true })

 let updateDetails = await userModel.findOneAndUpdate({ _id: userId}, { $set: { "fname": req.body.fname, "lname": req.body.lname, "email": req.body.email, "profileImage": req.body.profileImage, "phone": req.body.phone,"password": req.body.password,"address": req.body.address} }, { new: true })



 //
        // generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        updateDetails.password = await bcrypt.hash(updateDetails.password, salt);


//
        if(!(updateDetails)){
        res.status(404).send({status:false, message: "user Detail is not updated" })
       } else {
        res.status(200).send({ status: true, message:"User profile updated",data: updateDetails })
       }
       }catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.update = update








// const update=async (req,res)=>{

//         userId=req.params.userId;
//         const requestBody = req.body;
//         let files=req.files
    
//         if (!validator.isValidRequestBody(requestBody)) {
//             return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified'})
//         }
//         const UserFound = await userModel.findOne({ _id: userId})
    
//         if (!UserFound) {
//             return res.status(404).send({ status: false, message: `User not found with given UserId` })
//         }
//         if(!req.user.UserId==userId)
//         {
//             res.status(400).send({status:false,message:"userId in url param and in token is not same"})
//         }
//        console.log(Object.prototype.hasOwnProperty.call(files, 'profileImage'))
//         if (Object.prototype.hasOwnProperty.call(files, 'profileImage'))
//         {
//             var uploadedFileURL = await upload.uploadFile(files[0]);
//             console.log(uploadedFileURL)
//             requestBody.profileImage=uploadedFileURL
//         }
//         console.log(Object.prototype.hasOwnProperty.call(requestBody, 'password'))
//         if(Object.prototype.hasOwnProperty.call(requestBody, 'email'))
//         {
//             if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(requestBody.email))) {
//                 res.status(400).send({ status: false, message: `Email should be a valid email address` })
//                 return
//             };
    
//             const isEmailAlreadyUsed = await userModel.findOne({email:requestBody.email} );
//             if (isEmailAlreadyUsed) {
//                 res.status(400).send({ status: false, message: `${requestBody.email} email address is already registered` })
//                 return
//             };
//         }
//         if(Object.prototype.hasOwnProperty.call(requestBody, 'password'))
//         {
//             requestBody.password=requestBody.password.trim();
//             if (!(requestBody.password.length > 7 && requestBody.password.length < 16)) {
//                 res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
//                 return
//             };
            
//             var salt=await bcrypt.genSalt(10);
//             password=await bcrypt.hash(requestBody.password,salt)
//             console.log(password)
//             requestBody.password=password;
//         }
    
    
//         requestBody.UpdatedAt=new Date()
//         const upatedUser = await userModel.findOneAndUpdate({ _id: userId }, requestBody,{ new: true })
//         res.status(200).send({ status: true, message: 'User updated successfully', data: upatedUser });
        
        
    
//     }

// module.exports={update}
//------------------------------------------

// const UserModel = require("../models/User Model")
// const mongoose = require("mongoose")
// const jwt = require("jsonwebtoken")
// const aws = require("aws-sdk");
// const bcrypt=require('bcrypt')

// aws.config.update({
//     accessKeyId: "AKIAY3L35MCRRMC6253G",  // id
//     secretAccessKey: "88NOFLHQrap/1G2LqUy9YkFbFRe/GNERsCyKvTZA",  // like your secret password
//     region: "ap-south-1" // Mumbai region
// });


// // this function uploads file to AWS and gives back the url for the file
// let uploadFile = async (file) => {
//     return new Promise(function (resolve, reject) { // exactly 

//         // Create S3 service object
//         let s3 = new aws.S3({ apiVersion: "2006-03-01" });
//         var uploadParams = {
//             ACL: "public-read", // this file is publically readable
//             Bucket: "classroom-training-bucket", // HERE
//             Key: "CD_newFolder/" + file.originalname, // HERE    "pk_newFolder/harry-potter.png" pk_newFolder/harry-potter.png
//             Body: file.buffer,
//         };

//         // Callback - function provided as the second parameter ( most oftenly)
//         s3.upload(uploadParams, function (err, data) {
//             if (err) {
//                 return reject({ "error": err });
//             }
            
//             console.log(`File uploaded successfully. ${data.Location}`);
//             return resolve(data.Location); //HERE 
//         });
//     });
// };


// const isValid = function (value) {
//     if (typeof value === 'undefined' || value === null) return false;
//     if (typeof value === 'string' && value.trim().length === 0) return false;
//     return true;
// };
// const isValidRequestBody = function (requestbody) {
//     return Object.keys(requestbody).length > 0;
// };

// const isValidObjectId = function (objectId) {
//     return mongoose.Types.ObjectId.isValid(objectId)
// }


// const createUser = async function (req, res) {
//     try {
//         let requestbody = req.body;
//         let files = req.files;
//         if (!isValidRequestBody(requestbody)) {
//             res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user details' })
//             return
//         }
//         if (files && files.length > 0) {

//             var uploadedFileURL = await uploadFile(files[0]);
//         } else {
//             res.status(400).send({ status: false, message: "Noting to write" })
//         }
//       // Extract params
//         let { fname, lname, email, phone, password, address } = requestbody;// Object destructing
//         //  Validation starts
//         if (!isValid(fname)) {
//             res.status(400).send({ status: false, message: `fname is required` })
//             return
//         };  //   title = title.trim()
//         if (!isValid(lname)) {
//             res.status(400).send({ status: false, message: `lname is required ` })
//             return
//         };
//         if (!isValid(phone)) {
//             res.status(400).send({ status: false, message: 'phone no is required' })
//             return
//         };
//         phone = phone.trim()

//         if (!(/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone))) {
//             res.status(400).send({ status: false, message: `Please fill a valid phone number` })
//             return
//         };
//         const isPhoneAlreadyUsed = await UserModel.findOne({ phone }); //{phone: phone} object shorthand property
//         if (isPhoneAlreadyUsed) {
//             res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
//             return
//         };

//         if (!isValid(email)) {
//             res.status(400).send({ status: false, message: `Email is required` })
//             return
//         };
//         email = email.trim().toLowerCase()
//         if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
//             res.status(400).send({ status: false, message: `Email should be a valid email address ` })
//             return
//         };
//         const isEmailAlreadyUsed = await UserModel.findOne({ email }); // {email: email} object shorthand property
//         if (isEmailAlreadyUsed) {
//             res.status(400).send({ status: false, message: `${email} email address is already registered` })
//             return
//         };
//         if (!isValid(password)) {
//             res.status(400).send({ status: false, message: `Password is required` })
//             return
//         };
        
//         if (!(password.length > 7 && password.length < 16)) {
//             res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
//             return
//         };

//         if (!isValid(address.billing.street)) {

//             return res.status(400).send({ status: false, message: "Please provide street" });;

//         }

//         if (!isValid(address.billing.city)) {

//             return res.status(400).send({ status: false, message: "Please provide city" });;

//         }

//         if (!validateBody.isValid(address.billing.pincode)) {

//             return res.status(400).send({ status: false, message: "Please provide pincode" });;

//         }

//         // Validation ends
//         const userData = { fname, lname, email, profileImage: uploadedFileURL, phone, password, address };
        
//         const salt=await bcrypt.genSalt(10);
//         userData.password=await bcrypt.hash(userData.password,salt)

//         const newUser = await UserModel.create(userData);
//         res.status(201).send({ status: true, message: ` success`, data: newUser });
//     } catch (error) {
//         res.status(500).send({ status: false, message: error.message });
//     };
// };

// const loginUser = async function (req, res) {
//     try {
        
//         if (!isValidRequestBody(req.body)) {
//             return res.status(400).send({ status: false, msg: "provide login credentials" })
//         };
//         let { email, password } = req.body
//         if (!isValid(email)) {
//             return res.status(401).send({ status: false, msg: "Email is required" })
//         };
//         email = email.toLowerCase().trim()
//         if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
//             res.status(400).send({ status: false, message: `Email should be a valid email address` })
//             return
//         };
//         if (!isValid(password)) {
//             res.status(402).send({ status: false, msg: "password is required" })
//             return
//         };
    
//         const user = await UserModel.findOne({email:req.body.email})
//         console.log(user)
//         if (!user) {
//             res.status(403).send({ status: false, msg: "invalid email or password, try again with valid login credentials " })
//             return
//         };

//         if(!await bcrypt.compare(password,user.password))
//         {
//             return res.status(401).send({ msg: "Invalid credential" })
//         }
        
//         const token = await jwt.sign({
//             userId: user._id,
//             iat: Math.floor(Date.now() / 1000),//issue date
//             exp: Math.floor(Date.now() / 1000) + 30 * 60//expire date 30*60 = 30min 
//         }, 'project5');
//         res.header('x-api-key', token);
//         res.status(200).send({ status: true, userId: user._id, token });
//         return
//     }
//     catch (err) {
//         res.status(500).send({ status: false, msg: err.message })
//         return
//     };
// };

// const getUserDetails=async (req,res)=>{
//     userId=req.params.userId;
//     TokenDetail=req.user

//     if(!TokenDetail.UserId==userId)
//     {
//         res.status(403).send({status:false,message:"userId in url param and in token is not same"})
//     }

//     if (!isValidObjectId(userId)) {
//         return res.status(400).send({ status: false, message: `${userId} is not a valid book id` })
//     }

//     const FoundUser = await UserModel.findOne({ _id: userId, isDeleted: false })
//     if (!FoundUser) {
//         return res.status(404).send({ status: false, message: `No User found with given User Id` })
//     }

//     res.status(200).send({status:true,"message": "User profile details","data":FoundUser})

// }

// const UpdateUser=async (req,res)=>{

//     userId=req.params.userId;
//     const requestBody = req.body;
//     let files=req.files

//     if (!isValidRequestBody(requestBody)) {
//         return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified'})
//     }
//     const UserFound = await UserModel.findOne({ _id: userId, isDeleted: false })

//     if (!UserFound) {
//         return res.status(404).send({ status: false, message: `User not found with given UserId` })
//     }
//     if(!req.user.UserId==userId)
//     {
//         res.status(400).send({status:false,message:"userId in url param and in token is not same"})
//     }
//    console.log(Object.prototype.hasOwnProperty.call(files, 'profileImage'))
//     if (Object.prototype.hasOwnProperty.call(files, 'profileImage'))
//     {
//         var uploadedFileURL = await uploadFile(files[0]);
//         console.log(uploadedFileURL)
//         requestBody.profileImage=uploadedFileURL
//     }
//     console.log(Object.prototype.hasOwnProperty.call(requestBody, 'password'))
//     if(Object.prototype.hasOwnProperty.call(requestBody, 'email'))
//     {
//         if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(requestBody.email))) {
//             res.status(400).send({ status: false, message: `Email should be a valid email address` })
//             return
//         };

//         const isEmailAlreadyUsed = await UserModel.findOne({email:requestBody.email} );
//         if (isEmailAlreadyUsed) {
//             res.status(400).send({ status: false, message: `${requestBody.email} email address is already registered` })
//             return
//         };
//     }
//     if(Object.prototype.hasOwnProperty.call(requestBody, 'password'))
//     {
//         requestBody.password=requestBody.password.trim();
//         if (!(requestBody.password.length > 7 && requestBody.password.length < 16)) {
//             res.status(400).send({ status: false, message: "password should  between 8 and 15 characters" })
//             return
//         };
        
//         var salt=await bcrypt.genSalt(10);
//         password=await bcrypt.hash(requestBody.password,salt)
//         console.log(password)
//         requestBody.password=password;
//     }


//     requestBody.UpdatedAt=new Date()
//     const upatedUser = await UserModel.findOneAndUpdate({ _id: userId }, requestBody,{ new: true })
//     res.status(200).send({ status: true, message: 'User updated successfully', data: upatedUser });
    
    

// }

// module.exports={createUser,loginUser,getUserDetails,UpdateUser}