import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  appName?: string; 
};

export const Button = ({ children, className }: ButtonProps) => {
  return (
    <button className={`rounded-xl px-4 py-2 ${className || ""}`}>
      {children}
    </button>
  );
};