//ordercontroller.js

const orderModel = require('../models/orderModel')
const productModel = require("../models/productModel.js")
const userModel = require("../models/UserModel.js")
const cartModel = require('../models/cartModel')
let validator = require('../controllers/validateController')
const jwt = require("jsonwebtoken")


//POST /users/:userId/orders
const createOrder = async (req, res) => {
    try {
        let requestBody = req.body
        let cartId = req.body.cartId
        let decodedToken = req.user
        let userId = req.params.userId

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid params received in request body' })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }

        if (!(validator.isValidObjectId(cartId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid cartId' })
        }
        if (!(decodedToken === userId)) {
            res.status(400).send({ status: false, message: "userId in url param and in token is not same" })
        }
        let findCart = await cartModel.findOne({ _id: cartId })
        console.log(findCart)
        if (!findCart) {
            res.status(400).send({ status: false, message: "cart does not exit" })
        }

        let { items, totalPrice, totalItems } = findCart

        let totalQuantity = 0

        //totalItems= items.length
        for (i = 0; i < items.length; i++) {
            totalQuantity = totalQuantity + items[i].quantity
            console.log(totalQuantity)
        }

        let order = { userId, items, totalPrice, totalItems, totalQuantity }

        const ordercreate = await orderModel.create(order)
        res.status(201).send({ status: true, message: "congrats order successfully placed", data: ordercreate })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//PUT /users/:userId/orders
const updateorder = async (req, res) => {
    try {
        const userId = req.params.userId;
        requestbody = req.body;
        TokenDetail = req.user

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        }

        const UserFound = await userModel.findOne({ _id: userId })
        if (!UserFound) {
            return res.status(404).send({ status: false, message: `User Details not found with given UserId` })
        }


        if (!(TokenDetail == userId)) {
            res.status(401).send({ status: false, message: "userId in url param and in token is not same" })
        }

        if (!validator.isValidRequestBody(requestbody)) {
            return res.status(400).send({ status: false, message: 'Invalid params received in request body' })
        }

        let { orderId, status } = requestbody
        status = status.toLowerCase().trim()
        if (!validator.isValidStatus(status)) {
            return res.status(400).send({ status: false, message: `Status should be among confirmed, pending and cancelled` })
        }
        orderId = orderId.trim();
        let OrderFound = await orderModel.findOne({ _id: orderId })


        if (!OrderFound) {
            return res.status(400).send({ status: false, message: `Order not found with given OrderId` })
        }
//
        if (!OrderFound.userId == userId) {
            return res.status(400).send({ status: false, message: `Order does not belong to given userId` })
        }

        if (OrderFound.cancellable == false) {
            return res.status(400).send({ status: false, message: ` only a cancellable order could be canceled` })
        }
        if (["completed", "cancled"].includes(OrderFound.status)) {
            return res.status(400).send({ status: false, message: `Can not update order which have status cancelled or completed` })
        }

        const Cart = await cartModel.findOne({ userId: OrderFound.userId })
        if (requestbody.status == "completed") {
            Cart.totalPrice = 0;
            Cart.totalItems = 0;
            Cart.items.splice(0)
            await Cart.save()
        }

        OrderFound.status = status.toLowerCase();
        await OrderFound.save()
        return res.status(200).send({ status: true, message: `Order Updated Successfully`, data: OrderFound })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createOrder, updateorder }