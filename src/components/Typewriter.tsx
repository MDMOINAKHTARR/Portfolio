import React from 'react';

type ElementType = 'div' | 'span' | 'p' | 'label' | 'h1' | 'h2' | 'h3';

export const Typewriter = ({ 
  children, 
  className = "",
  as = "div"
}: { 
  children: React.ReactNode, 
  delay?: number, 
  speed?: number,
  className?: string,
  as?: ElementType
}) => {
  const Component = as as React.ElementType;

  return (
    <Component className={className}>
      {children}
    </Component>
  );
};
