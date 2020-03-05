import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Input, Label, Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText, searchableSelect } from "../../../layout/FormInputs";
import { createMachineAPI, getMachineDataAPI, updateMachineAPI, getMachineTypeDataAPI } from '../../../../actions/master/MachineMaster';
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
            this.props.getMachineDataAPI(machineId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    setTimeout(() => { this.getData(Data) }, 500)
                }
            })
        } else {
            this.props.getMachineDataAPI('', res => { })
        }
    }

    /**
    * @method getData
    * @description Used to get Data
    */
    getData = (Data) => {
        const { MachineTypeSelectList, fuelList, DepreciationTypeSelectList } = this.props;
        const machineObj = MachineTypeSelectList.find(item => item.Value == Data.MachineClassId)
        const fuelObj = fuelList.find(item => item.Value == Data.FuelId)
        const depreciationObj = DepreciationTypeSelectList.find(item => item.Value == Data.DepreciationId)

        this.setState({
            MachineClass: { label: machineObj.Text, value: machineObj.Value },
            fuel: { label: fuelObj.Text, value: fuelObj.Value },
            depreciation: { label: depreciationObj.Text, value: depreciationObj.Value },
        }, () => this.machineTypeData());
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
        if (newValue != '') {
            this.setState({ MachineClass: newValue }, () => {
                this.machineTypeData()
            });
        }
    };

    /**
    * @method machineTypeData
    * @description Used to handle labour
    */
    machineTypeData = () => {
        const { MachineClass } = this.state;
        this.props.getMachineTypeDataAPI(MachineClass.value, (res) => {
            if (res && res.data && res.data.Data) {
                let Data = res.data.Data;
                this.props.change('LabourType', Data.LabourTypeNames)
                this.props.change('MachineCapacity', Data.MachineCapacity)
            }
        })
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

        const { MachineClass, fuel, depreciation, isActiveBox } = this.state;
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
                LoanAmount: values.LoanAmount,
                Equity: values.Equity,
                RateOfInterest: values.RateOfInterest,
                DepreciationId: depreciation.value,
                FuelId: fuel.value,
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
                //MachineTonnage: string,
                LoanAmount: values.LoanAmount,
                Equity: values.Equity,
                RateOfInterest: values.RateOfInterest,
                DepreciationId: depreciation.value,
                FuelId: fuel.value,
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
                                                name={"LoanAmount"}
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
                                                name={"Equity"}
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
                                                label={`Rate of Interest`}
                                                name={"RateOfInterest"}
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
    const { machineData } = machine;
    let initialValues = {};
    if (machineData && machineData !== undefined) {
        initialValues = {
            MachineName: machineData.MachineName,
            MachineNumber: machineData.MachineNumber,
            Description: machineData.Description,
            LabourType: machineData.LabourType,
            MachineCapacity: machineData.MachineCapacity,
            PowerRating: machineData.PowerRating,
            UtilizationFactor: machineData.UtilizationFactor,
            Loan: machineData.Loan,
            CostOfMachine: machineData.CostOfMachine,
            Equity: machineData.Equity,
            RateOfInterest: machineData.RateOfInterest,
        }
    }
    return { initialValues, MachineTypeSelectList, fuelList, DepreciationTypeSelectList, machineData }
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
        getMachineTypeDataAPI,
    })(reduxForm({
        form: 'AddMachine',
        enableReinitialize: true,
    })(AddMachine));
