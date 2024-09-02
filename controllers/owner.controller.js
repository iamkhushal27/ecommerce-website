const Owner = require("../models/owner");
const jwt = require('jsonwebtoken')
const redis = require('../redis')
const { Redis } = require('ioredis')
const { json } = require('express')
const Product = require('../models/product.models')
const bcrypt = require('bcrypt')

async function generateAccesstokenrefreshtoken(existanceOwner) {
   
    const owner = await Owner.findById(existanceOwner._id)
    try {
        if (!owner) {
            throw {
                status: 400,
                message: "this owner does not exist"
            }
        }
        
        const accessToken = await owner.generateAccesstoken()
   
        const refreshToken = await owner.generateRefreshtoken()
       

        owner.refreshToken = refreshToken
        owner.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error)

    }

}

module.exports = {
    registerOwner: async (req, res) => {
        try {

            const { name, email, password } = req.body

            if (!name || !email || !password) {
                throw {
                    status: 400,
                    message: "required fields cannot be empty"
                }
            }

            const existanceOwner = await Owner.find()
         
            if (existanceOwner.length != 0) {

                throw {
                    status: 400,
                    existanceOwner: existanceOwner,
                    message: "Owner is already exist",

                }
            }
      
            const owner = await Owner.create({ name, email, password })
            if (!owner) {
                throw {
                    status: 400,
                    message: "Owner is not made something went wrong"
                }
            }
    
            res.status(200).send(owner)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error || 'something went wrong')
        }
    },
    login: async (req, res) => {
        try {

            const { email, password } = req.body

            if (!email || !password) {
                throw {
                    status: 400,
                    message: "required fields cannot be empty"
                }
            }
         
            const existanceOwner = await Owner.findOne({ email })
         

            if (!existanceOwner) {
                throw {
                    status: 400,
                    message: "email is wrong"
                }

            }

            const newpassword = await existanceOwner.passwordChecking(password)
            if (!newpassword) {

                throw {
                    status: 400,
                    message: "password is wrong"
                }
            }

            const { accessToken, refreshToken } = await generateAccesstokenrefreshtoken(existanceOwner)

            const options = {
                httpOnly: true,
                secure: true

            }
    
            res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .send({ message: 'user is successfully login', existanceOwner })

        } catch (error) {
            console.log(error.message)
            res.status(error.status || 500).send(error.message || 'something went wrong')
        }
    },
    logout: async (req, res) => {
        try {

            const { _id } = req.newOwner
            
            if (!_id) {
                throw {
                    status: 400,
                    message: "something went wrong"
                }
            }

            const newowner = await Owner.findByIdAndUpdate(_id, {
                $set: {
                    refreshToken: undefined
                },

            }, {
                new: true
            })

            const options = {
                httpOnly: true,
                secure: true

            }
            res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).send('logout suucessfully')
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    }, generateAccessToken: async (req, res) => {
        try {
            const incomingRefreshToken = req.cookies.refreshToken
          

            if (!incomingRefreshToken) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }

            const owner = await jwt.verify(incomingRefreshToken, process.env.REFRESHTOKEN_SECRET)

            if (!owner) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            const newOwner = await Owner.findById(owner)
            if (!newOwner) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            const { accessToken, refreshToken } = await generateAccesstokenrefreshtoken(newOwner)

            if (!accessToken || !refreshToken) {
                throw {
                    status: 400,
                    message: 'something went worng during generating tokens'
                }
            }

            const options = {
                httpOnly: true,
                secure: true

            }

            res.status(200).cookie('accessToken', accessToken, options)
                .cookie('refreshToken', refreshToken, options).send({
                    accessToken, refreshToken
                })

        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },

}