import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import {
  required, checkForNull, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20,
  maxLength10, positiveAndDecimalNumber, maxLength512, decimalLengthsix, checkWhiteSpaces, checkSpacesInString, maxLength80, number, postiveNumber, hashValidation,
  validateFileName
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, renderDatePicker, renderTextInputField, focusOnError, validateForm } from "../../layout/FormInputs";
import { getPlantBySupplier, getUOMSelectList, getCurrencySelectList, getPlantSelectListByType, getAllCity, getVendorNameByVendorSelectList, getCityByCountryAction, getExchangeRateSource } from '../../../actions/Common';
import {
  createBOP, updateBOP, getBOPCategorySelectList, getBOPImportById,
  fileUploadBOPDomestic, getIncoTermSelectList, getPaymentTermSelectList, checkAndGetBopPartNo, getBOPDataBySourceVendor
} from '../actions/BoughtOutParts';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { getConfigurationKey, IsFetchExchangeRateVendorWiseForParts, loggedInUserId, showBopLabel, userDetails } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { FILE_URL, ZBC, BOP_MASTER_ID, EMPTY_GUID, SPACEBAR, ZBCTypeId, VBCTypeId, CBCTypeId, searchCount, ENTRY_TYPE_IMPORT, VBC_VENDOR_TYPE, BOP_VENDOR_TYPE, BOP } from '../../../config/constants';
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
import { CheckApprovalApplicableMaster, getExchangeRateParams, onFocus, userTechnologyDetailByMasterId } from '../../../helper';
import _, { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, compareRateCommon, checkEffectiveDate, convertIntoCurrency, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate, recalculateConditions, updateCostValue, getEffectiveDateMaxDate } from '../../common/CommonFunctions';
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
import { labels, LabelsClass } from '../../../helper/core';
import { getPlantUnitAPI } from '../actions/Plant';
import AddOtherCostDrawer from '../material-master/AddOtherCostDrawer';
import { getPartFamilySelectList } from '../actions/Part';

const selector = formValueSelector('AddBOPImport');

