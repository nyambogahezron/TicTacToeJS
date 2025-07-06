interface AudioContextType {
	soundEnabled: boolean;
	hapticEnabled: boolean;
	toggleSound: () => void;
	toggleHaptic: () => void;
	playSound: (type: 'move' | 'win' | 'draw' | 'reset') => Promise<void>;
	triggerHaptic: (
		type: 'light' | 'medium' | 'heavy' | 'success' | 'error'
	) => Promise<void>;
}
