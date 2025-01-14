import { Button, StyleSheet, Text, View } from 'react-native'

const NewLaunchScreen = () => {
    return (
        <View style ={styles.container} >
            <Text>New Launch Screen</Text>
            <Button
                title='Home'
            />
        </View>
    )
}

export default DetailsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'center',
    },
});