import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Enhanced Card Component with Multiple Variants
 * 
 * This component provides multiple card variants for different use cases:
 * - default: Standard shadcn/ui card styling
 * - gradient: Subtle gradient background for featured content
 * - interactive: Hover effects and cursor pointer for clickable cards
 * - elevated: Enhanced shadow for important content
 * 
 * All variants maintain proper accessibility and responsive design.
 */

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        // Default card with standard shadow
        default: "shadow-sm hover:shadow-md",
        
        // Gradient card with subtle background gradient
        gradient: "shadow-custom-md hover:shadow-custom-lg gradient-card",
        
        // Interactive card with hover effects for clickable content
        interactive: "shadow-sm hover:shadow-lg hover:scale-[1.02] cursor-pointer transform-gpu",
        
        // Elevated card with enhanced shadow for important content
        elevated: "shadow-custom-lg hover:shadow-xl border-2",
        
        // Accent card with brand-colored border
        accent: "shadow-custom-md hover:shadow-accent border-accent/20 bg-accent/5",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding }),
        hover && "hover:shadow-lg hover:scale-[1.01]",
        className
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

// Enhanced card variant types for better type safety
export type CardVariant = "default" | "gradient" | "interactive" | "elevated" | "accent";
export type CardPadding = "none" | "sm" | "default" | "lg";

// Utility function for card variant selection based on context
export const getCardVariantForContext = (context: "standard" | "featured" | "clickable" | "important" | "highlight"): CardVariant => {
  switch (context) {
    case "standard":
      return "default";
    case "featured":
      return "gradient";
    case "clickable":
      return "interactive";
    case "important":
      return "elevated";
    case "highlight":
      return "accent";
    default:
      return "default";
  }
};

// Utility function to determine if card should have interactive behavior
export const shouldCardBeInteractive = (variant: CardVariant): boolean => {
  return variant === "interactive";
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
