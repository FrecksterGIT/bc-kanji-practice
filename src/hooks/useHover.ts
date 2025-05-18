import { RefObject, useEffect, useState } from 'react';

export const useHover = (ref: RefObject<HTMLElement | null>) => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    const over = () => setActive(true);
    const out = () => setActive(false);
    element.addEventListener('mousemove', over);
    element.addEventListener('mouseleave', out);

    return () => {
      element.removeEventListener('mousemove', over);
      element.removeEventListener('mouseleave', out);
    };
  }, [ref]);

  return active;
};
