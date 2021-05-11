import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, number, maxLength6, alphaNumeric, maxLength80, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength15, postiveNumber, maxLength10, maxLength3, } from "../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../helper/auth";
import { renderText, searchableSelect } from "../../layout/FormInputs";
import { createPlantAPI, getPlantUnitAPI, updatePlantAPI, getComapanySelectList } from '../actions/Plant';
import {
  fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, fetchSupplierCityDataAPI,
  getCityByCountry,
} from '../../../actions/Common';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import Drawer from '@material-ui/core/Drawer';
import LoaderCustom from '../../common/LoaderCustom';

class AddZBCPlant extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      isEditFlag: false,
      isLoader: false,
      PlantId: '',
      city: [],
      country: [],
      state: [],
      company: [],
      DropdownChanged: true,
      DataToCheck: []
    }
  }

  /**
  * @method toggleModel
  * @description Used to cancel modal
  */
  componentDidMount() {
    this.props.fetchCountryDataAPI(() => { })
    this.props.getComapanySelectList(() => { })
    this.getDetails()

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
          this.props.fetchStateDataAPI(Data.CountryId, () => { })
          this.props.fetchCityDataAPI(Data.StateId, () => { })

          setTimeout(() => {
            const { countryList, stateList, cityList, companySelectList } = this.props;

            const CountryObj = countryList && countryList.find(item => Number(item.Value) === Data.CountryId)
            const StateObj = stateList && stateList.find(item => Number(item.Value) === Data.StateId)
            const CityObj = cityList && cityList.find(item => Number(item.Value) === Data.CityIdRef)
            const CompanyObj = companySelectList && companySelectList.find(item => Number(item.Value) === Data.CompanyId)
            this.setState({
              isEditFlag: true,
              // isLoader: false,
              country: CountryObj && CountryObj !== undefined ? { label: CountryObj.Text, value: CountryObj.Value } : [],
              state: StateObj && StateObj !== undefined ? { label: StateObj.Text, value: StateObj.Value } : [],
              city: CityObj && CityObj !== undefined ? { label: CityObj.Text, value: CityObj.Value } : [],
              company: CompanyObj && CompanyObj !== undefined ? { label: CompanyObj.Text, value: CompanyObj.Value } : []
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
      });
      return temp
    }

  }

  getAllCityData = () => {
    const { country } = this.state;
    if (country && country.label !== 'India') {
      this.props.getCityByCountry(country.value, '00000000000000000000000000000000', () => { })
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
        this.getAllCityData()
      });
    } else {
      this.setState({ country: [], state: [], city: [] })
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
        const { state } = this.state;
        this.props.fetchCityDataAPI(state.value, () => { })
      });
    } else {
      this.setState({ state: [], city: [] });
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
    } else {
      this.setState({ city: [] });
    }
    this.setState({ DropdownChanged: false })
  };

  /**
 * @method cancel
 * @description used to Reset form
 */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.setState({
      country: [],
      state: [],
      city: [],
      PlantId: '',
    })
    this.props.getPlantUnitAPI('', res => { })
    this.toggleDrawer('')
  }

  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('')
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { city, PlantId, company, DataToCheck, DropdownChanged } = this.state;
    const { isEditFlag, } = this.props;
    const userDetail = userDetails();

    if (isEditFlag) {

      if (DropdownChanged && DataToCheck.PlantName == values.PlantName && DataToCheck.PhoneNumber == values.PhoneNumber &&
        DataToCheck.Extension == values.Extension && DataToCheck.AddressLine1 == values.AddressLine1 &&
        DataToCheck.AddressLine2 == values.AddressLine2 && DataToCheck.ZipCode == values.ZipCode) {
        console.log('chaNGES')
        this.toggleDrawer('')
        return false
      }

      this.setState({ isSubmitted: true });
      let updateData = {
        PlantId: PlantId,
        CreatedDate: '',
        CityName: city.label,
        IsActive: true,
        ModifiedBy: loggedInUserId(),
        PlantName: values.PlantName,
        PlantCode: values.PlantCode,
        IsVendor: false,
        AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
        AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CreatedByUserId: loggedInUserId(),
        CityId: city.value,
        EVendorType: 0,
        VendorId: userDetail.ZBCSupplierInfo.VendorId,
        CompanyId: company.value
      }
      this.props.reset()
      this.props.updatePlantAPI(PlantId, updateData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.UPDATE_PLANT_SUCESS);
          this.cancel()
        }
      });

    } else {

      let formData = {
        PlantName: values.PlantName,
        PlantCode: values.PlantCode,
        IsVendor: false,
        AddressLine1: values.AddressLine1 ? values.AddressLine1.trim() : values.AddressLine1,
        AddressLine2: values.AddressLine2 ? values.AddressLine2.trim() : values.AddressLine2,
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CreatedByUserId: loggedInUserId(),
        CityId: city.value,
        EVendorType: 0,
        VendorId: userDetail.ZBCSupplierInfo.VendorId,
        CompanyId: company.value
      }

      this.props.reset()
      this.props.createPlantAPI(formData, (res) => {
        if (res.data.Result === true) {
          toastr.success(MESSAGES.PLANT_ADDED_SUCCESS);
          this.cancel()
        }
      });
    }
  }

  handleCompanyChange = (value) => {
    if (value && value !== '') {
      this.setState({ company: value })
    } else {
      this.setState({ company: [] })
    }
    this.setState({ DropdownChanged: false })
  }
  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isEditFlag } = this.props;
    const { country } = this.state;
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
                onSubmit={handleSubmit(this.onSubmit.bind(this))}
                onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
              >
                <Row className="drawer-heading">
                  <Col>
                    <div className={"header-wrapper left"}>
                      <h3>
                        {isEditFlag ? "Update ZBC Plant" : "Add ZBC Plant"}
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
                      placeholder={""}
                      validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces]}
                      component={renderText}
                      required={true}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label={`Plant Code`}
                      name={"PlantCode"}
                      type="text"
                      placeholder={""}
                      validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength15]}
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
                        label="Company Name"
                        component={searchableSelect}
                        placeholder={"Select"}
                        options={this.selectType("Company")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
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
                          placeholder={""}
                          validate={[postiveNumber, maxLength10, checkWhiteSpaces]}
                          component={renderText}
                          //  required={true}
                          maxLength={10}
                          className=""
                          customClassName={"withBorder"}
                        />
                      </Col>
                      <Col className="Ext phoneNumber pr-0" md="4">
                        <Field
                          label="Ext."
                          name={"Extension"}
                          type="text"
                          placeholder={""}
                          validate={[postiveNumber, maxLength3, checkWhiteSpaces]}
                          component={renderText}
                          // required={true}
                          maxLength={3}
                          className=""
                          customClassName={"withBorder"}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      label="Address 1"
                      name={"AddressLine1"}
                      type="text"
                      placeholder={""}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                      component={renderText}
                      // required={true}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                  <Col md="6">
                    <Field
                      label="Address 2"
                      name={"AddressLine2"}
                      type="text"
                      placeholder={""}
                      validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                      component={renderText}
                      //required={true}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                </Row>
                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      name="CountryId"
                      type="text"
                      label="Country"
                      component={searchableSelect}
                      placeholder={"Select"}
                      options={this.selectType("country")}
                      //onKeyUp={(e) => this.changeItemDesc(e)}
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
                        placeholder={"Select"}
                        options={this.selectType("state")}
                        //onKeyUp={(e) => this.changeItemDesc(e)}
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
                </Row>

                <Row className="pl-3">
                  <Col md="6">
                    <Field
                      name="CityId"
                      type="text"
                      label="City"
                      component={searchableSelect}
                      placeholder={"Select"}
                      options={this.selectType("city")}
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
                      placeholder={""}
                      validate={[required, postiveNumber, maxLength6, checkWhiteSpaces]}
                      component={renderText}
                      required={true}
                      maxLength={6}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right pr-3">
                    <button
                      type={"button"}
                      className=" mr15 cancel-btn"
                      onClick={this.cancel}
                    >
                      <div className={"cross-icon"}>
                        <img
                          src={require("../../../assests/images/times.png")}
                          alt="cancel-icon.jpg"
                        />
                      </div>{" "}
                      {"Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="user-btn save-btn"
                    >
                      <div className={"check-icon"}>
                        <img
                          src={require("../../../assests/images/check.png")}
                          alt="check-icon.jpg"
                        />
                      </div>{" "}
                      {isEditFlag ? "Update" : "Save"}
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </Container>
        </Drawer>
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
      PlantName: plantUnitDetail.PlantName,
      PlantCode: plantUnitDetail.PlantCode,
      PhoneNumber: plantUnitDetail.PhoneNumber,
      Extension: plantUnitDetail.Extension,
      AddressLine1: plantUnitDetail.AddressLine1,
      AddressLine2: plantUnitDetail.AddressLine2,
      ZipCode: plantUnitDetail.ZipCode,
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
  getCityByCountry,
  getComapanySelectList
})(reduxForm({
  form: 'AddZBCPlant',
  enableReinitialize: true,
})(AddZBCPlant));
