import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import {
  required, checkForNull, number, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20,
  maxLength, maxLength10, positiveAndDecimalNumber, maxLength512, maxLength80, checkWhiteSpaces, decimalLengthsix, checkSpacesInString, postiveNumber, hashValidation
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, focusOnError, renderDatePicker, renderTextInputField } from "../../layout/FormInputs";
import { getCityBySupplier, getPlantBySupplier, getUOMSelectList, getPlantSelectListByType, getCityByCountry, getAllCity, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { createBOP, updateBOP, getBOPCategorySelectList, getBOPDomesticById, fileUploadBOPDomestic, checkAndGetBopPartNo } from '../actions/BoughtOutParts';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, showBopLabel, userDetails } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { BOP_MASTER_ID, FILE_URL, ZBC, EMPTY_GUID, SPACEBAR, VBCTypeId, CBCTypeId, ZBCTypeId, searchCount, ENTRY_TYPE_DOMESTIC, VBC_VENDOR_TYPE, BOP_VENDOR_TYPE, effectiveDateRangeDays } from '../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import DayTime from '../../common/DayTimeWrapper'
import { ASSEMBLY, AcceptableBOPUOM, FORGING, LOGISTICS, SHEETMETAL } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import { CheckApprovalApplicableMaster, displayUOM, onFocus, userTechnologyDetailByMasterId } from '../../../helper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import TooltipCustom from '../../common/Tooltip';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import WarningMessage from '../../common/WarningMessage';
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import { labels, useLabels } from '../../../helper/core';
import { subDays } from 'date-fns';


const selector = formValueSelector('AddBOPDomestic');

