import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'

// Visual only for now: submitting does nothing until the auth API is wired up.
function Register() {
  return (
    <AuthLayout
      title="Register"
      subtitle="Направи си профил в TrapBlade."
      width="max-w-xl"
      footer={
        <p className="flex items-center gap-3">
          Вече имаш профил?
          <Link to="/login" className="font-brand text-3xl text-ice hover:text-white">
            Login
          </Link>
        </p>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <AuthField id="firstName" label="Име" placeholder="Иван" autoComplete="given-name" />
          <AuthField id="lastName" label="Фамилия" placeholder="Петров" autoComplete="family-name" />
        </div>
        <AuthField id="email" label="Имейл" type="email" placeholder="ime@primer.bg" autoComplete="email" />
        <AuthField id="phone" label="Телефон" type="tel" placeholder="0888 123 456" autoComplete="tel" />
        <div className="grid gap-6 sm:grid-cols-2">
          <AuthField
            id="password"
            label="Парола"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            hint="Поне 6 символа"
            revealable
          />
          <AuthField
            id="rePassword"
            label="Повтори паролата"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-white/80">
          <input type="checkbox" name="terms" className="mt-0.5 h-5 w-5 shrink-0 accent-ice" />
          <span>
            Съгласен съм с{' '}
            <a href="#" className="font-semibold text-white underline underline-offset-4 hover:text-ice">
              общите условия
            </a>{' '}
            и с обработката на данните ми за записване на часове.
          </span>
        </label>

        <button
          type="submit"
          className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white"
        >
          Register
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
