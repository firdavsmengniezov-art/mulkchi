/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Mulkchi Red (consistent branding)
        brand: {
          DEFAULT: '#E53935',
          50: '#FDEAEA',
          100: '#F9D2D0',
          200: '#F3A5A2',
          300: '#ED7874',
          400: '#E74B46',
          500: '#E53935',
          600: '#C41E1A',
          700: '#A31815',
          800: '#821210',
          900: '#610D0B',
        },
        // Secondary - Deep Blue
        secondary: {
          DEFAULT: '#1E3A5F',
          50: '#E8F0F8',
          100: '#D1E1F1',
          200: '#A3C3E3',
          300: '#75A5D5',
          400: '#4787C7',
          500: '#1E3A5F',
          600: '#18304F',
          700: '#12263F',
          800: '#0C1C2F',
          900: '#06121F',
        },
        // Neutral colors
        dark: {
          DEFAULT: '#1A1A1A',
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#1A1A1A',
        },
        // Gray for text
        gray: {
          DEFAULT: '#6B7280',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
