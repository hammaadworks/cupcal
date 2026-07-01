import * as React from "react"
import { motion } from "framer-motion"

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  repeat?: number
  duration?: number
  fontSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  strokeWidth?: string
  color?: string
}

const fontSizeClasses = {
  sm: "text-5xl sm:text-6xl md:text-7xl",
  md: "text-6xl sm:text-7xl md:text-8xl",
  lg: "text-7xl sm:text-8xl md:text-9xl",
  xl: "text-8xl sm:text-9xl md:text-[10rem]",
  "2xl": "text-9xl sm:text-[10rem] md:text-[11rem]",
  "3xl": "text-[10rem] sm:text-[11rem] md:text-[12rem]",
}

export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  ({
    className,
    text,
    repeat = 6,
    duration = 20,
    fontSize = "lg",
    strokeWidth = "2px",
    color = "var(--color-gunmetal)",
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden py-4",
          className
        )}
        {...props}
      >
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ 
            x: ["0%", "-50%"]
          }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration,
          }}
        >
          {[...Array(repeat)].map((_, index) => (
            <div key={index} className="flex items-center mx-4">
              <span
                className={cn(
                  fontSizeClasses[fontSize],
                  "font-heading font-black text-transparent px-4 tracking-tighter"
                )}
                style={{
                  WebkitTextStroke: `${strokeWidth} ${color}`,
                }}
              >
                {text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    )
  }
)

Marquee.displayName = "Marquee"
