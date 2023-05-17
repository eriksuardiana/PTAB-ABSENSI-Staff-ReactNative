import { StyleSheet, Text, TouchableOpacity, View ,RefreshControl, FlatList, Alert} from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Dimensions } from 'react-native'
import API from '../../service'
import { useEffect } from 'react'
import { useState } from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { launchCamera } from 'react-native-image-picker';
import ScreenLoading from '../loading/ScreenLoading';
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'

const changeShift = ({navigation}) => {
  const TOKEN = useSelector((state) => state.TokenReducer);
  const USER = useSelector((state) => state.UserReducer);
  const USER_ID = useSelector((state) => state.UserReducer.id);
  const STAFF_ID = useSelector((state) => state.UserReducer.staff_id);
const [loading,setLoading] = useState(true)
const [data, setData] = useState([])
const [lastPage, setLastPage] = useState(0)
const [date, setDate] = useState("0000-00-00");
const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
const [date2, setDate2] = useState("0000-00-00");
const [isDatePickerVisible2, setDatePickerVisibility2] = useState(false);
const [refreshing, setRefreshing] = React.useState(false);
const [refresh, setRefresh] = useState(false)
const [page, setPage] = useState(1)
const isFocused = useIsFocused();

const onRefresh = React.useCallback(() => {
  setRefreshing(true);
  resetData()
  setRefreshing(false)
}, []);



const approve =(id,status)=>{
  console.log(id)
  Alert.alert(
    'Yakin ?',
    `menghapus Bukti ini`,
    [
        {
            text: 'Yakin',
            onPress: () => {   setLoading(true)
              console.log('tessaaaaaas')
                API.changeShiftApprove({id : id}, {status : status}, TOKEN).then((result)=>{
                  // console.log('res1',result.id)
                  // console.log('res2',result.data)
                  //  console.log('res',result)
                        alert(result.data.message)
                        // ShowDetail(id)
                    
                    setLoading(false)
                }).catch((e) => {
                    console.log("gagal");
                    setLoading(false)
                })}
        },
        {
            text: 'Tidak',
        }
    ]
  );
}


const handleLoadMore = () => {
  if (page < lastPage) {
   
      getData();
      console.log(page, lastPage)
  }
  else(
      console.log(page, lastPage)
  )
}
const ItemSeparatorView = () => {
  return (
      // Flat List Item Separator
      <View
          style={{
              marginVertical: 10
          }}
      />
  );
};

const showDatePicker = () => {
  setDatePickerVisibility(true);
};

const hideDatePicker = () => {
  setDatePickerVisibility(false);
};
const handleConfirm = (date) => {
  // setLoading(true);
  const dated = date.getFullYear() + "-" + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + (date.getDate())).slice(-2);
  console.log('ssssssaa',dated)
  setDate(dated);
  hideDatePicker();

};

const showDatePicker2 = () => {
  setDatePickerVisibility2(true);
};

