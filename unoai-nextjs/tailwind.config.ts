import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/features/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		colors: {
			white: '#FFFFFF',
			black: '#000000',
			error: '#ff3333',
			red10: '#F3D8DC',
			red50: '#FEF2F2',
			red100: '#FEE2E2',
			red300: '#FCA5A5',
			red500: '#EF4444',
			red900: '#7F1D1D',
			green50: '#F0FFF6',
			green100: '#CCFFE1',
			green500: '#33FF85',
			green600: '#00E05A',
			green800: '#00522A',
			green900: '#003D1C',
		},
		screens: {
			xxs: '370px',
			xs: '400px',
			sm: '767px',
			md: '960px',
			lg: '1150px',
			lger: '1250px',
			xl: '1440px',
			xxl: '1600px',
		},
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic':
					'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [],
};
export default config;
