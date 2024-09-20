import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform, Image } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, MediaModal} from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { PetsController, UserController, AuthController } from '../controllers';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MediaController }  from '../controllers';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home'
    }
  }

  componentDidMount = () => {
    this.pull_pet_food_list();
  }

  render_tab_component = () => {
    switch (this.state.selected_tab) {
      case 'home':
        return <HomeTab navigation={this.props.navigation} tab_chang_action={ (tab_name) =>  { this.setState({ selected_tab: tab_name }) }} />
      case 'health':
        return <HealthTab navigation={this.props.navigation} />
      case 'vet_chat':
        return <CareTab navigation={this.props.navigation}   />
      case 'shop':
        return <ShopTab navigation={this.props.navigation}   />
      default:
        return null;
    }
  }

  add_image = async (media_object) => {
    let media_uri     = media_object.url || '';

    console.log('media_uri', media_uri);

    let upload_response = await MediaController.uploadPrivateMediaFromLibrary(media_uri);

    console.log('upload_response', upload_response)
    this.setState({ upload_response, opened_modal: false })
  }

  downloadImage = async (media_object) => {
    try {
      let is_video = false;

      let media_uri;
      let image_uri = '1723215863628.jpg';
      let video_media_url = 'big_buck_bunny_720p_1mb.mp4'

      if(is_video) {
        media_uri = video_media_url;
      } else {
        media_uri = image_uri
      }

      let download_response = await MediaController.downloadPrivateMedia(media_uri);

      //{"success":true,"message":{"ServerSideEncryption":"AES256","Location":"https://teletails-wearables.s3.amazonaws.com/uploads/1723048150926.jpg","Bucket":"teletails-wearables","Key":"uploads/1723048150926.jpg","ETag":"\"5a261f60c0901189da9c58955abfe38d-2\""}}

      let fileUri = is_video ? `${FileSystem.cacheDirectory}video.mp4` : `${FileSystem.cacheDirectory}image.png`;
      await FileSystem.writeAsStringAsync(fileUri, download_response.file, {
          encoding: FileSystem.EncodingType.Base64,
      });

      console.log('fileUri', fileUri)

      //console.log('download_response', download_response);
      this.setState({ file_uri: fileUri, is_video, opened_modal: false })
    } catch(err) {
      console.log('err', err);
    }
  }

  downloadImageOrVideo = async (media_object) => {
    try {
      
      let data = {
        public_id: 'nrlwj7ju',
        retrieve_url: true, 
        url_expiration_time: 30
      }

      let download_response = await MediaController.downloadPrivateMediaFromObject(data);
console.log('download_response', download_response)
      //{"success":true,"message":{"ServerSideEncryption":"AES256","Location":"https://teletails-wearables.s3.amazonaws.com/uploads/1723048150926.jpg","Bucket":"teletails-wearables","Key":"uploads/1723048150926.jpg","ETag":"\"5a261f60c0901189da9c58955abfe38d-2\""}}

      if(download_response.url) {
        this.setState({ file_uri: download_response.url, is_video: true, opened_modal: false })
      } else {
        let file = download_response.file.base64_data;
        let content_type = download_response.file.content_type;
        let is_video = content_type.includes('video');
        let image_type = content_type.includes('image') ? content_type.replace('image/', '') : 'png';

        console.log('is_video', is_video);
        console.log('image_type', image_type);

        let fileUri = is_video ? `${FileSystem.cacheDirectory}video.mp4` : `${FileSystem.cacheDirectory}image.${image_type}`;
        await FileSystem.writeAsStringAsync(fileUri, file, {
            encoding: FileSystem.EncodingType.Base64,
        });

        this.setState({ file_uri: fileUri, is_video, opened_modal: false })
      }
    } catch(err) {
      console.log('err', err);
    }
  }

  render_media_modal = () => {
    return <MediaModal display={this.state.opened_modal}
              keep_as_local={true}
              button_title='Add Image'
              close_action={ () => {
                this.setState({ opened_modal: false })
              }}
              media_action={ (media_object) => {
                if (media_object && media_object.type === 'image') {
                  this.add_image(media_object)
                }
              }} />
  }
  

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;
    let file_uri = this.state.file_uri;
    let is_video = this.state.is_video;

    return (
      <>
        <SafeAreaView style={{ backgroundColor: '#F2F3F6', flex: 0 }} />
        <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
          <View style={{ height: top_padding }} />
          <View>
            <TouchableOpacity style={styles.add_image_container}
                                onPress={ ()=> { this.setState({ opened_modal: true }) }}>
              <Icon name='plus-circle' color='#e7e7e7' />
              <Text style={styles.add_image_button_title}>Add Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.add_image_container}
                                onPress={this.downloadImage}>
              <Icon name='plus-circle' color='#e7e7e7' />
              <Text style={styles.add_image_button_title}>Download Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.add_image_container}
                                onPress={this.downloadImageOrVideo}>
              <Icon name='plus-circle' color='#e7e7e7' />
              <Text style={styles.add_image_button_title}>Download Image 3</Text>
            </TouchableOpacity>
            {file_uri ?
            (is_video ?
                  <Video style={{width: 200, height: 200}}
                    source={{uri: file_uri}}
                    useNativeControls
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                  /> : <Image style={{width: 200, height: 200}} source={{uri: file_uri}}/> ): null}
            

            {this.state.opened_modal ? this.render_media_modal() : null}
          </View>
          <ScrollView style={{ backgroundColor: '#F2F3F6' }} contentContainerStyle={{ flexGrow: 1 }}>
            { this.render_tab_component() }
          </ScrollView>
          
          <Tabs selected_tab={this.state.selected_tab}
                home_action={        () => { this.home_tab_action()    }}
                health_action={      () => { this.health_action()      }}
                vet_chat_action={    () => { this.vet_chat_action()    }}
                shop_action={        () => { this.shop_action()        }}
              />
        </SafeAreaView>
      </>
    );
  }

  home_tab_action = async () => {
    await analytics().logEvent('login', { tab_name: 'home' });
    this.setState({ selected_tab: 'home' })
  }

  health_action = async () => {
    await analytics().logEvent('login', { tab_name: 'health' });
    this.setState({ selected_tab: 'health' })
  }

  vet_chat_action = async () => {
    await analytics().logEvent('login', { tab_name: 'vet_chat' })
    this.setState({ selected_tab: 'vet_chat' })
  }

  shop_action = async () => {
    await analytics().logEvent('tab_changed', { tab_name: 'shop' })
    this.setState({ selected_tab: 'shop' })
  }

  pull_pet_food_list = async () => {
    let current_food_list     = await getItem('pet_food_list');

    let last_updated_date_db  = await PetsController.getLatestPetFoodUpdateDate();
    let last_updated_date_app = await getItem('latest_pet_food_update');

    let is_currently_empty    = !current_food_list;
    let food_list_outdated    = true;

    if (last_updated_date_app && last_updated_date_db) {
      let last_updated_date_app_obj = new Date(last_updated_date_app);
      let last_updated_date_db_obj  = new Date(last_updated_date_db);
      food_list_outdated            = last_updated_date_db_obj.toString() === last_updated_date_app_obj.toString() ? false : true;
    }

    let fetch_new_pet_food = food_list_outdated || is_currently_empty;

    if (fetch_new_pet_food) {
      PetsController.getPetFood().then(async (response) => {
        if (response && response.cat_food_products) {
          await setItem('latest_pet_food_update', last_updated_date_db);
          await setItem('pet_food_list', JSON.stringify(response));
        }
      });
    }

  }

}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


