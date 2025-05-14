import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, getCodeBySplitting, positiveAndDecimalNumber, maxLength15, acceptAllExceptSingleSpecialCharacter, maxLength70, maxLength512, checkForDecimalAndNull, checkForNull, decimalLengthsix, number, hashValidation, maxLength10 } from "../../../helper/validation";
import { renderText, renderTextInputField, searchableSelect, renderMultiSelectField, renderTextAreaField, focusOnError, renderDatePicker, } from '../../layout/FormInputs'
import { ASSEMBLY, AcceptableRMUOM, LOGISTICS } from '../../../config/masterData'
import {
  getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getSupplierList, getUOMSelectList, fetchSupplierCityDataAPI,
  getPlantSelectListByType, getCityByCountry, getAllCity, getVendorNameByVendorSelectList
} from '../../../actions/Common'
import {
  createRM, getRMDataById, updateRMAPI, getRawMaterialNameChild, getRMGradeSelectListByRawMaterial,
  fileUploadRMDomestic, fileUpdateRMDomestic, checkAndGetRawMaterialCode, getRMSpecificationDataAPI, getRMSpecificationDataList
} from '../actions/Material'
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message'
import { loggedInUserId, getConfigurationKey, userDetails, } from '../../../helper/auth'
import AddSpecification from './AddSpecification'
import AddGrade from './AddGrade'
import AddCategory from './AddCategory'
import AddUOM from '../uom-master/AddUOM'
import AddVendorDrawer from '../supplier-master/AddVendorDrawer'
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import 'react-datepicker/dist/react-datepicker.css'
import { FILE_URL, ZBC, RM_MASTER_ID, EMPTY_GUID, SPACEBAR, ZBCTypeId, VBCTypeId, CBCTypeId, searchCount, ENTRY_TYPE_DOMESTIC, VBC_VENDOR_TYPE, RAW_MATERIAL_VENDOR_TYPE } from '../../../config/constants'
import DayTime from '../../common/DayTimeWrapper'
import TooltipCustom from '../../common/Tooltip';
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png'
import { CheckApprovalApplicableMaster, IsShowFreightAndShearingCostFields, labelWithUOMAndUOM, onFocus, showDataOnHover, showRMScrapKeys, userTechnologyDetailByMasterId } from '../../../helper';
import MasterSendForApproval from '../MasterSendForApproval'
import { animateScroll as scroll } from 'react-scroll';
import AsyncSelect from 'react-select/async';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import { labelWithUOMAndCurrency } from '../../../helper';
import { getClientSelectList, } from '../actions/Client';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import WarningMessage from '../../common/WarningMessage';
import Button from '../../layout/Button';
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import { debounce } from 'lodash';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query';

const selector = formValueSelector('AddRMDomestic')

const allInputFieldsName = ['TechnologyId',
  'RawMaterialId',
  'RawMaterialGradeId',
  'RawMaterialSpecificationId',
  'CategoryId',
  'SourceSupplierPlantId',
  'DestinationPlant',
  "UnitOfMeasurementId",
  "cutOffPrice",
  "BasicRateBaseCurrency",
  "ScrapRateBaseCurrency",
  "ForgingScrap",
  "MachiningScrap",
  "CircleScrapCost",
  "JaliScrapCost",
  "FreightCharge",
  "EffectiveDate",
  "clientName"];

class AddRMDomestic extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.state = {
      isEditFlag: false,
      isViewFlag: this.props?.data?.isViewFlag ? true : false,

      RawMaterialID: EMPTY_GUID,
      client: [],
      RawMaterial: [],
      RMGrade: [],
      RMSpec: [],
      Category: [],
      Technology: [],
      selectedPlants: [],

      vendorName: [],
      VendorCode: '',
      vendorLocation: [],
      isVendorNameNotSelected: false,
      updateAsyncDropdown: false,

      HasDifferentSource: false,
      sourceLocation: [],

      UOM: [],
      effectiveDate: '',
      oldDate: '',
      minEffectiveDate: '',
      remarks: '',

      isShowForm: false,
      IsVendor: false,
      files: [],
      errors: [],
      nameDrawer: [],
      costingTypeId: ZBCTypeId,
      isRMDrawerOpen: false,
      isOpenGrade: false,
      isOpenSpecification: false,
      isOpenCategory: false,
      isOpenVendor: false,
      isOpenUOM: false,
      finalApprovalLoader: true,
      isVisible: false,
      imageURL: '',
      isLoader: false,
      netLandedCost: '',
      freightCost: '',
      singlePlantSelected: [],
      showLoader: false,
      DropdownChanged: true,
      DataToChange: [],
      isDateChange: false,
      isSourceChange: false,
      source: '',
      approveDrawer: false,
      IsFinancialDataChanged: true,
      approvalObj: {},
      uploadAttachements: true,
      isFinalApprovar: false,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      attachmentLoader: false,
      showErrorOnFocus: false,
      showPopup: false,
      levelDetails: {},
      vendorFilterList: [],
      isDropDownChanged: false,
      CostingTypePermission: false,
      isEditBuffer: false,
      disableSendForApproval: false,
      BasicPrice: '',
      isOpenConditionDrawer: false,
      conditionTableData: [],
      totalConditionCost: '',