class AddBOPDomestic extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      BOPID: EMPTY_GUID,
      isEditFlag: this.props?.data?.isEditFlag ? true : false,
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
      finalApprovalLoader: getConfigurationKey().IsDivisionAllowedForDepartment ? false : true,
      client: [],
      costingTypeId: ZBCTypeId,
      showPopup: false,
      levelDetails: {},
      vendorFilterList: [],
      isClientVendorBOP: false,
      uomIsNo: false,
      CostingTypePermission: false,
      isTechnologyVisible: false,
      Technology: [],
      disableSendForApproval: false,
      isOpenConditionDrawer: false,
      conditionTableData: [],

      FinalBasicRateBaseCurrency: '',
      FinalBasicPriceBaseCurrency: '',
      FinalConditionCostBaseCurrency: '',
      FinalNetLandedCostBaseCurrency: '',
      toolTipTextNetCost: {},
      toolTipTextBasicPrice: '',
      IsBreakupBoughtOutPart: false,
      IsSAPCodeHandle: false,
      IsSAPCodeUpdated: false,
      IsSapCodeEditView: true,
      IsEditBtnClicked: false,
      SapCode: '',
    }
  }

  // NOTE :: ALL COST KEYS ARE OF BASE CURRENCY IRRESPECTIVE OF THEIR NAME IN DOMESTIC

  /**
  * @method componentWillMount
  * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {
      this.props.getUOMSelectList(() => { })
      this.props.getBOPCategorySelectList(() => { })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
    }
  }

  toolTipNetCost() {
    const { initialConfiguration } = this.props
    const { costingTypeId } = this.state
    let netCostText = ''
    let basicPriceText = ''
    if (initialConfiguration.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      if (getConfigurationKey().IsMinimumOrderQuantityVisible) {
        basicPriceText = `Basic Price (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) / Minimum Order Quantity`
      } else {
        basicPriceText = `Basic Price (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
      }
      netCostText = `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Price (${reactLocalStorage.getObject("baseCurrency")}) + Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`
      this.setState({ toolTipTextNetCost: netCostText, toolTipTextBasicPrice: basicPriceText })
    } else if (getConfigurationKey().IsMinimumOrderQuantityVisible) {
      netCostText = `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) / Minimum Order Quantity`
      this.setState({ toolTipTextNetCost: netCostText })
    } else {
      netCostText = `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
      this.setState({ toolTipTextNetCost: netCostText })
    }
    const obj = { ...this.state.toolTipTextObject, netCostCurrency: netCostText, basicPriceSelectedCurrency: basicPriceText }
    this.setState({ toolTipTextObject: obj })
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {

    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() });
    if (!this.state.isViewMode) {
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
      })
    }
    setTimeout(() => {
      this.getDetails()
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
      if (!(this.props.data.isEditFlag || this.props.data.isViewMode) && !getConfigurationKey().IsDivisionAllowedForDepartment) {
        this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
      }
      this.props.getClientSelectList(() => { })
    }, 300);
  }

  finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision = false) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewMode && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), BOP_MASTER_ID, (res) => {
        setTimeout(() => {
          this.commonFunction(plantId, isDivision)
        }, 100);
      })
    } else {
      this.setState({ finalApprovalLoader: false })
    }
  }

  commonFunction(plantId = EMPTY_GUID, isDivision) {
    let levelDetailsTemp = []
    levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId, BOP_MASTER_ID, this.props.userMasterLevelAPI)
    this.setState({ levelDetails: levelDetailsTemp })
    let obj = {
      TechnologyId: BOP_MASTER_ID,
      DepartmentId: userDetails().DepartmentId,
      UserId: loggedInUserId(),
      Mode: 'master',
      approvalTypeId: costingTypeIdToApprovalTypeIdFunction(this.state.costingTypeId),
      plantId: plantId
    }
    if (this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && !isDivision) {
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
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.toolTipNetCost()
      this.handleCalculation()
    }
    if (!getConfigurationKey().IsDivisionAllowedForDepartment && (prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
      this.commonFunction(this.state.selectedPlants && this.state.selectedPlants.value)
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
    const fieldsToClear = [
      'BoughtOutPartNumber',
      'BoughtOutPartName',
      'BOPCategory',
      'Specification',
      "SAPPartNumber",
      'Plant',
      "UOM",
      "cutOffPrice",
      "BasicRateBase",
      "EffectiveDate",
      "clientName"];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddBOPDomestic', false, false, fieldName));
    });
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag,
      vendorLocation: [],
      selectedPlants: [],
      isTechnologyVisible: false
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
      if (this.props.fieldsObj.BoughtOutPartName && this.state.BOPCategory && getConfigurationKey().IsAutoGeneratedBOPNumber) {
        let obj = {
          bopName: this.props.fieldsObj.BoughtOutPartName,
          bopCategory: newValue.label,
          bopNumber: ''
        }
        this.props.checkAndGetBopPartNo(obj, (res) => {
          let Data = res.data.Identity;
          this.props.change('BoughtOutPartNumber', Data)
        })
      }
    } else {
      this.setState({ BOPCategory: [], });

    }
  }
  handleBoughtOutPartName = debounce((e) => {
    if (this.state.BOPCategory.length !== 0 && e.target.value && getConfigurationKey().IsAutoGeneratedBOPNumber) {
      let obj = {
        bopName: e.target.value,
        bopCategory: this.state.BOPCategory.label,
        bopNumber: ''
      }
      this.props.checkAndGetBopPartNo(obj, (res) => {
        let Data = res.data.Identity;
        this.props.change('BoughtOutPartNumber', Data)
      })
    }
  }, 500)
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
    const { data, initialConfiguration } = this.props;
    if (data && data.isEditFlag) {
      this.setState({
        isLoader: true,
        BOPID: data.Id,
      })
      this.props.getBOPDomesticById(data.Id, res => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          this.setState({ DataToCheck: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change('BasicRateBase', checkForDecimalAndNull(Data.BasicRate, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('BasicPriceBase', checkForDecimalAndNull(Data.NetCostWithoutConditionCost, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('ConditionCost', checkForDecimalAndNull(Data.NetConditionCost, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('NetLandedCostBase', checkForDecimalAndNull(Data.NetLandedCost, initialConfiguration.NoOfDecimalForPrice))
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          // this.props.getPlantBySupplier(Data.Vendor, () => { })
          setTimeout(() => {
            let plantObj;
            if (getConfigurationKey().IsDestinationPlantConfigure) {
              plantObj = Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : []
            } else {
              plantObj = Data && Data.Plant.length > 0 ? { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId } : []
            }
            this.finalUserCheckAndMasterLevelCheckFunction(plantObj.value)
            // this.commonFunction(plantObj && plantObj.value)
            this.setState({
              IsFinancialDataChanged: false,
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
              isClientVendorBOP: Data.IsClientVendorBOP,
              isTechnologyVisible: Data.IsBreakupBoughtOutPart,
              Technology: { label: Data.TechnologyName, value: Data.TechnologyId },
              FinalConditionCostBaseCurrency: Data.NetConditionCost,
              conditionTableData: Data.BoughtOutPartConditionsDetails,
              FinalBasicPriceBaseCurrency: Data.NetCostWithoutConditionCost,
              IsBreakupBoughtOutPart: Data.IsBreakupBoughtOutPart,
              IsSAPCodeUpdated: Data.IsSAPCodeUpdated,
              SAPPartNumber: Data.SAPPartNumber !== undefined ? { label: Data.SAPPartNumber, value: Data.SAPPartNumber } : []
            }, () => {
              this.toolTipNetCost()
              this.setState({ isLoader: false })
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
      UOMSelectList, partSelectList, clientSelectList, costingSpecifiTechnology } = this.props;
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
    if (label === 'technology') {
      costingSpecifiTechnology &&
        costingSpecifiTechnology.map((item) => {
          if (item.Value === '0') return false
          if (item.Value === String(ASSEMBLY) || item.Value === String(LOGISTICS)) return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
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
          if (this.props.fieldsObj.BoughtOutPartName && categoryObj && getConfigurationKey().IsAutoGeneratedBOPNumber) {
            let obj = {
              bopName: this.props.fieldsObj.BoughtOutPartName,
              bopCategory: categoryObj.Text,
              bopNumber: ''
            }
            this.props.checkAndGetBopPartNo(obj, (res) => {
              let Data = res.data.Identity;
              this.props.change('BoughtOutPartNumber', Data)
            })
          }
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
    const { initialConfiguration } = this.props
    this.setState({ selectedPlants: e })
    if (!this.state.isViewMode && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !getConfigurationKey()?.IsDivisionAllowedForDepartment) {
      this.commonFunction(e ? e.value : '')
    }
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
          const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, this.state.vendorName)
          let vendorDataAPI = res?.data?.SelectList
          reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        }
        if (Object.keys(formData).length > 0) {
          this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
        }
      } else {
        if (this.state.vendorName && this.state.vendorName.length > 0) {
          const res = await getVendorNameByVendorSelectList(BOP_VENDOR_TYPE, this.state.vendorName)
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
    if (newValue && newValue !== '' && newValue.label === "No") {
      this.setState({ UOM: newValue, uomIsNo: true })
    }
    else if (newValue.label !== "No") {
      this.setState({ UOM: newValue, uomIsNo: false })
    }
    else {
      this.setState({ UOM: [] })
    }
  };

  uomToggler = () => {
    this.setState({ isOpenUOM: true })
  }

  closeUOMDrawer = (e = '') => {
    this.setState({ isOpenUOM: false })
  }

  recalculateConditions = (basicPriceBase) => {
    const { conditionTableData } = this.state;
    let tempList = conditionTableData && conditionTableData?.map(item => {
      if (item?.ConditionType === "Percentage") {
        let costBase = checkForNull((item?.Percentage) / 100) * checkForNull(basicPriceBase)
        item.ConditionCost = costBase
      }
      return item
    })
    return tempList
  }

  handleCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props
    const { FinalConditionCostBaseCurrency, costingTypeId } = this.state
    const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 1;

    const basicRateBaseCurrency = checkForNull(fieldsObj?.BasicRateBase)
    const basicPriceBaseTemp = !NoOfPieces ? checkForNull(basicRateBaseCurrency) : checkForNull(basicRateBaseCurrency) / checkForNull(NoOfPieces)
    let basicPriceBaseCurrency
    if (costingTypeId === ZBCTypeId) {
      basicPriceBaseCurrency = basicPriceBaseTemp
    }
    const conditionCostBaseCurrency = checkForNull(FinalConditionCostBaseCurrency)

    let conditionList = this.recalculateConditions(basicPriceBaseCurrency)

    const sumBase = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
    let netLandedCostBaseCurrency = checkForNull(sumBase) + checkForNull(basicPriceBaseTemp)

    this.props.change("BasicPriceBase", checkForDecimalAndNull(basicPriceBaseCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('ConditionCost', checkForDecimalAndNull(sumBase, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBase', checkForDecimalAndNull(netLandedCostBaseCurrency, initialConfiguration.NoOfDecimalForPrice))

    this.setState({
      FinalBasicRateBaseCurrency: basicRateBaseCurrency,
      FinalBasicPriceBaseCurrency: basicPriceBaseCurrency,
      FinalConditionCostBaseCurrency: conditionCostBaseCurrency,
      FinalNetLandedCostBaseCurrency: netLandedCostBaseCurrency,
      conditionTableData: conditionList,
    })

    if (this.state.isEditFlag && checkForNull(basicPriceBaseCurrency) === checkForNull(this.state.DataToCheck?.NetCostWithoutConditionCost) &&
      checkForNull(NoOfPieces) === checkForNull(this.state.DataToCheck?.NumberOfPieces) && checkForNull(netLandedCostBaseCurrency) === checkForNull(this.state.DataToCheck?.NetLandedCost)) {

      this.setState({ IsFinancialDataChanged: false, EffectiveDate: DayTime(this.state.DataToCheck?.EffectiveDate).isValid() ? DayTime(this.state.DataToCheck?.EffectiveDate) : '' });
      this.props.change('EffectiveDate', DayTime(this.state.DataToCheck?.EffectiveDate).isValid() ? DayTime(this.state.DataToCheck?.EffectiveDate) : '')
    } else {
      this.setState({ IsFinancialDataChanged: true })

    }

    //COMMENTED FOR MINDA
    // const NetLandedCost = checkForNull(BasicRateBase) //THIS IS ONLY FOR MINDA
    // this.setState({
    //   BasicPrice: BasicPrice
    // })
    // this.props.change('BasicPrice', BasicPrice !== 0 ? checkForDecimalAndNull(BasicPrice, initialConfiguration.NoOfDecimalForPrice) : 0)
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
    * @method handleChangeSapCode
    * @description used SapCode handler
    */
  handleChangeSapCode = (e) => {

    const isInputNotEmpty = e.target.value.trim() !== '';
    this.setState({
      SapCode: e.target.value,
      IsSAPCodeHandle: isInputNotEmpty ? true : false
    }, () => {


    });
  }


  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = checkForNull(this.dropzone.current.files.length) - checkForNull(this.state.files.length)
    if (checkForNull(loop) === 1 || checkForNull(this.dropzone.current.files.length) === checkForNull(this.state.files.length)) {
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
  }
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('')
    } else {
      this.setState({ showPopup: true })
    }
  }
  onPopupConfirm = () => {
    this.cancel('submit')
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }

  /**
   * @method handleSubmitOfSapCode
   * @description used to update sapcode 
   */
  handleSubmitOfSapCode = (onSubmitSapCode) => {

    if (!this.state.isEditBtnClicked) {
      this.setState({
        IsSapCodeEditView: false,
        isEditBtnClicked: true
      });

    } else {
      if (this.state.isEditFlag) {
        // Check if IsSAPCodeHandle is true before calling onSubmitSapCode
        if (this.state.IsSAPCodeHandle) {
          onSubmitSapCode();
        }
      } else {
        // Handle the else case if needed
      }
    }
  };
  handleBOPOperation = (formData, isEditFlag) => {
    const operation = isEditFlag ? this.props.updateBOP : this.props.createBOP;
    const successMessage = isEditFlag ? MESSAGES.UPDATE_BOP_SUCESS : MESSAGES.BOP_ADD_SUCCESS;

    operation(formData, (res) => {
      this.setState({ setDisable: false });
      if (res?.data?.Result) {
        Toaster.success(successMessage);
        if (isEditFlag) {
          if (!this.state.isEditBtnClicked) {
            this.cancel('submit');
          } else {
            this.getDetails();
            this.setState({
              IsSapCodeEditView: true,
              IsSAPCodeHandle: false
            });
          }
        } else {
          this.cancel('submit');
        }
      }
    });

    if (isEditFlag) {
      this.setState({ updatedObj: formData });
    }
  }

  /**
  * @method 
  * 
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { BOPCategory, selectedPlants, vendorName, costingTypeId, sourceLocation, BOPID, isEditFlag, files, DropdownChanged, oldDate, client, effectiveDate, UOM, DataToCheck, isDateChange, IsFinancialDataChanged,
      isClientVendorBOP, isTechnologyVisible, Technology, FinalConditionCostBaseCurrency, FinalBasicPriceBaseCurrency, FinalNetLandedCostBaseCurrency, FinalBasicRateBaseCurrency, conditionTableData, isBOPAssociated, IsSAPCodeHandle, IsSAPCodeUpdated } = this.state;
    const { fieldsObj } = this.props;
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
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: BOPID }
    })
    // if (isEditFlag && this.state.isFinalApprovar) {
    const formData = {}
    formData.IsFinancialDataChanged = isDateChange ? true : false
    formData.BoughtOutPartId = BOPID
    formData.CostingTypeId = costingTypeId
    formData.BoughtOutPartNumber = values?.BoughtOutPartNumber
    formData.BoughtOutPartName = values?.BoughtOutPartName
    formData.CategoryId = BOPCategory.value
    formData.Specification = values?.Specification
    formData.SAPPartNumber = values?.SAPPartNumber
    formData.UnitOfMeasurementId = UOM.value
    formData.Vendor = vendorName.value
    formData.Source = values?.Source
    formData.SourceLocation = sourceLocation.value
    formData.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    formData.NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? values?.NumberOfPieces : 1
    formData.Remark = values?.Remark
    formData.IsActive = true
    formData.LoggedInUserId = loggedInUserId()
    formData.Plant = [plantArray]
    formData.VendorPlant = []
    formData.DestinationPlantId = (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? selectedPlants.value : (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? selectedPlants.value : userDetailsBop.Plants[0].PlantId
    formData.Attachements = isEditFlag ? updatedFiles : files
    formData.CustomerId = client.value
    formData.EntryType = checkForNull(ENTRY_TYPE_DOMESTIC)
    formData.CategoryName = BOPCategory.label
    formData.IsClientVendorBOP = isClientVendorBOP
    formData.IsSAPCodeHandle = IsSAPCodeHandle ? true : false
    formData.IsSAPCodeUpdated = IsSAPCodeUpdated
    formData.TechnologyName = Technology?.label
    formData.TechnologyId = Technology?.value
    formData.IsBreakupBoughtOutPart = isTechnologyVisible

    formData.BasicRate = FinalBasicRateBaseCurrency
    formData.NetLandedCost = FinalNetLandedCostBaseCurrency

    if (costingTypeId === ZBCTypeId) {
      formData.NetCostWithoutConditionCost = FinalBasicPriceBaseCurrency
      formData.NetConditionCost = FinalConditionCostBaseCurrency
    }

    formData.BoughtOutPartConditionsDetails = conditionTableData

    // CHECK IF CREATE MODE OR EDIT MODE !!!  IF: EDIT  ||  ELSE: CREATE
    if (isEditFlag) {
      let basicPriceBaseCurrency
      if (costingTypeId === ZBCTypeId) {
        basicPriceBaseCurrency = checkForNull(fieldsObj?.BasicRateBase) / checkForNull(fieldsObj?.NumberOfPieces ? fieldsObj?.NumberOfPieces : 1)
      }
      const netLandedCostBaseCurrency = checkForNull(checkForNull(fieldsObj?.BasicRateBase) / checkForNull(fieldsObj?.NumberOfPieces ? fieldsObj?.NumberOfPieces : 1)) + checkForNull(FinalConditionCostBaseCurrency)
      // CHECK IF THERE IS CHANGE !!!  
      // IF: NO CHANGE  

      if (((files ? JSON.stringify(files) : []) === (DataToCheck.Attachements ? JSON.stringify(DataToCheck.Attachements) : [])) && ((DataToCheck.Remark ? DataToCheck.Remark : '') === (values?.Remark ? values?.Remark : '')) &&
        ((DataToCheck.SAPPartNumber ? DataToCheck.SAPPartNumber : '') === (values?.SAPPartNumber ? values?.SAPPartNumber : '')) &&
        ((DataToCheck.Source ? String(DataToCheck.Source) : '-') === (values?.Source ? String(values?.Source) : '-')) &&
        ((DataToCheck.SourceLocation ? String(DataToCheck.SourceLocation) : '') === (sourceLocation?.value ? String(sourceLocation?.value) : '')) &&
        checkForNull(fieldsObj?.BasicRateBase) === checkForNull(DataToCheck?.BasicRate) && checkForNull(basicPriceBaseCurrency) === checkForNull(DataToCheck?.NetCostWithoutConditionCost) &&
        checkForNull(netLandedCostBaseCurrency) === checkForNull(DataToCheck?.NetLandedCost) && checkForNull(FinalConditionCostBaseCurrency) === checkForNull(DataToCheck?.NetConditionCost) && DropdownChanged && ((DataToCheck.TechnologyId ? String(DataToCheck.TechnologyId) : '') === (Technology?.value ? String(Technology?.value) : ''))) {
        this.setState({ isEditBuffer: true })
        Toaster.warning(`Please change data to send ${showBopLabel()} for approval`)
        return false
      }
      //  ELSE: CHANGE
      else {
        //  IF: NEE TO UPDATE EFFECTIVE DATE
        if (IsFinancialDataChanged || isBOPAssociated) {
          if (!isDateChange || (DayTime(oldDate).format("DD/MM/YYYY") === DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ isEditBuffer: true })
            Toaster.warning('Please update the effective date')
            return false
          }
        }
      }
    }

    //  IF: APPROVAL FLOW
    if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar && !isTechnologyVisible) {
      formData.IsSendForApproval = true
      this.setState({ approveDrawer: true, approvalObj: formData })
    }
    //  ELSE: NO APPROVAL FLOW
    else {
      formData.IsSendForApproval = false;
      this.handleBOPOperation(formData, isEditFlag);
    }
  }, 500)

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  labelWithUOM = (value) => {
    const { initialConfiguration } = this.props
    return <div>
      <span className='d-flex'>Basic Rate/{displayUOM(value)} ({reactLocalStorage.getObject("baseCurrency")})</span>
    </div>
  }
  onIsClientVendorBOP = () => {
    this.setState({ isClientVendorBOP: !this.state.isClientVendorBOP })
  }

  breakUpHandleChange = () => {
    this.setState({ isTechnologyVisible: !this.state.isTechnologyVisible })
  }

  /**
   * @method handleTechnologyChange
   * @description Use to handle technology change
  */
  handleTechnologyChange = (newValue) => {
    if (newValue.value === String(FORGING)) {
      this.setState({ Technology: newValue })
    } else if (newValue.value === String(SHEETMETAL)) {
      this.setState({ Technology: newValue })
    } else {
      this.setState({ Technology: newValue })
    }
    // this.setState({ isDropDownChanged: true })
  }

  showBasicRate = () => {
    const { isEditFlag } = this.state
    let value = false
    if (isEditFlag) {
      value = this.props?.data?.showPriceFields ? true : false
    }
    return value
  }

  openAndCloseAddConditionCosting = (type, data = this.state.conditionTableData) => {
    const { initialConfiguration } = this.props
    if (type === 'save') {
      this.setState({ IsFinancialDataChanged: true })
    }
    const sum = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
    let netLandedCost = checkForNull(sum) + checkForNull(this.state.FinalBasicPriceBaseCurrency)
    this.props.change('ConditionCost', checkForDecimalAndNull(sum, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBase', checkForDecimalAndNull(netLandedCost, initialConfiguration.NoOfDecimalForPrice))
    this.setState({
      isOpenConditionDrawer: false,
      conditionTableData: data,
      FinalConditionCostBaseCurrency: sum,
      FinalNetLandedCostBaseCurrency: netLandedCost
    })
  }

  conditionToggle = () => {
    this.setState({ isOpenConditionDrawer: true })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isBOPAssociated, initialConfiguration, t, } = this.props;
    const { isCategoryDrawerOpen, isOpenVendor, costingTypeId, isOpenUOM, isEditFlag, isViewMode, setDisable, isClientVendorBOP, CostingTypePermission,
      isTechnologyVisible, disableSendForApproval, isOpenConditionDrawer, conditionTableData, FinalBasicPriceBaseCurrency, IsFinancialDataChanged, toolTipTextNetCost, toolTipTextBasicPrice, IsSAPCodeUpdated, IsSapCodeEditView, IsSAPCodeHandle
    } = this.state;
    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        if (costingTypeId === VBCTypeId) {
          res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        }
        else {
          res = await getVendorNameByVendorSelectList(BOP_VENDOR_TYPE, resultInput)
        }
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
                          {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} {showBopLabel()} (Domestic)
                          {!isViewMode && <TourWrapper
                            buttonSpecificProp={{ id: "Add_BOP_Domestic_Form" }}

                            stepsSpecificProp={{
                              steps: Steps(t, {
                                isBOPAssociated: isBOPAssociated,
                                isEditFlag: isEditFlag,
                                showSendForApproval: !this.state.isFinalApprovar,
                                sourceField: (costingTypeId === VBCTypeId),
                                CBCTypeField: (costingTypeId === CBCTypeId),
                                conditionCost: (initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId)
                              }).BOP_DOMESTIC_FORM
                            }} />}
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
                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="bop_form_zero_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                className='zero-based'
                                id="zeroBased"
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
                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id='bop_form_vendor_based' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                className='vendor-based'
                                id="vendorBased"
                                checked={
                                  costingTypeId === VBCTypeId ? true : false
                                }
                                onClick={() =>
                                  this.onPressVendor(VBCTypeId)
                                }
                                disabled={isEditFlag ? true : false}
                              />{" "}
                              <span>{labels(t, 'VendorLabel', 'MasterLabels', 'Vendor')} Based</span>
                            </Label>}
                            {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id='bop_form_customer_based' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                className='customer-based'
                                id="customerBased"
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
                          <Col md="12">
                            <div className="left-border">{`${showBopLabel()}:`}
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`${showBopLabel()} Part Name`}
                              name={"BoughtOutPartName"}
                              id='bop_part_name_form_zero_based'
                              type="text"
                              placeholder={isEditFlag ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation]}
                              component={renderText}
                              onChange={this.handleBoughtOutPartName}
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
                                  label={`${showBopLabel()} Category`}
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
                                <Button
                                  id="addBOPDomestic_categoryToggle"
                                  onClick={this.categoryToggler}
                                  className={"right"}
                                  variant="plus-icon-square"
                                />
                              }
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`${showBopLabel()} Part No`}
                              name={"BoughtOutPartNumber"}
                              id='bop_part_number_form_zero_based'
                              type="text"
                              placeholder={(isEditFlag || getConfigurationKey().IsAutoGeneratedBOPNumber) ? '-' : "Enter"}
                              validate={[required, acceptAllExceptSingleSpecialCharacter, maxLength20, checkWhiteSpaces, checkSpacesInString, hashValidation]}
                              component={renderText}
                              required={true}
                              disabled={(isEditFlag || getConfigurationKey().IsAutoGeneratedBOPNumber) ? true : false}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>

                          <Col md="3">
                            <Field
                              label={`Specification`}
                              name={"Specification"}
                              id='bop_specification_form_zero_based'
                              type="text"
                              placeholder={isViewMode ? "-" : "Enter"}
                              validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, checkSpacesInString, hashValidation]}
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
                                label={costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
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
                                className="multiselect-with-border bop_plant_form_zero_based"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}
                          {initialConfiguration?.IsBoughtOutPartCostingConfigured && costingTypeId === VBCTypeId &&
                            <>
                              <Col md="3" className='d-flex align-items-center'>
                                <label
                                  className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                                    }`}

                                  onChange={this.breakUpHandleChange}
                                >
                                  Detailed {showBopLabel()}
                                  <input
                                    type="checkbox"
                                    checked={isTechnologyVisible}
                                    disabled={isViewMode ||
                                      (/* isBOPAssociated && */ isEditFlag && costingTypeId === VBCTypeId)}
                                  />
                                  <span
                                    className=" before-box"
                                    checked={isTechnologyVisible}
                                    onChange={this.breakUpHandleChange}
                                  />
                                </label>
                                {/*                                 {isBOPAssociated && isEditFlag && costingTypeId === VBCTypeId && <WarningMessage dClass={"mr-2"} message={`This ${showBopLabel()} is already associated, so now you can't edit it.`} />}
 */}                              </Col>
                              {isTechnologyVisible && <Col md="3">
                                <Field
                                  label={t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
                                  type="text"
                                  name="Technology"
                                  component={searchableSelect}
                                  placeholder={"Technology"}
                                  options={this.renderListing("technology")}
                                  validate={
                                    this.state.Technology == null || this.state.Technology.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={
                                    this.handleTechnologyChange
                                  }
                                  valueDescription={this.state.Technology}
                                  disabled={isViewMode || (/* isBOPAssociated && */ isEditFlag && costingTypeId === VBCTypeId)}
                                />
                              </Col>}
                            </>
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
                          {getConfigurationKey().IsSAPCodeRequired &&
                            <Col md="3">
                              <div className="d-flex align-items-center">
                                <Field
                                  label={`SAP Code`}
                                  name={"SAPPartNumber"}
                                  id='bop_SAP_Code_form_zero_based'
                                  type="text"
                                  placeholder={isViewMode ? "-" : "Enter"}
                                  validate={[acceptAllExceptSingleSpecialCharacter, maxLength20, checkSpacesInString, hashValidation]}
                                  component={renderText}
                                  disabled={IsSapCodeEditView && isEditFlag}
                                  value={this.state.SapCode}
                                  onChange={this.handleChangeSapCode}
                                  className=" "
                                  customClassName=" withBorder w-100 mb-0"
                                />
                                {!IsSAPCodeUpdated && isEditFlag && (
                                  <Button className={"Edit ms-2 mt-2"} variant="Edit" title={"Edit"} onClick={() => { this.handleSubmitOfSapCode(handleSubmit(this.onSubmit.bind(this))) }} />
                                )}
                              </div>
                              {IsSAPCodeHandle && isEditFlag && (
                                <WarningMessage dClass={'d-flex justify-content-end'} message={`${MESSAGES.SAP_CODE_WARNING}`} />
                              )}
                            </Col>}
                        </Row>

                        <Row>
                          {costingTypeId !== CBCTypeId && (
                            <>
                              <Col md="12">
                                <div className="left-border">{labels(t, 'VendorLabel', 'MasterLabels', 'Vendor')}:</div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{costingTypeId === ZBCTypeId ? 'BOP' : ''} {labels(t, 'VendorLabel', 'MasterLabels', 'Vendor')}<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div className="fullinput-icon p-relative">
                                    {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="vendorName"
                                      id="bop_vendor_name_form_zero_based"
                                      ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={filterList}
                                      onChange={(e) => this.handleVendorName(e)}
                                      value={this.state.vendorName}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                      isDisabled={(isEditFlag) ? true : false}
                                      onFocus={() => onFocus(this)}
                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                    />
                                  </div>
                                  {!isEditFlag && (
                                    <Button
                                      id="addBOPDomestic_vendorToggle"
                                      onClick={this.vendorToggler}
                                      className={"right"}
                                      variant="plus-icon-square"
                                    />
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
                                  validate={[acceptAllExceptSingleSpecialCharacter, maxLength(80), hashValidation]}
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
                                minDate={isEditFlag ? this.state.minEffectiveDate : subDays(new Date(), effectiveDateRangeDays)}
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                  //e.preventDefault()
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewMode || !IsFinancialDataChanged}
                                placeholder={isViewMode || !IsFinancialDataChanged ? '-' : 'Select Date'}
                              />
                            </div>
                          </Col>
                          {getConfigurationKey().IsMinimumOrderQuantityVisible && (!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible &&
                            < Col md="3">
                              <Field
                                label={`Minimum Order Quantity`}
                                name={"NumberOfPieces"}
                                type="text"
                                placeholder={"Enter"}
                                validate={this.state.uomIsNo ? [postiveNumber, maxLength10] : [positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderText}
                                required={false}
                                className=""
                                customClassName=" withBorder"
                                disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                              />
                            </Col>}
                          {(!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible && <>
                            <Col md="3">
                              <Field
                                label={this.labelWithUOM(this.state.UOM.label ? this.state.UOM.label : 'UOM')}
                                name={"BasicRateBase"}
                                type="text"
                                placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col></>}
                          {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && !isTechnologyVisible && <>
                            <Col md="3">
                              <TooltipCustom id="bop-basic-price" tooltipText={this.state.toolTipTextObject?.basicPriceSelectedCurrency} />
                              <Field
                                label={`Basic Price/${this.state.UOM.label ? this.state.UOM.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={"BasicPriceBase"}
                                type="text"
                                placeholder={"-"}
                                validate={[]}
                                component={renderTextInputField}
                                required={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <div className='d-flex align-items-center'>
                                <div className="w-100">
                                  <Field
                                    label={`Condition Cost/${this.state.UOM.label ? this.state.UOM.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"ConditionCost"}
                                    type="text"
                                    placeholder={"-"}
                                    validate={[]}
                                    component={renderText}
                                    required={false}
                                    disabled={true}
                                    isViewFlag={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </div>
                                <Button
                                  id="addBOPDomestic_condition"
                                  onClick={this.conditionToggle}
                                  className={"right mt-0 mb-2"}
                                  variant={isViewMode ? "view-icon-primary" : "plus-icon-square"}
                                />

                              </div>
                            </Col>
                          </>}
                          {(!isTechnologyVisible || this.state.IsBreakupBoughtOutPart) && <Col md="3">
                            <TooltipCustom id="bop-net-cost" tooltipText={toolTipTextNetCost} />
                            <Field
                              label={`Net Cost/${this.state.UOM.label ? this.state.UOM.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                              name={`${this.state.NetLandedCost === 0 ? '' : "NetLandedCostBase"}`}
                              type="text"
                              placeholder={"-"}
                              validate={[]}
                              component={renderTextInputField}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>}


                        </Row>
                        {getConfigurationKey().IsShowClientVendorBOP && costingTypeId === CBCTypeId && <Col md="3" className="d-flex align-items-center mb-3">
                          <label
                            className={`custom-checkbox`}
                            onChange={this.onIsClientVendorBOP}
                          >
                            Client Approved {labels(t, 'VendorLabel', 'MasterLabels', 'Vendor')}
                            <input
                              type="checkbox"
                              checked={isClientVendorBOP}
                              disabled={(isEditFlag && isBOPAssociated) || isViewMode ? true : false}
                            />
                            <span
                              className=" before-box"
                              checked={isClientVendorBOP}
                              onChange={this.onIsClientVendorBOP}
                            />
                          </label>
                        </Col>}
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
                              validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                              disabled={isViewMode}
                              value={this.state.remarks}
                              onChange={this.handleMessageChange}
                              component={renderTextAreaField}
                              maxLength="5000"
                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files)
                            </label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit reached.
                            </div>
                            <div id='bop_file_upload_form_zero_based' className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                disabled={isViewMode}
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                initialFiles={this.state.initialFiles}
                                maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
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
                      </div >
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                          {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                          <Button
                            id="AddBOPDomestic_cancel"
                            onClick={this.cancelHandler}
                            disabled={setDisable}
                            className="mr15"
                            variant="cancel-btn"
                            icon="cancel-icon"
                            buttonName="Cancel"
                          />
                          {!isViewMode && <>
                            {((!isViewMode && (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration.IsMasterApprovalAppliedConfigure) || (initialConfiguration.IsMasterApprovalAppliedConfigure && !CostingTypePermission && !isTechnologyVisible)) && !isTechnologyVisible ?
                              <Button
                                id="AddBOPDomestic_sendForApproval"
                                type="submit"
                                className="mr5"
                                disabled={isViewMode || setDisable || disableSendForApproval}
                                icon="send-for-approval"
                                buttonName="Send For Approval"

                              />
                              :                                                                // BOP APPROVAL IN PROGRESS DONT DELETE THIS CODE
                              <Button
                                id="AddBOPDomestic_updateSave"
                                type="submit"
                                className="mr5"
                                disabled={isViewMode || setDisable || disableSendForApproval}
                                icon="save-icon"
                                buttonName={isEditFlag ? "Update" : "Save"}

                              />
                            }
                          </>}
                        </div>
                      </Row>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div >
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
          }
          {
            isCategoryDrawerOpen && (
              <AddBOPCategory
                isOpen={isCategoryDrawerOpen}
                closeDrawer={this.closeCategoryDrawer}
                isEditFlag={false}
                anchor={"right"}
              />
            )
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
            initialConfiguration?.IsBasicRateAndCostingConditionVisible && isOpenConditionDrawer &&
            <AddConditionCosting
              isOpen={isOpenConditionDrawer}
              tableData={conditionTableData}
              closeDrawer={this.openAndCloseAddConditionCosting}
              anchor={'right'}
              basicRateCurrency={FinalBasicPriceBaseCurrency}
              ViewMode={((isEditFlag && isBOPAssociated) || isViewMode)}
              isFromMaster={true}
              EntryType={checkForNull(ENTRY_TYPE_DOMESTIC)}
            />
          }
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
                IsImportEntry={false}
                UOM={this.state.UOM}
                costingTypeId={this.state.costingTypeId}
                levelDetails={this.state.levelDetails}
                isFromImport={false}
                currency={{ label: reactLocalStorage.getObject("baseCurrency"), value: reactLocalStorage.getObject("baseCurrency") }}
                toolTipTextObject={this.state.toolTipTextObject}
                commonFunction={this.finalUserCheckAndMasterLevelCheckFunction}
                handleOperation={this.handleBOPOperation}
                isEdit={this.state.isEditFlag}
              />
            )
          }
        </div >
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
  const { comman, supplier, boughtOutparts, part, auth, costing, client } = state;
  const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRateBase', 'Remark', 'BoughtOutPartName', 'SAPPartNumber');

  const { bopCategorySelectList, bopData, } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList, UOMSelectList, plantSelectList, costingHead } = comman;
  const { partSelectList } = part;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration, userMasterLevelAPI } = auth;
  const { clientSelectList } = client;
  const { costingSpecifiTechnology } = costing

  let initialValues = {};
  if (bopData && bopData !== undefined) {
    initialValues = {
      BoughtOutPartNumber: bopData.BoughtOutPartNumber,
      BoughtOutPartName: bopData.BoughtOutPartName,
      Specification: bopData.Specification,
      Source: bopData.Source,
      NetLandedCost: bopData.NetLandedCost,
      BasicPriceBase: bopData.BasicPriceBase,
      BasicRateBase: bopData.BasicRateBase,
      Remark: bopData.Remark,
      NumberOfPieces: bopData?.NumberOfPieces,
      SAPPartNumber: bopData?.SAPPartNumber
    }
  }

  return {
    vendorWithVendorCodeSelectList, plantList, filterPlantList, filterCityListBySupplier, cityList, UOMSelectList,
    plantSelectList, bopCategorySelectList, bopData, partSelectList, costingHead, fieldsObj, initialValues, initialConfiguration, clientSelectList, userMasterLevelAPI, costingSpecifiTechnology
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createBOP,
  updateBOP,
  getPlantBySupplier,
  getCityBySupplier,
  getUOMSelectList,
  getBOPCategorySelectList,
  getBOPDomesticById,
  fileUploadBOPDomestic,
  getPlantSelectListByType,
  checkFinalUser,
  getCityByCountry,
  getAllCity,
  getClientSelectList,
  getUsersMasterLevelAPI,
  getVendorNameByVendorSelectList,
  getCostingSpecificTechnology,
  checkAndGetBopPartNo
})(reduxForm({
  form: 'AddBOPDomestic',
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(withTranslation(['BOPMaster', 'MasterLabels'])(AddBOPDomestic)));
