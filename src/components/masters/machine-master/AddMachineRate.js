import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, isDirty } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import {
  required, checkForNull, postiveNumber, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter,
  checkWhiteSpaces, maxLength80, maxLength10, positiveAndDecimalNumber, maxLength512
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, renderMultiSelectField, focusOnError, renderDatePicker } from "../../layout/FormInputs";
import { getTechnologySelectList, getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, } from '../../../actions/Common';
import { getVendorListByVendorType, } from '../actions/Material';
import {
  createMachine, updateMachine, updateMachineDetails, getMachineTypeSelectList, getProcessesSelectList, fileUploadMachine, fileDeleteMachine,
  checkAndGetMachineNumber, getMachineData,
} from '../actions/MachineMaster';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants'
import { checkVendorPlantConfigurable, getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import Switch from "react-switch";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { FILE_URL, ZBC } from '../../../config/constants';
import HeaderTitle from '../../common/HeaderTitle';
import AddMachineTypeDrawer from './AddMachineTypeDrawer';
import AddProcessDrawer from './AddProcessDrawer';
import NoContentFound from '../../common/NoContentFound';
import { AcceptableMachineUOM } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
import moment from 'moment';
import saveImg from '../../../assests/images/check.png'
import cancelImg from '../../../assests/images/times.png'
import attachClose from '../../../assests/images/red-cross.png'
import ConfirmComponent from '../../../helper/ConfirmComponent';
const selector = formValueSelector('AddMachineRate');

class AddMachineRate extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      MachineID: '',
      isEditFlag: false,
      isFormHide: false,
      IsVendor: false,
      IsCopied: false,
      IsDetailedEntry: false,
      isViewFlag: false,

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

      machineFullValue: {},
      DataToChange: [],
      DropdownChange: true,
      effectiveDate: '',
      uploadAttachements: true

    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data, editDetails, initialConfiguration } = this.props;


    // For Showing form in view mode if data is added in add more detail form
    if (data.isViewFlag === true) {
      this.setState({
        isViewFlag: true
      })
    }

    /*WHEN ADD MORE DETAIL FORM IS CANCELLED in ADD FORMAT*/
    if (data.cancelFlag) {


      this.props.checkAndGetMachineNumber('', res => {
        let Data = res.data.DynamicData;
        this.props.change('MachineNumber', Data.MachineNumber)
      })

      return true
    }

    this.props.getTechnologySelectList(() => { })
    this.props.getVendorListByVendorType(true, () => { })
    this.props.getPlantSelectListByType(ZBC, () => { })
    this.props.getMachineTypeSelectList(() => { })
    this.props.getUOMSelectList(() => { })
    this.props.getProcessesSelectList(() => { })

    if (initialConfiguration.IsMachineNumberConfigure && editDetails && editDetails.isEditFlag === false) {
      this.props.checkAndGetMachineNumber('', res => {
        let Data = res.data.DynamicData;
        this.props.change('MachineNumber', Data.MachineNumber)
      })
    }


    // For reseting form  if cancel the add more detail form
    // if (data.cancelFlag) {
    //   const { reset } = this.props;
    //   reset();
    //   this.setState({
    //     remarks: '',
    //     //isFormHide: true,
    //     IsVendor: false,
    //     isEditFlag: false,
    //   })
    // }

    //USED TO SET PREVIOUS VALUES OF FORM AFTER SUCCESS OR CANCEL OF ADD MORE DETAILS FORM
    if (data && data !== undefined && Object.keys(data).length > 0 && data.constructor === Object) {
      this.showFormData()
      this.setOldValue(data)
    }
    // } else if (Object.keys(data).length > 0 && data.constructor === Object) {
    //     this.showFormData()
    // }

    //GET MACHINE VALUES IN EDIT MODE
    this.getDetails()
  }

  componentWillUnmount() {
    const { selectedPlants, machineType, selectedTechnology, isFormHide } = this.state;
    const { fieldsObj } = this.props;
    let data = {
      fieldsObj: fieldsObj,
      selectedTechnology: selectedTechnology,
      selectedPlants: selectedPlants,
      machineType: machineType,
    }
    if (!isFormHide) {
      this.props.setData(data)
    } else {
      this.props.setData()
    }
  }

  /**
  * @method setOldValue
  * @description USED TO SET OLD VALUES
  */
  setOldValue = (data) => {

    this.setState({
      selectedTechnology: data.selectedTechnology,
      selectedPlants: data.selectedPlants,
      machineType: data.machineType,
    })
    this.props.change('MachineName', data && data.fieldsObj && data.fieldsObj.MachineName)
    this.props.change('MachineNumber', data && data.fieldsObj && data.fieldsObj.MachineNumber)
    this.props.change('TonnageCapacity', data && data.fieldsObj && data.fieldsObj.TonnageCapacity)
    this.props.change('Description', data && data.fieldsObj && data.fieldsObj.Description)
  }

  /**
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = () => {
    const { editDetails } = this.props
    if (editDetails && editDetails.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        MachineID: editDetails.Id,
      })
      this.props.getMachineData(editDetails.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.getVendorListByVendorType(Data.IsVendor, () => { })
          if (Data.IsVendor) {
            this.props.getPlantBySupplier(Data.VendorId, () => { })
          }
          this.props.change('EffectiveDate', moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : '')
          this.props.change('Description', Data.Description)
          setTimeout(() => {
            const { vendorListByVendorType, machineTypeSelectList, plantSelectList, } = this.props;


            // let technologyArray = Data && Data.Technology.map((item) => ({ label: item.Technology, value: item.TechnologyId }))

            let MachineProcessArray = Data && Data.MachineProcessRates.map(el => {
              return {
                processName: el.ProcessName,
                ProcessId: el.ProcessId,
                UnitOfMeasurement: el.UnitOfMeasurement,
                UnitOfMeasurementId: el.UnitOfMeasurementId,
                MachineRate: el.MachineRate,
              }
            })

            const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value === Data.VendorId)
            const plantObj = Data.IsVendor === false && plantSelectList && plantSelectList.find(item => item.Value === Data.Plant[0].PlantId)
            let vendorPlantArray = Data && Data.VendorPlant.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))
            const destinationPlantObj = plantSelectList && plantSelectList.find((item) => item.Value === Data.DestinationPlantId)
            const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => Number(item.Value) === Data.MachineTypeId)


            this.setState({
              isEditFlag: true,
              // isLoader: false,
              IsVendor: Data.IsVendor,
              IsCopied: Data.IsCopied,
              IsDetailedEntry: Data.IsDetailedEntry,
              selectedTechnology: [{ label: Data.Technology && Data.Technology[0].Technology, value: Data.Technology && Data.Technology[0].TechnologyId }],
              selectedPlants: plantObj && plantObj !== undefined ? { label: plantObj.Text, value: plantObj.Value } : destinationPlantObj ? { label: destinationPlantObj.Text, value: destinationPlantObj.Value } : [],
              vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
              selectedVendorPlants: vendorPlantArray,
              machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
              processGrid: MachineProcessArray,
              remarks: Data.Remark,
              // Description: Data.Description,
              files: Data.Attachements,
              effectiveDate: moment(Data.EffectiveDate)._isValid ? moment(Data.EffectiveDate)._d : ''
            }, () => this.setState({ isLoader: false }))
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
    this.setState({ DropdownChange: false })
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
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'VendorNameList') {
      vendorListByVendorType && vendorListByVendorType.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'VendorPlant') {
      filterPlantList && filterPlantList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'MachineTypeList') {
      machineTypeSelectList && machineTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'ProcessNameList') {
      processSelectList && processSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableMachineUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null;
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
  * @description called
  */
  handlePlants = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ selectedPlants: newValue, })
    } else {
      this.setState({ selectedPlants: [] })
    }
  };

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

  closeMachineTypeDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenMachineType: false }, () => {
      this.props.getMachineTypeSelectList(() => {
        const { machineTypeSelectList } = this.props;
        /*TO SHOW MACHINE TYPE VALUE PRE FILLED FROM DRAWER*/
        if (Object.keys(formData).length > 0) {
          const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Text === formData.MachineType)
          this.setState({
            machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
          })
        }
      })
    })
  }

  /**
  * @method moreDetailsToggler
  * @description called
  */
  moreDetailsToggler = (Id, editFlag) => {
    const { selectedTechnology } = this.state;
    if (selectedTechnology == null || selectedTechnology.length === 0 || Object.keys(selectedTechnology).length < 0) {
      toastr.warning('Technology should not be empty.')
      return false;
    }

    let data = {
      isEditFlag: editFlag,
      Id: Id,
      isIncompleteMachine: (this.state.isEditFlag && !this.state.IsDetailedEntry) ? true : false,
    }
    this.props.displayMoreDetailsForm(data)
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

  /**
   * @method closeProcessDrawer
   * @description FOR CLOSING PROCESS DRAWER
  */
  closeProcessDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenProcessDrawer: false }, () => {
      this.props.getProcessesSelectList(() => {
        const { processSelectList } = this.props;
        /*TO SHOW PROCESS VALUE PRE FILLED FROM DRAWER*/
        if (Object.keys(formData).length > 0) {
          const processObj = processSelectList && processSelectList.find(item => item.Text.split('(')[0].trim() === formData.ProcessName)

          this.setState({
            processName: processObj && processObj !== undefined ? { label: processObj.Text, value: processObj.Value } : [],
          })
        }
      })
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
  /**
   * @method processTableHandler
   * @description ADDIN PROCESS ROW IN TABLE GRID
  */
  processTableHandler = () => {
    const { processName, UOM, processGrid, } = this.state;



    const { fieldsObj } = this.props;
    const tempArray = [];

    if (processName.length === 0 || UOM === undefined || UOM.length === 0 || fieldsObj.MachineRate === undefined) {
      toastr.warning('Fields should not be empty');
      return false;
    }

    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    const isExist = processGrid.findIndex(el => (el.ProcessId === processName.value))
    if (isExist !== -1) {
      toastr.warning('Already added, Please check the values.')
      return false;
    }

    // const MachineRate = fieldsObj && fieldsObj.MachineRate !== undefined ? checkForNull(fieldsObj.MachineRate) : 0;

    const MachineRate = fieldsObj.MachineRate

    // CONDITION TO CHECK MACHINE RATE IS NEGATIVE OR NOT A NUMBER
    if (MachineRate < 0 || isNaN(MachineRate)) {
      return false;
    }

    tempArray.push(...processGrid, {
      processName: processName.label,
      ProcessId: processName.value,
      UnitOfMeasurement: UOM.label,
      UnitOfMeasurementId: UOM.value,
      MachineRate: MachineRate,
    })

    this.setState({
      processGrid: tempArray,
      processName: [],
      UOM: [],
    }, () => this.props.change('MachineRate', 0));
    this.setState({ DropdownChange: false })
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


    const MachineRate = fieldsObj.MachineRate
    // CONDITION TO CHECK MACHINE RATE IS NEGATIVE OR NOT A NUMBER
    if (MachineRate < 0 || isNaN(MachineRate)) {
      return false;
    }

    let tempData = processGrid[processGridEditIndex];
    if (MachineRate !== tempData.MachineRate || UOM.value !== tempData.UnitOfMeasurementId || processName.value !== tempData.ProcessId) {
      this.setState({ DropdownChange: false })
    }
    tempData = {
      processName: processName.label,
      ProcessId: processName.value,
      UnitOfMeasurement: UOM.label,
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
      UOM: { label: tempData.UnitOfMeasurement, value: tempData.UnitOfMeasurementId },
    }, () => this.props.change('MachineRate', tempData.MachineRate))
    // this.setState({ DropdownChange: false })
  }

  /**
  * @method deleteItem
  * @description DELETE ROW ENTRY FROM TABLE 
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
    this.setState({ DropdownChange: false })
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
      }
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
      isFormHide: true,
      IsVendor: false,
      isEditFlag: false,
    }, () => this.props.hideForm())

  }

  // specify upload params and url for your files
  getUploadParams = ({ file, meta }) => {
    return { url: 'https://httpbin.org/post', }

  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files, } = this.state;

    this.setState({ uploadAttachements: false })

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
    const { IsVendor, MachineID, isEditFlag, IsDetailedEntry, vendorName, selectedTechnology, selectedPlants, anyTouched, selectedVendorPlants,
      remarks, machineType, files, processGrid, isViewFlag, DataToChange, DropdownChange, effectiveDate, uploadAttachements } = this.state;


    if (isViewFlag) {
      this.cancel();
      return false
    }
    const { machineData } = this.props;
    const userDetail = userDetails()

    if (processGrid && processGrid.length === 0) {
      toastr.warning('Process Rate entry required.');
      return false;
    }

    let technologyArray = [{ Technology: selectedTechnology.label, TechnologyId: selectedTechnology.value }]
    let vendorPlantArray = selectedVendorPlants && selectedVendorPlants.map((item) => ({ PlantName: item.Text, PlantId: item.Value, PlantCode: '' }))
    let updatedFiles = files.map((file) => ({ ...file, ContextId: MachineID }))
    if (isEditFlag) {


      // if (DropdownChange) {

      // }
      if (IsDetailedEntry) {
        // EXECUTED WHEN:- EDIT MODE && MACHINE MORE DETAILED == TRUE
        let detailedRequestData = { ...machineData, MachineId: MachineID, Remark: remarks, Attachements: updatedFiles }
        this.props.reset()
        this.props.updateMachineDetails(detailedRequestData, (res) => {
          if (res.data.Result) {
            toastr.success(MESSAGES.UPDATE_MACHINE_SUCCESS);
            this.cancel();
          }
        })

      } else {

        // EXECUTED WHEN:- EDIT MODE OF BASIC MACHINE && MACHINE MORE DETAILED NOT CREATED
        let requestData = {
          MachineId: MachineID,
          IsVendor: IsVendor,
          IsDetailedEntry: false,
          VendorId: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
          MachineNumber: values.MachineNumber,
          MachineName: values.MachineName,
          MachineTypeId: machineType.value,
          TonnageCapacity: values.TonnageCapacity,
          Description: values.Description,
          LoggedInUserId: loggedInUserId(),
          MachineProcessRates: processGrid,
          Technology: [{ Technology: selectedTechnology.label ? selectedTechnology.label : selectedTechnology[0].label, TechnologyId: selectedTechnology.value ? selectedTechnology.value : selectedTechnology[0].value }],
          Plant: !IsVendor ? [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }] : [],
          VendorPlant: vendorPlantArray,
          Remark: remarks,
          Attachements: updatedFiles,
          IsForcefulUpdated: true,
          EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
        }
        if (isEditFlag) {
          if (DropdownChange && uploadAttachements) {
            this.cancel();
            return false
          }
          const toastrConfirmOptions = {
            onOk: () => {
              this.props.reset()
              this.props.updateMachine(requestData, (res) => {
                if (res.data.Result) {
                  toastr.success(MESSAGES.UPDATE_MACHINE_SUCCESS);
                  this.cancel();
                }
              })
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,

          }
          return toastr.confirm(`${'You have changed details, So your all Pending for Approval costing will get Draft. Do you wish to continue?'}`, toastrConfirmOptions,)
        }


      }
    } else {

      // EXECUTED WHEN:- NEW MACHINE WITH BASIC DETAILS
      const formData = {
        IsVendor: IsVendor,
        VendorId: IsVendor ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        IsDetailedEntry: false,
        MachineNumber: values.MachineNumber,
        MachineName: values.MachineName,
        MachineTypeId: machineType.value,
        TonnageCapacity: values.TonnageCapacity,
        Description: values.Description,
        LoggedInUserId: loggedInUserId(),
        MachineProcessRates: processGrid,
        Technology: technologyArray,
        Plant: !IsVendor ? [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }] : [],
        DestinationPlantId: getConfigurationKey().IsDestinationPlantConfigure ? selectedPlants.value : '',
        VendorPlant: vendorPlantArray,
        Remark: remarks,
        Attachements: files,
        EffectiveDate: moment(effectiveDate).local().format('YYYY-MM-DD HH:mm:ss'),
      }
      this.props.reset()
      this.props.createMachine(formData, (res) => {
        if (res.data.Result) {
          toastr.success(MESSAGES.MACHINE_ADD_SUCCESS);
          this.cancel();
        }
      });

    }
  }

  /**
   * @method showFormData
   * @description SHOW FORM DATA ENTRY FROM ADD MORE DETAIL FORM
  */
  showFormData = () => {
    const { data } = this.props

    this.props.getVendorListByVendorType(data.IsVendor, () => { })
    if (data.IsVendor) {
      this.props.getPlantBySupplier(data.VendorId, () => { })
    }

    this.props.change('EffectiveDate', moment(data.EffectiveDate)._isValid ? moment(data.EffectiveDate)._d : '')
    setTimeout(() => {
      const { vendorListByVendorType, machineTypeSelectList, plantSelectList, } = this.props;

      // let technologyArray = data && data.Technology.map((item) => ({ Text: item.Technology, Value: item.TechnologyId }))
      let technologyArray = [{ label: data.Technology && data.Technology[0].Technology, value: data.Technology && data.Technology[0].TechnologyId }]


      let MachineProcessArray = data && data.MachineProcessRates.map(el => {
        return {
          processName: el.processName,
          ProcessId: el.ProcessId,
          UnitOfMeasurement: el.UnitOfMeasurement,
          UnitOfMeasurementId: el.UnitOfMeasurementId,
          MachineRate: el.MachineRate,
        }
      })
      this.props.change('MachineName', data.MachineName)
      this.props.change('MachineNumber', data.MachineNumber)
      this.props.change('TonnageCapacity', data.TonnageCapacity)
      this.props.change('Description', data.Description)
      const vendorObj = vendorListByVendorType && vendorListByVendorType.find(item => item.Value === data.VendorId)
      const plantObj = data.IsVendor === false && plantSelectList && plantSelectList.find(item => item.Value === data.Plant[0].PlantId)
      let vendorPlantArray = data && data.VendorPlant.map((item) => ({ Text: item.PlantName, Value: item.PlantId }))

      const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Value === data.MachineTypeId)

      this.setState({
        isEditFlag: false,
        //IsDetailedEntry:false,
        // isLoader: false,
        IsVendor: data.IsVendor,
        IsCopied: data.IsCopied,
        IsDetailedEntry: false,
        selectedTechnology: technologyArray,
        selectedPlants: plantObj && plantObj !== undefined ? { label: plantObj.Text, value: plantObj.Value } : [],
        vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
        selectedVendorPlants: vendorPlantArray,
        machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
        processGrid: MachineProcessArray,
        remarks: data.Remark,
        files: data.Attachements,
      }, () => this.setState({ isLoader: false }))
    }, 100)
  }


  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, AddAccessibility, EditAccessibility, initialConfiguration, } = this.props;
    const { isEditFlag, isOpenMachineType, isOpenProcessDrawer, IsCopied, isViewFlag } = this.state;


    return (
      <>
        {this.state.isLoader && <LoaderCustom />}
        <div className="container-fluid">
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h2>{isEditFlag ? `Update Machine Rate` : `Add Machine Rate`}</h2>
                      </div>
                    </div>
                  </div>
                  <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                  >
                    <div class="add-min-height">
                      <Row>
                        <Col md="4" className="switch mb15">
                          <label className="switch-level">
                            <div className={'left-title'}>Zero Based</div>
                            <Switch
                              onChange={this.onPressVendor}
                              checked={this.state.IsVendor}
                              id="normal-switch"
                              disabled={isEditFlag ? true : this.state.isViewFlag ? true : false}
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
                            placeholder="Select"
                            // selection={(this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0) ? [] : this.state.selectedTechnology}
                            options={this.renderListing('technology')}
                            handleChangeDescription={this.handleTechnology}
                            // optionValue={option => option.Value}
                            // optionLabel={option => option.Text}
                            component={searchableSelect}
                            mendatory={true}
                            required
                            validate={(this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0 ? [required] : [])}
                            className="multiselect-with-border"
                            valueDescription={this.state.selectedTechnology}
                            disabled={this.state.isViewFlag ? true : false}
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
                              placeholder={'Select'}
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
                          checkVendorPlantConfigurable() &&
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
                        {(this.state.IsVendor === false || getConfigurationKey().IsDestinationPlantConfigure) && (
                          <Col md="3">
                            <Field
                              name="Plant"
                              type="text"
                              label={this.state.IsVendor ? 'Destination Plant' : 'Plant'}
                              component={searchableSelect}
                              placeholder={'Select'}
                              options={this.renderListing('plant')}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handlePlants}
                              valueDescription={this.state.selectedPlants}
                              disabled={isEditFlag ? (IsCopied ? false : true) : this.state.isViewFlag ? true : false}
                            />
                          </Col>)}

                        <Col md="3">
                          <Field
                            label={`Machine No.`}
                            name={"MachineNumber"}
                            type="text"
                            placeholder={'Enter'}
                            validate={initialConfiguration.IsMachineNumberConfigure ? [] : [required]}
                            component={renderText}
                            required={initialConfiguration.IsMachineNumberConfigure ? false : true}
                            onBlur={this.checkUniqNumber}
                            disabled={(isEditFlag || initialConfiguration.IsMachineNumberConfigure) ? true : this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>

                        <Col md="3">
                          <Field
                            label={`Machine Specification`}
                            name={"Description"}
                            type="text"
                            placeholder={'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                            component={renderText}
                            // required={true}
                            disabled={this.state.isViewFlag ? true : false}
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
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                            component={renderText}
                            required={false}
                            disabled={isEditFlag ? true : this.state.isViewFlag ? true : false}
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
                                placeholder={'Select'}
                                options={this.renderListing('MachineTypeList')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.machineType == null || this.state.machineType.length === 0) ? [] : []}
                                required={false}
                                handleChangeDescription={this.handleMachineType}
                                valueDescription={this.state.machineType}
                                disabled={this.state.isViewFlag ? true : false}
                              />
                            </div>
                            {!isEditFlag && <div
                              onClick={this.machineTypeToggler}
                              className={this.state.isViewFlag ? 'blurPlus-icon-square mr5 mt-1 right' : 'plus-icon-square mr5 right'}>

                            </div>}
                          </div>
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Machine Tonnage(Ton)`}
                            name={"TonnageCapacity"}
                            type="text"
                            placeholder={'Enter'}
                            validate={[checkWhiteSpaces, postiveNumber, maxLength10]}
                            component={renderText}
                            required={false}
                            disabled={this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <div className="form-group">
                            <div className="inputbox date-section">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                disabled={false}
                                changeHandler={(e) => {
                                  //e.preventDefault()
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isEditFlag ? true : false}
                              />
                            </div>
                          </div>
                        </Col>

                        {!this.state.IsVendor &&
                          <Col md="12">
                            <div>
                              {
                                this.state.IsDetailedEntry ?

                                  EditAccessibility &&
                                  <button
                                    type="button"
                                    className={'user-btn'}
                                    onClick={() => this.moreDetailsToggler(this.state.MachineID, true)}>
                                    <div className={'edit_pencil_icon d-inline-block mr5'}></div>EDIT MORE MACHINE DETAILS</button>
                                  :
                                  AddAccessibility &&
                                  <button
                                    type="button"
                                    className={this.state.isViewFlag ? 'disabled-button user-btn' : 'user-btn'}
                                    disabled={this.state.isViewFlag ? true : false}
                                    onClick={() => this.moreDetailsToggler(isEditFlag ? this.state.MachineID : '', false)}>
                                    <div className={'plus'}></div>ADD MORE MACHINE DETAILS</button>
                              }

                            </div>
                          </Col>}
                        <Col md="12"><hr /></Col>
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
                                placeholder={'Select'}
                                options={this.renderListing('ProcessNameList')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                //required={true}
                                handleChangeDescription={this.handleProcessName}
                                valueDescription={this.state.processName}
                                disabled={false}
                              />
                            </div>
                            {(!isEditFlag || this.state.isViewFlag) && <div
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
                            placeholder={'Select'}
                            options={this.renderListing('UOM')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [] : []}
                            //required={true}
                            handleChangeDescription={this.handleUOM}
                            valueDescription={this.state.UOM}
                            disabled={false}
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Machine Rate (INR)`}
                            name={"MachineRate"}
                            type="text"
                            placeholder={'Enter'}
                            validate={[positiveAndDecimalNumber, maxLength10]}
                            component={renderText}
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
                                  type={'button'}
                                  className="reset-btn mt30 "
                                  onClick={this.resetProcessGridData}>{'Cancel'}
                                </button>
                              </>
                              :
                              !this.state.IsDetailedEntry &&
                              <>
                                <button
                                  type="button"
                                  className={`${isViewFlag ? 'disabled-button user-btn' : 'user-btn'} mt30 pull-left mr5`}
                                  disabled={this.state.isViewFlag ? true : false}
                                  onClick={this.processTableHandler}>
                                  <div className={'plus'}></div>ADD</button>
                                <button
                                  type="button"
                                  disabled={this.state.isViewFlag ? true : false}
                                  className={`${isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'}  mt30 pull-left`}
                                  onClick={this.resetProcessGridData}
                                >Reset</button>
                              </>
                            }
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
                                      <td>{item.UnitOfMeasurement}</td>
                                      <td>{checkForDecimalAndNull(item.MachineRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                                      <td>
                                        {/* {!this.state.IsDetailedEntry && */}
                                        <>
                                          <button className="Edit mr-2" type={'button'} disabled={isViewFlag === true || this.state.IsDetailedEntry === true ? true : false} onClick={() => this.editItemDetails(index)} />
                                          <button className="Delete" type={'button'} disabled={isViewFlag === true || this.state.IsDetailedEntry === true ? true : false} onClick={() => this.deleteItem(index)} />
                                        </>
                                        {/* } */}
                                      </td>
                                    </tr>
                                  )
                                })
                              }
                            </tbody>
                          </Table>
                          {this.state.processGrid.length === 0 &&
                            <NoContentFound title={EMPTY_DATA} />
                          }
                        </Col>
                      </Row>

                      <Row>
                        <Col md="12" >
                          <div className="header-title">
                            <h5>{'Remarks & Attachments:'}</h5>
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
                            validate={[maxLength512]}
                            //required={true}
                            component={renderTextAreaField}
                            maxLength="512"
                            rows="6"
                            disabled={this.state.isViewFlag ? true : false}
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to 3 files)</label>
                          {this.state.files.length >= 3 ? (
                            <div class="alert alert-danger" role="alert">
                              Maximum file upload limit has been reached.
                            </div>
                          ) :
                            <Dropzone
                              getUploadParams={this.getUploadParams}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              //onSubmit={this.handleSubmit}
                              accept="*"
                              initialFiles={this.state.initialFiles}
                              maxFiles={3}
                              maxSizeBytes={2000000}
                              disabled={this.state.isViewFlag ? true : false}
                              inputContent={(files, extra) => (extra.reject ? 'Image, audio and video files only' : (<div className="text-center">
                                <i className="text-primary fa fa-cloud-upload"></i>
                                <span className="d-block">
                                  Drag and Drop or{" "}
                                  <span className="text-primary">
                                    Browse
                                  </span>
                                  <br />
                                  file to upload
                                </span>
                              </div>))}
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
                                    <a href={fileURL} target="_blank" rel="noreferrer">{f.OriginalFileName}</a>
                                    {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                    <img className="float-right" alt={''} onClick={() => this.deleteFile(f.FileId, f.FileName)} src={attachClose}></img>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <Row className="sf-btn-footer no-gutters justify-content-between">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        {
                          !isViewFlag ?
                            <>
                              <button
                                type={'button'}
                                className=" mr15 cancel-btn"
                                onClick={this.cancel} >
                                <div className={"cancel-icon"}></div> {'Cancel'}
                              </button>
                              <button
                                type="submit"
                                className="user-btn mr5 save-btn" >
                                <div className={"save-icon"}></div>
                                {isEditFlag ? 'Update' : 'Save'}
                              </button>
                            </>
                            :
                            <button
                              type="submit"
                              className="submit-button mr5 save-btn" >
                              <div className={'save-icon'}></div>
                              {'Exit'}
                              {/* Need to change name of button for view flag */}
                            </button>
                        }
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
  const { comman, material, machine, auth } = state;
  const fieldsObj = selector(state, 'MachineNumber', 'MachineName', 'TonnageCapacity', 'MachineRate', 'Description');

  const { plantList, technologySelectList, plantSelectList, filterPlantList, UOMSelectList, } = comman;
  const { machineTypeSelectList, processSelectList, machineData, loading } = machine;
  const { vendorListByVendorType } = material;
  const { initialConfiguration, } = auth;



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
    machineTypeSelectList, processSelectList, fieldsObj, machineData, initialValues, loading, initialConfiguration,
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  dirty: isDirty('AddMachineRate'),
  getTechnologySelectList,
  getVendorListByVendorType,
  getPlantSelectListByType,
  getPlantBySupplier,
  getUOMSelectList,
  getMachineTypeSelectList,
  getProcessesSelectList,
  fileUploadMachine,
  fileDeleteMachine,
  checkAndGetMachineNumber,
  createMachine,
  updateMachine,
  updateMachineDetails,
  getMachineData,
})(reduxForm({
  form: 'AddMachineRate',
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(AddMachineRate));
