'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/authActions'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form 
        action={handleSubmit} 
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl border border-gray-100"
      >
        <h2 className="mb-6 text-2xl font-bold text-center text-black">تسجيل دخول المدير</h2>
        
        <div className="space-y-4">
          <input 
            name="email" 
            type="email" 
            required 
            placeholder="البريد الإلكتروني" 
            className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-primary"
          />
          <input 
            name="password" 
            type="password" 
            required 
            placeholder="كلمة المرور" 
            className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-primary"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

        <button 
          disabled={isLoading}
          className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "دخول"}
        </button>
      </form>
    </div>
  )
}
