/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'], // Рекомендую добавить шрифт Nunito (как в Kahoot) или оставить системный
        comic: ['"Comic Sans MS"', '"Comic Sans"', 'cursive'], // Для игровых моментов
      },
      colors: {
        brand: {
          purple: '#4c1d95',      // Основной фиолетовый (bg-purple-900)
          'purple-light': '#6d28d9', // Для ховеров и акцентов (purple-700)
          'purple-subtle': '#ede9fe', // Бледно-фиолетовый (purple-100)

          yellow: '#facc15',      // Основной желтый (yellow-400)
          'yellow-hover': '#eab308', // Желтый при наведении (yellow-500)
          'yellow-shadow': '#ca8a04', // Тень для желтой кнопки
          'yellow-subtle': '#fef9c3', // Бледно-желтый (yellow-100)

          dark: '#1e1b4b',        // Основной текст (indigo-950)
          gray: '#64748b',        // Вторичный текст (slate-500)

          surface: '#f8fafc',     // Фон страниц (slate-50)
          input: '#f1f5f9',       // Фон инпутов (slate-100)

          green: '#45da0d',       // Успех
          red: '#ef4444',         // Ошибка
        }
      },
      borderRadius: {
        'quiz': '2.5rem',       // Карточки (40px)
        'quiz-lg': '3rem',      // Большие карточки
        'btn': '1rem',          // Кнопки и инпуты (16px / rounded-2xl)
      },
      boxShadow: {
        'btn-yellow': '0 6px 0 0 #ca8a04', // Тень желтой кнопки
        'btn-purple': '0 6px 0 0 #4c1d95', // Тень фиолетовой кнопки
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}