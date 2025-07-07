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

interface iconProps {
	icon: React.ComponentType<{ size: number; color: string }>;
	onPress: () => void;
	color: string;
}
