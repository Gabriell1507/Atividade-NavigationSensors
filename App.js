import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Vibration, Animated, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Criação do Tab Navigator
const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');
const ALIGNMENT_THRESHOLD = 0.05; // Limite para detectar alinhamento
const CIRCLE_RADIUS = 100; // Raio do círculo do nível de bolha
const BUBBLE_RADIUS = 25; // Raio da bolinha

// Tela do Nível de Bolha
const BubbleLevelScreen = ({ route }) => {
  // Estado para armazenar os dados do acelerômetro
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState(null);
  const bubbleX = useRef(new Animated.Value(0)).current;
  const bubbleY = useRef(new Animated.Value(0)).current;

  // Recebe a cor da bolinha das configurações
  const bubbleColor = route.params?.bubbleColor || 'blue';

  // Função para assinar o listener do acelerômetro
  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        console.log('Acelerômetro:', accelerometerData); // Log dos dados do acelerômetro
        setData(accelerometerData);
        checkAlignment(accelerometerData);
        moveBubble(accelerometerData);
      })
    );
    Accelerometer.setUpdateInterval(100); // Intervalo de atualização do acelerômetro
  };

  // Função para desassinar o listener do acelerômetro
  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // Função para verificar o alinhamento
  const checkAlignment = ({ x, y }) => {
    if (Math.abs(x) < ALIGNMENT_THRESHOLD && Math.abs(y) < ALIGNMENT_THRESHOLD) {
      Vibration.vibrate(); // Vibra quando alinhado
    }
  };

  // Função para mover a bolinha
  const moveBubble = ({ x, y }) => {
    let bubbleXPos = (x * width) / 2;
    let bubbleYPos = (y * height) / 2;
    const distance = Math.sqrt(bubbleXPos ** 2 + bubbleYPos ** 2);

    console.log('Posições calculadas:', { bubbleXPos, bubbleYPos, distance }); // Log das posições calculadas

    if (distance > CIRCLE_RADIUS - BUBBLE_RADIUS) {
      const angle = Math.atan2(bubbleYPos, bubbleXPos);
      bubbleXPos = (CIRCLE_RADIUS - BUBBLE_RADIUS) * Math.cos(angle);
      bubbleYPos = (CIRCLE_RADIUS - BUBBLE_RADIUS) * Math.sin(angle);
      console.log('Posições ajustadas:', { bubbleXPos, bubbleYPos }); // Log das posições ajustadas
    }

    Animated.spring(bubbleX, {
      toValue: bubbleXPos,
      useNativeDriver: true,
    }).start();

    Animated.spring(bubbleY, {
      toValue: bubbleYPos,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.level}>
        <Animated.View style={[styles.bubble, { backgroundColor: bubbleColor, transform: [{ translateX: bubbleX }, { translateY: bubbleY }] }]} />
      </View>
      <Text style={styles.text}>X: {data.x.toFixed(2)}</Text>
      <Text style={styles.text}>Y: {data.y.toFixed(2)}</Text>
    </View>
  );
};

// Tela de Configurações
const SettingsScreen = ({ navigation }) => {
  const [bubbleColor, setBubbleColor] = useState('blue');

  // Lista de cores predefinidas
  const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange'];

  // Função para salvar as configurações e navegar de volta
  const handleSave = () => {
    navigation.navigate('Nível de Bolha', { bubbleColor });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Configurações Fictícias</Text>
      <Text style={styles.label}>Escolha a Cor da Bolinha:</Text>
      <View style={styles.colorContainer}>
        {colors.map(color => (
          <TouchableOpacity
            key={color}
            style={[styles.colorButton, { backgroundColor: color }, bubbleColor === color && styles.selectedColorButton]}
            onPress={() => setBubbleColor(color)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar Configurações</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>Gabriel Marcos</Text>
    </View>
  );
};

// Configuração do App
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Nível de Bolha') {
              iconName = focused ? 'water' : 'water-outline';
            } else if (route.name === 'Configurações') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Nível de Bolha" component={BubbleLevelScreen} />
        <Tab.Screen name="Configurações" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  level: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    width: BUBBLE_RADIUS * 2,
    height: BUBBLE_RADIUS * 2,
    borderRadius: BUBBLE_RADIUS,
    position: 'absolute',
  },
  text: {
    fontSize: 18,
    margin: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
  },
  selectedColorButton: {
    borderWidth: 3,
    borderColor: '#000',
  },
  saveButton: {
    backgroundColor: '#1EB1FC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    fontSize: 18,
    color: 'gray',
  },
});
