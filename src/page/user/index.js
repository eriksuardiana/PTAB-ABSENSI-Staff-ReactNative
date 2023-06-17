import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Footer} from '../../component';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import API from '../../service';
import {useState} from 'react';
import {useEffect} from 'react';
import myFunctions from '../../functions';

const User = ({navigation}) => {
  const TOKEN = useSelector(state => state.TokenReducer);
  const USER = useSelector(state => state.UserReducer);
  const [data, setData] = useState({staff: [], messageM: ''});
  // console.log(USER)

  const getData = () => {
    API.menu(USER.staff_id).then(result => {
      if (result) {
        console.log('data2', result);
        setData(result);
        // setLoading(false)
      } else {
        alert(result.message);
      }
    });
  };

  useEffect(() => {
    getData();
  }, []);

  const getImageGalery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 500,
        maxWidth: 500,
      },
      response => {
        if (response.assets) {
          if (response.assets[0].uri != '') {
            //  setLoading(true)
            RNFetchBlob.fetch(
              'POST',
              'https://simpletabadmin.ptab-vps.com/api/close/absence/user/update',
              {
                //  Authorization: `Bearer ${TOKEN}`,
                //  otherHeader: 'foo',
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
              },
              [
                {
                  name: 'image',
                  filename: response.assets[0].fileName,
                  data: response.assets[0].base64,
                },
                {name: 'id', data: USER.staff_id.toString()},
              ],
            )
              .then(result => {
                //  setLoading(false)
                //  let data = JSON.parse(result.data);
                // console.log('data post12',data.data.id

                // dispatch(SET_DATA_USER({
                //     ...USER,
                //     image: result.image_name,
                // }))

                //  console.log('data post',data)
                getData();
                //  navigation.goBack()
              })
              .catch(e => {
                //    console.log(e);
                alert(e);
                //  setLoading(false)
              });
          } else {
            //  setLoading(false)
            alert('Mohon Lengkapi data');
          }
        } else {
        }
      },
    );
  };

  const getImageCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 500,
        maxWidth: 500,
      },
      response => {
        if (response.assets) {
          console.log('tsss', response.assets[0].uri);

          if (response.assets[0].uri != '') {
            //  setLoading(true)
            RNFetchBlob.fetch(
              'POST',
              'https://simpletabadmin.ptab-vps.com/api/close/absence/user/update',
              {
                //  Authorization: `Bearer ${TOKEN}`,
                //  otherHeader: 'foo',
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
              },
              [
                {
                  name: 'image',
                  filename: response.assets[0].fileName,
                  data: response.assets[0].base64,
                },
                {name: 'id', data: USER.staff_id.toString()},
              ],
            )
              .then(result => {
                //  setLoading(false)
                //  let data = JSON.parse(result.data);
                // console.log('data post12',data.data.id

                // dispatch(SET_DATA_USER({
                //     ...USER,
                //     image: result.image_name,
                // }))

                //  console.log('data post',data)
                getData();
                //  navigation.goBack()
              })
              .catch(e => {
                //    console.log(e);
                alert(e);
                //  setLoading(false)
              });
          } else {
            //  setLoading(false)
            alert('Mohon Lengkapi data');
          }
        }
      },
    );
  };

  const update = () => {
    myFunctions.permissionCamera();

    Alert.alert('Tambahkan Gambar', 'Pilih media', [
      {text: 'Batal', onPress: () => {}},
      {
        text: 'Camera',
        onPress: () => getImageCamera(),
      },
      {
        text: 'Galery',
        onPress: () => getImageGalery(),
      },
    ]);
  };
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          width: windowWidht * 0.85,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: windowHeight * 0.05,
          paddingBottom: windowHeight * 0.02,
        }}>
        <Text style={styles.title1}>Profile</Text>
        <View style={styles.box}>
          <TouchableOpacity
            onPress={() => {
              update();
            }}>
            <Image
              style={styles.image}
              source={{
                uri:
                  `https://simpletabadmin.ptab-vps.com` +
                  `${String(data.staff.image).replace('public/', '')}`,
              }}
              // source={image.uri=='' || image.uri==null ? require('../../../assets/img/ImageFoto.png'): {uri: image.from=='local' ? image.uri : `https://simpletabadmin.ptab-vps.com/` + `${String(image.uri).replace('public/', '')}?time="${new Date()}`}}
            />
          </TouchableOpacity>

          <View style={{flexDirection: 'row'}}>
            <Text style={styles.title}>Nama</Text>
            <Text style={styles.data}>
              {data.staff.name ? data.staff.name : 'Loading...'}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.title}>Phone</Text>
            <Text style={styles.data}>
              {data.staff.phone ? data.staff.phone : 'Loading...'}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.title}>Email</Text>
            <Text style={styles.data}>
              {data.staff.email ? data.staff.email : 'Loading...'}
            </Text>
          </View>
        </View>
      </View>
      <Footer focus="User" navigation={navigation} />
    </View>
  );
};

export default User;

const windowWidht = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  box: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: windowWidht * 0.8,
  },
  title1: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: windowHeight * 0.04,
    marginBottom: windowHeight * 0.02,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  title: {
    width: windowWidht * 0.2,
    fontWeight: 'bold',
    color: '#000000',
  },
  data: {
    width: windowWidht * 0.6,
    color: '#000000',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidht * 0.7,
    height: windowHeight * 0.3233,
    backgroundColor: '#00000010',
    resizeMode: 'contain',
    marginBottom: windowHeight * 0.03,
  },
});
