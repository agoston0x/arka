import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        arka: {
          pink: '#E5007D',
          cyan: '#00AEEF',
          green: '#8DC63F',
          yellow: '#FFF200',
          orange: '#F7941D',
          red: '#ED1C24',
          purple: '#662D91',
          slate: '#5C6670',
          text: '#1a1a1a',
          card: '#f5f5f5'
        }
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.06)'
      },
      borderRadius: {
        card: '14px'
      }
    }
  },
  plugins: [],
};

export default config;
