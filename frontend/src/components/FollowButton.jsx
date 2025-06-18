import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const FollowButton = ({ userId, userType, onFollowSuccess, className, size = "sm", onFollowCountChange }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!user || !userId) return;

            try {
                const userRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
                const response = await axios.get(
                    `http://localhost:8000/api/v1/follow/following/${user._id}/${userRole}`,
                    { headers: { "Content-Type": "application/json" }, withCredentials: true }
                );
                setIsFollowing(response.data.data?.some(follow => follow._id === userId));
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        };

        checkFollowStatus();
    }, [user, userId]);

    const handleFollow = async (e) => {
        e?.stopPropagation();
        if (!user) {
            toast.error('Please log in to follow users');
            return;
        }

        if (!userId || !userType) {
            toast.error('Invalid user data');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = isFollowing ? '/unfollow' : '/follow';
            const followerType = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            const followingType = userType.charAt(0).toUpperCase() + userType.slice(1);            const response = await axios.post(
                `http://localhost:8000/api/v1/follow${endpoint}`,
                {
                    followingId: userId,
                    followerType,
                    followingType
                },
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update follow status');
            }

            setIsFollowing(!isFollowing);
            toast.success(isFollowing 
                ? `Unfollowed ${response.data.data.userName} successfully` 
                : `Followed ${response.data.data.userName} successfully`);
            
            // Call the callback to update follower count
            if (onFollowCountChange) {
                onFollowCountChange(!isFollowing);
            }
            
            onFollowSuccess?.();
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error(error.response?.data?.message || 'Failed to update follow status');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button
                onClick={handleFollow}
                disabled={isLoading}
                variant={isFollowing ? "outline" : "default"}
                size={size}
                className={`${className} ${isFollowing
                        ? 'text-blue-400 border-blue-400 hover:bg-blue-400/10'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    } transition-all`}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                    <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Following
                    </>
                ) : (
                    <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                    </>
                )}
            </Button>
        </motion.div>
    );
};

export default FollowButton;