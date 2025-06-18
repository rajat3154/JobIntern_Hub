import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
      name: "message",
      initialState: {
            messages: [],
            loading: false,
            error: null
      },
      reducers: {
            setMessages: (state, action) => {
                  state.messages = Array.isArray(action.payload) ? action.payload : [];
                  state.loading = false;
                  state.error = null;
            },
            setLoading: (state) => {
                  state.loading = true;
            },
            setError: (state, action) => {
                  state.error = action.payload;
                  state.loading = false;
            }
      }
});

export const { setMessages, setLoading, setError } = messageSlice.actions;
export default messageSlice.reducer;