import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, getCodeBySplitting, maxLength80, checkWhiteSpaces, acceptAllExceptSingleSpecialCharacter, maxLength10, maxLength15, positiveAndDecimalNumber, maxLength512, decimalLengthsix, checkSpacesInString, number, hashValidation, checkForNull, checkForDecimalAndNull } from "../../../helper/validation";
import { renderText, renderMultiSelectField, searchableSelect, renderTextAreaField, renderDatePicker, focusOnError, renderTextInputField } from "../../layout/FormInputs";
import { createOperationsAPI, getOperationDataAPI, updateOperationAPI, fileUploadOperation, checkAndGetOperationCode } from '../actions/OtherOperation';
import { getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, getVendorNameByVendorSelectList, } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC, OPERATIONS_ID, EMPTY_GUID, SPACEBAR, VBCTypeId, CBCTypeId, ZBCTypeId, searchCount, VBC_VENDOR_TYPE } from '../../../config/constants';
import { AcceptableOperationUOM, LOGISTICS } from '../../../config/masterData'
import DayTime from '../../common/DayTimeWrapper'
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import LoaderCustom from '../../common/LoaderCustom';
import { CheckApprovalApplicableMaster, onFocus, showDataOnHover, userTechnologyDetailByMasterId } from '../../../helper';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing'
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission, getEffectiveDateMaxDate, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import AddMoreOperation from './AddMoreOperation';
import WarningMessage from '../../common/WarningMessage';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import TooltipCustom from '../../common/Tooltip';
import { subDays } from 'date-fns';
import { LabelsClass } from '../../../helper/core';

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
      isSurfaceTreatmentSelected: false,
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
      operationName: '',
      operationCode: '',
      finalApprovalLoader: true,
      showPopup: false,
      levelDetails: {},
      noApprovalCycle: false,
      vendorFilterList: [],
      addMoreDetails: false,
      operationType: '',
      addMoreDetailObj: {},
      isDetailEntry: false,
      detailObject: {},
      CostingTypePermission: false,
      disableSendForApproval: false,
      isWelding: false
    }
  }

  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.state.isViewMode)) {
      this.props.getUOMSelectList(() => { })
    }
  }

  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    const { initialConfiguration } = this.props
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (!(this.props.data.isEditFlag || this.props.data.isViewFlag)) {
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
      this.props.getClientSelectList(() => { })
      this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
    }
    this.getDetail()

  }

  finalUserCheckAndMasterLevelCheckFunction = (plantId) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewMode && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), OPERATIONS_ID, (res) => {
        setTimeout(() => {
          this.commonFunction(plantId)
        }, 100);
      })
    } else {
      this.setState({ finalApprovalLoader: false })
    }
  }


  commonFunction(plantId = EMPTY_GUID) {
    let levelDetailsTemp = []
    levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId, OPERATIONS_ID, this.props.userMasterLevelAPI)
    this.setState({ levelDetails: levelDetailsTemp })
    let obj = {
      TechnologyId: OPERATIONS_ID,
      DepartmentId: userDetails().DepartmentId,
      UserId: loggedInUserId(),
      Mode: 'master',
      approvalTypeId: costingTypeIdToApprovalTypeIdFunction(this.state.costingTypeId),
      plantId: plantId
    }
    if (this.props.initialConfiguration.IsMasterApprovalAppliedConfigure) {
      this.props.checkFinalUser(obj, (res) => {
        if (res?.data?.Result) {
          this.setState({ isFinalApprovar: res?.data?.Data?.IsFinalApprover, CostingTypePermission: true, finalApprovalLoader: false })
        }
        if (res?.data?.Data?.IsUserInApprovalFlow === false) {
          this.setState({ disableSendForApproval: true })
        } else {
          this.setState({ disableSendForApproval: false })
        }
      })
    }
    this.setState({ CostingTypePermission: false, finalApprovalLoader: false })
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (this.props.fieldsObj !== prevProps.fieldsObj && this.state.isWelding === true) {
      this.calculateRate()
    }
    if ((prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true) {
      this.commonFunction(this.state.selectedPlants[0] && this.state.selectedPlants[0].Value)
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
    const { costingSpecifiTechnology, plantSelectList, UOMSelectList, clientSelectList } = this.props;
    const temp = [];

    if (label === 'technology') {
      costingSpecifiTechnology && costingSpecifiTechnology.map(item => {
        if (item.Value === '0' || (item.Value === String(LOGISTICS))) return false;
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

    if (label === 'operationType') {
      temp.push({ label: "Welding", value: 1 })
      temp.push({ label: "Surface Treatment", value: 2 })
      temp.push({ label: "Other Operation", value: 3 })
      temp.push({ label: "Ni Cr Plating", value: 4 })
      return temp;
    }
  }
  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    const fieldsToClear = [
      'technology',
      'Plant',
      'DestinationPlant',
      'UnitOfMeasurementId',
      'vendorName',
      'clientName',
      'Rate',
      'EffectiveDate',
      'operationType',
      'WeldingRate',
      'Consumption',
    ];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddOperation', false, false, fieldName));
    });
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag
    });
    if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
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
      const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, this.state.vendorName)
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
      if (String(newValue.label) === String(this.state.DataToChange.UnitOfMeasurement)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })
      }

    } else {
      this.setState({ UOM: [] })
    }
  };

  handleOperationType = (newValue) => {
    if (newValue && newValue !== '') {
      const fieldsToClear = ['Rate'];
      fieldsToClear.forEach(fieldName => {
        this.props.dispatch(clearFields('AddOperation', false, false, fieldName));
      });
      this.setState({ operationType: newValue, })
      if (String(newValue.label) === 'Surface Treatment') {
        this.setState({ isSurfaceTreatment: true, isSurfaceTreatmentSelected: true, isWelding: false })
      } else if (String(newValue.label) === "Welding") {
        this.setState({ isWelding: true, isSurfaceTreatment: false, isSurfaceTreatmentSelected: false })
      } else {
        this.setState({ isSurfaceTreatment: false, isSurfaceTreatmentSelected: false, isWelding: false })
      }
    } else {
      this.setState({ operationType: [] })
    }
  };

  /**
  * @method handleRates
  * @description USE TO HANDLE WELDING MATERIAL RATE AND CONSUMPTION
  */
  handleRates = (value, type) => {
    const operationBasicRate = Number(this.state.DataToChange.OperationBasicRate);
    const operationConsumption = Number(this.state.DataToChange.OperationConsumption);

    if (type === 'WeldingRate' && Number(value) === operationBasicRate) {
      this.setState({ IsFinancialDataChanged: false });
    } else if (type === 'Consumption' && Number(value) === operationConsumption) {
      this.setState({ IsFinancialDataChanged: false });
    } else {
      this.setState({ IsFinancialDataChanged: true });
    }
  }
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

  calculateRate = (value) => {
    const { fieldsObj } = this.props
    const weldingRate = fieldsObj?.WeldingRate
    const consumption = fieldsObj?.Consumption
    let rate = ''; // Initialize rate with default value

    if (weldingRate && !consumption) {
      rate = weldingRate * 1; // Multiply by 1 if consumption is not present
    } else if (!weldingRate && consumption) {
      rate = 1 * consumption; // Multiply by 1 if weldingRate is not present
    } else if (weldingRate && consumption) {
      rate = weldingRate * consumption; // Multiply normally if both values are present
    }

    this.props.change('Rate', checkForDecimalAndNull(rate, getConfigurationKey().NoOfDecimalForPrice));
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
      this.props.getOperationDataAPI(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;

          this.setState({ DataToChange: Data, isDetailEntry: Data?.IsDetailedEntry, detailObject: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          this.props.change('OperationName', Data.OperationName ? Data.OperationName : '')
          this.props.change('OperationCode', Data.OperationCode ? Data.OperationCode : '')
          this.props.change('Description', Data.Description ? Data.Description : '')
          this.props.change('Rate', Data.Rate ? Data.Rate : '')
          this.props.change('Remark', Data.Remark ? Data.Remark : '')
          this.props.change('WeldingRate', Data.OperationBasicRate ? Data.OperationBasicRate : '')
          this.props.change('Consumption', Data.OperationConsumption ? Data.OperationConsumption : '')
          this.props.change('LabourRatePerUOM', Data.LabourRatePerUOM ? Data.LabourRatePerUOM : '')
          let technologyArray = [];
          Data && Data.Technology.map((item) => {
            technologyArray.push({ Text: item.Technology, Value: item.TechnologyId })
            return technologyArray;
          })
          let plantArray = [];
          Data && Data.Plant.map((item) => {
            plantArray.push({ Text: item.PlantName, Value: item.PlantId })
            return plantArray;
          })
          this.finalUserCheckAndMasterLevelCheckFunction(plantArray[0].Value)
          if (Data?.ForType === 'Welding') {
            this.setState({ isWelding: true })
          }
          setTimeout(() => {
            this.setState({
              isEditFlag: true,
              IsFinancialDataChanged: false,
              isLoader: false,
              costingTypeId: Data.CostingTypeId,
              selectedTechnology: technologyArray,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              selectedPlants: plantArray,
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
              dataToChange: Data,
              operationType: { label: Data.ForType, value: 1 }
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

  checkUniqCode = debounce((e) => {
    this.setState({ operationCode: e.target.value });

    if (!this.props.initialConfiguration.IsAutoGeneratedOperationCode) { // When the key is false
      // Check if the operation code exists for the entered operation name
      this.props.checkAndGetOperationCode(e.target.value, this.state.operationName, res => {

        if (res && res.status === 202) {
          this.props.change('OperationName', res.data.Data.OperationName);
          this.props.change('OperationCode', res.data.Data.OperationCode);
        }
        if (res && res.status === 200) {
          // Toaster.success(res.data.Message);
          this.props.change('OperationCode', res.data.Data.OperationCode);
        }
        if (res && res.status === 412) {
          Toaster.warning(res.data.Message);
          this.props.change('OperationCode', '');

        }

      });
    } else { // When the key is true
      // Original behavior remains the same
      this.props.checkAndGetOperationCode(e.target.value, this.state.operationName, res => {
        let Data = res.data.DynamicData;
        if (Data?.IsExist) {
          if (this.state.operationName) {
            this.props.change('OperationCode', Data.DynamicData.OperationCode || '');
          } else {
            Toaster.warning(Data.Message);
            this.props.change('OperationCode', '');
          }
        }
      });
    }
  }, 600);


  checkUniqCodeByName = debounce((e) => {
    this.setState({ operationName: e.target.value })
    if (!this.props.initialConfiguration.IsAutoGeneratedOperationCode) {
      this.props.checkAndGetOperationCode('', e.target.value, res => {

        if (res && res.status === 202) {
          if (res.data.Data.OperationCode !== '') {
            Toaster.warning(res.data.Message);
            this.props.change('OperationCode', res.data.Data.OperationCode);
            this.setState({ isDisableCode: true })
          }
          else {
            Toaster.warning(res.data.Message);

            this.props.change('OperationCode', '');
            this.setState({ isDisableCode: false })

          }
        }
      });
    }
    else {
      // this.setState({ isDisableCode: true })
      this.props.checkAndGetOperationCode(this.state.operationCode, e.target.value, res => {
        if (res && res.data && res.data.Result === false) {
          this.props.change('OperationCode', res.data.Identity ? res.data.Identity : '')

        } else {
          this.setState({ isDisableCode: !res.data.Result }, () => {
            this.props.change('OperationCode', res.data.Identity ? res.data.Identity : '')
            Toaster.warning(res.data.Message);
          })
        }
      })
    }
  }, 600)

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
    if (Number(loop) === 1 || Number(this.dropzone.current.files.length) === Number(this.state.files.length)) {
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
      let tempArr = this.state.files.filter((item) => item.FileId !== FileId)
      this.setState({ files: tempArr })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(
        (item) => item.FileName !== OriginalFileName,
      )
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
    if (!this.state.isViewMode && getConfigurationKey()?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !getConfigurationKey()?.IsDivisionAllowedForDepartment) {
      this.commonFunction(newValue ? newValue.value : '')
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
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('cancel')
    } else {
      this.setState({ showPopup: true })
    }
  }
  onPopupConfirm = () => {
    this.cancel('cancel')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
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
    if (costingTypeId === VBCTypeId || (costingTypeId === ZBCTypeId && initialConfiguration?.IsMultipleUserAllowForApproval)) {
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
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: OperationId }
    })

    let formData = {
      IsFinancialDataChanged: isDateChange ? true : false,
      IsSendForApproval: this.state.IsSendForApproval,
      OperationId: OperationId,
      CostingTypeId: costingTypeId,
      OperationName: values.OperationName,
      OperationCode: values.OperationCode,
      Description: values.Description,
      VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail?.ZBCSupplierInfo.VendorId,
      VendorCode: costingTypeId === VBCTypeId ? getCodeBySplitting(vendorName.label) : userDetail?.ZBCSupplierInfo.VendorNameWithCode,
      UnitOfMeasurementId: UOM.value,
      IsSurfaceTreatmentOperation: isSurfaceTreatment,
      //SurfaceTreatmentCharges: values.SurfaceTreatmentCharges,
      Rate: values.Rate,
      LabourRatePerUOM: initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure ? values.LabourRatePerUOM : '',
      Technology: technologyArray,
      Remark: remarks,
      Plant: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
      Attachements: isEditFlag ? updatedFiles : files,
      LoggedInUserId: loggedInUserId(),
      EffectiveDate: DayTime(effectiveDate).format('YYYY/MM/DD HH:mm:ss'),
      VendorPlant: [],
      CustomerId: costingTypeId === CBCTypeId ? client.value : '',
      IsDetailedEntry: false,
      ForType: this.state.operationType?.label,
      OperationBasicRate: values.WeldingRate,
      OperationConsumption: values.Consumption
    }
    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(OPERATIONS_ID) !== true)) {

      // if (this.state.isEditFlag) {
      // if (dataToChange.UnitOfMeasurementId === UOM.value && dataToChange.Rate === Number(values.Rate) && uploadAttachements) {
      //   this.cancel()
      //   return false
      // }

      if (IsFinancialDataChanged) {

        if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.props.updateOperationAPI(formData, (res) => {
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
          this.props.updateOperationAPI(formData, (res) => {
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
        formData.IsSendForApproval = true;

      } else {
        this.setState({ IsSendForApproval: false })
        formData.IsSendForApproval = false;
      }

      this.setState({ setDisable: true })

      if (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) {

        if (IsFinancialDataChanged) {

          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState((prev) => ({
              ...prev, approveDrawer: true, approvalObj: formData
            }))
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
          this.setState((prev) => ({
            ...prev, approveDrawer: true, approvalObj: formData
          }))
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

  moreDetailsToggler = () => {

    const { fieldsObj } = this.props
    const { selectedPlants, operationType, selectedTechnology, UOM, destinationPlant, isSurfaceTreatment, OperationId } = this.state
    let isPlant = selectedPlants.length > 0 || destinationPlant.label ? true : false
    if (operationType && selectedTechnology.length > 0 && fieldsObj.OperationName && UOM.label && fieldsObj.EffectiveDate && isPlant) {
      let obj = {}
      obj.operationType = this.state.operationType
      obj.technology = this.state.selectedTechnology
      obj.operationName = fieldsObj.OperationName
      obj.operationCode = fieldsObj.OperationCode
      obj.description = fieldsObj.Description
      obj.plants = this.state.selectedPlants
      obj.UOM = this.state.UOM
      obj.vendor = this.state.vendorName
      obj.effectiveDate = this.state.effectiveDate
      obj.destinationPlant = this.state.destinationPlant
      obj.costingTypeId = this.state.costingTypeId
      obj.customer = this.state.client
      obj.isSurfaceTreatment = isSurfaceTreatment
      obj.OperationId = OperationId

      if (String(this.state.operationType.label) === "Ni Cr Plating") {

        obj.useWatchArray = ['wireRate', 'consumptionWire', 'gasRate', 'consumptionGas', 'electricityRate', 'consumptionPower', 'manPowerCost', 'staffCost', 'maintenanceCost', 'consumablesCost', 'waterCost', 'jigStripping', 'statuatoryLicense', 'rejnReworkPercent', 'profitPercent']
      } else {

        obj.useWatchArray = String(this.state.operationType.label) === "Welding" ? ['wireRate', 'consumptionWire', 'gasRate', 'consumptionGas', 'electricityRate', 'consumptionPower', 'labourRate', 'weldingShift', 'machineConsumableCost', 'welderCost', 'interestDepriciationCost', 'otherCostWelding'] : ['gasCost', 'electricityCost', 'manPowerCost', 'staffCost', 'maintenanceCost', 'consumablesCost', 'waterCost', 'jigStripping', 'interestCost', 'depriciationCost', 'rateOperation', 'statuatoryLicense', 'rejnReworkPercent', 'profitPercent', 'otherCost']
      }
      this.setState({ addMoreDetails: true, addMoreDetailObj: obj })
    } else {
      Toaster.warning('Please enter mandatory details')
    }
  }

  cancelAddMoreDetails = () => {
    this.setState({ addMoreDetails: false })

  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, isOperationAssociated, t, data } = this.props;
    const { isEditFlag, isOpenVendor, isOpenUOM, isDisableCode, isViewMode, setDisable, costingTypeId, noApprovalCycle, CostingTypePermission, disableSendForApproval } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        this.setState({ inputLoader: false })
        this.setState({ vendorFilterList: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        if (inputValue) {
          return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
        } else {
          return vendorDataAPI
        }
      }
      else {
        if (inputValue?.length < searchCount) return false
        else {
          let VendorData = reactLocalStorage?.getObject('Data')
          if (inputValue) {
            return autoCompleteDropdown(inputValue, VendorData, false, [], false)
          } else {
            return VendorData
          }
        }
      }
    };

    return (
      <div className="container-fluid">
        {(this.state.isLoader || this.state.finalApprovalLoader) && <LoaderCustom />}
        {!this.state.addMoreDetails && <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    {!data.isCostingDrawer && <h2>{this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Operation

                      {!isViewMode && <TourWrapper
                        buttonSpecificProp={{ id: "Add_Operation_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t, {
                            isEditFlag: isEditFlag, showSendForApproval: !this.state.isFinalApprovar, vendorField: costingTypeId === VBCTypeId, customerField: costingTypeId === CBCTypeId, plantField: (costingTypeId === ZBCTypeId || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)), destinationPlant: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure), isWelding: this.state.isWelding, isOperationAssociated: isOperationAssociated, IsShowOperationType: getConfigurationKey().IsShowDetailedOperationBreakup
                          }).ADD_OPERATION
                        }} />}
                    </h2>}
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
                        {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="Add_operation_zero_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                        </Label>}
                        {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="Add_operation_vendor_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                          <span>{VendorLabel} Based</span>
                        </Label>}
                        {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="Add_operation_customer_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                        </Label>}
                      </Col>
                    </Row>
                    <Row>

                      {getConfigurationKey().IsShowDetailedOperationBreakup && <Col md="3">
                        <Field
                          name="operationType"
                          type="text"
                          label="Operation Type"
                          component={searchableSelect}
                          placeholder={"Select"}
                          options={this.renderListing("operationType")}
                          validate={this.state.operationType == null || this.state.operationType.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleOperationType}
                          valueDescription={this.state.operationType}
                          disabled={isViewMode || isEditFlag ? true : false}
                        />
                      </Col>}

                      <Col md="3">
                        <Field
                          title={showDataOnHover(this.state.selectedTechnology)}
                          label={t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
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
                          validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength80, checkWhiteSpaces, hashValidation]}
                          onChange={this.checkUniqCodeByName}
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
                          placeholder={(isEditFlag || isDisableCode) ? '-' : "Enter"}
                          validate={[acceptAllExceptSingleSpecialCharacter, maxLength15, checkWhiteSpaces, required, checkSpacesInString, hashValidation]}
                          component={renderText}
                          required={true}
                          onChange={this.checkUniqCode}
                          disabled={(isEditFlag || isDisableCode | initialConfiguration.IsAutoGeneratedOperationCode) ? true : false}
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
                      {/* might use later */}
                      {(costingTypeId === ZBCTypeId && !initialConfiguration.IsMultipleUserAllowForApproval) && (
                        <Col md="3">
                          <Field
                            label="Plant (Code)"
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
                        <Col md="3"><label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                          <div className="d-flex justify-space-between align-items-center async-select">
                            <div className="fullinput-icon p-relative">
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                              <AsyncSelect
                                id="AddOperation_VendorCode"
                                name="vendorName"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={filterList}
                                onChange={(e) => this.handleVendorName(e)}
                                value={this.state.vendorName}
                                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                isDisabled={(isEditFlag) ? true : false}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                                onFocus={() => onFocus(this)}
                              />
                            </div>
                            {!isEditFlag && (
                              <div
                                id="AddOperation_AddVendorCode"
                                onClick={this.vendorToggler}
                                className={"plus-icon-square  right"}
                              ></div>
                            )}
                          </div>
                          {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                        </Col>

                      )}
                      {
                        ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) || initialConfiguration.IsMultipleUserAllowForApproval) &&
                        <Col md="3">
                          <Field
                            label={costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
                            name="DestinationPlant"
                            placeholder={isEditFlag ? '-' : "Select"}
                            options={this.renderListing("singlePlant")}
                            handleChangeDescription={this.handleDestinationPlant}
                            validate={this.state.destinationPlant == null || this.state.destinationPlant.length === 0 ? [required] : []}
                            required={true}
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
                            label={"Customer (Code)"}
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
                          validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                          required={true}
                          handleChangeDescription={this.handleUOM}
                          valueDescription={this.state.UOM}
                          disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                        />
                      </Col>
                      {this.state.isWelding &&
                        <>
                          <Col md="3">
                            <Field
                              label={`Welding Material Rate/Kg`}
                              name={"WeldingRate"}
                              type="text"
                              placeholder={isViewMode || (isEditFlag && isOperationAssociated) ? '-' : "Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                              component={renderTextInputField}
                              required={false}
                              disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                              onChange={(e) => { this.handleRates(e.target.value, 'WeldingRate') }}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Consumption`}
                              name={"Consumption"}
                              type="text"
                              placeholder={isViewMode || (isEditFlag && isOperationAssociated) ? '-' : "Enter"}
                              validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                              component={renderTextInputField}
                              required={false}
                              disabled={isViewMode || (isEditFlag && isOperationAssociated)}
                              onChange={(e) => { this.handleRates(e.target.value, 'Consumption') }}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                        </>}
                      <Col md="3">
                        {this?.state?.isWelding && <TooltipCustom disabledIcon={true} width={"350px"} id="rate" tooltipText={'Rate = Welding Material Rate/Kg * Consumption'} />}
                        <Field
                          label={`Rate (${reactLocalStorage.getObject("baseCurrency")})`}
                          name={"Rate"}
                          type="text"
                          id="rate"
                          placeholder={isViewMode || (isEditFlag && isOperationAssociated) || this.state.isWelding ? '-' : "Enter"}
                          validate={this.state.isWelding ? [] : [required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                          component={renderTextInputField}
                          required={true}
                          disabled={isViewMode || (isEditFlag && isOperationAssociated) || this.state.isWelding}
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
                          validate={[positiveAndDecimalNumber, maxLength10, number]}
                          component={renderTextInputField}
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
                            maxDate={getEffectiveDateMaxDate()}

                            onChange={this.handleEffectiveDateChange}
                            type="text"
                            validate={[required]}
                            minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                            autoComplete={'off'}
                            required={true}
                            changeHandler={(e) => {
                            }}
                            component={renderDatePicker}
                            className=" "
                            disabled={isViewMode || !this.state.IsFinancialDataChanged}
                            customClassName=" withBorder"
                            placeholder={isViewMode || !this.state.IsFinancialDataChanged ? '-' : "Select Date"}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="8" className="mb-5 pb-1 st-operation">
                        <label id="AddOperation_SurfaceTreatmentCheckbox"
                          className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                            }`}
                          onChange={this.onPressSurfaceTreatment}
                        >
                          Surface Treatment Operation
                          <input
                            type="checkbox"
                            checked={this.state.isSurfaceTreatment}
                            disabled={(isEditFlag || this.state.isSurfaceTreatmentSelected) ? true : false}
                          />
                          <span
                            className=" before-box"
                            checked={this.state.isSurfaceTreatment}
                            onChange={this.onPressSurfaceTreatment}
                          />
                        </label>
                      </Col>
                      <Col md="4">
                        {(!isEditFlag || (isEditFlag && this.state.isDetailEntry)) && getConfigurationKey().IsShowDetailedOperationBreakup && < button
                          type="button"
                          id="AddMoreOperation_container"
                          className={'user-btn '}
                          disabled={false}
                          onClick={() => this.moreDetailsToggler()}>
                          <div className={'plus'}></div>{this.state.isDetailEntry ? (isViewMode ? "VIEW MORE OPERATION DETAILS" : "EDIT MORE OPERATION DETAILS") : "ADD MORE OPERATION DETAILS"}</button>}
                      </Col>

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
                          validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                          disabled={isViewMode}
                          component={renderTextAreaField}
                        // maxLength="512"
                        // maxLength="5000"
                        />
                      </Col>
                      <Col md="3">
                        <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files)</label>
                        <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                          Maximum file upload limit reached.
                        </div>
                        <div id="AddOperation_UploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                          <Dropzone
                            ref={this.dropzone}
                            onChangeStatus={this.handleChangeStatus}
                            PreviewComponent={this.Preview}
                            disabled={isViewMode}
                            accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                            initialFiles={this.state.initialFiles}
                            maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
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
                                  <a href={fileURL} target="_blank" rel="noreferrer">{f.OriginalFileName}</a>


                                  {!isViewMode && <img
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

                  {!data.isCostingDrawer && <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                      {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                      <button id="AddOperation_Cancel"
                        type={"button"}
                        className="mr15 cancel-btn"
                        onClick={this.cancelHandler}
                        disabled={setDisable}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Cancel"}
                      </button>
                      {!isViewMode && <>
                        {(!isViewMode && (CheckApprovalApplicableMaster(OPERATIONS_ID) === true && !this.state.isFinalApprovar) && initialConfiguration.IsMasterApprovalAppliedConfigure) || (initialConfiguration.IsMasterApprovalAppliedConfigure && !CostingTypePermission) ?
                          <button id="AddOperation_SendForApproval" type="submit"
                            class="user-btn approval-btn save-btn mr5"
                            disabled={isViewMode || setDisable || disableSendForApproval}
                          >
                            <div className="send-for-approval"></div>
                            {'Send For Approval'}
                          </button>
                          :
                          <button
                            id="AddOperation_Save"
                            type="submit"
                            className="user-btn mr5 save-btn"
                            disabled={isViewMode || setDisable || disableSendForApproval}
                          >
                            <div className={"save-icon"}></div>
                            {isEditFlag ? "Update" : "Save"}
                          </button>
                        }
                      </>}
                    </div>
                  </Row>}
                </form>
              </div>
            </div>
          </div>
        </div >}

        {
          this.state.addMoreDetails &&
          <AddMoreOperation
            cancelAddMoreDetails={this.cancelAddMoreDetails}
            addMoreDetailObj={this.state.addMoreDetailObj}
            detailObject={this.state.detailObject}
            cancel={this.cancel}
            isEditFlag={this.state.isEditFlag}
            isViewMode={this.state.isViewMode}
          />
        }

        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />

        }
        {
          isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
              closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )
        }
        {
          isOpenUOM && (
            <AddUOM
              isOpen={isOpenUOM}
              closeDrawer={this.closeUOMDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )
        }

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
              IsImportEntry={false}
              costingTypeId={this.state.costingTypeId}
              levelDetails={this.state.levelDetails}
            />
          )
        }
      </div >
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
  const fieldsObj = selector(state, 'OperationCode', 'text', 'OperationName', 'Description', 'operationType', 'technology', 'clientName', 'EffectiveDate', 'Plant', 'WeldingRate', 'Consumption');
  const { plantSelectList, filterPlantList, UOMSelectList, } = comman;
  const { operationData } = otherOperation;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration, userMasterLevelAPI } = auth;
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;

  let initialValues = {};
  if (operationData && operationData !== undefined) {
    initialValues = {
      LabourRatePerUOM: operationData.LabourRatePerUOM,
    }
  }

  return {
    plantSelectList, UOMSelectList,
    operationData, filterPlantList, vendorWithVendorCodeSelectList, fieldsObj,
    initialValues, initialConfiguration, costingSpecifiTechnology, clientSelectList, userMasterLevelAPI
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
  getPlantBySupplier,
  getUOMSelectList,
  createOperationsAPI,
  updateOperationAPI,
  getOperationDataAPI,
  fileUploadOperation,
  checkFinalUser,
  checkAndGetOperationCode,
  getCostingSpecificTechnology,
  getClientSelectList,
  getUsersMasterLevelAPI,
  getVendorNameByVendorSelectList
})(reduxForm({
  form: 'AddOperation',
  // touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(withTranslation(['OperationMaster', 'MasterLabels'])(AddOperation)),
)

