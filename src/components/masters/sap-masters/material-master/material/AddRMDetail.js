import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField, renderNumberInputField } from "../../../../layout/FormInputs";
import { fetchMaterialComboAPI, fetchGradeDataAPI, fetchSpecificationDataAPI } from '../../../../../actions/master/Comman';
import { createRMDetailAPI, getMaterialDetailAPI } from '../../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant'

class AddRMDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            selectedParts: [],
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.fetchMaterialComboAPI(res => { });
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
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    handleRMChange = (e) => {
        this.props.fetchGradeDataAPI(e.target.value, res => { });
    }

    /**
    * @method handleGradeChange
    * @description  used to handle row material grade selection
        */
    handleGradeChange = (e) => {
        this.props.fetchSpecificationDataAPI(e.target.value, res => { });
    }

    /**
    * @method handleCategoryType
    * @description  used to handle category type selection
    */
    handleCategoryType = (e) => {
        this.props.fetchCategoryAPI(e.target.value, res => { })
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
        const formData = {
            BasicRate: values.BasicRate,
            Quantity: values.Quantity,
            ScrapRate: values.ScrapRate,
            NetLandedCost: values.NetLandedCost,
            Remark: values.Remark,
            TechnologyId: values.TechnologyId,
            RawMaterialId: values.RawMaterialId,
            GradeId: values.GradeId,
            SpecificationId: values.SpecificationId,
            CategoryId: values.CategoryId,
            SourceSupplierCityId: values.SourceSupplierCityId,
            SourceSupplierId: values.SourceSupplierId,
            DestinationSupplierCityId: values.DestinationSupplierCityId,
            DestinationSupplierId: values.DestinationSupplierId,
            UnitOfMeasurementId: values.UnitOfMeasurementId,
            PlantId: values.PlantId,
        }
        this.props.createRMDetailAPI(formData, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS);
                this.props.getMaterialDetailAPI(res => { });
                this.toggleModel();
            } else {
                toastr.error(res.data.Message);
            }
        });
    }

    /**
    * @method renderTypeOfListing
    * @description Used to show type of listing
    */
    renderTypeOfListing = (label) => {
        const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
            supplierList, cityList, technologyList, categoryList } = this.props;
        const temp = [];
        if (label === 'material') {
            rowMaterialList && rowMaterialList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'grade') {
            rmGradeList && rmGradeList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'specification') {
            rmSpecification && rmSpecification.map(item =>
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
        if (label === 'plant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'supplier') {
            supplierList && supplierList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'technology') {
            technologyList && technologyList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'category') {
            categoryList && categoryList.map(item =>
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{`${CONSTANT.ADD} ${CONSTANT.MATERIAL_MASTER}`}</ModalHeader>
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
                                                label={`Raw Material `}
                                                name={"RawMaterialId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('material')}
                                                onChange={(Value) => this.handleRMChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Grade `}
                                                name={"GradeId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('grade')}
                                                onChange={(Value) => this.handleGradeChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Specification`}
                                                name={"SpecificationId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('specification')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Category`}
                                                name={"CategoryId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('category')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Basic Rate`}
                                                name={"BasicRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
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
                                                component={renderNumberInputField}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Scrap Rate`}
                                                name={"ScrapRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderNumberInputField}
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
                                                component={renderNumberInputField}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Remark `}
                                                name={"Remark"}
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
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderTypeOfListing('technology')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>


                                        <Col md="6">
                                            <Field
                                                label={`Source Supplier`}
                                                name={"SourceSupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('supplier')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Source Supplier City`}
                                                name={"SourceSupplierCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('city')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Destination Supplier`}
                                                name={"DestinationSupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('supplier')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Destination Supplier City`}
                                                name={"DestinationSupplierCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('city')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
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
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderTypeOfListing('plant')}
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
    const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
        supplierList, cityList, technologyList, categoryList } = comman;
    return {
        uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification,
        plantList, supplierList, cityList, technologyList, categoryList
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createRMDetailAPI, fetchMaterialComboAPI,
    fetchGradeDataAPI, fetchSpecificationDataAPI, getMaterialDetailAPI
})(reduxForm({
    form: 'AddRMDetail',
    enableReinitialize: true,
})(AddRMDetail));
