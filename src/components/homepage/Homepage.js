import React, { Component } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from "reactstrap";
import "./Homepage.scss";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';

const items = [
  {


    caption: 'Easily & Quickly Connect with Talent & Casting Directors In Your City, and Around the World!'
  },
  {


    caption: 'Easily & Quickly Connect with Talent & Casting Directors In Your City, and Around the World!'
  },
  {


    caption: 'Easily & Quickly Connect with Talent & Casting Directors In Your City, and Around the World!'
  }
];

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = { activeIndex: 0, isRedirect: false };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    const isLoggedIn = reactLocalStorage.getObject('isLoggedIn');
    const basicProfileAndProd = reactLocalStorage.getObject("basicProfileAndProd");
    const userResponse = reactLocalStorage.getObject("userResponse");
    if (basicProfileAndProd == true && userResponse.isBasicInfoCompleted == false) {
      window.location.assign('/basic-profile');
      return false;
    }
    if (isLoggedIn == true) {
      this.setState({
        isRedirect: true
      })
    }
  }

  onExiting() {
    this.animating = true;
  }

  onExited() {
    this.animating = false;
  }

  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === items.length - 1 ? 0 : this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? items.length - 1 : this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  render() {
    const { activeIndex, isRedirect } = this.state;

    const basicProfileAndProd = reactLocalStorage.getObject("basicProfileAndProd");
    if (isRedirect == true) {
      return <Redirect
        to={{
          pathname: basicProfileAndProd == false ? `/dashboard` : `/basic-production`
        }} />
    }

    const slides = items.map((item, index) => {
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={index}
        >

          <CarouselCaption captionHeader={item.caption} />
        </CarouselItem>
      );
    });
    return (
      <div>
        <div className="banner-section fixed-wrapper">
          <img src="../../images/banner.jpg" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-8 content-overlapp">
              <div className="wrapper">
                <h1> Where Talent Meets Opportunity</h1>
                <p>
                  Stage &amp; Set is a collaborative community born out of passion for the Arts &amp; Entertainment Industry created to assist all aspects of the space  we love!
                </p>
                <p>
                  Regardless of your role; we’re here to match your talent with the right opportunity. From performers to production, educator to student, live to recorded – we are the place for you!
                </p>
                <p>Whether you’re pursuing your dream as a professional or feeding your passion in your spare time; we match the right talent to the right opportunities and help guide you every step of journey!</p>
                <p>
                  Sign up today, so we can get the cast (or wrap) party started!
                </p>

                <div className="text-center">

                  <a href="/signup" className=" btn dark-pinkbtn">  Sign Up for Your FREE Account Now! </a>

                </div>
              </div>
              {/* <div className="text-center padding-fifteen wrapper-content">
                Easily &amp; Quickly Connect with Talent &amp; Casting Directors In Your
                City, and Around the World!
              </div> */}
              {/* slider */}

              <Carousel
                activeIndex={activeIndex}
                next={this.next}
                previous={this.previous}
                className="text-slider"
              >
                <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
                {slides}
                <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
                <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
              </Carousel>



              {/* <div className="three-dots">
                <ul>
                  <li />
                  <li />
                  <li />
                </ul>
              </div> */}
              <div className="text-center margin-fifteen wrapper-content withoutslider-text">
                Auditions. Casting Calls. Crew Calls. Training. And Much More.
                All-Inclusive site for the Arts &amp; Entertainment
              </div>
            </div>
            <div className="col-md-4 text-center overlapp">
              <div className="phone-img">
                <img src="../../images/phone-img.png" />
              </div>
              <div className="downloadapp ">
                <h3>Download Our App</h3>
                <div className=" download-btn">
                  <a href="#">
                    <img src="../../images/google-play.png" />
                  </a>
                  <a href="">
                    <img src="../../images/apple-icon.png" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Homepage;
