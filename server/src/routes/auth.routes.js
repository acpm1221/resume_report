const { Router } = require("express");
const authcontroller = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")

const authRouter = Router();



authRouter.post("/register", authcontroller.registerController);
authRouter.post("/login", authcontroller.loginController);
authRouter.get("/logout", authcontroller.logoutController)


authRouter.get("/profile", authMiddleware, authcontroller.profileController)

module.exports = authRouter;

