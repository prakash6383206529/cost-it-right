import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import {
  required, checkForNull, number, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20,
  maxLength, maxLength10, positiveAndDecimalNumber, maxLength512, maxLength80, checkWhiteSpaces, decimalLengthsix, checkSpacesInString
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, focusOnError, renderDatePicker, renderNumberInputField } from "../../layout/FormInputs";
import { getCityBySupplier, getPlantBySupplier, getUOMSelectList, getPlantSelectListByType, getCityByCountry, getAllCity } from '../../../actions/Common';
import { getVendorWithVendorCodeSelectList, getVendorTypeBOPSelectList, } from '../actions/Supplier';
import { masterFinalLevelUser } from '../actions/Material'
import { createBOPDomestic, updateBOPDomestic, getBOPCategorySelectList, getBOPDomesticById, fileUploadBOPDomestic, fileDeleteBOPDomestic, } from '../actions/BoughtOutParts';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { BOP_MASTER_ID, FILE_URL, ZBC, EMPTY_GUID, SPACEBAR, VBCTypeId, CBCTypeId, ZBCTypeId, searchCount } from '../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import DayTime from '../../common/DayTimeWrapper'
import { AcceptableBOPUOM } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import { CheckApprovalApplicableMaster, displayUOM, onFocus } from '../../../helper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctios';


const selector = formValueSelector('AddBOPDomestic');

