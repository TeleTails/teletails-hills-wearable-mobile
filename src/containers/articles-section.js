import { Component } from 'react';
import { StyleSheet, View, Platform, FlatList, Image, TouchableOpacity } from 'react-native';
import { Input, Button, Text } from '../components';

class ArticlesSection extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {

  }

  render_article_cards = (section) => {
    let title    = section.title;
    let articles = section.articles;

    return <View style={{ marginTop: 20, marginBottom: 5 }}>
      <Text style={{ fontWeight: 'semibold', fontSize: 17, marginBottom: 10, marginLeft: 20 }}>{ title }</Text>
      <FlatList
        horizontal
        ref={(ref) => { this.flatListRef = ref }}
        keyExtractor={ (item, index) => index }
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        data={articles}
        renderItem={ ({item, index}) => {
          let article_title = item.title;
          let article_image = item.thumbnail_url;
          let left_margin   = index === 0 ? 20 : 0;
          let content_html  = item.content_html;
          let article_id    = item.article_id;
          let bubble_height = Platform.OS === 'web' ? 126 : 130;

          let article_nav_data = {
            title: article_title,
            url: item.url
          }

          return <TouchableOpacity style={{ height: bubble_height, width: 163, marginLeft: left_margin, marginRight: 15, backgroundColor: '#f5f5f5', borderRadius: 12, overflow: 'hidden', backgroundColor: 'white' }}
                                   onPress={ () => {
                                     if (this.props.pressed_action) {
                                       this.props.pressed_action(article_nav_data);
                                     }
                                   }}>
            <Image resizeMode='cover' style={{ height: 80 }} source={{ uri: article_image }} />
            <Text numberOfLines={2} style={{ flex: 1, width: 160, padding: 5, paddingLeft: 8, color: '#4b4b4b' }}>{ article_title }</Text>
          </TouchableOpacity>
        }}
      />
    </View>
  }

  render() {

    let section          = this.props.section || {};
    let section_title    = section.title      || '';
    let section_articles = section.articles   || [];

    if (!section_title || section_articles.length === 0) {
      return null;
    }

    return (
      <View style={styles.main_container}>
        <View style={styles.content_container}>
          { this.render_article_cards(section) }
        </View>
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

export default ArticlesSection
