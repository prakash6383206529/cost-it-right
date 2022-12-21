import React, { Component, useEffect, useRef, useState } from "react";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { SearchableSelectHookForm, TextAreaHookForm, DatePickerHookForm, NumberFieldHookForm, TextFieldHookForm, PasswordFieldHookForm, AsyncSearchableSelectHookForm } from '../../components/layout/HookFormInputs'
import { useForm, Controller } from "react-hook-form";
import { langs } from "../../config/localization";
import Toaster from "../common/Toaster";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import {
  minLength3, minLength6, minLength10, maxLength11, maxLength12, required, email, minLength7, maxLength18,
  maxLength6, checkWhiteSpaces, maxLength15, postiveNumber, maxLength80, maxLength5, acceptAllExceptSingleSpecialCharacter, strongPassword, maxLength25,
} from "../../helper/validation";
import { renderPasswordInputField, focusOnError, renderEmailInputField, renderText, searchableSelect, renderMultiSelectField, renderNumberInputField, } from "../layout/FormInputs";
import {
  registerUserAPI, getAllRoleAPI, getAllDepartmentAPI, getUserDataAPI, getAllUserDataAPI, updateUserAPI, setEmptyUserDataAPI, getRoleDataAPI, getAllTechnologyAPI,
  getPermissionByUser, getUsersTechnologyLevelAPI, setUserAdditionalPermission, setUserTechnologyLevelForCosting, updateUserTechnologyLevelForCosting,
  getLevelByTechnology, getSimulationTechnologySelectList, getSimualationLevelByTechnology, getUsersSimulationTechnologyLevelAPI, getMastersSelectList, getUsersMasterLevelAPI, getMasterLevelDataList, getMasterLevelByMasterId, registerRfqUser, updateRfqUser
} from "../../actions/auth/AuthActions";
import { getAllCities, getCityByCountry, getAllCity, getVendorWithVendorCodeSelectList, getReporterList } from "../../actions/Common";
import { MESSAGES } from "../../config/message";
import { getConfigurationKey, loggedInUserId } from "../../helper/auth";
import { Table, Button, Row, Col } from 'reactstrap';
import "./UserRegistration.scss";
import { EMPTY_DATA, IV, IVRFQ, KEY, KEYRFQ, searchCount } from "../../config/constants";
import NoContentFound from "../common/NoContentFound";
import HeaderTitle from "../common/HeaderTitle";
import PermissionsTabIndex from "./RolePermissions/PermissionsTabIndex";
import { EMPTY_GUID } from "../../config/constants";
import PopupMsgWrapper from "../common/PopupMsgWrapper";
import { showDataOnHover } from "../../helper";
import { useDispatch, useSelector } from 'react-redux'
import { reactLocalStorage } from "reactjs-localstorage";
import { autoCompleteDropdown } from "../common/CommonFunctions";
var CryptoJS = require('crypto-js')
const selector = formValueSelector('UserRegistration');

