import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function Loader({ children }: Props) {
  return <div className="loader">{children}</div>;
}
