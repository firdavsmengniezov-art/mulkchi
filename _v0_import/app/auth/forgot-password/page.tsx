"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Phone, AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormErrors {
  phone?: string
  general?: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!phone) {
      newErrors.phone = 'Telefon raqam kiriting'
    } else if (!/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Noto\'g\'ri format. Masalan: +998 90 123 45 67'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
    }, 1500)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, '')
    
    if (value.startsWith('+998')) {
      if (value.length > 4) {
        value = `+998 ${value.slice(4, 6)} ${value.slice(6, 9)} ${value.slice(9, 11)} ${value.slice(11, 13)}`
      }
    } else if (value.startsWith('998')) {
      value = `+${value}`
    } else if (value.length > 0 && !value.startsWith('+')) {
      value = `+998 ${value}`
    }
    
    setPhone(value.trim())
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl p-6 sm:p-8 text-center" style={{ boxShadow: 'var(--shadow)' }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green/10 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">SMS yuborildi!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {phone} raqamiga parolni tiklash uchun SMS yuborildi. Iltimos, xabaringizni tekshiring.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setIsSuccess(false)
                setPhone('')
              }}
              variant="outline"
              className="w-full"
            >
              Qayta yuborish
            </Button>
            <Link href="/auth/login">
              <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
                Kirishga qaytish
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl p-6 sm:p-8" style={{ boxShadow: 'var(--shadow)' }}>
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kirishga qaytish
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Parolni tiklash</h1>
          <p className="text-sm text-muted-foreground">
            Telefon raqamingizni kiriting va biz sizga parolni tiklash uchun SMS yuboramiz
          </p>
        </div>

        {/* Error Banner */}
        {errors.general && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={handlePhoneChange}
                className={cn(
                  'pl-10',
                  errors.phone && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              'SMS yuborish'
            )}
          </Button>
        </form>

        {/* Help Text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Telefon raqamingizni bilmaysizmi?{' '}
          <Link href="#" className="text-primary hover:underline">
            Yordam olish
          </Link>
        </p>
      </div>
    </div>
  )
}
