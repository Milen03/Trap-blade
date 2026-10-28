// Червено каре с грешка под формата. Ако няма съобщение, не показва нищо.
function FormError({ message }) {
  if (!message) return null

  return (
    <p role="alert" className="border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </p>
  )
}

export default FormError