const hideDatePicker2 = () => {
  setDatePickerVisibility2(false);
};
const handleConfirm2 = (date) => {
  // setLoading(true);
  const dated = date.getFullYear() + "-" + ('0' + (date.getMonth()+1)).slice(-2) + "-" + ('0' + (date.getDate())).slice(-2);
  console.log('ssssssaa',dated)
  setDate2(dated);
  hideDatePicker2();

};

  useEffect(() => {
    if (isFocused) {
      setLoading(true)
      getData()          
  }
  // console.log('ssss')
}, [isFocused]);

  const getData = () =>{
    console.log(page)
    setLoading(true)
    API.changeShift(STAFF_ID,page,date == "0000-00-00" ? "" : date, date2 == "0000-00-00" ? "" : date2).then((result) => {
      if(result){
        if (page > 1) {
          // setTicket(ticket.concat(result.data.data))
          setData(data.concat(result.data.data))
          // resetData = false
          setPage(page + 1);
          console.log('delete1', page);
      } else {
        setData(result.data.data)
        setPage(page + 1);
          console.log('delete2', page);
      }
        console.log(result.data)
        setLastPage(result.data.last_page)
        setLoading(false)
      }
        else{
          alert(result.message);
      }
      });
  }
  const filterData = () =>{
    setLoading(true)
    // if(page == "1"){
    //   setData([])
    //   getData()
    // }
    // else{
      setData([])
      setPage(1)

      API.changeShift(STAFF_ID,1,date == "0000-00-00" ? "" : date, date2 == "0000-00-00" ? "" : date2).then((result) => {
        if(result){
        //   if (page > 1) {
        //     // setTicket(ticket.concat(result.data.data))
        //     setData(data.concat(result.data.data))
        //     // resetData = false
        //     setPage(page + 1);
        //     console.log('delete1', page);
        // } else {
          setData(result.data.data)
          setPage(page + 1);
            console.log('delete2', page);
        // }
          console.log(result.data)
          setLastPage(result.data.last_page)
          setLoading(false)
        }
          else{
            alert(result.message);
        }
        });
    // }
  }

  const resetData = () =>{
    setLoading(true)
    // setData([])
    // setPage(1)
    API.changeShift(STAFF_ID,1,date == "0000-00-00" ? "" : date, date2 == "0000-00-00" ? "" : date2).then((result) => {
      if(result){
      //   if (page > 1) {
      //     // setTicket(ticket.concat(result.data.data))
      //     setData(data.concat(result.data.data))
      //     // resetData = false
      //     setPage(page + 1);
      //     console.log('delete1', page);
      // } else {
        setData(result.data.data)
        setPage(page + 1);
          console.log('delete2', page);
      // }
        console.log(result.data)
        setLastPage(result.data.last_page)
        setLoading(false)
      }
        else{
          alert(result.message);
      }
      });
    // API.changeShift(STAFF_ID,"1").then((result) => {
    //   if(result){
      
    //     setData(result.data.data)
    //       console.log('delete2', page);
      
    //     console.log(result.data.data)
    //     setLastPage(result.data.last_page)
    //     setLoading(false)
    //   }
    //     else{
    //       alert(result.message);
    //   }
    //   });
      }

      const renderItemLoading = () => {

        // console.log('foto ini',imagefoto)
        return (
          <ScreenLoading/>
        )
    }


      const renderItem = ({ item }) => {

        // console.log('foto ini',imagefoto)
        return (
            <View style ={styles.data}>
                  <Text style={[{fontSize : 16, fontWeight : 'bold', color : '#000000', marginVertical : windowHeight*0.01}]}>Pertukaran</Text>

                <View style ={{ flexDirection : 'row' }}>
      <Text style={styles.title}>Shift </Text>
        <Text style={styles.value}>: {item.title1}</Text>
        </View>

                <View style ={{ flexDirection : 'row' }}>
      <Text style={styles.title}>Tanggal</Text>
        <Text style={styles.value}>: {item.start1.substring(0, 10)}</Text>
        </View>
        
        <View style ={{ flexDirection : 'row' }}>
      <Text style={styles.title}>Shift Ditukar </Text>
        <Text style={styles.value}>: {item.title2}</Text>
        </View>
        <View style ={{ flexDirection : 'row' }}>
      <Text style={styles.title}>Tanggal</Text>
        <Text style={styles.value}>: {item.start2.substring(0, 10)}</Text>
        </View>

        <View style ={{ flexDirection : 'row' }}>
      <Text style={styles.title}>Status</Text>
        <Text style={styles.value}>: {item.status}</Text>
        </View>

<View style={{ flexDirection : 'row' }}>
      <View style={styles.btnGroup}>
      <TouchableOpacity style={{ backgroundColor : '#044cd0', marginHorizontal : windowWidht*0.1 }} onPress ={()=>{approve(item.id, "approve")}  }>
      <Text style={{ color : '#FFFFFF', paddingHorizontal :8 }}>Setuju</Text>
      </TouchableOpacity>
      </View>

      <View style={styles.btnGroup}>
      <TouchableOpacity style={{ backgroundColor : '#d72503', marginHorizontal : windowWidht*0.1 }} onPress ={()=>{approve(item.id, "reject")}  }>
      <Text style={{ color : '#FFFFFF', paddingHorizontal :8 }}>Tolak</Text>
      </TouchableOpacity>
      </View>

      </View>
     
             
            </View>
        )
    }
      // if(!loading){
        return (
          <View style={{ flex : 1 }}>
             <SafeAreaView style={{ flex: 1}}>
            <View style={{ flexDirection : 'row' }}>
            <View style ={styles.left}>
              <Text style={styles.title}>Dari</Text>
            <TouchableOpacity style={styles.date} onPress={showDatePicker} ><Text style={styles.btnText}>{date}</Text></TouchableOpacity>
                            <DateTimePickerModal
                              isVisible={isDatePickerVisible}
                              mode="date"
                              onConfirm={handleConfirm}
                              onCancel={hideDatePicker}
                            />
              <TouchableOpacity style={[styles.btn, {backgroundColor : '#e6bc15'}]} onPress ={()=>{resetData()}}>
              <Text style={styles.btnText}>Reset</Text>
              </TouchableOpacity>
            </View>
            <View style ={styles.right}>
            <Text style={styles.title}>Sampai</Text>
      <TouchableOpacity style={styles.date} onPress={showDatePicker2} ><Text style={styles.btnText}>{date2}</Text></TouchableOpacity>
                            <DateTimePickerModal
                              isVisible={isDatePickerVisible2}
                              mode="date"
                              onConfirm={handleConfirm2}
                              onCancel={hideDatePicker2}
                            />
                                  <TouchableOpacity style={[styles.btn,{backgroundColor : '#24A0ED'}]} onPress={()=>{filterData()}}>
                                    <Text style={styles.btnText}>Filter</Text>
      
      </TouchableOpacity>
              </View>
            </View>
        
            <FlatList
                    // ListHeaderComponent={<Text>Hallo</Text>}
                    keyExtractor={(item, index) => index.toString()}
                    data={data}
                    ItemSeparatorComponent={ItemSeparatorView}
                    contentContainerStyle={{ alignItems: 'center' }}
                    renderItem={renderItem}
                    ListFooterComponent={loading ? renderItemLoading : null}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={1}
                    onRefresh={onRefresh}
                    refreshing={refresh}
                    
                />
                <View>
                  {/* <Text>
                  yyyyy
                  </Text> */}
                  
                </View>
      
      
     
          {/* return <View style ={styles.data} key={key}> */}
        

      
      {/* {item.type == "leave" ?
      <TouchableOpacity style={{ backgroundColor : '#e6bc15' }}>
      <Text style={{ color : '#FFFFFF', paddingHorizontal :8 }}>Selesai Cuti</Text>
      </TouchableOpacity>
      
      :
<TouchableOpacity></TouchableOpacity>
      } */}

      {/* </View> */}

      
   
    </SafeAreaView>
          </View>
        )
      }
      // else{
      //   return(
      //     <View>
      //        <ScreenLoading/>
      //     </View>
      //   )
      // }


