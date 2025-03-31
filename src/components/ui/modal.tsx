"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const modalVariants = cva(
  "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 sm:p-6",
  {
    variants: {
      position: {
        default: "",
        top: "items-start",
        bottom: "items-end",
      },
    },
    defaultVariants: {
      position: "default",
    },
  }
);

const modalContentVariants = cva(
  "bg-background rounded-lg shadow-lg w-full max-h-[90vh] overflow-auto p-6 relative",
  {
    variants: {
      size: {
        default: "max-w-md",
        sm: "max-w-sm",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        full: "max-w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants>,
    VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  hideCloseButton?: boolean;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      children,
      isOpen,
      onClose,
      position,
      size,
      hideCloseButton = false,
      ...props
    },
    ref
  ) => {
    // Close modal when pressing Escape
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "auto";
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div
        className={cn(modalVariants({ position }))}
        onClick={onClose}
        ref={ref}
        {...props}
      >
        <div
          className={cn(modalContentVariants({ size }), className)}
          onClick={(e) => e.stopPropagation()}
        >
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {children}
        </div>
      </div>
    );
  }
)

Modal.displayName = "Modal"; 