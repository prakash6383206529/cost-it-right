import React, { Component } from "react";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import {
  Collapse, Navbar, NavbarToggler, Nav, NavItem, NavLink, Dropdown, DropdownToggle,
  DropdownItem, DropdownMenu
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
          <NavbarToggler className="navbar-light" onClick={this.toggleMobile} />
        </div>
        {/* )} */}

        <Nav className="ml-auto top-menu logout">
          <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle caret>
              Harish
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>
                <Link className="bell-notifcation-icon" to="/login">
                  Login
                </Link>
              </DropdownItem>
              {/* <DropdownItem>
                <Link className="bell-notifcation-icon" to="/signup">
                  Register
                </Link>
              </DropdownItem> */}
            </DropdownMenu>
          </Dropdown>
          <NavbarToggler className="navbar-light float-right" onClick={this.toggleMobile} />
        </Nav>
        <Navbar className="menu-bottom-list " expand="md">

          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto menu-list">
              <NavItem>
                <NavLink href="/dashboard">Dashboard</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/part-bom-register">Part & BOM Register</NavLink>
              </NavItem>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Masters1</a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a className="dropdown-item" href="/plant-master">Plant Master</a>
                  <a className="dropdown-item" href="/supplier-master">Supplier Master</a>
                  <a className="dropdown-item" href="/raw-material-master">Raw Material Master</a>
                  <a className="dropdown-item" href="/material-master">Raw Material Detail Master</a>
                  <a className="dropdown-item" href='/UOMMaster'>UOM Master</a>
                  <a className="dropdown-item" href="/PartMaster">Part Master</a>
                  <a className="dropdown-item" href='/category-master'>Category Master</a>
                  <a className="dropdown-item" href="/bom-master">BOM Master</a>
                  <a className="dropdown-item" href="/bop-master">BOP Master</a>
                  <a className="dropdown-item" href="/other-operation">Other Operation</a>
                  <a className="dropdown-item" href="/ced-other-operation">CED Other Operation</a>
                  <a className="dropdown-item" href="/mhr-master">MHR Master</a>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Masters2</a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown1">
                  <a className="dropdown-item" href="/operation-master">Process Operation</a>
                  <a className="dropdown-item" href="/freight-master">Freight Master</a>
                  <a className="dropdown-item" href="/labour-master">Labour Master</a>
                  <a className="dropdown-item" href="/overhead-profit-master">Overhead and Profit</a>
                  <a className="dropdown-item" href="/depreciation-master">Depreciation Master</a>
                  <a className="dropdown-item" href="/process-master">Process Master</a>
                  <a className="dropdown-item" href="/interest-rate-master">Interest Rate Master</a>
                  <a className="dropdown-item" href="/fuel-master">Fuel Master</a>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Report</a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a className="dropdown-item" href='#'>Contribution Report</a>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Technology</a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a className="dropdown-item" href='/costing'>Sheet metal</a>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Profile</a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a className="dropdown-item" href='/user'>User</a>
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
function mapStateToProps({ }) {
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
