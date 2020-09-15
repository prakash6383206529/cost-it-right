import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import { required, checkForNull, maxLength100 } from "../../../../helper/validation";
import {
    renderText, renderNumberInputField, searchableSelect, renderTextAreaField,
    renderMultiSelectField,
} from "../../../layout/FormInputs";
import {
    getTechnologySelectList, getPlantSelectList, getPlantBySupplier, getUOMSelectList,
} from '../../../../actions/master/Comman';
import { getVendorListByVendorType, } from '../../../../actions/master/Material';
import {
    createMachine, updateMachine, getMachineTypeSelectList, getProcessesSelectList, fileUploadMachine, fileDeleteMachine,
    checkAndGetMachineNumber, getMachineData,
} from '../../../../actions/master/MachineMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { CONSTANT } from '../../../../helper/AllConastant'
import { loggedInUserId, userDetails } from "../../../../helper/auth";
import Switch from "react-switch";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import $ from 'jquery';
import { FILE_URL } from '../../../../config/constants';
import HeaderTitle from '../../../common/HeaderTitle';
import AddMachineTypeDrawer from './AddMachineTypeDrawer';
import AddProcessDrawer from './AddProcessDrawer';
import NoContentFound from '../../../common/NoContentFound';
import { reactLocalStorage } from "reactjs-localstorage";
const selector = formValueSelector('AddMachineRate');

