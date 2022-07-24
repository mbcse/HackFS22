import User from '../../database/user.js'
import * as responseUtils from '../../utilities/responseUtils'
import logger from '../../utilities/logger.js'
import Wallet from '../../database/wallet.js'
import Event from '../../database/events.js'
import config from '../../config'
import { sendEmail } from '../../services/email.js'
import { ipfsImageUploader } from '../../services/ipfsUploader'

// router.get('/', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/index')
// })

// router.get('/addevent', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/add-event')
// })

// router.get('/profile', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/profile')
// })

// router.get('/myevents', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/my-event')
// })

// router.get('/mytickets', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/my-tickets')
// })

// router.get('/mintlist', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/mintlist')
// })

// router.get('/burnedtickets', verifyLoggedIn, (req, res) => {
//   res.render('dashboard/burned-tickets')
// })

export const dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
    const events = await Event.find()
    res.render('dashboard/index', {
      totalEvents: user.events.length,
      totalTickets: user.ticketsBrought.length,
      totalBurnedTickets: user.ticketsBurned.length,
      totalAccountsConnected: user.accountsConnected.length,
      events
    })
  } catch (err) {
    logger.error(err)
    responseUtils.response.serverErrorResponse(res, err)
  }
}

export const myEvents = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('events').exec()
    console.log(user.events)
    res.render('dashboard/my-event', {
      events: user.events
    })
  } catch (err) {
    logger.error(err)
    responseUtils.response.serverErrorResponse(res, err)
  }
}
