import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, } from 'reactstrap';
import { required, number, minLength10, maxLength12, maxLength6 } from "../../../helper/validation";
import { renderText, renderTextInputField, searchableSelect } from "../../layout/FormInputs";
import { createPlantAPI, } from '../actions/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, fetchSupplierCityDataAPI, getCityByCountryAction, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from "../../../helper/auth";
import Drawer from '@material-ui/core/Drawer';
import { labels } from '../../../helper/core';

class AddVendorPlantDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      country: [],
      state: [],
      city: [],
    }
  }

  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    this.props.fetchCountryDataAPI(() => { })
  }

  toggleDrawer = (event, formData) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.props.closeDrawer('', formData)
  };

  /**
  * @method handlePlantSelection
  * @description called
  */
  handlePlantSelection = e => {
    this.setState({ selectedPlants: e });
  };

  /**
  * @method handleVendorType
  * @description called
  */
  handleVendorType = (e) => {
    this.setState({ selectedVendorType: e });
  };

  /**
  * @method handleCityChange
  * @description  used to handle city selection
  */
  handleCityChange = (e) => {
    this.setState({
      CityId: e.target.value
    });
  }

  /**
  * @method getAllCityData
  * @description  GET ALL CITY ON BASIS OF COUNTRY
  */
  getAllCityData = () => {
    const { country } = this.state;
    if (country && country.label !== 'India') {
      this.props.getCityByCountryAction(country.value, '00000000000000000000000000000000','', () => { })
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
      this.setState({ country: [], state: [], city: [], })
    }
  };

  /**
  * @method stateHandler
  * @description Used to handle state
  */
  stateHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ state: newValue }, () => {
        const { state } = this.state;
        this.props.fetchCityDataAPI(state.value, () => { })
      });
    } else {
      this.setState({ state: [], city: [] });
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
  };


  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { countryList, stateList, cityList } = this.props;
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
  }

  /**
  * @method checkVendorType
  * @description Used to render listing of selected plants
  */
  checkVendorType = () => {
    const { selectedVendorType } = this.state;
    let isContent = selectedVendorType && selectedVendorType.find(item => {
      if (item.Text === 'BOP' || item.Text === 'RAW MATERIAL') {
        return true;
      }
      return false;
    })
    return (isContent == null || isContent === undefined) ? true : false;
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = () => {
    const { reset } = this.props;
    reset();
    this.toggleDrawer('')
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { city } = this.state;
    const { reset, VendorId, isEditFlag } = this.props;

    if (isEditFlag) {

    } else {
      let formData = {
        PlantName: values.PlantName,
        PlantCode: values.PlantCode,
        IsVendor: true,
        AddressLine1: values.AddressLine1,
        AddressLine2: values.AddressLine2,
        ZipCode: values.ZipCode,
        PhoneNumber: values.PhoneNumber,
        Extension: values.Extension,
        CreatedByUserId: loggedInUserId(),
        CityId: city.value,
        EVendorType: 0,
        VendorId: VendorId,
      }

      this.props.reset()
      this.props.createPlantAPI(formData, (res) => {
        if (res.data.Result === true) {
          Toaster.success(MESSAGES.PLANT_ADDED_SUCCESS);
          this.toggleDrawer('', formData)
          reset();
          this.setState({
            country: [],
            state: [],
            city: [],
          })
        }
      });
    }
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
    const { handleSubmit, isEditFlag, t} = this.props;
    const { country } = this.state;
    return (
      <div>
        <Drawer
          anchor={this.props.anchor}
          open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
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
                        {isEditFlag
                          ? `Update ${labels(t, 'VendorLabel', 'MasterLabels')} Plant`
                          : `Add ${labels(t, 'VendorLabel', 'MasterLabels')} Plant`}
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
                      validate={[required]}
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
                      //validate={[required]}
                      component={renderText}
                      //required={true}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                </Row>
                <Row className="pl-3">

                  <Col md="6">
                    <Row>
                      <Col className="Phone phoneNumber" md="8">
                        <Field
                          label="Phone Number"
                          name={"PhoneNumber"}
                          type="text"
                          placeholder={""}
                          validate={[required, number, minLength10, maxLength12]}
                          component={renderTextInputField}
                          required={true}
                          maxLength={12}
                          className=""
                          customClassName={"withBorder"}
                        />
                      </Col>
                      <Col className="Ext phoneNumber pr-0" md="4">
                        <Field
                          label="Ext"
                          name={"Extension"}
                          type="text"
                          placeholder={""}
                          validate={[required, number]}
                          component={renderTextInputField}
                          required={true}
                          maxLength={5}
                          className=""
                          customClassName={"withBorder"}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col md="6">
                    <Field
                      label="Address 1"
                      name={"AddressLine1"}
                      type="text"
                      placeholder={""}
                      validate={[required]}
                      component={renderText}
                      required={true}
                      maxLength={26}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                </Row>
                <Row className="pl-3">

                  <Col md="12">
                    <Field
                      label="Address 2"
                      name={"AddressLine2"}
                      type="text"
                      placeholder={""}
                      validate={[required]}
                      component={renderText}
                      required={true}
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
                      placeholder={"Select Country"}
                      options={this.renderListing("country")}
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
                        placeholder={"Select State"}
                        options={this.renderListing("state")}
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

                <Row className="pl-3"   >
                  <Col md="6">
                    <Field
                      name="CityId"
                      type="text"
                      label="City"
                      component={searchableSelect}
                      placeholder={"Select City"}
                      options={this.renderListing("city")}
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
                      validate={[required, number, maxLength6]}
                      component={renderText}
                      required={true}
                      //maxLength={6}
                      className=""
                      customClassName={"withBorder"}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12 text-right px-3">
                    <button
                      type={"button"}
                      className="reset mr15 cancel-btn"
                      onClick={this.cancel}
                    >
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="submit-button mr5 save-btn"
                    >
                      <div className={"save-icon"}></div>
                      {isEditFlag ? "Update" : "Save"}
                    </button>
                  </div>
                </Row>
              </form>
            </div>
          </Container>
        </Drawer>
      </div>
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, }) {
  const { countryList, stateList, cityList, } = comman;
  let initialValues = {};

  return { countryList, stateList, cityList, initialValues, }
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
  fetchSupplierCityDataAPI,
  getCityByCountryAction,
})(reduxForm({
  form: 'AddVendorPlantDrawer',
  enableReinitialize: true,
  touchOnChange: true
})(AddVendorPlantDrawer));
