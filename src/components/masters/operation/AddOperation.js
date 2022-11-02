import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, getVendorCode, maxLength80, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength10, maxLength15, positiveAndDecimalNumber, maxLength512, decimalLengthsix, checkSpacesInString } from "../../../helper/validation";
import { renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, renderDatePicker, renderNumberInputField, focusOnError } from "../../layout/FormInputs";
import { getVendorWithVendorCodeSelectList } from '../actions/Supplier';
import { createOperationsAPI, getOperationDataAPI, updateOperationAPI, fileUploadOperation, fileDeleteOperation, checkAndGetOperationCode } from '../actions/OtherOperation';
import { getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC, OPERATIONS_ID, EMPTY_GUID, SPACEBAR, VBCTypeId, CBCTypeId, ZBCTypeId, searchCount } from '../../../config/constants';
import { AcceptableOperationUOM } from '../../../config/masterData'
import DayTime from '../../common/DayTimeWrapper'
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import LoaderCustom from '../../common/LoaderCustom';
import { CheckApprovalApplicableMaster, onFocus, showDataOnHover } from '../../../helper';
import { masterFinalLevelUser } from '../actions/Material'
import { getCostingSpecificTechnology } from '../../costing/actions/Costing'
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctios';

const selector = formValueSelector('AddOperation');

