/* eslint-disable @typescript-eslint/no-explicit-any */
// context for general stuff

import React, { createContext, useContext, useRef, useState } from 'react';

type GeneralState = {
  registeredEmail: string;
  setRegisteredEmail: React.Dispatch<React.SetStateAction<string>>;
  drawer: React.MutableRefObject<any>;
};

export const GeneralContext = createContext<GeneralState | null>(null);

const GeneralContextProvider: React.FC<{ children: React.JSX.Element }> = ({
  children,
}) => {
  const [registeredEmail, setRegisteredEmail] = useState('');
  const drawer = useRef<any>(null);

  return (
    <GeneralContext.Provider
      value={{
        registeredEmail,
        setRegisteredEmail,
        drawer,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneral = (): GeneralState => {
  const general = useContext(GeneralContext);
  if (!general) {
    throw new Error("GeneralContext isn't initialized");
  }

  return general;
};

export default GeneralContextProvider;
