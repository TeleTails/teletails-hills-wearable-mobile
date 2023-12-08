import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon } from '../components';
import { HomeCtaButtons, ArticlesSection, ArticlesHeroSection } from '../containers';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {

    let articles = [ { title: 'New Puppy Training', thumbnail_url: 'https://template.canva.com/EADan-uE-ow/1/0/1600w-dPAgAz_5yB4.jpg', article_id: '' }, { title: 'Early Age Food', thumbnail_url: 'https://template.canva.com/EADan-uE-ow/1/0/1600w-dPAgAz_5yB4.jpg', article_id: '' }, { title: 'Skin Problems', thumbnail_url: 'https://template.canva.com/EADan-uE-ow/1/0/1600w-dPAgAz_5yB4.jpg', article_id: '' }  ]
    let section  = { title: 'Puppy', articles: articles }

    return <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 26, fontWeight: 'semibold' }}>Welcome</Text>
        <TouchableOpacity onPress={ () => { this.props.navigation.push('Settings') }}>
          <Icon name='setting' size={30} />
        </TouchableOpacity>
      </View>
      <HomeCtaButtons navigation={this.props.navigation} />
      <ArticlesHeroSection articles={articles} />
      <ArticlesSection section={section} />
    </View>
  }

}

const styles = StyleSheet.create({

});

export default HomeTab
