import * as React from 'react';
import { Text, View, TextInput, Button, StyleSheet } from 'react-native';
import { useState, useEffect } from "react";
import SafeAreaView from 'react-native-safe-area-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";


const URL_KEY = "@storage_Key_url"
const USERNAME_KEY = "@storage_Key_username"
const PASSWORD_KEY = "@storage_Key_password"
const TIME_KEY = "@storage_Key_time"

export const Settings = props => {
    const [url, setUrl] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [time, setTime] = useState("");

    useEffect(async () => {
        const url = await AsyncStorage.getItem(URL_KEY);
        setUrl(url);
        const username = await AsyncStorage.getItem(USERNAME_KEY)
        setUserName(username);
        const password = await AsyncStorage.getItem(PASSWORD_KEY)
        setPassword(password);
        const time = await AsyncStorage.getItem(TIME_KEY)
        setTime(time);
    }, []);

    const storeData = async () => {
        await AsyncStorage.setItem(URL_KEY, url)
        await AsyncStorage.setItem(USERNAME_KEY, username)
        await AsyncStorage.setItem(PASSWORD_KEY, password)
        await AsyncStorage.setItem(TIME_KEY, time)
    }

    return (
        <View style={[styles.container]}>
            <View style={[styles.row]}>
                <Text style={[styles.description]}>URL adresa</Text>
                <TextInput style={[styles.input]} value={url} onChangeText={text => setUrl(text)}></TextInput>

            </View>

            <View style={[styles.row]}>
                <Text style={[styles.description]}>Uživatelské jméno</Text>
                <TextInput style={[styles.input]} value={username} onChangeText={text => setUserName(text)}></TextInput>
            </View>

            <View style={[styles.row]}>
                <Text style={[styles.description]}>Heslo</Text>
                <TextInput style={[styles.input]} value={password} onChangeText={text => setPassword(text)}></TextInput>
            </View>

            <View style={[styles.row]}>
                <Text style={[styles.description]}>Časová prodleva</Text>
                <TextInput style={[styles.input]} value={time} onChangeText={text => setTime(text)}></TextInput>
            </View>

            <View style={{ width: '40%' }}>
                <Button title="Upravit" onPress={storeData} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1,
        paddingTop: Constants.statusBarHeight,
      },
    box: {
        height: 40,
        margin: 12,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    input: {
        borderColor: "#4630eb",
        borderRadius: 4,
        borderWidth: 1,
        flex: 1,
        height: 48,
        margin: 16,
        padding: 4,
    },
    description: {
        paddingTop: 30,
        paddingLeft: 30,
        fontWeight: "bold",
    },
    button: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: "oldlace",
        alignSelf: "flex-start",
        marginHorizontal: "1%",
        marginBottom: 6,
        minWidth: "48%",
        textAlign: "center",
    },
    selected: {
        backgroundColor: "coral",
        borderWidth: 0,
    },
    buttonLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "coral",
    },
    selectedLabel: {
        color: "white",
    },
    label: {
        textAlign: "center",
        marginBottom: 10,
        fontSize: 24,
    },
});

export default Settings;