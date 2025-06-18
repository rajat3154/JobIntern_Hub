import { Student } from "../models/student.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/Notification.js";
import { io } from "../socket/socket.js";

export const followUser = async (req, res) => {
    try {        const { followingId, followingType } = req.body;
        const followerId = req.user._id; // Use authenticated user's ID instead of request body
        const followerType = req.user.role === 'student' ? 'Student' : 'Recruiter';
        
        console.log('Authenticated user:', req.user);
        console.log('Request body:', req.body);
          // Get logged-in user details based on their role
        const loggedInUser = await (req.user.role === 'student' ? Student : Recruiter).findById(followerId);
        if (!loggedInUser) {
            throw new ApiError(404, "Logged in user not found");
        }

        // Debug logging
        console.log('Follow request received:', { 
            followerId, 
            followingId, 
            followerType, 
            followingType,
            loggedInUserName: req.user.role === 'student' ? loggedInUser.fullname : loggedInUser.companyname 
        });

        // Validate input
        if (!followerId || !followingId || !followerType || !followingType) {
            throw new ApiError(400, "All fields are required");
        }        // Get follower and following models based on types
        const FollowerModel = req.user.role === 'student' ? Student : Recruiter;
        const FollowingModel = followingType === 'Student' ? Student : Recruiter;

        // Get user to follow
        const userToFollow = await FollowingModel.findById(followingId);
        if (!userToFollow) {
            throw new ApiError(404, "User to follow not found");
        }

        // Update follower's following list
        await FollowerModel.findByIdAndUpdate(
            followerId,
            {
                $addToSet: {
                    following: followingId,
                    followingType: followingType
                }
            }
        );

        // Update following user's followers list
        await FollowingModel.findByIdAndUpdate(
            followingId,
            {
                $addToSet: {
                    followers: followerId,
                    followersType: followerType
                }
            }
        );        // Create notification using logged-in user's name
        const loggedInUserName = req.user.role === 'student' ? loggedInUser.fullname : loggedInUser.companyname;
        const notification = await Notification.create({
            recipient: followingId,
            sender: followerId,
            senderModel: followerType,  // Using corrected followerType from earlier
            type: 'follow',
            title: 'New Follower',
            message: `${loggedInUserName} started following you`,
            read: false
        });

        // Debug log created notification
        console.log('Created notification:', { 
            ...notification.toObject(), 
            senderName: loggedInUserName 
        });

        // Populate the notification before emitting
        const populatedNotification = {
            ...notification.toObject(),
            sender: {
                _id: loggedInUser._id,
                fullname: loggedInUser.fullname,
                companyname: loggedInUser.companyname,
                profile: loggedInUser.profile,
                role: loggedInUser.role
            }
        };

        // Emit notification through socket if available
        const socketId = global.userSocketMap?.[followingId.toString()];
        if (socketId) {
            console.log('Emitting notification to socket:', { 
                socketId, 
                notification: populatedNotification 
            });
            io.to(socketId).emit('newNotification', populatedNotification);
        }

        return res.status(200).json(
            new ApiResponse(200, { 
                userName: userToFollow.fullname || userToFollow.companyname,
                notification: populatedNotification
            }, `Successfully followed ${userToFollow.fullname || userToFollow.companyname}`)
        );
    } catch (error) {
        console.error('Error in followUser:', error);
        throw new ApiError(500, error.message || "Error following user");
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const { followingId, followerType, followingType } = req.body;
        const followerId = req.user._id; // Use authenticated user's ID

        console.log('Unfollow request:', {
            followerId,
            followingId,
            followerType,
            followingType,
            authenticatedUser: req.user
        });

        // Validate input
        if (!followingId || !followerType || !followingType) {
            throw new ApiError(400, "All fields are required");
        }

        // Get follower and following models based on types
        const FollowerModel = followerType === 'Student' ? Student : Recruiter;
        const FollowingModel = followingType === 'Student' ? Student : Recruiter;

        // Get the user being unfollowed to get their name
        const userToUnfollow = await FollowingModel.findById(followingId);
        if (!userToUnfollow) {
            throw new ApiError(404, "User to unfollow not found");
        }

        // Update follower's following list
        await FollowerModel.findByIdAndUpdate(
            followerId,
            {
                $pull: {
                    following: followingId,
                    followingType: followingType
                }
            }
        );

        // Update following user's followers list
        await FollowingModel.findByIdAndUpdate(
            followingId,
            {
                $pull: {
                    followers: followerId,
                    followersType: followerType
                }
            }
        );

        return res.status(200).json(
            new ApiResponse(200, { 
                userName: userToUnfollow.fullname || userToUnfollow.companyname 
            }, `Successfully unfollowed ${userToUnfollow.fullname || userToUnfollow.companyname}`)
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error unfollowing user");
    }
};

export const getFollowers = async (req, res) => {
    try {
        const { userId, userType } = req.params;

        // Convert userType to proper case for model selection
        const Model = userType.toLowerCase() === 'student' ? Student : Recruiter;
        const user = await Model.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Fetch followers from both Student and Recruiter models
        const followerStudents = await Student.find({
            _id: { $in: user.followers || [] }
        }).select('fullname companyname profile.profilePhoto role');

        const followerRecruiters = await Recruiter.find({
            _id: { $in: user.followers || [] }
        }).select('fullname companyname profile.profilePhoto role');

        // Combine and format the results
        const followers = [
            ...followerStudents.map(student => ({
                ...student.toObject(),
                role: 'Student'
            })),
            ...followerRecruiters.map(recruiter => ({
                ...recruiter.toObject(),
                role: 'Recruiter'
            }))
        ];

        return res.status(200).json(
            new ApiResponse(200, followers, "Followers fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching followers");
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { userId, userType } = req.params;

        // Convert userType to proper case for model selection
        const Model = userType.toLowerCase() === 'student' ? Student : Recruiter;
        const user = await Model.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Fetch following users from both Student and Recruiter models
        const followingStudents = await Student.find({
            _id: { $in: user.following || [] }
        }).select('fullname companyname profile.profilePhoto role');

        const followingRecruiters = await Recruiter.find({
            _id: { $in: user.following || [] }
        }).select('fullname companyname profile.profilePhoto role');

        // Combine and format the results
        const following = [
            ...followingStudents.map(student => ({
                ...student.toObject(),
                role: 'Student'
            })),
            ...followingRecruiters.map(recruiter => ({
                ...recruiter.toObject(),
                role: 'Recruiter'
            }))
        ];

        return res.status(200).json(
            new ApiResponse(200, following, "Following users fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching following users");
    }
};