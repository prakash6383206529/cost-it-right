import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../helper/validation";
import { renderText, renderSelectField, renderMultiSelectField } from "../../../layout/FormInputs";
import { fetchMasterDataAPI } from '../../../../actions/master/Comman';
import { createBOPAPI } from '../../../../actions/master/BoughtOutParts';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'

class AddBOP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            selectedParts: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.fetchMasterDataAPI(res => { });
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
    * @method handlePartSelection
    * @description called
    */
    handlePartSelection = e => {
        this.setState({
            selectedParts: e
        });
    };

    /**
     * @method renderSelectPartList
     * @description called
     */
    renderSelectPartList = () => {
        const { partList } = this.props;
        const temp = [];
        partList && partList.map(item => {
            if (item.Value != 0) {
                temp.push({ Text: item.Text, Value: item.Value })
            }
        }
        );
        return temp;
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { selectedParts } = this.state;
        let plantArray = [];
        selectedParts.map((item, i) => {
            return plantArray.push({ PartId: item.Value });
        });
        const formData = {
            BillNumber: values.BillNumber,
            BillOfMaterialCode: values.BillOfMaterialCode,
            PartNumber: values.PartNumber,
            MaterialCode: values.MaterialCode,
            MaterialDescription: values.MaterialDescription,
            Quantity: values.Quantity,
            AssemblyPartNumberMark: values.AssemblyPartNumberMark,
            BOMLevel: values.BOMLevel,
            EcoNumber: values.EcoNumber,
            RevisionNumber: values.RevisionNumber,
            MaterialTypeId: values.MaterialTypeId,
            UnitOfMeasurementId: values.UnitOfMeasurementId,
            PartId: values.PartId,
            PartsIncludedBOM: plantArray
        }
        console.log('formData: ', formData);
        this.props.createBOPAPI(formData, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOM_ADD_SUCCESS);
                this.props.getAllPartsAPI(res => { })
                { this.toggleModel() }
            } else {
                toastr.error(res.data.message);
            }
        });
    }

    /**
    * @method renderTypeOfListing
    * @description Used show type of listing
    */
    renderTypeOfListing = (label) => {
        const { uniOfMeasurementList, partList, materialTypeList, plantList } = this.props;
        const temp = [];
        if (label === 'material') {
            materialTypeList && materialTypeList.map(item =>
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
        if (label === 'part') {
            partList && partList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'plant') {
            plantList && plantList.map(item =>
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
        const { handleSubmit } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'lg'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.BOM}`}</ModalHeader>
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
                                                label={`Basic Rate`}
                                                name={"BasicRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className="withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.QUANTITY}`}
                                                name={"Quantity"}
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
                                                label={`Net Landed Cost`}
                                                name={"NetLandedCost"}
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
                                                label={`Technology Id`}
                                                name={"TechnologyId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                //options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                            //component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Category Id`}
                                                name={"CategoryId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                component={renderText}
                                                //options={this.renderTypeOfListing('uom')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                //component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`${CONSTANT.SPECIFICATION}`}
                                                name={"Specification"}
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
                                                label={`${CONSTANT.MATERIAL} ${CONSTANT.TYPE} Id`}
                                                name={"MaterialTypesId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Source Supplier City Id`}
                                                name={"SourceSupplierCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                //component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Source Supplier Id`}
                                                name={"SourceSupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                //component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Destination Supplier City Id`}
                                                name={"DestinationSupplierCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                //component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Destination Supplier Id`}
                                                name={"DestinationSupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                //options={this.renderTypeOfListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                //component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`UnitOfMeasurement`}
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                options={this.renderTypeOfListing('uom')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Plant Id`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                component={renderText}
                                                options={this.renderTypeOfListing('plant')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Part Id`}
                                                name={"PartId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                component={renderText}
                                                options={this.renderTypeOfListing('part')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {`${CONSTANT.SAVE}`}
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
    const { uniOfMeasurementList, partList, materialTypeList, plantList } = comman;
    return { uniOfMeasurementList, materialTypeList, partList, plantList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, { createBOPAPI, fetchMasterDataAPI })(reduxForm({
    form: 'AddBOP',
    enableReinitialize: true,
})(AddBOP));
