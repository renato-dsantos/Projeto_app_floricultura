import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './pages/Home';
import FloresScreen from './pages/Produto_flores';
import ChocolatesScreen from './pages/Produto_chocolate';
import CestasScreen from './pages/Produto_cesta';
import CarrinhoScreen from './pages/pedido';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Flores" component={FloresScreen} />
        <Stack.Screen name="Chocolates" component={ChocolatesScreen} />
        <Stack.Screen name="Cestas" component={CestasScreen} />
        <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
