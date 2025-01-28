const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/dbConnection");

const randomstring = require("randomstring");
const sendMail = require('../helpers/sendMail');

const signup = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.query("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [req.body.email], async (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    db.query("INSERT INTO users SET ?",
      { name: req.body.name, email: req.body.email, password: hashedPassword , image : req.file.filename},
      (err, result) => {
        if (err) {
          return res.status(500).send({ msg: err });
        }

        const randomToken = randomstring.generate();
        let mailSubject = "Email Verification!";
        let content = `<p>Hi ${req.body.name},<br/>Please <a href="http://localhost:3000/mail-verification?token=${randomToken}">verify</a> your email address.</p>`;
        sendMail(req.body.email, mailSubject, content);

        db.query("UPDATE users SET token = ? WHERE email = ?",
          [randomToken, req.body.email],
          (err, result) => {
            if (err) {
              return res.status(500).send({ msg: err });
            }
            return res.status(201).json({ message: "User created successfully. Please check your email to verify." });
          }
        );
      }
    );
  });
};


const verifyMail = (req, res) => {
  db.query("SELECT * FROM users WHERE token = ? LIMIT 1", [req.query.token], (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      db.query("UPDATE users SET is_verified = 1 , token = null WHERE token = ?", [req.query.token], (err, result) => {
        if (err) {
          return res.status(500).send({ msg: err });
        }

        return res.render('mail-verification', { message: "Email verified successfully" });
      });
    } else {
      return res.status(400).json({ message: "Invalid token" });
    }
  });
}
const { JWT_SECRET } = process.env;
const login = (req, res) => {
  if (req.body.facebookId) {
    return handleFacebookLogin(req, res);
  }

  if (req.body.googleId) {
    return handleGoogleLogin(req, res);
  }

  return handleEmailLogin(req, res);
};

const handleFacebookLogin = (req, res) => {
  db.query("SELECT * FROM users WHERE facebookId = ?", [req.body.facebookId], async (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      if (result[0].is_verified === 0) {
        return res.status(400).json({ message: "Please verify your email address" });
      }

      const token = jwt.sign(
        { id: result[0].id, is_admin: result[0].is_admin },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        msg: "Logged in successfully",
        token,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          image: result[0].image,
          is_admin: result[0].is_admin,
        },
      });
    } else {
      return res.status(400).json({ message: "User not found, please sign up first" });
    }
  });
};

const handleGoogleLogin = (req, res) => {
  db.query("SELECT * FROM users WHERE googleId = ?", [req.body.googleId], async (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      if (result[0].is_verified === 0) {
        return res.status(400).json({ message: "Please verify your email address" });
      }

      const token = jwt.sign(
        { id: result[0].id, is_admin: result[0].is_admin },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        msg: "Logged in successfully",
        token,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          image: result[0].image,
          is_admin: result[0].is_admin,
        },
      });
    } else {
      return res.status(400).json({ message: "User not found, please sign up first" });
    }
  });
};

const handleEmailLogin = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.query("SELECT * FROM users WHERE email = ?", [req.body.email], async (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      const isMatch = await bcrypt.compare(req.body.password, result[0].password);

      if (isMatch) {
        if (result[0].is_verified === 0) {
          return res.status(400).json({ message: "Please verify your email address" });
        }

        const token = jwt.sign(
          { id: result[0].id, is_admin: result[0].is_admin },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(200).json({
          msg: "Logged in successfully",
          token,
          user: {
            id: result[0].id,
            name: result[0].name,
            email: result[0].email,
            image: result[0].image,
            is_admin: result[0].is_admin,
          },
        });
      } else {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  });
};

const getUser = (req, res) => {

    const authToken = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(authToken, JWT_SECRET);
  db.query("SELECT id, name, email, image, is_admin FROM users WHERE id = ?", [decode.id], (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    return res.status(200).json({ user: result[0] });
  });
};

const facebookSignup = async (req, res) => {
  const user = req.user;

  db.query("SELECT * FROM users WHERE facebookId = ?", [user.facebookId], async (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      const token = jwt.sign(
        { id: result[0].id, is_admin: result[0].is_admin },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        msg: "Logged in successfully",
        token,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          image: result[0].image,
          is_admin: result[0].is_admin,
        },
      });
    } else {
      const randomToken = randomstring.generate();
      db.query("INSERT INTO users SET ?", {
        name: user.name,
        email: user.email,
        facebookId: user.facebookId,
        image: user.image || "default-image.jpg",
        token: randomToken,
        is_verified: 0,
        password: "default-password" ,
      }, (err, result) => {
        if (err) {
          return res.status(500).send({ msg: err });
        }

        let mailSubject = "Email Verification!";
        let content = `<p>Hi ${user.name},<br/>Please <a href="http://localhost:3000/mail-verification?token=${randomToken}">verify</a> your email address.</p>`;
        sendMail(user.email, mailSubject, content);

        const token = jwt.sign(
          { id: result.insertId, is_admin: 0 },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(201).json({
          msg: "User created successfully. Please check your email to verify.",
          token,
          user: {
            id: result.insertId,
            name: user.name,
            email: user.email,
            image: user.image || "default-image.jpg",
            is_admin: 0,
          },
        });
      });
    }
  });
};

const googleSignup = async (req, res) => {
  const user = req.user;

  db.query("SELECT * FROM users WHERE googleId = ?", [user.googleId], async (err, result) => {
    if (err) {
      return res.status(500).send({ msg: err });
    }

    if (result && result.length > 0) {
      const token = jwt.sign(
        { id: result[0].id, is_admin: result[0].is_admin },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        msg: "Logged in successfully",
        token,
        user: {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          image: result[0].image,
          is_admin: result[0].is_admin,
        },
      });
    } else {
      const randomToken = randomstring.generate();
      db.query("INSERT INTO users SET ?", {
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        image: user.image || "default-image.jpg",
        token: randomToken,
        is_verified: 0,
        password: "default-password" ,
      }, (err, result) => {
        if (err) {
          return res.status(500).send({ msg: err });
        }

        let mailSubject = "Email Verification!";
        let content = `<p>Hi ${user.name},<br/>Please <a href="http://localhost:3000/mail-verification?token=${randomToken}">verify</a> your email address.</p>`;
        sendMail(user.email, mailSubject, content);

        const token = jwt.sign(
          { id: result.insertId, is_admin: 0 },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(201).json({
          msg: "User created successfully. Please check your email to verify.",
          token,
          user: {
            id: result.insertId,
            name: user.name,
            email: user.email,
            image: user.image || "default-image.jpg",
            is_admin: 0,
          },
        });
      });
    }
  });
};



module.exports = {
  signup,
  verifyMail,
  login,
  getUser,
  facebookSignup,
  googleSignup
};