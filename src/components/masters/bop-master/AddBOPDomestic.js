import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, clearFields, getFormValues } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import {
  required, checkForNull, number, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter, maxLength20,
  maxLength, maxLength10, positiveAndDecimalNumber, maxLength512, maxLength80, checkWhiteSpaces, decimalLengthsix, checkSpacesInString, postiveNumber, hashValidation,
  validateFileName,
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, focusOnError, renderDatePicker, renderTextInputField, validateForm } from "../../layout/FormInputs";
import { getCityBySupplier, getPlantBySupplier, getUOMSelectList, getPlantSelectListByType, getAllCity, getVendorNameByVendorSelectList, getCityByCountryAction, getExchangeRateSource } from '../../../actions/Common';
import { createBOP, updateBOP, getBOPCategorySelectList, getBOPDomesticById, fileUploadBOPDomestic, checkAndGetBopPartNo, getBOPDataBySourceVendor } from '../actions/BoughtOutParts';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { getConfigurationKey, IsFetchExchangeRateVendorWiseForParts, loggedInUserId, showBopLabel, userDetails } from "../../../helper/auth";
import "react-datepicker/dist/react-datepicker.css";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import { BOP_MASTER_ID, FILE_URL, ZBC, EMPTY_GUID, SPACEBAR, VBCTypeId, CBCTypeId, ZBCTypeId, searchCount, ENTRY_TYPE_DOMESTIC, VBC_VENDOR_TYPE, BOP_VENDOR_TYPE } from '../../../config/constants';
import AddBOPCategory from './AddBOPCategory';
import AddVendorDrawer from '../supplier-master/AddVendorDrawer';
import AddUOM from '../uom-master/AddUOM';
import DayTime from '../../common/DayTimeWrapper'
import { ASSEMBLY, AcceptableBOPUOM, FORGING, LOGISTICS, SHEETMETAL } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
import imgRedcross from '../../../assests/images/red-cross.png';
import MasterSendForApproval from '../MasterSendForApproval'
import { CheckApprovalApplicableMaster, displayUOM, onFocus, userTechnologyDetailByMasterId } from '../../../helper';
import _, { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, compareRateCommon, checkEffectiveDate,convertIntoCurrency, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate, recalculateConditions, updateCostValue, getEffectiveDateMaxDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser, getExchangeRateByCurrency } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import TooltipCustom from '../../common/Tooltip';
import { getCostingSpecificTechnology } from '../../costing/actions/Costing';
import WarningMessage from '../../common/WarningMessage';
import AddConditionCosting from '../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import { LabelsClass } from '../../../helper/core';
import { subDays } from 'date-fns';
import { getPlantUnitAPI } from '../actions/Plant';
import AddOtherCostDrawer from '../material-master/AddOtherCostDrawer';
import { getPartFamilySelectList } from '../actions/Part';
import { AsyncDropdownHookForm } from '../../layout/HookFormInputs';


const selector = formValueSelector('AddBOPDomestic');

