/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm dark-grey chrome scale (New Order 5.3) — replaces zinc
        // (a neutral/cool grey) for all panel, rail, and app-shell surfaces.
        // Same 9-step lightness convention as Tailwind's default zinc scale
        // so every existing `zinc-NNN` class maps 1:1 to `charcoal-NNN`.
        charcoal: {
          50: '#f8f5f1',
          100: '#ece6de',
          200: '#d6cfc5',
          300: '#b3aba0',
          400: '#8f877d',
          500: '#6b645c',
          600: '#4d4740',
          700: '#3a3530',
          800: '#2b2723',
          900: '#201d1a',
          950: '#161412',
        },
        // Muted sage/spruce green — secondary accent only (section
        // underlines, hover tints, secondary highlights). Never a base
        // surface color.
        spruce: {
          50: '#f1f4f2',
          100: '#dee6e0',
          200: '#c0d0c4',
          300: '#93ac9b',
          400: '#6c8d76',
          500: '#4f6f58',
          600: '#3c5744',
          700: '#2c4234',
          800: '#1f2f25',
          900: '#16211a',
          950: '#0e1611',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
