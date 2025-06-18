import { createSlice } from "@reduxjs/toolkit";

const internshipSlice = createSlice({
      name: "internship",
      initialState: {
            allInternships: [],
            allAdminInternships: [],
            singleInternship: null,
            searchInternshipByText: "",
            allAppliedInternships: [],
            searchedQuery: "",
      },
      reducers: {
            setAllInternships: (state, action) => {
                  state.allInternships = action.payload;
            },
            setSingleInternship: (state, action) => {
                  state.singleInternship = action.payload;
            },
            setAllAdminInternships: (state, action) => {
                  state.allAdminInternships = action.payload;
            },
            setSearchInternshipByText: (state, action) => {
                  state.searchInternshipByText = action.payload;
            },
            setAppliedInternships: (state, action) => {
                  state.allAppliedInternships = action.payload;
            },
            setSearchedQuery: (state, action) => {
                  state.searchedQuery = action.payload;
            }
      },
});

// Export actions for use in components
export const { setAllInternships, setSingleInternship, setAllAdminInternships, setSearchInternshipByText, setAppliedInternships, setSearchedQuery } =
      internshipSlice.actions;

// Export the reducer to include in the Redux store
export default internshipSlice.reducer;
