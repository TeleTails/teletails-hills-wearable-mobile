import { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Icon, Colors, Button } from '../components';

class Cards extends Component {

  constructor(props) {
    super(props);
    this.state = {
      current_index: 0,
    }

    this.onViewableItemsChanged.bind(this)
  }

  onViewableItemsChanged = ({ viewableItems, changed }) => {
    let new_index_item = viewableItems && viewableItems.length && viewableItems.length > 1 ? viewableItems[1] : viewableItems[0];
        new_index_item = viewableItems && viewableItems.length && viewableItems.length === 2 && viewableItems[0] && viewableItems[0].index === 0 ? viewableItems[0] : new_index_item;

    if(new_index_item) {
      let new_index = new_index_item.index;
      this.setState({ current_index: new_index })
    }
  };

  render_paging_dots = () => {
    let display_dots  = this.props.dots && this.props.dots === true ? true : false;

    if (!display_dots) {
      return null;
    }

    let data          = this.props.data || [];
    let total_dots    = data.length;
    let current_index = this.state.current_index;

    let dots_components = [];
    let dots_style      = this.props.dots_style || 'circles';
        dots_style      = this.props.dots_type === 'lines' ? 'lines' : 'circles';

    for (var i = 0; i < total_dots; i++) {

      let is_selected   = current_index === i;
      let card_btn_idx  = i;

      let bg_color      = is_selected ? Colors.PRIMARY : '#e7e7e7';
          bg_color      = is_selected && this.props.active_dot_color ? this.props.active_dot_color : bg_color;

      if (dots_style === 'lines') {
        let dot_component = <TouchableOpacity style={{ marginRight: 3, marginLeft: 3 }}
                                              onPress={ () => {
                                                let scroll_offset = 0.01 + ((card_btn_idx) * 0.02);
                                                this.scrollToIndex(card_btn_idx === 0 ? 0 : card_btn_idx - scroll_offset);
                                              }}>
                              <View style={{ height: 5, width: 30, borderRadius: 5, backgroundColor: bg_color }}></View>
                            </TouchableOpacity>
        dots_components.push(dot_component);
      } else {
        let dot_component = <TouchableOpacity style={{ marginRight: 3, marginLeft: 3 }}
                                              onPress={ () => {
                                                let scroll_offset = 0.01 + ((card_btn_idx) * 0.02);
                                                this.scrollToIndex(card_btn_idx === 0 ? 0 : card_btn_idx - scroll_offset);
                                              }}>
                              <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: bg_color }}></View>
                            </TouchableOpacity>
        dots_components.push(dot_component);
      }
    }

    return <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5 }}>
      { dots_components }
    </View>
  }

  scrollToIndex = (scroll_index) => {
    this.flatListRef.scrollToIndex({ animated: true, index: scroll_index });
  }

  render_next_button = () => {
    if (!this.props.display_next_button) {
      return null;
    }
    let data           = this.props.data || [];
    let next_index     = this.state.current_index + 1;
    let scroll_offset  = 0.01 + ((next_index) * 0.02);
    let is_last_card   = data.length === this.state.current_index + 1;
    let next_btn_title = is_last_card ? 'Sign Up' : 'Next';
    let last_action    = this.props.last_card_action ? this.props.last_card_action:  () => { };

    return <View style={{ alignItems: 'center', marginTop: 10 }}>
      <Button title={ next_btn_title }
              style={{ width: 330, marginBottom: 10 }}
              onPress={ () => {
                if (is_last_card) {
                  last_action();
                } else {
                  this.scrollToIndex(next_index - scroll_offset);
                }
              }}/>
    </View>
  }

  render() {

    let window       = Dimensions.get('window');
    let window_width = window && window.width ? window.width : 300;
        window_width = window_width > 450 ? 450 : window_width;

    let data_array   = this.props.data  || [];
    let passed_style = this.props.style || {};

    return (
      <View style={passed_style}>
        <FlatList
          horizontal
          ref={(ref) => { this.flatListRef = ref }}
          keyExtractor={ (item, index) => index }
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 15, paddingBottom: 15 }}
          data={data_array}
          decelerationRate={0}
          snapToInterval={window_width - 40}
          onViewableItemsChanged={this.onViewableItemsChanged}
          renderItem={ ({item, index}) => {
            let margin_left  = index === 0 ? 30 : 10;
            let margin_right = index === data_array.length - 1 ? 30 : 10;

            return <View style={{ width: window_width - 60, marginRight: margin_right, marginLeft: margin_left }}>
              { item }
            </View>
          }}
        />
        { this.render_paging_dots() }
        { this.render_next_button() }
      </View>
    );
  }

}

const styles = StyleSheet.create({
  card_container: {

  }
});

export default Cards
