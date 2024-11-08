import { Router } from "express";
import { logoutUser, registerUser, loginUser } from "../controllers/user.controllers.js";
import multer from "multer";
import { user as jwt } from "../middlewares/auth.middleware.js";

const upload = multer({ dest: 'uploads/' });

const router = Router();

// Define routes
router.route("/register").post(upload.single('avatar'), registerUser);
router.route("/login").post(loginUser); // Add login route
router.route("/logout").post(jwt, logoutUser);
router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/cuurrent-user").get(verifyJWT,getCurrentuser,router.route("/update-account").patch())

export default router;
