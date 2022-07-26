import validator from 'validator'
import mongoose from 'mongoose'
import config from '../config'

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    validate (email) {
      if (!validator.isEmail(email)) {
        throw new Error('Email Not Valid!' + email)
      }
    }
  },

  nounce: {
    type: Number,
    required: true,
    default: 0
  },

  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'events'
  }],

  ticketsBrought: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tickets'
  }],

  ticketsBurned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wallets'
  }],

  status: {
    type: Number,
    required: true,
    enum: Object.values(config.DB_CONSTANTS.USER.STATUS),
    default: config.DB_CONSTANTS.USER.STATUS.ACTIVE
  },

  defaultWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wallets',
    required: true
  },

  accountsConnected: [{
    type: String
  }]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

const User = mongoose.model('users', userSchema)
export default User
