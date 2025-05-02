import { FC, PropsWithChildren, useRef } from 'react';

type TooltipProps = PropsWithChildren<{
  left?: boolean;
}>;

export const Tooltip: FC<TooltipProps> = ({ left, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`absolute text-nowrap text-gray-200 text-sm ${left ? `right-0` : `-translate-x-1/2 left-1/2`} bottom-full bg-black pt-1 pb-1 pl-3 pr-3 rounded-md mb-2`}
      ref={ref}
    >
      {children}
    </div>
  );
};
