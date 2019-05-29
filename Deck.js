import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  UIManager,
  LayoutAnimation, Alert } from 'react-native';
  import { connect } from 'react-redux';
  import { swiperight } from '../actions/job_actions';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = (Dimensions.get('window').width) * (0.5);

class Deck extends Component {
  // static defaultProps = {
  //   onSwipeRight: (item) => {console.log(item.picid, this,'thilo');
  //   // this.props.swiperight(this.props.phone, item.picid, item.email, item.picurl )
  //   },
  //   onSwipeLeft: () => {}
  // }

  onSwipeRight = (item) => {
    this.props.swiperight(this.props.phone, item.picid, item.email, item.picurl );
    console.log(this, 'him')
  }
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      //this function is executed any time a user taps on the screen, this function will
      //be called.
      //if we return true, we want this instance of the pan responder to be responsible for (var i = 0; i <//the user pressing on the screenngth; i++) {
      //the user pressing on the screen
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy })
      },
      //this callback is called anytime a user drags their finger around the screen
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
      //called anytime a user presses down, drags and then lets go
    });

    this.panResponder = panResponder;
    this.position = position;
    this.state = { index: 0 };
    //this.state = { panResponder };
  }

  onSwipeComplete(direction) {
    // const { onSwipeLeft, onSwipeRight } = this.props;
    const item = this.props.data[this.state.index]
    direction === 'right' ? this.onSwipeRight(item) : this.onSwipeLeft(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
    console.log(this,'lol')
  }

  componentWillReceiveProps(newProps) {
    if (newProps !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  forceSwipe(direction) {

  const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: 250
    }).start(() => this.onSwipeComplete(direction));
  }

  resetPosition() {
    Animated.spring(this.position,
    { toValue: { x: 0, y: 0 }
  }).start();
  }

  getCardStyle() {

    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-120deg', '0deg', '120deg']
    });
    return {
      ...this.position.getLayout(),
      transform: [{ rotate: rotate }]
    };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    } else {
      return this.props.data.map((item, index) => {
      if (this.state.index === index) {
        console.log(item.picid)
        return (
          <Animated.View
          key={item.id}
          style={[this.getCardStyle(), styles.cardStyle]}
          {...this.panResponder.panHandlers}
          >
          {this.props.renderCard(item)}
          </Animated.View>
      );
    } else if (index > this.state.index) {
      return (
        <Animated.View
        key={item.id}
        style={[styles.cardStyle, { top: 10 * (index - this.state.index)}]}
        >
        {this.props.renderCard(item)}
        </Animated.View>
        );
    }
  }).reverse();
  }
}


  render() {
    return (
      <View >
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH ,
    marginTop: SCREEN_HEIGHT * 0.1

    
  }
};

const mapStateToProps = state => {
  return {
    phone: state.auth.phone
  }
}

export default connect(mapStateToProps,{ swiperight })(Deck);
