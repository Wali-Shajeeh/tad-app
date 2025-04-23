/* eslint-disable @typescript-eslint/explicit-function-return-type */
// context for bottom sheets

import React, { createContext, useContext, useRef } from 'react';

interface RBSheetRef {
  /**
   * The method to open bottom sheet.
   */
  open: () => void;

  /**
   * The method to close bottom sheet.
   */
  close: () => void;
}

type BottomSheetState = {
  refRBSheetForAddress: React.MutableRefObject<RBSheetRef | null>;
  refRBSheetForEditAddress: React.MutableRefObject<RBSheetRef | null>;
  refRBSheetForCart: React.MutableRefObject<RBSheetRef | null>;
};

export const BottomSheet = createContext<BottomSheetState | null>(null);

const BottomSheetContext: React.FC<React.PropsWithChildren<object>> = ({
  children,
}) => {
  const refRBSheetForAddress = useRef<RBSheetRef | null>(null);
  const refRBSheetForEditAddress = useRef<RBSheetRef | null>(null);
  const refRBSheetForCart = useRef<RBSheetRef | null>(null);
  return (
    <BottomSheet.Provider
      value={{
        refRBSheetForAddress,
        refRBSheetForEditAddress,
        refRBSheetForCart,
      }}
    >
      {children}
    </BottomSheet.Provider>
  );
};

export const useMyBottomSheet = () => {
  const bottomSheet = useContext(BottomSheet);
  if (!bottomSheet) {
    throw new Error("BottomSheetContext isn't initialized");
  }

  return bottomSheet;
};

export default BottomSheetContext;
