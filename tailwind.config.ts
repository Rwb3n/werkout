import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // Add paths to all of your template files here
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Adjusted for src directory and mdx
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Adjusted for src directory and mdx
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Adjusted for src directory and App Router
    // Add more paths here if needed
  ],
  theme: {
    extend: {
      screens: { // Added standard breakpoints
        'sm': '640px',
        // => @media (min-width: 640px) { ... }
 
        'md': '768px',
        // => @media (min-width: 768px) { ... }
 
        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }
 
        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }
 
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },
      // TODO: Define project-specific backgroundImage if needed
      // backgroundImage: {
      //   'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //   'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
      colors: {
        // TODO: Define primary, secondary, accent, neutral colors based on design system
        primary: '#007bff', // Example primary color
        secondary: '#6c757d', // Example secondary color
        accent: '#17a2b8', // Example accent color
        neutral: {
          light: '#f8f9fa',
          DEFAULT: '#dee2e6',
          dark: '#343a40',
        },
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        // Added common names expected by libraries like shadcn/ui
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      spacing: {
        // TODO: Define custom spacing scale if needed (e.g., based on 4px or 8px grid)
      },
      fontFamily: {
        // TODO: Define custom font families (e.g., sans, serif, mono)
        // Example: sans: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        // TODO: Define custom font size scale if needed
      },
      borderRadius: {
        // Added common names expected by libraries like shadcn/ui
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        // Added common names expected by libraries like shadcn/ui
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        // Added common names expected by libraries like shadcn/ui
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // Add other theme extensions like boxShadow, etc.
    },
  },
  plugins: [
    // TODO: Add any Tailwind plugins (e.g., require("tailwindcss-animate"), @tailwindcss/forms, @tailwindcss/typography)
  ],
};

export default config; 