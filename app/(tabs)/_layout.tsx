import { Tabs } from 'expo-router';
import { Gamepad2, Settings, Trophy } from 'lucide-react-native';

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					borderWidth: 0,
					borderTopWidth: 0,
					borderTopColor: 'transparent',
					shadowColor: 'transparent',
					backgroundColor: '#334155',
					paddingBottom: 90,
					paddingTop: 8,
					height: 70,
				},
				tabBarActiveTintColor: '#60a5fa',
				tabBarInactiveTintColor: '#666',
				tabBarLabelStyle: {
					fontFamily: 'Inter-SemiBold',
					fontSize: 12,
				},
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Game',
					tabBarIcon: ({ size, color }) => (
						<Gamepad2 size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='stats'
				options={{
					title: 'Stats',
					tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name='settings'
				options={{
					title: 'Settings',
					tabBarIcon: ({ size, color }) => (
						<Settings size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
