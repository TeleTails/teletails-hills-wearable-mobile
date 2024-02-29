import { Component }  from 'react';
import { PARTNER_ID } from '@env'
import { SignIn }     from '../containers';
import { StringUtils, DateUtils } from '../utils';
import { AuthController, UserController, ConsultationController } from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Input, Icon, Line, Colors } from '../components';
import { HomeCtaButtons, ArticlesSection, ArticlesHeroSection } from '../containers';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      hero_articles: [],
      active_threads: [],
      chat_consultations: []
    }
  }

  componentDidMount = async () => {
    let is_signed_in      = await getItem('token') ? true : false;
    let pet_food_list     = await getItem('pet_food_list');
    let user_id           = await getItem('user_id');

    if(typeof pet_food_list === 'string') {
      pet_food_list = JSON.parse(pet_food_list);
    }

    let partner_id    = PARTNER_ID;
    let sections      = [];
    let hero_articles = [];
    let chats         = [];

    await setItem('partner_id', partner_id);

    if (is_signed_in) {
      let articles_res = await UserController.getUserArticles();
      hero_articles    = articles_res && articles_res.hero_articles ? articles_res.hero_articles : [];
      sections         = articles_res && articles_res.sections      ? articles_res.sections      : [];

      let chats_res    = await ConsultationController.getClientChatConsultations(partner_id);
          chats        = chats_res && chats_res.data && chats_res.data.care_consultations ? chats_res.data.care_consultations : [];

      let video_res    = await ConsultationController.getUpcomingVideoConsultations(partner_id);
      let videos       = video_res && video_res.data && video_res.data.care_consultations ? video_res.data.care_consultations : [];

      this.get_active_threads();

    } else {
      let new_articles_res = await UserController.getNewUserArticles();
      hero_articles        = new_articles_res && new_articles_res.hero_articles ? new_articles_res.hero_articles : [];
      sections             = new_articles_res && new_articles_res.sections      ? new_articles_res.sections      : [];
    }

    this.setState({ sections: sections, hero_articles: hero_articles, pet_food_list, user_id: user_id, chat_consultations: chats });
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

  render_hero_articles = () => {
    let hero_articles = this.state.hero_articles || [];

    return <View>
      <ArticlesHeroSection articles={hero_articles}
                           pressed_action={ (article) => {
                              this.props.navigation.push('ArticleDisplay', { url: article.url });
                           }}/>
    </View>
  }

  render_search_section = () => {
    let { search_results } = this.state;

    const search_text = (search_value) => {
      let { pet_food_list } = this.state;

      search_value = search_value.toLowerCase();
      let search_tokens = search_value.split(' ');

      let search_results_cat = pet_food_list.cat_food_products.filter(obj => {
          return search_tokens.every(term => obj.toLowerCase().includes(term));
      });

      let search_results_dog = pet_food_list.dog_food_products.filter(obj => {
        return search_tokens.every(term => obj.toLowerCase().includes(term));
      });

      let search_results = search_results_cat.concat(search_results_dog);

      search_results.sort((a,b)=>{return a < b ? -1 : 1})

      this.setState({search_results})
    }

    return <View>
      <Input type={'text'} onChangeText={search_text} />
      {search_results && search_results.length ?
      <View>
        <Text>Results</Text>
        <View style={{flexDirection: 'column'}}>
          {search_results.map(result=><Text style={{padding: 10}}>{result}</Text>)}
        </View>
      </View> : null}
    </View>
  }

  render_article_sections = () => {
    let sections     = this.state.sections || [];
    let section_rows = sections.map((section) => {
      return <View>
        <ArticlesSection section={section}
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

  // <ImageBackground source={ require('../../assets/images/background-paw.png') } resizeMode="cover" style={{ height: 50, width: 50, marginLeft: 40 }}>
  // </ImageBackground>
  // <View style={{ marginTop: 20, marginBottom: 20 }}>
  //   <TouchableOpacity onPress={ () => { this.props.navigation.push('ConsultationStartThread') }}>
  //     <Icon name='setting' size={30} />
  //   </TouchableOpacity>
  //   <TouchableOpacity onPress={ () => { this.props.navigation.push('ConsultationThread') }}>
  //     <Icon name='envelope' size={30} />
  //   </TouchableOpacity>
  // </View>

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

      { this.render_active_chats()     }
      { this.render_active_threads()   }
      { this.render_hero_articles()    }
      { this.render_article_sections() }

      <View style={{ height: 250, paddingRight: 20, paddingLeft: 20, marginBottom: 15 }}>
        <ImageBackground source={ require('../../assets/images/add-pet-cta.png') } resizeMode="contain" style={{ height: '100%' }} imageStyle={{  }}>
          <Text style={{ marginTop: 80, marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>Add your pet for</Text>
          <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>personalized</Text>
          <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>care</Text>
          <TouchableOpacity style={{ backgroundColor: '#F2F3F6', width: 102, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 20, marginTop: 20 }} onPress={ () => { this.props.navigation.push('AddPetFlow') }}>
            <Text style={{ fontSize: 14, fontWeight: 'medium' }}>Add More</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>

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
