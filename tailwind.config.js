// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blue Colors
        'blue-1': '#cdfafa',
        'blue-2': '#0ac8b9',
        'blue-3': '#0397ab',
        'blue-4': '#005a82',
        'blue-5': 'rgb(10, 50, 60)',
        'blue-6': '#091428',
        'blue-7': '#0a1428',

        // Red Colors
        'red-1': '#facdcd',
        'red-2': '#b90a0a',
        'red-3': '#ab0303',
        'red-4': '#820000',
        'red-5': 'rgb(60, 10, 10)',
        'red-6': '#280909',
        'red-7': '#140a0a',

        // Gold Colors
        'gold-1': '#f0e6d2',
        'gold-2': '#c8aa6e',
        'gold-3': '#c8aa6e',
        'gold-4': '#c89b3c',
        'gold-5': '#785a28',
        'gold-6': '#463714',
        'gold-7': '#32281e',

        // Grey Colors
        'grey-1': '#a09b8c',
        'grey-1-5': '#5b5a56',
        'grey-2': '#3c3c41',
        'grey-3': '#1e2328',
        'grey-cool': '#1e282d',
        'hextech-black': '#010a13',

        // Custom Dark Background
        'custom-dark': '#091014',
      },
      backgroundImage: {
        'custom-dark-gradient': 'linear-gradient(to right, #091014, #091014)',
      },
    },
  },
  plugins: [],
};
