import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { DangerZone } from 'expo';
import { chatClientFactory } from 'wix-chat-workshop-client';

const chatClient = chatClientFactory( WebSocket )();
const { Lottie } = DangerZone;

export default class App extends Component {
  constructor( props ) {
    super( props );
    this.state = {
      connected: false,
      messages: [],
      message: ''
    }
  }

  async componentDidMount() {
    await chatClient.connect(
      'powerful-oasis-26116.herokuapp.com',
      80,
      'Nikas',
      '123'
    );
    chatClient.onEvent( 'message', this.onNewMessage );
    this.setState( { connected: true } );
    this.statusAnimation.reset();
    this.statusAnimation.play();
    const messages = await chatClient.getMessages( 'main' );
    this.setState( { messages } );
  }

  onNewMessage = ( message ) => {
    this.addNewMessage( message );
  };

  addNewMessage = message => {
    this.setState( {
      messages: [
        message,
        ...this.state.messages
      ]
    } );
  };

  renderMessage = ( data ) => {
    const message = data.item;
    return (
      <Animatable.View animation="lightSpeedIn">
        <Text>From: {message.from}. Text: {message.content}</Text>
      </Animatable.View>
    );
  };

  keyExtractor = item => item.id;

  textChangeHandler = message => {
    this.setState( { message } )
  };

  onPressButton = async () => {
    if ( !this.state.message ) return;
    const message = await chatClient.send( 'main', this.state.message );
    this.addNewMessage( message );
    this.setState( { message: '' } );
  };

  render() {
    const statusText = this.state.connected ? 'Connected!' : 'Not connected!';
    return (
      <View style={styles.keyboardContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.container}>
          <View style={styles.headerContainer}>
            <Lottie
              ref={ref => this.statusAnimation = ref}
              source={require( './checked_done' )}
              loop={false}
              style={{
                marginTop: 50,
                width: 100,
                height: 100
              }}
            />
            <Text>{statusText}</Text>
          </View>
          <View style={styles.messageContainer}>
            <FlatList
              inverted
              data={this.state.messages}
              renderItem={this.renderMessage}
              keyExtractor={this.keyExtractor}
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.textInputContainer}>
              <TextInput style={styles.textInput} value={this.state.message} onChangeText={this.textChangeHandler}/>
            </View>
            <TouchableOpacity onPress={this.onPressButton}>
              <View style={styles.button}>
                <Text>Send</Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create( {
  keyboardContainer: {
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messageContainer: {
    borderWidth: 1,
    borderColor: 'red',
    flex: 10
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: 'blue',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInputContainer: {
    flex: 10,
    borderWidth: 1,
    borderColor: 'green',
  },
  textInput: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'cyan',
    height: 36
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'magenta'
  }
} );
