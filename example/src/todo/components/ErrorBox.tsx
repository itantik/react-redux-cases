import React from 'react';

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
};

export function ErrorBox({ children, onClose }: Props) {
  return (
    <div className={`error${onClose ? ' closable' : ''}`} onClick={() => onClose && onClose()}>
      {children}
    </div>
  );
}