function UserRegistration(props) {

  let child = React.createRef();

  const [token, setToken] = useState("");
  const [maxLength, setMaxLength] = useState(maxLength11);
  const [countryCode, setCountryCode] = useState(false);
  const [lowerCaseCheck, setLowerCaseCheck] = useState(false);
  const [upperCaseCheck, setUpperCaseCheck] = useState(false);
  const [numberCheck, setNumberCheck] = useState(false);
  const [lengthCheck, setLengthCheck] = useState(false);
  const [specialCharacterCheck, setSpecialCharacterCheck] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isShowHide, setIsShowHide] = useState(false);
  const [isShowHidePassword, setIsShowHidePassword] = useState(false);
  const [isRedirect, setIsRedirect] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [department, setDepartment] = useState([]);
  const [role, setRole] = useState([]);
  const [city, setCity] = useState([]);
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [isShowForm, setIsShowForm] = useState(false);
  const [UserId, setUserId] = useState("");
  const [acc1, setAcc1] = useState(false);
  const [acc2, setAcc2] = useState(false);
  const [acc3, setAcc3] = useState(false);
  const [IsShowAdditionalPermission, setIsShowAdditionalPermission] = useState(false);
  const [Modules, setModules] = useState([]);
  const [oldModules, setOldModules] = useState([]);
  const [technology, setTechnology] = useState([]);
  const [level, setLevel] = useState([]);
  const [TechnologyLevelGrid, setTechnologyLevelGrid] = useState([]);
  const [oldTechnologyLevelGrid, setOldTechnologyLevelGrid] = useState([]);
  const [technologyLevelEditIndex, setTechnologyLevelEditIndex] = useState("");
  const [isEditIndex, setIsEditIndex] = useState(false);
  const [isShowPwdField, setIsShowPwdField] = useState(true);
  const [simulationHeads, setSimulationHeads] = useState([]);
  const [simualtionLevel, setSimualtionLevel] = useState([]);
  const [HeadLevelGrid, setHeadLevelGrid] = useState([]);
  const [oldHeadLevelGrid, setOldHeadLevelGrid] = useState([]);
  const [simulationLevelEditIndex, setSimulationLevelEditIndex] = useState('');
  const [isSimulationEditIndex, setIsSimulationEditIndex] = useState(false);
  const [master, setMaster] = useState([]);
  const [masterLevel, setMasterLevels] = useState([]);
  const [masterLevelGrid, setMasterLevelGrid] = useState([]);
  const [oldMasterLevelGrid, setOldMasterLevelGrid] = useState([]);
  const [masterLevelEditIndex, setMasterLevelEditIndex] = useState('');
  const [isMasterEditIndex, setIsMasterEditIndex] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [updatedObj, setUpdatedObj] = useState({});
  const [RoleId, setRoleId] = useState("");
  const [vendor, setVendor] = useState("");
  const [reporter, setReporter] = useState("");
  const [isRfqUser, setIsRfqUser] = useState(false);
  const dispatch = useDispatch()

  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const cityList = useSelector(state => state.comman.cityList)
  const departmentList = useSelector(state => state.auth.departmentList)
  const roleList = useSelector(state => state.auth.roleList)
  const technologyList = useSelector(state => state.auth.technologyList)
  const simulationTechnologyList = useSelector(state => state.auth.simulationTechnologyList)
  const masterList = useSelector(state => state.auth.masterList)
  const levelSelectList = useSelector(state => state.auth.levelSelectList)
  const simulationLevelSelectList = useSelector(state => state.auth.simulationLevelSelectList)
  const masterLevelSelectList = useSelector(state => state.auth.masterLevelSelectList)
  const registerUserData = useSelector(state => state.auth.registerUserData)
  const getReporterListDropDown = useSelector(state => state.comman.getReporterListDropDown)

  const defaultValues = {
    FirstName: registerUserData && registerUserData.FirstName !== undefined ? registerUserData.FirstName : '',
    MiddleName: registerUserData && registerUserData.MiddleName !== undefined ? registerUserData.MiddleName : '',
    LastName: registerUserData && registerUserData.LastName !== undefined ? registerUserData.LastName : '',
    EmailAddress: registerUserData && registerUserData.EmailAddress !== undefined ? registerUserData.EmailAddress : '',
    UserName: registerUserData && registerUserData.UserName !== undefined ? registerUserData.UserName : '',
    Mobile: registerUserData && registerUserData.Mobile !== undefined ? registerUserData.Mobile : '',
    Password: registerUserData && registerUserData.Password !== undefined ? '' : '',
    passwordConfirm: registerUserData && registerUserData.Password !== undefined ? '' : '',
    AddressLine1: registerUserData && registerUserData.AddressLine1 !== undefined ? registerUserData.AddressLine1 : '',
    AddressLine2: registerUserData && registerUserData.AddressLine2 !== undefined ? registerUserData.AddressLine2 : '',
    ZipCode: registerUserData && registerUserData.ZipCode !== undefined ? registerUserData.ZipCode : '',
    PhoneNumber: registerUserData && registerUserData.PhoneNumber !== undefined ? registerUserData.PhoneNumber : '',
    Extension: registerUserData && registerUserData.Extension !== undefined ? registerUserData.Extension : '',
  }


  const { register, handleSubmit, formState: { errors }, control, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });


  useEffect(() => {

    if (registerUserData && props?.data?.isEditFlag) {

      setValue('FirstName', registerUserData && registerUserData.FirstName !== undefined ? registerUserData.FirstName : '',)
      setValue('MiddleName', registerUserData && registerUserData.MiddleName !== undefined ? registerUserData.MiddleName : '')
      setValue('LastName', registerUserData && registerUserData.LastName !== undefined ? registerUserData.LastName : '',)
      setValue('EmailAddress', registerUserData && registerUserData.EmailAddress !== undefined ? registerUserData.EmailAddress : '',)
      setValue('UserName', registerUserData && registerUserData.UserName !== undefined ? registerUserData.UserName : '',)
      setValue('Mobile', registerUserData && registerUserData.Mobile !== undefined ? registerUserData.Mobile : '',)
      setValue('Password', registerUserData && registerUserData.Password !== undefined ? '' : '',)
      setValue('passwordConfirm', registerUserData && registerUserData.Password !== undefined ? '' : '',)
      setValue('AddressLine1', registerUserData && registerUserData.AddressLine1 !== undefined ? registerUserData.AddressLine1 : '',)
      setValue('AddressLine2', registerUserData && registerUserData.AddressLine2 !== undefined ? registerUserData.AddressLine2 : '',)
      setValue('ZipCode', registerUserData && registerUserData.ZipCode !== undefined ? registerUserData.ZipCode : '',)
      setValue('PhoneNumber', registerUserData && registerUserData.PhoneNumber !== undefined ? registerUserData.PhoneNumber : '',)
      setValue('Extension', registerUserData && registerUserData.Extension !== undefined ? registerUserData.Extension : '',)
      setValue('CityId', registerUserData && registerUserData.CityName !== undefined ? {
        label: registerUserData.CityName, value: registerUserData.CityId
      } : '')
      setValue('RoleId', registerUserData && registerUserData.RoleName !== undefined ? {
        label: registerUserData.RoleName, value: registerUserData.RoleId
      } : '')
      let tempArray = []
      registerUserData && registerUserData?.Departments?.map((item) => {
        tempArray.push({ label: item?.DepartmentName, value: (item?.DepartmentId).toString() })
        return null;
      })
      setValue('DepartmentId', registerUserData && registerUserData.Departments !== undefined ? tempArray : '')
      setValue('Reporter', registerUserData && registerUserData.ReporterName !== undefined ? {
        label: registerUserData?.ReporterName
        , value: registerUserData?.ReporterId
      } : '')
      setValue('Vendor', registerUserData && registerUserData.Departments !== undefined ? {
        label: registerUserData?.VendorName
        , value: registerUserData?.VendorId
      } : '')
      setVendor({
        label: registerUserData?.VendorName
        , value: registerUserData?.VendorId
      })
      setReporter({
        label: registerUserData?.ReporterName
        , value: registerUserData?.ReporterId
      })
    }

  }, [registerUserData])



  useEffect(() => {
    const { data } = props;
    dispatch(setEmptyUserDataAPI('', () => { }))
    dispatch(getAllRoleAPI(() => { }))
    dispatch(getAllDepartmentAPI(() => { }))
    // this.props.getAllCities(() => { })
    dispatch(getAllTechnologyAPI(() => { }))
    dispatch(getLevelByTechnology('', () => { }))
    getUserDetail(data);
    dispatch(getAllCity(cityId => {
      dispatch(getCityByCountry(cityId, 0, () => { }))
    }))
    dispatch(getSimulationTechnologySelectList(() => { }))
    dispatch(getMastersSelectList(() => { }))
    dispatch(getReporterList(() => { }))
    return () => {
      reactLocalStorage?.setObject('vendorData', [])
    }
  }, [])


  /**
  * @name Capitalize
  * @desc Capitallize the first letter of the string
  */
  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  /**
  * @name hanldePhoneNumber
  * @param e
  * @desc Validate phone number
  */
  const hanldePhoneNumber = (e) => {
    const value = e.target.value;
    var number = value.split("");

    if (number[0] === "6" && number[1] === "1") {
      if (number.length === 11) {
        setMaxLength(maxLength12)
        setCountryCode(true)
      }
    }

    if (number[0] === "0") {
      if (number.length === 10) {
        setMaxLength(maxLength11)
        setCountryCode(false)
      }
    }
  };



  /**
  * @name passwordPatternHandler
  * @param e
  * @desc Validate password pattern
  */
  const passwordPatternHandler = (e) => {
    const value = e.target.value;
    const input = value;
    var number = input.split("");

    if (/^(?=.*[a-z])/.test(value) === true) {
      setLowerCaseCheck(true)
    } else {
      setLowerCaseCheck(false)
    }

    if (/^(?=.*[A-Z])/.test(value) === true) {
      setUpperCaseCheck(true)
    } else {
      setUpperCaseCheck(false)
    }

    if (/^(?=.*\d)/.test(value)) {
      setNumberCheck(true)
    } else {
      setNumberCheck(false)
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      setSpecialCharacterCheck(true)
    } else {
      setSpecialCharacterCheck(false)
    }

    if (number.length >= 6) {
      setLengthCheck(true)
    } else {
      setLengthCheck(false)
    }
  };


  const showHideHandler = () => {
    setIsShowHide(!isShowHide)
  }


  const showHidePasswordHandler = () => {
    setIsShowHidePassword(!isShowHidePassword)
  }

  const checkPasswordConfirm = value => {
    let pass = getValues('Password')
    return value && (value != pass) ? "Password and confirm password do not match." : undefined
  }

  /**
  * @method selectType
  * @description Used show listing
  */
  const searchableSelectType = (label) => {
    // const { roleList, technologyList, levelSelectList, simulationTechnologyList, simulationLevelSelectList, masterLevelSelectList, masterList } = props;
    const temp = [];

    if (label === 'role') {
      roleList && roleList.map(item => {
        if (item.RoleName === 'SuperAdmin') return false
        temp.push({ label: item.RoleName, value: item.RoleId })
        return null
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
        return null
      });
      return temp;
    }

    if (label === 'simualtionLevel') {
      simulationLevelSelectList && simulationLevelSelectList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp;
    }

    if (label === 'masterLevel') {
      masterLevelSelectList && masterLevelSelectList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp;
    }


    if (label === 'multiDepartment') {
      departmentList && departmentList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.DepartmentName, value: item.DepartmentId, CompanyId: item.CompanyId })
        return null
      })
      return temp;
    }
    if (label === 'reporter') {

      getReporterListDropDown && getReporterListDropDown.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp;
    }
  }


  /**
    * @method departmentHandler
    * @description Used to handle 
    */
  const departmentHandler = (newValue, actionMeta) => {

    if (getConfigurationKey().IsMultipleDepartmentAllowed) {
      setDepartment(newValue)
    } else {
      setDepartment([newValue])
    }
  };


  /**
    * @method roleHandler
    * @description Used to handle 
    */
  const roleHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {

      setRole(newValue)
      setModules([])
      setIsShowAdditionalPermission(false)
      getRoleDetail(newValue.value)

    } else {

      setRole([])
      setModules([])
      setIsShowAdditionalPermission(false)
    }
  };


  /**
  * @method cityHandler
  * @description Used to handle city
  */
  const cityHandler = (newValue, actionMeta) => {

    setCity(newValue)
  };


  const vendorHandler = (newValue, actionMeta) => {

    setVendor(newValue)
  };


  const handleReporterChange = (value) => {
    setReporter(value)
  }


  /**
  * @method getUserDetail
  * @description used to get user detail
  */
  const getUserDetail = (data) => {
    if (data && data.isEditFlag) {

      setIsLoader(true)
      setIsEditFlag(false)
      setIsShowForm(true)
      setIsShowAdditionalPermission(true)
      setIsShowPwdField(data.passwordFlag ? true : false)
      setUserId(data.UserId)
      setIsRfqUser(data?.RFQUser)

      if (data.passwordFlag === false) {
      }

      dispatch(getUserDataAPI(data.UserId, (res) => {
        if (res && res.data && res.data.Data) {

          let Data = res.data.Data;

          setTimeout(() => {
            let DepartmentObj = {}
            const depatArr = []
            const RoleObj = roleList && roleList.find(item => item.RoleId === Data.RoleId)
            if (Data.IsMultipleDepartmentAllowed) {
              Data.Departments && Data.Departments.map(item => (depatArr.push({ label: item.DepartmentName, value: item.DepartmentId })))
            } else {
              DepartmentObj = departmentList && departmentList.find(item => item.DepartmentId === Data.DepartmentId)
            }
            // const DepartmentObj = departmentList && departmentList.find(item => item.DepartmentId === Data.DepartmentId)


            setIsEditFlag(true)
            setIsLoader(false)
            setIsShowAdditionalPermission(Data.IsAdditionalAccess)
            // setDepartment((getConfigurationKey().IsMultipleDepartmentAllowed && Data.IsMultipleDepartmentAllowed) ? depatArr : (getConfigurationKey().IsMultipleDepartmentAllowed && !Data.IsMultipleDepartmentAllowed) ? [{ label: DepartmentObj.DepartmentName, value: DepartmentObj.DepartmentId }] : DepartmentObj !== undefined ? { label: DepartmentObj.DepartmentName, value: DepartmentObj.DepartmentId } : [])

            setDepartment([{ label: Data.Departments && Data.Departments[0]?.DepartmentName, value: Data.Departments && Data.Departments[0]?.DepartmentId }])

            setRole(RoleObj !== undefined ? { label: RoleObj.RoleName, value: RoleObj.RoleId } : [])
            setCity({ label: registerUserData?.CityName, value: registerUserData?.CityId })

            setValue('UserName', Data?.UserName)
            setCity({
              label: Data?.CityName, value: Data?.CityId
            })

            if (Data.IsAdditionalAccess) {
              getUserPermission(data.UserId)
            }

          }, 700)

          getUsersTechnologyLevelData(data.UserId)
          getUsersSimulationTechnologyLevelData(data.UserId)
          getUsersMasterLevelData(data.UserId)
          if (data.passwordFlag) {
          }
        }
      }))
    }
  }


  /**
  * @method getUserPermission
  * @description used to get user additional permissions
  */
  const getUserPermission = (UserId) => {
    dispatch(getPermissionByUser(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        setModules(Data.Modules)
        setOldModules(Data.Modules)
        //child.getUpdatedData(Data.Modules)  //need to convertt  to functional
      }
    }))
  }


  /**
  * @method getUsersTechnologyLevelData
  * @description used to get users technology level listing
  */
  const getUsersTechnologyLevelData = (UserId) => {
    dispatch(getUsersTechnologyLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {

        let Data = res.data.Data;
        let TechnologyLevels = Data.TechnologyLevels;

        setTechnologyLevelGrid(TechnologyLevels)
        setOldTechnologyLevelGrid(TechnologyLevels)
      }
    }))
  }

  /**
 * @method getUsersTechnologyLevelData
 * @description used to get users technology level listing
 */
  const getUsersSimulationTechnologyLevelData = (UserId) => {
    dispatch(getUsersSimulationTechnologyLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let TechnologySimulationLevels = Data.TechnologyLevels;

        setHeadLevelGrid(TechnologySimulationLevels)
        setOldHeadLevelGrid(TechnologySimulationLevels)
      }
    }))
  }

  /**
 * @method getUsersMasterLevelData
 * @description used to get users MASTER level listing
 */
  const getUsersMasterLevelData = (UserId) => {
    dispatch(getUsersMasterLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let masterSimulationLevel = Data.MasterLevels;

        setMasterLevelGrid(masterSimulationLevel)
        setOldMasterLevelGrid(masterSimulationLevel)
      }
    }))
  }



  //Below code for Table rendering...... 

  /**
   * @method onPressUserPermission
   * @description Used for User's additional permission
   */
  const onPressUserPermission = () => {

    if (role && role.value) {
      setIsShowAdditionalPermission(!IsShowAdditionalPermission)
      setModules([])
      getRoleDetail(role.value, !IsShowAdditionalPermission)
    } else {
      Toaster.warning('Please select role.')
    }
  }

  /**
    * @method setInitialModuleData
    * @description SET INITIAL MODULE DATA FROM PERMISSION TAB
    */
  const setInitialModuleData = (data) => {
    setModules(data)

  }


  /**
   * @method moduleDataHandler
   * @description used to set PERMISSION MODULE
   */
  const moduleDataHandler = (data, ModuleName) => {
    let temp111 = data;
    let isSelectAll = true

    let isParentChecked = temp111.findIndex(el => el.IsChecked === true)

    if (ModuleName === "Costing" || ModuleName === "Simulation") {
      temp111 && temp111.map((ele, index) => {
        if (ele.Sequence !== 0) {
          if (ele.IsChecked === false) {
            isSelectAll = false
          }
        }
        return null
      })
    } else {
      temp111 && temp111.map((ele, index) => {
        if (ele.IsChecked === false) {
          isSelectAll = false
        }
        return null
      })
    }

    const isAvailable = Modules && Modules.findIndex(a => a.ModuleName === ModuleName)
    if (isAvailable !== -1 && Modules) {
      let tempArray = Object.assign([...Modules], { [isAvailable]: Object.assign({}, Modules[isAvailable], { SelectAll: isSelectAll, IsChecked: isParentChecked !== -1 ? true : false, Pages: temp111, }) })
      setModules(tempArray)
    }
  }


  /**
   * @method getRoleDetail
   * @description used to get role detail
   */
  const getRoleDetail = (RoleId, IsShowAdditionalPermission) => {

    if (RoleId !== '') {
      dispatch(getRoleDataAPI(RoleId, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          setRoleId(RoleId)
          setModules(Data.Modules)
          setOldModules(Data.Modules)
          setIsLoader(false)
          if (IsShowAdditionalPermission === true) {
            // child.getUpdatedData(Data.Modules)      // need to be converted into functional
          }
        }
      }))
    }
  }



  /**
   * @method technologyHandler
   * @description Used to handle 
   */
  const technologyHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {

      setTechnology(newValue)
      setLevel([])
      setValue('LevelId', '')
      dispatch(getLevelByTechnology(newValue.value, res => { }))
    } else {
      setTechnology([])
    }
  };


  /**
   * @method headHandler
   * @description USED TO HANLE SIMULATION HEAD AND CALL HEAD LEVEL API
  */

  const headHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {

      setSimulationHeads(newValue)
      setSimualtionLevel([])
      setValue('simualtionLevel', '')
      dispatch(getSimualationLevelByTechnology(newValue.value, res => { }))
    } else {
      setSimulationHeads([])
    }
  };

  /**
   * @method masterHandler
   * @description USED TO HANLE MASTER AND CALL MASTER LEVEL API
  */
  const masterHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setMaster(newValue)
      setMasterLevels([])
      setValue('masterLevel', '')
      dispatch(getMasterLevelByMasterId(newValue.value, res => { }))
    } else {
      setSimulationHeads([])
    }
  };

  /**
  * @method levelHandler
  * @description Used to handle 
  */
  const levelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setLevel(newValue)
    } else {
      setLevel([])
    }
  };



  /**
  * @method simualtionLevelHandler
  * @description Used to handle  simulation level handler
  */
  const simualtionLevelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setSimualtionLevel(newValue)
    } else {
      setSimualtionLevel([])
    }
  };

  /**
  * @method masterLevelHandler
  * @description Used to handle  master level
  */
  const masterLevelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setMasterLevels(newValue)
    } else {
      setMaster([])
    }
  };


  /**
  * @method setTechnologyLevel
  * @description Used to handle setTechnologyLevel
  */
  const setTechnologyLevel = () => {
    const tempArray = [];

    if (technology.length === 0 || level.length === 0) {
      Toaster.warning('Please select technology and level')
      return false;
    }
    const isExistTechnology = TechnologyLevelGrid && TechnologyLevelGrid.findIndex(el => {
      return Number(el.TechnologyId) === Number(technology.value)
      // && el.LevelId === level.value
    })

    if (isExistTechnology !== -1) {
      // Toaster.warning('Technology and Level already allowed.')
      Toaster.warning('Technology cannot have multiple level.')
      return false;
    }

    tempArray.push(...TechnologyLevelGrid, {
      Technology: technology.label,
      TechnologyId: technology.value,
      Level: level.label,
      LevelId: level.value,
    })

    setTechnologyLevelGrid(tempArray)
    setLevel([])
    setTechnology([])
    setValue('TechnologyId', "")
    setValue('LevelId', "")

  };

  /**
  * @method updateTechnologyLevel
  * @description Used to handle updateTechnologyLevel
  */
  const updateTechnologyLevel = () => {
    let tempArray = [];

    if (technology.length === 0 || level.length === 0) {
      Toaster.warning('Please select technology and level')
      return false;
    }

    let tempData = TechnologyLevelGrid[technologyLevelEditIndex];
    tempData = {
      Technology: technology.label,
      TechnologyId: technology.value,
      Level: level.label,
      LevelId: level.value,
    }

    tempArray = Object.assign([...TechnologyLevelGrid], { [technologyLevelEditIndex]: tempData })

    setTechnologyLevelGrid(tempArray)
    setLevel([])
    setTechnology([])
    setTechnologyLevelEditIndex('')
    setIsEditIndex(false)
    setValue('TechnologyId', "")
    setValue('LevelId', "")

  };


  /**
  * @method resetTechnologyLevel
  * @description Used to handle setTechnologyLevel
  */
  const resetTechnologyLevel = () => {

    setValue('TechnologyId', "")
    setValue('LevelId', "")
    setLevel([])
    setTechnology([])
    setTechnologyLevelEditIndex('')
    setIsEditIndex(false)
  };


  /**
   * @method setSimualtionHeadLevel
   * @description Used to handle setTechnologyLevel
   */
  const setSimualtionHeadLevel = () => {
    const tempArray = [];

    if (simulationHeads.length === 0 || simualtionLevel.length === 0) {
      Toaster.warning('Please select technology and level')
      return false;
    }

    const isExistTechnology = HeadLevelGrid && HeadLevelGrid.findIndex(el => {
      return Number(el.TechnologyId) === Number(simulationHeads.value)
      // && el.LevelId === level.value
    })


    if (isExistTechnology !== -1) {
      // Toaster.warning('Technology and Level already allowed.')
      Toaster.warning('Head cannot have multiple level.')
      return false;
    }

    tempArray.push(...HeadLevelGrid, {
      Technology: simulationHeads.label,
      TechnologyId: simulationHeads.value,
      Level: simualtionLevel.label,
      LevelId: simualtionLevel.value,
    })


    setHeadLevelGrid(tempArray)
    setSimualtionLevel([])
    setSimulationHeads([])
    setValue('Head', '')
    setValue('simualtionLevel', '')

  };



  /**
  * @method updateSimualtionHeadLevel
  * @description Used to handle updateTechnologyLevel
  */
  const updateSimualtionHeadLevel = () => {

    let tempArray = [];

    if (simulationHeads.length === 0 || simualtionLevel.length === 0) {
      Toaster.warning('Please select technology and level')
      return false;
    }

    let tempData = HeadLevelGrid[simulationLevelEditIndex];
    tempData = {
      Technology: simulationHeads.label,
      TechnologyId: simulationHeads.value,
      Level: simualtionLevel.label,
      LevelId: simualtionLevel.value,
    }

    tempArray = Object.assign([...HeadLevelGrid], { [simulationLevelEditIndex]: tempData })

    setHeadLevelGrid(tempArray)
    setSimualtionLevel([])
    setSimulationHeads([])
    setSimulationLevelEditIndex('')
    setIsSimulationEditIndex(false)
    setValue('Head', '')
    setValue('simualtionLevel', '')
  };



  /**
  * @method resetSimualtionHeadLevel
  * @description Used to handle simulation data
  */
  const resetSimualtionHeadLevel = () => {

    setSimualtionLevel([])
    setSimulationHeads([])
    setSimulationLevelEditIndex('')
    setIsSimulationEditIndex(false)
    setValue('Head', '')
    setValue('simualtionLevel', '')
  };


  /**
  * @method editItemDetails
  * @description used to edit costing technology and level
  */
  const editItemDetails = (index) => {

    const tempData = TechnologyLevelGrid[index];
    dispatch(getLevelByTechnology(tempData.TechnologyId, res => { }))

    setTechnologyLevelEditIndex(index)
    setIsEditIndex(true)
    setValue('TechnologyId', { label: tempData.Technology, value: tempData.TechnologyId })
    setValue('LevelId', { label: tempData.Level, value: tempData.LevelId })
    setTechnology({ label: tempData.Technology, value: tempData.TechnologyId })
    setLevel({ label: tempData.Level, value: tempData.LevelId })
  }

  /**
  * @method deleteItem
  * @description used to Reset form
  */
  const deleteItem = (index) => {

    let tempData = TechnologyLevelGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    setTechnologyLevelGrid(tempData)
    setValue('TechnologyId', "")
    setValue('LevelId', "")
  }

  /**
 * @method editItemDetails
 * @description used to edit simulation head and level
 */
  const editSimulationItemDetails = (index) => {

    const tempData = HeadLevelGrid[index];
    dispatch(getSimualationLevelByTechnology(tempData.TechnologyId, res => { }))

    setSimulationLevelEditIndex(index)
    setIsSimulationEditIndex(true)
    setSimulationHeads({ label: tempData.Technology, value: tempData.TechnologyId })
    setSimualtionLevel({ label: tempData.Level, value: tempData.LevelId })
    setValue('Head', { label: tempData.Technology, value: tempData.TechnologyId })
    setValue('simualtionLevel', { label: tempData.Level, value: tempData.LevelId })
  }

  /**
  * @method deleteItem
  * @description used to DELETE form
  */
  const deleteSimulationItem = (index) => {

    let tempData = HeadLevelGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });


    setHeadLevelGrid(tempData)
    setValue('Head', '')
    setValue('simualtionLevel', '')
  }

  /***********MASTER LEVEL STARTS HERE**************/
  /**
   * @method setMasterLevel
   * @description Used to handle master level
   */
  const setMasterLevel = () => {
    const tempArray = [];



    if (master.length === 0 || masterLevel.length === 0) {
      Toaster.warning('Please select master and level')
      return false;
    }

    const isExistTechnology = masterLevelGrid && masterLevelGrid.findIndex(el => {
      return Number(el.MasterId) === Number(master.value)
    })


    if (isExistTechnology !== -1) {
      // Toaster.warning('Technology and Level already allowed.')
      Toaster.warning('A master cannot have multiple level.')
      return false;
    }

    tempArray.push(...masterLevelGrid, {
      Master: master.label,
      MasterId: master.value,
      Level: masterLevel.label,
      LevelId: masterLevel.value,
    })


    setMasterLevelGrid(tempArray)
    setMasterLevels([])
    setMaster([])
    setValue('Master', '')
    setValue('masterLevel', '')
  };

  /**
  * @method updateMasterLevel
  * @description Used to handle update Master and it's level
  */
  const updateMasterLevel = () => {
    let tempArray = [];

    if (master.length === 0 || masterLevel.length === 0) {
      Toaster.warning('Please select master and level')
      return false;
    }


    let tempData = masterLevelGrid[masterLevelEditIndex];
    tempData = {
      Master: master.label,
      MasterId: master.value,
      Level: masterLevel.label,
      LevelId: masterLevel.value,
    }

    tempArray = Object.assign([...masterLevelGrid], { [masterLevelEditIndex]: tempData })

    setMasterLevelGrid(tempArray)
    setMasterLevels([])
    setMaster([])
    setMasterLevelEditIndex('')
    setIsMasterEditIndex(false)
    setValue('Master', '')
    setValue('masterLevel', '')
  };


  /**
  * @method resetMasterLevel
  * @description Used to reset master data
  */
  const resetMasterLevel = () => {

    setMasterLevels([])
    setMaster([])
    setMasterLevelEditIndex('')
    setIsMasterEditIndex(false)
    setValue('Master', '')
    setValue('masterLevel', '')

  };



  /**
 * @method editMasterItem
 * @description used to edit master detail form
 */
  const editMasterItem = (index) => {

    const tempData = masterLevelGrid[index];
    dispatch(getMasterLevelByMasterId(tempData.MasterId, res => { }))

    setMasterLevelEditIndex(index)
    setIsMasterEditIndex(true)
    setMaster({ label: tempData.Master, value: tempData.MasterId })
    setMasterLevels({ label: tempData.Level, value: tempData.LevelId })
    setValue('Master', { label: tempData.Master, value: tempData.MasterId })
    setValue('masterLevel', { label: tempData.Level, value: tempData.LevelId })
  }



  /**
  * @method deleteItem
  * @description used to delete master item 
  */
  const deleteMasterItem = (index) => {

    let tempData = masterLevelGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    setMasterLevelGrid(tempData)
    setValue('Master', '')
    setValue('masterLevel', '')
  }


  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    // const { reset } = props;
    // reset();

    dispatch(setEmptyUserDataAPI('', () => { }))

    setIsEditFlag(false)
    setIsShowForm(false)
    setDepartment([])
    setRole([])
    setCity([])
    setModules([])
    setOldModules([])
    setIsShowAdditionalPermission(false)
    setTechnologyLevelGrid([])

    let data = {
      logged_in_user: loggedInUserId(),
      DepartmentId: '',
      RoleId: '',
    }
    // dispatch(getAllUserDataAPI(data, res => { }))
    props.hideForm()
  }


  /**
  * @method confirmUpdateUser
  * @description confirm Update User
  */
  const confirmUpdateUser = (updatedData, RemoveCostingFlag) => {

    updatedData.IsRemoveCosting = RemoveCostingFlag;
    //set state here true
    setIsLoader(true)


    if (props?.RFQUser || isRfqUser) {

      dispatch(updateRfqUser(updatedData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
        }
        cancel();
      }))
    }
    else {

      dispatch(updateUserAPI(updatedData, (res) => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
        }
        cancel();
      }))
    }


  }

  const formToggle = () => {

    setIsShowForm(!isShowForm)
  }

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  const onSubmit = (values) => {

    const { reset } = props;
    const userDetails = JSON.parse(localStorage.getItem('userDetail'))
    var key;
    var iv;

    if (props?.RFQUser || isRfqUser) {
      key = CryptoJS.enc.Utf8.parse(KEYRFQ);
      iv = CryptoJS.enc.Utf8.parse(IVRFQ);

    } else {
      key = CryptoJS.enc.Utf8.parse(KEY);
      iv = CryptoJS.enc.Utf8.parse(IV);
    }

    var encryptedpassword = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(values?.Password), key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });


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
      return null
    })

    let multiDeptArr = []

    department && department.map((item) => (
      multiDeptArr.push({ DepartmentId: item.value, DepartmentName: item.label })
    ))


    if (isEditFlag) {
      let updatedData = {
        UserId: UserId,
        FullName: `${values.FirstName ? values.FirstName.trim() : ''} ${values.LastName ? values.LastName.trim() : ''}`,
        LevelId: registerUserData?.LevelId,
        LevelName: registerUserData?.LevelName,
        // DepartmentName: department.label,
        DepartmentName: getConfigurationKey().IsMultipleDepartmentAllowed ? '' : department.label,
        TechnologyId: '',
        TechnologyName: '',
        PlantName: '',
        IsActive: true,
        //AdditionalPermission: registerUserData.AdditionalPermission,
        CityName: city.label,
        UserProfileId: registerUserData?.UserProfileId,
        UserName: values.UserName ? values.UserName.trim() : '',
        Password: isShowPwdField ? encryptedpassword.toString() : '',
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        // DepartmentId: department.value,
        DepartmentId: getConfigurationKey().IsMultipleDepartmentAllowed ? EMPTY_GUID : department.value,
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
        IsRemoveCosting: false,
        CostingCount: registerUserData.CostingCount,
        IsAdditionalAccess: IsShowAdditionalPermission,
      }

      if (isRfqUser) {
        updatedData.VendorId = vendor.value
        updatedData.ReporterId = reporter.value
      } else {
        updatedData.Modules = Modules
        updatedData.TechnologyLevels = tempTechnologyLevelArray
        updatedData.AdditionalPermission = IsShowAdditionalPermission ? 'YES' : 'NO'
        updatedData.SimulationTechnologyLevels = tempHeadLevelArray
        updatedData.MasterLevels = tempMasterLevelArray
        updatedData.Departments = getConfigurationKey().IsMultipleDepartmentAllowed ? multiDeptArr : []
        updatedData.IsMultipleDepartmentAllowed = getConfigurationKey().IsMultipleDepartmentAllowed ? true : false
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
        setShowPopup(true)
        setUpdatedObj(updatedData)

      } else {


        if (props?.RFQUser || isRfqUser) {
          reset();
          dispatch(updateRfqUser(updatedData, (res) => {
            if (res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
            }
            cancel();
          }))
        }
        else {
          reset();
          dispatch(updateUserAPI(updatedData, (res) => {
            if (res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
            }
            cancel();
          }))
        }

      }
    } else {
      let userData = {
        UserName: !initialConfiguration.IsLoginEmailConfigure ? values.UserName.trim() : null,
        Password: encryptedpassword.toString(),
        IsAdditionalAccess: IsShowAdditionalPermission,
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        DepartmentId: getConfigurationKey().IsMultipleDepartmentAllowed ? EMPTY_GUID : department.value,
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
      }

      if (props?.RFQUser) {
        userData.VendorId = vendor.value
        userData.ReporterId = reporter.value
      } else {
        userData.Modules = Modules
        userData.TechnologyLevels = tempTechnologyLevelArray
        userData.AdditionalPermission = IsShowAdditionalPermission ? 'YES' : 'NO'
        userData.SimulationTechnologyLevels = tempHeadLevelArray
        userData.MasterLevels = tempMasterLevelArray
        userData.Departments = getConfigurationKey().IsMultipleDepartmentAllowed ? multiDeptArr : []
        userData.IsMultipleDepartmentAllowed = getConfigurationKey().IsMultipleDepartmentAllowed ? true : false
      }

      setIsLoader(true)

      if (props?.RFQUser) {
        dispatch(registerRfqUser(userData, res => {
          setIsSubmitted(false)
          if (res && res.data && res.data.Result) {
            setIsLoader(false)
            Toaster.success(MESSAGES.ADD_USER_SUCCESSFULLY)
            cancel();
          } else if (res) {
            setIsLoader(false)
          }
        }))
      } else {
        dispatch(registerUserAPI(userData, res => {
          setIsSubmitted(false)
          if (res && res.data && res.data.Result) {
            setIsLoader(false)
            Toaster.success(MESSAGES.ADD_USER_SUCCESSFULLY)
            cancel();
          } else if (res) {
            setIsLoader(false)
          }
        }))
      }
    }
  }

  const onPopupConfirm = () => {
    confirmUpdateUser(updatedObj, true)
  }
  const closePopUp = () => {
    setShowPopup(false)
  }

  const handleKeyDown = function (e, cb) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      // cb();
    }
  };

  const vendorFilterList = async (inputValue) => {
    const resultInput = inputValue.slice(0, 3)
    if (inputValue?.length >= searchCount && vendor !== resultInput) {
      let res
      res = await getVendorWithVendorCodeSelectList(resultInput)
      setVendor(resultInput)
      let vendorDataAPI = res?.data?.SelectList
      reactLocalStorage?.setObject('vendorData', vendorDataAPI)
      let VendorData = []
      if (inputValue) {
        VendorData = reactLocalStorage?.getObject('vendorData')
        return autoCompleteDropdown(inputValue, VendorData)
      } else {
        return VendorData
      }
    }
    else {
      if (inputValue?.length < searchCount) return false
      else {
        let VendorData = reactLocalStorage?.getObject('vendorData')
        if (inputValue) {
          VendorData = reactLocalStorage?.getObject('vendorData')
          return autoCompleteDropdown(inputValue, VendorData)
        } else {
          return VendorData
        }
      }
    }
  };
  return (
    <div className="container-fluid">
      {isLoader && <Loader />}
      <div className="login-container signup-form user-ragistration">
        <div className="row">

          <div className={`col-md-12`}>
            <div className="shadow-lgg login-formg ">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-heading mb-0">
                    <h2>{isEditFlag ? 'Update User' : 'Add User'}</h2>
                  </div>
                </div>
                {isEditFlag && !isShowPwdField && <div className="col-md-6">
                  <Button className={'user-btn'} onClick={() => setIsShowPwdField(!isShowPwdField)} >Change Password</Button>
                </div>}
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="manageuser form" onKeyDown={(e) => { handleKeyDown(e, onSubmit); }}>
                <div className="add-min-height">
                  <HeaderTitle
                    title={'Personal Details:'}
                    customClass={'Personal-Details'} />

                  <div className={`row form-group ${props?.RFQUser ? 'rfq-portal-container' : ''}`}>
                    <div className="input-group col-md-3 input-withouticon" >
                      <TextFieldHookForm
                        label="First Name"
                        name={"FirstName"}
                        errors={errors.FirstName}
                        Controller={Controller}
                        control={control}
                        register={register}
                        disableErrorOverflow={true}
                        mandatory={true}
                        rules={{
                          required: true,
                          validate: {
                            minLength3,
                            maxLength25,
                            checkWhiteSpaces
                          }
                        }}
                        handleChange={() => { }}
                        placeholder={'Enter'}
                        customClassName={'withBorder'}
                      />
                    </div>
                    <div className="input-group col-md-3 input-withouticon">
                      <TextFieldHookForm
                        label="Last Name"
                        name={"LastName"}
                        errors={errors.LastName}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        placeholder={'Enter'}
                        disableErrorOverflow={true}
                        rules={{
                          required: false,
                          validate: { minLength3, maxLength25 }
                        }}
                        handleChange={() => { }}
                        customClassName={'withBorder'}
                      />
                    </div>
                    <div className="input-group col-md-3">
                      <NumberFieldHookForm
                        name="Mobile"
                        label="Mobile"
                        errors={errors.Mobile}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        disableErrorOverflow={true}
                        rules={{
                          required: false,
                          validate: { postiveNumber, minLength10, maxLength12, checkWhiteSpaces }
                        }}
                        handleChange={() => { }}
                        placeholder={'Enter'}
                        customClassName={'withBorder'}
                      />
                    </div>

                    {!props?.RFQUser ? <div className="col-md-3">
                      <div className="row form-group">
                        <div className="Phone phoneNumber col-md-8">
                          <NumberFieldHookForm
                            label="Phone Number"
                            name={"PhoneNumber"}
                            errors={errors.PhoneNumber}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            disableErrorOverflow={true}
                            rules={{
                              required: false,
                              validate: { postiveNumber, minLength10, maxLength12 }
                            }}
                            handleChange={() => { }}
                            placeholder={'Enter'}
                            customClassName={'withBorder'}
                          />
                        </div>
                        <div className="ext phoneNumber col-md-4 pl-0">
                          <NumberFieldHookForm
                            label="Extension"
                            name={"Extension"}
                            errors={errors.Extension}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            disableErrorOverflow={true}
                            rules={{
                              required: false,
                              validate: { postiveNumber, maxLength5 }
                            }}
                            handleChange={() => { }}
                            placeholder={'Ext'}
                            customClassName={'withBorder w100'}
                          />
                        </div>
                      </div>
                    </div>
                      :
                      <>
                        <Row className="mx-0 w-100 mt-5">
                          <Col md="12">
                            <HeaderTitle
                              title={'Additional Details:'}
                              customClass={'Personal-Details'} />
                          </Col>
                          <Col md="3">
                            <div className="Phone phoneNumber">
                              <AsyncSearchableSelectHookForm
                                name="Vendor"
                                type="text"
                                label="Vendor (Code)"
                                errors={errors.Vendor}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                  required: true,
                                }}
                                disabled={isEditFlag ? true : false}
                                //component={searchableSelect}
                                placeholder={'Select Vendor'}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(role == null || role.length === 0) ? [required] : []}
                                required={true}
                                handleChange={vendorHandler}
                                asyncOptions={vendorFilterList}
                                NoOptionMessage={"Enter 3 characters to show data"}
                              />
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="phoneNumber pl-0">
                              <SearchableSelectHookForm
                                name="Reporter"
                                type="text"
                                label={`Reporter`}

                                errors={errors.Reporter}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                  required: true,
                                }}
                                component={searchableSelect}
                                placeholder={'Select Reporter'}
                                options={searchableSelectType('reporter')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={(department == null || department.length === 0) ? [required] : []}
                                required={true}
                                handleChange={handleReporterChange}
                              //valueDescription={department}
                              />
                            </div>
                          </Col>
                        </Row>
                      </>
                    }
                  </div>

                  <HeaderTitle
                    title={'ID & Password:'}
                    customClass={'mt-4'} />

                  <div className="row form-group">
                    <div className="input-group col-md-3">
                      <TextFieldHookForm
                        name="EmailAddress"
                        label="Email ID"
                        errors={errors.EmailAddress}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        handleChange={() => { }}
                        rules={{
                          required: true,
                          validate: { required, email, minLength7, maxLength80, checkWhiteSpaces }
                        }}

                        placeholder={'Enter'}
                        //validate={[required, email, minLength7, maxLength80, checkWhiteSpaces]}
                        //maxLength={80}
                        disabled={isEditFlag ? true : false}
                        customClassName={'withBorder'}
                      />
                    </div>
                    {!initialConfiguration.IsLoginEmailConfigure &&
                      <div className="input-group col-md-3">
                        <TextFieldHookForm
                          name="UserName"
                          label="User name"
                          errors={errors.UserName}
                          Controller={Controller}
                          control={control}
                          register={register}
                          disableErrorOverflow={true}
                          mandatory={true}
                          rules={{
                            required: true,
                            validate: { required, minLength3, maxLength15 }
                          }}
                          handleChange={() => { }}
                          placeholder={'Enter'}
                          disabled={isEditFlag ? true : false}
                          customClassName={'withBorder'}
                        />
                      </div>}
                    {isShowPwdField &&
                      <>
                        <div id="password" className="input-group password password-wrapper col-md-3">
                          <PasswordFieldHookForm
                            name="Password"
                            label="Password"
                            placeholder="Enter"
                            disableErrorOverflow={true}
                            errors={errors.Password}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}

                            handleChange={passwordPatternHandler}
                            //component={renderPasswordInputField}
                            //onChange={passwordPatternHandler}
                            //validate={[required, minLength6, maxLength18, checkWhiteSpaces, strongPassword]}
                            rules={{
                              required: true,
                              validate: { required, minLength6, maxLength18, checkWhiteSpaces, strongPassword }
                            }}
                            isShowHide={isShowHidePassword}
                            showHide={showHidePasswordHandler}
                            // maxLength={26}
                            isEyeIcon={true}
                            autoComplete={"new-password"}
                            customClassName={'withBorderPWD'}
                          />
                        </div>
                        <div className="input-group col-md-3 password-wrapper">
                          <PasswordFieldHookForm
                            name="passwordConfirm"
                            label="Confirm Password"
                            placeholder={'Enter'}
                            errors={errors.passwordConfirm}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            disableErrorOverflow={true}
                            rules={{
                              required: true,
                              validate: { required, minLength6, maxLength18, checkWhiteSpaces, checkPasswordConfirm }
                            }}
                            //component={renderPasswordInputField}
                            //validate={[required, minLength6, maxLength18, checkWhiteSpaces]}
                            // maxLength={26}
                            isShowHide={isShowHide}
                            showHide={showHideHandler}
                            isEyeIcon={true}
                            customClassName={'withBorderPWD'}
                            handleChange={() => { }}
                          />
                        </div>
                      </>}
                  </div>

                  <HeaderTitle
                    title={'Address:'}
                    customClass={''} />

                  <div className="row form-group">
                    <div className="input-group  col-md-3 input-withouticon">
                      <TextFieldHookForm
                        label="Address 1"
                        name={"AddressLine1"}
                        disableErrorOverflow={true}
                        errors={errors.AddressLine1}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          validate: { acceptAllExceptSingleSpecialCharacter, maxLength80 }
                        }}
                        handleChange={() => { }}

                        placeholder={'Enter'}
                        //validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                        //component={renderText}
                        //required={true}
                        // maxLength={45}
                        customClassName={'withBorder'}
                      />
                    </div>
                    <div className="input-group col-md-3 input-withouticon ">
                      <TextFieldHookForm
                        label="Address 2"
                        name={"AddressLine2"}
                        errors={errors.AddressLine2}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          validate: { acceptAllExceptSingleSpecialCharacter, maxLength80 }
                        }}
                        handleChange={() => { }}
                        placeholder={'Enter'}
                        disableErrorOverflow={true}
                        //validate={[acceptAllExceptSingleSpecialCharacter, maxLength80]}
                        //component={renderText}
                        //required={true}
                        // maxLength={45}
                        customClassName={'withBorder addresss2-field'}
                      />
                    </div>
                    <div className="col-md-3">
                      <SearchableSelectHookForm
                        name="CityId"
                        label="City"
                        errors={errors.CityId}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                        }}
                        placeholder={'Select city'}
                        options={searchableSelectType('city')}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        //validate={[required]}
                        //required={true}
                        handleChange={cityHandler}
                        valueDescription={city}
                      />
                    </div>
                    <div className="input-group col-md-3 input-withouticon">
                      <NumberFieldHookForm
                        label="ZipCode"
                        name={"ZipCode"}
                        errors={errors.ZipCode}
                        Controller={Controller}
                        control={control}
                        register={register}
                        disableErrorOverflow={true}
                        mandatory={false}
                        rules={{
                          required: false,
                          validate: { postiveNumber, maxLength6 }
                        }}
                        handleChange={() => { }}
                        placeholder={'Enter'}
                        //validate={[postiveNumber, maxLength6]}
                        //component={renderText}
                        //required={true}
                        //maxLength={6}
                        customClassName={'withBorder'}
                      />
                    </div>
                  </div>


                  {!props?.RFQUser &&
                    <>
                      <HeaderTitle
                        title={`Role & ${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}:`}
                        customClass={''} />

                      <div className="row form-group">
                        <div className="col-md-3">
                          <SearchableSelectHookForm
                            name="RoleId"
                            type="text"
                            label="Role"
                            errors={errors.RoleId}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                              required: true,
                            }}
                            //component={searchableSelect}
                            placeholder={'Select role'}
                            options={searchableSelectType('role')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={(role == null || role.length === 0) ? [required] : []}
                            required={true}
                            handleChange={roleHandler}
                            valueDescription={role}
                          />
                        </div>
                        {
                          getConfigurationKey().IsMultipleDepartmentAllowed ?
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="DepartmentId"
                                type="text"
                                //title={showDataOnHover(department)}
                                label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}

                                errors={errors.DepartmentId}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                  required: true,
                                }}

                                handleChange={departmentHandler}
                                isMulti={true}
                                //component={renderMultiSelectField}
                                placeholder={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                                selection={department == null || department.length === 0 ? [] : department}
                                options={searchableSelectType('multiDepartment')}
                                //validate={department == null || department.length === 0 ? [required] : []}
                                //selectionChanged={departmentHandler}
                                optionValue={(option) => option.Value}
                                optionLabel={(option) => option.Text}
                                className="multiselect-with-border"
                                mendatory={true}
                              />
                            </div> :
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="DepartmentId"
                                type="text"
                                label={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}

                                errors={errors.DepartmentId}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                  required: true,
                                }}

                                component={searchableSelect}
                                placeholder={`${getConfigurationKey().IsCompanyConfigureOnPlant ? 'Company' : 'Department'}`}
                                // placeholder={'Select company'}
                                options={searchableSelectType('department')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={(department == null || department.length === 0) ? [required] : []}
                                required={true}
                                handleChange={departmentHandler}
                                valueDescription={department}
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
                        <div className={'col-md-4'}>
                          <label
                            className="custom-checkbox"
                            onChange={onPressUserPermission}
                          >
                            Grant User Wise Permission
                            <input type="checkbox" disabled={false} checked={IsShowAdditionalPermission} />
                            <span
                              className=" before-box"
                              checked={IsShowAdditionalPermission}
                              onChange={onPressUserPermission}
                            />
                          </label>
                        </div>
                        {IsShowAdditionalPermission && (

                          <div className="col-md-12 grant-user-grid">
                            <PermissionsTabIndex
                              //onRef={ref => (child = ref)}
                              isEditFlag={isEditFlag}
                              setInitialModuleData={setInitialModuleData}
                              moduleData={moduleDataHandler}
                              isNewRole={false}
                              updatedData={Modules}
                              refVariable={false}
                            />

                          </div>)}
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
                          <HeaderTitle title={'Costing Approval Level:'} customClass={''} />
                        </Col>
                        <Col md="4" className="text-right">
                          <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc1(!acc1) }}>

                            {acc1 ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}
                          </button>
                        </Col>
                      </Row>
                      {acc1 &&
                        <>
                          <div className="row form-group">
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="TechnologyId"
                                type="text"
                                label="Technology"

                                errors={errors.TechnologyId}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}


                                //component={searchableSelect}
                                options={searchableSelectType('technology')}
                                handleChange={technologyHandler}
                                defaultValue={technology}
                              />
                            </div>
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="LevelId"
                                type="text"
                                label="Level"

                                errors={errors.TechnologyId}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}


                                //component={searchableSelect}
                                options={searchableSelectType('level')}
                                handleChange={levelHandler}
                                defaultValue={level}
                              />
                            </div>
                            <div className="col-md-3 btn-mr-rate d-flex">
                              {isEditIndex ?
                                <>
                                  <button
                                    type="button"
                                    className={'btn btn-primary add-button-big'}
                                    onClick={updateTechnologyLevel}
                                  >Update</button>

                                  <button
                                    type="button"
                                    className={'reset-btn ml-2'}
                                    onClick={resetTechnologyLevel}
                                  >Cancel</button>
                                </>
                                :
                                <button
                                  type="button"
                                  className={'user-btn add-button-big ml-2'}
                                  onClick={setTechnologyLevel}
                                ><div className={'plus'}></div>ADD</button>}
                            </div>
                          </div>


                          <div className="row form-group">
                            <div className="col-md-12">
                              <Table className="table border" size="sm" >
                                <thead>
                                  <tr>
                                    <th className="border-bottom-none">{`Technology`}</th>
                                    <th className="border-bottom-none">{`Level`}</th>
                                    <th className="text-right border-bottom-none">{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >
                                  {
                                    TechnologyLevelGrid &&
                                    TechnologyLevelGrid.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{item.Technology}</td>
                                          <td>{item.Level}</td>
                                          <td className="text-right">
                                            <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => editItemDetails(index)} />
                                            <button title='Delete' className="Delete" type={'button'} onClick={() => deleteItem(index)} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                  {TechnologyLevelGrid.length === 0 && <tr>
                                    <td colSpan={3}>
                                      <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                  </tr>}
                                </tbody>
                              </Table>

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
                          <HeaderTitle title={'Simulation Approval Level:'} customClass={''} />
                        </Col>
                        <Col md="4" className="text-right">
                          <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc2(!acc2) }}>

                            {acc2 ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}
                          </button>
                        </Col>
                      </Row>
                      {acc2 &&
                        <>
                          <div className="row form-group">
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="Head"
                                type="text"
                                label="Head"

                                errors={errors.Head}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}

                                //component={searchableSelect}
                                options={searchableSelectType('heads')}
                                handleChange={headHandler}
                                valueDescription={simulationHeads}
                              />
                            </div>
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="simualtionLevel"
                                type="text"
                                label="Level"


                                errors={errors.simualtionLevel}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                handleChange={simualtionLevelHandler}


                                //component={searchableSelect}
                                options={searchableSelectType('simualtionLevel')}

                                valueDescription={simualtionLevel}
                              />
                            </div>
                            <div className="col-md-3 btn-mr-rate d-flex">
                              {isSimulationEditIndex ?
                                <>
                                  <button
                                    type="button"
                                    className={'btn btn-primary add-button-big'}
                                    onClick={updateSimualtionHeadLevel}
                                  >Update</button>

                                  <button
                                    type="button"
                                    className={'reset-btn ml-2'}
                                    onClick={resetSimualtionHeadLevel}
                                  >Cancel</button>
                                </>
                                :
                                <button
                                  type="button"
                                  className={'user-btn add-button-big ml-2'}
                                  onClick={setSimualtionHeadLevel}
                                ><div className={'plus'}></div>ADD</button>}
                            </div>
                          </div>

                          <div className="row form-group">
                            <div className="col-md-12">
                              <Table className="table border" size="sm" >
                                <thead>
                                  <tr>
                                    <th className="border-bottom-none">{`Head`}</th>
                                    <th className="border-bottom-none">{`Level`}</th>
                                    <th className="text-right border-bottom-none">{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >
                                  {
                                    HeadLevelGrid &&
                                    HeadLevelGrid.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{item.Technology}</td>
                                          <td>{item.Level}</td>
                                          <td className="text-right">
                                            <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => editSimulationItemDetails(index)} />
                                            <button title='Delete' className="Delete" type={'button'} onClick={() => deleteSimulationItem(index)} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                  {HeadLevelGrid.length === 0 && <tr>
                                    <td colSpan={3}>
                                      <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                  </tr>}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        </>
                      }
                      {
                        getConfigurationKey().IsMasterApprovalAppliedConfigure &&
                        <>
                          <Row>
                            <Col md="8">
                              <HeaderTitle title={'Master Approval Level:'} customClass={''} />
                            </Col>
                            <Col md="4" className="text-right">
                              <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc3(!acc3) }}>

                                {acc3 ? (
                                  <i className="fa fa-minus" ></i>
                                ) : (
                                  <i className="fa fa-plus"></i>
                                )}
                              </button>
                            </Col>
                          </Row>
                          {acc3 &&
                            <>
                              <div className="row form-group">
                                <div className="col-md-3">
                                  <SearchableSelectHookForm
                                    name="Master"
                                    type="text"
                                    label="Master"

                                    errors={errors.Master}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    handleChange={masterHandler}


                                    //component={searchableSelect}
                                    options={searchableSelectType('masters')}

                                    valueDescription={master}
                                  />
                                </div>
                                <div className="col-md-3">
                                  <SearchableSelectHookForm
                                    name="masterLevel"
                                    type="text"
                                    label="Level"



                                    errors={errors.Master}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    handleChange={masterLevelHandler}

                                    //component={searchableSelect}
                                    options={searchableSelectType('masterLevel')}

                                    valueDescription={masterLevel}
                                  />
                                </div>
                                <div className="col-md-3 btn-mr-rate d-flex">
                                  {isMasterEditIndex ?
                                    <>
                                      <button
                                        type="button"
                                        className={'btn btn-primary add-button-big'}
                                        onClick={updateMasterLevel}
                                      >Update</button>

                                      <button
                                        type="button"
                                        className={'reset-btn ml-2'}
                                        onClick={resetMasterLevel}
                                      >Cancel</button>
                                    </>
                                    :
                                    <button
                                      type="button"
                                      className={'user-btn add-button-big ml-2'}
                                      onClick={setMasterLevel}
                                    ><div className={'plus'}></div>ADD</button>}
                                </div>
                              </div>

                              <div className="row form-group">
                                <div className="col-md-12">
                                  <Table className="table border" size="sm" >
                                    <thead>
                                      <tr>
                                        <th className="border-bottom-none">{`Master`}</th>
                                        <th className="border-bottom-none">{`Level`}</th>
                                        <th className="text-right border-bottom-none">{`Action`}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {
                                        masterLevelGrid &&
                                        masterLevelGrid.map((item, index) => {
                                          return (
                                            <tr key={index}>
                                              <td>{item.Master}</td>
                                              <td>{item.Level}</td>
                                              <td className="text-right">
                                                <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => editMasterItem(index)} />
                                                <button title='Delete' className="Delete" type={'button'} onClick={() => deleteMasterItem(index)} />
                                              </td>
                                            </tr>
                                          )
                                        })
                                      }
                                      {masterLevelGrid.length === 0 && <tr>
                                        <td colSpan={3}>
                                          <NoContentFound title={EMPTY_DATA} />
                                        </td>
                                      </tr>
                                      }
                                    </tbody>
                                  </Table>

                                </div>
                              </div>
                            </>
                          }
                        </>

                      }
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
                      onClick={cancel}
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
                      {isEditFlag ? 'UPDATE' : 'SAVE'}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
      {
        showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.COSTING_REJECT_ALERT}`} />
      }
    </div>
  );
}

/**
 * Form validations
 * @param values
 * @returns {{}}
 */
function validate(values) {
  let errors = {};

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

export default UserRegistration

