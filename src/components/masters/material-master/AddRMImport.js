import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, getCodeBySplitting, positiveAndDecimalNumber, acceptAllExceptSingleSpecialCharacter, maxLength512, checkForNull, checkForDecimalAndNull, decimalLengthsix, maxLength70, maxLength15, number, hashValidation, maxLength10 } from "../../../helper/validation";
import { renderText, searchableSelect, renderMultiSelectField, renderTextAreaField, renderDatePicker, renderTextInputField } from "../../layout/FormInputs";
import {
  getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getPlantBySupplier, getUOMSelectList,
  getCurrencySelectList, fetchSupplierCityDataAPI, getPlantSelectListByType, getCityByCountry, getAllCity, getVendorNameByVendorSelectList
} from '../../../actions/Common';
import {
  createRM, getRMDataById, updateRMAPI, getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial, fileUploadRMDomestic, checkAndGetRawMaterialCode, getRMSpecificationDataAPI, getRMSpecificationDataList
} from '../actions/Material';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, getConfigurationKey, userDetails, IsFetchExchangeRateVendorWise } from "../../../helper/auth";
import AddSpecification from './AddSpecification';
import AddGrade from './AddGrade';
import AddCategory from './AddCategory';
import AddUOM from '../uom-master/AddUOM';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader';
import "react-datepicker/dist/react-datepicker.css"
import { FILE_URL, INR, ZBC, RM_MASTER_ID, EMPTY_GUID, SPACEBAR, ZBCTypeId, VBCTypeId, CBCTypeId, searchCount, ENTRY_TYPE_IMPORT, VBC_VENDOR_TYPE, RAW_MATERIAL_VENDOR_TYPE } from '../../../config/constants';
import { ASSEMBLY, AcceptableRMUOM, LOGISTICS } from '../../../config/masterData'
import { getExchangeRateByCurrency, getCostingSpecificTechnology } from "../../costing/actions/Costing"
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage';
import imgRedcross from '../../../assests/images/red-cross.png'
import { CheckApprovalApplicableMaster, IsShowFreightAndShearingCostFields, labelWithUOMAndUOM, onFocus, showDataOnHover, showRMScrapKeys, userTechnologyDetailByMasterId } from '../../../helper';
import MasterSendForApproval from '../MasterSendForApproval';
import { animateScroll as scroll } from 'react-scroll';
import AsyncSelect from 'react-select/async';
import TooltipCustom from '../../common/Tooltip';
import { labelWithUOMAndCurrency } from '../../../helper';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import Button from '../../layout/Button';
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';

const selector = formValueSelector('AddRMImport');