      FinalBasicRateBaseCurrency: '',
      FinalBasicPriceBaseCurrency: '',
      NetLandedCostBaseCurrency: '',
      FinalConditionCostBaseCurrency: '',
      FinalScrapRateBaseCurrency: '',
      FinalForgingScrapCostBaseCurrency: '',
      FinalMachiningScrapCostBaseCurrency: '',
      FinalCircleScrapCostBaseCurrency: '',
      FinalJaliScrapCostBaseCurrency: '',
      FinalFreightCostBaseCurrency: '',
      FinalShearingCostBaseCurrency: '',
      toolTipTextObject: {},
      IsApplyHasDifferentUOM: false,
      ScrapRateUOM: [],
      CalculatedFactor: '',
      ConversionRatio: '',
      showTour: false,
      isDisabled: false, // THIS STATE IS USED TO DISABLE NAME, GRADE, SPEC
      isCodeDisabled: false, // THIS STATE IS USED TO DISABLE CODE,
      rmCode: []
    }
  }

  // NOTE :: ALL COST KEYS ARE OF BASE CURRENCY IRRESPECTIVE OF THEIR NAME IN DOMESTIC

  /**
   * @method componentWillMount
   * @description Called before render the component
   */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewFlag)) {
      this.props.getRMGradeSelectListByRawMaterial('', false, (res) => { })
    }
  }

  netCostTitle() {
    const { initialConfiguration } = this.props
    const { costingTypeId } = this.state
    let text = ''
    if (initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      text = `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Price (${reactLocalStorage.getObject("baseCurrency")}) + Condition Cost (${reactLocalStorage.getObject("baseCurrency")})`
    } else {
      text = `Net Cost (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) + ${IsShowFreightAndShearingCostFields() ? `Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) + Shearing Cost (${reactLocalStorage.getObject("baseCurrency")})` : ''}`
    }
    return text
  }

  basicPriceTitle() {
    const { initialConfiguration } = this.props
    const { costingTypeId } = this.state
    if (initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)) {
      return `Basic Price (${reactLocalStorage.getObject("baseCurrency")}) =  Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) + Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) + Shearing Cost (${reactLocalStorage.getObject("baseCurrency")})`
    }
  }

  allFieldsInfoIcon(setData) {
    const { initialConfiguration } = this.props
    const { showScrapKeys, toolTipTextObject } = this.state
    let obj = {
      toolTipTextCutOffBaseCurrency: `Cut Off Price (${reactLocalStorage.getObject("baseCurrency")}) = Cut Off Price (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
      toolTipTextBasicRateBaseCurrency: `Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) = Basic Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
      toolTipTextFreightCostBaseCurrency: `Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) = Freight Cost (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
      toolTipTextShearingCostBaseCurrency: `Shearing Cost (${reactLocalStorage.getObject("baseCurrency")}) = Shearing Cost (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
      toolTipTextConditionCostBaseCurrency: `Condition Cost (${reactLocalStorage.getObject("baseCurrency")}) = Condition Cost (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
      toolTipTextCalculatedFactor: <>{labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} = 1 / {labelWithUOMAndUOM("Calculated Ratio", this.state.ScrapRateUOM?.label, this.state.UOM?.label)}</>,
    }
    if (showScrapKeys?.showCircleJali) {
      obj = {
        ...obj,
        toolTipTextCircleScrapCostBaseCurrency: `Circle Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Circle Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
        toolTipTextJaliScrapCostBaseCurrency: `Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
        toolTipTextJaliScrapCostSelectedCurrency: `Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Calculated Factor (${this.state.UOM?.label ? this.state.UOM?.label : 'UOM'}/${this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM'}) * Jali Scrap Rate (${reactLocalStorage.getObject("baseCurrency")})`,
        toolTipTextJaliScrapCostBaseCurrencyPerOldUOM: <>{labelWithUOMAndCurrency("Jali Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))}</>,
      }
    } else if (showScrapKeys?.showForging) {
      obj = {
        ...obj,
        toolTipTextForgingScrapCostBaseCurrency: `Forging Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Forging Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
        toolTipTextMachiningScrapCostBaseCurrency: `Machining Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Machining Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
        toolTipTextMachiningScrapCostSelectedCurrency: `Machining Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Calculated Factor () * Machining Scrap Rate ()`,
        toolTipTextForgingScrapCostBaseCurrencyPerOldUOM: <>{labelWithUOMAndCurrency("Forging Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))}</>,
      }
    } else if (showScrapKeys?.showScrap) {
      obj = {
        ...obj,
        toolTipTextScrapCostBaseCurrency: `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) * Currency Rate (${reactLocalStorage.getObject("baseCurrency")})`,
        toolTipTextScrapCostSelectedCurrency: `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")}) = Calculated Factor () * Scrap Rate ()`,
        toolTipTextScrapCostBaseCurrencyPerOldUOM: <>{labelWithUOMAndCurrency("Scrap Rate", this.state.UOM?.label, reactLocalStorage.getObject("baseCurrency"))} = {labelWithUOMAndUOM("Calculated Factor", this.state.UOM?.label, this.state.ScrapRateUOM?.label)} * {labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label, reactLocalStorage.getObject("baseCurrency"))}</>,
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
    const { data } = this.props
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    this.props.getUOMSelectList(() => { })
    if ((this.props.data.isEditFlag || this.state.isViewFlag)) {
      this.getDetails(data)
    }

    this.getDetails(data)
    if (!this.state.isViewFlag) {
      this.props.getRawMaterialNameChild(() => { })
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
        this.props.getRMSpecificationDataList({ GradeId: null }, () => { });
      })
    }
    if (!(this.props.data.isEditFlag || data.isViewFlag) && this.state.Technology) {
      this.setState({ inputLoader: true })
      this.props.getRawMaterialCategory((res) => { })
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
      this.props.getClientSelectList(() => { })
      this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
    }
  }

  finalUserCheckAndMasterLevelCheckFunction = (plantId) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewFlag && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), RM_MASTER_ID,null, (res) => {
        setTimeout(() => {
          this.commonFunction(plantId)
        }, 100);
      })
    } else {
      this.setState({ finalApprovalLoader: false })
    }
  }
  setInStateToolTip() {
    const obj = { ...this.state.toolTipTextObject, netCostCurrency: this.netCostTitle(), basicPriceCurrency: this.basicPriceTitle() }
    this.setState({ toolTipTextObject: obj })
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (this.props.fieldsObj !== prevProps.fieldsObj && !this.state.isEditFlag) {
      this.setInStateToolTip()
      this.calculateNetCost()
    }
    if (this.props.fieldsObj !== prevProps.fieldsObj && this.state.isEditFlag && this.state.isEditBuffer) {
      this.setInStateToolTip()
      this.calculateNetCost()
    }
    if ((prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
      this.commonFunction(this.state.selectedPlants[0] && this.state.selectedPlants[0].Value)
    }
  }
  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
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
    if (this.props.initialConfiguration?.IsMasterApprovalAppliedConfigure) {
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

  /**
   * @method handleRMChange
   * @description  used to handle row material selection
   */
  handleRMChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [], rmCode: [], isCodeDisabled: true }, () => {
        const { RawMaterial } = this.state
        this.props.getRMGradeSelectListByRawMaterial(
          RawMaterial.value,
          false,
          (res) => { },
        )
      })
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [], rmCode: [], isCodeDisabled: false })
      this.props.getRMGradeSelectListByRawMaterial('', false, (res) => { })
      this.props.fetchSpecificationDataAPI(0, () => { })
    }
  }

  /**
   * @method handleGradeChange
   * @description  used to handle row material grade selection
   */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue, RMSpec: [], rmCode: [], isCodeDisabled: true }, () => {
        const { RMGrade } = this.state
        this.props.fetchSpecificationDataAPI(RMGrade.value, (res) => { })
      })
    } else {
      this.setState({
        RMGrade: [],
        RMSpec: [],
        isCodeDisabled: false
      })
      this.props.fetchSpecificationDataAPI(0, (res) => { })
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
        let Data = res?.data?.Data
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
   * @method handleCategoryType
   * @description  used to handle category type selection
   */
  handleCategoryType = (e) => {
    this.props.fetchCategoryAPI(e.target.value, (res) => { })
  }

  /**
   * @method handleSourceSupplierPlant
   * @description Used handle vendor plants
   */
  handleSourceSupplierPlant = (e) => {
    this.setState({ selectedPlants: e })
    this.setState({ DropdownChanged: false })
  }

  /**
   * @method handleVendorName
   * @description called
   */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState(
        { vendorName: newValue, isVendorNameNotSelected: false, vendorLocation: [], isDropDownChanged: true },
        () => {
          const { vendorName } = this.state
          const result =
            vendorName && vendorName.label
              ? getCodeBySplitting(vendorName.label)
              : ''
          this.setState({ VendorCode: result })
        },
      )
    } else {
      this.setState({
        vendorName: [],
        vendorLocation: [],
      })
    }
  }
  /**
   * @method handleVendorLocation
   * @description called
   */
  handleVendorLocation = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorLocation: newValue, isDropDownChanged: true })
    } else {
      this.setState({ vendorLocation: [] })
    }
  }

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


  handleCutOffPrice = (newValue) => {

    if (newValue && newValue !== '') {

      this.setState({ isSourceChange: true })

    }

  }

  handleSource = (newValue, actionMeta) => {
    const { isEditFlag, DataToChange } = this.state
    if (newValue && newValue !== '') {
      this.setState({ source: newValue, isSourceChange: true, isDropDownChanged: true })
    }
    if (isEditFlag && (DataToChange.Source !== newValue)) {
      this.setState({ IsFinancialDataChanged: true })
    }
    else if (isEditFlag) {
      this.setState({ IsFinancialDataChanged: false })
    }
  }

  /**
   * @method handleUOM
   * @description called
   */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ UOM: newValue, isDropDownChanged: true, ScrapRateUOM: [] })
    } else {
      this.setState({ UOM: [] })
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

  handleScrapRate = (newValue, actionMeta) => {
    const { fieldsObj } = this.props
    if (checkForNull(newValue.target.value) > checkForNull(fieldsObj.BasicRateBaseCurrency)) {
      Toaster.warning("Scrap rate should not be greater than basic rate")
      return false
    }

    if (this.state.isEditFlag) {
      if (checkForNull(fieldsObj?.ScrapRateBaseCurrency) === checkForNull(this.state.DataToChange.ScrapRate) && checkForNull(this.state.NetLandedCostBaseCurrency) === checkForNull(this.state.DataToChange?.NetLandedCost)

        && checkForNull(this.state.BasicPrice) === checkForNull(this.state.DataToChange?.BasicPrice)) {
        this.setState({ IsFinancialDataChanged: false })
      } else {
        this.setState({ IsFinancialDataChanged: true })

      }

    }
  }

  handleBasicRate = (newValue, actionMeta) => {
    const { fieldsObj } = this.props
    if (checkForNull(newValue.target.value) < checkForNull(fieldsObj?.ScrapRateBaseCurrency)) {
      Toaster.warning("Scrap rate should not be greater than basic rate")
      return false
    }

  }

  recalculateConditions = (basicPriceBaseCurrency) => {
    const { conditionTableData } = this.state;
    let tempList = conditionTableData && conditionTableData?.map(item => {
      if (item?.ConditionType === "Percentage") {
        let costBaseCurrency = checkForNull((item?.Percentage) / 100) * checkForNull(basicPriceBaseCurrency)
        item.ConditionCost = costBaseCurrency
      }
      return item
    })
    return tempList
  }

  /**
   * @method calculateNetCost
   * @description CALCUALTION NET COST
  */
  calculateNetCost = () => {


    const { fieldsObj, initialConfiguration } = this.props;
    const { FinalConditionCostBaseCurrency, DataToChange, isEditFlag, costingTypeId, showScrapKeys, CalculatedFactor, ScrapRatePerScrapUOM, ConversionRatio } = this.state
    let obj = {}
    if (this.state.IsApplyHasDifferentUOM) {
      const conversionFactorTemp = 1 / fieldsObj?.ConversionRatio
      this.props.change('CalculatedFactor', checkForDecimalAndNull(conversionFactorTemp, initialConfiguration?.NoOfDecimalForPrice));
      const scrapRateTemp = checkForNull(fieldsObj?.ScrapRatePerScrapUOM) * checkForNull(conversionFactorTemp)
      if (showScrapKeys?.showCircleJali) {
        obj.FinalJaliScrapCostBaseCurrency = scrapRateTemp
        this.props.change('JaliScrapCost', checkForDecimalAndNull(scrapRateTemp, initialConfiguration?.NoOfDecimalForPrice));
      } else if (showScrapKeys?.showForging) {
        obj.FinalForgingScrapCostBaseCurrency = scrapRateTemp
        this.props.change('ForgingScrap', checkForDecimalAndNull(scrapRateTemp, initialConfiguration?.NoOfDecimalForPrice));
      } else if (showScrapKeys?.showScrap) {
        obj.FinalScrapRateBaseCurrency = scrapRateTemp
        this.props.change('ScrapRateBaseCurrency', checkForDecimalAndNull(scrapRateTemp, initialConfiguration?.NoOfDecimalForPrice));
      }
      obj.ScrapRateBaseCurrency = scrapRateTemp
      obj.CalculatedFactor = conversionFactorTemp
    }

    const basicPriceCurrencyTemp = checkForNull(fieldsObj?.BasicRateBaseCurrency) + checkForNull(fieldsObj?.FreightCharge) + checkForNull(fieldsObj?.ShearingCost)
    let basicPriceBaseCurrency
    if (costingTypeId === ZBCTypeId) {
      basicPriceBaseCurrency = basicPriceCurrencyTemp
    }

    let conditionList = this.recalculateConditions(basicPriceBaseCurrency)

    const sumBaseCurrency = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
    let netLandedCostBaseCurrency = checkForNull(sumBaseCurrency) + checkForNull(basicPriceCurrencyTemp)

    this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(sumBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(netLandedCostBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('BasicPriceCurrency', checkForDecimalAndNull(basicPriceBaseCurrency, initialConfiguration?.NoOfDecimalForPrice));

    if (isEditFlag && checkForNull(fieldsObj?.BasicRateBaseCurrency) === checkForNull(DataToChange?.BasicRatePerUOM) && checkForNull(fieldsObj?.ScrapRateBaseCurrency) === checkForNull(DataToChange?.ScrapRate)
      && checkForNull(fieldsObj?.ForgingScrap) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.MachiningScrap) === checkForNull(DataToChange?.MachiningScrapRate) && checkForNull(fieldsObj?.CircleScrapCost) === checkForNull(DataToChange?.JaliScrapCost)
      && checkForNull(fieldsObj?.JaliScrapCost) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.FreightCharge) === checkForNull(DataToChange?.RMFreightCost) && checkForNull(fieldsObj?.ShearingCost) === checkForNull(DataToChange?.RMShearingCost)
      && checkForNull(basicPriceBaseCurrency) === checkForNull(DataToChange?.NetCostWithoutConditionCost) && checkForNull(netLandedCostBaseCurrency) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(FinalConditionCostBaseCurrency) === checkForNull(DataToChange?.NetConditionCost) && checkForNull(DataToChange?.UOMToScrapUOMRatio) === checkForNull(ConversionRatio) &&
      checkForNull(DataToChange?.CalculatedFactor) === checkForNull(CalculatedFactor) && checkForNull(DataToChange?.ScrapRatePerScrapUOM) === checkForNull(ScrapRatePerScrapUOM)) {
      this.setState({ IsFinancialDataChanged: false, EffectiveDate: DayTime(this.state.DataToChange?.EffectiveDate).isValid() ? DayTime(this.state.DataToChange?.EffectiveDate) : '' });
      this.props.change('EffectiveDate', DayTime(this.state.DataToChange?.EffectiveDate).isValid() ? DayTime(this.state.DataToChange?.EffectiveDate) : '')
    } else {
      this.setState({ IsFinancialDataChanged: true })
    }


    this.setState({

      FinalCutOffBaseCurrency: fieldsObj?.cutOffPrice,

      FinalBasicRateBaseCurrency: fieldsObj?.BasicRateBaseCurrency,

      FinalScrapRateBaseCurrency: fieldsObj?.ScrapRateBaseCurrency,

      FinalForgingScrapCostBaseCurrency: fieldsObj?.ForgingScrap,

      FinalMachiningScrapCostBaseCurrency: fieldsObj?.MachiningScrap,

      FinalCircleScrapCostBaseCurrency: fieldsObj?.CircleScrapCost,

      FinalJaliScrapCostBaseCurrency: fieldsObj?.JaliScrapCost,

      FinalFreightCostBaseCurrency: fieldsObj?.FreightCharge,

      FinalShearingCostBaseCurrency: fieldsObj?.ShearingCost,

      FinalBasicPriceBaseCurrency: basicPriceBaseCurrency,

      FinalConditionCostBaseCurrency: FinalConditionCostBaseCurrency,

      NetLandedCostBaseCurrency: netLandedCostBaseCurrency,

      conditionTableData: conditionList,

      ConversionRatio: fieldsObj?.ConversionRatio,
      ScrapRatePerScrapUOM: fieldsObj?.ScrapRatePerScrapUOM,
      ...obj,
    })
  }

  /**
   * @method handleChange
   * @description Handle Effective Date
   */
  handleEffectiveDateChange = (date) => {
    if (date !== this.state.effectiveDate) {

      this.setState({ isDateChange: true, effectiveDate: date, })
    } else {
      this.setState({ isDateChange: false, effectiveDate: date, })
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
   * @method getDetails
   * @description Used to get Details
   */
  getDetails = (data) => {

    const { initialConfiguration } = this.props
    const { showScrapKeys } = this.state

    if (data && data.isEditFlag) {
      this.setState({
        isEditFlag: false, isLoader: true, isShowForm: true, RawMaterialID: data.Id,
      })
      this.props.getRMDataById(data, true, (res) => {
        if (res && res.data && res?.data?.Result) {
          const Data = res.data.Data
          this.setState({ DataToChange: Data })

          setTimeout(() => {
            this.props.change('cutOffPrice', checkForDecimalAndNull(Data?.CutOffPrice, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('BasicRateBaseCurrency', checkForDecimalAndNull(Data?.BasicRatePerUOM, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('ScrapRateBaseCurrency', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('ForgingScrap', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('MachiningScrap', checkForDecimalAndNull(Data?.MachiningScrapRate, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('CircleScrapCost', checkForDecimalAndNull(Data?.JaliScrapCost, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('JaliScrapCost', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('FreightCharge', checkForDecimalAndNull(Data?.RMFreightCost, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('ShearingCost', checkForDecimalAndNull(Data?.RMShearingCost, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('BasicPriceCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(Data?.NetConditionCost, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(Data?.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('ConversionRatio', checkForDecimalAndNull(Data?.UOMToScrapUOMRatio, initialConfiguration?.NoOfDecimalForPrice));
            this.props.change('ScrapRatePerScrapUOM', checkForDecimalAndNull(Data?.ScrapRatePerScrapUOM, initialConfiguration?.NoOfDecimalForPrice));

            this.setState({
              FinalCutOffBaseCurrency: Data?.CutOffPrice,
              FinalBasicRateBaseCurrency: Data?.BasicRatePerUOM,
              FinalScrapRateBaseCurrency: Data?.ScrapRate,
              FinalForgingScrapCostBaseCurrency: Data?.ScrapRate,
              FinalMachiningScrapCostBaseCurrency: Data?.MachiningScrapRate,
              FinalCircleScrapCostBaseCurrency: Data?.JaliScrapCost,
              FinalJaliScrapCostBaseCurrency: Data?.ScrapRate,
              FinalFreightCostBaseCurrency: Data?.RMFreightCost,
              FinalShearingCostBaseCurrency: Data?.RMShearingCost,
              FinalBasicPriceBaseCurrency: Data?.NetCostWithoutConditionCost,
              FinalConditionCostBaseCurrency: Data?.NetConditionCost,
              FinalNetCostCurrency: Data?.NetLandedCost,
              conditionTableData: Data?.RawMaterialConditionsDetails,
              IsApplyHasDifferentUOM: Data?.IsScrapUOMApply,
              ScrapRateUOM: { label: Data?.ScrapUnitOfMeasurement, value: Data?.ScrapUnitOfMeasurementId },
              ConversionRatio: Data?.UOMToScrapUOMRatio,
              ScrapRatePerScrapUOM: Data?.ScrapRatePerScrapUOM,
              CalculatedFactor: Data?.CalculatedFactor,
            })
            this.checkTechnology({ label: Data.TechnologyName, value: Data.TechnologyId })
            if (!data.isViewFlag) {
              this.finalUserCheckAndMasterLevelCheckFunction(Data.DestinationPlantId)
            } else {
              this.setState({ finalApprovalLoader: false })
            }
            this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : "")
            this.setState({ minEffectiveDate: Data.EffectiveDate })
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
              selectedPlants: [{ Text: Data.DestinationPlantName, Value: Data.DestinationPlantId }],
              Technology: Data.TechnologyName !== undefined ? { label: Data.TechnologyName, value: Data.TechnologyId } : [],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.Vendor } : [],
              HasDifferentSource: Data.HasDifferentSource,
              sourceLocation: Data.SourceSupplierLocationName !== undefined ? { label: Data.SourceSupplierLocationName, value: Data.SourceLocation } : [],
              UOM: Data.UnitOfMeasurementName !== undefined ? { label: Data.UnitOfMeasurementName, value: Data.UOM } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              remarks: Data.Remark,
              files: Data.FileList,
              singlePlantSelected: Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : [],
              showForgingMachiningScrapCost: showScrapKeys?.showForging,
              showExtraCost: showScrapKeys?.showCircleJali,
              rmCode: { label: Data.RawMaterialCode, value: Data.RMSpec },
            }, () => this.setState({ isLoader: false, showTour: true }))

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
            setTimeout(() => {
              this.setState({ isEditBuffer: true })
            }, 500);
          }, 200)
        }
      })
    } else {
      this.setState({
        isEditFlag: false,
        isLoader: false,
        showTour: true,
        RawMaterialID: EMPTY_GUID
      })
      this.props.getRMDataById('', false, (res) => { })
    }
  }

  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  onPressVendor = (costingHeadFlag) => {
    allInputFieldsName.forEach(fieldName => {
      this.props.dispatch(clearFields('AddRMDomestic', false, false, fieldName));
    });
    this.setState({
      vendorName: [],
      costingTypeId: costingHeadFlag,
      singlePlantSelected: null
    });

    if (costingHeadFlag === CBCTypeId) {
      this.props.getClientSelectList(() => { })
    }
    else {
      this.props.getCityBySupplier(0, () => { })
    }
  }

  /**
   * @method onPressDifferentSource
   * @description Used for Different Source checked
   */
  onPressDifferentSource = () => {
    this.setState({ HasDifferentSource: !this.state.HasDifferentSource })
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
      this.props.getRMSpecificationDataList({ GradeId: null }, () => { });
    })
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
      const { RawMaterial } = this.state
      this.props.getRMGradeSelectListByRawMaterial(
        RawMaterial.value,
        false,
        (res) => { },
      )
    })
  }

  specificationToggler = () => {
    this.setState({ isOpenSpecification: true })
  }

  closeSpecDrawer = (e = '') => {
    this.setState({ isOpenSpecification: false }, () => {
      const { RMGrade } = this.state
      this.props.fetchSpecificationDataAPI(RMGrade.value, (res) => { })
    })
  }

  categoryToggler = () => {
    this.setState({ isOpenCategory: true })
  }

  closeCategoryDrawer = (e = '') => {
    this.setState({ isOpenCategory: false })
  }

  vendorToggle = () => {
    this.setState({ isOpenVendor: true })
  }

  conditionToggle = () => {
    this.setState({ isOpenConditionDrawer: true })
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
   * @method onCancel
   * @description called
   */
  onCancel = () => {
    this.setState({
      modalVisible: false,
      isVisible: false,
      imageURL: '',
    })
  }

  viewImage = (fileURL) => {
    this.setState({
      isVisible: true,
      imageURL: fileURL,
    })
  }

  /**
   * @method renderListing
   * @description Used to show type of listing
   */
  renderListing = (label, isScrapRateUOM) => {
    const { gradeSelectList, rmSpecification, cityList, categoryList, filterCityListBySupplier, rawMaterialNameSelectList, UOMSelectList, plantSelectList, costingSpecifiTechnology, clientSelectList, rmSpecificationList } = this.props
    const temp = []

    if (label === 'material') {
      rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'grade') {
      gradeSelectList && gradeSelectList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'specification') {
      rmSpecification && rmSpecification.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value, RawMaterialCode: item.RawMaterialCode })
        return null
      })
      return temp
    }

    if (label === 'category') {
      categoryList && categoryList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
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
      plantSelectList && plantSelectList.map((item) => {
        if (item.PlantId === '0') return false
        temp.push({ Text: item.PlantNameCode, Value: item.PlantId })
        return null
      })
      return temp
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
      filterCityListBySupplier && filterCityListBySupplier.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'SourceLocation') {
      cityList && cityList.map((item) => {
        if (item.Value === '0') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
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

    if (label === 'city') {
      filterCityListBySupplier && filterCityListBySupplier.map((item) => {
        if (item.Value === '0') return false
        temp.push({ Text: item.Text, Value: item.Value })
        return null
      })
      return temp
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
      isShowForm: !this.state.isShowForm,
    })
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  clearForm = (type) => {
    const { reset } = this.props
    reset()
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
    this.props.getRMDataById('', false, (res) => { })
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
      this.cancel('cancel')
    }
    if (Object.keys(this.props.fieldsObj).length !== 0 || this.state.isDropDownChanged || this.state.files.length !== 0) {
      this.setState({ showPopup: true })
    } else {
      this.cancel('cancel')
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
    const { files } = this.state
    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      const removedFileName = file.name
      let tempArr = files.filter(
        (item) => item.OriginalFileName !== removedFileName,
      )
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      this.props.fileUploadRMDomestic(data, (res) => {
        this.setDisableFalseFunction()
        let Data = res.data[0]
        const { files } = this.state
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
    this.state.files &&
      this.state.files.map((f) => {
        const withOutTild = f.FileURL.replace('~', '')
        const fileURL = `${FILE_URL}${withOutTild}`
        return (
          <div className={'attachment-wrapper images'}>
            <img src={fileURL} alt={''} />
            <button type="button" onClick={() => this.deleteFile(f.FileId)}>
              X
            </button>
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
      <span
        style={{
          alignSelf: 'flex-start',
          margin: '10px 3%',
          fontFamily: 'Helvetica',
        }}
      >
        {/* {Math.round(percent)}% */}
      </span>
    )
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  onSubmit = debounce((values) => {

    const { RawMaterial, RMGrade, RMSpec, Category, client, Technology, selectedPlants, costingTypeId, vendorName, VendorCode, HasDifferentSource, sourceLocation, UOM, remarks, RawMaterialID, isEditFlag, files, effectiveDate,
      NetLandedCostBaseCurrency, oldDate, singlePlantSelected, DataToChange, DropdownChanged, isDateChange, IsFinancialDataChanged, conditionTableData, FinalCutOffBaseCurrency, FinalScrapRateBaseCurrency, FinalForgingScrapCostBaseCurrency,
      FinalMachiningScrapCostBaseCurrency, FinalCircleScrapCostBaseCurrency, FinalJaliScrapCostBaseCurrency, FinalFreightCostBaseCurrency, FinalShearingCostBaseCurrency, FinalBasicPriceBaseCurrency, FinalConditionCostBaseCurrency,
      FinalBasicRateBaseCurrency, showScrapKeys, IsApplyHasDifferentUOM, ScrapRateUOM, ConversionRatio, CalculatedFactor, ScrapRatePerScrapUOM } = this.state

    const { isRMAssociated, fieldsObj } = this.props
    const queryClient = useQueryClient();

    let scrapRateBaseCurrency = ''
    let jaliRateBaseCurrency = ''
    let machiningRateBaseCurrency = ''

    if (showScrapKeys?.showCircleJali) {

      scrapRateBaseCurrency = checkForNull(FinalJaliScrapCostBaseCurrency)
      jaliRateBaseCurrency = checkForNull(FinalCircleScrapCostBaseCurrency)
      if (checkForNull(FinalBasicRateBaseCurrency) < checkForNull(jaliRateBaseCurrency) || checkForNull(FinalBasicRateBaseCurrency) < checkForNull(scrapRateBaseCurrency)) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap rate/cost should not be greater than or equal to the basic rate.")
        return false
      }

    } else if (showScrapKeys?.showForging) {

      scrapRateBaseCurrency = checkForNull(FinalForgingScrapCostBaseCurrency)
      machiningRateBaseCurrency = checkForNull(FinalMachiningScrapCostBaseCurrency)
      if (checkForNull(FinalBasicRateBaseCurrency) < checkForNull(scrapRateBaseCurrency) || checkForNull(FinalBasicRateBaseCurrency) < checkForNull(machiningRateBaseCurrency)) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap rate/cost should not be greater than or equal to the basic rate.")
        return false
      }

    } else if (showScrapKeys?.showScrap) {

      scrapRateBaseCurrency = checkForNull(FinalScrapRateBaseCurrency)
      if (checkForNull(FinalBasicRateBaseCurrency) < checkForNull(scrapRateBaseCurrency)) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap rate/cost should not be greater than or equal to the basic rate.")
        return false
      }

    }

    const userDetailsRM = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }

    this.setState({ isVendorNameNotSelected: false, isEditBuffer: false })

    let plantArray = []
    if (costingTypeId === VBCTypeId || this.props.initialConfiguration?.IsApprovalLevelFilterByPlant) {
      plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
    } else if (costingTypeId === ZBCTypeId) {
      selectedPlants && selectedPlants.map((item) => {
        plantArray.push({ PlantName: item.Text, PlantId: item.Value, PlantCode: '', })
        return plantArray
      })
    }
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
    let formData = {}
    // const formData = {
    formData.RawMaterialId = RawMaterialID
    formData.IsFinancialDataChanged = isDateChange ? true : false
    formData.CostingTypeId = costingTypeId
    formData.RawMaterial = RawMaterial.value
    formData.RMGrade = RMGrade.value
    formData.RMSpec = RMSpec.value
    formData.Category = Category.value
    formData.TechnologyId = Technology.value
    formData.Vendor = (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : ''
    formData.HasDifferentSource = HasDifferentSource
    formData.Source = costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : values.Source
    formData.SourceLocation = costingTypeId !== VBCTypeId && !HasDifferentSource ? '' : sourceLocation.value
    formData.UOM = UOM.value
    formData.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
    formData.Remark = remarks
    formData.LoggedInUserId = loggedInUserId()
    formData.Plant = costingTypeId === CBCTypeId ? cbcPlantArray : plantArray
    formData.VendorCode = (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VendorCode : ''
    formData.VendorPlant = []
    formData.Attachements = isEditFlag ? updatedFiles : files
    formData.IsCutOffApplicable = values.cutOffPrice < values.NetLandedCostBaseCurrency ? true : false
    formData.RawMaterialCode = values.Code
    formData.CustomerId = costingTypeId === CBCTypeId ? client.value : ''
    formData.RawMaterialEntryType = checkForNull(ENTRY_TYPE_DOMESTIC)

    formData.CutOffPrice = FinalCutOffBaseCurrency
    formData.BasicRatePerUOM = FinalBasicRateBaseCurrency
    formData.ScrapRate = scrapRateBaseCurrency
    formData.MachiningScrapRate = machiningRateBaseCurrency
    formData.RMFreightCost = FinalFreightCostBaseCurrency
    formData.RMShearingCost = FinalShearingCostBaseCurrency
    formData.JaliScrapCost = jaliRateBaseCurrency
    formData.NetLandedCost = NetLandedCostBaseCurrency
    if (costingTypeId === ZBCTypeId) {
      formData.NetCostWithoutConditionCost = FinalBasicPriceBaseCurrency
      formData.NetConditionCost = FinalConditionCostBaseCurrency
    }
    formData.RawMaterialConditionsDetails = conditionTableData
    formData.IsScrapUOMApply = IsApplyHasDifferentUOM ? true : false
    formData.ScrapUnitOfMeasurementId = this.state.IsApplyHasDifferentUOM === true ? this.state.ScrapRateUOM?.value : ""
    formData.ScrapUnitOfMeasurement = this.state.IsApplyHasDifferentUOM === true ? this.state.ScrapRateUOM?.label : ""
    formData.UOMToScrapUOMRatio = this.state.IsApplyHasDifferentUOM === true ? this.state.ConversionRatio : ""
    formData.CalculatedFactor = this.state.IsApplyHasDifferentUOM === true ? this.state.CalculatedFactor : ""
    formData.ScrapRatePerScrapUOM = this.state.IsApplyHasDifferentUOM === true ? this.state.ScrapRatePerScrapUOM : ""

    // CHECK IF CREATE MODE OR EDIT MODE !!!  IF: EDIT  ||  ELSE: CREATE
    if (isEditFlag) {
      const basicPriceBaseCurrencyTemp = checkForNull(fieldsObj?.BasicRateBaseCurrency) + checkForNull(fieldsObj?.FreightCharge) + checkForNull(fieldsObj?.ShearingCost)
      let basicPriceBaseCurrency
      if (costingTypeId === ZBCTypeId) {
        basicPriceBaseCurrency = basicPriceBaseCurrencyTemp
      }
      const netLandedCostBaseCurrency = checkForNull(basicPriceBaseCurrencyTemp) + checkForNull(FinalConditionCostBaseCurrency)

      // CHECK IF THERE IS CHANGE !!!  
      // IF: NO CHANGE  
      if (((files ? JSON.stringify(files) : []) === (DataToChange.FileList ? JSON.stringify(DataToChange.FileList) : [])) && DropdownChanged
        && ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : '')) && ((DataToChange.CutOffPrice ? checkForNull(DataToChange.CutOffPrice) : '') === (values.cutOffPrice ? checkForNull(values.cutOffPrice) : ''))
        && String(DataToChange.RawMaterialCode) === String(values.Code) && ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values.Source ? String(values.Source) : '-'))
        && ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocationValue ? String(sourceLocationValue) : ''))
        && checkForNull(fieldsObj?.BasicRateBaseCurrency) === checkForNull(DataToChange?.BasicRatePerUOM) && checkForNull(fieldsObj?.ScrapRateBaseCurrency) === checkForNull(DataToChange?.ScrapRate)
        && checkForNull(fieldsObj?.ForgingScrap) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.MachiningScrap) === checkForNull(DataToChange?.MachiningScrapRate) && checkForNull(fieldsObj?.CircleScrapCost) === checkForNull(DataToChange?.JaliScrapCost)
        && checkForNull(fieldsObj?.JaliScrapCost) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.FreightCharge) === checkForNull(DataToChange?.RMFreightCost) && checkForNull(fieldsObj?.ShearingCost) === checkForNull(DataToChange?.RMShearingCost)
        && checkForNull(basicPriceBaseCurrency) === checkForNull(DataToChange?.NetCostWithoutConditionCost) && checkForNull(netLandedCostBaseCurrency) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(FinalConditionCostBaseCurrency) === checkForNull(DataToChange?.NetConditionCost) &&
        checkForNull(DataToChange?.IsScrapUOMApply) === checkForNull(IsApplyHasDifferentUOM) && checkForNull(DataToChange?.ScrapUnitOfMeasurementId) === checkForNull(ScrapRateUOM?.value) && checkForNull(DataToChange?.UOMToScrapUOMRatio) === checkForNull(ConversionRatio) &&
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
      this.allFieldsInfoIcon(true)
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
            queryClient.invalidateQueries('MastersRawMaterial_GetAllRawMaterialList');
            Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
            this.clearForm('submit')
          }
        })
        this.setState({ updatedObj: formData })
      } else {
        this.props.createRM(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            queryClient.invalidateQueries('MastersRawMaterial_GetAllRawMaterialList');
            Toaster.success(MESSAGES.MATERIAL_ADD_SUCCESS)
            this.clearForm('submit')
            this.cancel('submit')
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

  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
    this.commonFunction(newValue ? newValue.value : '')
  }

  openAndCloseAddConditionCosting = (type, data = this.state.conditionTableData) => {
    const { initialConfiguration } = this.props
    if (type === 'save') {
      this.setState({ IsFinancialDataChanged: true })
    }
    const sumBaseCurrency = data.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCost), 0);
    let netLandedCostBaseCurrency = checkForNull(sumBaseCurrency) + checkForNull(this.state.FinalBasicPriceBaseCurrency)
    this.props.change('FinalConditionCostBaseCurrency', checkForDecimalAndNull(sumBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBaseCurrency', checkForDecimalAndNull(netLandedCostBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.setState({
      isOpenConditionDrawer: false,
      conditionTableData: data,
      FinalConditionCostBaseCurrency: sumBaseCurrency,
      NetLandedCostBaseCurrency: netLandedCostBaseCurrency,
    })

  }

  /**
   * @method render
   * @description Renders the component
   */
  render() {

    const { handleSubmit, initialConfiguration, isRMAssociated, t } = this.props
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification, costingTypeId, isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, isViewFlag, setDisable, CostingTypePermission, disableSendForApproval, isOpenConditionDrawer, conditionTableData, FinalBasicPriceBaseCurrency, showScrapKeys, isDisabled, isCodeDisabled } = this.state
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
      let label = labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))

      if (showScrapKeys?.showCircleJali) {
        label = labelWithUOMAndCurrency("Jali Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))

      } else if (showScrapKeys?.showForging) {
        label = labelWithUOMAndCurrency("Forging Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))

      } else if (showScrapKeys?.showScrap) {
        label = labelWithUOMAndCurrency("Scrap Rate", this.state.ScrapRateUOM?.label ? this.state.ScrapRateUOM?.label : 'UOM', (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))

      }
      return label
    }


    return (
      <>
        {(this.state.isLoader || this.state.finalApprovalLoader) && <LoaderCustom customClass="add-page-loader" />}
        <div className="container-fluid">
          <div>
            <div className="login-container signup-form">
              <div className="row">
                <div className="col-md-12">
                  <div className="shadow-lgg login-formg">
                    <div className="row">
                      <div className="col-md-6">
                        <h1>
                          {isViewFlag ? 'View' : isEditFlag ? 'Update' : 'Add'} Raw Material (Domestic)

                          {this.state.showTour && !isViewFlag && <TourWrapper
                            buttonSpecificProp={{ id: "Add_RM_Domestic_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t,
                                {
                                  showScrap: showScrapKeys?.showScrap,
                                  showForging: showScrapKeys?.showForging,
                                  showCircleJali: showScrapKeys?.showCircleJali,
                                  isRMAssociated: isRMAssociated,
                                  isEditFlag: isEditFlag,
                                  showSendForApproval: !this.state.isFinalApprovar,
                                  hasSource: (costingTypeId === ZBCTypeId),
                                  destinationField: (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant),
                                  plantField: (costingTypeId === ZBCTypeId),
                                  CBCTypeField: (costingTypeId === CBCTypeId),
                                  sourceField: (this.state.HasDifferentSource ||
                                    costingTypeId === VBCTypeId),
                                  conditionCost: (initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId)

                                }).RM_DOMESTIC_FORM
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
                            {(reactLocalStorage.getObject('CostingTypePermission').zbc) && <Label id="rm_domestic_form_zero_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                className='zero-based'
                                id='zeroBased'
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
                            {(reactLocalStorage.getObject('CostingTypePermission').vbc) && <Label id="rm_domestic_form_vendor_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                className='vendor-based'
                                id='vendorBased'
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
                            {(reactLocalStorage.getObject('CostingTypePermission').cbc) && <Label id="rm_domestic_form_customer_based" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                              <input
                                type="radio"
                                name="costingHead"
                                className='customer-based'
                                id='customerBased'
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
                              validate={
                                this.state.Technology == null || this.state.Technology.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={
                                this.handleTechnologyChange
                              }
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
                                  className="fullinput-icon"
                                  disabled={isEditFlag || isViewFlag || isDisabled}
                                  isClearable={true}
                                />
                              </div>
                              {(!isEditFlag) && (
                                <Button
                                  id="addRMDomestic_RMToggle"
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
                                  validate={this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
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
                                  validate={
                                    this.state.RMSpec == null || this.state.RMSpec.length === 0 ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleSpecChange}
                                  valueDescription={this.state.RMSpec}
                                  disabled={isEditFlag || isViewFlag || isDisabled}
                                />
                              </div>
                            </div>
                          </Col>
                          <Col md="3">
                            <TooltipCustom id="category" width="350px" tooltipText="Category will come here like CutToFit, CutToLength." />
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
                              // validate={initialConfiguration?.IsAutoGeneratedRawMaterialCode || this.state.rmCode == null || this.state.rmCode.length === 0 ? [] : [required]}
                              // required={!initialConfiguration?.IsAutoGeneratedRawMaterialCode}
                              handleChangeDescription={this.handleCodeChange}
                              disabled={isEditFlag || isViewFlag || isCodeDisabled}
                              isClearable={true}
                              valueDescription={this.state.rmCode}
                            />
                          </Col>
                          {((costingTypeId === ZBCTypeId && !initialConfiguration?.IsApprovalLevelFilterByPlant) && (
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
                            ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) || initialConfiguration?.IsApprovalLevelFilterByPlant) &&
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
                                    <label id="AddRMDomestic_HasDifferentSource"
                                      className={`custom-checkbox w-auto mb-0 ${(costingTypeId === VBCTypeId || isViewFlag) ? "disabled" : ""
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
                                        className=" before-box p-0"
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
                                  <div id="AddRMDomestic_Vendor" className="fullinput-icon p-relative">
                                    {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                                    <AsyncSelect
                                      name="DestinationSupplierId"
                                      ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={filterList}
                                      onChange={(e) => this.handleVendorName(e)}
                                      value={this.state.vendorName}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}

                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                      onFocus={() => onFocus(this)}
                                    />
                                  </div>
                                  {!isEditFlag && (

                                    <Button
                                      id="addRMDomestic_vendorToggle"
                                      onClick={this.vendorToggle}
                                      className={"right"}
                                      variant="plus-icon-square"
                                    />

                                  )}
                                </div>
                                {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
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
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[acceptAllExceptSingleSpecialCharacter, maxLength70, hashValidation]}
                                    component={renderText}
                                    onChange={this.handleSource}
                                    valueDescription={this.state.source}
                                    className=" "
                                    customClassName=" withBorder"
                                    disabled={isViewFlag}

                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    name="SourceSupplierCityId"
                                    type="text"
                                    label="Source Location"
                                    component={searchableSelect}
                                    placeholder={isViewFlag ? '-' : "Select"}
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
                          <Col md="12" className="filter-block ">
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
                              validate={this.state.UOM == null || this.state.UOM?.length === 0 ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handleUOM}
                              valueDescription={this.state.UOM}
                              disabled={isEditFlag || isViewFlag}
                            />
                          </Col>

                          <>
                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Cut Off Price ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                name={"cutOffPrice"}
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
                              <Field
                                label={labelWithUOMAndCurrency("Basic Rate ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                name={"BasicRateBaseCurrency"}
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
                              <div className="mt-3">
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
                            {this.state.IsApplyHasDifferentUOM && !this.props.IsRMAssociated &&
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
                                  name={"ConversionRatio"}
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
                                <TooltipCustom disabledIcon={true} id="conversion-factor-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextCalculatedFactor} />
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
                                  label={labelForScrapRate()}
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
                              </Col></>}

                            {showScrapKeys?.showScrap &&
                              <Col md="3">
                                {this.state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="scrap-rate-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextScrapCostBaseCurrencyPerOldUOM} />}
                                <Field
                                  label={labelWithUOMAndCurrency("Scrap Rate ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                  name={"ScrapRateBaseCurrency"}
                                  id="scrap-rate-base-currency"
                                  type="text"
                                  placeholder={isViewFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  className=""
                                  maxLength="15"
                                  customClassName=" withBorder"
                                  // onChange={this.handleScrapRate}
                                  disabled={isViewFlag || this.state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                />
                              </Col>}
                            {showScrapKeys?.showForging &&
                              <>
                                <Col md="3">
                                  {this.state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="forging-scrap-cost-base-currency" width={'450px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextForgingScrapCostBaseCurrencyPerOldUOM} />}
                                  <Field
                                    label={labelWithUOMAndCurrency("Forging Scrap Rate ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                    name={"ForgingScrap"}
                                    type="text"
                                    id="forging-scrap-cost-base-currency"
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
                                  <Field
                                    label={labelWithUOMAndCurrency("Machining Scrap Rate ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                    name={"MachiningScrap"}
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
                              </>
                            }
                            {showScrapKeys?.showCircleJali &&
                              <>
                                <Col md="3">
                                  {this.state.IsApplyHasDifferentUOM === true && <TooltipCustom disabledIcon={true} id="jali-scrap-cost-base-currency" width={'350px'} tooltipText={this.allFieldsInfoIcon()?.toolTipTextJaliScrapCostBaseCurrencyPerOldUOM} />}
                                  <Field
                                    label={labelWithUOMAndCurrency("Jali Scrap Rate ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                    name={"JaliScrapCost"}
                                    type="text"
                                    id="jali-scrap-cost-base-currency"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={true}
                                    disabled={isViewFlag || this.state.IsApplyHasDifferentUOM || (isEditFlag && isRMAssociated)}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Circle Scrap Rate ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                    name={"CircleScrapCost"}
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
                              </>
                            }

                            {/* //RE */}
                            {IsShowFreightAndShearingCostFields() && (
                              <>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Freight Cost ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                    name={"FreightCharge"}
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
                                {/* //RE */}
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Shearing Cost ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                    name={"ShearingCost"}
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
                              </>)}
                            {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && <>
                              <Col md="3">
                                <TooltipCustom disabledIcon={true} width={"350px"} id="rm-basic-price" tooltipText={this.basicPriceTitle()} />
                                <Field
                                  label={labelWithUOMAndCurrency("Basic Price ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                  name={"BasicPriceCurrency"}
                                  type="text"
                                  id="rm-basic-price"
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
                                <div className='d-flex align-items-center'>
                                  <div className='w-100'>
                                    <Field
                                      label={labelWithUOMAndCurrency("Condition Cost ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
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
                                  </div>
                                  <Button
                                    id="addRMDomestic_conditionToggle"
                                    onClick={this.conditionToggle}
                                    className={"right mt-0 mb-2"}
                                    variant={isViewFlag ? "view-icon-primary" : "plus-icon-square"}
                                    title={isViewFlag ? "View" : "Add"}
                                  />
                                </div>
                              </Col>

                            </>}
                            <Col md="3">
                              <TooltipCustom disabledIcon={true} width="350px" id="bop-net-cost-currency" tooltipText={this.netCostTitle()} />
                              <Field
                                label={labelWithUOMAndCurrency("Net Cost ", this.state.UOM?.label === undefined ? 'UOM' : this.state.UOM?.label, (reactLocalStorage.getObject("baseCurrency") ? reactLocalStorage.getObject("baseCurrency") : 'Currency'))}
                                name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostBaseCurrency"}
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
                          </>



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
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewFlag || (!this.state.IsFinancialDataChanged)}
                                placeholder={isViewFlag || !this.state.IsFinancialDataChanged ? '-' : "Select Date"}
                              />
                            </div>
                          </Col>
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
                              required={false}
                              component={renderTextAreaField}
                              // maxLength="512"
                              rows="6"
                              disabled={isViewFlag}
                            />
                          </Col>
                          <Col md="3">
                            <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files)</label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit reached.
                            </div>

                            <div id="AddRMDomestic_uploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
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
                                      <a href={fileURL} target="_blank" rel="noreferrer" title={f.OriginalFileName}>
                                        {f.OriginalFileName}
                                      </a>
                                      {!isViewFlag && <img
                                        className="float-right"
                                        alt={""}
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
                      </div >
                      <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                          {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                          <Button
                            id="addRMDomestic_cancel"
                            className="mr-2"
                            variant={"cancel-btn"}
                            disabled={setDisable}
                            onClick={this.cancelHandler}
                            icon={"cancel-icon"}
                            buttonName={"Cancel"}
                          />
                          {!isViewFlag && <>
                            {(!isViewFlag && (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration?.IsMasterApprovalAppliedConfigure) || (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !CostingTypePermission) ?
                              <Button
                                id="addRMDomestic_sendForApproval"
                                type="submit"
                                className="approval-btn mr5"
                                disabled={isViewFlag || setDisable || disableSendForApproval}
                                onClick={() => scroll.scrollToTop()}
                                icon={"send-for-approval"}
                                buttonName={"Send For Approval"}
                              />
                              :
                              <Button
                                id="addRMDomestic_updateSave"
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
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                EditAccessibilityRMANDGRADE={this.props.EditAccessibilityRMANDGRADE}
                RawMaterial={""}
                RMGrade={""}
                isRMDomesticSpec={true}
                Technology={this.state.Technology.value}
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
                AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                EditAccessibilityRMANDGRADE={
                  this.props.EditAccessibilityRMANDGRADE
                }
                RawMaterial={this.state.RawMaterial}
                RMGrade={this.state.RMGrade}
                isRMDomesticSpec={true}
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
                isRM={true}
                IsVendor={this.state.IsVendor}
                closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
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
              ViewMode={((isEditFlag && isRMAssociated) || isViewFlag)}
              isFromMaster={true}
              isFromImport={false}
              EntryType={checkForNull(ENTRY_TYPE_DOMESTIC)}
            />
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
                masterId={RM_MASTER_ID}
                type={'Sender'}
                anchor={"right"}
                UOM={this.state.UOM}
                approvalObj={this.state.approvalObj}
                isBulkUpload={false}
                IsImportEntry={false}
                costingTypeId={this.state.costingTypeId}
                levelDetails={this.state.levelDetails}
                currency={{ label: reactLocalStorage.getObject("baseCurrency"), value: reactLocalStorage.getObject("baseCurrency") }}
                Technology={this.state.Technology}
                showScrapKeys={showScrapKeys}
                toolTipTextObject={this.state.toolTipTextObject}
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
  const { comman, material, auth, costing, client } = state
  const fieldsObj = selector(state, 'BasicRateBaseCurrency', 'FreightCharge', 'ShearingCost', 'ScrapRateBaseCurrency', 'CircleScrapCost', 'JaliScrapCost', 'ForgingScrap', 'MachiningScrap', 'cutOffPrice', 'EffectiveDate', 'Remark', 'ConversionRatio', 'ScrapRatePerScrapUOM')

  const { rowMaterialList, rmGradeList, rmSpecification, plantList, supplierSelectList, filterPlantList, filterCityListBySupplier,
    cityList, technologyList, costingHead, categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList,
    plantSelectList, tourStartData } = comman
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;
  const { initialConfiguration, userMasterLevelAPI } = auth;

  const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList, gradeSelectList, vendorListByVendorType, rmSpecificationList } = material


  let initialValues = {}
  if (rawMaterialDetails && rawMaterialDetails !== undefined) {
    initialValues = {
      Source: rawMaterialDetails.Source,
      cutOffPrice: rawMaterialDetails.cutOffPrice,
      BasicRateBaseCurrency: rawMaterialDetails.BasicRateBaseCurrency,
      ScrapRateBaseCurrency: rawMaterialDetails.ScrapRateBaseCurrency,
      NetLandedCostBaseCurrency: rawMaterialDetails.NetLandedCostBaseCurrency,
      BasicPrice: rawMaterialDetails.BasicPrice,
      Remark: rawMaterialDetails.Remark,
    }
  }

  return {
    rowMaterialList, rmGradeList, rmSpecification, plantList, supplierSelectList, cityList,
    technologyList, categoryList, rawMaterialDetails, filterPlantListByCity,
    filterCityListBySupplier, rawMaterialDetailsData, initialValues, fieldsObj,
    filterPlantListByCityAndSupplier, rawMaterialNameSelectList, gradeSelectList,
    filterPlantList, UOMSelectList, vendorListByVendorType, plantSelectList,
    initialConfiguration, costingSpecifiTechnology, costingHead, clientSelectList, userMasterLevelAPI, rmSpecificationList, tourStartData
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
  getCostingSpecificTechnology,
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
  getSupplierList,
  getUOMSelectList,
  fileUploadRMDomestic,
  fileUpdateRMDomestic,
  getPlantSelectListByType,
  checkAndGetRawMaterialCode,
  getCityByCountry,
  getAllCity,
  getClientSelectList,
  checkFinalUser,
  getUsersMasterLevelAPI,
  getVendorNameByVendorSelectList,
  getRMSpecificationDataAPI,
  getRMSpecificationDataList
})(
  reduxForm({
    form: 'AddRMDomestic',
    enableReinitialize: true,
    touchOnChange: true,
    onSubmitFail: (errors) => {
      focusOnError(errors)
    },
  })(withTranslation(['RawMaterialMaster', 'MasterLabels'])(AddRMDomestic)),
)
