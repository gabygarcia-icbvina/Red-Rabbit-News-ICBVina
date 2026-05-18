import daisyui from 'daisyui'

export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        colegio: {
          'primary':          '#7f77dd',
          'primary-content':  '#cecbf6',
          'secondary':        '#1d9e75',
          'accent':           '#ef9f27',
          'neutral':          '#232220',
          'base-100':         '#1a1918',
          'base-200':         '#232220',
          'base-300':         '#2c2b29',
          'base-content':     '#e2e0d8',
          'error':            '#e24b4a',
        },
      },
    ],
  },
}