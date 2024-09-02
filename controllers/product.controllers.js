const { all } = require('../app')
const Category = require('../models/category.models')
const Product = require('../models/product.models')
const User = require('../models/user.models')
const fileUploder = require('../public/javascripts/cloudinary')
const redis = require('../redis')


module.exports = {
    setProduct: async (req, res) => {
        try {

            const { name, price, stock, category } = req.body
            const picture = req.file
            const { user } = req

            if (!user) {
                throw {
                    status: 400,
                    message: "unothoried access"
                }
            }
            if (!name) {
                throw {
                    status: 400,
                    message: "name is not given to product"
                }
            }
            if (!category) {
                throw {
                    status: 400,
                    message: "category is not given to product"
                }
            }
            if (!price) {
                throw {
                    status: 400,
                    message: "price is not specified"
                }
            }
            if (!stock) {
                throw {
                    status: 400,
                    message: "stock is not specified for the product"
                }
            }
            if (!picture) {
                throw {
                    status: 400,
                    message: "picture is not uploaded"
                }
            }

            const filePath = await fileUploder(picture.path)


            const product = await (await Product.create({ name, price, stock, category, picture: filePath.url, userId: user._id })).populate("category userId",)


            if (!product) {
                throw {
                    status: 400,
                    message: "something went wrong during the creating product"
                }
            }
            const findCategory = await Category.findById(category)

            if (!findCategory) {
                throw {
                    status: 400,
                    message: "something went wrong during finding category"
                }
            }

            findCategory.products.push(product._id)
            findCategory.save({ validateBeforeSave: false })

            user.ownProducts.push(product._id)

            user.save({ validateBeforeSave: false })

            res.status(200).send(product)

        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }

    },
    getAllProductOfOwn: async (req, res) => {
        try {

            const { user } = req
            if (!user) {
                throw {
                    status: 400,
                    message: "unothoried access"
                }
            }

            const cacheProducts = await redis.get('product')

            if (cacheProducts) {
                return res.status(200).send(JSON.parse(cacheProducts))
            }
            const product = await Product.find({ userId: user._id })
                .populate({
                    path: 'userId',
                    select: '-password -ownProducts -_id', // Exclude 'password', 'ownProducts', and 'userId'
                })
            // .select('-stock');


            if (!product) {
                throw {
                    status: 400,
                    message: "something went wrong during the creating product"
                }
            }
            await redis.set('product', JSON.stringify(product))
            await redis.expire('product', 30)

            res.status(200).send(product)


        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }

    },
    getAllProductOfOther: async (req, res) => {
        try {

            const cacheProducts = await redis.get('otherproduct')

            if (cacheProducts) {
                return res.status(200).send(JSON.parse(cacheProducts))
            }

            const { userid } = req.params


            if (!userid) {
                throw {
                    status: 400,
                    message: "userid is not provieded"
                }
            }

            const product = await Product.find({ userId: userid })
                .populate({
                    path: 'userId',
                    select: '-password -ownProducts -_id', // Exclude 'password', 'ownProducts', and 'userId'
                })
            // .select('-stock');


            if (!product) {
                throw {
                    status: 400,
                    message: "something went wrong during the creating product"
                }
            }
            await redis.set('otherproduct', JSON.stringify(product))
            await redis.expire('otherproduct', 30)

            res.status(200).send(product)


        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }

    },
    getSingleProduct: async (req, res) => {
        try {

            const cacheProducts = await redis.get('singleproduct')
            if (cacheProducts) {
                return res.status(200).send(JSON.parse(cacheProducts))
            }

            const { productid } = req.params

            if (!productid) {
                throw {
                    status: 400,
                    message: "productid is not provieded"
                }
            }


            const product = await Product.findById(productid)


            if (!product) {
                throw {
                    status: 400,
                    message: "something went wrong"
                }
            }
            await redis.set('singleproduct', JSON.stringify(product))
            await redis.expire('singleproduct', 30)

            res.status(200).send(product)


        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }

    },
    productNameChange: async (req, res) => {
        try {
            const { name, productid } = req.params
            const { user } = req


            for (let i = 0; i < user.ownProducts.length; i++) {

                if (user.ownProducts[i] == productid) {

                    if (!name) {
                        throw {
                            status: 400,
                            message: 'new name is not given'
                        }

                    }
                    if (!productid) {
                        throw {
                            status: 400,
                            message: ' productid is not given'
                        }

                    }
                    if (!user) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }
                    const previousProductName = await Product.findById(productid)

                    if (previousProductName.name == name) {
                        throw {
                            status: 400,
                            message: "old name and newname must be diffrenet"
                        }
                    }
                    await redis.del('product')
                    await redis.del('singleproduct')



                    const updateProduct = await Product.findByIdAndUpdate(productid, {
                        $set: {
                            name
                        }
                    }, {
                        new: true
                    })

                    if (!updateProduct) {
                        throw {
                            status: 400,
                            message: 'name is not change'
                        }

                    }


                    return res.status(200).send({
                        message: "product name is change",
                        updateProduct
                    })


                }

            }

            throw {
                status: 400,
                message: "you are not allowed to change this product"
            }
        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    productCategoryChange: async (req, res) => {
        try {
            const { category, productid } = req.params
            const { user } = req


            for (let i = 0; i < user.ownProducts.length; i++) {

                if (user.ownProducts[i] == productid) {


                    if (!category) {
                        throw {
                            status: 400,
                            message: 'category is not given'
                        }

                    }
                    if (!productid) {
                        throw {
                            status: 400,
                            message: ' productid is not given'
                        }

                    }
                    if (!user) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }
                    const previousProduct = await Product.findById(productid)

                    if (previousProduct.category.toString() == category.toString()) {
                        throw {
                            status: 400,
                            message: "old category and new category must be diffrenet"
                        }
                    }
                    await redis.del('product')
                    await redis.del('singleproduct')



                    const updateProduct = await Product.findByIdAndUpdate(productid, {
                        $set: {
                            category
                        }
                    }, {
                        new: true
                    })

                    if (!updateProduct) {
                        throw {
                            status: 400,
                            message: 'name is not change'
                        }

                    }


                    return res.status(200).send({
                        message: "product name is change",
                        updateProduct
                    })


                }

            }

            throw {
                status: 400,
                message: "you are not allowed to change this product"
            }
        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    productPriceChange: async (req, res) => {
        try {
            const { price, productid } = req.params
            const { user } = req

            for (let i = 0; i < user.ownProducts.length; i++) {

                if (user.ownProducts[i] == productid) {
                    if (!price) {
                        throw {
                            status: 400,
                            message: 'new price is not given'
                        }

                    }
                    if (!productid) {
                        throw {
                            status: 400,
                            message: ' productid is not given'
                        }

                    }
                    if (!user) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }

                    const previousProduct = await Product.findById(productid)

                    if (previousProduct.price == price) {
                        throw {
                            status: 400,
                            message: "old price and new price must be diffrenet"
                        }
                    }
                    await redis.del('product')
                    await redis.del('singleproduct')


                    const updateProduct = await Product.findByIdAndUpdate(productid, {
                        $set: {
                            price
                        }
                    }, {
                        new: true
                    }).populate({
                        path: 'userId',
                        select: '-password -ownProducts -_id', // Exclude 'password', 'ownProducts', and 'userId'
                    })

                    if (!updateProduct) {
                        throw {
                            status: 400,
                            message: 'name is not change'
                        }

                    }


                    return res.status(200).send({
                        message: "product price is change",
                        updateProduct
                    })

                }

            }

            throw {
                status: 400,
                message: "you are not allowed to change this product"
            }


        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    productStockChange: async (req, res) => {
        try {
            const { stockQuantity, productid } = req.params
            const { user } = req

            for (let i = 0; i < user.ownProducts.length; i++) {

                if (user.ownProducts[i] == productid) {

                    if (!stockQuantity) {
                        throw {
                            status: 400,
                            message: 'new stock is not given'
                        }

                    }
                    if (!productid) {
                        throw {
                            status: 400,
                            message: ' productid is not given'
                        }

                    }
                    if (!user) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }
                    const previousProduct = await Product.findById(productid)

                    if (!previousProduct) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }

                    await redis.del('product')
                    await redis.del('singleproduct')

                    const updateProduct = await Product.findByIdAndUpdate(productid, {
                        $set: {
                            stock: Number(previousProduct.stock) + Number(stockQuantity)
                        }
                    }, {
                        new: true
                    }).populate({
                        path: 'userId',
                        select: '-password -ownProducts -_id', // Exclude 'password', 'ownProducts', and 'userId'
                    })

                    if (!updateProduct) {
                        throw {
                            status: 400,
                            message: 'name is not change'
                        }

                    }


                    return res.status(200).send({
                        message: "product of stock is change",
                        updateProduct
                    })


                }

            }
            throw {
                status: 400,
                message: "you are not allowed to change this product"
            }

        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    productPictureChange: async (req, res) => {
        try {
            const { productid } = req.params
            const { user } = req
            const picture = req.file

            for (let i = 0; i < user.ownProducts.length; i++) {

                if (user.ownProducts[i] == productid) {

                    if (!productid) {
                        throw {
                            status: 400,
                            message: ' productid is not given'
                        }

                    }
                    if (!picture) {
                        throw {
                            status: 400,
                            message: ' productid is not given'
                        }

                    }
                    if (!user) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }
                    console.log(picture)
                    await redis.del('product')
                    await redis.del('singleproduct')
                    const previousProduct = await Product.findById(productid)

                    if (!previousProduct) {
                        throw {
                            status: 400,
                            message: 'unothorized access'
                        }

                    }


                    const productImage = await fileUploder(picture.path)
                    if (!productImage) {
                        throw {
                            status: 400,
                            message: 'product picture is not change'
                        }

                    }


                    const updateProduct = await Product.findByIdAndUpdate(productid, {
                        $set: {
                            picture: productImage.url
                        }
                    }, {
                        new: true
                    }).populate({
                        path: 'userId',
                        select: '-password -ownProducts -_id', // Exclude 'password', 'ownProducts', and 'userId'
                    })

                    if (!updateProduct) {
                        throw {
                            status: 400,
                            message: 'name is not change'
                        }

                    }


                    return res.status(200).send({
                        message: "product image is change",
                        updateProduct
                    })

                }

            }

            throw {
                status: 400,
                message: "you are not allowed to change this product"
            }

        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    deleteproduct: async (req, res) => {
        try {
            const { productid } = req.params
            const { user } = req
            let deleteproduct
            if (!productid) {
                throw {
                    status: 400,
                    message: ' productid is not given'
                }

            }
            if (!user) {
                throw {
                    status: 400,
                    message: 'unothorized access'
                }

            }
            // console.log("user is", user)

            for (let k = 0; k < user.ownProducts.length; k++) {
                // console.log(user.ownProducts[k].toString(), productid)
                if (user.ownProducts[k].toString() == productid) {
                    // console.log(user.ownProducts[k])
                    await redis.del('product')
                    await redis.del('singleproduct')


                    deleteproduct = await Product.findByIdAndDelete(productid)
                    

                    if (!deleteproduct) {
                        throw {
                            status: 400,
                            message: 'something went wrong during delete product'
                        }
                    }

                 
                    user.ownProducts.splice(k, 1)
                    user.save({ validateBeforeSave: false })
                    const allCategories = await Category.find()
                    for (let i = 0; i < allCategories.length; i++) {
                       
                        if (allCategories[i]._id.toString() == deleteproduct.category.toString()) {
                            
                            const deleteCategory = await Category.findById(deleteproduct.category)
                          
                            if (!deleteCategory) {
                                throw {
                                    status: 400,
                                    message: 'something wnet wrong during gettting the delete category'
                                }
                            }
                            for (let j = 0; j < deleteCategory.products.length; j++) {
                                if (deleteCategory.products[j].toString() == deleteproduct._id.toString()) {
                                

                                    deleteCategory.products.splice(j, 1)
                                    deleteCategory.save({ validateBeforeSave: false })
                                


                                }

                            }
                            
                        }

                    }
                  
                    return res.send(deleteproduct)

                }
            }
            const Allproducts = await Product.find()
            for (let i = 0; i < Allproducts.length; i++) {
                if (Allproducts[i]._id == productid) {
                    throw {
                        status: 400,
                        message: "unothrized access for thus product"
                    }
                }

            }

            res.status(400).send("this is not product")


        }


        catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },


}