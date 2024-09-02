const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { Schema } = mongoose;

const userSchema = new Schema({
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
    amount: {
        type: Number,
        default: 0

    },
    refreshToken: {
        type: String,
    },
    ownProducts: [
        {
            type: Schema.Types.ObjectId, ref: 'Product',

        }
    ]

},
    {

        timestamps: true
    });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 13)
        console.log('helo')
        return next()

    }
    next()

})

userSchema.methods.passwordChecking = async function (password) {
    console.log(password)
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccesstoken = async function () {
    return jwt.sign({
        _id: this._id,

    },
        process.env.ACCESSTOKE_SECRET,
        {
            expiresIn: process.env.ACCESSTOKE_EXPAIRAYTIME
        }
    )
}

userSchema.methods.generateRefreshtoken = async function () {
    return jwt.sign({
        _id: this._id,

    },
        process.env.REFRESHTOKEN_SECRET,
        {
            expiresIn: process.env.REFRESHTOKEN_EXPAIRAYTIME
        }
    )
}

const User = mongoose.model('User', userSchema);
module.exports = User;


