import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderSelectField, renderNumberInputField, renderText, searchableSelect } from "../../../layout/FormInputs";
import { } from '../../../../actions/master/MachineMaster';
import { } from '../../../../actions/master/Comman';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

class AddMachine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            depreciation: [],
            class: [],
            labour: [],
            fuel: [],
            shift: [],
            effectiveDate: '',
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentWillMount() {

    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { machineId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getLabourByIdAPI(machineId, true, res => { })
            })
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
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    searchableSelectType = (label) => {
        //const { roleList, departmentList, cityList } = this.props;
        //const temp = [];

        // if (label === 'role') {
        //   roleList && roleList.map(item => {
        //     if (item.Value == 0) return false;
        //     temp.push({ label: item.RoleName, value: item.RoleId })
        //   });
        //   return temp;
        // }

        // if (label === 'department') {
        //   departmentList && departmentList.map(item => {
        //     if (item.Value == 0) return false;
        //     temp.push({ label: item.DepartmentName, value: item.DepartmentId })
        //   });
        //   return temp;
        // }

        // if (label === 'city') {
        //   cityList && cityList.map(item => {
        //     if (item.Value == 0) return false;
        //     temp.push({ label: item.Text, value: item.Value })
        //   });
        //   return temp;
        // }
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
        this.setState({ class: newValue });
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
        // if (this.props.isEditFlag) { 
        //     const { machineId } = this.props;

        //     this.props.updateLabourAPI(formData, (res) => {
        //         if (res.data.Result) {
        //             toastr.success(MESSAGES.UPDATE_LABOUR_SUCCESS);
        //             this.toggleModel();
        //             this.props.getLabourDetailAPI(res => {});
        //         } else {
        //             toastr.error(MESSAGES.SOME_ERROR);
        //         }
        //     });
        // }else{
        //     this.props.createLabourAPI(values, (res) => {
        //         if (res.data.Result === true) {
        //             toastr.success(MESSAGES.LABOUR_ADDED_SUCCESS);
        //             this.props.getLabourDetailAPI(res => {});
        //             this.toggleModel()
        //         } else {
        //             toastr.error(res.data.Message);
        //         }
        //     });
        // }

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
                                    <Row className={'mb20'}>
                                        <Col md="12">
                                            <Field
                                                name="MachineClass"
                                                type="text"
                                                label="Machine Class"
                                                component={searchableSelect}
                                                placeholder={'Select Machine Class'}
                                                options={this.searchableSelectType('class')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.classHandler}
                                                valueDescription={this.state.class}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Number`}
                                                name={"MachineNumber"}
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
                                                label={`Machine Power`}
                                                name={"MachinePower"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                name="MachineDepreciation"
                                                type="text"
                                                label="Machine Depreciation"
                                                component={searchableSelect}
                                                placeholder={'Select Depreciation'}
                                                options={this.searchableSelectType('depreciation')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.depreciationHandler}
                                                valueDescription={this.state.depreciation}
                                            />
                                        </Col>
                                        <Col md="6">
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
                                        </Col>
                                    </Row>
                                    <Row className={'mt20'} >
                                        <Col md="6">
                                            <Field
                                                name="Fuel"
                                                type="text"
                                                label="Fuel Type"
                                                component={searchableSelect}
                                                placeholder={'Select Fuel'}
                                                options={this.searchableSelectType('fuel')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.fuelHandler}
                                                valueDescription={this.state.fuel}
                                            />
                                        </Col>
                                        <Col md="6">
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
                                        </Col>
                                    </Row>
                                    <Row className={'mt20'} >
                                        <Col md="6">
                                            <Field
                                                label={`Machine Cost`}
                                                name={"MachineCost"}
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
                                                label={`Manufacturing year`}
                                                name={"ManufacturingYear"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className={'mt20'}>
                                        <Col md="6">
                                            <Field
                                                label={`Machine Maintenance Cost`}
                                                name={"MachineMaintenanceCost"}
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
                                                label={`PUC`}
                                                name={"PUC"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                //required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <div className="form-group">
                                                <label>
                                                    Effective Date
                                                    {/* <span className="asterisk-required">*</span> */}
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

    let initialValues = {};
    // if(labourData && labourData !== undefined){
    //     initialValues = {
    //         LabourRate: labourData.LabourRate,
    //         LabourTypeId: labourData.LabourTypeId,
    //         PlantId: labourData.PlantId,
    //         TechnologyId: labourData.TechnologyId,
    //     }
    // }
    return { initialValues }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {

})(reduxForm({
    form: 'AddMachine',
    enableReinitialize: true,
})(AddMachine));
