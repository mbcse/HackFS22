import express from 'express'
import { verifyLoggedIn } from '../../middleware/verifyLoggedIn.js'
import { dashboard, myEvents, myTickets } from '../../controllers/user/dashboard.js'

const router = express.Router()

// user dashboard
router.get('/', verifyLoggedIn, dashboard)

router.get('/addevent', verifyLoggedIn, (req, res) => {
  res.render('dashboard/add-event')
})

router.get('/profile', verifyLoggedIn, (req, res) => {
  res.render('dashboard/profile')
})

router.get('/myevents', verifyLoggedIn, myEvents)

router.get('/mytickets', verifyLoggedIn, myTickets)

router.get('/mintlist', verifyLoggedIn, (req, res) => {
  res.render('dashboard/mintlist')
})

router.get('/burnedtickets', verifyLoggedIn, (req, res) => {
  res.render('dashboard/burned-tickets')
})

export default router
