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
const Repository_1 = require("../models/Repository");
const token_1 = __importDefault(require("../classes/token"));
const authentication_1 = require("../middlewares/authentication");
require("dotenv").config();
const repositoryRoutes = (0, express_1.Router)();
//Create repository
repositoryRoutes.post("/", authentication_1.verifyToken, (req, res) => {
    const body = req.body;
    body.repository.user =
        req.body.usuario.firstName + " " + req.body.usuario.lastName;
    body.repository.userID = req.body.usuario._id;
    Repository_1.Repository.create(body.repository)
        .then((repositoryDB) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield User_1.User.findById(body.usuario._id);
        if (user) {
            user.createdRepositories.push(repositoryDB._id);
            yield user.save();
            const userToken = token_1.default.getJwtToken({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                savedRepositories: user.savedRepositories,
                createdRepositories: user.createdRepositories,
            });
            res.json({
                ok: true,
                repository: repositoryDB,
                message: "Repository created",
                token: userToken,
            });
        }
    }))
        .catch((err) => {
        res.json(err);
    });
});
//Get all repositories
repositoryRoutes.get("/", authentication_1.verifyToken, (req, res) => {
    Repository_1.Repository.find()
        .then((repositoriesDB) => {
        res.json({
            ok: true,
            repositories: repositoriesDB,
        });
    })
        .catch((err) => {
        res.json(err);
    });
});
//Get repository by id
repositoryRoutes.get("/:id", authentication_1.verifyToken, (req, res) => {
    const id = req.params.id;
    Repository_1.Repository.findById(id)
        .then((repositoryDB) => {
        if (!repositoryDB) {
            return res.json({
                ok: false,
                message: "Repository not found",
            });
        }
        else {
            res.json({
                ok: true,
                repository: repositoryDB,
            });
        }
    })
        .catch((err) => {
        res.json(err);
    });
});
//Update repository
repositoryRoutes.put("/:id", authentication_1.verifyToken, (req, res) => {
    const id = req.params.id;
    const body = req.body.repository;
    Repository_1.Repository.findByIdAndUpdate(id, body, { new: true })
        .then((repositoryDB) => {
        if (!repositoryDB) {
            return res.json({
                ok: false,
                message: "Repository not found",
            });
        }
        else {
            res.json({
                ok: true,
                repository: repositoryDB,
            });
        }
    })
        .catch((err) => {
        res.json(err);
    });
});
//Delete repository
repositoryRoutes.delete("/:id", authentication_1.verifyToken, (req, res) => {
    const id = req.params.id;
    Repository_1.Repository.findByIdAndDelete(id)
        .then((repositoryDB) => __awaiter(void 0, void 0, void 0, function* () {
        if (!repositoryDB) {
            return res.json({
                ok: false,
                message: "Repository not found",
            });
        }
        else {
            const user = yield User_1.User.findById(req.user._id);
            if (user) {
                // if user created it
                if (user.createdRepositories.includes(repositoryDB._id)) {
                    user.createdRepositories.pull(repositoryDB._id);
                    user.save();
                }
                //erase from all users if saved in their savedRepositories array
                User_1.User.find({ savedRepositories: { $in: repositoryDB._id } }).then((users) => {
                    users.forEach((user) => {
                        user.savedRepositories.pull(repositoryDB._id);
                        user.save();
                    });
                });
                res.json({
                    ok: true,
                    message: "Repository deleted",
                });
            }
            else {
                res.json({
                    ok: false,
                    message: "User not found",
                });
            }
        }
    }))
        .catch((err) => {
        res.json(err);
    });
});
//Save repository
repositoryRoutes.post("/save/:userid/:repoid", (req, res) => {
    const userid = req.params.userid;
    const repoid = req.params.repoid;
    Repository_1.Repository.findById(repoid)
        .then((repositoryDB) => __awaiter(void 0, void 0, void 0, function* () {
        if (!repositoryDB) {
            return res.json({
                ok: false,
                message: "Repository not found",
            });
        }
        else {
            const user = yield User_1.User.findById(userid);
            if (user) {
                user.savedRepositories.push(repositoryDB._id);
                yield user.save();
                res.json({
                    ok: true,
                    message: "Repository saved",
                });
            }
            else {
                res.json({
                    ok: false,
                    message: "User not found",
                });
            }
        }
    }))
        .catch((err) => {
        res.json(err);
    });
});
//Unsave repository
repositoryRoutes.post("/unsave/:userid/:repoid", (req, res) => {
    const userid = req.params.userid;
    const repoid = req.params.repoid;
    Repository_1.Repository.findById(repoid)
        .then((repositoryDB) => __awaiter(void 0, void 0, void 0, function* () {
        if (!repositoryDB) {
            return res.json({
                ok: false,
                message: "Repository not found",
            });
        }
        else {
            const user = yield User_1.User.findById(userid);
            if (user) {
                user.savedRepositories.pull(repositoryDB._id);
                yield user.save();
                res.json({
                    ok: true,
                    message: "Repository remove",
                });
            }
            else {
                res.json({
                    ok: false,
                    message: "User not found",
                });
            }
        }
    }))
        .catch((err) => {
        res.json(err);
    });
});
//Add or Remove Repository from favorites
repositoryRoutes.post("/favorite", authentication_1.verifyToken, (req, res) => {
    const body = req.body;
    const { repositoryID } = body;
    const userID = req.user._id;
    Repository_1.Repository.findById(repositoryID).then((repositoryDB) => __awaiter(void 0, void 0, void 0, function* () {
        if (repositoryDB) {
            yield User_1.User.findById(userID).then((user) => __awaiter(void 0, void 0, void 0, function* () {
                if (!user) {
                    return res.json({
                        ok: false,
                        message: "User not found",
                    });
                }
                else {
                    if (user.savedRepositories.includes(repositoryID)) {
                        user.savedRepositories.pull(repositoryID);
                        yield user.save();
                        const userToken = token_1.default.getJwtToken({
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            savedRepositories: user.savedRepositories,
                            createdRepositories: user.createdRepositories,
                        });
                        res.json({
                            ok: true,
                            message: "Repository removed from favorites",
                            added: false,
                            userToken,
                        });
                    }
                    else {
                        user.savedRepositories.push(repositoryID);
                        yield user.save();
                        const userToken = token_1.default.getJwtToken({
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            savedRepositories: user.savedRepositories,
                            createdRepositories: user.createdRepositories,
                        });
                        res.json({
                            ok: true,
                            message: "Repository added from favorites",
                            added: true,
                            userToken,
                        });
                    }
                }
            }));
        }
    }));
});
//get repositories by user id
repositoryRoutes.get("/user/:id", authentication_1.verifyToken, (req, res) => {
    const id = req.params.id;
    User_1.User.findById(id)
        .populate("savedRepositories")
        .populate("createdRepositories")
        .then((userDB) => {
        if (!userDB) {
            return res.json({
                ok: false,
                message: "User not found",
            });
        }
        else {
            res.json({
                ok: true,
                user: userDB,
            });
        }
    });
});
//get saved repositories by user id
repositoryRoutes.get("/saved/favorites", authentication_1.verifyToken, (req, res) => {
    const id = req.user._id;
    User_1.User.findById(id)
        .populate("savedRepositories")
        .then((userDB) => {
        if (!userDB) {
            return res.json({
                ok: false,
                message: "User not found",
            });
        }
        else {
            res.json({
                ok: true,
                user: userDB,
            });
        }
    });
});
exports.default = repositoryRoutes;
