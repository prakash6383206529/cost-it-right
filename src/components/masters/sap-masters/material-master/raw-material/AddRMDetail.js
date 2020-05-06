import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../../helper/validation";
import {
    renderText, renderSelectField, renderNumberInputField, searchableSelect,
    renderMultiSelectField, renderTextAreaField,
} from "../../../../layout/FormInputs";
import {
    fetchMaterialComboAPI, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
    getPlantByCityAndSupplier,
} from '../../../../../actions/master/Comman';
import {
    createRMDetailAPI, getMaterialDetailAPI, getRawMaterialDataAPI, getRawMaterialDetailsAPI,
    getRawMaterialDetailsDataAPI, updateRawMaterialDetailsAPI
} from '../../../../../actions/master/Material';
import MaterialDetail from './MaterialDetail';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../../config/message';
import { CONSTANT } from '../../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../../helper/auth";
import Switch from "react-switch";
const selector = formValueSelector('AddRMDetail');

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

            RawMaterial: [],
            RMGrade: [],
            RMSpec: [],
            Category: [],
            selectedVendorPlants: [],
            HasDifferentSource: false,
            UOM: [],
            remarks: '',

            sourceLocation: [],
            SourceSupplier: '',
            SourceSupplierCityArray: [],
            SourcePlantArray: [],

            vendorSupplier: [],
            vendorLocation: [],
            vendorPlant: [],
            DestinationSupplierCityArray: [],

            isShowForm: false,
            IsVendor: false,
            files: [],
            errors: [],
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
                this.setState({ SourceSupplierCityArray: Data })
            }
        })

        this.props.getPlantByCityAndSupplier(Data.SourceSupplierId, Data.SourceSupplierCityId, (res) => {
            if (res && res.data && res.data.SelectList) {
                let Data = res.data.SelectList;
                this.setState({ SourcePlantArray: Data })
            }
        })

        // this.props.getPlantByCity(Data.SourceSupplierCityId, (res) => {
        //     if (res && res.data && res.data.SelectList) {
        //         let Data = res.data.SelectList;
        //         console.log('Data 11', Data)
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
                this.setState({ vendorPlant: Data })
            }
        })

        // this.props.getPlantByCity(Data.DestinationSupplierCityId, (res) => {
        //     if (res && res.data && res.data.SelectList) {
        //         let Data = res.data.SelectList;
        //         console.log('Data 22', Data)
        //         this.setState({ DestinationPlantArray: Data })
        //     }
        // })
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
    handleRMChange = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ RawMaterial: newValue }, () => {
                const { RawMaterial } = this.state;
                this.props.getRawMaterialDetailsAPI(RawMaterial.value, res => {
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
            });
        } else {
            this.setState({
                RawMaterialId: '',
                GradeId: '',
                SpecificationId: '',
                Density: '',
                RawMaterial: [],
            });

            this.props.change('RawMaterialGradeName', '')
            this.props.change('RawMaterialSpecificationName', '')
        }
    }

    /**
    * @method handleGradeChange
    * @description  used to handle row material grade selection
        */
    handleGradeChange = (newValue, actionMeta) => {
        this.setState({ RMGrade: newValue })
        //this.props.fetchSpecificationDataAPI(e.target.value, res => { });
    }

    /**
    * @method handleSpecChange
    * @description  used to handle row material grade selection
        */
    handleSpecChange = (newValue, actionMeta) => {
        this.setState({ RMSpec: newValue })
        //this.props.fetchSpecificationDataAPI(e.target.value, res => { });
    }

    /**
    * @method handleCategoryChange
    * @description  used to handle category selection
    */
    handleCategoryChange = (newValue, actionMeta) => {
        this.setState({ Category: newValue })
    }

    /**
    * @method handleCategoryType
    * @description  used to handle category type selection
    */
    handleCategoryType = (e) => {
        this.props.fetchCategoryAPI(e.target.value, res => { })
    }

    /**
    * @method handleSourceSupplierPlant
    * @description Used handle vendor plants
    */
    handleSourceSupplierPlant = (e) => {
        this.setState({ selectedVendorPlants: e })
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
    * @method handleDestinationSupplier
    * @description called
    */
    handleDestinationSupplier = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({
                vendorSupplier: newValue,
                DestinationSupplierCityArray: [],
                vendorPlant: []
            }, () => {
                const { vendorSupplier } = this.state;
                this.props.getCityBySupplier(vendorSupplier.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ DestinationSupplierCityArray: Data })
                    }
                })
            })
        } else {
            this.setState({ DestinationSupplierCityArray: [], vendorPlant: [] })
        }

    };

    /**
    * @method handleSourceSupplierCity
    * @description called
    */
    handleSourceSupplierCity = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({
                sourceLocation: newValue,
                SourcePlantArray: []
            }, () => {
                // this.props.getPlantByCity(e.target.value, (res) => {
                //     if (res && res.data && res.data.SelectList) {
                //         let Data = res.data.SelectList;
                //         this.setState({ SourcePlantArray: Data })
                //     }
                // })
                const { SourceSupplier, sourceLocation } = this.state;
                // this.props.getPlantByCityAndSupplier(SourceSupplier, sourceLocation.value, (res) => {
                //     if (res && res.data && res.data.SelectList) {
                //         let Data = res.data.SelectList;
                //         this.setState({ SourcePlantArray: Data })
                //     }
                // })
            });
        } else {
            this.setState({
                SourcePlantArray: [],
                sourceLocation: [],
            })
        }
    };

    /**
    * @method handleDestinationSupplierCity
    * @description called
    */
    handleDestinationSupplierCity = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({
                vendorLocation: newValue,
                vendorPlant: []
            }, () => {
                // this.props.getPlantByCity(e.target.value, (res) => {
                //     if (res && res.data && res.data.SelectList) {
                //         let Data = res.data.SelectList;
                //         this.setState({ DestinationPlantArray: Data })
                //     }
                // })
                const { vendorSupplier, vendorLocation } = this.state;
                this.props.getPlantByCityAndSupplier(vendorSupplier.value, vendorLocation.value, (res) => {
                    if (res && res.data && res.data.SelectList) {
                        let Data = res.data.SelectList;
                        this.setState({ vendorPlant: Data })
                    }
                })
            })
        } else {
            this.setState({
                vendorLocation: [],
                vendorPlant: [],
            })
        }
    };

    /**
    * @method handleDestinationSupplierPlant
    * @description called
    */
    handleDestinationSupplierPlant = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorPlant: newValue, })
        } else {
            this.setState({ vendorPlant: [], })
        }
    };

    /**
    * @method handleUOM
    * @description called
    */
    handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ UOM: newValue, })
        } else {
            this.setState({ UOM: [] })
        }
    };

    /**
    * @method handleMessageChange
    * @description used remarks handler
    */
    handleMessageChange = (e) => {
        this.setState({
            remarks: e.target.value
        })
    }

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
     * @method editRawMaterialDetailsHandler
     * @description  used to open RM Detail form 
     */
    editRawMaterialDetailsHandler = (Id) => {
        this.setState({
            isRMOpen: true,
            Id: Id,
            isEditFlag: true,
        })
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({ IsVendor: !this.state.IsVendor });
    }

    /**
    * @method onPressDifferentSource
    * @description Used for Different Source checked
    */
    onPressDifferentSource = () => {
        this.setState({ HasDifferentSource: !this.state.HasDifferentSource });
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
                    const filterData = {
                        PageSize: 0,
                        LastIndex: 0,
                        TechnologyId: '',
                        DestinationSupplierId: '',
                        PlantId: '',
                    }
                    this.props.getMaterialDetailAPI(filterData, res => { });
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
                    const filterData = {
                        PageSize: 0,
                        LastIndex: 0,
                        TechnologyId: '',
                        DestinationSupplierId: '',
                        PlantId: '',
                    }
                    this.props.getMaterialDetailAPI(filterData, res => { });
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
        const { SourceSupplierCityArray, DestinationSupplierCityArray, SourcePlantArray, vendorPlant } = this.state;
        const temp = [];
        if (label === 'material') {
            rowMaterialList && rowMaterialList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'grade') {
            rmGradeList && rmGradeList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'specification') {
            rmSpecification && rmSpecification.map(item =>
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'uom') {
            uniOfMeasurementList && uniOfMeasurementList.map(item =>
                temp.push({ label: item.Text, value: item.Value })
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
                temp.push({ label: item.Text, value: item.Value })
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
            cityList && cityList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'DestinationCity') {
            DestinationSupplierCityArray && DestinationSupplierCityArray.map(item =>
                temp.push({ label: item.Text, value: item.Value })
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
                temp.push({ label: item.Text, value: item.Value })
            );
            return temp;
        }
        if (label === 'SourceSupplierPlant') {
            plantList && plantList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
        if (label === 'DestinationSupplierPlant') {
            vendorPlant && vendorPlant.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

    }

    componentDidUpdate(prevProps) {
        if (prevProps.fieldsObj != this.props.fieldsObj) {
            this.netLandedCalculation()
        }
    }

    basicRateHandler = (e) => {
        this.setState({ basicRate: e.target.value }, () => this.netLandedCalculation())
    }

    QuantityHandler = (e) => {
        this.setState({ Quantity: e.target.value }, () => this.netLandedCalculation())
    }

    netLandedCalculation = () => {
        const { fieldsObj } = this.props;
        const netLandedCost = fieldsObj.BasicRate * fieldsObj.Quantity;
        this.props.change('NetLandedCost', checkForNull(netLandedCost))
    }

    /**
   * @method cancel
   * @description used to Reset form
   */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            isEditFlag: false,
            isShowForm: false,
        })
    }

    /**
    * @method resetForm
    * @description used to Reset form
    */
    resetForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            isEditFlag: false,
            isShowForm: false,
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isEditFlag, pristine, submitting, } = this.props;
        const { files, errors } = this.state;

        const previewStyle = {
            display: 'inline',
            width: 100,
            height: 100,
        };

        return (
            <div>
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-12" >
                            <button
                                type="button"
                                className={'btn btn-primary user-btn mb15'}
                                onClick={() => this.setState({ isShowForm: !this.state.isShowForm })}>Add</button>
                        </div>
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lg login-form">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading">
                                                <h2>{isEditFlag ? `Update Raw Material Details` : `Add Raw Material Details`}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>
                                            {/* <Col md="4" className="mb15">
                                                <label
                                                    className="custom-checkbox"
                                                    onChange={this.onPressVendor}
                                                >
                                                    Raw Material for Vendor?
                                                <input type="checkbox" checked={this.state.IsVendor} />
                                                    <span
                                                        className=" before-box"
                                                        checked={this.state.IsVendor}
                                                        onChange={this.onPressVendor}
                                                    />
                                                </label>
                                            </Col> */}
                                            <Col md="4" className="switch mb15">
                                                <label>
                                                    <div className={'left-title'}>Zero Based</div>
                                                    <Switch
                                                        onChange={this.onPressVendor}
                                                        checked={this.state.IsVendor}
                                                        id="normal-switch"
                                                    />
                                                    <div className={'right-title'}>Vendor Based</div>
                                                </label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    name="RawMaterialId"
                                                    type="text"
                                                    label="Raw Material"
                                                    component={searchableSelect}
                                                    placeholder={'Select Raw Material'}
                                                    options={this.renderListing('material')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.RawMaterial == null || this.state.RawMaterial.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleRMChange}
                                                    valueDescription={this.state.RawMaterial}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="RawMaterialGradeId"
                                                    type="text"
                                                    label="RM Grade"
                                                    component={searchableSelect}
                                                    placeholder={'Select RM Grade'}
                                                    options={this.renderListing('grade')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.RMGrade == null || this.state.RMGrade.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleGradeChange}
                                                    valueDescription={this.state.RMGrade}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="RawMaterialSpecificationId"
                                                    type="text"
                                                    label="RM Spec"
                                                    component={searchableSelect}
                                                    placeholder={'Select RM Spec'}
                                                    options={this.renderListing('specification')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.RMSpec == null || this.state.RMSpec.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleSpecChange}
                                                    valueDescription={this.state.RMSpec}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="CategoryId"
                                                    type="text"
                                                    label="Category"
                                                    component={searchableSelect}
                                                    placeholder={'Select Category'}
                                                    options={this.renderListing('category')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.Category == null || this.state.Category.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleCategoryChange}
                                                    valueDescription={this.state.Category}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label="Plant"
                                                    name="SourceSupplierPlantId"
                                                    placeholder="--Select--"
                                                    selection={this.state.selectedVendorPlants}
                                                    options={this.renderListing('SourceSupplierPlant')}
                                                    selectionChanged={this.handleSourceSupplierPlant}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={true}
                                                    className="multiselect-with-border"
                                                    disabled={this.state.IsVendor ? true : false}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>


                                            <Col md="12">
                                                <div className="left-border">
                                                    {'Vendor'}
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="DestinationSupplierId"
                                                    type="text"
                                                    label="Vendor Name"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select Vendor ---'}
                                                    options={this.renderListing('supplier')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.vendorSupplier == null || this.state.vendorSupplier.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleDestinationSupplier}
                                                    valueDescription={this.state.vendorSupplier}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="DestinationSupplierCityId"
                                                    type="text"
                                                    label="Vendor Location"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select Location ---'}
                                                    options={this.renderListing('DestinationCity')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.vendorLocation == null || this.state.vendorLocation.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleDestinationSupplierCity}
                                                    valueDescription={this.state.vendorLocation}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="DestinationSupplierPlantId"
                                                    type="text"
                                                    label="Vendor Plant"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select Plant ---'}
                                                    options={this.renderListing('DestinationSupplierPlant')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.vendorPlant == null || this.state.vendorPlant.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleDestinationSupplierPlant}
                                                    valueDescription={this.state.vendorPlant}
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="4" className="mb15">
                                                <label
                                                    className={`custom-checkbox ${this.state.IsVendor ? 'disabled' : ''}`}
                                                    onChange={this.onPressDifferentSource}
                                                >
                                                    Has Difference Source?
                                                <input
                                                        type="checkbox"
                                                        checked={this.state.HasDifferentSource}
                                                        disabled={this.state.IsVendor ? true : false}
                                                    />
                                                    <span
                                                        className=" before-box"
                                                        checked={this.state.HasDifferentSource}
                                                        onChange={this.onPressDifferentSource}
                                                    />
                                                </label>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3">
                                                {/* <Field
                                                    label={`Source`}
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
                                                /> */}
                                                <Field
                                                    label={`Source`}
                                                    name={"SourceSupplierId"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="SourceSupplierCityId"
                                                    type="text"
                                                    label="Source Location"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select Plant ---'}
                                                    options={this.renderListing('SourceCity')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.sourceLocation == null || this.state.sourceLocation.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleSourceSupplierCity}
                                                    valueDescription={this.state.sourceLocation}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="UnitOfMeasurementId"
                                                    type="text"
                                                    label="UOM"
                                                    component={searchableSelect}
                                                    placeholder={'--- Select ---'}
                                                    options={this.renderListing('uom')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleUOM}
                                                    valueDescription={this.state.UOM}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Basic Rate/UOM (INR)`}
                                                    name={"BasicRate"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                        </Row>


                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label={`Scrap Rate (INR)`}
                                                    name={"ScrapRate"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    className=""
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Net Landed Cost (INR/UOM)`}
                                                    name={"NetLandedCost"}
                                                    type="text"
                                                    placeholder={''}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <div className="left-border">
                                                    {'Remarks & Attachment'}
                                                </div>
                                            </Col>
                                            <Col md="6">
                                                <Field
                                                    label={'Remarks'}
                                                    name={`Remark`}
                                                    placeholder="Type here..."
                                                    value={this.state.remarks}
                                                    className=""
                                                    customClassName=" textAreaWithBorder"
                                                    onChange={this.handleMessageChange}
                                                    validate={[required, maxLength100]}
                                                    required={true}
                                                    component={renderTextAreaField}
                                                    maxLength="5000"
                                                />
                                            </Col>
                                            <Col md="6">

                                            </Col>

                                        </Row>
                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-12 text-center">
                                                <button
                                                    type="submit"
                                                    className="btn login-btn w-10 dark-pinkbtn mr15" >
                                                    {isEditFlag ? 'Update' : 'Save'}
                                                </button>

                                                {!this.props.isEditFlag &&
                                                    <input
                                                        disabled={pristine || submitting}
                                                        onClick={this.resetForm}
                                                        type="submit"
                                                        value="Reset"
                                                        className="btn login-btn w-10 dark-pinkbtn"
                                                    />}
                                                {this.props.isEditFlag &&
                                                    <input
                                                        //disabled={pristine || submitting}
                                                        onClick={this.cancel}
                                                        type="submit"
                                                        value="Cancel"
                                                        className="btn login-btn w-10 dark-pinkbtn"
                                                    />}
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <MaterialDetail editRawMaterialDetailsHandler={this.editRawMaterialDetailsHandler} />
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, material } = state;
    const fieldsObj = selector(state, 'BasicRate', 'Quantity');

    const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
        supplierList, cityList, technologyList, categoryList, filterPlantListByCity,
        filterCityListBySupplier, filterPlantListByCityAndSupplier } = comman;

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
        filterPlantListByCity, filterCityListBySupplier, rawMaterialDetailsData, initialValues,
        fieldsObj, filterPlantListByCityAndSupplier,
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
    getPlantByCityAndSupplier,
    updateRawMaterialDetailsAPI,
})(reduxForm({
    form: 'AddRMDetail',
    enableReinitialize: true,
})(AddRMDetail));
