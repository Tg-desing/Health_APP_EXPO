import React from "react";
import {
    GestureResponderEvent,
    Pressable,
    PressableProps,
    Text,
} from "react-native";
import { cn } from "../lib/utils";

// Variant / Size 타입 정의
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground",
  destructive: "bg-red-600 text-white",
  outline: "border border-gray-400 bg-white text-black",
  secondary: "bg-secondary text-secondary-foreground",
  ghost: "bg-transparent",
  link: "text-primary underline",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 py-1.5",
  lg: "h-12 px-6 py-3",
  icon: "h-10 w-10 items-center justify-center",
};

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}

export default function Button({
  children,
  variant = "default",
  size = "default",
  className,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex flex-row items-center justify-center rounded-md",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      <Text className="text-base font-medium">{children}</Text>
    </Pressable>
  );
}
