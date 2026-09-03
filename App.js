import { StyleSheet, Text, View } from 'react-native';
import { Button, ImageBackground, TextInput } from 'react-native-web';

export default function App() {
  return (
    <View style={styles.container}>
      <ImageBackground source={require('./assets/img.jpg')} style={styles.backgroundImage} imageStyle={{opacity: 0.3}}>
      <Text>Login</Text>
        <TextInput
            style={styles.input}
            placeholder="Digite o seu login..."
        />
        <Text>Senha</Text>
        <TextInput
            style={styles.input}
        />
        <View>
          <Button title="Acessar" color="green"/>
          <Button title="Cancelar" color="blue" />
        </View>

      </ImageBackground>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 5,
    borderColor: '#000',
    marginBottom: 20,
  }, 
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