class AddBOPDomestic extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      BOPID: EMPTY_GUID,
      isEditFlag: false,
      IsVendor: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      BOPCategory: [],
      isCategoryDrawerOpen: false,
      isVendorNameNotSelected: false,
      selectedPartAssembly: [],
      selectedPlants: [],
      isOpenVendor: false,
      vendorName: [],
      vendorLocation: [],
      oldDate: '',
      sourceLocation: [],
      IsSendForApproval: false,
      UOM: [],
      isOpenUOM: false,
      approveDrawer: false,
      effectiveDate: '',
      minEffectiveDate: '',
      isDateChange: false,
      files: [],
      isFinalApprovar: false,
      approvalObj: {},
      IsFinancialDataChanged: true,
      NetLandedCost: '',
      DataToCheck: [],
      DropdownChanged: true,
      uploadAttachements: true,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      attachmentLoader: false,
      isSourceChange: false,
      source: '',
      remarks: '',
      showErrorOnFocus: false,
      showErrorOnFocusDate: false,
      finalApprovalLoader: false,
      client: [],
      costingTypeId: ZBCTypeId,
    }
  }

  /**
  * @method componentWillMount
  * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {
      this.props.getUOMSelectList(() => { })
      this.props.getBOPCategorySelectList(() => { })
      this.props.getPlantSelectListByType(ZBC, () => { })
    }
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    if (!this.state.isViewMode) {
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
      })
    }
    setTimeout(() => {
      this.getDetails()
      if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
        this.props.getClientSelectList(() => { })
      }
      if (!this.state.isViewMode) {
        let obj = {
          MasterId: BOP_MASTER_ID,
          DepartmentId: userDetails().DepartmentId,
          LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
          LoggedInUserId: loggedInUserId()
        }
        this.setState({ finalApprovalLoader: true })
        this.props.masterFinalLevelUser(obj, (res) => {
          if (res.data.Result) {
            this.setState({ isFinalApprovar: res.data.Data.IsFinalApprovar })
            this.setState({ finalApprovalLoader: false })
          }

        })
      }
    }, 300);
  }

  componentDidUpdate(prevProps) {
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.handleCalculation()
    }
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }
  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag,
      vendorLocation: [],
      selectedPlants: [],
    });
    if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
  }

  /**
  * @method handleCategoryChange
  * @description  used to handle BOP Category Selection
  */
  handleCategoryChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ BOPCategory: newValue });
    } else {
      this.setState({ BOPCategory: [], });

    }
  }
  /**
  * @method handleClient
  * @description called
  */
  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue });
    } else {
      this.setState({ client: [] })
    }
  };

  closeApprovalDrawer = (e = '', type) => {

    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      this.cancel('submit')
    }
  }

  /**
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        BOPID: data.Id,
      })
      this.props.getBOPDomesticById(data.Id, res => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          this.setState({ DataToCheck: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          // this.props.getPlantBySupplier(Data.Vendor, () => { })
          setTimeout(() => {
            let plantObj;
            if (getConfigurationKey().IsDestinationPlantConfigure) {
              plantObj = Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : []
            } else {
              plantObj = Data && Data.Plant.length > 0 ? { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId } : []
            }
            this.setState({
              IsFinancialDataChanged: false,
              isEditFlag: true,
              costingTypeId: Data.CostingTypeId,
              BOPCategory: Data.CategoryName !== undefined ? { label: Data.CategoryName, value: Data.CategoryId } : [],
              selectedPlants: plantObj,
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : [],
              sourceLocation: Data.SourceSupplierLocationName !== undefined ? { label: Data.SourceSupplierLocationName, value: Data.SourceLocation } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              files: Data.Attachements,
              UOM: Data.UnitOfMeasurement !== undefined ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : [],
              isLoader: false,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
            }, () => this.setState({ isLoader: false }))
            // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
            let files = Data.Attachements && Data.Attachements.map((item) => {
              item.meta = {}
              item.meta.id = item.FileId
              item.meta.status = 'done'
              return item
            })
            if (this.dropzone.current !== null) {
              this.dropzone.current.files = files
            }
          }, 500)
        }
      })
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getBOPDomesticById('', res => { })
    }
  }

  applySuperScriptFormatter = (cell) => {
    if (cell && cell.indexOf('^') !== -1) {
      const capIndex = cell && cell.indexOf('^');
      const capWithNumber = cell.substring(capIndex, capIndex + 2);
      // return cell.replace(capWithNumber, superNumber.sup());
      // return cell.replace(capWithNumber, ' &sup2;');
      return cell.replace(capWithNumber, '<span>&sup2;</span>');
    } else {
      return cell;
    }
  }


  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { bopCategorySelectList, plantSelectList, cityList,
      UOMSelectList, partSelectList, clientSelectList } = this.props;
    const temp = [];
    if (label === 'BOPCategory') {
      bopCategorySelectList && bopCategorySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'PartAssembly') {
      partSelectList && partSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.PlantId === '0') return false;
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null;
      });
      return temp;
    }
    if (label === 'SourceLocation') {
      cityList && cityList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'uom') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableBOPUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        // let display = this.applySuperScriptFormatter(item.Display)
        temp.push({ label: item.Display, value: item.Value })
        return null
      });
      return temp;
    }
    if (label === 'ClientList') {
      clientSelectList && clientSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  }

  categoryToggler = () => {
    this.setState({ isCategoryDrawerOpen: true })
  }

  closeCategoryDrawer = (e = '', formData = {}) => {
    this.setState({ isCategoryDrawerOpen: false, }, () => {
      this.props.getBOPCategorySelectList(() => {
        const { bopCategorySelectList } = this.props;
        /*TO SHOW CATEGORY VALUE PRE FILLED FROM DRAWER*/
        if (Object.keys(formData).length > 0) {
          let categoryObj = bopCategorySelectList && bopCategorySelectList.find(item => item.Text === formData.Category)
          this.setState({ BOPCategory: categoryObj && categoryObj !== undefined ? { label: categoryObj.Text, value: categoryObj.Value } : [] })
        }
      })
    })
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
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
        //this.props.getCityBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [], })
    }
  };

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  async closeVendorDrawer(e = '', formData = {}, type) {
    if (type === 'submit') {
      this.setState({ isOpenVendor: false })
      const { costingTypeId } = this.state;
      if (costingTypeId === VBCTypeId) {
        if (this.state.vendorName && this.state.vendorName.length > 0) {
          const res = await getVendorWithVendorCodeSelectList(this.state.vendorName)
          let vendorDataAPI = res?.data?.SelectList
          reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        }
        if (Object.keys(formData).length > 0) {
          this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
        }
      } else {
        if (this.state.vendorName && this.state.vendorName.length > 0) {
          const res = await getVendorTypeBOPSelectList(this.state.vendorName)
          let vendorDataAPI = res?.data?.SelectList
          reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        }
        if (Object.keys(formData).length > 0) {
          this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
        }
      }
    } else {
      this.setState({ isOpenVendor: false })
    }
  }

  /**
  * @method handleSourceSupplierCity
  * @description called
  */
  handleSourceSupplierCity = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ sourceLocation: newValue, isSourceChange: true });
    } else {
      this.setState({ sourceLocation: [], })
    }
    this.setState({ DropdownChanged: false })
  };


  handleSource = (newValue, actionMeta) => {

    if (newValue && newValue !== '') {

      this.setState({ source: newValue, isSourceChange: true })

    }
  }
  /**
   * @method handleMessageChange
   * @description used remarks handler
   */
  handleMessageChange = (e) => {
    this.setState({
      remarks: e.target.value,
      isSourceChange: true
    })
  }
  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, })
    } else {
      this.setState({ UOM: [] })
    }
  };

  uomToggler = () => {
    this.setState({ isOpenUOM: true })
  }

  closeUOMDrawer = (e = '') => {
    this.setState({ isOpenUOM: false })
  }

  handleCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props
    const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
    const NetLandedCost = checkForNull(BasicRate)

    if (this.state.isEditFlag && Number(NetLandedCost) === Number(this.state.DataToCheck?.NetLandedCost)) {

      this.setState({ IsFinancialDataChanged: false })
    } else if (this.state.isEditFlag) {
      this.setState({ IsFinancialDataChanged: true })

    }

    //COMMENTED FOR MINDA
    // const NetLandedCost = checkForNull(BasicRate) //THIS IS ONLY FOR MINDA
    this.setState({
      NetLandedCost: NetLandedCost
    })
    this.props.change('NetLandedCost', NetLandedCost !== 0 ? checkForDecimalAndNull(NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : 0)
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    });
  };

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
    if (Number(loop) === 1) {
      this.setState({ setDisable: false, attachmentLoader: false })
    }
  }

  // called every time a file's `status` changes
  handleChangeStatus = ({ meta, file }, status) => {
    const { files, } = this.state;
    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadBOPDomestic(data, (res) => {
        this.setDisableFalseFunction()
        let Data = res.data[0]
        const { files } = this.state;
        let attachmentFileArray = [...files]
        attachmentFileArray.push(Data)
        this.setState({ files: attachmentFileArray })
      })
    }

    if (status === 'rejected_file_type') {
      this.setDisableFalseFunction()
      Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
    } else if (status === 'error_file_size') {
      this.setDisableFalseFunction()
      this.dropzone.current.files.pop()
      Toaster.warning("File size greater than 2 mb not allowed")
    } else if (status === 'error_validation'
      || status === 'error_upload_params' || status === 'exception_upload'
      || status === 'aborted' || status === 'error_upload') {
      this.setDisableFalseFunction()
      this.dropzone.current.files.pop()
      Toaster.warning("Something went wrong")
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
      this.props.fileDeleteBOPDomestic(deleteData, (res) => {
        Toaster.success('File deleted successfully.')
        let tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
      this.setState({ files: tempArr })
    }

    // ********** DELETE FILES THE DROPZONE'S PERSONAL DATA STORE **********
    if (this.dropzone?.current !== null) {
      this.dropzone.current.files.pop()
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
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      IsVendor: false,
      selectedPartAssembly: [],
      selectedPlants: [],
      isOpenVendor: false,
      vendorName: [],
      sourceLocation: [],
      UOM: [],
    })
    this.props.hideForm(type)
    if (type === 'submit') {
      this.getDetails()
    }
  }

  /**
  * @method 
  * 
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { BOPCategory, selectedPlants, vendorName, costingTypeId,

      sourceLocation, BOPID, isEditFlag, files, DropdownChanged, oldDate, isSourceChange, client, effectiveDate, UOM, DataToCheck, isDateChange, IsFinancialDataChanged } = this.state;
    const userDetailsBop = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })

    let plantArray = selectedPlants !== undefined ? { PlantName: selectedPlants.label, PlantId: selectedPlants.value, PlantCode: '' } : {}

    if (selectedPlants.length === 0 && costingTypeId === ZBCTypeId) {
      return false;
    }
    // if (isEditFlag && this.state.isFinalApprovar) {

    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(BOP_MASTER_ID) !== true)) {

      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: BOPID }
      })
      let requestData = {
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        BoughtOutPartId: BOPID,
        Source: values.Source,
        SourceLocation: sourceLocation.value ? sourceLocation.value : '',
        BasicRate: values.BasicRate,
        NetLandedCost: this.state.NetLandedCost,
        Remark: values.Remark,
        LoggedInUserId: loggedInUserId(),
        Plant: selectedPlants !== undefined ? [{ PlantName: selectedPlants.label, PlantId: selectedPlants.value, PlantCode: '' }] : {},
        Attachements: updatedFiles,
        UnitOfMeasurementId: UOM.value,
        IsForcefulUpdated: isDateChange ? false : isSourceChange ? false : true,
        NumberOfPieces: 1,
        VendorPlant: [],
        IsFinancialDataChanged: isDateChange ? true : false,
        CustomerId: client.value
      }

      if (IsFinancialDataChanged) {
        if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.props.updateBOPDomestic(requestData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.UPDATE_BOP_SUCESS);
              this.cancel('submit');
            }
          })
          return false
        } else {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }
      }
      else {
        if (DropdownChanged && (DataToCheck.Remark) === (values.Remark) && JSON.stringify(updatedFiles) === JSON.stringify(DataToCheck.Attachements) && Number(DataToCheck.BasicRate) === Number(values.BasicRate) &&
          ((DataToCheck.Source ? String(DataToCheck.Source) : '-') === (values.Source ? String(values.Source) : '-')) &&
          ((DataToCheck.SourceLocation ? String(DataToCheck.SourceLocation) : '') === (sourceLocation.value ? String(sourceLocation.value) : ''))) {
          this.cancel('submit')
          return false;
        }
        else {
          this.props.updateBOPDomestic(requestData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.UPDATE_BOP_SUCESS);
              this.cancel('submit');
            }
          })
          return false
        }
      }

    } else {

      if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) {
        this.setState({ IsSendForApproval: true })
      } else {
        this.setState({ IsSendForApproval: false })
      }
      // this.setState({ setDisable: true })
      const formData = {
        IsSendForApproval: this.state.IsSendForApproval,
        IsFinancialDataChanged: isDateChange ? true : false,
        BoughtOutPartId: BOPID,
        CostingTypeId: costingTypeId,
        BoughtOutPartNumber: values.BoughtOutPartNumber,
        BoughtOutPartName: values.BoughtOutPartName,
        CategoryId: BOPCategory.value,
        Specification: values.Specification,
        UnitOfMeasurementId: UOM.value,
        Vendor: vendorName.value,
        Source: values.Source,
        SourceLocation: sourceLocation.value,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        BasicRate: values.BasicRate,
        NumberOfPieces: 1,
        NetLandedCost: this.state.NetLandedCost,
        Remark: values.Remark,
        IsActive: true,
        LoggedInUserId: loggedInUserId(),
        Plant: [plantArray],
        VendorPlant: [],
        DestinationPlantId: (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? selectedPlants.value : (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? selectedPlants.value : userDetailsBop.Plants[0].PlantId,
        Attachements: files,
        CustomerId: client.value
      }

      if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) {
        if (IsFinancialDataChanged) {
          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: formData })
            return false

          } else {

            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }
        }
        if (DropdownChanged && (DataToCheck.Remark) === (values.Remark) && (JSON.stringify(files) === JSON.stringify(DataToCheck.Attachements)) && Number(DataToCheck.BasicRate) === Number(values.BasicRate) &&
          ((DataToCheck.Source ? String(DataToCheck.Source) : '-') === (values.Source ? String(values.Source) : '-')) &&
          ((DataToCheck.SourceLocation ? String(DataToCheck.SourceLocation) : '') === (sourceLocation.value ? String(sourceLocation.value) : ''))) {
          Toaster.warning('Please change data to send BOP for approval')
          return false;
        }
        else {
          this.setState({ approveDrawer: true, approvalObj: formData })
        }

        if (DataToCheck.IsVendor) {
          if (DropdownChanged &&
            (Number(DataToCheck.BasicRate) === Number(values.BasicRate)) && (DataToCheck.Remark === values.Remark) && JSON.stringify(files) === JSON.stringify(DataToCheck.Attachements) &&
            ((DataToCheck.Source ? DataToCheck.Source : '-') === (values.Source ? values.Source : '-')) &&
            ((DataToCheck.SourceLocation ? DataToCheck.SourceLocation : '-') === (sourceLocation.value ? sourceLocation.value : '-'))) {
            Toaster.warning('Please change data to send BOP for approval')
            return false;
          }
        }
        if (Boolean(DataToCheck.IsVendor) === false) {
          if ((Number(DataToCheck.BasicRate) === Number(values.BasicRate)) && ((DataToCheck.Remark ? DataToCheck.Remark : '') === (values.Remark ? values.Remark : '')) && JSON.stringify(files) === JSON.stringify(DataToCheck.Attachements)) {
            Toaster.warning('Please change data to send BOP for approval')
            return false;
          }
        }
        // if (((DataToCheck.Remark ? DataToCheck.Remark : '') === (values.Remark ? values.Remark : '')) && uploadAttachements) {
        //   
        //   
        //   
        //   Toaster.warning('Please change data to send BOP for approval')
        //   return false;
        // } 
        else {

          this.setState({ approveDrawer: true, approvalObj: formData })
          return false
        }
      } else {
        this.props.createBOPDomestic(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.BOP_ADD_SUCCESS)
            //this.clearForm()
            this.cancel('submit')                                       //BOP APPROVAL IN PROGRESS DONT DELETE THIS CODE
          }
        })
      }




    }
  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  labelWithUOM = (value) => {
    return <div>
      <span className='d-flex'>Basic Rate/{displayUOM(value)} (INR)</span>
    </div>
  }
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isBOPAssociated } = this.props;
    const { isCategoryDrawerOpen, isOpenVendor, costingTypeId, isOpenUOM, isEditFlag, isViewMode, setDisable } = this.state;
    const filterList = async (inputValue) => {
      const { vendorName } = this.state
      const resultInput = inputValue.slice(0, 3)
      if (inputValue?.length >= searchCount && vendorName !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        if (costingTypeId === VBCTypeId) {
          res = await getVendorWithVendorCodeSelectList(resultInput)
        }
        else {
          res = await getVendorTypeBOPSelectList(resultInput)
        }
        this.setState({ inputLoader: false })
        this.setState({ vendorName: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        let VendorData = []
        if (inputValue) {
          VendorData = reactLocalStorage?.getObject('vendorData')
          return autoCompleteDropdown(inputValue, VendorData)
        } else {
          return VendorData
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('vendorData')
          if (inputValue) {
            VendorData = reactLocalStorage?.getObject('vendorData')
            return autoCompleteDropdown(inputValue, VendorData)
          } else {
            return VendorData
          }
        }
      }
    };
    return (
      <>
        {(this.state.isLoader || this.state.finalApprovalLoader) && <LoaderCustom />}

        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>
                          {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} BOP (Domestic)
                        </h1>
                      </div>
                    </div>
                    <form
                      noValidate
                      className="form"
                      onSubmit={handleSubmit(this.onSubmit.bind(this))}
                      onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                    >
                      <div className="add-min-height">
                        <Row>
                          <Col md="12">
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                checked={
                                  costingTypeId === ZBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(ZBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>Zero Based</span>
                            </Label>
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                checked={
                                  costingTypeId === VBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(VBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>Vendor Based</span>
                            </Label>
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                checked={
                                  costingTypeId === CBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(CBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>Customer Based</span>
                            </Label>
                          </Col>
                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">{"BOP:"}</div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`BOP Part No`}
                              name={"BoughtOutPartNumber"}
                              type="text"
                              placeholder={isEditFlag ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString]}
                              component={renderText}
                              required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`BOP Part Name`}
                              name={"BoughtOutPartName"}
                              type="text"
                              placeholder={isEditFlag ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
                              component={renderText}
                              required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="BOPCategory"
                                  type="text"
                                  label="BOP Category"
                                  component={searchableSelect}
                                  placeholder={isEditFlag ? '-' : "Select"}
                                  options={this.renderListing("BOPCategory")}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={
                                    this.state.BOPCategory == null || this.state.BOPCategory.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleCategoryChange}
                                  valueDescription={this.state.BOPCategory}
                                  disabled={isEditFlag ? true : false}
                                />
                              </div>
                              {!isEditFlag &&
                                <div
                                  onClick={this.categoryToggler}
                                  className={"plus-icon-square right"}
                                ></div>
                              }
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Specification`}
                              name={"Specification"}
                              type="text"
                              placeholder={isViewMode ? "-" : "Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, checkSpacesInString]}
                              component={renderText}
                              //required={true}
                              disabled={isEditFlag ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>

                        </Row>

                        <Row>

                          <Col md="3">
                            <Field
                              name="UOM"
                              type="text"
                              label="UOM"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("uom")}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state.UOM}
                              disabled={isEditFlag ? true : false}
                            />
                          </Col>
                          {((costingTypeId === ZBCTypeId) || (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) && (
                            <Col md="3">
                              <Field
                                label={costingTypeId === VBCTypeId ? 'Destination Plant' : 'Plant'}
                                name="Plant"
                                placeholder={"Select"}
                                //   selection={ this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants} 
                                options={this.renderListing("plant")}
                                handleChangeDescription={this.handlePlant}
                                validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state.selectedPlants}
                                mendatory={true}
                                required={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}
                          {costingTypeId === CBCTypeId && (
                            <Col md="3">
                              <Field
                                name="clientName"
                                type="text"
                                label={"Customer Name"}
                                component={searchableSelect}
                                placeholder={isEditFlag ? '-' : "Select"}
                                options={this.renderListing("ClientList")}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={
                                  this.state.client == null ||
                                    this.state.client.length === 0
                                    ? [required]
                                    : []
                                }
                                required={true}
                                handleChangeDescription={this.handleClient}
                                valueDescription={this.state.client}
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}

                          {/* <Col md="3">
                            <Field
                              label="Part/ Assembly No."
                              name="PartAssemblyNo"
                              placeholder={"Select"}
                              selection={
                                this.state.selectedPartAssembly == null || this.state.selectedPartAssembly.length === 0 ? [] : this.state.selectedPartAssembly}
                              options={this.renderListing("PartAssembly")}
                              selectionChanged={this.handlePartAssembly}
                              optionValue={(option) => option.Value}
                              optionLabel={(option) => option.Text}
                              component={renderMultiSelectField}
                              //  mendatory={true}
                              className="multiselect-with-border"
                            //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                            />
                          </Col> */}
                        </Row>

                        <Row>
                          {costingTypeId !== CBCTypeId && (
                            <>
                              <Col md="12">
                                <div className="left-border">{"Vendor:"}</div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div className="fullinput-icon p-relative">
                                    {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="vendorName"
                                      ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={filterList}
                                      onChange={(e) => this.handleVendorName(e)}
                                      value={this.state.vendorName}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? "Enter 3 characters to show data" : "No results found"}
                                      isDisabled={(isEditFlag) ? true : false}
                                      onFocus={() => onFocus(this)}
                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                    />
                                  </div>
                                  {!isEditFlag && (
                                    <div
                                      onClick={this.vendorToggler}
                                      className={"plus-icon-square  right"}
                                    ></div>
                                  )}
                                </div>
                                {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                              </Col>
                            </>
                          )}
                          {costingTypeId === VBCTypeId && (
                            <>
                              <Col md="3">
                                <Field
                                  label={`Source`}
                                  name={"Source"}
                                  type="text"
                                  placeholder={isViewMode ? "-" : "Enter"}
                                  validate={[acceptAllExceptSingleSpecialCharacter, maxLength(80)]}
                                  component={renderText}
                                  valueDescription={this.state.source}
                                  onChange={this.handleSource}
                                  disabled={isViewMode}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  name="SourceLocation"
                                  type="text"
                                  label="Source Location"
                                  component={searchableSelect}
                                  placeholder={isViewMode ? "-" : "Select"}
                                  options={this.renderListing(
                                    "SourceLocation"
                                  )}
                                  disabled={isViewMode}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  // validate={
                                  //   this.state.sourceLocation == null || this.state.sourceLocation.length === 0 ? [required] : []}
                                  // required={true}
                                  handleChangeDescription={
                                    this.handleSourceSupplierCity
                                  }
                                  valueDescription={this.state.sourceLocation}
                                />
                              </Col>
                            </>
                          )}
                        </Row>

                        <Row className='UOM-label-container'>
                          <Col md="12">
                            <div className="left-border">{"Cost:"}</div>
                          </Col>
                          <Col md="3">
                            <div className="inputbox date-section form-group">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                minDate={this.state.minEffectiveDate}
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                  //e.preventDefault()
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewMode || !this.state.IsFinancialDataChanged}
                                placeholder={isViewMode || !this.state.IsFinancialDataChanged ? '-' : 'Select Date'}
                                onFocus={() => onFocus(this, true)}
                              />
                            </div>
                            {this.state.showErrorOnFocusDate && this.state.effectiveDate === '' && <div className='text-help mt-1 p-absolute bottom-22'>This field is required.</div>}
                          </Col>

                          <Col md="3">
                            <Field
                              label={this.labelWithUOM(this.state.UOM.label ? this.state.UOM.label : 'UOM')}
                              name={"BasicRate"}
                              type="text"
                              placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                              validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                              component={renderNumberInputField}
                              required={true}
                              disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Net Cost (INR)`}
                              name={`${this.state.NetLandedCost === 0 ? '' : "NetLandedCost"}`}
                              type="text"
                              placeholder={"-"}
                              validate={[number]}
                              component={renderNumberInputField}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>

                        </Row>

                        <Row>
                          <Col md="12">
                            <div className="left-border">
                              {"Remarks & Attachments:"}
                            </div>
                          </Col>
                          <Col md="6">
                            <Field
                              label={"Remarks"}
                              name={`Remark`}
                              placeholder={isViewMode ? '-' : "Type here..."}
                              className=""
                              customClassName=" textAreaWithBorder"
                              validate={[maxLength512]}
                              disabled={isViewMode}
                              value={this.state.remarks}
                              onChange={this.handleMessageChange}
                              component={renderTextAreaField}
                              maxLength="5000"
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (upload up to 3 files)
                            </label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit reached.
                            </div>
                            <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                disabled={isViewMode}
                                accept="*"
                                initialFiles={this.state.initialFiles}
                                maxFiles={3}
                                maxSizeBytes={2000000}
                                inputContent={(files, extra) =>
                                  extra.reject ? (
                                    "Image, audio and video files only"
                                  ) : (
                                    <div className="text-center">
                                      <i className="text-primary fa fa-cloud-upload"></i>
                                      <span className="d-block">
                                        Drag and Drop or{" "}
                                        <span className="text-primary">
                                          Browse
                                        </span>
                                        <br />
                                        file to upload
                                      </span>
                                    </div>
                                  )
                                }
                                styles={{
                                  dropzoneReject: {
                                    borderColor: "red",
                                    backgroundColor: "#DAA",
                                  },
                                  inputLabel: (files, extra) =>
                                    extra.reject ? { color: "red" } : {},
                                }
                                  // { dropzone: { minHeight: 200, maxHeight: 250 } }
                                }
                                classNames="draper-drop"
                              />
                            </div>
                          </Col>
                          <Col md="3">
                            <div className={"attachment-wrapper"}>
                              {this.state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
                              {this.state.files &&
                                this.state.files.map((f) => {
                                  const withOutTild = f.FileURL.replace(
                                    "~",
                                    ""
                                  );
                                  const fileURL = `${FILE_URL}${withOutTild}`;
                                  return (
                                    <div className={"attachment images"}>
                                      <a href={fileURL} target="_blank" rel="noreferrer">
                                        {f.OriginalFileName}
                                      </a>
                                      {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                      {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}
                                      {!isViewMode &&
                                        <img
                                          alt={""}
                                          className="float-right"
                                          onClick={() =>
                                            this.deleteFile(
                                              f.FileId,
                                              f.FileName
                                            )
                                          }
                                          src={imgRedcross}
                                        ></img>}
                                    </div>
                                  );
                                })}
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                          <button
                            type={"button"}
                            className="mr15 cancel-btn"
                            onClick={() => { this.cancel('submit') }}
                            disabled={setDisable}
                          >
                            <div className={"cancel-icon"}></div>
                            {"Cancel"}
                          </button>

                          {!isViewMode && (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) ?
                            <button type="submit"
                              class="user-btn approval-btn save-btn mr5"
                              disabled={isViewMode || setDisable}
                            >
                              <div className="send-for-approval"></div>
                              {'Send For Approval'}
                            </button>
                            :                                                                // BOP APPROVAL IN PROGRESS DONT DELETE THIS CODE

                            <button
                              type="submit"
                              className="user-btn mr5 save-btn"
                              disabled={isViewMode || setDisable}
                            >
                              <div className={"save-icon"}></div>
                              {isEditFlag ? "Update" : "Save"}
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
          {isCategoryDrawerOpen && (
            <AddBOPCategory
              isOpen={isCategoryDrawerOpen}
              closeDrawer={this.closeCategoryDrawer}
              isEditFlag={false}
              anchor={"right"}
            />
          )}
          {isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
              closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
          {isOpenUOM && (
            <AddUOM
              isOpen={isOpenUOM}
              closeDrawer={this.closeUOMDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}

          {
            this.state.approveDrawer && (
              <MasterSendForApproval
                isOpen={this.state.approveDrawer}
                closeDrawer={this.closeApprovalDrawer}
                isEditFlag={false}
                masterId={BOP_MASTER_ID}
                type={'Sender'}
                anchor={"right"}
                approvalObj={this.state.approvalObj}
                isBulkUpload={false}
                IsImportEntery={false}
                UOM={this.state.UOM}
              />
            )
          }
        </div>
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
  const { comman, supplier, boughtOutparts, part, auth, client } = state;
  const fieldsObj = selector(state, 'BasicRate', 'NoOfPieces');

  const { bopCategorySelectList, bopData, } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList, UOMSelectList, plantSelectList, costingHead } = comman;
  const { partSelectList } = part;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration } = auth;
  const { clientSelectList } = client;

  let initialValues = {};
  if (bopData && bopData !== undefined) {
    initialValues = {
      BoughtOutPartNumber: bopData.BoughtOutPartNumber,
      BoughtOutPartName: bopData.BoughtOutPartName,
      Specification: bopData.Specification,
      Source: bopData.Source,
      BasicRate: bopData.BasicRate,
      NetLandedCost: bopData.NetLandedCost,
      Remark: bopData.Remark,
    }
  }

  return {
    vendorWithVendorCodeSelectList, plantList, filterPlantList, filterCityListBySupplier, cityList, UOMSelectList,
    plantSelectList, bopCategorySelectList, bopData, partSelectList, costingHead, fieldsObj, initialValues, initialConfiguration, clientSelectList
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createBOPDomestic,
  updateBOPDomestic,
  getVendorWithVendorCodeSelectList,
  getVendorTypeBOPSelectList,
  getPlantBySupplier,
  getCityBySupplier,
  getUOMSelectList,
  getBOPCategorySelectList,
  getBOPDomesticById,
  fileUploadBOPDomestic,
  fileDeleteBOPDomestic,
  getPlantSelectListByType,
  masterFinalLevelUser,
  getCityByCountry,
  getAllCity,
  getClientSelectList
})(reduxForm({
  form: 'AddBOPDomestic',
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(AddBOPDomestic));
