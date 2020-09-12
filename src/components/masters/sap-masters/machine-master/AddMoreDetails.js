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
    getShiftTypeSelectList, getDepreciationTypeSelectList, getLabourTypeSelectList,
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
import $ from 'jquery';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

            shiftType: [],

            depreciationType: [],
            DateOfPurchase: '',

            IsAnnualMaintenanceFixed: false,
            IsAnnualConsumableFixed: false,
            IsInsuranceFixed: false,

            IsUsesFuel: false,
            IsUsesSolarPower: false,

            labourType: [],
            labourGrid: [],
            isEditLabourIndex: false,
            labourGridEditIndex: '',

            processName: [],
            isOpenProcessDrawer: false,

            processGrid: [],
            processGridEditIndex: '',
            isEditIndex: false,

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
        const { data } = this.props;
        this.props.getTechnologySelectList(() => { })
        this.props.getVendorListByVendorType(true, () => { })
        this.props.getPlantSelectList(() => { })
        this.props.getMachineTypeSelectList(() => { })
        this.props.getUOMSelectList(() => { })
        this.props.getProcessesSelectList(() => { })
        this.props.getShiftTypeSelectList(() => { })
        this.props.getDepreciationTypeSelectList(() => { })
        this.props.getLabourTypeSelectList(() => { })

        if (data && data != undefined) {

        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data != this.props.data) {
            const { fieldsObj, machineType, selectedPlants } = nextProps.data;
            this.props.change('MachineName', fieldsObj.MachineName)
            this.props.change('MachineNumber', fieldsObj.MachineNumber)
            this.props.change('TonnageCapacity', fieldsObj.TonnageCapacity)
            this.setState({
                selectedPlants: selectedPlants,
                machineType: machineType,
            })
        }

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
        const { technologySelectList, plantSelectList, plantList, filterPlantList,
            UOMSelectList, machineTypeSelectList, processSelectList, ShiftTypeSelectList,
            DepreciationTypeSelectList, labourTypeSelectList, } = this.props;

        const temp = [];
        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ Text: item.Text, Value: item.Value })
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
        if (label === 'ShiftType') {
            ShiftTypeSelectList && ShiftTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'DepreciationType') {
            DepreciationTypeSelectList && DepreciationTypeSelectList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'labourList') {
            labourTypeSelectList && labourTypeSelectList.map(item => {
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

    handleShiftType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ shiftType: newValue });
        } else {
            this.setState({ shiftType: [], })
        }
    }

    efficiencyCalculationToggler = () => {

    }

    handleDereciationType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ depreciationType: newValue });
        } else {
            this.setState({ depreciationType: [], })
        }
    }

    handleFuelType = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ fuelType: newValue });
        } else {
            this.setState({ fuelType: [], })
        }
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




    /**
     * @method handleChange
     * @description Handle Purchase Date
     */
    handleDateOfPurchase = (date) => {
        this.setState({
            DateOfPurchase: date,
        });
    };


    /**
     * @method onPressAnnualMaintenance
     * @description Used for Annual Maintenance
     */
    onPressAnnualMaintenance = () => {
        this.setState({
            IsAnnualMaintenanceFixed: !this.state.IsAnnualMaintenanceFixed,
        });
    }

    /**
     * @method onPressAnnualConsumable
     * @description Used for Annual Maintenance
     */
    onPressAnnualConsumable = () => {
        this.setState({
            IsAnnualConsumableFixed: !this.state.IsAnnualConsumableFixed,
        });
    }

    /**
     * @method onPressInsurance
     * @description Used for Annual Maintenance
     */
    onPressInsurance = () => {
        this.setState({
            IsInsuranceFixed: !this.state.IsInsuranceFixed,
        });
    }

    /**
     * @method onPressUsesFuel
     * @description Used for Annual Maintenance
     */
    onPressUsesFuel = () => {
        this.setState({
            IsUsesFuel: !this.state.IsUsesFuel,
        });
    }

    /**
     * @method onPressUsesSolarPower
     * @description Used for Uses Solar Power
     */
    onPressUsesSolarPower = () => {
        this.setState({
            IsUsesSolarPower: !this.state.IsUsesSolarPower,
        });
    }

    /**
    * @method labourHandler
    * @description called
    */
    labourHandler = (newValue, actionMeta) => {
        if (newValue && newValue != '') {
            this.setState({ labourType: newValue });
        } else {
            this.setState({ labourType: [] })
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.fieldsObj !== prevProps.fieldsObj) {
            this.handleLabourCalculation()
            this.handleProcessCalculation()
        }
    }

    handleLabourCalculation = () => {
        const { fieldsObj } = this.props
        const LabourPerCost = fieldsObj && fieldsObj.LabourCostPerAnnum != undefined ? fieldsObj.LabourCostPerAnnum : 0;
        const NumberOfLabour = fieldsObj && fieldsObj.NumberOfLabour != undefined ? fieldsObj.NumberOfLabour : 0;
        const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)
        this.props.change('LabourCost', TotalLabourCost)
    }

    labourTableHandler = () => {
        const { labourType, labourGrid } = this.state;
        const { fieldsObj } = this.props
        const LabourPerCost = fieldsObj && fieldsObj.LabourCostPerAnnum != undefined ? fieldsObj.LabourCostPerAnnum : 0;
        const NumberOfLabour = fieldsObj && fieldsObj.NumberOfLabour != undefined ? fieldsObj.NumberOfLabour : 0;
        const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)
        const tempArray = [];

        tempArray.push(...labourGrid, {
            labourTypeName: labourType.label,
            labourTypeId: labourType.value,
            LabourCostPerAnnum: LabourPerCost,
            NumberOfLabour: NumberOfLabour,
            LabourCost: TotalLabourCost,
        })

        this.setState({
            labourGrid: tempArray,
            labourType: [],
        }, () => {
            this.props.change('LabourCostPerAnnum', '')
            this.props.change('NumberOfLabour', '')
            this.props.change('LabourCost', '')
        });
    }

    updateLabourGrid = () => {
        const { labourType, labourGrid, labourGridEditIndex } = this.state;
        const { fieldsObj } = this.props
        const LabourPerCost = fieldsObj && fieldsObj.LabourCostPerAnnum != undefined ? fieldsObj.LabourCostPerAnnum : 0;
        const NumberOfLabour = fieldsObj && fieldsObj.NumberOfLabour != undefined ? fieldsObj.NumberOfLabour : 0;
        const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)

        let tempArray = [];

        let tempData = labourGrid[labourGridEditIndex];
        tempData = {
            labourTypeName: labourType.label,
            labourTypeId: labourType.value,
            LabourCostPerAnnum: LabourPerCost,
            NumberOfLabour: NumberOfLabour,
            LabourCost: TotalLabourCost,
        }

        tempArray = Object.assign([...labourGrid], { [labourGridEditIndex]: tempData })

        this.setState({
            labourGrid: tempArray,
            labourType: [],
            labourGridEditIndex: '',
            isEditLabourIndex: false,
        }, () => {
            this.props.change('LabourCostPerAnnum', '')
            this.props.change('NumberOfLabour', '')
            this.props.change('LabourCost', '')
        });
    }

    resetLabourGridData = () => {
        this.setState({
            labourType: [],
            labourGridEditIndex: '',
            isEditLabourIndex: false,
        }, () => {
            this.props.change('LabourCostPerAnnum', '')
            this.props.change('NumberOfLabour', '')
            this.props.change('LabourCost', '')
        });
    }

    /**
    * @method editLabourItemDetails
    * @description used to Edit Labour Grid Item
    */
    editLabourItemDetails = (index) => {
        const { labourGrid } = this.state;
        const tempData = labourGrid[index];

        this.setState({
            labourGridEditIndex: index,
            isEditLabourIndex: true,
            labourType: { label: tempData.labourTypeName, value: tempData.labourTypeId },
        }, () => {
            this.props.change('LabourCostPerAnnum', tempData.LabourCostPerAnnum)
            this.props.change('NumberOfLabour', tempData.NumberOfLabour)
            this.props.change('LabourCost', tempData.LabourCost)
        });
    }

    /**
    * @method deleteLabourItem
    * @description used to Reset form
    */
    deleteLabourItem = (index) => {
        const { labourGrid } = this.state;

        let tempData = labourGrid.filter((item, i) => {
            if (i == index) {
                return false;
            }
            return true;
        });

        this.setState({
            labourGrid: tempData
        })
    }

    calculateTotalLabourCost = () => {
        const { labourGrid } = this.state;
        let cost = 0;
        labourGrid && labourGrid.map(item => {
            cost = cost + item.LabourCost;
        })
        return cost;
    }

    handleProcessCalculation = () => {
        const { fieldsObj } = this.props
        const OutputPerHours = fieldsObj && fieldsObj.OutputPerHours != undefined ? fieldsObj.OutputPerHours : 0;
        const OutputPerYear = fieldsObj && fieldsObj.OutputPerYear != undefined ? fieldsObj.OutputPerYear : 0;

        this.props.change('OutputPerYear', OutputPerHours * 10)
        this.props.change('MachineRate', 1000 / OutputPerYear)
    }

    processTableHandler = () => {
        const { processName, UOM, processGrid, } = this.state;
        const { fieldsObj } = this.props

        const OutputPerHours = fieldsObj && fieldsObj.OutputPerHours != undefined ? fieldsObj.OutputPerHours : 0;
        const OutputPerYear = fieldsObj && fieldsObj.OutputPerYear != undefined ? fieldsObj.OutputPerYear : 0;
        const MachineRate = fieldsObj && fieldsObj.MachineRate != undefined ? fieldsObj.MachineRate : 0;

        const tempArray = [];

        tempArray.push(...processGrid, {
            processName: processName.label,
            processNameId: processName.value,
            UOM: UOM.label,
            UOMId: UOM.value,
            OutputPerHours: OutputPerHours,
            OutputPerYear: OutputPerYear,
            MachineRate: MachineRate,
        })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
        }, () => {
            this.props.change('OutputPerHours', '')
            this.props.change('OutputPerYear', '')
            this.props.change('MachineRate', '')
        });
    }

    /**
  * @method updateProcessGrid
  * @description Used to handle updateProcessGrid
  */
    updateProcessGrid = () => {
        const { processName, UOM, processGrid, processGridEditIndex } = this.state;
        const { fieldsObj } = this.props

        const OutputPerHours = fieldsObj && fieldsObj.OutputPerHours != undefined ? fieldsObj.OutputPerHours : 0;
        const OutputPerYear = fieldsObj && fieldsObj.OutputPerYear != undefined ? fieldsObj.OutputPerYear : 0;
        const MachineRate = fieldsObj && fieldsObj.MachineRate != undefined ? fieldsObj.MachineRate : 0;
        let tempArray = [];

        let tempData = processGrid[processGridEditIndex];
        tempData = {
            processName: processName.label,
            processNameId: processName.value,
            UOM: UOM.label,
            UOMId: UOM.value,
            OutputPerHours: OutputPerHours,
            OutputPerYear: OutputPerYear,
            MachineRate: MachineRate,
        }

        tempArray = Object.assign([...processGrid], { [processGridEditIndex]: tempData })

        this.setState({
            processGrid: tempArray,
            processName: [],
            UOM: [],
            processGridEditIndex: '',
            isEditIndex: false,
        }, () => {
            this.props.change('OutputPerHours', '')
            this.props.change('OutputPerYear', '')
            this.props.change('MachineRate', '')
        });
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
        }, () => {
            this.props.change('OutputPerHours', '')
            this.props.change('OutputPerYear', '')
            this.props.change('MachineRate', '')
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
        }, () => {
            this.props.change('OutputPerHours', tempData.OutputPerHours)
            this.props.change('OutputPerYear', tempData.OutputPerYear)
            this.props.change('MachineRate', tempData.MachineRate)
        })
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
                                            <Col md="3">
                                                <Field
                                                    name="WorkingShift"
                                                    type="text"
                                                    label="No. Of Shifts"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('ShiftType')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.shiftType == null || this.state.shiftType.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleShiftType}
                                                    valueDescription={this.state.shiftType}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Working Hr/Shift`}
                                                    name={"WorkingHoursPerShift"}
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
                                                    label={`No. Of Working days/Annum`}
                                                    name={"NumberOfWorkingDaysPerYear"}
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
                                            <Col md="2">
                                                <Field
                                                    label={`Efficiency (%)`}
                                                    name={"EfficiencyPercentage"}
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
                                            <Col md="1">
                                                <div
                                                    onClick={this.efficiencyCalculationToggler}
                                                    className={'plus-icon-square mt30 mr15 right'}>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`No. Of Working Hrs/Annum`}
                                                    name={"NumberOfWorkingHoursPerYear"}
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
                                                    title={'Depreciation:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="DepreciationTypeId"
                                                    type="text"
                                                    label="Depreciation Type"
                                                    component={searchableSelect}
                                                    placeholder={'--select--'}
                                                    options={this.renderListing('DepreciationType')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.depreciationType == null || this.state.depreciationType.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.handleDereciationType}
                                                    valueDescription={this.state.depreciationType}
                                                    disabled={isEditFlag ? true : false}
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Depreciation Rate (%)`}
                                                    name={"DepreciationRatePercentage"}
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
                                                    label={`Life Of Assest (Years)`}
                                                    name={"LifeOfAssetPerYear"}
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
                                                    label={`Cost Of Scrap (INR)`}
                                                    name={"CastOfScrap"}
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
                                                <div className="form-group">
                                                    <label>
                                                        Date of Purchase
                                                    <span className="asterisk-required">*</span>
                                                    </label>
                                                    <div className="inputbox date-section">
                                                        <DatePicker
                                                            name="DateOfPurchase"
                                                            selected={this.state.DateOfPurchase}
                                                            onChange={this.handleDateOfPurchase}
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dateFormat="dd/MM/yyyy"
                                                            //maxDate={new Date()}
                                                            dropdownMode="select"
                                                            placeholderText="Select date"
                                                            className="withBorder"
                                                            autoComplete={'off'}
                                                            disabledKeyboardNavigation
                                                            onChangeRaw={(e) => e.preventDefault()}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Depreciation Amount (INR)`}
                                                    name={"DepreciationAmount"}
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
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Variable Cost:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md={`${this.state.IsAnnualMaintenanceFixed ? 2 : 3}`} className="switch mb15">
                                                <label>Annual Maintenance</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Fixed</div>
                                                    <Switch
                                                        onChange={this.onPressAnnualMaintenance}
                                                        checked={this.state.IsAnnualMaintenanceFixed}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>%</div>
                                                </label>
                                            </Col>
                                            {this.state.IsAnnualMaintenanceFixed &&
                                                <Col md="1">
                                                    <Field
                                                        label={``}
                                                        name={"AnnualMaintancePercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        //validate={[required]}
                                                        component={renderNumberInputField}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" mt5"
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Annual Maintenance Amount (INR)`}
                                                    name={"AnnualMaintanceAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={this.state.IsAnnualMaintenanceFixed ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md={`${this.state.IsAnnualConsumableFixed ? 2 : 3}`} className="switch mb15">
                                                <label>Annual Consumable</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Fixed</div>
                                                    <Switch
                                                        onChange={this.onPressAnnualConsumable}
                                                        checked={this.state.IsAnnualConsumableFixed}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>%</div>
                                                </label>
                                            </Col>
                                            {this.state.IsAnnualConsumableFixed &&
                                                <Col md="1">
                                                    <Field
                                                        label={``}
                                                        name={"AnnualConsumablePercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        //validate={[required]}
                                                        component={renderNumberInputField}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" mt5"
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Annual Consumable Amount (INR)`}
                                                    name={"AnnualConsumableAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={this.state.IsAnnualConsumableFixed ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>

                                            <Col md={`${this.state.IsInsuranceFixed ? 2 : 3}`} className="switch mb15">
                                                <label>Insurance</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>Fixed</div>
                                                    <Switch
                                                        onChange={this.onPressInsurance}
                                                        checked={this.state.IsInsuranceFixed}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>%</div>
                                                </label>
                                            </Col>
                                            {this.state.IsInsuranceFixed &&
                                                <Col md="1">
                                                    <Field
                                                        label={``}
                                                        name={"AnnualInsurancePercentage"}
                                                        type="text"
                                                        placeholder={'Enter'}
                                                        //validate={[required]}
                                                        component={renderNumberInputField}
                                                        //required={true}
                                                        disabled={false}
                                                        className=" mt5"
                                                        customClassName="withBorder"
                                                    />
                                                </Col>}
                                            <Col md="3">
                                                <Field
                                                    label={`Insurance Amount (INR)`}
                                                    name={"AnnualInsuranceAmount"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={this.state.IsInsuranceFixed ? true : false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Building Cost/Sq Ft`}
                                                    name={"BuildingCostPerSquareFeet"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Machine Floor Area (Sq Ft)`}
                                                    name={"MachineFloorAreaPerSquareFeet"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Annual Area Cost (INR)`}
                                                    name={"AnnualAreaCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Other Yearly Cost (INR)`}
                                                    name={"OtherYearlyCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    label={`Total Machine Cost/Annum (INR)`}
                                                    name={"TotalMachineCostPerAnnum"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Power:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md={`3`} className="switch mb15">
                                                <label>Uses Fuel</label>
                                                <label className="switch-level">
                                                    <div className={'left-title'}>No</div>
                                                    <Switch
                                                        onChange={this.onPressUsesFuel}
                                                        checked={this.state.IsUsesFuel}
                                                        id="normal-switch"
                                                        disabled={isEditFlag ? true : false}
                                                    />
                                                    <div className={'right-title'}>Yes</div>
                                                </label>
                                            </Col>
                                            {this.state.IsUsesFuel &&
                                                <>
                                                    <Col md="3">
                                                        <Field
                                                            name="FuelTypeId"
                                                            type="text"
                                                            label="Fuel"
                                                            component={searchableSelect}
                                                            placeholder={'--select--'}
                                                            options={this.renderListing('FuelSelectList')}
                                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                                            validate={(this.state.fuelType == null || this.state.fuelType.length == 0) ? [required] : []}
                                                            required={true}
                                                            handleChangeDescription={this.handleFuelType}
                                                            valueDescription={this.state.fuelType}
                                                            disabled={isEditFlag ? true : false}
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Fuel Cost/UOM`}
                                                            name={"FuelCostPerUnit"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Consumption/Annum`}
                                                            name={"ConsumptionPerYear"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Total Power Cost/Annum (INR)`}
                                                            name={"TotalFuelCostPerYear"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                </>}

                                            {!this.state.IsUsesFuel &&
                                                <>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Utilization (%)`}
                                                            name={"UtilizationFactorPercentage"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Power Rating (Kw)`}
                                                            name={"PowerRatingPerKW"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={false}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md={`3`} className="switch mb15">
                                                        <label>Uses Solar Power</label>
                                                        <label className="switch-level">
                                                            <div className={'left-title'}>No</div>
                                                            <Switch
                                                                onChange={this.onPressUsesSolarPower}
                                                                checked={this.state.IsUsesSolarPower}
                                                                id="normal-switch"
                                                                disabled={isEditFlag ? true : false}
                                                            />
                                                            <div className={'right-title'}>Yes</div>
                                                        </label>
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Cost/Unit`}
                                                            name={"PowerCostPerUnit"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                    <Col md="3">
                                                        <Field
                                                            label={`Total Power Cost/Annum (INR)`}
                                                            name={"TotalPowerCostPerYear"}
                                                            type="text"
                                                            placeholder={'Enter'}
                                                            //validate={[required]}
                                                            component={renderNumberInputField}
                                                            //required={true}
                                                            disabled={true}
                                                            className=" "
                                                            customClassName="withBorder"
                                                        />
                                                    </Col>
                                                </>}
                                        </Row>

                                        <Row>
                                            <Col md="12">
                                                <HeaderTitle
                                                    title={'Labour:'}
                                                    customClass={'Personal-Details'} />
                                            </Col>
                                            <Col md="3">
                                                <Field
                                                    name="LabourTypeIds"
                                                    type="text"
                                                    label="Labour Type"
                                                    component={searchableSelect}
                                                    placeholder={'Select Labour'}
                                                    options={this.renderListing('labourList')}
                                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                                    validate={(this.state.labourType == null || this.state.labourType.length == 0) ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={this.labourHandler}
                                                    valueDescription={this.state.labourType}
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Cost/Annum (INR)`}
                                                    name={"LabourCostPerAnnum"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleLabourCalculation}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`No. Of People`}
                                                    name={"NumberOfLabour"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //onChange={this.handleLabourCalculation}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Total Cost (INR)`}
                                                    name={"LabourCost"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="3">
                                                {this.state.isEditLabourIndex ?
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={'btn btn-primary mt30 pull-left mr5'}
                                                            onClick={this.updateLabourGrid}
                                                        >Update</button>

                                                        <button
                                                            type="button"
                                                            className={'cancel-btn mt30 pull-left'}
                                                            onClick={this.resetLabourGridData}
                                                        >Cancel</button>
                                                    </>
                                                    :
                                                    <button
                                                        type="button"
                                                        className={'user-btn mt30 pull-left'}
                                                        onClick={this.labourTableHandler}>
                                                        <div className={'plus'}></div>ADD</button>}
                                            </Col>
                                            <Col md="12">
                                                <Table className="table" size="sm" >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Labour Type`}</th>
                                                            <th>{`Cost/Annum (INR)`}</th>
                                                            <th>{`No. Of People`}</th>
                                                            <th>{`Total Cost (INR)`}</th>
                                                            <th>{`Action`}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody >
                                                        {
                                                            this.state.labourGrid &&
                                                            this.state.labourGrid.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>{item.labourTypeName}</td>
                                                                        <td>{item.LabourCostPerAnnum}</td>
                                                                        <td>{item.NumberOfLabour}</td>
                                                                        <td>{item.LabourCost}</td>
                                                                        <td>
                                                                            <button className="Edit mr5" type={'button'} onClick={() => this.editLabourItemDetails(index)} />
                                                                            <button className="Delete" type={'button'} onClick={() => this.deleteLabourItem(index)} />
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                        {this.state.labourGrid.length > 0 &&
                                                            <tr>
                                                                <td>{''}</td>
                                                                <td>{''}</td>
                                                                <td>{'Total Labour Cost/Annum (INR):'}</td>
                                                                <td>{this.calculateTotalLabourCost()}</td>
                                                                <td>{''}</td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                    {this.state.labourGrid.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </Table>
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
                                            <Col md="2">
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
                                            <Col md="1">
                                                <Field
                                                    label={`Output/Hr`}
                                                    name={"OutputPerHours"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={false}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="1">
                                                <Field
                                                    label={`Output/Yr`}
                                                    name={"OutputPerYear"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    //required={true}
                                                    disabled={true}
                                                    className=" "
                                                    customClassName="withBorder"
                                                />
                                            </Col>
                                            <Col md="2">
                                                <Field
                                                    label={`Machine Rate/Hr (INR)`}
                                                    name={"MachineRate"}
                                                    type="text"
                                                    placeholder={'Enter'}
                                                    //validate={[required]}
                                                    component={renderNumberInputField}
                                                    onChange={this.handleMachineRate}
                                                    //required={true}
                                                    disabled={true}
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
                                                            <th>{`Output/Hr`}</th>
                                                            <th>{`Output/Annum`}</th>
                                                            <th>{`Machine Rate/Hr (INR)`}</th>
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
                                                                        <td>{item.OutputPerHours}</td>
                                                                        <td>{item.OutputPerYear}</td>
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
                                                    {this.state.processGrid.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                </Table>
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
    const fieldsObj = selector(state, 'LabourCostPerAnnum', 'NumberOfLabour', 'LabourCost', 'OutputPerHours',
        'OutputPerYear', 'MachineRate');

    const { plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList,
        ShiftTypeSelectList, DepreciationTypeSelectList, labourTypeSelectList, } = comman;
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
        machineTypeSelectList, processSelectList, ShiftTypeSelectList, DepreciationTypeSelectList,
        labourTypeSelectList, fieldsObj, initialValues,
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
    getShiftTypeSelectList,
    getDepreciationTypeSelectList,
    getLabourTypeSelectList,
})(reduxForm({
    form: 'AddMoreDetails',
    enableReinitialize: true,
})(AddMoreDetails));
