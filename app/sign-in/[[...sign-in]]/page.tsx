import { SignIn } from '@clerk/nextjs'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your GlobalPayrollExpert account.',
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your GlobalPayrollExpert account</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-400',
              socialButtonsBlockButton: 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-slate-700',
              dividerText: 'text-slate-500',
              formFieldLabel: 'text-slate-300',
              formFieldInput: 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              footerActionText: 'text-slate-400',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-blue-400',
              formFieldInputShowPasswordButton: 'text-slate-400',
              alertText: 'text-red-400',
              formResendCodeLink: 'text-blue-400',
            },
          }}
        />
      </div>
    </main>
  )
}
