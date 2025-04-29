// import { configureStore } from '@reduxjs/toolkit';
// import rootReducer from './reducers';

// // Define the type for the root state (based on rootReducer)
// export type RootState = ReturnType<typeof rootReducer>;

// // Define middleware array with proper typing
// // Configure the store
// const store = configureStore({
//   reducer: rootReducer,
// });

// // Export the store's dispatch type for use in the app
// export type AppDispatch = typeof store.dispatch;
// export type AppState = ReturnType<typeof store.getState>;

// export default store;

// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export type RootState = ReturnType<typeof rootReducer>;

// const logger = (store: any) => (next: any) => (action: any) => {
//   console.log('Dispatching action:', action);
//   return next(action);
// };

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([]),
});

export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;

export default store;
