import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { Repository } from "../models/Repository";
import bcrypt from "bcrypt";
import Token from "../classes/token";
import { verifyToken } from "../middlewares/authentication";
require("dotenv").config();

const repositoryRoutes = Router();

//Create repository
repositoryRoutes.post("/", verifyToken, (req: Request, res: Response) => {
  const body = req.body;
  body.repository.user =
    req.body.usuario.firstName + " " + req.body.usuario.lastName;
  body.repository.userID = req.body.usuario._id;

  Repository.create(body.repository)
    .then(async (repositoryDB) => {
      const user = await User.findById(body.usuario._id);
      if (user) {
        user.createdRepositories.push(repositoryDB._id);
        await user.save();
        const userToken = Token.getJwtToken({
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
    })
    .catch((err) => {
      res.json(err);
    });
});

//Get all repositories
repositoryRoutes.get("/", verifyToken, (req: Request, res: Response) => {
  Repository.find()
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
repositoryRoutes.get("/:id", verifyToken, (req: Request, res: Response) => {
  const id = req.params.id;

  Repository.findById(id)
    .then((repositoryDB) => {
      if (!repositoryDB) {
        return res.json({
          ok: false,
          message: "Repository not found",
        });
      } else {
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
repositoryRoutes.put("/:id", verifyToken, (req: Request, res: Response) => {
  const id = req.params.id;
  const body = req.body.repository;

  Repository.findByIdAndUpdate(id, body, { new: true })
    .then((repositoryDB) => {
      if (!repositoryDB) {
        return res.json({
          ok: false,
          message: "Repository not found",
        });
      } else {
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
repositoryRoutes.delete("/:id", verifyToken, (req: Request, res: Response) => {
  const id = req.params.id;

  Repository.findByIdAndDelete(id)
    .then(async (repositoryDB) => {
      if (!repositoryDB) {
        return res.json({
          ok: false,
          message: "Repository not found",
        });
      } else {
        const user = await User.findById(req.user._id);

        if (user) {
          // if user created it
          if (user.createdRepositories.includes(repositoryDB._id)) {
            user.createdRepositories.pull(repositoryDB._id);
            user.save();
          }

          //erase from all users if saved in their savedRepositories array
          User.find({ savedRepositories: { $in: repositoryDB._id } }).then(
            (users) => {
              users.forEach((user) => {
                user.savedRepositories.pull(repositoryDB._id);
                user.save();
              });
            }
          );

          res.json({
            ok: true,
            message: "Repository deleted",
          });
        } else {
          res.json({
            ok: false,
            message: "User not found",
          });
        }
      }
    })
    .catch((err) => {
      res.json(err);
    });
});

//Save repository

repositoryRoutes.post(
  "/save/:userid/:repoid",
  (req: Request, res: Response) => {
    const userid = req.params.userid;
    const repoid = req.params.repoid;

    Repository.findById(repoid)
      .then(async (repositoryDB) => {
        if (!repositoryDB) {
          return res.json({
            ok: false,
            message: "Repository not found",
          });
        } else {
          const user = await User.findById(userid);

          if (user) {
            user.savedRepositories.push(repositoryDB._id);
            await user.save();

            res.json({
              ok: true,
              message: "Repository saved",
            });
          } else {
            res.json({
              ok: false,
              message: "User not found",
            });
          }
        }
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//Unsave repository
repositoryRoutes.post(
  "/unsave/:userid/:repoid",
  (req: Request, res: Response) => {
    const userid = req.params.userid;
    const repoid = req.params.repoid;

    Repository.findById(repoid)
      .then(async (repositoryDB) => {
        if (!repositoryDB) {
          return res.json({
            ok: false,
            message: "Repository not found",
          });
        } else {
          const user = await User.findById(userid);

          if (user) {
            user.savedRepositories.pull(repositoryDB._id);
            await user.save();

            res.json({
              ok: true,
              message: "Repository remove",
            });
          } else {
            res.json({
              ok: false,
              message: "User not found",
            });
          }
        }
      })
      .catch((err) => {
        res.json(err);
      });
  }
);

//Add or Remove Repository from favorites
repositoryRoutes.post(
  "/favorite",
  verifyToken,
  (req: Request, res: Response) => {
    const body = req.body;
    const { repositoryID } = body;
    const userID = req.user._id;

    Repository.findById(repositoryID).then(async (repositoryDB) => {
      if (repositoryDB) {
        await User.findById(userID).then(async (user) => {
          if (!user) {
            return res.json({
              ok: false,
              message: "User not found",
            });
          } else {
            if (user.savedRepositories.includes(repositoryID)) {
              user.savedRepositories.pull(repositoryID);
              await user.save();

              const userToken = Token.getJwtToken({
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
            } else {
              user.savedRepositories.push(repositoryID);
              await user.save();
              const userToken = Token.getJwtToken({
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
        });
      }
    });
  }
);

//get repositories by user id
repositoryRoutes.get(
  "/user/:id",
  verifyToken,
  (req: Request, res: Response) => {
    const id = req.params.id;

    User.findById(id)
      .populate("savedRepositories")
      .populate("createdRepositories")
      .then((userDB) => {
        if (!userDB) {
          return res.json({
            ok: false,
            message: "User not found",
          });
        } else {
          res.json({
            ok: true,
            user: userDB,
          });
        }
      });
  }
);

//get saved repositories by user id
repositoryRoutes.get(
  "/saved/favorites",
  verifyToken,
  (req: Request, res: Response) => {
    const id = req.user._id;

    User.findById(id)
      .populate("savedRepositories")
      .then((userDB) => {
        if (!userDB) {
          return res.json({
            ok: false,
            message: "User not found",
          });
        } else {
          res.json({
            ok: true,
            user: userDB,
          });
        }
      });
  }
);

export default repositoryRoutes;
