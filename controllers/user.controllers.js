const User = require('../models/user.models')
const jwt = require('jsonwebtoken')
const redis = require('../redis')
const { Redis } = require('ioredis')
const { json } = require('express')
const Product = require('../models/product.models')
const Category = require('../models/category.models')

async function generateAccesstokenrefreshtoken(existanceUser) {
    console.log('here we are')
    const user = await User.findById(existanceUser._id)
    try {
        if (!user) {
            throw {
                status: 400,
                message: "this user does not exist"
            }
        }
        const accessToken = await user.generateAccesstoken()

        const refreshToken = await user.generateRefreshtoken()


        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        res.status(error.status || 500).send(error.message || 'something went wrong')

    }

}

module.exports = {

    register: async (req, res) => {
        try {
            console.log('1')
            const { name, email, password } = req.body

            if (!name || !email || !password) {
                throw {
                    status: 400,
                    message: "required fields cannot be empty"
                }
            }

            const existanceUser = await User.findOne({
                $or: [
                    { name }, { email }
                ]
            })

            if (existanceUser) {
                if (existanceUser.name == name) {
                    throw {
                        status: 400,
                        message: "this name is already in use try another one"
                    }
                }

                if (existanceUser.email == email) {
                    throw {
                        status: 400,
                        message: "this email is already in use try another one"
                    }
                }
            }



            const user = await User.create({ name, email, password })
            if (!user) {
                throw {
                    status: 400,
                    message: "user is not made something went wrong"
                }
            }

            res.status(200).send(user)
        } catch (error) {
            console.log(error.message)
            res.status(error.status || 500).send(error.message || 'something went wrong')
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

            const existanceUser = await User.findOne({ email })

            if (!existanceUser) {
                throw {
                    status: 400,
                    message: "email is wrong"
                }

            }

            const newpassword = await existanceUser.passwordChecking(password)

            if (!newpassword) {

                throw {
                    status: 400,
                    message: "password is wrong"
                }
            }
            const { accessToken, refreshToken } = await generateAccesstokenrefreshtoken(existanceUser)


            const options = {
                httpOnly: true,
                secure: true

            }

            res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .send({ message: 'user is successfully login', existanceUser })

        } catch (error) {
            console.log(error.message)
            res.status(error.status || 500).send(error.message || 'something went wrong')
        }
    },
    logout: async (req, res) => {
        try {

            const { _id } = req.user

            if (!_id) {
                throw {
                    status: 400,
                    message: "something went wrong"
                }
            }

            const newuser = await User.findByIdAndUpdate(_id, {
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
    },
    generateAccessToken: async (req, res) => {
        try {
            const incomingRefreshToken = req.cookies.refreshToken

            if (!incomingRefreshToken) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }

            const user = await jwt.verify(incomingRefreshToken, process.env.REFRESHTOKEN_SECRET)

            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            const newUser = await User.findById(user)

            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            const { accessToken, refreshToken } = await generateAccesstokenrefreshtoken(newUser)

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
    myProfile: async (req, res) => {
        try {
            const { user } = req
            const userInchache = await redis.get('user')

            if (userInchache) {
                return res.status('200').send(JSON.parse(userInchache))
            }

            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }

            const newuser = await User.findOne(user._id).select('-password').populate('ownProducts')

            if (!newuser) {
                throw {
                    status: 400,
                    message: "something went wrong during geting user"
                }
            }

            await redis.set('user', JSON.stringify(newuser))
            await redis.expire("user", 30)

            res.status(200).send(newuser)
        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    otherProfile: async (req, res) => {
        try {
            // await redis.del('user')
            const { user } = req
            const { id } = req.params
            console.log(id)
            const userInchache1 = await redis.get('otheruser')
            if (userInchache1) {
                return res.status(200).send(JSON.parse(userInchache1))
            }

            if (!user) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!id) {
                throw {
                    status: 400,
                    message: "something went wrong"
                }
            }
            // console.log(user)

            const newuser = await User.findOne(user._id).select('-password').populate('ownProducts')
            const otheruser = await User.findOne({ _id: id }).select('-password').populate('ownProducts')


            if (!newuser) {
                throw {
                    status: 400,
                    message: "something went wrong during geting user"
                }
            }
            if (!otheruser) {
                throw {
                    status: 400,
                    message: "something went wrong during geting otheruser"
                }
            }
            await redis.set('otheruser', JSON.stringify([newuser, otheruser]))
            await redis.expire("otheruser", 30)
            

            res.status(200).send({ newuser, otheruser })
        } catch (error) {
            console.log(error.message)
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    updatePassword: async (req, res) => {
        try {
            const { password, oldPassword } = req.params
            const { user } = req
            if (oldPassword == password) {
                throw {
                    status: 400,
                    message: "old password and new password must be diffrenet"
                }
            }
            const newUser = await User.findById(user.id)

            if (!newUser) {
                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!password) {
                throw {
                    status: 400,
                    message: "password is not given"
                }
            }
            if (!oldPassword) {
                throw {
                    status: 400,
                    message: "old password is not given"
                }
            }
          
            const corectionPassword = await newUser.passwordChecking(oldPassword)
            if (!corectionPassword) {
                throw {
                    status: 400,
                    message: "old password is wrong"
                }
            }
          
            newUser.password = password
            newUser.save({ validateBeforeSave: false })

            res.status(200).send('password is updated')
        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    }, userNameChange: async (req, res) => {
        try {

            await redis.del('user')
            await redis.del('otheruser')

            const { name } = req.params
            const { user } = req
            if (!name) {
                throw {
                    status: 400,
                    message: 'new name is not given'
                }

            }
            if (!user) {
                throw {
                    status: 400,
                    message: 'unothorized access'
                }

            }

            const newUser = await User.findByIdAndUpdate(user._id, {
                $set: {
                    name
                }
            }, {
                new: true
            })

            if (!newUser) {
                throw {
                    status: 400,
                    message: 'name is not change'
                }

            }


            res.status(200).send({
                message: "user name is not change",
                newUser
            })

        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    deleteUser: async (req, res) => {
        try {
            const { user } = req

            if (!user) {
                throw {
                    status: 400,
                    message: 'unothorized'
                }
            }

            for (let i = 0; i < user.ownProducts.length; i++) {

                const checkProduct = await Product.findById(user.ownProducts[i])

                if (!checkProduct) {
                    throw {
                        status: 400,
                        message: 'something went wrong during getting the products of the user'
                    }
                }


                if (user.ownProducts[i].toString() === checkProduct._id.toString()) {

                    const deleteProduct = await Product.findByIdAndDelete(user.ownProducts[i])

                    if (!deleteProduct) {
                        throw {
                            status: 400,
                            message: 'something went wrong during getting the products of the user'
                        }
                    }

                    const allCategories = await Category.find()
                    if (!allCategories) {
                        throw {
                            status: 400,
                            message: "something went wrong during getting the categories"
                        }
                    }
                    for (let j = 0; j < allCategories.length; j++) {
                        if (allCategories[j]._id.toString() == deleteProduct.category.toString()) {


                            const deleteProductFromCategory = await Category.findById(deleteProduct.category)
                            if (!deleteProductFromCategory) {
                                throw {
                                    status: 400,
                                    message: "some thing went wrong during deleting"
                                }
                            }
                            for (let k = 0; k < deleteProductFromCategory.products.length; k++) {

                                if (deleteProductFromCategory.products[k].toString() == deleteProduct._id.toString()) {


                                    deleteProductFromCategory.products.splice(k, 1)
                                    deleteProductFromCategory.save({ validateBeforeSave: false })
                                }

                            }
                        }

                    }

                }

            }
            const deletedUser = await User.findByIdAndDelete(user._id)

            if (!deletedUser) {
                throw {
                    status: 400,
                    message: 'user is not deleted'
                }
            }

            const options = {
                httpOnly: true,
                secure: true

            }
            res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).send({ message: "user is deleted", deletedUser })

        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    addAmount: async (req, res) => {
        try {
            const { user } = req
            const { amount } = req.params

            if (!user) {
                throw {
                    status: 400,
                    message: 'unothirzed access'
                }
            }
            if (!amount) {
                throw {
                    status: 400,
                    message: 'amount is not given'
                }
            }
            await redis.del('user')
            await redis.del('otheruser')

            user.amount += Number(amount)
            user.save({ validateBeforeSave: false })
            
            res.status(200).send({
                message: "amount is added to your account",
                user

            })


        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')
        }
    }




}