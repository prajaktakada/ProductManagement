const express = require('express');

const router = express.Router();


const usercontroller=require("../controllers/usercontroller")
 const Middleware=require("../middleware/Authentication")
// //USER API
 router.post('/registerUser',usercontroller.createuser)
 router.post('/login',usercontroller.login)
router.get('/user/:userId/profile',Middleware.Auth,usercontroller.getUser)
 router.put('/user/:userId/profile',Middleware.Auth,usercontroller.UpdateUser)





// const bookcontroller=require("../controllers/bookcontroller")
// const Reviewcontroller=require("../controllers/Reviewcontroller")
//  const Middleware=require("../middleware/Authentication")
// const awscontroller=require('../controllers/awscontroller')


// //USER API
// router.post('/registerUser',usercontroller.registerUser)
//  router.post('/login',usercontroller.login)


//  //BOOK API
 
// router.post('/createbooks',Middleware.Auth,bookcontroller.createbooks) //authorisation

// router.get('/getbooks',Middleware.Auth,bookcontroller.getbooks)
//  router.put('/books/:bookId',Middleware.Auth,bookcontroller.update ) //authorisation
//  router.get('/books/:bookId',Middleware.Auth,bookcontroller.getBookWithReview )

//   router.delete('/books/:bookId',Middleware.Auth,bookcontroller.deletebookbyID) //authorisation
// // router.delete('/books/:bookId',bookcontroller.deletebookbyID) 

//  //Reiew API 
//  router.post('/books/:bookId/review',Reviewcontroller.bookreview)
// router.put('/books/:bookId/review/:reviewId',Reviewcontroller.updateReviews)
//  router.delete('/books/:bookId/review/:reviewId',Reviewcontroller.deleteReviewOfBook )


// //
// router.post('/write-file-aws',awscontroller.awsCreat)





module.exports = router;