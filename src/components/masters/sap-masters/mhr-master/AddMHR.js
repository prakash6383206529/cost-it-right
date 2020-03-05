import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import { required, getSupplierCode } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getMHRMasterComboData } from '../../../../actions/master/Comman';
import { createMHRMasterAPI } from '../../../../actions/master/MHRMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { loggedInUserId } from "../../../../helper/auth";

class AddMHR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            SupplierId: '',
            uom: '',
            TechnologyId: '',
            PlantId: '',
            supplierType: 'vbc',
            MachineName: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.getMHRMasterComboData(() => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { uomId, isEditFlag } = this.props;

        // if (isEditFlag) {
        //     this.setState({ isEditFlag }, () => {
        //         this.props.getOneUnitOfMeasurementAPI(uomId, true, res => { })
        //     })
        // } else {
        //     this.props.getOneUnitOfMeasurementAPI('', false, res => { })
        // }
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel();
    }



    /**
    * @method technologyHandler
    * @description Used to technologyHandler
    */
    technologyHandler = (e) => {
        this.setState({ TechnologyId: e.target.value });
    }

    /**
    * @method supplierHandler
    * @description Used to supplierHandler
    */
    supplierHandler = (e) => {
        if (e.target.value != 0) {
            this.setState({ SupplierId: e.target.value }, () => {
                const { Suppliers } = this.props;
                const tempObj = Suppliers.find(item => item.Value == e.target.value)
                const supplierCode = getSupplierCode(tempObj.Text);
                this.props.change('SupplierCode', supplierCode)
            });
        } else {
            this.setState({ SupplierId: '' }, () => {
                this.props.change('SupplierCode', '')
            });
        }
    }

    /**
    * @method plantHandler
    * @description Used to plantHandler
    */
    plantHandler = (e) => {
        this.setState({ PlantId: e.target.value })
    }


    /**
    * @method renderListing
    * @description Used show listing
    */
    renderListing = (label) => {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = this.props;
        const temp = [];

        if (label == 'technology') {
            Technologies && Technologies.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'processOperation') {
            Operations && Operations.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'supplier') {
            Suppliers && Suppliers.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'TransportUOM') {
            UnitOfMeasurements && UnitOfMeasurements.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'plant') {
            Plants && Plants.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }

        if (label == 'MachineName') {
            // Plants && Plants.map(item =>
            //     temp.push({ label: item.Text, value: item.Value })
            // );
            return temp;
        }

    }

    supplierTypeHandler = (value) => {
        this.setState({ supplierType: value })
    }

    /**
    * @method MachineNameHandler
    * @description Used to handle machine name
    */
    MachineNameHandler = (newValue, actionMeta) => {
        this.setState({ MachineName: newValue });
    };

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { SupplierId, uom, PlantId, TechnologyId, supplierType } = this.state;
        const { Technologies } = this.props;

        let loginUserId = loggedInUserId();

        values.TechnologyId = TechnologyId != '' ? TechnologyId : Technologies[0].Value;
        values.SupplierId = SupplierId;
        values.UnitOfMeasurementId = uom;
        values.PlantId = PlantId;
        values.supplierType = supplierType;

        if (this.props.isEditFlag) {
            // console.log('values', values);
            // const { uomId } = this.props;
            // this.setState({ isSubmitted: true });
            // let formData = {
            //     Name: values.Name,
            //     Title: values.Title,
            //     Description: values.Description,
            //     Id: uomId
            // }
            // this.props.updateUnitOfMeasurementAPI(uomId, formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_UOM_SUCESS);
            //         this.toggleModel();
            //         this.props.getUnitOfMeasurementAPI(res => { });
            //     } else {
            //         toastr.error(MESSAGES.SOME_ERROR);
            //     }
            // });
        } else {
            this.props.createMHRMasterAPI(values, (res) => {
                if (res.data.Result === true) {
                    toastr.success(MESSAGES.MHR_MASTER_ADD_SUCCESS);
                    { this.toggleModel() }
                }
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;

        return (
            <Container className="top-margin">
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update MHR' : 'Add MHR'}</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Container>
                                <form
                                    noValidate
                                    className="form"
                                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                >
                                    <Row className={'supplierRadio'}>
                                        <Col className='form-group'>
                                            <Label
                                                className={'zbcwrapper'}
                                                onChange={() => this.supplierTypeHandler('zbc')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'zbc'}
                                                    checked={this.state.supplierType == 'zbc' ? true : false}
                                                    name="SupplierType"
                                                    value="zbc" />{' '}
                                                ZBC
                                            </Label>
                                            {' '}
                                            <Label
                                                className={'vbcwrapper'}
                                                onChange={() => this.supplierTypeHandler('vbc')}
                                                check>
                                                <Input
                                                    type="radio"
                                                    className={'vbc'}
                                                    checked={this.state.supplierType == 'vbc' ? true : false}
                                                    name="SupplierType"
                                                    value="vbc" />{' '}
                                                VBC
                                            </Label>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Technology`}
                                                name={"TechnologyId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('technology')}
                                                //options={technologyOptions}
                                                onChange={this.technologyHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderListing('plant')}
                                                onChange={this.plantHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Supplier`}
                                                name={"SupplierId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('supplier')}
                                                onChange={this.supplierHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="Supplier Code"
                                                name={"SupplierCode"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <Field
                                                name="MachineName"
                                                type="text"
                                                label="Machine Name"
                                                component={searchableSelect}
                                                placeholder={'Select Machine Name'}
                                                options={this.renderListing('MachineName')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                //validate={[required]}
                                                //required={true}
                                                handleChangeDescription={this.MachineNameHandler}
                                                valueDescription={this.state.MachineName}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Machine Description"
                                                name={"MachineDescription"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Power Rating"
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
                                    </Row>
                                    <Row>
                                        <Col md="4">
                                            <Field
                                                label="Depreciation"
                                                name={"Depreciation"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Shift"
                                                name={"Shift"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Fuel Type"
                                                name={"FuelType"}
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
                                        <Col md="4">
                                            <Field
                                                label="Consumable"
                                                name={"Consumable"}
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
                                        <Col md="4">
                                            <Field
                                                label="Efficiency"
                                                name={"Efficiency"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="Rate"
                                                name={"Rate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label="UOM"
                                                name={"UOM"}
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
                                        <Col md="4">
                                            <Field
                                                label="Loan"
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
                                        <Col md="4">
                                            <Field
                                                label="Equity"
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
                                        <Col md="4">
                                            <Field
                                                label="Rate Of Interest"
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

                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Save'}
                                            </button>
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
function mapStateToProps({ comman }) {
    if (comman && comman.comboDataMHR) {
        const { Plants, Suppliers, Technologies, UnitOfMeasurements } = comman.comboDataMHR;
        // console.log('technologyList: ', technologyList, technologyList);
        // let initialValues = {};
        // if (technologyList !== undefined && uniOfMeasurementList !== undefined) {
        //     initialValues = {
        //         technologyList,
        //         uniOfMeasurementList
        //     }
        // }
        return { Plants, Suppliers, Technologies, UnitOfMeasurements };
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    fetchMasterDataAPI,
    getMHRMasterComboData,
    createMHRMasterAPI
})(reduxForm({
    form: 'addOtherOperation',
    enableReinitialize: true,
})(AddMHR));
