import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, searchableSelect } from "../../../layout/FormInputs";
import { fetchMasterDataAPI, getMHRMasterComboData } from '../../../../actions/master/Comman';
import { createMHRMasterAPI } from '../../../../actions/master/MHRMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message'

class AddMHR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            SupplierId: '',
            uom: '',
            TechnologyId: '',
            PlantId: '',
            supplierType: 'vbc'
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
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { SupplierId, uom, PlantId, TechnologyId, supplierType } = this.state;
        const { Technologies } = this.props;

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
                } else {
                    toastr.error(res.data.message);
                }
            });
        }
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
        this.setState({ SupplierId: e.target.value });
    }

    /**
    * @method uomHandler
    * @description Used to uomHandler
    */
    uomHandler = (e) => {
        this.setState({
            uom: e.target.value
        })
    }

    /**
    * @method plantHandler
    * @description Used to plantHandler
    */
    plantHandler = (e) => {
        this.setState({
            PlantId: e.target.value
        })
    }


    /**
    * @method selectUnitOfMeasurement
    * @description Used show listing of unit of measurement
    */
    renderTypeOfListing = (label) => {
        const { Operations, Plants, Suppliers, Technologies, UnitOfMeasurements } = this.props;
        const temp = [];
        //const tempSupplier = [];
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
        if (label == 'uom') {
            UnitOfMeasurements && UnitOfMeasurements.map(item =>
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
    }

    supplierTypeHandler = (value) => {
        console.log('valueeeee', value)
        this.setState({
            supplierType: value
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag } = this.props;

        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
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
                                                options={this.renderTypeOfListing('technology')}
                                                //options={technologyOptions}
                                                onChange={this.technologyHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Supplier`}
                                                name={"SupplierId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('supplier')}
                                                //options={technologyOptions}
                                                onChange={this.supplierHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                maxLength={26}
                                                options={this.renderTypeOfListing('plant')}
                                                onChange={this.plantHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`UOM`}
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('uom')}
                                                //options={uomOptions}
                                                onChange={this.uomHandler}
                                                optionValue={'value'}
                                                optionLabel={'label'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md="6">
                                            <Field
                                                label="Machine Name"
                                                name={"MachineName"}
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
                                                label="Machine Number"
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
                                    </Row>
                                    <Row>

                                        <Col md="6">
                                            <Field
                                                label="Description"
                                                name={"Description"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label="MachineTonnage"
                                                name={"MachineTonnage"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
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
                                                label="Machine Rate"
                                                name={"BasicMachineRate"}
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
