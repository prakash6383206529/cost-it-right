import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Input, Label, Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText, searchableSelect } from "../../../layout/FormInputs";
import { createMachineAPI, getMachineDataAPI, updateMachineAPI } from '../../../../actions/master/MachineMaster';
import { getMachineTypeSelectList, fetchFuelComboAPI, getDepreciationTypeSelectList } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { userDetails, loggedInUserId } from '../../../../helper';

class AddMachine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            depreciation: [],
            MachineClass: [],
            labour: [],
            fuel: [],
            shift: [],
            effectiveDate: '',
            isActiveBox: false,
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentWillMount() {
        this.props.getMachineTypeSelectList(() => { })
        this.props.fetchFuelComboAPI(() => { })
        this.props.getDepreciationTypeSelectList(() => { })
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { machineId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getMachineDataAPI(machineId, res => { })
        } else {
            this.props.getMachineDataAPI('', res => { })
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
    * @method renderListing
    * @description Used show listing
    */
    renderListing = (label) => {
        const { MachineTypeSelectList, fuelList, DepreciationTypeSelectList } = this.props;
        const temp = [];

        if (label === 'class') {
            MachineTypeSelectList && MachineTypeSelectList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'fuel') {
            fuelList && fuelList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label == 'depreciation') {
            DepreciationTypeSelectList && DepreciationTypeSelectList.map(item => {
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method depreciationHandler
    * @description Used to handle depreciation
    */
    depreciationHandler = (newValue, actionMeta) => {
        this.setState({ depreciation: newValue });
    };

    /**
    * @method classHandler
    * @description Used to handle machine class
    */
    classHandler = (newValue, actionMeta) => {
        this.setState({ MachineClass: newValue });
    };

    /**
    * @method labourHandler
    * @description Used to handle labour
    */
    labourHandler = (newValue, actionMeta) => {
        this.setState({ labour: newValue });
    };

    /**
    * @method fuelHandler
    * @description Used to handle fuel
    */
    fuelHandler = (newValue, actionMeta) => {
        this.setState({ fuel: newValue });
    };

    /**
    * @method shiftHandler
    * @description Used to handle shift
    */
    shiftHandler = (newValue, actionMeta) => {
        this.setState({ shift: newValue });
    };

    /**
    * @method handleChange
    * @description Handle user data
    */
    handleEffectiveDate = (date) => {
        this.setState({
            effectiveDate: date,
        });
    };

    /**
    * @method activeHandler
    * @description Used to handle plant detail active or not
    */
    activeHandler = () => {
        this.setState({
            isActiveBox: !this.state.isActiveBox
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            //  isEditFlag: false,
            //   department: [],
            //   role: [],
            //   city: [],
        })
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { MachineClass, isActiveBox } = this.state;
        const { machineId, isEditFlag } = this.props;
        const userData = userDetails();

        if (isEditFlag) {
            let reqData = {
                MachineClassName: MachineClass.label,
                //PlantName: '',
                CreatedByName: loggedInUserId(),
                MachineId: machineId,
                MachineNumber: values.MachineNumber,
                MachineName: values.MachineName,
                Description: values.Description,
                //Make: '',
                MachineCapacity: values.MachineCapacity,
                //YearOfManufacturing: '',
                CostOfMachine: values.CostOfMachine,
                //CostOfAccessories: 0,
                TotalMachineCost: values.TotalMachineCost,
                PowerRating: values.PowerRating,
                UtilizationFactor: values.UtilizationFactor,
                //WorkingHourShift: '',
                //NumberOfWorkingDaysYear: '',
                //PlantId: '',
                CompanyId: userData.CompanyId,
                MachineClassId: MachineClass.value,
                IsOtherSource: true,
                IsActive: isActiveBox,
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                MachineTonnage: '',
            }
            this.props.updateMachineAPI(reqData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_LABOUR_SUCCESS);
                    this.toggleModel();
                }
            });

        } else {

            let formData = {
                MachineId: '',
                MachineNumber: values.MachineNumber,
                MachineName: values.MachineName,
                Description: values.Description,
                //Make: string,
                MachineCapacity: values.MachineCapacity,
                //YearOfManufacturing: string,
                CostOfMachine: values.CostOfMachine,
                //CostOfAccessories: 0,
                //TotalMachineCost: 0,
                PowerRating: values.PowerRating,
                UtilizationFactor: values.UtilizationFactor,
                //WorkingHourShift: string,
                //NumberOfWorkingDaysYear: string,
                //PlantId: '',
                CompanyId: userData.CompanyId,
                MachineClassId: MachineClass.value,
                IsOtherSource: true,
                IsActive: isActiveBox,
                CreatedBy: loggedInUserId(),
                CreatedDate: '',
                //MachineTonnage: string
            }

            this.props.createMachineAPI(formData, (res) => {
                if (res.data.Result == true) {
                    toastr.success(MESSAGES.MACHINE_ADD_SUCCESS);
                    this.toggleModel()
                }
            });

        }

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, reset } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Machine Details' : 'Add Machine Details'}</ModalHeader>
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
                                                label={`Machine Name`}
                                                name={"MachineName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Number`}
                                                name={"MachineNumber"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Description`}
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="MachineClass"
                                                type="text"
                                                label="Machine Class"
                                                component={searchableSelect}
                                                placeholder={'Select Machine Class'}
                                                options={this.renderListing('class')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.classHandler}
                                                valueDescription={this.state.MachineClass}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Labour Type`}
                                                name={"LabourType"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Capacity`}
                                                name={"MachineCapacity"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>

                                        {/* <Col md="6">
                                            <Field
                                                name="Labour"
                                                type="text"
                                                label="Labour Type"
                                                component={searchableSelect}
                                                placeholder={'Select Labour'}
                                                options={this.searchableSelectType('labour')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.labourHandler}
                                                valueDescription={this.state.labour}
                                            />
                                        </Col> */}
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                name="Fuel"
                                                type="text"
                                                label="Fuel Type"
                                                component={searchableSelect}
                                                placeholder={'Select Fuel'}
                                                options={this.renderListing('fuel')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.fuelHandler}
                                                valueDescription={this.state.fuel}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="MachineDepreciation"
                                                type="text"
                                                label="Machine Depreciation"
                                                component={searchableSelect}
                                                placeholder={'Select Depreciation'}
                                                options={this.renderListing('depreciation')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.depreciationHandler}
                                                valueDescription={this.state.depreciation}
                                            />
                                        </Col>
                                        {/* <Col md="6">
                                            <Field
                                                name="shift"
                                                type="text"
                                                label="Shift"
                                                component={searchableSelect}
                                                placeholder={'Select Shift'}
                                                options={this.searchableSelectType('shift')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.shiftHandler}
                                                valueDescription={this.state.shift}
                                            />
                                        </Col> */}
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Power Rating`}
                                                name={"PowerRating"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Consumable`}
                                                name={"UtilizationFactor"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Loan`}
                                                name={"Loan"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Cost`}
                                                name={"CostOfMachine"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Equity`}
                                                name={"Loan"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Rate of Machine`}
                                                name={"CostOfMachine"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>

                                    {/* <Row>
                                        <Col md="6">
                                            <div className="form-group">
                                                <label>
                                                    Effective Date
                                                </label>
                                                <div className="inputbox date-section">
                                                    <DatePicker
                                                        name="EffectiveDate"
                                                        selected={this.state.effectiveDate}
                                                        onChange={this.handleEffectiveDate}
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dateFormat="MM/dd/yyyy"
                                                        maxDate={new Date()}
                                                        dropdownMode="select"
                                                        placeholderText="Select Effective date"
                                                        className="withoutBorder"
                                                        autoComplete={'off'}
                                                        disabledKeyboardNavigation
                                                        onChangeRaw={(e) => e.preventDefault()}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Row> */}

                                    <Row>
                                        <Col md="4">
                                            <label
                                                className="custom-checkbox"
                                                onChange={this.activeHandler}
                                            >
                                                IsActive
                                                <input type="checkbox" disabled={false} checked={this.state.isActiveBox} />
                                                <span
                                                    className=" before-box"
                                                    checked={this.state.isActiveBox}
                                                    onChange={this.activeHandler}
                                                />
                                            </label>
                                        </Col>
                                    </Row>

                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Add'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={this.cancel} >
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
function mapStateToProps({ comman, machine }) {
    const { MachineTypeSelectList, fuelList, DepreciationTypeSelectList } = comman;
    let initialValues = {};
    // if(labourData && labourData !== undefined){
    //     initialValues = {
    //         LabourRate: labourData.LabourRate,
    //         LabourTypeId: labourData.LabourTypeId,
    //         PlantId: labourData.PlantId,
    //         TechnologyId: labourData.TechnologyId,
    //     }
    // }
    return { initialValues, MachineTypeSelectList, fuelList, DepreciationTypeSelectList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps,
    {
        getMachineTypeSelectList,
        fetchFuelComboAPI,
        getDepreciationTypeSelectList,
        createMachineAPI,
        getMachineDataAPI,
        updateMachineAPI,
    })(reduxForm({
        form: 'AddMachine',
        enableReinitialize: true,
    })(AddMachine));
