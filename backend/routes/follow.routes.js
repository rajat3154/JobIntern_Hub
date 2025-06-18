import { Router } from "express";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/follow.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = Router();

// Protected routes
router.use(isAuthenticated);

router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.get("/followers/:userId/:userType", getFollowers);
router.get("/following/:userId/:userType", getFollowing);

export default router; 