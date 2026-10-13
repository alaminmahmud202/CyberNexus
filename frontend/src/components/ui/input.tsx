"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, mono = false, label, error, helperText, icon, iconPosition = "left", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-surface-sunken px-4 py-3 text-body-md text-ink transition-all duration-200 placeholder:text-ink-faint",
              "input-focus",
              "hover:border-edge-strong",
              mono && "font-mono tracking-tight",
              error && "border-danger/50 focus:border-danger focus:ring-danger/20",
              icon ? (iconPosition === "left" ? "pl-11" : "pr-11") : undefined,
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 flex items-center gap-1.5 text-body-sm text-danger" role="alert">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-body-sm text-ink-faint">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono = false, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-2 block text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-xl border bg-surface-sunken px-4 py-3 text-body-md text-ink transition-all duration-200 placeholder:text-ink-faint resize-y min-h-[120px]",
            "input-focus",
            "hover:border-edge-strong",
            mono && "font-mono tracking-tight",
            error && "border-danger/50 focus:border-danger focus:ring-danger/20",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 flex items-center gap-1.5 text-body-sm text-danger" role="alert">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-body-sm text-ink-faint">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface FileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
  accept?: string;
  multiple?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, error, helperText, accept, multiple, id, ...props }, ref) => {
    const fileId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fileId} className="mb-2 block text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <label className="relative cursor-pointer">
          <input
            ref={ref}
            id={fileId}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${fileId}-error` : helperText ? `${fileId}-helper` : undefined}
            {...props}
          />
          <div className={cn(
            "flex items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-surface-sunken px-6 py-8 text-center transition-all duration-200",
            "hover:border-accent/50 hover:bg-accent/5",
            error && "border-danger/50 bg-danger/5",
            className
          )}>
            <svg className="h-8 w-8 text-ink-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-body-md text-ink">Drag & drop a file here, or click to select</p>
              <p className="text-body-sm text-ink-muted">Supports: {accept || "All file types"}</p>
            </div>
          </div>
        </label>
        {error && (
          <p id={`${fileId}-error`} className="mt-1.5 flex items-center gap-1.5 text-body-sm text-danger" role="alert">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${fileId}-helper`} className="mt-1.5 text-body-sm text-ink-faint">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";