const express = require('express');
const router = express.Router();
const {SignUpValidation , loginValidation , forgetValidation } = require("../helpers/Validation");
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

router.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),userController.githubSignup
);

router.post("/signup" ,upload.single('image'), SignUpValidation , userController.signup);
router.post("/login" , loginValidation , userController.login);
router.get("/user" , auth.isAuthorize , userController.getUser);


router.post("/forget-password", forgetValidation, userController.forgetpassword);
router.get("/reset-password/:token", userController.renderResetPasswordForm);
router.post("/reset-password/:token", userController.resetpassword);





module.exports = router;
