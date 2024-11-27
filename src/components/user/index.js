import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import UserRegistration from './UserRegistration';
import Role from './RolePermissions/Role';
import { checkPermission } from '../../helper/util';
import { getConfigurationKey, handleDepartmentHeader } from '../../helper/auth';
import { USER, ROLE, DEPARTMENT, LEVELS, COMPANY, RFQUSER, DIVISION } from '../../config/constants';
import classnames from 'classnames';
import DepartmentsListing from './DepartmentsListing';
import LevelsListing from './LevelsListing';
import UsersListing from './UsersListing';
import RolesListing from './RolePermissions/RolesListing';
import { reactLocalStorage } from 'reactjs-localstorage';


var isFirstTabActive = false
export const ApplyPermission = React.createContext();

const User = () => {
  const { topAndLeftMenuData } = useSelector(state => state.auth);
  // const [userData, setUserData] = useState({});
  // const [roleData, setRoleData] = useState({});
  // const [departmentData, setDepartmentData] = useState({});
  // const [levelsData, setLevelsData] = useState({});
  // const [rfqUserData, setRfqUserData] = useState({});

  const [state, setState] = useState({
    isOpen: false,
    activeTab: '1',
    isUserForm: false,
    isRolePermissionForm: false,
    data: {},
    ViewUserAccessibility: false,
    ViewRFQUserAccessibility: false,
    ViewRoleAccessibility: false,
    ViewDepartmentAccessibility: false,
    ViewLevelAccessibility: false,
    count: 0,
    RFQUser: false,
  });

  useEffect(() => {
    topAndLeftMenuFunction();
  }, []);
  useEffect(() => {
    if (topAndLeftMenuData !== undefined && state.count === 0) {
      setState(prevState => ({ ...prevState, count: 1 }));
      topAndLeftMenuFunction();
    }
  }, [topAndLeftMenuData, state.count]);


  const topAndLeftMenuFunction = () => {
    let ModuleId = reactLocalStorage.get('ModuleId');
    let leftMenuFromAPI = []
    topAndLeftMenuData && topAndLeftMenuData.map(el => {
      if (el.ModuleId === ModuleId) {
        leftMenuFromAPI = el.Pages
      }
      return null;
    })

    if (topAndLeftMenuData !== undefined) {

      const userPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === USER)
      const rolePermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === ROLE)
      const departmentPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => (el.PageName === DEPARTMENT || el.PageName === COMPANY))
      const levelsPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === LEVELS)
      const RfqUserPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === RFQUSER)
      const divisionPermissions = leftMenuFromAPI && leftMenuFromAPI.find(el => el.PageName === DIVISION)

      const userData = userPermissions && userPermissions.Actions && checkPermission(userPermissions.Actions)
      const roleData = rolePermissions && rolePermissions.Actions && checkPermission(rolePermissions.Actions)
      const departmentData = departmentPermissions && departmentPermissions.Actions && checkPermission(departmentPermissions.Actions)
      const levelsData = levelsPermissions && levelsPermissions.Actions && checkPermission(levelsPermissions.Actions)
      const rfqUserData = RfqUserPermissions && RfqUserPermissions.Actions && checkPermission(RfqUserPermissions.Actions)
      const divisionData = divisionPermissions && divisionPermissions.Actions && checkPermission(divisionPermissions.Actions)
      // setUserData(userData)
      // setRoleData(roleData)
      // setDepartmentData(departmentData)
      // setLevelsData(levelsData)
      // setRfqUserData(rfqUserData)

      if (userData !== undefined) {

        for (var prop in userData) {
          if (userData[prop] === true) {
            isFirstTabActive = true
            setState((prevState) => ({ ...prevState, ViewUserAccessibility: true, activeTab: '1' }))
          }
        }
      }

      if (rfqUserData !== undefined) {

        for (var propRfq in rfqUserData) {
          if (rfqUserData[propRfq] === true) {
            setState((prevState) => ({ ...prevState, ViewRFQUserAccessibility: true, activeTab: isFirstTabActive ? '1' : '5' }))
          }
        }
      }

      if (roleData !== undefined) {
        for (var propRole in roleData) {
          if (roleData[propRole] === true) {
            setState((prevState) => ({ ...prevState, ViewRoleAccessibility: true, activeTab: state.ViewUserAccessibility || isFirstTabActive ? '1' : '2' }))
          }
        }
      }

      if (departmentData !== undefined) {
        for (var propDepart in departmentData) {
          if (departmentData[propDepart] === true) {
            setState((prevState) => ({ ...prevState, ViewDepartmentAccessibility: true, activeTab: state.ViewUserAccessibility || isFirstTabActive ? '1' : (state.ViewRoleAccessibility ? '2' : '3') }))
          }
        }
      }

      if (levelsData !== undefined) {
        for (var propLevel in levelsData) {
          if (levelsData[propLevel] === true) {
            setState((prevState) => ({ ...prevState, ViewLevelAccessibility: true }))
          }
        }
      }

      if (divisionData !== undefined) {
        for (var propDivision in divisionData) {
          if (divisionData[propDivision] === true) {
            setState((prevState) => ({ ...prevState, ViewDivisionAccessibility: true }))
          }
        }
      }

    }
  }

  const toggle = tab => {
    if (state.activeTab !== tab) {
      setState(prevState => ({
        ...prevState,
        activeTab: tab
      }));
    }
  };

  const displayForm = RFQUser => {
    setState(prevState => ({
      ...prevState,
      isUserForm: true,
      isRolePermissionForm: false,
      RFQUser: RFQUser
    }));
  };

  const displayRoleForm = () => {
    setState(prevState => ({
      ...prevState,
      isRolePermissionForm: true,
      isUserForm: false,
      data: { isEditFlag: false, isNewRole: true }
    }));
  };

  const hideForm = () => {
    setState(prevState => ({
      ...prevState,
      isUserForm: false,
      isRolePermissionForm: false,
      data: {}
    }));
  };

  const getUserDetail = data => {
    setState(prevState => ({
      ...prevState,
      isUserForm: true,
      isRolePermissionForm: false,
      data: data,
      RFQUser: data.RFQUser
    }));
  };

  const getRoleDetail = data => {
    setState(prevState => ({
      ...prevState,
      isRolePermissionForm: true,
      isUserForm: false,
      data: data
    }));
  };
  const { isUserForm, isRolePermissionForm, data, ViewUserAccessibility,
    ViewRoleAccessibility, ViewDepartmentAccessibility, ViewLevelAccessibility, ViewRFQUserAccessibility, ViewDivisionAccessibility } = state;

  if (isUserForm === true) {
    return <UserRegistration
      data={data}
      hideForm={hideForm}
      RFQUser={state.RFQUser}
    />
  }

  if (isRolePermissionForm === true) {
    return <Role
      data={data}
      hideForm={hideForm}
    />
  }

  return (
    <Container fluid className="user-page">
      {/* {props.loading && <Loader/>} */}
      <div>
        <Nav tabs className="subtabs">
          {ViewUserAccessibility && <NavItem>
            <NavLink className={classnames({ active: state.activeTab === '1' })} onClick={() => { toggle('1'); }}>
              Manage Users
            </NavLink>
          </NavItem>}
          {ViewRoleAccessibility && <NavItem>
            <NavLink className={classnames({ active: state.activeTab === '2' })} onClick={() => { toggle('2'); }}>
              Manage Roles & Permission
            </NavLink>
          </NavItem>}
          {ViewDepartmentAccessibility && <NavItem>
            <NavLink className={classnames({ active: state.activeTab === '3' })} onClick={() => { toggle('3'); }}>
              {`Manage ${handleDepartmentHeader()}`}
            </NavLink>
          </NavItem>}
          {ViewDivisionAccessibility && getConfigurationKey().IsDivisionAllowedForDepartment && <NavItem>
            <NavLink className={classnames({ active: state.activeTab === '4' })} onClick={() => { toggle('4'); }}>
              Manage Divisions
            </NavLink>
          </NavItem>}
          {ViewLevelAccessibility && <NavItem>
            <NavLink className={classnames({ active: state.activeTab === '5' })} onClick={() => { toggle('5'); }}>
              Manage Levels
            </NavLink>
          </NavItem>}

          {ViewRFQUserAccessibility && getConfigurationKey().IsRFQConfigured && <NavItem>
            <NavLink className={classnames({ active: state.activeTab === '6' })} onClick={() => { toggle('6'); }}>
              Manage RFQ Users
            </NavLink>
          </NavItem>}

        </Nav>
        <TabContent activeTab={state.activeTab}>
          {state.activeTab === '1' && ViewUserAccessibility &&
            <TabPane tabId="1">
              <UsersListing
                RFQUser={false}
                formToggle={displayForm}
                getUserDetail={getUserDetail}
                tabId={state.activeTab}
              />
            </TabPane>}
          {state.activeTab === '2' && ViewRoleAccessibility &&
            <TabPane tabId="2">
              <RolesListing
                formToggle={displayRoleForm}
                getDetail={getRoleDetail}
              />
            </TabPane>}
          {state.activeTab === '3' && ViewDepartmentAccessibility &&
            <TabPane tabId="3">
              <DepartmentsListing
                toggle={toggle} />
            </TabPane>}
          {state.activeTab === '4' && ViewDivisionAccessibility && getConfigurationKey().IsDivisionAllowedForDepartment &&
            <TabPane tabId="4">
              <DepartmentsListing
                toggle={toggle}
                isDivision={true} />
            </TabPane>}
          {state.activeTab === '5' && ViewLevelAccessibility &&
            <TabPane tabId="5">
              <LevelsListing
                toggle={toggle} />
            </TabPane>}
          {state.activeTab === '6' && ViewRFQUserAccessibility &&
            <TabPane tabId="6">
              <UsersListing
                RFQUser={true}
                formToggle={displayForm}
                getUserDetail={getUserDetail}
                tabId={state.activeTab}
              />
            </TabPane>}
        </TabContent>
      </div>
    </Container>
  );
};

export default User;

