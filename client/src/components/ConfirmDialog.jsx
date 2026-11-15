import { useEffect, useRef } from 'react'
import { primaryButton, secondaryButton } from './Panel/ui.js'

// Прозорец "Сигурен ли си?" преди важна промяна (телефон, парола).
// Нативен <dialog>: фокусът остава вътре, Esc затваря (= "Откажи").
// Показва се, докато е в страницата — родителят решава кога да го сложи.
function ConfirmDialog({ title, children, confirmLabel = 'Да, смени', busy = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      // Esc: не затваряме сами, а през onCancel (родителят маха прозореца).
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
      className="m-auto h-fit w-[calc(100%-2rem)] max-w-md border border-line bg-ink p-0 text-white backdrop:bg-black/75"
    >
      <div className="space-y-5 p-6">
        <h2 id="confirm-title" className="text-2xl font-bold uppercase leading-tight">
          {title}
        </h2>
        <div className="text-white/75">{children}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} disabled={busy} className={secondaryButton}>
            Откажи
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={primaryButton}>
            {busy ? 'Запазвам…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
