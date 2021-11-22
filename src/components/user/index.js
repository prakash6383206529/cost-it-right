import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import UserRegistration from './UserRegistration';
import Role from './RolePermissions/Role';
import { checkPermission } from '../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getConfigurationKey, loggedInUserId } from '../../helper/auth';
import { USER, ROLE, DEPARTMENT, LEVELS } from '../../config/constants';
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
      ViewUserAccessibility: false,
      ViewRoleAccessibility: false,
      ViewDepartmentAccessibility: false,
      ViewLevelAccessibility: false,
    }
  }

  componentDidMount() {
    let ModuleId = reactLocalStorage.get('ModuleId');
    let leftMenuFromAPI = []
    const { topAndLeftMenuData } = this.props;
    topAndLeftMenuData && topAndLeftMenuData.map(el => {
      if (el.ModuleId === ModuleId) {
        leftMenuFromAPI = el.Pages
      }
      return null;
    })

    if (topAndLeftMenuData !== undefined) {

      const userPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === USER)
      const rolePermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === ROLE)
      const departmentPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === DEPARTMENT)
      const levelsPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === LEVELS)

      const userData = userPermissions && userPermissions.Actions && checkPermission(userPermissions.Actions)
      const roleData = rolePermissions && rolePermissions.Actions && checkPermission(rolePermissions.Actions)
      const departmentData = departmentPermissions && departmentPermissions.Actions && checkPermission(departmentPermissions.Actions)
      const levelsData = levelsPermissions && levelsPermissions.Actions && checkPermission(levelsPermissions.Actions)

      if (userData !== undefined) {
        this.setState({
          ViewUserAccessibility: userData && userData.View ? userData.View : false,
          ViewRoleAccessibility: roleData && roleData.View ? roleData.View : false,
          ViewDepartmentAccessibility: departmentData && departmentData.View ? departmentData.View : false,
          ViewLevelAccessibility: levelsData && levelsData.View ? levelsData.View : false,
          activeTab: userData && userData.View ? '1' : (roleData && roleData.View ? '2' : (departmentData && departmentData.View ? '3' : '4'))
        })
      }
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
    this.setState({ isRolePermissionForm: true, isUserForm: false, data: {}, })
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
    const { isUserForm, isRolePermissionForm, data, ViewUserAccessibility,
      ViewRoleAccessibility, ViewDepartmentAccessibility, ViewLevelAccessibility, } = this.state;

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
            {ViewUserAccessibility && <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                Manage Users
              </NavLink>
            </NavItem>}
            {ViewRoleAccessibility && <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                Manage Roles & Permission
              </NavLink>
            </NavItem>}
            {ViewDepartmentAccessibility && <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                {`Manage ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Departemnt'}`}
              </NavLink>
            </NavItem>}
            {ViewLevelAccessibility && <NavItem>
              <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                Manage Levels
              </NavLink>
            </NavItem>}
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            {this.state.activeTab === '1' && ViewUserAccessibility &&
              <TabPane tabId="1">
                <UsersListing
                  formToggle={this.displayForm}
                  getUserDetail={this.getUserDetail}
                />
              </TabPane>}
            {this.state.activeTab === '2' && ViewRoleAccessibility &&
              <TabPane tabId="2">
                <RolesListing
                  formToggle={this.displayRoleForm}
                  getDetail={this.getRoleDetail}
                />
              </TabPane>}
            {this.state.activeTab === '3' && ViewDepartmentAccessibility &&
              <TabPane tabId="3">
                <DepartmentsListing
                  toggle={this.toggle} />
              </TabPane>}
            {this.state.activeTab === '4' && ViewLevelAccessibility &&
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
function mapStateToProps({ auth }) {
  const { leftMenuData, loading, topAndLeftMenuData } = auth;

  return { leftMenuData, loading, topAndLeftMenuData };
}


export default connect(mapStateToProps,
  {
  }
)(User);

