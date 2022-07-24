import express from 'express'
import { getEvent, createEvent } from '../../controllers/user'
import { verifyLoggedInForApi } from '../../middleware/verifyLoggedIn.js'
import { uploadEventPass } from '../../services/fileUpload.js'

const router = express.Router()

router.get('/', getEvent)
router.post('/', verifyLoggedInForApi, uploadEventPass.single('eventPassImage'), createEvent)

export default router
