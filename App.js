import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'
import { Camera } from 'expo-camera';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState();
  const [type, setType] = useState(Camera.Constants.Type.front);

  const [modalSelfie, setModalSelfie] = useState(false);
  const [modalDNI, setModalDNI] = useState(false);
  const [modalFinalValido, setModalFinalValido] = useState(false);
  const [modalFinalInvalido, setModalFinalInvalido] = useState(false);
  const [modalCargando, setModalCargando] = useState(false);
  const [capturedPhotoDNI, setCapturedPhotoDNI] = useState(null);
  const [capturedPhotoSelfie, setCapturedPhotoSelfie] = useState(null);

  const cam = useRef();

  const _takePicture = async () => {

    if (cam.current) {
      const option = { quality: 0.5, base64: true, skipProcessing: false };
      let photo = await cam.current.takePictureAsync(option);
      if (capturedPhotoSelfie == null) {
        setCapturedPhotoSelfie(photo);
        setModalSelfie(true);
      } else {
        setCapturedPhotoDNI(photo);
        setModalDNI(true);
      }
    }

  }

  const verificar = async () => {
    setModalCargando(true);
    cam.current.resumePreview();
    var newPhotoDni = {
      uri: capturedPhotoDNI.uri,
      type: 'image/jpeg',
      name: 'dni_front',
    };
    var newPhoto = {
      uri: capturedPhotoSelfie.uri,
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
        setModalCargando(false);
        var data = JSON.stringify(response.data);
        var pos = data.search("Similarity");
        var respuesta = Number(data.substring(pos + 12, pos + 20));
        console.log(respuesta);
        if (isNaN(respuesta) || respuesta < 80) {
          setModalFinalInvalido(true)
        } else {
          setModalFinalValido(true)
        }
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });

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
                <MaterialIcons name="camera" size={60} color={"#fff"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Camera>

      {capturedPhotoSelfie &&
        <Modal animationType="slide" transparent={false} visible={modalSelfie}>
          <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', margin: 20 }}>
            <Image style={{ width: '100%', height: 300, borderRadius: 20 }}
              source={{ uri: capturedPhotoSelfie.uri }}>
            </Image>
            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <TouchableOpacity style={{ margin: 10 }} onPress={() => { setModalSelfie(false); setCapturedPhotoSelfie(null) }}>
                  <MaterialIcons name="arrow-back" size={40} color={"#FF0000"} /><Text>Volver a tomar selfie</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={() => { setModalSelfie(false); setType(Camera.Constants.Type.back) }}>
                  <MaterialIcons name="check" size={40} color={"#008000"} /><Text>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      }

      {capturedPhotoDNI &&
        <Modal animationType="slide" transparent={false} visible={modalDNI}>
          <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', margin: 20 }}>
            <Image style={{ width: '100%', height: 300, borderRadius: 20 }}
              source={{ uri: capturedPhotoDNI.uri }}>
            </Image>

            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <TouchableOpacity style={{ margin: 10 }} onPress={() => { setModalDNI(false); setCapturedPhotoDNI(null) }}>
                  <MaterialIcons name="arrow-back" size={40} color={"#FF0000"} /><Text>Volver a tomar DNI</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={() => { setModalDNI(false); verificar(); setType(Camera.Constants.Type.front) }}>
                  <MaterialIcons name="check" size={40} color={"#008000"} /><Text>Contiunar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      }
      {modalFinalValido &&
        <Modal animationType="slide" transparent={false} visible={modalFinalValido}>
          <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', margin: 25 }}>
            <MaterialIcons name="check-circle" size={300} color={"#008000"} />
            <Text style={{textAlign:'center'}}>Su identidad fue validada.</Text>
          </View>
          <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View>
              <TouchableOpacity style={{ margin: 10 }} onPress={() => { setModalFinalValido(false); setCapturedPhotoDNI(null); setCapturedPhotoSelfie(null) }}>
                <MaterialIcons name="repeat" size={40} color={"#008000"} /><Text>Volver a intentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      }
      {modalFinalInvalido &&
        <Modal animationType="slide" transparent={false} visible={modalFinalInvalido}>
          <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', margin: 25 }}>
            <MaterialIcons name="error" size={300} color={"#FF0000"} />
            <Text style={{textAlign:'center'}}>No se pudo validar su identidad.</Text>
          </View>
          <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View>
              <TouchableOpacity style={{ margin: 10 }} onPress={() => { setModalFinalInvalido(false); setCapturedPhotoDNI(null); setCapturedPhotoSelfie(null) }}>
                <MaterialIcons name="repeat" size={40} color={"#008000"} /><Text>Volver a intentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      }

      {modalCargando &&
        <Modal animationType="slide" transparent={false} visible={modalCargando}>
          <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', margin: 25 }}>
            <MaterialIcons name="cloud-upload" size={300} color="black" />
            <Text style={{textAlign:'center'}}>Cargando imagenes...</Text>
          </View>
        </Modal>
      }

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