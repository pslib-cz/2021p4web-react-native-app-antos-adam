import { useState, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
} from "react-native";
import Constants from "expo-constants";
import * as SQLite from "expo-sqlite";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';


const URL_KEY = "@storage_Key_url"
const USERNAME_KEY = "@storage_Key_username"
const PASSWORD_KEY = "@storage_Key_password"
const TIME_KEY = "@storage_Key_time"

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => { },
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function Items({ onPressItem }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql("select * from items", [], (_, { rows: { _array } }) =>
        setItems(_array)
      );
    });
  }, []);


  return (
    <>
      {items.map(({ id, date, value }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: "#fff",
            borderColor: "#000",
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text>{date} {value} (kliknutím odebrat)</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

export default function Home() {
  const [text, setText] = useState(null);
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [url, setUrl] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [time, setTime] = useState("");
  const [items, setItems] = useState([]);
  const [tracking, setTracking] = useState("");

  if (tracking == "") setTracking("Spustit tracking");

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

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, date text, value text);"
      );
    });
  }, []);

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      db.transaction(
        (tx) => {
          tx.executeSql("select * from items", [], (_, { rows: { _array } }) =>
          setItems(_array),
          //console.log(_array)
        );
        },
        null,
      );
    })();
  }, []);

  useEffect(async () => {
    if (tracking === "Ukončit tracking") {
      add(text);
      await sleep(Number(time));
      setTracking("Ukončit tracking");
    }
}, tracking);
  
  
  const startStopTracking = async (t) => {
    if (t === "Spustit tracking") {
      setTracking("Ukončit tracking");
    } 
    else {
      setTracking("Spustit tracking");
    }
  }

  const add = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getLastKnownPositionAsync({});
      setText(location.coords.latitude.toString() + "," + location.coords.longitude.toString() + "," + location.coords.altitude.toString());


    let today = new Date();
    let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
    let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
    let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
    let date = today.getFullYear() + '/' + ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1) + '/' + (today.getDate() < 10 ? '0' : '') + today.getDate() + "%20" + hours + ':' + minutes + ':' + seconds;

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (date, value) values (?, ?)", [date, text]);
        tx.executeSql("select * from items", [], (_, { rows: { _array } }) =>
        setItems(_array) );
      },
      null,
      forceUpdate
    );


  };

  const send = async (url, username, password, time, items) => {
    var link = url + "GPS?email=" + username + "&password=" + password + "&trackTime=" + time + "&locations=";
    items.map(({ id, date, value }) => (
      link += date.toString() + ";" + value + ";"
    ))
    console.log(link);
  
    let result = await WebBrowser.openBrowserAsync(link);
    if (result.type === "cancel") {
      console.log("Odesláno");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>GPS Tracker</Text>
      {Platform.OS === "web" ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.heading}>
            Expo SQlite není podporováno na webu!
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <Button title="Přidat" style={[styles.button]} onPress={() => {
              add(text);
            }}></Button>
            <Button title="Odeslat" style={[styles.button]} onPress={() => {
              send(url, username, password, time, items);
            }}></Button>
            <Button title={tracking} style={[styles.button]} onPress={() => {
              startStopTracking(tracking);
            }}></Button>
          </View>
          <ScrollView style={styles.listArea}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>Seznam souřadnic</Text>
              <Items
                key={`forceupdate-${forceUpdateId}`}
                onPressItem={(id) =>
                  db.transaction(
                    (tx) => {
                      tx.executeSql(`delete from items where id = ?;`, [id]);
                      tx.executeSql("select * from items", [], (_, { rows: { _array } }) =>
                      setItems(_array) );
                    },
                    null,
                    forceUpdate
                  )
                }
              />
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  input: {
    borderColor: "#4630eb",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
});