import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField } from "../../../layout/FormInputs";
import { createFuelDetailAPI, getFuelDetailAPI, getFuelDetailUnitAPI } from '../../../../actions/master/Fuel';
import { fetchFuelComboAPI, fetchMasterDataAPI } from '../../../../actions/master/Comman'
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { loggedInUserId } from "../../../../helper/auth";

class AddFuelDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            startDate: '',
            endDate: ''
        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    componentWillMount() {
        this.props.fetchFuelComboAPI(res => { });
        this.props.fetchMasterDataAPI(res => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { fuelId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getFuelDetailUnitAPI(fuelId, true, res => {
                const { fuelUnitData } = this.props;
                this.setState({
                    startDate: new Date(fuelUnitData.ValidDateFrom),
                    endDate: new Date(fuelUnitData.ValidDateTo)
                })
            })
        } else {
            this.props.getFuelDetailUnitAPI('', false, res => { })
        }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }

    /**
    * @method handleTypeOfListingChange
    * @description  used to handle type of listing selection
    */
    handleTypeOfListingChange = (e) => {
        this.setState({
            typeOfListing: e
        })
    }

    /**
    * @method handleChange
    * @description Handle user data
    */
    handleChange = (date) => {
        this.setState({
            startDate: date,
        });
    };
    /**
   * @method handleChange
   * @description Handle user data
   */
    handleEndDateChange = (date) => {
        this.setState({
            endDate: date,
        });
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { startDate, endDate } = this.state;

        let loginUserId = loggedInUserId();

        const formData = {
            Rate: values.Rate,
            StateId: values.StateId,
            FuelId: values.FuelId,
            UnitOfMeasurementId: values.UnitOfMeasurementId,
            ValidDateFrom: startDate,
            ValidDateTo: endDate,
            Description: values.Description
        }
        /** Add new detail of Fuel  */
        this.props.createFuelDetailAPI(formData, (response) => {
            if (response && response.data) {
                if (response && response.data && response.data.Result) {
                    toastr.success(MESSAGES.FUEL_DETAIL_ADD_SUCCESS);
                    this.props.getFuelDetailAPI(res => { });
                    this.toggleModel();
                } else {
                    toastr.error(response.data.Message);
                }
            }
        });
    }

    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    selectMaterialType = (label) => {
        const { uniOfMeasurementList, stateList, fuelList } = this.props;
        const temp = [];
        if (label === 'state') {
            stateList && stateList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'uom') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'fuel') {
            fuelList && fuelList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset, pristine, submitting } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update fuel detail' : 'Add fuel detail'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Rate"
                                                name={"Rate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="State"
                                                name={"StateId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.selectMaterialType('state')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Fuel"
                                                name={"FuelId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.selectMaterialType('fuel')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Unit Of Measurement"
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.selectMaterialType('uom')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Date From
                                                    <span className="asterisk-required">*</span>
                                                </label>
                                                <div className="inputbox date-section">
                                                    <DatePicker
                                                        name="ValidDateFrom"
                                                        selected={this.state.startDate}
                                                        onChange={this.handleChange}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="MM/dd/yyyy"
                                                        maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select start date"
                                                        className="withoutBorder"
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>
                                                    Date To
                                                    <span className="asterisk-required">*</span>
                                                </label>
                                                <div className="inputbox date-section">
                                                    <DatePicker
                                                        name="ValidDateTo"
                                                        selected={this.state.endDate}
                                                        onChange={this.handleEndDateChange}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="MM/dd/yyyy"
                                                        maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select end date"
                                                        className="withoutBorder"
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                    />
                                                </div>
                                            </div>
                                        </div>


                                        <Row />

                                        <Row />
                                        {/* <Col md="12">
                                            <Field
                                                label="Description"
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col> */}
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
                                            {!isEditFlag &&
                                                <button
                                                    type={'button'}
                                                    className="btn btn-secondary"
                                                    disabled={pristine || submitting}
                                                    onClick={reset} >
                                                    {'Reset'}
                                                </button>}
                                        </div>
                                    </Row>
                                </form>
                            </Container>
                        </Row>
                    </ModalBody>
                </Modal>
            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, fuel }) {
    const { stateList, fuelList, uniOfMeasurementList } = comman;
    const { fuelUnitData } = fuel;
    console.log("fuelUnitData >> ", new Date(), fuelUnitData)
    let initialValues = {};
    if (fuelUnitData && fuelUnitData !== undefined) {
        console.log("date", moment(fuelUnitData.ValidDateTo).format('llll'))
        initialValues = {
            Rate: fuelUnitData.Rate,
            Description: fuelUnitData.Description,
            //ValidDateTo: fuelUnitData.ValidDateTo,
            //ValidDateFrom: fuelUnitData.ValidDateFrom,
            StateId: fuelUnitData.StateId,
            FuelId: fuelUnitData.FuelId,
            UnitOfMeasurementId: fuelUnitData.UnitOfMeasurementId,
        }
    }
    return { stateList, fuelList, uniOfMeasurementList, fuelUnitData, initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createFuelDetailAPI,
    fetchFuelComboAPI,
    fetchMasterDataAPI,
    getFuelDetailAPI,
    getFuelDetailUnitAPI
})(reduxForm({
    form: 'AddFuelDetail',
    enableReinitialize: true,
})(AddFuelDetail));
