import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string; // ✅ optional
  href?: string;  // ✅ optional
};

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`rounded-2xl shadow-md ${className || ""}`}>
      {children}
    </div>
  );
};