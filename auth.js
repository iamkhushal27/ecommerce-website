const User = require('./models/user.models')
const jwt = require('jsonwebtoken')

async function authentication(req, res, next) {
    try {
        const incomingAccessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
        console.log(incomingAccessToken)
        const incomingrefreshToken = req.cookies?.refreshToken
        if (!incomingAccessToken){
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }
        if (!incomingrefreshToken){
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }

        const user_id = await jwt.verify(incomingAccessToken, process.env.ACCESSTOKE_SECRET)

        if (!user_id) {
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }
        console.log(user_id)

        const user = await User.findById(user_id)

        if (incomingrefreshToken != user.refreshToken) {
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }


        req.user = user
        next()


    } catch (error) {
        res.status(error.status || 500).send(error.message || 'something went wrong')

    }




}
module.exports = authentication