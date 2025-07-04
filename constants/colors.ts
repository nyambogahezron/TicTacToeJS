const Colors = {
	lightTheme: {
		background: ['#f8fafc', '#f1f5f9', '#e2e8f0'] as const,
		text: '#0f172a',
		card: 'rgba(0, 0, 0, 0.05)',
		cardText: '#0f172a',
		cardSubtext: '#475569',
		border: 'rgba(0, 0, 0, 0.1)',
		primary: '#3b82f6',
	},

	darkTheme: {
		background: ['#0f172a', '#1e293b', '#334155'] as const,
		text: '#fff',
		card: 'rgba(255, 255, 255, 0.1)',
		cardText: '#fff',
		cardSubtext: '#94a3b8',
		border: 'rgba(255, 255, 255, 0.2)',
		primary: '#60a5fa',
	},
};

export default Colors;
