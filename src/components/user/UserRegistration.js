import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import {
  minLength3, minLength6, maxLength11, maxLength12, required, email, minLength7, maxLength18,
  maxLength10, maxLength6, checkWhiteSpaces, postiveNumber, maxLength80, maxLength3, acceptAllExceptSingleSpecialCharacter
} from "../../helper/validation";
import { renderPasswordInputField, focusOnError, renderEmailInputField, renderText, searchableSelect, } from "../layout/FormInputs";
import {
  registerUserAPI, getAllRoleAPI, getAllDepartmentAPI, getUserDataAPI, getAllUserDataAPI, updateUserAPI, setEmptyUserDataAPI, getRoleDataAPI, getAllTechnologyAPI,
  getPermissionByUser, getUsersTechnologyLevelAPI, setUserAdditionalPermission, setUserTechnologyLevelForCosting, updateUserTechnologyLevelForCosting, getLevelByTechnology
} from "../../actions/auth/AuthActions";
import { getAllCities } from "../../actions/Common";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { loggedInUserId } from "../../helper/auth";
import { Table, Button } from 'reactstrap';
import "./UserRegistration.scss";
import { CONSTANT } from "../../helper/AllConastant";
import NoContentFound from "../common/NoContentFound";
import $ from 'jquery';
import HeaderTitle from "../common/HeaderTitle";
import PermissionsTabIndex from "./RolePermissions/PermissionsTabIndex";
import ConfirmComponent from "../../helper/ConfirmComponent";

