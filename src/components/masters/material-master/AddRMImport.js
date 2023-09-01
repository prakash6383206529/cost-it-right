import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, getVendorCode, positiveAndDecimalNumber, acceptAllExceptSingleSpecialCharacter, maxLength512, checkForNull, checkForDecimalAndNull, decimalLengthsix, maxLength70, maxLength15, number, hashValidation, maxLength10 } from "../../../helper/validation";
import { renderText, searchableSelect, renderMultiSelectField, renderTextAreaField, renderDatePicker, renderTextInputField } from "../../layout/FormInputs";
import {
  getRawMaterialCategory, fetchGradeDataAPI, fetchSpecificationDataAPI, getCityBySupplier, getPlantByCity,
  getPlantByCityAndSupplier, fetchRMGradeAPI, getPlantBySupplier, getUOMSelectList,
  getCurrencySelectList, fetchSupplierCityDataAPI, getPlantSelectListByType, getCityByCountry, getAllCity, getVendorNameByVendorSelectList
} from '../../../actions/Common';
import {
  createRM, getRMDataById, updateRMAPI, getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial, fileUploadRMDomestic, checkAndGetRawMaterialCode,
} from '../actions/Material';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, getConfigurationKey, userDetails } from "../../../helper/auth";
import AddSpecification from './AddSpecification';
import AddGrade from './AddGrade';
import AddCategory from './AddCategory';
import AddUOM from '../uom-master/AddUOM';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader';
import "react-datepicker/dist/react-datepicker.css"
import { FILE_URL, INR, ZBC, RM_MASTER_ID, EMPTY_GUID, SPACEBAR, ZBCTypeId, VBCTypeId, CBCTypeId, searchCount, RMIMPORT, SHEET_METAL, ENTRY_TYPE_IMPORT, VBC_VENDOR_TYPE, RAW_MATERIAL_VENDOR_TYPE } from '../../../config/constants';
import { ASSEMBLY, AcceptableRMUOM, FORGING, SHEETMETAL } from '../../../config/masterData'
import { getExchangeRateByCurrency, getCostingSpecificTechnology } from "../../costing/actions/Costing"
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage';
import imgRedcross from '../../../assests/images/red-cross.png'
import { CheckApprovalApplicableMaster, onFocus, showDataOnHover, userTechnologyDetailByMasterId } from '../../../helper';
import MasterSendForApproval from '../MasterSendForApproval';
import { animateScroll as scroll } from 'react-scroll';
import AsyncSelect from 'react-select/async';
import TooltipCustom from '../../common/Tooltip';
import { labelWithUOMAndCurrency } from '../../../helper';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import Button from '../../layout/Button';
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';

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
      finalApprovalLoader: false,
      showPopup: false,
      levelDetails: {},
      showForgingMachiningScrapCost: false,
      showExtraCost: false,
      vendorFilterList: [],
      isCallCalculation: false,
      isDropDownChanged: false,
      CostingTypePermission: false,
      isEditBuffer: false,
      disableSendForApproval: false,
      isOpenConditionDrawer: false,
      conditionTableData: [],
      BasicPriceINR: '',
      BasicPriceCurrency: '',
      totalConditionCost: '',
      NetLandedCostINR: '',
      NetLandedCostCurrency: '',







      FinalBasicRateCurrency: '',
      FinalBasicRateBase: '',
      FinalBasicPriceCurrency: '',
      FinalBasicPriceBase: '',
      FinalNetCostBase: '',
      FinalNetCostCurrency: '',
      FinalConditionCostBase: '',
      FinalConditionCostCurrency: '',

      FinalScrapRateBase: '',
      FinalScrapRateCurrency: '',

      FinalForgingScrapCostBase: '',
      FinalForgingScrapCostCurrency: '',

      FinalMachiningScrapCostBase: '',
      FinalMachiningScrapCostCurrency: '',

      FinalCircleScrapCostBase: '',
      FinalCircleScrapCostCurrency: '',

      FinalJaliScrapCostBase: '',
      FinalJaliScrapCostCurrency: '',

      FinalFreightCostBase: '',
      FinalFreightCostCurrency: '',

      FinalShearingCostBase: '',
      FinalShearingCostCurrency: '',



    }
  }

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

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data, initialConfiguration } = this.props
    this.getDetails(data);
    this.props.change('NetLandedCostINR', 0)
    this.props.change('NetLandedCostCurrency', 0)
    if (!this.state.isViewFlag) {
      this.props.getAllCity(cityId => {
        this.props.getCityByCountry(cityId, 0, () => { })
      })
    }
    if (!(data.isEditFlag || data.isViewFlag)) {
      this.props.getRawMaterialCategory(res => { });
      this.props.getRawMaterialNameChild(() => { })
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
      this.props.fetchSpecificationDataAPI(0, () => { })
      this.props.getPlantSelectListByType(ZBC, () => { })
      this.props.getClientSelectList(() => { })
    }
    if (!this.state.isViewFlag && initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
      // let obj = {
      //   TechnologyId: RM_MASTER_ID,
      //   DepartmentId: userDetails().DepartmentId,
      //   Mode: 'master',
      //   approvalTypeId: this.state.costingTypeId,
      //   UserId: loggedInUserId(),
      // }
      // this.setState({ finalApprovalLoader: true })
      // this.props.checkFinalUser(obj, (res) => {
      //   if (res?.data?.Result) {
      //     this.setState({ isFinalApprovar: res?.data?.Data?.IsFinalApprover })
      //     this.setState({ finalApprovalLoader: false })
      //   }
      // })
      this.props.getUsersMasterLevelAPI(loggedInUserId(), RM_MASTER_ID, (res) => {
        if (!(data.isEditFlag || data.isViewFlag)) {
          setTimeout(() => {
            this.commonFunction()
          }, 100);
        }
      })
    }
  }

  commonFunction() {
    let levelDetailsTemp = []
    levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId, RM_MASTER_ID, this.props.userMasterLevelAPI)
    this.setState({ levelDetails: levelDetailsTemp })
    let obj = {
      DepartmentId: userDetails().DepartmentId,
      UserId: loggedInUserId(),
      TechnologyId: RM_MASTER_ID,
      Mode: 'master',
      approvalTypeId: costingTypeIdToApprovalTypeIdFunction(this.state.costingTypeId),
    }


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
    this.setState({ CostingTypePermission: false, finalApprovalLoader: false })
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (!this.state.isViewFlag && !this.state.isCallCalculation) {
      if (this.props.fieldsObj !== prevProps.fieldsObj && !this.state.isEditFlag) {
        this.handleNetCost()
      }
      if (this.props.fieldsObj !== prevProps.fieldsObj && this.state.isEditFlag && this.state.isEditBuffer) {
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
      this.setState({ RawMaterial: newValue, RMGrade: [], isDropDownChanged: true }, () => {
        const { RawMaterial } = this.state;
        this.props.getRMGradeSelectListByRawMaterial(RawMaterial.value, false, res => { })
      });
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [], });
      this.props.getRMGradeSelectListByRawMaterial(0, res => { });
    }
  }

  /**
  * @method handleGradeChange
  * @description  used to handle row material grade selection
      */
  handleGradeChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue, RMSpec: [], }, () => {
        const { RMGrade } = this.state;
        this.props.fetchSpecificationDataAPI(RMGrade.value, res => { });
      })
    } else {
      this.setState({
        RMGrade: [],
        RMSpec: [],
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
      this.setState({ RMSpec: newValue })
      this.props.change('Code', newValue.RawMaterialCode ? newValue.RawMaterialCode : '')
    } else {
      this.setState({ RMSpec: [] })
    }
  }

  /**
  * @method handleCategoryChange
  * @description  used to handle category selection
  */
  handleCategoryChange = (newValue, actionMeta) => {
    this.setState({ Category: newValue, isDropDownChanged: true })
  }

  /**
  * @method handleTechnologyChange
  * @description Use to handle technology change
 */
  handleTechnologyChange = (newValue) => {
    if (newValue.value === String(FORGING)) {
      this.setState({ Technology: newValue, showForgingMachiningScrapCost: true, showExtraCost: false, nameDrawer: true })
    } else if (newValue.value === String(SHEETMETAL)) {
      this.setState({ Technology: newValue, showExtraCost: true, showForgingMachiningScrapCost: false, nameDrawer: true })
    } else {
      this.setState({ Technology: newValue, showForgingMachiningScrapCost: false, showExtraCost: false, nameDrawer: true })
    }
    this.setState({ RawMaterial: [], nameDrawer: false, isDropDownChanged: true })
  }
  /**
* @method handleClient
* @description called
*/
  handleClient = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ client: newValue, isDropDownChanged: true });
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
        const result = vendorName && vendorName.label ? getVendorCode(vendorName.label) : '';
        this.setState({ VendorCode: result })
        this.props.getPlantBySupplier(vendorName.value, () => { })
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

  /**
  * @method handleCurrency
  * @description called
  */
  handleCurrency = (newValue) => {
    const { effectiveDate } = this.state
    if (newValue && newValue !== '') {
      if (newValue.label === INR) {
        this.setState({ currencyValue: 1, showCurrency: false, })
      } else {
        if (newValue && newValue.length !== 0 && effectiveDate) {
          const { costingTypeId, vendorName, client } = this.state;
          this.props.getExchangeRateByCurrency(newValue.label, costingTypeId, DayTime(effectiveDate).format('YYYY-MM-DD'), costingTypeId === ZBCTypeId ? EMPTY_GUID : vendorName.value, client.value, false, res => {
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
      this.setState({ currency: newValue, }, () => {
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
      if (currency.label === INR) {
        this.setState({ currencyValue: 1, showCurrency: false, })
      } else {
        if (currency && currency.length !== 0 && date) {
          const { costingTypeId, vendorName, client } = this.state;
          this.props.getExchangeRateByCurrency(currency.label, costingTypeId, DayTime(date).format('YYYY-MM-DD'), costingTypeId === ZBCTypeId ? EMPTY_GUID : vendorName.value, client.value, false, res => {
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

  handleNetCost = () => {

    const { fieldsObj, initialConfiguration } = this.props;
    const { FinalConditionCostCurrency, FinalConditionCostBase, DataToChange } = this.state


    const cutOffPriceBase = this.convertIntoBase(fieldsObj?.cutOffPrice)
    this.props.change('cutOffPriceBase', checkForDecimalAndNull(cutOffPriceBase, initialConfiguration.NoOfDecimalForPrice));

    const basicRateBase = this.convertIntoBase(fieldsObj?.BasicRateCurrency)
    this.props.change('BasicRateBase', checkForDecimalAndNull(basicRateBase, initialConfiguration.NoOfDecimalForPrice));

    const scrapRateBase = this.convertIntoBase(fieldsObj?.ScrapRateCurrency)
    this.props.change('ScrapRateBase', checkForDecimalAndNull(scrapRateBase, initialConfiguration.NoOfDecimalForPrice));

    const forgingScrapBase = this.convertIntoBase(fieldsObj?.ForgingScrap)
    this.props.change('ForgingScrapBase', checkForDecimalAndNull(forgingScrapBase, initialConfiguration.NoOfDecimalForPrice));

    const machiningScrapBase = this.convertIntoBase(fieldsObj?.MachiningScrap)
    this.props.change('MachiningScrapBase', checkForDecimalAndNull(machiningScrapBase, initialConfiguration.NoOfDecimalForPrice));

    const circleScrapCostBase = this.convertIntoBase(fieldsObj?.CircleScrapCost)
    this.props.change('CircleScrapCostBase', checkForDecimalAndNull(circleScrapCostBase, initialConfiguration.NoOfDecimalForPrice));

    const jaliScrapCostBase = this.convertIntoBase(fieldsObj?.JaliScrapCost)
    this.props.change('JaliScrapCostBase', checkForDecimalAndNull(jaliScrapCostBase, initialConfiguration.NoOfDecimalForPrice));

    const freightChargeBase = this.convertIntoBase(fieldsObj?.FreightCharge)
    this.props.change('FreightChargeBase', checkForDecimalAndNull(freightChargeBase, initialConfiguration.NoOfDecimalForPrice));

    const shearingCost = this.convertIntoBase(fieldsObj?.ShearingCost)
    this.props.change('ShearingCostBase', checkForDecimalAndNull(shearingCost, initialConfiguration.NoOfDecimalForPrice));

    const basicPriceCurrency = checkForNull(fieldsObj?.BasicRateCurrency) + checkForNull(fieldsObj?.FreightCharge) + checkForNull(fieldsObj?.ShearingCost)
    this.props.change('BasicPriceCurrency', checkForDecimalAndNull(basicPriceCurrency, initialConfiguration.NoOfDecimalForPrice));

    const basicPriceBase = this.convertIntoBase(basicPriceCurrency)
    this.props.change('BasicPriceBase', checkForDecimalAndNull(basicPriceBase, initialConfiguration.NoOfDecimalForPrice));

    const netLandedCostCurrency = checkForNull(basicPriceCurrency) + checkForNull(FinalConditionCostCurrency)
    const netLandedCostBase = checkForNull(basicPriceBase) + checkForNull(FinalConditionCostBase)
    this.props.change('NetLandedCostCurrency', checkForDecimalAndNull(netLandedCostCurrency, initialConfiguration.NoOfDecimalForPrice));
    this.props.change('NetLandedCostBase', checkForDecimalAndNull(netLandedCostBase, initialConfiguration.NoOfDecimalForPrice));

    if (checkForNull(fieldsObj?.cutOffPrice) === checkForNull(DataToChange?.CutOffPrice) && checkForNull(fieldsObj?.BasicRateCurrency) === checkForNull(DataToChange?.BasicRatePerUOM) && checkForNull(fieldsObj?.ScrapRateCurrency) === checkForNull(DataToChange?.ScrapRate)
      && checkForNull(fieldsObj?.ForgingScrap) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.MachiningScrap) === checkForNull(DataToChange?.MachiningScrapRate) && checkForNull(fieldsObj?.CircleScrapCost) === checkForNull(DataToChange?.JaliScrapCost)
      && checkForNull(fieldsObj?.JaliScrapCost) === checkForNull(DataToChange?.ScrapRate) && checkForNull(fieldsObj?.FreightCharge) === checkForNull(DataToChange?.RMFreightCost) && checkForNull(fieldsObj?.ShearingCost) === checkForNull(DataToChange?.RMShearingCost)
      && checkForNull(basicPriceCurrency) === checkForNull(DataToChange?.NetCostWithoutConditionCost) && checkForNull(netLandedCostCurrency) === checkForNull(DataToChange?.NetLandedCost) && checkForNull(FinalConditionCostCurrency) === checkForNull(DataToChange?.NetConditionCost)) {
      this.setState({ IsFinancialDataChanged: false })
    } else {
      this.setState({ IsFinancialDataChanged: true })
    }

    this.setState({

      FinalCutOffCurrency: fieldsObj?.cutOffPrice,
      FinalCutOffBase: cutOffPriceBase,

      FinalBasicRateCurrency: fieldsObj?.BasicRateCurrency,
      FinalBasicRateBase: basicRateBase,

      FinalScrapRateCurrency: fieldsObj?.ScrapRateCurrency,
      FinalScrapRateBase: scrapRateBase,

      FinalForgingScrapCostCurrency: fieldsObj?.ForgingScrap,
      FinalForgingScrapCostBase: forgingScrapBase,

      FinalMachiningScrapCostCurrency: fieldsObj?.MachiningScrap,
      FinalMachiningScrapCostBase: machiningScrapBase,

      FinalCircleScrapCostCurrency: fieldsObj?.CircleScrapCost,
      FinalCircleScrapCostBase: circleScrapCostBase,

      FinalJaliScrapCostCurrency: fieldsObj?.JaliScrapCost,
      FinalJaliScrapCostBase: jaliScrapCostBase,

      FinalFreightCostCurrency: fieldsObj?.FreightCharge,
      FinalFreightCostBase: freightChargeBase,

      FinalShearingCostCurrency: fieldsObj?.ShearingCost,
      FinalShearingCostBase: shearingCost,

      FinalBasicPriceCurrency: basicPriceCurrency,
      FinalBasicPriceBase: basicPriceBase,

      FinalConditionCostCurrency: FinalConditionCostCurrency,
      FinalConditionCostBase: FinalConditionCostBase,

      FinalNetCostCurrency: netLandedCostCurrency,
      FinalNetCostBase: netLandedCostBase,

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
          const Data = res.data.Data
          this.setState({ DataToChange: Data }, () => { })
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : "")
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          setTimeout(() => {

            this.props.change('cutOffPrice', checkForDecimalAndNull(Data?.CutOffPrice, initialConfiguration.NoOfDecimalForPrice))
            this.props.change('cutOffPriceBase', checkForDecimalAndNull(Data?.CutOffPriceInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('BasicRateCurrency', checkForDecimalAndNull(Data?.BasicRatePerUOM, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('BasicRateBase', checkForDecimalAndNull(Data?.BasicRatePerUOMConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ScrapRateCurrency', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ScrapRateBase', checkForDecimalAndNull(Data?.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ForgingScrap', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ForgingScrapBase', checkForDecimalAndNull(Data?.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('MachiningScrap', checkForDecimalAndNull(Data?.MachiningScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('MachiningScrapBase', checkForDecimalAndNull(Data?.MachiningScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('CircleScrapCost', checkForDecimalAndNull(Data?.JaliScrapCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('CircleScrapCostBase', checkForDecimalAndNull(Data?.JaliScrapCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('JaliScrapCost', checkForDecimalAndNull(Data?.ScrapRate, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('JaliScrapCostBase', checkForDecimalAndNull(Data?.ScrapRateInINR, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('FreightCharge', checkForDecimalAndNull(Data?.RMFreightCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('FreightChargeBase', checkForDecimalAndNull(Data?.RawMaterialFreightCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('ShearingCost', checkForDecimalAndNull(Data?.RMShearingCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('ShearingCostBase', checkForDecimalAndNull(Data?.RawMaterialShearingCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('BasicPriceCurrency', checkForDecimalAndNull(Data?.NetCostWithoutConditionCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('BasicPriceBase', checkForDecimalAndNull(Data?.NetCostWithoutConditionCostConversion, initialConfiguration.NoOfDecimalForPrice));

            this.props.change('FinalConditionCostCurrency', Data?.NetConditionCost)
            this.props.change('FinalConditionCostBase', Data?.NetConditionCostConversion)

            this.props.change('NetLandedCostCurrency', checkForDecimalAndNull(Data?.NetLandedCost, initialConfiguration.NoOfDecimalForPrice));
            this.props.change('NetLandedCostBase', checkForDecimalAndNull(Data?.NetLandedCostConversion, initialConfiguration.NoOfDecimalForPrice));


            this.setState({

              FinalCutOffCurrency: Data?.CutOffPrice,
              FinalCutOffBase: Data?.CutOffPriceInINR,

              FinalBasicRateCurrency: Data?.BasicRatePerUOM,
              FinalBasicRateBase: Data?.BasicRatePerUOMConversion,

              FinalScrapRateCurrency: Data?.ScrapRate,
              FinalScrapRateBase: Data?.ScrapRateInINR,

              FinalForgingScrapCostCurrency: Data?.ScrapRate,
              FinalForgingScrapCostBase: Data?.ScrapRateInINR,

              FinalMachiningScrapCostCurrency: Data?.MachiningScrapRate,
              FinalMachiningScrapCostBase: Data?.MachiningScrapRateInINR,

              FinalCircleScrapCostCurrency: Data?.JaliScrapCost,
              FinalCircleScrapCostBase: Data?.JaliScrapCostConversion,

              FinalJaliScrapCostCurrency: Data?.ScrapRate,
              FinalJaliScrapCostBase: Data?.ScrapRateInINR,

              FinalFreightCostCurrency: Data?.RMFreightCost,
              FinalFreightCostBase: Data?.RawMaterialFreightCostConversion,

              FinalShearingCostCurrency: Data?.RMShearingCost,
              FinalShearingCostBase: Data?.RawMaterialShearingCostConversion,

              FinalBasicPriceCurrency: Data?.NetCostWithoutConditionCost,
              FinalBasicPriceBase: Data?.NetCostWithoutConditionCostConversion,

              FinalConditionCostCurrency: Data?.NetConditionCost,
              FinalConditionCostBase: Data?.NetConditionCostConversion,

              FinalNetCostCurrency: Data?.NetLandedCost,
              FinalNetCostBase: Data?.NetLandedCostConversion,

              conditionTableData: Data?.RawMaterialConditionsDetails,

            })

            this.props.change('Code', Data.RawMaterialCode ? Data.RawMaterialCode : '')
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
              netLandedCost: Data.NetLandedCost ? Data.NetLandedCost : '',
              showExtraCost: Data.TechnologyName === SHEET_METAL ? true : false,
              singlePlantSelected: Data.DestinationPlantName !== undefined ? { label: Data.DestinationPlantName, value: Data.DestinationPlantId } : [],
              netCurrencyCost: Data.NetLandedCostConversion ? Data.NetLandedCostConversion : '',
              showForgingMachiningScrapCost: Data.TechnologyId === FORGING ? true : false,
              showExtraCost: Data.TechnologyId === SHEETMETAL ? true : false,
              showCurrency: true,
              currencyValue: Data.CurrencyExchangeRate,
            }, () => {
              setTimeout(() => {
                this.setState({ isLoader: false, isCallCalculation: false })
                if (this.props.initialConfiguration.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(RM_MASTER_ID) === true) {
                  this.commonFunction()
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
    const fieldsToClear = ['TechnologyId',
      'RawMaterialId',
      'RawMaterialGradeId',
      'RawMaterialSpecificationId',
      'CategoryId',
      'Currency',
      'SourceSupplierPlantId',
      'DestinationPlant',
      "UnitOfMeasurementId",
      "cutOffPrice",
      "BasicRate",
      "ScrapRate",
      "ForgingScrap",
      "MachiningScrap",
      "CircleScrapCost",
      "JaliScrapCost",
      "EffectiveDate",
      "clientName"];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddRMImport', false, false, fieldName));
    });
    this.setState({
      costingTypeId: costingHeadFlag,
      vendorName: [],
      vendorLocation: [],
    }, () => {
      this.props.getPlantBySupplier('', () => { })
      this.props.getCityBySupplier(0, () => { })

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
              })
              this.props.change('Code', specObj.RawMaterialCode ? specObj.RawMaterialCode : '')
            })
          })
        }
      })
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
  renderListing = (label) => {
    const { gradeSelectList, rmSpecification,
      cityList, categoryList, filterCityListBySupplier, clientSelectList, rawMaterialNameSelectList,
      UOMSelectList, currencySelectList, vendorListByVendorType, plantSelectList, costingSpecifiTechnology } = this.props;
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
          if (item.Value === String(ASSEMBLY)) return false
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
    const { RawMaterial, RMGrade, RMSpec, Category, selectedPlants, vendorName, VendorCode, HasDifferentSource, sourceLocation, UOM, currency, client,
      effectiveDate, remarks, RawMaterialID, isEditFlag, files, Technology, netCost, costingTypeId, oldDate, netCurrencyCost, singlePlantSelected,
      DataToChange, DropdownChanged, isDateChange, isSourceChange, currencyValue, IsFinancialDataChanged, showForgingMachiningScrapCost, showExtraCost,
      conditionTableData, FinalBasicRateCurrency, FinalCutOffBase, FinalCutOffCurrency, FinalBasicRateBase, FinalScrapRateCurrency, FinalScrapRateBase, FinalForgingScrapCostCurrency,
      FinalForgingScrapCostBase, FinalMachiningScrapCostCurrency, FinalMachiningScrapCostBase, FinalCircleScrapCostCurrency, FinalCircleScrapCostBase, FinalJaliScrapCostCurrency,
      FinalJaliScrapCostBase, FinalFreightCostCurrency, FinalFreightCostBase, FinalShearingCostCurrency, FinalShearingCostBase, FinalBasicPriceCurrency, FinalBasicPriceBase,
      FinalConditionCostCurrency, FinalConditionCostBase, FinalNetCostCurrency, FinalNetCostBase } = this.state;

    const { fieldsObj, isRMAssociated } = this.props;
    const userDetailsRM = JSON.parse(localStorage.getItem('userDetail'))
    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }


    let scrapRateCurrency = ''
    let scrapRateBase = ''
    let jaliRateCurrency = ''
    let jaliRateBase = ''
    let machiningRateCurrency = ''
    let machiningRateBase = ''

    if (Number(Technology?.value) === SHEETMETAL) {

      if (FinalBasicRateCurrency < FinalJaliScrapCostCurrency || FinalBasicRateCurrency === FinalJaliScrapCostCurrency ||
        FinalBasicRateCurrency < FinalCircleScrapCostCurrency || FinalBasicRateCurrency === FinalCircleScrapCostCurrency) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap rate/cost should not be greater than or equal to the basic rate.")
        return false
      }

      scrapRateCurrency = FinalJaliScrapCostCurrency
      scrapRateBase = FinalJaliScrapCostBase
      jaliRateCurrency = FinalCircleScrapCostCurrency
      jaliRateBase = FinalCircleScrapCostBase
    } else if (Number(Technology?.value) === FORGING) {

      if (FinalBasicRateCurrency < FinalForgingScrapCostCurrency || FinalBasicRateCurrency === FinalForgingScrapCostCurrency ||
        FinalBasicRateCurrency < FinalMachiningScrapCostCurrency || FinalBasicRateCurrency === FinalMachiningScrapCostCurrency) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap rate/cost should not be greater than or equal to the basic rate.")
        return false
      }

      scrapRateCurrency = FinalForgingScrapCostCurrency
      scrapRateBase = FinalForgingScrapCostBase
      machiningRateCurrency = FinalMachiningScrapCostCurrency
      machiningRateBase = FinalMachiningScrapCostBase
    } else {

      if (FinalBasicRateCurrency < FinalScrapRateCurrency || FinalBasicRateCurrency === FinalScrapRateCurrency) {
        this.setState({ setDisable: false })
        Toaster.warning("Scrap rate/cost should not be greater than or equal to the basic rate.")
        return false
      }

      scrapRateCurrency = FinalScrapRateCurrency
      scrapRateBase = FinalScrapRateBase
    }


    this.setState({ isVendorNameNotSelected: false, isEditBuffer: false })

    let plantArray = []
    if (costingTypeId === VBCTypeId) {
      plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value, PlantCode: '', })
    } else {
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
    const formData = {
      RawMaterialId: RawMaterialID,
      IsFinancialDataChanged: isDateChange ? true : false,
      CostingTypeId: costingTypeId,
      RawMaterial: RawMaterial.value,
      RMGrade: RMGrade.value,
      RMSpec: RMSpec.value,
      Category: Category.value,
      TechnologyId: Technology.value,// NEED TO UNCOMMENT AFTER KEY ADDED IN BACKEND
      Vendor: (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? vendorName.value : "",
      HasDifferentSource: HasDifferentSource,
      Source: (costingTypeId !== VBCTypeId && !HasDifferentSource) ? '' : values.Source,
      SourceLocation: (costingTypeId !== VBCTypeId && !HasDifferentSource) ? '' : sourceLocation.value,
      UOM: UOM.value,
      // BasicRatePerUOM: values.BasicRate,
      // ScrapRate: showExtraCost ? values.JaliScrapCost : showForgingMachiningScrapCost ? values.ForgingScrap : values.ScrapRate,
      // ScrapRateInINR: currency === INR ? (showExtraCost ? values.JaliScrapCost : showForgingMachiningScrapCost ? values.ForgingScrap : values.ScrapRate) : ((showExtraCost ? values.JaliScrapCost : showForgingMachiningScrapCost ? values.ForgingScrap : values.ScrapRate) * currencyValue),
      // NetLandedCost: netCost,
      Remark: remarks,
      LoggedInUserId: loggedInUserId(),
      Plant: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
      VendorCode: (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? VendorCode : '',
      Attachements: isEditFlag ? updatedFiles : files,
      Currency: currency.label,
      EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
      // NetLandedCostConversion: netCurrencyCost,
      // RMFreightCost: values.FreightCharge,
      // RMShearingCost: values.ShearingCost,
      // CutOffPrice: values.cutOffPrice,
      // CutOffPriceInINR: (values.cutOffPrice * currencyValue),
      IsCutOffApplicable: values.cutOffPrice < netCost ? true : false,
      RawMaterialCode: values.Code,
      IsSendForApproval: false,
      VendorPlant: [],
      CustomerId: client.value,
      // MachiningScrapRate: values.MachiningScrap,
      // MachiningScrapRateInINR: currency === INR ? values.MachiningScrap : values.MachiningScrap * currencyValue,
      // JaliScrapCost: values.CircleScrapCost ? values.CircleScrapCost : '',// THIS KEY FOR CIRCLE SCRAP COST
      RawMaterialEntryType: Number(ENTRY_TYPE_IMPORT),




      CutOffPrice: FinalCutOffCurrency,
      CutOffPriceInINR: FinalCutOffBase,

      BasicRatePerUOM: FinalBasicRateCurrency,
      BasicRatePerUOMConversion: FinalBasicRateBase,

      ScrapRate: scrapRateCurrency,
      ScrapRateInINR: scrapRateBase,

      MachiningScrapRate: machiningRateCurrency,
      MachiningScrapRateInINR: machiningRateBase,

      RMFreightCost: FinalFreightCostCurrency,
      RawMaterialFreightCostConversion: FinalFreightCostBase,

      RMShearingCost: FinalShearingCostCurrency,
      RawMaterialShearingCostConvrsion: FinalShearingCostBase,

      JaliScrapCost: jaliRateCurrency,
      JaliScrapCostConversion: jaliRateBase,

      NetLandedCost: FinalNetCostCurrency,
      NetLandedCostConversion: FinalNetCostBase,

      NetCostWithoutConditionCost: FinalBasicPriceCurrency,
      NetCostWithoutConditionCostConversion: FinalBasicPriceBase,

      NetConditionCost: FinalConditionCostCurrency,
      NetConditionCostConversion: FinalConditionCostBase,

      CurrencyExchangeRate: currencyValue,
      RawMaterialConditionsDetails: conditionTableData,


      // CutOffPrice: 0,


      // BasicRatePerUOM: 0,
      // ScrapRate: 0,
      // MachiningScrapRate: 0,
      // NetLandedCost: 0,
      // RMFreightCost: 0,
      // RMShearingCost: 0,
      // JaliScrapCost: 0,

      // ScrapRateInINR: 0,
      // MachiningScrapRateInINR: 0,
      // CutOffPriceInINR: 0,


      // NetLandedCostConversion: 0,

      // BasicRatePerUOMConversion: 0,
      // NetCostWithoutConditionCost: 0,
      // NetCostWithoutConditionCostConversion: 0,
      // NetConditionCost: 0,
      // NetConditionCostConversion: 0,
      // CurrencyExchangeRate: 0,
      // RawMaterialFreightCostConversion: 0,
      // RawMaterialShearingCostConversion: 0,
      // JaliScrapCostConversion: 0,






















      // BasicRate: FinalBasicRateCurrency,
      // BasicRateConversion: FinalBasicRateBase,

      // NetLandedCost: FinalNetCostCurrency,
      // NetLandedCostConversion: FinalNetCostBase,

      // NetCostWithoutConditionCost: FinalBasicPriceCurrency,
      // NetCostWithoutConditionCostConversion: FinalBasicPriceBase,

      // NetConditionCost: FinalConditionCostCurrency,
      // NetConditionCostConversion: FinalConditionCostBase,

      // CurrencyExchangeRate: currencyValue
    }
    if ((isEditFlag && this.state.isFinalApprovar) || (isEditFlag && CheckApprovalApplicableMaster(RM_MASTER_ID) !== true)) {

      //DONT DELETE COMMENTED CODE BELOW

      if (IsFinancialDataChanged && isRMAssociated) {

        if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
          this.props.updateRMAPI(formData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
              this.clearForm('submit')
            }
          })
          this.setState({ updatedObj: formData })
          return

        } else {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
          return false
        }

      }
      else {
        if (JSON.stringify(files) === JSON.stringify(DataToChange.FileList) && DropdownChanged && Number(DataToChange.BasicRatePerUOM) === Number(values.BasicRate) &&
          (Number(DataToChange.ScrapRate) === showExtraCost ? showForgingMachiningScrapCost ? Number(values.ForgingScrap) : Number(values.JaliScrapCost) : Number(values.ScrapRate)) && Number(DataToChange.NetLandedCost) === Number(values.NetLandedCost) &&
          ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : '')) && ((DataToChange.CutOffPrice ? Number(DataToChange.CutOffPrice) : '') === (values.cutOffPrice ? Number(values.cutOffPrice) : '')) && String(DataToChange.RawMaterialCode) === String(values.Code)
          && ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values.Source ? String(values.Source) : '-'))
          && ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocationValue ? String(sourceLocationValue) : '')) && String(DataToChange.MachiningScrapRate) === String(values.MachiningScrap) && String(DataToChange.JaliScrapCost) === String(values.CircleScrapCost)) {
          this.cancel('submit')
          return false
        }
        else {
          this.props.updateRMAPI(formData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.RAW_MATERIAL_DETAILS_UPDATE_SUCCESS)
              this.clearForm('submit')
            }
          })
          return false

        }

      }

    } else {

      // this.setState({ setDisable: true })
      // let obj
      // if(CheckApprovalApplicableMaster(RM_MASTER_ID) === true){
      //   obj = {...formData,IsSendForApproval:true}
      // }
      // THIS CONDITION TO CHECK IF IT IS FOR MASTER APPROVAL THEN WE WILL SEND DATA FOR APPROVAL ELSE CREATE API WILL BE CALLED
      if (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) {
        if ((JSON.stringify(files) === JSON.stringify(DataToChange.FileList)) && DropdownChanged && Number(DataToChange.BasicRatePerUOM) === Number(values.BasicRate) &&
          (Number(DataToChange.ScrapRate) === showExtraCost ? showForgingMachiningScrapCost ? Number(values.ForgingScrap) : Number(values.JaliScrapCost) : Number(values.ScrapRate)) && Number(DataToChange.NetLandedCost) === Number(values.NetLandedCost) &&
          String(DataToChange.Remark ? DataToChange.Remark : '') === String(values.Remark ? values.Remark : '') && (Number(DataToChange.CutOffPrice) === Number(values.cutOffPrice) ||
            values.cutOffPrice === undefined) && String(DataToChange.RawMaterialCode) === String(values.Code) && String(DataToChange.JaliScrapCost) === String(values.CircleScrapCost)
          && ((DataToChange.Source ? String(DataToChange.Source) : '-') === (values.Source ? String(values.Source) : '-'))
          && ((DataToChange.SourceLocation ? String(DataToChange.SourceLocation) : '') === (sourceLocationValue ? String(sourceLocationValue) : '')) && String(DataToChange.MachiningScrapRate) === String(values.MachiningScrap) && String(DataToChange.JaliScrapCost) === String(values.CircleScrapCost)) {
          Toaster.warning('Please change data to send RM for approval')
          // return false
        }


        if (IsFinancialDataChanged) {

          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: { ...formData, IsSendForApproval: true } })
            return

          } else {

            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }

        }

        if (isSourceChange) {
          this.setState({ approveDrawer: true, approvalObj: { ...formData, IsSendForApproval: true } })
          this.setState({ setDisable: false })

        } else {

          if (isEditFlag) {


            if ((JSON.stringify(files) === JSON.stringify(DataToChange.FileList)) && DropdownChanged && Number(DataToChange.BasicRatePerUOM) === Number(values.BasicRate) &&
              (Number(DataToChange.ScrapRate) === showExtraCost ? showForgingMachiningScrapCost ? Number(values.ForgingScrap) : Number(values.JaliScrapCost) : Number(values.ScrapRate)) && Number(DataToChange.NetLandedCost) === Number(values.NetLandedCost) &&
              String(DataToChange.Remark) === String(values.Remark) && (Number(DataToChange.CutOffPrice) === Number(values.cutOffPrice) ||
                values.cutOffPrice === undefined) && String(DataToChange.RawMaterialCode) === String(values.Code)) {
              this.cancel('submit')
              return false
            }
          }
          this.setState({ approveDrawer: true, approvalObj: { ...formData, IsSendForApproval: true } })
        }

      } else {
        this.props.createRM(formData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.MATERIAL_ADD_SUCCESS);
            this.clearForm('submit');
          }
        });
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
  }

  conditionToggle = () => {
    const { isRMAssociated } = this.props
    const { isEditFlag, isViewMode } = this.state;
    // if ((isEditFlag && isRMAssociated) || isViewMode) {
    //   return false
    // } else {
    this.setState({ isOpenConditionDrawer: true })
    // }
  }

  openAndCloseAddConditionCosting = (type, data = this.state.conditionTableData) => {
    const { initialConfiguration } = this.props
    const sumBase = data.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCostConversion), 0);
    const sumCurrency = data.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0);
    let netLandedCostINR = Number(sumBase) + Number(this.state.FinalBasicPriceBase)
    let netLandedCostCurrency = Number(sumCurrency) + Number(this.state.FinalBasicPriceCurrency)
    this.props.change('FinalConditionCostBase', checkForDecimalAndNull(sumBase, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('FinalConditionCostCurrency', checkForDecimalAndNull(sumCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBase', checkForDecimalAndNull(netLandedCostINR, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('NetLandedCostCurrency', checkForDecimalAndNull(netLandedCostCurrency, initialConfiguration.NoOfDecimalForPrice))
    this.setState({
      isOpenConditionDrawer: false,
      conditionTableData: data,
      FinalConditionCostBase: sumBase,
      FinalConditionCostCurrency: sumCurrency,
      // NetLandedCostINR: netLandedCostINR,
      FinalNetCostBase: netLandedCostINR,
      FinalNetCostCurrency: netLandedCostCurrency,
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
    const { handleSubmit, initialConfiguration, isRMAssociated } = this.props;
    const { isRMDrawerOpen, isOpenGrade, isOpenSpecification,
      isOpenCategory, isOpenVendor, isOpenUOM, isEditFlag, isViewFlag, setDisable, costingTypeId, CostingTypePermission, disableSendForApproval, isOpenConditionDrawer, conditionTableData,
      BasicPriceINR, FinalBasicRateCurrency, FinalCutOffBase, FinalCutOffCurrency, FinalBasicRateBase, FinalScrapRateCurrency, FinalScrapRateBase, FinalForgingScrapCostCurrency,
      FinalForgingScrapCostBase, FinalMachiningScrapCostCurrency, FinalMachiningScrapCostBase, FinalCircleScrapCostCurrency, FinalCircleScrapCostBase, FinalJaliScrapCostCurrency,
      FinalJaliScrapCostBase, FinalFreightCostCurrency, FinalFreightCostBase, FinalShearingCostCurrency, FinalShearingCostBase, FinalBasicPriceCurrency, FinalBasicPriceBase,
      FinalConditionCostCurrency, FinalConditionCostBase, FinalNetCostCurrency, FinalNetCostBase, IsFinancialDataChanged } = this.state;














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
                            </Label>
                            <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                            </Label>
                            {reactLocalStorage.getObject('cbcCostingPermission') && <Label className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                              label="Technology"
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
                                  disabled={isEditFlag || isViewFlag}
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
                                  disabled={isEditFlag || isViewFlag}
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
                                  disabled={isEditFlag || isViewFlag}
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
                              placeholder={'-'}
                              validate={initialConfiguration?.IsAutoGeneratedRawMaterialCode ? [] : [required]}
                              component={renderText}
                              required={!initialConfiguration?.IsAutoGeneratedRawMaterialCode}
                              className=" "
                              customClassName=" withBorder"
                              disabled={true}
                            />

                          </Col>

                          {((costingTypeId === ZBCTypeId) && (
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
                            ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&
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
                                    <label
                                      className={`custom-checkbox w-auto mb-0 ${costingTypeId === VBCTypeId ? "disabled" : ""
                                        }`}
                                      onChange={this.onPressDifferentSource}
                                    >
                                      Has Difference Source?
                                      <input
                                        type="checkbox"
                                        checked={this.state.HasDifferentSource}
                                        disabled={costingTypeId === VBCTypeId ? true : false}
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
                                  <div className="fullinput-icon p-relative">
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
                            this.state.IsVendor) && (
                              <>
                                <Col md="3">
                                  <Field
                                    label={`Source`}
                                    name={"Source"}
                                    type="text"
                                    placeholder={isViewFlag ? "-" : "Enter"}
                                    validate={[acceptAllExceptSingleSpecialCharacter, maxLength70]}
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
                            )
                          }
                        </Row >




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
                                label={labelWithUOMAndCurrency("Cut Off Price", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
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
                                label={labelWithUOMAndCurrency("Cut Off Price", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                name={"cutOffPriceBase"}
                                type="text"
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




                            {(this.showBasicRate() || true) && <>
                              <Col md="3">
                                <Field
                                  label={labelWithUOMAndCurrency("Basic Rate", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                  name={"BasicRateCurrency"}
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
                                <Field
                                  label={labelWithUOMAndCurrency("Basic Rate", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                  name={"BasicRateBase"}
                                  type="text"
                                  placeholder={isViewFlag ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  disabled={true}
                                  maxLength="15"
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>
                            </>}




                            {(!this.state.showForgingMachiningScrapCost && !this.state.showExtraCost) &&
                              <>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Scrap Rate", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"ScrapRateCurrency"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    // onChange={this.handleScrapRate}
                                    disabled={isViewFlag}
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Scrap Rate", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                    name={"ScrapRateBase"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    maxLength="15"
                                    customClassName=" withBorder"
                                    // onChange={this.handleScrapRate}
                                    disabled={true}
                                  />
                                </Col>
                              </>}
                            {
                              (this.state.showForgingMachiningScrapCost) &&
                              <>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Forging Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"ForgingScrap"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={isViewFlag}
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Forging Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                    name={"ForgingScrapBase"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={true}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={true}
                                  />
                                </Col>



                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Machining Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"MachiningScrap"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[positiveAndDecimalNumber, maxLength15, decimalLengthsix, number]}
                                    component={renderTextInputField}
                                    required={false}
                                    className=""
                                    customClassName=" withBorder"
                                    maxLength="15"
                                    disabled={isViewFlag}
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Machining Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                    name={"MachiningScrapBase"}
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
                              (this.state.showExtraCost) &&
                              <>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Circle Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"CircleScrapCost"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={false}
                                    disabled={isViewFlag}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Circle Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                    name={"CircleScrapCostBase"}
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
                                  <Field
                                    label={labelWithUOMAndCurrency("Jali Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                    name={"JaliScrapCost"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={true}
                                    disabled={isViewFlag}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                                <Col md="3">
                                  <Field
                                    label={labelWithUOMAndCurrency("Jali Scrap Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                    name={"JaliScrapCostBase"}
                                    type="text"
                                    placeholder={isViewFlag ? '-' : "Enter"}
                                    validate={[required, maxLength15, decimalLengthsix]}
                                    component={renderText}
                                    required={true}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                </Col>
                              </>
                            }


                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Freight Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                name={"FreightCharge"}
                                type="text"
                                placeholder={isViewFlag ? '-' : "Enter"}
                                validate={[positiveAndDecimalNumber, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={false}
                                className=""
                                maxLength="15"
                                customClassName=" withBorder"
                                disabled={isViewFlag}
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Freight Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                name={"FreightChargeBase"}
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



                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Shearing Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, this.state.currency.label === undefined ? 'Currency' : this.state.currency.label)}
                                name={"ShearingCost"}
                                type="text"
                                placeholder={isViewFlag ? '-' : "Enter"}
                                validate={[positiveAndDecimalNumber, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={false}
                                className=""
                                maxLength="15"
                                customClassName=" withBorder"
                                disabled={isViewFlag}
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={labelWithUOMAndCurrency("Shearing Cost", this.state.UOM.label === undefined ? 'UOM' : this.state.UOM.label, initialConfiguration?.BaseCurrency)}
                                name={"ShearingCostBase"}
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





                            {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && <>
                              <Col md="3">
                                <Field
                                  label={`Basic Price (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                  name={"BasicPriceCurrency"}
                                  type="text"
                                  placeholder={isEditFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  label={`Basic Price (${initialConfiguration?.BaseCurrency})`}
                                  name={"BasicPriceBase"}
                                  type="text"
                                  placeholder={isEditFlag || (isEditFlag && isRMAssociated) ? '-' : "Enter"}
                                  validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>


                              <Col md="3">
                                <TooltipCustom id="bop-net-cost" tooltipText={'Net Cost = Basic Rate'} />
                                <Field
                                  label={`Condition Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                  name={"FinalConditionCostCurrency"}
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
                                <TooltipCustom id="bop-net-cost" tooltipText={'Net Cost = Basic Rate'} />
                                <Field
                                  label={`Condition Cost (${initialConfiguration?.BaseCurrency})`}
                                  name={"FinalConditionCostBase"}
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
                                <div
                                  onClick={this.conditionToggle}
                                  className={"plus-icon-square"}
                                ></div>
                              </Col>



                            </>}
                            {this.state.showCurrency && <>
                              <Col md="3">
                                <TooltipCustom id="bop-net-cost-currency" tooltipText={'Net Cost (INR) = Basic Rate * Currency Rate'} />
                                <Field
                                  label={`Net Cost (${this.state.currency.label === undefined ? 'Currency' : this.state.currency.label})`}
                                  name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostCurrency"}
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
                                <TooltipCustom id="bop-net-cost-currency" tooltipText={'Net Cost (INR) = Basic Rate * Currency Rate'} />
                                <Field
                                  label={`Net Cost (${initialConfiguration?.BaseCurrency})`}
                                  name={this.state.netLandedConverionCost === 0 ? '' : "NetLandedCostBase"}
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
                            </>}
                          </>
                        </Row>

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
                              disabled={isViewFlag}
                              maxLength="512"
                              rows="10"


                            />
                          </Col>
                          <Col md="3">
                            <label>
                              Upload Files (Upload up to 3 files)
                            </label>
                            <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                              Maximum file upload limit reached.
                            </div>
                            <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                              <Dropzone
                                ref={this.dropzone}
                                onChangeStatus={this.handleChangeStatus}
                                PreviewComponent={this.Preview}
                                accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
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
                                      <a href={fileURL} target="_blank">
                                        {f.OriginalFileName}
                                      </a>
                                      {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                      {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

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
                            {(!isViewFlag && (CheckApprovalApplicableMaster(RM_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration.IsMasterApprovalAppliedConfigure) || (initialConfiguration.IsMasterApprovalAppliedConfigure && !CostingTypePermission) ?
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
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
          }
          {isRMDrawerOpen && (
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
          )}
          {isOpenGrade && (
            <AddGrade
              isOpen={isOpenGrade}
              closeDrawer={this.closeGradeDrawer}
              isEditFlag={false}
              RawMaterial={this.state.RawMaterial}
              anchor={"right"}
            />
          )}
          {isOpenSpecification && (
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
          )}
          {isOpenCategory && (
            <AddCategory
              isOpen={isOpenCategory}
              closeDrawer={this.closeCategoryDrawer}
              isEditFlag={false}
              ID={""}
              anchor={"right"}
            />
          )}
          {isOpenVendor && (
            <AddVendorDrawer
              isOpen={isOpenVendor}
              closeDrawer={this.closeVendorDrawer = this.closeVendorDrawer.bind(this)}
              isEditFlag={false}
              isRM={true}
              IsVendor={this.state.IsVendor}
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
            initialConfiguration?.IsBasicRateAndCostingConditionVisible && isOpenConditionDrawer &&
            <AddConditionCosting
              isOpen={isOpenConditionDrawer}
              tableData={conditionTableData}
              closeDrawer={this.openAndCloseAddConditionCosting}
              anchor={'right'}
              basicRate={BasicPriceINR}
              basicRateCurrency={FinalBasicPriceCurrency}
              basicRateBase={FinalBasicPriceBase}
              ViewMode={((isEditFlag && isRMAssociated) || isViewFlag)}
              isFromMaster={true}
              currency={this.state.currency}
              currencyValue={this.state.currencyValue}
              isFromImport={true}
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
                IsImportEntery={true}
                UOM={this.state.UOM}
                costingTypeId={this.state.costingTypeId}
                levelDetails={this.state.levelDetails}
                showForgingMachiningScrapCost={this.state.showForgingMachiningScrapCost}
                showExtraCost={this.state.showExtraCost}
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
  const fieldsObj = selector(state, 'BasicRate', 'FreightCharge', 'ShearingCost', 'ScrapRate', 'CircleScrapCost', 'JaliScrapCost', 'ForgingScrap', 'MachiningScrap', 'EffectiveDate', 'Remark', 'BasicRateCurrency', 'ScrapRateCurrency', 'cutOffPrice');

  const { uniOfMeasurementList, rowMaterialList, rmGradeList, rmSpecification, plantList,
    supplierSelectList, filterPlantList, filterCityListBySupplier, cityList, technologyList,
    categoryList, filterPlantListByCity, filterPlantListByCityAndSupplier, UOMSelectList,
    currencySelectList, plantSelectList } = comman;

  const { initialConfiguration, userMasterLevelAPI } = auth;
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;
  const { rawMaterialDetails, rawMaterialDetailsData, rawMaterialNameSelectList,
    gradeSelectList, vendorListByVendorType } = material;

  let initialValues = {};
  if (rawMaterialDetails && rawMaterialDetails !== undefined) {
    initialValues = {
      Source: rawMaterialDetails.Source,
      BasicRate: rawMaterialDetails.BasicRatePerUOM,
      BasicRateCurrency: rawMaterialDetails.BasicRateCurrency,
      ScrapRate: rawMaterialDetails.ScrapRate,
      ScrapRateCurrency: rawMaterialDetails.ScrapRateCurrency,
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
    initialConfiguration, costingSpecifiTechnology, clientSelectList, userMasterLevelAPI
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
  getVendorNameByVendorSelectList
})(reduxForm({
  form: 'AddRMImport',
  enableReinitialize: true,
  touchOnChange: true
})(AddRMImport));
