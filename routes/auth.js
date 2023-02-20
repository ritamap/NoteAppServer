
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');



const JWT_SECRET = "tikusoumo@"


//Route 1: Create a User using: POST "/api/auth/createUser". Log in not required
router.post('/createUser', [
  body('name', "Enter a valid name").isLength({ min: 3 }),
  body('email', "Enter a valid email").isEmail(),
  body('password', "Password must be at least 5 charecters").isLength({ min: 5 }),
], async (req, res) => {
  let success=false
  //If there are error, return bad request and errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  try {
    //Check whether the user with this email already exist
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      return res.status(400).json({success, error: "Email already exist" })
    }
    const salt = await bcrypt.genSalt(10)
    const secPass = await bcrypt.hash(req.body.password, salt)

    //Create a new user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    })
    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET)
    success=true
    res.json({success, authToken })
  } catch (error) {
    console.error(error.message);
    res.status(500).json({success,error:"some error is occured"})

  }

});
//Route 2 :Authenticate a User using: POST "/api/auth/Login".Log in not required
router.post('/login', [
  body('email', "Enter a valid email").isEmail(),
  body('password', "Password can not be blank").exists(),
], async (req, res) => {
  let success=false
  //If there are error, return bad request and errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }


  const { email, password } = req.body
  try {
    console.log("step1")
    let user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({success, error: "Please check your credentials" })
    }
    console.log("step2")
    
    const passwordCompare =  bcrypt.compare(password, user.password)
    if (!passwordCompare) {
      return res.status(401).json({success, error: "Please check your credentials" })
      
    }
    
    console.log("step3")
    const data = {
      user: {
        id: user.id
      }
    }

    const authToken = jwt.sign(data, JWT_SECRET)
    success=true
    res.json({success, authToken })

  } catch (error) {
    console.error(error.message);
    res.status(500).json({error:error.message})

  }
});
  //Route 3 :Get login User details : POST "/api/auth/getuser".Log is required
  router.post('/getuser',fetchUser, async (req, res) => {
  let success=false
    try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password')
    res.status(200).json({success,user})
  } catch (error) {
    console.error(error.message);
    res.status(500).json("Internal Server Error")
  }


})

module.exports = router