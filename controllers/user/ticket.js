import User from '../../database/user.js'
import * as responseUtils from '../../utilities/responseUtils'
import logger from '../../utilities/logger.js'
import Wallet from '../../database/wallet.js'
import Event from '../../database/events.js'
import Ticket from '../../database/tickets.js'

import config from '../../config'
import { sendEmail } from '../../services/email.js'
import { ipfsImageUploader } from '../../services/ipfsUploader'
import { saveJSONToIPFS } from '../../utilities/ipfsPinataUtils'
import { mintTicket } from '../../services/blockchain/mint.js'
// import publishToQueue from '../../utilities/queueUtils'

// export const ticketMinter = async (req, res) => {
//   const eventId = req.body.eventId
//   const userId = req.session.userId
//   try {
//     const eventData = await Event.findById(eventId)
//     const userData = await User.findById(userId)
//     const metadata = {
//       name: `${eventData.eventName} ticket`,
//       creator: 'Event-On-Chain',
//       description: `This NFT is EventOnChain NFT pass issued as event pass for event ${eventData.eventName} organized
//       by ${eventData.eventOrganizer}. The event is scheduled from ${eventData.eventStartDate} to ${eventData.eventEndDate}`,

//       //   animation_url: 'ar://3J32eR7rDG1LAy-nR0u8BdrKVXuXDyS2C14a53W_kpk',
//       image: eventData.eventPassImage,

//       external_url: 'https://eventonchain.io',
//       background_color: '#000000',
//       attributes: [
//         {
//           trait_type: 'cost',
//           value: eventData.eventTicketPrice.toString()
//         },
//         {
//           trait_type: 'burn-value',
//           value: eventData.eventTicketBurnValue.toString()
//         },
//         {
//           trait_type: 'Organizer',
//           value: eventData.eventOrganizer
//         }
//       ]
//     }

//     const metadataUri = await saveJSONToIPFS(metadata)
//     await publishToQueue(config.QUEUE.LIST.mint, { collectableId, creatorAddress, txId })
//   } catch (err) {
//     responseUtils.response.serverErrorResponse(res, err)
//   }
// }

export const mintticket = async (req, res) => {
  const eventId = req.body.eventId
  const userId = req.session.userId
  try {
    const eventData = await Event.findById(eventId)
    const userData = await User.findById(userId)
    const newTicket = await new Ticket({ eventId, issuedTo: userId }).save()
    eventData.minted += 1
    await eventData.save()
    userData.ticketsBrought.push(newTicket._id)
    await userData.save()
    responseUtils.response.successResponse(res, 'Minted Successfully', newTicket)
  } catch (err) {
    responseUtils.response.serverErrorResponse(res, err)
  }
}
