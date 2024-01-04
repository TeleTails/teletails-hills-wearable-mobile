import React, { Component } from "react";
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Screen, Line, Text, Icon, Input, Button } from '../components';
import { setItem, getItem } from '../../storage';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { ScrollView } from "react-native-gesture-handler";

class VetLocatorScreen extends Component {
  constructor(props) {
    super(props);

    let markers = [
      {
      latlng: { latitude: 40.716950, longitude: -74.039770 }, 
      title: "123 Montgomery, JC", 
      description: "description over here",
      zipcode: "07302"
    }, {
      latlng: { latitude: 40.726710, longitude: -74.047150 }, 
      title: "123 Coles, JC", 
      description: "description over here",
      zipcode: "07302"
    }, {
      latlng: { latitude: 40.715910, longitude: -74.052550 }, 
      title: "123 Monmouth, JC", 
      description: "description over here",
      zipcode: "07302"
    }, {
      latlng: { latitude: 40.7451301, longitude: -74.0345922 }, 
      title: "616 Grand St, Hoboken, NJ 07030", 
      description: "description over here",
      zipcode: "07030"
    }, {
      latlng: { latitude: 40.7409038, longitude: -74.0295975 }, 
      title: "329 Washington St, Hoboken, NJ 07030", 
      description: "description over here",
      zipcode: "07030"
    }, {
      latlng: { latitude: 40.7405239, longitude: -74.0325594 }, 
      title: "301 Park Ave, Hoboken, NJ 07030", 
      description: "description over here",
      zipcode: "07030"
    }]

    this.state = {
      markers,
      view: 0,
      initial_region: {
        latitude: 40.931520, longitude: -73.964840,
        latitudeDelta: .05,
        longitudeDelta: .05,
      },
      region: {
        latitude: 40.931520, longitude: -73.964840,
        latitudeDelta: .05,
        longitudeDelta: .05,
      },
      all_markers: markers,
      org_initial_region: {
        latitude: 40.931520, longitude: -73.964840,
        latitudeDelta: .05,
        longitudeDelta: .05,
      },
    }

    this.mapRef = React.createRef();

    this.search = this.search.bind(this);
    this.calculateCenter = this.calculateCenter.bind(this);
    this.calculateHaversineDistance = this.calculateHaversineDistance.bind(this);
    this.calculateFarthestDistance = this.calculateFarthestDistance.bind(this);
    this.searchThis = this.searchThis.bind(this);
    this.isCoordinateWithinBoundary = this.isCoordinateWithinBoundary.bind(this);
  }

  componentDidMount() {
    let markers = this.state.all_markers;

    let latlongs = markers.map(a=>a.latlng)
    let latlong_center = this.calculateCenter(latlongs)

    let delta = this.calculateFarthestDistance(latlong_center, latlongs);

    console.log('delta', delta);

    this.setState({
      region: {
        ...latlong_center,
        latitudeDelta: .05,
        longitudeDelta: .05
      }
    })
  }

  calculateCenter(coordinates) {
    if (coordinates.length === 0) {
      return null; // Handle empty array if needed
    }
  
    // Calculate average latitude and longitude
    const totalCoordinates = coordinates.length;
    const totalLatitude = coordinates.reduce((sum, { latitude }) => sum + latitude, 0);
    const totalLongitude = coordinates.reduce((sum, { longitude }) => sum + longitude, 0);
  
    const centerLatitude = totalLatitude / totalCoordinates;
    const centerLongitude = totalLongitude / totalCoordinates;
  
    return { latitude: centerLatitude, longitude: centerLongitude };
  }

