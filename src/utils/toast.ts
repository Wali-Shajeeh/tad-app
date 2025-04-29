import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';
interface ShowToastProps<TData> {
  type?: ToastType;
  title?: string;
  message: string;
  data?: TData;
  visibilityTime?: number;
}

export const showToast = <TData>({
  type = 'success',
  title,
  message,
  data,
  visibilityTime = 3000,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: ShowToastProps<TData>) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime,
    autoHide: true,
    swipeable: true,
    props: data,
  });
};
