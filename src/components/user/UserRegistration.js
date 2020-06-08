import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import {
   minLength3, minLength5, minLength6, maxLength25, maxLength11, maxLength12, required, email,
   minLength7, maxLength70, alphabetsOnlyForName, number
} from "../../helper/validation";
import {
   renderPasswordInputField, focusOnError, renderEmailInputField, renderText,
   searchableSelect
} from "../layout/FormInputs";
import {
   registerUserAPI, getAllRoleAPI, getAllDepartmentAPI, getUserDataAPI, getAllUserDataAPI,
   updateUserAPI, setEmptyUserDataAPI, getActionHeadsSelectList, getModuleSelectList,
   getModuleActionInit, getRoleDataAPI, getAllTechnologyAPI, getAllLevelAPI,
   getPermissionByUser, getUsersTechnologyLevelAPI, setUserAdditionalPermission,
   setUserTechnologyLevelForCosting, updateUserTechnologyLevelForCosting,
} from "../../actions/auth/AuthActions";
import { fetchSupplierCityDataAPI } from "../../actions/master/Comman";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { loggedInUserId } from "../../helper/auth";
import UsersListing from "./UsersListing";
import { Table, Button } from 'reactstrap';
import "./UserRegistration.scss";
import { CONSTANT } from "../../helper/AllConastant";
import NoContentFound from "../common/NoContentFound";
import Switch from "react-switch";
import $ from 'jquery';
import HeaderTitle from "../common/HeaderTitle";


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
      };
   }

   /**
   * @method componentDidMount
   * @description used to called after mounting component
   */
   componentDidMount() {
      this.props.setEmptyUserDataAPI('', () => { })
      this.props.getAllRoleAPI(() => { })
      this.props.getAllDepartmentAPI(() => { })
      this.props.fetchSupplierCityDataAPI(() => { })

      this.props.getActionHeadsSelectList(() => {
         this.getRolePermission()
      })
      this.props.getModuleSelectList(() => { })

      this.props.getAllTechnologyAPI(() => { })
      this.props.getAllLevelAPI(() => { })
   }

   getRolePermission = () => {
      this.setState({ isLoader: true });
      this.props.getModuleActionInit((res) => {
         if (res && res.data && res.data.Data) {

            let Data = res.data.Data;
            let Modules = res.data.Data;

            let moduleCheckedArray = [];
            Modules && Modules.map((el, i) => {
               let tempObj = {
                  ModuleName: el.ModuleName,
                  IsChecked: el.IsChecked,
                  ModuleId: el.ModuleId,
               }
               moduleCheckedArray.push(tempObj)
            })

            this.setState({
               actionData: Data,
               Modules: Modules,
               moduleCheckedAll: moduleCheckedArray,
               isLoader: false,
            })
         }
      })
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
   * @description Used show listing of unit of measurement
   */
   searchableSelectType = (label) => {
      const { roleList, departmentList, cityList, technologyList, levelList } = this.props;
      const temp = [];

      if (label === 'role') {
         roleList && roleList.map(item =>
            temp.push({ label: item.RoleName, value: item.RoleId })
         );
         return temp;
      }

      if (label === 'department') {
         departmentList && departmentList.map(item =>
            temp.push({ label: item.DepartmentName, value: item.DepartmentId })
         );
         return temp;
      }

      if (label === 'city') {
         cityList && cityList.map(item => {
            if (item.Value == 0) return false;
            temp.push({ label: item.Text, value: item.Value })
         });
         return temp;
      }

      if (label === 'technology') {
         technologyList && technologyList.map(item =>
            temp.push({ label: item.Text, value: item.Value })
         );
         return temp;
      }

      if (label === 'level') {
         levelList && levelList.map(item =>
            temp.push({ label: item.LevelName, value: item.LevelId })
         );
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
      if (newValue && newValue != '') {

         this.setState({ Modules: [], IsShowAdditionalPermission: false, }, () => {
            this.setState({
               role: newValue,
            });
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
            isEditFlag: true,
            isShowForm: true,
            IsShowAdditionalPermission: true,
            isShowPwdField: false,
            UserId: data.UserId,
         })
         $('html, body').animate({ scrollTop: 0 }, 'slow');
         this.props.getUserDataAPI(data.UserId, (res) => {
            if (res && res.data && res.data.Data) {

               const { roleList, departmentList, cityList } = this.props;
               let Data = res.data.Data;

               const RoleObj = roleList.find(item => item.RoleId == Data.RoleId)
               const DepartmentObj = departmentList.find(item => item.DepartmentId == Data.DepartmentId)
               const CityObj = cityList.find(item => item.Value == Data.CityId)
               console.log('RoleObj', RoleObj)
               this.setState({
                  isEditFlag: false,
                  isLoader: false,
                  department: DepartmentObj != undefined ? { label: DepartmentObj.DepartmentName, value: DepartmentObj.DepartmentId } : [],
                  role: RoleObj != undefined ? { label: RoleObj.RoleName, value: RoleObj.RoleId } : [],
                  city: { label: CityObj.Text, value: CityObj.Value },
               })
               this.getUserPermission(data.UserId)
               this.getUsersTechnologyLevelData(data.UserId)

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
            let Modules = Data.Modules;

            let moduleCheckedArray = [];
            Modules && Modules.map((el, i) => {
               let tempObj = {
                  ModuleName: el.ModuleName,
                  IsChecked: el.IsChecked,
                  ModuleId: el.ModuleId,
               }
               moduleCheckedArray.push(tempObj)
            })
            this.setState({
               actionData: Data,
               Modules: Modules,
               oldModules: Modules,
               moduleCheckedAll: moduleCheckedArray,
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
   * @method renderActionHeads
   * @description used to add more permission for user
   */
   renderActionHeads = (actionHeads) => {
      return actionHeads && actionHeads.map((item, index) => {
         if (item.Value == 0) return false;
         return (
            <th className="crud-label">
               <div className={item.Text}></div>
               {item.Text}
            </th>
         )
      })
   }

   /**
       * @method moduleHandler
       * @description used to checked module
       */
   moduleHandler = (index) => {
      //alert('hi')
      const { Modules, checkedAll } = this.state;
      const isModuleChecked = Modules[index].IsChecked;

      let actionArray = [];
      let tempArray = [];

      let actionRow = (Modules && Modules != undefined) ? Modules[index].Actions : [];
      if (isModuleChecked) {
         actionArray = actionRow && actionRow.map((item, index) => {
            item.IsChecked = false;
            return item;
         })

         tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: false, Actions: actionArray }) })

         this.setState({ Modules: tempArray })
      } else {
         actionArray = actionRow && actionRow.map((item, index) => {
            item.IsChecked = true;
            return item;
         })

         tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })

         this.setState({ Modules: tempArray })
      }
   }

   /**
   * @method isCheckAll
   * @description used to select module's action row (Horizontally)
   */
   isCheckAll = (parentIndex, actionData) => {
      const { actionSelectList } = this.props;

      let tempArray = actionData.filter(item => item.IsChecked == true)
      if (actionData && actionData != undefined) {
         return tempArray.length == actionSelectList.length - 1 ? true : false;
      }
   }

   /**
    * @method renderAction
    * @description used to render row of actions
    */
   renderAction = (actions, parentIndex) => {
      const { actionSelectList } = this.props;

      return actionSelectList && actionSelectList.map((el, i) => {
         return actions && actions.map((item, index) => {
            if (el.Text != item.ActionName) return false;
            return (
               <td>
                  {/* {<input
                     type="checkbox"
                     value={item.ActionId}
                     onChange={() => this.actionCheckHandler(parentIndex, index)}
                     checked={item.IsChecked}
                  />} */}
                  {
                     <label htmlFor="normal-switch">
                        {/* <span>Switch with default style</span> */}
                        <Switch
                           onChange={() => this.actionCheckHandler(parentIndex, index)}
                           checked={item.IsChecked}
                           value={item.ActionId}
                           id="normal-switch"
                           onColor="#4DC771"
                           onHandleColor="#ffffff"
                           offColor="#959CB6"
                           checkedIcon={false}
                           uncheckedIcon={false}
                           height={18}
                           width={40}
                        />
                     </label>
                  }
               </td>
            )
         })
      })
   }

   /**
    * @method actionCheckHandler
    * @description Used to check/uncheck action's checkbox
    */
   actionCheckHandler = (parentIndex, childIndex) => {
      const { Modules } = this.state;

      let actionRow = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];


      let actionArray = actionRow && actionRow.map((el, index) => {
         if (childIndex == index) {
            el.IsChecked = !el.IsChecked
         }
         return el;
      })
      let tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) })
      this.setState({ Modules: tempArray }, () => {
         const { Modules } = this.state;
         let aa = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];
         let checkedActions = aa.filter(item => item.IsChecked == true)
         let abcd = checkedActions && checkedActions.length != 0 ? true : false;
         let tempArray1 = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: abcd, Actions: actionArray }) })
         this.setState({ Modules: tempArray1 })
      })
   }

   selectAllHandler = (parentIndex, actionRows) => {
      const { Modules } = this.state;
      const { actionSelectList } = this.props;

      let checkedActions = actionRows.filter(item => item.IsChecked == true)

      let tempArray = [];
      let isCheckedSelectAll = (checkedActions.length == actionSelectList.length - 1) ? true : false;

      if (isCheckedSelectAll) {
         let actionArray = actionRows && actionRows.map((item, index) => {
            item.IsChecked = false;
            return item;
         })
         tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: false, Actions: actionArray }) })
         this.setState({
            Modules: tempArray,
            //checkedAll: false,
         })
      } else {
         let actionArray = actionRows && actionRows.map((item, index) => {
            item.IsChecked = true;
            return item;
         })
         tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
         this.setState({
            Modules: tempArray,
            //checkedAll: true
         })
      }
   }

   /**
    * @method onPressUserPermission
    * @description Used for User's additional permission
    */
   onPressUserPermission = () => {
      const { IsShowAdditionalPermission, role } = this.state;
      if (role && role.value) {
         this.setState({ IsShowAdditionalPermission: !IsShowAdditionalPermission }, () => {
            if (this.state.IsShowAdditionalPermission) {
               this.getRoleDetail();
            }
         });
      } else {
         toastr.warning('Please select role.')
      }
   }

   /**
    * @method getRoleDetail
    * @description used to get role detail
    */
   getRoleDetail = () => {
      const { role } = this.state;
      if (role && role.value != '') {
         this.props.getRoleDataAPI(role.value, (res) => {
            if (res && res.data && res.data.Data) {
               let Data = res.data.Data;
               let Modules = Data.Modules;

               let moduleCheckedArray = [];
               Modules && Modules.map((el, i) => {
                  let tempObj = {
                     ModuleName: el.ModuleName,
                     IsChecked: el.IsChecked,
                     ModuleId: el.ModuleId,
                  }
                  moduleCheckedArray.push(tempObj)
               })

               this.setState({
                  //isEditFlag: true,
                  RoleId: role.value,
                  Modules: Modules,
                  moduleCheckedAll: moduleCheckedArray,
                  isLoader: false,
               })
               if (Modules.length == 0) this.getRolePermission();
            }
         })
      }
   }

   /**
    * @method technologyHandler
    * @description Used to handle 
    */
   technologyHandler = (newValue, actionMeta) => {
      if (newValue && newValue != '') {
         this.setState({ technology: newValue });
      } else {
         this.setState({ technology: [] });
      }
   };

   /**
   * @method levelHandler
   * @description Used to handle 
   */
   levelHandler = (newValue, actionMeta) => {
      if (newValue && newValue != '') {
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
         if (i == index) {
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
         IsShowAdditionalPermission: false,
         TechnologyLevelGrid: [],
      })
   }

   /**
   * @method resetForm
   * @description used to Reset form
   */
   resetForm = () => {
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
         IsShowAdditionalPermission: false,
         TechnologyLevelGrid: [],
      })
   }

   /**
   * @method confirmUpdateUser
   * @description confirm Update User
   */
   confirmUpdateUser = (updatedData, RemoveCostingFlag) => {

      const { reset, registerUserData } = this.props;
      const { department, role, city, isEditFlag, Modules, oldModules,
         TechnologyLevelGrid, oldTechnologyLevelGrid, UserId } = this.state;
      const userDetails = reactLocalStorage.getObject("userDetail")

      reset();
      updatedData.IsRemoveCosting = RemoveCostingFlag;
      this.props.updateUserAPI(updatedData, (res) => {
         if (res.data.Result) {
            toastr.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
         }
         this.setState({
            isLoader: false,
            isEditFlag: false,
            isSubmitted: false,
            isShowForm: false,
            department: [],
            role: [],
            city: [],
            IsShowAdditionalPermission: false,
            Modules: [],
            TechnologyLevelGrid: [],
         })

         let data = {
            UserId: loggedInUserId(),
            PageSize: 0,
            LastIndex: 0,
            DepartmentId: '',
            RoleId: '',
         }
         this.props.getAllUserDataAPI(data, res => { });
         this.props.setEmptyUserDataAPI('', () => { })
         this.child.getUpdatedData();
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
      //console.log("signup values", values)
      const { reset, registerUserData } = this.props;
      const { department, role, city, isEditFlag, Modules, oldModules, TechnologyLevelGrid,
         oldTechnologyLevelGrid, UserId } = this.state;
      const userDetails = reactLocalStorage.getObject("userDetail")

      if (TechnologyLevelGrid && TechnologyLevelGrid.length == 0) {
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
            AdditionalPermission: registerUserData.AdditionalPermission,
            CityName: department.label,
            UserProfileId: registerUserData.UserProfileId,
            UserName: values.email,
            Password: values.Password,
            RoleId: role.value,
            PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
            DepartmentId: department.value,
            loggedInUserId: loggedInUserId(),
            CompanyId: userDetails.CompanyId,
            Email: values.email,
            Mobile: values.Mobile,
            FirstName: values.FirstName,
            MiddleName: values.MiddleName,
            LastName: values.LastName,
            RoleName: role.label,
            UserCode: registerUserData.UserCode,
            CreatedDate: registerUserData.CreatedDate,
            AddressLine1: values.AddressLine1,
            AddressLine2: values.AddressLine2,
            ZipCode: values.ZipCode,
            PhoneNumber: values.PhoneNumber,
            Extension: values.Extension,
            CityId: city.value,
            Modules: Modules,
            TechnologyLevels: tempTechnologyLevelArray,
            IsRemoveCosting: false,
            CostingCount: registerUserData.CostingCount,
         }

         const isDepartmentUpdate = (registerUserData.DepartmentId != department.value) ? true : false;
         const isRoleUpdate = (registerUserData.RoleId != role.value) ? true : false;
         let isPermissionUpdate = false;
         let isTechnologyUpdate = false;

         if (JSON.stringify(Modules) == JSON.stringify(oldModules)) {
            isPermissionUpdate = false;
         } else {
            isPermissionUpdate = true;
         }

         if (JSON.stringify(TechnologyLevelGrid) == JSON.stringify(oldTechnologyLevelGrid)) {
            isTechnologyUpdate = false;
         } else {
            isTechnologyUpdate = true;
         }

         console.log('checks', isDepartmentUpdate, isRoleUpdate, isPermissionUpdate, isTechnologyUpdate);

         if (isDepartmentUpdate || isRoleUpdate || isPermissionUpdate || isTechnologyUpdate) {
            const toastrConfirmOptions = {
               onOk: () => {
                  this.confirmUpdateUser(updatedData, true)
               },
               onCancel: () => {
                  this.confirmUpdateUser(updatedData, false)
               }
            };
            return toastr.confirm(`${MESSAGES.COSTING_DELETE_ALERT}`, toastrConfirmOptions);
         } else {

            reset();
            this.props.updateUserAPI(updatedData, (res) => {
               if (res.data.Result) {
                  toastr.success(MESSAGES.UPDATE_USER_SUCCESSFULLY)
               }
               this.setState({
                  isLoader: false,
                  isEditFlag: false,
                  isSubmitted: false,
                  isShowForm: false,
                  department: [],
                  role: [],
                  city: [],
                  Modules: [],
                  IsShowAdditionalPermission: false,
                  TechnologyLevelGrid: [],
               })

               //////////////////  ADDITIONAL PERMISSION START /////////
               // let formData = {
               //    UserId: UserId,
               //    Modules: Modules,
               // }

               // this.props.setUserAdditionalPermission(formData, (res) => {
               //    if (res && res.data && res.data.Result) {
               //       toastr.success(MESSAGES.ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY)
               //    }
               //    this.setState({
               //       Modules: [],
               //       IsShowAdditionalPermission: false,
               //    })
               // })
               //////////////////  ADDITIONAL PERMISSION END /////////

               //////////////////  TECHNOLOGY LEVEL START /////////
               // let tempTechnologyLevelArray = []

               // TechnologyLevelGrid && TechnologyLevelGrid.map((item, index) => {
               //    tempTechnologyLevelArray.push({
               //       Technology: item.Technology,
               //       Level: item.Level,
               //       TechnologyId: item.TechnologyId,
               //       LevelId: item.LevelId
               //    })
               // })

               // let technologyLevelFormData = {
               //    UserId: UserId,
               //    TechnologyLevels: tempTechnologyLevelArray
               // }

               // this.props.updateUserTechnologyLevelForCosting(technologyLevelFormData, (res) => {
               //    if (res && res.data && res.data.Result) {
               //       //toastr.success(MESSAGES.ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY)
               //    }
               //    this.setState({ TechnologyLevelGrid: [] })
               // })
               //////////////////  TECHNOLOGY LEVEL END /////////

               let data = {
                  UserId: loggedInUserId(),
                  PageSize: 0,
                  LastIndex: 0,
                  DepartmentId: '',
                  RoleId: '',
               }
               this.props.getAllUserDataAPI(data, res => { });
               this.props.setEmptyUserDataAPI('', () => { })
               this.child.getUpdatedData();
            })
         }
      } else {

         let userData = {
            UserName: values.email,
            Password: values.Password,
            RoleId: role.value,
            PlantId: (userDetails && userDetails.Plants) ? userDetails.Plants[0].PlantId : '',
            DepartmentId: department.value,
            loggedInUserId: loggedInUserId(),
            CompanyId: userDetails.CompanyId,
            Email: values.email,
            Mobile: values.Mobile,
            FirstName: values.FirstName,
            MiddleName: values.MiddleName,
            LastName: values.LastName,
            RoleName: role.label,
            AddressLine1: values.AddressLine1,
            AddressLine2: values.AddressLine2,
            ZipCode: values.ZipCode,
            PhoneNumber: values.PhoneNumber,
            Extension: values.Extension,
            CityId: city.value,
            Modules: Modules,
            TechnologyLevels: tempTechnologyLevelArray,
         }
         this.props.registerUserAPI(userData, res => {
            this.setState({ isSubmitted: false, })

            if (res && res.data && res.data.Result) {
               const newUserId = res.data.Identity;
               toastr.success(MESSAGES.ADD_USER_SUCCESSFULLY)
               reset();
               this.setState({
                  isLoader: false,
                  isSubmitted: false,
                  isShowForm: false,
                  department: [],
                  role: [],
                  city: [],
               })

               //////////////////  ADDITIONAL PERMISSION START /////////
               // let formData = {
               //    UserId: newUserId,
               //    Modules: Modules,
               // }

               // this.props.setUserAdditionalPermission(formData, (res) => {
               //    if (res && res.data && res.data.Result) {
               //       toastr.success(MESSAGES.ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY)
               //    }
               //    this.setState({
               //       Modules: [],
               //       IsShowAdditionalPermission: false,
               //    })
               // })
               //////////////////  ADDITIONAL PERMISSION END /////////

               //////////////////  TECHNOLOGY LEVEL START /////////
               // let tempTechnologyLevelArray = []

               // TechnologyLevelGrid && TechnologyLevelGrid.map((item, index) => {
               //    tempTechnologyLevelArray.push({
               //       TechnologyId: item.TechnologyId,
               //       LevelId: item.LevelId
               //    })
               // })

               // let technologyLevelFormData = {
               //    UserId: newUserId,
               //    TechnologyLevels: tempTechnologyLevelArray
               // }

               // this.props.setUserTechnologyLevelForCosting(technologyLevelFormData, (res) => {
               //    if (res && res.data && res.data.Result) {
               //       //toastr.success(MESSAGES.ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY)
               //    }
               //    this.setState({ TechnologyLevelGrid: [] })
               // })
               //////////////////  TECHNOLOGY LEVEL END /////////

               let data = {
                  UserId: loggedInUserId(),
                  PageSize: 0,
                  LastIndex: 0,
                  DepartmentId: '',
                  RoleId: '',
               }
               this.props.getAllUserDataAPI(data, res => { });
               this.child.getUpdatedData();
            }
         })

      }
   }

   render() {
      const { handleSubmit, pristine, submitting, reset, actionSelectList } = this.props;
      const { isLoader, isSubmitted } = this.state;
      return (
         <div>
            {/* {isLoader && <Loader />} */}
            <div className="login-container signup-form">
               <div className="row">
                  {/* {!this.state.isShowForm && <div className="col-md-12" >
                     <button
                        type="button"
                        className={'user-btn mb15'}
                        onClick={() => this.setState({ isShowForm: !this.state.isShowForm })}><div className={'plus'}></div>ADD USER</button>
                  </div>} */}

                  {this.state.isShowForm &&
                     <div className="col-md-12">
                        <div className="shadow-lgg login-formg pt-30">
                           <div className="row">
                              <div className="col-md-6">
                                 <div className="form-heading mb-0">
                                    <h2>{this.state.isEditFlag ? 'Update User' : 'Add User'}</h2>
                                 </div>
                              </div>
                              {this.state.isEditFlag && <div className="col-md-6">
                                 <a href="javascript:void(0)" className={'linkButton btn-primary'} onClick={() => this.setState({ isShowPwdField: !this.state.isShowPwdField })} >Change Password</a>
                              </div>}
                           </div>
                           <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate className="manageuser">

                              <HeaderTitle
                                 title={'Personal Details:'}
                                 customClass={'Personal-Details'} />

                              <div className=" row form-group">
                                 <div className="input-group col-md-3 input-withouticon" >
                                    <Field
                                       label="First Name"
                                       name={"FirstName"}
                                       type="text"
                                       placeholder={''}
                                       validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                                       component={renderText}
                                       required={true}
                                       maxLength={26}
                                       customClassName={'withBorder'}
                                    />
                                 </div>
                                 {/* <div className="input-group  col-md-4 input-withouticon">
                                    <Field
                                       label="Middle Name"
                                       name={"MiddleName"}
                                       type="text"
                                       placeholder={''}
                                       validate={[alphabetsOnlyForName]}
                                       component={renderText}
                                       required={false}
                                       maxLength={26}
                                    />
                                 </div> */}
                                 <div className="input-group col-md-3 input-withouticon">
                                    <Field
                                       label="Last Name"
                                       name={"LastName"}
                                       type="text"
                                       placeholder={''}
                                       validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                                       component={renderText}
                                       required={true}
                                       maxLength={26}
                                       customClassName={'withBorder'}
                                    />
                                 </div>
                                 <div className="input-group col-md-3">
                                    <Field
                                       name="Mobile"
                                       label="Mobile"
                                       type="text"
                                       placeholder={''}
                                       component={renderText}
                                       isDisabled={false}
                                       validate={[required, number, minLength7]}
                                       required={true}
                                       maxLength={70}
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
                                             placeholder={''}
                                             validate={[number]}
                                             component={renderText}
                                             //required={true}
                                             maxLength={12}
                                             customClassName={'withBorder'}
                                          />
                                       </div>
                                       {/* <div className="dash phoneNumber col-md-1 input-withouticon">
                                          {''}
                                       </div> */}
                                       <div className="ext phoneNumber col-md-4 input-withouticon pl-0 pr-0">
                                          <Field
                                             label="Extension"
                                             name={"Extension"}
                                             type="text"
                                             placeholder={'Ext'}
                                             validate={[number]}
                                             component={renderText}
                                             //required={true}
                                             maxLength={5}
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
                                       name="email"
                                       label="Email ID"
                                       component={renderEmailInputField}
                                       isDisabled={false}
                                       placeholder={'Enter'}
                                       validate={[required, email, minLength7, maxLength70]}
                                       required={true}
                                       maxLength={70}
                                       isDisabled={this.state.isEditFlag ? true : false}
                                       customClassName={'withBorderEmail'}
                                    />
                                 </div>
                                 <div className="input-group col-md-3">
                                    <Field
                                       name="Username"
                                       label="User name"
                                       type="text"
                                       placeholder={'Enter'}
                                       component={renderText}
                                       isDisabled={false}
                                       validate={[required, minLength7]}
                                       required={true}
                                       maxLength={70}
                                       disabled={this.state.isEditFlag ? true : false}
                                       customClassName={'withBorder'}
                                    />
                                 </div>
                                 {this.state.isShowPwdField &&
                                    <>
                                       <div className="input-group col-md-3">
                                          <Field
                                             name="Password"
                                             label="Password"
                                             placeholder="Enter"
                                             component={renderPasswordInputField}
                                             onChange={this.passwordPatternHandler}
                                             validate={[required, minLength6, maxLength25]}
                                             isShowHide={this.state.isShowHidePassword}
                                             showHide={this.showHidePasswordHandler}
                                             required={true}
                                             maxLength={26}
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
                                             validate={[required, minLength6, maxLength25]}
                                             required={true}
                                             maxLength={26}
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
                                       placeholder={''}
                                       validate={[required]}
                                       component={renderText}
                                       required={true}
                                       maxLength={26}
                                       customClassName={'withBorder'}
                                    />
                                 </div>
                                 <div className="input-group col-md-3 input-withouticon">
                                    <Field
                                       label="Address 2"
                                       name={"AddressLine2"}
                                       type="text"
                                       placeholder={''}
                                       validate={[required]}
                                       component={renderText}
                                       required={true}
                                       maxLength={26}
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
                                       placeholder={''}
                                       validate={[required, number]}
                                       component={renderText}
                                       required={true}
                                       maxLength={26}
                                       customClassName={'withBorder'}
                                    />
                                 </div>
                              </div>

                              <HeaderTitle
                                 title={'Role & Department:'}
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
                                       validate={(this.state.role == null || this.state.role.length == 0) ? [required] : []}
                                       required={true}
                                       handleChangeDescription={this.roleHandler}
                                       valueDescription={this.state.role}
                                    />
                                 </div>
                                 <div className="col-md-3">
                                    <Field
                                       name="DepartmentId"
                                       type="text"
                                       label="Department"
                                       component={searchableSelect}
                                       placeholder={'Select department'}
                                       options={this.searchableSelectType('department')}
                                       //onKeyUp={(e) => this.changeItemDesc(e)}
                                       validate={(this.state.department == null || this.state.department.length == 0) ? [required] : []}
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




                              <div className=" row form-group">
                                 <div className={'col-md-6'}>
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
                              </div>

                              {this.state.IsShowAdditionalPermission &&
                                 <div className=" row form-group grant-user-grid">
                                    <div className="col-md-12">
                                       <Table className="table table-bordered" size="sm" >
                                          <thead>
                                             <tr>
                                                <th>{`Module Name`}</th>
                                                <th>{``}</th>
                                                {this.renderActionHeads(actionSelectList)}
                                             </tr>
                                          </thead>
                                          <tbody >
                                             {this.state.Modules && this.state.Modules.map((item, index) => {
                                                return (
                                                   <tr key={index}>

                                                      <td >{
                                                         <label
                                                            className="custom-checkbox"
                                                            onChange={() => this.moduleHandler(index)}
                                                         >
                                                            {item.ModuleName}
                                                            <input
                                                               type="checkbox"
                                                               value={'All'}
                                                               checked={item.IsChecked} />
                                                            <span
                                                               className={`before-box`}
                                                               //className={`before-box ${item.IsChecked ? 'selected-box' : 'not-selected-box'}`}
                                                               checked={item.IsChecked}
                                                               onChange={() => this.moduleHandler(index)}
                                                            />
                                                         </label>
                                                      }
                                                      </td>

                                                      <td className="select-all-block"> {<input
                                                         type="checkbox"
                                                         value={'All'}
                                                         className={this.isCheckAll(index, item.Actions) ? 'selected-box' : 'not-selected-box'}
                                                         checked={this.isCheckAll(index, item.Actions)}
                                                         onClick={() => this.selectAllHandler(index, item.Actions)} />} <span>Select All</span></td>

                                                      {this.renderAction(item.Actions, index)}
                                                   </tr>
                                                )
                                             })}
                                             {this.state.Modules.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                          </tbody>
                                       </Table>
                                    </div>
                                 </div>}


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
                                 <div className="col-md-2 mt25">
                                    {this.state.isEditIndex ?
                                       <>
                                          <button
                                             type="button"
                                             className={'btn btn-primary'}
                                             onClick={this.updateTechnologyLevel}
                                          >Update</button>

                                          <button
                                             type="button"
                                             className={'btn btn-secondary'}
                                             onClick={this.resetTechnologyLevel}
                                          >Cancel</button>
                                       </>
                                       :
                                       <button
                                          type="button"
                                          className={'add-button add-button-big'}
                                          onClick={this.setTechnologyLevel}
                                       ><div className={'plus'}></div><span>ADD</span></button>}
                                 </div>
                              </div>

                              <div className="row form-group">
                                 <div className="col-md-12">
                                    <Table className="table" size="sm" >
                                       <thead>
                                          <tr>
                                             <th>{`Technology`}</th>
                                             <th>{`Level`}</th>
                                             <th>{`Action`}</th>
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
                                                      <td>
                                                         <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(index)} />
                                                         <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} />
                                                      </td>
                                                   </tr>
                                                )
                                             })
                                          }
                                       </tbody>
                                       {this.state.TechnologyLevelGrid.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                    </Table>
                                 </div>
                              </div>

                              {/* ///////////////////////////////////////////////
                              ////////////////////////////////////////////////////
                              /////////////// User's technology level END ////////
                              //////////////////////////////////////////////////
                              ///////////////////////////////////////////////// */}


                              <div className="text-right">

                                 <input
                                    //disabled={pristine || submitting}
                                    onClick={this.cancel}
                                    type="submit"
                                    value="CANCEL"
                                    className="reset mr15 cancel-btn"
                                 />
                                 <button
                                    type="submit"
                                    disabled={isSubmitted ? true : false}
                                    className="submit-button mr5 save-btn"
                                 >
                                    {this.state.isEditFlag ? 'UPDATE' : 'SAVE'}
                                 </button>
                                 {/* {!this.state.isEditFlag &&
                                    <input
                                       disabled={pristine || submitting}
                                       onClick={this.resetForm}
                                       type="submit"
                                       value="Reset"
                                       className="reset"
                                    />} */}

                              </div>

                           </form>
                        </div>
                     </div>}
               </div>
            </div>
            <UsersListing
               onRef={ref => (this.child = ref)}
               getUserDetail={this.getUserDetail}
               formToggle={this.formToggle}
               isShowForm={this.state.isShowForm}
            />
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
   const { roleList, departmentList, registerUserData, actionSelectList,
      technologyList, levelList, } = auth;
   const { cityList } = comman;

   let initialValues = {};

   if (registerUserData && registerUserData != undefined) {
      initialValues = {
         FirstName: registerUserData.FirstName,
         MiddleName: registerUserData.MiddleName,
         LastName: registerUserData.LastName,
         email: registerUserData.Email,
         Username: registerUserData.UserName,
         Mobile: registerUserData.Mobile,
         Password: registerUserData.Password,
         passwordConfirm: registerUserData.Password,
         AddressLine1: registerUserData.AddressLine1,
         AddressLine2: registerUserData.AddressLine2,
         ZipCode: registerUserData.ZipCode,
         PhoneNumber: registerUserData.PhoneNumber,
         Extension: registerUserData.Extension,
      }
   }

   return {
      roleList, departmentList, cityList, registerUserData, actionSelectList,
      initialValues, technologyList, levelList,
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
   fetchSupplierCityDataAPI,
   getUserDataAPI,
   getAllUserDataAPI,
   updateUserAPI,
   setEmptyUserDataAPI,
   getActionHeadsSelectList,
   getModuleSelectList,
   getModuleActionInit,
   getRoleDataAPI,
   getAllTechnologyAPI,
   getAllLevelAPI,
   getPermissionByUser,
   getUsersTechnologyLevelAPI,
   setUserAdditionalPermission,
   setUserTechnologyLevelForCosting,
   updateUserTechnologyLevelForCosting,
})(reduxForm({
   validate,
   form: 'Signup',
   onSubmitFail: errors => {
      //console.log('Register errors', errors)
      focusOnError(errors);
   },
   enableReinitialize: true,
})(UserRegistration));