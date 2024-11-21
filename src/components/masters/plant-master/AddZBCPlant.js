import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, maxLength6, maxLength80, checkWhiteSpaces, minLength10, alphaNumeric, maxLength71, maxLength5, acceptAllExceptSingleSpecialCharacter, postiveNumber, maxLength12, checkSpacesInString, postiveNumberForPlantCode, number, maxLength4, hashValidation, alphaneumericSpecialAccept, maxLength25 } from "../../../helper/validation";
import { userDetails, loggedInUserId, handleDepartmentHeader } from "../../../helper/auth";
import { focusOnError, renderText, renderTextInputField, searchableSelect, validateForm } from "../../layout/FormInputs";
import { createPlantAPI, getPlantUnitAPI, updatePlantAPI, getComapanySelectList } from '../actions/Plant';
import {
  fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, fetchSupplierCityDataAPI,
  getCityByCountryAction,
} from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import Drawer from '@material-ui/core/Drawer';
import LoaderCustom from '../../common/LoaderCustom';
import { debounce } from 'lodash';
import { ZBCTypeId } from '../../../config/constants';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';

class AddZBCPlant extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      isViewMode: this.props?.isViewMode ? true : false,
      isLoader: false,
      PlantId: '',
      city: [],
      country: [],
      state: [],
      company: [],
      DropdownChanged: true,
      DataToCheck: [],
      setDisable: false,
      showPopup: false,
      isCompanyChanged: false,
      showPopupOnCompanyChange: false,
    }
  }

  /**
  * @method toggleModel
  * @description Used to cancel modal
  */
  componentDidMount() {
    if (!(this.props.isEditFlag || this.props.isViewMode)) {
      this.props.fetchCountryDataAPI(() => { })
    }
    if (this.props.initialConfiguration.IsCompanyConfigureOnPlant) {
      this.props.getComapanySelectList(() => { })
    }
    this.getDetails()

  }

  UNSAFE_componentWillMount() {
    if (!(this.props.isEditFlag || this.props.isViewMode)) {
      this.props.fetchCityDataAPI(0, () => { })
      this.props.fetchStateDataAPI(0, () => { })
    }
  }

  /**
  * @method getDetails
  * @description Used to cancel modal
  */
  getDetails = () => {
    const { isEditFlag, ID } = this.props;
    if (isEditFlag) {
      this.setState({
        isLoader: true,
        PlantId: ID,
      })
      this.props.getPlantUnitAPI(ID, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToCheck: Data })
          if (!(this.props.isEditFlag || this.props.isViewMode)) {
            this.props.fetchStateDataAPI(Data.CountryId, () => { })
            this.props.fetchCityDataAPI(Data.StateId, () => { })
          }
          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              // isLoader: false,
              country: Data.CountryName !== undefined ? { label: Data.CountryName, value: Data.CountryId } : [],
              state: Data.StateName !== undefined ? { label: Data.StateName, value: Data.StateId } : [],
              city: Data.CityName !== undefined ? { label: Data.CityName, value: Data.CityIdRef } : [],
              company: Data.CompanyName !== undefined ? { label: `${Data.CompanyName}${Data.CompanyCode ? ` (${Data.CompanyCode})` : ''}`, value: Data.CompanyId } : []
            }, () => this.setState({ isLoader: false }))
          }, 500)
        }
      })
    } else {
      this.props.getPlantUnitAPI('', res => { })
    }
  }


  /**
  * @method selectType
  * @description Used show listing of unit of measurement
  */
  selectType = (label) => {
    const { countryList, stateList, cityList, companySelectList } = this.props;
    const temp = [];

    if (label === 'country') {
      countryList && countryList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'state') {
      stateList && stateList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
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
    if (label === 'Company') {
      companySelectList && companySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp
    }

  }

  getAllCityData = () => {
    const { country } = this.state;
    if (country && country.label !== 'India') {
      this.props.getCityByCountryAction(country.value, '00000000000000000000000000000000', '', () => { })
    } else {
      this.props.fetchStateDataAPI(country.value, () => { })
    }
  }

  /**
  * @method countryHandler
  * @description Used to handle country
  */
  countryHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ country: newValue, state: [], city: [] }, () => {
        this.props.change('ZipCode', '')
        this.getAllCityData()
      });
    } else {
      this.setState({ country: [], state: [], city: [] })
      this.props.change('ZipCode', '')
      this.props.fetchStateDataAPI(0, () => { })
    }
    this.setState({ DropdownChanged: false })
  };

  /**
  * @method stateHandler
  * @description Used to handle state
  */
  stateHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ state: newValue, city: [], }, () => {
        this.props.change('ZipCode', '')
        const { state } = this.state;
        this.props.fetchCityDataAPI(state.value, () => { })
      });
    } else {
      this.setState({ state: [], city: [] });
      this.props.change('ZipCode', '')
      this.props.fetchCityDataAPI(0, () => { })
    }

  };

  /**
  * @method cityHandler
  * @description Used to handle City
  */
  cityHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ city: newValue });
      this.props.change('ZipCode', '')
    } else {
      this.setState({ city: [] });
      this.props.change('ZipCode', '')
    }
    this.setState({ DropdownChanged: false })
  };

  /**
 * @method cancel
 * @description used to Reset form
 */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      country: [],
      state: [],
      city: [],
      PlantId: '',
    })
    this.props.getPlantUnitAPI('', res => { })
    this.toggleDrawer('', type)
  }
  cancelHandler = () => {
    // this.setState({ showPopup: true })
    this.cancel('cancel')
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }

  closePopUp = () => {
    this.setState({ showPopup: false, showPopupOnCompanyChange: false })
  }

  onPopupConfirmCompanyChange = () => {
    this.setState({ showPopupOnCompanyChange: false })
    this.onSubmit()
  }
  toggleDrawer = (event, type) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', type)
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce(this.props.handleSubmit((values) => {
    const { city, PlantId, company, DataToCheck, DropdownChanged } = this.state;
    const { isEditFlag, } = this.props;
    const userDetail = userDetails();
    if (isEditFlag) {

      if (DropdownChanged && DataToCheck?.PlantName === values?.PlantName && DataToCheck?.PhoneNumber === values?.PhoneNumber &&
        DataToCheck?.Extension === values?.Extension && DataToCheck?.AddressLine1 === values?.AddressLine1 &&
        DataToCheck?.AddressLine2 === values?.AddressLine2 && DataToCheck?.ZipCode === values?.ZipCode) {

        this.toggleDrawer('', 'cancel')
        return false
      }

      this.setState({ isSubmitted: true, setDisable: true });
      let updateData = {
        PlantId: PlantId,
        CreatedDate: '',
        CityName: city.label || '',
        IsActive: true,
        ModifiedBy: loggedInUserId(),
        PlantName: values?.PlantName || '',
        PlantCode: values?.PlantCode || '',
        IsVendor: false,
        AddressLine1: values?.AddressLine1 ? values?.AddressLine1.trim() : values?.AddressLine1 || '',
        AddressLine2: values?.AddressLine2 ? values?.AddressLine2.trim() : values?.AddressLine2 || '',
        ZipCode: values?.ZipCode || '',
        PhoneNumber: values?.PhoneNumber || '',
        Extension: values?.Extension || '',
        CreatedByUserId: loggedInUserId(),
        CityId: city.value || '',
        EVendorType: 0,
        VendorId: userDetail.ZBCSupplierInfo.VendorId || '',
        CompanyId: company.value || '',
        CostingTypeId: ZBCTypeId
      }
      this.props.updatePlantAPI(PlantId, updateData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          Toaster.success(MESSAGES.UPDATE_PLANT_SUCESS);
          this.cancel('submit')
        }
      });

    } else {

      this.setState({ setDisable: true })
      let formData = {
        PlantName: values?.PlantName,
        PlantCode: values?.PlantCode,
        IsVendor: false,
        AddressLine1: values?.AddressLine1 ? values?.AddressLine1.trim() : values?.AddressLine1 || '',
        AddressLine2: values?.AddressLine2 ? values?.AddressLine2.trim() : values?.AddressLine2 || '',
        ZipCode: values?.ZipCode || '',
        PhoneNumber: values?.PhoneNumber || '',
        Extension: values?.Extension || '',
        CreatedByUserId: loggedInUserId(),
        CityId: city.value || '',
        EVendorType: 0,
        VendorId: userDetail.ZBCSupplierInfo.VendorId || '',
        CompanyId: company.value || '',
        CostingTypeId: ZBCTypeId
      }
      this.props.createPlantAPI(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result === true) {
          Toaster.success(MESSAGES.PLANT_ADDED_SUCCESS);
          this.cancel('submit')
        }
      });
    }
  }), 500)

  handleCompanyChange = (value) => {
    if (value && value !== '') {
      this.setState({ company: value })
    } else {
      this.setState({ company: [] })
    }
    if (Number(value.value) !== Number(this.state.DataToCheck?.CompanyId)) {
      this.setState({ isCompanyChanged: true })
    } else {
      this.setState({ isCompanyChanged: false })
    }
    this.setState({ DropdownChanged: false })
  }
  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  checkCompanyChange = () => {
    if (this.state.isCompanyChanged) {
      this.setState({ showPopupOnCompanyChange: true })
    } else {
      this.onSubmit()
    }
  }
  /**
  * @method render
  * @description Renders the component
  */
  render() {

    const { isEditFlag, t } = this.props;
    const { country, isViewMode, setDisable } = this.state;
    return (
      <>
        <Drawer
          anchor={this.props.anchor}
          open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          {this.state.isLoader && <LoaderCustom />}
          <Container>
            <div className={"drawer-wrapper drawer-700px"}>
              <form
                noValidate
                className="form"
                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
              >
                <Row className="drawer-heading">
                  <Col>
                    <div className={"header-wrapper left"}>
                      <h3>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} ZBC Plant
                        {!isViewMode && <TourWrapper
                          buttonSpecificProp={{ id: "Add_Zbc_Plant_Form" }}
                          stepsSpecificProp={{
                            steps: Steps(t, { isEditFlag: isEditFlag }).Add_ZBCPlant_FORM
                          }} />}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => this.toggleDrawer(e)}
                      className={"close-button right"}
                    ></div>
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      label={`Plant Name`}
                      name={"PlantName"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[required, hashValidation, alphaNumeric, maxLength71, checkWhiteSpaces, checkSpacesInString]}
                      component={renderText}
                      required={true}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label={`Plant Code`}
                      name={"PlantCode"}
                      type="text"
                      placeholder={isEditFlag ? '-' : "Enter"}
                      validate={this.props.initialConfiguration.IsPlantCodeInteger ? [required, hashValidation, checkWhiteSpaces, checkSpacesInString, postiveNumberForPlantCode, maxLength4] : [required, hashValidation, acceptAllExceptSingleSpecialCharacter, alphaneumericSpecialAccept, maxLength25, checkWhiteSpaces, checkSpacesInString]}
                      component={renderText}
                      required={true}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>
                </Row>
                <Row className="pl-3">
                  {
                    this.props.initialConfiguration.IsCompanyConfigureOnPlant &&
                    <Col md="6">
                      <Field
                        name="CompanyName"
                        type="text"
                        label={`${handleDepartmentHeader()} (Code)`}
                        component={searchableSelect}
                        placeholder={isViewMode ? '-' : "Select"}
                        options={this.selectType("Company")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
                        disabled={isViewMode}
                        validate={
                          this.state.company == null ||
                            this.state.company.length === 0
                            ? []
                            : []
                        }
                        required={false}
                        handleChangeDescription={this.handleCompanyChange}
                        valueDescription={this.state.company}
                      />
                    </Col>
                  }
                  <Col md="6">
                    <Row>
                      <Col className="Phone phoneNumber" md="8">
                        <Field
                          label="Phone Number"
                          name={"PhoneNumber"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Enter"}
                          validate={[postiveNumber, minLength10, maxLength12, checkWhiteSpaces, number]}
                          component={renderTextInputField}
                          maxLength={12}
                          className=""
                          customClassName={"withBorder"}
                          disabled={isViewMode}
                        />
                      </Col>
                      <Col className="Ext phoneNumber pr-0" md="4">
                        <Field
                          label="Ext."
                          name={"Extension"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Enter"}
                          validate={[postiveNumber, maxLength5, checkWhiteSpaces, number]}
                          component={renderTextInputField}
                          maxLength={5}
                          className=""
                          customClassName={"withBorder"}
                          disabled={isViewMode}
                        />
                      </Col>
                    </Row>
                  </Col>

                  <Col md="6">
                    <Field
                      label="Address 1"
                      name={"AddressLine1"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, hashValidation, maxLength80]}
                      component={renderText}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label="Address 2"
                      name={"AddressLine2"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, hashValidation, maxLength80]}
                      component={renderText}
                      //required={true}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>

                  <Col md="6">
                    <Field
                      name="CountryId"
                      type="text"
                      label="Country"
                      component={searchableSelect}
                      placeholder={"Select"}
                      options={this.selectType("country")}
                      disabled={isEditFlag ? true : false}
                      validate={
                        this.state.country == null ||
                          this.state.country.length === 0
                          ? [required]
                          : []
                      }
                      required={true}
                      handleChangeDescription={this.countryHandler}
                      valueDescription={this.state.country}
                    />
                  </Col>
                  {(country.length === 0 || country.label === "India") && (
                    <Col md="6">
                      <Field
                        name="StateId"
                        type="text"
                        label="State"
                        component={searchableSelect}
                        placeholder={isViewMode ? '-' : "Select"}
                        options={this.selectType("state")}
                        disabled={isEditFlag ? true : false}
                        validate={
                          this.state.state == null ||
                            this.state.state.length === 0
                            ? [required]
                            : []
                        }
                        required={true}
                        handleChangeDescription={this.stateHandler}
                        valueDescription={this.state.state}
                      />
                    </Col>
                  )}

                  <Col md="6">
                    <Field
                      name="CityId"
                      type="text"
                      label="City"
                      component={searchableSelect}
                      placeholder={isViewMode ? '-' : "Select"}
                      options={this.selectType("city")}
                      disabled={isEditFlag ? true : false}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
                      validate={
                        this.state.city == null ||
                          this.state.city.length === 0
                          ? [required]
                          : []
                      }
                      required={true}
                      handleChangeDescription={this.cityHandler}
                      valueDescription={this.state.city}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label="ZipCode"
                      name={"ZipCode"}
                      type="text"
                      placeholder={isViewMode ? '-' : "Enter"}
                      validate={[required, postiveNumber, maxLength6]}
                      component={renderText}
                      required={true}
                      maxLength={6}
                      className=""
                      customClassName={"withBorder"}
                      disabled={isViewMode}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right pr-3">
                    <button
                      type={"button"}
                      id="AddZBCPlantRate_Cancel"
                      className=" mr15 cancel-btn"
                      onClick={this.cancelHandler}
                      disabled={setDisable}
                    >
                      <div className={"cancel-icon"}></div>
                      {"Cancel"}
                    </button>
                    {!isViewMode &&
                      <button
                        type="button"
                        id="AddZBCPlantRate_Save"
                        onClick={isEditFlag ? this.checkCompanyChange : this.onSubmit}
                        className="user-btn save-btn"
                        disabled={isViewMode || setDisable}
                      >
                        <div className={"save-icon"}></div>
                        {isEditFlag ? "Update" : "Save"}
                      </button>}
                  </div>
                </Row>
              </form>
            </div>
          </Container>
        </Drawer>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
        }
        {this.state.showPopupOnCompanyChange && this.props.initialConfiguration.IsCompanyConfigureOnPlant && <PopupMsgWrapper isOpen={this.state.showPopupOnCompanyChange} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirmCompanyChange}
          message={
            <>
              The plant's company has been changed, data for this plant will be visible under the new company. <br />
              Do you still want to change the plant's company?
            </>
          } />}
      </>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, plant, auth }) {
  const { countryList, stateList, cityList } = comman;
  const { plantUnitDetail, companySelectList } = plant;
  const { initialConfiguration } = auth

  let initialValues = {};
  if (plantUnitDetail && plantUnitDetail !== undefined) {
    initialValues = {
      PlantName: plantUnitDetail?.PlantName || '',
      PlantCode: plantUnitDetail?.PlantCode || '',
      PhoneNumber: plantUnitDetail?.PhoneNumber || '',
      Extension: plantUnitDetail?.Extension || '',
      AddressLine1: plantUnitDetail?.AddressLine1 || '',
      AddressLine2: plantUnitDetail?.AddressLine2 || '',
      ZipCode: plantUnitDetail?.ZipCode || '',
    }
  }
  return { countryList, stateList, cityList, initialValues, plantUnitDetail, initialConfiguration, companySelectList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createPlantAPI,
  fetchCountryDataAPI,
  fetchStateDataAPI,
  fetchCityDataAPI,
  getPlantUnitAPI,
  fetchSupplierCityDataAPI,
  updatePlantAPI,
  getCityByCountryAction,
  getComapanySelectList
})(reduxForm({
  form: 'AddZBCPlant',
  validate: validateForm,
  enableReinitialize: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
})(withTranslation(['PlantMaster'])(AddZBCPlant)),
)
