import type { ButtonHTMLAttributes } from "react";
import "./ui.css";

type Variant = "primary" | "accent" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const variantClass = `btn-${variant}`;
  return <button className={["btn", variantClass, className].filter(Boolean).join(" ")} {...rest} />;
}