class AddMachineRate extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            MachineID: '',
            isEditFlag: false,
            IsVendor: false,

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

            remarks: '',
            files: [],
            isConfigurableMachineNumber: false,

        }
    }

    /**
    * @method componentWillMount
    * @description Called before render the component
    */
    UNSAFE_componentWillMount() {
        let initialConfigureData = reactLocalStorage.getObject('InitialConfiguration')
        this.setState({
            isConfigurableMachineNumber: initialConfigureData.IsMachineNumberConfigure
        })
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

        if (this.state.isConfigurableMachineNumber) {
            this.props.checkAndGetMachineNumber('', res => {
                let Data = res.data.DynamicData;
                this.props.change('MachineNumber', Data.MachineNumber)
            })
        }

        this.getDetails()
    }

    componentWillUnmount() {
        const { selectedPlants, machineType, } = this.state;
        const { fieldsObj } = this.props;
        let data = {
            fieldsObj: fieldsObj,
            selectedPlants: selectedPlants,
            machineType: machineType,
        }
        this.props.setData(data)
    }

    /**
    * @method getDetails
    * @description Used to get Details
    */
    getDetails = () => {
        const { data } = this.props
        if (data && data.isEditFlag) {
            this.setState({
                isEditFlag: false,
                isLoader: true,
                MachineID: data.Id,
            })
            $('html, body').animate({ scrollTop: 0 }, 'slow');
            this.props.getMachineData(data.Id, res => {
                if (res && res.data && res.data.Result) {

                    const Data = res.data.Data;

                    this.props.getVendorListByVendorType(Data.IsVendor, () => { })
                    if (Data.IsVendor) {
                        this.props.getPlantBySupplier(Data.VendorId, () => { })
                    }

                    setTimeout(() => {
                        const { vendorListByVendorType, machineTypeSelectList, } = this.props;

                        let technologyArray = Data && Data.Technology.map((item) => ({ Text: item.Technology, Value: item.TechnologyId }))
                        let plantArray = Data && Data.Plant.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))

                        let MachineProcessArray = Data && Data.MachineProcessRates.map(el => {
                            return {
                                processName: el.ProcessName,
                                ProcessId: el.ProcessId,
                                UOM: 'Kal add karwana h.',
                                UnitOfMeasurementId: el.UnitOfMeasurementId,
                                MachineRate: el.MachineRate,
                            }
                        })

                        const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value === Data.VendorId)

                        let vendorPlantArray = Data && Data.VendorPlant.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))

                        const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Value === Data.MachineTypeId)

                        this.setState({
                            isEditFlag: true,
                            isLoader: false,
                            IsVendor: Data.IsVendor,
                            selectedTechnology: technologyArray,
                            selectedPlants: plantArray,
                            vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
                            selectedVendorPlants: vendorPlantArray,
                            machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
                            processGrid: MachineProcessArray,
                            remarks: Data.Remark,
                            files: [],
                        })
                    }, 100)
                }
            })
        } else {
            this.props.getMachineData('', res => { })
        }
    }

    /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */
    onPressVendor = () => {
        this.setState({
            IsVendor: !this.state.IsVendor,
            vendorName: [],
            selectedVendorPlants: [],
            vendorLocation: [],
            selectedPlants: [],
        }, () => {
            this.props.getVendorListByVendorType(true, () => { })
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
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { technologySelectList, vendorListByVendorType, plantSelectList, filterPlantList,
            UOMSelectList, machineTypeSelectList, processSelectList, } = this.props;
        const temp = [];
        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorNameList') {
            vendorListByVendorType && vendorListByVendorType.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'VendorPlant') {
            filterPlantList && filterPlantList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ Text: item.Text, Value: item.Value })
            });
            return temp;
        }
        if (label === 'MachineTypeList') {
            machineTypeSelectList && machineTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'ProcessNameList') {
            processSelectList && processSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'UOM') {
            UOMSelectList && UOMSelectList.map(item => {
                if (item.Value === '0') return false;
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
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, selectedVendorPlants: [], vendorLocation: [] }, () => {
                const { vendorName } = this.state;
                this.props.getPlantBySupplier(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], selectedVendorPlants: [], vendorLocation: [] })
            this.props.getPlantBySupplier('', () => { })
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
        if (newValue && newValue !== '') {
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
    }

    /**
    * @method handleProcessName
    * @description called
    */
    handleProcessName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
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
        if (newValue && newValue !== '') {
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
        const { processName, UOM, processGrid, } = this.state;
        const { fieldsObj } = this.props;
        const tempArray = [];

        if (processName.length === 0 || UOM.length === 0) {
            toastr.warning('Fields should not be empty');
            return false;
        }

        //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
        const isExist = processGrid.findIndex(el => (el.processNameId === processName.value && el.UOMId === UOM.value))
        if (isExist !== -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const MachineRate = fieldsObj && fieldsObj.MachineRate !== undefined ? checkForNull(fieldsObj.MachineRate) : 0;

        tempArray.push(...processGrid, {
            processName: processName.label,
            ProcessId: processName.value,
            UOM: UOM.label,
            UnitOfMeasurementId: UOM.value,
            MachineRate: MachineRate,
        })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
        }, () => this.props.change('MachineRate', 0));
    }

    /**
  * @method updateProcessGrid
  * @description Used to handle updateProcessGrid
  */
    updateProcessGrid = () => {
        const { processName, UOM, processGrid, processGridEditIndex } = this.state;
        const { fieldsObj } = this.props;
        let tempArray = [];

        //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
        let skipEditedItem = processGrid.filter((el, i) => {
            if (i === processGridEditIndex) return false;
            return true;
        })

        //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
        const isExist = skipEditedItem.findIndex(el => (el.ProcessId === processName.value && el.UnitOfMeasurementId === UOM.value))
        if (isExist !== -1) {
            toastr.warning('Already added, Please check the values.')
            return false;
        }

        const MachineRate = fieldsObj && fieldsObj.MachineRate !== undefined ? checkForNull(fieldsObj.MachineRate) : 0;

        let tempData = processGrid[processGridEditIndex];
        tempData = {
            processName: processName.label,
            ProcessId: processName.value,
            UOM: UOM.label,
            UnitOfMeasurementId: UOM.value,
            MachineRate: MachineRate,
        }

        tempArray = Object.assign([...processGrid], { [processGridEditIndex]: tempData })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => this.props.change('MachineRate', 0));
    };

    /**
  * @method resetProcessGridData
  * @description Used to handle setTechnologyLevel
  */
    resetProcessGridData = () => {
        this.setState({
            processName: [],
            UOM: [],
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => () => this.props.change('MachineRate', 0));
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
            processName: { label: tempData.processName, value: tempData.ProcessId },
            UOM: { label: tempData.UOM, value: tempData.UnitOfMeasurementId },
        }, () => this.props.change('MachineRate', tempData.MachineRate))
    }

    /**
    * @method deleteItem
    * @description used to Reset form
    */
    deleteItem = (index) => {
        const { processGrid } = this.state;

        let tempData = processGrid.filter((item, i) => {
            if (i === index) {
                return false;
            }
            return true;
        });

        this.setState({ processGrid: tempData })
    }

    handleCalculation = () => {
        const { fieldsObj } = this.props
        const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 0;
        const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
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

    /**
    * @method checkUniqNumber
    * @description CHECK UNIQ MACHINE NUMBER
    */
    checkUniqNumber = (e) => {
        this.props.checkAndGetMachineNumber(e.target.value, res => {
            if (res && res.data && res.data.Result === false) {
                toastr.warning(res.data.Message);
                $('input[name="MachineNumber"]').focus()
            }
        })
    }

    formToggle = () => {
        this.setState({
            isShowForm: !this.state.isShowForm
        })
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            remarks: '',
            isShowForm: false,
            IsVendor: false,
        })
        this.props.hideForm()
    }

    // specify upload params and url for your files
    getUploadParams = ({ file, meta }) => {
        return { url: 'https://httpbin.org/post', }

    }

    // called every time a file's `status` changes
    handleChangeStatus = ({ meta, file }, status) => {
        const { files, } = this.state;

        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
            this.setState({ files: tempArr })
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            this.props.fileUploadMachine(data, (res) => {
                let Data = res.data[0]
                const { files } = this.state;
                files.push(Data)
                this.setState({ files: files })
            })
        }

        if (status === 'rejected_file_type') {
            toastr.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }

    renderImages = () => {
        this.state.files && this.state.files.map(f => {
            const withOutTild = f.FileURL.replace('~', '')
            const fileURL = `${FILE_URL}${withOutTild}`;
            return (
                <div className={'attachment-wrapper images'}>
                    <img src={fileURL} alt={''} />
                    <button
                        type="button"
                        onClick={() => this.deleteFile(f.FileId)}>X</button>
                </div>
            )
        })
    }

    deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            let deleteData = {
                Id: FileId,
                DeletedBy: loggedInUserId(),
            }
            this.props.fileDeleteMachine(deleteData, (res) => {
                toastr.success('File has been deleted successfully.')
                let tempArr = this.state.files.filter(item => item.FileId !== FileId)
                this.setState({ files: tempArr })
            })
        }
        if (FileId == null) {
            let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
            this.setState({ files: tempArr })
        }
    }

    Preview = ({ meta }) => {
        const { name, percent, status } = meta
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }


    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {
        const { IsVendor, isEditFlag, vendorName, selectedTechnology, selectedPlants, selectedVendorPlants, remarks,
            machineType, files, processGrid, } = this.state;
        const userDetail = userDetails()

        let plantArray = selectedPlants && selectedPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

        let technologyArray = selectedTechnology && selectedTechnology.map((item) => ({ Technology: item.Text, TechnologyId: item.Value, }))

        let vendorPlantArray = selectedVendorPlants && selectedVendorPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))

        if (isEditFlag) {
            let updatedFiles = files.map((file) => {
                return { ...file, ContextId: '' }
            })

            let requestData = {

            }

            this.props.updateMachine(requestData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_MACHINE_SUCCESS);
                    this.cancel();
                }
            })

        } else {

            const formData = {
                IsVendor: IsVendor,
                VendorId: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
                MachineNumber: values.MachineNumber,
                MachineName: values.MachineName,
                MachineTypeId: machineType.value,
                TonnageCapacity: values.TonnageCapacity,
                Description: values.Description,
                IsActive: true,
                LoggedInUserId: loggedInUserId(),
                MachineProcessRates: processGrid,
                Technology: technologyArray,
                Plant: plantArray,
                VendorPlant: vendorPlantArray,
                Remark: remarks,
                Attachements: files,
            }

            this.props.createMachine(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.MACHINE_ADD_SUCCESS);
                    this.cancel();
                }
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { files, isConfigurableMachineNumber, isEditFlag, isOpenMachineType, isOpenProcessDrawer, } = this.state;

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
                                                <h2>{isEditFlag ? `Update Machine` : `Add Machine`}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        noValidate
                                        className="form"
                                        onSubmit={handleSubmit(this.onSubmit.bind(this))}
                                    >
                                        <Row>
                                            <Col md="4" className="switch mb15">
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Zero Based</div>
                                                    <Switch
                                                        onChange={this.onPressVendor}
                                                        checked={this.state.IsVendor}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                        background="#4DC771"
                                                        onColor="#4DC771"
                                                        onHandleColor="#ffffff"
                                                        offColor="#4DC771"
                                                        uncheckedIcon={false}
                                                        checkedIcon={false}
                                                        height={20}
                                                        width={46}
                                                    />
                                                    <div className={'right-title'}>Vendor Based</div>
                                                </label>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Machine:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label="Technology"
                                                    name="technology"
                                                    placeholder="--Select--"
                                                    selection={(this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0) ? [] : this.state.selectedTechnology}
                                                    options={this.renderListing('technology')}
                                                    selectionChanged={this.handleTechnology}
                                                    optionValue={option => option.Value}
                                                    optionLabel={option => option.Text}
                                                    component={renderMultiSelectField}
                                                    mendatory={true}
                                                    className="multiselect-with-border"
                                                //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                                                />
                                            </Col>
                                            {this.state.IsVendor &&
                                                <Col md="3">
                                                    <Field
                                                        name="VendorName"
                                                        type="text"
                                                        label="Vendor Name"
                                                        component={searchableSelect}
                                                        placeholder={'--select--'}
                                                        options={this.renderListing('VendorNameList')}
                                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                                        validate={(this.state.vendorName == null || this.state.vendorName.length === 0) ? [required] : []}
                                                        required={true}
                                                        handleChangeDescription={this.handleVendorName}
                                                        valueDescription={this.state.vendorName}
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>}
                                            {this.state.IsVendor &&
                                                <Col md="3">
                                                    <Field
                                                        label="Vendor Plant"
                                                        name="VendorPlant"
                                                        placeholder="--- Plant ---"
                                                        selection={(this.state.selectedVendorPlants == null || this.state.selectedVendorPlants.length === 0) ? [] : this.state.selectedVendorPlants}
                                                        options={this.renderListing('VendorPlant')}
                                                        selectionChanged={this.handleVendorPlant}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>}
                                            {!this.state.IsVendor &&
                                                <Col md="3">
                                                    <Field
                                                        label="Plant"
                                                        name="Plant"
                                                        placeholder="--Select--"
                                                        selection={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [] : this.state.selectedPlants}
                                                        options={this.renderListing('plant')}
                                                        selectionChanged={this.handlePlants}
                                                        optionValue={option => option.Value}
                                                        optionLabel={option => option.Text}
                                                        component={renderMultiSelectField}
                                                        mendatory={true}
                                                        className="multiselect-with-border"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Machine No.`}
                                                    name={"MachineNumber"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    validate={[required]}
                                                    component={renderText}
                                                    required={true}
                                                    onBlur={this.checkUniqNumber}
                                                    disabled={(isEditFlag || isConfigurableMachineNumber) ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
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
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
                                                        <Field
                                                            name="MachineType"
                                                            type="text"
                                                            label="Machine Type"
                                                            component={searchableSelect}
                                                            placeholder={'--select--'}
                                                            options={this.renderListing('MachineTypeList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.machineType == null || this.state.machineType.length === 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleMachineType}
                                                            valueDescription={this.state.machineType}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </div>
                                                    {!isEditFlag && <div
                                                        onClick={this.machineTypeToggler}
                                                        className={'plus-icon-square mr5 right'}>
                                                    </div>}
                                                </div>
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
                                            <Col md="3">
                                                <Field
                                                    label={`Description`}
                                                    name={"Description"}
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

                                            {!this.state.IsVendor &&
                                                <Col md="12">
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className={'user-btn'}
                                                            onClick={this.moreDetailsToggler}>
                                                            <div className={'plus'}></div>ADD MORE DETAILS</button>

                                                    </div>
                                                </Col>}
                                            <hr />
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Process:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                                    <div className="fullinput-icon">
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
                                                    </div>
                                                    {!isEditFlag && <div
                                                        onClick={this.processToggler}
                                                        className={'plus-icon-square mr5 right'}>
                                                    </div>}
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
                                                                        <td>{item.MachineRate}</td>
                                                                        <td>
                                                                            <button className="Edit mr5" type={'button'} onClick={() => this.editItemDetails(index)} />
                                                                            <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                    {this.state.processGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </Table>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" className="filter-block">
                                                <div className=" flex-fills mb-2">
                                                    <h5>{'Remarks & Attachment'}</h5>
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
                                                    rows="6"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <label>Upload Files (upload up to 3 files)</label>
                                                {this.state.files.length >= 3 ? '' :
                                                    <Dropzone
                                                        getUploadParams={this.getUploadParams}
                                                        onChangeStatus={this.handleChangeStatus}
                                                        PreviewComponent={this.Preview}
                                                        //onSubmit={this.handleSubmit}
                                                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf"
                                                        initialFiles={this.state.initialFiles}
                                                        maxFiles={3}
                                                        maxSizeBytes={2000000}
                                                        inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : 'Drag Files')}
                                                        styles={{
                                                            dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                                                            inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                                                        }}
                                                        classNames="draper-drop"
                                                    />}
                                            </Col>
                                            <Col md="3">
                                                <div className={'attachment-wrapper'}>
                                                    {
                                                        this.state.files && this.state.files.map(f => {
                                                            const withOutTild = f.FileURL.replace('~', '')
                                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                                            return (
                                                                <div className={'attachment images'}>
                                                                    <a href={fileURL} target="_blank">{f.OriginalFileName}</a>
                                                                    {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                                                    <img className="float-right" alt={''} onClick={() => this.deleteFile(f.FileId, f.FileName)} src={require('../../../../assests/images/red-cross.png')}></img>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row className="sf-btn-footer no-gutters justify-content-between">
                                            <div className="col-sm-12 text-right bluefooter-butn">
                                                <button
                                                    type={'button'}
                                                    className="reset mr15 cancel-btn"
                                                    onClick={this.cancel} >
                                                    <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="submit-button mr5 save-btn" >
                                                    <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
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
                    isMachineShow={false}
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
    const fieldsObj = selector(state, 'MachineNumber', 'MachineName', 'TonnageCapacity', 'MachineRate');

    const { plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList, } = comman;
    const { machineTypeSelectList, processSelectList, machineData } = machine;
    const { vendorListByVendorType } = material;

    let initialValues = {};

    if (machineData && machineData !== undefined) {
        initialValues = {
            MachineNumber: machineData.MachineNumber,
            MachineName: machineData.MachineName,
            TonnageCapacity: machineData.TonnageCapacity,
            Description: machineData.Description,
            Remark: machineData.Remark,
        }
    }

    return {
        vendorListByVendorType, plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList,
        machineTypeSelectList, processSelectList, fieldsObj, machineData, initialValues,
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
    fileUploadMachine,
    fileDeleteMachine,
    checkAndGetMachineNumber,
    createMachine,
    updateMachine,
    getMachineData,
})(reduxForm({
    form: 'AddMachineRate',
    enableReinitialize: true,
})(AddMachineRate));
