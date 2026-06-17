import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { ComponentProps, forwardRef } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FormField({ label, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
