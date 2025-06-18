import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtherUsers } from "../../redux/authSlice";

import { toast } from "react-toastify";
import {
  RECRUITER_API_END_POINT,
  STUDENT_API_END_POINT,
} from "@/utils/constant";

const useGetOtherUsers = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth); // ✅ Get logged-in user

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const [studentsRes, recruitersRes] = await Promise.all([
          fetch(`${STUDENT_API_END_POINT}/students`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
          fetch(`${RECRUITER_API_END_POINT}/recruiters`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }),
        ]);

        const studentsData = await studentsRes.json();
        const recruitersData = await recruitersRes.json();

        if (!studentsRes.ok)
          throw new Error(studentsData.message || "Failed to fetch students");
        if (!recruitersRes.ok)
          throw new Error(
            recruitersData.message || "Failed to fetch recruiters"
          );

        if (studentsData.success && recruitersData.success) {
          // ✅ Filter out logged-in user from both lists
          const filteredStudents =
            studentsData.students?.filter((s) => s._id !== authUser?._id) || [];
          const filteredRecruiters =
            recruitersData.recruiters?.filter((r) => r._id !== authUser?._id) ||
            [];

          const combinedUsers = [...filteredStudents, ...filteredRecruiters];

          // ✅ Save to Redux
          dispatch(setOtherUsers(combinedUsers));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      }
    };

    if (authUser?._id) {
      fetchAllUsers();
    }
  }, [dispatch, authUser]);
};

export default useGetOtherUsers;
