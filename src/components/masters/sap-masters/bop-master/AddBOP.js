import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, decimalLength2, Numeric } from "../../../../helper/validation";
import { renderText, renderSelectField, renderNumberInputField } from "../../../layout/FormInputs";
import { fetchBOPComboAPI, fetchCategoryAPI, getCityBySupplier, getPlantByCityAndSupplier } from '../../../../actions/master/Comman';
import { createBOPAPI, getBOPByIdAPI, updateBOPAPI, getAllBOPAPI } from '../../../../actions/master/BoughtOutParts';
import { getAllRawMaterialList } from '../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant';
import { loggedInUserId } from "../../../../helper/auth";
const selector = formValueSelector('AddBOP');

class AddBOP extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            selectedParts: [],
            isActive: false,
            categoryIds: [],

            SourceSupplier: '',
            SourceSupplierCity: '',
            SourceSupplierCityArray: [],
            SourcePlantArray: [],

            DestinationSupplier: '',
            DestinationSupplierCity: '',
            DestinationSupplierCityArray: [],
            DestinationPlantArray: [],
        }
    }

    /**
    * @method componentWillMount
    * @description called before rendering the component
    */
    componentWillMount() {
        this.props.fetchBOPComboAPI(res => { });
        this.props.getAllRawMaterialList(() => { });
    }

    /**
    * @method componentDidMount
    * @description called after render the component
    */
    componentDidMount() {
        const { bopId, isEditFlag } = this.props;
        if (isEditFlag) {
            this.props.getBOPByIdAPI(bopId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    setTimeout(() => { this.getData(Data) }, 500)

                }
            })
        } else {
            this.props.getBOPByIdAPI('', res => { })
        }
    }

    getData = (Data) => {

        this.props.fetchCategoryAPI(Data.CategoryTypeId, res => {
            const { bopData } = this.props;
            this.props.change('CategoryId', bopData.CategoryId)
        })
        this.setState({
            isActive: Data.IsActive
        })

        this.props.getCityBySupplier(Data.SourceSupplierId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ SourceSupplierCityArray: Data })
            }
        })

        // this.props.getPlantByCityAndSupplier(Data.SourceSupplierId, Data.SourceSupplierCityId, (res) => {
        //     if (res && res.data && res.data.SelectList) {
        //         let Data = res.data.SelectList;
        //         this.setState({ SourcePlantArray: Data })
        //     }
        // })

        this.props.getCityBySupplier(Data.DestinationSupplierId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ DestinationSupplierCityArray: Data })
            }
        })

        this.props.getPlantByCityAndSupplier(Data.DestinationSupplierId, Data.DestinationSupplierCityId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ DestinationPlantArray: Data })
            }
        })

    }

    getCategoryIdEdit = (response) => {
        const { bopData } = this.props;
        const categoryList = response.data.SelectList;
        console.log('categoryList', categoryList)
        const temp = [];

        categoryList && categoryList.map(item =>
            temp.push({ Text: item.Text, Value: item.Value })
        );

        if (temp) {

            this.setState({
                categoryIds: temp,
                isActive: bopData.IsActive
            }, () => {
                this.props.change("CategoryId", bopData.CategoryId)
            })

        }


    }

    toggleChange = () => {
        this.setState({
            isActive: !this.state.isActive,
        });
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

        let loginUserId = loggedInUserId();

        if (this.props.isEditFlag) {
            /** Update detail of the existing BOP  */
            const { bopId, BOPListing } = this.props;
            this.setState({ isSubmitted: true });
            let formData = {
                BoughtOutPartId: bopId,
                BasicRate: values.BasicRate,
                Quantity: values.Quantity,
                NetLandedCost: values.NetLandedCost,
                PartNumber: values.PartNumber,
                TechnologyId: values.TechnologyId,
                CategoryId: values.CategoryId,
                //CategoryTypeId: values.CategoryType,
                Specification: values.Specification,
                MaterialTypesId: values.MaterialTypesId,
                SourceSupplierCityId: values.SourceSupplierCityId,
                SourceSupplierId: values.SourceSupplierId,
                DestinationSupplierCityId: values.DestinationSupplierCityId,
                DestinationSupplierId: values.DestinationSupplierId,
                UnitOfMeasurementId: values.UnitOfMeasurementId,
                PlantId: values.PlantId,
                PartId: values.PartId,
                IsActive: this.state.isActive,
                ModifiedBy: loginUserId,
            }
            this.props.updateBOPAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_BOP_SUCESS);
                    if (BOPListing && BOPListing.length > 0) {
                        this.props.getAllBOPAPI(res => { });
                    }
                    this.toggleModel();
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            });
        } else { /** Add new detail of the BOP  */
            const formData = {
                BasicRate: values.BasicRate,
                Quantity: values.Quantity,
                NetLandedCost: values.NetLandedCost,
                PartNumber: values.PartNumber,
                TechnologyId: values.TechnologyId,
                CategoryId: values.CategoryId,
                CategoryTypeId: values.CategoryType,
                Specification: values.Specification,
                MaterialTypesId: values.MaterialTypesId,
                SourceSupplierCityId: values.SourceSupplierCityId,
                SourceSupplierId: values.SourceSupplierId,
                DestinationSupplierCityId: values.DestinationSupplierCityId,
                DestinationSupplierId: values.DestinationSupplierId,
                UnitOfMeasurementId: values.UnitOfMeasurementId,
                PlantId: values.PlantId,
                PartId: values.PartId
            }
            this.props.createBOPAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.BOP_ADD_SUCCESS);
                    this.toggleModel()
                } else {
                    toastr.error(res.data.Message);
                }
            });
        }
    }

    /**
    * @method handleSourceSupplier
    * @description called
    */
    handleSourceSupplier = e => {
        if (e.target.value != '') {
            this.setState({
                SourceSupplier: e.target.value,
                SourceSupplierCityArray: [],
                SourcePlantArray: []
            }, () => {
                this.props.getCityBySupplier(e.target.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ SourceSupplierCityArray: Data })
                    }
                })
            })
        } else {
            this.setState({ SourceSupplierCityArray: [], SourcePlantArray: [] })
        }
    };

    /**
        * @method handleSourceSupplierCity
        * @description called
        */
    handleSourceSupplierCity = e => {
        if (e.target.value != '' && e.target.value != 0) {
            this.setState({
                SourceSupplierCity: e.target.value,
                SourcePlantArray: []
            }, () => {
                // const { SourceSupplier, SourceSupplierCity } = this.state;
                // this.props.getPlantByCityAndSupplier(SourceSupplier, SourceSupplierCity, (res) => {
                //     if (res && res.data && res.data.SelectList) {
                //         let Data = res.data.SelectList;
                //         this.setState({ SourcePlantArray: Data })
                //     }
                // })
            });
        } else {
            this.setState({ SourcePlantArray: [] })
        }
    };

    /**
    * @method handleDestinationSupplier
    * @description called
    */
    handleDestinationSupplier = (e) => {
        if (e.target.value != '' && e.target.value != 0) {
            this.setState({
                DestinationSupplier: e.target.value,
                DestinationSupplierCityArray: [],
                DestinationPlantArray: []
            }, () => {
                this.props.getCityBySupplier(e.target.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ DestinationSupplierCityArray: Data })
                    }
                })
            })
        } else {
            this.setState({ DestinationSupplierCityArray: [], DestinationPlantArray: [] })
        }

    };

    /**
        * @method handleDestinationSupplierCity
        * @description called
        */
    handleDestinationSupplierCity = e => {
        if (e.target.value != '' && e.target.value != 0) {
            this.setState({
                DestinationSupplierCity: e.target.value,
                DestinationPlantArray: []
            }, () => {
                const { DestinationSupplier, DestinationSupplierCity } = this.state;
                this.props.getPlantByCityAndSupplier(DestinationSupplier, DestinationSupplierCity, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ DestinationPlantArray: Data })
                    }
                })
            })
        } else {
            this.setState({ DestinationPlantArray: [] })
        }
    };

    /**
    * @method renderListing
    * @description Used show type of listing
    */
    renderListing = (label) => {
        const { uniOfMeasurementList, partList, materialTypeList, plantList, rowMaterialDetail,
            supplierList, cityList, technologyList, categoryTypeList, categoryList } = this.props;
        const { SourceSupplierCityArray, DestinationSupplierCityArray, DestinationPlantArray } = this.state;
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
        if (label === 'categoryType') {
            categoryTypeList && categoryTypeList.map(item =>
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
        if (label === 'SourceCity') {
            SourceSupplierCityArray && SourceSupplierCityArray.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'DestinationCity') {
            DestinationSupplierCityArray && DestinationSupplierCityArray.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'DestinationSupplierPlant') {
            DestinationPlantArray && DestinationPlantArray.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    basicRateKeyUp = (e) => {
        this.props.change("NetLandedCost", e.target.value)
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, reset, isEditFlag } = this.props;
        return (
            <Container className="top-margin">
                <Modal size={'xl'} isOpen={this.props.isOpen} toggle={this.toggleModel} className={this.props.className}>
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? 'Update BOP' : 'Add BOP'}</ModalHeader>
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
                                                label={`Source Supplier`}
                                                name={"SourceSupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('supplier')}
                                                onChange={this.handleSourceSupplier}
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
                                                options={this.renderListing('SourceCity')}
                                                onChange={this.handleSourceSupplierCity}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>

















                                        <Col md="4">
                                            <Field
                                                label={`Destination Supplier`}
                                                name={"DestinationSupplierId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('supplier')}
                                                onChange={this.handleDestinationSupplier}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Destination Supplier City`}
                                                name={"DestinationSupplierCityId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('DestinationCity')}
                                                onChange={this.handleDestinationSupplierCity}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Destination Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('DestinationSupplierPlant')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>




















                                        <Col md="4">
                                            <Field
                                                label={`BOP Part`}
                                                name={"PartNumber"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Basic Rate`}
                                                name={"BasicRate"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, decimalLength2]}
                                                component={renderNumberInputField}
                                                required={true}
                                                className="withoutBorder"
                                                onChange={(e) => this.basicRateKeyUp(e)}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`${CONSTANT.QUANTITY}`}
                                                name={"Quantity"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required, Numeric]}
                                                component={renderNumberInputField}
                                                required={true}
                                                className=" withoutBorder"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Net Landed Cost`}
                                                name={"NetLandedCost"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className=" withoutBorder"
                                                value={this.props.basicRateSelector}
                                                disabled={true}
                                                title={'Basic Rate'}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Technology`}
                                                name={"TechnologyId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('technology')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="4">
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
                                        <Col md="4">
                                            <Field
                                                label={`Category Type`}
                                                name={"CategoryType"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('categoryType')}
                                                onChange={(Value) => this.handleCategoryType(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`Category`}
                                                name={"CategoryId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                //required={true}
                                                options={this.renderListing('category')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>

                                        <Col md="4">
                                            <Field
                                                label={`${CONSTANT.MATERIAL} ${CONSTANT.TYPE}`}
                                                name={"MaterialTypesId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('material')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        <Col md="4">
                                            <Field
                                                label={`UnitOfMeasurement`}
                                                name={"UnitOfMeasurementId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('uom')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>

                                        <Col md="4">
                                            <Field
                                                label={`Part`}
                                                name={"PartId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('part')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>


                                        {isEditFlag &&
                                            <Col>
                                                <label>
                                                    <input type="checkbox"
                                                        checked={this.state.isActive}
                                                        onChange={this.toggleChange}
                                                    />
                                                    Is Active!
                                            </label>
                                            </Col>}
                                    </Row>
                                    <Row className="sf-btn-footer no-gutters justify-content-between">
                                        <div className="col-sm-12 text-center">
                                            <button type="submit" className="btn dark-pinkbtn" >
                                                {isEditFlag ? 'Update' : 'Add'}
                                            </button>
                                            {!isEditFlag &&
                                                <button type={'button'} className="btn btn-secondary" onClick={reset} >
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
function mapStateToProps(state) {
    const { comman, boughtOutparts, material } = state;
    const { rowMaterialDetail } = material;
    const { uniOfMeasurementList, partList, materialTypeList, plantList,
        supplierList, cityList, technologyList, categoryTypeList, categoryList } = comman;
    const { bopData, BOPListing } = boughtOutparts;

    let initialValues = {};
    if (bopData && bopData !== undefined) {

        initialValues = {
            BasicRate: bopData.BasicRate,
            Quantity: bopData.Quantity,
            PartNumber: bopData.PartNumber,
            NetLandedCost: bopData.NetLandedCost,
            TechnologyId: bopData.TechnologyId,
            CategoryType: bopData.CategoryTypeId,
            CategoryId: bopData.CategoryId,
            Specification: bopData.Specification,
            MaterialTypesId: bopData.MaterialTypesId,
            SourceSupplierCityId: bopData.SourceSupplierCityId,
            SourceSupplierId: bopData.SourceSupplierId,
            DestinationSupplierCityId: bopData.DestinationSupplierCityId,
            DestinationSupplierId: bopData.DestinationSupplierId,
            PlantId: bopData.PlantId,
            UnitOfMeasurementId: bopData.UnitOfMeasurementId,
            PartId: bopData.PartId,
        }

    }

    return {
        uniOfMeasurementList, materialTypeList, partList, BOPListing,
        plantList, supplierList, cityList, technologyList, categoryTypeList,
        categoryList, bopData, initialValues, rowMaterialDetail
    }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createBOPAPI,
    fetchBOPComboAPI,
    updateBOPAPI,
    getAllBOPAPI,
    fetchCategoryAPI,
    getBOPByIdAPI,
    getAllRawMaterialList,
    getCityBySupplier,
    getPlantByCityAndSupplier,
})(reduxForm({
    form: 'AddBOP',
    enableReinitialize: true,
})(AddBOP));
