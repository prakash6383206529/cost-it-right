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
import "./UserRegistration.scss";
import { registerUserAPI, getAllRoleAPI, getAllDepartmentAPI } from "../../actions/auth/AuthActions";
import { fetchSupplierCityDataAPI } from "../../actions/master/Comman";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';

class UserRegistration extends Component {
  constructor(props) {
    super(props);
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
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    this.props.getAllRoleAPI(() => { })
    this.props.getAllDepartmentAPI(() => { })
    this.props.fetchSupplierCityDataAPI(() => { })
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
    const { roleList, departmentList, cityList } = this.props;
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
    this.setState({ role: newValue });
  };

  /**
    * @method cityHandler
    * @description Used to handle city
    */
  cityHandler = (newValue, actionMeta) => {
    this.setState({ city: newValue });
  };

  /**
    * @method cancel
    * @description used to Reset form
    */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      isEditFlag: false,
      department: [],
      role: [],
      city: [],
    })
  }

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  onSubmit(values) {
    console.log("signup values", values)
    const { reset } = this.props;
    const { department, role, city } = this.state;
    const userDetails = reactLocalStorage.getObject("userDetail")
    this.setState({ isSubmitted: true })

    let userData = {
      UserName: values.email,
      Password: values.Password,
      RoleId: role.value,
      DepartmentId: department.value,
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
    }
    this.props.registerUserAPI(userData, res => {
      if (res.data.Result) {
        toastr.success(MESSAGES.ADD_USER_SUCCESSFULLY)
      }
      reset();
      this.setState({
        isLoader: false,
        isSubmitted: false,
        department: [],
        role: [],
        city: [],
      })
    })
  }


  render() {
    const { handleSubmit, pristine, submitting, reset } = this.props;
    const { isLoader, isSubmitted } = this.state;

    return (
      <div>
        {isLoader && <Loader />}
        <div className="login-container  signup-form">
          <div className="shadow-lg login-form">
            <div className="form-heading">
              <h2>
                User Registration
             </h2>
            </div>
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
              <div className=" row form-group">
                <div className="input-group col-md-4 input-withouticon" >
                  <Field
                    label="First Name"
                    name={"FirstName"}
                    type="text"
                    placeholder={''}
                    validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-4 input-withouticon">
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
                </div>
                <div className="input-group  col-md-4 input-withouticon">
                  <Field
                    label="Last Name"
                    name={"LastName"}
                    type="text"
                    placeholder={''}
                    validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
              </div>
              <div className="row form-group">
                <div className="input-group col-md-6">
                  <Field
                    name="email"
                    label="Email Address"
                    component={renderEmailInputField}
                    isDisabled={false}
                    placeholder={''}
                    validate={[required, email, minLength7, maxLength70]}
                    required={true}
                    maxLength={70}
                  />
                </div>
                <div className="input-group col-md-6">
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
                  />
                </div>
              </div>

              <div className="row form-group">
                <div className="col-md-4">
                  <Field
                    name="DepartmentId"
                    type="text"
                    //onKeyUp={(e) => this.changeItemDesc(e)}
                    label="Department"
                    component={searchableSelect}
                    placeholder={'Select department'}
                    //validate={[required]}
                    options={this.searchableSelectType('department')}
                    //required={true}
                    handleChangeDescription={this.departmentHandler}
                    valueDescription={this.state.department}
                  />
                </div>
                <div className="col-md-4">
                  <Field
                    name="RoleId"
                    type="text"
                    //onKeyUp={(e) => this.changeItemDesc(e)}
                    label="Role"
                    component={searchableSelect}
                    placeholder={'Select role'}
                    //validate={[required]}
                    options={this.searchableSelectType('role')}
                    //required={true}
                    handleChangeDescription={this.roleHandler}
                    valueDescription={this.state.role}
                  />
                </div>
                <div className="col-md-4">
                  <Field
                    name="CityId"
                    type="text"
                    //onKeyUp={(e) => this.changeItemDesc(e)}
                    label="City"
                    component={searchableSelect}
                    placeholder={'Select city'}
                    //validate={[required]}
                    options={this.searchableSelectType('city')}
                    //required={true}
                    handleChangeDescription={this.cityHandler}
                    valueDescription={this.state.city}
                  />
                </div>
              </div>

              <div className="row form-group">
                <div className="input-group col-md-6">
                  <Field
                    name="Password"
                    label="Password"
                    placeholder="Must have atleast 6 characters"
                    component={renderPasswordInputField}
                    onChange={this.passwordPatternHandler}
                    validate={[required, minLength6, maxLength25]}
                    isShowHide={this.state.isShowHidePassword}
                    showHide={this.showHidePasswordHandler}
                    required={true}
                    maxLength={26}
                    isEyeIcon={true}
                  />
                </div>
                <div className="input-group col-md-6">
                  <Field
                    name="passwordConfirm"
                    label="Confirm Password"
                    placeholder={''}
                    component={renderPasswordInputField}
                    validate={[required, minLength6, maxLength25]}
                    required={true}
                    maxLength={26}
                    isShowHide={this.state.isShowHide}
                    showHide={this.showHideHandler}
                    isEyeIcon={true}
                  />
                </div>
                <div className="input-group  col-md-6 input-withouticon">
                  <Field
                    label="Address 1"
                    name={"AddressLine1"}
                    type="text"
                    placeholder={''}
                    validate={[required]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-6 input-withouticon">
                  <Field
                    label="Address 2"
                    name={"AddressLine2"}
                    type="text"
                    placeholder={''}
                    validate={[required]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-4 input-withouticon">
                  <Field
                    label="ZipCode"
                    name={"ZipCode"}
                    type="text"
                    placeholder={''}
                    validate={[required, number]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-4 input-withouticon">
                  <Field
                    label="Phone Number"
                    name={"PhoneNumber"}
                    type="text"
                    placeholder={''}
                    validate={[required, number]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-4 input-withouticon">
                  <Field
                    label="Extension"
                    name={"Extension"}
                    type="text"
                    placeholder={''}
                    validate={[required]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
              </div>

              <div className="text-center ">
                {/* <input
                  disabled={isSubmitted ? true : false}
                  type="submit"
                  value="Save"
                  className="btn  login-btn w-10 dark-pinkbtn"
                /> */}
                <button
                  type="submit"
                  disabled={isSubmitted ? true : false}
                  className="btn  login-btn w-10 dark-pinkbtn"
                >
                  Save
                </button>
                <input
                  disabled={pristine || submitting}
                  onClick={this.cancel}
                  type="submit"
                  value="Reset"
                  className="btn  login-btn w-10 dark-pinkbtn"
                />
              </div>
            </form>
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
  const { roleList, departmentList } = auth;
  const { cityList } = comman;

  return { roleList, departmentList, cityList };
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
})(reduxForm({
  validate,
  form: 'Signup',
  onSubmitFail: errors => {
    console.log('ddd', errors)
    focusOnError(errors);
  },
  enableReinitialize: true,
})(UserRegistration));