class AddRMImport extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: false,
      isViewFlag: this.props?.data?.isViewFlag ? true : false,
      RawMaterialID: EMPTY_GUID,
      costingHead: 'zero',
      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      Technology: [],
      selectedPlants: [],
      IsFinancialDataChanged: true,
      costingTypeId: ZBCTypeId,
      vendorName: [],
      VendorCode: '',
      vendorLocation: [],
      isVendorNameNotSelected: false,
      client: [],
      HasDifferentSource: false,
      sourceLocation: [],
      oldDate: '',
      nameDrawer: [],

      UOM: [],
      currency: [],
      effectiveDate: '',
      minEffectiveDate: '',
      remarks: '',

      isShowForm: false,
      IsVendor: false,
      files: [],
      errors: [],

      isRMDrawerOpen: false,
      isOpenGrade: false,
      isOpenSpecification: false,
      isOpenCategory: false,
      isOpenVendor: false,
      isOpenUOM: false,

      isVisible: false,
      imageURL: '',
      currencyValue: 1,
      showCurrency: false,
      netCost: '',
      netCurrencyCost: '',
      singlePlantSelected: [],
      DropdownChanged: true,
      DataToChange: [],
      isDateChange: false,
      isSourceChange: false,
      source: '',
      showWarning: false,
      showExtraCost: false,
      approveDrawer: false,
      uploadAttachements: true,
      isFinalApprovar: false,
      setDisable: false,
      inputLoader: false,
      attachmentLoader: false,
      showErrorOnFocus: false,
      showErrorOnFocusDate: false,
      finalApprovalLoader: true,
      showPopup: false,
      levelDetails: {},
      vendorFilterList: [],
      isCallCalculation: false,
      isDropDownChanged: false,
      CostingTypePermission: false,
      isEditBuffer: false,
      disableSendForApproval: false,
      isOpenConditionDrawer: false,
      conditionTableData: [],
      BasicPriceINR: '',
      BasicPriceSelectedCurrency: '',
      totalConditionCost: '',
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
      FinalScrapRateBaseCurrency: '',
      FinalScrapRateSelectedCurrency: '',
      FinalForgingScrapCostBaseCurrency: '',
      FinalForgingScrapCostSelectedCurrency: '',
      FinalMachiningScrapCostBaseCurrency: '',
      FinalMachiningScrapCostSelectedCurrency: '',
      FinalCircleScrapCostBaseCurrency: '',
      FinalCircleScrapCostSelectedCurrency: '',
      FinalJaliScrapCostBaseCurrency: '',
      FinalJaliScrapCostSelectedCurrency: '',
      FinalFreightCostBaseCurrency: '',
      FinalFreightCostSelectedCurrency: '',
      FinalShearingCostBaseCurrency: '',
      FinalShearingCostSelectedCurrency: '',
      toolTipTextObject: {},
      IsApplyHasDifferentUOM: false,
      ScrapRateUOM: [],
      CalculatedFactor: '',
      UOMToScrapUOMRatio: '',
      ScrapRatePerScrapUOMConversion: '',
      ConversionRatio: '',
      isDisabled: false, // THIS STATE IS USED TO DISABLE NAME, GRADE, SPEC
      isCodeDisabled: false, // THIS STATE IS USED TO DISABLE CODE
      rmCode: []
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
    if (!(this.props.data.isEditFlag || this.state.isViewFlag)) {
      this.props.getCurrencySelectList(() => { })
      this.props.getUOMSelectList(() => { })
    }
  }



  netCostTitle() {
    const { currency, costingTypeId } = this.state
    const { initialConfiguration } = this.props
    if (initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      let obj = {
        toolTipTextNetCostSelectedCurrency: `Net Cost (${currency.label === undefined ? 'Currency' : currency?.label}) = Basic Price (${currency.label === undefined ? 'Currency' : currency?.label}) + Condition Cost (${currency.label === undefined ? 'Currency' : currency?.label})`,
        toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Price (${reactLocalStorage.getObject("baseCurrency")})  + Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`
      }
      return obj

    } else {

      let obj = {
        toolTipTextNetCostSelectedCurrency: `Net Cost (${currency.label === undefined ? 'Currency' : currency?.label}) = Basic Rate (${currency.label === undefined ? 'Currency' : currency?.label}) + Freight Cost (${currency.label === undefined ? 'Currency' : currency?.label}) + Shearing Cost (${currency.label === undefined ? 'Currency' : currency?.label})`,
        toolTipTextNetCostBaseCurrency: `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) + Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) + Shearing Cost (${reactLocalStorage.getObject("baseCurrency")})`
      }
      return obj
    }
  }

  basicPriceTitle() {
    const { initialConfiguration } = this.props
    const { costingTypeId, currency } = this.state
    if (initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      let obj = {
        toolTipTextBasicPriceSelectedCurrency: `Basic Price (${currency.label === undefined ? 'Currency' : currency?.label}) = Basic Rate (${currency.label === undefined ? 'Currency' : currency?.label}) + Freight Cost (${currency.label === undefined ? 'Currency' : currency?.label}) + Shearing Cost (${currency.label === undefined ? 'Currency' : currency?.label})`,
        toolTipTextBasicPriceBaseCurrency: `Basic Price (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) + Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) + Shearing Cost (${reactLocalStorage.getObject("baseCurrency")})`
      }
      return obj

    }
  }

  allFieldsInfoIcon(setData) {
    const { initialConfiguration } = this.props
    const { currency, showScrapKeys, currencyValue, toolTipTextObject } = this.state
    let obj = {
      toolTipTextCutOffBaseCurrency: `Cut Off Price (${reactLocalStorage.getObject("baseCurrency")}) = Cut Off Price (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
      toolTipTextBasicRateBaseCurrency: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
      toolTipTextFreightCostBaseCurrency: `Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) = Freight Cost (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
      toolTipTextShearingCostBaseCurrency: `Shearing Cost (${reactLocalStorage.getObject("baseCurrency")}) = Shearing Cost (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
      toolTipTextConditionCostBaseCurrency: `Condition Cost (${reactLocalStorage.getObject("baseCurrency")}) = Condition Cost (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
      toolTipTextCalculatedFactor: <>{labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} = 1 / {labelWithUOMAndUOM("Calculated Ratio", this.state.ScrapRateUOM?.label, this.state.UOM?.label)}</>,
    }
    if (showScrapKeys?.showCircleJali) {
      obj = {
        ...obj,
        toolTipTextCircleScrapCostBaseCurrency: `Circle Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Circle Scrap Rate (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
        toolTipTextJaliScrapCostBaseCurrency: <>{labelWithUOMAndCurrency("Jali Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Jali Scrap Rate", this.state.UOM?.label, currency?.label)}* Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
        toolTipTextJaliScrapCostSelectedCurrency: <>{labelWithUOMAndCurrency("Jali Scrap Rate", this.state.UOM?.label, this.state.currency?.label)} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)}* {labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label, this.state.currency?.label)}</>,
        toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)}* Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
        toolTipTextJaliScrapCostBaseCurrencyPerOldUOM: `Jali Scrap Rate (${currency?.label ? currency?.label : 'Currency'}/${this.state.UOM?.label ? this.state.UOM?.label : 'UOM'}) = Calculated Factor (${this.state.UOM?.label ? this.state.UOM?.label : 'UOM'}/${this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM'}) * Jali Scrap Rate (${currency?.label ? currency?.label : 'Currency'}/${this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM'})`,
      }
    } else if (showScrapKeys?.showForging) {
      obj = {
        ...obj,
        toolTipTextForgingScrapCostBaseCurrency: <>{labelWithUOMAndCurrency("Forging Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Forging Scrap Rate", this.state.UOM?.label, currency?.label)} * Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
        toolTipTextMachiningScrapCostBaseCurrency: `Machining Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Machining Scrap Rate (${currency.label === undefined ? 'Currency' : currency?.label}) * Currency Rate (${currency.label === undefined ? 'Currency' : currencyValue})`,
        toolTipTextForgingScrapCostSelectedCurrency: <>{labelWithUOMAndCurrency("Forging Scrap Rate", this.state.UOM?.label, currency.label)} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)}</>,
        toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)} * Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
      }
    } else if (showScrapKeys?.showScrap) {
      obj = {
        ...obj,
        toolTipTextScrapCostBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, currency?.label)} * Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
        toolTipTextScrapCostSelectedCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, currency.label)} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)}</>,
        toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)} *  Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
      }
    } else {
      obj = {
        ...obj,
        toolTipTextScrapCostBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, currency?.label)} * Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
        toolTipTextScrapCostSelectedCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)}</>,
        toolTipTextScrapRatePerScrapUOMBaseCurrency: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, currency.label)} * Currency Rate ({currency.label === undefined ? 'Currency' : currencyValue})</>,
      }
    }
    if (setData) {
      setTimeout(() => {
        this.setState({ toolTipTextObject: { ...toolTipTextObject, ...obj } })
      }, 100);
    }
    return obj
  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data, initialConfiguration } = this.props
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    this.getDetails(data);
    this.props.change('NetLandedCostINR', 0)
    this.props.change('NetLandedCostSelectedCurrency', 0)
    this.props.getUOMSelectList(() => { })
    if (!this.state.isViewFlag) {
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
        this.props.getRMSpecificationDataList({ GradeId: null }, () => { });
      })
    }

    if (!(data.isEditFlag || data.isViewFlag)) {
      this.props.getRawMaterialCategory(res => { });
      this.props.getRawMaterialNameChild(() => { })
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
      this.props.fetchSpecificationDataAPI(0, () => { })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
      this.props.getClientSelectList(() => { })
      this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
    }

  }

  finalUserCheckAndMasterLevelCheckFunction = (plantId) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewFlag && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), RM_MASTER_ID, (res) => {

        this.commonFunction(plantId)
      })
    } else {
      this.setState({ finalApprovalLoader: false })
    }
  }
  commonFunction(plantId = EMPTY_GUID) {
    let levelDetailsTemp = []
    levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId, RM_MASTER_ID, this.props.userMasterLevelAPI)
    this.setState({ levelDetails: levelDetailsTemp })
    let obj = {
      DepartmentId: userDetails().DepartmentId,
      UserId: loggedInUserId(),
      TechnologyId: RM_MASTER_ID,
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

  setInStateToolTip() {
    const obj = {
      ...this.state.toolTipTextObject, netCostCurrency: this.netCostTitle()?.toolTipTextNetCostSelectedCurrency, netCostBaseCurrency: this.netCostTitle()?.toolTipTextNetCostBaseCurrency,
      basicPriceSelectedCurrency: this.basicPriceTitle()?.toolTipTextBasicPriceSelectedCurrency, basicPriceBaseCurrency: this.basicPriceTitle()?.toolTipTextBasicPriceBaseCurrency
    }
    this.setState({ toolTipTextObject: obj })
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (!this.state.isViewFlag && !this.state.isCallCalculation) {
      if (this.props.fieldsObj !== prevProps.fieldsObj && !this.state.isEditFlag) {
        this.allFieldsInfoIcon(true)
        this.setInStateToolTip()
        this.handleNetCost()
      }
      if (this.props.fieldsObj !== prevProps.fieldsObj && this.state.isEditFlag && this.state.isEditBuffer) {
        this.allFieldsInfoIcon(true)
        this.setInStateToolTip()
        this.handleNetCost()
      }
      if ((prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
        this.commonFunction()
      }

    }

  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }
  /**
  * @method handleRMChange
  * @description  used to handle row material selection
  */
  handleRMChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [], rmCode: [], isDropDownChanged: true, isCodeDisabled: true }, () => {
        const { RawMaterial } = this.state;
        this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, false, res => { })
      });
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [], rmCode: [], isCodeDisabled: false });
      this.props.getRMGradeSelectListByRawMaterial(0, res => { });
    }
  }

  /**
  * @method handleGradeChange
  * @description  used to handle row material grade selection
      */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue, RMSpec: [], rmCode: [], isCodeDisabled: true }, () => {
        const { RMGrade } = this.state;
        this.props.fetchSpecificationDataAPI(RMGrade.value, res => { });
      })
    } else {
      this.setState({
        RMGrade: [],
        RMSpec: [],
        isCodeDisabled: false
      })
      this.props.fetchSpecificationDataAPI(0, res => { });
    }
  }

  /**
  * @method handleSpecChange
  * @description  used to handle row material grade selection
  */
  handleSpecChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMSpec: newValue, isCodeDisabled: true, rmCode: { label: newValue.RawMaterialCode, value: newValue.value } })
    } else {
      this.setState({ RMSpec: [], isCodeDisabled: false, rmCode: [] })
    }
  }

  /**
 * @method handleCodeChange
 * @description  used to handle code change
 */
  handleCodeChange = (newValue) => {
    if (newValue && newValue !== '') {
      this.setState({ rmCode: newValue, isDisabled: true })
      this.props.getRMSpecificationDataAPI(newValue.value, true, (res) => {
        if (res.status === 204) {
          this.setState({
            RawMaterial: { label: '', value: '', },
            RMGrade: { label: '', value: '', },
            RMSpec: { label: '', value: '', }
          })
          Toaster.warning("The Raw Material Grade and Specification has set as unspecified. First update the Grade and Specification against this Raw Material Code from Manage Specification tab.")
          return false
        }
        let Data = res.data.Data
        this.setState({
          RawMaterial: { label: Data.RawMaterialName, value: Data.RawMaterialId, },
          RMGrade: { label: Data.GradeName, value: Data.GradeId },
          RMSpec: { label: Data.Specification, value: Data.SpecificationId }
        })
      })
    } else {
      this.setState({ rmCode: [], RawMaterial: [], RMGrade: [], RMSpec: [], isDisabled: false })
    }
  }

  /**
  * @method handleCategoryChange
  * @description  used to handle category selection
  */
  handleCategoryChange = (newValue, actionMeta) => {
    this.setState({ Category: newValue, isDropDownChanged: true })
  }

  checkTechnology = (technology) => {
    let obj = showRMScrapKeys(technology.value)
    this.setState({ showScrapKeys: obj })
  }

  /**
  * @method handleTechnologyChange
  * @description Use to handle technology change
 */
  handleTechnologyChange = (newValue) => {
    this.checkTechnology(newValue)
    this.setState({ isDropDownChanged: true, Technology: newValue })
    setTimeout(() => {
      this.allFieldsInfoIcon(true)
    }, 300);
  }
  /**
* @method handleClient
* @description called
*/
  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue, isDropDownChanged: true });
      const { costingTypeId, currency, effectiveDate, vendorName } = this.state;
      if (newValue && newValue?.length !== 0 && this.state.currency && this.state.currency.length !== 0 && effectiveDate) {
        this.props.getExchangeRateByCurrency(currency.label, (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : EMPTY_GUID, newValue.value, false, res => {
          if (Object.keys(res.data.Data).length === 0) {
            this.setState({ showWarning: true })
          } else {
            this.setState({ showWarning: false })
          }
          this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) }, () => { this.handleNetCost() });
        });
      }
    } else {
      this.setState({ client: [] })
    }
  };

  /**
  * @method handleCategoryType
  * @description  used to handle category type selection
  */
  handleCategoryType = (e) => {
    this.props.fetchCategoryAPI(e.target.value, res => { })
  }

  /**
  * @method handleSourceSupplierPlant
  * @description Used handle vendor plants
  */
  handleSourceSupplierPlant = (e) => {
    this.setState({ selectedPlants: e })
    this.setState({ DropdownChanged: false, isDropDownChanged: true })
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, vendorLocation: [], isDropDownChanged: true }, () => {
        const { vendorName } = this.state;
        const result = vendorName && vendorName.label ? getCodeBySplitting(vendorName.label) : '';
        this.setState({ VendorCode: result })
        this.props.getPlantBySupplier(vendorName.value, () => { })
        const { costingTypeId, currency, effectiveDate, client } = this.state;
        const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? newValue.value : EMPTY_GUID) : EMPTY_GUID;
        const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId

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
            this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate) }, () => { this.handleNetCost() });
          });
        }
      });
    } else {
      this.setState({ vendorName: [], vendorLocation: [] })
    }
  };
  /**
  * @method handleVendorLocation
  * @description called
  */
  handleVendorLocation = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorLocation: newValue, });
    } else {
      this.setState({ vendorLocation: [], })
    }
  };

  /**
   * @method handleSourceSupplierCity
   * @description called
   */
  handleSourceSupplierCity = (newValue, actionMeta) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ sourceLocation: newValue, isSourceChange: true })
    } else {
      this.setState({ sourceLocation: [] })
    }
    if (isEditFlag && (DataToChange.SourceLocation !== newValue.value)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }

  }

  handleSource = (newValue, actionMeta) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ source: newValue, isSourceChange: true })
    }
    if (isEditFlag && (DataToChange.Source !== newValue)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }
  }

  /**
   * @method handleSelectConversion
   * @description called
   */
  handleSelectConversion = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ ScrapRateUOM: newValue, isDropDownChanged: true })
    } else {
      this.setState({ ScrapRateUOM: [] })
    }
  }

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, ScrapRateUOM: [] })
    } else {
      this.setState({ UOM: [] })
    }
  };

  /**
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue) => {
    const { effectiveDate } = this.state

    if (newValue && newValue !== '') {
      if (newValue.label === getConfigurationKey().BaseCurrency) {
        this.setState({ currencyValue: 1, showCurrency: false, })
      } else {
        const { costingTypeId, vendorName, client } = this.state;
        const vendorValue = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? newValue?.value : EMPTY_GUID) : EMPTY_GUID;
        const costingType = IsFetchExchangeRateVendorWise() ? ((costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VBCTypeId : costingTypeId) : ZBCTypeId

        if (effectiveDate && (vendorName?.length !== 0 || client?.length !== 0)) {
          if (IsFetchExchangeRateVendorWise() && (!newValue || newValue?.length === 0)) {
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

        this.setState({ showCurrency: true })
      }
      this.setState({ currency: newValue, IsFinancialDataChanged: true }, () => {
        setTimeout(() => {
          this.handleNetCost()
        }, 200);
      })
    } else {
      this.setState({ currency: [] })
    }
  };



  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    const { currency, effectiveDate } = this.state
    if (date !== effectiveDate) {
      if (currency.label === getConfigurationKey().BaseCurrency) {
        this.setState({ currencyValue: 1, showCurrency: false, })
      } else {
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
      }
      setTimeout(() => {
        this.setState({ isDateChange: true, effectiveDate: date }, () => { this.handleNetCost() })
      }, 200);
    } else {
      this.setState({ isDateChange: false, effectiveDate: date }, () => { this.handleNetCost() })
    }

  };

  handleCutOfChange = () => {
    this.setState({ isSourceChange: true })

  }



  convertIntoBase = (price) => {
    const { currencyValue } = this.state;
    return checkForNull(price) * checkForNull(currencyValue)
  }

  recalculateConditions = (basicPriceSelectedCurrency, basicPriceBaseCurrency) => {
    const { conditionTableData } = this.state;
    let tempList = conditionTableData && conditionTableData?.map(item => {
      if (item?.ConditionType === "Percentage") {
        let costSelectedCurrency = checkForNull((item?.Percentage) / 100) * checkForNull(basicPriceSelectedCurrency)
        let costBaseCurrency = checkForNull((item?.Percentage) / 100) * checkForNull(basicPriceBaseCurrency)
        item.ConditionCost = costSelectedCurrency
        item.ConditionCostConversion = costBaseCurrency
      }
      return item
    })
    return tempList
  }

  handleNetCost = () => {

    const { fieldsObj, initialConfiguration } = this.props;
    const { FinalConditionCostSelectedCurrency, DataToChange, isEditFlag, costingTypeId, showScrapKeys } = this.state

    let scrapRatePerScrapUOMBaseCurrencyTemp = this.convertIntoBase(fieldsObj?.ScrapRatePerScrapUOM)
    this.props.change('ScrapRatePerScrapUOMBaseCurrency', checkForDecimalAndNull(scrapRatePerScrapUOMBaseCurrencyTemp, initialConfiguration.NoOfDecimalForPrice));

    let obj = {}
    if (this.state.IsApplyHasDifferentUOM) {
      const conversionFactorTemp = 1 / fieldsObj?.UOMToScrapUOMRatio
      this.props.change('CalculatedFactor', checkForDecimalAndNull(conversionFactorTemp, initialConfiguration.NoOfDecimalForPrice));
      const scrapRateTemp = checkForNull(fieldsObj?.ScrapRatePerScrapUOM) * checkForNull(conversionFactorTemp)
      if (showScrapKeys?.showCircleJali) {
        obj.FinalJaliScrapCostSelectedCurrency = scrapRateTemp
        this.props.change('JaliScrapCostSelectedCurrency', checkForDecimalAndNull(scrapRateTemp, initialConfiguration.NoOfDecimalForPrice));
      } else if (showScrapKeys?.showForging) {
        obj.FinalForgingScrapCostSelectedCurrency = scrapRateTemp
        this.props.change('ForgingScrapSelectedCurrency', checkForDecimalAndNull(scrapRateTemp, initialConfiguration.NoOfDecimalForPrice));
      } else if (showScrapKeys?.showScrap) {
        obj.FinalScrapRateSelectedCurrency = scrapRateTemp
        this.props.change('ScrapRateSelectedCurrency', checkForDecimalAndNull(scrapRateTemp, initialConfiguration.NoOfDecimalForPrice));
      }
      obj.ScrapRateSelectedCurrency = scrapRateTemp
      obj.CalculatedFactor = conversionFactorTemp
    }

    const cutOffPriceBaseCurrency = this.convertIntoBase(fieldsObj?.cutOffPriceSelectedCurrency)
    this.props.change('cutOffPriceBaseCurrency', checkForDecimalAndNull(cutOffPriceBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const basicRateBaseCurrency = this.convertIntoBase(fieldsObj?.BasicRateSelectedCurrency)
    this.props.change('BasicRateBaseCurrency', checkForDecimalAndNull(basicRateBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const scrapRateBaseCurrency = this.convertIntoBase(fieldsObj?.ScrapRateSelectedCurrency)
    this.props.change('ScrapRateBaseCurrency', checkForDecimalAndNull(scrapRateBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const forgingScrapBaseCurrency = this.convertIntoBase(fieldsObj?.ForgingScrapSelectedCurrency)
    this.props.change('ForgingScrapBaseCurrency', checkForDecimalAndNull(forgingScrapBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const machiningScrapBaseCurrency = this.convertIntoBase(fieldsObj?.MachiningScrapSelectedCurrency)
    this.props.change('MachiningScrapBaseCurrency', checkForDecimalAndNull(machiningScrapBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const circleScrapCostBaseCurrency = this.convertIntoBase(fieldsObj?.CircleScrapCostSelectedCurrency)
    this.props.change('CircleScrapCostBaseCurrency', checkForDecimalAndNull(circleScrapCostBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const jaliScrapCostBaseCurrency = this.convertIntoBase(fieldsObj?.JaliScrapCostSelectedCurrency)
    this.props.change('JaliScrapCostBaseCurrency', checkForDecimalAndNull(jaliScrapCostBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const freightChargeBaseCurrency = this.convertIntoBase(fieldsObj?.FreightChargeSelectedCurrency)
    this.props.change('FreightChargeBaseCurrency', checkForDecimalAndNull(freightChargeBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    const shearingCostSelectedCurrency = this.convertIntoBase(fieldsObj?.ShearingCostSelectedCurrency)
    this.props.change('ShearingCostBaseCurrency', checkForDecimalAndNull(shearingCostSelectedCurrency, initialConfiguration.NoOfDecimalForPrice));

    const basicPriceSelectedCurrencyTemp = checkForNull(fieldsObj?.BasicRateSelectedCurrency) + checkForNull(fieldsObj?.FreightChargeSelectedCurrency) + checkForNull(fieldsObj?.ShearingCostSelectedCurrency)
    const basicPriceBaseCurrencyTemp = this.convertIntoBase(basicPriceSelectedCurrencyTemp)

    let basicPriceSelectedCurrency
    let basicPriceBaseCurrency

    if (costingTypeId === ZBCTypeId) {
      basicPriceSelectedCurrency = basicPriceSelectedCurrencyTemp
      basicPriceBaseCurrency = basicPriceBaseCurrencyTemp
    }

    this.props.change('BasicPriceSelectedCurrency', checkForDecimalAndNull(basicPriceSelectedCurrency, initialConfiguration.NoOfDecimalForPrice));
    this.props.change('BasicPriceBaseCurrency', checkForDecimalAndNull(basicPriceBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    let conditionList = this.recalculateConditions(basicPriceSelectedCurrency, basicPriceBaseCurrency)

    const sumBaseCurrency = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostConversion), 0);
    this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(sumBaseCurrency, initialConfiguration.NoOfDecimalForPrice))

    const sumSelectedCurrency = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
    this.props.change('FinalConditionCostSelectedCurrency', checkForDecimalAndNull(sumSelectedCurrency, initialConfiguration.NoOfDecimalForPrice))

    const netLandedCostSelectedCurrency = checkForNull(basicPriceSelectedCurrencyTemp) + checkForNull(sumSelectedCurrency)
    const netLandedCostBaseCurrency = checkForNull(basicPriceBaseCurrencyTemp) + checkForNull(sumBaseCurrency)
    this.props.change('NetLandedCostSelectedCurrency', checkForDecimalAndNull(netLandedCostSelectedCurrency, initialConfiguration.NoOfDecimalForPrice));
    this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(netLandedCostBaseCurrency, initialConfiguration.NoOfDecimalForPrice));

    if (isEditFlag && checkForNull(fieldsObj?.BasicRateSelectedCurrency) === checkForNull(DataToChange?.BasicRatePerUOM) && checkForNull(fieldsObj?.ScrapRateSelectedCurrency) === checkForNull(DataToChange?.ScrapRate)
      && checkForNull(fieldsObj?.ForgingScrapSelectedCurrency) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.MachiningScrapSelectedCurrency) === checkForNull(DataToChange?.MachiningScrapRate) && checkForNull(fieldsObj?.CircleScrapCostSelectedCurrency) === checkForNull(DataToChange?.JaliScrapCostSelectedCurrency)
      && checkForNull(fieldsObj?.JaliScrapCostSelectedCurrency) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.FreightChargeSelectedCurrency) === checkForNull(DataToChange?.RMFreightCost) && checkForNull(fieldsObj?.ShearingCostSelectedCurrency) === checkForNull(DataToChange?.RMShearingCost)
      && checkForNull(fieldsObj?.cutOffPriceSelectedCurrency) === checkForNull(DataToChange?.CutOffPrice) && checkForNull(basicPriceSelectedCurrency) === checkForNull(DataToChange?.NetCostWithoutConditionCost) &&
      checkForNull(netLandedCostSelectedCurrency) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(FinalConditionCostSelectedCurrency) === checkForNull(DataToChange?.NetConditionCost)) {
      this.setState({ IsFinancialDataChanged: false, EffectiveDate: DayTime(this.state.DataToChange?.EffectiveDate).isValid() ? DayTime(this.state.DataToChange?.EffectiveDate) : '' });
      this.props.change('EffectiveDate', DayTime(this.state.DataToChange?.EffectiveDate).isValid() ? DayTime(this.state.DataToChange?.EffectiveDate) : '')
    } else {
      this.setState({ IsFinancialDataChanged: true })
    }

    this.setState({

      FinalCutOffSelectedCurrency: fieldsObj?.cutOffPriceSelectedCurrency,
      FinalCutOffBaseCurrency: cutOffPriceBaseCurrency,

      FinalBasicRateSelectedCurrency: fieldsObj?.BasicRateSelectedCurrency,
      FinalBasicRateBaseCurrency: basicRateBaseCurrency,

      FinalScrapRateSelectedCurrency: fieldsObj?.ScrapRateSelectedCurrency,
      FinalScrapRateBaseCurrency: scrapRateBaseCurrency,

      FinalForgingScrapCostSelectedCurrency: fieldsObj?.ForgingScrapSelectedCurrency,

      FinalMachiningScrapCostSelectedCurrency: fieldsObj?.MachiningScrapSelectedCurrency,
      FinalMachiningScrapCostBaseCurrency: machiningScrapBaseCurrency,

      FinalCircleScrapCostSelectedCurrency: fieldsObj?.CircleScrapCostSelectedCurrency,
      FinalCircleScrapCostBaseCurrency: circleScrapCostBaseCurrency,

      FinalJaliScrapCostSelectedCurrency: fieldsObj?.JaliScrapCostSelectedCurrency,
      FinalJaliScrapCostBaseCurrency: jaliScrapCostBaseCurrency,

      FinalFreightCostSelectedCurrency: fieldsObj?.FreightChargeSelectedCurrency,
      FinalFreightCostBaseCurrency: freightChargeBaseCurrency,

      FinalShearingCostSelectedCurrency: fieldsObj?.ShearingCostSelectedCurrency,
      FinalShearingCostBaseCurrency: shearingCostSelectedCurrency,

      FinalBasicPriceSelectedCurrency: basicPriceSelectedCurrency,
      FinalBasicPriceBaseCurrency: basicPriceBaseCurrency,

      FinalConditionCostSelectedCurrency: sumSelectedCurrency,
      FinalConditionCostBaseCurrency: sumBaseCurrency,

      FinalNetCostSelectedCurrency: netLandedCostSelectedCurrency,
      FinalNetCostBaseCurrency: netLandedCostBaseCurrency,

      ConversionRatio: fieldsObj?.ConversionRatio,
      UOMToScrapUOMRatio: fieldsObj?.UOMToScrapUOMRatio,
      ScrapRatePerScrapUOM: fieldsObj?.ScrapRatePerScrapUOM,
      ScrapRatePerScrapUOMConversion: scrapRatePerScrapUOMBaseCurrencyTemp,
      ...obj,

    }, () => {
      this.setState({ FinalForgingScrapCostBaseCurrency: forgingScrapBaseCurrency })
    })
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
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = (data) => {
    const { showScrapKeys } = this.state
    if (data && data.isEditFlag) {
      const { initialConfiguration } = this.props
      this.setState({
        isEditFlag: false,
        isLoader: true,
        isShowForm: true,
        RawMaterialID: data.Id,
        isCallCalculation: true
      })
      this.props.getRMDataById(data, true, res => {
        if (res && res.data && res.data.Result) {
          const Data = res.data.Data;
          this.setState({ DataToChange: Data })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          setTimeout(() => {
            this.finalUserCheckAndMasterLevelCheckFunction(Data.DestinationPlantId)

            this.props.change('cutOffPriceSelectedCurrency', checkForDecimalAndNull(Data?.CutOffPrice, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('cutOffPriceBaseCurrency', checkForDecimalAndNull(Data?.CutOffPriceInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('BasicRateSelectedCurrency', checkForDecimalAndNull(Data?.BasicRatePerUOM, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('BasicRateBaseCurrency', checkForDecimalAndNull(Data?.BasicRatePerUOMConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ScrapRateSelectedCurrency', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ScrapRateBaseCurrency', checkForDecimalAndNull(Data?.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ForgingScrapSelectedCurrency', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ForgingScrapBaseCurrency', checkForDecimalAndNull(Data?.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('MachiningScrapSelectedCurrency', checkForDecimalAndNull(Data?.MachiningScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('MachiningScrapBaseCurrency', checkForDecimalAndNull(Data?.MachiningScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('CircleScrapCostSelectedCurrency', checkForDecimalAndNull(Data?.JaliScrapCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('CircleScrapCostBaseCurrency', checkForDecimalAndNull(Data?.JaliScrapCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('JaliScrapCostSelectedCurrency', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('JaliScrapCostBaseCurrency', checkForDecimalAndNull(Data?.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('FreightChargeSelectedCurrency', checkForDecimalAndNull(Data?.RMFreightCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('FreightChargeBaseCurrency', checkForDecimalAndNull(Data?.RawMaterialFreightCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ShearingCostSelectedCurrency', checkForDecimalAndNull(Data?.RMShearingCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ShearingCostBaseCurrency', checkForDecimalAndNull(Data?.RawMaterialShearingCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('BasicPriceSelectedCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('BasicPriceBaseCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('FinalConditionCostSelectedCurrency', checkForDecimalAndNull(Data?.NetConditionCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(Data?.NetConditionCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('NetLandedCostSelectedCurrency', checkForDecimalAndNull(Data?.NetLandedCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(Data?.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('UOMToScrapUOMRatio', checkForDecimalAndNull(Data?.UOMToScrapUOMRatio, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ScrapRatePerScrapUOM', checkForDecimalAndNull(Data?.ScrapRatePerScrapUOM, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ScrapRatePerScrapUOMBaseCurrency', checkForDecimalAndNull(Data?.ScrapRatePerScrapUOMConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('CalculatedFactor', checkForDecimalAndNull(Data?.CalculatedFactor, initialConfiguration.NoOfDecimalForPrice));

            this.setState({

              FinalCutOffSelectedCurrency: Data?.CutOffPrice,
              FinalCutOffBaseCurrency: Data?.CutOffPriceInINR,

              FinalBasicRateSelectedCurrency: Data?.BasicRatePerUOM,
              FinalBasicRateBaseCurrency: Data?.BasicRatePerUOMConversion,

              FinalScrapRateSelectedCurrency: Data?.ScrapRate,
              FinalScrapRateBaseCurrency: Data?.ScrapRateInINR,

              FinalForgingScrapCostSelectedCurrency: Data?.ScrapRate,
              FinalForgingScrapCostBaseCurrency: Data?.ScrapRateInINR,

              FinalMachiningScrapCostSelectedCurrency: Data?.MachiningScrapRate,
              FinalMachiningScrapCostBaseCurrency: Data?.MachiningScrapRateInINR,

              FinalCircleScrapCostSelectedCurrency: Data?.JaliScrapCostSelectedCurrency,
              FinalCircleScrapCostBaseCurrency: Data?.JaliScrapCostConversion,

              FinalJaliScrapCostSelectedCurrency: Data?.ScrapRate,
              FinalJaliScrapCostBaseCurrency: Data?.ScrapRateInINR,

              FinalFreightCostSelectedCurrency: Data?.RMFreightCost,
              FinalFreightCostBaseCurrency: Data?.RawMaterialFreightCostConversion,

              FinalShearingCostSelectedCurrency: Data?.RMShearingCost,
              FinalShearingCostBaseCurrency: Data?.RawMaterialShearingCostConversion,

              FinalBasicPriceSelectedCurrency: Data?.NetCostWithoutConditionCost,
              FinalBasicPriceBaseCurrency: Data?.NetCostWithoutConditionCostConversion,

              FinalConditionCostSelectedCurrency: Data?.NetConditionCost,
              FinalConditionCostBaseCurrency: Data?.NetConditionCostConversion,

              FinalNetCostSelectedCurrency: Data?.NetLandedCost,
              FinalNetCostBaseCurrency: Data?.NetLandedCostConversion,

              conditionTableData: Data?.RawMaterialConditionsDetails,

              IsApplyHasDifferentUOM: Data?.IsScrapUOMApply,
              ScrapRateUOM: { label: Data?.ScrapUnitOfMeasurement, value: Data?.ScrapUnitOfMeasurementId },
              UOMToScrapUOMRatio: Data?.UOMToScrapUOMRatio,
              ScrapRatePerScrapUOM: Data?.ScrapRatePerScrapUOM,
              ConversionRatio: Data?.UOMToScrapUOMRatio,
              CalculatedFactor: Data?.CalculatedFactor,
              ScrapRatePerScrapUOMBaseCurrency: Data?.ScrapRatePerScrapUOMBaseCurrency,

            })
            this.checkTechnology({ label: Data.TechnologyName, value: Data.TechnologyId })

            this.setState({
              IsFinancialDataChanged: false,
              isEditFlag: true,
              isShowForm: true,
              costingTypeId: Data.CostingTypeId,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialId } : [],
              RMGrade: Data.RawMaterialGradeName !== undefined ? { label: Data.RawMaterialGradeName, value: Data.RMGrade } : [],
              RMSpec: Data.RawMaterialSpecificationName !== undefined ? { label: Data.RawMaterialSpecificationName, value: Data.RMSpec } : [],
              Category: Data.RawMaterialCategoryName !== undefined ? { label: Data.RawMaterialCategoryName, value: Data.Category } : [],
              Technology: Data.TechnologyName !== undefined ? { label: Data.TechnologyName, value: Data.TechnologyId } : [],
              selectedPlants: [{ Text: Data.DestinationPlantName, Value: Data.DestinationPlantId }],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : [],
              HasDifferentSource: Data.HasDifferentSource,
              sourceLocation: Data.SourceSupplierLocationName !== undefined ? { label: Data.SourceSupplierLocationName, value: Data.SourceLocation } : [],
              UOM: Data.UnitOfMeasurementName !== undefined ? { label: Data.UnitOfMeasurementName, value: Data.UOM } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              currency: Data.Currency !== undefined ? { label: Data.Currency, value: Data.CurrencyId } : [],
              remarks: Data.Remark,
              files: Data.FileList,
              singlePlantSelected: Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : [],
              // FreightChargeSelectedCurrency:Data.FreightChargeSelectedCurrency
              netCurrencyCost: Data.NetLandedCostConversion ? Data.NetLandedCostConversion : '',
              showForgingMachiningScrapCost: showScrapKeys?.showForging,
              showExtraCost: showScrapKeys?.showCircleJali,
              showCurrency: true,
              currencyValue: Data.CurrencyExchangeRate,
              rmCode: { label: Data.RawMaterialCode, value: Data.RMSpec },
            }, () => {
              this.setInStateToolTip()
              setTimeout(() => {
                this.setState({ isLoader: false, isCallCalculation: false })
                if (this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
                  this.allFieldsInfoIcon(true)
                  // this.commonFunction()
                }
              }, 500)
              setTimeout(() => {
                this.setState({ isEditBuffer: true })
              }, 500);
            })
            // ********** ADD ATTACHMENTS FROM API INTO THE DROPZONE'S PERSONAL DATA STORE **********
            let files = Data.FileList && Data.FileList.map((item) => {
              item.meta = {}
              item.meta.id = item.FileId
              item.meta.status = 'done'
              return item
            })
            if (this.dropzone.current !== null) {
              this.dropzone.current.files = files
            }
          }, 500);
          // this.props.getPlantBySupplier(Data.Vendor, () => { })
        }
      })
    } else {
      this.props.getRMDataById('', false, res => { })
    }
  }

  /**
     * @method onPressVendor
     * @description Used for Vendor checked
     */
  onPressVendor = (costingHeadFlag) => {
    if (costingHeadFlag === this.state.costingTypeId) {
      return false;
    }
    const fieldsToClear = ['TechnologyId',
      'RawMaterialId',
      'RawMaterialGradeId',
      'RawMaterialSpecificationId',
      'CategoryId',
      'Currency',
      'SourceSupplierPlantId',
      'DestinationPlant',
      "UnitOfMeasurementId",
      "cutOffPriceSelectedCurrency",
      "BasicRate",
      "ScrapRateSelectedCurrency",
      "ForgingScrapSelectedCurrency",
      "MachiningScrapSelectedCurrency",
      "CircleScrapCostSelectedCurrency",
      "JaliScrapCostSelectedCurrency",
      "EffectiveDate",
      "clientName",
      'ShearingCostSelectedCurrency',
      'FreightChargeSelectedCurrency'];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddRMImport', false, false, fieldName));
    });
    this.setState({
      costingTypeId: costingHeadFlag,
      vendorName: [],
      vendorLocation: [],
      singlePlantSelected: null
    });
    if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
    else {
      this.props.getPlantBySupplier('', () => { })
      this.props.getCityBySupplier(0, () => { })
    }
  }
  /**
  * @method onPressDifferentSource
  * @description Used for Different Source checked
  */
  onPressDifferentSource = () => {
    this.setState({ HasDifferentSource: !this.state.HasDifferentSource });
  }

  rmToggler = () => {
    this.setState({ isRMDrawerOpen: true })
  }

  closeRMDrawer = (e = '', data = {}) => {
    this.setState({ isRMDrawerOpen: false }, () => {
      /* FOR SHOWING RM ,GRADE AND SPECIFICATION SELECTED IN RM SPECIFICATION DRAWER*/
      this.props.getRawMaterialNameChild(() => {
        if (Object.keys(data).length > 0) {
          this.props.getRMGradeSelectListByRawMaterial(data.RawMaterialId, false, (res) => {
            this.props.fetchSpecificationDataAPI(data.GradeId, (res) => {
              const { rawMaterialNameSelectList, gradeSelectList, rmSpecification } = this.props
              const materialNameObj = rawMaterialNameSelectList && rawMaterialNameSelectList.find((item) => item.Value === data.RawMaterialId,)
              const gradeObj = gradeSelectList && gradeSelectList.find((item) => item.Value === data.GradeId)
              const specObj = rmSpecification && rmSpecification.find((item) => item.Text === data.Specification)
              this.setState({
                RawMaterial: { label: materialNameObj.Text, value: materialNameObj.Value, },
                RMGrade: gradeObj !== undefined ? { label: gradeObj.Text, value: gradeObj.Value } : [],
                RMSpec: specObj !== undefined ? { label: specObj.Text, value: specObj.Value, RawMaterialCode: specObj.RawMaterialCode } : [],
                rmCode: specObj !== undefined ? { label: specObj.RawMaterialCode, value: specObj.Value } : [],
              })
            })
          })
        }
      })
    })
    this.props.getRMSpecificationDataList({ GradeId: null }, () => { });
  }

  gradeToggler = () => {
    this.setState({ isOpenGrade: true })
  }

  /**
  * @method closeGradeDrawer
  * @description  used to toggle grade Drawer
  */
  closeGradeDrawer = (e = '') => {
    this.setState({ isOpenGrade: false }, () => {
      const { RawMaterial } = this.state;
      this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, false, res => { });
    })
  }

  specificationToggler = () => {
    this.setState({ isOpenSpecification: true })
  }

  closeSpecDrawer = (e = '') => {
    this.setState({ isOpenSpecification: false }, () => {
      const { RMGrade } = this.state;
      this.props.fetchSpecificationDataAPI(RMGrade.value, res => { });
    })
  }

  categoryToggler = () => {
    this.setState({ isOpenCategory: true })
  }

  closeCategoryDrawer = (e = '') => {
    this.setState({ isOpenCategory: false })
  }

  vendorToggler = () => {
    this.setState({ isOpenVendor: true })
  }

  async closeVendorDrawer(e = '', formData = {}, type) {
    if (type === 'submit') {
      this.setState({ isOpenVendor: false })
      const { costingTypeId } = this.state
      if (costingTypeId !== VBCTypeId) {
        if (this.state.vendorName && this.state.vendorName.length > 0) {
          const res = await getVendorNameByVendorSelectList(RAW_MATERIAL_VENDOR_TYPE, this.state.vendorName)
          let vendorDataAPI = res?.data?.SelectList
          reactLocalStorage?.setObject('vendorData', vendorDataAPI)
        }
        if (Object.keys(formData).length > 0) {
          this.setState({ vendorName: { label: `${formData.VendorName} (${formData.VendorCode})`, value: formData.VendorId }, })
        }
      } else {
        if (this.state.vendorName && this.state.vendorName.length > 0) {
          const res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, this.state.vendorName)
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
  uomToggler = () => {
    this.setState({ isOpenUOM: true })
  }

  closeUOMDrawer = (e = '') => {
    this.setState({ isOpenUOM: false }, () => {
      this.props.getUOMSelectList(() => { })
    })
  }

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false, setDisable: false, isEditBuffer: true })
    if (type === 'submit') {
      this.clearForm('submit')
      this.cancel('submit')
    }
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label, isScrapRateUOM) => {
    const { gradeSelectList, rmSpecification,
      cityList, categoryList, filterCityListBySupplier, rawMaterialNameSelectList,
      UOMSelectList, currencySelectList, plantSelectList, costingSpecifiTechnology, clientSelectList, rmSpecificationList } = this.props;
    const temp = [];
    if (label === 'material') {
      rawMaterialNameSelectList && rawMaterialNameSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'grade') {
      gradeSelectList && gradeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'specification') {
      rmSpecification && rmSpecification.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value, RawMaterialCode: item.RawMaterialCode })
        return null;
      });
      return temp;
    }
    if (label === 'category') {
      categoryList && categoryList.map(item => {
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
    if (label === 'VendorLocation') {
      filterCityListBySupplier && filterCityListBySupplier.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
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
      UOMSelectList && UOMSelectList.map((item) => {
        const accept = AcceptableRMUOM.includes(item.Type)
        if (isScrapRateUOM === true && this.state.UOM?.value === item?.Value) return false
        if (accept === false) return false
        if (item.Value === '0') return false
        temp.push({ label: item.Display, value: item.Value })
        return null
      })
      return temp
    }
    if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'city') {
      filterCityListBySupplier && filterCityListBySupplier.map(item => {
        if (item.Value === '0') return false;
        temp.push({ Text: item.Text, Value: item.Value })
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
    if (label === 'code') {
      rmSpecificationList && rmSpecificationList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.RawMaterialCode, value: item.SpecificationId })
        return null;
      });
      return temp;
    }

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
  clearForm = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      selectedPlants: [],
      vendorName: [],
      vendorLocation: [],
      HasDifferentSource: false,
      sourceLocation: [],
      UOM: [],
      remarks: '',
      isShowForm: false,
      isEditFlag: false,
      IsVendor: false,
      updatedObj: {}
    })
    this.props.getRMDataById('', false, res => { })
    this.props.fetchSpecificationDataAPI(0, () => { })
    this.props.hideForm(type)
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    this.clearForm(type)
  }
  cancelHandler = () => {
    if (this.state.isViewFlag) {
      this.cancel('submit')
    }
    if (Object.keys(this.props.fieldsObj).length !== 0 || this.state.isDropDownChanged || this.state.files.length !== 0) {
      this.setState({ showPopup: true })
    } else {
      this.cancel('submit')
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
  * @method resetForm
  * @description used to Reset form
  */
  resetForm = () => {
    this.clearForm()
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
      this.props.fileUploadRMDomestic(data, (res) => {
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
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {
    const { RawMaterial, RMGrade, RMSpec, Category, selectedPlants, vendorName, VendorCode, HasDifferentSource, sourceLocation, UOM, currency, client, effectiveDate, remarks, RawMaterialID, isEditFlag, files,
      Technology, netCost, costingTypeId, oldDate, singlePlantSelected, DataToChange, DropdownChanged, isDateChange, currencyValue, IsFinancialDataChanged, conditionTableData, FinalBasicRateSelectedCurrency, FinalCutOffBaseCurrency,
      FinalCutOffSelectedCurrency, FinalBasicRateBaseCurrency, FinalScrapRateSelectedCurrency, FinalScrapRateBaseCurrency, FinalForgingScrapCostSelectedCurrency, FinalForgingScrapCostBaseCurrency, FinalMachiningScrapCostSelectedCurrency, FinalMachiningScrapCostBaseCurrency,
      FinalCircleScrapCostSelectedCurrency, FinalCircleScrapCostBaseCurrency, FinalJaliScrapCostSelectedCurrency, FinalJaliScrapCostBaseCurrency, FinalFreightCostSelectedCurrency, FinalFreightCostBaseCurrency, FinalShearingCostSelectedCurrency, FinalShearingCostBaseCurrency,
      FinalBasicPriceSelectedCurrency, FinalBasicPriceBaseCurrency, FinalConditionCostSelectedCurrency, FinalConditionCostBaseCurrency, FinalNetCostSelectedCurrency, FinalNetCostBaseCurrency, showScrapKeys,
      IsApplyHasDifferentUOM, ScrapRateUOM, UOMToScrapUOMRatio, CalculatedFactor, ScrapRatePerScrapUOM, ScrapRatePerScrapUOMConversion, ConversionRatio } = this.state;

    const { fieldsObj, isRMAssociated } = this.props;
    const userDetailsRM = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }


    let scrapRateSelectedCurrency = ''
    let scrapRateBaseCurrency = ''
    let jaliRateSelectedCurrency = ''
    let jaliRateBaseCurrency = ''
    let machiningRateSelectedCurrency = ''
    let machiningRateBaseCurrency = ''

    if (showScrapKeys?.showCircleJali) {

      scrapRateSelectedCurrency = FinalJaliScrapCostSelectedCurrency
      scrapRateBaseCurrency = FinalJaliScrapCostBaseCurrency
      jaliRateSelectedCurrency = FinalCircleScrapCostSelectedCurrency
      jaliRateBaseCurrency = FinalCircleScrapCostBaseCurrency

      if (checkForNull(FinalBasicRateSelectedCurrency) < checkForNull(scrapRateSelectedCurrency) || checkForNull(FinalBasicRateSelectedCurrency) < checkForNull(jaliRateSelectedCurrency)) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap Rate should not be greater than or equal to the basic rate.")
        return false
      }
    } else if (showScrapKeys?.showForging) {

      scrapRateSelectedCurrency = FinalForgingScrapCostSelectedCurrency
      scrapRateBaseCurrency = FinalForgingScrapCostBaseCurrency
      machiningRateSelectedCurrency = FinalMachiningScrapCostSelectedCurrency
      machiningRateBaseCurrency = FinalMachiningScrapCostBaseCurrency

      if (checkForNull(FinalBasicRateSelectedCurrency) < checkForNull(scrapRateSelectedCurrency) || checkForNull(FinalBasicRateSelectedCurrency) < checkForNull(machiningRateSelectedCurrency)) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap Rate should not be greater than or equal to the basic rate.")
        return false
      }
    } else if (showScrapKeys?.showScrap) {

      scrapRateSelectedCurrency = FinalScrapRateSelectedCurrency
      scrapRateBaseCurrency = FinalScrapRateBaseCurrency

      if (checkForNull(FinalBasicRateSelectedCurrency) < checkForNull(scrapRateSelectedCurrency)) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap Rate should not be greater than or equal to the basic rate.")
        return false
      }
    }


    this.setState({ isVendorNameNotSelected: false, isEditBuffer: false })

    let plantArray = []
    // if (costingTypeId === VBCTypeId) {
    plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
    // } else {
    //   selectedPlants && selectedPlants.map((item) => {
    //     plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
    //     return plantArray
    //   })
    // }
    let cbcPlantArray = []
    if (getConfigurationKey().IsCBCApplicableOnPlant && costingTypeId === CBCTypeId) {
      cbcPlantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
    }
    else {
      userDetailsRM?.Plants.map((item) => {
        cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode, })
        return cbcPlantArray
      })
    }
    let sourceLocationValue = (costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : sourceLocation.value)
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: RawMaterialID }
    })
    const formData = {}
    formData.RawMaterialId = RawMaterialID
    formData.IsFinancialDataChanged = isDateChange ? true : false
    formData.CostingTypeId = costingTypeId
    formData.RawMaterial = RawMaterial.value
    formData.RMGrade = RMGrade.value
    formData.RMSpec = RMSpec.value
    formData.Category = Category.value
    formData.TechnologyId = Technology.value// NEED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
    formData.Vendor = (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : ""
    formData.HasDifferentSource = HasDifferentSource
    formData.Source = (costingTypeId !== VBCTypeId && !HasDifferentSource) ? '' : values.Source
    formData.SourceLocation = (costingTypeId !== VBCTypeId && !HasDifferentSource) ? '' : sourceLocation.value
    formData.UOM = UOM.value
    formData.Remark = remarks
    formData.LoggedInUserId = loggedInUserId()
    formData.Plant = costingTypeId === CBCTypeId ? cbcPlantArray : plantArray
    formData.VendorCode = (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VendorCode : ''
    formData.Attachements = isEditFlag ? updatedFiles : files
    formData.Currency = currency.label
    formData.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    formData.IsCutOffApplicable = values.cutOffPriceSelectedCurrency < netCost ? true : false
    formData.RawMaterialCode = values.Code
    formData.IsSendForApproval = false
    formData.VendorPlant = []
    formData.CustomerId = client.value
    formData.RawMaterialEntryType = checkForNull(ENTRY_TYPE_IMPORT)

    formData.CutOffPrice = FinalCutOffSelectedCurrency
    formData.CutOffPriceInINR = FinalCutOffBaseCurrency

    formData.BasicRatePerUOM = FinalBasicRateSelectedCurrency
    formData.BasicRatePerUOMConversion = FinalBasicRateBaseCurrency

    formData.ScrapRate = scrapRateSelectedCurrency
    formData.ScrapRateInINR = scrapRateBaseCurrency

    formData.MachiningScrapRate = machiningRateSelectedCurrency
    formData.MachiningScrapRateInINR = machiningRateBaseCurrency

    formData.RMFreightCost = FinalFreightCostSelectedCurrency
    formData.RawMaterialFreightCostConversion = FinalFreightCostBaseCurrency

    formData.RMShearingCost = FinalShearingCostSelectedCurrency
    formData.RawMaterialShearingCostConversion = FinalShearingCostBaseCurrency

    formData.JaliScrapCost = jaliRateSelectedCurrency
    formData.JaliScrapCostConversion = jaliRateBaseCurrency

    formData.NetLandedCost = FinalNetCostSelectedCurrency
    formData.NetLandedCostConversion = FinalNetCostBaseCurrency

    if (costingTypeId === ZBCTypeId) {
      formData.NetCostWithoutConditionCost = FinalBasicPriceSelectedCurrency
      formData.NetCostWithoutConditionCostConversion = FinalBasicPriceBaseCurrency
      formData.NetConditionCost = FinalConditionCostSelectedCurrency
      formData.NetConditionCostConversion = FinalConditionCostBaseCurrency
    }

    formData.CurrencyExchangeRate = currencyValue
    formData.RawMaterialConditionsDetails = conditionTableData

    formData.IsScrapUOMApply = IsApplyHasDifferentUOM ? true : false
    formData.ScrapUnitOfMeasurementId = this.state.IsApplyHasDifferentUOM === true ? this.state.ScrapRateUOM?.value : ''
    formData.ScrapUnitOfMeasurement = this.state.IsApplyHasDifferentUOM === true ? this.state.ScrapRateUOM?.label : ''
    formData.UOMToScrapUOMRatio = this.state.IsApplyHasDifferentUOM === true ? this.state.UOMToScrapUOMRatio : ''
    formData.CalculatedFactor = this.state.IsApplyHasDifferentUOM === true ? this.state.CalculatedFactor : ''
    formData.ScrapRatePerScrapUOM = this.state.IsApplyHasDifferentUOM === true ? this.state.ScrapRatePerScrapUOM : ''
    formData.ScrapRatePerScrapUOMConversion = this.state.IsApplyHasDifferentUOM === true ? ScrapRatePerScrapUOMConversion : ''

    // CHECK IF CREATE MODE OR EDIT MODE !!!  IF: EDIT  ||  ELSE: CREATE
    if (isEditFlag) {
      const basicPriceSelectedCurrencyTemp = checkForNull(fieldsObj?.BasicRateSelectedCurrency) + checkForNull(fieldsObj?.FreightChargeSelectedCurrency) + checkForNull(fieldsObj?.ShearingCostSelectedCurrency)
      let basicPriceSelectedCurrency
      if (costingTypeId === ZBCTypeId) {
        basicPriceSelectedCurrency = basicPriceSelectedCurrencyTemp
      }
      const netLandedCostSelectedCurrency = checkForNull(basicPriceSelectedCurrencyTemp) + checkForNull(FinalConditionCostSelectedCurrency)

      // CHECK IF THERE IS CHANGE !!!  
      // IF: NO CHANGE  
      if (((files ? JSON.stringify(files) : []) === (DataToChange.FileList ? JSON.stringify(DataToChange.FileList) : [])) && DropdownChanged
        && ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : '')) && ((DataToChange.CutOffPrice ? checkForNull(DataToChange.CutOffPrice) : '') === (values.cutOffPriceSelectedCurrency ? checkForNull(values.cutOffPriceSelectedCurrency) : ''))
        && String(DataToChange.RawMaterialCode) === String(values.Code) && ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values.Source ? String(values.Source) : '-'))
        && ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocationValue ? String(sourceLocationValue) : ''))
        && checkForNull(fieldsObj?.BasicRateSelectedCurrency) === checkForNull(DataToChange?.BasicRatePerUOM) && checkForNull(fieldsObj?.ScrapRateSelectedCurrency) === checkForNull(DataToChange?.ScrapRate)
        && checkForNull(fieldsObj?.ForgingScrapSelectedCurrency) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.MachiningScrapSelectedCurrency) === checkForNull(DataToChange?.MachiningScrapRate) && checkForNull(fieldsObj?.CircleScrapCostSelectedCurrency) === checkForNull(DataToChange?.JaliScrapCostSelectedCurrency)
        && checkForNull(fieldsObj?.JaliScrapCostSelectedCurrency) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.FreightChargeSelectedCurrency) === checkForNull(DataToChange?.RMFreightCost) && checkForNull(fieldsObj?.ShearingCostSelectedCurrency) === checkForNull(DataToChange?.RMShearingCost)
        && checkForNull(basicPriceSelectedCurrency) === checkForNull(DataToChange?.NetCostWithoutConditionCost) && checkForNull(netLandedCostSelectedCurrency) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(FinalConditionCostSelectedCurrency) === checkForNull(DataToChange?.NetConditionCost) &&
        checkForNull(DataToChange?.IsScrapUOMApply) === checkForNull(IsApplyHasDifferentUOM) && checkForNull(DataToChange?.ScrapUnitOfMeasurementId) === checkForNull(ScrapRateUOM?.value) && checkForNull(DataToChange?.UOMToScrapUOMRatio) === checkForNull(UOMToScrapUOMRatio) &&
        checkForNull(DataToChange?.CalculatedFactor) === checkForNull(CalculatedFactor) && checkForNull(DataToChange?.ScrapRatePerScrapUOM) === checkForNull(ScrapRatePerScrapUOM) && checkForNull(DataToChange?.UOMToScrapUOMRatio) === checkForNull(ConversionRatio) &&
        checkForNull(DataToChange?.CalculatedFactor) === checkForNull(CalculatedFactor) && checkForNull(DataToChange?.ScrapRatePerScrapUOM) === checkForNull(ScrapRatePerScrapUOM)) {
        this.setState({ isEditBuffer: true })
        Toaster.warning('Please change data to send RM for approval')
        return false
      }
      //  ELSE: CHANGE
      else {
        //  IF: NEE TO UPDATE EFFECTIVE DATE
        if (IsFinancialDataChanged || isRMAssociated) {
          if (!isDateChange || (DayTime(oldDate).format("DD/MM/YYYY") === DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ isEditBuffer: true })
            Toaster.warning('Please update the effective date')
            return false
          }
        }
      }
    }

    //  IF: APPROVAL FLOW
    if (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) {
      formData.IsSendForApproval = true
      this.setState({ approveDrawer: true, approvalObj: formData })
    }
    //  ELSE: NO APPROVAL FLOW
    else {
      if (isEditFlag) {
        formData.IsSendForApproval = false
        this.props.updateRMAPI(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
            this.clearForm('submit')
          }
        })
        this.setState({ updatedObj: formData })
      } else {
        this.props.createRM(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.MATERIAL_ADD_SUCCESS)
            this.clearForm('submit')
            this.cancel('submit')
          }
        })
      }
    }

  }

  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
    this.commonFunction(newValue ? newValue.value : '')
  }

  conditionToggle = () => {
    this.setState({ isOpenConditionDrawer: true })
  }

  openAndCloseAddConditionCosting = (type, data = this.state.conditionTableData) => {
    const { initialConfiguration } = this.props
    if (type === 'save') {
      this.setState({ IsFinancialDataChanged: true })
    }
    const sumBaseCurrency = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostConversion), 0);
    const sumSelectedCurrency = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
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
      // NetLandedCostINR: netLandedCostINR,
      FinalNetCostBaseCurrency: netLandedCostINR,
      FinalNetCostSelectedCurrency: netLandedCostSelectedCurrency,
    })
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, isRMAssociated, t } = this.props;
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification, isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, isViewFlag, setDisable, costingTypeId, CostingTypePermission, disableSendForApproval,
      isOpenConditionDrawer, conditionTableData, BasicPriceINR, FinalBasicPriceSelectedCurrency, FinalBasicPriceBaseCurrency, showScrapKeys, isDisabled, isCodeDisabled, toolTipTextObject } = this.state;

    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        this.setState({ inputLoader: true })
        let res
        if (costingTypeId === VBCTypeId && resultInput) {
          res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        }
        else {
          res = await getVendorNameByVendorSelectList(RAW_MATERIAL_VENDOR_TYPE, resultInput)
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

    const onPressHasDifferentUOM = () => {
      this.setState({ IsApplyHasDifferentUOM: !this.state.IsApplyHasDifferentUOM })
    }

    const labelForScrapRate = () => {
      let labelSelectedCurrency = labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (this.state.currency?.label ? this.state.currency?.label : 'Currency'))
      let labelBaseCurrency = labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))
      if (showScrapKeys?.showCircleJali) {
        labelSelectedCurrency = labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (this.state.currency?.label ? this.state.currency?.label : 'Currency'))
        labelBaseCurrency = labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))
      } else if (showScrapKeys?.showForging) {
        labelSelectedCurrency = labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (this.state.currency?.label ? this.state.currency?.label : 'Currency'))
        labelBaseCurrency = labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))
      } else if (showScrapKeys?.showScrap) {
        labelSelectedCurrency = labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (this.state.currency?.label ? this.state.currency?.label : 'Currency'))
        labelBaseCurrency = labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))
      }
      return { labelSelectedCurrency: labelSelectedCurrency, labelBaseCurrency: labelBaseCurrency }
    }

    return (
      <>
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    {(this.state.isLoader || this.state.finalApprovalLoader) && <LoaderCustom customClass="add-page-loader" />}
                    <div className="row">
                      <div className="col-md-6">
                        <h2>
                          {isViewFlag ? "View" : isEditFlag ? "Update" : "Add"} Raw Material (Import)
                          {!isViewFlag && <TourWrapper
                            buttonSpecificProp={{ id: "Add_RM_Import_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t, {
                                showScrap: showScrapKeys?.showScrap,
                                showForging: showScrapKeys?.showForging,
                                showCircleJali: showScrapKeys?.showCircleJali,
                                isRMAssociated: isRMAssociated,
                                isEditFlag: isEditFlag,
                                showSendForApproval: !this.state.isFinalApprovar,
                                hasSource: (costingTypeId === ZBCTypeId),
                                plantField: (costingTypeId === ZBCTypeId),
                                CBCTypeField: (costingTypeId === CBCTypeId),

                                destinationField: ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)),
                                sourceField: ((this.state.HasDifferentSource ||
                                  costingTypeId === VBCTypeId))
                              }).ADD_RAW_MATERIAL_IMPORT
                            }} />}
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
                            {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="Add_rm_import_zero_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="Add_rm_import_vendor_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                              <span>Vendor Based</span>
                            </Label>}
                            {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="Add_rm_import_customer_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                          </Col>                        </Row>
                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Raw Material:"}</h5>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
                              type="text"
                              name="TechnologyId"
                              component={searchableSelect}
                              placeholder={"Technology"}
                              options={this.renderListing("technology")}
                              validate={this.state.Technology == null || this.state.Technology.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleTechnologyChange}
                              valueDescription={this.state.Technology}
                              disabled={isEditFlag || isViewFlag}
                            />
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialId"
                                  type="text"
                                  label="Name"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("material")}
                                  validate={this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleRMChange}
                                  valueDescription={this.state.RawMaterial}
                                  disabled={isEditFlag || isViewFlag || isDisabled}
                                  isClearable={true}
                                />
                              </div>
                              {(!isEditFlag) && (
                                <Button
                                  id="addRMImport_RMToggle"
                                  onClick={this.rmToggler}
                                  className={"right"}
                                  variant="plus-icon-square"
                                />
                              )}
                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialGradeId"
                                  type="text"
                                  label="Grade"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("grade")}
                                  validate={
                                    this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleGradeChange}
                                  valueDescription={this.state.RMGrade}
                                  disabled={isEditFlag || isViewFlag || isDisabled}
                                />
                              </div>

                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialSpecificationId"
                                  type="text"
                                  label="Specification"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("specification")}
                                  validate={this.state.RMSpec == null || this.state.RMSpec.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleSpecChange}
                                  valueDescription={this.state.RMSpec}
                                  disabled={isEditFlag || isViewFlag || isDisabled}
                                />
                              </div>

                            </div>
                          </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <TooltipCustom id={'category'} tooltipText="Category will come here like CutToFit, CutToLength." />
                                <Field
                                  name="CategoryId"
                                  type="text"
                                  label="Category"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("category")}
                                  validate={this.state.Category == null || this.state.Category.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleCategoryChange}
                                  valueDescription={this.state.Category}
                                  disabled={isEditFlag || isViewFlag}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <Field
                              label={`Code`}
                              name={'Code'}
                              type="text"
                              component={searchableSelect}
                              placeholder={'Select'}
                              options={this.renderListing("code")}
                              validate={this.state.rmCode == null || (this.state.rmCode.length === 0 && !isCodeDisabled) ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleCodeChange}
                              disabled={isEditFlag || isViewFlag || isCodeDisabled}
                              isClearable={true}
                              valueDescription={this.state.rmCode}
                            />
                          </Col>

                          {((costingTypeId === ZBCTypeId && !initialConfiguration.IsMultipleUserAllowForApproval) && (
                            <Col md="3">
                              <Field
                                label="Plant (Code)"
                                name="SourceSupplierPlantId"
                                placeholder={"Select"}
                                title={showDataOnHover(this.state.selectedPlants)}
                                selection={
                                  this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                                options={this.renderListing("plant")}
                                selectionChanged={this.handleSourceSupplierPlant}
                                validate={
                                  this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                                required={true}
                                optionValue={(option) => option.Value}
                                optionLabel={(option) => option.Text}
                                component={renderMultiSelectField}
                                mendatory={true}
                                disabled={isEditFlag || isViewFlag}
                                className="multiselect-with-border"
                              />
                            </Col>)
                          )}
                          {
                            ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) || initialConfiguration.IsMultipleUserAllowForApproval) &&
                            <Col md="3">
                              <Field
                                label={costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
                                name="DestinationPlant"
                                placeholder={"Select"}
                                options={this.renderListing("singlePlant")}
                                handleChangeDescription={this.handleSinglePlant}
                                validate={this.state.singlePlantSelected == null || this.state.singlePlantSelected.length === 0 ? [required] : []}
                                required={true}
                                component={searchableSelect}
                                valueDescription={this.state.singlePlantSelected}
                                mendatory={true}
                                className="multiselect-with-border"
                                disabled={isEditFlag || isViewFlag}
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
                        </Row>
                        <Row>
                          {costingTypeId !== CBCTypeId && (
                            <>
                              <Col md="12" className="filter-block">
                                <div className=" flex-fills mb-2 pl-0 d-flex justify-content-between align-items-center">
                                  <h5>{"Vendor:"}</h5>
                                  {costingTypeId !== VBCTypeId && (
                                    <label id="addRMImport_HasDifferentSource"
                                      className={`custom-checkbox w-auto mb-0 ${costingTypeId === VBCTypeId ? "disabled" : ""
                                        }`}
                                      onChange={this.onPressDifferentSource}
                                    >
                                      Has Difference Source?
                                      <input
                                        type="checkbox"
                                        checked={this.state.HasDifferentSource}
                                        disabled={(costingTypeId === VBCTypeId || isViewFlag) ? true : false}
                                      />
                                      <span
                                        className=" before-box"
                                        checked={this.state.HasDifferentSource}
                                        onChange={this.onPressDifferentSource}
                                      />
                                    </label>
                                  )}
                                </div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{"Vendor (Code)"}<span className="asterisk-required">*</span></label>
                                <div className="d-flex justify-space-between align-items-center async-select">
                                  <div id="AddRMImport_Vendor" className="fullinput-icon p-relative">
                                    {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="DestinationSupplierId"
                                      ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={filterList}
                                      onChange={(e) => this.handleVendorName(e)}
                                      value={this.state.vendorName}
                                      placeholder={(isEditFlag || isViewFlag || this.state.inputLoader) ? '-' : "Select"}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                      isDisabled={isEditFlag || isViewFlag}
                                      onFocus={() => onFocus(this)}
                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                    />

                                  </div>
                                  {!isEditFlag && (<Button
                                    id="addRMImport_vendorToggle"
                                    onClick={this.vendorToggler}
                                    className={"right"}
                                    variant="plus-icon-square"
                                  />)}
                                </div>
                                {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help'>This field is required.</div>}
                              </Col>
                            </>
                          )}
                          {(this.state.HasDifferentSource ||
                            costingTypeId === VBCTypeId) && (
                              <>
                                <Col md="3">
                                  <Field
                                    label={`Source`}
                                    name={"Source"}
                                    type="text"
                                    placeholder={isViewFlag ? "-" : "Enter"}
                                    validate={[acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation]}
                                    component={renderText}
                                    disabled={isViewFlag}
                                    onChange={this.handleSource}
                                    valueDescription={this.state.source}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    name="SourceSupplierCityId"
                                    type="text"
                                    label="Source Location"
                                    component={searchableSelect}
                                    placeholder={isViewFlag ? "-" : "Select"}
                                    options={this.renderListing("SourceLocation")}
                                    handleChangeDescription={this.handleSourceSupplierCity}
                                    valueDescription={this.state.sourceLocation}
                                    disabled={isViewFlag}
                                  />
                                </Col>
                              </>
                            )}
                        </Row>
                        <Row className='UOM-label-container'>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Cost:"}</h5>
                            </div>
                          </Col>
                          <Col md="3" className='dropdown-flex'>
                            <Field
                              name="UnitOfMeasurementId"
                              type="text"
                              label="UOM"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("uom")}
                              validate={this.state.UOM == null || this.state.UOM.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state.UOM}
                              disabled={isEditFlag || isViewFlag}
                            />
                          </Col>
                          <Col md="3" className='dropdown-flex'>
                            <Field
                              name="Currency"
                              type="text"
                              label="Currency"
                              component={searchableSelect}
                              placeholder={"Select"}
                              options={this.renderListing("currency")}
                              validate={this.state.currency == null || this.state.currency.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleCurrency}
                              valueDescription={this.state.currency}
                              disabled={isEditFlag || isViewFlag}
                            >
                              {this.state.showWarning && <WarningMessage dClass="mt-1" message={`${this.state.currency.label} rate is not present in the Exchange Master`} />}
                            </Field>
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
                                  minDate={this.state.minEffectiveDate}
                                  autoComplete={'off'}
                                  required={true}
                                  changeHandler={(e) => {

                                  }}
                                  component={renderDatePicker}
                                  className="form-control"
                                  disabled={isViewFlag || !this.state.IsFinancialDataChanged}
                                  placeholder="Select Date"
                                />
                              </div>
                            </div>
                          </Col>

                          <>
                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Cut Off Price ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                name={"cutOffPriceSelectedCurrency"}
                                type="text"
                                placeholder={(isViewFlag || !this.state.IsFinancialDataChanged) ? '-' : "Enter"}
                                validate={[positiveAndDecimalNumber, maxLength15, number]}
                                component={renderTextInputField}
                                required={false}
                                disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                className=" "
                                customClassName=" withBorder"
                                onChange={this.handleCutOfChange}
                              />
                            </Col>

                            <Col md="3">
                              <TooltipCustom disabledIcon={true} id="rm-cut-off-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextCutOffBaseCurrency} />
                              <Field
                                label={labelWithUOMAndCurrency("Cut Off Price ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"cutOffPriceBaseCurrency"}
                                type="text"
                                id="rm-cut-off-base-currency"
                                placeholder={(isViewFlag || !this.state.IsFinancialDataChanged) ? '-' : "Enter"}
                                validate={[positiveAndDecimalNumber, maxLength15, number]}
                                component={renderTextInputField}
                                required={false}
                                disabled={true}
                                className=" "
                                customClassName=" withBorder"
                                onChange={this.handleCutOfChange}
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Basic Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                name={"BasicRateSelectedCurrency"}
                                type="text"
                                placeholder={isEditFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <TooltipCustom disabledIcon={true} id="rm-basic-rate-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextBasicRateBaseCurrency} />
                              <Field
                                label={labelWithUOMAndCurrency("Basic Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                name={"BasicRateBaseCurrency"}
                                id="rm-basic-rate-base-currency"
                                type="text"
                                placeholder={isViewFlag ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={false}
                                disabled={true}
                                maxLength="15"
                                className=" "
                                customClassName=" withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <div className="mt-4">
                                <span className="d-inline-block mt15">
                                  <label
                                    className={`custom-checkbox mb-0`}
                                    onChange={onPressHasDifferentUOM}
                                  >
                                    Has Different Scrap UOM ?
                                    <input
                                      type="checkbox"
                                      checked={this.state.IsApplyHasDifferentUOM}
                                      disabled={(isViewFlag || (isEditFlag && isRMAssociated)) ? true : false}
                                    />
                                    <span
                                      className=" before-box"
                                      checked={this.state.IsApplyHasDifferentUOM}
                                      onChange={onPressHasDifferentUOM}
                                    />
                                  </label>
                                </span>
                              </div>
                            </Col>
                            {this.state.IsApplyHasDifferentUOM &&
                              <Col md="3" className='dropdown-flex'>
                                <Field
                                  label="Scrap Rate UOM"
                                  name="ScrapRateUOM"
                                  type="text"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("uom", true)}
                                  validate={!this.state.ScrapRateUOM?.value || this.state.ScrapRateUOM?.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleSelectConversion}
                                  valueDescription={this.state.ScrapRateUOM}
                                  disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                />
                              </Col>}
                            {this.state.IsApplyHasDifferentUOM && this.state.ScrapRateUOM?.value && <>
                              <Col md="3">
                                <Field
                                  label={labelWithUOMAndUOM("Conversion Ratio", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', this.state.UOM?.label ? this.state.UOM?.label : 'UOM')}
                                  name={"UOMToScrapUOMRatio"}
                                  type="text"
                                  placeholder={isViewFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  className=""
                                  maxLength="15"
                                  customClassName=" withBorder"
                                  disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                />
                              </Col>
                              <Col md="3">
                                <TooltipCustom disabledIcon={true} id="conversion-factor-base-currency" width={'400px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextCalculatedFactor} />
                                <Field
                                  label={labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label ? this.state.UOM?.label : 'UOM', this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM')}
                                  name={"CalculatedFactor"}
                                  id="conversion-factor-base-currency"
                                  type="text"
                                  placeholder={isViewFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={false}
                                  className=""
                                  maxLength="15"
                                  customClassName=" withBorder"
                                  disabled={true}
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  label={labelForScrapRate()?.labelSelectedCurrency}
                                  name={"ScrapRatePerScrapUOM"}
                                  type="text"
                                  placeholder={isViewFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  className=""
                                  maxLength="15"
                                  customClassName=" withBorder"
                                  disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                />
                              </Col>
                              <Col md="3">
                                <TooltipCustom disabledIcon={true} id="scrap-rate-per-scrap-uom-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextScrapRatePerScrapUOMBaseCurrency} />
                                <Field
                                  label={labelForScrapRate()?.labelBaseCurrency}
                                  name={"ScrapRatePerScrapUOMBaseCurrency"}
                                  id="scrap-rate-per-scrap-uom-base-currency"
                                  type="text"
                                  placeholder={isViewFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={false}
                                  className=""
                                  maxLength="15"
                                  customClassName=" withBorder"
                                  disabled={true}
                                />
                              </Col></>}

                            {showScrapKeys?.showScrap &&
                              <>
                                <Col md="3">
                                  {this.state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="rm-forging-selected-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextScrapCostSelectedCurrency} />}
                                  <Field
                                    label={labelWithUOMAndCurrency("Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"ScrapRateSelectedCurrency"}
                                    type="text"
                                    id="rm-forging-selected-currency"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={this.state.IsApplyHasDifferentUOM ? false : true}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    // onChange={this.handleScrapRate}
                                    disabled={isViewFlag || this.state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                  />
                                </Col >
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-scrap-cost-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextScrapCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"ScrapRateBaseCurrency"}
                                    type="text"
                                    id="rm-scrap-cost-base-currency"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    // onChange={this.handleScrapRate}
                                    disabled={true}
                                  />
                                </Col>
                              </>}
                            {
                              showScrapKeys?.showForging &&
                              <>
                                <Col md="3">
                                  {this.state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="rm-forging-selected-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextForgingScrapCostSelectedCurrency} />}
                                  <Field
                                    id="rm-forging-selected-currency"
                                    label={labelWithUOMAndCurrency("Forging Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"ForgingScrapSelectedCurrency"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={isViewFlag || this.state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                  />
                                </Col>

                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-forging-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextForgingScrapCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Forging Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"ForgingScrapBaseCurrency"}
                                    id="rm-forging-base-currency"
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={true}
                                  />
                                </Col>



                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Machining Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"MachiningScrapSelectedCurrency"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                  />
                                </Col>
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-machining-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextMachiningScrapCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Machining Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"MachiningScrapBaseCurrency"}
                                    id="rm-machining-base-currency"
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={true}
                                  />
                                </Col>
                              </>
                            }
                            {
                              showScrapKeys?.showCircleJali &&
                              <>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Circle Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"CircleScrapCostSelectedCurrency"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={false}
                                    disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-circle-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextCircleScrapCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Circle Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"CircleScrapCostBaseCurrency"}
                                    id="rm-circle-base-currency"
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={false}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>



                                <Col md="3">
                                  {this.state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="jali-scrap-cost-selected-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextJaliScrapCostSelectedCurrency} />}
                                  <Field
                                    label={labelWithUOMAndCurrency("Jali Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"JaliScrapCostSelectedCurrency"}
                                    type="text"
                                    id="jali-scrap-cost-selected-currency"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={true}
                                    disabled={isViewFlag || this.state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col >
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-jali-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextJaliScrapCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Jali Scrap Rate ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"JaliScrapCostBaseCurrency"}
                                    type="text"
                                    id="rm-jali-base-currency"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={false}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                              </>
                            }


                            {IsShowFreightAndShearingCostFields() && (
                              <>
                                <Col md="3">{/* //RE */}
                                  <Field
                                    label={labelWithUOMAndCurrency("Freight Cost ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"FreightChargeSelectedCurrency"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                  />
                                </Col>
                                <Col md="3">{/* //RE */}
                                  <TooltipCustom disabledIcon={true} id="rm-freight-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextFreightCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Freight Cost ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"FreightChargeBaseCurrency"}
                                    id="rm-freight-base-currency"
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </Col>



                                <Col md="3">{/* //RE */}
                                  <Field
                                    label={labelWithUOMAndCurrency("Shearing Cost ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"ShearingCostSelectedCurrency"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    disabled={isViewFlag || (isEditFlag && isRMAssociated)}
                                  />
                                </Col>
                                <Col md="3">{/* //RE */}
                                  <TooltipCustom disabledIcon={true} id="rm-shearing-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextShearingCostBaseCurrency} />
                                  <Field
                                    label={labelWithUOMAndCurrency("Shearing Cost ", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, reactLocalStorage.getObject("baseCurrency"))}
                                    name={"ShearingCostBaseCurrency"}
                                    id="rm-shearing-base-currency"
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    disabled={true}
                                  />
                                </Col>
                              </>)}




                            {
                              initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && <>
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-basic-price-currency" width={'350px'} tooltipText={this.basicPriceTitle()?.toolTipTextBasicPriceSelectedCurrency} />
                                  <Field
                                    label={`Basic Price (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                    name={"BasicPriceSelectedCurrency"}
                                    id="rm-basic-price-currency"
                                    type="text"
                                    placeholder={isEditFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-basic-price-base" width={'350px'} tooltipText={this.basicPriceTitle()?.toolTipTextBasicPriceBaseCurrency} />
                                  <Field
                                    label={`Basic Price (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={"BasicPriceBaseCurrency"}
                                    id="rm-basic-price-base"
                                    type="text"
                                    placeholder={isEditFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>


                                <Col md="3">
                                  <Field
                                    label={`Condition Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                    name={"FinalConditionCostSelectedCurrency"}
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

                                <Col md="3">
                                  <div className='d-flex align-items-center'>
                                    <div className='w-100'>
                                      <TooltipCustom disabledIcon={true} id="rm-condition-cost-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextConditionCostBaseCurrency} />
                                      <Field
                                        label={`Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                        name={"FinalConditionCostBaseCurrency"}
                                        id="rm-condition-cost-base-currency"
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
                                      id="addRMImport_condition"
                                      onClick={this.conditionToggle}
                                      className={"right mt-0 mb-2"}
                                      variant={(this.state.currency.label && this.state.FinalBasicRateSelectedCurrency && this.state.FinalBasicRateBaseCurrency) ? `plus-icon-square` : `blurPlus-icon-square`}
                                      disabled={!(this.state.currency.label && this.state.FinalBasicRateSelectedCurrency && this.state.FinalBasicRateBaseCurrency)}
                                    />
                                  </div>
                                </Col>



                              </>
                            }
                            {
                              this.state.showCurrency && <>
                                <Col md="3">
                                  <TooltipCustom disabledIcon={true} id="rm-net-cost-currency" tooltipText={this.netCostTitle()?.toolTipTextNetCostSelectedCurrency} />
                                  <Field
                                    label={`Net Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                    name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostSelectedCurrency"}
                                    id="rm-net-cost-currency"
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
                                  <TooltipCustom disabledIcon={true} id="rm-net-cost-base" tooltipText={this.netCostTitle()?.toolTipTextNetCostBaseCurrency} />
                                  <Field
                                    label={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`}
                                    name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostBaseCurrency"}
                                    type="text"
                                    id="rm-net-cost-base"
                                    placeholder={"-"}
                                    validate={[]}
                                    component={renderTextInputField}
                                    required={false}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder mb-0"
                                  />
                                </Col>
                              </>
                            }
                          </>
                        </Row >

                        <Row>
                          <Col md="12" className="filter-block">
                            <div className=" flex-fills mb-2 pl-0">
                              <h5>{"Remarks & Attachments:"}</h5>
                            </div>
                          </Col>
                          <Col md="6">
                            <Field
                              label={"Remarks"}
                              name={`Remark`}
                              placeholder={isViewFlag ? '-' : "Type here..."}
                              value={this.state.remarks}
                              className=""
                              customClassName=" textAreaWithBorder"
                              onChange={this.handleMessageChange}
                              validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                              component={renderTextAreaField}
                              // maxLength="5000"
                              rows="10"
                              disabled={isViewFlag}

                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files(Upload up to {getConfigurationKey().MaxMasterFilesToUpload} files)
                            </label >
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit reached.
                            </div>
                            <div id="AddRMImport_UploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
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
                                }}
                                classNames="draper-drop"
                                disabled={isViewFlag}
                              />
                            </div>
                          </Col >
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

                                      {!isViewFlag && <img
                                        className="float-right"
                                        alt={""}
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
                          {this.state.showWarning && <WarningMessage dClass="mr-2" message={`Net conversion cost is 0, Do you wish to continue.`} />}
                          <Button
                            id="addRMImport_cancel"
                            className="mr-2"
                            variant={"cancel-btn"}
                            disabled={setDisable}
                            onClick={this.cancelHandler}
                            icon={"cancel-icon"}
                            buttonName={"Cancel"}
                          />
                          {!isViewFlag && <>
                            {(!isViewFlag && (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration.IsMasterApprovalAppliedConfigure) || (initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !CostingTypePermission) ?
                              <Button
                                id="addRMImport_sendForApproval"
                                type="submit"
                                className="approval-btn mr5"
                                disabled={isViewFlag || setDisable || disableSendForApproval}
                                onClick={() => scroll.scrollToTop()}
                                icon={"send-for-approval"}
                                buttonName={"Send For Approval"}
                              />
                              :
                              <Button
                                id="addRMImport_updateSave"
                                type="submit"
                                className="mr5"
                                disabled={isViewFlag || setDisable || disableSendForApproval}
                                icon={"save-icon"}
                                buttonName={isEditFlag ? "Update" : "Save"}
                              />
                            }
                          </>}
                        </div>
                      </Row>
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
            isRMDrawerOpen && (
              <AddSpecification
                isOpen={isRMDrawerOpen}
                closeDrawer={this.closeRMDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
                AddAccessibilityRMANDGRADE={
                  this.props.AddAccessibilityRMANDGRADE
                }
                EditAccessibilityRMANDGRADE={
                  this.props.EditAccessibilityRMANDGRADE
                }
              />
            )
          }
          {
            isOpenGrade && (
              <AddGrade
                isOpen={isOpenGrade}
                closeDrawer={this.closeGradeDrawer}
                isEditFlag={false}
                RawMaterial={this.state.RawMaterial}
                anchor={"right"}
              />
            )
          }
          {
            isOpenSpecification && (
              <AddSpecification
                isOpen={isOpenSpecification}
                closeDrawer={this.closeSpecDrawer}
                isEditFlag={false}
                ID={""}
                anchor={"right"}
                AddAccessibilityRMANDGRADE={
                  this.props.AddAccessibilityRMANDGRADE
                }
                EditAccessibilityRMANDGRADE={
                  this.props.EditAccessibilityRMANDGRADE
                }
                Technology={this.state.Technology.value}
              />
            )
          }
          {
            isOpenCategory && (
              <AddCategory
                isOpen={isOpenCategory}
                closeDrawer={this.closeCategoryDrawer}
                isEditFlag={false}
                ID={""}
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
                isRM={true}
                IsVendor={this.state.IsVendor}
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
              basicRate={BasicPriceINR}
              basicRateCurrency={FinalBasicPriceSelectedCurrency}
              basicRateBase={FinalBasicPriceBaseCurrency}
              ViewMode={((isEditFlag && isRMAssociated) || isViewFlag)}
              isFromMaster={true}
              currency={this.state.currency}
              currencyValue={this.state.currencyValue}
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
                masterId={RM_MASTER_ID}
                type={'Sender'}
                anchor={"right"}
                approvalObj={this.state.approvalObj}
                isBulkUpload={false}
                IsImportEntry={true}
                UOM={this.state.UOM}
                costingTypeId={this.state.costingTypeId}
                levelDetails={this.state.levelDetails}
                showForgingMachiningScrapCost={this.state.showForgingMachiningScrapCost}
                showExtraCost={this.state.showExtraCost}
                Technology={this.state.Technology}
                showScrapKeys={showScrapKeys}
                toolTipTextObject={this.state.toolTipTextObject}
                currency={this.state.currency}
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
  const { comman, material, auth, costing, client } = state;
  const fieldsObj = selector(state, 'BasicRate', 'FreightChargeSelectedCurrency', 'ShearingCostSelectedCurrency', 'ScrapRateSelectedCurrency', 'CircleScrapCostSelectedCurrency', 'JaliScrapCostSelectedCurrency', 'ForgingScrapSelectedCurrency', 'MachiningScrapSelectedCurrency', 'EffectiveDate', 'Remark', 'BasicRateSelectedCurrency', 'ScrapRateSelectedCurrency', 'cutOffPriceSelectedCurrency', 'UOMToScrapUOMRatio', 'ScrapRatePerScrapUOM');

  const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
    supplierSelectList, filterPlantList, filterCityListBySupplier, cityList, technologyList,
    categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList,
    currencySelectList, plantSelectList } = comman;

  const { initialConfiguration, userMasterLevelAPI } = auth;
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;
  const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList,
    gradeSelectList, vendorListByVendorType, rmSpecificationList } = material;

  let initialValues = {};
  if (rawMaterialDetails && rawMaterialDetails !== undefined) {
    initialValues = {
      Source: rawMaterialDetails.Source,
      BasicRate: rawMaterialDetails.BasicRatePerUOM,
      BasicRateSelectedCurrency: rawMaterialDetails.BasicRateSelectedCurrency,
      ScrapRateBaseCurrency: rawMaterialDetails.ScrapRateBaseCurrency,
      ScrapRateSelectedCurrency: rawMaterialDetails.ScrapRateSelectedCurrency,
      NetLandedCost: rawMaterialDetails.NetLandedCost,
      Remark: rawMaterialDetails.Remark,
    }
  }

  return {
    uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification,
    plantList, supplierSelectList, cityList, technologyList, categoryList, rawMaterialDetails,
    filterPlantListByCity, filterCityListBySupplier, rawMaterialDetailsData, initialValues,
    fieldsObj, filterPlantListByCityAndSupplier, rawMaterialNameSelectList, gradeSelectList,
    filterPlantList, UOMSelectList, vendorListByVendorType, currencySelectList, plantSelectList,
    initialConfiguration, costingSpecifiTechnology, clientSelectList, userMasterLevelAPI, rmSpecificationList
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  createRM,
  getRawMaterialCategory,
  fetchSupplierCityDataAPI,
  fetchGradeDataAPI,
  fetchSpecificationDataAPI,
  getRMDataById,
  getCityBySupplier,
  getPlantByCity,
  getPlantByCityAndSupplier,
  updateRMAPI,
  fetchRMGradeAPI,
  getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial,
  getPlantBySupplier,
  getUOMSelectList,
  fileUploadRMDomestic,
  getCurrencySelectList,
  getPlantSelectListByType,
  getExchangeRateByCurrency,
  checkAndGetRawMaterialCode,
  checkFinalUser,
  getCityByCountry,
  getAllCity,
  getCostingSpecificTechnology,
  getClientSelectList,
  getUsersMasterLevelAPI,
  getVendorNameByVendorSelectList,
  getRMSpecificationDataAPI,
  getRMSpecificationDataList
})(reduxForm({
  form: 'AddRMImport',
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation(['RawMaterialMaster', 'MasterLabels'])(AddRMImport)),
)
