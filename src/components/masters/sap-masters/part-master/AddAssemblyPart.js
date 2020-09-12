import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col } from 'reactstrap';
import { required, number, maxLength6, maxLength10, maxLength100 } from "../../../../helper/validation";
import { userDetails, loggedInUserId } from "../../../../helper/auth";
import { renderText, renderTextAreaField, searchableSelect, renderMultiSelectField } from "../../../layout/FormInputs";
import { getPlantSelectList, } from '../../../../actions/master/Comman';
import { getRawMaterialNameChild, } from '../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import AssemblyPartListing from "./AssemblyPartListing";
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddChildDrawer from './AddChildDrawer';

class AddAssemblyPart extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isEditFlag: false,
            isLoader: false,
            PartId: '',
            isShowForm: false,

            RawMaterial: [],
            selectedPlants: [],
            effectiveDate: '',
            remarks: '',

            isOpenChildDrawer: false,
        }
    }

    /**
    * @method componentDidMount
    * @description 
    */
    componentDidMount() {
        this.props.getRawMaterialNameChild(() => { })
        this.props.getPlantSelectList(() => { })
    }

    /**
    * @method getDetails
    * @description 
    */
    getDetails = (data) => {
        // if (data && data.isEditFlag) {
        //     this.setState({
        //         isEditFlag: false,
        //         isLoader: true,
        //         isShowForm: true,
        //         PartId: data.Id,
        //     })
        //     if (data.passwordFlag == false) {
        //         $('html, body').animate({ scrollTop: 0 }, 'slow');
        //     }
        //     this.props.getPlantUnitAPI(data.Id, true, res => {
        //         if (res && res.data && res.data.Result) {

        //             const Data = res.data.Data;

        //             this.props.fetchStateDataAPI(Data.CountryId, () => { })
        //             this.props.fetchCityDataAPI(Data.StateId, () => { })

        //             setTimeout(() => {
        //                 const { countryList, stateList, cityList } = this.props;

        //                 const CountryObj = countryList && countryList.find(item => item.Value == Data.CountryId)
        //                 const StateObj = stateList && stateList.find(item => item.Value == Data.StateId)
        //                 const CityObj = cityList && cityList.find(item => item.Value == Data.CityIdRef)

        //                 this.setState({
        //                     isEditFlag: true,
        //                     isLoader: false,
        //                     country: { label: CountryObj.Text, value: CountryObj.Value },
        //                     state: { label: StateObj.Text, value: StateObj.Value },
        //                     city: { label: CityObj.Text, value: CityObj.Value },
        //                 })
        //             }, 500)
        //         }
        //     })
        // } else {
        //     this.props.getPlantUnitAPI('', false, res => { })
        // }
    }

    /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RawMaterial: newValue });
        } else {
            this.setState({ RawMaterial: [], });
        }
    }

    /**
    * @method handlePlant
    * @description Used handle plants
    */
    handlePlant = (e) => {
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

    childDrawerToggle = () => {
        this.setState({ isOpenChildDrawer: true })
    }

    closeChildDrawer = (e = '') => {
        this.setState({ isOpenChildDrawer: false })
    }

    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { rawMaterialNameSelectList, plantSelectList } = this.props;
        const temp = [];
        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }

    }

    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        //this.props.getPlantUnitAPI('', false, res => { })
        this.setState({
            isEditFlag: false,
            isShowForm: false,
        })
        this.props.hideForm()
    }

    formToggle = () => {
        this.setState({ isShowForm: !this.state.isShowForm })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { country, state, city, PlantId, isEditFlag } = this.state;
        const { reset } = this.props;
        const userDetail = userDetails();

        if (isEditFlag) {
            this.setState({ isSubmitted: true });
            let updateData = {

            }
            // this.props.updatePlantAPI(PlantId, updateData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_PLANT_SUCESS);
            //         reset();
            //         this.child.getUpdatedData();
            //     }
            // });

        } else {

            let formData = {

            }

            // this.props.createPlantAPI(formData, (res) => {
            //     if (res.data.Result === true) {
            //         toastr.success(MESSAGES.PLANT_ADDED_SUCCESS);
            //         reset();
            //         this.child.getUpdatedData();
            //     }
            // });
        }
    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset } = this.props;
        const { isEditFlag, isOpenChildDrawer, } = this.state;
        return (
            <>

                <div className="login-container signup-form">
                    <Row>
                        <Col md="12">
                            <div className="shadow-lgg login-formg">
                                <Row>
                                    <Col md="6">
                                        <div className="form-heading mb-0">
                                            <h2>{this.state.isEditFlag ? 'Update Assembly Part' : 'Add  Assembly Part'}</h2>
                                        </div>
                                    </Col>
                                </Row>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row>
                                        <Col md="12">
                                            <div className="left-border">
                                                {'Assembly Details:'}
                                            </div>
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`BOM No.`}
                                                name={"BOMNumber"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Assembly Part No.`}
                                                name={"AssemblyPartNumber"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Assembly Name`}
                                                name={"AssemblyPartName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Description`}
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>

                                    </Row>

                                    <Row>
                                        <Col md="3">
                                            <Field
                                                label={`ECN No.`}
                                                name={"ECNNumber"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Revision No.`}
                                                name={"RevisionNumber"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Drawing No.`}
                                                name={"DrawingNumber"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <Field
                                                label={`Group Code`}
                                                name={"GroupCode"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=""
                                                customClassName={'withBorder'}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md='3'>
                                            <Field
                                                name="RawMaterialId"
                                                type="text"
                                                label={'RM Material'}
                                                component={searchableSelect}
                                                placeholder={'Raw Material'}
                                                options={this.renderListing('material')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleRMChange}
                                                valueDescription={this.state.RawMaterial}
                                            />
                                        </Col>
                                        <Col md='3'>
                                            <Field
                                                label="Plant"
                                                name="Plant"
                                                placeholder="--Select--"
                                                selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                                options={this.renderListing('plant')}
                                                selectionChanged={this.handlePlant}
                                                optionValue={option => option.Value}
                                                optionLabel={option => option.Text}
                                                component={renderMultiSelectField}
                                                mendatory={true}
                                                className="multiselect-with-border"
                                            //disabled={isEditFlag ? true : false}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <div className="form-group">
                                                <label>
                                                    Effective Date
                                                            <span className="asterisk-required">*</span>
                                                </label>
                                                <div className="inputbox date-section">
                                                    <DatePicker
                                                        name="EffectiveDate"
                                                        selected={this.state.effectiveDate}
                                                        onChange={this.handleEffectiveDateChange}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="dd/MM/yyyy"
                                                        //maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select date"
                                                        className="withBorder"
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md="3">
                                            <button
                                                type="button"
                                                className={'user-btn mt30'}
                                                onClick={this.childDrawerToggle}>
                                                <div className={'plus'}></div>ADD Child</button>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="12">
                                            <div className="left-border">
                                                {'Remarks & Attachment'}
                                            </div>
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={'Remarks'}
                                                name={`Remark`}
                                                placeholder="Type here..."
                                                value={this.state.remarks}
                                                className=""
                                                customClassName=" textAreaWithBorder"
                                                onChange={this.handleMessageChange}
                                                validate={[required, maxLength100]}
                                                required={true}
                                                component={renderTextAreaField}
                                                maxLength="5000"
                                            />
                                        </Col>
                                        <Col md="6">

                                        </Col>
                                    </Row>

                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
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
                        </Col>

                    </Row>
                </div>
                {/* <AssemblyPartListing
                        onRef={ref => (this.child = ref)}
                        getDetails={this.getDetails}
                        formToggle={this.formToggle}
                        isShowForm={this.state.isShowForm}
                    /> */}

                {isOpenChildDrawer && <AddChildDrawer
                    isOpen={isOpenChildDrawer}
                    closeDrawer={this.closeChildDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material, comman, part }) {

    const { rawMaterialNameSelectList } = material;
    const { plantSelectList } = comman;
    const { } = part;

    return { rawMaterialNameSelectList, plantSelectList }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getRawMaterialNameChild,
    getPlantSelectList,
})(reduxForm({
    form: 'AddAssemblyPart',
    enableReinitialize: true,
})(AddAssemblyPart));
