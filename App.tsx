import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import BottomSheetContext from './src/context/bottomSheetContext';
import GeneralContextProvider from './src/context/generalContext';
import ThemeContext, { ThemeState } from './src/context/themeContext';

import Navigation from './src/navigation';
import store from './src/redux/store';
import Render from './src/Render';
import styles from './src/styles';


const App: React.FC<object> = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <ThemeContext>
          {({ currentBgColor }: ThemeState) => (
            <GeneralContextProvider>
              <BottomSheetContext>
                <Render Navigation={Navigation} />
                <StatusBar backgroundColor={currentBgColor} />
                <Toast />
              </BottomSheetContext>
            </GeneralContextProvider>
          )}
        </ThemeContext>
      </Provider>
    </GestureHandlerRootView>
  </SafeAreaProvider>
);

export default App;
