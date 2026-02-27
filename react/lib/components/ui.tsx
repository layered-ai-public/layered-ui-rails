import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ImgHTMLAttributes } from "react"
import { cn } from "../utilities/cn"
import { useTheme } from "../hooks/useTheme"
import { IconSun, IconMoon } from "../icons"

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */

export type ButtonVariant = "primary" | "outline" | "outline-danger" | "icon" | "mobile-navigation"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  full?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, full, className, ...props }, ref) => {
    const base = variant ? `l-ui-button--${variant}` : "l-ui-button"
    return (
      <button
        ref={ref}
        className={cn(base, full && "l-ui-button--full", className)}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

export type BadgeVariant = "default" | "success" | "warning" | "danger"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  rounded?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", rounded, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        `l-ui-badge--${variant}`,
        rounded && "l-ui-badge--rounded",
        className,
      )}
      {...props}
    />
  ),
)
Badge.displayName = "Badge"

/* ------------------------------------------------------------------ */
/*  Notice                                                             */
/* ------------------------------------------------------------------ */

export type NoticeVariant = "success" | "warning" | "error"

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  variant: NoticeVariant
}

export const Notice = forwardRef<HTMLDivElement, NoticeProps>(
  ({ variant, className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(`l-ui-notice--${variant}`, className)}
      {...props}
    />
  ),
)
Notice.displayName = "Notice"

/* ------------------------------------------------------------------ */
/*  Surface                                                            */
/* ------------------------------------------------------------------ */

export type SurfaceVariant = "default" | "active"

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = "default", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variant === "active" ? "l-ui-surface--active" : "l-ui-surface",
        className,
      )}
      {...props}
    />
  ),
)
Surface.displayName = "Surface"

/* ------------------------------------------------------------------ */
/*  Icon                                                               */
/* ------------------------------------------------------------------ */

export type IconSize = "sm" | "md" | "lg" | "xl"

export interface IconProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: IconSize
}

export const Icon = forwardRef<HTMLImageElement, IconProps>(
  ({ size = "sm", className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn(`l-ui-icon--${size}`, className)}
      aria-hidden="true"
      alt=""
      {...props}
    />
  ),
)
Icon.displayName = "Icon"

/* ------------------------------------------------------------------ */
/*  ThemeToggle                                                        */
/* ------------------------------------------------------------------ */

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      className={cn("l-ui-button--icon l-ui-theme-toggle", className)}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
    >
      <span className="l-ui-theme-toggle__icon--light" aria-hidden="true">
        <IconMoon width={20} height={20} />
      </span>
      <span className="l-ui-theme-toggle__icon--dark" aria-hidden="true">
        <IconSun width={20} height={20} />
      </span>
    </button>
  )
}
