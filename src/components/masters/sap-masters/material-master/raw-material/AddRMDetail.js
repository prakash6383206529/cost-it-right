import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required } from "../../../../../helper/validation";
import { renderText, renderSelectField, renderNumberInputField } from "../../../../layout/FormInputs";
import {
    fetchMaterialComboAPI, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
} from '../../../../../actions/master/Comman';
import {
    createRMDetailAPI, getMaterialDetailAPI, getRawMaterialDataAPI, getRawMaterialDetailsAPI,
    getRawMaterialDetailsDataAPI, updateRawMaterialDetailsAPI
} from '../../../../../actions/master/Material';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../../helper/auth";

class AddRMDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            typeOfListing: [],
            isEditFlag: false,
            selectedParts: [],
            basicRate: 0,
            Quantity: 0,
            NetLandedCost: 10,
            RawMaterialId: '',
            GradeId: '',
            SpecificationId: '',
            SourceSupplierCity: [],
            DestinationSupplierCity: [],
            SourcePlant: [],
            DestinationPlant: [],
        }
    }


    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        const { RawMaterialDetailsId, isEditFlag } = this.props;
        this.props.fetchMaterialComboAPI(res => { });

        if (isEditFlag) {
            this.props.getRawMaterialDetailsDataAPI(RawMaterialDetailsId, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;

                    setTimeout(() => { this.getData(Data) }, 500)

                }
            });
        } else {
            this.props.getRawMaterialDetailsDataAPI('', res => { });
        }

    }

    getData = (Data) => {
        this.props.getCityBySupplier(Data.SourceSupplierId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ SourceSupplierCity: Data })
            }
        })

        this.props.getCityBySupplier(Data.DestinationSupplierId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ DestinationSupplierCity: Data })
            }
        })

        this.props.getPlantByCity(Data.SourceSupplierCityId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                console.log('Data 11', Data)
                this.setState({ SourcePlant: Data })
            }
        })

        this.props.getPlantByCity(Data.DestinationSupplierCityId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                console.log('Data 22', Data)
                this.setState({ DestinationPlant: Data })
            }
        })
    }

    /**
    * @method toggleModel
    * @description Used to cancel modal
    */
    toggleModel = () => {
        this.props.onCancel('6');
    }

    /**
    * @method handleRMChange
    * @description  used to handle row material selection
    */
    handleRMChange = (e) => {
        if (e.target.value != 0) {
            this.props.getRawMaterialDetailsAPI(e.target.value, res => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    this.setState({
                        RawMaterialId: Data.RawMaterialId,
                        GradeId: Data.RawMaterialGradeId,
                        SpecificationId: Data.RawMaterialSpecificationId,
                        Density: Data.Density,
                    });

                    this.props.change('RawMaterialGradeName', Data.RawMaterialGradeName)
                    this.props.change('RawMaterialSpecificationName', Data.RawMaterialSpecificationName)
                }
            });
        } else {
            this.setState({
                RawMaterialId: '',
                GradeId: '',
                SpecificationId: '',
                Density: '',
            });

            this.props.change('RawMaterialGradeName', '')
            this.props.change('RawMaterialSpecificationName', '')
        }
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
    * @method handleSourceSupplier
    * @description called
    */
    handleSourceSupplier = e => {
        if (e.target.value != '') {
            this.setState({ SourceSupplierCity: [], SourcePlant: [] }, () => {
                this.props.getCityBySupplier(e.target.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ SourceSupplierCity: Data })
                    }
                })
            })
        } else {
            this.setState({ SourceSupplierCity: [], SourcePlant: [] })
        }
    };

    /**
    * @method handleDestinationSupplier
    * @description called
    */
    handleDestinationSupplier = e => {
        this.props.getCityBySupplier(e.target.value, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ DestinationSupplierCity: Data })
            }
        })

    };

    /**
    * @method handleSourceSupplierCity
    * @description called
    */
    handleSourceSupplierCity = e => {
        if (e.target.value != '') {
            this.setState({ SourcePlant: [] }, () => {
                this.props.getPlantByCity(e.target.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ SourcePlant: Data })
                    }
                })
            });
        } else {
            this.setState({ SourcePlant: [] })
        }
    };

    /**
    * @method handleDestinationSupplierCity
    * @description called
    */
    handleDestinationSupplierCity = e => {
        this.props.getPlantByCity(e.target.value, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ DestinationPlant: Data })
            }
        })
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
        });
        return temp;
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { GradeId, SpecificationId, RawMaterialId } = this.state;
        const { RawMaterialDetailsId, isEditFlag } = this.props;
        let loginUserId = loggedInUserId();
        //values.CreatedBy = loginUserId;

        if (isEditFlag) {
            let requestData = {
                BasicRate: values.BasicRate,
                Quantity: values.Quantity,
                ScrapRate: values.ScrapRate,
                NetLandedCost: values.NetLandedCost,
                Remark: values.Remark,
                TechnologyId: values.TechnologyId,
                RawMaterialId: values.RawMaterialId,
                CategoryId: values.CategoryId,
                SourceSupplierPlantId: values.SourceSupplierPlantId,
                SourceSupplierPlantName: values.SourceSupplierPlantName,
                SourceSupplierCityId: values.SourceSupplierCityId,
                SourceSupplierId: values.SourceSupplierId,
                DestinationSupplierPlantId: values.DestinationSupplierPlantId,
                DestinationSupplierPlantName: values.DestinationSupplierPlantName,
                DestinationSupplierCityId: values.DestinationSupplierCityId,
                DestinationSupplierId: values.DestinationSupplierId,
                UnitOfMeasurementId: values.UnitOfMeasurementId,
                IsAssembly: true,
                MaterialId: '',
                GradeId: GradeId,
                SpecificationId: GradeId,
                RawMaterialDetailsId: RawMaterialDetailsId,
                IsActive: true,
                CreatedDate: '',
                CreatedBy: loggedInUserId(),
                TechnologyName: '',
                RawMaterialName: '',
                MaterialName: '',
                Density: 0,
                RawMaterialGradeName: '',
                RawMaterialSpecificationName: '',
                CategoryName: '',
                SourceSupplierLocation: '',
                SourceSupplierName: '',
                DestinationSupplierLocation: '',
                DestinationSupplierName: '',
                UnitOfMeasurementName: ''
            }
            this.props.updateRawMaterialDetailsAPI(requestData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS);
                    this.props.getMaterialDetailAPI(res => { });
                    this.toggleModel();
                }
            })

        } else {

            const formData = {
                BasicRate: values.BasicRate,
                Quantity: values.Quantity,
                ScrapRate: values.ScrapRate,
                NetLandedCost: values.NetLandedCost,
                Remark: values.Remark,
                TechnologyId: values.TechnologyId,
                RawMaterialId: values.RawMaterialId,
                GradeId: GradeId,
                SpecificationId: SpecificationId,
                CategoryId: values.CategoryId,
                SourceSupplierPlantId: values.SourceSupplierPlantId,
                SourceSupplierCityId: values.SourceSupplierCityId,
                SourceSupplierId: values.SourceSupplierId,
                DestinationSupplierPlantId: values.DestinationSupplierPlantId,
                DestinationSupplierCityId: values.DestinationSupplierCityId,
                DestinationSupplierId: values.DestinationSupplierId,
                UnitOfMeasurementId: values.UnitOfMeasurementId,
                RawMaterialSupplierId: '', //Provision
                //PlantId: '',
                IsAssembly: true,
            }
            this.props.createRMDetailAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MATERIAL_ADD_SUCCESS);
                    this.props.getMaterialDetailAPI(res => { });
                    this.toggleModel();
                }
            });
        }
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
            supplierList, cityList, technologyList, categoryList, filterPlantListByCity, filterCityListBySupplier } = this.props;
        const { SourceSupplierCity, DestinationSupplierCity, SourcePlant, DestinationPlant } = this.state;
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
            filterCityListBySupplier && filterCityListBySupplier.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'SourceCity') {
            SourceSupplierCity && SourceSupplierCity.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'DestinationCity') {
            DestinationSupplierCity && DestinationSupplierCity.map(item =>
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
        if (label === 'SourceSupplierPlant') {
            SourcePlant && SourcePlant.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'DestinationSupplierPlant') {
            DestinationPlant && DestinationPlant.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

    }

    basicRateHandler = (e) => {
        this.setState({ basicRate: e.target.value }, () => this.netLandedCalculation())
    }

    QuantityHandler = (e) => {
        this.setState({ Quantity: e.target.value }, () => this.netLandedCalculation())
    }

    netLandedCalculation = () => {
        const { basicRate, Quantity } = this.state;
        const netLandedCost = basicRate * Quantity;
        this.props.change('NetLandedCost', netLandedCost)
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
                    <ModalHeader className="mdl-filter-text" toggle={this.toggleModel}>{isEditFlag ? `Update Raw Material Details` : `Add Raw Material Details`}</ModalHeader>
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
                                                options={this.renderListing('material')}
                                                onChange={this.handleRMChange}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Grade`}
                                                name={"RawMaterialGradeName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className="withoutBorder"
                                                disabled={true}
                                            />
                                            {/* <Field
                                                label={`Grade `}
                                                name={"GradeId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('grade')}
                                                onChange={(Value) => this.handleGradeChange(Value)}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            /> */}
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Specification`}
                                                name={"RawMaterialSpecificationName"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                component={renderText}
                                                required={true}
                                                className="withoutBorder"
                                                disabled={true}
                                            />
                                            {/* <Field
                                                label={`Specification`}
                                                name={"SpecificationId"}
                                                type="text"
                                                placeholder={''}
                                                //validate={[required]}
                                                // required={true}
                                                className=" withoutBorder custom-select"
                                                options={this.renderListing('specification')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            /> */}
                                        </Col>
                                        <Col md="6">
                                            <Field
                                                label={`Category`}
                                                name={"CategoryId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('category')}
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
                                                onChange={this.basicRateHandler}
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
                                                onChange={this.QuantityHandler}
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
                                                component={renderText}
                                                required={true}
                                                disabled={true}
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
                                                options={this.renderListing('technology')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                            />
                                        </Col>


                                        <Col md="4">
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
                                        <Col md="4">
                                            <Field
                                                label={`Source Supplier City`}
                                                name={"SourceSupplierCityId"}
                                                type="text"
                                                placeholder={'--Supplier City--'}
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
                                                label={`Source Supplier Plant`}
                                                name={"SourceSupplierPlantId"}
                                                type="text"
                                                placeholder={'--Source Plant--'}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('SourceSupplierPlant')}
                                                onChange={this.handleSourceSupplierPlant}
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
                                                placeholder={'--Supplier City--'}
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
                                                label={`Destination Supplier Plant`}
                                                name={"DestinationSupplierPlantId"}
                                                type="text"
                                                placeholder={'--Destination Plant--'}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('DestinationSupplierPlant')}
                                                onChange={this.handleDestinationSupplierPlant}
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
                                                options={this.renderListing('uom')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col>
                                        {/* <Col md="6">
                                            <Field
                                                label={`Plant`}
                                                name={"PlantId"}
                                                type="text"
                                                placeholder={''}
                                                validate={[required]}
                                                required={true}
                                                options={this.renderListing('plant')}
                                                onChange={this.handleTypeofListing}
                                                optionValue={'Value'}
                                                optionLabel={'Text'}
                                                component={renderSelectField}
                                                className=" withoutBorder custom-select"
                                            />
                                        </Col> */}
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
function mapStateToProps({ comman, material }) {

    const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
        supplierList, cityList, technologyList, categoryList, filterPlantListByCity, filterCityListBySupplier } = comman;

    const { rawMaterialDetails, rawMaterialDetailsData } = material;

    let initialValues = {};
    if (rawMaterialDetailsData && rawMaterialDetailsData != undefined) {
        initialValues = {
            RawMaterialId: rawMaterialDetailsData.RawMaterialId,
            RawMaterialGradeName: rawMaterialDetailsData.RawMaterialGradeName,
            RawMaterialSpecificationName: rawMaterialDetailsData.RawMaterialSpecificationName,
            CategoryId: rawMaterialDetailsData.CategoryId,
            BasicRate: rawMaterialDetailsData.BasicRate,
            Quantity: rawMaterialDetailsData.Quantity,
            ScrapRate: rawMaterialDetailsData.ScrapRate,
            NetLandedCost: rawMaterialDetailsData.NetLandedCost,
            Remark: rawMaterialDetailsData.Remark,
            TechnologyId: rawMaterialDetailsData.TechnologyId,
            SourceSupplierId: rawMaterialDetailsData.SourceSupplierId,
            SourceSupplierCityId: rawMaterialDetailsData.SourceSupplierCityId,
            SourceSupplierPlantId: rawMaterialDetailsData.SourceSupplierPlantId,
            DestinationSupplierId: rawMaterialDetailsData.DestinationSupplierId,
            DestinationSupplierCityId: rawMaterialDetailsData.DestinationSupplierCityId,
            DestinationSupplierPlantId: rawMaterialDetailsData.DestinationSupplierPlantId,
            UnitOfMeasurementId: rawMaterialDetailsData.UnitOfMeasurementId,
            PlantId: rawMaterialDetailsData.PlantId,
        }
    }

    return {
        uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification,
        plantList, supplierList, cityList, technologyList, categoryList, rawMaterialDetails,
        filterPlantListByCity, filterCityListBySupplier, rawMaterialDetailsData, initialValues
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    createRMDetailAPI,
    fetchMaterialComboAPI,
    fetchGradeDataAPI,
    fetchSpecificationDataAPI,
    getMaterialDetailAPI,
    getRawMaterialDataAPI,
    getRawMaterialDetailsAPI,
    getRawMaterialDetailsDataAPI,
    getCityBySupplier,
    getPlantByCity,
    updateRawMaterialDetailsAPI,
})(reduxForm({
    form: 'AddRMDetail',
    enableReinitialize: true,
})(AddRMDetail));
