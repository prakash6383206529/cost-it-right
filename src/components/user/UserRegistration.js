import React, { useEffect, useState } from "react";
import { SearchableSelectHookForm, TextFieldHookForm, PasswordFieldHookForm, AsyncSearchableSelectHookForm, NumberFieldHookForm } from '../../components/layout/HookFormInputs'
import { useForm, Controller } from "react-hook-form";
import Toaster from "../common/Toaster";
import { Loader } from "../common/Loader";
import AsyncSelect from 'react-select/async';
import {
  minLength3, minLength10, maxLength12, required, email, minLength6, minLength7, maxLength18, maxLength11,
  maxLength6, checkWhiteSpaces, postiveNumber, maxLength80, maxLength5, acceptAllExceptSingleSpecialCharacter, strongPassword, maxLength25, hashValidation, number, maxLength50, getNameBySplitting, getCodeBySplitting, checkSpacesInString, checkSingleSpaceInString
} from "../../helper/validation";
import {
  registerUserAPI, getAllRoleAPI, getAllDepartmentAPI, getUserDataAPI, updateUserAPI, setEmptyUserDataAPI, getRoleDataAPI, getAllTechnologyAPI,
  getPermissionByUser, getUsersTechnologyLevelAPI, getLevelByTechnology, getSimulationTechnologySelectList, getSimualationLevelByTechnology, getUsersSimulationTechnologyLevelAPI, getMastersSelectList, getUsersMasterLevelAPI, getMasterLevelDataList, getMasterLevelByMasterId, registerRfqUser, updateRfqUser, getAllLevelAPI, checkHighestApprovalLevelForHeadsAndApprovalType, getOnboardingLevelById, getPlantSelectListForDepartment, getUsersOnboardingLevelAPI,
  getAllDivisionListAssociatedWithDepartment
} from "../../actions/auth/AuthActions";
import { getCityByCountry, getReporterList, getApprovalTypeSelectList, getVendorNameByVendorSelectList, getApprovalTypeSelectListUserModule } from "../../actions/Common";
import { MESSAGES } from "../../config/message";
import { IsSendMailToPrimaryContact, IsSendQuotationToPointOfContact, getConfigurationKey, handleDepartmentHeader, loggedInUserId } from "../../helper/auth";
import { Button, Row, Col } from 'reactstrap';
import { EMPTY_DATA, IV, IVRFQ, KEY, KEYRFQ, ONBOARDINGID, ONBOARDINGNAME, SPACEBAR, VBC_VENDOR_TYPE, VENDORNEEDFOR, ZBC, searchCount } from "../../config/constants";
import NoContentFound from "../common/NoContentFound";
import HeaderTitle from "../common/HeaderTitle";
import PermissionsTabIndex from "./RolePermissions/PermissionsTabIndex";
import { EMPTY_GUID, COSTING_LEVEL, SIMULATION_LEVEL, MASTER_LEVEL, ONBOARDING_MANAGEMENT_LEVEL } from "../../config/constants";
import PopupMsgWrapper from "../common/PopupMsgWrapper";
import { useDispatch, useSelector } from 'react-redux'
import { reactLocalStorage } from "reactjs-localstorage";
import { autoCompleteDropdown, DropDownFilterList } from "../common/CommonFunctions";
import _, { debounce } from "lodash";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import { PaginationWrapper } from "../common/commonPagination";
import { apiErrors } from "../../helper";
import TourWrapper from "../common/Tour/TourWrapper";
import { useTranslation } from "react-i18next";
import { Steps } from "./TourMessages";
import TooltipCustom from "../common/Tooltip";
import { useLabels } from "../../helper/core";
import LoaderCustom from "../common/LoaderCustom";


var CryptoJS = require('crypto-js')
const gridOptionsTechnology = {}
const gridOptionsSimulation = {}
const gridOptionsMaster = {}
const gridOptionsOnboarding = {}

