import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import {
  required, checkForNull, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20,
  maxLength10, positiveAndDecimalNumber, maxLength512, decimalLengthsix, checkWhiteSpaces, checkSpacesInString, maxLength80, number, postiveNumber, hashValidation
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, renderDatePicker, renderTextInputField, focusOnError } from "../../layout/FormInputs";
import { getPlantBySupplier, getUOMSelectList, getCurrencySelectList, getPlantSelectListByType, getCityByCountry, getAllCity, getVendorNameByVendorSelectList } from '../../../actions/Common';
import {
  createBOP, updateBOP, getBOPCategorySelectList, getBOPImportById,
  fileUploadBOPDomestic, getIncoTermSelectList, getPaymentTermSelectList, checkAndGetBopPartNo
} from '../actions/BoughtOutParts';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, IsFetchExchangeRateVendorWise, loggedInUserId, showBopLabel, userDetails } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC, BOP_MASTER_ID, EMPTY_GUID, SPACEBAR, ZBCTypeId, VBCTypeId, CBCTypeId, searchCount, ENTRY_TYPE_IMPORT, VBC_VENDOR_TYPE, BOP_VENDOR_TYPE, effectiveDateRangeDays } from '../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import DayTime from '../../common/DayTimeWrapper'
import { ASSEMBLY, AcceptableBOPUOM, FORGING, LOGISTICS, SHEETMETAL } from '../../../config/masterData'
import { getExchangeRateByCurrency } from "../../costing/actions/Costing"
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage'
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import { CheckApprovalApplicableMaster, onFocus, userTechnologyDetailByMasterId } from '../../../helper';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import TooltipCustom from '../../common/Tooltip';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import { subDays } from 'date-fns';
import { labels } from '../../../helper/core';

const selector = formValueSelector('AddBOPImport');

