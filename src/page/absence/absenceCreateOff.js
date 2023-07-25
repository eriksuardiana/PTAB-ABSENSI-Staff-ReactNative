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
import myFunctions from '../../functions';
import {
  isMockingLocation,
  MockLocationDetectorErrorCode,
} from 'react-native-turbo-mock-location-detector';

const AbsenceCreateOff = ({navigation, route}) => {
  const TOKEN = useSelector(state => state.TokenReducer);
  const USER = useSelector(state => state.UserReducer);
  const USER_ID = useSelector(state => state.UserReducer.id);
  const STAFF_ID = useSelector(state => state.UserReducer.staff_id);
  const [timeD, setTimeD] = useState(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [finger, setFinger] = useState('ON');
  const [j1, setJ1] = useState(0);
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
  const [fakeGpsV, setfakeGpsV] = useState(0);

  const fakeGps = async () => {
    console.log('Fake GPS');
    // return true;
    await isMockingLocation()
      .then(({isLocationMocked}) => {
        if (isLocationMocked === true) {
          // alert('gps falsu');
          setfakeGpsV(2);
          return (
            <View>
              <Text>
                Anda Menggunakan Fake GPS Tolong Matikan Fake GPS dan restart HP
                Anda Kembali
              </Text>
            </View>
          );
          // return true;
        } else {
          // alert('gps asli');
          setfakeGpsV(3);
          return (
            <View>
              <Text>
                Anda Menggunakan Fake GPS Tolong Matikan Fake GPS dan restart HP
                Anda Kembali
              </Text>
            </View>
          );
          // return true;
        }

        // isLocationMocked: boolean
        // boolean result for Android and iOS >= 15.0
      })
      .catch(error => {
        // error.message - descriptive message
        switch (error.code) {
          case MockLocationDetectorErrorCode.GPSNotEnabled: {
            // user disabled GPS
            console.log('fake 1');
            return true;
          }
          case MockLocationDetectorErrorCode.NoLocationPermissionEnabled: {
            // user has no permission to access location
            console.log('fake 2');
            return true;
          }
          case MockLocationDetectorErrorCode.CantDetermine: {
            console.log('fake 3');
            return true;
            // always for iOS < 15.0
            // for android and iOS if couldn't fetch GPS position
          }
        }
      });
  };

  useEffect(() => {
    console.log(route.params);
    // Alert.alert('301')
    setLoading(true);
    fakeGps();
    Promise.all([
      myFunctions.checkFingerprint(),
      myFunctions.permissionCamera(),
      myFunctions.permissionLocation(),
    ])
      .then(res => {
        setLoading(true);
        //if fingerprint off
        if (!res[0]) {
          setFinger('OFF');
        }
        //if perrmission loc
        if (res[2]) {
          //check gps
          myFunctions
            .checkGps(route.params.highAccuracy)
            .then(function (gps) {
              if (!gps.status) {
                setLoading(false);
                console.log('checkGps useeffect', 'false');
              } else {
                console.log('position', gps.data);
                // Alert.alert('306')
                // Working with W3C Geolocation API

                console.log(
                  'You are ',
                  getDistance(gps.data, {
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  }),
                  'meters away from 51.525, 7.4575',
                );

                const j = getDistance(gps.data, {
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
                //     latitude: gps.data.latitude,
                //     longitude: gps.data.longitude,
                // }
                // positionNew = position
                console.log(
                  'posisiisii ',
                  gps.data.latitude,
                  gps.data.longitude,
                );
                setForm({
                  ...form,
                  lat: gps.data.latitude,
                  lng: gps.data.longitude,
                  accuracy: gps.data.accuracy,
                  distance: j,
                });
                setLoading(false);
              }
            })
            .catch(error => {
              console.log('err checkGps useeffect', error.message);
              setLoading(false);
            });
        } else {
          Alert.alert(
            'Location Permission',
            'Location Permission tidak diizinkan.',
          );
        }
        setLoading(false);
      })
      .catch(e => {
        console.log('err promise all', e);
        setLoading(false);
      });

    setLoading(false);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    console.log(route.params);
    setLoading(true);

    Promise.all([
      myFunctions.checkFingerprint(),
      myFunctions.permissionCamera(),
      myFunctions.permissionLocation(),
    ])
      .then(res => {
        setLoading(true);
        //if fingerprint off
        if (!res[0]) {
          setFinger('OFF');
        }
        //if perrmission loc
        if (res[2]) {
          //check gps
          myFunctions
            .checkGps(route.params.highAccuracy)
            .then(function (gps) {
              if (!gps.status) {
                setLoading(false);
                console.log('checkGps useeffect', 'false');
              } else {
                console.log('position', gps.data);
                // Working with W3C Geolocation API

                console.log(
                  'You are ',
                  getDistance(gps.data, {
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  }),
                  'meters away from 51.525, 7.4575',
                );

                // tesss1

                const j = getDistance(gps.data, {
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
                //     latitude: gps.data.latitude,
                //     longitude: gps.data.longitude,
                // }
                // positionNew = position
                console.log(
                  'posisiisii ',
                  gps.data.latitude,
                  gps.data.longitude,
                );
                setForm({
                  ...form,
                  lat: gps.data.latitude,
                  lng: gps.data.longitude,
                });
                setLoading(false);
              }
            })
            .catch(error => {
              console.log('err checkGps useeffect', error.message);
              setLoading(false);
            });
        } else {
          Alert.alert(
            'Location Permission',
            'Location Permission tidak diizinkan.',
          );
        }
        setLoading(false);
      })
      .catch(e => {
        console.log('err promise all', e);
        setLoading(false);
      });

    setLoading(false);

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

  const sendDataNoImg = position => {
    setLoading(true);
    alert('dhdh');
    console.log(
      'dataaaa',
      route.params.absence_id,
      route.params.absence_category_id,
      route.params.absence_category_id_end,
      route.params.expired_date,
      route.params.absence_request_id,
      position.latitude,
      position.longitude,
    );
    RNFetchBlob.fetch(
      'POST',
      'https://simpletabadmin.ptab-vps.com/api/close/absence/absence/storeLocation',
      {
        Authorization: `Bearer ${TOKEN}`,
        otherHeader: 'foo',
        Accept: 'application/json',
        // 'Content-Type': 'multipart/form-data',
      },
      [
        {name: 'absence_id', data: route.params.absence_id.toString()},
        {
          name: 'absence_category_id',
          data: route.params.absence_category_id.toString(),
        },
        {
          name: 'absence_category_id_end',
          data: route.params.absence_category_id_end.toString(),
        },
        {name: 'staff_id', data: STAFF_ID.toString()},
        {name: 'expired_date', data: route.params.expired_date.toString()},
        {
          name: 'absence_request_id',
          data: route.params.absence_request_id.toString(),
        },
        {
          name: 'lat',
          data: position.latitude ? position.latitude.toString() : null,
        },
        {
          name: 'lng',
          data: position.longitude ? position.longitude.toString() : null,
        },
        {
          name: 'accuracy',
          data: form.accuracy ? form.accuracy.toString() : null,
        },
        {
          name: 'distance',
          data: form.distance ? form.distance.toString() : null,
        },
        {name: 'status', data: '0'},
      ],
    )
      .then(result => {
        let data = JSON.parse(result.data);
        if (data.data) {
          console.log(result);
          setLoading(false);
          navigation.goBack();

          Alert.alert(data.message);
        } else {
          setLoading(false);
          Alert.alert(data.message);
        }
        // navigation.navigate('Action')
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });
  };

  const sendData = position => {
    setLoading(true);
    RNFetchBlob.fetch(
      'POST',
      'https://simpletabadmin.ptab-vps.com/api/close/absence/absence/storeLocation',
      {
        Authorization: `Bearer ${TOKEN}`,
        otherHeader: 'foo',
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      [
        {
          name: 'image',
          filename: route.params.image.filename,
          data: route.params.image.base64,
        },
        {name: 'absence_id', data: route.params.absence_id.toString()},
        {
          name: 'absence_category_id',
          data: route.params.absence_category_id.toString(),
        },
        {
          name: 'absence_category_id_end',
          data: route.params.absence_category_id_end.toString(),
        },
        {name: 'staff_id', data: STAFF_ID.toString()},
        {name: 'expired_date', data: route.params.expired_date.toString()},
        {
          name: 'absence_request_id',
          data: route.params.absence_request_id.toString(),
        },
        {name: 'lat', data: form.lat ? form.lat.toString() : ''},
        {name: 'lng', data: form.lng ? form.lng.toString() : ''},
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

          Alert.alert(data.message);
        } else {
          setLoading(false);
          Alert.alert(data.message);
        }
        // navigation.navigate('Action')
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });
  };

  const authCurrent = () => {
    FingerprintScanner.authenticate({title: 'Verifikasi Bahwa Ini Benar Anda'})
      .then(() => {
        setLoading(true);
        handleAction();
        // navigation.navigate('Test1')
        FingerprintScanner.release();
      })
      .catch(error => {
        setLoading(false);
        if (error.name == 'DeviceLocked') {
          // handleActionErr()
          // if(timeD > 0){
          //   Alert.alert('Tunggu beberapa saat dan klik ulang tombol absen')
          // }
          // else{
          Alert.alert(
            'Tunggu kurang lebih 30 detik dan klik ulang tombol absen',
          );
          // }

          // setTimeD(30);
        } else if (error.name == 'DeviceLockedPermanent') {
          Alert.alert('Kunci HP Anda dan masuk dengan sandi anda');
        } else if (error.name == 'DeviceLockedPermanent') {
          Alert.alert('Kunci HP Anda dan masuk dengan sandi anda');
        } else if (error.name == 'FingerprintScannerNotEnrolled') {
          Alert.alert(
            'Aktifkan Fingerprint anda, masuk ke setting/sandi&keamanan pilih sidik jari',
          );
        } else {
          // Alert.alert('Aktifkan Fingerprint anda, masuk ke setting/sandi&keamanan pilih sidik jari')
          // test
          Alert.alert(error.name);
        }
        FingerprintScanner.release();
      });
  };

  const handleAction = () => {
    const data = {
      lat: form.lat,
      lng: form.lng,
    };
    setLoading(true);

    Promise.all([
      myFunctions.checkFingerprint(),
      myFunctions.permissionCamera(),
      myFunctions.permissionLocation(),
    ])
      .then(res => {
        setLoading(true);
        //if fingerprint off
        if (!res[0]) {
          setFinger('OFF');
        }
        //if perrmission loc
        if (res[2]) {
          //check gps
          myFunctions
            .checkGps(route.params.highAccuracy)
            .then(function (gps) {
              if (!gps.status) {
                Alert.alert(
                  'Gagal Mengirim Data',
                  'Tolong cek kembali lokasi anda',
                );
                setLoading(false);
                console.log('checkGps useeffect', 'false');
              } else {
                console.log('position', gps.data);

                console.log(
                  'You are ',
                  getDistance(gps.data, {
                    latitude: parseFloat(route.params.lat),
                    longitude: parseFloat(route.params.lng),
                  }),
                  'meters away from 51.525, 7.4575',
                );

                // tesss1

                // start input
                const j = getDistance(gps.data, {
                  latitude: parseFloat(route.params.lat),
                  longitude: parseFloat(route.params.lng),
                });
                // Working with W3C Geolocation API

                setTest(j);
                if (route.params.selfie == 'OFF') {
                  sendDataNoImg(gps.data);
                } else if (
                  // form.lat != '' &&
                  // form.lng != '' &&
                  route.params.image.filename != '' &&
                  route.params.image.filename != null
                ) {
                  // alert('5');
                  sendData(gps.data);
                } else {
                  Alert.alert('Lengkapi data terlebih dahulu');
                  setLoading(false);
                }

                console.log(
                  'posisiisii ',
                  gps.data.latitude,
                  gps.data.longitude,
                );
                setForm({
                  ...form,
                  lat: gps.data.latitude,
                  lng: gps.data.longitude,
                  accuracy: gps.data.accuracy,
                  distance: j,
                });
                // setLoading(false);
              }
            })
            .catch(error => {
              console.log('err checkGps useeffect', error.message);
              setLoading(false);
            });
        } else {
          Alert.alert(
            'Location Permission',
            'Location Permission tidak diizinkan.',
          );
        }
        setLoading(false);
      })
      .catch(e => {
        console.log('err promise all', e);
        setLoading(false);
      });

    setLoading(false);
  };

  if (fakeGpsV === 2) {
    return (
      <View>
        <Text>
          Anda Menggunakan Fake GPS Tolong Matikan Fake GPS dan restart HP Anda
          Kembali
        </Text>
      </View>
    );
  } else if (!loading && jarak != '' && fakeGpsV != 0) {
    return (
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
          scrollEnabled={true}
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
              anda bisa absen mengabaikan radius
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
                      link: 'AbsenceCreateOff',
                      lat: route.params.lat,
                      lng: route.params.lng,
                      radius: route.params.radius,
                      absence_id: route.params.absence_id,
                      expired_date: route.params.expired_date,
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

        {finger == 'ON' && route.params.fingerfrint == 'ON' && (
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

        {route.params.fingerfrint == 'OFF' && finger == 'ON' && (
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

        {route.params.fingerfrint == 'ON' && finger == 'OFF' && (
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

export default AbsenceCreateOff;

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
