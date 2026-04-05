// src/theme/colors.js
export const COLORS = {
	background: '#0F0F1A', // Deep dark purple/blue base
	surface: 'rgba(255, 255, 255, 0.05)', // Glassmorphism surface
	surfaceBorder: 'rgba(255, 255, 255, 0.1)', // Glass border
	primary: '#00F2FF', // Neon Cyan
	primaryGlow: 'rgba(0, 242, 255, 0.3)',
	secondary: '#FF007F', // Neon Pink/Magenta accent
	success: '#00FF85', // Soft Green for Inflow
	danger: '#FF4D4D', // Soft Red for Outflow
	textPrimary: '#FFFFFF',
	textSecondary: '#A0A0B0',
	cardGradient: ['rgba(30,30,50,0.8)', 'rgba(15,15,26,0.9)'],
};

export const GLASS_STYLE = {
	backgroundColor: COLORS.surface,
	borderColor: COLORS.surfaceBorder,
	borderWidth: 1,
	borderRadius: 16,
	overflow: 'hidden',
};
