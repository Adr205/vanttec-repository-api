"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
userRoutes.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const email = body.email.toLowerCase();
    const user = yield User_1.User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({
            ok: false,
            message: "User/Password incorrect",
        });
    }
    if (user.comparePassword(body.password)) {
        const userToken = token_1.default.getJwtToken({
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
    }
    else {
        return res.status(400).json({
            ok: false,
            message: "User/Password incorrect",
        });
    }
}));
// Register user
userRoutes.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        password: bcrypt_1.default.hashSync(req.body.password, 10),
    };
    const userCreated = yield User_1.User.create(user);
    if (userCreated) {
        const userToken = token_1.default.getJwtToken({
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
    }
    else {
        return res.status(400).json({
            ok: false,
            message: "Error creating user",
        });
    }
}));
// Update user
userRoutes.put("/", authentication_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = {
        firstName: req.body.firstName || req.user.firstName,
        lastName: req.body.lastName || req.user.lastName,
        email: req.body.email || req.user.email,
        password: req.body.password || req.user.password,
    };
    yield User_1.User.findByIdAndUpdate(req.user._id, user, { new: true }, (err, userDB) => {
        if (err)
            throw err;
        if (!userDB) {
            return res.status(400).json({
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
        return res.json({
            ok: true,
            token: userToken,
        });
    });
}));
//Get user
userRoutes.get("/", [authentication_1.verifyToken], (req, res) => {
    const user = req.user;
    return res.json({
        ok: true,
        user,
    });
});
//delete user
userRoutes.delete("/", [authentication_1.verifyToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user._id;
    yield User_1.User.findByIdAndDelete(id, (err, userDeleted) => {
        if (err)
            throw err;
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
}));
exports.default = userRoutes;
