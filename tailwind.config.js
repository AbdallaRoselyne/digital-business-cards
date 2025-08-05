module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#C8DB00',
          secondary: '#000000',
        },
      },
      animation: {
        'rotate-y-180': 'rotate-y-180 0.6s ease-in-out',
      },
      keyframes: {
        'rotate-y-180': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}