"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../classes/token"));
const authentication_1 = require("../middlewares/authentication");
require("dotenv").config();
const userRoutes = (0, express_1.Router)();
// Login
userRoutes.post("/login", (req, res) => {
    const body = req.body;
    const email = body.email.toLowerCase();
    User_1.User.findOne({ email: email }, (err, userDB) => {
        if (err)
            throw err;
        if (!userDB) {
            return res.json({
                ok: false,
                message: "Email doesn't exist",
            });
        }
        if (userDB.comparePassword(body.password)) {
            const userToken = token_1.default.getJwtToken({
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
        }
        else {
            return res.json({
                ok: false,
                message: "Email and/or Password incorrect",
            });
        }
    });
});
// Register user
userRoutes.post("/register", (req, res) => {
    const secretKey = req.body.secretKey;
    if (secretKey !== process.env.SECRET_KEY) {
        return res.json({
            ok: false,
            message: "Invalid secret key",
        });
    }
    const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email.toLowerCase(),
        password: bcrypt_1.default.hashSync(req.body.password, 10),
    };
    User_1.User.create(user)
        .then((userDB) => {
        const userToken = token_1.default.getJwtToken({
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
userRoutes.put("/", authentication_1.verifyToken, (req, res) => {
    const user = {
        firstName: req.body.firstName || req.user.firstName,
        lastName: req.body.lastName || req.user.lastName,
        email: req.body.email || req.user.email,
        password: req.body.password || req.user.password,
    };
    User_1.User.findByIdAndUpdate(req.user._id, user, { new: true }, (err, userDB) => {
        if (err)
            throw err;
        if (!userDB) {
            return res.json({
                ok: false,
                message: "User not found",
            });
        }
        const userToken = token_1.default.getJwtToken({
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
userRoutes.get("/", [authentication_1.verifyToken], (req, res) => {
    const user = req.user;
    res.json({
        ok: true,
        user,
    });
});
//delete user
userRoutes.delete("/", [authentication_1.verifyToken], (req, res) => {
    const id = req.user._id;
    User_1.User.findByIdAndDelete(id, (err, userDeleted) => {
        if (err)
            throw err;
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
exports.default = userRoutes;
