const express  = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const zxc = require('zxcvbn')

router.get('/', (req,res,next) => {
  const password = "jordy69"
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password,salt)
  res.send(hash)
})

//signup routes
router.get('/signup', (req,res,next) => {
  res.render('auth/signup')
})

router.post('/signup', (req,res,next) => {
  const {password, password2, username} = req.body
  if(password!==password2) return res.render('auth/signup', {errorPw: 'passwords do not match', userinput:req.body})
  console.log(zxc(password))
  if(zxc(password).score<2) return res.render('auth/signup', zxc(password).feedback)
 
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password,salt)
  User.create({username: username, password:hash})
    .then(user => {
      res.send(user)
    }).catch (e =>{
      res.render('auth/signup', {errorUser: 'username already exists',userinput:req.body})
    })

})

//login routes
router.get('/login', (req,res,next)=> {
  res.render('auth/login')
})

router.post('/login', (req,res,next)=>{
  const {username, password} = req.body
  User.findOne({username:username})
  .then (user => {
    if(!user) return res.render('auth/login', {error: 'Este usuario no existe'})
    if(bcrypt.compareSync(password,user.password)){
      req.session.currentUser = user
      res.redirect('/profile/'+user._id)
    }else {
      res.render('auth/login', {error: "User name and password were not found"})
    }
  })
})

router.get('/profile/:id', (req,res,next)=> {
  const {id} = req.params
  User.findById(id)
  .then(usr => {
    res.render("auth/profile", usr)
  })
})

module.exports = router