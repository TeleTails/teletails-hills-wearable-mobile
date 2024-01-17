import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { StringUtils }      from '../utils';
import { AuthController, UserController, ConsultationController } from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Input, Icon, Line } from '../components';
import { HomeCtaButtons, ArticlesSection, ArticlesHeroSection } from '../containers';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      hero_articles: [],
      active_threads: []
    }
  }

  componentDidMount = async () => {
    let is_signed_in  = await getItem('token') ? true : false;
    let pet_food_list = await getItem('pet_food_list');

    if(typeof pet_food_list === 'string') {
      pet_food_list = JSON.parse(pet_food_list);
    }

    let partner_id    = config.partner_id;
    let sections      = [];
    let hero_articles = [];

    if (is_signed_in) {
      let articles_res = await UserController.getUserArticles();
      hero_articles    = articles_res && articles_res.hero_articles ? articles_res.hero_articles : [];
      sections         = articles_res && articles_res.sections      ? articles_res.sections      : [];

      let chats_res    = await ConsultationController.getClientChatConsultations(partner_id);
      let chats        = chats_res && chats_res.data && chats_res.data.care_consultations ? chats_res.data.care_consultations : [];

      let video_res    = await ConsultationController.getUpcomingVideoConsultations(partner_id);
      let videos       = video_res && video_res.data && video_res.data.care_consultations ? video_res.data.care_consultations : [];

      this.get_active_threads();

    } else {
      let new_articles_res = await UserController.getNewUserArticles();
      hero_articles        = new_articles_res && new_articles_res.hero_articles ? new_articles_res.hero_articles : [];
      sections             = new_articles_res && new_articles_res.sections      ? new_articles_res.sections      : [];
    }

    this.setState({ sections: sections, hero_articles: hero_articles, pet_food_list });
  }

  render_active_threads = () => {
    let active_threads = this.state.active_threads;

    if (!active_threads || active_threads.length === 0) {
      return null;
    }

    let thread_rows = active_threads.map((thread, ind) => {
      let thread_id = thread._id;
      let subject   = thread.subject || 'Provider Message';
      let pet_name  = thread.patient ? StringUtils.displayName(thread.patient) : '';
      return <View>
        <TouchableOpacity style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                          onPress={ () => { this.props.navigation.push('ConsultationThread', { thread_id: thread_id }) }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#040415' }}>{ subject }</Text>
            <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }}>{ pet_name }</Text>
          </View>
          <Icon name='chevron-right' size={13} color='grey' />
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={{ paddingLeft: 20, paddingRight: 20 }}>
      <Text style={styles.section_title}>Provider Messages</Text>
      { thread_rows }
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

  render() {
    return <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 26, fontWeight: 'semibold' }}>Welcome</Text>
        <TouchableOpacity onPress={ () => { this.props.navigation.push('Settings') }}>
          <Icon name='setting' size={30} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={{ padding: 20, margin: 20, borderWidth: 1, borderRadius: 12 }}
                        onPress={ () => {
                          this.props.navigation.push('AddPetFlow');
                        }}>
        <Text>Start Add Pet Flow</Text>
      </TouchableOpacity>
      <HomeCtaButtons navigation={this.props.navigation} />
      <View style={{ marginTop: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={ () => { this.props.navigation.push('ConsultationStartThread') }}>
          <Icon name='setting' size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => { this.props.navigation.push('ConsultationThread') }}>
          <Icon name='envelope' size={30} />
        </TouchableOpacity>
      </View>
      { this.render_active_threads()   }
      { this.render_hero_articles()    }
      { this.render_article_sections() }
      { this.render_search_section()   }
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

}

const styles = StyleSheet.create({
  section_title: {
    fontSize: 22,
    fontWeight: 'semibold'
  }
});

export default HomeTab