/*
  <Text onPress={ async () => {
    await setItem('testing', 'Yes');
  }}>Set Storage</Text>
  <Text style={{ fontFamily: 'Poppins-Thin' }} onPress={ async () => {
    let stored_item = await getItem('testing');
    console.log(stored_item)
  }}>GET STORAGE</Text>
  <Input type='date-mmddyyyy' label='Date' value={this.state.date}  onChangeText={ (date_str) => { this.setState({ date: date_str }) }} />
  <Button title='Get' />
  <Checkbox checked={true} />
  <Icon name='home' size={40} color='#1dc2ff' />
  <View style={{ width: '100%', height: 200 }}>
  <Cards data={[ <View style={{ backgroundColor: 'pink', flex: 1, height: '100%' }}></View>, <View style={{ backgroundColor: 'pink', marginRight: 10, height: 200, width: 100 }}></View>, <View style={{ backgroundColor: 'pink', marginRight: 10, height: 200, width: 100 }}></View> ]} />
  </View>
  <Text style={{ height: 150 }}>This is a poppins font that haser been applied to the home screen.</Text>
  <LottieView autoPlay style={{ width: 200, height: 200, backgroundColor: '#eee' }} source={ require('../assets/animations/dog-trot.json') } />
  <Text onPress={ () => { this.props.navigation.push('Settings') }}>Home File CLASS! world!</Text>
  */
