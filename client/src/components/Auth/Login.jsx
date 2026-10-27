import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout.jsx'
import AuthField from './AuthField.jsx'

// Visual only for now: submitting does nothing until the auth API is wired up.
function Login() {
  return (
    <AuthLayout
      title="Login"
      subtitle="Влез в профила си и запази стол."
      footer={
        <p className="flex items-center gap-3">
          Нямаш профил?
          <Link to="/register" className="font-brand text-3xl text-ice hover:text-white">
            Register
          </Link>
        </p>
      }
    >
      <form onSubmit={(e) => e.preventDefault()} className="mt-10 space-y-8">
        <AuthField id="email" label="Имейл" type="email" placeholder="ime@primer.bg" autoComplete="email" />
        <AuthField
          id="password"
          label="Парола"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          revealable
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-3 text-white/80">
            <input type="checkbox" name="remember" className="h-5 w-5 accent-ice" />
            Запомни ме
          </label>
          <a href="#" className="text-white/70 underline underline-offset-4 hover:text-ice">
            Забравена парола?
          </a>
        </div>

        <button
          type="submit"
          className="h-16 w-full bg-ice font-brand text-4xl text-ink transition-colors hover:bg-white"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
