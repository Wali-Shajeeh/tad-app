/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
const debug = (...messages: any[]): void => {
  if (process.env.NODE_ENV === 'production') return;
  console.log(...messages);
};

export default {
  debug,
};
