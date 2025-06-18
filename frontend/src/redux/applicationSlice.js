import { createSlice } from "@reduxjs/toolkit";

const applicationSLice = createSlice({
      name: 'application',
      initialState: {
            applicants: [],
      },
      reducers: {
            setAllApplicants: (state, action) => {
                  state.applicants = action.payload;
            }
      }
});
export const { setAllApplicants } = applicationSLice.actions;
export default applicationSLice.reducer;