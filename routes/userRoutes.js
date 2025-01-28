const express = require('express');
const router = express.Router();
const {SignUpValidation , loginValidation } = require("../helpers/Validation");
const userController = require("../controllers/userController");
const path = require('path');
const multer = require('multer');
const auth = require("../middleware/auth");
const passport = require('passport');

const storage = multer.diskStorage({
    destination : (req , file , cb) => {
        cb(null , path.join(__dirname , "../public/images"));
    },
    filename : (req , file , cb) => {
      const name = Date.now() + "-" + file.originalname;
        cb(null ,name) ;
    }
});

const filefilter = (req , file , cb) => {
    (file.mimetype === "image/jpeg" || file.mimetype === "image/png")?
        cb(null , true):cb(null , false);
}

const upload = multer({
  storage : storage,
  fileFilter : filefilter
});



router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
  userController.facebookSignup
);
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile' , 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  userController.googleSignup
  );

router.post("/signup" ,upload.single('image'), SignUpValidation , userController.signup);
router.post("/login" , loginValidation , userController.login);
router.get("/user" , auth.isAuthorize , userController.getUser);


module.exports = router;
