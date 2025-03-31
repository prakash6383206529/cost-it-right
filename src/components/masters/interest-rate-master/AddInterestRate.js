import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, propTypes, clearFields } from "redux-form";
import { Row, Col, Label, } from 'reactstrap';
import { required, postiveNumber, maxLength10, nonZero, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, } from "../../../helper/validation";
import { renderDatePicker, renderMultiSelectField, renderText, renderTextInputField, searchableSelect, } from "../../layout/FormInputs";
import { updateInterestRate, createInterestRate, getPaymentTermsAppliSelectList, getICCAppliSelectList, getInterestRateData, } from '../actions/InterestRateMaster';
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import { MESSAGES } from '../../../config/message';
import { getConfigurationKey, loggedInUserId, userDetails } from "../../../helper/auth";
import DayTime from '../../common/DayTimeWrapper'
import "react-datepicker/dist/react-datepicker.css";
import LoaderCustom from '../../common/LoaderCustom';
import Toaster from '../../common/Toaster'
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import { CBCTypeId, SPACEBAR, VBCTypeId, VBC_VENDOR_TYPE, ZBC, ZBCTypeId, searchCount } from '../../../config/constants';
import { onFocus, showDataOnHover } from '../../../helper';
import { getClientSelectList, } from '../actions/Client';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate } from '../../common/CommonFunctions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getRawMaterialNameChild, getRMGradeSelectListByRawMaterial } from '../actions/Material'
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import WarningMessage from '../../common/WarningMessage';
import TooltipCustom from '../../common/Tooltip';
import { subDays } from 'date-fns';
import { labels, LabelsClass } from '../../../helper/core';
import { checkEffectiveDate } from '../masterUtil';

const selector = formValueSelector('AddInterestRate');

