const mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const OwnerSchema = new Schema({
    name:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    password:
    {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
    }

}, { timestamps: true });

OwnerSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 13)
        console.log('helo')
        return next()

    }
    next()

})

OwnerSchema.methods.passwordChecking = async function (password) {
    console.log(password)
    return await bcrypt.compare(password, this.password)
}

OwnerSchema.methods.generateAccesstoken = async function () {
    return jwt.sign({
        _id: this._id,

    },
        process.env.ACCESSTOKE_SECRET,
        {
            expiresIn: process.env.ACCESSTOKE_EXPAIRAYTIME
        }
    )
}

OwnerSchema.methods.generateRefreshtoken = async function () {
    return jwt.sign({
        _id: this._id,

    },
        process.env.REFRESHTOKEN_SECRET,
        {
            expiresIn: process.env.REFRESHTOKEN_EXPAIRAYTIME
        }
    )
}






const Owner = mongoose.model('Owner', OwnerSchema);


module.exports = Owner;
