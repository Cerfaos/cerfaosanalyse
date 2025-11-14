type FormFieldProps = {
  label: string
  htmlFor: string
  helper?: string
  children: React.ReactNode
}

export function FormField({ label, htmlFor, helper, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-body">
        {label}
      </label>
      {children}
      {helper && <p className="text-xs text-text-muted">{helper}</p>}
    </div>
  )
}
