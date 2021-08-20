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
import { renderPasswordInputField, focusOnError, renderEmailInputField, renderText, searchableSelect, renderMultiSelectField, } from "../layout/FormInputs";
import {
  registerUserAPI, getAllRoleAPI, getAllDepartmentAPI, getUserDataAPI, getAllUserDataAPI, updateUserAPI, setEmptyUserDataAPI, getRoleDataAPI, getAllTechnologyAPI,
  getPermissionByUser, getUsersTechnologyLevelAPI, setUserAdditionalPermission, setUserTechnologyLevelForCosting, updateUserTechnologyLevelForCosting,
  getLevelByTechnology, getSimulationTechnologySelectList, getSimualationLevelByTechnology, getUsersSimulationTechnologyLevelAPI, getMastersSelectList, getUsersMasterLevelAPI, getMasterLevelDataList, getMasterLevelByMasterId
} from "../../actions/auth/AuthActions";
import { getAllCities, getCityByCountry, getAllCity } from "../../actions/Common";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { getConfigurationKey, loggedInUserId } from "../../helper/auth";
import { Table, Button, Row, Col } from 'reactstrap';
import "./UserRegistration.scss";
import { CONSTANT } from "../../helper/AllConastant";
import NoContentFound from "../common/NoContentFound";
import $ from 'jquery';
import HeaderTitle from "../common/HeaderTitle";
import PermissionsTabIndex from "./RolePermissions/PermissionsTabIndex";
import ConfirmComponent from "../../helper/ConfirmComponent";
import { EMPTY_GUID } from "../../config/constants";

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
      acc1: false,
      acc2: false,
      acc3: false,
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
      isLoader: false,
      simulationHeads: [],
      simualtionLevel: [],
      HeadLevelGrid: [],
      oldHeadLevelGrid: [],
      simulationLevelEditIndex: '',
      isSimulationEditIndex: false,
      master: [],
      masterLevel: [],
      masterLevelGrid: [],
      oldMasterLevelGrid: [],
      masterLevelEditIndex: '',
      isMasterEditIndex: false,
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
    // this.props.getAllCities(() => { })
    this.props.getAllTechnologyAPI(() => { })
    this.props.getLevelByTechnology('', () => { })
    this.getUserDetail(data);
    this.props.getAllCity(cityId => {
      this.props.getCityByCountry(cityId, 0, () => { })
    })
    this.props.getSimulationTechnologySelectList(() => { })
    this.props.getMastersSelectList(() => { })
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
    const { roleList, departmentList, cityList, technologyList, levelSelectList, simulationTechnologyList, simulationLevelSelectList, masterLevelSelectList, masterList } = this.props;
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

    if (label === 'heads') {
      simulationTechnologyList && simulationTechnologyList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'masters') {
      masterList && masterList.map(item => {
        if (item.Value === '0') return false
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

    if (label === 'simualtionLevel') {
      simulationLevelSelectList && simulationLevelSelectList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
      })
      return temp;
    }

    if (label === 'masterLevel') {
      masterLevelSelectList && masterLevelSelectList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
      })
      return temp;
    }


    if (label === 'multiDepartment') {
      departmentList && departmentList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.DepartmentName, Value: item.DepartmentId, CompanyId: item.CompanyId })
        return null
      })
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
            const { roleList, cityList, departmentList } = this.props;
            let DepartmentObj = {}
            const depatArr = []
            const RoleObj = roleList && roleList.find(item => item.RoleId === Data.RoleId)
            if (Data.IsMultipleDepartmentAllowed) {
              Data.Departments && Data.Departments.map(item => { depatArr.push({ Text: item.DepartmentName, Value: item.DepartmentId }) })
            } else {
              DepartmentObj = departmentList && departmentList.find(item => item.DepartmentId === Data.DepartmentId)
            }
            // const DepartmentObj = departmentList && departmentList.find(item => item.DepartmentId === Data.DepartmentId)
            const CityObj = cityList && cityList.find(item => item.Value === Data.CityId)

            this.setState({
              isEditFlag: true,
              isLoader: false,
              IsShowAdditionalPermission: Data.IsAdditionalAccess,
              department: (getConfigurationKey().IsMultipleDepartmentAllowed && Data.IsMultipleDepartmentAllowed) ? depatArr : (getConfigurationKey().IsMultipleDepartmentAllowed && !Data.IsMultipleDepartmentAllowed) ? [{ Text: DepartmentObj.DepartmentName, Value: DepartmentObj.DepartmentId }] : DepartmentObj !== undefined ? { label: DepartmentObj.DepartmentName, value: DepartmentObj.DepartmentId } : [],
              role: RoleObj !== undefined ? { label: RoleObj.RoleName, value: RoleObj.RoleId } : [],
              city: CityObj !== undefined ? { label: CityObj.Text, value: CityObj.Value } : [],
              // TechnologyLevelGrid:
            })

            if (Data.IsAdditionalAccess) {
              this.getUserPermission(data.UserId)
            }

          }, 500)

          this.getUsersTechnologyLevelData(data.UserId)
          this.getUsersSimulationTechnologyLevelData(data.UserId)
          this.getUsersMasterLevelData(data.UserId)
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

  /**
 * @method getUsersTechnologyLevelData
 * @description used to get users technology level listing
 */
  getUsersSimulationTechnologyLevelData = (UserId) => {
    this.props.getUsersSimulationTechnologyLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let TechnologySimulationLevels = Data.TechnologyLevels;

        this.setState({
          HeadLevelGrid: TechnologySimulationLevels,
          oldHeadLevelGrid: TechnologySimulationLevels,
        })
      }
    })
  }


  /**
 * @method getUsersMasterLevelData
 * @description used to get users MASTER level listing
 */
  getUsersMasterLevelData = (UserId) => {
    this.props.getUsersMasterLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let masterSimulationLevel = Data.MasterLevels;

        this.setState({
          masterLevelGrid: masterSimulationLevel,
          oldMasterLevelGrid: masterSimulationLevel,
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
   * @method headHandler
   * @description USED TO HANLE SIMULATION HEAD AND CALL HEAD LEVEL API
  */

  headHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ simulationHeads: newValue, simualtionLevel: [] });
      this.props.getSimualationLevelByTechnology(newValue.value, res => { })
    } else {
      this.setState({ simulationHeads: [] });
    }
  };

  /**
   * @method masterHandler
   * @description USED TO HANLE MASTER AND CALL MASTER LEVEL API
  */
  masterHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ master: newValue, masterLevel: [] });
      this.props.getMasterLevelByMasterId(newValue.value, res => { })
    } else {
      this.setState({ simulationHeads: [] });
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
  * @method simualtionLevelHandler
  * @description Used to handle  simulation level handler
  */
  simualtionLevelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ simualtionLevel: newValue });
    } else {
      this.setState({ simualtionLevel: [] });
    }
  };
  /**
  * @method masterLevelHandler
  * @description Used to handle  master level
  */
  masterLevelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ masterLevel: newValue });
    } else {
      this.setState({ master: [] });
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
      return Number(el.TechnologyId) === Number(technology.value)
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
   * @method setSimualtionHeadLevel
   * @description Used to handle setTechnologyLevel
   */
  setSimualtionHeadLevel = () => {
    const { simulationHeads, simualtionLevel, HeadLevelGrid } = this.state;
    const tempArray = [];

    if (simulationHeads.length === 0 || simualtionLevel.length === 0) {
      toastr.warning('Please select technology and level')
      return false;
    }

    const isExistTechnology = HeadLevelGrid && HeadLevelGrid.findIndex(el => {
      return Number(el.TechnologyId) === Number(simulationHeads.value)
      // && el.LevelId === level.value
    })


    if (isExistTechnology !== -1) {
      // toastr.warning('Technology and Level already allowed.')
      toastr.warning('Head cannot have multiple level.')
      return false;
    }

    tempArray.push(...HeadLevelGrid, {
      Technology: simulationHeads.label,
      TechnologyId: simulationHeads.value,
      Level: simualtionLevel.label,
      LevelId: simualtionLevel.value,
    })

    this.setState({
      HeadLevelGrid: tempArray,
      simualtionLevel: [],
      simulationHeads: [],
    });
  };

  /**
  * @method updateSimualtionHeadLevel
  * @description Used to handle updateTechnologyLevel
  */
  updateSimualtionHeadLevel = () => {
    const { simulationHeads, simualtionLevel, HeadLevelGrid, simulationLevelEditIndex } = this.state;
    let tempArray = [];

    let tempData = HeadLevelGrid[simulationLevelEditIndex];
    tempData = {
      Technology: simulationHeads.label,
      TechnologyId: simulationHeads.value,
      Level: simualtionLevel.label,
      LevelId: simualtionLevel.value,
    }

    tempArray = Object.assign([...HeadLevelGrid], { [simulationLevelEditIndex]: tempData })

    this.setState({
      HeadLevelGrid: tempArray,
      simualtionLevel: [],
      simulationHeads: [],
      simulationLevelEditIndex: '',
      isSimulationEditIndex: false,
    });
  };

  /**
  * @method resetSimualtionHeadLevel
  * @description Used to handle simulation data
  */
  resetSimualtionHeadLevel = () => {
    this.setState({
      simualtionLevel: [],
      simulationHeads: [],
      simulationLevelEditIndex: '',
      isSimulationEditIndex: false,
    });
  };



  /**
  * @method editItemDetails
  * @description used to edit costing technology and level
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
 * @method editItemDetails
 * @description used to edit simulation head and level
 */
  editSimulationItemDetails = (index) => {
    const { HeadLevelGrid } = this.state;
    const tempData = HeadLevelGrid[index];
    this.props.getSimualationLevelByTechnology(tempData.TechnologyId, res => { })
    this.setState({
      simulationLevelEditIndex: index,
      isSimulationEditIndex: true,
      simulationHeads: { label: tempData.Technology, value: tempData.TechnologyId },
      simualtionLevel: { label: tempData.Level, value: tempData.LevelId },
    })
  }

  /**
  * @method deleteItem
  * @description used to DELETE form
  */
  deleteSimulationItem = (index) => {
    const { HeadLevelGrid } = this.state;
    let tempData = HeadLevelGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    this.setState({
      HeadLevelGrid: tempData
    })
  }

  /***********MASTER LEVEL STARTS HERE**************/
  /**
   * @method setMasterLevel
   * @description Used to handle master level
   */
  setMasterLevel = () => {
    const { master, masterLevel, masterLevelGrid } = this.state;
    const tempArray = [];

    if (master.length === 0 || masterLevel.length === 0) {
      toastr.warning('Please select master and level')
      return false;
    }

    const isExistTechnology = masterLevelGrid && masterLevelGrid.findIndex(el => {
      return Number(el.MasterId) === Number(master.value)
    })


    if (isExistTechnology !== -1) {
      // toastr.warning('Technology and Level already allowed.')
      toastr.warning('A master cannot have multiple level.')
      return false;
    }

    tempArray.push(...masterLevelGrid, {
      Master: master.label,
      MasterId: master.value,
      Level: masterLevel.label,
      LevelId: masterLevel.value,
    })

    this.setState({
      masterLevelGrid: tempArray,
      masterLevel: [],
      master: [],
    });
  };

  /**
  * @method updateMasterLevel
  * @description Used to handle update Master and it's level
  */
  updateMasterLevel = () => {
    const { master, masterLevel, masterLevelGrid, masterLevelEditIndex } = this.state;
    let tempArray = [];

    let tempData = masterLevelGrid[masterLevelEditIndex];
    tempData = {
      Master: master.label,
      MasterId: master.value,
      Level: masterLevel.label,
      LevelId: masterLevel.value,
    }

    tempArray = Object.assign([...masterLevelGrid], { [masterLevelEditIndex]: tempData })

    this.setState({
      masterLevelGrid: tempArray,
      masterLevel: [],
      master: [],
      masterLevelEditIndex: '',
      isMasterEditIndex: false,
    });
  };

  /**
  * @method resetMasterLevel
  * @description Used to reset master data
  */
  resetMasterLevel = () => {
    this.setState({
      masterLevel: [],
      master: [],
      masterLevelEditIndex: '',
      isMasterEditIndex: false,
    });
  };

  /**
 * @method editMasterItem
 * @description used to edit master detail form
 */
  editMasterItem = (index) => {
    const { masterLevelGrid } = this.state;
    const tempData = masterLevelGrid[index];
    this.props.getMasterLevelByMasterId(tempData.MasterId, res => { })
    this.setState({
      masterLevelEditIndex: index,
      isMasterEditIndex: true,
      master: { label: tempData.Master, value: tempData.MasterId },
      masterLevel: { label: tempData.Level, value: tempData.LevelId },
    })
  }

  /**
  * @method deleteItem
  * @description used to delete master item 
  */
  deleteMasterItem = (index) => {
    const { masterLevelGrid } = this.state;
    let tempData = masterLevelGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    this.setState({
      masterLevelGrid: tempData
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
      oldTechnologyLevelGrid, UserId, HeadLevelGrid, oldHeadLevelGrid, masterLevelGrid } = this.state;
    const userDetails = reactLocalStorage.getObject("userDetail")

    if (TechnologyLevelGrid && TechnologyLevelGrid.length === 0) {
      toastr.warning('Users technology level should not be empty.')
      return false;
    }

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

    let tempHeadLevelArray = []

    HeadLevelGrid && HeadLevelGrid.map((item, index) => {
      tempHeadLevelArray.push({
        SimulationTechnologyId: item.TechnologyId,
        LevelId: item.LevelId,
        Technology: item.Technology,
        Level: item.Level,

      })
      return null
    })

    let tempMasterLevelArray = []
    masterLevelGrid && masterLevelGrid.map((item, index) => {
      tempMasterLevelArray.push({
        MasterId: item.MasterId,
        LevelId: item.LevelId,
        Master: item.Master,
        Level: item.Level,
      })
    })

    let multiDeptArr = []

    department && department.map((item) => {
      multiDeptArr.push({ DepartmentId: item.Value, DepartmentName: item.Text })
    })


    if (isEditFlag) {
      let updatedData = {
        UserId: UserId,
        FullName: `${values.FirstName ? values.FirstName.trim() : ''} ${values.LastName ? values.LastName.trim() : ''}`,
        LevelId: registerUserData.LevelId,
        LevelName: registerUserData.LevelName,
        // DepartmentName: department.label,
        DepartmentName: getConfigurationKey().IsMultipleDepartmentAllowed ? '' : department.label,
        TechnologyId: '',
        TechnologyName: '',
        PlantName: '',
        IsActive: true,
        //AdditionalPermission: registerUserData.AdditionalPermission,
        CityName: department.label,
        UserProfileId: registerUserData.UserProfileId,
        UserName: values.UserName ? values.UserName.trim() : '',
        Password: this.state.isShowPwdField ? values.Password : '',
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        // DepartmentId: department.value,
        DepartmentId: getConfigurationKey().IsMultipleDepartmentAllowed ? EMPTY_GUID : department.value,
        Departments: getConfigurationKey().IsMultipleDepartmentAllowed ? multiDeptArr : [],
        IsMultipleDepartmentAllowed: getConfigurationKey().IsMultipleDepartmentAllowed ? true : false,
        loggedInUserId: loggedInUserId(),
        CompanyId: department.CompanyId ? department.CompanyId : '',
        EmailAddress: values.EmailAddress ? values.EmailAddress.trim() : '',
        Mobile: values.Mobile,
        FirstName: values.FirstName ? values.FirstName.trim() : '',
        MiddleName: values.MiddleName ? values.MiddleName.trim() : '',
        LastName: values.LastName ? values.LastName.trim() : '',
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
        SimulationTechnologyLevels: tempHeadLevelArray,
        MasterLevels: tempMasterLevelArray
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
        UserName: !initialConfiguration.IsLoginEmailConfigure ? values.UserName.trim() : null,
        Password: values.Password,
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        DepartmentId: getConfigurationKey().IsMultipleDepartmentAllowed ? EMPTY_GUID : department.value,
        Departments: getConfigurationKey().IsMultipleDepartmentAllowed ? multiDeptArr : [],
        IsMultipleDepartmentAllowed: getConfigurationKey().IsMultipleDepartmentAllowed ? true : false,
        loggedInUserId: loggedInUserId(),
        CompanyId: department.CompanyId ? department.CompanyId : '',
        EmailAddress: values.EmailAddress ? values.EmailAddress.trim() : '',
        Mobile: values.Mobile,
        FirstName: values.FirstName ? values.FirstName.trim() : '',
        MiddleName: values.MiddleName ? values.MiddleName.trim() : '',
        LastName: values.LastName ? values.LastName.trim() : '',
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
        SimulationTechnologyLevels: tempHeadLevelArray,
        MasterLevels: tempMasterLevelArray
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
                      <div className="col-md-3">
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
                          <div className="ext phoneNumber col-md-4 pl-0">
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
                            validate={[required, minLength3, checkWhiteSpaces]}
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
                      title={`Role & ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}:`}
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
                      {
                        getConfigurationKey().IsMultipleDepartmentAllowed ?
                          <div className="col-md-3">
                            <Field
                              name="DepartmentId"
                              type="text"
                              label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                              component={renderMultiSelectField}
                              placeholder={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                              selection={this.state.department == null || this.state.department.length === 0 ? [] : this.state.department}
                              options={this.searchableSelectType('multiDepartment')}
                              validate={this.state.department == null || this.state.department.length === 0 ? [required] : []}
                              required={true}
                              selectionChanged={this.departmentHandler}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              className="multiselect-with-border"
                              mendatory={true}
                            />
                          </div> :
                          <div className="col-md-3">
                            <Field
                              name="DepartmentId"
                              type="text"
                              label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                              component={searchableSelect}
                              placeholder={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                              // placeholder={'Select company'}
                              options={this.searchableSelectType('department')}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={(this.state.department == null || this.state.department.length === 0) ? [required] : []}
                              required={true}
                              handleChangeDescription={this.departmentHandler}
                              valueDescription={this.state.department}
                            />
                          </div>
                      }
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

                    <Row>
                      <Col md="8">
                        <HeaderTitle title={'Technology & Level:'} customClass={''} />
                      </Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { this.setState({ acc1: !this.state.acc1 }) }}>

                          {this.state.acc1 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>
                    {this.state.acc1 &&
                      <>
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
                      </>
                    }

                    {/* ////////////////////////////////////////////////////
                      ////////////////////////////////////////////////////
                      /////////////// User's technology level END ////////
                      ////////////////////////////////////////////////////
                      ///////////////////////////////////////////////// */}


                    <Row>
                      <Col md="8">
                        <HeaderTitle title={'Simulation Heads & Level:'} customClass={''} />
                      </Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { this.setState({ acc2: !this.state.acc2 }) }}>

                          {this.state.acc2 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>
                    {this.state.acc2 &&
                      <>
                        <div className="row form-group">
                          <div className="col-md-3">
                            <Field
                              name="Head"
                              type="text"
                              label="Head"
                              component={searchableSelect}
                              options={this.searchableSelectType('heads')}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              //validate={(this.state.technology == null || this.state.technology.length == 0) ? [required] : []}
                              //required={true}
                              handleChangeDescription={this.headHandler}
                              valueDescription={this.state.simulationHeads}
                            />
                          </div>
                          <div className="col-md-3">
                            <Field
                              name="simualtionLevel"
                              type="text"
                              label="Level"
                              component={searchableSelect}
                              options={this.searchableSelectType('simualtionLevel')}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              //validate={(this.state.level == null || this.state.level.length == 0) ? [required] : []}
                              //required={true}
                              handleChangeDescription={this.simualtionLevelHandler}
                              valueDescription={this.state.simualtionLevel}
                            />
                          </div>
                          <div className="col-md-3 btn-mr-rate d-flex">
                            {this.state.isSimulationEditIndex ?
                              <>
                                <button
                                  type="button"
                                  className={'btn btn-primary add-button-big'}
                                  onClick={this.updateSimualtionHeadLevel}
                                >Update</button>

                                <button
                                  type="button"
                                  className={'reset-btn ml-2'}
                                  onClick={this.resetSimualtionHeadLevel}
                                >Cancel</button>
                              </>
                              :
                              <button
                                type="button"
                                className={'user-btn add-button-big ml-2'}
                                onClick={this.setSimualtionHeadLevel}
                              ><div className={'plus'}></div>ADD</button>}
                          </div>
                        </div>

                        <div className="row form-group">
                          <div className="col-md-12">
                            <Table className="table" size="sm" >
                              <thead>
                                <tr>
                                  <th>{`Head`}</th>
                                  <th>{`Level`}</th>
                                  <th className="text-right">{`Action`}</th>
                                </tr>
                              </thead>
                              <tbody >
                                {
                                  this.state.HeadLevelGrid &&
                                  this.state.HeadLevelGrid.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item.Technology}</td>
                                        <td>{item.Level}</td>
                                        <td className="text-right">
                                          <button className="Edit mr-2" type={'button'} onClick={() => this.editSimulationItemDetails(index)} />
                                          <button className="Delete" type={'button'} onClick={() => this.deleteSimulationItem(index)} />
                                        </td>
                                      </tr>
                                    )
                                  })
                                }
                              </tbody>
                            </Table>
                            {this.state.HeadLevelGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                          </div>
                        </div>
                      </>
                    }
                    <Row>
                      <Col md="8">
                        <HeaderTitle title={'Masters & Level:'} customClass={''} />
                      </Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { this.setState({ acc3: !this.state.acc3 }) }}>

                          {this.state.acc2 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>
                    {this.state.acc3 &&
                      <>
                        <div className="row form-group">
                          <div className="col-md-3">
                            <Field
                              name="Master"
                              type="text"
                              label="Master"
                              component={searchableSelect}
                              options={this.searchableSelectType('masters')}
                              handleChangeDescription={this.masterHandler}
                              valueDescription={this.state.master}
                            />
                          </div>
                          <div className="col-md-3">
                            <Field
                              name="masterLevel"
                              type="text"
                              label="Level"
                              component={searchableSelect}
                              options={this.searchableSelectType('masterLevel')}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              //validate={(this.state.level == null || this.state.level.length == 0) ? [required] : []}
                              //required={true}
                              handleChangeDescription={this.masterLevelHandler}
                              valueDescription={this.state.masterLevel}
                            />
                          </div>
                          <div className="col-md-3 btn-mr-rate d-flex">
                            {this.state.isMasterEditIndex ?
                              <>
                                <button
                                  type="button"
                                  className={'btn btn-primary add-button-big'}
                                  onClick={this.updateMasterLevel}
                                >Update</button>

                                <button
                                  type="button"
                                  className={'reset-btn ml-2'}
                                  onClick={this.resetMasterLevel}
                                >Cancel</button>
                              </>
                              :
                              <button
                                type="button"
                                className={'user-btn add-button-big ml-2'}
                                onClick={this.setMasterLevel}
                              ><div className={'plus'}></div>ADD</button>}
                          </div>
                        </div>

                        <div className="row form-group">
                          <div className="col-md-12">
                            <Table className="table" size="sm" >
                              <thead>
                                <tr>
                                  <th>{`Master`}</th>
                                  <th>{`Level`}</th>
                                  <th className="text-right">{`Action`}</th>
                                </tr>
                              </thead>
                              <tbody >
                                {
                                  this.state.masterLevelGrid &&
                                  this.state.masterLevelGrid.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{item.Master}</td>
                                        <td>{item.Level}</td>
                                        <td className="text-right">
                                          <button className="Edit mr-2" type={'button'} onClick={() => this.editMasterItem(index)} />
                                          <button className="Delete" type={'button'} onClick={() => this.deleteMasterItem(index)} />
                                        </td>
                                      </tr>
                                    )
                                  })
                                }
                              </tbody>
                            </Table>
                            {this.state.masterLevelGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                          </div>
                        </div>
                      </>
                    }

                    {/* ////////////////////////////////////////////////////
                      ////////////////////////////////////////////////////
                      /////////////// User's MASTER level END ////////
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
                        <div className={"cancel-icon"}></div>
                      CANCEL
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitted ? true : false}
                        className="user-btn save-btn">
                        <div className={"save-icon"}></div>
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
    initialConfiguration, loading, levelSelectList, simulationTechnologyList, simulationLevelSelectList, masterList, masterLevelSelectList } = auth;
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
    initialValues, technologyList, initialConfiguration, loading, levelSelectList, simulationTechnologyList, simulationLevelSelectList, masterList, masterLevelSelectList
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
  getLevelByTechnology,
  getCityByCountry,
  getAllCity,
  getSimulationTechnologySelectList,
  getSimualationLevelByTechnology,
  getUsersSimulationTechnologyLevelAPI,
  getMastersSelectList,
  getMasterLevelDataList,
  getUsersMasterLevelAPI,
  getMasterLevelByMasterId
})(reduxForm({
  validate,
  form: 'Signup',
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  enableReinitialize: true,
})(UserRegistration));