class UserRegistration extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      token: '',
      maxLength: maxLength11,
      countryCode: false,
      lowerCaseCheck: false,
      upperCaseCheck: false,
      numberCheck: false,
      lengthCheck: false,
      specialCharacterCheck: false,
      isLoader: false,
      isSubmitted: false,
      isShowHide: false,
      isShowHidePassword: false,
      isRedirect: false,
      isSignup: false,
      department: [],
      role: [],
      city: [],
      isEditFlag: false,
      isShowForm: false,
      UserId: '',

      IsShowAdditionalPermission: false,
      Modules: [],
      oldModules: [],

      technology: [],
      level: [],
      TechnologyLevelGrid: [],
      oldTechnologyLevelGrid: [],
      technologyLevelEditIndex: '',
      isEditIndex: false,
      isShowPwdField: true,
      isLoader: false
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    const { data } = this.props;
    this.props.setEmptyUserDataAPI('', () => { })
    this.props.getAllRoleAPI(() => { })
    this.props.getAllDepartmentAPI(() => { })
    this.props.getAllCities(() => { })
    this.props.getAllTechnologyAPI(() => { })
    this.props.getLevelByTechnology('', () => { })
    this.getUserDetail(data);
  }

  /**
  * @name Capitalize
  * @desc Capitallize the first letter of the string
  */
  Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
  * @name hanldePhoneNumber
  * @param e
  * @desc Validate phone number
  */
  hanldePhoneNumber = e => {
    const value = e.target.value;
    var number = value.split("");

    if (number[0] === "6" && number[1] === "1") {
      if (number.length === 11) {
        this.setState({ maxLength: maxLength12, countryCode: true });
      }
    }

    if (number[0] === "0") {
      if (number.length === 10) {
        this.setState({ maxLength: maxLength11, countryCode: false });
      }
    }
  };

  /**
  * @name passwordPatternHandler
  * @param e
  * @desc Validate password pattern
  */
  passwordPatternHandler = e => {
    const value = e.target.value;
    const input = value;
    var number = input.split("");

    if (/^(?=.*[a-z])/.test(value) === true) {
      this.setState({ lowerCaseCheck: true });
    } else {
      this.setState({ lowerCaseCheck: false });
    }

    if (/^(?=.*[A-Z])/.test(value) === true) {
      this.setState({ upperCaseCheck: true });
    } else {
      this.setState({ upperCaseCheck: false });
    }

    if (/^(?=.*\d)/.test(value)) {
      this.setState({ numberCheck: true });
    } else {
      this.setState({ numberCheck: false });
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      this.setState({ specialCharacterCheck: true });
    } else {
      this.setState({ specialCharacterCheck: false });
    }

    if (number.length >= 6) {
      this.setState({ lengthCheck: true });
    } else {
      this.setState({ lengthCheck: false });
    }
  };

  showHideHandler = () => {
    this.setState({ isShowHide: !this.state.isShowHide })
  }

  showHidePasswordHandler = () => {
    this.setState({ isShowHidePassword: !this.state.isShowHidePassword })
  }

  /**
  * @method selectType
  * @description Used show listing
  */
  searchableSelectType = (label) => {
    const { roleList, departmentList, cityList, technologyList, levelSelectList } = this.props;
    const temp = [];

    if (label === 'role') {
      roleList && roleList.map(item => {
        if (item.RoleName === 'SuperAdmin') return false
        temp.push({ label: item.RoleName, value: item.RoleId })
      });
      return temp;
    }

    if (label === 'department') {
      departmentList && departmentList.map(item =>
        temp.push({ label: item.DepartmentName, value: item.DepartmentId, CompanyId: item.CompanyId })
      );
      return temp;
    }

    if (label === 'city') {
      cityList && cityList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'technology') {
      technologyList && technologyList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'level') {
      levelSelectList && levelSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
      });
      return temp;
    }
  }

  /**
    * @method departmentHandler
    * @description Used to handle 
    */
  departmentHandler = (newValue, actionMeta) => {
    this.setState({ department: newValue });
  };

  /**
    * @method roleHandler
    * @description Used to handle 
    */
  roleHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {

      this.setState({ role: newValue, Modules: [], IsShowAdditionalPermission: false, }, () => {
        const { role } = this.state;
        this.getRoleDetail(role.value)
      });

    } else {

      this.setState({
        role: [],
        Modules: [],
        IsShowAdditionalPermission: false,
      });

    }
  };

  /**
  * @method cityHandler
  * @description Used to handle city
  */
  cityHandler = (newValue, actionMeta) => {
    this.setState({ city: newValue });
  };

  /**
  * @method getUserDetail
  * @description used to get user detail
  */
  getUserDetail = (data) => {
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: false,
        isShowForm: true,
        IsShowAdditionalPermission: true,
        isShowPwdField: data.passwordFlag ? true : false,
        UserId: data.UserId,
      })
      if (data.passwordFlag === false) {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
      }

      this.props.getUserDataAPI(data.UserId, (res) => {
        if (res && res.data && res.data.Data) {

          let Data = res.data.Data;

          setTimeout(() => {
            const { roleList, departmentList, cityList } = this.props;

            const RoleObj = roleList && roleList.find(item => item.RoleId === Data.RoleId)
            const DepartmentObj = departmentList && departmentList.find(item => item.DepartmentId === Data.DepartmentId)
            const CityObj = cityList && cityList.find(item => item.Value === Data.CityId)

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsShowAdditionalPermission: Data.IsAdditionalAccess,
              department: DepartmentObj !== undefined ? { label: DepartmentObj.DepartmentName, value: DepartmentObj.DepartmentId } : [],
              role: RoleObj !== undefined ? { label: RoleObj.RoleName, value: RoleObj.RoleId } : [],
              city: CityObj !== undefined ? { label: CityObj.Text, value: CityObj.Value } : [],
            })

            if (Data.IsAdditionalAccess) {
              this.getUserPermission(data.UserId)
            }

          }, 500)

          this.getUsersTechnologyLevelData(data.UserId)
          if (data.passwordFlag) {
            $('input[type="password"]').get(0).focus()
          }
        }
      })
    }
  }

  /**
  * @method getUserPermission
  * @description used to get user additional permissions
  */
  getUserPermission = (UserId) => {
    this.props.getPermissionByUser(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        this.setState({
          Modules: Data.Modules,
          oldModules: Data.Modules
        }, () => {
          this.child.getUpdatedData(Data.Modules)
        })
      }
    })
  }

  /**
  * @method getUsersTechnologyLevelData
  * @description used to get users technology level listing
  */
  getUsersTechnologyLevelData = (UserId) => {
    this.props.getUsersTechnologyLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {

        let Data = res.data.Data;
        let TechnologyLevels = Data.TechnologyLevels;

        this.setState({
          TechnologyLevelGrid: TechnologyLevels,
          oldTechnologyLevelGrid: TechnologyLevels,
        })
      }
    })
  }

  //Below code for Table rendering...... 

  /**
   * @method onPressUserPermission
   * @description Used for User's additional permission
   */
  onPressUserPermission = () => {
    const { IsShowAdditionalPermission, role } = this.state;
    if (role && role.value) {
      this.setState({ IsShowAdditionalPermission: !IsShowAdditionalPermission, Modules: [] }, () => {
        this.getRoleDetail(role.value);
      });
    } else {
      toastr.warning('Please select role.')
    }
  }

  /**
    * @method setInitialModuleData
    * @description SET INITIAL MODULE DATA FROM PERMISSION TAB
    */
  setInitialModuleData = (data) => {
    this.setState({ Modules: data })
  }

  /**
   * @method moduleDataHandler
   * @description used to set PERMISSION MODULE
   */
  moduleDataHandler = (data, ModuleName) => {
    const { Modules } = this.state;
    let tempArray = [];
    let temp111 = data;

    let isAnyChildChecked = data && data.map((item, i) => {
      let index = item.Actions.findIndex(el => el.IsChecked === true)
      if (index !== -1) {
        temp111[i].IsChecked = true;
        tempArray.push(index)
      }
      return null;
    })

    let isParentChecked = temp111.findIndex(el => el.IsChecked === true)
    const isAvailable = Modules && Modules.findIndex(a => a.ModuleName === ModuleName)
    if (isAvailable !== -1 && Modules) {
      let tempArray = Object.assign([...Modules], { [isAvailable]: Object.assign({}, Modules[isAvailable], { IsChecked: isParentChecked !== -1 ? true : false, Pages: temp111, }) })
      this.setState({ Modules: tempArray })
    }
  }

  /**
   * @method getRoleDetail
   * @description used to get role detail
   */
  getRoleDetail = (RoleId) => {
    const { IsShowAdditionalPermission } = this.state;
    if (RoleId !== '') {
      this.props.getRoleDataAPI(RoleId, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          this.setState({
            RoleId: RoleId,
            Modules: Data.Modules,
            oldModules: Data.Modules,
            isLoader: false,
          }, () => {
            if (IsShowAdditionalPermission === true) {
              this.child.getUpdatedData(Data.Modules)
            }
          })

        }
      })
    }
  }

  /**
   * @method technologyHandler
   * @description Used to handle 
   */
  technologyHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ technology: newValue, level: [] });
      this.props.getLevelByTechnology(newValue.value, res => { })
    } else {
      this.setState({ technology: [] });
    }
  };

  /**
  * @method levelHandler
  * @description Used to handle 
  */
  levelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ level: newValue });
    } else {
      this.setState({ level: [] });
    }
  };

  /**
  * @method setTechnologyLevel
  * @description Used to handle setTechnologyLevel
  */
  setTechnologyLevel = () => {
    const { technology, level, TechnologyLevelGrid } = this.state;
    const tempArray = [];

    if (technology.length === 0 || level.length === 0) {
      toastr.warning('Please select technology and level')
      return false;
    }
    const isExistTechnology = TechnologyLevelGrid && TechnologyLevelGrid.findIndex(el => {
      return el.TechnologyId === technology.value
      // && el.LevelId === level.value
    })
    if (isExistTechnology !== -1) {
      // toastr.warning('Technology and Level already allowed.')
      toastr.warning('Technology cannot have multiple level.')
      return false;
    }

    tempArray.push(...TechnologyLevelGrid, {
      Technology: technology.label,
      TechnologyId: technology.value,
      Level: level.label,
      LevelId: level.value,
    })

    this.setState({
      TechnologyLevelGrid: tempArray,
      level: [],
      technology: [],
    });
  };

  /**
  * @method updateTechnologyLevel
  * @description Used to handle updateTechnologyLevel
  */
  updateTechnologyLevel = () => {
    const { technology, level, TechnologyLevelGrid, technologyLevelEditIndex } = this.state;
    let tempArray = [];

    let tempData = TechnologyLevelGrid[technologyLevelEditIndex];
    tempData = {
      Technology: technology.label,
      TechnologyId: technology.value,
      Level: level.label,
      LevelId: level.value,
    }

    tempArray = Object.assign([...TechnologyLevelGrid], { [technologyLevelEditIndex]: tempData })

    this.setState({
      TechnologyLevelGrid: tempArray,
      level: [],
      technology: [],
      technologyLevelEditIndex: '',
      isEditIndex: false,
    });
  };

  /**
  * @method resetTechnologyLevel
  * @description Used to handle setTechnologyLevel
  */
  resetTechnologyLevel = () => {
    this.setState({
      level: [],
      technology: [],
      technologyLevelEditIndex: '',
      isEditIndex: false,
    });
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index) => {
    const { TechnologyLevelGrid } = this.state;
    const tempData = TechnologyLevelGrid[index];
    this.props.getLevelByTechnology(tempData.TechnologyId, res => { })
    this.setState({
      technologyLevelEditIndex: index,
      isEditIndex: true,
      technology: { label: tempData.Technology, value: tempData.TechnologyId },
      level: { label: tempData.Level, value: tempData.LevelId },
    })
  }

  /**
  * @method deleteItem
  * @description used to Reset form
  */
  deleteItem = (index) => {
    const { TechnologyLevelGrid } = this.state;

    let tempData = TechnologyLevelGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    this.setState({
      TechnologyLevelGrid: tempData
    })
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.props.setEmptyUserDataAPI('', () => { })
    this.setState({
      isEditFlag: false,
      isShowForm: false,
      department: [],
      role: [],
      city: [],
      Modules: [],
      oldModules: [],
      IsShowAdditionalPermission: false,
      TechnologyLevelGrid: [],
    })
    let data = {
      logged_in_user: loggedInUserId(),
      DepartmentId: '',
      RoleId: '',
    }
    this.props.getAllUserDataAPI(data, res => { });
    this.props.hideForm()
  }

  /**
  * @method confirmUpdateUser
  * @description confirm Update User
  */
  confirmUpdateUser = (updatedData, RemoveCostingFlag) => {

    updatedData.IsRemoveCosting = RemoveCostingFlag;
    this.props.updateUserAPI(updatedData, (res) => {
      if (res && res.data && res.data.Result) {
        toastr.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
      }
      this.cancel();
    })

  }

  formToggle = () => {
    this.setState({
      isShowForm: !this.state.isShowForm
    })
  }

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  onSubmit(values) {

    const { reset, registerUserData, initialConfiguration } = this.props;
    const { department, role, city, isEditFlag, Modules, oldModules, TechnologyLevelGrid,
      oldTechnologyLevelGrid, UserId } = this.state;
    const userDetails = reactLocalStorage.getObject("userDetail")

    if (TechnologyLevelGrid && TechnologyLevelGrid.length === 0) {
      toastr.warning('Users technology level should not be empty.')
      return false;
    }
    //this.setState({ isSubmitted: true })

    let tempTechnologyLevelArray = []

    TechnologyLevelGrid && TechnologyLevelGrid.map((item, index) => {
      tempTechnologyLevelArray.push({
        Technology: item.Technology,
        Level: item.Level,
        TechnologyId: item.TechnologyId,
        LevelId: item.LevelId
      })
      return null;
    })

    if (isEditFlag) {
      let updatedData = {
        UserId: UserId,
        FullName: `${values.FirstName} ${values.LastName}`,
        LevelId: registerUserData.LevelId,
        LevelName: registerUserData.LevelName,
        DepartmentName: department.label,
        TechnologyId: '',
        TechnologyName: '',
        PlantName: '',
        IsActive: true,
        //AdditionalPermission: registerUserData.AdditionalPermission,
        CityName: department.label,
        UserProfileId: registerUserData.UserProfileId,
        UserName: values.UserName,
        Password: this.state.isShowPwdField ? values.Password : '',
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        DepartmentId: department.value,
        loggedInUserId: loggedInUserId(),
        CompanyId: department.CompanyId,
        EmailAddress: values.EmailAddress,
        Mobile: values.Mobile,
        FirstName: values.FirstName,
        MiddleName: values.MiddleName,
        LastName: values.LastName,
        RoleName: role.label,
        UserCode: registerUserData.UserCode,
        CreatedDate: registerUserData.CreatedDate,
        AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
        AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CityId: city.value,
        Modules: Modules,
        TechnologyLevels: tempTechnologyLevelArray,
        IsRemoveCosting: false,
        CostingCount: registerUserData.CostingCount,
        IsAdditionalAccess: this.state.IsShowAdditionalPermission,
        AdditionalPermission: this.state.IsShowAdditionalPermission ? 'YES' : 'NO',
      }

      const isDepartmentUpdate = (registerUserData.DepartmentId !== department.value) ? true : false;
      const isRoleUpdate = (registerUserData.RoleId !== role.value) ? true : false;
      let isPermissionUpdate = false;
      let isTechnologyUpdate = false;

      if (JSON.stringify(Modules) === JSON.stringify(oldModules)) {
        isPermissionUpdate = false;
      } else {
        isPermissionUpdate = true;
      }

      if (JSON.stringify(TechnologyLevelGrid) === JSON.stringify(oldTechnologyLevelGrid)) {
        isTechnologyUpdate = false;
      } else {
        isTechnologyUpdate = true;
      }

      //

      if (isDepartmentUpdate || isRoleUpdate || isPermissionUpdate || isTechnologyUpdate) {

        const toastrConfirmOptions = {
          onOk: () => {
            this.confirmUpdateUser(updatedData, true)
          },
          onCancel: () => { this.confirmUpdateUser(updatedData, false) },
          component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.COSTING_REJECT_ALERT}`, toastrConfirmOptions);

      } else {

        reset();
        this.props.updateUserAPI(updatedData, (res) => {
          if (res.data.Result) {
            toastr.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
          }
          this.cancel();
        })

      }
    } else {

      let userData = {
        UserName: !initialConfiguration.IsLoginEmailConfigure ? values.UserName : null,
        Password: values.Password,
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        DepartmentId: department.value,
        loggedInUserId: loggedInUserId(),
        CompanyId: department.CompanyId,
        EmailAddress: values.EmailAddress,
        Mobile: values.Mobile,
        FirstName: values.FirstName,
        MiddleName: values.MiddleName,
        LastName: values.LastName,
        RoleName: role.label,
        AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
        AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CityId: city.value,
        Modules: Modules,
        TechnologyLevels: tempTechnologyLevelArray,
        IsAdditionalAccess: this.state.IsShowAdditionalPermission,
        AdditionalPermission: this.state.IsShowAdditionalPermission ? 'YES' : 'NO',
      }
      this.props.registerUserAPI(userData, res => {
        this.setState({ isSubmitted: false, })

        if (res && res.data && res.data.Result) {
          toastr.success(MESSAGES.ADD_USER_SUCCESSFULLY)
          this.cancel();

        }
      })

    }
  }
  handleKeyDown = function (e, cb) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      cb();
    }
  };

  render() {
    const { handleSubmit, initialConfiguration, loading } = this.props;
    const { isSubmitted, isLoader } = this.state;
    return (
      <div className="container-fluid">
        {isLoader && <Loader />}
        <div className="login-container signup-form">
          <div className="row">

            <div className="col-md-12">
              <div className="shadow-lgg login-formg ">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-heading mb-0">
                      <h2>{this.state.isEditFlag ? 'Update User' : 'Add User'}</h2>
                    </div>
                  </div>
                  {this.state.isEditFlag && !this.state.isShowPwdField && <div className="col-md-6">
                    <Button className={'user-btn'} onClick={() => this.setState({ isShowPwdField: !this.state.isShowPwdField })} >Change Password</Button>
                  </div>}
                </div>
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate className="manageuser form" onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}>
                  <div className="add-min-height">
                    <HeaderTitle
                      title={'Personal Details:'}
                      customClass={'Personal-Details'} />

                    <div className=" row form-group">
                      <div className="input-group col-md-3 input-withouticon" >
                        <Field
                          label="First Name"
                          name={"FirstName"}
                          type="text"
                          placeholder={'Enter'}
                          validate={[required, minLength3, maxLength80, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces]}
                          component={renderText}
                          required={true}
                          // maxLength={26}
                          customClassName={'withBorder'}
                        />
                      </div>

                      <div className="input-group col-md-3 input-withouticon">
                        <Field
                          label="Last Name"
                          name={"LastName"}
                          type="text"
                          placeholder={'Enter'}
                          validate={[minLength3, maxLength80, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces]}
                          component={renderText}
                          required={false}
                          // maxLength={26}
                          customClassName={'withBorder'}
                        />
                      </div>
                      <div className="input-group col-md-3">
                        <Field
                          name="Mobile"
                          label="Mobile"
                          type="text"
                          placeholder={'Enter'}
                          component={renderText}
                          isDisabled={false}
                          validate={[postiveNumber, maxLength10, checkWhiteSpaces]}
                          required={false}
                          // maxLength={10}
                          customClassName={'withBorder'}
                        />
                      </div>
                      <div className="input-group col-md-3 input-withouticon">
                        <div className="row form-group">
                          <div className="Phone phoneNumber col-md-8 input-withouticon">
                            <Field
                              label="Phone Number"
                              name={"PhoneNumber"}
                              type="text"
                              placeholder={'Enter'}
                              validate={[postiveNumber, maxLength10]}
                              component={renderText}
                              //required={true}
                              maxLength={10}
                              customClassName={'withBorder'}
                            />
                          </div>
                          <div className="ext phoneNumber col-md-4 input-withouticon pl-0 pr-0">
                            <Field
                              label="Extension"
                              name={"Extension"}
                              type="text"
                              placeholder={'Ext'}
                              validate={[postiveNumber, maxLength3]}
                              component={renderText}
                              //required={true}
                              maxLength={3}
                              customClassName={'withBorder w100'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <HeaderTitle
                      title={'ID & Password:'}
                      customClass={''} />

                    <div className="row form-group">
                      <div className="input-group col-md-3">
                        <Field
                          name="EmailAddress"
                          label="Email ID"
                          component={renderEmailInputField}
                          placeholder={'Enter'}
                          validate={[required, email, minLength7, maxLength80, checkWhiteSpaces]}
                          required={true}
                          maxLength={80}
                          isDisabled={this.state.isEditFlag ? true : false}
                          customClassName={'withBorderEmail'}
                        />
                      </div>
                      {!initialConfiguration.IsLoginEmailConfigure &&
                        <div className="input-group col-md-3">
                          <Field
                            name="UserName"
                            label="User name"
                            type="text"
                            placeholder={'Enter'}
                            component={renderText}
                            isDisabled={false}
                            validate={[required, minLength7, checkWhiteSpaces]}
                            required={true}
                            maxLength={70}
                            disabled={this.state.isEditFlag ? true : false}
                            customClassName={'withBorder'}
                          />
                        </div>}
                      {this.state.isShowPwdField &&
                        <>
                          <div id="password" className="input-group password col-md-3">
                            <Field
                              name="Password"
                              label="Password"
                              placeholder="Enter"
                              component={renderPasswordInputField}
                              onChange={this.passwordPatternHandler}
                              validate={[required, minLength6, maxLength18, checkWhiteSpaces]}
                              isShowHide={this.state.isShowHidePassword}
                              showHide={this.showHidePasswordHandler}
                              required={true}
                              // maxLength={26}
                              isEyeIcon={true}
                              customClassName={'withBorderPWD'}
                            />
                          </div>
                          <div className="input-group col-md-3">
                            <Field
                              name="passwordConfirm"
                              label="Confirm Password"
                              placeholder={'Enter'}
                              component={renderPasswordInputField}
                              validate={[required, minLength6, maxLength18, checkWhiteSpaces]}
                              required={true}
                              // maxLength={26}
                              isShowHide={this.state.isShowHide}
                              showHide={this.showHideHandler}
                              isEyeIcon={true}
                              customClassName={'withBorderPWD'}
                            />
                          </div>
                        </>}
                    </div>

                    <HeaderTitle
                      title={'Address:'}
                      customClass={''} />

                    <div className="row form-group">
                      <div className="input-group  col-md-3 input-withouticon">
                        <Field
                          label="Address 1"
                          name={"AddressLine1"}
                          type="text"
                          placeholder={'Enter'}
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                          component={renderText}
                          //required={true}
                          // maxLength={45}
                          customClassName={'withBorder'}
                        />
                      </div>
                      <div className="input-group col-md-3 input-withouticon">
                        <Field
                          label="Address 2"
                          name={"AddressLine2"}
                          type="text"
                          placeholder={'Enter'}
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                          component={renderText}
                          //required={true}
                          // maxLength={45}
                          customClassName={'withBorder'}
                        />
                      </div>
                      <div className="col-md-3">
                        <Field
                          name="CityId"
                          type="text"
                          label="City"
                          component={searchableSelect}
                          placeholder={'Select city'}
                          options={this.searchableSelectType('city')}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          //validate={[required]}
                          //required={true}
                          handleChangeDescription={this.cityHandler}
                          valueDescription={this.state.city}
                        />
                      </div>
                      <div className="input-group col-md-3 input-withouticon">
                        <Field
                          label="ZipCode"
                          name={"ZipCode"}
                          type="text"
                          placeholder={'Enter'}
                          validate={[postiveNumber, maxLength6]}
                          component={renderText}
                          //required={true}
                          maxLength={6}
                          customClassName={'withBorder'}
                        />
                      </div>
                    </div>

                    <HeaderTitle
                      title={'Role & Company:'}
                      customClass={''} />

                    <div className="row form-group">
                      <div className="col-md-3">
                        <Field
                          name="RoleId"
                          type="text"
                          label="Role"
                          component={searchableSelect}
                          placeholder={'Select role'}
                          options={this.searchableSelectType('role')}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={(this.state.role == null || this.state.role.length === 0) ? [required] : []}
                          required={true}
                          handleChangeDescription={this.roleHandler}
                          valueDescription={this.state.role}
                        />
                      </div>
                      <div className="col-md-3">
                        <Field
                          name="DepartmentId"
                          type="text"
                          label="Company"
                          component={searchableSelect}
                          placeholder={'Select company'}
                          options={this.searchableSelectType('department')}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={(this.state.department == null || this.state.department.length === 0) ? [required] : []}
                          required={true}
                          handleChangeDescription={this.departmentHandler}
                          valueDescription={this.state.department}
                        />
                      </div>
                    </div>





                    {/* ///////////////////////////////////////////////
                              ////////////////////////////////////////////////////
                              /////////////// USER WISE PERMISSION START ////////
                              //////////////////////////////////////////////////
                              ///////////////////////////////////////////////// */}




                    <div className=" row mb-4">
                      <div className={'col-md-3'}>
                        <label
                          className="custom-checkbox"
                          onChange={this.onPressUserPermission}
                        >
                          Grant User Wise Permission
                        <input type="checkbox" disabled={false} checked={this.state.IsShowAdditionalPermission} />
                          <span
                            className=" before-box"
                            checked={this.state.IsShowAdditionalPermission}
                            onChange={this.onPressUserPermission}
                          />
                        </label>
                      </div>
                      {this.state.IsShowAdditionalPermission &&

                        <div className="col-md-12 grant-user-grid">
                          <PermissionsTabIndex
                            onRef={ref => (this.child = ref)}
                            isEditFlag={this.state.isEditFlag}
                            setInitialModuleData={this.setInitialModuleData}
                            moduleData={this.moduleDataHandler}
                            isNewRole={false}
                          />

                        </div>}
                    </div>




                    {/* ///////////////////////////////////////////////
                              ////////////////////////////////////////////////////
                              /////////////// USER WISE PERMISSION END ////////
                              //////////////////////////////////////////////////
                              ///////////////////////////////////////////////// */}





                    {/* ///////////////////////////////////////////////
                              ////////////////////////////////////////////////////
                              /////////////// User's technology level START ////////
                              //////////////////////////////////////////////////
                              ///////////////////////////////////////////////// */}

                    <HeaderTitle
                      title={'Technology & Level:'}
                      customClass={''} />

                    <div className="row form-group">
                      <div className="col-md-3">
                        <Field
                          name="TechnologyId"
                          type="text"
                          label="Technology"
                          component={searchableSelect}
                          options={this.searchableSelectType('technology')}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          //validate={(this.state.technology == null || this.state.technology.length == 0) ? [required] : []}
                          //required={true}
                          handleChangeDescription={this.technologyHandler}
                          valueDescription={this.state.technology}
                        />
                      </div>
                      <div className="col-md-3">
                        <Field
                          name="LevelId"
                          type="text"
                          label="Level"
                          component={searchableSelect}
                          options={this.searchableSelectType('level')}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          //validate={(this.state.level == null || this.state.level.length == 0) ? [required] : []}
                          //required={true}
                          handleChangeDescription={this.levelHandler}
                          valueDescription={this.state.level}
                        />
                      </div>
                      <div className="col-md-3 btn-mr-rate d-flex">
                        {this.state.isEditIndex ?
                          <>
                            <button
                              type="button"
                              className={'btn btn-primary add-button-big'}
                              onClick={this.updateTechnologyLevel}
                            >Update</button>

                            <button
                              type="button"
                              className={'reset-btn ml-2'}
                              onClick={this.resetTechnologyLevel}
                            >Cancel</button>
                          </>
                          :
                          <button
                            type="button"
                            className={'user-btn add-button-big ml-2'}
                            onClick={this.setTechnologyLevel}
                          ><div className={'plus'}></div>ADD</button>}
                      </div>
                    </div>

                    <div className="row form-group">
                      <div className="col-md-12">
                        <Table className="table" size="sm" >
                          <thead>
                            <tr>
                              <th>{`Technology`}</th>
                              <th>{`Level`}</th>
                              <th className="text-right">{`Action`}</th>
                            </tr>
                          </thead>
                          <tbody >
                            {
                              this.state.TechnologyLevelGrid &&
                              this.state.TechnologyLevelGrid.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{item.Technology}</td>
                                    <td>{item.Level}</td>
                                    <td className="text-right">
                                      <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(index)} />
                                      <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} />
                                    </td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </Table>
                        {this.state.TechnologyLevelGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                      </div>
                    </div>

                    {/* ////////////////////////////////////////////////////
                      ////////////////////////////////////////////////////
                      /////////////// User's technology level END ////////
                      ////////////////////////////////////////////////////
                      ///////////////////////////////////////////////// */}

                  </div>
                  <div className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn">

                      <button
                        onClick={this.cancel}
                        type="submit"
                        value="CANCEL"
                        className="mr15 cancel-btn">
                        <div className={'cross-icon'}><img alt={''} src={require('../../assests/images/times.png')}></img></div>
                      CANCEL
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitted ? true : false}
                        className="user-btn save-btn"><div className={'check-icon'}><img alt={''} src={require('../../assests/images/check.png')}></img></div>
                        {this.state.isEditFlag ? 'UPDATE' : 'SAVE'}
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

/**
 * Form validations
 * @param values
 * @returns {{}}
 */
function validate(values) {
  let errors = {};

  // if (!values.phone) {
  //   errors.phone = langs.validation_messages.phone_number_required;
  // }
  // if (vlidatePhoneNumber(values.phone)) {
  //   errors.phone = langs.validation_messages.phone_number_pattern;
  // }
  if (values.passwordConfirm !== values.Password) {
    errors.passwordConfirm =
      langs.validation_messages.password_confirm_password;
  }
  if (!values.passwordConfirm) {
    errors.passwordConfirm =
      langs.validation_messages.confirm_password_required;
  }
  if (!values.agree && values.agree !== true) {
    errors.agree = langs.validation_messages.agree_to_terms;
  }
  return errors;
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ auth, comman }) => {
  const { roleList, departmentList, registerUserData, actionSelectList, technologyList,
    initialConfiguration, loading, levelSelectList } = auth;
  const { cityList } = comman;

  let initialValues = {};

  if (registerUserData && registerUserData !== undefined) {
    initialValues = {
      FirstName: registerUserData.FirstName,
      MiddleName: registerUserData.MiddleName,
      LastName: registerUserData.LastName,
      EmailAddress: registerUserData.EmailAddress,
      UserName: registerUserData.UserName,
      Mobile: registerUserData.Mobile,
      Password: registerUserData.Password == null ? '' : '',
      passwordConfirm: registerUserData.Password == null ? '' : '',
      AddressLine1: registerUserData.AddressLine1,
      AddressLine2: registerUserData.AddressLine2,
      ZipCode: registerUserData.ZipCode,
      PhoneNumber: registerUserData.PhoneNumber,
      Extension: registerUserData.Extension,
    }
  }

  return {
    roleList, departmentList, cityList, registerUserData, actionSelectList,
    initialValues, technologyList, initialConfiguration, loading, levelSelectList
  };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
  registerUserAPI,
  getAllRoleAPI,
  getAllDepartmentAPI,
  getAllCities,
  getUserDataAPI,
  getAllUserDataAPI,
  updateUserAPI,
  setEmptyUserDataAPI,
  getRoleDataAPI,
  getAllTechnologyAPI,

  getPermissionByUser,
  getUsersTechnologyLevelAPI,
  setUserAdditionalPermission,
  setUserTechnologyLevelForCosting,
  updateUserTechnologyLevelForCosting,
  getLevelByTechnology
})(reduxForm({
  validate,
  form: 'Signup',
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  enableReinitialize: true,
})(UserRegistration));