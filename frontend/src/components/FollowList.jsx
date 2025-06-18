import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Loader2, Users, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FollowList = ({ userId, userType }) => {
    const [activeTab, setActiveTab] = useState('followers');
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchData = async (type) => {
        if (!userId || !userType) return;

        setIsLoading(true);
        setError(null);
        try {
            const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);
            const response = await axios.get(
                `http://localhost:8000/api/v1/follow/${type}/${userId}/${capitalizedUserType}`,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true
                }
            );

            const users = response.data.data || [];
            type === 'followers' ? setFollowers(users) : setFollowing(users);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            setError(error.response?.data?.message || error.message);
            type === 'followers' ? setFollowers([]) : setFollowing([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, userId, userType]);

    const handleUserClick = (user) => {
        navigate(`/profile/${user.role.toLowerCase()}/${user._id}`);
    };

    const renderUserItem = (user) => (
        <motion.div
            key={user._id}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800/50 transition-colors cursor-pointer"
            onClick={() => handleUserClick(user)}
        >
            <Avatar className="h-8 w-8 border border-blue-500/20">
                <AvatarImage src={user.profile?.profilePhoto} />
                <AvatarFallback className="bg-gray-800 text-blue-400 text-xs">
                    {(user.fullname || user.companyname)?.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate">
                    {user.fullname || user.companyname}
                </h4>
                <p className="text-xs text-gray-400 truncate">
                    {user.role === 'Student' ? 'Student' : 'Recruiter'}
                </p>
            </div>
        </motion.div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-3 text-red-400 text-sm">
                    {error}
                </div>
            );
        }

        const users = activeTab === 'followers' ? followers : following;

        if (users.length === 0) {
            return (
                <div className="text-center p-3 text-gray-400 text-sm">
                    No {activeTab} found
                </div>
            );
        }

        return (
            <div className="space-y-1 max-h-60 overflow-y-auto pr-2">
                {users.map(user => renderUserItem(user))}
            </div>
        );
    };

    if (!userId || !userType) return null;

    return (
        <div className="space-y-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 h-9">
                    <TabsTrigger
                        value="followers"
                        className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-xs"
                    >
                        <Users className="h-3 w-3 mr-1" />
                        Followers
                    </TabsTrigger>
                    <TabsTrigger
                        value="following"
                        className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-xs"
                    >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Following
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            <Card className="bg-gray-900/50 border border-gray-800">
                <CardContent className="p-2">
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
};

export default FollowList;