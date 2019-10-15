import React, { Component } from "react";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
} from "reactstrap";
import "./NavBar.scss";

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: false,
      dropdownOpen: false,
      isOpen: false,
      extra: false,
      isRedirect: false,
      url: '',
      isRefreshed: '',
      notificationCount: 0,
      messageNotificationCount: 0
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
  }

  /**
   * @method toggleMenue
   * @description Toggle the visibility of sidebar menue.
   */
  toggleMenue = () => {
    this.setState({ menu: !this.state.menu });
  };

  logout = (e) => {
    e.preventDefault();
    const toastrConfirmOptions = {
      onOk: () => {
        this.props.logUserOut();
      },
      onCancel: () => console.log('CANCEL: clicked')
    };
    return toastr.confirm(`Are you sure do you want to logout ?`, toastrConfirmOptions);
  };

  /** @method user dropdown
  * */
  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  /** @method mobile menu open
   * */
  toggleMobile = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <nav>
          <div className="flex-conatiner sign-social before-login">
            {/* <Nav className="ml-auto top-menu">
              <NavItem>
                <NavBtn className=" nav-link" to="/login">Sign In</NavBtn>
              </NavItem>
              <NavItem>
                <NavBtn className=" nav-link" to="/signup">Sign Up</NavBtn>
              </NavItem>
            </Nav> */}
            {/* <div className="flex-conatiner social_icon">
              <a href="https://www.instagram.com/stage_n_set/" target="_blank">
                <img src={require("../../assests/images/insta.png")} />
              </a>
              <a href="https://www.facebook.com/stageandset/" target="_blank">
                <img src={require("../../assests/images/fb.png")} />
              </a>
              <a href="https://twitter.com/StageNSet/" target="_blank">
                <img src={require("../../assests/images/twiiter.png")} />
              </a>
            </div> */}
            <NavbarToggler className="navbar-light" onClick={this.toggleMobile} />
          </div>
        {/* )} */}
       
          <Nav className="ml-auto top-menu logout">
            {/* <Link className="bell-notifcation-icon" to="/notifications">
              <span className="icon-notification"> </span>
              {this.state.notificationCount > 0 ? <Badge color="danger">{this.state.notificationCount > 0 ? this.state.notificationCount : ''}</Badge> : ''}

            </Link> */}
            <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
              <DropdownToggle nav caret className="userImg-header">
                <div className="img-only">
                  <img src="../../images/defaultUser.png" />
                  {/* {imagePreview} */}
                </div>
                <span>
                  priyanka
                </span>
              </DropdownToggle>
              {/* <DropdownMenu right>
                <DropdownItem tag="a" href={`/user/${userData.id}`} >My Profile</DropdownItem>
                <DropdownItem tag="a" href={`/view-company/${userData.productionId}`} >Production Company Details</DropdownItem>
                <DropdownItem tag="a" href={`/resume-builder`} >Resume Builder</DropdownItem>
                <DropdownItem tag="a" href="" onClick={this.logout}>Logout</DropdownItem>
              </DropdownMenu> */}
            </Dropdown>
            <NavbarToggler className="navbar-light float-right" onClick={this.toggleMobile} />
          </Nav>
        <Navbar className="menu-bottom-list " expand="md">

          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto menu-list">
                <NavItem>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                </NavItem>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Masters</a>
                  <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <a className="dropdown-item" href= '/UOMMaster'>Unit Of Measurement Master</a>
                    <a className="dropdown-item" href="/PartMaster">Part Master</a>
                    <a className="dropdown-item" href= '/category-master'>Category Master</a>
                    <a className="dropdown-item" href="">SAP Master</a>
                    <a className="dropdown-item" href="#">Supplier Materail Quata</a>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Report</a>
                  <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <a className="dropdown-item" href= '#'>Contribution Report</a>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Technology</a>
                  <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <a className="dropdown-item" href= '#'>Sheet metal</a>
                  </div>
                </li>
                {/* <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>About</DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem tag="a" href="/about-us"> About us</DropdownItem>
                    <DropdownItem tag="a" href="/terms-conditions">Terms and Conditions</DropdownItem>
                    <DropdownItem tag="a" href="/privacy-policy"> Privacy and Policy</DropdownItem>
                    <DropdownItem tag="a" href="/contact-us"> Contact us</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown> */}
            </Nav>
          </Collapse>
        </Navbar>
      </nav>
    );
  }
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({}) {
  return {

  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(
  mapStateToProps, null
)(SideBar);