class AddOperation extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      selectedTechnology: [],
      selectedPlants: [],
      isVendorNameNotSelected: false,
      vendorName: [],
      oldDate: '',
      UOM: [],
      isViewMode: this.props?.data?.isViewMode ? true : false,
      oldUOM: [],
      isDateChange: false,
      IsSendForApproval: false,
      IsFinancialDataChanged: true,
      DataToChange: [],
      costingTypeId: ZBCTypeId,
      isSurfaceTreatment: false,
      remarks: '',
      files: [],
      isVisible: false,
      imageURL: '',
      isFinalApprovar: false,
      approveDrawer: false,
      approvalObj: {},
      client: [],
      isEditFlag: false,
      isShowForm: false,
      isOpenVendor: false,
      isOpenUOM: false,
      OperationId: EMPTY_GUID,
      effectiveDate: '',
      minEffectiveDate: '',
      destinationPlant: [],
      changeValue: true,
      dataToChange: '',
      uploadAttachements: true,
      isDisableCode: false,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      attachmentLoader: false,
      showErrorOnFocus: false,
      showErrorOnFocusDate: false,
      operationName: '',
      operationCode: '',
      finalApprovalLoader: false
    }
  }

  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.state.isViewMode || this.props.data.isEditFlag)) {
      this.props.getUOMSelectList(() => { })
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { })
      this.props.getPlantSelectListByType(ZBC, () => { })
      this.props.getClientSelectList(() => { })
    }
    if (!this.state.isViewMode) {
      let obj = {
        MasterId: OPERATIONS_ID,
        DepartmentId: userDetails()?.DepartmentId,
        LoggedInUserLevelId: userDetails()?.LoggedInMasterLevelId,
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
    this.getDetail()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filedObj !== this.props.filedObj) {
      const { filedObj } = this.props;
      if (filedObj && filedObj !== undefined && filedObj.length > 4) {
      }
    }
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }
  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  renderListing = (label) => {
    const { costingSpecifiTechnology, clientSelectList, plantSelectList, vendorWithVendorCodeSelectList,
      UOMSelectList, } = this.props;
    const temp = [];

    if (label === 'technology') {
      costingSpecifiTechnology && costingSpecifiTechnology.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'plant') {
      plantSelectList && plantSelectList.map(item => {
        if (item.PlantId === '0') return false;
        temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
        return null;
      });
      return temp;
    }
    if (label === 'singlePlant') {
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ label: item.PlantNameCode, value: item.PlantId })
        return null
      })
      return temp
    }
    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableOperationUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null;
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
  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag
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
  * @method handlePlants
  * @description Used handle Plants
  */
  handlePlants = (e) => {
    this.setState({ selectedPlants: e })
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
    } else {
      this.setState({ vendorName: [] })
    }
  };

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  async closeVendorDrawer(e = '', formData = {}, type) {
    if (type === 'submit') {
      this.setState({ isOpenVendor: false })
      const res = await getVendorWithVendorCodeSelectList(this.state.vendorName)
      let vendorDataAPI = res?.data?.SelectList
      reactLocalStorage?.setObject('vendorData', vendorDataAPI)
      if (Object.keys(formData).length > 0) {
        this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
      }
    }
    else {
      this.setState({ isOpenVendor: false })
    }
  }


  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      this.cancel('submit')
    }
  }

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue) => {
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
    this.setState({ isOpenUOM: false }, () => {
      this.props.getUOMSelectList(() => { })
    })
  }

  /**
    * @method handleChange
    * @description Handle Effective Date
    */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    })

  }


  handleRateChange = (value) => {

    if (this.state.isEditFlag && Number(this.state.DataToChange?.Rate) === Number(value?.target?.value)) {
      this.setState({ IsFinancialDataChanged: false })

    } else if (this.state.isEditFlag) {
      this.setState({ IsFinancialDataChanged: true })

    }
  }

  /**
  * @method onPressSurfaceTreatment
  * @description Used for Surface Treatment
  */
  onPressSurfaceTreatment = () => {
    this.setState({ isSurfaceTreatment: !this.state.isSurfaceTreatment });
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
  * @method getDetail
  * @description used to get user detail
  */
  getDetail = () => {
    const { data } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        isEditFlag: true,
        OperationId: data.ID,
      })
      // this.props.getVendorWithVendorCodeSelectList(() => { this.setState({ inputLoader: false }) })
      this.props.getOperationDataAPI(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })

          let technologyArray = [];
          Data && Data.Technology.map((item) => {
            technologyArray.push({ Text: item.Technology, Value: item.TechnologyId })
            return technologyArray;
          })

          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              IsFinancialDataChanged: false,
              isLoader: false,
              costingTypeId: Data.CostingTypeId,
              selectedTechnology: technologyArray,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              selectedPlants: [{ Text: Data.DestinationPlantName, Value: Data.DestinationPlantId }],
              vendorName: Data.VendorName && Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [],
              UOM: Data.UnitOfMeasurement !== undefined ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : [],
              oldUOM: Data.UnitOfMeasurement !== undefined ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : [],
              isSurfaceTreatment: Data.IsSurfaceTreatmentOperation,
              remarks: Data.Remark,
              files: Data.Attachements,
              // effectiveDate: moment(Data.EffectiveDate).isValid ? moment(Data.EffectiveDate)._d : '',
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              destinationPlant: Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : [],
              dataToChange: Data
            })
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
    }
  }

  checkUniqCode = (e) => {
    this.setState({ operationCode: e.target.value })
    this.props.checkAndGetOperationCode(e.target.value, this.state.operationName, res => {

      let Data = res.data.DynamicData
      if (Data?.IsExist) {
        if (this.state.operationName) {
          this.props.change('OperationCode', res.data.DynamicData.OperationCode ? res.data.DynamicData.OperationCode : '')
        } else {
          Toaster.warning(res.data.Message);
          this.props.change('OperationCode', '')
        }
      }
    })
  }


  checkUniqCodeByName = (e) => {
    this.setState({ operationName: e.target.value })
    this.props.checkAndGetOperationCode(this.state.operationCode, e.target.value, res => {
      if (res && res.data && res.data.Result === false) {
        this.props.change('OperationCode', res.data.DynamicData.OperationCode ? res.data.DynamicData.OperationCode : '')
      } else {
        this.setState({ isDisableCode: res.data.DynamicData.IsExist }, () => {
          this.props.change('OperationCode', res.data.DynamicData.OperationCode ? res.data.DynamicData.OperationCode : '')
        })
      }
    })
  }

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
      this.props.fileUploadOperation(data, (res) => {
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
      this.props.fileDeleteOperation(deleteData, (res) => {
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

  handleDestinationPlant = (newValue) => {
    this.setState({ destinationPlant: newValue })
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

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    this.props.getPlantBySupplier('', () => { })
    reset();
    this.setState({
      selectedTechnology: [],
      selectedPlants: [],
      vendorName: [],
      UOM: [],
      isSurfaceTreatment: false,
      isShowForm: false,
      isEditFlag: false,
    })
    if (type === 'submit') {
      this.props.getOperationDataAPI('', () => { })
    }
    this.props.hideForm(type)
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { selectedPlants, vendorName, files,
      UOM, oldUOM, isSurfaceTreatment, selectedTechnology, client, costingTypeId, remarks, OperationId, oldDate, effectiveDate, destinationPlant, DataToChange, isDateChange, IsFinancialDataChanged, isEditFlag } = this.state;
    const { initialConfiguration } = this.props;
    const userDetailsOperation = JSON.parse(localStorage.getItem('userDetail'))
    const userDetail = userDetails()
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      if (costingTypeId === VBCTypeId) {
        this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
        return false
      }
    }
    this.setState({ isVendorNameNotSelected: false })



    let technologyArray = [];
    selectedTechnology && selectedTechnology.map((item) => {
      technologyArray.push({ Technology: item.Text, TechnologyId: item.Value })
      return technologyArray;
    })
    let plantArray = []
    if (costingTypeId === VBCTypeId) {
      plantArray.push({ PlantName: destinationPlant.label, PlantId: destinationPlant.value, PlantCode: '', })
    } else {
      selectedPlants && selectedPlants.map((item) => {
        plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
        return plantArray
      })
    }
    let cbcPlantArray = []
    if (getConfigurationKey().IsCBCApplicableOnPlant && costingTypeId === CBCTypeId) {
      cbcPlantArray.push({ PlantName: destinationPlant.label, PlantId: destinationPlant.value, PlantCode: '', })
    }
    else {
      userDetailsOperation?.Plants.map((item) => {
        cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode, })
        return cbcPlantArray
      })
    }
    /** Update existing detail of supplier master **/
    // if (this.state.isEditFlag && this.state.isFinalApprovar) {

    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(OPERATIONS_ID) !== true)) {

      let updatedFiles = files.map((file) => {
        return { ...file, ContextId: OperationId }
      })


      let updateData = {
        EffectiveDate: DayTime(effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
        OperationId: OperationId,
        UnitOfMeasurementId: UOM.value,
        Rate: values.Rate,
        VendorPlant: [],
        Technology: technologyArray,
        Description: values.Description,
        Remark: remarks,
        Attachements: updatedFiles,
        LoggedInUserId: loggedInUserId(),
        IsForcefulUpdated: true,
        IsFinancialDataChanged: isDateChange ? true : false
      }
      // if (this.state.isEditFlag) {
      // if (dataToChange.UnitOfMeasurementId === UOM.value && dataToChange.Rate === Number(values.Rate) && uploadAttachements) {
      //   this.cancel()
      //   return false
      // }

      if (IsFinancialDataChanged) {

        if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.props.updateOperationAPI(updateData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.OPERATION_UPDATE_SUCCESS);
              this.cancel('submit')
            }
          });
          return false

        } else {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }

      }
      else {

        if (Number(DataToChange.Rate) === Number(values.Rate) && DataToChange.Remark === values.Remark && UOM.value === oldUOM.value
          && DataToChange.Description === values.Description && (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements))) {
          this.cancel('submit')
          return false
        }
        else {
          this.props.updateOperationAPI(updateData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.OPERATION_UPDATE_SUCCESS);
              this.cancel('submit')
            }
          });
        }

      }
    } else {/** Add new detail for creating operation master **/


      if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) {
        if (Number(DataToChange.Rate) === Number(values.Rate) && DataToChange.Remark === values.Remark && UOM.value === oldUOM.value
          && DataToChange.Description === values.Description && (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements))) {
          Toaster.warning('Please change data to send operation for approval')
          return false
        }
        this.setState({ IsSendForApproval: true })
      } else {
        this.setState({ IsSendForApproval: false })
      }


      this.setState({ setDisable: true })
      let formData = {
        IsFinancialDataChanged: isDateChange ? true : false,
        IsSendForApproval: this.state.IsSendForApproval,
        OperationId: OperationId,
        CostingTypeId: costingTypeId,
        OperationName: values.OperationName,
        OperationCode: values.OperationCode,
        Description: values.Description,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail?.ZBCSupplierInfo.VendorId,
        VendorCode: costingTypeId === VBCTypeId ? getVendorCode(vendorName.label) : userDetail?.ZBCSupplierInfo.VendorNameWithCode,
        UnitOfMeasurementId: UOM.value,
        IsSurfaceTreatmentOperation: isSurfaceTreatment,
        //SurfaceTreatmentCharges: values.SurfaceTreatmentCharges,
        Rate: values.Rate,
        LabourRatePerUOM: initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure ? values.LabourRatePerUOM : '',
        Technology: technologyArray,
        Remark: remarks,
        plant: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        Attachements: files,
        LoggedInUserId: loggedInUserId(),
        EffectiveDate: DayTime(effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
        VendorPlant: [],
        CustomerId: costingTypeId === CBCTypeId ? client.value : ''
      }

      if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) {

        if (IsFinancialDataChanged) {

          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: formData })
            this.setState({ setDisable: true })
            return false

          } else {

            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }
        }


        if (Number(DataToChange.Rate) === Number(values.Rate) && DataToChange.Remark === values.Remark && UOM.value === oldUOM.value && DataToChange.Description === values.Description && (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements))) {
          this.cancel('submit')
          return false
        } else {
          this.setState({ approveDrawer: true, approvalObj: formData })
        }


      } else {

        this.props.createOperationsAPI(formData, (res) => {
          this.setState({ setDisable: false })
          if (res.data.Result) {
            Toaster.success(MESSAGES.OPERATION_ADD_SUCCESS);
            //this.clearForm()
            this.cancel('submit')
          }
        })
      }

      // this.props.createOperationsAPI(formData, (res) => {
      //   this.setState({ setDisable: false })
      //   if (res?.data?.Result) {
      //     Toaster.success(MESSAGES.OPERATION_ADD_SUCCESS);
      //     this.cancel();
      //   }
      // });


    }

  }, 500)

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
    const { handleSubmit, initialConfiguration, isOperationAssociated } = this.props;
    const { isEditFlag, isOpenVendor, isOpenUOM, isDisableCode, isViewMode, setDisable, costingTypeId } = this.state;
    const filterList = async (inputValue) => {
      const { vendorName } = this.state
      const resultInput = inputValue.slice(0, 3)
      if (inputValue?.length >= searchCount && vendorName !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorWithVendorCodeSelectList(resultInput)
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
      <div className="container-fluid">
        {(this.state.isLoader || this.state.finalApprovalLoader) && <LoaderCustom />}
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <h2>{this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Operation
                    </h2>
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
                      <Col md="3">
                        <Field
                          title={showDataOnHover(this.state.selectedTechnology)}
                          label="Technology"
                          name="technology"
                          placeholder={isEditFlag ? '-' : 'Select'}
                          selection={
                            this.state.selectedTechnology == null ||
                              this.state.selectedTechnology.length === 0
                              ? []
                              : this.state.selectedTechnology
                          }
                          options={this.renderListing("technology")}
                          selectionChanged={this.handleTechnology}
                          optionValue={(option) => option.Value}
                          optionLabel={(option) => option.Text}
                          component={renderMultiSelectField}
                          mendatory={true}
                          validate={this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0 ? [required] : []}
                          className="multiselect-with-border"
                          disabled={isEditFlag ? true : false}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Operation Name`}
                          name={"OperationName"}
                          type="text"
                          placeholder={isEditFlag ? '-' : "Select"}
                          validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces]}
                          onBlur={this.checkUniqCodeByName}
                          component={renderText}
                          required={true}
                          disabled={isEditFlag ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Operation Code`}
                          name={"OperationCode"}
                          type="text"
                          placeholder={(isEditFlag || isDisableCode || initialConfiguration.IsAutoGeneratedOperationCode) ? '-' : "Select"}
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength15, checkWhiteSpaces, required, checkSpacesInString]}
                          component={renderText}
                          required={true}
                          onChange={this.checkUniqCode}
                          disabled={(isEditFlag || isDisableCode || initialConfiguration.IsAutoGeneratedOperationCode) ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Description`}
                          name={"Description"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Select"}
                          validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
                          component={renderText}
                          disabled={isViewMode ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                    </Row>

                    <Row>
                      {(costingTypeId === ZBCTypeId) && (
                        <Col md="3">
                          <Field
                            label="Plant"
                            name="Plant"
                            title={showDataOnHover(this.state.selectedPlants)}
                            placeholder={isEditFlag ? '-' : 'Select'}
                            selection={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                            options={this.renderListing("plant")}
                            selectionChanged={this.handlePlants}
                            optionValue={(option) => option.Value}
                            optionLabel={(option) => option.Text}
                            component={renderMultiSelectField}
                            mendatory={true}
                            validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                            className="multiselect-with-border"
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      )}
                      {costingTypeId === VBCTypeId && (
                        <Col md="3"><label>{"Vendor Name"}<span className="asterisk-required">*</span></label>
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
                                noOptionsMessage={({ inputValue }) => !inputValue ? "Enter 3 characters to show data" : "No results found"}
                                isDisabled={(isEditFlag) ? true : false}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                                onFocus={() => onFocus(this)}
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

                      )}
                      {
                        ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&
                        <Col md="3">
                          <Field
                            label={costingTypeId === VBCTypeId ? 'Destination Plant' : 'Plant'}
                            name="DestinationPlant"
                            placeholder={isEditFlag ? '-' : "Select"}
                            options={this.renderListing("singlePlant")}
                            handleChangeDescription={this.handleDestinationPlant}
                            validate={this.state.destinationPlant == null || this.state.destinationPlant.length === 0 ? [required] : []}
                            required={true}
                            // optionValue={(option) => option.Value}
                            // optionLabel={(option) => option.Text}
                            component={searchableSelect}
                            valueDescription={this.state.destinationPlant}
                            mendatory={true}
                            className="multiselect-with-border"
                            disabled={isEditFlag ? true : false}
                          />
                        </Col>
                      }
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
                      <Col md="3">
                        <Field
                          name="UnitOfMeasurementId"
                          type="text"
                          label="UOM"
                          component={searchableSelect}
                          placeholder={isViewMode || (isEditFlag && isOperationAssociated) ? '-' : "Select"}
                          options={this.renderListing("UOM")}
                          //onKeyUp={(e) => this.changeItemDesc(e)}
                          validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleUOM}
                          valueDescription={this.state.UOM}
                          disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                        />
                      </Col>
                      <Col md="3">
                        <Field
                          label={`Rate (INR)`}
                          name={"Rate"}
                          type="text"
                          placeholder={isViewMode || (isEditFlag && isOperationAssociated) ? '-' : "Select"}
                          validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                          component={renderNumberInputField}
                          required={true}
                          disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                          onChange={this.handleRateChange}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>
                      {initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure && <Col md="3">
                        <Field
                          label={`Labour Rate/${this.state.UOM.label ? this.state.UOM.label : 'UOM'}`}
                          name={"LabourRatePerUOM"}
                          type="text"
                          placeholder={isViewMode ? '-' : "Select"}
                          validate={[positiveAndDecimalNumber, maxLength10]}
                          component={renderNumberInputField}
                          disabled={isEditFlag ? true : false}
                          className=" "
                          customClassName=" withBorder"
                        />
                      </Col>}
                      <Col md="3">
                        <div className="inputbox date-section form-group">
                          <Field
                            label="Effective Date"
                            name="EffectiveDate"
                            selected={this.state.effectiveDate}
                            onChange={this.handleEffectiveDateChange}
                            type="text"
                            validate={[required]}
                            minDate={this.state.minEffectiveDate}
                            autoComplete={'off'}
                            required={true}
                            changeHandler={(e) => {
                              //e.preventDefault()
                            }}
                            component={renderDatePicker}
                            className=" "
                            disabled={isViewMode || !this.state.IsFinancialDataChanged}
                            customClassName=" withBorder"
                            placeholder={isViewMode || !this.state.IsFinancialDataChanged ? '-' : "Select Date"}
                            onFocus={() => onFocus(this, true)}
                          />
                          {this.state.showErrorOnFocusDate && this.state.effectiveDate === '' && <div className='text-help mt-1 p-absolute bottom-7'>This field is required.</div>}
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="4" className="mb-5 pb-1 st-operation">
                        <label
                          className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                            }`}
                          onChange={this.onPressSurfaceTreatment}
                        >
                          Surface Treatment Operation
                          <input
                            type="checkbox"
                            checked={this.state.isSurfaceTreatment}
                            disabled={isEditFlag ? true : false}
                          />
                          <span
                            className=" before-box"
                            checked={this.state.isSurfaceTreatment}
                            onChange={this.onPressSurfaceTreatment}
                          />
                        </label>
                      </Col>
                      {/* {this.state.isSurfaceTreatment &&
                          <Col md='3'>
                              <Field
                                  label={`Surface Treatment Charges`}
                                  name={"SurfaceTreatmentCharges"}
                                  type="text"
                                  placeholder={'Enter'}
                                  validate={[required]}
                                  component={renderNumberInputField}
                                  //onChange={this.handleBasicRate}
                                  required={true}
                                  disabled={isEditFlag ? true : false}
                                  className=" "
                                  customClassName=" withBorder"
                              />
                          </Col>} */}
                    </Row>

                    <Row>
                      <Col md="12">
                        <div className="left-border">
                          {'Remarks & Attachments:'}
                        </div>
                      </Col>
                      <Col md="6">
                        <Field
                          label={'Remarks'}
                          name={`Remark`}
                          placeholder={isViewMode ? '-' : "Type here..."}
                          value={this.state.remarks}
                          className=""
                          customClassName=" textAreaWithBorder"
                          onChange={this.handleMessageChange}
                          validate={[maxLength512]}
                          //required={true}
                          component={renderTextAreaField}
                          disabled={isViewMode}
                          maxLength="512"
                        />
                      </Col>
                      <Col md="3">
                        <label>Upload Files (upload up to 3 files)</label>
                        <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                          Maximum file upload limit reached.
                        </div>
                        <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                          <Dropzone
                            ref={this.dropzone}
                            onChangeStatus={this.handleChangeStatus}
                            PreviewComponent={this.Preview}
                            //onSubmit={this.handleSubmit}
                            accept="*"
                            initialFiles={this.state.initialFiles}
                            disabled={isViewMode}
                            maxFiles={3}
                            maxSizeBytes={2000000}
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
                          />
                        </div>
                      </Col>
                      <Col md="3">
                        <div className={'attachment-wrapper'}>
                          {this.state.attachmentLoader && <LoaderCustom customClass="attachment-loader" />}
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
                                  {!isViewMode &&
                                    <img
                                      alt={""}
                                      className="float-right"
                                      onClick={() =>
                                        this.deleteFile(f.FileId, f.FileName)
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
                      {!isViewMode && (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) ?
                        <button type="submit"
                          class="user-btn approval-btn save-btn mr5"
                          disabled={isViewMode || setDisable}
                        >
                          <div className="send-for-approval"></div>
                          {'Send For Approval'}
                        </button>
                        :
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
              masterId={OPERATIONS_ID}
              type={'Sender'}
              anchor={"right"}
              approvalObj={this.state.approvalObj}
              isBulkUpload={false}
              IsImportEntery={false}
            />
          )
        }
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
  const { comman, otherOperation, supplier, auth, costing, client } = state;
  const filedObj = selector(state, 'OperationCode', 'text');
  const { plantSelectList, filterPlantList, UOMSelectList, } = comman;
  const { operationData } = otherOperation;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration } = auth;
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;

  let initialValues = {};
  if (operationData && operationData !== undefined) {
    initialValues = {
      OperationName: operationData.OperationName,
      OperationCode: operationData.OperationCode,
      Description: operationData.Description,
      Rate: operationData.Rate,
      LabourRatePerUOM: operationData.LabourRatePerUOM,
      Remark: operationData.Remark,
    }
  }

  return {
    plantSelectList, UOMSelectList,
    operationData, filterPlantList, vendorWithVendorCodeSelectList, filedObj,
    initialValues, initialConfiguration, costingSpecifiTechnology, clientSelectList
  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getPlantSelectListByType,
  getVendorWithVendorCodeSelectList,
  getPlantBySupplier,
  getUOMSelectList,
  createOperationsAPI,
  updateOperationAPI,
  getOperationDataAPI,
  fileUploadOperation,
  fileDeleteOperation,
  masterFinalLevelUser,
  checkAndGetOperationCode,
  getCostingSpecificTechnology,
  getClientSelectList
})(reduxForm({
  form: 'AddOperation',
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
  touchOnChange: true,
})(AddOperation));

