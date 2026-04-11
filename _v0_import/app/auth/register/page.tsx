"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Phone, Lock, User, AlertCircle, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface FormErrors {
  name?: string
  phone?: string
  password?: string
  confirmPassword?: string
  terms?: string
  general?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const passwordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { score, label: 'Juda zaif', color: 'bg-destructive' }
    if (score === 2) return { score, label: 'Zaif', color: 'bg-gold' }
    if (score === 3) return { score, label: "O'rtacha", color: 'bg-gold' }
    if (score === 4) return { score, label: 'Kuchli', color: 'bg-green' }
    return { score, label: 'Juda kuchli', color: 'bg-green' }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Ismingizni kiriting'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ism kamida 2 ta harfdan iborat bo\'lishi kerak'
    }

    if (!formData.phone) {
      newErrors.phone = 'Telefon raqam kiriting'
    } else if (!/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Noto\'g\'ri format. Masalan: +998 90 123 45 67'
    }

    if (!formData.password) {
      newErrors.password = 'Parol kiriting'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Parolni tasdiqlang'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmadi'
    }

    if (!formData.terms) {
      newErrors.terms = 'Foydalanish shartlariga rozilik bildiring'
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
      // On success, redirect to login
      router.push('/auth/login')
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
    
    setFormData(prev => ({ ...prev, phone: value.trim() }))
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
  }

  const strength = passwordStrength(formData.password)

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl p-6 sm:p-8" style={{ boxShadow: 'var(--shadow)' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Ro&apos;yxatdan o&apos;tish</h1>
          <p className="text-sm text-muted-foreground">
            Yangi hisob yaratish uchun ma&apos;lumotlaringizni kiriting
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
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Ismingiz</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Ism Familiya"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                }}
                className={cn(
                  'pl-10',
                  errors.name && 'border-destructive focus-visible:ring-destructive'
                )}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqam</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={formData.phone}
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

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Parol</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Kamida 6 ta belgi"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }))
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
                }}
                className={cn(
                  'pl-10 pr-10',
                  errors.password && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        i < strength.score ? strength.color : 'bg-secondary'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Kuchlilik: {strength.label}</p>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Parolni tasdiqlang</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Parolni qayta kiriting"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }}
                className={cn(
                  'pl-10 pr-10',
                  errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Check className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-green" />
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, terms: checked as boolean }))
                  if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }))
                }}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                <Link href="/terms" className="text-primary hover:underline">Foydalanish shartlari</Link>
                {' '}va{' '}
                <Link href="/privacy" className="text-primary hover:underline">Maxfiylik siyosati</Link>
                ga roziman
              </Label>
            </div>
            {errors.terms && (
              <p className="text-xs text-destructive">{errors.terms}</p>
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
                Ro&apos;yxatdan o&apos;tilmoqda...
              </>
            ) : (
              'Ro\'yxatdan o\'tish'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">yoki</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Facebook
          </Button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Hisobingiz bormi?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  )
}
