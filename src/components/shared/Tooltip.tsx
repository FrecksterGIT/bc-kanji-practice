import { FC, PropsWithChildren, useRef } from 'react';

type TooltipProps = PropsWithChildren<{
  left?: boolean;
}>;

export const Tooltip: FC<TooltipProps> = ({ left, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`absolute bottom-full mb-2 rounded-md bg-black pt-1 pr-3 pb-1 pl-3 text-sm text-nowrap text-gray-200 ${left ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
      ref={ref}
    >
      {children}
    </div>
  );
};
