import { Router, Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import Token from "../classes/token";
import { verifyToken } from "../middlewares/authentication";
require("dotenv").config();

const userRoutes = Router();

// Login
userRoutes.post("/login", async (req: Request, res: Response) => {
  const body = req.body;
  const email = body.email.toLowerCase();

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({
      ok: false,
      message: "User/Password incorrect",
    });
  }

  if (user.comparePassword(body.password)) {
    const userToken = Token.getJwtToken({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      savedRepositories: user.savedRepositories,
      createdRepositories: user.createdRepositories,
    });

    return res.status(200).json({
      ok: true,
      token: userToken,
    });
  } else {
    return res.status(400).json({
      ok: false,
      message: "User/Password incorrect",
    });
  }
});

// Register user
userRoutes.post("/register", async (req: Request, res: Response) => {
  const secretKey = req.body.secretKey;


  if (secretKey !== process.env.SECRET_KEY) {
    return res.status(400).json({
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

  const userCreated = await User.create(user);

  if(userCreated) {
    const userToken = Token.getJwtToken({
      _id: userCreated._id,
      firstName: userCreated.firstName,
      lastName: userCreated.lastName,
      email: userCreated.email,
      savedRepositories: userCreated.savedRepositories,
      createdRepositories: userCreated.createdRepositories,
    });

    return res.status(200).json({
      ok: true,
      token: userToken,
    });
  }else{
    return res.status(400).json({
      ok: false,
      message: "Error creating user",
    });
  }
});

// Update user
userRoutes.put("/", verifyToken, async (req: any, res: Response) => {
  const user = {
    firstName: req.body.firstName || req.user.firstName,
    lastName: req.body.lastName || req.user.lastName,
    email: req.body.email || req.user.email,
    password: req.body.password || req.user.password,
  };

  await User.findByIdAndUpdate(
    req.user._id,
    user,
    { new: true },
    (err, userDB) => {
      if (err) throw err;

      if (!userDB) {
        return res.status(400).json({
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

      return res.json({
        ok: true,
        token: userToken,
      });
    }
  );
});

//Get user

userRoutes.get("/", [verifyToken], (req: any, res: Response) => {
  const user = req.user;

  return res.json({
    ok: true,
    user,
  });
});

//delete user

userRoutes.delete("/", [verifyToken], async (req: any, res: Response) => {
  const id = req.user._id;

  await User.findByIdAndDelete(id, (err: any, userDeleted) => {
    if (err) throw err;

    if (!userDeleted) {
      return res.status(400).json({
        ok: false,
        message: "User not found",
      });
    }

    return res.json({
      ok: true,
      message: "User deleted",
    });
  });
});

export default userRoutes;
