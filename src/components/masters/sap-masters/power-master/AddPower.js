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

class AddPower extends Component {
    constructor(props) {
        super(props);
        this.state = {
            powerSupplier: [],
            plant: [],
            uom: [],
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
        const { powerId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.setState({ isEditFlag }, () => {
                this.props.getLabourByIdAPI(powerId, true, res => { })
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

    }

    /**
    * @method powerSupplierHandler
    * @description Used to handle depreciation
    */
    powerSupplierHandler = (newValue, actionMeta) => {
        this.setState({ powerSupplier: newValue });
    };

    /**
    * @method plantHandler
    * @description Used to handle plant
    */
    plantHandler = (newValue, actionMeta) => {
        this.setState({ plant: newValue });
    };

    /**
    * @method uomHandler
    * @description Used to handle UOM
    */
    uomHandler = (newValue, actionMeta) => {
        this.setState({ uom: newValue });
    };

    /**
    * @method fuelHandler
    * @description Used to handle fuel
    */
    fuelHandler = (newValue, actionMeta) => {
        this.setState({ fuel: newValue });
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
        //     const { powerId } = this.props;

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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update Power Details' : 'Add Power Details'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row className={'mb20'}>
                                        <Col md="6">
                                            <Field
                                                label={`Power ID`}
                                                name={"PowerID"}
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
                                                label={`Charge Type `}
                                                name={"ChargeType"}
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
                                                name="PowerSupplierName"
                                                type="text"
                                                label="Power supplier Name"
                                                component={searchableSelect}
                                                placeholder={'Select...'}
                                                options={this.searchableSelectType('powerSupplier')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.powerSupplierHandler}
                                                valueDescription={this.state.powerSupplier}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="Plant"
                                                type="text"
                                                label="Plant"
                                                component={searchableSelect}
                                                placeholder={'Select Plant'}
                                                options={this.searchableSelectType('plant')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.plantHandler}
                                                valueDescription={this.state.plant}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className={'mt20'} >
                                        <Col md="6">
                                            <Field
                                                name="UOM"
                                                type="text"
                                                label="UOM"
                                                component={searchableSelect}
                                                placeholder={'Select UOM'}
                                                options={this.searchableSelectType('UOM')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.uomHandler}
                                                valueDescription={this.state.uom}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                name="Fuel"
                                                type="text"
                                                label="Fuel"
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
                                    </Row>
                                    <Row className={'mt20'} >
                                        <Col md="6">
                                            <Field
                                                label={`Contract`}
                                                name={"Contract"}
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
                                                label={`Demand`}
                                                name={"Demand"}
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
                                                label={`Avg. unit consumption per month`}
                                                name={"UnitConsumption"}
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
                                                label={`Max Demand energy`}
                                                name={"MaxDemandEnergy"}
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
                                                label={`Meter rent`}
                                                name={"MeterRent"}
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
                                                label={`Other charges`}
                                                name={"OtherCharges"}
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
                                                label={`Fuel Cost per unit`}
                                                name={"FuelCost"}
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
                                                label={`Duty on energy`}
                                                name={"DutyOnEnergy"}
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
                                                label={`FCA`}
                                                name={"FCA"}
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
                                                label={`Total unit`}
                                                name={"TotalUnit"}
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
                                                label={`Percentage`}
                                                name={"Percentage"}
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
                                                label={`Remark`}
                                                name={"Remark"}
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
                                                label={`Division`}
                                                name={"Division"}
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
    form: 'AddPower',
    enableReinitialize: true,
})(AddPower));
