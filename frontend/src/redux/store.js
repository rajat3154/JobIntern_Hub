import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import internshipSlice from "./internshipSlice";
import {
      persistStore,
      persistReducer,
      FLUSH,
      REHYDRATE,
      PAUSE,
      PERSIST,
      PURGE,
      REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; 

import messageReducer from "./messageSlice.js";
import socketReducer from "./socketSlice.js";
const persistConfig = {
      key: "root",
      version: 1,
      storage,
};


const rootReducer = combineReducers({
      auth: authSlice,
      job: jobSlice,
      internship:internshipSlice,
      message: messageReducer,
      socket:socketReducer
});


const persistedReducer = persistReducer(persistConfig, rootReducer);


const store = configureStore({
      reducer: persistedReducer,
      middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                  serializableCheck: {
                        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                  },
            }),
});

export const persistor = persistStore(store);
export default store;
