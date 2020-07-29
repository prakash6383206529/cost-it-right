import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Container, Row, Col, Table } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderSelectField, renderNumberInputField, searchableSelect,
    renderMultiSelectField, renderTextAreaField
} from "../../../layout/FormInputs";
import {
    getTechnologySelectList, getPlantSelectList, getPlantBySupplier, getUOMSelectList,
} from '../../../../actions/master/Comman';
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import { getMachineTypeSelectList, getProcessesSelectList } from '../../../../actions/master/MachineMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId } from "../../../../helper/auth";
import Switch from "react-switch";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import $ from 'jquery';
import { FILE_URL } from '../../../../config/constants';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import HeaderTitle from '../../../common/HeaderTitle';
import AddMachineTypeDrawer from './AddMachineTypeDrawer';
import AddProcessDrawer from './AddProcessDrawer';
import NoContentFound from '../../../common/NoContentFound';
const selector = formValueSelector('AddMoreDetails');

class AddMoreDetails extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            BOPID: '',
            isEditFlag: false,
            IsPurchased: false,
            isMoreDetails: false,

            selectedTechnology: [],
            vendorName: [],
            selectedVendorPlants: [],
            selectedPlants: [],

            machineType: [],
            isOpenMachineType: false,

            processName: [],
            isOpenProcessDrawer: false,

            processGrid: [],
            processGridEditIndex: '',
            isEditIndex: false,
            machineRate: '',

        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    componentWillMount() {


    }

    /**
     * @method componentDidMount
     * @description Called after rendering the component
     */
    componentDidMount() {
        this.props.getTechnologySelectList(() => { })
        this.props.getVendorListByVendorType(true, () => { })
        this.props.getPlantSelectList(() => { })
        this.props.getMachineTypeSelectList(() => { })
        this.props.getUOMSelectList(() => { })
        this.props.getProcessesSelectList(() => { })
    }

    /**
    * @method onPressOwnership
    * @description Used for Vendor checked
    */
    onPressOwnership = () => {
        this.setState({
            IsPurchased: !this.state.IsPurchased,
        }, () => {
            //const { IsVendor } = this.state;
            //this.props.getVendorListByVendorType(true, () => { })
        });
    }

    /**
    * @method handleTechnology
    * @description Used handle technology
    */
    handleTechnology = (e) => {
        this.setState({ selectedTechnology: e })
    }




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
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = (data) => {
        // if (data && data.isEditFlag) {
        //     this.setState({
        //         isEditFlag: false,
        //         isLoader: true,
        //         isShowForm: true,
        //         BOPID: data.Id,
        //     })
        //     $('html, body').animate({ scrollTop: 0 }, 'slow');
        //     this.props.getBOPDomesticById(data.Id, res => {
        //         if (res && res.data && res.data.Result) {

        //             const Data = res.data.Data;

        //             this.props.getVendorListByVendorType(Data.IsVendor, () => { })
        //             this.props.getPlantBySupplier(Data.Vendor, () => { })

        //             setTimeout(() => {
        //                 const { gradeSelectListByRMID, rmSpecification, cityList, bopCategorySelectList,
        //                     filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList,
        //                     vendorListByVendorType } = this.props;

        //                 const categoryObj = bopCategorySelectList && bopCategorySelectList.find(item => item.Value == Data.Category)

        //                 let plantArray = [];
        //                 Data && Data.Plant.map((item) => {
        //                     plantArray.push({ Text: item.PlantName, Value: item.PlantId })
        //                     return plantArray;
        //                 })

        //                 const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value == Data.Vendor)

        //                 let vendorPlantArray = [];
        //                 Data && Data.VendorPlant.map((item) => {
        //                     vendorPlantArray.push({ Text: item.PlantName, Value: item.PlantId })
        //                     return vendorPlantArray;
        //                 })

        //                 const vendorLocationObj = filterCityListBySupplier && filterCityListBySupplier.find(item => item.Value == Data.VendorLocation)
        //                 const sourceLocationObj = cityList && cityList.find(item => item.Value == Data.SourceLocation)

        //                 let tempArr = [];
        //                 let tempFiles = [];

        //                 this.setState({
        //                     isEditFlag: true,
        //                     isLoader: false,
        //                     isShowForm: true,
        //                     IsVendor: Data.IsVendor,
        //                     BOPCategory: { label: categoryObj.Text, value: categoryObj.Value },
        //                     selectedPlants: plantArray,
        //                     vendorName: { label: vendorObj.Text, value: vendorObj.Value },
        //                     selectedVendorPlants: vendorPlantArray,
        //                     vendorLocation: { label: vendorLocationObj.Text, value: vendorLocationObj.Value },
        //                     sourceLocation: { label: sourceLocationObj.Text, value: sourceLocationObj.Value },
        //                     remarks: Data.Remark,
        //                 })
        //             }, 200)
        //         }
        //     })
        // } else {
        //     this.props.getBOPDomesticById('', res => { })
        // }
    }

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { technologySelectList, vendorListByVendorType, plantSelectList, plantList, filterPlantList, filterCityListBySupplier, cityList,
            UOMSelectList, machineTypeSelectList, processSelectList, } = this.props;
        const temp = [];
        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorPlant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'MachineTypeList') {
            machineTypeSelectList && machineTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'ProcessNameList') {
            processSelectList && processSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorLocation') {
            filterCityListBySupplier && filterCityListBySupplier.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'SourceLocation') {
            cityList && cityList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'UOM') {
            UOMSelectList && UOMSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
    }

    /**
    * @method handlePartAssembly
    * @description Used handle Part Assembly
    */
    handlePartAssembly = (e) => {
        this.setState({ selectedPartAssembly: e })
    }

    /**
    * @method handlePlant
    * @description Used handle Plant
    */
    handlePlant = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [], vendorLocation: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], vendorLocation: [] })
        }
    };

    /**
     * @method handleVendorPlant
     * @description called
     */
    handleVendorPlant = (e) => {
        this.setState({ selectedVendorPlants: e })
    };

    /**
     * @method handlePlants
     * @description Used handle Plants
     */
    handlePlants = (e) => {
        this.setState({ selectedPlants: e })
    }

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ machineType: newValue });
        } else {
            this.setState({ machineType: [], })
        }
    };

    machineTypeToggler = () => {
        this.setState({ isOpenMachineType: true })
    }

    closeMachineTypeDrawer = (e = '') => {
        this.setState({ isOpenMachineType: false }, () => {
            this.props.getMachineTypeSelectList(() => { })
        })
    }

    moreDetailsToggler = () => {
        this.props.displayMoreDetailsForm()
        this.setState({ isMoreDetails: !this.state.isMoreDetails })
    }

    /**
    * @method handleProcessName
    * @description called
    */
    handleProcessName = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ processName: newValue });
        } else {
            this.setState({ processName: [] })
        }
    };

    processToggler = () => {
        this.setState({ isOpenProcessDrawer: true })
    }

    closeProcessDrawer = (e = '') => {
        this.setState({ isOpenProcessDrawer: false }, () => {
            //this.props.getMachineTypeSelectList(() => { })
        })
    }

    /**
    * @method handleUOM
    * @description called
    */
    handleUOM = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ UOM: newValue });
        } else {
            this.setState({ UOM: [] })
        }
    };

    handleMachineRate = (e) => {
        const value = e.target.value;
        this.setState({ machineRate: value })
    }

    processTableHandler = () => {
        const { processName, UOM, processGrid, machineRate, } = this.state;
        const tempArray = [];

        tempArray.push(...processGrid, {
            processName: processName.label,
            processNameId: processName.value,
            UOM: UOM.label,
            UOMId: UOM.value,
            machineRate: machineRate,
        })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
            machineRate: '',
        }, () => this.props.change('MachineRate', ''));
    }

    /**
  * @method updateProcessGrid
  * @description Used to handle updateProcessGrid
  */
    updateProcessGrid = () => {
        const { processName, UOM, processGrid, machineRate, processGridEditIndex } = this.state;
        let tempArray = [];

        let tempData = processGrid[processGridEditIndex];
        tempData = {
            processName: processName.label,
            processNameId: processName.value,
            UOM: UOM.label,
            UOMId: UOM.value,
            machineRate: machineRate,
        }

        tempArray = Object.assign([...processGrid], { [processGridEditIndex]: tempData })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
            machineRate: '',
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => this.props.change('MachineRate', ''));
    };

    /**
  * @method resetProcessGridData
  * @description Used to handle setTechnologyLevel
  */
    resetProcessGridData = () => {
        this.setState({
            processName: [],
            UOM: [],
            machineRate: '',
            processGridEditIndex: '',
            isEditIndex: false,
        });
    };

    /**
    * @method editItemDetails
    * @description used to Reset form
    */
    editItemDetails = (index) => {
        const { processGrid } = this.state;
        const tempData = processGrid[index];

        this.setState({
            processGridEditIndex: index,
            isEditIndex: true,
            processName: { label: tempData.processName, value: tempData.processNameId },
            UOM: { label: tempData.UOM, value: tempData.UOMId },
        }, () => this.props.change('MachineRate', tempData.machineRate))
    }

    /**
    * @method deleteItem
    * @description used to Reset form
    */
    deleteItem = (index) => {
        const { processGrid } = this.state;

        let tempData = processGrid.filter((item, i) => {
            if (i == index) {
                return false;
            }
            return true;
        });

        this.setState({
            processGrid: tempData
        })
    }

    handleCalculation = () => {
        const { fieldsObj } = this.props
        const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces != undefined ? fieldsObj.NumberOfPieces : 0;
        const BasicRate = fieldsObj && fieldsObj.BasicRate != undefined ? fieldsObj.BasicRate : 0;
        const NetLandedCost = checkForNull(BasicRate / NoOfPieces)
        this.props.change('NetLandedCost', NetLandedCost)
    }

    /**
    * @method handleChange
    * @description Handle Effective Date
    */
    handleEffectiveDateChange = (date) => {
        this.setState({
            effectiveDate: date,
        });
    };

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    clearForm = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            remarks: '',
            isShowForm: false,
            IsVendor: false,
        })
        this.props.hideMoreDetailsForm()
        //this.props.getRawMaterialDetailsAPI('', false, res => { })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        this.clearForm()
    }

    /**
    * @method resetForm
    * @description used to Reset form
    */
    resetForm = () => {
        this.clearForm()
    }



    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, remarks, BOPID, isEditFlag, files, effectiveDate, receivedFiles } = this.state;
        const { reset } = this.props;

        // let plantArray = [];
        // selectedPlants && selectedPlants.map((item) => {
        //     plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
        //     return plantArray;
        // })

        // let vendorPlantArray = [];
        // selectedVendorPlants && selectedVendorPlants.map((item) => {
        //     vendorPlantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' })
        //     return vendorPlantArray;
        // })

        if (isEditFlag) {

            let requestData = {

            }

            // this.props.updateBOPDomestic(requestData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.UPDATE_BOP_SUCESS);
            //         this.clearForm();
            //         this.child.getUpdatedData();
            //     }
            // })

        } else {

            const formData = {

            }

            // this.props.createBOPDomestic(formData, (res) => {
            //     if (res.data.Result) {
            //         toastr.success(MESSAGES.BOP_ADD_SUCCESS);
            //         this.clearForm();
            //         this.child.getUpdatedData();
            //     }
            // });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, pristine, submitting, } = this.props;
        const { files, errors, isEditFlag, isOpenMachineType, isMoreDetails, isOpenProcessDrawer, } = this.state;

        const previewStyle = {
            display: 'inline',
            width: 100,
            height: 100,
        };

        return (
            <>
                <div>
                    <div className="login-container signup-form">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="shadow-lgg login-formg">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-heading">
                                                <h2>{isEditFlag ? `Update More Details` : `Add More Details`}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Machine:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3" className="switch mb15">
                                                <label>Ownership</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Purchased</div>
                                                    <Switch
                                                        onChange={this.onPressOwnership}
                                                        checked={this.state.IsPurchased}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>Leased</div>
                                                </label>
                                            </Col>

                                            <Col md="3">
                                                <Field
                                                    label="Plant"
                                                    name="Plant"
                                                    placeholder="--Select--"
                                                    selection={(this.state.selectedPlants == null || this.state.selectedPlants.length == 0) ? [] : this.state.selectedPlants}
                                                    options={this.renderListing('plant')}
                                                    selectionChanged={this.handlePlants}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={true}
                                                    className="multiselect-with-border"
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine No.`}
                                                    name={"MachineNumber"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Name`}
                                                    name={"MachineName"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="2">
                                                <Field
                                                    name="MachineType"
                                                    type="text"
                                                    label="Machine Type"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('MachineTypeList')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.machineType == null || this.state.machineType.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleMachineType}
                                                    valueDescription={this.state.machineType}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="1">
                                                <div
                                                    onClick={this.machineTypeToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Manufacturer`}
                                                    name={"Manufacture"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Year Of Manufacturing`}
                                                    name={"YearOfManufacturing"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Capacity / Tonnage`}
                                                    name={"TonnageCapacity"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Cost (INR)`}
                                                    name={"MachineCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Accessories Cost (INR)`}
                                                    name={"AccessoriesCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Installation Charges (INR)`}
                                                    name={"InstallationCharges"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={isEditFlag ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Total Cost (INR)`}
                                                    name={"TotalCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Loan & Interest:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Loan (%)`}
                                                    name={"LoanPercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Loan Value`}
                                                    name={"LoanValue"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Equity (%)`}
                                                    name={"EquityPercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Equity Value`}
                                                    name={"EquityValue"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Rate Of Interest (%)`}
                                                    name={"RateOfInterestPercentage"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Rate Of Interest Value`}
                                                    name={"RateOfInterestValue"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderNumberInputField}
                                                    required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Working Hours:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Depreciation:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Variable Cost:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Power:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Labour:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Process:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    name="ProcessName"
                                                    type="text"
                                                    label="Process Name"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('ProcessNameList')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                                    //required={true}
                                                    handleChangeDescription={this.handleProcessName}
                                                    valueDescription={this.state.processName}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="1">
                                                <div
                                                    onClick={this.processToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="UOM"
                                                    type="text"
                                                    label="UOM"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('UOM')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    //validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                                    //required={true}
                                                    handleChangeDescription={this.handleUOM}
                                                    valueDescription={this.state.UOM}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Rate (INR)`}
                                                    name={"MachineRate"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    onChange={this.handleMachineRate}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName=" withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <div>
                                                    {this.state.isEditIndex ?
                                                        <>
                                                            <button
                                                                type="button"
                                                                className={'btn btn-primary mt30 pull-left mr5'}
                                                                onClick={this.updateProcessGrid}
                                                            >Update</button>

                                                            <button
                                                                type="button"
                                                                className={'cancel-btn mt30 pull-left'}
                                                                onClick={this.resetProcessGridData}
                                                            >Cancel</button>
                                                        </>
                                                        :
                                                        <button
                                                            type="button"
                                                            className={'user-btn mt30 pull-left'}
                                                            onClick={this.processTableHandler}>
                                                            <div className={'plus'}></div>ADD</button>}


                                                </div>
                                            </Col>
                                            <Col md="12">
                                                <Table className="table" size="sm" >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Process Name`}</th>
                                                            <th>{`UOM`}</th>
                                                            <th>{`Machine Rate (INR)`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {
                                                            this.state.processGrid &&
                                                            this.state.processGrid.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.processName}</td>
                                                                        <td>{item.UOM}</td>
                                                                        <td>{item.machineRate}</td>
                                                                        <td>
                                                                            <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(index)} />
                                                                            <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                    {this.state.processGrid.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </Table>
                                            </Col>

                                        </Row>

                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-12 text-center">
                                                <button
                                                    type={'button'}
                                                    className="reset mr15 cancel-btn"
                                                    onClick={this.cancel} >
                                                    {'Cancel'}
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="submit-button mr5 save-btn" >
                                                    {isEditFlag ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </Row>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isOpenMachineType && <AddMachineTypeDrawer
                    isOpen={isOpenMachineType}
                    closeDrawer={this.closeMachineTypeDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
                {isOpenProcessDrawer && <AddProcessDrawer
                    isOpen={isOpenProcessDrawer}
                    closeDrawer={this.closeProcessDrawer}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                />}
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    const { comman, material, machine, } = state;
    const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate',);

    const { plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList, } = comman;
    const { machineTypeSelectList, processSelectList } = machine;
    const { vendorListByVendorType } = material;

    let initialValues = {};
    // if (bopData && bopData != undefined) {
    //     initialValues = {
    //         BoughtOutPartNumber: bopData.BoughtOutPartNumber,
    //         BoughtOutPartName: bopData.BoughtOutPartName,
    //         Specification: bopData.Specification,
    //         Source: bopData.Source,
    //         BasicRate: bopData.BasicRatePerUOM,
    //         NumberOfPieces: bopData.NumberOfPieces,
    //         NetLandedCost: bopData.NetLandedCost,
    //         Remark: bopData.Remark,
    //     }
    // }

    return {
        vendorListByVendorType, plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList,
        machineTypeSelectList, processSelectList, fieldsObj, initialValues,
    }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getVendorListByVendorType,
    getPlantSelectList,
    getPlantBySupplier,
    getUOMSelectList,
    getMachineTypeSelectList,
    getProcessesSelectList,
})(reduxForm({
    form: 'AddMoreDetails',
    enableReinitialize: true,
})(AddMoreDetails));
