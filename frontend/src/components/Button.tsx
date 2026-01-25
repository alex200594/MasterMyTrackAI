import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const variantClasses = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
  ghost: 'bg-transparent hover:bg-slate-800 text-white'
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-semibold transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
