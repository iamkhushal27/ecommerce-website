const { v2: cloudinary } = require('cloudinary')

const fs=require("fs")

require('dotenv').config();

  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret:process.env.CLOUDINARY_SECRET
});

  async function fileUploder(path) {
    try {
      
        console.log(path)
        if (!path) {
            throw {
                message:'path is not given'
            }
        }
        const file=await cloudinary.uploader.upload(path,{
            resource_type:"auto"
        })
        if (!file) {
            throw {
                message:'something went wrong during uploading file on clodinary'
            }
        }
        fs.unlinkSync(path)
        
        return file
    } catch (error) {
       console.log(error)
       fs.unlinkSync(path)

        
    }
  } 
  module.exports=fileUploder