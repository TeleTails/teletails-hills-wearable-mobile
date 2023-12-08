import { Component } from 'react';
import { StyleSheet, View, Platform, Image, TouchableOpacity } from 'react-native';
import { Input, Button, Cards, Text, Colors } from '../components';

class ArticlesHeroSection extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render_article_cards = (articles) => {

    let article_cards = articles.map((article) => {
      let title         = article.title;
      let thumbnail_url = article.thumbnail_url;

      if (!title || !thumbnail_url) {
        return null;
      }

      let article_nav_data = {
        article: article,
        article_id: article.article_id
      }

      return <TouchableOpacity style={{ backgroundColor: '#f5f5f5', borderRadius: 20, overflow: 'hidden' }}
                               onPress={ () => {
                                 if (this.props.pressed_action) {
                                   this.props.pressed_action(article_nav_data);
                                 }
                               }}>
        <View style={{ paddingLeft: 5, paddingTop: 15, height: 75, justifyContent: 'center' }}>
          <Text numberOfLines={2} style={{ fontWeight: '500', fontSize: 18, marginBottom: 10, marginLeft: 15, color: '#112268' }}>{ title }</Text>
        </View>
        <Image style={{ height: 180, width: '100%' }} resizeMode='cover' source={{ uri: thumbnail_url }} />
      </TouchableOpacity>
    }).filter((card) => { return card });

    return article_cards;
  }

  render() {
    let hero_articles = this.props.articles || [];

    if (hero_articles.length === 0) {
      return null;
    }

    let article_cards = this.render_article_cards(hero_articles);

    return (
      <View style={styles.main_container}>
        <Cards data={ article_cards }
               dots={true}
               style={{ marginBottom: 0 }}
               dots_type={'lines'}
              />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content_container: {

  },
  category_section_title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'DMSans-Bold'
  },
  main_container: {

  },
  articles_list_container: {
    flexDirection: 'row',
  }
});

export default ArticlesHeroSection
