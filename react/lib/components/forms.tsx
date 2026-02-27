import {
  forwardRef,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react"
import { cn } from "../utilities/cn"

/* ------------------------------------------------------------------ */
/*  Form                                                               */
/* ------------------------------------------------------------------ */

export const Form = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("l-ui-form", className)} {...props} />
  ),
)
Form.displayName = "Form"

/* ------------------------------------------------------------------ */
/*  FormGroup                                                          */
/* ------------------------------------------------------------------ */

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  largeGap?: boolean
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ largeGap, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        largeGap ? "l-ui-form__group--large-gap" : "l-ui-form__group",
        className,
      )}
      {...props}
    />
  ),
)
FormGroup.displayName = "FormGroup"

/* ------------------------------------------------------------------ */
/*  Label                                                              */
/* ------------------------------------------------------------------ */

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  checkbox?: boolean
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ checkbox, required, className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(checkbox ? "l-ui-label--checkbox" : "l-ui-label", className)}
      {...props}
    >
      {children}
      {required && <span className="l-ui-form__required"> *</span>}
    </label>
  ),
)
Label.displayName = "Label"

/* ------------------------------------------------------------------ */
/*  FormField (input)                                                  */
/* ------------------------------------------------------------------ */

export const FormField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("l-ui-form__field", className)} {...props} />
))
FormField.displayName = "FormField"

/* ------------------------------------------------------------------ */
/*  FormTextarea                                                       */
/* ------------------------------------------------------------------ */

export const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("l-ui-form__field", className)} {...props} />
))
FormTextarea.displayName = "FormTextarea"

/* ------------------------------------------------------------------ */
/*  FormHint                                                           */
/* ------------------------------------------------------------------ */

export const FormHint = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("l-ui-form__hint", className)} {...props} />
  ),
)
FormHint.displayName = "FormHint"

/* ------------------------------------------------------------------ */
/*  Select                                                             */
/* ------------------------------------------------------------------ */

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <div className="l-ui-select-wrapper">
    <select ref={ref} className={cn("l-ui-select", className)} {...props} />
  </div>
))
Select.displayName = "Select"

/* ------------------------------------------------------------------ */
/*  Checkbox                                                           */
/* ------------------------------------------------------------------ */

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => (
    <div className={cn("l-ui-container--checkbox", className)}>
      <input ref={ref} type="checkbox" id={id} {...props} />
      <label htmlFor={id} className="l-ui-label--checkbox">
        {label}
      </label>
    </div>
  ),
)
Checkbox.displayName = "Checkbox"

/* ------------------------------------------------------------------ */
/*  Switch                                                             */
/* ------------------------------------------------------------------ */

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, ...props }, ref) => (
    <label className={cn("l-ui-switch", className)} htmlFor={id}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={id}
        className="l-ui-switch__input"
        {...props}
      />
      <span className="l-ui-switch__track" />
      {label}
    </label>
  ),
)
Switch.displayName = "Switch"

/* ------------------------------------------------------------------ */
/*  RadioGroup                                                         */
/* ------------------------------------------------------------------ */

export interface RadioOption {
  value: string
  label: string
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("l-ui-radio__group", className)} role="radiogroup">
      {options.map((option) => (
        <div key={option.value} className="l-ui-radio__item">
          <input
            type="radio"
            name={name}
            id={`${name}-${option.value}`}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            className="l-ui-radio__input"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="l-ui-radio__label"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}
