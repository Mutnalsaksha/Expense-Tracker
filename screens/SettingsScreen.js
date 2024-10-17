import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen'; // Import the Settings screen

const Stack = createStackNavigator();

function App() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} /> {/* Add the SettingsScreen */}
        </Stack.Navigator>
    );
}

export default App;
