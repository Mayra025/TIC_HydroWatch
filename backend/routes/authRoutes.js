const express = require("express");
const { signIn, signOn } = require("../controllers/authController"); 

const router = express.Router();

router.post("/login", signIn); 
router.post("/register", signOn);

module.exports = router;