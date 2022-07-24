import mongoose from 'mongoose'
import config from '../config'

const Schema = mongoose.Schema

const ticketSchema = new Schema({
  issuedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'events',
    required: true
  },

  minted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

const Tickets = mongoose.model('tickets', ticketSchema)
export default Tickets