class AddBOPDomestic extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.debouncedCompareRate = debounce(() => { compareRateCommon(this.props.bopData?.BoughtOutPartOtherCostDetailsSchema, this.props.bopData?.BoughtOutPartConditionsDetails)}, 1000);
    this.initialState = {
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
      finalApprovalLoader: getConfigurationKey().IsDivisionAllowedForDepartment || !(getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) ? false : true,
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
      PartFamilySelected: [],
      FinalBasicRateBaseCurrency: '',
      NetCostWithoutConditionCost: '',
      NetConditionCost: '',
      NetLandedCost: '',
      toolTipTextNetCost: {},
      toolTipTextBasicPrice: '',
      IsBreakupBoughtOutPart: false,
      IsSAPCodeHandle: false,
      IsSAPCodeUpdated: false,
      IsSapCodeEditView: true,
      IsEditBtnClicked: false,
      SapCode: '',
      ExchangeSource: '',
      showWarning: false,
      currencyValue: 1,
      hidePlantCurrency: false,
      isOpenOtherCostDrawer: false,
      otherCostTableData: [],
      LocalCurrencyId: null,
      LocalExchangeRateId: null,
      totalOtherCost: 0,
      OtherNetCostConversion: 0,
      isSAPCodeDisabled: false,
      sourceLocationInputLoader: false, // Add new state for source location loader
      IsPartOutsourced: false,
      sourceVendor: [],
      isSourceVendorNameNotSelected: false,
      sourceInputLoader: false,
      sourceVendorFilterList: [],
      sourceVendorBOPId: null,
    }
    this.state = { ...this.initialState };

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
    const { initialConfiguration } = this.props;
    const { costingTypeId } = this.state;
    let obj = {
      toolTipTextBasicPrice: initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)
        ? getConfigurationKey().IsMinimumOrderQuantityVisible
          ? `Basic Rate + Other Cost  / Minimum Order Quantity`
          : `Basic Rate + Other Cost `
        : '',
      toolTipTextNetCost: initialConfiguration?.IsBasicRateAndCostingConditionVisible && Number(costingTypeId) === Number(ZBCTypeId)
        ? `Basic Price + Condition Cost `
        : getConfigurationKey().IsMinimumOrderQuantityVisible
          ? `Basic Rate + Other Cost  / Minimum Order Quantity`
          : `Basic Rate + Other Cost `
    };

    return obj;
  }


  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.props.getExchangeRateSource((res) => { })
    this.getPartFamilySelectList();
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() });
    // if (!this.state.isViewMode) {
    //   this.props.getAllCity(cityId => {
    //     this.props.getCityByCountry(cityId, 0, () => { })
    //   })
    // }
    setTimeout(() => {
      this.getDetails()
      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { this.setState({ inputLoader: false }) })
      if (!(this.props.data.isEditFlag || this.props.data.isViewMode) && !getConfigurationKey().IsDivisionAllowedForDepartment) {
        this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
      }
      this.props.getClientSelectList(() => { })
    }, 300);
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

  callExchangeRateAPI = () => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource } = this.state;
    const hasCurrencyAndDate = Boolean(fieldsObj?.plantCurrency && effectiveDate);
    if (hasCurrencyAndDate) {
      if (IsFetchExchangeRateVendorWiseForParts() && (vendorName?.length === 0 && client?.length === 0)) {
        return false;
      }
      this.props.getExchangeRateByCurrency(fieldsObj?.plantCurrency, ZBCTypeId, DayTime(this.state?.effectiveDate).format('YYYY-MM-DD'), null, null, false, reactLocalStorage.getObject("baseCurrency"), ExchangeSource?.label ?? null, res => {
        if (Object.keys(res.data.Data).length === 0) {
          this.setState({ showWarning: true });
        } else {
          this.setState({ showWarning: false });
        }
        // this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), LocalExchangeRateId: res.data.Data.ExchangeRateId })
        this.setState({ currencyValue: checkForNull(res.data.Data.CurrencyExchangeRate), LocalExchangeRateId: res.data.Data.ExchangeRateId }, () => {
          this.handleCalculation()
        });
      });
    }
  }
  finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision = false) => {
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
      this.toolTipNetCost()
      this.handleCalculation()
    }
    if (!getConfigurationKey().IsDivisionAllowedForDepartment && (prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true) {
      this.commonFunction(this.state?.selectedPlants && this.state?.selectedPlants?.value)
    }
  }

  componentWillUnmount() {
    reactLocalStorage?.setObject('vendorData', [])
  }
  /**
   * @method onPressVendor
   * @description Used for Vendor checked
   */
  /**
 * @method onPressVendor
 * @description Used for Vendor checked
 */

  onPressVendor = (costingHeadFlag) => {
    this.props.reset();
    this.setState({ ...this.initialState, costingTypeId: costingHeadFlag }, () => {
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
          bopCategory: newValue.label,
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
        bopCategory: this.state.BOPCategory.label,
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
    if (newValue && newValue !== '') {
      this.setState({ client: newValue }
        , () => {
          if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
            this.callExchangeRateAPI()
          }
        }
      );
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
          this.props.change('BasicRate', checkForDecimalAndNull(Data.BasicRate, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('BasicPrice', checkForDecimalAndNull(Data.NetCostWithoutConditionCost, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('ConditionCost', checkForDecimalAndNull(Data.NetConditionCost, initialConfiguration?.NoOfDecimalForPrice))
          this.props.change('NetLandedCostBase', checkForDecimalAndNull(Data.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice))
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          this.props.change('plantCurrency', Data?.Currency)
          this.props.change('ExchangeSource', { label: Data.ExchangeRateSourceName, value: Data.ExchangeRateSourceName })
          this.props.change("OtherCost", checkForDecimalAndNull(Data.OtherNetCost, initialConfiguration?.NoOfDecimalForPrice))
          // this.props.getPlantBySupplier(Data.Vendor, () => { })
          setTimeout(() => {
            let plantObj;
            plantObj = Data && Data.Plant.length > 0 ? { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId } : []

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
              NetConditionCost: Data.NetConditionCost,
              conditionTableData: Data.BoughtOutPartConditionsDetails,
              NetCostWithoutConditionCost: Data.NetCostWithoutConditionCost,
              IsBreakupBoughtOutPart: Data.IsBreakupBoughtOutPart,
              IsSAPCodeUpdated: Data.IsSAPCodeUpdated,
              SAPPartNumber: Data.SAPPartNumber !== undefined ? { label: Data.SAPPartNumber, value: Data.SAPPartNumber } : [],
              currencyValue: (Data.CurrencyExchangeRate ?? 1),
              LocalExchangeRateId: Data.ExchangeRateId,
              LocalCurrencyId: Data.CurrencyId,
              ExchangeSource: { label: Data.ExchangeRateSourceName, value: Data.ExchangeRateSourceName },
              totalOtherCost: Data?.OtherNetCost,
              otherCostTableData: Data?.BoughtOutPartOtherCostDetailsSchema,
              PartFamilySelected: Data?.PartFamilyId ? { label: Data?.PartFamily ?? "", value: Data?.PartFamilyId } : [],
            }, () => {
              this.toolTipNetCost()
              this.setState({ isLoader: false })
              if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
                this.setState({ hidePlantCurrency: false })
              } else {
                this.setState({ hidePlantCurrency: true })
              }
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
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { bopCategorySelectList, plantSelectList, cityList,
      UOMSelectList, exchangeRateSourceList, partSelectList, clientSelectList, costingSpecifiTechnology, partFamilySelectList } = this.props;
    const temp = [];

    if(label === 'PartFamily') {
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
    this.props.getPlantUnitAPI(e?.value, (res) => {
      let Data = res?.data?.Data
      this.props.change('plantCurrency', Data?.Currency)
      if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
        this.setState({ hidePlantCurrency: false, LocalCurrencyId: Data?.CurrencyId })
        this.callExchangeRateAPI()
      } else {
        this.setState({ hidePlantCurrency: true })
      }
    })
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
        if (this.props?.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.callExchangeRateAPI()
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



  handleCalculation = (totalBase = "") => {
    const { fieldsObj, initialConfiguration } = this.props
    const { NetConditionCost, costingTypeId, totalOtherCost } = this.state
    const NoOfPieces = fieldsObj && fieldsObj.NumberOfPieces !== undefined ? fieldsObj.NumberOfPieces : 1;
    const basicRateBaseCurrency = checkForNull(fieldsObj?.BasicRate)
    const basicPriceBaseTemp = !NoOfPieces ? checkForNull(basicRateBaseCurrency) : checkForNull(basicRateBaseCurrency) / checkForNull(NoOfPieces)
    const basicPriceAndOtherCost = checkForNull(basicPriceBaseTemp) + checkForNull(totalOtherCost) / NoOfPieces
    const OtherCostConversion = this.convertIntoBase(checkForNull(totalOtherCost), this?.state?.currencyValue)
    this.setState({ OtherNetCostConversion: OtherCostConversion })
    let basicPriceBaseCurrency
    if (costingTypeId === ZBCTypeId) {
      basicPriceBaseCurrency = basicPriceAndOtherCost
    }
    const conditionCostBaseCurrency = checkForNull(NetConditionCost)
    let conditionList = recalculateConditions(basicPriceAndOtherCost, this.state)
    const sumBase = conditionList.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.ConditionCostPerQuantity), 0);
    let netLandedCostPlantCurrency = checkForNull(sumBase) + checkForNull(basicPriceAndOtherCost)
    const netCostBaseCurrency = this.state.currencyValue * netLandedCostPlantCurrency
    this.props.change("BasicPrice", checkForDecimalAndNull(basicPriceAndOtherCost, initialConfiguration?.NoOfDecimalForPrice))
    // this.props.change('ConditionCost', checkForDecimalAndNull(sumBase, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetCostPlantCurrency', checkForDecimalAndNull(netLandedCostPlantCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetCostBaseCurrency', checkForDecimalAndNull(netCostBaseCurrency, initialConfiguration?.NoOfDecimalForPrice))
    this.setState({
      FinalBasicRateBaseCurrency: basicRateBaseCurrency,
      NetCostWithoutConditionCost: basicPriceBaseCurrency,
      NetConditionCost: conditionCostBaseCurrency,
      NetLandedCost: netLandedCostPlantCurrency,
      conditionTableData: conditionList,
    })

    if (this.state.isEditFlag && checkForNull(basicPriceBaseCurrency) === checkForNull(this.state.DataToCheck?.NetCostWithoutConditionCost) &&
      checkForNull(NoOfPieces) === checkForNull(this.state.DataToCheck?.NumberOfPieces) && checkForNull(netLandedCostPlantCurrency) === checkForNull(this.state.DataToCheck?.NetLandedCost)) {

      this.setState({ IsFinancialDataChanged: false, EffectiveDate: DayTime(this.state.DataToCheck?.EffectiveDate).isValid() ? DayTime(this.state.DataToCheck?.EffectiveDate) : '' });
      this.props.change('EffectiveDate', DayTime(this.state.DataToCheck?.EffectiveDate).isValid() ? DayTime(this.state.DataToCheck?.EffectiveDate) : '')
    } else {
      this.setState({ IsFinancialDataChanged: true })

    }

    //COMMENTED FOR MINDA
    // const NetLandedCost = checkForNull(BasicRate) //THIS IS ONLY FOR MINDA
    // this.setState({
    //   BasicPrice: BasicPrice
    // })
    // this.props.change('BasicPrice', BasicPrice !== 0 ? checkForDecimalAndNull(BasicPrice, initialConfiguration?.NoOfDecimalForPrice) : 0)
  }

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    }, () => {
      if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
        this.callExchangeRateAPI()
      }
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
    const fileName = file.name
    this.setState({ uploadAttachements: false, setDisable: true, attachmentLoader: true })

    if (status === 'removed') {
      const removedFileName = file.name;
      let tempArr = files.filter(item => item.OriginalFileName !== removedFileName)
      this.setState({ files: tempArr })
    }

    if (status === 'done') {
      let data = new FormData()
      data.append('file', file)
      if (!validateFileName(fileName)) {
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

  onPressIsPartOutsourced = () => {
    this.setState({ IsPartOutsourced: !this.state.IsPartOutsourced })
    // dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRef.current, HasDifferentSource: state.HasDifferentSource }, () => { }))
  }

  handleSourceVendorDataFetch(data) {
    if (data?.sourceVendorId && data?.costingHeadId) {
      this.setState({ disableSendForApproval: true });
      this.props.getBOPDataBySourceVendor(data, res => {
        this.setState({ disableSendForApproval: false });
        if (res?.status === 200) {
          const Data = res?.data?.Data;
          // this.setState({
          //   isSourceVendorApiCalled: true,
          //   sourceVendorBOPId: Data?.RawMaterialId,
          //   DataToChange: Data,
          //   disableAll: true,
          //   isLoader: false,
          //   commodityDetails: Data?.MaterialCommodityIndexRateDetails,
          //   disableSendForApproval: false,
          // });
        } else {
          // this.setState({
          //   isSourceVendorApiCalled: true,
          //   sourceVendorBOPId: null,
          //   DataToChange: {},
          //   disableAll: false,
          //   isLoader: false,
          //   commodityDetails: [],
          // });
        }
       })
    }
  }

  handleSourceVendor = (newValue, VendorLabel) => {
    if (newValue && newValue !== '') {
        if (newValue?.value === this.state?.vendorName?.value) {
            Toaster.warning(`${VendorLabel} and Source ${VendorLabel} cannot be the same`);
            this.setState({ sourceVendor: [] });
            // setState(prevState => ({ ...prevState, sourceVendor: [] }));
        } else {
            // setState(prevState => ({ ...prevState, sourceVendor: newValue }));
            this.setState({ sourceVendor: newValue });
            this.props.change("sourceVendorName", { label: newValue?.label, value: newValue?.value })
            // dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRef.current, SourceVendor: newValue }, () => { }));

            const data = {
              // rawMaterialSpecificationId: currentRawMaterialSpec?.value,
              sourceVendorId: newValue?.value,
              technologyId: this.state?.Technology?.value,
              // isIndexationDetails: showIndexCheckBox,
              costingHeadId: this.state?.costingTypeId,
              categoryId: this.state?.BOPCategory.value,
              boughtOutPartChildId: ""
            };

            this.handleSourceVendorDataFetch(data);
        }
    } else {
        // dispatch(setRawMaterialDetails({ ...rawMaterailDetailsRef.current, SourceVendor: [] }, () => { }));
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
  * @method 
  * 
  * @description Used to Submit the form
  */
  onSubmit = debounce((values) => {

    const { BOPCategory, selectedPlants, vendorName, costingTypeId, sourceLocation, BOPID, isEditFlag, files, DropdownChanged, oldDate, client, effectiveDate, UOM, DataToCheck, isDateChange, IsFinancialDataChanged,
      isClientVendorBOP, isTechnologyVisible, Technology, NetConditionCost, NetCostWithoutConditionCost, NetLandedCost, FinalBasicRateBaseCurrency, conditionTableData, IsSAPCodeHandle, IsSAPCodeUpdated, currencyValue, LocalCurrencyId, LocalExchangeRateId, ExchangeSource, otherCostTableData, OtherNetCostConversion, totalOtherCost } = this.state;
    const { fieldsObj, isBOPAssociated } = this.props;
    const userDetailsBop = JSON.parse(localStorage.getItem('userDetail'))

    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {
      this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
      return false
    }
    this.setState({ isVendorNameNotSelected: false })
    let plantArray = Array?.isArray(selectedPlants) ? selectedPlants?.map(plant => ({ PlantId: plant?.value, PlantName: plant?.label, PlantCode: '' })) :
      selectedPlants ? [{ PlantId: selectedPlants?.value, PlantName: selectedPlants?.label, PlantCode: '' }] : [];
    if (selectedPlants.length === 0 && costingTypeId === ZBCTypeId) {
      return false;
    }
    let updatedFiles = files.map((file) => {
      return { ...file, ContextId: BOPID }
    })
    // if (isEditFlag && this.state.isFinalApprovar) {
    const formData = {
      Attachements: isEditFlag ? updatedFiles : files,
      BasicRate: values?.BasicRate,
      BasicRateLocalConversion: values?.BasicRate,
      BasicRateConversion: convertIntoCurrency(values?.BasicRate, currencyValue),
      BoughtOutPartConditionsDetails: conditionTableData,
      BoughtOutPartId: BOPID,
      BoughtOutPartName: values?.BoughtOutPartName,
      BoughtOutPartNumber: values?.BoughtOutPartNumber,
      CategoryId: BOPCategory.value,
      CategoryName: BOPCategory.label,
      CostingTypeId: costingTypeId,
      CustomerId: client.value,
      DestinationPlantId: (costingTypeId === VBCTypeId || costingTypeId === ZBCTypeId) ? selectedPlants.value :
        (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) ? selectedPlants.value :
          userDetailsBop.Plants[0].PlantId,
      EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
      ExchangeRateSourceName: ExchangeSource.label,
      EntryType: checkForNull(ENTRY_TYPE_DOMESTIC),
      IsActive: true,
      IsBreakupBoughtOutPart: isTechnologyVisible,
      IsClientVendorBOP: isClientVendorBOP,
      IsFinancialDataChanged: isDateChange ? true : false,
      IsSAPCodeHandle: IsSAPCodeHandle ? true : false,
      IsSAPCodeUpdated: IsSAPCodeUpdated,
      LoggedInUserId: loggedInUserId(),
      Currency: values.plantCurrency,
      ExchangeRateId: LocalExchangeRateId,
      CurrencyId: LocalCurrencyId,
      CurrencyExchangeRate: currencyValue,
      NetConditionCost: NetConditionCost,
      NetConditionCostConversion: convertIntoCurrency(NetConditionCost, currencyValue),
      NetConditionCostLocalConversion: NetConditionCost,
      NetCostWithoutConditionCost: NetCostWithoutConditionCost,
      NetCostWithoutConditionCostLocalConversion: NetCostWithoutConditionCost,
      NetCostWithoutConditionCostConversion: convertIntoCurrency(NetCostWithoutConditionCost, currencyValue),
      NetLandedCost: NetLandedCost,
      NetLandedCostLocalConversion: NetLandedCost,
      NetLandedCostConversion: convertIntoCurrency(NetLandedCost, currencyValue),
      NumberOfPieces: getConfigurationKey().IsMinimumOrderQuantityVisible ? values?.NumberOfPieces : 1,
      Plant: plantArray,
      Remark: values?.Remark,
      SAPPartNumber: values?.SAPPartNumber,
      Source: values?.Source,
      SourceLocation: sourceLocation.value,
      Specification: values?.Specification,
      TechnologyId: Technology?.value,
      TechnologyName: Technology?.label,
      UnitOfMeasurementId: UOM.value,
      Vendor: vendorName.value,
      VendorPlant: [],
      OtherNetCostLocalConversion: totalOtherCost,
      OtherNetCostConversion: OtherNetCostConversion,
      OtherNetCost: totalOtherCost,
      BoughtOutPartOtherCostDetailsSchema: otherCostTableData,
      LocalCurrencyExchangeRate: null,
      LocalExchangeRateId: null,
      PartFamilyId: this?.state?.PartFamilySelected?.value || "",
      PartFamily: this?.state?.PartFamilySelected?.label || "",
    };

    // formData.BasicRate = FinalBasicRateBaseCurrency
    // formData.NetLandedCost = FinalNetLandedCostBaseCurrency

    // if (costingTypeId === ZBCTypeId) {
    //   formData.NetCostWithoutConditionCost = FinalBasicPriceBaseCurrency
    //   formData.NetConditionCost = FinalConditionCostBaseCurrency
    // }

    formData.BoughtOutPartConditionsDetails = conditionTableData
    let isOnlySAPCodeChanged = false
    // CHECK IF CREATE MODE OR EDIT MODE !!!  IF: EDIT  ||  ELSE: CREATE
    let financialDataNotChanged = checkForNull(fieldsObj?.NetCostPlantCurrency) === checkForNull(DataToCheck?.NetLandedCostLocalConversion)

    let nonFinancialDataNotChanged = ((files ? JSON.stringify(files) : []) === (DataToCheck.Attachements ? JSON.stringify(DataToCheck.Attachements) : [])) &&
      ((DataToCheck.Remark ? DataToCheck.Remark : '') === (values?.Remark ? values?.Remark : '')) &&
      ((DataToCheck.SAPPartNumber ? DataToCheck.SAPPartNumber : '') === (values?.SAPPartNumber ? values?.SAPPartNumber : '')) &&
      ((DataToCheck.Source ? String(DataToCheck.Source) : '-') === (values?.Source ? String(values?.Source) : '-')) &&
      ((DataToCheck.SourceLocation ? String(DataToCheck.SourceLocation) : '') === (sourceLocation?.value ? String(sourceLocation?.value) : '')) &&
      DropdownChanged &&
      ((DataToCheck.TechnologyId ? String(DataToCheck.TechnologyId) : '') === (Technology?.value ? String(Technology?.value) : ''))

    if (isEditFlag) {
      if (!isBOPAssociated) {
        if (financialDataNotChanged && nonFinancialDataNotChanged) {
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
  labelWithUOM = (value) => {
    const { initialConfiguration } = this.props
    return <div>
      <span className='d-flex'>Basic Rate ({this.props.fieldsObj?.plantCurrency ?? 'Currency'}/{displayUOM(value)})</span>
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

    let netLandedCost = checkForNull(sum) + checkForNull(this.state.NetCostWithoutConditionCost)
    const netCostConversion = this.convertIntoBase(netLandedCost, this?.state?.currencyValue)

    this.props.change('ConditionCost', checkForDecimalAndNull(sum, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetLandedCostBase', checkForDecimalAndNull(netLandedCost, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetCostPlantCurrency', checkForDecimalAndNull(netLandedCost, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('NetCostBaseCurrency', checkForDecimalAndNull(netCostConversion, initialConfiguration?.NoOfDecimalForPrice))

    this.setState({
      isOpenConditionDrawer: false,
      conditionTableData: data,
      NetConditionCost: sum,
      NetLandedCost: netLandedCost,

    })
  }

  conditionToggle = () => {
    this.setState({ isOpenConditionDrawer: true })
  }
  handleExchangeRateSource = (newValue) => {
    this.setState({ ExchangeSource: newValue }
      , () => {
        if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.callExchangeRateAPI()
        }
      }
    );
  };
  otherCostToggle = () => {
    this.setState({ isOpenOtherCostDrawer: true })
  }
  convertIntoBase = (price) => {
    const { currencyValue } = this.state;
    return checkForNull(price) * checkForNull(currencyValue)
  }
  closeOtherCostToggle = (type, data, total, totalBase) => {
    if (type === 'Save') {
      if (Number(this.state.costingTypeId) === Number(ZBCTypeId) &&
        this.state.NetConditionCost &&
        Array.isArray(this.state?.conditionTableData) &&
        this.state.conditionTableData.some(item => item.ConditionType === "Percentage")) {
        Toaster.warning("Please click on refresh button to update Condition Cost data.")
      }
    }
    const netCost = checkForNull(totalBase) + checkForNull(this.props.fieldsObj?.BasicRate)
    this.setState({ isOpenOtherCostDrawer: true })
    this.props.change('OtherCost', checkForDecimalAndNull(total, getConfigurationKey().NoOfDecimalForPrice))
    this.setState({ isOpenOtherCostDrawer: false, otherCostTableData: data })
    this.setState({ isOpenOtherCostDrawer: false, otherCostTableData: data, NetCostWithoutConditionCost: checkForNull(netCost) })
    this.setState(prevState => ({ ...prevState, NetCostPlantCurrency: checkForNull(totalBase) + checkForNull(this.props.fieldsObj?.BasicRate) }))
    this.props.change("BasicPrice", checkForDecimalAndNull(netCost, getConfigurationKey().NoOfDecimalForPrice))
    this.setState({ totalOtherCost: total }, () => {
      this.handleCalculation()
    })
  }

  handlePartFamilyChange = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ PartFamilySelected: newValue });
    } else {
      this.setState({ PartFamilySelected: null });
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
      this.props.change('ConditionCost', checkForDecimalAndNull(result?.formValue?.value, getConfigurationKey().NoOfDecimalForPrice))
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
    const { isCategoryDrawerOpen, isOpenVendor, costingTypeId, isOpenUOM, isEditFlag, isViewMode, setDisable, isClientVendorBOP, CostingTypePermission,
      isTechnologyVisible, disableSendForApproval, isOpenConditionDrawer, conditionTableData, NetCostWithoutConditionCost, IsFinancialDataChanged, toolTipTextNetCost, toolTipTextBasicPrice, IsSAPCodeUpdated, IsSapCodeEditView, IsSAPCodeHandle, hidePlantCurrency
    } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
    const BOPVendorLabel = LabelsClass(t, 'MasterLabels').BOPVendorLabel;
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
                              <span>{VendorLabel} Based</span>
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
                                disabled={false}
                              />
                            </Col>)
                          }

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
                                validate={this.state.selectedPlants == null || this.state.selectedPlants?.length === 0 ? [required] : []}
                                // optionValue={(option) => option.Value}
                                // optionLabel={(option) => option.Text}
                                component={searchableSelect}
                                valueDescription={this.state?.selectedPlants}
                                mendatory={true}
                                required={true}
                                className="multiselect-with-border bop_plant_form_zero_based"
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
                                  disabled={(IsSapCodeEditView && isEditFlag) || isViewMode || this?.state?.isSAPCodeDisabled}
                                  value={this.state.SapCode}
                                  onChange={this.handleChangeSapCode}
                                  className=" "
                                  customClassName=" withBorder w-100 mb-0"
                                />
                                {!IsSAPCodeUpdated && isEditFlag && (
                                  <Button className={"Edit ms-2 mt-2"} variant="Edit" title={"Edit"} onClick={() => { this.handleSubmitOfSapCode(handleSubmit(this.onSubmit.bind(this))) }} disabled={isViewMode} />
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
                                <div className="left-border">{VendorLabel}:</div>
                              </Col>
                              <Col md="3" className='mb-4'>
                                <label>{costingTypeId === ZBCTypeId ? `${BOPVendorLabel}` : `${VendorLabel}`}<span className="asterisk-required">*</span></label>
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

                          <Col md="3" className="mt-4 pt-2">
                              <div className=" flex-fills d-flex justify-content-between align-items-center">
                                  <label id="AddRMDomestic_HasDifferentSource"
                                      className={`custom-checkbox w-auto mb-0}`}
                                      onChange={this.onPressIsPartOutsourced}
                                  >
                                      Is Part Outsourced?
                                      <input
                                          type="checkbox"
                                          checked={this.state?.IsPartOutsourced}
                                          // disabled={(states.costingTypeId === VBCTypeId) ? true : false}
                                      />
                                      <span
                                          className=" before-box p-0"
                                          checked={this.state?.IsPartOutsourced}
                                          onChange={this.onPressIsPartOutsourced}
                                      />
                                  </label>
                              </div>
                          </Col>

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
                                      // ref={this.myRef}
                                      key={this.state.updateAsyncDropdown}
                                      loadOptions={sourceFilterList}
                                      onChange={(e) => this.handleSourceVendor(e, VendorLabel)}
                                      value={this.state.sourceVendor}
                                      noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                      isDisabled={(isEditFlag) ? true : false}
                                      onFocus={() => onFocus(this)}
                                      onKeyDown={(onKeyDown) => {
                                        if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                      }}
                                    />
                                  </div>
                                </div>
                                {((this.state.showErrorOnFocus && this.state.sourceVendor.length === 0) || this.state.isSourceVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
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
                              {/* <Col md="3">
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
                              </Col> */}
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
                                    {this.state.sourceLocationInputLoader && <LoaderCustom customClass={`input-loader`} />}

                                  </div>
                                </div>
                              </Col>
                            </>
                          )}
                        </Row>

                        <Row className='UOM-label-container'>
                          <Col md="12">
                            <div className="left-border">{"Cost:"}</div>
                          </Col>
                          {<Col md="3">
                            {!this.state.hidePlantCurrency && <TooltipCustom width="350px" id="plantCurrency" tooltipText={`Exchange Rate: 1 ${this.props.fieldsObj?.plantCurrency ?? ''} = ${this.state?.currencyValue ?? '-'} ${reactLocalStorage.getObject("baseCurrency")}`} />}
                            <Field
                              name="plantCurrency"
                              defaultValue={''}
                              type="text"
                              label="Plant Currency"
                              placeholder={"-"}
                              validate={[]}
                              component={renderTextInputField}
                              required={false}
                              disabled={true}
                              className=""
                              customClassName="mb-1"
                            />
                            {this.state.showWarning && <WarningMessage dClass="mt-1 pa-1" message={`${this.props?.fieldsObj?.plantCurrency} rate is not present in the Exchange Master`} />}
                          </Col>}
                          <Col md="3">
                            <div className="inputbox date-section form-group">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                selected={this.state.effectiveDate}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                                maxDate={getEffectiveDateMaxDate()}

                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                  //e.preventDefault()
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={isViewMode}
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
                                disabled={isViewMode}
                              />
                            </Col>}
                          {(!isTechnologyVisible || this.showBasicRate()) && !isTechnologyVisible && <>
                            <Col md="3">
                              <Field
                                label={this.labelWithUOM(this.state?.UOM?.label ? this.state?.UOM?.label : 'UOM')}
                                name={"BasicRate"}
                                type="text"
                                placeholder={isEditFlag ? '-' : "Enter"}
                                validate={[required, positiveAndDecimalNumber, maxLength10, decimalLengthsix, number]}
                                component={renderTextInputField}
                                required={true}
                                disabled={isViewMode}
                                className=" "
                                customClassName=" withBorder"
                                onChange={(e) => { this.state.isEditFlag && this.debouncedCompareRate() }}
                              />
                            </Col></>}
                          {!isTechnologyVisible && (<Col md="3">
                            <div className='d-flex align-items-center'>

                              <div className="w-100">
                                <Field
                                  label={`Other Cost (${this.props?.fieldsObj?.plantCurrency ?? 'Currency'}/${this.state?.UOM?.label ? this.state?.UOM?.label : 'UOM'})`}
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
                                  className={"right ml-1"}
                                  variant={
                                    isViewMode ? "view-icon-primary" : !this.props.fieldsObj?.BasicRate
                                      ? "blurPlus-icon-square"
                                      : "plus-icon-square"
                                  }
                                  disabled={!this.props.fieldsObj?.BasicRate}
                                />
                              </div>
                            </div>
                          </Col>)}

                          {initialConfiguration?.IsBasicRateAndCostingConditionVisible && costingTypeId === ZBCTypeId && !isTechnologyVisible && <>
                            <Col md="3">
                              <TooltipCustom width="350px" id="bop-basic-price" disabledIcon={true} tooltipText={this.toolTipNetCost().toolTipTextBasicPrice} />
                              <Field
                                label={`Basic Price (${this.props.fieldsObj?.plantCurrency ?? 'Currency'}/${this.state?.UOM?.label ? this.state?.UOM?.label : 'UOM'})`}
                                name={"BasicPrice"}
                                type="text"
                                id="bop-basic-price"
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
                                    label={`Condition Cost (${this.props.fieldsObj?.plantCurrency ?? 'Currency'}/${this.state?.UOM?.label ? this.state?.UOM?.label : 'UOM'})`}
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
                                <div className="d-flex align-items-center" style={{ marginTop: '-5px' }}>
                                  <button type="button" id="condition-cost-refresh" className={'refresh-icon ml-1'} onClick={() => this.updateTableCost(true)} disabled={this.props.data.isViewMode}>
                                    <TooltipCustom disabledIcon={true} id="condition-cost-refresh" tooltipText="Refresh to update Condition cost" />
                                  </button>
                                  <Button
                                    id="addBOPDomestic_condition"
                                    onClick={this.conditionToggle}
                                    className={"right ml-1"}
                                    variant={
                                      isViewMode ? "view-icon-primary" : !this.props.fieldsObj?.BasicRate
                                        ? "blurPlus-icon-square"
                                        : "plus-icon-square"
                                    }
                                    disabled={!this.props.fieldsObj?.BasicRate}
                                  />
                                </div>
                              </div>
                            </Col>
                          </>}
                          {
                            (!isTechnologyVisible || this.state.IsBreakupBoughtOutPart) &&
                            <>
                              <Col md="3">
                                <TooltipCustom width="350px" id="bop-net-cost-plant" disabledIcon={true} tooltipText={`${this.toolTipNetCost()?.toolTipTextNetCost}`} />
                                <Field
                                  label={`Net Cost (${this.props?.fieldsObj?.plantCurrency ?? 'Plant Currency'})`}
                                  name={`${"NetCostPlantCurrency"}`}
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
                              </Col>
                              {!hidePlantCurrency && <Col md="3">
                                <TooltipCustom width="350px" id="bop-net-cost" disabledIcon={true} tooltipText={`Net Cost (${this.props?.fieldsObj?.plantCurrency ?? 'Plant Currency'}) * Plant Currency Rate (${this.state?.currencyValue})`} />
                                <Field
                                  label={`Net Cost (${reactLocalStorage.getObject("baseCurrency")}/${this.state?.UOM?.label ? this.state?.UOM?.label : 'UOM'})`}
                                  name={`${"NetCostBaseCurrency"}`}
                                  type="text"
                                  id="bop-net-cost"
                                  placeholder={"-"}
                                  validate={[]}
                                  component={renderTextInputField}
                                  required={false}
                                  disabled={true}
                                  className=" "
                                  customClassName=" withBorder"
                                />
                              </Col>}
                            </>
                          }


                        </Row>
                        {getConfigurationKey().IsShowClientVendorBOP && costingTypeId === CBCTypeId && <Col md="3" className="d-flex align-items-center mb-3">
                          <label
                            className={`custom-checkbox`}
                            onChange={this.onIsClientVendorBOP}
                          >
                            Client Approved {VendorLabel}
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
                              Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files) <AttachmentValidationInfo />
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
                          {this.state.showWarning &&<WarningMessage dClass="mr-2" message={`Net conversion cost is 0, Do you wish to continue.`} />}
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
                            {((!isViewMode && (CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration?.IsMasterApprovalAppliedConfigure) || (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(BOP_MASTER_ID) === true && !CostingTypePermission && !isTechnologyVisible)) && !isTechnologyVisible ?
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
              basicRateCurrency={NetCostWithoutConditionCost}
              ViewMode={(isViewMode)}
              isFromMaster={true}
              EntryType={checkForNull(ENTRY_TYPE_DOMESTIC)}
              basicRateBase={this.state.NetCostWithoutConditionCost}
              isFromImport={false}
              currencyValue={this.state?.currencyValue ?? ''}
              PlantCurrency={this.props?.fieldsObj?.plantCurrency ?? ''}
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
          {
            this.state.isOpenOtherCostDrawer &&
            <AddOtherCostDrawer
              isOpen={this.state.isOpenOtherCostDrawer}
              rmTableData={this.state?.otherCostTableData}
              closeDrawer={this.closeOtherCostToggle}
              anchor={'right'}
              rawMaterial={true}
              rmBasicRate={this.props.fieldsObj?.BasicRate}
              ViewMode={this.props.data.isViewMode}
              uom={this.state.UOM}
              isImport={false}
              plantCurrency={this.props?.fieldsObj?.plantCurrency ?? ''}
              settlementCurrency={this.state?.currency?.label ?? ''}
              isBOP={true}
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
  const fieldsObj = selector(state, 'NumberOfPieces', 'BasicRate', 'Remark', 'BoughtOutPartName', 'SAPPartNumber', 'plantCurrency', 'NetCostPlantCurrency');

  const { bopCategorySelectList, bopData, } = boughtOutparts;
  const { plantList, filterPlantList, filterCityListBySupplier, cityList, UOMSelectList, plantSelectList, costingHead, exchangeRateSourceList } = comman;
  const { partSelectList, partFamilySelectList } = part;
  const { vendorWithVendorCodeSelectList } = supplier;
  const { initialConfiguration, userMasterLevelAPI } = auth;
  const { clientSelectList } = client;
  const { costingSpecifiTechnology } = costing
  const formValues = getFormValues('AddBOPDomestic')(state);
  let initialValues = {};
  if (bopData && bopData !== undefined) {
    initialValues = {
      BoughtOutPartNumber: bopData.BoughtOutPartNumber,
      BoughtOutPartName: bopData.BoughtOutPartName,
      Specification: bopData.Specification,
      Source: bopData.Source,
      NetLandedCost: bopData.NetLandedCost,
      BasicPrice: bopData.BasicPrice,
      BasicRate: bopData.BasicRate,
      Remark: bopData.Remark,
      NumberOfPieces: bopData?.NumberOfPieces,
      SAPPartNumber: bopData?.SAPPartNumber,
      PartFamily: {
        label: bopData?.PartFamily || "",
        value: bopData?.PartFamilyId || ""
      }
    }
  }

  return {
    vendorWithVendorCodeSelectList, plantList, filterPlantList, filterCityListBySupplier, cityList, UOMSelectList,
    plantSelectList, bopCategorySelectList, bopData, partSelectList, partFamilySelectList, costingHead, fieldsObj, initialValues, initialConfiguration, clientSelectList, userMasterLevelAPI, costingSpecifiTechnology, exchangeRateSourceList, formValues
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
  getCityByCountryAction,
  getAllCity,
  getClientSelectList,
  getUsersMasterLevelAPI,
  getVendorNameByVendorSelectList,
  getCostingSpecificTechnology,
  getPartFamilySelectList,
  checkAndGetBopPartNo,
  getExchangeRateSource,
  getPlantUnitAPI,
  getBOPDataBySourceVendor,
  getExchangeRateByCurrency
})(reduxForm({
  form: 'AddBOPDomestic',
  touchOnChange: true,
  validate: validateForm,
  onSubmitFail: (errors) => {
    focusOnError(errors)
  },
  enableReinitialize: true,
})(withTranslation(['BOPMaster', 'MasterLabels'])(AddBOPDomestic)));
