'use client'

import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-foreground/60 mb-1.5 font-medium">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 bg-white border border-foreground/10 rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
