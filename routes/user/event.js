import express from 'express'
import { getEvent, createEvent, mintticket } from '../../controllers/user'

import { verifyLoggedInForApi } from '../../middleware/verifyLoggedIn.js'
import { uploadEventPass } from '../../services/fileUpload.js'

const router = express.Router()

router.get('/', getEvent)
router.post('/', verifyLoggedInForApi, uploadEventPass.single('eventPassImage'), createEvent)
router.post('/mint', verifyLoggedInForApi, mintticket)

export default router
