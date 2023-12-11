import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { AuthController, UserController } from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon } from '../components';
import { HomeCtaButtons, ArticlesSection, ArticlesHeroSection } from '../containers';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      hero_articles: []
    }
  }

  componentDidMount = async () => {
    let is_signed_in  = await getItem('token') ? true : false;
    let sections      = [];
    let hero_articles = [];

    if (is_signed_in) {
      let articles_res = await UserController.getUserArticles();
      hero_articles    = articles_res.hero_articles || [];
      sections         = articles_res.sections || [];
    } else {
      let new_articles_res = await UserController.getNewUserArticles();
      hero_articles        = new_articles_res.hero_articles || [];
      sections             = articles_res.sections || [];
    }

    this.setState({ sections: sections, hero_articles: hero_articles });
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
      <HomeCtaButtons navigation={this.props.navigation} />
      { this.render_hero_articles()    }
      { this.render_article_sections() }
    </View>
  }

}

const styles = StyleSheet.create({

});

export default HomeTab
