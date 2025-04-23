import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

// Define the type for the root state (based on rootReducer)
export type RootState = ReturnType<typeof rootReducer>;

// Define middleware array with proper typing
// Configure the store
const store = configureStore({
  reducer: rootReducer,
});

// Export the store's dispatch type for use in the app
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

export default store;