const gridOptions = {
  gridOptionsTechnology: gridOptionsTechnology,
  gridOptionsSimulation: gridOptionsSimulation,
  gridOptionsMaster: gridOptionsMaster,
  gridOptionsOnboarding: gridOptionsOnboarding
};
function UserRegistration(props) {

  const { t } = useTranslation("UserRegistration")
  const [state, setState] = useState({
    city: [],
    showErrorOnFocus: false,
    inputLoader: false
  })
  const [token, setToken] = useState("");
  const [lowerCaseCheck, setLowerCaseCheck] = useState(false);
  const [upperCaseCheck, setUpperCaseCheck] = useState(false);
  const [numberCheck, setNumberCheck] = useState(false);
  const [lengthCheck, setLengthCheck] = useState(false);
  const [specialCharacterCheck, setSpecialCharacterCheck] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isShowHide, setIsShowHide] = useState(false);
  const [isShowHidePassword, setIsShowHidePassword] = useState(false);
  const [primaryContact, setPrimaryContact] = useState(false);
  const [department, setDepartment] = useState([]);
  const [oldDepartment, setOldDepartment] = useState([]);
  const [role, setRole] = useState([]);
  // const [city, setCity] = useState([]);
  const [isEditFlag, setIsEditFlag] = useState(false);
  const [isShowForm, setIsShowForm] = useState(false);
  const [UserId, setUserId] = useState("");
  const [acc1, setAcc1] = useState(false);
  const [acc2, setAcc2] = useState(false);
  const [acc3, setAcc3] = useState(false);
  const [acc4, setAcc4] = useState(false);
  const [IsShowAdditionalPermission, setIsShowAdditionalPermission] = useState(false);
  const [isForcefulUpdate, setIsForcefulUpdate] = useState(false);
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
  const [onboardingLevel, setOnboardingLevels] = useState([]);
  const [onboardingLevelGrid, setOnboardingLevelGrid] = useState([]);
  const [oldOnboardingLevelGrid, setOldOnboardingLevelGrid] = useState([]);
  const [onboardingLevelEditIndex, setOnboardingLevelEditIndex] = useState('');
  const [isOnboardingEditIndex, setIsOnboardingEditIndex] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [updatedObj, setUpdatedObj] = useState({});
  const [RoleId, setRoleId] = useState("");
  const [vendor, setVendor] = useState("");
  const [reporter, setReporter] = useState("");
  const [isRfqUser, setIsRfqUser] = useState(false);
  const [costingApprovalType, setCostingApprovalType] = useState([]);
  const [simulationApprovalType, setSimulationApprovalType] = useState([]);
  const [masterApprovalType, setMasterApprovalType] = useState([]);
  const [OnboardingApprovalType, setOnboardingApprovalType] = useState([]);
  const [grantUserWisePermission, setGrantUserWisePermission] = useState(false);
  const [gridApiTechnology, setgridApiTechnology] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [gridColumnApiTechnology, setgridColumnApiTechnology] = useState(null);
  const [gridApiSimulation, setgridApiSimulation] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [gridColumnApiSimulation, setgridColumnApiSimulation] = useState(null);
  const [gridApiMaster, setgridApiMaster] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [gridColumnApiMaster, setgridColumnApiMaster] = useState(null);
  const [gridApiOnboarding, setgridApiOnboarding] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
  const [gridColumnApiOnboarding, setgridColumnApiOnboarding] = useState(null);
  const [isUpdateResponded, setIsUpdateResponded] = useState(false)
  const [costingTableChanged, setCostingTableChanged] = useState(false)
  const [simulationTableChanged, setSimulationTableChanged] = useState(false)
  const [onboardingTableChanged, setOnboardingTableChanged] = useState(false)
  const [masterTableChanged, setMasterTableChanged] = useState(false)
  const [isDepartmentUpdated, setIsDepartmentUpdated] = useState(false)
  const [selectedPlants, setSelectedPlants] = useState([])
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);

  const [inputLoader, setInputLoader] = useState({
    plant: false
  })
  const [isShowDivision, setIsShowDivision] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState([])
  const dispatch = useDispatch()
  const { technologyLabel, vendorLabel } = useLabels();
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  // const cityList = useSelector(state => state.comman.cityList)
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
  const levelList = useSelector(state => state.auth.levelList)
  const OnboardingLevelSelectList = useSelector(state => state.auth.OnboardingLevelSelectList)
  const plantSelectListForDepartment = useSelector(state => state.auth.plantSelectListForDepartment);
  const divisionListForDepartment = useSelector(state => state.auth.divisionListForDepartment);
  const approvalTypeCosting = useSelector(state => state.comman.approvalTypeCosting)

  const approvalTypeSimulation = useSelector(state => state.comman?.approvalTypeSimulation)
  const approvalTypeMaster = useSelector(state => state.comman?.approvalTypeMaster)
  const approvalTypeOnboarding = useSelector(state => state.comman?.approvalTypeOnboarding)

  const defaultValues = {
    FirstName: props?.data?.isEditFlag && registerUserData && registerUserData.FirstName !== undefined ? registerUserData.FirstName : '',
    MiddleName: props?.data?.isEditFlag && registerUserData && registerUserData.MiddleName !== undefined ? registerUserData.MiddleName : '',
    LastName: props?.data?.isEditFlag && registerUserData && registerUserData.LastName !== undefined ? registerUserData.LastName : '',
    EmailAddress: props?.data?.isEditFlag && registerUserData && registerUserData.EmailAddress !== undefined ? registerUserData.EmailAddress : '',
    UserName: props?.data?.isEditFlag && registerUserData && registerUserData.UserName !== undefined ? registerUserData.UserName : '',
    Mobile: props?.data?.isEditFlag && registerUserData && registerUserData.Mobile !== undefined ? registerUserData.Mobile : '',
    Password: props?.data?.isEditFlag && registerUserData && registerUserData.Password !== undefined ? '' : '',
    passwordConfirm: props?.data?.isEditFlag && registerUserData && registerUserData.Password !== undefined ? '' : '',
    AddressLine1: props?.data?.isEditFlag && registerUserData && registerUserData.AddressLine1 !== undefined ? registerUserData.AddressLine1 : '',
    AddressLine2: props?.data?.isEditFlag && registerUserData && registerUserData.AddressLine2 !== undefined ? registerUserData.AddressLine2 : '',
    ZipCode: props?.data?.isEditFlag && registerUserData && registerUserData.ZipCode !== undefined ? registerUserData.ZipCode : '',
    PhoneNumber: props?.data?.isEditFlag && registerUserData && registerUserData.PhoneNumber !== undefined ? registerUserData.PhoneNumber : '',
    Extension: props?.data?.isEditFlag && registerUserData && registerUserData.Extension !== undefined ? registerUserData.Extension : '',
    plant: ''
  }


  const { register, handleSubmit, formState: { errors }, control, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const defaultColDef = {
    resizable: true,
    filter: true,
    sortable: false,

  };

  useEffect(() => {
    dispatch(getApprovalTypeSelectListUserModule(COSTING_LEVEL, () => { }));
    dispatch(getApprovalTypeSelectListUserModule(SIMULATION_LEVEL, () => { }));
    dispatch(getApprovalTypeSelectListUserModule(MASTER_LEVEL, () => { }));
    dispatch(getApprovalTypeSelectListUserModule(ONBOARDING_MANAGEMENT_LEVEL, () => { }));
  }, [dispatch]);

  useEffect(() => {
    if (registerUserData && props?.data?.isEditFlag) {
      const CommonField = ['FirstName', 'MiddleName', 'LastName', 'EmailAddress', 'UserName', 'Mobile', 'AddressLine1', 'AddressLine2', 'ZipCode', 'PhoneNumber', 'Extension']
      CommonField.forEach(element => {
        setValue(element, registerUserData && registerUserData[element] !== undefined ? registerUserData[element] : '',)
      })
      setValue('Password', registerUserData && registerUserData.Password !== undefined ? '' : '',)
      setValue('passwordConfirm', registerUserData && registerUserData.Password !== undefined ? '' : '',)
      setValue('CityId', registerUserData && registerUserData.CityName !== undefined ? {
        label: registerUserData.CityName, value: registerUserData.CityId
      } : '')
      setValue('RoleId', registerUserData && registerUserData.RoleName !== undefined ? {
        label: registerUserData.RoleName, value: registerUserData.RoleId
      } : '')
      let tempArray = []
      registerUserData && registerUserData?.Departments?.map((item) => {
        tempArray.push({ label: item?.DepartmentName, value: (item?.DepartmentId)?.toString() })
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
    dispatch(getLevelByTechnology(false, '', '', () => { }))
    getUserDetail(data);
    dispatch(getSimulationTechnologySelectList(() => { }))
    dispatch(getMastersSelectList(() => { }))
    if (props?.RFQUser) {
      dispatch(getReporterList(() => { }))
    }
    dispatch(getApprovalTypeSelectList('', () => { }))
    dispatch(getAllLevelAPI(() => { }))
    return () => {
      reactLocalStorage?.setObject('vendorData', [])
    }
  }, [])

  /**
    * @name emptyLevelDropdown
    * @desc To empty level dropdown reducer
    */
  const emptyLevelDropdown = () => {
    dispatch(getLevelByTechnology(false, '', '', () => { }))
    dispatch(getSimualationLevelByTechnology(false, '', '', () => { }))
    dispatch(getMasterLevelByMasterId(false, '', '', () => { }))
  }

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
    const isAllowMultiple = getConfigurationKey().IsAllowMultiSelectApprovalType

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

    // if (label === 'city') {
    //   cityList && cityList.map(item => {
    //     if (item.Value === '0') return false;
    //     temp.push({ label: item.Text, value: item.Value })
    //     return null;
    //   });
    //   return temp;
    // }
    if (label === 'technology') {
      const temp = [];

      technologyList && technologyList?.forEach(item => {
        if (item?.Value === '0' && !isEditIndex && isAllowMultiple) {
          temp.push({ label: "Select All", value: item?.Value });
        } else if (item?.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value });
        }
      });
      const isSelectAllOnly = temp.length === 1 && temp[0]?.Text === "Select All" && temp[0]?.Value === "0";

      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }


    if (label === 'heads') {
      const temp = [];
      simulationTechnologyList && simulationTechnologyList.forEach(item => {

        if (item?.Value === '0' && !isSimulationEditIndex && isAllowMultiple) {
          temp.push({ label: "Select All", value: item?.Value });
        } else if (item?.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value })
        }
      });
      const isSelectAllOnly = temp.length === 1 && temp[0]?.Text === "Select All" && temp[0]?.Value === "0";
      if (isSelectAllOnly) {
        return [];
      }
      return temp;
    }

    if (label === 'masters') {
      const temp = [];

      masterList && masterList.forEach(item => {
        if (item?.Value === '0' && !isMasterEditIndex) {
          temp.push({ label: "Select All", value: item?.Value });
        } else if (item?.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value })

        }
      });
      const isSelectAllOnly = temp.length === 1 && temp[0]?.Text === "Select All" && temp[0]?.Value === "0";
      if (isSelectAllOnly) {
        return [];

      }
      return temp;
    }
    if (label === 'level') {
      const approvalList = (getConfigurationKey().IsAllowMultiSelectApprovalType && !isEditIndex) ? levelList : levelSelectList
      approvalList && approvalList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
    }

    if (label === 'simualtionLevel') {
      const approvalList = (getConfigurationKey().IsAllowMultiSelectApprovalType && !isSimulationEditIndex) ? levelList : simulationLevelSelectList
      approvalList && approvalList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp;
    }

    if (label === 'masterLevel') {
      const approvalList = (getConfigurationKey().IsAllowMultiSelectApprovalType && !isMasterEditIndex) ? levelList : masterLevelSelectList
      approvalList && approvalList.map(item => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp;
    }

    if (label === 'onboardingLevel') {
      const approvalList = (getConfigurationKey().IsAllowMultiSelectApprovalType && !isOnboardingEditIndex) ? levelList : OnboardingLevelSelectList
      approvalList && approvalList.map(item => {
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

    if (label === 'approvalTypeCosting') {
      approvalTypeCosting && approvalTypeCosting.forEach(item => {
        if (item.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value });
        }
      });
      // Add "Select All" at the 0th position if isEditIndex is false
      if (!isEditIndex && isAllowMultiple) {
        temp.unshift({ label: "Select All", value: '0' });
      }
      const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";
      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }

    if (label === 'approvalTypeSimulation') {
      approvalTypeSimulation && approvalTypeSimulation.map(item => {
        if (item.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value });
        }
      });
      // Add "Select All" at the 0th position if isEditIndex is false
      if (!isSimulationEditIndex && isAllowMultiple) {
        temp.unshift({ label: "Select All", value: '0' });
      }
      const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";
      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }
    if (label === 'approvalTypeMaster') {
      approvalTypeMaster && approvalTypeMaster.map(item => {
        if (item.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value });
        }
      });
      // Add "Select All" at the 0th position if isEditIndex is false
      if (!isMasterEditIndex && isAllowMultiple) {
        temp.unshift({ label: "Select All", value: '0' });
      }
      const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";
      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }
    if (label === 'approvalTypeOnboarding') {
      approvalTypeOnboarding && approvalTypeOnboarding.map(item => {
        if (item.Value !== '0') {
          temp.push({ label: item.Text, value: item.Value });
        }
      });
      // Add "Select All" at the 0th position if isEditIndex is false
      if (!isOnboardingEditIndex && isAllowMultiple) {
        temp.unshift({ label: "Select All", value: '0' });
      }
      const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";
      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }
    if (label === 'plant') {
      plantSelectListForDepartment?.forEach((item) => {
        
        if (item?.PlantId === '0') {
          temp.push({ label: "Select All", value: '0' });
        } else {
          temp.push({ ...item,label: item.PlantNameCode, value: item.PlantId })
        }
      });
      const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";
      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }
    if (label === 'division') {
      const selectedDivisionIds = selectedDivision.map(div => div.value);

      divisionListForDepartment?.forEach((item) => {
        if (String(item?.DivisionId) === '0') {
          temp.push({ label: "Select All", value: '0' });
        } else if (!selectedDivisionIds.includes(String(item.DivisionId))) {
          temp.push({ label: item.DivisionNameCode, value: item.DivisionId, DivisionCode: item.DivisionCode })
        }
      });

      const isSelectAllOnly = temp.length === 1 && temp[0]?.label === "Select All" && temp[0]?.value === "0";
      if (isSelectAllOnly) {
        return [];
      } else {
        return temp;
      }
    }

  }

  /**
   * @method departmentHandler
   * @description Used to handle 
  */
  const departmentHandler = (newValue, actionMeta) => {
    let departmentIds = []
    let copiedArr = getConfigurationKey().IsMultipleDepartmentAllowed ? newValue : [newValue]
    copiedArr && copiedArr?.map(item => {
      departmentIds.push(item?.value)
    })
    let obj = {
      DepartmentIdList: departmentIds,
      IsApproval: true
    }
    dispatch(getAllDivisionListAssociatedWithDepartment(obj, res => {
      if (res && res?.data && res?.data?.Identity === true) {
        setIsShowDivision(true)
      } else {
        setIsShowDivision(false)
      }
    }))
    if (selectedPlants.length > 0) {
      setValue('plant', [])
    }
    if (getConfigurationKey().IsMultipleDepartmentAllowed) {
      let idArr = [];
      newValue && newValue.map(item => {
        idArr.push(item.value)
      })
      setInputLoader(prevState => ({ ...prevState, plant: true }))
      dispatch(getPlantSelectListForDepartment(idArr, res => {
        setInputLoader(prevState => ({ ...prevState, plant: false }))
      }))
      setDepartment(newValue)
    } else {
      setDepartment([newValue])
      dispatch(getPlantSelectListForDepartment([newValue.value], res => { }))
    }

    if (JSON.stringify(newValue) !== JSON.stringify(oldDepartment)) {
      setIsForcefulUpdate(true)
    }


    else { setIsForcefulUpdate(false) }

  };

  const handleDivisionChange = (newValue) => {
    if (newValue && ((newValue[0]?.value) === '0' || newValue?.some(item => item?.value === '0'))) {
      // Select All option is chosen
      const allDivisionExceptZero = divisionListForDepartment
        .filter(item => String(item?.DivisionId) !== '0')
        .map(item => ({ label: item?.DivisionNameCode, value: item?.DivisionId, DivisionCode: item?.DivisionCode }));
      setSelectedDivision(allDivisionExceptZero);
      setTimeout(() => {
        setValue('Division', allDivisionExceptZero);
      }, 50);
    } else if (newValue && newValue?.length > 0) {
      // Other options are chosen
      setSelectedDivision(newValue);
    } else {
      // No option is chosen
      setSelectedDivision([]);
      setValue('Division', '');  // Assuming you want to clear the form value when nothing is selected
    }
  }
  /**
    * @method roleHandler
    * @description Used to handle 
    */
  const roleHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setRole(newValue)
      setModules([])
      setIsShowAdditionalPermission(false)
      // getRoleDetail(newValue.value)

    } else {
      setRole([])
      setModules([])
      setIsShowAdditionalPermission(false)
    }
    if (newValue.value !== RoleId.value) {
      setIsForcefulUpdate(true)
    }
    else { setIsForcefulUpdate(false) }
  };


  /**
  * @method cityHandler
  * @description Used to handle city
  */
  const cityHandler = (selectedOption) => {
    if (selectedOption) {
      setState(prevState => ({
        ...prevState,
        city: selectedOption
      }));
      setValue('CityId', selectedOption.value);
    } else {
      setState(prevState => ({
        ...prevState,
        city: null
      }));
      setValue('CityId', '');
    }
  };


  const vendorHandler = (newValue, actionMeta) => {

    setVendor(newValue)
  };


  const handleReporterChange = (value) => {
    setReporter(value)
  }
  const onPrimaryContactCheck = () => {
    setPrimaryContact(!primaryContact)
  }

  /**
  * @method getUserDetail
  * @description used to get user detail
  */
  const getUserDetail = (data) => {
    if (data && data.isEditFlag) {

      setIsLoader(true)
      setIsPermissionLoading(true)
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

          let idArr = [];
          Data.Departments && Data.Departments.map(item => {
            idArr.push(item.DepartmentId)
          })
          dispatch(getPlantSelectListForDepartment(idArr, res => { }))
          let obj = {
            DepartmentIdList: idArr,
            IsApproval: true
          }
          dispatch(getAllDivisionListAssociatedWithDepartment(obj, res => {
            if (res && res?.data && res?.data?.Identity === true) {
              setIsShowDivision(true)
            } else {
              setIsShowDivision(false)
            }

          }))
          setTimeout(() => {
            let plantArray = []
            Data && Data?.DepartmentsPlantsIdLists?.map((item) => {
              plantArray.push({ label: `${item.PlantName}`, value: (item?.PlantId)?.toString(), PlantCode: item?.PlantCode, PlantName: item?.PlantName, PlantId: item?.PlantId })
              return null;
            })
            let divisionArray = []
            Data && Data?.DepartmentsDivisionIdLists?.map((item) => {
              divisionArray.push({ label: `${item.DivisionName}`, value: (item?.DivisionId)?.toString(), DivisionCode: item?.DivisionCode })
              return null;
            })
            setSelectedPlants(plantArray)
            setSelectedDivision(divisionArray)
            setValue('plant', plantArray)
            setValue('Division', divisionArray)
            const depatArr = []
            const RoleObj = roleList && roleList.find(item => item.RoleId === Data.RoleId)
            Data.Departments && Data.Departments.map(item => (depatArr.push({ label: item.DepartmentName, value: item.DepartmentId })))
            setPrimaryContact(Data.IsPrimaryContact)
            setIsEditFlag(true)
            setIsLoader(false)
            setIsShowAdditionalPermission(Data.IsAdditionalAccess)
            setGrantUserWisePermission(Data.IsAdditionalAccess)
            setDepartment(depatArr)
            setOldDepartment(depatArr)
            setRole(RoleObj !== undefined ? { label: RoleObj.RoleName, value: RoleObj.RoleId } : [])
            // setState(prevState => ({ ...prevState, city: { label: registerUserData?.StateName, value: registerUserData?.StateId } }));
            // setCity({ label: registerUserData?.CityName, value: registerUserData?.CityId })
            setRoleId(RoleObj !== undefined ? { label: RoleObj.RoleName, value: RoleObj.RoleId } : [])
            setValue('UserName', Data?.UserName)
            // setCity({
            //   label: Data?.CityName, value: Data?.CityId
            // })
            setState(prevState => ({ ...prevState, city: { label: Data?.CityName, value: Data?.CityId } }));

            if (Data.IsAdditionalAccess) {
              getUserPermission(data.UserId)
            } else {
              setIsPermissionLoading(false)
            }

          }, 700)

          getUsersTechnologyLevelData(data.UserId)
          getUsersSimulationTechnologyLevelData(data.UserId)
          getUsersMasterLevelData(data.UserId)
          getOnboardingUserData(data.UserId)
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
    // setIsPermissionLoading(true)

    dispatch(getPermissionByUser(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        setModules(Data.Modules)
        setOldModules(Data.Modules)

        // setIsPermissionLoading(false);

        //child.getUpdatedData(Data.Modules)  //need to convertt  to functional
      }
    }))
  }

  /**
  * @method getUsersTechnologyLevelData
  * @description used to get users technology level listing
  */
  const getUsersTechnologyLevelData = (UserId) => {
    dispatch(getUsersTechnologyLevelAPI(UserId, 0, (res) => {
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
    dispatch(getUsersSimulationTechnologyLevelAPI(UserId, 0, (res) => {
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
    dispatch(getUsersMasterLevelAPI(UserId, 0, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let masterSimulationLevel = Data.MasterLevels;
        setMasterLevelGrid(masterSimulationLevel)
        setOldMasterLevelGrid(masterSimulationLevel)
      }
    }))
  }
  /**
  * @method getOnboardingUserData
  * @description used to get users Onboarding level listing
  */
  const getOnboardingUserData = (UserId) => {
    dispatch(getUsersOnboardingLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let onboardingLevel = Data.OnboardingApprovalLevels;
        setOnboardingLevelGrid(onboardingLevel)
        setOldOnboardingLevelGrid(onboardingLevel)
      }
    }))
  }

  //Below code for Table rendering...... 

  /**
   * @method onPressUserPermission
   * @description Used for User's additional permission
   */
  const onPressUserPermission = (e) => {
    

      ; // Set loading to true when starting

    if (role && role.value) {
      

      setIsShowAdditionalPermission(!IsShowAdditionalPermission)
      setModules([])

      if (isEditFlag && grantUserWisePermission) {
        
        
        if (!e) {
          setIsPermissionLoading(true)
        }
        getUserPermission(UserId)
      } else {
        
        if (!e) {
          setIsPermissionLoading(true)
        }
        getRoleDetail(role.value, !IsShowAdditionalPermission)
      }
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
      setIsPermissionLoading(false);

    }
  }


  /**
   * @method getRoleDetail
   * @description used to get role detail
   */
  const getRoleDetail = (RoleId, IsShowAdditionalPermission) => {
    // setIsPermissionLoading(true)

    if (RoleId !== '') {
      dispatch(getRoleDataAPI(RoleId, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          // setRoleId(RoleId)
          setModules(Data.Modules)
          setOldModules(Data.Modules)
          setIsLoader(false)
          // setIsPermissionLoading(false);

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
  const technologyHandler = (newValue) => {
    const selectedOptions = technologyList
      .filter((option) => option?.Value !== '0')
      .map(({ Text, Value }) => ({ label: Text, value: Value }));
    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      setTechnology(selectedOptions);
      setTimeout(() => {
        setValue('TechnologyId', selectedOptions)
      }, 100);
      setLevel([]);
      setValue('LevelId', '')
      setValue('CostingApprovalType', "")
      emptyLevelDropdown();
    }
    else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      setTechnology(newValue)
    } else {
      setTechnology([])
      setValue('TechnologyId', '')
    }
  }

  /**
   * @method costingApprovalTypeHandler
   * @description Used to handle 
   */
  const costingApprovalTypeHandler = (newValue, actionMeta) => {
    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      const selectedOptions = approvalTypeCosting.filter((option) => option?.Value !== '0')
        .map(({ Text, Value }) => ({ label: Text, value: Value }));
      setCostingApprovalType(selectedOptions);
      setTimeout(() => {
        setValue('CostingApprovalType', selectedOptions)
      }, 100);
      setLevel([]);
      setValue('LevelId', '');
      dispatch(getLevelByTechnology(true, technology.value, newValue.value, res => { }));
    } else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      setCostingApprovalType(newValue)
      setLevel([])
      setValue('LevelId', '')
      if (!getConfigurationKey().IsAllowMultiSelectApprovalType || isEditIndex) {
        dispatch(getLevelByTechnology(true, technology.value, newValue.value, res => { }))
      }
    } else {
      setCostingApprovalType([])
      setValue('CostingApprovalType', '')
    }
  };
  /**
   * @method simulationApprovalTypeHandler
   * @description Used to handle 
   */
  const simulationApprovalTypeHandler = (newValue, actionMeta) => {
    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      const selectedOptions = approvalTypeSimulation
        .filter((option) => option?.Value !== '0')
        .map(({ Text, Value }) => ({ label: Text, value: Value }));
      setSimulationApprovalType(selectedOptions);
      setTimeout(() => {
        setValue('SimulationApprovalType', selectedOptions)
      }, 100);
      setSimualtionLevel([]);
      setValue('SimualtionLevel', '');
      dispatch(getSimualationLevelByTechnology(true, simulationHeads.value, newValue.value, res => { }));
    }
    else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      setSimulationApprovalType(newValue)
      setSimualtionLevel([])
      setValue('simualtionLevel', '')
      if (!getConfigurationKey().IsAllowMultiSelectApprovalType || isSimulationEditIndex) {
        dispatch(getSimualationLevelByTechnology(true, simulationHeads.value, newValue.value, res => { }))
      }
    } else {
      setSimulationApprovalType([])
      setValue('SimulationApprovalType', '')
    }
  };

  /**
   * @method masterApprovalTypeHandler
   * @description Used to handle 
   */
  const masterApprovalTypeHandler = (newValue, actionMeta) => {
    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      const selectedOptions = approvalTypeMaster
        .filter((option) => option?.Value !== '0')
        .map(({ Text, Value }) => ({ label: Text, value: Value }));
      setMasterApprovalType(selectedOptions);
      setTimeout(() => {
        setValue('MasterApprovalType', selectedOptions)
      }, 100);
      setMasterLevels([]);
      setValue('MasterLevel', '');
      dispatch(getMasterLevelByMasterId(true, master.value, newValue.value, res => { }));
    }
    else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      setMasterApprovalType(newValue)
      setMasterLevels([])
      setValue('masterLevel', '')
      if (!getConfigurationKey().IsAllowMultiSelectApprovalType || isMasterEditIndex) {
        dispatch(getMasterLevelByMasterId(true, master.value, newValue.value, res => { }))
      }
    } else {
      setMasterApprovalType([])
      setValue('MasterApprovalType', '')
    }
  };

  /**
   * @method onboardingApprovalTypeHandler
   * @description Used to handle onboarding ApprovalType Handler
   */
  const onboardingApprovalTypeHandler = (newValue, actionMeta) => {

    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      const selectedOptions = approvalTypeOnboarding
        .filter((option) => option?.Value !== '0')
        .map(({ Text, Value }) => ({ label: Text, value: Value }));
      setOnboardingApprovalType(selectedOptions);
      setTimeout(() => {
        setValue('OnboardingApprovalType', selectedOptions)
      }, 100);
      setOnboardingLevels([]);
      setValue('onboardingLevel', '');
      dispatch(getOnboardingLevelById(true, newValue.value, res => { }))
    }
    else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      setOnboardingApprovalType(newValue)
      setOnboardingLevels([]);
      setValue('onboardingLevel', '')
      if (!getConfigurationKey().IsAllowMultiSelectApprovalType || isOnboardingEditIndex) {
        dispatch(getOnboardingLevelById(true, newValue.value, res => { }))
      }
    } else {
      setOnboardingApprovalType([])
      setValue('OnboardingApprovalType', '')
    }
  };

  /**
   * @method headHandler
   * @description USED TO HANLE SIMULATION HEAD AND CALL HEAD LEVEL API
  */

  const headHandler = (newValue) => {

    const selectedOptions = simulationTechnologyList
      .filter((option) => option?.Value !== '0')
      .map(({ Text, Value }) => ({ label: Text, value: Value }));
    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      // Filter out the "Select All" option

      setSimulationHeads(selectedOptions);
      setTimeout(() => {
        setValue('Head', selectedOptions);
      }, 100);
      setLevel([]);
      emptyLevelDropdown();
    }
    else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      // Set selected options directly
      setSimulationHeads(newValue);
    } else {
      setSimulationHeads([])
      // Clear form value when no option is selected
      setValue('Head', '');
    }
  }

  /**
   * @method masterHandler
   * @description USED TO HANLE MASTER AND CALL MASTER LEVEL API
  */
  const masterHandler = (newValue, actionMeta) => {
    const selectedOptions = masterList
      .filter((option) => option?.Value !== '0')
      .map(({ Text, Value }) => ({ label: Text, value: Value }));
    if (Array.isArray(newValue) && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      // Filter out the "Select All" option


      setMaster(selectedOptions);
      setTimeout(() => {
        // Set selected options in the form value
        setValue('Master', selectedOptions);
      }, 100);
      setMasterLevels([]);
      setValue('masterLevel', '');
      setMasterApprovalType([]);
      setValue('MasterApprovalType', '');
      emptyLevelDropdown();
    }
    else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
      // Set selected options directly
      setMaster(newValue);
    } else {
      setMaster([])
      // Clear form value when no option is selected
      setValue('Master', '');
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
  * @method onboardingLevelHandler
  * @description Used to handle onboarding level
  */
  const onboardingLevelHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      setMasterLevels(newValue)
      setOnboardingLevels(newValue)
    } else {
      setOnboardingLevels([])
    }
  };

  const checkDuplicacy = (dataList, currentIndex, keyName, technology_master_id, approvalTypeIDValue, messageHead, levelId, isMulti = false) => {

    let stop = false
    let checkExists = false
    let isExistTechnology = false
    if (messageHead !== 'Onboarding') {
      checkExists = dataList.some((el, index) => {
        return (
          (Number(el?.TechnologyId) === Number(technology_master_id) || Number(el?.MasterId) === Number(technology_master_id)) &&
          (el.LevelId) === (levelId) &&
          Number(el.ApprovalTypeId) === Number(approvalTypeIDValue) &&
          index !== currentIndex
        )
      })
    } else {
      checkExists = dataList.some((el, index) => {
        return (
          Number(el.ApprovalTypeId) === Number(approvalTypeIDValue) &&
          (el.LevelId) === (levelId) &&
          index !== currentIndex
        )
      })
    }
    if (messageHead !== 'Onboarding') {
      isExistTechnology = dataList && dataList.findIndex((el, index) => {
        return (Number(el[keyName]) === Number(technology_master_id)) && (Number(el.ApprovalTypeId) === Number(approvalTypeIDValue)) && index !== currentIndex
      })
    } else {
      isExistTechnology = dataList && dataList.findIndex((el, index) => {
        return (Number(el.ApprovalTypeId) === Number(approvalTypeIDValue)) &&
          (el.LevelId) !== (levelId) && index !== currentIndex
      })
    }

    if (checkExists) {
      stop = true
      if (!isMulti) {
        Toaster.warning('Record already exists.')
      }
    } else if (isExistTechnology !== -1) {
      stop = true
      if (!isMulti) {
        Toaster.warning(`${messageHead} cannot have multiple level for same Approval Type.`)
      }
    }
    return stop
  }

  /**
  * @method setTechnologyLevel
  * @description Used to handle setTechnologyLevel
  */
  const setTechnologyLevel = async () => {
    let tempArray = [];

    if (technology.length === 0 || level.length === 0 || Object.keys(costingApprovalType).length === 0) {
      Toaster.warning(`Please select ${technologyLabel}, Approval Type and Level`)
      return false;
    }

    if (getConfigurationKey().IsAllowMultiSelectApprovalType) {
      let tempMultiApprovalArray = []
      let duplicateErrorArray = []
      let multiSelectObject = {}
      multiSelectObject.ApprovalHeadIdList = technology && technology.map((tech) => {
        return {

          ApprovalHeadId: tech.value,
          ApprovalHeadName: tech.label
        }
      })
      multiSelectObject.ApprovalTypeIdList = costingApprovalType && costingApprovalType.map((approval) => {
        return {

          ApprovalTypeId: approval.value,
          ApprovalTypeName: approval.label
        }
      })
      multiSelectObject.LevelId = level.value
      multiSelectObject.LevelName = level.label
      multiSelectObject.ApprovalModuleName = "Costing"
      try {
        let data = await checkHighestApprovalLevelForHeadsAndApprovalTypes(multiSelectObject)
        if (data.length === 0) {
          return false
        }
        data && data.map(approvalData => {
          let approvalObj = {
            Technology: approvalData?.ApprovalHeadName,
            TechnologyId: approvalData?.ApprovalHeadId,
            Level: approvalData?.LevelName,
            LevelId: approvalData?.LevelId,
            ApprovalType: approvalData?.ApprovalType,
            ApprovalTypeId: approvalData?.ApprovalTypeId,
          }
          if (!checkDuplicacy(TechnologyLevelGrid, approvalObj, 'TechnologyId', approvalData?.ApprovalHeadId, approvalData?.ApprovalTypeId, 'Technology', approvalData?.LevelId, true)) {
            tempMultiApprovalArray.push(approvalObj)
          } else {
            duplicateErrorArray.push(approvalObj)
            return false
          }
        })
        tempArray = [...TechnologyLevelGrid, ...tempMultiApprovalArray]
        if (duplicateErrorArray.length > 0) {
          const formattedStrings = duplicateErrorArray.map(item => `(${item.Technology} - ${item.ApprovalType} - ${item.Level})`);
          const FinalformattedString = formattedStrings.join(',');
          Toaster.warning(`Same record cannot exist for multiple or same approval types: ${FinalformattedString}`)
        }

      } catch (error) {
        apiErrors(error)
      }
    } else {

      let obj = {
        Technology: technology.label,
        TechnologyId: technology.value,
        Level: level.label,
        LevelId: level.value,
        ApprovalType: costingApprovalType?.label,
        ApprovalTypeId: costingApprovalType?.value,
      }

      if (checkDuplicacy(TechnologyLevelGrid, obj, 'TechnologyId', technology.value, costingApprovalType.value, 'Technology', level.value)) return false
      tempArray.push(...TechnologyLevelGrid, obj)
    }

    if (tempArray.length === 0) return false
    setTechnologyLevelGrid(tempArray)
    setLevel([])
    setTechnology([])
    setValue('TechnologyId', "")
    setValue('LevelId', "")
    setCostingApprovalType([])
    setValue('CostingApprovalType', "")
  };
  /**
  * @method updateTechnologyLevel
  * @description Used to handle updateTechnologyLevel
  */
  const updateTechnologyLevel = () => {
    let tempArray = [];

    if (technology.length === 0 || level.length === 0 || costingApprovalType.length === 0) {
      Toaster.warning('Please select technology and level')
      return false;
    }

    let tempData = TechnologyLevelGrid[technologyLevelEditIndex];
    tempData = {
      Technology: technology.label,
      TechnologyId: technology.value,
      Level: level.label,
      LevelId: level.value,
      ApprovalType: costingApprovalType?.label,
      ApprovalTypeId: costingApprovalType?.value,
    }

    if (checkDuplicacy(TechnologyLevelGrid, technologyLevelEditIndex, 'TechnologyId', technology.value, costingApprovalType.value, 'Technology', level.value)) return false

    tempArray = Object.assign([...TechnologyLevelGrid], { [technologyLevelEditIndex]: tempData })
    setTechnologyLevelGrid(tempArray)
    setLevel([])
    setTechnology([])
    setTechnologyLevelEditIndex('')
    setIsEditIndex(false)
    setCostingApprovalType([])
    setValue('TechnologyId', "")
    setValue('LevelId', "")
    setValue('CostingApprovalType', "")

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
    setCostingApprovalType([])
    setValue('CostingApprovalType', "")
    emptyLevelDropdown()
  };


  /**
   * @method setSimualtionHeadLevel
   * @description Used to handle setTechnologyLevel
   */
  const setSimualtionHeadLevel = async () => {
    let tempArray = [];

    if (simulationHeads.length === 0 || simualtionLevel.length === 0 || simulationApprovalType.length === 0) {
      Toaster.warning('Please select Head, Approval Type and Level')
      return false;
    }


    if (getConfigurationKey().IsAllowMultiSelectApprovalType) {
      let tempMultiApprovalArray = []
      let duplicateErrorArray = []
      let multiSelectObject = {}
      multiSelectObject.ApprovalHeadIdList = simulationHeads && simulationHeads.map((simHead) => {
        return {

          ApprovalHeadId: simHead?.value,
          ApprovalHeadName: simHead?.label
        }
      })
      multiSelectObject.ApprovalTypeIdList = simulationApprovalType && simulationApprovalType.map((approval) => {
        return {

          ApprovalTypeId: approval?.value,
          ApprovalTypeName: approval?.label
        }
      })
      multiSelectObject.LevelId = simualtionLevel.value
      multiSelectObject.LevelName = simualtionLevel.label
      multiSelectObject.ApprovalModuleName = "Simulation"
      try {
        let data = await checkHighestApprovalLevelForHeadsAndApprovalTypes(multiSelectObject)
        if (data.length === 0) {
          return false
        }
        data && data.map(approvalData => {
          let approvalObj = {
            Technology: approvalData?.ApprovalHeadName,
            TechnologyId: approvalData?.ApprovalHeadId,
            Level: approvalData?.LevelName,
            LevelId: approvalData?.LevelId,
            ApprovalType: approvalData?.ApprovalType,
            ApprovalTypeId: approvalData?.ApprovalTypeId,
          }
          if (!checkDuplicacy(HeadLevelGrid, approvalObj, 'TechnologyId', approvalData?.ApprovalHeadId, approvalData?.ApprovalTypeId, 'Simulation Head', approvalData?.LevelId, true)) {
            tempMultiApprovalArray.push(approvalObj)
          } else {
            duplicateErrorArray.push(approvalObj)
          }
        })
        if (duplicateErrorArray.length > 0) {
          const formattedStrings = duplicateErrorArray.map(item => `(${item.Technology} - ${item.ApprovalType} - ${item.Level})`);
          const FinalformattedString = formattedStrings.join(',');
          Toaster.warning(`Same record cannot exist for multiple or same approval types: ${FinalformattedString}`)
        }
        tempArray = [...HeadLevelGrid, ...tempMultiApprovalArray]
      } catch (error) {
        apiErrors(error)
      }
    } else {
      let obj = {
        Technology: simulationHeads.label,
        TechnologyId: simulationHeads.value,
        Level: simualtionLevel.label,
        LevelId: simualtionLevel.value,
        ApprovalType: simulationApprovalType?.label,
        ApprovalTypeId: simulationApprovalType?.value,
      }

      if (checkDuplicacy(HeadLevelGrid, obj, 'TechnologyId', simulationHeads.value, simulationApprovalType.value, 'Simulation Head', simualtionLevel.value)) return false
      tempArray.push(...HeadLevelGrid, obj)

    }

    if (tempArray.length === 0) return false
    setHeadLevelGrid(tempArray)
    setSimualtionLevel([])
    setSimulationHeads([])
    setValue('Head', '')
    setValue('simualtionLevel', '')
    setValue('SimulationApprovalType', "")
  };



  /**
   * @method updateSimualtionHeadLevel
   * @description Used to handle updateTechnologyLevel
  */
  const updateSimualtionHeadLevel = () => {

    let tempArray = [];

    if (simulationHeads.length === 0 || simualtionLevel.length === 0 || simulationApprovalType.length === 0) {
      Toaster.warning('Please select technology and level')
      return false;
    }

    let tempData = HeadLevelGrid[simulationLevelEditIndex];

    tempData = {
      Technology: simulationHeads.label,
      TechnologyId: simulationHeads.value,
      Level: simualtionLevel.label,
      LevelId: simualtionLevel.value,
      ApprovalType: simulationApprovalType?.label,
      ApprovalTypeId: simulationApprovalType?.value,
    }

    if (checkDuplicacy(HeadLevelGrid, simulationLevelEditIndex, 'TechnologyId', simulationHeads.value, simulationApprovalType.value, 'Simulation Head', simualtionLevel.value)) return false

    tempArray = Object.assign([...HeadLevelGrid], { [simulationLevelEditIndex]: tempData })
    setHeadLevelGrid(tempArray)
    setSimualtionLevel([])
    setSimulationHeads([])
    setSimulationLevelEditIndex('')
    setIsSimulationEditIndex(false)
    setSimulationApprovalType([])
    setValue('Head', '')
    setValue('simualtionLevel', '')
    setValue('SimulationApprovalType', '')
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
    setSimulationApprovalType([])
    setValue('Head', '')
    setValue('simualtionLevel', '')
    setValue('SimulationApprovalType', '')
    emptyLevelDropdown()
  };


  /**
  * @method editItemDetails
  * @description used to edit costing technology and level
  */
  const editItemDetails = (rowData, index) => {
    const tempData = rowData[index];
    dispatch(getLevelByTechnology(true, tempData.TechnologyId, tempData.ApprovalTypeId, res => { }))

    setTechnologyLevelEditIndex(index)
    setIsEditIndex(true)
    setValue('TechnologyId', { label: tempData.Technology, value: tempData.TechnologyId })
    setValue('LevelId', { label: tempData.Level, value: tempData.LevelId })
    setValue('CostingApprovalType', { label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
    setTechnology({ label: tempData.Technology, value: tempData.TechnologyId })
    setLevel({ label: tempData.Level, value: tempData.LevelId })
    setCostingApprovalType({ label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
  }

  /**
  * @method deleteItem
  * @description used to Reset form
  */
  const deleteItem = (rowData, index) => {

    let tempData = rowData.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    setTechnologyLevelGrid(tempData)
    setLevel([])
    setValue('TechnologyId', "")
    setValue('LevelId', "")
    setValue('CostingApprovalType', "")
    emptyLevelDropdown()
  }

  /**
  * @method editSimulationItemDetails
  * @description used to edit simulation head and level
  */
  const editSimulationItemDetails = (rowData, index) => {

    const tempData = rowData[index];
    dispatch(getSimualationLevelByTechnology(true, tempData.TechnologyId, tempData.ApprovalTypeId, res => { }))

    setSimulationLevelEditIndex(index)
    setIsSimulationEditIndex(true)
    setSimulationApprovalType({ label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
    setSimulationHeads({ label: tempData.Technology, value: tempData.TechnologyId })
    setSimualtionLevel({ label: tempData.Level, value: tempData.LevelId })
    setValue('Head', { label: tempData.Technology, value: tempData.TechnologyId })
    setValue('simualtionLevel', { label: tempData.Level, value: tempData.LevelId })
    setValue('SimulationApprovalType', { label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
  }

  /**
  * @method deleteItem
  * @description used to DELETE form
  */
  const deleteSimulationItem = (rowData, index) => {

    let tempData = rowData.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });
    setHeadLevelGrid(tempData)
    setSimualtionLevel([])
    setValue('Head', '')
    setValue('simualtionLevel', '')
    setValue('SimulationApprovalType', "")
    emptyLevelDropdown()
  }

  /***********MASTER LEVEL STARTS HERE**************/
  /**
   * @method setMasterLevel
   * @description Used to handle master level
   */
  const setMasterLevel = async () => {
    let tempArray = [];

    if (master.length === 0 || masterLevel.length === 0 || masterApprovalType.length === 0) {
      Toaster.warning('Please select Master, Approval Type and Level')
      return false;
    }

    if (getConfigurationKey().IsAllowMultiSelectApprovalType) {
      let tempMultiApprovalArray = []
      let duplicateErrorArray = []
      let multiSelectObject = {}
      multiSelectObject.ApprovalHeadIdList = master && master.map((master) => {
        return {

          ApprovalHeadId: master?.value,
          ApprovalHeadName: master?.label
        }
      })
      multiSelectObject.ApprovalTypeIdList = masterApprovalType && masterApprovalType.map((approval) => {
        return {

          ApprovalTypeId: approval?.value,
          ApprovalTypeName: approval?.label
        }
      })
      multiSelectObject.LevelId = masterLevel?.value
      multiSelectObject.LevelName = masterLevel?.label
      multiSelectObject.ApprovalModuleName = "Master"
      try {
        let data = await checkHighestApprovalLevelForHeadsAndApprovalTypes(multiSelectObject)
        if (data.length === 0) {
          return false
        }
        data && data.map(approvalData => {
          let approvalObj = {
            Master: approvalData?.ApprovalHeadName,
            MasterId: approvalData?.ApprovalHeadId,
            Level: approvalData?.LevelName,
            LevelId: approvalData?.LevelId,
            ApprovalType: approvalData?.ApprovalType,
            ApprovalTypeId: approvalData?.ApprovalTypeId,
          }
          if (!checkDuplicacy(masterLevelGrid, approvalObj, 'MasterId', approvalData?.ApprovalHeadId, approvalData?.ApprovalTypeId, 'Master', approvalData?.LevelId, true)) {
            tempMultiApprovalArray.push(approvalObj)
          } else {
            duplicateErrorArray.push(approvalObj)
          }
        })
        if (duplicateErrorArray.length > 0) {
          const formattedStrings = duplicateErrorArray.map(item => `(${item.Master} - ${item.ApprovalType} - ${item.Level})`);
          const FinalformattedString = formattedStrings.join(',');
          Toaster.warning(`Same record cannot exist for multiple or same approval types: ${FinalformattedString}`)
        }
        tempArray = [...masterLevelGrid, ...tempMultiApprovalArray]
      } catch (error) {
        apiErrors(error)
      }
    } else {

      let obj = {
        Master: master.label,
        MasterId: master.value,
        Level: masterLevel.label,
        LevelId: masterLevel.value,
        ApprovalType: masterApprovalType?.label,
        ApprovalTypeId: masterApprovalType?.value,
      }

      if (checkDuplicacy(masterLevelGrid, obj, 'MasterId', master.value, masterApprovalType.value, 'Master', masterLevel.value)) return false

      tempArray.push(...masterLevelGrid, obj)
    }
    if (tempArray.length === 0) return false
    setMasterLevelGrid(tempArray)
    setMasterLevels([])
    setMaster([])
    setValue('Master', '')
    setValue('masterLevel', '')
    setValue('MasterApprovalType', "")
  };

  /**
  * @method updateMasterLevel
  * @description Used to handle update Master and it's level
  */
  const updateMasterLevel = () => {
    let tempArray = [];

    if (master.length === 0 || masterLevel.length === 0 || masterApprovalType.length === 0) {
      Toaster.warning('Please select Master, Approval Type and Level')
      return false;
    }


    let tempData = masterLevelGrid[masterLevelEditIndex];
    tempData = {
      Master: master.label,
      MasterId: master.value,
      Level: masterLevel.label,
      LevelId: masterLevel.value,
      ApprovalType: masterApprovalType?.label,
      ApprovalTypeId: masterApprovalType?.value,
    }

    if (checkDuplicacy(masterLevelGrid, masterLevelEditIndex, 'MasterId', master.value, masterApprovalType.value, 'Master', masterLevel.value)) return false

    tempArray = Object.assign([...masterLevelGrid], { [masterLevelEditIndex]: tempData })
    setMasterLevelGrid(tempArray)
    setMasterLevels([])
    setMaster([])
    setMasterLevelEditIndex('')
    setIsMasterEditIndex(false)
    setMasterApprovalType([])
    setValue('Master', '')
    setValue('masterLevel', '')
    setValue('MasterApprovalType', '')
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
    setMasterApprovalType('')
    setValue('Master', '')
    setValue('masterLevel', '')
    setValue('MasterApprovalType', '')
    emptyLevelDropdown()
  };



  /**
  * @method editMasterItem
  * @description used to edit master detail form
  */
  const editMasterItem = (rowData, index) => {

    const tempData = rowData[index];
    dispatch(getMasterLevelByMasterId(true, tempData.MasterId, tempData.ApprovalTypeId, res => { }))

    setMasterLevelEditIndex(index)
    setIsMasterEditIndex(true)
    setMasterApprovalType({ label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
    setMaster({ label: tempData.Master, value: tempData.MasterId })
    setMasterLevels({ label: tempData.Level, value: tempData.LevelId })
    setValue('Master', { label: tempData.Master, value: tempData.MasterId })
    setValue('masterLevel', { label: tempData.Level, value: tempData.LevelId })
    setValue('MasterApprovalType', { label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
  }



  /**
  * @method deleteItem
  * @description used to delete master item 
  */
  const deleteMasterItem = (rowData, index) => {
    let tempData = rowData.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });
    setMasterLevelGrid(tempData)
    setMasterLevels([])
    setValue('Master', '')
    setValue('masterLevel', '')
    setValue('MasterApprovalType', "")
    emptyLevelDropdown()
  }
  /***********ONBOARDING LEVEL STARTS HERE**************/
  /**
   * @method setOnboardingLevel
   * @description Used to handle onboarding level
   */
  const setOnboardingLevel = async () => {
    let tempArray = [];

    if (onboardingLevel.length === 0 || OnboardingApprovalType.length === 0) {
      Toaster.warning('Please select Approval Type and Level')
      return false;
    }

    if (getConfigurationKey().IsAllowMultiSelectApprovalType) {
      let tempMultiApprovalArray = []
      let duplicateErrorArray = []
      let multiSelectObject = {}
      multiSelectObject.ApprovalHeadIdList = [
        {
          ApprovalHeadId: ONBOARDINGID,
          ApprovalHeadName: ONBOARDINGNAME
        }
      ]
      multiSelectObject.ApprovalTypeIdList = OnboardingApprovalType && OnboardingApprovalType.map((approval) => {
        return {
          ApprovalTypeId: approval?.value,
          ApprovalTypeName: approval?.label
        }
      })
      multiSelectObject.LevelId = onboardingLevel?.value
      multiSelectObject.LevelName = onboardingLevel?.label
      multiSelectObject.ApprovalModuleName = "Onboarding"
      try {
        let data = await checkHighestApprovalLevelForHeadsAndApprovalTypes(multiSelectObject)
        if (data.length === 0) {
          return false
        }
        data && data.map(approvalData => {
          let approvalObj = {
            Level: approvalData?.LevelName,
            LevelId: approvalData?.LevelId,
            ApprovalType: approvalData?.ApprovalType,
            ApprovalTypeId: approvalData?.ApprovalTypeId,
          }
          if (!checkDuplicacy(onboardingLevelGrid, approvalObj, 'OnboardingId', '', approvalData?.ApprovalTypeId, 'Onboarding', approvalData?.LevelId, true)) {
            tempMultiApprovalArray.push(approvalObj)
          } else {
            duplicateErrorArray.push(approvalObj)
          }
        })
        if (duplicateErrorArray.length > 0) {
          const formattedStrings = duplicateErrorArray.map(item => `(${item.ApprovalType} - ${item.Level})`);
          const FinalformattedString = formattedStrings.join(',');
          Toaster.warning(`Same record cannot exist for multiple or same approval types: ${FinalformattedString}`)
        }
        tempArray = [...onboardingLevelGrid, ...tempMultiApprovalArray]
      } catch (error) {
        apiErrors(error)
      }
    } else {

      let obj = {
        Level: onboardingLevel.label,
        LevelId: onboardingLevel.value,
        ApprovalType: OnboardingApprovalType?.label,
        ApprovalTypeId: OnboardingApprovalType?.value,
      }

      if (checkDuplicacy(onboardingLevelGrid, obj, 'OnboardingId', '', OnboardingApprovalType.value, 'Onboarding', onboardingLevel.value)) return false

      tempArray.push(...onboardingLevelGrid, obj)
    }
    if (tempArray.length === 0) return false
    setOnboardingLevelGrid(tempArray)
    setOnboardingLevels([])
    setOnboardingApprovalType([])
    setValue('onboardingLevel', '')
    setValue('OnboardingApprovalType', "")
  };
  /**
   * @method updateOnboardingLevel
   * @description Used to handle update Onboarding and it's level
   */
  const updateOnboardingLevel = () => {
    let tempArray = [];

    if (onboardingLevel.length === 0 || OnboardingApprovalType.length === 0) {
      Toaster.warning('Please select Approval Type and Level')
      return false;
    }

    let tempData = onboardingLevelGrid[onboardingLevelEditIndex];
    tempData = {
      Level: onboardingLevel.label,
      LevelId: onboardingLevel.value,
      ApprovalType: OnboardingApprovalType?.label,
      ApprovalTypeId: OnboardingApprovalType?.value,
    }

    if (checkDuplicacy(onboardingLevelGrid, onboardingLevelEditIndex, 'OnboardingId', '', OnboardingApprovalType.value, 'Onboarding', onboardingLevel.value)) return false

    tempArray = Object.assign([...onboardingLevelGrid], { [onboardingLevelEditIndex]: tempData })
    setOnboardingLevelGrid(tempArray)
    setOnboardingLevels([])
    setOnboardingLevelEditIndex('')
    setIsOnboardingEditIndex(false)
    setOnboardingApprovalType([])
    setValue('onboardingLevel', '')
    setValue('OnboardingApprovalType', '')
    setOnboardingLevelEditIndex(false)
  };


  /**
  * @method resetOnboardingLevel
  * @description Used to reset onboarding data
  */
  const resetOnboardingLevel = () => {

    setOnboardingLevels([])
    setOnboardingLevelEditIndex('')
    setIsOnboardingEditIndex(false)
    setOnboardingApprovalType([])
    setValue('onboardingLevel', '')
    setValue('OnboardingApprovalType', '')
    emptyLevelDropdown()
    setOnboardingLevelEditIndex(false)
  };



  /**
  * @method editOnboardingItem
  * @description used to edit onboarding detail form
  */
  const editOnboardingItem = (rowData, index) => {

    const tempData = rowData[index];
    dispatch(getOnboardingLevelById(true, tempData.ApprovalTypeId, res => { }))

    setOnboardingLevelEditIndex(index)
    setIsOnboardingEditIndex(true)
    setOnboardingApprovalType({ label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
    setOnboardingLevels({ label: tempData.Level, value: tempData.LevelId })
    setValue('onboardingLevel', { label: tempData.Level, value: tempData.LevelId })
    setValue('OnboardingApprovalType', { label: tempData.ApprovalType, value: tempData.ApprovalTypeId })
  }


  /**
  * @method deleteItem
  * @description used to delete onboarding item 
  */
  const deleteOnboardingItem = (rowData, index) => {
    let tempData = rowData.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });
    setOnboardingLevelGrid(tempData)
    setOnboardingLevels([])
    setValue('onboardingLevel', '')
    setValue('OnboardingApprovalType', '')
    emptyLevelDropdown()
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
    setState(prevState => ({ ...prevState, city: [] }));
    // setCity([])
    setModules([])
    setOldModules([])
    setIsShowAdditionalPermission(false)
    setTechnologyLevelGrid([])
    setPrimaryContact(false)
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
        if (res && res.data && res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
        }
        cancel();
      }))
    }
    else {

      dispatch(updateUserAPI(updatedData, (res) => {
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
          cancel();
        }
        setIsLoader(false)
        setShowPopup(false)
      }))
    }


  }


  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  const onSubmit = debounce(handleSubmit((values) => {

    let forcefulUpdate = false
    let onboaringUpdate = false
    if (isEditFlag && !isForcefulUpdate) {
      if (JSON.stringify(Modules) !== JSON.stringify(oldModules) || JSON.stringify(oldHeadLevelGrid) !== JSON.stringify(HeadLevelGrid) || JSON.stringify(oldMasterLevelGrid) !== JSON.stringify(masterLevelGrid) || JSON.stringify(oldTechnologyLevelGrid) !== JSON.stringify(TechnologyLevelGrid)) {
        setIsForcefulUpdate(true)
        forcefulUpdate = true
      }
      else {
        forcefulUpdate = false
        setIsForcefulUpdate(false)
      }
    }
    if (JSON.stringify(oldOnboardingLevelGrid) !== JSON.stringify(onboardingLevelGrid)) {
      onboaringUpdate = true
    } else {
      onboaringUpdate = false
    }
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
        LevelId: item.LevelId,
        ApprovalTypeId: item.ApprovalTypeId,
        ApprovalType: item.ApprovalType,

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
        ApprovalTypeId: item.ApprovalTypeId,
        ApprovalType: item.ApprovalType,

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
        ApprovalTypeId: item.ApprovalTypeId,
        ApprovalType: item.ApprovalType,
      })
      return null
    })
    let tempOnboardingLevelArray = []
    onboardingLevelGrid && onboardingLevelGrid.map((item, index) => {
      tempOnboardingLevelArray.push({
        OnboardingApprovalId: ONBOARDINGID,
        OnboardingApprovalName: ONBOARDINGNAME,
        LevelId: item.LevelId,
        Level: item.Level,
        ApprovalTypeId: item.ApprovalTypeId,
        ApprovalType: item.ApprovalType,
      })
    })

    let multiDeptArr = []

    department && department.map((item) => (
      multiDeptArr.push({ DepartmentId: item.value, DepartmentName: item.label })
    ))

    let isDepartmentUpdate = registerUserData?.Departments?.some(
      (item) => !department?.some((deptValue) => item?.DepartmentId === deptValue?.value)
    ) || department?.some((deptValue) => !registerUserData?.Departments?.some((item) => item?.DepartmentId === deptValue?.value));

    let isPlantUpdate = registerUserData.DepartmentsPlantsIdLists?.some(
      (userDataItem) => !selectedPlants?.some((selectedPlant) => userDataItem.PlantId === selectedPlant.value)
    ) || selectedPlants?.some(
      (selectedPlant) => !registerUserData.DepartmentsPlantsIdLists?.some((userDataItem) => userDataItem.PlantId === selectedPlant.value)
    );

    let isDivisionUpdate = registerUserData.DepartmentsDivisionIdLists?.some(
      (userDataItem) => !selectedDivision?.some((selectedDivision) => userDataItem.DivisionId === selectedDivision.value)
    ) || selectedDivision?.some(
      (selectedDivision) => !registerUserData.DepartmentsDivisionIdLists?.some((userDataItem) => userDataItem.DivisionId === selectedDivision.value)
    );

    let isForcefulUpdatedForMaster = false;
    let isForcefulUpdatedForCosting = false;
    let isForcefulUpdatedForSimulation = false;
    let isForcefulUpdatedForOnboarding = false;

    if (JSON.stringify(masterLevelGrid) !== JSON.stringify(oldMasterLevelGrid)) {
      isForcefulUpdatedForMaster = true;
    } if (JSON.stringify(HeadLevelGrid) !== JSON.stringify(oldHeadLevelGrid)) {
      isForcefulUpdatedForSimulation = true;
    } if (JSON.stringify(TechnologyLevelGrid) !== JSON.stringify(oldTechnologyLevelGrid)) {
      isForcefulUpdatedForCosting = true;
    } if (JSON.stringify(onboardingLevelGrid) !== JSON.stringify(oldOnboardingLevelGrid)) {
      isForcefulUpdatedForOnboarding = true;
    }
    if (isDepartmentUpdate || isPlantUpdate || isDivisionUpdate) {
      isForcefulUpdatedForMaster = true;
      isForcefulUpdatedForSimulation = true;
      isForcefulUpdatedForCosting = true;
      isForcefulUpdatedForOnboarding = true;
    }
    setIsDepartmentUpdated(isDepartmentUpdate || isPlantUpdate || isDivisionUpdate);
    setCostingTableChanged(isForcefulUpdatedForCosting);
    setMasterTableChanged(isForcefulUpdatedForMaster);
    setSimulationTableChanged(isForcefulUpdatedForSimulation);
    setOnboardingTableChanged(isForcefulUpdatedForOnboarding);
    let plantArray = []
    selectedPlants && selectedPlants.map(item => {
      
      
      let obj = {
        PlantId: item.PlantId,
        PlantName: item.PlantName,
        PlantCode : item.PlantCode,
      }
      plantArray.push(obj)
    })
    let divisionArray = []
    selectedDivision && selectedDivision.map(item => {
      if (String(item?.DivisionId) === '0') return false
      let obj = {
        DivisionId: item?.value,
        DivisionName: item?.label,
        DivisionCode: item?.DivisionCode,
      }
      divisionArray.push(obj)
    })
    if (isEditFlag) {
      let updatedData = {
        IsForcefulUpdated: isForcefulUpdate ? isForcefulUpdate : forcefulUpdate,
        UserId: UserId,
        FullName: `${values.FirstName ? values.FirstName.trim() : ''} ${values.LastName ? values.LastName.trim() : ''}`,
        LevelId: registerUserData?.LevelId,
        LevelName: registerUserData?.LevelName,
        // DepartmentName: department.label,
        DepartmentName: '',
        TechnologyId: '',
        TechnologyName: '',
        PlantName: '',
        IsActive: true,
        //AdditionalPermission: registerUserData.AdditionalPermission,
        CityName: state?.city?.label,
        UserProfileId: registerUserData?.UserProfileId,
        UserName: values.UserName ? values.UserName.trim() : '',
        Password: isShowPwdField ? encryptedpassword.toString() : '',
        RoleId: role.value,
        PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
        // DepartmentId: department.value,
        DepartmentId: '',
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
        CityId: state.city.value,
        IsRemoveCosting: false,
        CostingCount: registerUserData.CostingCount,
        IsAdditionalAccess: IsShowAdditionalPermission,
        DepartmentsPlantsIdLists: plantArray,
        OnboardingApprovalLevels: [],
        DepartmentsDivisionIdLists: divisionArray
      }

      if (isRfqUser) {
        updatedData.VendorId = vendor.value
        updatedData.ReporterId = reporter.value
        updatedData.IsPrimaryContact = primaryContact
      } else {
        updatedData.Modules = Modules
        updatedData.TechnologyLevels = tempTechnologyLevelArray
        updatedData.AdditionalPermission = IsShowAdditionalPermission ? 'YES' : 'NO'
        updatedData.SimulationTechnologyLevels = tempHeadLevelArray
        updatedData.MasterLevels = tempMasterLevelArray
        updatedData.OnboardingApprovalLevels = tempOnboardingLevelArray
        updatedData.Departments = multiDeptArr
        updatedData.IsMultipleDepartmentAllowed = getConfigurationKey().IsMultipleDepartmentAllowed ? true : false
        updatedData.IsForcefulUpdatedForCosting = isForcefulUpdatedForCosting
        updatedData.IsForcefulUpdatedForMaster = isForcefulUpdatedForMaster
        updatedData.IsForcefulUpdatedForSimulation = isForcefulUpdatedForSimulation
        updatedData.IsUpdateOnboarding = onboaringUpdate
        updatedData.IsForcefulUpdatedForOnboarding = isForcefulUpdatedForOnboarding
      }
      if (isDepartmentUpdate || isForcefulUpdatedForCosting || isForcefulUpdatedForMaster || isForcefulUpdatedForSimulation || isPlantUpdate || isForcefulUpdatedForOnboarding) {
        setShowPopup(true)
        setUpdatedObj(updatedData)

      } else {
        if (props?.RFQUser || isRfqUser) {
          setIsLoader(true)
          dispatch(updateRfqUser(updatedData, (res) => {
            setIsLoader(false)
            if (res.data.Result) {
              Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
            }
            cancel();
          }))
        }
        else {
          let temp = ['FirstName', 'FullName', 'Mobile', 'PhoneNumber', 'AddressLine1', 'AddressLine2', 'CityName', 'ZipCode', "Password"]
          let isDataChanged = false

          temp.map((item) => {
            if (updatedData[item] !== registerUserData[item]) {
              isDataChanged = true
            }
            return false
          })

          if (isDataChanged) {
            setIsLoader(true)
            setIsUpdateResponded(true)
            dispatch(updateUserAPI(updatedData, (res) => {
              setIsUpdateResponded(false)
              setIsLoader(false)
              if (res?.data?.Result) {
                Toaster.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
                cancel();
              }
              setIsLoader(false)
              setShowPopup(false)
            }))
          }
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
        CityId: state?.city?.value,
        DepartmentsPlantsIdLists: plantArray,
        OnboardingApprovalLevels: [],
        DepartmentsDivisionIdLists: divisionArray
      }

      if (props?.RFQUser) {
        userData.VendorId = vendor.value
        userData.ReporterId = reporter.value
        userData.IsPrimaryContact = primaryContact
      } else {
        userData.Modules = Modules
        userData.TechnologyLevels = tempTechnologyLevelArray
        userData.AdditionalPermission = IsShowAdditionalPermission ? 'YES' : 'NO'
        userData.SimulationTechnologyLevels = tempHeadLevelArray
        userData.MasterLevels = tempMasterLevelArray
        userData.OnboardingApprovalLevels = tempOnboardingLevelArray
        userData.Departments = multiDeptArr
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
  }), 500)

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

  // const vendorFilterList = async (inputValue) => {
  //   if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
  //     inputValue = inputValue.trim();
  //   }
  //   const resultInput = inputValue.slice(0, searchCount)
  //   if (inputValue?.length >= searchCount && vendor !== resultInput) {
  //     let res
  //     res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
  //     setVendor(resultInput)
  //     let vendorDataAPI = res?.data?.SelectList
  //     if (inputValue) {
  //       return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
  //     } else {
  //       return vendorDataAPI
  //     }
  //   }
  //   else {
  //     if (inputValue?.length < searchCount) return false
  //     else {
  //       let VendorData = reactLocalStorage?.getObject('Data')
  //       if (inputValue) {
  //         return autoCompleteDropdown(inputValue, VendorData, false, [], false)
  //       } else {
  //         return VendorData
  //       }
  //     }
  //   }
  // };
  const onGridReady = (params, setGridApi, setGridColumnApi) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    setGridColumnApi(params.columnApi);
    params.api.paginationGoToPage(0);
  };
  const onActionTechnology = (props) => {
    const RowData = props?.agGridReact?.gridOptions.rowData
    return (
      <div className="text-right">
        <button
          title="Edit"
          className="Edit mr-2"
          type="button"
          onClick={() => editItemDetails(RowData, props?.rowIndex)}
        />
        <button
          title="Delete"
          className="Delete"
          type="button"
          onClick={() => deleteItem(RowData, props.rowIndex)}
        />
      </div>
    )
  }
  const onActionSimulation = (props) => {
    const RowData = props?.agGridReact?.gridOptions.rowData
    return (
      <div className="text-right">
        <button
          title="Edit"
          className="Edit mr-2"
          type="button"
          onClick={() => editSimulationItemDetails(RowData, props?.rowIndex)}
        />
        <button
          title="Delete"
          className="Delete"
          type="button"
          onClick={() => deleteSimulationItem(RowData, props.rowIndex)}
        />
      </div>
    )
  }
  const onActionMaster = (props) => {
    const RowData = props?.agGridReact?.gridOptions.rowData
    return (
      <div className="text-right">
        <button
          title="Edit"
          className="Edit mr-2"
          type="button"
          onClick={() => editMasterItem(RowData, props?.rowIndex)}
        />
        <button
          title="Delete"
          className="Delete"
          type="button"
          onClick={() => deleteMasterItem(RowData, props.rowIndex)}
        />
      </div>
    )
  }

  const onActionOnboarding = (props) => {
    const RowData = props?.agGridReact?.gridOptions.rowData
    return (
      <div className="text-right">
        <button
          title="Edit"
          className="Edit mr-2"
          type="button"
          onClick={() => editOnboardingItem(RowData, props?.rowIndex)}
        />
        <button
          title="Delete"
          className="Delete"
          type="button"
          onClick={() => deleteOnboardingItem(RowData, props.rowIndex)}
        />
      </div>
    )
  }
  const onPageSizeChanged = (gridApi, newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };
  const frameworkComponents = {
    customNoRowsOverlay: NoContentFound,
  };
  const resetState = (gridOption) => {
    const options = gridOptions[gridOption];
    options.columnApi?.resetColumnState(null);
    options.api?.setFilterModel(null);
  }

  const checkHighestApprovalLevelForHeadsAndApprovalTypes = (data) => {
    return new Promise((resolve, reject) => {
      dispatch(checkHighestApprovalLevelForHeadsAndApprovalType(data, res => {
        const message = res?.data?.Message;
        const approvalData = res?.data?.Data;
        if (message !== '' && message !== null && message !== undefined) {
          Toaster.warning(message);
        }
        if (approvalData?.length > 0) {
          resolve(approvalData);
        } else {
          return []
        }
      }));
    });
  }

  const message = () => {
    let messages = [];
    const isAnyTableChanged = costingTableChanged || simulationTableChanged || masterTableChanged;
    const isOnlyOnboardingChanged = onboardingTableChanged && !isAnyTableChanged;

    if (isDepartmentUpdated) {
      messages.push(`costing, simulation${getConfigurationKey().IsMasterApprovalAppliedConfigure ? ', master' : ''}`);
    } else {
      const messages = [];

      if (costingTableChanged) messages.push(`costing`);
      if (simulationTableChanged) messages.push(`simulation`);
      if (masterTableChanged) messages.push(`master`);
      if (isOnlyOnboardingChanged) messages.push(`onboarding & management`);
      if (costingTableChanged && simulationTableChanged && masterTableChanged) {
        // This condition is redundant as the individual pushes above will already cover these cases.
        // Consider removing this block or adjusting logic if unique behavior is intended.
      }
    }
    const messageOne = messages.join(' and ');


    const baseMessage = `All ${messageOne}'s approval will become `;
    const messageTwo = `${baseMessage}${onboardingTableChanged ? 'rejected by system' : 'draft'} which are pending & awaited in approval status. Do you want to continue?`;

    const messageThree = `${baseMessage}draft and onboarding and management's approval will become rejected by system, which are pending & awaited in approval status. 
      Do you want to continue?`;

    let finalMessage = '';

    // Simplify the conditions by grouping similar outcomes
    if (isOnlyOnboardingChanged || isAnyTableChanged || isDepartmentUpdated) {
      finalMessage = (onboardingTableChanged && (isAnyTableChanged || isDepartmentUpdated)) ? messageThree : messageTwo;
    }

    return finalMessage;

  };
  const handlePlant = (newValue) => {
    
    if (newValue && (newValue[0]?.value === '0' || newValue?.some(item => item?.value === '0'))) {
      // Select All option is chosen
      const allPlantsExceptZero = plantSelectListForDepartment
        .filter(item => item.PlantId !== '0')
        .map(item => ({ ...item ,label: item?.PlantNameCode, value: item?.PlantId }));
        
      setSelectedPlants(allPlantsExceptZero);
      setTimeout(() => {
        setValue('plant', allPlantsExceptZero);
      }, 50);
    }  else if (newValue && newValue?.length > 0) {
      // Map newValue to include all properties from plantSelectListForDepartment
      const updatedValue = newValue.map(selected => {
          const originalItem = plantSelectListForDepartment.find(item => item.PlantId === selected.value);
          return {
              ...originalItem,
              label: selected.label,
              value: selected.value
          };
      });
      
      setSelectedPlants(updatedValue);
      setValue('plant', updatedValue);
    } else {
      // No option is chosen
      setSelectedPlants([]);
      setValue('plant', '');  // Assuming you want to clear the form value when nothing is selected
    }
  }
  const cityFilterList = (inputValue) => {
    return DropDownFilterList(inputValue, '', 'city', (filterType, resultInput) => getCityByCountry(0, 0, resultInput), setState, state);
  };
  const vendorFilterList = (inputValue) => {
    return DropDownFilterList(inputValue, '', 'vendor', (filterType, resultInput) => getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput), setState, state);
  }
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
                    <h2>{isEditFlag ? 'Update' : 'Add'} {props?.RFQUser ? 'RFQ ' : ''}User <TourWrapper
                      buttonSpecificProp={{ id: "Add_User_Registration_Form" }}
                      stepsSpecificProp={{
                        steps: Steps(t, {
                          costingField: acc1, simulationField: acc2, masterField: acc3, onBoardingField: acc4, RFQUser: props?.RFQUser, isShowPwdField: isShowPwdField, isEditFlag: isEditFlag
                        }).USER_MANAGEMENT
                      }} /></h2>
                  </div>
                </div>
                {isEditFlag && !isShowPwdField && <div className="col-md-6">
                  <Button id={"Change_Password"} className={'user-btn'} onClick={() => setIsShowPwdField(!isShowPwdField)} >Change Password</Button>
                </div>}
              </div>
              <form noValidate className="manageuser form" onKeyDown={(e) => { handleKeyDown(e, onSubmit); }}>
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
                            hashValidation,
                            minLength3,
                            maxLength25,
                            checkWhiteSpaces,
                            checkSpacesInString
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
                          validate: { hashValidation, minLength3, maxLength25, checkWhiteSpaces, checkSpacesInString }
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
                          validate: { number, postiveNumber, minLength10, maxLength12 }
                        }}
                        handleChange={() => { }}
                        placeholder={'Enter'}
                        customClassName={'withBorder'}
                      />
                    </div>
                    {props?.RFQUser && IsSendMailToPrimaryContact() &&
                      <Col md="3" id="primaryContact_container" >
                        <div className="d-flex align-items-center mt-4 pt-2">
                          <label
                            className={`custom-checkbox ml-2 mt-1`}
                          // onChange={onPrimaryContactCheck}
                          >
                            Primary Contact
                            <input
                              type="checkbox"
                              checked={primaryContact}
                              onChange={onPrimaryContactCheck}
                            />
                            <span
                              className=" before-box"
                            />

                          </label>
                          <TooltipCustom id="Primary_Contact"
                            customClass="mt-n1 pb-4"
                            tooltipText={`Please click on the checkbox if this user is the main point of contact for the ${vendorLabel}.`} />
                        </div>
                      </Col>
                    }
                    {!props?.RFQUser && <div className="col-md-3">
                      <div className="row form-group">
                        <div className="Phone phoneNumber col-md-8">
                          <TextFieldHookForm
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
                              validate: { number, postiveNumber, minLength10, maxLength12 }
                            }}
                            handleChange={() => { }}
                            placeholder={'Enter'}
                            customClassName={'withBorder'}
                          />
                        </div>
                        <div className="ext phoneNumber col-md-4 pl-0">
                          <TextFieldHookForm
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
                              validate: { number, postiveNumber, maxLength5 }
                            }}
                            handleChange={() => { }}
                            placeholder={'Ext'}
                            customClassName={'withBorder w100'}
                          />
                        </div>
                      </div>
                    </div>}
                    {props?.RFQUser &&
                      <>
                        {true && <Col md="12" className="mt-4">
                          <HeaderTitle
                            title={'Additional Details:'}
                            customClass={'Personal-Details'} />
                        </Col>}
                        <Col md="3">
                          <div className="Phone phoneNumber">
                            <AsyncSearchableSelectHookForm
                              name="Vendor"
                              type="text"
                              label={`${vendorLabel} (Code)`}
                              errors={errors.Vendor}
                              Controller={Controller}
                              control={control}
                              register={register}
                              mandatory={true}
                              rules={{
                                required: true,
                              }}
                              disabled={isEditFlag ? true : false}
                              placeholder={`Select ${vendorLabel}`}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={(role == null || role.length === 0) ? [required] : []}
                              required={true}
                              handleChange={vendorHandler}
                              asyncOptions={vendorFilterList}
                              NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                            />
                          </div>
                        </Col>
                        {IsSendQuotationToPointOfContact() &&
                          <Col md="3">
                            <div className="phoneNumber pl-0">
                              <SearchableSelectHookForm
                                name="Reporter"
                                type="text"
                                label={`Vendor's Point of Contact`}

                                errors={errors.Reporter}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                  required: true,
                                }}
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
                        }
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
                          label="User Name"
                          errors={errors.UserName}
                          Controller={Controller}
                          control={control}
                          register={register}
                          disableErrorOverflow={true}
                          mandatory={true}
                          rules={{
                            required: true,
                            validate: { hashValidation, required, minLength3, maxLength50, checkWhiteSpaces, checkSpacesInString }
                          }}
                          handleChange={() => { }}
                          placeholder={'Enter'}
                          disabled={isEditFlag ? true : false}
                          customClassName={'withBorder'}
                        />
                      </div>}
                    {isShowPwdField &&
                      <>
                        <div className="input-group password password-wrapper col-md-3">
                          <PasswordFieldHookForm
                            name="Password"
                            label="Password"
                            id="AddUser_Password"
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
                              validate: { required, minLength6, maxLength18, checkWhiteSpaces, strongPassword, checkSpacesInString, checkSingleSpaceInString }
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
                            id="AddUser_PasswordConfirm"
                            placeholder={'Enter'}
                            errors={errors.passwordConfirm}
                            Controller={Controller}
                            control={control}
                            register={register}
                            onPaste={(e) => e.preventDefault()}
                            mandatory={true}
                            disableErrorOverflow={true}
                            rules={{
                              required: true,
                              validate: { required, minLength6, maxLength18, checkWhiteSpaces, checkPasswordConfirm, checkSingleSpaceInString }
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
                          validate: { acceptAllExceptSingleSpecialCharacter, maxLength80, checkSpacesInString, checkWhiteSpaces }
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
                          validate: { acceptAllExceptSingleSpecialCharacter, maxLength80, checkSpacesInString, checkWhiteSpaces }
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
                    {/* <div className="col-md-3">
                      <SearchableSelectHookForm
                        name="CityId"
                        label="City"
                        errors={errors.CityId}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        loadOptions={cityFilterList}

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
                    </div> */}
                    <div className="col-md-3">
                      {/* <label>{`City`}<span className="asterisk-required">*</span></label>
                      <div className="d-flex justify-space-between align-items-center p-relative async-select">
                        <div className="fullinput-icon p-relative">
                          {}
                          {state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                          <Controller
                            name="CityId"
                            control={control}
                            rules={{ required: "City is required" }}
                            render={({ field }) => (
                              <AsyncSelect
                                {...field}
                                loadOptions={cityFilterList}
                                onChange={(e) => {
                                  field.onChange(e);
                                  cityHandler(e);
                                }}
                                value={state.city}
                                noOptionsMessage={({ inputValue }) => inputValue?.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                                onBlur={() => setState(prevState => ({ ...prevState, showErrorOnFocus: false }))}
                                placeholder={"Select.."}
                                className="mb-0 withBorder"
                                disabled={state.inputLoader}
                              
                              />
                            )}
                            disabled={state.inputLoader}
                          />
                          {errors.CityId && <div className="text-help">{errors.CityId.message}</div>}
                        </div>
                      </div> */}

                      <AsyncSearchableSelectHookForm
                        name="CityId"
                        type="text"
                        label={"City"}
                        errors={errors.CityId}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                        }}
                        disabled={isEditFlag ? true : false}
                        placeholder={'Select City'}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        // validate={(role == null || role.length === 0) ? [required] : []}
                        // required={true}
                        handleChange={cityHandler}
                        asyncOptions={cityFilterList}
                        NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
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
                          validate: { postiveNumber, number, maxLength6 }
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
                        title={`Role & ${handleDepartmentHeader()}:`}
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
                                label={`${handleDepartmentHeader()}`}

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
                                placeholder={`${handleDepartmentHeader()}`}
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
                                label={`${handleDepartmentHeader()}`}
                                errors={errors.DepartmentId}
                                isMulti={initialConfiguration.IsMultipleDepartmentAllowed}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                rules={{
                                  required: true,
                                }}

                                placeholder={`${handleDepartmentHeader()}`}
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
                        {getConfigurationKey().IsDivisionAllowedForDepartment && isShowDivision &&
                          <div className="col-md-3">
                            <SearchableSelectHookForm
                              name="Division"
                              label={`Division(Code) - (${handleDepartmentHeader()}(code) list)`}
                              errors={errors.Division}
                              Controller={Controller}
                              control={control}
                              register={register}
                              mandatory={true}
                              rules={{
                                required: true,
                              }}
                              handleChange={handleDivisionChange}
                              isMulti={true}
                              placeholder={`select`}
                              selection={selectedDivision == null || selectedDivision.length === 0 ? [] : selectedDivision}
                              options={searchableSelectType('division')}
                              className="multiselect-with-border"
                              mendatory={true}
                              defaultValue={selectedDivision}
                            />
                          </div>
                        }
                        {getConfigurationKey().IsPlantsAllowedForDepartment && <div className="col-md-3">
                          <SearchableSelectHookForm
                            label={`Plant(Code) - (${handleDepartmentHeader()}(code) list)`}
                            name="plant"
                            placeholder={"Select"}
                            type="text"
                            isLoading={{ isLoader: inputLoader.plant }}
                            Controller={Controller}
                            control={control}
                            register={register}
                            options={searchableSelectType("plant")}
                            handleChange={handlePlant}
                            rules={{
                              required: true,
                            }}
                            mandatory={true}
                            defaultValue={selectedPlants}
                            errors={errors.plant}
                            className="multiselect-with-border"
                            isMulti={true}
                            selected={selectedPlants == null || selectedPlants.length === 0 ? [] : selectedPlants}
                          // value={selectedPlants}
                          />
                        </div>}
                      </div>


                      {/* ///////////////////////////////////////////////
                              ////////////////////////////////////////////////////
                              /////////////// USER WISE PERMISSION START ////////
                              //////////////////////////////////////////////////
                              ///////////////////////////////////////////////// */}


                      <div className=" row mb-4">
                        <div className={'col-md-4'}>
                          <label id="AddUser_Checkbox"
                            className="custom-checkbox"
                            onChange={(e) => { onPressUserPermission(IsShowAdditionalPermission) }}
                          >
                            Grant User Wise Permission
                            <input type="checkbox" disabled={false} checked={IsShowAdditionalPermission} />
                            <span
                              className=" before-box"
                              checked={IsShowAdditionalPermission}
                              onChange={(e) => { onPressUserPermission(IsShowAdditionalPermission) }}
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
                      {/************** USER WISE PERMISSION END **************/}


                      {/*************** User's technology level START ***************/}
                      <Row>
                        <Col md="8">
                          <HeaderTitle title={'Costing Approval Level:'} customClass={''} />
                        </Col>
                        <Col md="4" className="text-right">
                          <button id="AddUser_Permissions_Costing" className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc1(!acc1) }}>

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
                                label={technologyLabel}
                                errors={errors.TechnologyId}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                options={searchableSelectType('technology')}
                                handleChange={technologyHandler}
                                defaultValue={technology}
                                isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isEditIndex) ? true : false}
                              // isClearable={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isEditIndex) ? true : false}
                              />
                            </div>
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="CostingApprovalType"
                                type="text"
                                label="Approval Type"
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                options={searchableSelectType('approvalTypeCosting')}
                                // options={searchableSelectType('approvalType')}                 //RE
                                handleChange={costingApprovalTypeHandler}
                                defaultValue={costingApprovalType}
                                errors={errors.ApprovalType}
                                isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isEditIndex) ? true : false}
                              // isClearable={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isEditIndex) ? true : false}
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
                                  id="AddUser_AddCosting"
                                  className={'user-btn add-button-big ml-2'}
                                  onClick={setTechnologyLevel}
                                ><div className={'plus'}></div>ADD</button>}
                            </div>
                          </div>


                          <div className="row form-group mb-0">
                            <Col md="12" className="mb-2">
                              <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState('gridOptionsTechnology')}>
                                <div className="refresh mr-0"></div>
                              </button>
                            </Col>
                            <div className="col-md-12">
                              <div className="ag-grid-react">
                                <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${TechnologyLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                  <div className="ag-theme-material">
                                    <AgGridReact
                                      defaultColDef={defaultColDef}
                                      floatingFilter={true}
                                      pagination={true}
                                      paginationPageSize={10}
                                      onGridReady={params => onGridReady(params, setgridApiTechnology, setgridColumnApiTechnology)}
                                      domLayout='autoHeight'
                                      noRowsOverlayComponent={'customNoRowsOverlay'}
                                      gridOptions={gridOptionsTechnology}
                                      noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                      }}
                                      rowData={TechnologyLevelGrid}
                                      frameworkComponents={{
                                        ...frameworkComponents,
                                        onAction: onActionTechnology,
                                      }}
                                      // onFilterModified={onFloatingFilterChanged}
                                      enableBrowserTooltips={true}
                                    >
                                      <AgGridColumn field="Technology" headerName={technologyLabel} />
                                      <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                      <AgGridColumn field="Level" headerName="Level" />
                                      <AgGridColumn field="Technology" headerName='Actions' type="rightAligned" cellRenderer={'onAction'} ></AgGridColumn>
                                    </AgGridReact>
                                    <PaginationWrapper
                                      gridApi={gridApiTechnology}
                                      setPage={newPageSize => onPageSizeChanged(gridApiTechnology, newPageSize)}
                                    />
                                  </div>
                                </div>
                              </div>

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
                          <button id="AddUser_Permissions_Simulation" className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc2(!acc2) }}>

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
                                options={searchableSelectType('heads')}
                                handleChange={headHandler}
                                valueDescription={simulationHeads}
                                isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isSimulationEditIndex) ? true : false}
                                isClearable={true}
                              />
                            </div>
                            <div className="col-md-3">
                              <SearchableSelectHookForm
                                name="SimulationApprovalType"
                                type="text"
                                label="Approval Type"
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                options={searchableSelectType('approvalTypeSimulation')}
                                // options={searchableSelectType('approvalType')}                 //RE
                                handleChange={simulationApprovalTypeHandler}
                                defaultValue={simulationApprovalType}
                                errors={errors.ApprovalType}
                                isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isSimulationEditIndex) ? true : false}
                                isClearable={true}
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
                                  id="AddUser_AddSimulation"
                                  className={'user-btn add-button-big ml-2'}
                                  onClick={setSimualtionHeadLevel}
                                ><div className={'plus'}></div>ADD</button>}
                            </div>
                          </div>
                          <Row>
                            <Col md="12" className="mb-2">
                              <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState('gridOptionsSimulation')}>
                                <div className="refresh mr-0"></div>
                              </button>
                            </Col>
                            <Col md="12">

                              <div className="ag-grid-react">
                                <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${HeadLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                  <div className="ag-theme-material">
                                    <AgGridReact
                                      defaultColDef={defaultColDef}
                                      floatingFilter={true}
                                      pagination={true}
                                      paginationPageSize={10}
                                      domLayout='autoHeight'
                                      onGridReady={params => onGridReady(params, setgridApiSimulation, setgridColumnApiSimulation)}
                                      gridOptions={gridOptionsSimulation}
                                      noRowsOverlayComponent="customNoRowsOverlay"
                                      noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                      }}
                                      rowData={HeadLevelGrid}
                                      frameworkComponents={{
                                        ...frameworkComponents,
                                        onAction: onActionSimulation,
                                      }}
                                    >
                                      <AgGridColumn field="Technology" headerName="Head" />
                                      <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                      <AgGridColumn field="Level" headerName="Level" />
                                      <AgGridColumn field="Technology" headerName='Actions' type="rightAligned" cellRenderer={'onAction'} ></AgGridColumn>
                                    </AgGridReact>
                                    <PaginationWrapper
                                      gridApi={gridApiSimulation}
                                      setPage={newPageSize => onPageSizeChanged(gridApiSimulation, newPageSize)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
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
                              <button id="AddUser_Permissions_Master" className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc3(!acc3) }}>

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
                                    options={searchableSelectType('masters')}
                                    valueDescription={master}
                                    isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isMasterEditIndex) ? true : false}

                                  />
                                </div>
                                <div className="col-md-3">
                                  <SearchableSelectHookForm
                                    name="MasterApprovalType"
                                    type="text"
                                    label="Approval Type"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    options={searchableSelectType('approvalTypeMaster')}
                                    // options={searchableSelectType('approvalType')}                 //RE
                                    handleChange={masterApprovalTypeHandler}
                                    defaultValue={masterApprovalType}
                                    errors={errors.ApprovalType}
                                    isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isMasterEditIndex) ? true : false}

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
                                      id="AddUser_AddMaster"
                                      className={'user-btn add-button-big ml-2'}
                                      onClick={setMasterLevel}
                                    ><div className={'plus'}></div>ADD</button>}
                                </div>
                              </div>
                              <Row>
                                <Col md="12" className="mb-2">
                                  <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState('gridOptionsMaster')}>
                                    <div className="refresh mr-0"></div>
                                  </button>
                                </Col>
                                <Col md="12">
                                  <div className="ag-grid-react">
                                    <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${masterLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                      <div className="ag-theme-material">
                                        <AgGridReact
                                          defaultColDef={defaultColDef}
                                          floatingFilter={true}
                                          pagination={true}
                                          paginationPageSize={10}
                                          domLayout='autoHeight'
                                          onGridReady={params => onGridReady(params, setgridApiMaster, setgridColumnApiMaster)}
                                          gridOptions={gridOptionsMaster}
                                          noRowsOverlayComponent="customNoRowsOverlay"
                                          noRowsOverlayComponentParams={{
                                            title: EMPTY_DATA,
                                            imagClass: 'imagClass'
                                          }}
                                          rowData={masterLevelGrid}
                                          frameworkComponents={{
                                            ...frameworkComponents,
                                            onAction: onActionMaster,
                                          }}
                                        >
                                          <AgGridColumn field="Master" headerName="Master" />
                                          <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                          <AgGridColumn field="Level" headerName="Level" />
                                          <AgGridColumn field="Technology" headerName='Actions' type="rightAligned" cellRenderer={'onAction'} ></AgGridColumn>
                                        </AgGridReact>
                                        <PaginationWrapper
                                          gridApi={gridApiMaster}
                                          setPage={newPageSize => onPageSizeChanged(gridApiMaster, newPageSize)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </>
                          }
                        </>

                      }
                      {/* ////////////////////////////////////////////////////
                      ////////////////////////////////////////////////////
                      /////////////// User's MASTER level END ////////
                      ////////////////////////////////////////////////////
                      ///////////////////////////////////////////////// */}
                      {getConfigurationKey().IsShowOnboarding &&
                        <>
                          <Row>
                            <Col md="8">
                              <HeaderTitle title={'Onboarding & Management Approval Level:'} customClass={''} />
                            </Col>
                            <Col md="4" className="text-right">
                              <button id="AddUser_Permissions_onBoarding" className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc4(!acc4) }}>

                                {acc4 ? (
                                  <i className="fa fa-minus" ></i>
                                ) : (
                                  <i className="fa fa-plus"></i>
                                )}
                              </button>
                            </Col>
                          </Row>
                          {acc4 &&
                            <>
                              <div className="row form-group">
                                <div className="col-md-3">
                                  <SearchableSelectHookForm
                                    name="OnboardingApprovalType"
                                    type="text"
                                    label="Approval Type"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    options={searchableSelectType('approvalTypeOnboarding')}
                                    handleChange={onboardingApprovalTypeHandler}
                                    defaultValue={OnboardingApprovalType}
                                    errors={errors.OnboardingApprovalType}
                                    isMulti={(getConfigurationKey().IsAllowMultiSelectApprovalType && !isOnboardingEditIndex) ? true : false}

                                  />
                                </div>
                                <div className="col-md-3">
                                  <SearchableSelectHookForm
                                    name="onboardingLevel"
                                    type="text"
                                    label="Level"
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    handleChange={onboardingLevelHandler}
                                    options={searchableSelectType('onboardingLevel')}
                                    valueDescription={onboardingLevel}
                                    errors={errors.onboardingLevel}
                                  />
                                </div>
                                <div className="col-md-3 btn-mr-rate d-flex">
                                  {isOnboardingEditIndex ?
                                    <>
                                      <button
                                        id="updateUser_onBoarding"
                                        type="button"
                                        className={'btn btn-primary add-button-big'}
                                        onClick={updateOnboardingLevel}
                                      >Update</button>

                                      <button
                                        type="button"
                                        className={'reset-btn ml-2'}
                                        onClick={resetOnboardingLevel}
                                      >Cancel</button>
                                    </>
                                    :
                                    <button
                                      id="addUser_OnBoarding"
                                      type="button"
                                      className={'user-btn add-button-big ml-2'}
                                      onClick={setOnboardingLevel}
                                    ><div className={'plus'}></div>ADD</button>}
                                </div>
                              </div>
                              <Row>
                                <Col md="12" className="mb-2">
                                  <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState('gridOptionsOnboarding')}>
                                    <div className="refresh mr-0"></div>
                                  </button>
                                </Col>
                                <Col md="12">
                                  <div className="ag-grid-react">
                                    <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${onboardingLevelGrid?.length <= 0 ? 'overlay-contain' : ''}`}>
                                      <div className="ag-theme-material">
                                        <AgGridReact
                                          defaultColDef={defaultColDef}
                                          floatingFilter={true}
                                          pagination={true}
                                          paginationPageSize={10}
                                          domLayout='autoHeight'
                                          onGridReady={params => onGridReady(params, setgridApiOnboarding, setgridColumnApiOnboarding)}
                                          gridOptions={gridOptionsOnboarding}
                                          noRowsOverlayComponent="customNoRowsOverlay"
                                          noRowsOverlayComponentParams={{
                                            title: EMPTY_DATA,
                                            imagClass: 'imagClass'
                                          }}
                                          rowData={onboardingLevelGrid}
                                          frameworkComponents={{
                                            ...frameworkComponents,
                                            onAction: onActionOnboarding,
                                          }}
                                        >
                                          <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                          <AgGridColumn field="Level" headerName="Level" />
                                          <AgGridColumn field="Action" headerName='Actions' type="rightAligned" cellRenderer={'onAction'} ></AgGridColumn>
                                        </AgGridReact>
                                        <PaginationWrapper
                                          gridApi={gridApiOnboarding}
                                          setPage={newPageSize => onPageSizeChanged(gridApiOnboarding, newPageSize)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </>
                          }
                        </>
                      }
                    </>

                  }



                </div>
                <div className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    <button
                      onClick={cancel}
                      id="AddUser_Cancel"
                      type="submit"
                      value="CANCEL"
                      disabled={isUpdateResponded}
                      className="mr15 cancel-btn">
                      <div className={"cancel-icon"}></div>
                      CANCEL
                    </button>

                    <button
                      type="button"
                      id="AddUser_Save"
                      onClick={onSubmit}
                      disabled={isSubmitted || isUpdateResponded || isPermissionLoading}
                      className="user-btn save-btn">
                      <div className={"save-icon"}></div>
                      {isEditFlag ? 'UPDATE' : 'SAVE'}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div >
        </div >
      </div >
      {showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${message()}`} />}
    </div >
  );
}

export default UserRegistration