// }

export default changeShift

const windowWidht =Dimensions.get('window').width;
const windowHeight =Dimensions.get('window').height;
const styles = StyleSheet.create({
left : {
width : windowWidht*0.5,
alignItems : 'center',
},
right : {
  width : windowWidht*0.5,
  alignItems : 'center',
},
date :
{
  width : windowWidht*0.4,
  height : windowHeight*0.04,
  backgroundColor : '#09aeae',
  marginVertical : windowHeight*0.01,
  alignItems : 'center',
  justifyContent : 'center',
},
btn : {
  width : windowWidht * 0.32,
  height : windowHeight*0.04,
  marginBottom : windowHeight*0.02,
  alignItems : 'center',
  justifyContent : 'center',
},
data : {
  width : windowWidht*0.84,
  paddingBottom : windowHeight*0.01,
  backgroundColor : '#FFFFFF',
  marginLeft : 'auto',
  marginRight : 'auto',
  marginVertical : windowHeight*0.01,
  alignItems : 'center',
  borderWidth :2,
  borderColor : '#00000020'
},
title : {
  width : windowWidht*0.3,
  color : '#000000',
  fontSize : 14,
  fontWeight : 'bold',
},
value : {
  width : windowWidht*0.5,
  color : '#000000',
},
 btnText : {
  color : '#FFFFFF',
  fontWeight : 'bold',
 },
 btnGroup : {
  flexDirection : 'row',
  marginTop : windowHeight*0.02,
  alignItems : 'center'
 }

})