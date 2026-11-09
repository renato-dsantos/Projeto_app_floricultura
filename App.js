import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './pages/Login';
import CadastroScreen from './pages/Cadastro';
import AdminScreen from './pages/Admin';
import PerfilScreen from './pages/Perfil';
import CheckoutScreen from './pages/Checkout';
import MeusPedidosScreen from './pages/MeusPedidos';
import AdminProdutoNovoScreen from './pages/AdminProdutoNovo';
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
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="AdminProdutoNovo" component={AdminProdutoNovoScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Flores" component={FloresScreen} />
        <Stack.Screen name="Chocolates" component={ChocolatesScreen} />
        <Stack.Screen name="Cestas" component={CestasScreen} />
        <Stack.Screen name="Carrinho" component={CarrinhoScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="MeusPedidos" component={MeusPedidosScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
