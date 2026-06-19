import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2
      className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`}
    />
  );
}
