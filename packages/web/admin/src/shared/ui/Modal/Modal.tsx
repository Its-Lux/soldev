import { useEffect, useId, useRef, type ReactNode } from 'react'
import { FaTimes } from 'react-icons/fa'

export type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
}

/**
 * A modal dialog built on the native dialog element, so the browser provides
 * the focus trap, the Escape key, the top layer and an inert page behind it.
 * It is controlled: the caller owns `open` and decides what onClose does.
 * The content is only rendered while open, so a form inside starts fresh each
 * time.
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // The page behind should not scroll while the modal is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // Escape fires cancel. Stop the browser closing it itself, so `open`
      // stays the single source of truth.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // A click on the dialog element itself, not on its content, is a click
      // on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      // m-auto is needed because Tailwind's reset removes the dialog's margin.
      className={`m-auto w-full ${sizeClasses[size]} rounded-lg border border-border bg-background p-0 text-foreground backdrop:bg-black/40`}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FaTimes className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-y-auto px-4 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  )
}
