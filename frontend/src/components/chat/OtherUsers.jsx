import React from "react";

import useGetOtherUsers from "../hooks/useGetOtherUsers";
import { useSelector } from "react-redux";
import OtherUser from "./OtherUser";


const OtherUsers = () => {
  // my custom hook
  useGetOtherUsers();
  const { otherUsers } = useSelector((store) => store.auth);
  if (!otherUsers) return; // early return in react

  return (
    <div className="overflow-auto flex-1">
      {otherUsers?.map((user) => {
        return <OtherUser key={user._id} user={user} />;
      })}
    </div>
  );
};

export default OtherUsers;