class AddBOPImport extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.debouncedCompareRate = debounce(() => compareRateCommon(this.state?.DataToChange?.BoughtOutPartOtherCostDetailsSchema, this.state?.DataToChange?.BoughtOutPartConditionsDetails), 1000);
    this.initialState = {
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
      currencyValue: 1,
      showCurrency: false,
      netLandedConverionCost: '',
      DataToChange: [],
      DropdownChange: true,
      showWarning: false,
      showPlantWarning: false,
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
      finalApprovalLoader: getConfigurationKey().IsDivisionAllowedForDepartment || !(getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) ? false : true,
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
      NetLandedCost: '',
      PartFamilySelected: [],
      FinalBasicRateBaseCurrency: '',
      BasicPrice: '',
      FinalNetCostBaseCurrency: '',
      FinalConditionCostBaseCurrency: '',
      NetConditionCost: '',
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
      ExchangeSource: null,
      plantCurrencyValue: 1,
      hidePlantCurrency: false,
      isOpenOtherCostDrawer: false,
      otherCostTableData: [],
      LocalCurrencyId: null,
      LocalCurrency: null,
      LocalExchangeRateId: null,
      ExchangeRateId: null,
      totalBasicRate: 0,
      totalOtherCost: 0,
      isSAPCodeDisabled: false,
      sourceLocationInputLoader: false,
      IsPartOutsourced: false,
      sourceVendor: [],
      isSourceVendorNameNotSelected: false,
      sourceInputLoader: false,
      sourceVendorFilterList: [],
      sourceVendorBOPId: null,
      SourceVendorBoughtOutPartId: "",
      sourceVendorTouched: false,
      SourceVendorAssociatedAsBoughtOutPartVendors: ""
    }
    this.state = { ...this.initialState };
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

  toolTipNetCost = () => {
    const { initialConfiguration } = this.props;
    const { costingTypeId } = this.state;
    let obj = {
      toolTipTextBasicPrice: initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)
        ? getConfigurationKey().IsMinimumOrderQuantityVisible
          ? ` Basic Rate + Other Cost / Minimum Order Quantity`
          : ` Basic Rate + Other Cost `
        : '',

      toolTipTextNetCost: initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)
        ? `Basic Price  + Condition Cost `
        : getConfigurationKey().IsMinimumOrderQuantityVisible
          ? `Basic Rate + Other Cost / Minimum Order Quantity`
          : `Basic Rate + Other Cost `
    };
    return obj
  }
  getTooltipTextForCurrency = () => {
    const { fieldsObj } = this.props
    const { currencyValue, plantCurrencyValue, currency } = this.state
    const currencyLabel = currency?.label ?? 'Currency';
    const plantCurrency = fieldsObj?.plantCurrency ?? 'Plant Currency';
    const baseCurrency = reactLocalStorage.getObject("baseCurrency");
    // Check the exchange rates or provide a default placeholder if undefined
    const plantCurrencyRate = plantCurrencyValue ?? '-';
    const settlementCurrencyRate = currencyValue ?? '-';
    // Generate tooltip text based on the condition
    return <>
      {`Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrency}, `
      }<p>{!this?.state?.hidePlantCurrency && `Exchange Rate: 1 ${plantCurrency} = ${settlementCurrencyRate} ${baseCurrency}`}</p>
    </>;
  };
  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { initialConfiguration } = this.props
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    const { currency } = this.state
    this.getPartFamilySelectList();
    this.props.getExchangeRateSource((res) => { })
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

  getPartFamilySelectList = () => {
    this?.props?.getPartFamilySelectList((res) => {
      if (res && res?.data && res?.data?.Result) {
        // Transform the part family data into the format needed for the dropdown
        const partFamilyOptions = res?.data?.SelectList
          .map(item => ({
            label: item?.PartFamily,
            value: item?.PartFamilyId
          }));
        this.setState({ partFamilyOptions });
      }
    })
  }

  finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewMode && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), BOP_MASTER_ID, null, (res) => {
        setTimeout(() => {
          this.commonFunction(plantId, isDivision)
        }, 100);
      })
    } else {
      this.setState({ finalApprovalLoader: false })
    }
  }
  callExchangeRateAPI = (fromCurrency) => {
    const { fieldsObj } = this.props;
    const { costingTypeId, vendorName, client, effectiveDate, currency } = this.state;
    const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: this.state.currency?.label, toCurrency: fromCurrency, defaultCostingTypeId: costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, master: BOP, plantCurrency: fieldsObj?.plantCurrency });
    const hasCurrencyAndDate = Boolean(fieldsObj?.plantCurrency && effectiveDate);
    if (hasCurrencyAndDate) {
      if (IsFetchExchangeRateVendorWiseForParts() && (vendorName?.length === 0 && client?.length === 0)) {
        return false;
      }

      this.props.getExchangeRateByCurrency(
        currency?.label,
        costingHeadTypeId,
        DayTime(this.state?.effectiveDate).format('YYYY-MM-DD'),
        vendorId,
        clientId,
        false,
        fromCurrency,
        this.state?.ExchangeSource?.label ?? null,
        res => {
          const isDataEmpty = Object.keys(res.data.Data).length === 0;
          const showWarningKey = fromCurrency === fieldsObj?.plantCurrency ? 'showPlantWarning' : 'showWarning';
          this.setState({ [showWarningKey]: isDataEmpty });

          // Store in different state variables based on fromCurrency
          if (fromCurrency === fieldsObj?.plantCurrency) {
            this.setState({
              plantCurrencyValue: checkForNull(res?.data?.Data?.CurrencyExchangeRate) || 1,
              LocalExchangeRateId: res?.data?.Data?.ExchangeRateId
            }, () => {
              this.handleCalculation();
            });
          } else if (fromCurrency === reactLocalStorage.getObject("baseCurrency")) {
            this.setState({
              currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate),
              CurrencyExchangeRate: res.data.Data.ExchangeRateId,
            }, () => {
              this.handleCalculation();
            });
          }
        }
      );
    }
  }

  handleExchangeRateSource = (newValue) => {
    const { client, effectiveDate } = this.state;
    this.setState({ ExchangeSource: newValue }, () => {
      // First call with plant currency
      this.callExchangeRateAPI(this.props?.fieldsObj?.plantCurrency);
      const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: this.state?.currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: this.state?.costingTypeId, vendorId: this.state?.vendorName?.value, clientValue: client?.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
      if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
        this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true })
          } else {
            this.setState({ showWarning: false })
          }
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
        });
      }
    });
  };
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
    if (this.props.initialConfiguration?.IsMasterApprovalAppliedConfigure && !isDivision) {
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
      this.handleCalculation()
    }
    if (!this.props.data.isViewMode /* && !this.state.isCallCalculation */) {
      if (!getConfigurationKey().IsDivisionAllowedForDepartment && (prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
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
    this.props.reset();
    this.setState({ ...this.initialState, costingTypeId: costingHeadFlag/* isViewMode: this.props?.data?.isViewMode, isEditMode: this.props?.data?.isEditMode */ }, () => {
      if (costingHeadFlag === CBCTypeId) {
        this.props.getClientSelectList(() => { })
      }
    });
  };


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
          bopCategory: newValue?.label,
          bopNumber: ''
        }
        this.props.checkAndGetBopPartNo(obj, (res) => {
          let Data = res.data.Identity;
          let sapCode = res?.data?.DynamicData?.sapPartNumber
          this.props.change('BoughtOutPartNumber', Data)
          this.props.change('SAPPartNumber', sapCode)
          this.setState({ isSAPCodeDisabled: sapCode === '' ? false : true, IsSAPCodeHandle: sapCode === '' ? false : true })
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
        bopCategory: this.state.BOPCategory?.label,
        bopNumber: ''
      }
      this.props.checkAndGetBopPartNo(obj, (res) => {
        let Data = res.data.Identity;
        let sapCode = res?.data?.DynamicData?.sapPartNumber
        this.props.change('BoughtOutPartNumber', Data)
        this.props.change('SAPPartNumber', sapCode)
        this.setState({ isSAPCodeDisabled: sapCode === '' ? false : true, IsSAPCodeHandle: sapCode === '' ? false : true })
      })
    }
  }, 500)
  /**
  * @method handleClient
  * @description called
  */
  handleClient = (newValue, actionMeta) => {
    const { client, effectiveDate } = this.state;
    if (newValue && newValue !== '') {
      this.setState({ client: newValue }
        , () => {
          this.callExchangeRateAPI(this.props?.fieldsObj?.plantCurrency);
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: this.state.currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: this.state.costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
          if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
            this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
              if (Object.keys(res.data.Data).length === 0) {
                this.setState({ showWarning: true })
              } else {
                this.setState({ showWarning: false })
              }
              this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
            });
          }
        }
      );
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
      const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : EMPTY_GUID, clientValue: newValue?.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
      if (newValue && newValue?.length !== 0 && this.state.currency && this.state.currency.length !== 0 && effectiveDate) {
        if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
          this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
            if (Object.keys(res.data.Data).length === 0) {
              this.setState({ showWarning: true })
            } else {
              this.setState({ showWarning: false })
            }
            this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
          });
        }
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
          this.props.change('BasicRate', checkForDecimalAndNull(Data?.BasicRate, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('BasicPrice', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('NetConditionCost', checkForDecimalAndNull(Data?.NetConditionCost, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('NetLandedCost', checkForDecimalAndNull(Data?.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('ExchangeSource', { label: Data.ExchangeRateSourceName, value: Data.ExchangeRateSourceName })
          this.props.change('plantCurrency', Data?.LocalCurrency)
          this.props.change('OtherCost', Data?.OtherNetCost)
          this.props.change("sourceVendorName", Data.VendorName !== undefined ? { label: Data?.SourceVendorName, value: Data?.SourceVendorId } : [])
          this.setState({
            BasicPrice: Data?.NetCostWithoutConditionCost,
            NetLandedCost: Data?.NetLandedCost,
            NetConditionCost: Data?.NetConditionCost,
            conditionTableData: Data?.BoughtOutPartConditionsDetails,
            totalOtherCost: Data?.OtherNetCost,
            otherCostTableData: Data?.BoughtOutPartOtherCostDetailsSchema,
            plantCurrencyValue: (Data?.LocalCurrencyExchangeRate ?? 1),
            currencyValue: (Data?.CurrencyExchangeRate ?? 1),
            ExchangeRateId: Data?.ExchangeRateId,
            LocalCurrencyId: Data?.LocalCurrencyId,
            currency: { label: Data?.Currency, value: Data?.CurrencyId },
            LocalExchangeRateId: Data?.LocalExchangeRateId,
            totalBasicRate: Data?.BasicRate,
            ExchangeSource: { label: Data.ExchangeRateSourceName, value: Data.ExchangeRateSourceName },
          })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
            this.setState({ hidePlantCurrency: false })
          } else {
            this.setState({ hidePlantCurrency: true })
          }
          setTimeout(() => {
            let plantObj;
            if (Data && Data?.Plant?.length > 0) {
              plantObj = Data?.Plant?.map(plant => ({ label: plant?.PlantName, value: plant?.PlantId }));
            }
            this.setState({
              IsFinancialDataChanged: false,
              costingTypeId: Data.CostingTypeId,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              BOPCategory: Data.CategoryName !== undefined ? { label: Data.CategoryName, value: Data.CategoryId } : {},
              selectedPlants: plantObj,
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : {},
              sourceVendor: Data.SourceVendorName !== undefined ? { label: Data?.SourceVendorName, value: Data?.SourceVendorId } : [],
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
              SAPPartNumber: Data.SAPPartNumber !== undefined ? { label: Data.SAPPartNumber, value: Data.SAPPartNumber } : [],
              PartFamilySelected: Data?.PartFamilyId ? { label: Data?.PartFamily ?? "", value: Data?.PartFamilyId } : [],
              SourceVendorAssociatedAsBoughtOutPartVendors: Data?.SourceVendorAssociatedAsBoughtOutPartVendors,
              IsPartOutsourced: Data?.IsPartOutsourced,
              SourceVendorBoughtOutPartId: Data?.BoughtOutPartId,
            }, () => {
              setTimeout(() => {
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
    const { bopCategorySelectList, partSelectList, plantSelectList, exchangeRateSourceList, partFamilySelectList,
      UOMSelectList, currencySelectList, clientSelectList, IncoTermsSelectList, PaymentTermsSelectList, costingSpecifiTechnology } = this.props;
    const temp = [];
    if (label === 'PartFamily') {
      partFamilySelectList && partFamilySelectList.map((item) => {
        if (item.Value === '--0--') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }
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
        if (item.Text === this.props.fieldsObj?.plantCurrency) return false;
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
    if (label === 'ExchangeSource') {
      exchangeRateSourceList && exchangeRateSourceList.map((item) => {
        if (item.Value === '--Exchange Rate Source Name--') return false

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
    const { initialConfiguration } = this.props
    const { client, effectiveDate } = this.state;
    this.setState({ selectedPlants: e })
    this.props.getPlantUnitAPI(e?.value, (res) => {
      let Data = res?.data?.Data
      this.props.change('plantCurrency', Data?.Currency)
      this.setState({ LocalCurrency: Data?.Currency, LocalCurrencyId: Data?.CurrencyId })
      if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
        this.setState({ hidePlantCurrency: false })
      } else {
        this.setState({ hidePlantCurrency: true })
      }
      const hasCurrencyAndDate = Boolean(Data?.Currency && effectiveDate);
      // First call with plant currency
      if (hasCurrencyAndDate) {
        this.callExchangeRateAPI(this.props.fieldsObj?.plantCurrency);
        // Second call with base currency
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: this.state.currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: this.state.costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
        if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
          this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
            if (Object.keys(res.data.Data).length === 0) {
              this.setState({ showWarning: true })
            } else {
              this.setState({ showWarning: false })
            }
            this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
          });
        }
      }
      // } else {
      //   this.setState({ hidePlantCurrency: true })
      // }
    })
    if (!this.state.isViewMode && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !getConfigurationKey()?.IsDivisionAllowedForDepartment) {
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
        this.callExchangeRateAPI(this.props.fieldsObj?.plantCurrency)

        this.props.getPlantBySupplier(vendorName.value, () => { })
        const { effectiveDate, client } = this.state;

        if (this.state.currency && this.state.currency.length !== 0 && effectiveDate) {
          if (IsFetchExchangeRateVendorWiseForParts() && (!newValue && newValue?.length === 0)) {
            return false;
          }
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: this.state.currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: this.state.costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
          if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
            this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
              if (Object.keys(res.data.Data).length === 0) {
                this.setState({ showWarning: true })
              } else {
                this.setState({ showWarning: false })
              }
              this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
            });
          }
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
      remarks: e?.target?.value,
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
      this.setState({ currency: newValue, }, () => {
        setTimeout(() => {
          this.handleCalculation()
          this.callExchangeRateAPI(this.props.fieldsObj?.plantCurrency)
        }, 200);
      })
      if (newValue && newValue.length !== 0 && effectiveDate) {
        if (IsFetchExchangeRateVendorWiseForParts() && (vendorName?.length === 0 && client?.length === 0)) {
          return false;
        }
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: newValue?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName?.value, clientValue: client.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
        if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
          this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
            if (Object.keys(res.data.Data).length === 0) {
              this.setState({ showWarning: true });
            } else {
              this.setState({ showWarning: false });
            }
            this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
          });
        }
      }
      this.setState({ showCurrency: true })
    } else {
      this.setState({ currency: [] })
    }
  };

  convertIntoBase = (price) => {
    const { currencyValue } = this.state;
    return checkForNull(price) * checkForNull(currencyValue)
  }

  handleApplicability = (value, basicPriceBaseCurrency, arr) => {
    const selectedApplicabilities = value?.split(' + ');
    // Calculate total cost currency for selected applicabilities
    const total = selectedApplicabilities.reduce((acc, Applicability) => {
      // Skip checking for "Basic Rate" in tableData
      const item = arr?.find(item => item?.Description.trim() === Applicability.trim());
      if (item) {
        let totalConditionCost = acc + item?.ConditionCost
        return totalConditionCost
      } else {
        return basicPriceBaseCurrency
      }
    }, 0);
    return total
  }

  handleCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props;
    const { costingTypeId, totalOtherCost } = this.state;
    const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 1;
    const basicPrice = (checkForNull(fieldsObj?.BasicRate) + checkForNull(totalOtherCost)) / NoOfPieces

    if (costingTypeId === ZBCTypeId) {
      this.props.change('BasicPrice', checkForDecimalAndNull(basicPrice, initialConfiguration?.NoOfDecimalForPrice));
    }
    let conditionList = recalculateConditions(basicPrice, this.state)
    const sumBaseCurrency = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
    let netLandedCost = checkForNull(sumBaseCurrency) + checkForNull(basicPrice)
    let netLandedCostPlantCurrency = checkForDecimalAndNull(checkForNull(netLandedCost) * checkForNull(this.state.plantCurrencyValue), getConfigurationKey().NoOfDecimalForPrice)
    let netLandedCostBaseCurrency = checkForDecimalAndNull(checkForDecimalAndNull(netLandedCostPlantCurrency, getConfigurationKey().NoOfDecimalForPrice) * checkForNull(this.state.currencyValue), getConfigurationKey().NoOfDecimalForPrice)
    // this.props.change('NetConditionCost', checkForDecimalAndNull(sumBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCost', checkForDecimalAndNull(netLandedCost, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCostPlantCurrency', checkForDecimalAndNull(netLandedCostPlantCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(netLandedCostBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))

    this.setState({
      BasicPrice: basicPrice,
      NetLandedCost: netLandedCost,
      conditionTableData: conditionList,
      NetConditionCost: sumBaseCurrency,
      NetCostWithoutConditionCost: basicPrice
    })

    if (this.state.isEditFlag &&
      this.state.DataToChange.BoughtOutPartIncoTermId === this.state.incoTerm.value &&
      this.state.DataToChange.BoughtOutPartPaymentTermId === this.state.paymentTerm.value &&
      checkForNull(this.state.DataToChange.BasicRate) === checkForNull(fieldsObj?.BasicRate) &&
      checkForNull(this.state.DataToChange.NetCostWithoutConditionCost) === checkForNull(basicPrice) &&
      checkForNull(this.state.DataToChange.NetLandedCost) === checkForNull(netLandedCost) &&
      checkForNull(this.state.DataToChange.NetConditionCost) === checkForNull(sumBaseCurrency)
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
    // this.props.change('NetLandedCost', checkForDecimalAndNull((BasicRate), initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    const { currency, effectiveDate } = this.state
    if (date !== effectiveDate) {
      const { costingTypeId, vendorName, client } = this.state;
      if (currency && currency.length !== 0 && date) {
        if (IsFetchExchangeRateVendorWiseForParts() && (vendorName?.length === 0 && client?.length === 0)) {
          return false;
        }
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: costingTypeId, vendorId: vendorName.value, clientValue: client.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
        if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
          this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(date).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
            if (Object.keys(res.data.Data).length === 0) {
              this.setState({ showWarning: true });
            } else {
              this.setState({ showWarning: false });
            }
            //this.setState({ plantCurrencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) ?? 1, LocalExchangeRateId: res.data.Data.ExchangeRateId })
            this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), ExchangeRateId: res.data.Data.ExchangeRateId }, () => { this.handleCalculation() });
          })
        };
      }
      this.setState({ showCurrency: true })
      setTimeout(() => {
        this.setState({ isDateChange: true }, () => { this.handleCalculation() })
      }, 200);
    } else {
      this.setState({ isDateChange: false }, () => { this.handleCalculation() })
    }
    this.setState({ effectiveDate: date, dateCount: this.state.dateCount + 1 }
      , () => {
        this.callExchangeRateAPI(this.props.fieldsObj?.plantCurrency)

      });
  };
  filterSourceLocationList = async (inputValue) => {
    if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
      inputValue = inputValue.trim();
    }
    if (inputValue?.length >= searchCount) {
      this.setState({ sourceLocationInputLoader: true });
      let res = await this.props.getCityByCountryAction(0, 0, inputValue);
      this.setState({ sourceLocationInputLoader: false });
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
      if (!validateFileName(file.name)) {
        this.dropzone.current.files.pop()
        this.setDisableFalseFunction()
        return false;
      }
      this.props.fileUploadBOPDomestic(data, (res) => {
        if (res && res?.status !== 200) {
          this.dropzone.current.files.pop()
          this.setDisableFalseFunction()
          return false
        }
        this.setDisableFalseFunction()
        if ('response' in res) {
          status = res && res?.response?.status
          this.dropzone.current.files.pop()
          this.setState({ attachmentLoader: false })
          this.dropzone.current.files.pop() // Remove the failed file from dropzone
          this.setState({ files: [...this.state.files] }) // Trigger re-render with current files
          Toaster.warning('File upload failed. Please try again.')
        }
        else {
          let Data = res.data[0]
          const { files } = this.state;
          let attachmentFileArray = [...files]
          attachmentFileArray.push(Data)
          this.setState({ attachmentLoader: false, files: attachmentFileArray })
          setTimeout(() => {
            this.setState(prevState => ({ isOpen: !prevState.isOpen }))
          }, 500);
        }
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

  onPressIsPartOutsourced = () => {
    this.setState({ IsPartOutsourced: !this.state.IsPartOutsourced })
  }

  handleSourceVendorDataFetch(data) {
    if (data?.sourceVendorId && data?.costingHeadId) {
      this.setState({ disableSendForApproval: true });
      this.props.getBOPDataBySourceVendor(data, res => {
        this.setState({ disableSendForApproval: false });
        if (res?.status === 200) {
          const Data = res?.data?.Data;
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '');
          this.props.change('BasicRate', checkForDecimalAndNull(Data.BasicRate, this.props?.initialConfiguration?.NoOfDecimalForPrice));
          this.props.change("OtherCost", checkForDecimalAndNull(Data.OtherNetCost, this.props?.initialConfiguration?.NoOfDecimalForPrice));
          this.setState({
            effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
            totalOtherCost: Data?.OtherNetCost,
            otherCostTableData: Data?.BoughtOutPartOtherCostDetailsSchema,
            SourceVendorAssociatedAsBoughtOutPartVendors: Data?.SourceVendorAssociatedAsBoughtOutPartVendors,
            IsPartOutsourced: Data?.IsPartOutsourced,
            SourceVendorBoughtOutPartId: Data?.BoughtOutPartId,
            currencyValue: Data.CurrencyExchangeRate,
            currency: { label: Data?.Currency, value: Data?.CurrencyId },
            ExchangeSource: { label: Data.ExchangeRateSourceName, value: Data.ExchangeRateSourceName },
            ExchangeRateId: Data?.ExchangeRateId,
            disableAll: true,
            disableSendForApproval: false,
          });
        }
        })
    }
  }

  handleSourceVendor = (newValue, VendorLabel) => {
    if (newValue && newValue !== '') {
        if (newValue?.value === this.state?.vendorName?.value) {
            Toaster.warning(`${VendorLabel} and Source ${VendorLabel} cannot be the same`);
            this.setState({ sourceVendor: [] });
        } else {
            this.setState({ sourceVendor: newValue });
            this.props.change("sourceVendorName", { label: newValue?.label, value: newValue?.value })
            const data = {
              costingHeadId: ZBCTypeId,
              bopNumber: this.props?.fieldsObj?.BoughtOutPartNumber,
              categoryId: this.state?.BOPCategory.value,
              sourceVendorId: newValue?.value,
              technologyId: this.state?.Technology?.value
            };
            this.handleSourceVendorDataFetch(data);
        }
    } else {
        this.setState({ sourceVendor: [] });
    }
  };

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
  handleBasicRateChange = (e) => {
    this.setState({ totalBasicRate: e.target.value })
    this.state.isEditFlag && this.debouncedCompareRate()
  }
  handleBOPOperation = (formData, isEditFlag, isOnlySAPCodeChanged) => {
    const operation = isEditFlag ? this.props.updateBOP : this.props.createBOP;
    const successMessage = isEditFlag ? MESSAGES.UPDATE_BOP_SUCESS : MESSAGES.BOP_ADD_SUCCESS;

    operation(formData, (res) => {
      this.setState({ setDisable: false });
      if (res?.data?.Result) {
        Toaster.success(successMessage);
        if (isEditFlag) {
          if (this.state.isEditBtnClicked && isOnlySAPCodeChanged === true) {
            this.getDetails();
            this.setState({
              IsSapCodeEditView: true,
              IsSAPCodeHandle: false
            });
          } else {
            this.cancel('submit');
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
      Technology, NetConditionCost, conditionTableData, BasicPrice, NetLandedCost, otherCostTableData, totalOtherCost,
      currencyValue, DropdownChanged, IsSAPCodeUpdated, IsSAPCodeHandle, LocalExchangeRateId, LocalCurrencyId, plantCurrencyValue, ExchangeRateId, ExchangeSource,
    SourceVendorAssociatedAsBoughtOutPartVendors, IsPartOutsourced, sourceVendor, SourceVendorBoughtOutPartId } = this.state;
    const {  isBOPAssociated } = this.props
    const userDetailsBop = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })


    //let plantArray = { PlantName: selectedPlants.label, PlantId: selectedPlants.value, PlantCode: '' }
    let plantArray = Array?.isArray(selectedPlants) ? selectedPlants?.map(plant => ({ PlantId: plant?.value, PlantName: plant?.label, PlantCode: '' })) :
      selectedPlants ? [{ PlantId: selectedPlants?.value, PlantName: selectedPlants?.label, PlantCode: '' }] : [];
    if (selectedPlants.length === 0 && costingTypeId === ZBCTypeId) {
      return false;
    }
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: BOPID }
    })
    const netCostLocalConversion = convertIntoCurrency(NetLandedCost, plantCurrencyValue)
    const netCostWithoutConditionCostLocalConversion = convertIntoCurrency(BasicPrice, plantCurrencyValue)
    const netConditionCostLocalConversion = convertIntoCurrency(NetConditionCost, plantCurrencyValue)
    const otherNetCostLocalConversion = convertIntoCurrency(totalOtherCost, plantCurrencyValue)
    const formData = {
      Attachements: isEditFlag ? updatedFiles : files,
      BasicRate: values?.BasicRate,
      BasicRateLocalConversion: convertIntoCurrency(values?.BasicRate * plantCurrencyValue),
      BasicRateConversion: convertIntoCurrency(values?.BasicRate, currencyValue),
      BoughtOutPartConditionsDetails: conditionTableData,
      BoughtOutPartId: BOPID,
      BoughtOutPartIncoTermId: incoTerm.value,
      BoughtOutPartName: values?.BoughtOutPartName,
      BoughtOutPartNumber: values?.BoughtOutPartNumber,
      BoughtOutPartPaymentTermId: paymentTerm.value,
      CategoryId: BOPCategory.value,
      CostingTypeId: costingTypeId,
      Currency: currency?.label,
      CurrencyId: currency?.value,
      CurrencyExchangeRate: currencyValue,
      CustomerId: client.value,
      DestinationPlantId: (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? selectedPlants.value : (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? selectedPlants.value : userDetailsBop.Plants[0].PlantId,
      EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
      EntryType: checkForNull(ENTRY_TYPE_IMPORT),
      ExchangeRateId: ExchangeRateId,
      ExchangeRateSourceName: ExchangeSource?.label,
      IsActive: true,
      IsBreakupBoughtOutPart: isTechnologyVisible,
      IsClientVendorBOP: isClientVendorBOP,
      IsFinancialDataChanged: isDateChange ? true : false,
      IsSAPCodeHandle: IsSAPCodeHandle ? true : false,
      IsSAPCodeUpdated: IsSAPCodeUpdated,
      LoggedInUserId: loggedInUserId(),
      LocalCurrency: values.plantCurrency,
      LocalExchangeRateId: LocalExchangeRateId,
      LocalCurrencyId: LocalCurrencyId,
      LocalCurrencyExchangeRate: plantCurrencyValue,
      NetConditionCost: NetConditionCost,
      NetConditionCostConversion: convertIntoCurrency(netConditionCostLocalConversion * currencyValue),
      NetConditionCostLocalConversion: convertIntoCurrency(NetConditionCost, plantCurrencyValue),
      NetCostWithoutConditionCost: BasicPrice,
      NetCostWithoutConditionCostLocalConversion: convertIntoCurrency(BasicPrice, plantCurrencyValue),
      NetCostWithoutConditionCostConversion: convertIntoCurrency(netCostWithoutConditionCostLocalConversion, currencyValue),
      NetLandedCost: NetLandedCost,
      NetLandedCostLocalConversion: convertIntoCurrency(NetLandedCost, plantCurrencyValue),
      NetLandedCostConversion: convertIntoCurrency(checkForDecimalAndNull(netCostLocalConversion, getConfigurationKey().NoOfDecimalForPrice), currencyValue),
      NumberOfPieces: getConfigurationKey().IsMinimumOrderQuantityVisible ? values?.NumberOfPieces : 1,
      OtherNetCost: totalOtherCost,
      OtherNetCostConversion: convertIntoCurrency(otherNetCostLocalConversion, currencyValue),
      OtherNetCostLocalConversion: convertIntoCurrency(totalOtherCost, plantCurrencyValue),
      Plant: plantArray,
      Remark: values?.Remark,
      SAPPartNumber: values.SAPPartNumber,
      Source: values?.Source,
      SourceLocation: sourceLocation.value,
      Specification: values?.Specification,
      TechnologyId: Technology?.value,
      TechnologyName: Technology?.label,
      UnitOfMeasurementId: UOM.value,
      Vendor: vendorName.value,
      VendorPlant: [],
      BoughtOutPartOtherCostDetailsSchema: otherCostTableData,
      PartFamilyId: this?.state?.PartFamilySelected?.value || "",
      PartFamily: this?.state?.PartFamilySelected?.label || "",
      SourceVendorAssociatedAsBoughtOutPartVendors: SourceVendorAssociatedAsBoughtOutPartVendors,
      IsPartOutsourced: IsPartOutsourced,
      SourceVendorId: sourceVendor?.value,
      SourceVendorName: sourceVendor?.label,
      SourceVendorBoughtOutPartId: SourceVendorBoughtOutPartId
    }

    formData.BoughtOutPartConditionsDetails = conditionTableData
    // formData.CurrencyExchangeRate = currencyValue
    let isOnlySAPCodeChanged = false
    // CHECK IF CREATE MODE OR EDIT MODE !!!  IF: EDIT  ||  ELSE: CREATE
    let financialDataNotChanged = checkForNull(NetLandedCost) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(this.state?.incoTerm?.value) === checkForNull(DataToChange?.IncoTerm) && (getConfigurationKey().IsShowPaymentTermsFields ? checkForNull(this.state?.paymentTerm?.value) === checkForNull(DataToChange?.PaymentTerm) : true)
    let nonFinancialDataNotChanged = ((files ? JSON.stringify(files) : []) === (DataToChange.Attachements ? JSON.stringify(DataToChange.Attachements) : [])) &&
      ((DataToChange.Remark ? DataToChange.Remark : '') === (values?.Remark ? values?.Remark : '')) &&
      (getConfigurationKey().IsSAPCodeRequired ? (DataToChange.SAPPartNumber ? DataToChange.SAPPartNumber : '') === (values?.SAPPartNumber ? values?.SAPPartNumber : '') : true) &&
      ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values?.Source ? String(values?.Source) : '-')) &&
      ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocation?.value ? String(sourceLocation?.value) : '')) &&
      DropdownChanged &&
      (isTechnologyVisible ? (DataToChange.TechnologyId ? String(DataToChange.TechnologyId) : '') === (Technology?.value ? String(Technology?.value) : '') : true)
    if (isEditFlag) {
      if (!isBOPAssociated) {
        if (financialDataNotChanged && nonFinancialDataNotChanged) {
          this.setState({ isEditBuffer: true })
          if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar && !isTechnologyVisible) {
            Toaster.warning(`Please change data to send ${showBopLabel()} for approval`)
          }
          else {
            Toaster.warning(`Please change data to update ${showBopLabel()}`)
          }
          return false
        }
        formData.IsFinancialDataChanged = false
      }
      else if (!financialDataNotChanged && checkEffectiveDate(oldDate, effectiveDate)) {

        Toaster.warning('Please update the effective date')
        return false
      }
    } else {
      formData.IsFinancialDataChanged = financialDataNotChanged ? false : true
    }

    if (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar && !isTechnologyVisible) {
      formData.IsSendForApproval = true
      this.setState({ approveDrawer: true, approvalObj: formData })
    }
    else {
      formData.IsSendForApproval = false;
      this.handleBOPOperation(formData, isEditFlag, isOnlySAPCodeChanged);
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

  handlePartFamilyChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ PartFamilySelected: newValue });
    } else {
      this.setState({ PartFamilySelected: null });
    }
  }

  openAndCloseAddConditionCosting = (type, data = this.state.conditionTableData) => {
    const { initialConfiguration } = this.props
    const { NetCostWithoutConditionCost, plantCurrencyValue, currencyValue } = this.state
    if (type === 'save') {
      this.setState({ IsFinancialDataChanged: true })
    }
    const sumSelectedCurrency = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
    const netLandedCost = checkForNull(sumSelectedCurrency) + checkForNull(NetCostWithoutConditionCost)
    const netLandedCostPlantCurrency = checkForDecimalAndNull(netLandedCost * checkForNull(plantCurrencyValue), initialConfiguration?.NoOfDecimalForPrice)
    const netLandedCostBaseCurrency = checkForDecimalAndNull(netLandedCostPlantCurrency * checkForNull(currencyValue), initialConfiguration?.NoOfDecimalForPrice)
    this.props.change('NetConditionCost', checkForDecimalAndNull(sumSelectedCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCost', checkForDecimalAndNull(netLandedCost, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCostPlantCurrency', netLandedCostPlantCurrency)
    this.props.change('NetLandedCostBaseCurrency', netLandedCostBaseCurrency, initialConfiguration?.NoOfDecimalForPrice)
    this.setState({
      isOpenConditionDrawer: false,
      conditionTableData: data,
      NetConditionCost: sumSelectedCurrency,
      NetLandedCost: netLandedCost
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
  handleExchangeRateSource = (newValue) => {
    const { client, effectiveDate } = this.state;
    this.setState({ ExchangeSource: newValue }, () => {
      // First call with plant currency
      this.callExchangeRateAPI(this.props.fieldsObj?.plantCurrency)
      const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: this.state.currency?.label, toCurrency: reactLocalStorage.getObject("baseCurrency"), defaultCostingTypeId: this.state.costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, master: BOP, plantCurrency: this.props?.fieldsObj?.plantCurrency });
      if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage.getObject("baseCurrency")) {
        this.props.getExchangeRateByCurrency(this.props?.fieldsObj?.plantCurrency, costingHeadTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), vendorId, clientId, false, reactLocalStorage.getObject("baseCurrency"), this.state.ExchangeSource?.label ?? null, res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true })
          } else {
            this.setState({ showWarning: false })
          }
          this.setState({ currencyValue: checkForNull(res?.data?.Data?.CurrencyExchangeRate), ExchangeRateId: res?.data?.Data?.ExchangeRateId }, () => { this.handleCalculation() });
        });
      }
    });
  };

  otherCostToggle = () => {
    this.setState({ isOpenOtherCostDrawer: true })
  }
  closeOtherCostToggle = (type, data, total, totalBase) => {
    const { NetConditionCost, plantCurrencyValue, currencyValue } = this.state
    if (type === 'Save') {
      if (Number(this.state.costingTypeId) === Number(ZBCTypeId) &&
        this.state.NetConditionCost &&
        Array.isArray(this.state?.conditionTableData) &&
        this.state.conditionTableData.some(item => item.ConditionType === "Percentage")) {
        Toaster.warning("Please click on refresh button to update Condition Cost data.")
      }
      const basicPrice = checkForNull(this.props.fieldsObj?.BasicRate) + checkForNull(totalBase)
      const netLandedCost = checkForNull(basicPrice) + checkForNull(NetConditionCost)
      const netLandedCostPlantCurrency = checkForDecimalAndNull(netLandedCost * checkForNull(plantCurrencyValue), this.props.initialConfiguration?.NoOfDecimalForPrice)
      const netLandedCostBaseCurrency = checkForDecimalAndNull(netLandedCostPlantCurrency * checkForNull(currencyValue), this.props.initialConfiguration?.NoOfDecimalForPrice)
      this.props.change('OtherCost', total)
      this.props.change('BasicPrice', checkForDecimalAndNull(basicPrice, this.props.initialConfiguration?.NoOfDecimalForPrice))
      this.props.change('NetLandedCost', checkForDecimalAndNull(netLandedCost, this.props.initialConfiguration?.NoOfDecimalForPrice))
      this.props.change('NetLandedCostPlantCurrency', netLandedCostPlantCurrency)
      this.props.change('NetLandedCostBaseCurrency', netLandedCostBaseCurrency)
      this.setState({ isOpenOtherCostDrawer: false, otherCostTableData: data, totalOtherCost: total, NetLandedCost: netLandedCost, BasicPrice: basicPrice }, () => {
        this.handleCalculation()
      })
    } else {
      this.setState({ isOpenOtherCostDrawer: false })
    }

  }
  updateTableCost = (isConditionCost = false) => {
    const result = updateCostValue(isConditionCost, this.state, this.props.fieldsObj?.BasicRate);
    // Update state
    this.setState(result.updatedState);
    // Update form value using this.props.change() instead of setValue()
    this.props.change(result.formValue.field, result.formValue.value);
    // Handle any additional actions based on isConditionCost
    if (isConditionCost) {
      // Update condition cost related data
      this.props.change('NetConditionCost', checkForDecimalAndNull(result?.formValue?.value, getConfigurationKey().NoOfDecimalForPrice))
      this.setState({
        ...this.state,
        states: result.updatedState
      });
    } else {
      // Update other cost details
      this.setState({
        otherCostTableData: result.tableData
      });
    }
  };

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, isBOPAssociated, initialConfiguration, t, fieldsObj } = this.props;
    const { isCategoryDrawerOpen, isOpenVendor, isOpenUOM, isEditFlag, isViewMode, setDisable, costingTypeId, isClientVendorBOP, CostingTypePermission,
      isTechnologyVisible, disableSendForApproval, isOpenConditionDrawer, conditionTableData, BasicPrice, toolTipTextNetCost, toolTipTextBasicPrice, toolTipTextObject, IsSAPCodeUpdated, IsSapCodeEditView, IsSAPCodeHandle, disableAll } = this.state;
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

    const sourceFilterList = async (inputValue) => {
      const { sourceVendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && sourceVendorFilterList !== resultInput) {
        this.setState({ sourceInputLoader: true })
        let res
        if (costingTypeId === VBCTypeId) {
          res = await getVendorNameByVendorSelectList(BOP_VENDOR_TYPE, resultInput)
        }
        else {
          res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        }
        this.setState({ sourceInputLoader: false })
        this.setState({ sourceVendorFilterList: resultInput })
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
                              <span>{VendorLabel} Based</span>
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

                          {initialConfiguration?.PartAdditionalMasterFields?.IsShowPartFamily &&
                            (<Col md="3">
                              <Field
                                name="partFamily"
                                type="text"
                                label="Part Family"
                                component={searchableSelect}
                                placeholder={"Select"}
                                options={this.renderListing("PartFamily")}
                                validate={this?.state?.PartFamilySelected == null || this?.state?.PartFamilySelected.length === 0 ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handlePartFamilyChange}
                                valueDescription={this?.state?.PartFamilySelected}
                                disabled={isEditFlag || isViewMode}
                              />
                            </Col>)
                          }

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
                                options={this.renderListing("plant")}
                                handleChangeDescription={this.handlePlant}
                                validate={this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                component={searchableSelect}
                                valueDescription={this.state.selectedPlants}
                                mendatory={true}
                                required
                                className="multiselect-with-border"
                                disabled={isEditFlag ? true : false}
                              />
                            </Col>
                          )}
                          {getConfigurationKey().IsSourceExchangeRateNameVisible && (
                            <Col md="3">
                              <Field
                                label="Exchange Rate Source"
                                name="exchangeSource"
                                placeholder="Select"
                                options={this.renderListing("ExchangeSource")}
                                handleChangeDescription={this.handleExchangeRateSource}
                                component={searchableSelect}
                                className="multiselect-with-border"
                                disabled={isEditFlag}
                                valueDescription={this.state.ExchangeSource}
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
                                  disabled={(IsSapCodeEditView && isEditFlag) || isViewMode || this?.state?.isSAPCodeDisabled}
                                  value={this.state.SapCode}
                                  onChange={this.handleChangeSapCode}
                                  className=" "
                                  customClassName=" withBorder w-100 mb-0"
                                >
                                  {IsSAPCodeHandle && isEditFlag && (
                                    <WarningMessage dClass={'d-flex justify-content-end'} message={`${MESSAGES.SAP_CODE_WARNING}`} />
                                  )}
                                </Field>
                                {!IsSAPCodeUpdated && isEditFlag && (
                                  <Button className={"Edit ms-2 mt-2"} variant="Edit" title={"Edit"} onClick={() => { this.handleSubmitOfSapCode(handleSubmit(this.onSubmit.bind(this))) }} disabled={isViewMode} />
                                )}
                              </div>

                            </Col>}
                        </Row >

                        <Row>
                          {costingTypeId !== CBCTypeId && (
                            <>
                              <Col md="12">
                                <div className="left-border">{VendorLabel}:</div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
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
                          {costingTypeId === VBCTypeId && getConfigurationKey()?.IsShowSourceVendorInBoughtOutPart && (
                            <>
                              <Col md="3" className='mb-4'>
                                <label>Source {VendorLabel} Code<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div className="fullinput-icon p-relative">
                                    {this.state.sourceInputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="sourceVendorName"
                                      id="Source_vendor_name_form_vendor_based"
                                      ref={this.sourceRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={sourceFilterList}
                                      onChange={(e) => this.handleSourceVendor(e, VendorLabel)}
                                      value={this.state.sourceVendor}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                      isDisabled={(isEditFlag) ? true : false}
                                      onFocus={() => this.setState({ sourceVendorTouched: true })}
                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                    />
                                  </div>
                                </div>
                                {((this.state.sourceVendorTouched && this.state.sourceVendor.length === 0) || this.state.isSourceVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                              </Col>
                            </>
                          )}

                          {costingTypeId === VBCTypeId && !getConfigurationKey()?.IsShowSourceVendorInBoughtOutPart && (
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
                                  required={false}
                                />
                              </Col>
                              <Col md="3">
                                <label>Source Location</label>
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
                              </Col>
                            </>
                          )}

                          {costingTypeId === VBCTypeId && getConfigurationKey()?.IsShowPartOutsourcedInBoughtOutPart &&
                            <Col md="3" className="mt-4 pt-2">
                                <div className=" flex-fills d-flex justify-content-between align-items-center">
                                    <label id="AddBOPImport_IsPartOutsourced"
                                        className={`custom-checkbox w-auto mb-0} ${(this.state.isEditFlag || isViewMode) ? "disabled" : ""}`}
                                        onChange={this.onPressIsPartOutsourced}
                                    >
                                        Is Part Outsourced?
                                        <input
                                            type="checkbox"
                                            checked={this.state?.IsPartOutsourced}
                                            disabled={isViewMode || this.state.isEditFlag}
                                        />
                                        <span
                                            className=" before-box p-0"
                                            checked={this.state?.IsPartOutsourced}
                                            onChange={this.onPressIsPartOutsourced}
                                        />
                                    </label>
                                </div>
                            </Col>
                          }
                        </Row>


                        <Row>
                          <Col md="12">
                            <div className="left-border">{"Cost:"}</div>
                          </Col>
                          {<Col md="3">
                            <Field
                              name="plantCurrency"
                              type="text"
                              label="Plant Currency"
                              placeholder={"-"}
                              validate={[]}
                              component={renderTextInputField}
                              required={false}
                              disabled={true}
                              className=" "
                              customClassName=" withBorder mb-1"
                            >
                              {this.state?.showPlantWarning && <WarningMessage dClass="mt-1" message={`${this.props?.fieldsObj?.plantCurrency} rate is not present in the Exchange Master`} />}
                            </Field>
                          </Col>}
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
                              disabled={isViewMode}
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
                              disabled={isViewMode}
                            />
                          </Col>}
                          <Col md="3">
                            <TooltipCustom id="currency" width="350px" tooltipText={this.getTooltipTextForCurrency()} />
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
                              disabled={(disableAll || isEditFlag) ? true : false}
                              customClassName="mb-1"
                            >{this?.state?.showWarning && this.state?.currency?.label && <WarningMessage dClass="mt-1" message={`${this.state?.currency?.label} rate is not present in the Exchange Master`} />}
                            </Field>
                          </Col >
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
                                maxDate={getEffectiveDateMaxDate()}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={disableAll || isViewMode || !this.state.IsFinancialDataChanged}
                                placeholder={isEditFlag ? '-' : "Select Date"}
                              />
                            </div>
                          </Col>
                          {
                            getConfigurationKey().IsMinimumOrderQuantityVisible && (!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible && <>
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
                                  disabled={isViewMode}
                                />
                              </Col>
                            </>
                          }
                          {
                            (!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible && <>
                              <Col md="3">
                                <Field
                                  label={`Basic Rate (${this?.state?.currency?.label === undefined ? 'Currency' : this.state?.currency?.label}/${this.state?.UOM?.label ? this.state?.UOM?.label : 'UOM'})`}
                                  name={"BasicRate"}
                                  type="text"
                                  placeholder={isEditFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  disabled={disableAll || isViewMode}
                                  className=" "
                                  customClassName=" withBorder"
                                  onChange={this.handleBasicRateChange}
                                />
                              </Col>

                            </>
                          }
                          {!isTechnologyVisible && (
                            <Col md="3">
                              <div className='d-flex align-items-center'>
                                <div className="w-100">
                                  <Field
                                    label={`Other Cost (${this?.state?.currency?.label === undefined ? 'Currency' : this.state?.currency?.label}/${this?.state?.UOM?.label ? this.state?.UOM?.label : 'UOM'})`}
                                    name={"OtherCost"}
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
                                <div className="d-flex align-items-center" style={{ marginTop: '-5px' }}>
                                  <button type="button" id="other-cost-refresh" className={'refresh-icon ml-1'} onClick={() => this.updateTableCost(false)} disabled={this.props.data.isViewMode}>
                                    <TooltipCustom disabledIcon={true} id="other-cost-refresh" tooltipText="Refresh to update other cost" />
                                  </button>
                                  <Button
                                    id="addBOPDomestic_otherCost"
                                    onClick={this.otherCostToggle}
                                    className={"right mt-0 mb-0"}
                                    variant={
                                      isViewMode
                                        ? "view-icon-primary"
                                        : !this.props.fieldsObj?.BasicRate
                                          ? "blurPlus-icon-square"
                                          : "plus-icon-square"
                                    }
                                    disabled={!this.props.fieldsObj?.BasicRate}
                                  />
                                </div>
                              </div>
                            </Col>)}
                          {
                            initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && !isTechnologyVisible && <>
                              <Col md="3">
                                <TooltipCustom id="bop-basic-currency" width="350px" disabledIcon={true} tooltipText={this.toolTipNetCost().toolTipTextBasicPrice} />
                                <Field
                                  label={`Basic Price (${this.state?.currency?.label === undefined ? 'Currency' : this.state?.currency?.label}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})`}
                                  name={"BasicPrice"}
                                  id="bop-basic-currency"
                                  type="text"
                                  placeholder={isEditFlag ? '-' : "Enter"}
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
                                      label={`Condition Cost (${this.state?.currency?.label === undefined ? 'Currency' : this.state?.currency?.label}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})`}
                                      name={"NetConditionCost"}
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
                                  <div className="d-flex align-items-center mb-2">
                                    <button type="button" id="condition-cost-refresh" className={'refresh-icon ml-1'} onClick={() => this.updateTableCost(true)} disabled={this.props.data.isViewMode}>
                                      <TooltipCustom disabledIcon={true} width="350px" id="condition-cost-refresh" tooltipText="Refresh to update Condition cost" />
                                    </button>
                                    <Button
                                      id="addBOPImport_condition"
                                      onClick={this.conditionToggle}
                                      className={"right ml-1"}
                                      variant={isViewMode ? "view-icon-primary" : (this.state.currency?.label && (this.props.fieldsObj?.BasicRate || this.state?.NetCostWithoutConditionCost)) ? `plus-icon-square` : `blurPlus-icon-square`}
                                      disabled={!(this.state.currency?.label && (this.props.fieldsObj?.BasicRate || this.state?.NetCostWithoutConditionCost))}
                                    />
                                  </div>
                                </div>
                              </Col>
                            </>
                          }
                          {
                            this.state.showCurrency && (!isTechnologyVisible || this.state.IsBreakupBoughtOutPart) && <>
                              <Col md="3">
                                <TooltipCustom id="bop-net-cost-currency" disabledIcon={true} width="350px" tooltipText={`Net Cost (${this.state?.currency?.label === undefined ? 'Currency' : this.state?.currency?.label}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})= ${this.toolTipNetCost()?.toolTipTextNetCost}`} />
                                <Field
                                  label={`Net Cost (${this.state?.currency?.label === undefined ? 'Currency' : this.state?.currency?.label}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})`}
                                  name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCost"}
                                  type="text"
                                  id="bop-net-cost-currency"
                                  placeholder={"-"}
                                  validate={[]}
                                  component={renderTextInputField}
                                  required={false}
                                  disabled={true}
                                  className=" "
                                  customClassName=" withBorder mb-0"
                                />
                              </Col>
                              {<Col md="3">
                                <TooltipCustom id="bop-net-cost-plant" disabledIcon={true} width="350px" tooltipText={`Net Cost (${fieldsObj?.plantCurrency ?? 'Currency'}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})  = Net Cost (${this.state?.currency?.label}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label}) * Plant Currency Rate (${this.state?.plantCurrencyValue})`} />
                                <Field
                                  label={`Net Cost (${fieldsObj?.plantCurrency ?? 'Currency'}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})`}
                                  name={"NetLandedCostPlantCurrency"}
                                  id="bop-net-cost-plant"
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
                              {!this?.state?.hidePlantCurrency && <Col md="3">
                                <TooltipCustom id="bop-net-cost-Conversion" disabledIcon={true} width="350px" tooltipText={`Net Cost (${reactLocalStorage.getObject("baseCurrency")}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})  = Net Cost (${this.state?.hidePlantCurrency ? this.state?.currency?.label : fieldsObj?.plantCurrency}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label}) * Currency Rate (${this.state?.currencyValue})`} />
                                <Field
                                  label={`Net Cost (${reactLocalStorage.getObject("baseCurrency")}/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label})`}
                                  name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostBaseCurrency"}
                                  type="text"
                                  id="bop-net-cost-Conversion" s
                                  placeholder={"-"}
                                  validate={[]}
                                  component={renderTextInputField}
                                  required={false}
                                  disabled={true}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col >}
                            </>}


                        </Row >
                        {
                          getConfigurationKey().IsShowClientVendorBOP && costingTypeId === CBCTypeId && <Col md="3" className="d-flex align-items-center mb-3">
                            <label
                              className={`custom-checkbox`}
                              onChange={this.onIsClientVendorBOP}
                            >
                              Client Approved {VendorLabel}
                              <input
                                type="checkbox"
                                checked={isClientVendorBOP}
                                disabled={isViewMode ? true : false}
                              />
                              <span
                                className=" before-box"
                                checked={isClientVendorBOP}
                                onChange={this.onIsClientVendorBOP}
                              />
                            </label>
                          </Col>
                        }
                        < Row >
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
                              Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files)<AttachmentValidationInfo />
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
                        </Row >
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
                            {((!isViewMode && (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration?.IsMasterApprovalAppliedConfigure) || (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !CostingTypePermission && !isTechnologyVisible)) && !isTechnologyVisible ?
                              <Button
                                id="addBOPIMport_sendForApproval"
                                type="submit"
                                className="mr5"
                                disabled={isViewMode || setDisable || disableSendForApproval || this?.state?.showWarning || this.state?.showPlantWarning}
                                icon="send-for-approval"
                                buttonName="Send For Approval"
                              />
                              :
                              <Button
                                id="addBOPIMport_save"
                                type="submit"
                                className="mr5"
                                disabled={isViewMode || setDisable || this?.state?.showWarning || this.state?.showPlantWarning}
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
              ViewMode={(isViewMode)}
              isFromMaster={true}
              currency={this.state.currency}
              currencyValue={this.state.currencyValue}
              basicRateCurrency={BasicPrice}
              basicRateBase={BasicPrice}
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
          {
            this.state.isOpenOtherCostDrawer &&
            <AddOtherCostDrawer
              isOpen={this.state.isOpenOtherCostDrawer}
              rmTableData={this.state.otherCostTableData}
              closeDrawer={this.closeOtherCostToggle}
              anchor={'right'}
              isBOP={true}
              rawMaterial={true}
              rmBasicRate={this.state.totalBasicRate}
              ViewMode={isViewMode}
              uom={this.state.UOM}
              isImport={true}
              plantCurrency={this.props.fieldsObj?.plantCurrency}
              settlementCurrency={this.state?.currency?.label}
            />
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
  const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate', 'BoughtOutPartName', 'BoughtOutPartNumber', 'SAPPartNumber', 'plantCurrency', 'ExchangeSource', 'Currency');

  const { bopCategorySelectList, bopData, IncoTermsSelectList, PaymentTermsSelectList } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList,
    UOMSelectList, currencySelectList, plantSelectList, exchangeRateSourceList } = comman;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { partSelectList, partFamilySelectList } = part;
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
      NumberOfPieces: bopData?.NumberOfPieces,
      NetLandedCost: bopData.NetLandedCost,
      Remark: bopData.Remark,
      SAPPartNumber: bopData?.SAPPartNumber,
      PartFamily: {
        label: bopData?.PartFamily || "",
        value: bopData?.PartFamilyId || ""
      }
    }
  }

  return {
    vendorWithVendorCodeSelectList, bopCategorySelectList, plantList, filterPlantList, filterCityListBySupplier,
    plantSelectList, cityList, partSelectList, clientSelectList, UOMSelectList, currencySelectList, partFamilySelectList, fieldsObj, initialValues, initialConfiguration, IncoTermsSelectList, PaymentTermsSelectList, userMasterLevelAPI, costingSpecifiTechnology, exchangeRateSourceList
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
  getCityByCountryAction,
  getAllCity,
  getClientSelectList,
  getIncoTermSelectList,
  getPaymentTermSelectList,
  getUsersMasterLevelAPI,
  getCostingSpecificTechnology,
  getPartFamilySelectList,
  checkAndGetBopPartNo,
  getExchangeRateSource,
  getBOPDataBySourceVendor,
  getPlantUnitAPI
})(reduxForm({
  form: 'AddBOPImport',
  validate: validateForm,
  touchOnChange: true,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(withTranslation(['BOPMaster', 'MasterLabels'])(AddBOPImport)));
