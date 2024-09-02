const mongoose=require('mongoose')

async function connection(){
 await mongoose.connect(`${process.env.MONGODB_PASSWORD}/${[process.env.MONGODB_NAME]}`)
}
module.exports=connection