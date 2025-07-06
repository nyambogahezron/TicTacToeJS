import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useRef,
} from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [hapticEnabled, setHapticEnabled] = useState(true);
	const soundsRef = useRef<Record<string, Audio.Sound>>({});

	// Load settings from storage
	useEffect(() => {
		const loadSettings = async () => {
			try {
				const soundSetting = await AsyncStorage.getItem('soundEnabled');
				const hapticSetting = await AsyncStorage.getItem('hapticEnabled');

				if (soundSetting !== null) setSoundEnabled(JSON.parse(soundSetting));
				if (hapticSetting !== null) setHapticEnabled(JSON.parse(hapticSetting));
			} catch (error) {
				console.error('Error loading audio settings:', error);
			}
		};

		loadSettings();
	}, []);

	// Load sound effects with better memory management
	useEffect(() => {
		const loadSounds = async () => {
			try {
				// Set audio mode for better performance
				await Audio.setAudioModeAsync({
					allowsRecordingIOS: false,
					staysActiveInBackground: false,
					playsInSilentModeIOS: true,
					shouldDuckAndroid: true,
					playThroughEarpieceAndroid: false,
				});

				const soundFiles = {
					move: require('../assets/sounds/move.mp3'),
					win: require('../assets/sounds/win.mp3'),
					draw: require('../assets/sounds/draw.mp3'),
					reset: require('../assets/sounds/reset.mp3'),
				};

				const loadedSounds: Record<string, Audio.Sound> = {};

				for (const [key, file] of Object.entries(soundFiles)) {
					const { sound } = await Audio.Sound.createAsync(file, {
						shouldPlay: false,
						isLooping: false,
						volume: 0.5,
					});
					loadedSounds[key] = sound;
				}

				soundsRef.current = loadedSounds;
			} catch (error) {
				console.error('Error loading sounds:', error);
			}
		};

		loadSounds();
	}, []);

	useEffect(() => {
		return () => {
			// Cleanup sounds on unmount
			Object.values(soundsRef.current).forEach((sound) => {
				sound.unloadAsync().catch(console.error);
			});
		};
	}, []);

	const toggleSound = useCallback(async () => {
		const newValue = !soundEnabled;
		setSoundEnabled(newValue);
		try {
			await AsyncStorage.setItem('soundEnabled', JSON.stringify(newValue));
		} catch (error) {
			console.error('Error saving sound setting:', error);
		}
	}, [soundEnabled]);

	const toggleHaptic = useCallback(async () => {
		const newValue = !hapticEnabled;
		setHapticEnabled(newValue);
		try {
			await AsyncStorage.setItem('hapticEnabled', JSON.stringify(newValue));
		} catch (error) {
			console.error('Error saving haptic setting:', error);
		}
	}, [hapticEnabled]);

	const playSound = useCallback(
		async (type: 'move' | 'win' | 'draw' | 'reset') => {
			if (!soundEnabled || !soundsRef.current[type]) return;

			try {
				const sound = soundsRef.current[type];
				await sound.setPositionAsync(0);
				await sound.playAsync();
			} catch (error) {
				console.error('Error playing sound:', error);
			}
		},
		[soundEnabled]
	);

	const triggerHaptic = useCallback(
		async (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
			if (!hapticEnabled) return;

			try {
				switch (type) {
					case 'light':
						await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						break;
					case 'medium':
						await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
						break;
					case 'heavy':
						await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
						break;
					case 'success':
						await Haptics.notificationAsync(
							Haptics.NotificationFeedbackType.Success
						);
						break;
					case 'error':
						await Haptics.notificationAsync(
							Haptics.NotificationFeedbackType.Error
						);
						break;
				}
			} catch (error) {
				console.error('Error triggering haptic:', error);
			}
		},
		[hapticEnabled]
	);

	return (
		<AudioContext.Provider
			value={{
				soundEnabled,
				hapticEnabled,
				toggleSound,
				toggleHaptic,
				playSound,
				triggerHaptic,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export const useAudio = () => {
	const context = useContext(AudioContext);
	if (!context) {
		throw new Error('useAudio must be used within AudioProvider');
	}
	return context;
};
