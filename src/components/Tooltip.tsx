import { FC, PropsWithChildren, useRef } from "react";

export const Tooltip: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`absolute text-nowrap text-gray-200 text-sm -translate-x-1/2 left-1/2 bottom-full bg-black pt-1 pb-1 pl-3 pr-3 rounded-md mb-2`}
      ref={ref}
    >
      {children}
    </div>
  );
};
