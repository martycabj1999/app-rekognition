import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import base64 from 'react-native-base64';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState();
  const [type, setType] = useState(Camera.Constants.Type.front);

  const cam = useRef();

  const _takePicture = async () => {

    if (cam.current) {
      const option = { quality: 0.5, base64: true, skipProcessing: false };
      let photo = await cam.current.takePictureAsync(option);      
      const source = photo.uri;
     
      if (source) {
        cam.current.resumePreview();
        //let decodePhoto= base64.decode(photo.base64);
        var newPhotoDni = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'dni_front',
        };
        var newPhoto = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'photo',
        };
        var formData = new FormData();
        formData.append("dni_front", newPhotoDni);
        formData.append("photo", newPhoto);
        
        axios({
          method: "post",
          url: "http://18.221.216.28:8000/api/users/image_identification",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then(function (response) {
            //handle success
            console.log(response.data);
          })
          .catch(function (response) {
            //handle error
            console.log(response);
          });
      }
    }

  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={styles.container}>
      <Camera ref={cam} style={styles.camera} type={type}>
        <View style={styles.buttonContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', alignContent: 'center' }}>
            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => _takePicture()}>
                <Text style={styles.text}> Take </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center', alignItems: 'flex-end', alignContent: 'center',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});