import { Router, Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import Token from "../classes/token";
import { verifyToken } from "../middlewares/authentication";
require("dotenv").config();

const userRoutes = Router();

// Login
userRoutes.post("/login", (req: Request, res: Response) => {
  const body = req.body;
  const email = body.email.toLowerCase();
  User.findOne({ email: email }, (err: any, userDB) => {
    if (err) throw err;

    if (!userDB) {
      return res.json({
        ok: false,
        message: "Email doesn't exist",
      });
    }

    if (userDB.comparePassword(body.password)) {
      const userToken = Token.getJwtToken({
        _id: userDB._id,
        firstName: userDB.firstName,
        lastName: userDB.lastName,
        email: userDB.email,
        savedRepositories: userDB.savedRepositories,
        createdRepositories: userDB.createdRepositories,
      });

      res.json({
        ok: true,
        token: userToken,
      });
    } else {
      return res.json({
        ok: false,
        message: "Email and/or Password incorrect",
      });
    }
  });
});

// Register user

userRoutes.post("/register", (req: Request, res: Response) => {
  const secretKey = req.body.secretKey;

  if (secretKey !== process.env.SECRET_KEY) {

    console.log("Secret key incorrect", secretKey, process.env.SECRET_KEY);
    return res.json({
      ok: false,
      message: "Invalid secret key",
    });
  }

  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email.toLowerCase(),
    password: bcrypt.hashSync(req.body.password, 10),
  };

  

  User.create(user)
    .then((userDB) => {
      const userToken = Token.getJwtToken({
        _id: userDB._id,
        firstName: userDB.firstName,
        lastName: userDB.lastName,
        email: userDB.email,
      });

      res.json({
        ok: true,
        token: userToken,
      });
    })
    .catch((err) => {
      res.json({
        ok: false,
        err,
      });
    });
});

// Update user
userRoutes.put("/", verifyToken, (req: any, res: Response) => {
  const user = {
    firstName: req.body.firstName || req.user.firstName,
    lastName: req.body.lastName || req.user.lastName,
    email: req.body.email || req.user.email,
    password: req.body.password || req.user.password,
  };

  User.findByIdAndUpdate(req.user._id, user, { new: true }, (err, userDB) => {
    if (err) throw err;

    if (!userDB) {
      return res.json({
        ok: false,
        message: "User not found",
      });
    }

    const userToken = Token.getJwtToken({
      _id: userDB._id,
      firstName: userDB.firstName,
      lastName: userDB.lastName,
      email: userDB.email,
    });

    res.json({
      ok: true,
      token: userToken,
    });
  });
});

//Get user

userRoutes.get("/", [verifyToken], (req: any, res: Response) => {
  const user = req.user;

  res.json({
    ok: true,
    user,
  });
});

//delete user

userRoutes.delete("/", [verifyToken], (req: any, res: Response) => {
  const id = req.user._id;

  User.findByIdAndDelete(id, (err: any, userDeleted) => {
    if (err) throw err;

    if (!userDeleted) {
      return res.json({
        ok: false,
        message: "User not found",
      });
    }

    res.json({
      ok: true,
      message: "User deleted",
    });
  });
});

export default userRoutes;
