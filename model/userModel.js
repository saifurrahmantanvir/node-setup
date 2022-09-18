const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please provide your name!']
   },
   email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
   },
   password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
         validator: function (pc) {
            return pc === this.password;
         },
         message: 'Passwords are not the same!'
      }
   },
   isAdmin: {
      type: Boolean,
      default: false
   }
})

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next() /* this points to the current document */

   this.password = await bcrypt.hash(this.password, 12)
   this.passwordConfirm = undefined

   next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
   return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User;