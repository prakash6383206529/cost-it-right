import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderNumberInputField, searchableSelect,
    renderMultiSelectField, renderTextAreaField, focusOnError,
} from "../../../layout/FormInputs";
import { getPowerTypeSelectList, } from '../../../../actions/master/Comman';
import { } from '../../../../actions/master/Material';
import axios from 'axios';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import Switch from "react-switch";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const selector = formValueSelector('AddPower');

class AddPower extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            PowerID: '',
            IsVendor: false,

            StateName: [],

            selectedPlants: [],
            effectiveDate: new Date(),

            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],

            UOM: [],
        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    componentWillMount() {


    }

    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        const { data } = this.props;
        this.getDetails(data);
        this.props.getPowerTypeSelectList(() => { })

    }

    /**
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = (data) => {
        // if (data && data.isEditFlag) {
        //     this.setState({
        //         isEditFlag: false,
        //         isLoader: true,
        //         isShowForm: true,
        //         RawMaterialID: data.Id,
        //     })
        //     $('html, body').animate({ scrollTop: 0 }, 'slow');
        //     this.props.getRawMaterialDetailsAPI(data, true, res => {
        //         if (res && res.data && res.data.Result) {

        //             const Data = res.data.Data;

        //             this.props.getVendorListByVendorType(Data.IsVendor, () => { })

        //             setTimeout(() => {
        //                 const { gradeSelectListByRMID, rmSpecification, cityList, categoryList,
        //                     filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList,
        //                     vendorListByVendorType } = this.props;

        //                 const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find(item => item.Value == Data.RawMaterial)


        //                 let plantArray = [];
        //                 Data && Data.Plant.map((item) => {
        //                     plantArray.push({ Text: item.PlantName, Value: item.PlantId })
        //                     return plantArray;
        //                 })

        //                 let tempArr = [];
        //                 let tempFiles = [];

        //                 this.setState({
        //                     isEditFlag: true,
        //                     isLoader: false,
        //                     isShowForm: true,
        //                     IsVendor: Data.IsVendor,
        //                     RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value },
        //                     effectiveDate: new Date(Data.EffectiveDate),
        //                     remarks: Data.Remark,
        //                 })
        //             }, 200)
        //         }
        //     })
        // } else {
        //     this.setState({
        //         isEditFlag: false,
        //         isLoader: false,
        //         RawMaterialID: '',
        //     })
        //     this.props.getRawMaterialDetailsAPI('', false, res => { })
        // }
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({
            IsVendor: !this.state.IsVendor,
            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],
        });
    }

    /**
    * @method handleState
    * @description called
    */
    handleState = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ StateName: newValue, })
        } else {
            this.setState({ StateName: [] })
        }
    };

    /**
    * @method handlePlants
    * @description Used handle Plants
    */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
   * @method handleChange
   * @description Handle Effective Date
   */
    handleEffectiveDateChange = (date) => {
        this.setState({
            effectiveDate: date,
        });
    };


    /**
    * @method handleSource
    * @description called
    */
    handleSource = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ source: newValue, })
        } else {
            this.setState({ source: [] })
        }
    };

    /**
    * @method handleUOM
    * @description called
    */
    handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ UOM: newValue, })
        } else {
            this.setState({ UOM: [] })
        }
    };

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { powerTypeSelectList } = this.props;
        const temp = [];
        // if (label === 'material') {
        //     rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
        //         if (item.Value == 0) return false;
        //         temp.push({ label: item.Text, value: item.Value })
        //     });
        //     return temp;
        // }

        if (label === 'Source') {
            powerTypeSelectList && powerTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            RawMaterial: [],
            remarks: '',
            isShowForm: false,
            isEditFlag: false,
            IsVendor: false,
        })
        //this.props.getRawMaterialDetailsAPI('', false, res => { })
        this.props.hideForm()
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.clearForm()
    }

    /**
    * @method resetForm
    * @description used to Reset form
    */
    resetForm = () => {
        this.clearForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { isEditFlag } = this.state;
        const { reset } = this.props;

        // let plantArray = [];
        // selectedPlants && selectedPlants.map((item) => {
        //     plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
        //     return plantArray;
        // })

        if (isEditFlag) {
            let requestData = {

            }
            // this.props.updateRMDomesticAPI(requestData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS);
            //         this.clearForm();
            //     }
            // })

        } else {

            const formData = {

            }

            // this.props.createRMDomestic(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS);
            //         this.clearForm();
            //     }
            // });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, pristine, submitting, } = this.props;
        const { files, errors, isOpenUOM, isEditFlag, source, } = this.state;

        const previewStyle = {
            display: 'inline',
            width: 100,
            height: 100,
        };

        return (
            <>
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg">
                                    <div className="row">
                                        <div className="col-md-6 mt-15">
                                            <div className="form-heading">
                                                <h2>{isEditFlag ? `Update Power` : `Add Power`}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>
                                            <Col md="4" className="switch mb15">
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Zero Based</div>
                                                    <Switch
                                                        onChange={this.onPressVendor}
                                                        checked={this.state.IsVendor}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>Vendor Based</div>
                                                </label>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" className="filter-block">
                                                <div className=" flex-fills mb-2">
                                                    <h5>{'Power For:'}</h5>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="state"
                                                            type="text"
                                                            label="State"
                                                            component={searchableSelect}
                                                            placeholder={'--- Select ---'}
                                                            options={this.renderListing('state')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.StateName == null || this.state.StateName.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleState}
                                                            valueDescription={this.state.StateName}
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label="Plant"
                                                            name="Plant"
                                                            placeholder="--Select--"
                                                            selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                                            options={this.renderListing('technology')}
                                                            selectionChanged={this.handlePlants}
                                                            optionValue={option => option.Value}
                                                            optionLabel={option => option.Text}
                                                            component={renderMultiSelectField}
                                                            mendatory={true}
                                                            className="multiselect-with-border"
                                                        //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>

                                        </Row>

                                        <Row>
                                            <Col md="12" className="filter-block">
                                                <div className=" flex-fills mb-2">
                                                    <h5>{'State Electricity Board Power Charges:'}</h5>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Min Demand kW/Month`}
                                                            name={"MinDemandKWPerMonth"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Demand Charges/kW (INR)`}
                                                            name={"DemandChargesPerKW"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Avg. Unit Consumption/Month`}
                                                            name={"AvgUnitConsumptionPerMonth"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Unit Consumption/Annum`}
                                                            name={"UnitConsumptionPerAnnum"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Max Demand Charges/kW (INR)`}
                                                            name={"MaxDemandChargesKW"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Cost/Unit`}
                                                            name={"CostPerUnit"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Meter Rent & Other Charges/Yr`}
                                                            name={"MeterRentAndOtherChargesPerAnnum"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Duty charges & FCA`}
                                                            name={"DutyChargesAndFCA"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Total Unit Charges`}
                                                            name={"TotalUnitCharges"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <div className="form-group">
                                                            <label>
                                                                Effective Date
                                                    {/* <span className="asterisk-required">*</span> */}
                                                            </label>
                                                            <div className="inputbox date-section">
                                                                <DatePicker
                                                                    name="EffectiveDate"
                                                                    selected={this.state.effectiveDate}
                                                                    onChange={this.handleEffectiveDateChange}
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dateFormat="dd/MM/yyyy"
                                                                    maxDate={new Date()}
                                                                    dropdownMode="select"
                                                                    placeholderText="Select date"
                                                                    className="withBorder"
                                                                    autoComplete={'off'}
                                                                    disabledKeyboardNavigation
                                                                    onChangeRaw={(e) => e.preventDefault()}
                                                                    disabled={false}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Power Contribution %`}
                                                            name={"PowerContributaionPersentage"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" className="filter-block">
                                                <div className=" flex-fills mb-2">
                                                    <h5>{'Self Generated Power Charges:'}</h5>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="Source"
                                                            type="text"
                                                            label="Source"
                                                            component={searchableSelect}
                                                            placeholder={'--- Select ---'}
                                                            options={this.renderListing('Source')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.source == null || this.state.source.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleSource}
                                                            valueDescription={this.state.source}
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Asset Cost (INR)`}
                                                            name={"AssetCost"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Annual Cost (INR)`}
                                                            name={"AnnualCost"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            {source && source.value == 'Wind Power' &&
                                                <>
                                                    <Col md="3">
                                                        <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                            <div className="fullinput-icon">
                                                                <Field
                                                                    name="UOM"
                                                                    type="text"
                                                                    label="UOM"
                                                                    component={searchableSelect}
                                                                    placeholder={'--- Select ---'}
                                                                    options={this.renderListing('UOM')}
                                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                                    validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                                                    required={true}
                                                                    handleChangeDescription={this.handleUOM}
                                                                    valueDescription={this.state.UOM}
                                                                    disabled={false}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md="3">
                                                        <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                            <div className="fullinput-icon">
                                                                <Field
                                                                    label={`Cost/UOM `}
                                                                    name={"CostPerUnitOfMeasurement"}
                                                                    type="text"
                                                                    placeholder={'Enter'}
                                                                    validate={[required]}
                                                                    component={renderNumberInputField}
                                                                    required={true}
                                                                    className=""
                                                                    customClassName=" withBorder"
                                                                    disabled={false}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md="3">
                                                        <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                            <div className="fullinput-icon">
                                                                <Field
                                                                    label={`Unit Generated/Unit Of fuel `}
                                                                    name={"UnitGeneratedPerUnitOfFuel"}
                                                                    type="text"
                                                                    placeholder={'Enter'}
                                                                    validate={[required]}
                                                                    component={renderNumberInputField}
                                                                    required={true}
                                                                    className=""
                                                                    customClassName=" withBorder"
                                                                    disabled={false}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </>}

                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Unit Generated/Annum`}
                                                            name={"UnitGeneratedPerAnnum"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Cost/Unit`}
                                                            name={"CostPerUnit"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={true}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            label={`Power contribution`}
                                                            name={"PowerContributionPercentage"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            validate={[required]}
                                                            component={renderNumberInputField}
                                                            required={true}
                                                            className=""
                                                            customClassName=" withBorder"
                                                            disabled={false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-12 text-right bluefooter-butn">
                                                <button
                                                    type={'button'}
                                                    className="reset mr15 cancel-btn"
                                                    onClick={this.cancel} >
                                                    {'Cancel'}
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="submit-button mr5 save-btn" >
                                                    {isEditFlag ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, } = state;
    const fieldsObj = selector(state, 'MinDemandKWPerMonth', 'DemandChargesPerKW', 'AvgUnitConsumptionPerMonth',
        'UnitConsumptionPerAnnum', 'MaxDemandChargesKW', 'CostPerUnit', 'MeterRentAndOtherChargesPerAnnum',
        'DutyChargesAndFCA', 'TotalUnitCharges', 'PowerContributaionPersentage');

    const { powerTypeSelectList, } = comman;

    let initialValues = {};
    // if (rawMaterialDetails && rawMaterialDetails != undefined) {
    //     initialValues = {
    //         Source: rawMaterialDetails.Source,
    //     }
    // }

    return { powerTypeSelectList, initialValues, fieldsObj, }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPowerTypeSelectList,
})(reduxForm({
    form: 'AddPower',
    enableReinitialize: true,
    onSubmitFail: errors => {
        console.log('errors', errors)
        focusOnError(errors);
    },
})(AddPower));
