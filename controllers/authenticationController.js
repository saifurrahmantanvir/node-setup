const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const User = require('../model/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const signToken = (id, isAdmin) => {
   return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
   })
}

const createSendToken = (user, statusCode, req, res) => {
   const token = signToken(user._id, user.isAdmin)

   const cookieOptions = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      sameSite: 'none',
      secure: true,
      httpOnly: true
   }

   if (process.env.NODE_ENV === 'production') {
      cookieOptions.sameSite = 'none',
         cookieOptions.secure =
         req.secure || req.headers['x-forwarded-proto'] === 'https'
   }

   res.cookie('jwt', token, cookieOptions)

   user.password = undefined;

   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user
      }
   })
}

exports.signup = catchAsync(async (req, res, next) => {
   const { name, email, password, passwordConfirm } = req.body;

   const user = await User.create({
      name, email, password, passwordConfirm
   })

   createSendToken(user, 201, req, res)
})

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400))
   }

   const user = await User.findOne({ email }).select('+password -__v')

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401))
   }

   createSendToken(user, 200, req, res)
})

exports.logout = (req, res) => {
   res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      sameSite: 'none',
      secure: true
   })

   res.status(200).json({ status: 'success' });
}

exports.protect = catchAsync(async (req, res, next) => {
   let token;

   if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
   }
   /*
   else if (req.cookies?.jwt) {
      token = req.cookies.jwt
   }
   */

   if (!token) {
      return next(
         new AppError('You are not logged in! please log in to get access', 401)
      )
   }

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

   const currentUser = await User.findById(decoded.id)
   if (!currentUser) {
      return next(
         new AppError(
            'The user belonging to this token does no longer exist',
            401
         )
      )
   }

   req.user = currentUser;
   next()
})

exports.isAdmin = (req, res, next) => {
   if (!req.user.isAdmin) {
      return next(new AppError(
         'You do not have permission to perform this action', 401
      ))
   }
   next()
}