class AddInterestRate extends Component {
  static propTypes = { ...propTypes }
  constructor(props) {
    super(props);
    this.state = {
      vendorName: [],
      ICCApplicability: [],
      PaymentTermsApplicability: [],
      singlePlantSelected: [],
      isEditFlag: false,
      isViewMode: this.props?.data?.isViewMode ? true : false,
      isVendorNameNotSelected: false,
      InterestRateId: '',
      effectiveDate: '',
      Data: [],
      DropdownNotChanged: true,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      isDataChanged: this.props.data.isEditFlag,
      minEffectiveDate: '',
      showErrorOnFocus: false,
      costingTypeId: ZBCTypeId,
      client: [],
      showPopup: false,
      vendorFilterList: [],
      RawMaterial: [],
      RMGrade: [],
      isRawMaterialSelected: false,
      isGradeSelected: false,
      isEitherSectionFilled: false,
      isWarningVisible: true,
      ICCSectionFilled: {
        ICCApplicability: false,
        ICCPercent: false
      },
      PaymentSectionFilled: {
        PaymentTermsApplicability: false,
        RepaymentPeriod: false,
        // PaymentTermPercent: false,
      }
    }
  }
  /**
  * @method componentWillMount
  * @description called before render the component
  */
  UNSAFE_componentWillMount() {
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {
      // this.props.getVendorListByVendorType(true, this.state.vendorName, (res) => {
      // })
    }
  }
  /**
   * @method componentDidMount
   * @description called after render the component
   */
  componentDidMount() {
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })
    if (!(this.props.data.isEditFlag || this.state.isViewMode)) {
      this.props.getClientSelectList(() => { })
    }
    this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
    this.getDetail()
    this.props.getICCAppliSelectList(() => { })
    this.props.getPaymentTermsAppliSelectList(() => { })
    if (getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC) {
      this.props.getRawMaterialNameChild(() => { })
    }
    if (this.state.Data.length !== 0) {
      this.checkFilledSections()
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
    const { plantSelectList, paymentTermsSelectList, iccApplicabilitySelectList, clientSelectList, rawMaterialNameSelectList, gradeSelectList } = this.props;
    const temp = [];
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
    if (label === 'ICC') {
      const temp = [];
      let modifiedArray = iccApplicabilitySelectList;

      // Check if the conditions are met to filter out items starting with "Part"
      if (this.state.isRawMaterialSelected || this.state.isGradeSelected) {
        modifiedArray = iccApplicabilitySelectList.filter(item => {
          return !(item.Text.startsWith("Part"));
        });
      }
      let isPartSelected = false;

      // Iterate over the modifiedArray
      modifiedArray?.map((item) => {
        // Check conditions to exclude certain items
        if (item.Value !== '0' && item.Text !== 'Net Cost') {
          temp.push({ label: item.Text, value: item.Value });
        }
      });
      //if the selected data starts with part 

      return temp;
    }


    if (label === 'PaymentTerms') {
      paymentTermsSelectList && paymentTermsSelectList.map(item => {
        if (item.Value === '0' || item.Text === 'Net Cost') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null
      });
      return temp;
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
    const fieldsToClear = [
      'Mode',
      'vendorName',
      'Plant',
      'DestinationPlant',
      'clientName',
      'ICCPercent',
      'ICCApplicability',
      'PaymentTermsApplicability',
      'EffectiveDate',
      'RawMaterialGradeId',
      'RawMaterialId',
    ];
    fieldsToClear.forEach(fieldName => {
      this.props.dispatch(clearFields('AddInterestRate', false, false, fieldName));
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
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false });
    } else {
      this.setState({ vendorName: [], })
    }
  };
  /**
  * @method handleICCApplicability
  * @description called
  */
  handleICCApplicability = (newValue, actionMeta) => {
    const ICCSectionFilled = { ...this.state.ICCSectionFilled };
    ICCSectionFilled.ICCApplicability = newValue ? true : false;
    this.props.change("ICCPercent", '')

    if (newValue && newValue !== '') {
      this.setState(prevState => ({ ICCApplicability: newValue, ICCSectionFilled }), () => { this.checkFilledSections(); });
    } else {
      this.setState({ ICCApplicability: [], ICCSectionFilled })
    }
    if (this.state.ICCApplicability.value === newValue.value) {
      this.setState({ isDataChanged: true, DropdownNotChanged: true, ICCFilled: true, ICCSectionFilled })
    }
    else {
      this.setState({ isDataChanged: false, DropdownNotChanged: false, ICCFilled: false, ICCSectionFilled })
    }
  };


  // /**
  // * @method handlePaymentApplicability
  // * @description called
  // */
  handlePaymentApplicability = (newValue, actionMeta) => {
    const PaymentSectionFilled = { ...this.state.PaymentSectionFilled };
    PaymentSectionFilled.PaymentTermsApplicability = newValue ? true : false;

    this.props.change("RepaymentPeriod", '')
    this.props.change("PaymentTermPercent", '')
    if (newValue && newValue !== '') {
      this.setState(prevState => ({
        PaymentTermsApplicability: newValue,
        PaymentSectionFilled
      }), () => {
        this.checkFilledSections();
      });
    } else {
      this.setState({ PaymentTermsApplicability: [], PaymentSectionFilled })
    }
    if (this.state.PaymentTermsApplicability.value === newValue.value) {
      this.setState({ isDataChanged: true, DropdownNotChanged: true, PaymentSectionFilled })
    }
    else {
      this.setState({ isDataChanged: false, DropdownNotChanged: false, PaymentSectionFilled })
    }
  };

  /**
  * @method handleChangeAnnualIccPercentage
  * @description called
  */
  handleChangeAnnualIccPercentage = (newValue) => {
    const ICCSectionFilled = { ...this.state.ICCSectionFilled };
    ICCSectionFilled.ICCPercent = newValue ? true : false;

    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.Data.ICCPercent) &&
        String(this.state.ICCApplicability.label) === String(this.state.Data.ICCApplicability)) {
        this.setState(prevState => ({ isDataChanged: true, ICCSectionFilled }), () => { this.checkFilledSections(); });
      } else {
        this.setState(prevState => ({ isDataChanged: false, ICCSectionFilled }), () => { this.checkFilledSections(); });
      }
    } else {
      this.setState(prevState => ({ ICCSectionFilled }), () => { this.checkFilledSections(); });
    }
  };

  /**
  * @method handleChangeRepaymentPeriod
  * @description called
  */
  handleChangeRepaymentPeriod = (newValue) => {
    const PaymentSectionFilled = { ...this.state.PaymentSectionFilled };
    PaymentSectionFilled.RepaymentPeriod = newValue ? true : false;
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.Data.RepaymentPeriod) && String(this.state.PaymentTermsApplicability.label) === String(this.state.Data.PaymentTermApplicability)) {
        this.setState(prevState => ({ isDataChanged: true, PaymentSectionFilled }), () => { this.checkFilledSections(); });
      } else {
        this.setState(prevState => ({ isDataChanged: false, PaymentSectionFilled }), () => { this.checkFilledSections(); });
      }
    } else {
      this.setState(prevState => ({ PaymentSectionFilled }), () => { this.checkFilledSections(); });
    }
  };

  /**
  * @method handleChangePaymentTermPercentage
  * @description called
  */
  handleChangePaymentTermPercentage = (newValue) => {
    if (this.state.isEditFlag) {
      if (String(newValue) === String(this.state.Data.PaymentTermPercent) && String(this.state.PaymentTermsApplicability.label) === String(this.state.Data.PaymentTermApplicability)) {
        this.setState(prevState => ({ isDataChanged: true, }));
      } else {
        this.setState(prevState => ({ isDataChanged: false }));
      }
    }
  };
  /**
  * @method checkFilledSections
  * @description check each filed is filled or not
  */
  checkFilledSections = () => {
    const { ICCSectionFilled, PaymentSectionFilled, ICCApplicability, PaymentTermsApplicability } = this.state;
    let isICCFilled, isPaymentFilled
    if ((ICCApplicability && ICCApplicability.value !== "Fixed" && ICCApplicability.value !== undefined) ||
      (PaymentTermsApplicability && PaymentTermsApplicability.value !== "Fixed" && PaymentTermsApplicability.value !== undefined)) {
      isICCFilled = Object.values(ICCSectionFilled).some(value => value === false);
      isPaymentFilled = Object.values(PaymentSectionFilled).some(value => value === false);
    } else {
      isICCFilled = ICCSectionFilled.ICCApplicability === false; // Check only ICCApplicability key
      isPaymentFilled = PaymentSectionFilled.PaymentTermsApplicability === false; // Check only PaymentTermsApplicability key
    }
    const isWarningVisible = isICCFilled && isPaymentFilled;
    this.setState({ isWarningVisible: isWarningVisible });
  };



  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({ effectiveDate: DayTime(date).isValid() ? DayTime(date) : '', });
    this.setState({ DropdownNotChanged: false })
  };
  /** 
   * @method handlePlant
   * @description Used handle plants
   */
  handlePlant = (e) => {
    this.setState({ selectedPlants: e })
    this.setState({ DropdownNotChanged: false })
  }
  handleSinglePlant = (newValue) => {
    this.setState({ singlePlantSelected: newValue })
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
  * @method handleRMChange
  * @description  used to handle row material selection
  */
  handleRMChange = (newValue, actionMeta) => {
    this.setState({ isRawMaterialSelected: true });

    if (newValue && newValue !== '') {
      this.setState({ RawMaterial: newValue, RMGrade: [] }, () => {
        const { RawMaterial } = this.state
        this.props.getRMGradeSelectListByRawMaterial(
          RawMaterial.value,
          false,
          (res) => { },
        )
      })
    } else {
      this.setState({ RMGrade: [], RMSpec: [], RawMaterial: [] })
      this.props.getRMGradeSelectListByRawMaterial('', false, (res) => { })
      this.props.fetchSpecificationDataAPI(0, () => { })
    }
  }

  /**
   * @method handleGradeChange
   * @description  used to handle row material grade selection
   */
  handleGradeChange = (newValue, actionMeta) => {
    this.setState({ isGradeSelected: true });

    if (newValue && newValue !== '') {
      this.setState({ RMGrade: newValue })
    } else {
      this.setState({
        RMGrade: [],
      })
    }
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
        InterestRateId: data.ID,
      })
      this.props.getInterestRateData(data.ID, (res) => {
        if (res && res.data && res.data.Data) {
          let Data = res.data.Data;
          this.setState({
            Data: Data, ICCSectionFilled: {
              ICCApplicability: Data?.ICCApplicability != null,
              ICCPercent: Data?.ICCPercent != null,
            },
            PaymentSectionFilled: {
              PaymentTermsApplicability: Data.PaymentTermApplicability != null,
              RepaymentPeriod: Data?.RepaymentPeriod != null,
              // PaymentTermPercent: Data?.PaymentTermPercent != null,
            }
          });


          this.props.change("EffectiveDate", DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minEffectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
          setTimeout(() => {
            const { paymentTermsSelectList, iccApplicabilitySelectList, } = this.props;
            const iccObj = iccApplicabilitySelectList && iccApplicabilitySelectList.find(item => item.Value === Data.ICCApplicability)
            const paymentObj = paymentTermsSelectList && paymentTermsSelectList.find(item => item.Value === Data.PaymentTermApplicability)
            this.setState({
              isEditFlag: true,
              costingTypeId: Data.CostingTypeId,
              client: Data.CustomerName !== undefined ? { label: Data.CustomerName, value: Data.CustomerId } : [],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorIdRef } : [],
              selectedPlants: Data && Data.Plants[0] && Data.Plants[0]?.PlantId ? [{ Text: Data.Plants[0].PlantName, Value: Data.Plants[0]?.PlantId }] : [],
              singlePlantSelected: Data && Data.Plants[0] && Data.Plants[0].PlantId ? { label: Data.Plants[0].PlantName, value: Data.Plants[0].PlantId } : {},
              ICCApplicability: iccObj && iccObj !== undefined ? { label: iccObj.Text, value: iccObj.Value } : [],
              PaymentTermsApplicability: paymentObj && paymentObj !== undefined ? { label: paymentObj.Text, value: paymentObj.Value } : [],
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              RawMaterial: Data.RawMaterialName !== undefined ? { label: Data.RawMaterialName, value: Data.RawMaterialChildId } : [],
              RMGrade: Data.RawMaterialGrade !== undefined ? { label: Data.RawMaterialGrade, value: Data.RawMaterialGradeId } : [],
            }, () => this.setState({ isLoader: false }))
          }, 500)

        }
      })
    } else {
      this.setState({
        isLoader: false,
      })
      this.props.getInterestRateData('', () => { })
    }
  }


  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      vendorName: [],
      isEditFlag: false,
    })
    this.props.getInterestRateData('', () => { })
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
  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */

  onSubmit = debounce((values) => {
    const { Data, vendorName, costingTypeId, client, ICCApplicability, singlePlantSelected, selectedPlants, PaymentTermsApplicability, InterestRateId, effectiveDate, DropdownNotChanged, RMGrade, RawMaterial } = this.state;
    const { data } = this.props
    const userDetail = userDetails()
    const userDetailsInterest = JSON.parse(localStorage.getItem('userDetail'))
    let plantArray = []
    if (costingTypeId === VBCTypeId) {
      plantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value })
    } else {
      selectedPlants && selectedPlants.map((item) => {
        plantArray.push({ PlantName: item.Text, PlantId: item.Value })
        return plantArray
      })
    }
    let cbcPlantArray = []
    if (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant) {
      cbcPlantArray.push({ PlantName: singlePlantSelected.label, PlantId: singlePlantSelected.value })
    }
    else {
      userDetailsInterest?.Plants.map((item) => {
        cbcPlantArray.push({ PlantName: item.PlantName, PlantId: item.PlantId, PlantCode: item.PlantCode, })
        return cbcPlantArray
      })
    }


    if (costingTypeId !== CBCTypeId && vendorName.length <= 0) {

      if (costingTypeId === VBCTypeId) {
        this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
        return false
      }
    }
    this.setState({ isVendorNameNotSelected: false })

    /** Update existing detail of supplier master **/
    if (this.state.isEditFlag) {

      if (Data.ICCApplicability === ICCApplicability.label && Data.ICCPercent === values.ICCPercent &&
        Data.PaymentTermApplicability === PaymentTermsApplicability.label &&
        Data.PaymentTermPercent === values.PaymentTermPercent &&
        Data.RepaymentPeriod === values.RepaymentPeriod && DropdownNotChanged) {

        this.cancel('cancel')
        return false;
      }
      // this.setState({ setDisable: true })
      let updateData = {
        VendorInterestRateId: InterestRateId,
        ModifiedBy: loggedInUserId(),
        VendorName: costingTypeId === VBCTypeId ? vendorName.label : userDetail.ZBCSupplierInfo.VendorName,
        ICCApplicability: ICCApplicability.value,
        PaymentTermApplicability: PaymentTermsApplicability.value,
        CostingTypeId: costingTypeId,
        VendorIdRef: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        ICCPercent: values.ICCPercent,
        PaymentTermPercent: values.PaymentTermPercent,
        RepaymentPeriod: values.RepaymentPeriod,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        RawMaterialChildId: RawMaterial?.value,
        RawMaterialName: RawMaterial?.label,
        RawMaterialGradeId: RMGrade?.value,
        RawMaterialGrade: RMGrade?.label,
        IsFinancialDataChanged: data?.IsAssociatedData && !this.state.isDataChanged
      }
      let financialDataChanged = (Number(Data?.ICCPercent) !== Number(values?.ICCPercent)) || (Number(Data?.PaymentTermPercent) !== Number(values?.PaymentTermPercent)) || (Number(Data?.RepaymentPeriod) !== Number(values?.RepaymentPeriod) || Number(Data?.ICCApplicability) !== Number(values?.ICCApplicability.value) || Number(Data?.PaymentTermApplicability) !== Number(values?.PaymentTermsApplicability.value))
      if (data?.IsAssociatedData) {
        if (financialDataChanged && checkEffectiveDate(effectiveDate, Data?.EffectiveDate)) {
          Toaster.warning('Please update the Effective date.')
          return false
        }
      }
      if (this.state.isEditFlag) {
        this.props.updateInterestRate(updateData, (res) => {
          this.setState({ setDisable: false })
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.UPDATE_INTEREST_RATE_SUCESS);
            this.cancel('submit')
          }
        });
      }


    } else {/** Add new detail for creating operation master **/

      this.setState({ setDisable: true })
      let formData = {
        CostingTypeId: costingTypeId,
        VendorIdRef: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        ICCApplicability: ICCApplicability.label,
        ICCPercent: values.ICCPercent,
        PaymentTermApplicability: PaymentTermsApplicability.label,
        PaymentTermPercent: values.PaymentTermPercent,
        RepaymentPeriod: values.RepaymentPeriod,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        IsActive: true,
        CreatedDate: '',
        CreatedBy: loggedInUserId(),
        Plants: costingTypeId === CBCTypeId ? cbcPlantArray : plantArray,
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        RawMaterialChildId: RawMaterial?.value,
        RawMaterialName: RawMaterial?.label,
        RawMaterialGradeId: RMGrade?.value,
        RawMaterialGrade: RMGrade?.label,
      }

      this.props.createInterestRate(formData, (res) => {
        this.setState({ setDisable: false })
        if (res?.data?.Result) {
          // toastr.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS);
          Toaster.success(MESSAGES.INTEREST_RATE_ADDED_SUCCESS)
          this.cancel('submit');

        }
      });
    }

  }, 500)

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { isWarningVisible } = this.state;
    let pos_drop_down = "auto"
    if (window.screen.width > 1366) {
      pos_drop_down = "auto";
    }
    else {
      pos_drop_down = "top";
    }
    const { handleSubmit, t } = this.props;
    const { isEditFlag, isViewMode, setDisable, costingTypeId, isDataChanged } = this.state;
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
        {this.state.isLoader && <LoaderCustom />}
        <div className="login-container signup-form">
          <div className="row">
            <div className="col-md-12">
              <div className="shadow-lgg login-formg">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-heading mb-0">
                      <h1>{this.state.isViewMode ? "View" : this.state.isEditFlag ? "Update" : "Add"} Interest Rate
                        {!isViewMode && <TourWrapper
                          buttonSpecificProp={{ id: "Add_Interest_Rate_Form" }}
                          stepsSpecificProp={{
                            steps: Steps(t, {
                              PaymentTermsApplicability: this.state.PaymentTermsApplicability,
                              ICCApplicability: this.state.ICCApplicability,
                              isEditFlag: isEditFlag,
                              vendorField: (costingTypeId === VBCTypeId),
                              customerField: (costingTypeId === CBCTypeId),
                              plantField: (costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate),
                              destinationPlant: ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant))
                            }).ADD_INTEREST_RATE
                          }} />}</h1>
                    </div>
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
                        {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id='AddInterestRate_ZeroBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                        {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id='AddInterestRate_VendorBased' className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
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
                        {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="AddInterestRate_CustomerBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
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
                      {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC &&
                        <>                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <Field
                                name="RawMaterialId"
                                type="text"
                                label="Raw Material Name"
                                component={searchableSelect}
                                placeholder={"Select"}
                                options={this.renderListing("material")}
                                validate={this.state.RawMaterial == null || this.state.RawMaterial.length === 0 ? [required] : []}
                                required={!this.state.isPartSelected}
                                handleChangeDescription={this.handleRMChange}
                                valueDescription={this.state.RawMaterial}
                                className="fullinput-icon"
                                disabled={isEditFlag || isViewMode || this.state.isPartSelected}
                              />
                            </div>
                          </div>
                        </Col>
                          <Col md="3">
                            <div className="d-flex justify-space-between align-items-center inputwith-icon">
                              <div className="fullinput-icon">
                                <Field
                                  name="RawMaterialGradeId"
                                  type="text"
                                  label="Raw Material Grade"
                                  component={searchableSelect}
                                  placeholder={"Select"}
                                  options={this.renderListing("grade")}
                                  validate={this.state.RMGrade == null || this.state.RMGrade.length === 0 ? [required] : []}
                                  required={!this.state.isPartSelected}
                                  handleChangeDescription={this.handleGradeChange}
                                  valueDescription={this.state.RMGrade}
                                  disabled={isEditFlag || isViewMode || this.state.isPartSelected}
                                />
                              </div>
                            </div>
                          </Col>
                        </>
                      }
                      {/* {((costingTypeId === ZBCTypeId && getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate) && ( */}
                      {((costingTypeId === ZBCTypeId) && (
                        <Col md="3">
                          <Field
                            label="Plant (Code)"
                            name="Plant"
                            placeholder={"Select"}
                            title={showDataOnHover(this.state.selectedPlants)}
                            selection={
                              this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [] : this.state.selectedPlants}
                            options={this.renderListing("plant")}
                            selectionChanged={this.handlePlant}
                            validate={
                              this.state.selectedPlants == null || this.state.selectedPlants.length === 0 ? [required] : []}
                            required={true}
                            optionValue={(option) => option.Value}
                            optionLabel={(option) => option.Text}
                            component={renderMultiSelectField}
                            mendatory={true}
                            disabled={isEditFlag || isViewMode}
                            className="multiselect-with-border"
                          />
                        </Col>)
                      )}

                      {costingTypeId === VBCTypeId && (
                        <Col md="3" className='mb-4'>

                          <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                          <div className='p-relative'>
                            {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                            <AsyncSelect
                              id="AddInterestRate_VendorName_container"
                              name="vendorName"
                              ref={this.myRef}
                              key={this.state.updateAsyncDropdown}
                              loadOptions={filterList}
                              onChange={(e) => this.handleVendorName(e)}
                              noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                              value={this.state.vendorName} isDisabled={(isEditFlag) ? true : false}
                              onKeyDown={(onKeyDown) => {
                                if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                              }}
                              onFocus={() => onFocus(this)}
                            />
                            {((this.state.showErrorOnFocus && this.state.vendorName.length === 0) || this.state.isVendorNameNotSelected) && <div className='text-help mt-1'>This field is required.</div>}
                          </div>
                        </Col>
                      )}
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
                      {
                        ((costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) &&
                        <Col md="3">
                          <Field
                            label={'Plant (Code)'}
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
                            disabled={isEditFlag || isViewMode}
                          />
                        </Col>
                      }
                    </Row >

                    <Row>
                      <Col md="12">
                        <div className="left-border">{"ICC:"}</div>
                      </Col>
                      <Col md="3">
                        <Field
                          name="ICCApplicability"
                          type="text"
                          label="ICC Applicability"
                          component={searchableSelect}
                          placeholder={isViewMode ? '-' : "Select"}
                          options={this.renderListing("ICC")}
                          // validate={
                          //   this.state.ICCApplicability == null ||
                          //     this.state.ICCApplicability.length === 0
                          //     ? [required]
                          //     : []
                          // }

                          handleChangeDescription={
                            this.handleICCApplicability
                          }
                          valueDescription={this.state.ICCApplicability}
                          disabled={isViewMode}
                        />
                      </Col>
                      {
                        this.state.ICCApplicability.label !== 'Fixed' &&

                        <Col md="3">
                          <Field
                            id='AddInterestRate_AnnualICC'
                            label={`Annual ICC (%)`}
                            name={"ICCPercent"}
                            type="text"
                            placeholder={isViewMode ? '-' : "Enter"}
                            validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, nonZero]}
                            component={renderText}
                            onChange={(event) => this.handleChangeAnnualIccPercentage(event.target.value)}
                            disabled={isViewMode}
                            className=" "
                            customClassName=" withBorder"
                          />
                        </Col>
                      }

                    </Row>

                    <Row>
                      <Col md="12">
                        <div className="left-border">{"Payment Terms:"}</div>
                      </Col>
                      <Col md="3">
                        <Field
                          name="PaymentTermsApplicability"
                          menuPlacement={pos_drop_down}
                          type="text"
                          label="Payment Terms Applicability"
                          component={searchableSelect}
                          placeholder={isViewMode ? '-' : "Select"}
                          options={this.renderListing("PaymentTerms")}
                          validate={
                            this.state.PaymentTermsApplicability == null ||
                              this.state.PaymentTermsApplicability.length === 0
                              ? []
                              : []
                          }
                          required={false}
                          handleChangeDescription={
                            this.handlePaymentApplicability
                          }
                          valueDescription={
                            this.state.PaymentTermsApplicability
                          }
                          disabled={isViewMode}
                        />
                      </Col>
                      {
                        this.state.PaymentTermsApplicability.label !== 'Fixed' &&
                        <>

                          <Col md="3">
                            <Field
                              id="AddInterestRate_RepaymentPeriod"
                              label={`Repayment Period (Days)`}
                              name={"RepaymentPeriod"}
                              type="text"
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[postiveNumber, maxLength10, nonZero, number]}
                              component={renderTextInputField}
                              required={false}
                              onChange={(event) => this.handleChangeRepaymentPeriod(event.target.value)}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                          <Col md="3">
                            <TooltipCustom id="PaymentTermPercent" width="350px" tooltipText="Manage payment term percentages here or in costing as needed." />
                            <Field
                              id="AddInterestRate_PaymentTermPercent"
                              label={`Payment Term (%)`}
                              name={"PaymentTermPercent"}
                              type="text"
                              placeholder={isViewMode ? '-' : "Enter"}
                              validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation, nonZero]}
                              component={renderText}
                              required={false}
                              onChange={(event) => this.handleChangePaymentTermPercentage(event.target.value)}
                              disabled={isViewMode}
                              className=" "
                              customClassName=" withBorder"
                            />
                          </Col>
                        </>
                      }
                      <Col md="3">
                        <div className="form-group">

                          <div className="inputbox date-section">

                            <Field
                              label="Effective Date"
                              name="EffectiveDate"
                              placeholder="Select date"
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
                              disabled={isViewMode}
                              className="form-control"
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div >

                  <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn">
                      {isWarningVisible && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message="Either ICC or Payment Term should be filled!" />}
                      <button
                        id='AddInterestRate_Cancel'
                        type={"button"}
                        className=" mr15 cancel-btn"
                        onClick={this.cancelHandler}
                        disabled={setDisable}
                      >
                        <div className={"cancel-icon"}></div>
                        {"Cancel"}
                      </button>
                      {!isViewMode && <button
                        type="submit"
                        id='AddInterestRate_Save'
                        disabled={isWarningVisible || isViewMode || setDisable}
                        className="user-btn mr5 save-btn"
                      >
                        <div className={"save-icon"}></div>
                        {isEditFlag ? "Update" : "Save"}
                      </button>}
                    </div>
                  </Row>
                </form>
              </div>
            </div>
          </div>
        </div>
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
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
  const { interestRate, comman, client, material } = state;

  const filedObj = selector(state, 'ICCPercent', 'PaymentTermPercent');


  const { paymentTermsSelectList, iccApplicabilitySelectList, interestRateData } = interestRate;
  const { vendorWithVendorCodeSelectList, plantSelectList } = comman;
  const { clientSelectList } = client;
  const { rawMaterialNameSelectList, gradeSelectList } = material
  let initialValues = {};
  if (interestRateData && interestRateData !== undefined) {
    initialValues = {
      ICCPercent: interestRateData.ICCPercent,
      RepaymentPeriod: interestRateData.RepaymentPeriod,
      PaymentTermPercent: interestRateData.PaymentTermPercent,

    }
  }

  return {
    paymentTermsSelectList, iccApplicabilitySelectList, plantSelectList, vendorWithVendorCodeSelectList, interestRateData, initialValues, filedObj, clientSelectList, rawMaterialNameSelectList, gradeSelectList
  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  updateInterestRate,
  getPlantSelectListByType,
  createInterestRate,
  getInterestRateData,
  getPaymentTermsAppliSelectList,
  getICCAppliSelectList,
  getClientSelectList,
  getRawMaterialNameChild,
  getRMGradeSelectListByRawMaterial
})(reduxForm({
  form: 'AddInterestRate',
  enableReinitialize: true,
  touchOnChange: true
})(withTranslation(['InterestRate'])(AddInterestRate)));


