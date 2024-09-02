const Category = require("../models/category.models");
const Product = require("../models/product.models");
const userControllers = require("./user.controllers");

module.exports = {
    setCategory: async (req, res) => {
        try {
            const { newOwner } = req
            const { name } = req.params
            if (!newOwner) {
                throw {
                    status: 400,
                    message: "unothorized accesss"

                }
            }
            if (!name) {
                throw {
                    status: 400,
                    message: "category is not given"

                }
            }
            const existstanceCategory = await Category.findOne({ name })
            if (existstanceCategory) {
                throw {
                    status: 400,
                    message: "this category is already created"

                }
            }

            const createdCategory = await Category.create({ name })
            if (!createdCategory) {
                throw {
                    status: 400,
                    message: "category is not created"

                }
            }
            res.status(200).send(createdCategory)
        } catch (error) {
            res.status(error.status || 500).send(error.message || 'something went wrong')

        }
    },
    deleteCategory: async (req, res) => {
        try {

            const { newOwner } = req
            const { id } = req.params

            if (!newOwner) {
                throw {
                    status: 400,
                    message: "unothirez access"

                }
            }

            if (!id) {
                throw {
                    status: 400,
                    message: "id is not given"

                }
            }

            const product = await Product.find()
            
            if (!product) {
                throw {
                    status: 400,
                    message: "all products is not find"

                }
            }

            for (let i = 0; i < product.length; i++) {
                if (product[i].category == id) {
    
                    const newProduct = await Product.findById(product[i]._id)

                    if (!newProduct) {
                        throw {
                            status: 400,
                            message: "product is not find"

                        }

                    }

                    newProduct.category = null
                    newProduct.save({ validateBeforeSave: false })

                }
            }

            const deletedCategory = await Category.findByIdAndDelete(id)

            if (!deletedCategory) {
                throw {
                    status: 400,
                    message: "this category does not exist"

                }
            }
            res.status(200).send(deletedCategory)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")
        }

    },
    getAllCategory: async (req, res) => {

        try {
            const { user } = req
      
            if (!user) {

                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }

            let allCategories = await Category.find().populate('products')
            if (!allCategories) {

                throw {
                    status: 400,
                    message: "something went wrong during getting all categories"
                }
            }
            
            for (let i = 0; i < allCategories.length; i++) {
                for (let k = 0; k < allCategories[i].products.length; k++) {
                    for (let j = 0; j < user.ownProducts.length; j++) {
                        
                        if (user.ownProducts[j].toString() == allCategories[i].products[k]._id.toString()) {
                           
                            allCategories[i].products.splice(k, 1)
                            k--
                            break
                        }
                    }
                }
            }


            res.status(200).send(allCategories)
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).send(error.message || "something went wrong")

        }
    },
    getSingleCategory: async (req, res) => {

        try {
            const { user } = req
            const { categoryId } = req.params
            if (!user) {

                throw {
                    status: 400,
                    message: "unothorized access"
                }
            }
            if (!categoryId) {

                throw {
                    status: 400,
                    message: "category id is not given"
                }
            }

            const category = await Category.findOne({ _id: categoryId }).populate('products')

            if (!category) {

                throw {
                    status: 400,
                    message: "this category does not exist"
                }
            }
        
            for (let k = 0; k < category.products.length; k++) {
               
                for (let j = 0; j < user.ownProducts.length; j++) {
                    if (user.ownProducts[j].toString() == category.products[k]._id.toString()) {
                      
                        category.products.splice(k, 1)
                        k--
                        break
                    }
                }

            }

            res.status(200).send(category)
        } catch (error) {
            res.status(error.status || 500).send(error.message || "something went wrong")

        }
    }
}
