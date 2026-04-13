// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        nunito:   ['var(--font-nunito)',   'Nunito',           'sans-serif'],
      },
      colors: {
        // Sullivan brand — drawn from Sullivan Daze palette
        sullivan: {
          blue:       '#1565C0',
          'blue-mid': '#1E7DD4',
          'blue-lt':  '#4FA3E8',
          teal:       '#40BCD8',
          'teal-lt':  '#7AD5E8',
          green:      '#27A844',
          'green-lt': '#6DCF85',
          sun:        '#F5C843',
          'sun-lt':   '#FAE08A',
          navy:       '#0A2342',
          cream:      '#F8FAFF',
          'cream-dk': '#EAF0FA',
        },
      },
    },
  },
  plugins: [],
}
// end of file
