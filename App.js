import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import { LanguageSelectionScreen } from './src/screens/LanguageSelectionScreen';
import { CharacterCreationScreen } from './src/screens/CharacterCreationScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddHabitScreen } from './src/screens/AddHabitScreen';
import { HabitDetailScreen } from './src/screens/HabitDetailScreen';
import { PlayerStatsScreen } from './src/screens/PlayerStatsScreen';

// Utils
import { RETRO_THEME } from './src/utils/theme';
import { translations } from './src/utils/translations';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator para as telas principais
function MainTabs() {
  const language = global.appLanguage || 'pt';
  const t = translations[language];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none',
        },
        tabBarActiveTintColor: RETRO_THEME.colors.accent,
        tabBarInactiveTintColor: RETRO_THEME.colors.textDark,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: t?.habits || 'Hábitos',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="StatsTab" 
        component={PlayerStatsScreen}
        options={{
          tabBarLabel: t?.stats || 'Status',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Language');

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Verifica se já tem idioma selecionado
      const language = await AsyncStorage.getItem('app_language');
      if (language) {
        global.appLanguage = language;
      }

      // Verifica se já criou personagem
      const playerData = await AsyncStorage.getItem('player');
      
      if (!language) {
        setInitialRoute('Language');
      } else if (!playerData) {
        setInitialRoute('CharacterCreation');
      } else {
        setInitialRoute('Main');
      }
    } catch (error) {
      console.error('Error checking app state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: RETRO_THEME.colors.background 
      }}>
        <ActivityIndicator size="large" color={RETRO_THEME.colors.accent} />
        <Text style={{ 
          color: RETRO_THEME.colors.text, 
          marginTop: 20,
          fontSize: 16 
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={RETRO_THEME.colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: RETRO_THEME.colors.background },
          }}
        >
          <Stack.Screen name="Language">
            {(props) => (
              <LanguageSelectionScreen
                {...props}
                onComplete={(lang) => {
                  global.appLanguage = lang;
                  props.navigation.replace('CharacterCreation');
                }}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="CharacterCreation">
            {(props) => (
              <CharacterCreationScreen
                {...props}
                onComplete={() => {
                  props.navigation.replace('Main');
                }}
              />
            )}
          </Stack.Screen>
          
          <Stack.Screen name="Main" component={MainTabs} />
          
          <Stack.Screen 
            name="AddHabit" 
            component={AddHabitScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              headerStyle: {
                backgroundColor: RETRO_THEME.colors.cardBackground,
              },
              headerTintColor: RETRO_THEME.colors.text,
              headerTitle: 'Novo Hábito',
            }}
          />
          
          <Stack.Screen 
            name="HabitDetail" 
            component={HabitDetailScreen}
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: RETRO_THEME.colors.cardBackground,
              },
              headerTintColor: RETRO_THEME.colors.text,
              headerTitle: 'Detalhes',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
