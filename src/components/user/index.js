import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import UserRegistration from './UserRegistration';
import Role from './RolePermissions/Role';
import Department from './Department';
import Level from './Level';
import LevelUser from './LevelUser';
import LevelTechnology from './LevelTechnology';
import PermissionsUserWise from './PermissionsUserWise';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import classnames from 'classnames';
import DepartmentsListing from './DepartmentsListing';
import LevelsListing from './LevelsListing';
import UsersListing from './UsersListing';
import RolesListing from './RolePermissions/RolesListing';


class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      activeTab: '1',
      isUserForm: false,
      isRolePermissionForm: false,
      data: {},
    }
  }


  /**
 * @method toggle
 * @description toggling the tabs
 */
  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  displayForm = () => {
    this.setState({ isUserForm: true, isRolePermissionForm: false, })
  }

  displayRoleForm = () => {
    this.setState({ isRolePermissionForm: true, isUserForm: false, })
  }

  hideForm = () => {
    this.setState({ isUserForm: false, isRolePermissionForm: false, data: {} })
  }

  getUserDetail = (data) => {
    this.setState({ isUserForm: true, isRolePermissionForm: false, data: data })
  }

  getRoleDetail = (data) => {
    this.setState({ isRolePermissionForm: true, isUserForm: false, data: data })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isUserForm, isRolePermissionForm, data } = this.state;

    if (isUserForm === true) {
      return <UserRegistration
        data={data}
        hideForm={this.hideForm}
      />
    }

    if (isRolePermissionForm === true) {
      return <Role
        data={data}
        hideForm={this.hideForm}
      />
    }

    return (
      <Container fluid className="user-page">
        {/* {this.props.loading && <Loader/>} */}
        <div>
          <h1>User Management</h1>
          <Nav tabs className="subtabs">
            <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                Manage Users
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                Manage Roles & Permission
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                Manage Department
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                Manage Levels
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            {this.state.activeTab === '1' &&
              <TabPane tabId="1">
                <UsersListing
                  formToggle={this.displayForm}
                  getUserDetail={this.getUserDetail}
                />
              </TabPane>}
            {this.state.activeTab === '2' &&
              <TabPane tabId="2">
                <RolesListing
                  formToggle={this.displayRoleForm}
                  getDetail={this.getRoleDetail}
                />
              </TabPane>}
            {this.state.activeTab === '3' &&
              <TabPane tabId="3">
                <DepartmentsListing
                  toggle={this.toggle} />
              </TabPane>}
            {this.state.activeTab === '4' &&
              <TabPane tabId="4">
                <LevelsListing
                  toggle={this.toggle} />
              </TabPane>}
          </TabContent>
        </div>
      </Container >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ }) {
}


export default connect(
  mapStateToProps, {}
)(User);

