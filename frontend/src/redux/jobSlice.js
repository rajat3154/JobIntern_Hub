import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
      name: "job",
      initialState: {
            allJobs: [],
            allAdminJobs: [],
            singleJob: null,
            searchJobByText: "",
            allAppliedJobs: [],
            searchedQuery: "",
      },
      reducers: {
            setAllJobs: (state, action) => {
                  state.allJobs = action.payload;
            },
            setSingleJob: (state, action) => {
                  state.singleJob = action.payload;
            },
            setAllAdminJobs: (state, action) => {
                  state.allAdminJobs = action.payload;
            },
            setSearchJobByText: (state, action) => {
                  state.searchJobByText = action.payload;
            },
            setAllAppliedJobs: (state, action) => {
                  state.allAppliedJobs = action.payload;
            },
            setSearchedQuery: (state, action) => {
                  state.searchedQuery = action.payload;
            }
      },
});

// Export actions for use in components
export const { setAllJobs, setSingleJob, setAllAdminJobs, setSearchJobByText, setAllAppliedJobs, setSearchedQuery } =
      jobSlice.actions;

// Export the reducer to include in the Redux store
export default jobSlice.reducer;
