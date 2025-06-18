// useGetMessages.js
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setMessages } from "../../redux/messageSlice";
import { toast } from "sonner";

const useGetMessages = (selectedUserId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId) return;

      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/message/${selectedUserId}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        dispatch(setMessages([]));
      }
    };

    fetchMessages();
  }, [selectedUserId, dispatch]);
};

export default useGetMessages;
