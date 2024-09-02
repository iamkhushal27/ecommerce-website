const jwt = require('jsonwebtoken')
const Owner = require('./models/owner')


async function ownerAuthentication(req, res, next) {
    try {
        const incomingAccessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')
        console.log(incomingAccessToken)
        const incomingrefreshToken = req.cookies?.refreshToken
        if (!incomingAccessToken) {
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }
        if (!incomingrefreshToken) {
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }

        const owner = await jwt.verify(incomingAccessToken, process.env.ACCESSTOKE_SECRET)
        
        console.log(owner)
        if (!owner._id) {
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }
        console.log(owner._id)

        const newOwner = await Owner.findById(owner._id)

        if (incomingrefreshToken != newOwner.refreshToken) {
            throw {
                status: 400,
                message: 'unothorized accesss'
            }
        }


        req.newOwner = newOwner
        console.log(newOwner)
        next()


    } catch (error) {
        res.status(error.status || 500).send(error.message || 'something went wrong')

    }




}
module.exports = ownerAuthentication