const User = require("../model/userModel")
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getAllUsers = catchAsync(async (req, res, next) => {
   const users = await User.find()

   res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
         users
      }
   })
})

exports.getUser = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const user = await User.findById(id)

   if (!user) {
      return next(new AppError('No user found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         user
      }
   })
})

exports.createUser = (req, res) => {
   res.status(500).json({
      status: 'error',
      message: 'This route doesn\'t exist. please use /signup instead!'
   })
}

exports.updateUser = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!user) {
      return next(new AppError('No user found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         user
      }
   })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const user = await User.findByIdAndDelete(id)

   if (!user) {
      return next(new AppError('No user found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         user
      }
   })
})