  calculateHaversineDistance(coord1, coord2) {
    const R = 6371; // Radius of the Earth in kilometers
  
    const deg2rad = (deg) => deg * (Math.PI / 180);
  
    const dLat = deg2rad(coord2.latitude - coord1.latitude);
    const dLon = deg2rad(coord2.longitude - coord1.longitude);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coord1.latitude)) * Math.cos(deg2rad(coord2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c; // Distance in kilometers
    return distance;
  }
  
  calculateFarthestDistance(center, coordinates) {
    if (coordinates.length === 0) {
      return null; // Handle empty array if needed
    }
  
    let farthestDistance = 0;
  
    for (const coord of coordinates) {
      const distance = this.calculateHaversineDistance(center, coord);
      farthestDistance = Math.max(farthestDistance, distance);
    }
  
    return farthestDistance;
  }

  search(zipcode) {
    console.log('zipcode', zipcode)
    let region = this.state.org_initial_region;
    let markers = this.state.all_markers;

    if(zipcode.length === 5) {
      console.log('getting to markers')
      markers = this.state.all_markers.filter(marker=>marker.zipcode === zipcode);
      console.log('markers', markers)

      let latlongs = markers.map(a=>a.latlng)
      let latlong_center = this.calculateCenter(latlongs)

      if(markers.length) {
        region = {
          ...region,
          ...latlong_center
        }
      }
    } 

    this.setState({
      markers,
      region
    })
  }

  isCoordinateWithinBoundary(coordinate_obj, boundary) {
    const { northEast, southWest } = boundary;
    let coordinate = coordinate_obj.latlng;
  
    return (
      coordinate.latitude <= northEast.latitude &&
      coordinate.latitude >= southWest.latitude &&
      coordinate.longitude <= northEast.longitude &&
      coordinate.longitude >= southWest.longitude
    );
  }

  async searchThis() {
    //{"northEast": {"latitude": 40.75601660355013, "longitude": -73.99648147821672}, "southWest": {"latitude": 40.706016603545166, "longitude": -74.08225822178323}}
    let boundaries = await this.mapRef.getMapBoundaries();

    let markers = this.state.all_markers;

    markers = markers.filter((coordinate) => this.isCoordinateWithinBoundary(coordinate, boundaries));

    this.setState({
      markers
    })
  }

  render() {
    let { view, markers, region } = this.state;
    
    return <Screen title='Vet Locator' scroll={true} navigation={this.props.navigation}>
      <ScrollView style={{flex: 1}}>
        <View style={{flexDirection: 'column'}}>
          <View>
            <Input label={ 'Enter Zipcode' }
                  value={this.state.email}
                  labelStyle={{ fontWeight: '500', fontSize: 16 }}
                  style={{ marginBottom: 10 }}
                  onChangeText={this.search} />
          </View>
          
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
            <Button title={ 'Map View' }
                  style={{ backgroundColor: view === 0 ? 'black' : 'gray' }}
                  onPress={()=>this.setState({view: 0})}/>
            </View>
            <View style={{flex: 1}}>
              <Button title={ 'List View' }
                  style={{ backgroundColor: view === 1 ? 'black' : 'gray' }}
                  onPress={()=>this.setState({view: 1})}/>
            </View>
          </View>
          {view === 0 ? 
          <View style={{flex: 1, width: '100%', height: 300, position: 'relative'}}>
            <View style={{flex: 1, position: 'absolute', width: '100%', zIndex: 1}}>
              <Button style={{padding: 2, position: 'relative', margin: 'auto'}} title={'Search This Area'} onPress={this.searchThis} />
            </View>
            <MapView 
              ref={node=>this.mapRef=node}
              showsScale={true}
              zoomEnabled={true}
              zoomTapEnabled={true}
              zoomControlEnabled={true}
              region={region}
              style={{width: '100%', height: '100%'}} >
                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    coordinate={marker.latlng}
                    title={marker.title}
                    description={marker.description}
                  />
                ))}
            </MapView>
          </View> : <View style={{flex: 1, flexDirection: 'column'}}>

                {markers.map((marker, index) => (
                  <View style={{ flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1 }}>
                    <Text>{marker.title}</Text>
                    <Text>{marker.description}</Text>
                  </View>
                ))}
          </View>}
        </View>
      </ScrollView>
    </Screen>
  }

}

export default VetLocatorScreen;

const styles = StyleSheet.create({

});
