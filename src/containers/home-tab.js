import { Component }  from 'react';
import { PARTNER_ID } from '@env'
import { SignIn }     from '../containers';
import { StringUtils, DateUtils } from '../utils';
import { AuthController, UserController, ConsultationController, WearablesController } from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Input, Icon, Line, Colors } from '../components';
import { HomeCtaButtons, ArticlesSection, ArticlesHeroSection } from '../containers';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      hero_articles: [],
      active_threads: [],
      chat_consultations: [],
      recommended_diet: [],
      diet_pet_name: '',
      is_wearables_user: false,
      display_add_pets: false
    }
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener();
    }
  }

  componentDidMount = async () => {
    let is_signed_in      = await getItem('token') ? true : false;
    let user_id           = await getItem('user_id');
    let hide_add_pets     = await getItem('hide_add_pets');
    let display_add_pets  = hide_add_pets && hide_add_pets === 'true' ? false : true;

    let partner_id    = PARTNER_ID;
    let sections      = [];
    let hero_articles = [];
    let chats         = [];

    await setItem('partner_id', partner_id);

    this.get_active_chats();
    this.get_active_threads();
    this.get_video_appointments();
    this.get_recommended_diet();
    this.check_and_regsiter_wearables_user();

    if (is_signed_in) {
      let articles_res = await UserController.getUserArticles();
      hero_articles    = articles_res && articles_res.hero_articles ? articles_res.hero_articles : [];
      sections         = articles_res && articles_res.sections      ? articles_res.sections      : [];
    } else {
      let new_articles_res = await UserController.getNewUserArticles();
      hero_articles        = new_articles_res && new_articles_res.hero_articles ? new_articles_res.hero_articles : [];
      sections             = new_articles_res && new_articles_res.sections      ? new_articles_res.sections      : [];
    }

    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.get_active_chats();
      this.get_active_threads();
      this.get_video_appointments();
    });

    this.setState({ sections: sections, hero_articles: hero_articles, user_id: user_id, display_add_pets: display_add_pets });
  }

  render_active_threads = () => {
    let active_threads = this.state.active_threads;

    if (!active_threads || active_threads.length === 0) {
      return null;
    }

    let thread_rows = active_threads.map((thread, ind) => {
      let thread_id = thread._id;
      let subject   = thread.subject || 'Provider Message';
      let preview   = this.get_thread_preview_text(thread.last_message);
      let show_dot  = this.get_show_dot(thread.last_message);

      return <View key={thread_id}>
        <TouchableOpacity style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
                          onPress={ () => { this.props.navigation.push('ConsultationThread', { thread_id: thread_id }) }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: 'medium', color: '#040415', flex: 1 }} numberOfLines={2} ellipsizeMode='tail'>{ subject }</Text>
            <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }} numberOfLines={2} ellipsizeMode='tail'>{ preview }</Text>
          </View>
          { show_dot === true ? <View style={{ height: 10, width: 10, backgroundColor: Colors.RED, borderRadius: 5 }} />
                              : <Icon name='chevron-right' size={13} color={ 'grey' } /> }
        </TouchableOpacity>
        <Line hide={ active_threads.length - 1 === ind } />
      </View>
    })

    return <View style={{ paddingLeft: 20, paddingRight: 20, marginTop: 20 }}>
      <Text style={styles.section_title}>Your Provider Messages</Text>
      <View style={{ backgroundColor: 'white', borderRadius: 12, paddingRight: 20, paddingLeft: 20, marginTop: 15 }}>
        { thread_rows }
      </View>
    </View>
  }

  render_recommended_diet = () => {
    let pet_name  = this.state.diet_pet_name;
    let diet_name = "Hill's Science Diet Adult Perfect Weight & Joint Support";
    let rec_diet  = this.state.recommended_diet;
    let rec_cups  = rec_diet && rec_diet.length && rec_diet[0] && rec_diet[0].recommendedAmountCups ? rec_diet[0].recommendedAmountCups : 0;
    let rec_str   = rec_cups       ? rec_cups + ' cups of Hill’s Science Diet Adult Perfect Weight & Joint Support per day.' : "Hill's Science Diet Adult Perfect Weight & Joint Support";
        rec_str   = rec_cups === 1 ? rec_cups + ' cup of Hill’s Science Diet Adult Perfect Weight & Joint Support per day.'  : rec_str;
    let has_diet  = rec_diet && rec_diet.length > 0;

    if (!pet_name || !has_diet) { return null }

    return <View style={{ paddingLeft: 20, paddingRight: 20, marginTop: 20 }}>
      <Text style={styles.section_title}>{ pet_name + "'s Recommended Diet"}</Text>
      <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 20, paddingTop: 20, paddingBottom: 20, marginTop: 15, justifyContent: 'space-between', flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'medium', alignSelf: 'center' }}>{ rec_str }</Text>
          <TouchableOpacity style={{ backgroundColor: '#F2F3F6', width: 182, height: 46, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 20 }}
                            onPress={ () => {
                              if (this.props.tab_chang_action) {
                                this.props.tab_chang_action('health');
                              }
                            }}>
            <Text style={{ fontSize: 14, fontWeight: 'medium' }}>Pet Food information</Text>
          </TouchableOpacity>
        </View>
        <Image style={{ height: 120, width: 80, borderRadius: 10, alignSelf: 'center' }} resizeMode='contain' source={ require('../../assets/images/recommended-diet.png') } />
      </View>
    </View>
  }

  render_hero_articles = () => {
    let hero_articles = this.state.hero_articles || [];

    return <View>
      <ArticlesHeroSection articles={hero_articles}
                           pressed_action={ (article) => {
                              this.props.navigation.push('ArticleDisplay', { url: article.url });
                           }}/>
    </View>
  }

  render_article_sections = () => {
    let sections     = this.state.sections || [];
    let section_rows = sections.map((section, ind) => {
      return <View>
        <ArticlesSection section={section}
                         key={ind}
                         pressed_action={ (article) => {
                           this.props.navigation.push('ArticleDisplay', { url: article.url });
                         }} />
      </View>
    })

    return <View>
      { section_rows }
    </View>
  }

  render_active_chats = () => {
    let chat_consultations = this.state.chat_consultations;

    if (!chat_consultations || chat_consultations.length === 0) {
      return null;
    }

    let filtered_chats     = chat_consultations.filter((care_consultation) => { return care_consultation.status === 'ACTIVE' || care_consultation.status === 'IN_PROGRESS' });

    let chat_rows = filtered_chats.map((care_consultation, idx) => {
      let patient  = care_consultation && care_consultation.patient  ? care_consultation.patient  : {};
      let name     = StringUtils.displayName(patient);
      let category = care_consultation && care_consultation.category ? care_consultation.category : {};
          category = StringUtils.keyToDisplayString(category);

      let date_obj = care_consultation.created_at ? new Date(care_consultation.created_at) : care_consultation.created_at;
      let date_num = DateUtils.getDateNumber(date_obj);
      let add_zero = date_num.toString().length === 1;
      let date_str = DateUtils.getLongMonth(date_obj) + ' ' + DateUtils.getDateNumber(date_obj);
          date_str = add_zero ? DateUtils.getLongMonth(date_obj) + ' 0' + DateUtils.getDateNumber(date_obj) : date_str;
          date_str = !care_consultation.updated_at ? '' : date_str;

      let care_consultation_id = care_consultation._id;
      let show_dot             = this.get_show_dot(care_consultation.last_message);

      return <View key={care_consultation_id}>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('ConsultationChat', { care_consultation_id: care_consultation_id }) }}>
          <View>
            <Text style={styles.selection_row_title}>{ name }</Text>
            <View style={{ height: 3 }} />
            <Text style={styles.selection_row_subtitle}>{ category }</Text>
            <Text style={styles.selection_row_subtitle}>{ date_str }</Text>
          </View>
          { show_dot === true ? <View style={{ height: 10, width: 10, backgroundColor: Colors.RED, borderRadius: 5 }} />
                              : <Icon name='chevron-right' size={13} color={ 'grey' } /> }
        </TouchableOpacity>
        <Line hide={ idx === filtered_chats.length - 1 } />
      </View>
    })

    if (chat_rows.length === 0) { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Active Chats</Text>
      <View style={styles.list_container}>
        { chat_rows }
      </View>
    </View>
  }

  render_add_pets_section = () => {
    let display_add_pets = this.state.display_add_pets;

    if (!display_add_pets) {
      return null;
    }

    return <View style={{ height: 250, paddingRight: 20, paddingLeft: 20, marginBottom: 25 }}>
      <ImageBackground source={ require('../../assets/images/add-pet-cta.png') } resizeMode="contain" style={{ height: '100%' }} imageStyle={{  }}>
        <Text style={{ marginTop: 80, marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>Add your pets for</Text>
        <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>personalized</Text>
        <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>care</Text>
        <TouchableOpacity style={{ backgroundColor: '#F2F3F6', width: 102, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 20, marginTop: 20 }} onPress={ () => { this.props.navigation.push('AddPetFlow') }}>
          <Text style={{ fontSize: 14, fontWeight: 'medium' }}>Add</Text>
        </TouchableOpacity>
      </ImageBackground>
      <TouchableOpacity style={{ alignSelf: 'center', padding: 5, paddingRight: 15, paddingLeft: 15, borderRadius: 5 }}
                        onPress={ async () => {
                          setItem('hide_add_pets', 'true');
                          this.setState({ display_add_pets: false });
                        }}>
        <Text style={{ textAlign: 'center', fontSize: 16, color: Colors.PRIMARY }}>I'm done adding pets</Text>
      </TouchableOpacity>
    </View>
  }

  render() {
    return <View>

      <ImageBackground source={ require('../../assets/images/background-paw.png') } resizeMode="contain" style={{ backgroundColor: Colors.PRIMARY, borderRadius: 14 }} imageStyle={{ marginLeft: '60%', marginBottom: 55 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: 20, paddingBottom: 0 }}>
          <Text style={{ fontSize: 26, fontWeight: 'semibold', color: 'white' }}>Welcome</Text>
          <TouchableOpacity onPress={ () => { this.props.navigation.push('Settings') }}>
            <Icon name='setting' size={24} color='white' />
          </TouchableOpacity>
        </View>
        <View style={{  paddingLeft: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'semibold', color: 'white' }}>Get Connected</Text>
        </View>
        <View style={{ height: 100 }} />
        <View style={{ height: 60, backgroundColor: '#F2F3F6' }} />
        <View style={{ position: 'absolute', width: '100%', marginTop: 130 }}>
          <HomeCtaButtons navigation={this.props.navigation} />
        </View>
      </ImageBackground>

      { /*

        <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                          onPress={ async () => {
                            let pet_id            = '7875';
                            let behavior_response = await WearablesController.getPetBehavior({ pet_id: pet_id });

                          }}>
          <Text>Get Behavior Data</Text>
        </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let wearables_user_profile = await getItem('wearables_user_profile');
                          let pet_id = '7855';
                          let wearables_user_id = wearables_user_profile.userId;

                          let request_data = {
                            "petWeightId": 0,
                            "petId": pet_id,
                            "userId": wearables_user_id,
                            "weight": 44,
                            "weightUnit": "kg",
                            "addDate": "2024-05-09"
                          }
                          let add_weight_response = await WearablesController.addPetWeight({ pet_weight_data: request_data });

                        }}>
        <Text>Get User Pets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let user_id            = await getItem('user_id');
                          let request_data       = { user_id: user_id, wearables_pet_id: '7855' };
                          let user_pets_response = await WearablesController.getWearablesPet(request_data);
                          let pet = user_pets_response.data.pet;
                        }}>
        <Text>Get User Pets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let user_pets_response = await WearablesController.getUserPets({});
                          let pets = user_pets_response.data.pets;
                        }}>
        <Text>Get User Pets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let user_profile_response = await WearablesController.getUserProfile({});

                          console.log(user_profile_response)
                          console.log(user_profile_response.data.wearables_user_profile.address)
                        }}>
        <Text>User Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let user                   = await getItem('user');
                          let wearables_user_profile = await getItem('wearables_user_profile');
                          let pet_parent_id   = user && user.wearables_data && user.wearables_data.pet_parent_id ? user.wearables_data.pet_parent_id : '';
                          let pet_address     = wearables_user_profile && wearables_user_profile.address;

                          let pet_parent_info = {
                            PetParentID: pet_parent_id,
                            FirstName: wearables_user_profile.firstName,
                            LastName: wearables_user_profile.lastName,
                            Phone: wearables_user_profile.phoneNumber,
                            Email: wearables_user_profile.email
                          };

                          let pet_details = {
                            About: {
                              brandId: 117,
                              foodIntake: 4,
                              feedUnit: 1,
                              PetAddress: wearables_user_profile.address,
                              IsPetWithPetParent: 1,
                              PetID: "",
                              PetName: "Kenny",
                              PetGender: "Female",
                              IsUnknown: "false",
                              PetBirthday: "2022-01-22",
                              PetBreedID: "4",
                              IsMixed: "false",
                              PetMixBreed: "",
                              PetWeight: "80",
                              WeightUnit: "1",
                              PetBFI: "",
                              IsNeutered: "false",
                            },
                            PetParentInfo: pet_parent_info
                          }

                          let add_pet_response = await WearablesController.addNewPet({ pet_details: pet_details });

                          console.log(add_pet_response)
                        }}>
        <Text>Add New Pet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let food_brands = await WearablesController.getDogFoodBrands();
                          console.log(food_brands.data)
                        }}>
        <Text>Dog Food Brands</Text>
      </TouchableOpacity>



      <TouchableOpacity style={{ padding: 20, backgroundColor: Colors.GREEN, borderRadius: 20, marginTop: 20, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let address_data = { address: '12416 Manchester Way, Woodbridge, VA 22192' }
                          let address_response = await WearablesController.validateAddress(address_data);
                          console.log(address_response)
                        }}>
        <Text>Address Validation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let feeding_preferences = await WearablesController.getAllFeedingPreferences();
                          console.log(feeding_preferences)
                        }}>
        <Text>Feeding Preferences</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let species = await WearablesController.getAllSpecies();
                          console.log(species)
                        }}>
        <Text>Species</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let breeds = await WearablesController.getAllDogBreeds();
                          console.log(breeds)
                        }}>
        <Text>Dog Breeds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let breeds = await WearablesController.getAllCatBreeds();
                          console.log(breeds)
                        }}>
        <Text>Cat Breeds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let food_brands = await WearablesController.getDogFoodBrands();
                          console.log(food_brands)
                        }}>
        <Text>Dog Food Brands</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ padding: 20, backgroundColor: 'pink', borderRadius: 20, marginTop: 10, marginRight: 20, marginLeft: 20 }}
                        onPress={ async () => {
                          let food_brands = await WearablesController.getCatFoodBrands();
                          console.log(food_brands)
                        }}>
        <Text>Cat Food Brands</Text>
      </TouchableOpacity>

    */ }

      { this.render_add_pets_section() }
      { this.render_active_chats()     }
      { this.render_active_threads()   }
      { this.render_recommended_diet() }
      { this.render_hero_articles()    }
      { this.render_article_sections() }

    </View>
  }

  get_active_threads = async () => {
    let user_id      = await getItem('user_id');
    let request_data = { client_id: user_id }
    ConsultationController.getActiveThreads(request_data).then((response) => {
      let active_threads = response.success && response.data && response.data.care_consultations ? response.data.care_consultations : [];
      this.setState({ active_threads: active_threads });
    }).catch((err) => {  });
  }

  get_active_chats = async () => {
    let partner_id = PARTNER_ID;
    let chats_res  = await ConsultationController.getClientChatConsultations(partner_id);
        chats      = chats_res && chats_res.data && chats_res.data.care_consultations ? chats_res.data.care_consultations : [];
    this.setState({ chat_consultations: chats });
  }

  get_video_appointments = async () => {
    let partner_id = PARTNER_ID;
    let video_res  = await ConsultationController.getUpcomingVideoConsultations(partner_id);
    let videos     = video_res && video_res.data && video_res.data.care_consultations ? video_res.data.care_consultations : [];
    this.setState({ video_consultations: videos });
  }

  get_thread_preview_text = (message) => {
    let preview_text = 'Message From Provider';
    if (message) {
      let text_msg = message.type === 'TEXT'  && message.content && message.content.text ? message.content.text : 'Message From Provider';
      preview_text = message.type === 'TEXT'  ? text_msg         : preview_text;
      preview_text = message.type === 'IMAGE' ? 'Attached Image' : preview_text;
      preview_text = message.type === 'VIDEO' ? 'Attached Video' : preview_text;
      preview_text = message.type === 'PDF'   ? 'Attached PDF'   : preview_text;
    }
    return preview_text;
  }

  get_show_dot = (message, is_last) => {
    let user_id   = this.state.user_id;
    let sender_id = message && message.from ? message.from : '';
    let show_dot  = user_id && sender_id && user_id !== sender_id;
    return show_dot;
  }

  get_recommended_diet = async () => {
    let user_pets_response = await WearablesController.getUserPets({});
    let pets               = user_pets_response && user_pets_response.data && user_pets_response.data.pets ? user_pets_response.data.pets : [];
    let first_pet          = pets && pets.length && pets[0] ? pets[0] : {};
    let pet_id             = first_pet && first_pet.petID   ? first_pet.petID   : '';
    let pet_name           = first_pet && first_pet.petName ? first_pet.petName : '';

    if (!pet_id) { return }

    let today     = new Date();
    let diet_data = {
      date: `${today.getFullYear()}-${today.getMonth() < 9 ? '0' : ''}${today.getMonth() + 1}-${today.getDate()}`,
      pet_id: pet_id
    }

    let recommended_diet = await WearablesController.getRecommendedDiet(diet_data);
        recommended_diet = recommended_diet && recommended_diet.data && recommended_diet.data.recommended_diet ? recommended_diet.data.recommended_diet : [];

    this.setState({ recommended_diet: recommended_diet, diet_pet_name: pet_name });
  }

  check_and_regsiter_wearables_user = async () => {
    let user              = await AuthController.getUser(true);
    let wearables_user_id = user && user.wearables_user_id || '';

    console.log('user', user);

    if (!wearables_user_id) {
      let register_response = await WearablesController.registerNewUser();
      let updated_user      = await AuthController.getUser(true);
      if (updated_user && updated_user.wearables_user_id) {
        this.update_wearables_user_profile();
        this.setState({ is_wearables_user: true });
      }
    } else {
      this.update_wearables_user_profile();
      this.setState({ is_wearables_user: true });
    }
  }

  update_wearables_user_profile = async () => {
    let wearables_user_profile = await getItem('wearables_user_profile');

    if (wearables_user_profile) {

    } else {
      let user_profile_res = await WearablesController.getUserProfile({});
      let user_profile     = user_profile_res && user_profile_res.data && user_profile_res.data.wearables_user_profile ? user_profile_res.data.wearables_user_profile : null;
      await setItem('wearables_user_profile', user_profile);
    }

  }

}

const styles = StyleSheet.create({
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
  },
  section_container: {
    marginTop: 25,
    paddingLeft: 20,
    paddingRight: 20
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
  },
  selection_row_container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selection_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30
  },
  selection_row_title: {
    fontSize: 15,
    fontWeight: 'medium',
    color: '#040415',
    flex: 1
  },
  selection_row_subtitle: {
    fontSize: 14,
    color: '#575762'
  },
  list_container: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 15
  }
});

export default HomeTab
