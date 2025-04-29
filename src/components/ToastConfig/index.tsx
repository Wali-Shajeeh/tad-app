import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import type { ToastConfig, ToastShowParams } from 'react-native-toast-message';
import { styles } from './styles';


const toastConfig: ToastConfig = {
  success: (props: ToastShowParams) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props: ToastShowParams) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

export default toastConfig;
