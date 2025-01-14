import { Button, StyleSheet, Text, View } from 'react-native'

const HomeScreen = () => {
    return (
        <View style ={styles.container} >
            <Text>Home Screen</Text>
            <Button
                title='New Launch'
            />
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'center',
    },
});