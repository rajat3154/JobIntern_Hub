import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const OtherUser = ({ user }) => {
  const { selectedUser } = useSelector((store) => store.auth);

  return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePhoto} alt={user.fullName} />
          <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div>
        <h3 className="font-semibold text-white">{user.fullName}</h3>
        <p className="text-sm text-gray-400">{user.role}</p>
      </div>
    </div>
  );
};

export default OtherUser;