class AddBOPImport extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: this.props?.data?.isEditFlag ? true : false,
      IsVendor: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,

      BOPCategory: [],
      isCategoryDrawerOpen: false,
      client: [],
      selectedPartAssembly: [],
      selectedPlants: [],
      costingTypeId: ZBCTypeId,
      isOpenVendor: false,
      isVendorNameNotSelected: false,
      vendorName: [],
      approvalObj: {},
      minEffectiveDate: '',
      sourceLocation: [],
      isFinalApprovar: false,
      approveDrawer: false,
      IsFinancialDataChanged: true,
      oldDate: '',
      costingHead: 'zero',
      UOM: [],
      isOpenUOM: false,
      currency: [],
      isDateChange: false,
      effectiveDate: '',
      files: [],
      dateCount: 0,
      BOPID: EMPTY_GUID,

      NetLandedcost: '',
      currencyValue: 1,
      showCurrency: false,
      netLandedConverionCost: '',
      DataToChange: [],
      DropdownChange: true,
      showWarning: false,
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
      showPopup: false,
      incoTerm: [],
      paymentTerm: [],
      levelDetails: {},
      vendorFilterList: [],
      isCallCalculation: false,
      uomIsNo: false,
      isClientVendorBOP: false,
      CostingTypePermission: false,
      isTechnologyVisible: false,
      Technology: [],
      disableSendForApproval: false,
      isOpenConditionDrawer: false,
      conditionTableData: [],
      NetLandedCostINR: '',
      NetLandedCostSelectedCurrency: '',

      FinalBasicRateSelectedCurrency: '',
      FinalBasicRateBaseCurrency: '',
      FinalBasicPriceSelectedCurrency: '',
      FinalBasicPriceBaseCurrency: '',
      FinalNetCostBaseCurrency: '',
      FinalNetCostSelectedCurrency: '',
      FinalConditionCostBaseCurrency: '',
      FinalConditionCostSelectedCurrency: '',
      DropdownChanged: true,
      toolTipTextObject: {},
      toolTipTextNetCost: {},
      toolTipTextBasicPrice: {},
      IsBreakupBoughtOutPart: false,
      IsSAPCodeHandle: false,
      IsSAPCodeUpdated: false,
      IsSapCodeEditView: true,
      IsEditBtnClicked: false,
      SapCode: '',
    }
  }

  // NOTE ::
  //  KEY ENDING WITH "BASECURRENCY" CONTAINS VALUE IN BASE CURRENCY (INR) 
  //  KEY ENDING WITH "SELECTEDCURRENCY" CONTAINS VALUE IN SELECTED CURRENCY (USD OR EUR) 

  /**
   * @method componentWillMount
   * @description Called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.props.data.isViewMode)) {
      this.props.getUOMSelectList(() => { })
      this.props.getBOPCategorySelectList(() => { })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
    }
  }

  toolTipNetCost = (currency) => {
    const { costingTypeId } = this.state
    const { initialConfiguration } = this.props
    let obj = {}
    if (initialConfiguration.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      obj = {
        toolTipTextNetCostSelectedCurrency: `Net Cost (${currency?.label}) = Basic Price (${currency?.label})  + Condition Cost (${currency?.label})`,
        toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Price (${reactLocalStorage.getObject("baseCurrency")})  + Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`
      }
    } else if (getConfigurationKey().IsMinimumOrderQuantityVisible) {
      obj = {
        toolTipTextNetCostSelectedCurrency: `Net Cost (${currency?.label}) = Basic Rate (${currency?.label}) / Minimum Order Quantity`,
        toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) / Minimum Order Quantity`
      }
    } else {
      obj = {
        toolTipTextNetCostSelectedCurrency: `Net Cost (${currency?.label}) = Basic Rate (${currency?.label})`,
        toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
      }
    }
    this.setState({ toolTipTextNetCost: obj })
    return obj
  }

  toolTipBasicPrice = (currency) => {
    const { initialConfiguration } = this.props
    const { costingTypeId, currencyValue } = this.state
    let obj = {}
    if (initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      obj = {
        toolTipTextBasicPriceSelectedCurrency: `Basic Price (${currency.label === undefined ? 'Currency' : currency?.label}) = Basic Rate (${currency.label === undefined ? 'Currency' : currency?.label}) / Minimum Order Quantity`,
        toolTipTextBasicPriceBaseCurrency: `Basic Price (${reactLocalStorage.getObject("baseCurrency")}) =  Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) / Minimum Order Quantity`
      }
    }
    this.setState({ toolTipTextBasicPrice: obj })
    return obj
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {



    const { initialConfiguration } = this.props
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    const { currency } = this.state
   
        this.props.getIncoTermSelectList(() => { })
    this.props.getPaymentTermSelectList(() => { })    // FOR MINDA ONLY
    this.getDetails()
    this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
    if (!(this.props.data.isEditFlag || this.props.data.isViewMode) && !getConfigurationKey().IsDivisionAllowedForDepartment) {
      this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
    }
    this.props.getCurrencySelectList(() => { })
    this.props.getClientSelectList(() => { })
  }
  finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision) => {
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

  setInStateToolTip() {
    const { currency, currencyValue } = this.state
    const { initialConfiguration } = this.props

    const obj = {
      ...this.state.toolTipTextObject, netCostCurrency: this.toolTipNetCost(currency)?.toolTipTextNetCostSelectedCurrency, netCostBaseCurrency: this.toolTipNetCost(currency)?.toolTipTextNetCostBaseCurrency,
      basicPriceSelectedCurrency: this.toolTipBasicPrice(currency)?.toolTipTextBasicPriceSelectedCurrency, basicPriceBaseCurrency: this.toolTipBasicPrice(currency)?.toolTipTextBasicPriceBaseCurrency
      , toolTipTextBasicRateSelectedCurrency: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) = (Basic Rate (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? '-' : currencyValue})`
    }
    this.setState({ toolTipTextObject: obj })
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (!this.props.data.isViewMode && !this.state.isCallCalculation) {
      if (this.props.fieldsObj !== prevProps.fieldsObj) {
        this.setInStateToolTip()
        this.handleCalculation()
      }
      if (!getConfigurationKey().IsDivisionAllowedForDepartment && (prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
        if (!(this.props.data.isViewMode)) {
          this.commonFunction(this.state.selectedPlants && this.state.selectedPlants.value)
        }
      }
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
    if (costingHeadFlag === this.state.costingTypeId) {
      return false;
    }
    const fieldsToClear = [
      'BoughtOutPartNumber',
      'BoughtOutPartName',
      'BOPCategory',
      'Specification',
      "SAPPartNumber",
      'Plant',
      "UOM",
      "cutOffPrice",
      "BasicRate",
      "Currency",
      "EffectiveDate",
      "clientName"];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddBOPImport', false, false, fieldName));
    });
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag,
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

  handleIncoTerm = (newValue) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ incoTerm: newValue });
    } else {
      this.setState({ incoTerm: [] })
    }
    if (isEditFlag && (DataToChange.BoughtOutPartIncoTermId !== newValue.value)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }
  }
  handlePaymentTerm = (newValue) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ paymentTerm: newValue });
    } else {
      this.setState({ paymentTerm: [] })
    }
    if (isEditFlag && (DataToChange.BoughtOutPartPaymentTermId !== newValue.value)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }
  }

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      //this.clearForm()
      this.cancel('submit')
    }
  }
  /**
  * @method handleClient
  * @description called
  */
  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue });
      const { costingTypeId, currency, effectiveDate, vendorName } = this.state;
      if (newValue && newValue?.length !== 0 && this.state.currency && this.state.currency.length !== 0 && effectiveDate) {
        this.props.getExchangeRateByCurrency(currency.label, (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : EMPTY_GUID, newValue.value, false, res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true })
          } else {
            this.setState({ showWarning: false })
          }
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) }, () => { this.handleCalculation() });
        });
      }
    } else {
      this.setState({ client: [] })
    }
  };

  handleIncoTerm = (newValue) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ incoTerm: newValue });
    } else {
      this.setState({ incoTerm: [] })
    }
    if (isEditFlag && (DataToChange.BoughtOutPartIncoTermId !== newValue.value)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }
  }
  handlePaymentTerm = (newValue) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ paymentTerm: newValue });
    } else {
      this.setState({ paymentTerm: [] })
    }
    if (isEditFlag && (DataToChange.BoughtOutPartPaymentTermId !== newValue.value)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }
  }

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false })
    if (type === 'submit') {
      //this.clearForm()
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
        isCallCalculation: true
      })
      this.props.getBOPImportById(data.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data, })

          this.props.change('BasicRateBaseCurrency', checkForDecimalAndNull(Data?.BasicRateConversion, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('BasicRateSelectedCurrency', checkForDecimalAndNull(Data?.BasicRate, initialConfiguration.NoOfDecimalForPrice))

          this.props.change('BasicPriceBaseCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCostConversion, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('BasicPriceSelectedCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, initialConfiguration.NoOfDecimalForPrice))

          this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(Data?.NetConditionCostConversion, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('FinalConditionCostSelectedCurrency', checkForDecimalAndNull(Data?.NetConditionCost, initialConfiguration.NoOfDecimalForPrice))

          this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(Data?.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice))
          this.props.change('NetLandedCostSelectedCurrency', checkForDecimalAndNull(Data?.NetLandedCost, initialConfiguration.NoOfDecimalForPrice))

          this.setState({
            FinalBasicRateBaseCurrency: Data?.BasicRateConversion,
            FinalBasicRateSelectedCurrency: Data?.BasicRate,

            FinalBasicPriceBaseCurrency: Data?.NetCostWithoutConditionCostConversion,
            FinalBasicPriceSelectedCurrency: Data?.NetCostWithoutConditionCost,

            FinalNetCostBaseCurrency: Data?.NetLandedCostConversion,
            FinalNetCostSelectedCurrency: Data?.NetLandedCost,

            FinalConditionCostBaseCurrency: Data?.NetConditionCostConversion,
            FinalConditionCostSelectedCurrency: Data?.NetConditionCost,

            conditionTableData: Data?.BoughtOutPartConditionsDetails
          })

          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })

          setTimeout(() => {
            let plantObj;
            // this.handleEffectiveDateChange(DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')

            if (getConfigurationKey().IsDestinationPlantConfigure) {
              plantObj = Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : []
            } else {
              plantObj = Data && Data.Plant.length > 0 ? { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId } : []
            }

            this.setState({
              IsFinancialDataChanged: false,
              costingTypeId: Data.CostingTypeId,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              BOPCategory: Data.CategoryName !== undefined ? { label: Data.CategoryName, value: Data.CategoryId } : {},
              selectedPlants: plantObj,
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : {},
              currency: Data.Currency !== undefined ? { label: Data.Currency, value: Data.CurrencyId } : {},
              sourceLocation: Data.SourceSupplierLocationName !== undefined ? { label: Data.SourceSupplierLocationName, value: Data.SourceLocation } : {},
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              files: Data.Attachements,
              UOM: ((Data.UnitOfMeasurement !== undefined) ? { label: Data.UnitOfMeasurement, value: Data.UnitOfMeasurementId } : {}),
              isLoader: false,
              incoTerm: Data.IncoTerm !== undefined ? { label: `${Data.IncoTermDescription ? Data.IncoTermDescription : ''} ${Data.IncoTerm ? `(${Data.IncoTerm})` : '-'}`, value: Data.BoughtOutPartIncoTermId } : [],
              paymentTerm: Data.PaymentTerm !== undefined ? { label: `${Data.PaymentTermDescription ? Data.PaymentTermDescription : ''} ${Data.PaymentTerm ? `(${Data.PaymentTerm})` : '-'}`, value: Data.BoughtOutPartPaymentTermId } : [],
              showCurrency: true,
              isClientVendorBOP: Data.IsClientVendorBOP,
              isTechnologyVisible: Data.IsBreakupBoughtOutPart,
              Technology: { label: Data.TechnologyName, value: Data.TechnologyId },
              currencyValue: Data.CurrencyExchangeRate,
              IsBreakupBoughtOutPart: Data.IsBreakupBoughtOutPart,
              IsSAPCodeUpdated: Data.IsSAPCodeUpdated,
              SAPPartNumber: Data.SAPPartNumber !== undefined ? { label: Data.SAPPartNumber, value: Data.SAPPartNumber } : []
            }, () => {
              setTimeout(() => {
                this.setInStateToolTip()
                this.toolTipNetCost({ label: Data.Currency, value: Data.CurrencyId })
                this.toolTipBasicPrice({ label: Data.Currency, value: Data.CurrencyId })
                this.finalUserCheckAndMasterLevelCheckFunction(plantObj.value)
                this.setState({ isLoader: false, isCallCalculation: false })
              }, 500)
            })
            // if (!this.state.isViewMode && Data.NetLandedCostConversion === 0) {
            //   this.props.getExchangeRateByCurrency(Data.Currency, costingTypeId, DayTime(Data.EffectiveDate).format('YYYY-MM-DD'), costingTypeId === ZBCTypeId ? EMPTY_GUID : vendorName.value, client.value, false, res => {
            //     if (Object.keys(res.data.Data).length === 0) {
            //       this.setState({ showWarning: true })
            //     }
            //     else {
            //       this.setState({ showWarning: false })
            //     }
            //     // this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) })
            //   })
            // }
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
    else {
      this.setState({ isLoader: false })
      this.props.getBOPImportById('', res => { })
    }
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { bopCategorySelectList, partSelectList, plantSelectList, cityList,
      UOMSelectList, currencySelectList, clientSelectList, IncoTermsSelectList, PaymentTermsSelectList, costingSpecifiTechnology } = this.props;
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
       if (label === 'uom') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableBOPUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
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
    if (label === 'IncoTerms') {
      IncoTermsSelectList && IncoTermsSelectList.map(item => {
        temp.push({ label: `${item.IncoTermDescription} (${item.IncoTerm})`, value: item.BoughtOutPartIncoTermId })
        return null
      })
      return temp;
    }
    if (label === 'PaymentTerms') {
      PaymentTermsSelectList && PaymentTermsSelectList.map(item => {
        temp.push({ label: `${item.PaymentTermDescription} (${item.PaymentTerm})`, value: item.BoughtOutPartPaymentTermId })
        return null
      })
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

    this.setState({ selectedPlants: e })
    if (!getConfigurationKey().IsDivisionAllowedForDepartment) {
      this.commonFunction(e ? e.value : '')
    }
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

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
        const { costingTypeId, currency, effectiveDate, client } = this.state;
        const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId
        const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? newValue.value : EMPTY_GUID) : EMPTY_GUID;
        if (this.state.currency && this.state.currency.length !== 0 && effectiveDate) {
          if (IsFetchExchangeRateVendorWise() && (!newValue || newValue?.length === 0)) {
            this.setState({ showWarning: true });
            return;
          }
          this.props.getExchangeRateByCurrency(currency.label, costingType, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorValue, client.value, false, res => {
            if (Object.keys(res.data.Data).length === 0) {
              this.setState({ showWarning: true })
            } else {
              this.setState({ showWarning: false })
            }
            this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) }, () => { this.handleCalculation() });
          });
        }
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
* @method handleCurrency
* @description called
*/
  handleCurrency = (newValue) => {
    const { effectiveDate } = this.state
    if (newValue && newValue !== '') {
      const { costingTypeId, vendorName, client } = this.state;
      const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : EMPTY_GUID) : EMPTY_GUID
      const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId

      if (newValue && newValue.length !== 0 && effectiveDate) {
        if (IsFetchExchangeRateVendorWise() && (vendorName?.length === 0 || client?.length === 0)) {
          this.setState({ showWarning: true });
          return;
        }
        this.props.getExchangeRateByCurrency(newValue.label, costingType, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorValue, client.value, false, res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true });
          } else {
            this.setState({ showWarning: false });
          }
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) });
        });
      }
      this.toolTipNetCost(newValue)
      this.toolTipBasicPrice(newValue)
      this.setState({ showCurrency: true })
      this.setState({ currency: newValue, }, () => {
        setTimeout(() => {
          this.handleCalculation()
        }, 200);
      })
    } else {
      this.setState({ currency: [] })
    }
  };

  convertIntoBase = (price) => {
    const { currencyValue } = this.state;
    return checkForNull(price) * checkForNull(currencyValue)
  }

  recalculateConditions = (basicPriceSelectedCurrency, basicPriceBaseCurrency) => {
    const { conditionTableData } = this.state;
    let tempList = conditionTableData && conditionTableData?.map(item => {
      if (item?.ConditionType === "Percentage") {
        let costCurrency = checkForNull((item?.Percentage) / 100) * checkForNull(basicPriceSelectedCurrency)
        let costBase = checkForNull((item?.Percentage) / 100) * checkForNull(basicPriceBaseCurrency)
        item.ConditionCost = costCurrency
        item.ConditionCostConversion = costBase
      }
      return item
    })
    return tempList
  }

  handleCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props;
    const { costingTypeId } = this.state;

    let basicRateBaseCurrency = this.convertIntoBase(fieldsObj?.BasicRateSelectedCurrency)
    this.props.change('BasicRateBaseCurrency', checkForDecimalAndNull(basicRateBaseCurrency, initialConfiguration.NoOfDecimalForPrice));
    const basicPriceSelectedCurrencyTemp = checkForNull(fieldsObj?.BasicRateSelectedCurrency) / checkForNull(fieldsObj?.NumberOfPieces ? fieldsObj?.NumberOfPieces : 1)
    const basicPriceBaseCurrencyTemp = this.convertIntoBase(basicPriceSelectedCurrencyTemp)

    let basicPriceSelectedCurrency
    let basicPriceBaseCurrency
    if (costingTypeId === ZBCTypeId) {
      basicPriceSelectedCurrency = checkForNull(basicPriceSelectedCurrencyTemp)
      this.props.change('BasicPriceSelectedCurrency', checkForDecimalAndNull(basicPriceSelectedCurrency, initialConfiguration.NoOfDecimalForPrice));

      basicPriceBaseCurrency = basicPriceBaseCurrencyTemp
      this.props.change('BasicPriceBaseCurrency', checkForDecimalAndNull(basicPriceBaseCurrency, initialConfiguration.NoOfDecimalForPrice));
    }

    let conditionList = this.recalculateConditions(basicPriceSelectedCurrency, basicPriceBaseCurrency)

    const sumBaseCurrency = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostConversion), 0);
    const sumSelectedCurrency = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
    let netLandedCostBaseCurrency = checkForNull(sumBaseCurrency) + checkForNull(basicPriceBaseCurrencyTemp)
    let netLandedCostSelectedCurrency = checkForNull(sumSelectedCurrency) + checkForNull(basicPriceSelectedCurrencyTemp)
    this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(sumBaseCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('FinalConditionCostSelectedCurrency', checkForDecimalAndNull(sumSelectedCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(netLandedCostBaseCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostSelectedCurrency', checkForDecimalAndNull(netLandedCostSelectedCurrency, initialConfiguration.NoOfDecimalForPrice))

    this.setState({
      FinalBasicRateSelectedCurrency: fieldsObj?.BasicRateSelectedCurrency,
      FinalBasicRateBaseCurrency: basicRateBaseCurrency,
      FinalBasicPriceSelectedCurrency: basicPriceSelectedCurrency,
      FinalBasicPriceBaseCurrency: basicPriceBaseCurrency,
      FinalNetCostBaseCurrency: netLandedCostBaseCurrency,
      FinalNetCostSelectedCurrency: netLandedCostSelectedCurrency,
      conditionTableData: conditionList,
      FinalConditionCostBaseCurrency: sumBaseCurrency,
      FinalConditionCostSelectedCurrency: sumSelectedCurrency,
    })

    if (this.state.isEditFlag &&

      this.state.DataToChange.BoughtOutPartIncoTermId === this.state.incoTerm.value &&
      // this.state.DataToChange.BoughtOutPartPaymentTermId === this.state.paymentTerm.value && (this.state.sourceLocation === this.state.DataToChange?.SourceLocation) && (this.state.source === this.state.DataToChange?.Source)         frontend fixes
      this.state.DataToChange.BoughtOutPartPaymentTermId === this.state.paymentTerm.value &&

      checkForNull(this.state.DataToChange.BasicRateConversion) === checkForNull(basicRateBaseCurrency) &&
      checkForNull(this.state.DataToChange.BasicRate) === checkForNull(fieldsObj?.BasicRateSelectedCurrency) &&

      checkForNull(this.state.DataToChange.NetCostWithoutConditionCostConversion) === checkForNull(basicPriceBaseCurrency) &&
      checkForNull(this.state.DataToChange.NetCostWithoutConditionCost) === checkForNull(basicPriceSelectedCurrency) &&

      checkForNull(this.state.DataToChange.NetLandedCostConversion) === checkForNull(netLandedCostBaseCurrency) &&
      checkForNull(this.state.DataToChange.NetLandedCost) === checkForNull(netLandedCostSelectedCurrency) &&

      checkForNull(this.state.DataToChange.NetConditionCostConversion) === sumBaseCurrency &&
      checkForNull(this.state.DataToChange.NetConditionCost) === sumSelectedCurrency
    ) {

      this.setState({ IsFinancialDataChanged: false, EffectiveDate: DayTime(this.state.DataToChange?.EffectiveDate).isValid() ? DayTime(this.state.DataToChange?.EffectiveDate) : '' });
      this.props.change('EffectiveDate', DayTime(this.state.DataToChange?.EffectiveDate).isValid() ? DayTime(this.state.DataToChange?.EffectiveDate) : '')
    } else if (this.state.isEditFlag) {
      this.setState({ IsFinancialDataChanged: true });
    }

    // THIS CALCULATION IS FOR MINDA
    // const BasicRate = fieldsObj && fieldsObj.BasicRate !== undefined ? fieldsObj.BasicRate : 0;
    // const NetLandedCost = checkForNull((BasicRate) * this.state.currencyValue)
    // this.setState({ netLandedcost: (BasicRate), netLandedConverionCost: NetLandedCost })
    // this.props.change('NetLandedCost', checkForDecimalAndNull((BasicRate), initialConfiguration.NoOfDecimalForPrice))
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    const { currency, effectiveDate } = this.state
    if (date !== effectiveDate) {
      const { costingTypeId, vendorName, client } = this.state;
      const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : EMPTY_GUID) : EMPTY_GUID
      const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId

      if (currency && currency.length !== 0 && date) {
        if (IsFetchExchangeRateVendorWise() && (vendorName?.length === 0 || client?.length === 0)) {
          this.setState({ showWarning: true });
          return;
        }
        this.props.getExchangeRateByCurrency(currency.label, costingType, DayTime(date).format('YYYY-MM-DD'), vendorValue, client.value, false, res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true });
          } else {
            this.setState({ showWarning: false });
          }
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) });
        });
      }
      this.setState({ showCurrency: true })
      setTimeout(() => {
        this.setState({ isDateChange: true }, () => { this.handleCalculation() })
      }, 200);
    } else {
      this.setState({ isDateChange: false }, () => { this.handleCalculation() })
    }
    this.setState({ effectiveDate: date, dateCount: this.state.dateCount + 1 });
  };
  filterSourceLocationList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    if (inputValue?.length >= searchCount) {
      this.setState({ inputLoader: true });
      let res = await getCityByCountry(0, 0, inputValue);
      this.setState({ inputLoader: false });
      let cityDataAPI = res?.data?.SelectList;
      if (inputValue) {
        return autoCompleteDropdown(inputValue, cityDataAPI, false, [], true);
      } else {
        return cityDataAPI;
      }
    } else {
      return [];
    }
  };


  /**
      * @method handleChangeSapCode
      * @description used SapCode handler
      */

  handleChangeSapCode = (e) => {

    // Check if the input value is not empty
    const isInputNotEmpty = e.target.value.trim() !== '';

    // Update the state based on whether the input is empty or not
    this.setState({
      SapCode: e.target.value,
      IsSAPCodeHandle: isInputNotEmpty ? true : false
    }, () => {
      // Callback function after setState is done

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
        files.push(Data)
        this.setState({ files: files })
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
      sourceLocation: [],
      UOM: {},
    })
    this.props.getBOPImportById('', res => { })
    this.props.hideForm(type)
  }
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('submit')
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
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {
    const { BOPCategory, selectedPlants, costingTypeId, client, vendorName, currency, sourceLocation, BOPID, isEditFlag, files, effectiveDate, oldDate,
      UOM, DataToChange, isDateChange, IsFinancialDataChanged, incoTerm, paymentTerm, isClientVendorBOP, isTechnologyVisible,
      Technology, FinalConditionCostBaseCurrency, FinalConditionCostSelectedCurrency, conditionTableData, FinalBasicPriceSelectedCurrency, FinalBasicPriceBaseCurrency, FinalNetCostSelectedCurrency, FinalNetCostBaseCurrency,
      FinalBasicRateBaseCurrency, FinalBasicRateSelectedCurrency, currencyValue, DropdownChanged, IsSAPCodeUpdated, IsSAPCodeHandle } = this.state;
    const { fieldsObj, isBOPAssociated } = this.props

    const userDetailsBop = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })


    let plantArray = { PlantName: selectedPlants.label, PlantId: selectedPlants.value, PlantCode: '' }

    if (selectedPlants.length === 0 && costingTypeId === ZBCTypeId) {
      return false;
    }
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: BOPID }
    })
    const formData = {}
    formData.BoughtOutPartId = BOPID
    formData.Currency = currency.label
    formData.CostingTypeId = costingTypeId
    formData.BoughtOutPartNumber = values?.BoughtOutPartNumber
    formData.BoughtOutPartName = values?.BoughtOutPartName
    formData.CategoryId = BOPCategory.value
    formData.Specification = values?.Specification
    formData.SAPPartNumber = values.SAPPartNumber
    formData.Vendor = vendorName.value
    formData.Source = values?.Source
    formData.SourceLocation = sourceLocation.value
    formData.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    formData.NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? values?.NumberOfPieces : 1
    formData.Remark = values?.Remark
    formData.IsActive = true
    formData.LoggedInUserId = loggedInUserId()
    formData.Plant = [plantArray]
    formData.DestinationPlantId = (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? selectedPlants.value : (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? selectedPlants.value : userDetailsBop.Plants[0].PlantId
    formData.Attachements = isEditFlag ? updatedFiles : files
    formData.UnitOfMeasurementId = UOM.value
    formData.VendorPlant = []
    formData.IsFinancialDataChanged = isDateChange ? true : false
    formData.CustomerId = client.value
    formData.BoughtOutPartIncoTermId = incoTerm.value
    formData.BoughtOutPartPaymentTermId = paymentTerm.value
    formData.EntryType = checkForNull(ENTRY_TYPE_IMPORT)
    formData.IsClientVendorBOP = isClientVendorBOP
    formData.TechnologyName = Technology?.label
    formData.TechnologyId = Technology?.value
    formData.IsBreakupBoughtOutPart = isTechnologyVisible
    formData.IsSAPCodeUpdated = IsSAPCodeUpdated
    formData.IsSAPCodeHandle = IsSAPCodeHandle ? true : false
    formData.BasicRate = FinalBasicRateSelectedCurrency
    formData.BasicRateConversion = FinalBasicRateBaseCurrency

    formData.NetLandedCost = FinalNetCostSelectedCurrency
    formData.NetLandedCostConversion = FinalNetCostBaseCurrency

    if (costingTypeId === ZBCTypeId) {
      formData.NetCostWithoutConditionCost = FinalBasicPriceSelectedCurrency
      formData.NetCostWithoutConditionCostConversion = FinalBasicPriceBaseCurrency
      formData.NetConditionCost = FinalConditionCostSelectedCurrency
      formData.NetConditionCostConversion = FinalConditionCostBaseCurrency
    }

    formData.BoughtOutPartConditionsDetails = conditionTableData
    formData.CurrencyExchangeRate = currencyValue


    // CHECK IF CREATE MODE OR EDIT MODE !!!  IF: EDIT  ||  ELSE: CREATE
    if (isEditFlag) {
      let basicPriceSelectedCurrency
      let basicPriceSelectedCurrencyTemp = checkForNull(fieldsObj?.BasicRateSelectedCurrency) / checkForNull(fieldsObj?.NumberOfPieces ? fieldsObj?.NumberOfPieces : 1)
      if (costingTypeId === ZBCTypeId) {
        basicPriceSelectedCurrency = basicPriceSelectedCurrencyTemp
      }
      const netLandedCostSelectedCurrency = checkForNull(basicPriceSelectedCurrencyTemp) + checkForNull(FinalConditionCostSelectedCurrency)

      // CHECK IF THERE IS CHANGE !!!  
      // IF: NO CHANGE  

      if (((files ? JSON.stringify(files) : []) === (DataToChange?.Attachements ? JSON.stringify(DataToChange?.Attachements) : [])) &&
        ((DataToChange?.Remark ? DataToChange?.Remark : '') === (values?.Remark ? values?.Remark : '')) &&
        ((DataToChange?.SAPPartNumber ? DataToChange?.SAPPartNumber : '') === (values?.SAPPartNumber ? values?.SAPPartNumber : ''))
        &&
        ((DataToChange?.Source ? String(DataToChange?.Source) : '-') === (values?.Source ? String(values?.Source) : '-')) &&
        ((DataToChange?.SourceLocation ? String(DataToChange?.SourceLocation) : '') === (sourceLocation?.value ? String(sourceLocation?.value) : '')) &&
        checkForNull(basicPriceSelectedCurrency) === checkForNull(DataToChange?.NetCostWithoutConditionCost) &&

        checkForNull(fieldsObj?.NumberOfPieces) === checkForNull(DataToChange?.NumberOfPieces) &&
        checkForNull(fieldsObj?.BasicRateSelectedCurrency) === checkForNull(DataToChange?.BasicRate) &&

        checkForNull(netLandedCostSelectedCurrency) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(FinalConditionCostSelectedCurrency) === checkForNull(DataToChange?.NetConditionCost) && DropdownChanged &&
        ((DataToChange.TechnologyId ? String(DataToChange.TechnologyId) : '') === (Technology?.value ? String(Technology?.value) : ''))) {
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

  conditionToggle = () => {
    this.setState({ isOpenConditionDrawer: true })
  }

  openAndCloseAddConditionCosting = (type, data = this.state.conditionTableData) => {
    const { initialConfiguration } = this.props
    if (type === 'save') {
      this.setState({ IsFinancialDataChanged: true })
    }
    const sumBaseCurrency = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantityConversion), 0);
    const sumSelectedCurrency = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
    let netLandedCostINR = checkForNull(sumBaseCurrency) + checkForNull(this.state.FinalBasicPriceBaseCurrency)
    let netLandedCostSelectedCurrency = checkForNull(sumSelectedCurrency) + checkForNull(this.state.FinalBasicPriceSelectedCurrency)
    this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(sumBaseCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('FinalConditionCostSelectedCurrency', checkForDecimalAndNull(sumSelectedCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(netLandedCostINR, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostSelectedCurrency', checkForDecimalAndNull(netLandedCostSelectedCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.setState({
      isOpenConditionDrawer: false,
      conditionTableData: data,
      FinalConditionCostBaseCurrency: sumBaseCurrency,
      FinalConditionCostSelectedCurrency: sumSelectedCurrency,
      FinalNetCostBaseCurrency: netLandedCostINR,
      FinalNetCostSelectedCurrency: netLandedCostSelectedCurrency,
    })
  }

  showBasicRate = () => {
    const { isEditFlag } = this.state
    let value = false
    if (isEditFlag) {
      value = this.props?.data?.showPriceFields ? true : false
    }
    return value
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {



    const { handleSubmit, isBOPAssociated, initialConfiguration, t } = this.props;
    const { isCategoryDrawerOpen, isOpenVendor, isOpenUOM, isEditFlag, isViewMode, setDisable, costingTypeId, isClientVendorBOP, CostingTypePermission,
      isTechnologyVisible, disableSendForApproval, isOpenConditionDrawer, conditionTableData, FinalBasicPriceSelectedCurrency, FinalBasicPriceBaseCurrency, toolTipTextNetCost, toolTipTextBasicPrice, toolTipTextObject, IsSAPCodeUpdated, IsSapCodeEditView, IsSAPCodeHandle } = this.state;
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
                          {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} {showBopLabel()} (Import)
                          {!isViewMode && <TourWrapper
                            buttonSpecificProp={{ id: "Add_BOP_Import_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t, {
                                isBOPAssociated: isBOPAssociated,
                                isEditFlag: isEditFlag,
                                showSendForApproval: !this.state.isFinalApprovar,
                                CBCTypeField: (costingTypeId === CBCTypeId),

                                sourceField: (costingTypeId === VBCTypeId)
                              }).BOP_IMPORT_FORM
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
                            {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id='bop_import_zeroBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id='bop_import_vendor_based' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                              <span>{labels(t, 'VendorLabel', 'MasterLabels')} Based</span>
                            </Label>}
                            {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id='bop_import_customer_based' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                            <div className="left-border">{`${showBopLabel()}:`}</div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`${showBopLabel()} Part Name`}
                              name={"BoughtOutPartName"}
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
                                  id="addBOPImport_categoryToggle"
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
                              type="text"
                              placeholder={(isEditFlag || getConfigurationKey().IsAutoGeneratedBOPNumber) ? '' : "Enter"}
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
                              placeholder={isEditFlag ? '-' : "Select"}
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
                                placeholder={isEditFlag ? '-' : "Select"}
                                //   selection={ this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants} 
                                options={this.renderListing("plant")}
                                handleChangeDescription={this.handlePlant}
                                validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state.selectedPlants}
                                mendatory={true}
                                required
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}
                          {initialConfiguration?.IsBoughtOutPartCostingConfigured && costingTypeId === VBCTypeId &&
                            <>

                              <Col md="3" className='d-flex align-items-center'>
                                <label
                                  className={`custom-checkbox ${this.state.isEditFlag ? "disabled" : ""
                                    }`} onChange={this.breakUpHandleChange}
                                >
                                  Detailed {showBopLabel()}
                                  <input
                                    type="checkbox"
                                    checked={isTechnologyVisible}
                                    disabled={isViewMode || (/* isBOPAssociated && */ isEditFlag && costingTypeId === VBCTypeId)}
                                  />
                                  < span
                                    className=" before-box"
                                    checked={isTechnologyVisible}
                                    onChange={this.breakUpHandleChange}
                                  />
                                </label >
                                {/* {isBOPAssociated && isEditFlag && costingTypeId === VBCTypeId && <WarningMessage dClass={"mr-2"} message={`This ${showBopLabel()} is already associated, so now you can't edit it.`} />} */}
                              </Col >
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
                          {
                            costingTypeId === CBCTypeId && (
                              <Col md="3">
                                <Field
                                  name="clientName"
                                  type="text"
                                  label={"Customer(Code)"}
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
                            )
                          }

                          {getConfigurationKey().IsSAPConfigured &&

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
                        </Row >

                        <Row>
                          {costingTypeId !== CBCTypeId && (
                            <>
                              <Col md="12">
                                <div className="left-border">{labels(t, 'VendorLabel', 'MasterLabels')}:</div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{labels(t, 'VendorLabel', 'MasterLabels')} (Code)<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div id='AddBOPImport_BOPVendoreName' className="fullinput-icon p-relative">
                                    {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="vendorName"
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
                                      id="addBOPImport_vendorToggle"
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
                                  placeholder={isEditFlag ? '-' : "Enter"}
                                  validate={[acceptAllExceptSingleSpecialCharacter, maxLength80, hashValidation]}
                                  component={renderText}
                                  valueDescription={this.state.source}
                                  onChange={this.handleSource}
                                  disabled={isViewMode}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>
                              <Col md="3">
                                                                <label>Source Location<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div id='AddBOPImport_SourceLocation' className="fullinput-icon p-relative">
                                    {this.state.sourceLocationInputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="sourceLocation"
                                      loadOptions={this.filterSourceLocationList}
                                      onChange={(e) => this.handleSourceSupplierCity(e)}
                                      value={this.state.sourceLocation}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                      isDisabled={isViewMode}
                                      onFocus={() => onFocus(this)}
                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                    />
                                  </div>
                                </div>
                                {((this.state.showErrorOnFocus && this.state.sourceLocation.length === 0)) && <div className='text-help mt-1'>This field is required.</div>}
                              </Col>
                            </>
                          )}
                        </Row>


                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Cost:"}</div>
                          </Col>
                          <Col md="3">
                            <Field
                              name="incoTerms"
                              type="text"
                              label={"Inco Terms"}
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("IncoTerms")}
                              validate={((this.state.incoTerm == null || this.state.incoTerm?.length === 0) && getConfigurationKey().IsPaymentTermsAndIncoTermsRequiredForBoughtOutPart) ? [required] : []}
                              required={getConfigurationKey().IsPaymentTermsAndIncoTermsRequiredForBoughtOutPart ? true : false}
                              handleChangeDescription={this.handleIncoTerm}
                              valueDescription={this.state.incoTerm}
                              disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                            />
                          </Col>
                          {getConfigurationKey().IsShowPaymentTermsFields && <Col md="3">
                            <Field
                              name="paymentTerms"
                              type="text"
                              label={"Payment Terms"}
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("PaymentTerms")}
                              validate={((this.state.paymentTerm == null || this.state.paymentTerm?.length === 0) && getConfigurationKey().IsPaymentTermsAndIncoTermsRequiredForBoughtOutPart) ? [required] : []}
                              required={getConfigurationKey().IsPaymentTermsAndIncoTermsRequiredForBoughtOutPart ? true : false}
                              handleChangeDescription={this.handlePaymentTerm}
                              valueDescription={this.state.paymentTerm}
                              disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                            />
                          </Col>}
                          <Col md="3">
                            <Field
                              name="Currency"
                              type="text"
                              label="Currency"
                              component={searchableSelect}
                              placeholder={isEditFlag ? '-' : "Select"}
                              options={this.renderListing("currency")}
                              validate={
                                this.state.currency == null ||
                                  this.state.currency.length === 0
                                  ? [required]
                                  : []
                              }
                              required={true}
                              handleChangeDescription={this.handleCurrency}
                              valueDescription={this.state.currency}
                              disabled={isEditFlag ? true : false}
                            >{this.state.showWarning && <WarningMessage dClass="mt-1" message={`${this.state.currency.label} rate is not present in the Exchange Master`} />}
                            </Field>
                          </Col>
                          <Col md="3">
                            <div className="inputbox date-section mb-3 form-group">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewMode || !this.state.IsFinancialDataChanged}
                                placeholder={isEditFlag ? '-' : "Select Date"}
                              />
                            </div>
                          </Col>
                          {getConfigurationKey().IsMinimumOrderQuantityVisible && (!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible && <>
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
                            </Col>
                          </>}
                          {(!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible && <>
                            <Col md="3">
                              <Field
                                label={`Basic Rate/${this.state.UOM.label ? this.state.UOM.label : 'UOM'} (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                name={"BasicRateSelectedCurrency"}
                                type="text"
                                placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={isViewMode || (isEditFlag && isBOPAssociated)}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <TooltipCustom id="bop-basic-rate-currency" tooltipText={toolTipTextObject?.toolTipTextBasicRateSelectedCurrency} />
                              <Field
                                label={`Basic Rate/${this.state.UOM.label ? this.state.UOM.label : 'UOM'} (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={"BasicRateBaseCurrency"}
                                type="text"
                                placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                          </>}
                          {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && !isTechnologyVisible && <>
                            <Col md="3">
                              <TooltipCustom id="bop-basic-currency" tooltipText={toolTipTextBasicPrice?.toolTipTextBasicPriceSelectedCurrency} />
                              <Field
                                label={`Basic Price/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                name={"BasicPriceSelectedCurrency"}
                                type="text"
                                placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <TooltipCustom id="bop-basic-base-currency" tooltipText={toolTipTextBasicPrice?.toolTipTextBasicPriceBaseCurrency} />
                              <Field
                                label={`Basic Price/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={"BasicPriceBaseCurrency"}
                                type="text"
                                placeholder={isEditFlag || (isEditFlag && isBOPAssociated) ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <div className='d-flex align-items-center'>
                                <div className='w-100'>
                                  <Field
                                    label={`Condition Cost/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                    name={"FinalConditionCostSelectedCurrency"}
                                    type="text"
                                    placeholder={"-"}
                                    validate={[]}
                                    component={renderText}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    disabled={true}
                                    isViewFlag={true}
                                  />
                                </div>
                                <Button
                                  id="addBOPImport_condition"
                                  onClick={this.conditionToggle}
                                  className={"right mt-0 mb-2"}
                                  variant={isViewMode ? "view-icon-primary" : (this.state.currency.label && this.state.FinalBasicRateSelectedCurrency && this.state.FinalBasicRateBaseCurrency) ? `plus-icon-square` : `blurPlus-icon-square`}
                                  disabled={!(this.state.currency.label && this.state.FinalBasicRateSelectedCurrency && this.state.FinalBasicRateBaseCurrency)}
                                />
                              </div>
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Condition Cost/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={"FinalConditionCostBaseCurrency"}
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
                            </Col>

                          </>}
                          {this.state.showCurrency && (!isTechnologyVisible || this.state.IsBreakupBoughtOutPart) && <>
                            <Col md="3">
                              <TooltipCustom id="bop-net-cost-currency" tooltipText={toolTipTextNetCost?.toolTipTextNetCostSelectedCurrency} />
                              <Field
                                label={`Net Cost/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostSelectedCurrency"}
                                type="text"
                                placeholder={"-"}
                                validate={[]}
                                component={renderTextInputField}
                                required={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder mb-0"
                              />
                            </Col>
                            <Col md="3">
                              <TooltipCustom id="bop-net-cost-base" tooltipText={toolTipTextNetCost?.toolTipTextNetCostBaseCurrency} />
                              <Field
                                label={`Net Cost/${this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label} (${reactLocalStorage.getObject("baseCurrency")})`}
                                name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostBaseCurrency"}
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
                          </>}


                        </Row>
                        {
                          getConfigurationKey().IsShowClientVendorBOP && costingTypeId === CBCTypeId && <Col md="3" className="d-flex align-items-center mb-3">
                            <label
                              className={`custom-checkbox`}
                              onChange={this.onIsClientVendorBOP}
                            >
                              Client Approved {labels(t, 'VendorLabel', 'MasterLabels')}
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
                          </Col>
                        }
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
                              value={this.state.remarks}
                              onChange={this.handleMessageChange}
                              disabled={isViewMode}
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
                            <div id='AddBOPImport_FileUpload' className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                disabled={isViewMode}
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
                                }}
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

                                      {!isViewMode && <img
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
                        <div className="col-sm-12 text-right bluefooter-butn d-flex justify-content-end align-items-center">
                          {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                          {this.state.showWarning && <WarningMessage dClass="mr-2" message={`Net conversion cost is 0, Do you wish to continue.`} />}
                          <Button
                            id="addBOPIMport_cancel"
                            className="mr15"
                            onClick={this.cancelHandler}
                            disabled={setDisable}
                            variant="cancel-btn"
                            icon="cancel-icon"
                            buttonName="Cancel"
                          />

                          {!isViewMode && <>
                            {((!isViewMode && (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration.IsMasterApprovalAppliedConfigure) || (initialConfiguration.IsMasterApprovalAppliedConfigure && !CostingTypePermission && !isTechnologyVisible)) && !isTechnologyVisible ?
                              <Button
                                id="addBOPIMport_sendForApproval"
                                type="submit"
                                className="mr5"
                                disabled={isViewMode || setDisable || disableSendForApproval}
                                icon="send-for-approval"
                                buttonName="Send For Approval"
                              />
                              :
                              <Button
                                id="addBOPIMport_save"
                                type="submit"
                                className="mr5"
                                disabled={isViewMode || setDisable}
                                icon="save-icon"
                                buttonName={isEditFlag ? "Update" : "Save"}
                              />
                            }
                          </>}

                        </div >
                      </Row >
                    </form >
                  </div >
                </div >
              </div >
            </div >
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
              ViewMode={((isEditFlag && isBOPAssociated) || isViewMode)}
              isFromMaster={true}
              currency={this.state.currency}
              currencyValue={this.state.currencyValue}
              basicRateCurrency={FinalBasicPriceSelectedCurrency}
              basicRateBase={FinalBasicPriceBaseCurrency}
              isFromImport={true}
              EntryType={checkForNull(ENTRY_TYPE_IMPORT)}
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
                IsImportEntry={true}
                currency={this.state.currency}
                costingTypeId={this.state.costingTypeId}
                levelDetails={this.state.levelDetails}
                isFromImport={true}
                toolTipTextObject={this.state.toolTipTextObject}
                UOM={this.state.UOM}
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
  const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate', 'BasicRateSelectedCurrency', 'BoughtOutPartName', 'SAPPartNumber');

  const { bopCategorySelectList, bopData, IncoTermsSelectList, PaymentTermsSelectList } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList,
    UOMSelectList, currencySelectList, plantSelectList } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { partSelectList } = part;
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
      BasicRate: bopData.BasicRate,
      BasicRateSelectedCurrency: bopData.BasicRateSelectedCurrency,
      NumberOfPieces: bopData?.NumberOfPieces,
      NetLandedCost: bopData.NetLandedCostSelectedCurrency,
      Remark: bopData.Remark,
      SAPPartNumber: bopData?.SAPPartNumber
    }
  }

  return {
    vendorWithVendorCodeSelectList, bopCategorySelectList, plantList, filterPlantList, filterCityListBySupplier,
    plantSelectList, cityList, partSelectList, clientSelectList, UOMSelectList, currencySelectList, fieldsObj, initialValues, initialConfiguration, IncoTermsSelectList, PaymentTermsSelectList, userMasterLevelAPI, costingSpecifiTechnology
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  getVendorNameByVendorSelectList,
  getPlantBySupplier,
  getUOMSelectList,
  getCurrencySelectList,
  createBOP,
  updateBOP,
  getBOPCategorySelectList,
  getBOPImportById,
  fileUploadBOPDomestic,
  getPlantSelectListByType,
  getExchangeRateByCurrency,
  checkFinalUser,
  getCityByCountry,
  getAllCity,
  getClientSelectList,
  getIncoTermSelectList,
  getPaymentTermSelectList,
  getUsersMasterLevelAPI,
  getCostingSpecificTechnology,
  checkAndGetBopPartNo
})(reduxForm({
  form: 'AddBOPImport',
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(withTranslation(['BOPMaster', 'MasterLabels'])(AddBOPImport)));
