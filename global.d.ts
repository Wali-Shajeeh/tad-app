declare module '*.ttf' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: number;
  export default value;
}

declare module 'react-native-icon-badge' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconBadge: any;
  export default IconBadge;
}
