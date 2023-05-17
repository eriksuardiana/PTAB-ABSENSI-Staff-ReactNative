import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  PermissionsAndroid,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MapView, {Callout, Marker, Circle} from 'react-native-maps';
import reactNativeAndroidLocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import Geolocation from '@react-native-community/geolocation';
import {useSelector} from 'react-redux';
import API from '../../service';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import RNFetchBlob from 'rn-fetch-blob';
import {getDistance} from 'geolib';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {launchCamera} from 'react-native-image-picker';
import ScreenLoading from '../loading/ScreenLoading';
import {SafeAreaView} from 'react-native-safe-area-context';

const AbsenceCreateExtra = ({navigation, route}) => {
  const TOKEN = useSelector(state => state.TokenReducer);
  const USER = useSelector(state => state.UserReducer);
  const USER_ID = useSelector(state => state.UserReducer.id);
  const STAFF_ID = useSelector(state => state.UserReducer.staff_id);
  const [timeD, setTimeD] = useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [finger, setFinger] = useState('ON');
  const [j1, setJ1] = useState(0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    console.log(route.params);
    setLoading(true);
    // console.log(route.params.data.duty)
    reactNativeAndroidLocationServicesDialogBox
      .checkLocationServicesIsEnabled({
        message:
          "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: 'YES',
        cancel: 'NO',
      })
      .then(function (success) {
        if (success) {
          Promise.all([requestLocationPermission()])
            .then(res => {
              // console.log('corrrrrr',res);
              Geolocation.getCurrentPosition(
                position => {
                  // Working with W3C Geolocation API

                  console.log(
                    'You are ',
                    getDistance(position.coords, {
                      latitude: parseFloat(route.params.lat),
                      longitude: parseFloat(route.params.lng),
                    }),
                    'meters away from 51.525, 7.4575',
                  );

                  // tesss1

                  const j = getDistance(position.coords, {
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  });
                  // Working with W3C Geolocation API

                  setTest(j);
                  if (j > route.params.radius) {
                    setJarak('1');
                    setJ1(j);
                  } else {
                    setJarak('2');
                  }

                  // console.log('posisi',position);
                  // defaultLoc = {
                  //     latitude: position.coords.latitude,
                  //     longitude: position.coords.longitude,
                  // }
                  // positionNew = position
                  console.log(
                    'posisiisii ',
                    position.coords.latitude,
                    position.coords.longitude,
                  );
                  setForm({
                    ...form,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                  setLoading(false);
                  // alert(position.coords.latitude);
                  // handleData(position)
                },
                error => {
                  console.log(error);
                  setLoading(false);
                },
                {
                  enableHighAccuracy: route.params.highAccuracy,
                  timeout: 120000,
                  maximumAge: 1000,
                  accuracy: 'high',
                },
              );
            })
            .catch(e => {
              console.log(e);
              setLoading(false);
            });
        }
      })
      .catch(error => {
        console.log(error.message); // error.message => "disabled"
        //   navigation.navigate('Register')
        // setStatusGps(error.message)
        setLoading(false);
      });
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const [image, set_image] = useState({
    base64: '',
    fileName: '',
    fileSize: 0,
    height: 0,
    type: '',
    uri: '',
    width: 0,
    from: 'api',
  });

  const authCurrent = () => {
    FingerprintScanner.authenticate({title: 'Verifikasi Bahwa Ini Benar Anda'})
      .then(() => {
        handleAction();
        // navigation.navigate('Test1')
        FingerprintScanner.release();
      })
      .catch(error => {
        if (error.name == 'DeviceLocked') {
          // handleActionErr()
          // if(timeD > 0){
          //   alert('Tunggu beberapa saat dan klik ulang tombol absen')
          // }
          // else{
          alert('Tunggu kurang lebih 30 detik dan klik ulang tombol absen');
          // }

          // setTimeD(30);
        } else if (error.name == 'DeviceLockedPermanent') {
          alert('Kunci HP Anda dan masuk dengan sandi anda');
        } else if (error.name == 'DeviceLockedPermanent') {
          alert('Kunci HP Anda dan masuk dengan sandi anda');
        } else if (error.name == 'FingerprintScannerNotEnrolled') {
          alert(
            'Aktifkan Fingerprint anda, masuk ke setting/sandi&keamanan pilih sidik jari',
          );
        } else {
          // alert('Aktifkan Fingerprint anda, masuk ke setting/sandi&keamanan pilih sidik jari')
          // test
          alert(error.name);
        }
        FingerprintScanner.release();
      });
  };

  const [isMounted, setIsMounted] = useState(true);
  const [courseDetails, setCourseDetails] = useState();
  const [jarak, setJarak] = useState('');
  const [test, setTest] = useState('');
  const {width, height} = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.4922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
  const [time, setTime] = React.useState();
  const [form, setForm] = useState({
    lat: '',
    lng: '',
    customer_id: '',
    memo: '',
    type: '',
    accuracy: '',
    distance: '',
    // staff_id : USER_ID,
    todo: '',
  });
  const [loading, setLoading] = useState(true);

  const requestLocationPermission = async () => {
    let info = '';
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'MyMapApp needs access to your location',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //   setEnableLocation(true)
      } else {
        //   setEnableLocation(false)
      }
    } catch (err) {
      info = 1;
    }
  };

  const sendDataNoImg = position => {
    setLoading(true);
    RNFetchBlob.fetch(
      'POST',
      'https://simpletabadmin.ptab-vps.com/api/close/absence/absence/storeLocationExtra',
      {
        // Authorization: `Bearer ${TOKEN}`,
        // otherHeader: 'foo',
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'absence_category_id',
          data: route.params.absence_category_id.toString(),
        },
        {
          name: 'absence_category_id_end',
          data: route.params.absence_category_id_end.toString(),
        },
        {name: 'staff_id', data: STAFF_ID.toString()},
        {
          name: 'absence_request_id',
          data: route.params.absence_request_id.toString(),
        },
        {name: 'lat', data: position.coords.latitude.toString()},
        {name: 'lng', data: position.coords.longitude.toString()},
        {name: 'accuracy', data: form.accuracy.toString()},
        {name: 'distance', data: form.distance.toString()},
        {name: 'status', data: '0'},
      ],
    )
      .then(result => {
        let data = JSON.parse(result.data);
        if (data.data) {
          console.log(result);

          setLoading(false);
          navigation.goBack();
          alert(data.message);
        } else {
          setLoading(false);
          alert(data.message);
        }

        // navigation.navigate('Action')
      })
      .catch(e => {
        // console.log(e);
        setLoading(false);
      });
  };

  const sendData = position => {
    setLoading(true);
    RNFetchBlob.fetch(
      'POST',
      'https://simpletabadmin.ptab-vps.com/api/close/absence/absence/storeLocationExtra',
      {
        // Authorization: `Bearer ${TOKEN}`,
        // otherHeader: 'foo',
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'image',
          filename: route.params.image.filename,
          data: route.params.image.base64,
        },
        {
          name: 'absence_category_id',
          data: route.params.absence_category_id.toString(),
        },
        {
          name: 'absence_category_id_end',
          data: route.params.absence_category_id_end.toString(),
        },
        {name: 'staff_id', data: STAFF_ID.toString()},
        {
          name: 'absence_request_id',
          data: route.params.absence_request_id.toString(),
        },
        {name: 'lat', data: position.coords.latitude.toString()},
        {name: 'lng', data: position.coords.longitude.toString()},
        {name: 'accuracy', data: form.accuracy.toString()},
        {name: 'distance', data: form.distance.toString()},
        {name: 'status', data: '0'},
      ],
    )
      .then(result => {
        let data = JSON.parse(result.data);
        if (data.data) {
          console.log(result);

          setLoading(false);
          navigation.goBack();
          alert(data.message);
        } else {
          setLoading(false);
          alert(data.message);
        }

        // navigation.navigate('Action')
      })
      .catch(e => {
        // console.log(e);
        setLoading(false);
      });
  };

  //   React.useEffect(() => {
  //     if (isMounted) {
  //     const timer = setInterval(() => {
  //       setTime(new Date().getDate() + "-" + parseInt(new Date().getMonth() + 1) + "-" + new Date().getFullYear() + " " + (new Date().getHours()) + ":" + new Date().getMinutes() + ":" + new Date().getSeconds());

  //       Geolocation.getCurrentPosition(
  //         (position) => {
  //           if(position){

  //           const j =  getDistance(position.coords, {
  //                        latitude:  parseFloat(route.params.lat),
  //             longitude:  parseFloat(route.params.lng),
  //     })
  // // Working with W3C Geolocation API

  // setTest(j);
  //     if(j> route.params.radius){
  //       setJarak('1')
  //     }
  //     else{
  //       setJarak('2')
  //     }

  //             // positionNew = position
  //             // console.log('posisiisii ', (position.coords.latitude),(position.coords.longitude));
  //             setForm({
  //                 ...form,
  //                 lat: position.coords.latitude,
  //                 lng: position.coords.longitude
  //             })
  //             // handleData(position)
  //           }
  //         },
  //         (error) => {
  //             console.log(error);
  //             setLoading(false)
  //         },
  //         { enableHighAccuracy: route.params.highAccuracy, timeout: 20000, maximumAge: 1000, accuracy: 'high' },
  //     );

  //     }, 1000);

  //     return () => {
  //       clearInterval(timer);
  //     };
  //   }

  //   }, [setCourseDetails]);

  //   useEffect(() => {
  //     return () => {
  //         setCourseDetails(null);
  //         setIsMounted(false);
  //     }
  // }, []);

  useEffect(() => {
    console.log(route.params);
    FingerprintScanner.isSensorAvailable()
      .then(biometryType => {})
      .catch(error => {
        if (error.name == 'PasscodeNotSet') {
          alert(
            'Aktifkan Fingerprint anda, masuk ke setting/sandi&keamanan pilih sidik jari',
          );
          // test
          // alert(error.name)
        } else if (error.name == 'FingerprintScannerNotSupported') {
          setFinger('OFF');
        }
      });
    setLoading(true);
    // console.log(route.params.data.duty)
    reactNativeAndroidLocationServicesDialogBox
      .checkLocationServicesIsEnabled({
        message:
          "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: 'YES',
        cancel: 'NO',
      })
      .then(function (success) {
        if (success) {
          Promise.all([requestLocationPermission()])
            .then(res => {
              // console.log('corrrrrr',res);
              Geolocation.getCurrentPosition(
                position => {
                  // Working with W3C Geolocation API

                  console.log(
                    'You are ',
                    getDistance(position.coords, {
                      latitude: parseFloat(route.params.lat),
                      longitude: parseFloat(route.params.lng),
                    }),
                    'meters away from 51.525, 7.4575',
                  );

                  const j = getDistance(position.coords, {
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  });
                  // Working with W3C Geolocation API

                  setTest(j);
                  if (j > route.params.radius) {
                    setJarak('1');
                    setJ1(j);
                    if (position.coords.accuracy > 40) {
                      Alert.alert(
                        'Peringatan',
                        'Anda berada di luar jangkauan, akurasi GPS: ' +
                          position.coords.accuracy +
                          ', tolong kalibrasi GPS atau pakai Internet yang lebih kuat.',
                      );
                    }
                  } else {
                    setJarak('2');
                  }

                  // console.log('posisi',position);
                  // defaultLoc = {
                  //     latitude: position.coords.latitude,
                  //     longitude: position.coords.longitude,
                  // }
                  // positionNew = position
                  console.log(
                    'posisiisii ',
                    position.coords.latitude,
                    position.coords.longitude,
                  );
                  setForm({
                    ...form,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    distance: j,
                  });
                  setLoading(false);
                  // alert(position.coords.latitude);
                  // handleData(position)
                },
                error => {
                  console.log(error);
                  setLoading(false);
                },
                {
                  enableHighAccuracy: route.params.highAccuracy,
                  timeout: 120000,
                  maximumAge: 1000,
                  accuracy: 'high',
                },
              );
            })
            .catch(e => {
              console.log(e);
              setLoading(false);
            });
        }
      })
      .catch(error => {
        console.log(error.message); // error.message => "disabled"
        //   navigation.navigate('Register')
        // setStatusGps(error.message)
        setLoading(false);
      });
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App need to use camera access to take an Image',
          //   buttonNeutral: "Ask Me Later",
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleAction = () => {
    const data = {
      lat: form.lat,
      lng: form.lng,
    };

    setLoading(true);
    reactNativeAndroidLocationServicesDialogBox
      .checkLocationServicesIsEnabled({
        message:
          "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: 'YES',
        cancel: 'NO',
      })
      .then(function (success) {
        if (success) {
          Promise.all([requestLocationPermission()])
            .then(res => {
              // console.log('corrrrrr',res);
              Geolocation.getCurrentPosition(
                position => {
                  // Working with W3C Geolocation API

                  console.log(
                    'You are ',
                    getDistance(position.coords, {
                      latitude: parseFloat(route.params.lat),
                      longitude: parseFloat(route.params.lng),
                    }),
                    'meters away from 51.525, 7.4575',
                  );

                  // tesss1

                  // start input
                  const j = getDistance(position.coords, {
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  });
                  // Working with W3C Geolocation API

                  setTest(j);
                  if (j > route.params.radius) {
                    if (j - j1 < 20) {
                      if (route.params.selfie == 'OFF') {
                        sendDataNoImg(position);
                      } else if (route.params.image == null) {
                        alert('Pilih Gambar Terlebih dahulu');
                        setLoading(false);
                      } else if (
                        form.lat != '' &&
                        form.lng != '' &&
                        route.params.image.filename != '' &&
                        route.params.image.filename != null
                      ) {
                        sendData(position);
                      } else {
                        alert('Lengkapi data terlebih dahulu');
                        setLoading(false);
                      }
                    } else {
                      setJarak('1');
                      alert('diluar area');
                    }
                  } else {
                    setJarak('2');
                    console.log(form.lat, form.lng);

                    if (route.params.selfie == 'OFF') {
                      sendDataNoImg(position);
                    } else if (route.params.image == null) {
                      alert('Pilih Gambar Terlebih dahulu');
                      setLoading(false);
                    } else if (
                      form.lat != '' &&
                      form.lng != '' &&
                      route.params.image.filename != '' &&
                      route.params.image.filename != null
                    ) {
                      sendData(position);
                    } else {
                      alert('Lengkapi data terlebih dahulu');
                      setLoading(false);
                    }
                  }
                  // end input

                  // console.log('posisi',position);
                  // defaultLoc = {
                  //     latitude: position.coords.latitude,
                  //     longitude: position.coords.longitude,
                  // }
                  // positionNew = position
                  console.log(
                    'posisiisii ',
                    position.coords.latitude,
                    position.coords.longitude,
                  );
                  setForm({
                    ...form,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                  setLoading(false);
                  // alert(position.coords.latitude);
                  // handleData(position)
                },
                error => {
                  console.log(error);
                  setLoading(false);
                },
                {
                  enableHighAccuracy: route.params.highAccuracy,
                  timeout: 120000,
                  maximumAge: 1000,
                  accuracy: 'high',
                },
              );
            })
            .catch(e => {
              console.log(e);
              setLoading(false);
            });
        }
      })
      .catch(error => {
        console.log(error.message); // error.message => "disabled"
        //   navigation.navigate('Register')
        // setStatusGps(error.message)
        setLoading(false);
      });
  };

  if (!loading && jarak != '') {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
          scrollEnabled={false}
          contentContainerStyle={styles.scrollView}
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={{alignItems: 'center'}}>
            <Text
              style={[
                {marginVertical: windowHeight * 0.01},
                jarak == '1' ? {color: '#ff0000'} : '',
              ]}>
              anda berada di{' '}
              {jarak == '1' ? 'Diluar Jangkauan' : 'Dalam Jangkauan'}, {test}
            </Text>

            <Text style={[{marginVertical: windowHeight * 0.05, fontSize: 24}]}>
              Absen
            </Text>
            <View
              style={{
                height: windowHeight * 0.3,
                width: windowWidht * 0.8,
                backgroundColor: '#FFFFFF',
              }}>
              <MapView
                style={{flex: 1}} //window pake Dimensions
                // showsUserLocation={true}
                showsMyLocationButton={true}
                region={{
                  latitude: parseFloat(route.params.lat),
                  longitude: parseFloat(route.params.lng),
                  latitudeDelta: 0.00683,
                  longitudeDelta: 0.0035,
                }}>
                <Circle
                  center={{
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  }}
                  radius={route.params.radius}
                  strokeWidth={1}
                  strokeColor="#ff0000"
                  fillColor="#ff000030"
                />

                <Marker
                  coordinate={{
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  }}>
                  <Callout>
                    <View>
                      <Text>Posisi Kantor</Text>
                    </View>
                  </Callout>
                </Marker>

                <Marker
                  pinColor={'blue'}
                  coordinate={{
                    latitude: form.lat,
                    longitude: form.lng,
                  }}>
                  <Callout>
                    <View>
                      <Text>Posisi Anda</Text>
                    </View>
                  </Callout>
                </Marker>
              </MapView>
            </View>

            {/* <View style={styles.mapS}>

        </View> */}
            <Text>Map</Text>

            {/* untuk gambar start */}
            {route.params.selfie == 'ON' && (
              <View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CamDect', {
                      highAccuracy: route.params.highAccuracy,
                      fingerfrint: route.params.fingerfrint,
                      selfie: route.params.selfie,
                      link: 'AbsenceCreateExtra',
                      lat: route.params.lat,
                      lng: route.params.lng,
                      radius: route.params.radius,
                      absence_category_id: route.params.absence_category_id,
                      absence_category_id_end:
                        route.params.absence_category_id_end,
                      absence_request_id: route.params.absence_request_id,
                      image: null,
                    })
                  }>
                  {route.params.image == null ? (
                    <View style={styles.image}>
                      <Icon
                        name="camera-retro"
                        size={windowHeight * 0.08}
                        color="#000000"
                      />
                    </View>
                  ) : (
                    <Image
                      style={styles.image}
                      source={{uri: route.params.image.uri}}
                      // source={image.uri=='' || image.uri==null ? require('../../../assets/img/ImageFoto.png'): {uri: image.from=='local' ? image.uri : `https://simpletabadmin.ptab-vps.com/` + `${String(image.uri).replace('public/', '')}?time="${new Date()}`}}
                    />
                  )}
                </TouchableOpacity>
                <Text>Image</Text>
              </View>
            )}

            {/* untuk gambar end */}
          </View>
        </ScrollView>

        {jarak != 1 && finger == 'ON' && route.params.fingerfrint == 'ON' && (
          <TouchableOpacity
            style={[styles.btn]}
            onPress={() => {
              authCurrent();
            }}>
            <Text style={{color: '#FFFFFF', fontSize: 24, fontWeight: 'bold'}}>
              Absen
            </Text>
          </TouchableOpacity>
        )}

        {jarak != 1 && route.params.fingerfrint == 'OFF' && finger == 'ON' && (
          <TouchableOpacity
            style={[styles.btn]}
            onPress={() => {
              handleAction();
            }}>
            <Text style={{color: '#FFFFFF', fontSize: 24, fontWeight: 'bold'}}>
              Absen
            </Text>
          </TouchableOpacity>
        )}

        {jarak != 1 && route.params.fingerfrint == 'ON' && finger == 'OFF' && (
          <TouchableOpacity
            style={[styles.btn]}
            onPress={() => {
              handleAction();
            }}>
            <Text style={{color: '#FFFFFF', fontSize: 24, fontWeight: 'bold'}}>
              Absen
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  } else {
    return (
      <View>
        <ScreenLoading />
      </View>
    );
  }
};

export default AbsenceCreateExtra;

const windowWidht = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mapS: {
    width: windowWidht * 0.8,
    height: windowHeight * 0.25,
    backgroundColor: '#FFFFFF',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidht * 0.7,
    height: windowWidht * 1.0,
    backgroundColor: '#00000010',
  },
  btn: {
    width: windowWidht * 0.76,
    height: windowHeight * 0.07,
    backgroundColor: '#00B2FF',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
