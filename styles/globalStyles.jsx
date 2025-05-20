import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    backgroundColor: '#E1D5B8',
  }, 
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E1D5B8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#738054', 
  },
  button: {
    backgroundColor: '#AA722A', 
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff', 
    fontSize: 16,
  },
});
