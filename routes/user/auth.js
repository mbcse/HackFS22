import express from 'express'
import { sendLoginOtp, login, signingData, signatureVerifyAndLogin } from '../../controllers/authentication'

const router = express.Router()

router.post('/otp', sendLoginOtp)
router.post('/login', login)

router.post('/signingdata', signingData)
router.post('/cryptologin', signatureVerifyAndLogin)

export default router
