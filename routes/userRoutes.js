const express = require('express')

const {
   signup,
   login,
   logout,
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const {
   getAllUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser
} = require('../controllers/userController')

const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(login)

router.route('/logout').get(logout)

router.use(protect, isAdmin)

router.route('/')
   .get(getAllUsers)
   .post(createUser)

router.route('/:id')
   .get(getUser)
   .patch(updateUser)
   .delete(deleteUser)

module.exports = router;