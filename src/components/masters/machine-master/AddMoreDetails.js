import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table, Label } from 'reactstrap';
import {
  required, checkForNull, number, acceptAllExceptSingleSpecialCharacter, maxLength10,
  maxLength80, checkWhiteSpaces, checkForDecimalAndNull, postiveNumber, positiveAndDecimalNumber, maxLength20, maxLength3, decimalNumberLimit,
  maxLength512, decimalLengthFour, decimalLengthThree, decimalLength2, decimalLengthsix, checkSpacesInString, maxValue366, percentageLimitValidation, maxPercentValue, hashValidation, maxValue24, getNameBySplitting,
  validateFileName
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, focusOnError, renderDatePicker, renderTextInputField, renderNumberInputField, validateForm } from "../../layout/FormInputs";
import { getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, getShiftTypeSelectList, getDepreciationTypeSelectList, getExchangeRateSource, getCurrencySelectList, } from '../../../actions/Common';
import {
  createMachineDetails, updateMachineDetails, getMachineDetailsData, getMachineTypeSelectList, getProcessesSelectList,
  getFuelUnitCost, getLabourCost, getPowerCostUnit, fileUploadMachine, getProcessGroupByMachineId, setGroupProcessList, setProcessList,
  checkAndGetMachineNumber
} from '../actions/MachineMaster';
import { getLabourTypeByMachineTypeSelectList } from '../actions/Labour';
import { getFuelByPlant, getFuelList, } from '../actions/Fuel';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { EMPTY_DATA, EMPTY_GUID, TIME, ZBCTypeId, VBCTypeId, CBCTypeId, CRMHeads, GUIDE_BUTTON_SHOW, LOGISTICS, ENTRY_TYPE_IMPORT, ENTRY_TYPE_DOMESTIC } from '../../../config/constants'
import { loggedInUserId, userDetails, getConfigurationKey } from "../../../helper/auth";
import Switch from "react-switch";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FILE_URL, WDM, SLM, ZBC, HOUR, MACHINE_MASTER_ID } from '../../../config/constants';
import HeaderTitle from '../../common/HeaderTitle';
import AddMachineTypeDrawer from './AddMachineTypeDrawer';
import AddProcessDrawer from './AddProcessDrawer';
import NoContentFound from '../../common/NoContentFound';
import { calculatePercentage, CheckApprovalApplicableMaster, compareObjects, displayUOM, userTechnologyDetailByMasterId } from '../../../helper';
import EfficiencyDrawer from './EfficiencyDrawer';
import DayTime from '../../common/DayTimeWrapper'
import { AcceptableMachineUOM } from '../../../config/masterData'
import imgRedcross from '../../../assests/images/red-cross.png'
import MasterSendForApproval from '../MasterSendForApproval'
import { animateScroll as scroll } from 'react-scroll';
import { ProcessGroup } from '../masterUtil';
import _ from 'lodash'
import LoaderCustom from '../../common/LoaderCustom';
import TooltipCustom from '../../common/Tooltip';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import { convertIntoCurrency, costingTypeIdToApprovalTypeIdFunction, getEffectiveDateMaxDate, getEffectiveDateMinDate,checkEffectiveDate } from '../../common/CommonFunctions';
import WarningMessage from '../../common/WarningMessage';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next'
import Button from '../../layout/Button';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getPlantUnitAPI } from '../actions/Plant';
import { LabelsClass } from '../../../helper/core';

const selector = formValueSelector('AddMoreDetails');

class AddMoreDetails extends Component {
  constructor(props) {

    super(props);
    this.child = React.createRef();
    const editDetails = this.props.editDetails ?? {};
    this.state = {
      MachineId: '',
      isEditFlag: false,
      IsPurchased: false,
      isViewFlag: false,
      isDateChange: false,
      selectedTechnology: editDetails.selectedTechnology ?? [],
      selectedPlants: Object.keys(editDetails.selectedPlants).length > 0 ? editDetails.selectedPlants : {},
      machineType: editDetails?.machineType ?? [],
      isOpenMachineType: false,
      machineRate: "",
      disableMachineType: false,
      isOpenAvailability: false,
      WorkingHrPrYr: 0,
      isFinalUserEdit: false,
      MachineID: EMPTY_GUID,

      shiftType: [],
      approvalObj: {},
      depreciationType: [],
      DateOfPurchase: '',

      IsAnnualMaintenanceFixed: false,
      IsAnnualConsumableFixed: false,
      IsInsuranceFixed: false,
      isViewMode: false,

      IsUsesFuel: false,
      IsUsesSolarPower: false,
      fuelType: [],
      isFinalApprovar: false,
      approveDrawer: false,
      labourType: [],
      labourGrid: [],
      isEditLabourIndex: false,
      labourGridEditIndex: '',
      processName: [],
      isOpenProcessDrawer: false,
      processGrid: [],
      processGridEditIndex: '',
      isEditIndex: false,
      remarks: '',
      files: [],
      powerId: '',
      manufactureYear: new Date(),
      machineFullValue: {},
      isLoanOpen: false,
      isWorkingOpen: false,
      isDepreciationOpen: false,
      isVariableCostOpen: false,
      isPowerOpen: false,
      isLabourOpen: false,
      isProcessOpen: false,
      isProcessGroupOpen: false,
      UOM: [],
      effectiveDate: editDetails.selectedEffectiveDate ?? '',
      minDate: '',
      updatedObj: {},
      lockUOMAndRate: false,
      isProcessGroup: getConfigurationKey().IsMachineProcessGroup, // UNCOMMENT IT AFTER DONE FROM BACKEND AND REMOVE BELOW CODE
      // isProcessGroup: true
      attachmentLoader: false,
      formDataState: {},
      rowData: [],
      IsFinancialDataChanged: true,
      disableAllForm: false,
      NoOfWorkingHours: 0,
      errorObj: {
        labourType: false,
        peopleCount: false,
        processName: false,
        processUOM: false,
        processMachineRate: false,
        groupName: false
      },
      UOMName: 'UOM',
      FuelEntryId: '',
      DataToChange: [],
      labourDetailId: '',
      IsIncludeMachineRateDepreciation: false,
      powerIdFromAPI: null,
      finalApprovalLoader: getConfigurationKey().IsDivisionAllowedForDepartment || !(getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) ? false : true,
      showPopup: false,
      levelDetails: {},
      selectedCustomer: editDetails.selectedCustomer ?? [],
      selectedVedor: editDetails.vendorName ?? [],
      costingTypeId: editDetails?.costingTypeId || null,
      CostingTypeId: editDetails?.costingTypeId,
      vendorId: null,
      customerId: null,
      IsSendForApproval: false,
      LabourCRMHead: '',
      crmHeads: {},
      updateCrmHeadObj: {},
      CostingTypePermission: false,
      disableSendForApproval: false,
      tourContainer: {
        initial: false,
        loanTour: false,
        workingHoursTour: false,
        depreciationTour: false,
        variableCostTour: false,
        powerTour: false,
        labourTour: false,
        processTour: false,
        processGroupTour: false
      },
      UniqueProcessId: [],
      ExchangeSource: editDetails?.ExchangeSource || "",
      entryType: editDetails?.entryType || null,
      powerIsImport: false,
      //plantCurrency: editDetails?.fieldsObj?.plantCurrency || "",
      currency: editDetails?.currency ?? null,
      plantCurrency: editDetails?.plantCurrency || null,
      settlementCurrency: editDetails?.settlementCurrency || null,
      plantExchangeRateId: editDetails?.plantExchangeRateId || '',
      settlementExchangeRateId: editDetails?.settlementExchangeRateId || '',
      plantCurrencyID: editDetails?.plantCurrencyID || '',
      hidePlantCurrency: editDetails?.hidePlantCurrency ? editDetails?.hidePlantCurrency : false,
      showPlantWarning: false,
      showWarning: false,
      disableEffectiveDate: false,
      isImport: editDetails?.entryType,
      MachineRateWithOutInterestAndDepreciation: null,
      MachineRateWithOutInterestAndDepreciationLocalConversion: null,
      MachineRateWithOutInterestAndDepreciationConversion: null
    }
    this.dropzone = React.createRef();
  }


  /**
   * @method componentDidMount
   * @description Called after rendering the component
  */
  componentDidMount() {
    const { initialConfiguration, editDetails } = this.props
    this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
    this.props.getMachineTypeSelectList(() => { })
    this.props.getUOMSelectList(() => { })
    this.props.getProcessesSelectList(() => { })
    this.props.getShiftTypeSelectList(() => { })
    this.props.getDepreciationTypeSelectList(() => { })
    this.props.getExchangeRateSource(() => { })

    this.props.change('plantCurrency', editDetails?.fieldsObj?.plantCurrency ?? '')
    this.props.change('ExchangeSource', editDetails?.ExchangeSource ?? {})
    this.props.change('EffectiveDate', editDetails?.fieldsObj?.EffectiveDate ?? "")
    this.props.change('MachineName', editDetails?.fieldsObj?.MachineName ?? "")
    this.props.change('MachineNumber', editDetails?.fieldsObj?.MachineNumber ?? "")
    this.props.change('Specification', editDetails?.fieldsObj?.Specification ?? "")
    this.props.change('TonnageCapacity', editDetails?.fieldsObj?.TonnageCapacity ?? "")
    this.setState({ hidePlantCurrency: editDetails?.hidePlantCurrency ?? false })
    //this.props.change('MachineType', editDetails?.fieldsObj?.MachineType ?? "")
    //this.props.change('currency', editDetails?.currency ?? {})
    if (this.state?.selectedPlants?.value && this.state?.selectedPlants?.value !== null) {
      const PlantId = Array.isArray(this.state.selectedPlants) ? this.state.selectedPlants[0]?.value : this.state.selectedPlants?.value;
      if (editDetails?.machineType?.value) {
        const data = {
          machineTypeId: editDetails?.machineType?.value ? editDetails?.machineType?.value : '',
          plantId: PlantId,
          effectiveDate: editDetails?.fieldsObj?.EffectiveDate ? editDetails?.fieldsObj.EffectiveDate : '',
          vendorId: this.state.selectedVedor?.value ? this.state.selectedVedor?.value : '',
          customerId: this.state?.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
          costingTypeId: this.state?.CostingTypeId || null,


        }
        this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
      }
      let obj = {
        plantId: PlantId,
        vendorId: this.state.selectedVedor?.value ? this.state.selectedVedor?.value : '',
        customerId: this.state.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
        costingTypeId: this.state.CostingTypeId || null,
        entryType: this.state.powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
        countryId: this.state.countryId || null,
        stateId: this.state.stateId || null,
        cityId: this.state.cityId || null
      }
      this.props.getFuelByPlant(obj, () => { })
      //this.props.getFuelList(obj, () => { })
    }
    if (!this.props?.editDetails?.isEditFlag) {
      this.props.change('EquityPercentage', 100)
    }
    /*WHEN DATE IS COME FROM FIRST FORM */
    this.props.change('MachineName', editDetails?.fieldsObj?.MachineName)
    this.props.change('MachineNumber', editDetails?.fieldsObj?.MachineNumber)
    this.props.change('TonnageCapacity', editDetails?.fieldsObj?.TonnageCapacity)
    this.props.change('Description', editDetails?.fieldsObj?.Description)
    this.props.change('Specification', editDetails?.fieldsObj?.Specification)
    this.props.change('EffectiveDate', editDetails?.selectedEffectiveDate)
    this.setState({ machineType: editDetails?.machineType })
    if (initialConfiguration.IsAutoGeneratedMachineNumber && editDetails && editDetails.isEditFlag === false) {
      this.props.checkAndGetMachineNumber('', res => {
        let Data = res.data.DynamicData;
        this.props.change('MachineNumber', Data.MachineNumber)
      })
    }
    if (!getConfigurationKey().IsDivisionAllowedForDepartment && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
      this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
    } else {
      this.setState({ finalApprovalLoader: false })
    }
    this.getDetails()
    this.props.getCurrencySelectList(() => { })

    // if (this.props.fieldsObj !== prevProps.fieldsObj) {
    //   this.handleCalculation()
    // }
  }

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false })
    if (type === 'submit') {

      //this.clearForm()
      setTimeout(() => {
        let formData = this.state.formDataState
        formData.isViewFlag = true
        formData.hidePlant = this.state?.hidePlantCurrency
        this.props.hideMoreDetailsForm(formData)
        //Toaster.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
        this.cancel()
        //this.cancel()
      }, 600);

    }
  }
  finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision = false) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewMode && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), MACHINE_MASTER_ID, null, (res) => {
        setTimeout(() => {
          this.commonFunction(plantId, isDivision)
        }, 100);
      })
    } else {
      this.setState({ finalApprovalLoader: false })
    }
  }
  commonFunction(plantId = EMPTY_GUID, isDivision = false) {
    let levelDetailsTemp = []
    levelDetailsTemp = userTechnologyDetailByMasterId(this.state.CostingTypeId, MACHINE_MASTER_ID, this.props.userMasterLevelAPI)
    this.setState({ levelDetails: levelDetailsTemp })
    let obj = {
      TechnologyId: MACHINE_MASTER_ID,
      DepartmentId: userDetails().DepartmentId,
      UserId: loggedInUserId(),
      Mode: 'master',
      approvalTypeId: costingTypeIdToApprovalTypeIdFunction(this.state.CostingTypeId),
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

  UNSAFE_componentWillReceiveProps(nextProps) {

    setTimeout(() => {
      if (nextProps.data !== this.props.data) {
        const { fieldsObj, machineType, selectedPlants, selectedTechnology, selectedCustomer, selectedVedor, costingTypeId, vendorName, client } = nextProps.data;
        if (selectedPlants && Object.keys(selectedPlants)?.length > 0) {
          const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
          this.handlePlants(selectedPlants)
          if (machineType.value) {
            const data = {
              machineTypeId: machineType?.value ? machineType?.value : '',
              plantId: PlantId,
              effectiveDate: fieldsObj?.EffectiveDate ? fieldsObj.EffectiveDate : '',
              vendorId: selectedVedor?.value ? selectedVedor?.value : '',
              customerId: selectedCustomer?.value ? selectedCustomer?.value : '',
              costingTypeId: costingTypeId || null,


            }
            this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
          }
        }

        // this.setState({ costingTypeId: costingTypeId, vendorId: vendorName.value ? vendorName.value : '', customerId: client.value ? client.value : '' })
        this.props.change('MachineName', fieldsObj.MachineName)
        this.props.change('MachineNumber', fieldsObj.MachineNumber)
        this.props.change('TonnageCapacity', fieldsObj.TonnageCapacity)
        this.props.change('Description', fieldsObj.Description)
        this.props.change('Specification', fieldsObj.Specification)
        fieldsObj.EffectiveDate && this.props.change('EffectiveDate', fieldsObj.EffectiveDate)

        setTimeout(() => {
          this.setState({ selectedPlants: selectedPlants, })
          setTimeout(() => {
            if (fieldsObj?.EffectiveDate) {
              this.handleEffectiveDateChange(fieldsObj?.EffectiveDate)
              this.setState({ isDateChange: false })
            }
            if (Object.keys(machineType)?.length === 0) {
            } else {
              this.handleMachineType(machineType)
            }
          }, 200);
        }, 1500);
        this.setState({
          fieldsObj: fieldsObj,
          selectedTechnology: selectedTechnology,
          machineType: machineType,
          effectiveDate: fieldsObj.EffectiveDate ? fieldsObj.EffectiveDate : '',
          minDate: fieldsObj.EffectiveDate ? fieldsObj.EffectiveDate : '',
          selectedCustomer: selectedCustomer,
          selectedVedor: selectedVedor,
          CostingTypeId: costingTypeId
        }, () => {
          // if (machineType && machineType.value) {
          //   this.props.getLabourTypeByMachineTypeSelectList(machineType.value ? machineType.value : 0, () => { })
          // }
        })
      }

    }, 800);
  }


  // componentDidUpdate() {

  //   if (this.state.processGrid?.length === 0) {
  //     this.setState({ disableAllForm: false })
  //   } else {
  //     this.setState({ disableAllForm: true })
  //   }

  // }

  /**
  * @method onPressOwnership
  * @description Used for Vendor checked
  */
  onPressOwnership = () => {
    this.setState({ IsPurchased: !this.state.IsPurchased, });
  }

  /**
  * @method handleMessageChange
  * @description used remarks handler
  */
  handleMessageChange = (e) => {
    this.setState({
      remarks: e?.target?.value
    })
  }

  /**
  * @method getDetails
  * @description Used to get Details
  */
  getDetails = () => {
    const { editDetails } = this.props;

    if (editDetails && editDetails.isEditFlag) {

      this.setState({
        isEditFlag: false,
        isLoader: true,
        MachineID: editDetails.Id,
        isViewMode: editDetails.isViewMode,
        isViewFlag: editDetails.isViewMode
      })

      this.props.getMachineDetailsData(editDetails.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          this.setState({ DataToChange: Data, labourGrid: Data.MachineLabourRates })
          if (Data.MachineLabourRates && Data.MachineLabourRates.length !== 0) {
            this.setState({ disableMachineType: true })
          }
          this.props.getProcessGroupByMachineId(Data.MachineId, res => {
            // SET GET API STRUCTURE IN THE FORM OF SAVE API STRUCTURE BY DEFAULT
            let updateArrayList = []
            let tempArray = []
            let singleRecordObject = {}
            res?.data?.DataList && res?.data?.DataList.map((item) => {
              singleRecordObject = {}
              let ProcessIdListTemp = []
              tempArray = item.GroupName
              item.ProcessList && item.ProcessList.map((item1) => {
                ProcessIdListTemp.push(item1.ProcessId)
                return null
              })
              singleRecordObject.ProcessGroupName = tempArray
              singleRecordObject.ProcessIdList = ProcessIdListTemp
              updateArrayList.push(singleRecordObject)
              return null
            })
            this.props.setGroupProcessList(updateArrayList)

            // TO DISABLE DELETE BUTTON WHEN GET DATA API CALLED (IN EDIT)
            let uniqueProcessId = []
            _.uniqBy(res?.data?.DataList, function (o) {
              uniqueProcessId.push(o?.ProcessId)
            });
            let allProcessId = []
            res?.data?.DataList && res?.data?.DataList.map((item) => {
              let ProcessIdListTemp = []
              item.ProcessList && item.ProcessList.map((item1) => {
                ProcessIdListTemp.push(item1.ProcessId)
                return null
              })

              allProcessId = [...allProcessId, ...ProcessIdListTemp]
              return null
            })
            let uniqueSet = [...new Set(allProcessId)]
            this.props.setProcessList(uniqueSet)
            this.setState({ UniqueProcessId: uniqueSet })

          })
          if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
            this.setState({ hidePlantCurrency: false })
          } else {
            this.setState({ hidePlantCurrency: true })
          }
          this.props.change('plantCurrency', Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrency : Data?.Currency)
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change('TotalFuelCostPerYear', Data.TotalFuelCostPerYear ? Data.TotalFuelCostPerYear : '')
          this.props.change('ConsumptionPerYear', Data.ConsumptionPerYear ? Data.ConsumptionPerYear : '')
          this.props.change('FuelCostPerUnit', Data.FuelCostPerUnit ? Data.FuelCostPerUnit : '')
          this.setState({ minDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
          const { machineType, effectiveDate, selectedCustomer, selectedVedor, costingTypeId } = this.state;
          let plantObj;
          if (Data && Data?.Plant?.length > 0) {
            plantObj = Data?.Plant?.map(plant => ({ label: plant?.PlantName, value: plant?.PlantId }));
          }
          if (machineType.value) {
            const data = {
              machineTypeId: machineType?.value,
              plantId: Data.Plant[0].PlantId,
              effectiveDate: effectiveDate,
              vendorId: selectedVedor?.value ? selectedVedor?.value : '',
              customerId: selectedCustomer?.value ? selectedCustomer?.value : '',
              costingTypeId: costingTypeId || null,
            }
            this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
          }
          const PlantId = Array.isArray(this.state.selectedPlants) ? this.state.selectedPlants[0]?.value : this.state.selectedPlants?.value;
          if (Data && Data.Plant[0]?.PlantId) {
            let obj = {
              plantId: PlantId,
              vendorId: this.state.selectedVedor?.value ? this.state.selectedVedor?.value : '',
              customerId: this.state.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
              costingTypeId: this.state.CostingTypeId || null,
              powerIsImport: this.state.powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
              countryId: this.state.countryId || null,
              stateId: this.state.stateId || null,
              cityId: this.state.cityId || null
            }
            this.props.getFuelByPlant(obj, () => { })
            // this.props.getFuelList(obj, () => { })

          }
          setTimeout(() => {
            const { machineTypeSelectList, ShiftTypeSelectList, DepreciationTypeSelectList, fuelDataByPlant } = this.props;
            const uomDetail = this.findUOMType(Data.MachineProcessRates.UnitOfMeasurementId)
            const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => Number(item.Value) === Data.MachineTypeId)
            const shiftObj = ShiftTypeSelectList && ShiftTypeSelectList.find(item => Number(item.Value) === Number(Data.WorkingShift))
            const depreciationObj = DepreciationTypeSelectList && DepreciationTypeSelectList.find(item => item.Value === Data.DepreciationType)
            const fuelObj = fuelDataByPlant && fuelDataByPlant.find(item => String(item.Value) === String(Data.FuleId))
            let LabourArray = Data && Data.MachineLabourRates?.map(el => {
              return {
                labourTypeName: el.LabourTypeName,
                labourTypeId: el.LabourTypeId,
                LabourCostPerAnnum: el.LabourCostPerAnnum,
                NumberOfLabour: el.NumberOfLabour,
                LabourCost: el.LabourCost,
                LabourDetailId: el.LabourDetailId,
                LabourCRMHead: el.LabourCRMHead,
                MachineRate: el.MachineRate,
                MachineRateLocalConversion: el?.MachineRateLocalConversion,
                MachineRateConversion: el?.MachineRateConversion
              }
            })

            let MachineProcessArray = Data && Data.MachineProcessRates.map(el => {
              return {
                ProcessName: el.ProcessName,
                ProcessId: el.ProcessId,
                UnitOfMeasurement: el.UnitOfMeasurement,
                UnitOfMeasurementId: el.UnitOfMeasurementId,
                OutputPerHours: el.OutputPerHours,
                OutputPerYear: el.OutputPerYear,
                MachineRate: el.MachineRate,
                MachineRateLocalConversion: el?.MachineRateLocalConversion,
                MachineRateConversion: el?.MachineRateConversion
              }
            })

            let crmHeadObj = {}
            crmHeadObj.LoanCRMHead = Data.LoanCRMHead ? Data.LoanCRMHead : ''
            crmHeadObj.InterestCRMHead = Data.InterestCRMHead ? Data.InterestCRMHead : ''
            crmHeadObj.WorkingShiftCRMHead = Data.WorkingShiftCRMHead ? Data.WorkingShiftCRMHead : ''
            crmHeadObj.DepreciationCRMHead = Data.DepreciationCRMHead ? Data.DepreciationCRMHead : ''
            crmHeadObj.AnnualMaintanceCRMHead = Data.AnnualMaintanceCRMHead ? Data.AnnualMaintanceCRMHead : ''
            crmHeadObj.AnnualConsumableCRMHead = Data.AnnualConsumableCRMHead ? Data.AnnualConsumableCRMHead : ''
            crmHeadObj.AnnualInsuranceCRMHead = Data.AnnualInsuranceCRMHead ? Data.AnnualInsuranceCRMHead : ''
            crmHeadObj.BuildingCRMHead = Data.BuildingCRMHead ? Data.BuildingCRMHead : ''
            crmHeadObj.MachineFloorCRMHead = Data.MachineFloorCRMHead ? Data.MachineFloorCRMHead : ''
            crmHeadObj.OtherYearlyCRMHead = Data.OtherYearlyCRMHead ? Data.OtherYearlyCRMHead : ''
            crmHeadObj.PowerCRMHead = Data.PowerCRMHead ? Data.PowerCRMHead : ''
            crmHeadObj.FuelCRMHead = Data.FuelCRMHead ? Data.FuelCRMHead : ''

            this.setState({
              IsFinancialDataChanged: false,
              isEditFlag: true,
              isFinalUserEdit: this.state.isFinalApprovar ? true : false,
              isLoader: false,
              IsPurchased: Data.OwnershipIsPurchased,
              selectedTechnology: [{ label: Data.Technology && Data.Technology[0].Technology, value: Data.Technology && Data.Technology[0].TechnologyId }],
              machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
              shiftType: shiftObj && shiftObj !== undefined ? { label: shiftObj.Text, value: shiftObj.Value } : [],
              depreciationType: depreciationObj && depreciationObj !== undefined ? { label: depreciationObj.Text, value: depreciationObj.Value } : [],
              selectedPlants: plantObj ? plantObj : [],
              DateOfPurchase: DayTime(Data.DateOfPurchase).isValid() === true ? new Date(DayTime(Data.DateOfPurchase)) : '',
              IsAnnualMaintenanceFixed: Data.IsMaintanceFixed === true ? false : true,
              IsAnnualConsumableFixed: Data.IsConsumableFixed === true ? false : true,
              IsInsuranceFixed: Data.IsInsuranceFixed === true ? false : true,
              IsUsesFuel: Data.IsUsesFuel,
              IsUsesSolarPower: Data.IsUsesSolarPower,
              fuelType: fuelObj && fuelObj !== undefined ? { label: fuelObj?.Text, value: fuelObj?.Value } : [],
              labourGrid: LabourArray,
              processGrid: MachineProcessArray,
              disableAllForm: (MachineProcessArray?.length > 0) ? true : false,
              remarks: Data.Remark,
              files: Data.Attachements,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              UOM: (this.state.isProcessGroup && !this.state.isViewMode) ? { label: Data.MachineProcessRates[0].UnitOfMeasurement, value: Data.MachineProcessRates[0].UnitOfMeasurementId, type: uomDetail.Type, uom: uomDetail.Text } : [],
              lockUOMAndRate: (this.state.isProcessGroup && !this.state.isViewMode),
              FuelEntryId: Data?.FuelEntryId,
              powerId: Data?.PowerId,
              machineFullValue: { FuelCostPerUnit: Data?.FuelCostPerUnit, PowerCostPerUnit: Data?.PowerCostPerUnit },
              crmHeads: crmHeadObj,
              updateCrmHeadObj: crmHeadObj,
              IsIncludeMachineRateDepreciation: Data?.IsIncludeMachineCost,
              ExchangeSource: Data?.ExchangeRateSourceName !== undefined ? { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceName } : [],
              plantCurrency: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRate : Data?.ExchangeRate,
              plantExchangeRateId: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRateId : Data?.ExchangeRateId,
              settlementCurrency: Data?.ExchangeRate,
              settlementExchangeRateId: Data?.ExchangeRateId,
              plantCurrencyID: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyId : Data?.CurrencyId,
              entryType: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? true : false,
              currency: Data?.Currency ? { label: Data?.Currency, value: Data?.CurrencyId } : [],
              //currency: Data?.Currency
              // selectedPlants: Data?.Plant ? { label: Data?.Plant[0]?.PlantName, value: Data?.Plant[0]?.PlantId } : null

            }, () => this.props.change('MachineRate', (this.state.isProcessGroup && !this.state.isViewMode) ? Data.MachineProcessRates[0].MachineRate : ''))
            this.props.change('NumberOfWorkingHoursPerYear', Data.NumberOfWorkingHoursPerYear ? Data.NumberOfWorkingHoursPerYear : '')
          }, 2000)
        }
      })
    }
    else {
      this.props.getMachineDetailsData('', res => { })
    }
  }

  setRowdata = (array = []) => {
    this.setState({ rowData: array })
  }

  findGroupCode = (clickedData, arr) => {
    let isContainGroup = _.find(arr, function (obj) {
      if (obj.ProcessId === clickedData) {
        return true;
      } else {
        return false
      }
    });
    return isContainGroup
  }

  /**
  * @method renderListing
  * @description Used to show type of listing
  */
  renderListing = (label) => {
    const { technologySelectList, plantSelectList,
      UOMSelectList, machineTypeSelectList, processSelectList, ShiftTypeSelectList,
      DepreciationTypeSelectList, labourTypeByMachineTypeSelectList, fuelDataByPlant, currencySelectList, exchangeRateSourceList } = this.props;

    const temp = [];
    if (label === 'technology') {
      technologySelectList && technologySelectList.map(item => {
        if (item.Value === '0' || (item.Value === String(LOGISTICS))) return false;
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
    if (label === 'MachineTypeList') {
      machineTypeSelectList && machineTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'ProcessNameList') {
      processSelectList && processSelectList.map(item => {
        if (item.Value === '0') return false;
        if (this.findGroupCode(item.Value, this.state.processGrid)) return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'ShiftType') {
      ShiftTypeSelectList && ShiftTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'DepreciationType') {
      DepreciationTypeSelectList && DepreciationTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'labourList') {
      labourTypeByMachineTypeSelectList && labourTypeByMachineTypeSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'fuel') {
      fuelDataByPlant && fuelDataByPlant.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableMachineUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value, type: item.Type, uom: item.Text })
        return null;
      });
      return temp;
    }
    if (label === 'ExchangeSource') {
      exchangeRateSourceList && exchangeRateSourceList.map((item) => {
        if (item.Value === '--Exchange Rate Source Name--') return false

        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    } if (label === 'currency') {
      currencySelectList && currencySelectList.map(item => {
        if (item.Value === '0') return false;
        if (item.Text === this.props.fieldsObj?.plantCurrency) return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }
  }

  /**
  * @method handlePlants
  * @description called
  */
  handlePlants = (newValue, actionMeta) => {
    const { fieldsObj } = this.props
    const { IsUsesSolarPower, machineFullValue, effectiveDate, costingTypeId, currency, entryType, ExchangeSource, selectedCustomer, selectedVedor } = this.state;
    if (!this.state.isViewMode && getConfigurationKey()?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !getConfigurationKey()?.IsDivisionAllowedForDepartment) {
      this.commonFunction(newValue ? newValue.value : '')
    }
    const { initialConfiguration, editDetails } = this.props
    let editMode = editDetails.isEditFlag ? editDetails.isEditFlag : false
    if (!editMode) {
      if (newValue && newValue !== '') {
        this.setState({ selectedPlants: newValue }, () => {
          this.props.getPlantUnitAPI(newValue?.value, (res) => {
            let Data = res?.data?.Data
            this.props.change('plantCurrency', Data?.Currency)
            //this.setState({ plantCurrency: Data?.Currency })
            this.setState({ plantCurrencyID: Data?.CurrencyId })
            this.props.editDetails?.callExchangeRateAPI(costingTypeId, Data?.Currency, currency, entryType, ExchangeSource, effectiveDate, selectedCustomer, selectedVedor, newValue)
              .then(result => {
                if (result) {
                  this.setState({ ...result, showWarning: result.showWarning, showPlantWarning: result.showPlantWarning }, () => {
                    this.handleCalculation(this.fieldsObj?.MachineRate);
                  });
                }
              });
            if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
              this.setState({ hidePlantCurrency: false })
            } else {
              this.setState({ hidePlantCurrency: true })
            }
          })
          const { selectedPlants } = this.state
          this.callLabourTypeApi()
          let obj = {
            plantId: newValue?.value,
            vendorId: this.state.selectedVedor?.value ? this.state.selectedVedor?.value : '',
            customerId: this.state.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
            costingTypeId: this.state.CostingTypeId || null,
            entryType: this.state.powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
            countryId: this.state.countryId || null,
            stateId: this.state.stateId || null,
            cityId: this.state.cityId || null
          }
          //this.props.getFuelList(obj, (res) => { })
          this.props.getFuelByPlant(obj, (res) => { })

        })
        if (effectiveDate) {
          const baseCurrency = reactLocalStorage.getObject("baseCurrency")
          const data = this.props.data ?? {};
          setTimeout(() => {
            let obj = {
              plantId: newValue?.value,
              effectiveDate: effectiveDate,
              costingTypeId: this.state.costingTypeId ? this.state.costingTypeId : '',
              vendorId: this.state.vendorId ? this.state.vendorId : '',
              customerId: this.state.customerId ? this.state.customerId : '',
              toCurrency: fieldsObj?.plantCurrency,
              ExchangeSource: data?.ExchangeRateSourceName || "",
              entryType: data?.entryType === "Import" ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
            }
            this.props.getPowerCostUnit(obj, res => {
              let Data = res?.data?.DynamicData;
              if (res && res.data && res.data.Message !== '') {
                Toaster.warning(res.data.Message)
                machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
                this.setState({
                  machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue?.PowerCostPerUnit, powerId: Data?.PowerId },
                  powerIdFromAPI: Data?.PowerId
                })
                this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data?.SolarPowerRatePerUnit, initialConfiguration?.NoOfDecimalForPrice))
              } else {
                //  if(IsUsesSolarPower)
                machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data?.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
                this.setState({
                  machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue?.PowerCostPerUnit, powerId: Data?.PowerId },
                  powerIdFromAPI: Data?.PowerId
                })
                this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data?.SolarPowerRatePerUnit, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
              }
            })
          }, 1000);
        }
      } else {
        this.setState({ selectedPlants: [] })
      }
    }
  };

  /**
  * @method handleMachineType
  * @description called
  */
  handleMachineType = (newValue, actionMeta) => {
    if (newValue.value !== null && newValue && newValue !== '') {
      this.setState({ machineType: newValue, labourGrid: [], }, () => {
        this.callLabourTypeApi()
      });
    } else {
      const data = {
        machineTypeId: 0,
        plantId: 0,
        effectiveDate: '',
        vendorId: '',
        customerId: '',
        costingTypeId: null,
      }
      this.setState({ machineType: [], labourGrid: [], })
      if (newValue.value) {
        this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
      }
    }
  };

  /**
   * @method machineTypeToggler
   * @description OPENING MACHINE TYPE DRAWER
  */
  machineTypeToggler = () => {
    this.setState({ isOpenMachineType: true })
  }


  callLabourTypeApi = () => {
    const { machineType, selectedPlants, effectiveDate, selectedCustomer, selectedVedor, costingTypeId } = this.state;
    const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
    const data = {
      machineTypeId: machineType?.value,
      plantId: PlantId,
      effectiveDate: effectiveDate,
      vendorId: selectedVedor?.value ? selectedVedor?.value : '',
      customerId: selectedCustomer?.value ? selectedCustomer?.value : '',
      costingTypeId: costingTypeId || null,
    }
    if (machineType && machineType.value && (Array.isArray(machineType) ? machineType.length > 0 : machineType) && selectedPlants && effectiveDate) {
      this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
    }
  }

  /**
   * @method closeMachineTypeDrawer
   * @description CLOSING MACHINE TYPE DRAWER
  */

  closeMachineTypeDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenMachineType: false }, () => {
      this.props.getMachineTypeSelectList(() => {
        const { machineTypeSelectList } = this.props;
        /*TO SHOW MACHINE TYPE VALUE PRE FILLED FROM DRAWER*/
        if (Object.keys(formData).length > 0) {
          const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Text === formData.MachineType)
          this.setState({
            machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
          })
        }
      })
    })
  }

  handleShiftType = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ shiftType: newValue });

    } else {
      this.setState({ shiftType: [], })
    }
    setTimeout(() => {
      this.calculateWorkingHrsPerAnnum()
    }, 100);
  }

  /**
   * @method efficiencyCalculationToggler
   * @description OPEN CALCULATOR DRAWER
  */
  efficiencyCalculationToggler = () => {
    this.setState({ isOpenAvailability: true })
  }

  /**
   * @method closeAvailabilityDrawer
   * @description CLOSING CALCULATOR DRAWER AND SHOWING PRE FILLED VALUE
  */
  closeAvailabilityDrawer = (e = '', calculatedEfficiency, NoOfWorkingHours) => {
    const { initialConfiguration } = this.props
    this.setState({ isOpenAvailability: false, NoOfWorkingHours: NoOfWorkingHours }, () => {
      if (calculatedEfficiency !== Infinity && calculatedEfficiency !== 'NaN') {
        this.props.change('EfficiencyPercentage', checkForDecimalAndNull(calculatedEfficiency, initialConfiguration?.NoOfDecimalForInputOutput))
      }
    })

  }

  /**
   * @method handleDereciationType
   * @description HANDLE DEPRICIATION CHANGES
  */
  handleDereciationType = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ depreciationType: newValue });
      setTimeout(() => {
        this.props.change('DepreciationAmount', 0)
        this.props.change('DepreciationRatePercentage', 0)
        this.props.change('LifeOfAssetPerYear', 0)
        this.props.change('CastOfScrap', 0)
      }, 400);

    } else {
      this.setState({ depreciationType: [], })
    }
  }

  handleFuelType = (newValue, actionMeta) => {
    const { machineFullValue, effectiveDate } = this.state;
    const { data } = this.props;
    this.props.change('FuelCostPerUnit', 0)

    if (newValue && newValue !== '') {
      this.setState({ fuelType: newValue }, () => {
        const { fuelType, selectedPlants, currency, ExchangeSource, costingTypeId, vendorId, customerId, selectedCustomer, selectedVedor } = this.state;
        const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
        if (selectedPlants) {
          const requestData = {
            fuelId: fuelType.value,
            plantId: PlantId,
            effectiveDate: DayTime(effectiveDate).isValid() ? DayTime(effectiveDate).format('YYYY-MM-DD') : '',
            toCurrency: this.props.fieldsObj?.plantCurrency,
            ExchangeSource: ExchangeSource?.label || "",
            costingTypeId: costingTypeId || '',
            vendorId: selectedVedor?.value || '',
            customerId: selectedCustomer?.value || '',
            entryType: this?.state?.powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
          }
          this.props.getFuelUnitCost(requestData, res => {
            let responseData = res?.data?.Data;
            if (res && res?.data && res?.data?.Message !== '') {
              Toaster.warning(res.data.Message)
            }
            const newFuelCostPerUnit = responseData?.UnitCost || 0;
            const newMachineFullValue = { ...machineFullValue, FuelCostPerUnit: newFuelCostPerUnit };
            this.setState({
              machineFullValue: newMachineFullValue,
              UOMName: responseData?.UOMName || 'UOM',
              FuelEntryId: responseData?.FuelEntryId || null
            })
            this.props.change('FuelCostPerUnit', checkForDecimalAndNull(newFuelCostPerUnit, this.props.initialConfiguration?.NoOfDecimalForPrice))
          })
        } else {
          Toaster.warning('Please select plant.')
        }
      });
    } else {
      this.setState({ fuelType: [] })
      this.props.change('FuelCostPerUnit', 0)
    }
  }

  /**
  * @method handleProcessName
  * @description called
  */
  handleProcessName = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ processName: newValue });
    } else {
      this.setState({ processName: [] })
    }
  };

  processToggler = () => {
    this.setState({ isOpenProcessDrawer: true })
  }

  closeProcessDrawer = (e = '', formData = {}) => {
    this.setState({ isOpenProcessDrawer: false }, () => {
      this.props.getProcessesSelectList(() => {
        const { processSelectList } = this.props;
        /*TO SHOW PROCESS VALUE PRE FILLED FROM DRAWER*/
        if (Object.keys(formData).length > 0) {
          const processObj = processSelectList && processSelectList.find(item => getNameBySplitting(item.Text) === formData.ProcessName)

          this.setState({
            processName: processObj && processObj !== undefined ? { label: processObj.Text, value: processObj.Value } : [],
          })
        }
      })
    })
  }

  /**
  * @method handleUOM
  * @description called
  */
  handleUOM = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {

      if (newValue.type !== TIME) {
        this.props.change("MachineRate", '')
      }

      this.setState({ UOM: newValue, errorObj: { ...this.state.errorObj, processMachineRate: false } }, () => { this.handleProcessCalculation() });

    } else {
      this.setState({ UOM: [] })
    }
  };

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    const { fieldsObj } = this.props
    const { IsUsesSolarPower, machineFullValue, effectiveDate, costingTypeId, currency, entryType, ExchangeSource, selectedCustomer, selectedVedor, selectedPlants } = this.state;
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    }, () => {
      this.callLabourTypeApi()
      this.props.editDetails?.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, entryType, ExchangeSource, date, selectedCustomer, selectedVedor, selectedPlants)
        .then(result => {
          if (result) {
            this.setState({ ...result, showWarning: result.showWarning, showPlantWarning: result.showPlantWarning }, () => {
              this.handleCalculation(this.fieldsObj?.MachineRate);
            });
          }
        });

    });
    const { initialConfiguration } = this.props

    if (Object.keys(selectedPlants)?.length > 0) {
      const baseCurrency = reactLocalStorage.getObject("baseCurrency")
      const data = this.props.data ?? {};
      const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
      setTimeout(() => {
        let obj = {
          plantId: PlantId,
          effectiveDate: date,
          costingTypeId: this.state.costingTypeId ? this.state.costingTypeId : '',
          vendorId: this.state.vendorId ? this.state.vendorId : '',
          customerId: this.state.customerId ? this.state.customerId : '',
          toCurrency: fieldsObj?.plantCurrency,
          ExchangeSource: data?.ExchangeRateSourceName || "",
          entryType: data?.entryType === "Import" ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,

        }
        this.props.getPowerCostUnit(obj, res => {
          let Data = res?.data?.DynamicData;
          if (res && res.data && res.data.Message !== '') {
            Toaster.warning(res.data.Message)
            machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
            this.setState({
              machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit, powerId: Data?.PowerId },
              powerIdFromAPI: Data?.PowerId
            })
            this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data.SolarPowerRatePerUnit, initialConfiguration?.NoOfDecimalForPrice))
          } else {
            //  if(IsUsesSolarPower)
            machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
            this.setState({
              machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit, powerId: Data?.PowerId },
              powerIdFromAPI: Data?.PowerId
            })
            this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data.SolarPowerRatePerUnit, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
          }
        })
      }, 1000);
    }


  };
  /**
   * @method handleChange
   * @description Handle Purchase Date
   */
  handleDateOfPurchase = (date) => {
    this.setState({
      DateOfPurchase: date,
    });
    setTimeout(() => {
      this.calculateDepreciation(date)
    }, 300);
  };

  /**
   * @method onPressAnnualMaintenance
   * @description Used for Annual Maintenance
   */
  onPressAnnualMaintenance = () => {
    this.setState({
      IsAnnualMaintenanceFixed: !this.state.IsAnnualMaintenanceFixed,
    }, () => {
      this.props.change('AnnualMaintanceAmount', 0)
      this.props.change('AnnualMaintancePercentage', 0)
    });
  }

  /**
   * @method onPressAnnualConsumable
   * @description Used for Annual Maintenance
   */
  onPressAnnualConsumable = () => {
    this.setState({
      IsAnnualConsumableFixed: !this.state.IsAnnualConsumableFixed,
    }, () => {
      this.props.change('AnnualConsumableAmount', 0)
      this.props.change('AnnualConsumablePercentage', 0)
    });
  }

  /**
   * @method onPressInsurance
   * @description Used for Annual Maintenance
   */
  onPressInsurance = () => {
    this.setState({
      IsInsuranceFixed: !this.state.IsInsuranceFixed,
    }, () => {
      this.props.change('AnnualInsuranceAmount', 0)
      this.props.change('AnnualInsurancePercentage', 0)
    });
  }

  /**
   * @method onPressUsesFuel
   * @description Used for Annual Maintenance
   */
  onPressUsesFuel = () => {
    if (this.state.IsUsesFuel === false) {
      this.props.change('FuelCostPerUnit', 0)
      this.props.change('ConsumptionPerYear', 0)
      this.props.change('TotalFuelCostPerYear', 0)
      if (this.state?.selectedPlants?.value && this.state?.selectedPlants?.value !== null) {
        //this.props.getFuelByPlant(this.state.selectedPlants?.value, () => { })
        const PlantId = Array.isArray(this.state.selectedPlants) ? this.state.selectedPlants[0]?.value : this.state.selectedPlants?.value;
        let obj = {
          plantId: PlantId,
          vendorId: this.state.selectedVedor?.value ? this.state.selectedVedor?.value : '',
          customerId: this.state.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
          costingTypeId: this.state.CostingTypeId || null,
          entryType: this.state.powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
          countryId: this.state.countryId || null,
          stateId: this.state.stateId || null,
          cityId: this.state.cityId || null
        }
        this.props.getFuelByPlant(obj, () => { })
        //this.props.getFuelList(obj, () => { })

      }
      this.setState({ fuelType: [] })
    }

    this.setState({
      IsUsesFuel: !this.state.IsUsesFuel,
    });
  }

  /**
  * @method onPressUsesSolarPower
  * @description Used for Uses Solar Power
  */
  onPressUsesSolarPower = () => {
    this.setState({ IsUsesSolarPower: !this.state.IsUsesSolarPower, }, () => {
      const { IsUsesSolarPower, selectedPlants, machineFullValue, effectiveDate } = this.state;
      // if (IsUsesSolarPower) {
      if (selectedPlants) {
        const baseCurrency = reactLocalStorage.getObject("baseCurrency")
        const data = this.props.data ?? {};
        const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
        setTimeout(() => {

          let obj = {
            plantId: PlantId,
            effectiveDate: effectiveDate,
            costingTypeId: this.state.costingTypeId ? this.state.costingTypeId : '',
            vendorId: this.state.vendorId ? this.state.vendorId : '',
            customerId: this.state.customerId ? this.state.customerId : '',
            toCurrency: this.props.fieldsObj?.plantCurrency,
            ExchangeSource: data?.ExchangeRateSourceName || "",
            entryType: data?.entryType === "Import" ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,

          }
          this.props.getPowerCostUnit(obj, res => {
            let Data = res.data.DynamicData;
            if (res && res.data && res.data.Message !== '') {
              Toaster.warning(res.data.Message)
              // this.setState
              machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
              this.setState({
                machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit },
                powerIdFromAPI: Data?.PowerId
              })
              this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data.SolarPowerRatePerUnit, this.props.initialConfiguration?.NoOfDecimalForPrice))
            } else {
              machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
              this.setState({
                machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit },
                powerIdFromAPI: Data?.PowerId
              })
              this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data.SolarPowerRatePerUnit, this.props.initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, this.props.initialConfiguration?.NoOfDecimalForPrice))
            }
          })
        }, 1000);
      }
      else {
        Toaster.warning('Please select plant.')
        this.setState({ IsUsesSolarPower: false, })
      }

      // } else {
      //     this.props.change('PowerCostPerUnit', 0)
      // }
    });
  }
  /**
  * @method labourHandler
  * @description called
  */
  labourHandler = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ labourType: newValue }, () => {
        const { labourType, machineType, selectedPlants, effectiveDate, selectedCustomer, selectedVedor } = this.state;
        const baseCurrency = reactLocalStorage.getObject("baseCurrency")
        const { data } = this.props ?? {}
        const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
        const dataObj = {
          labourTypeId: labourType.value,
          machineTypeId: machineType.value,
          plantId: PlantId,
          customerId: selectedCustomer?.value,
          vendorId: selectedVedor?.value,
          effectiveDate: effectiveDate,
          costingTypeId: this.state.costingTypeId ? this.state.costingTypeId : '',
          toCurrency: this.props.fieldsObj?.plantCurrency,
          ExchangeSource: data?.ExchangeRateSourceName || "",

        }
        this.props.getLabourCost(dataObj, effectiveDate, res => {
          let Data = res.data.DynamicData;
          this.setState({ labourDetailId: Data.LabourDetailId })
          if (res && res.data && res.data.Message !== '') {
            Toaster.warning(res.data.Message)
            this.props.change('LabourCostPerAnnum', checkForDecimalAndNull(Data.LabourCost, this.props.initialConfiguration?.NoOfDecimalForPrice))
          } else {
            this.props.change('LabourCostPerAnnum', checkForDecimalAndNull(Data.LabourCost, this.props.initialConfiguration?.NoOfDecimalForPrice))
          }
        })
      });
    } else {
      this.setState({ labourType: [] })
    }
  };

  handleLabourCrmHead = (value) => {
    this.setState({ LabourCRMHead: value })

  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.totalCost()
      this.calculateLoanInterest()
      this.calculateWorkingHrsPerAnnum()
      this.calculateDepreciation()
      this.calculateVariableCosts()
      this.totalMachineCost()
      this.powerCost()
      this.handleLabourCalculation()
    }
    if ((prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
      this.commonFunction()
    }
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.handleCalculation()
    }
  }

  /**
  * @method totalCost
  * @description called
  * 
  */
  totalCost = () => {

    const { fieldsObj, initialConfiguration } = this.props
    const { machineFullValue } = this.state

    const totalCost = (checkForNull(fieldsObj?.MachineCost) + checkForNull(fieldsObj?.AccessoriesCost) + checkForNull(fieldsObj?.InstallationCharges))
    machineFullValue.totalCost = totalCost
    this.setState({
      machineFullValue: { ...machineFullValue, totalCost: machineFullValue.totalCost }
    })
    this.props.change('TotalCost', checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
  * @method calculateLoanInterest
  * @description called
  */
  calculateLoanInterest = () => {

    const { fieldsObj, initialConfiguration } = this.props
    const { machineFullValue } = this.state
    const totalCost = machineFullValue.totalCost
    const LoanPercentage = checkForNull(fieldsObj?.LoanPercentage)
    const EquityPercentage = 100 - LoanPercentage  // FORMULA CHANGE
    const RateOfInterestPercentage = fieldsObj && fieldsObj.RateOfInterestPercentage !== undefined ? checkForNull(fieldsObj.RateOfInterestPercentage) : 0;

    // FOR CALCULATION AND SENDING TO BACKEND
    machineFullValue.LoanValue = calculatePercentage(LoanPercentage) * checkForNull(totalCost)
    machineFullValue.EquityValue = calculatePercentage(EquityPercentage) * checkForNull(totalCost)
    machineFullValue.RateOfInterestValue = (calculatePercentage(LoanPercentage) * checkForNull(totalCost)) * calculatePercentage(RateOfInterestPercentage)

    this.setState({
      machineFullValue: {
        ...machineFullValue,
        LoanValue: machineFullValue.LoanValue,
        EquityValue: machineFullValue.EquityValue,
        RateOfInterestValue: machineFullValue.RateOfInterestValue
      }
    })

    //THIS IS TO SHOW ON FORM (VIEW PURPOSE)

    this.props.change('EquityPercentage', checkForNull(EquityPercentage))
    this.props.change('LoanValue', checkForDecimalAndNull(calculatePercentage(LoanPercentage) * checkForNull(totalCost), initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('EquityValue', checkForDecimalAndNull(calculatePercentage(EquityPercentage) * checkForNull(totalCost), initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('RateOfInterestValue', checkForDecimalAndNull((calculatePercentage(LoanPercentage) * checkForNull(totalCost)) * calculatePercentage(RateOfInterestPercentage), initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
  * @method calculateWorkingHrsPerAnnum
  * @description called
  */
  calculateWorkingHrsPerAnnum = () => {
    const { fieldsObj } = this.props;
    const { shiftType } = this.state;

    const NumberOfShift = shiftType.hasOwnProperty('value') ? checkForNull(shiftType.value) : 0;
    const WorkingHoursPerShift = checkForNull(fieldsObj?.WorkingHoursPerShift)
    const NumberOfWorkingDaysPerYear = checkForNull(fieldsObj?.NumberOfWorkingDaysPerYear)
    const EfficiencyPercentage = checkForNull(fieldsObj?.EfficiencyPercentage)

    // NEED TO LOOK INTO THIS FIELD
    let WorkingHrPrYrValue = NumberOfShift * WorkingHoursPerShift * NumberOfWorkingDaysPerYear
    this.setState({ WorkingHrPrYr: WorkingHrPrYrValue })
    const workingHrPerYr = WorkingHrPrYrValue * calculatePercentage(EfficiencyPercentage)
    this.props.change('NumberOfWorkingHoursPerYear', checkForNull(Math.round(workingHrPerYr)))
  }

  /**
  * @method calculateDepreciation
  * @description called
  */
  calculateDepreciation = (dateOfPurchase = "") => {
    const { fieldsObj, initialConfiguration } = this.props;
    const { depreciationType, machineFullValue } = this.state;

    // const TotalCost = fieldsObj && fieldsObj.TotalCost !== undefined ? checkForNull(fieldsObj.TotalCost) : 0;
    const TotalCost = checkForNull(machineFullValue?.totalCost)
    const DepreciationRatePercentage = checkForNull(fieldsObj?.DepreciationRatePercentage)
    const LifeOfAssetPerYear = checkForNull(fieldsObj?.LifeOfAssetPerYear)
    const CastOfScrap = checkForNull(fieldsObj?.CastOfScrap)

    let depreciationAmount = 0;
    if (depreciationType.value === SLM) {
      //depreciationAmount = (TotalCost - CastOfScrap) / LifeOfAssetPerYear Or (TotalCost - CastOfScrap) * calculatePercentage(DepreciationRatePercentage)
      depreciationAmount = checkForNull((TotalCost - checkForNull(CastOfScrap)) / checkForNull(LifeOfAssetPerYear));

      // depreciationAmount = (TotalCost - CastOfScrap) * calculatePercentage(DepreciationRatePercentage) //TODO
    }

    if (depreciationType.value === WDM) {

      let dateNew = new Date(dateOfPurchase !== "" ? dateOfPurchase : this.state.DateOfPurchase)
      let financialYearMonth = dateNew.getMonth() + 1
      let financialYear = financialYearMonth > 3 ? dateNew.getFullYear() + 1 : dateNew.getFullYear()

      let date1 = new Date(`03/31/${financialYear}`)
      let date2 = new Date(dateOfPurchase !== "" ? dateOfPurchase : this.state.DateOfPurchase)              // LOGIC TO CALCULATE NO OF DAYS BETWEEN 01 APRIL 2023(FINANCIAL YEAR) AND DATE OF PURCHASE
      let difference = date1.getTime() - date2.getTime();
      let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));

      if (isNaN(TotalDays)) {
        depreciationAmount = this.state.DateOfPurchase !== '' ? (checkForNull((TotalCost - checkForNull(CastOfScrap)) * calculatePercentage(DepreciationRatePercentage))) : 0
      }
      else {
        depreciationAmount = this.state.DateOfPurchase !== '' ? ((checkForNull((TotalCost - checkForNull(CastOfScrap)) * calculatePercentage(DepreciationRatePercentage)) * checkForNull(TotalDays + 1)) / 365) : 0
      }
      //let rateOfDep = ((1 - checkForNull(CastOfScrap)) / (machinecost)) ^ i
    }
    //this.props.change('DepreciationAmount', Math.round(depreciationAmount))
    machineFullValue.depreciationAmount = depreciationAmount
    this.setState({ machineFullValue: { ...machineFullValue, depreciationAmount: machineFullValue.depreciationAmount } })
    this.props.change('DepreciationAmount', checkForDecimalAndNull(depreciationAmount, initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
  * @method calculateVariableCosts
  * @description called
  */
  calculateVariableCosts = () => {
    const { fieldsObj, initialConfiguration } = this.props
    const { IsAnnualMaintenanceFixed, IsAnnualConsumableFixed, IsInsuranceFixed, machineFullValue } = this.state;

    const MachineCost = checkForNull(fieldsObj?.MachineCost)
    const AccessoriesCost = checkForNull(fieldsObj?.AccessoriesCost)
    const AnnualMaintancePercentage = checkForNull(fieldsObj?.AnnualMaintancePercentage)
    const AnnualConsumablePercentage = checkForNull(fieldsObj?.AnnualConsumablePercentage)
    const AnnualInsurancePercentage = checkForNull(fieldsObj?.AnnualInsurancePercentage)

    if (IsAnnualMaintenanceFixed) {
      const MaintananceCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualMaintancePercentage)
      machineFullValue.MaintananceCost = MaintananceCost
      this.setState({
        machineFullValue: { ...machineFullValue, MaintananceCost: machineFullValue.MaintananceCost }
      })
      this.props.change('AnnualMaintanceAmount', checkForDecimalAndNull(MaintananceCost, initialConfiguration?.NoOfDecimalForPrice))
    }

    if (IsAnnualConsumableFixed) {
      const ConsumableCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualConsumablePercentage)
      machineFullValue.ConsumableCost = ConsumableCost
      this.setState({
        machineFullValue: { ...machineFullValue, ConsumableCost: machineFullValue.ConsumableCost }
      })
      this.props.change('AnnualConsumableAmount', checkForDecimalAndNull(ConsumableCost, initialConfiguration?.NoOfDecimalForPrice))
    }

    if (IsInsuranceFixed) {
      const InsuranceCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualInsurancePercentage)
      machineFullValue.InsuranceCost = InsuranceCost
      this.setState({
        machineFullValue: { ...machineFullValue, InsuranceCost: machineFullValue.InsuranceCost }
      })
      this.props.change('AnnualInsuranceAmount', checkForDecimalAndNull(InsuranceCost, initialConfiguration?.NoOfDecimalForPrice))
    }

  }

  /**
  * @method totalMachineCost
  * @description totalMachineCost per annum calculation
  */
  totalMachineCost = () => {
    const { fieldsObj, initialConfiguration } = this.props;

    const { IsAnnualMaintenanceFixed, IsAnnualConsumableFixed, IsInsuranceFixed, machineFullValue } = this.state;
    const BuildingCostPerSquareFeet = checkForNull(fieldsObj?.BuildingCostPerSquareFeet)
    const MachineFloorAreaPerSquareFeet = checkForNull(fieldsObj?.MachineFloorAreaPerSquareFeet)

    // const DepreciationAmount = fieldsObj && fieldsObj.DepreciationAmount !== undefined ? checkForNull(fieldsObj.DepreciationAmount) : 0; //state
    const DepreciationAmount = checkForNull(machineFullValue.DepreciationAmount)
    const AnnualMaintanceAmount = IsAnnualMaintenanceFixed ? machineFullValue.MaintananceCost : checkForNull(fieldsObj?.AnnualMaintanceAmount)  //state
    const AnnualConsumableAmount = IsAnnualConsumableFixed ? machineFullValue.ConsumableCost : checkForNull(fieldsObj?.AnnualConsumableAmount)  //state
    const AnnualInsuranceAmount = IsInsuranceFixed ? machineFullValue.InsuranceCost : checkForNull(fieldsObj?.AnnualInsuranceAmount)  //state



    // yearely cost add and annual spelling
    const OtherYearlyCost = checkForNull(fieldsObj?.OtherYearlyCost)
    const annualAreaCost = checkForNull(BuildingCostPerSquareFeet * MachineFloorAreaPerSquareFeet);



    machineFullValue.annualAreaCost = annualAreaCost;
    const TotalMachineCostPerAnnum = checkForNull(DepreciationAmount) + checkForNull(AnnualMaintanceAmount) + checkForNull(AnnualConsumableAmount) + checkForNull(AnnualInsuranceAmount) + checkForNull(annualAreaCost) + checkForNull(OtherYearlyCost)
    machineFullValue.TotalMachineCostPerAnnum = TotalMachineCostPerAnnum



    this.setState({
      machineFullValue: {
        ...machineFullValue,
        annualAreaCost: machineFullValue.annualAreaCost,
        TotalMachineCostPerAnnum: machineFullValue.TotalMachineCostPerAnnum
      }
    })

    this.props.change('AnnualAreaCost', checkForDecimalAndNull(annualAreaCost, initialConfiguration?.NoOfDecimalForPrice))
    this.props.change('TotalMachineCostPerAnnum', checkForDecimalAndNull(TotalMachineCostPerAnnum, initialConfiguration?.NoOfDecimalForPrice))
  }

  /**
  * @method powerCost
  * @description powerCost calculation
  */
  powerCost = () => {
    const { fieldsObj, initialConfiguration } = this.props;
    const { IsUsesFuel, machineFullValue } = this.state;


    if (IsUsesFuel) {

      const FuelCostPerUnit = checkForNull(machineFullValue?.FuelCostPerUnit)
      const ConsumptionPerYear = checkForNull(fieldsObj?.ConsumptionPerYear)
      machineFullValue.TotalFuelCostPerYear = FuelCostPerUnit * ConsumptionPerYear
      this.setState({ machineFullValue: { ...machineFullValue, TotalFuelCostPerYear: machineFullValue.TotalFuelCostPerYear } })
      this.props.change('TotalFuelCostPerYear', checkForDecimalAndNull(fieldsObj.FuelCostPerUnit * ConsumptionPerYear, initialConfiguration?.NoOfDecimalForPrice))
    } else {

      // if (IsUsesSolarPower) {
      // this.props.change('FuelCostPerUnit', 0)
      // this.props.change('ConsumptionPerYear', 0)
      // this.props.change('TotalFuelCostPerYear', 0)

      const NumberOfWorkingHoursPerYear = checkForNull(fieldsObj?.NumberOfWorkingHoursPerYear)  //state
      const UtilizationFactorPercentage = checkForNull(fieldsObj?.UtilizationFactorPercentage)
      const PowerRatingPerKW = checkForNull(fieldsObj?.PowerRatingPerKW)
      const PowerCostPerUnit = checkForNull(machineFullValue?.PowerCostPerUnit); // may be state
      const totalPowerCostPerHour = PowerRatingPerKW * calculatePercentage(UtilizationFactorPercentage) * checkForNull(PowerCostPerUnit)
      const totalPowerCostPrYer = totalPowerCostPerHour * NumberOfWorkingHoursPerYear
      machineFullValue.totalPowerCostPrYer = totalPowerCostPrYer
      this.setState({ machineFullValue: { ...machineFullValue, totalPowerCostPrYer: machineFullValue.totalPowerCostPrYer, TotalPowerCostPerHour: totalPowerCostPerHour } })
      this.props.change('TotalPowerCostPerYear', checkForDecimalAndNull(totalPowerCostPrYer, initialConfiguration?.NoOfDecimalForPrice))
      this.props.change('TotalPowerCostPerHour', checkForDecimalAndNull(totalPowerCostPerHour, initialConfiguration?.NoOfDecimalForPrice))
      // }
    }
  }

  /**
  * @method handleLabourCalculation
  * @description called
  */
  handleLabourCalculation = () => {
    const { fieldsObj } = this.props
    const LabourPerCost = checkForNull(fieldsObj?.LabourCostPerAnnum)
    const NumberOfLabour = checkForNull(fieldsObj?.NumberOfLabour)
    const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)
    this.props.change('LabourCost', TotalLabourCost)
  }

  /**
  * @method handleProcessCalculation
  * @description called
  */
  handleProcessCalculation = () => {
    const { fieldsObj, initialConfiguration } = this.props
    const { UOM, IsIncludeMachineRateDepreciation } = this.state

    let MachineRate
    let MachineRateWithOutInterestAndDepreciation
    const OutputPerHours = checkForNull(fieldsObj?.OutputPerHours)
    const NumberOfWorkingHoursPerYear = checkForNull(fieldsObj?.NumberOfWorkingHoursPerYear)

    // Calculate total machine cost with and without interest/depreciation
    let TotalMachineCostPerAnnum = 0
    let TotalMachineCostWithoutIntDepPerAnnum = 0

    if (IsIncludeMachineRateDepreciation) {
      TotalMachineCostPerAnnum = checkForNull(fieldsObj.TotalCost) + checkForNull(fieldsObj.RateOfInterestValue) + checkForNull(fieldsObj.DepreciationAmount) + checkForNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())
      // Calculate without interest and depreciation
      TotalMachineCostWithoutIntDepPerAnnum = checkForNull(fieldsObj.TotalCost) + checkForNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())

    } else {

      TotalMachineCostPerAnnum = checkForNull(fieldsObj.RateOfInterestValue) + checkForNull(fieldsObj.DepreciationAmount) + checkForNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())

      // Calculate without interest and depreciation  
      TotalMachineCostWithoutIntDepPerAnnum = checkForNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())

    }

    if (UOM.type === TIME) {

      if (UOM.uom === "Hours") {
        MachineRate = checkForNull(TotalMachineCostPerAnnum / NumberOfWorkingHoursPerYear)
        MachineRateWithOutInterestAndDepreciation = checkForNull(TotalMachineCostWithoutIntDepPerAnnum / NumberOfWorkingHoursPerYear)
      }
      else if (UOM.uom === "Minutes") {
        MachineRate = checkForNull((TotalMachineCostPerAnnum / NumberOfWorkingHoursPerYear) / 60)
        MachineRateWithOutInterestAndDepreciation = checkForNull((TotalMachineCostWithoutIntDepPerAnnum / NumberOfWorkingHoursPerYear) / 60)
      }
      else if (UOM.uom === "Seconds") {
        MachineRate = checkForNull((TotalMachineCostPerAnnum / NumberOfWorkingHoursPerYear) / 3600)
        MachineRateWithOutInterestAndDepreciation = checkForNull((TotalMachineCostWithoutIntDepPerAnnum / NumberOfWorkingHoursPerYear) / 3600)
      }
    } else {
      MachineRate = fieldsObj.MachineRate
      MachineRateWithOutInterestAndDepreciation = fieldsObj.MachineRate
    }

    this.setState({
      machineRate: MachineRate,
      MachineRateWithOutInterestAndDepreciation: MachineRateWithOutInterestAndDepreciation
    })

    this.props.change('OutputPerYear', checkForDecimalAndNull(OutputPerHours * NumberOfWorkingHoursPerYear))
    this.props.change('MachineRate', checkForDecimalAndNull(MachineRate, initialConfiguration?.NoOfDecimalForPrice) ? checkForDecimalAndNull(MachineRate, initialConfiguration?.NoOfDecimalForPrice) : '')
  }

  /**
  * @method labourTableHandler
  * @description ADDING VALUE IN LABOUR TABLE GRID
  */
  labourTableHandler = () => {
    const { labourType, labourGrid, LabourCRMHead } = this.state;
    const { fieldsObj } = this.props

    if (labourType.length === 0 && (fieldsObj.NumberOfLabour === undefined || Number(fieldsObj.NumberOfLabour) === 0)) {
      this.setState({ errorObj: { labourType: true, peopleCount: true } })
      return false;
    }
    if (labourType.length === 0) {
      this.setState({ errorObj: { labourType: true } })
      return false;
    }
    if (fieldsObj.NumberOfLabour === undefined || Number(fieldsObj.NumberOfLabour) === 0) {
      this.setState({ errorObj: { peopleCount: true } })
      return false;
    }
    if (this.props.invalid === true) {
      return false;
    }
    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    const isExist = labourGrid.findIndex(el => (el.labourTypeId === labourType.value))
    if (isExist !== -1) {
      Toaster.warning('Already added, Please check the values.')
      return false;
    }

    const LabourPerCost = checkForNull(fieldsObj?.LabourCostPerAnnum)
    const NumberOfLabour = checkForNull(fieldsObj?.NumberOfLabour)
    const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)
    const tempArray = [];

    //CONDITION TO CHECK TOTAL COST IS ZERO
    if (TotalLabourCost === 0) {
      Toaster.warning('Total cost should not be zero.')
      return false;
    }
    tempArray.push(...labourGrid, {
      labourTypeName: labourType.label,
      labourTypeId: labourType.value,
      LabourCostPerAnnum: LabourPerCost,
      NumberOfLabour: NumberOfLabour,
      LabourCost: TotalLabourCost,
      LabourDetailId: this.state.labourDetailId,
      LabourCRMHead: LabourCRMHead ? LabourCRMHead.label : '-'
    })
    if (tempArray?.length > 0) {
      this.setState({ disableMachineType: true })
    } else {
      this.setState({ disableMachineType: false })
    }

    this.setState({
      labourGrid: tempArray,
      labourType: [],
      LabourDetailId: '',
      LabourCRMHead: ''
    }, () => {
      this.props.change('LabourCostPerAnnum', '')
      this.props.change('NumberOfLabour', '')
      this.props.change('LabourCost', '')
    });
    this.setState({ errorObj: { labourType: false, peopleCount: false } })
  }

  /**
   * @method updateLabourGrid
   * @description UPDATE LABOUR GRID
  */
  updateLabourGrid = () => {
    const { labourType, labourGrid, labourGridEditIndex, LabourCRMHead } = this.state;
    const { fieldsObj } = this.props

    //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
    let skipEditedItem = labourGrid.filter((el, i) => {
      if (i === labourGridEditIndex) return false;
      return true;
    })
    if (fieldsObj.NumberOfLabour === undefined || Number(fieldsObj.NumberOfLabour) === 0) {
      this.setState({ errorObj: { peopleCount: true } })
      return false;
    }
    //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
    const isExist = skipEditedItem.findIndex(el => (el.labourTypeId === labourType.value))
    if (isExist !== -1) {
      Toaster.warning('Already added, Please check the values.')
      return false;
    }
    if (this.props.invalid === true) {
      return false;
    }
    const LabourPerCost = checkForNull(fieldsObj?.LabourCostPerAnnum)
    const NumberOfLabour = checkForNull(fieldsObj?.NumberOfLabour)
    const TotalLabourCost = checkForNull(LabourPerCost * NumberOfLabour)

    let tempArray = [];

    let tempData = labourGrid[labourGridEditIndex];
    tempData = {
      labourTypeName: labourType.label,
      labourTypeId: labourType.value,
      LabourCostPerAnnum: LabourPerCost,
      NumberOfLabour: NumberOfLabour,
      LabourCost: TotalLabourCost,
      LabourDetailId: this.state.labourDetailId,
      LabourCRMHead: LabourCRMHead ? LabourCRMHead.label : '-'
    }

    tempArray = Object.assign([...labourGrid], { [labourGridEditIndex]: tempData })

    this.setState({
      labourGrid: tempArray,
      labourType: [],
      labourGridEditIndex: '',
      isEditLabourIndex: false,
      LabourCRMHead: ''
    }, () => {
      this.props.change('LabourCostPerAnnum', '')
      this.props.change('NumberOfLabour', '')
      this.props.change('LabourCost', '')
    },
      { errorObj: { peopleCount: false } });
  }

  /**
   * @method resetLabourGridData
   * @description RESET LABOUR TABLE GRID
  */
  resetLabourGridData = () => {
    this.setState({
      labourType: [],
      labourGridEditIndex: '',
      isEditLabourIndex: false,
      LabourCRMHead: ''
    }, () => {
      this.props.change('LabourCostPerAnnum', '')
      this.props.change('NumberOfLabour', '')
      this.props.change('LabourCost', '')
    });
  }

  /**
  * @method editLabourItemDetails
  * @description used to Edit Labour Grid Item
  */
  editLabourItemDetails = (index) => {
    const { labourGrid } = this.state;
    const tempData = labourGrid[index];

    this.setState({
      labourGridEditIndex: index,
      isEditLabourIndex: true,
      labourType: { label: tempData.labourTypeName, value: tempData.labourTypeId },
      LabourCRMHead: { label: tempData.LabourCRMHead, value: index }
    }, () => {
      this.props.change('LabourCostPerAnnum', tempData.LabourCostPerAnnum)
      this.props.change('NumberOfLabour', tempData.NumberOfLabour)
      this.props.change('LabourCost', tempData.LabourCost)
    });
  }

  /**
  * @method deleteLabourItem
  * @description used to Reset form
  */
  deleteLabourItem = (index) => {
    const { labourGrid } = this.state;

    let tempData = labourGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    if (tempData.length === 0) {
      this.setState({ disableMachineType: false })
    }

    this.setState({
      labourGrid: tempData
    })
  }

  calculateTotalLabourCost = () => {
    const { labourGrid } = this.state;
    let cost = labourGrid && labourGrid.reduce((accumulator, item) => {
      return accumulator + item.LabourCost;
    }, 0)
    return cost;
  }

  /**
   * @method processTableHandler
   * @description ADDING PROCESS IN PROCESS TABLE
  */
  processTableHandler = () => {
    const { processName, UOM, processGrid, isProcessGroup, machineType, selectedPlants, effectiveDate } = this.state;

    const { fieldsObj } = this.props
    const OutputPerHours = this.state.UOM.label === HOUR ? 0 : fieldsObj.OutputPerHours
    setTimeout(() => {

      let count = 0;
      if (processName.length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, processName: true } })
        count++;
      }
      if (UOM.length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, processUOM: true } })
        count++;
      }
      if (!(this.state.UOM.label === HOUR) && (checkForNull(fieldsObj.MachineRate) === 0)) {
        this.setState({ errorObj: { ...this.state.errorObj, processMachineRate: true } })
        count++;
      }
      if (count > 0) {
        return false
      }
      if (maxLength10(fieldsObj.MachineRate) || decimalLengthsix(fieldsObj.MachineRate)) {
        return false
      }
      if (checkForNull(fieldsObj?.MachineCost) === 0 || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
        Toaster.warning('Please fill all mandatory fields');
        return false;
      }

      //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
      const isExist = processGrid.findIndex(el => (el.ProcessId === processName.value))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please check the values.')
        return false;
      }


      const NumberOfWorkingHoursPerYear = checkForDecimalAndNull(fieldsObj?.NumberOfWorkingHoursPerYear)
      const TotalMachineCostPerAnnum = checkForDecimalAndNull(fieldsObj?.TotalMachineCostPerAnnum)
      // const MachineRate = fieldsObj.MachineRate
      const MachineRateConversion = fieldsObj?.MachineRateConversion
      const MachineRateLocalConversion = fieldsObj?.MachineRateLocalConversion ?? fieldsObj.MachineRate
      // CONDITION TO CHECK OUTPUT PER HOUR, NUMBER OF WORKING HOUR AND TOTAL MACHINE MACHINE COST IS NEGATIVE OR NOT A NUMBER
      if (NumberOfWorkingHoursPerYear < 0 || isNaN(NumberOfWorkingHoursPerYear) || TotalMachineCostPerAnnum < 0 || isNaN(TotalMachineCostPerAnnum) || fieldsObj?.MachineRate <= 0 || isNaN(fieldsObj?.MachineRate)) {
        Toaster.warning('Machine Rate cannot be zero or negative')
        return false;
      }

      let MachineRate
      const OutputPerYear = checkForNull(OutputPerHours * NumberOfWorkingHoursPerYear);

      if (UOM.type === TIME) {
        MachineRate = this.state.machineRate
      }
      else {
        MachineRate = fieldsObj.MachineRate // THIS IS FOR ALL UOM EXCEPT HOUR
      }

      const tempArray = [];

      tempArray.push(...processGrid, {
        ProcessName: processName.label,
        ProcessId: processName.value,
        UnitOfMeasurement: UOM.label,
        UnitOfMeasurementId: UOM.value,
        OutputPerHours: OutputPerHours,
        OutputPerYear: OutputPerYear,
        MachineRate: MachineRate,
        MachineRateConversion: MachineRateConversion,
        MachineRateLocalConversion: MachineRateLocalConversion,
        MachineRateWithOutInterestAndDepreciation: this?.state?.MachineRateWithOutInterestAndDepreciation,
        MachineRateWithOutInterestAndDepreciationLocalConversion: this?.state?.MachineRateWithOutInterestAndDepreciationLocalConversion ?? this?.state?.MachineRateWithOutInterestAndDepreciation,
        MachineRateWithOutInterestAndDepreciationConversion: this?.state?.MachineRateWithOutInterestAndDepreciationConversion
      })

      this.setState({ IsFinancialDataChanged: true })
      if (tempArray?.length > 0) {

        this.setState({ disableAllForm: true })
      } else {


        this.setState({ disableAllForm: false })

      }

      this.setState({
        processGrid: tempArray,
        processName: [],
        UOM: isProcessGroup ? UOM : [],
        lockUOMAndRate: isProcessGroup,
        disableEffectiveDate: true
      }, () => {
        this.props.change('OutputPerHours', isProcessGroup ? OutputPerHours : 0);
        this.props.change('OutputPerYear', isProcessGroup ? OutputPerYear : 0);
        this.props.change('MachineRate', isProcessGroup ? checkForDecimalAndNull(MachineRate, this.props.initialConfiguration?.NoOfDecimalForPrice) : '');
        this.props.change("MachineRateLocalConversion", isProcessGroup && this.state?.processGrid?.length !== 0 ? MachineRateLocalConversion : '');
        this.props.change("MachineRateConversion", isProcessGroup && this.state?.processGrid?.length !== 0 ? MachineRateConversion : '');
      });
      if (!getConfigurationKey().IsMachineProcessGroup) {
        this.setState({ machineRate: "" })
      }
      this.setState({ errorObj: { processName: false, processUOM: false, processMachineRate: false } }) // RESETING THE STATE MACHINERATE
    }, 200);
    this.props.change("MachineRateLocalConversion", '')
    this.props.change("MachineRateConversion", '')
    this.props.change("MachineRate", '')
  }

  /**
  * @method updateProcessGrid
  * @description Used to handle updateProcessGrid
  */
  updateProcessGrid = () => {
    const { processName, UOM, processGrid, processGridEditIndex } = this.state;
    const { fieldsObj } = this.props
    const MachineRateConversion = checkForNull(fieldsObj?.MachineRateConversion)
    const MachineRateLocalConversion = checkForNull(fieldsObj?.MachineRateLocalConversion ?? checkForNull(fieldsObj.MachineRate))
    const OutputPerHours = this.state.UOM.label === HOUR ? 0 : fieldsObj.OutputPerHours
    const OutputPerYear = checkForNull(OutputPerHours * NumberOfWorkingHoursPerYear);
    //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
    let skipEditedItem = processGrid.filter((el, i) => {
      if (i === processGridEditIndex) return false;
      return true;
    })

    let count = 0;
    if (processName.length === 0) {
      this.setState({ errorObj: { ...this.state.errorObj, processName: true } })
      count++;
    }
    if (UOM.length === 0) {
      this.setState({ errorObj: { ...this.state.errorObj, processUOM: true } })
      count++;
    }
    if (!(this.state.UOM.label === HOUR) && checkForNull(fieldsObj.MachineRate) === 0) {
      this.setState({ errorObj: { ...this.state.errorObj, processMachineRate: true } })
      count++;
    }
    if (count > 0) {
      return false
    }

    //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
    const isExist = skipEditedItem.findIndex(el => (el.processId === processName.value && el.UnitOfMeasurementId === UOM.value))
    if (isExist !== -1) {
      Toaster.warning('Already added, Please check the values.')
      return false;
    }
    if (this.props.invalid === true) {
      return false;
    }
    const NumberOfWorkingHoursPerYear = fieldsObj.NumberOfWorkingHoursPerYear
    const TotalMachineCostPerAnnum = fieldsObj.TotalMachineCostPerAnnum

    // CONDITION TO CHECK OUTPUT PER HOUR, NUMBER OF WORKING HOUR AND TOTAL MACHINE MACHINE COST IS NEGATIVE OR NOT A NUMBER
    if (NumberOfWorkingHoursPerYear < 0 || isNaN(NumberOfWorkingHoursPerYear) || TotalMachineCostPerAnnum < 0 || isNaN(TotalMachineCostPerAnnum)) {
      Toaster.warning('Machine rate can not be negative.')
      return false;
    }
    let MachineRate
    // const TotalMachineCostPerAnnum = checkForNull(fieldsObj.TotalCost) + checkForNull(fieldsObj.RateOfInterestValue) + checkForNull(fieldsObj.DepreciationAmount) + checkForDecimalAndNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())

    if (UOM.type === TIME) {
      MachineRate = this.state.machineRate
    } else {
      MachineRate = fieldsObj.MachineRate // THIS IS FOR ALL UOM EXCEPT HOUR
    }
    if (NumberOfWorkingHoursPerYear < 0 || isNaN(NumberOfWorkingHoursPerYear) || TotalMachineCostPerAnnum < 0 || isNaN(TotalMachineCostPerAnnum) || fieldsObj?.MachineRate <= 0 || isNaN(fieldsObj?.MachineRate)) {
      Toaster.warning('Machine Rate cannot be zero or negative')
      return false;
    }
    // CONDITION TO CHECK MACHINE RATE IS NEGATIVE OR NOT A NUMBER
    if (MachineRate <= 0 || isNaN(MachineRate)) {
      return false;
    }
    this.setState({ IsFinancialDataChanged: true })
    let tempArray = [];

    let tempData = processGrid[processGridEditIndex];
    tempData = {
      ProcessName: processName.label,
      ProcessId: processName.value,
      UnitOfMeasurement: UOM.label,
      UnitOfMeasurementId: UOM.value,
      MachineRate: MachineRate,
      MachineRateConversion: MachineRateConversion,
      MachineRateLocalConversion: MachineRateLocalConversion,
      MachineRateWithOutInterestAndDepreciation: this?.state?.MachineRateWithOutInterestAndDepreciation,
      MachineRateWithOutInterestAndDepreciationLocalConversion: this?.state?.MachineRateWithOutInterestAndDepreciationLocalConversion ?? this?.state?.MachineRateWithOutInterestAndDepreciation,
      MachineRateWithOutInterestAndDepreciationConversion: this?.state?.MachineRateWithOutInterestAndDepreciationConversion,
      OutputPerHours: OutputPerHours,
      OutputPerYear: OutputPerYear,
    }

    tempArray = Object.assign([...processGrid], { [processGridEditIndex]: tempData })

    const { isProcessGroup } = this.state

    this.setState({
      processGrid: tempArray,
      processName: [],
      UOM: isProcessGroup ? UOM : [],
      lockUOMAndRate: isProcessGroup,
      processGridEditIndex: '',
      isEditIndex: false,
      machineRate: ""
    }, () => {

      this.props.change('MachineRate', isProcessGroup ? checkForDecimalAndNull(MachineRate, this.props.initialConfiguration?.NoOfDecimalForPrice) : '')
    });

  };

  /**
  * @method resetProcessGridData
  * @description RESET PROCESS TABIE GRID
  */
  resetProcessGridData = () => {
    const { isProcessGroup, UOM } = this.state
    const { fieldsObj } = this.props;
    const MachineRateLocalConversion = checkForNull(fieldsObj?.MachineRateLocalConversion ?? checkForNull(fieldsObj.MachineRate))
    const MachineRateConversion = checkForNull(fieldsObj?.MachineRateConversion)
    this.setState({
      processName: [],
      UOM: isProcessGroup && this.state.processGrid.length !== 0 ? UOM : [],
      processGridEditIndex: '',
      isEditIndex: false,
    }, () => {
      this.props.change('OutputPerHours', isProcessGroup ? fieldsObj.OutputPerHours : 0);
      this.props.change('OutputPerYear', isProcessGroup ? fieldsObj.OutputPerYear : 0);
      this.props.change('MachineRate', isProcessGroup && this.state.processGrid.length !== 0 ? checkForDecimalAndNull(fieldsObj.MachineRate, this.props.initialConfiguration?.NoOfDecimalForPrice) : '');
      this.props.change("MachineRateLocalConversion", isProcessGroup && this.state.processGrid.length !== 0 ? MachineRateLocalConversion : '');
      this.props.change("MachineRateConversion", isProcessGroup && this.state.processGrid.length !== 0 ? MachineRateConversion : '');
    });
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index) => {
    const { processGrid } = this.state;
    const tempData = processGrid[index];
    const uomDetail = this.findUOMType(tempData.UnitOfMeasurementId)
    this.setState({
      processGridEditIndex: index,
      isEditIndex: true,
      processName: { label: tempData.processName, value: tempData.ProcessId },
      UOM: { label: tempData.UnitOfMeasurement, value: tempData.UnitOfMeasurementId, type: uomDetail.Type, uom: uomDetail.Text },
      machineRate: tempData.MachineRate
    }, () => {
      this.props.change('OutputPerHours', tempData.OutputPerHours)
      this.props.change('OutputPerYear', tempData.OutputPerYear)
      this.props.change('MachineRate', checkForDecimalAndNull(tempData.MachineRate, getConfigurationKey().NoOfDecimalForPrice),
        this.props.change("MachineRateLocalConversion", tempData?.MachineRateLocalConversion),
        this.props.change("MachineRateConversion", tempData?.MachineRateConversion))
    })
  }

  findUOMType = (uomId) => {
    const uomObj = this.props.UOMSelectList && this.props.UOMSelectList.find(item => item.Value === uomId)
    return { type: uomObj?.Type, uom: uomObj?.Text, }
  }

  /**
   * @method deleteItem
   * @description DELETE ROW ENTRY FROM TABLE 
   */
  deleteItem = (index) => {
    const { processGrid, UOM, isProcessGroup } = this.state;
    const { fieldsObj } = this.props;

    let tempData = processGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });

    if (tempData.length === 0) {
      this.setState({ disableAllForm: false })
    }
    if (isProcessGroup) {
      this.setState({ lockUOMAndRate: tempData.length === 0 ? false : true })
    } else {
      this.setState({ lockUOMAndRate: isProcessGroup })
    }
    if (tempData && tempData?.length === 0) {
      this.setState({ disableEffectiveDate: false })
    }
    this.setState({
      processGrid: tempData,
      UOM: tempData.length === 0 ? [] : !this.state.lockUOMAndRate ? [] : UOM,
      isEditIndex: false,
      processName: [],
      IsFinancialDataChanged: true
    }, () => {
      this.props.change('OutputPerHours', tempData.length > 0 ? fieldsObj.OutputPerHours : 0)
      this.props.change('OutputPerYear', tempData.length > 0 ? fieldsObj.OutputPerYear : 0)
      this.props.change('MachineRate', tempData.length > 0 ? fieldsObj.MachineRate : '')
    })
  }


  handleCalculation = (ratebaseCurrency) => {
    const { fieldsObj, initialConfiguration } = this.props
    const { plantCurrency, settlementCurrency, processGrid ,entryType} = this.state
     // Update process grid with new rates
     const updatedProcessGrid = processGrid.map(process => {
      if (entryType) {
        const MachineRateLocalConversion = convertIntoCurrency(process.MachineRate, plantCurrency)
        const MachineRateConversion = convertIntoCurrency(
          checkForDecimalAndNull(MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice),
          settlementCurrency
        )
        return {
          ...process,
          MachineRateLocalConversion: checkForDecimalAndNull(MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice),
          MachineRateConversion: checkForDecimalAndNull(MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice)
        }
      } else {
        const MachineRateConversion = convertIntoCurrency(process.MachineRate, plantCurrency)
        return {
          ...process,
          MachineRateConversion: checkForDecimalAndNull(MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice)
        }
      }
    })

    this.setState({ processGrid: updatedProcessGrid })
    const NoOfPieces = checkForNull(fieldsObj.NumberOfPieces)
    const BasicRate = checkForNull(fieldsObj.BasicRate)
    const NetLandedCost = checkForNull(BasicRate / NoOfPieces)
    this.props.change('NetLandedCost', NetLandedCost)
    const { MachineRateWithOutInterestAndDepreciation } = this.state
    if (entryType) {
      const MachineRateLocalConversion = convertIntoCurrency(checkForNull(fieldsObj?.MachineRate), plantCurrency)
      this.props.change('MachineRateLocalConversion', checkForDecimalAndNull(MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice));
      const MachineRateWithOutInterestAndDepreciationLocalConversion = convertIntoCurrency(checkForNull(MachineRateWithOutInterestAndDepreciation), plantCurrency)
      const MachineRateWithOutInterestAndDepreciationConversion = convertIntoCurrency(checkForDecimalAndNull(MachineRateWithOutInterestAndDepreciationLocalConversion, initialConfiguration?.NoOfDecimalForPrice), settlementCurrency)
      this.setState({ MachineRateWithOutInterestAndDepreciationLocalConversion: MachineRateWithOutInterestAndDepreciationLocalConversion, MachineRateWithOutInterestAndDepreciationConversion: MachineRateWithOutInterestAndDepreciationConversion })
      const MachineRateConversion = convertIntoCurrency(checkForDecimalAndNull(MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice), settlementCurrency)
      this.props.change('MachineRateConversion', checkForDecimalAndNull(MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice));
    } else {
      const MachineRateConversion = convertIntoCurrency(fieldsObj?.MachineRate, plantCurrency)
      this.props.change('MachineRateConversion', checkForDecimalAndNull(MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice));
      const MachineRateWithOutInterestAndDepreciationConversion = convertIntoCurrency(checkForNull(MachineRateWithOutInterestAndDepreciation, initialConfiguration?.NoOfDecimalForPrice), plantCurrency)
      this.setState({ MachineRateWithOutInterestAndDepreciationConversion: MachineRateWithOutInterestAndDepreciationConversion })
    }
  }
  HandleMachineRateSelectedCurrency = (e) => {
    const value = e.target.value;
    this.setState({ currency: value })
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
    this.setState({ attachmentLoader: true })
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
      this.props.fileUploadMachine(data, (res) => {
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
  cancel = () => {
    const { reset, editDetails } = this.props;

    reset();
    this.setState({
      remarks: '',
    })
    const data = {}
    // For cancel of mpre detail form to reset form in addMachine form
    data.cancelFlag = true
    data.isFinalApprovar = this.state.isFinalApprovar
    /* IF CANCEL IS CLICKED AND MACHINE FORM IS IN EDIT FORM CONTAINING VALUE */
    if (editDetails.isIncompleteMachine || this.state.isEditFlag) {
      data.isViewFlag = true
      data.Id = this.state.MachineID ? this.state.MachineID : editDetails.Id
      data.isEditFlag = true
      data.hidePlant = this.state?.hidePlantCurrency

      this.props.hideMoreDetailsForm({}, data)
    } else {

      /*IF CANCEL IS CLICK AND MACHINE IS IN ADD FORM*/
      this.props.hideMoreDetailsForm(data)
    }
    //this.props.getRawMaterialDetailsAPI('', false, res => { })
  }
  cancelHandler = () => {
    if (this.state.isViewMode) {
      this.cancel('cancel')
    } else {
      this.setState({ showPopup: true })
    }
  }
  onPopupConfirm = () => {
    this.cancel()
    this.setState({ showPopup: false })
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  handleCurrency = (newValue) => {
    const { fieldsObj } = this.props;
    const { costingTypeId, selectedCustomer, selectedVedor, effectiveDate, ExchangeSource, currency, entryType, selectedPlants } = this.state;

    if (newValue && newValue !== '') {

      this.setState({ currency: newValue }, () => {
        this.props.editDetails?.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, newValue, entryType, ExchangeSource, effectiveDate, selectedCustomer, selectedVedor, selectedPlants)
          .then(result => {
            if (result) {
              this.setState({ ...result, showWarning: result?.showWarning, showPlantWarning: result.showPlantWarning }, () => {
                this.props.editDetails?.handleCalculation(this.fieldsObj?.MachineRate);
              });
            }
          });

      });
    } else {
      this.setState({ currency: [] })
    }
  };
  handleMachineDetailsAPI = (data, isUpdate = false) => {
    const apiCall = isUpdate ? this.props.updateMachineDetails : this.props.createMachineDetails;
    apiCall(data, (res) => {
      if (res?.data?.Result) {
        data.isViewFlag = true;
        data.hidePlant = this.state?.hidePlantCurrency
        this.props.hideMoreDetailsForm(data);
        Toaster.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
        if (!isUpdate) {
          this.cancel();
        }
      }
    });
  }

  validateProcessGrid = (processGrid) => {
    if (!processGrid?.length) {
      Toaster.warning('Please add at least one process');
      return false;
    }
    return true;
  };

  checkNonFinancialDataChanges = (values, DataToChange) => {
    const {files}=this.state
    return {
      nonFinancialDataNotChanged:((files ? JSON.stringify(files) : []) === (DataToChange.Attachements ? JSON.stringify(DataToChange.Attachements) : []))&&
       String(DataToChange.MachineName??'') === String(values.MachineName??'')&&
       String(DataToChange.Specification??'') === String(values.Specification??'')&&
       String(DataToChange.Description??'') === String(values.Description??'')&&
       (DataToChange.Remark ?? '') === (values.Remark ?? '')&&
       String(DataToChange.Manufacture??'') === String(values.Manufacture??''),
    };
  };
  checksFinancialDataNotChanged = (values,DataToChange) => {
    const {processGrid}=this.state
    const sortObject = obj => Object.fromEntries(Object.entries(obj).sort());

const sortedProcessGrid = processGrid.map(sortObject);
const sortedMachineProcessRates = DataToChange?.MachineProcessRates.map(sortObject);
    return{
      financialDataNotChanged: JSON.stringify(sortedProcessGrid) === JSON.stringify(sortedMachineProcessRates) &&
      checkForNull(values.LoanPercentage) === checkForNull(DataToChange?.LoanPercentage) &&
      checkForNull(values.RateOfInterestPercentage) === checkForNull(DataToChange?.RateOfInterestPercentage) &&
      checkForNull(values.NumberOfWorkingHoursPerYear) === checkForNull(DataToChange?.NumberOfWorkingHoursPerYear) &&
      checkForNull(values.DepreciationAmount) === checkForNull(DataToChange?.DepreciationAmount) &&
      checkForNull(values.MachineFloorAreaPerSquareFeet) === checkForNull(DataToChange?.MachineFloorAreaPerSquareFeet)&&
      checkForNull(values.TotalMachineCostPerAnnum) === checkForNull(DataToChange?.TotalMachineCostPerAnnum)&&
      JSON.stringify(this.state.labourGrid) === JSON.stringify(DataToChange?.MachineLabourRates)&&
      checkForNull(values.TotalPowerCostPerYear) === checkForNull(DataToChange?.TotalPowerCostPerYear)&&
      checkForNull(values.TotalFuelCostPerYear) === checkForNull(DataToChange?.TotalFuelCostPerYear)&&
      checkForNull(values.TotalPowerCostPerHour) === checkForNull(DataToChange?.TotalPowerCostPerHour)&&
      checkForNull(values.TotalCost) === checkForNull(DataToChange?.TotalCost)&&
      JSON.stringify(this.props.processGroupApiData??[]) === JSON.stringify(DataToChange?.MachineProcessGroup??[])&&
      (DataToChange.TonnageCapacity ? Number(DataToChange.TonnageCapacity) : '') === (values.TonnageCapacity ? Number(values.TonnageCapacity) : ''),
} 
  }

  onSubmit = (values) => {
    const {
      isEditFlag, MachineID, processGrid, IsFinancialDataChanged,
      files, DataToChange, machineType, isDateChange, isFinalApprovar
    } = this.state;
    const { editDetails, isMachineAssociated } = this.props;

    // Validate process grid
    if (!this.validateProcessGrid(processGrid)) {
      return false;
    }

    // Build request data with all fields
    const requestData = this.buildRequestData(values);

    // Handle edit mode
    if (isEditFlag) {
      const isSuperAdminOrFinalApprover = isFinalApprovar || userDetails().Role === 'SuperAdmin';
      const isApprovalRequired = CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !isSuperAdminOrFinalApprover;

      // Check for data changes
      const nonFinancialDataNotChanged = this.checkNonFinancialDataChanges(values, DataToChange).nonFinancialDataNotChanged;
      let financialDataNotChanged=this.checksFinancialDataNotChanged(values,DataToChange).financialDataNotChanged
      if (financialDataNotChanged && nonFinancialDataNotChanged) {
        this.setState({ isEditBuffer: true })
        if (isApprovalRequired) {
          Toaster.warning('Please change data to send machine for approval')
        }
        else {
          Toaster.warning('Please change data to update machine')
        }
        return false
      }
      else {
        if ((!financialDataNotChanged && this.props?.isMachineAssociated)) {
          if (checkEffectiveDate(editDetails?.fieldsObj?.EffectiveDate, values.EffectiveDate)) {
            Toaster.warning('Please update the effective date')
            return false
          }
        }
      }
    

      // Prepare machine data for update
      const machineData = {
        ...requestData,
        MachineId: editDetails.Id,
        IsFinancialDataChanged: isDateChange,
        IsForcefulUpdated: true
      };
      // Handle approval flow
      if (isApprovalRequired && !isFinalApprovar) {
        this.setState({
          approveDrawer: true,
          approvalObj: machineData,
          formDataState: requestData
        });
      } else {
        this.handleMachineDetailsAPI(machineData, true);
      }

    } else {
      // Handle new submission
      const isApprovalRequired = CheckApprovalApplicableMaster(MACHINE_MASTER_ID);

      if (isApprovalRequired && !isFinalApprovar) {
        this.setState({
          IsSendForApproval: true,
          approveDrawer: true,
          approvalObj: requestData,
          formDataState: requestData
        });
      } else {
        this.setState({ IsSendForApproval: false });
        this.handleMachineDetailsAPI(requestData, false);
      }
    }
  };


  // Helper method to build request data
  buildRequestData = (values) => {
    const {
      selectedTechnology, selectedPlants, machineType, remarks, files, DateOfPurchase,
      IsAnnualMaintenanceFixed, IsAnnualConsumableFixed, IsInsuranceFixed, IsUsesFuel,
      fuelType, labourGrid, processGrid, machineFullValue, effectiveDate, powerId,
      IsUsesSolarPower, powerIdFromAPI, crmHeads, entryType, MachineID, isEditFlag,
      IsIncludeMachineRateDepreciation, CostingTypeId, IsPurchased, depreciationType,
      shiftType, selectedCustomer, selectedVedor, ExchangeSource, plantCurrencyID,
      settlementCurrency, plantCurrency, currency, settlementExchangeRateId, plantExchangeRateId,
      FuelEntryId, isDateChange
    } = this.state;


    const { fieldsObj } = this.props;
    const userDetail = userDetails();

    // Prepare arrays and transformed data
    const technologyArray = selectedTechnology && [{
      Technology: selectedTechnology.label || selectedTechnology[0].label,
      TechnologyId: selectedTechnology.value || selectedTechnology[0].value
    }];

    const plantArray = Array.isArray(selectedPlants)
      ? selectedPlants?.map(plant => ({
        PlantId: plant?.value,
        PlantName: plant?.label,
        PlantCode: ''
      }))
      : selectedPlants
        ? [{
          PlantId: selectedPlants?.value,
          PlantName: selectedPlants?.label,
          PlantCode: ''
        }]
        : [];

    // Return full request object with all fields
    return {
      // Basic machine details
      MachineId: MachineID,
      MachineName: values.MachineName,
      MachineNumber: values.MachineNumber,
      MachineTypeId: machineType ? machineType?.value : '',
      Manufacture: values.Manufacture,
      YearOfManufacturing: values.YearOfManufacturing,
      TonnageCapacity: values.TonnageCapacity,
      Description: fieldsObj.Description,
      Specification: fieldsObj.Specification,

      // Costs and financial details
      MachineCost: values.MachineCost,
      AccessoriesCost: values.AccessoriesCost,
      InstallationCharges: values.InstallationCharges,
      TotalCost: machineFullValue.totalCost,

      // Depreciation details
      DepreciationTypeId: depreciationType?.value || '',
      DepreciationType: depreciationType?.value || '',
      DepreciationRatePercentage: values.DepreciationRatePercentage,
      LifeOfAssetPerYear: values.LifeOfAssetPerYear,
      CostOfScrap: values.CastOfScrap,
      DepreciationAmount: machineFullValue.depreciationAmount,

      // Working details
      WorkingShift: shiftType?.value || '',
      WorkingHoursPerShift: values.WorkingHoursPerShift,
      NumberOfWorkingDaysPerYear: values.NumberOfWorkingDaysPerYear,
      EfficiencyPercentage: values.EfficiencyPercentage,
      NumberOfWorkingHoursPerYear: values.NumberOfWorkingHoursPerYear,

      // Loan and equity details
      LoanPercentage: values.LoanPercentage,
      LoanValue: machineFullValue.LoanValue,
      EquityPercentage: values.EquityPercentage,
      EquityValue: machineFullValue.EquityValue,
      RateOfInterestPercentage: values.RateOfInterestPercentage,
      RateOfInterestValue: machineFullValue.RateOfInterestValue,

      // Maintenance and consumables
      IsMaintanceFixed: !IsAnnualMaintenanceFixed,
      AnnualMaintancePercentage: values.AnnualMaintancePercentage,
      AnnualMaintanceAmount: IsAnnualMaintenanceFixed ? machineFullValue.MaintananceCost : values.AnnualMaintanceAmount,
      IsConsumableFixed: !IsAnnualConsumableFixed,
      AnnualConsumablePercentage: values.AnnualConsumablePercentage,
      AnnualConsumableAmount: IsAnnualConsumableFixed ? machineFullValue.ConsumableCost : values.AnnualConsumableAmount,

      // Insurance and building costs
      IsInsuranceFixed: !IsInsuranceFixed,
      AnnualInsurancePercentage: values.AnnualInsurancePercentage,
      AnnualInsuranceAmount: IsInsuranceFixed ? machineFullValue.InsuranceCost : values.AnnualInsuranceAmount,
      BuildingCostPerSquareFeet: values.BuildingCostPerSquareFeet,
      MachineFloorAreaPerSquareFeet: values.MachineFloorAreaPerSquareFeet,
      AnnualAreaCost: machineFullValue.annualAreaCost,
      OtherYearlyCost: values.OtherYearlyCost,
      TotalMachineCostPerAnnum: machineFullValue.TotalMachineCostPerAnnum,

      // Power and fuel details
      IsUsesFuel,
      PowerId: powerIdFromAPI || null,
      UtilizationFactorPercentage: values.UtilizationFactorPercentage,
      PowerCostPerUnit: machineFullValue.PowerCostPerUnit,
      PowerRatingPerKW: values.PowerRatingPerKW,
      TotalPowerCostPerYear: machineFullValue.totalPowerCostPrYer,
      TotalPowerCostPerHour: machineFullValue.TotalPowerCostPerHour,
      IsUsesSolarPower,
      FuleId: fuelType?.value || '',
      FuelCostPerUnit: machineFullValue.FuelCostPerUnit,
      ConsumptionPerYear: values.ConsumptionPerYear,
      TotalFuelCostPerYear: machineFullValue.TotalFuelCostPerYear,

      // Labour and process details
      MachineLabourRates: labourGrid,
      TotalLabourCostPerYear: values.TotalLabourCostPerYear,
      MachineProcessRates: processGrid,

      // Vendor and customer details
      IsVendor: false,
      IsDetailedEntry: true,
      VendorId: CostingTypeId !== VBCTypeId ? userDetail.ZBCSupplierInfo.VendorId : selectedVedor?.value,
      VendorName: CostingTypeId !== VBCTypeId ? '' : selectedVedor?.label,
      CustomerId: CostingTypeId === CBCTypeId ? selectedCustomer?.value : null,
      CustomerName: CostingTypeId === CBCTypeId ? selectedCustomer?.label : "",

      // Technology and plant details
      Technology: technologyArray,
      Plant: plantArray,
      selectedPlants,

      // Dates and metadata
      DateOfPurchase: DayTime(DateOfPurchase).format('YYYY-MM-DD HH:mm:ss'),
      EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
      LoggedInUserId: loggedInUserId(),

      // Additional data
      Attachements: files,
      Remark: remarks,
      MachineProcessGroup: this.props?.processGroupApiData,
      rowData: this.state.rowData,
      VendorPlant: [],
      DestinationPlantId: '',

      // Status flags
      IsFinancialDataChanged: isDateChange,
      IsIncludeMachineCost: IsIncludeMachineRateDepreciation,
      IsSendForApproval: CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !this.state.isFinalApprovar,

      // Entry type and currency details
      MachineEntryType: entryType ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
      ExchangeSource: ExchangeSource || null,
      LocalCurrencyId: entryType ? plantCurrencyID : null,
      LocalCurrency: entryType ? fieldsObj?.plantCurrency : null,
      ExchangeRate: entryType ? settlementCurrency : plantCurrency,
      LocalCurrencyExchangeRate: entryType ? plantCurrency : null,
      CurrencyId: entryType ? currency?.value : plantCurrencyID,
      Currency: entryType ? currency?.label : fieldsObj?.plantCurrency,
      ExchangeRateId: entryType ? settlementExchangeRateId : plantExchangeRateId,
      LocalExchangeRateId: entryType ? plantExchangeRateId : null,

      // IDs and references
      CostingTypeId,
      FuelEntryId,
      PowerEntryId: null,

      // CRM heads
      ...crmHeads
    };
  };

  handleYearChange = (year) => {
    this.setState({
      manufactureYear: year
    })
  }

  /**
   * @method loanToggle
   * @description LOAN ROW OPEN  AND CLOSE
  */
  loanToggle = () => {
    const { isLoanOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props
    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isLoanOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }
    this.setState({
      isLoanOpen: !isLoanOpen
    })
  }

  /**
  * @method workingHourToggle
  * @description WORKING HOUR ROW OPEN  AND CLOSE
  */
  workingHourToggle = () => {
    const { isWorkingOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props

    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isWorkingOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }

    this.setState({ isWorkingOpen: !isWorkingOpen })
  }
  checksFinancialDataChanged = (data) => {
    this.setState({ IsFinancialDataChanged: data })
  }

  /**
   * @method depreciationToogle
   * @description depreciation ROW OPEN  AND CLOSE
  */
  depreciationToogle = () => {
    const { isDepreciationOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props

    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isDepreciationOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }

    this.setState({ isDepreciationOpen: !isDepreciationOpen })
  }

  /**
   * @method variableCostToggle
   * @description VARIABLE COST ROW OPEN  AND CLOSE
  */
  variableCostToggle = () => {
    const { isVariableCostOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props

    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isVariableCostOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }

    this.setState({ isVariableCostOpen: !isVariableCostOpen })
  }
  handleExchangeRateSource = (newValue) => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, entryType, selectedPlants, selectedCustomer, selectedVedor } = this.state;
    this.setState({ ExchangeSource: newValue }
      , () => {
        this.props.editDetails?.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, entryType, newValue, effectiveDate, selectedCustomer, selectedVedor, selectedPlants)
          .then(result => {
            if (result) {
              this.setState({ ...result, showWarning: result.showWarning, showPlantWarning: result.showPlantWarning }, () => {
                this.handleCalculation(this.fieldsObj?.MachineRate);
              });
            }
          });
      }

    );
  };
  /**
  * @method powerToggle
  * @description POWER OPEN  AND CLOSE
  */
  powerToggle = () => {
    const { isPowerOpen, machineType, selectedPlants, effectiveDate, IsUsesSolarPower, machineFullValue } = this.state
    const { fieldsObj } = this.props
    const { initialConfiguration } = this.props
    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isPowerOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }
    if (!isPowerOpen) {
      const baseCurrency = reactLocalStorage.getObject("baseCurrency")
      const data = this.props.data ?? {};
      const PlantId = Array.isArray(selectedPlants) ? selectedPlants[0]?.value : selectedPlants?.value;
      setTimeout(() => {
        let obj = {
          plantId: PlantId,
          effectiveDate: effectiveDate,
          costingTypeId: this.state.costingTypeId ? this.state.costingTypeId : '',
          vendorId: this.state.vendorId ? this.state.vendorId : '',
          customerId: this.state.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
          toCurrency: fieldsObj?.plantCurrency,
          ExchangeSource: data?.ExchangeRateSourceName || "",
          entryType: data?.entryType === "Import" ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,

        }
        this.props.getPowerCostUnit(obj, res => {
          let Data = res?.data?.DynamicData;
          if (res && res.data && res.data.Message !== '') {
            Toaster.warning(res.data.Message)
            machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
            this.setState({
              machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue?.PowerCostPerUnit, powerId: Data?.PowerId },
              powerIdFromAPI: Data?.PowerId
            })
            this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data?.SolarPowerRatePerUnit, initialConfiguration?.NoOfDecimalForPrice))
          } else {
            //  if(IsUsesSolarPower)
            machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data?.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
            this.setState({
              machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue?.PowerCostPerUnit, powerId: Data?.PowerId },
              powerIdFromAPI: Data?.PowerId
            })
            this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data?.SolarPowerRatePerUnit, initialConfiguration?.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, initialConfiguration?.NoOfDecimalForPrice))
          }
        })
      }, 1000);
    }
    this.setState({ isPowerOpen: !isPowerOpen })
  }

  // powerToggle = () => {
  //   const { isPowerOpen } = this.state
  //   this.setState({ isPowerOpen: !isPowerOpen })
  // }

  /**
  * @method labourToggle
  * @description lABOUR OPEN  AND CLOSE
  */
  labourToggle = () => {
    const { isLabourOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props

    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isLabourOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill the mandatory fields.');
      scroll.scrollToTop();
      return false;
    }
    this.setState({ isLabourOpen: !isLabourOpen })
  }

  /**
   * @method processToggle
   * @description PROCESS OPEN  AND CLOSE
  */
  processToggle = () => {
    const { isProcessOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props

    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isProcessOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }
    this.setState({ isProcessOpen: !isProcessOpen })
  }
  processGroupToggle = () => {
    const { isProcessGroupOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props

    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isProcessGroupOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
    }
    this.setState({ isProcessGroupOpen: !isProcessGroupOpen })
  }
  handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  changeDropdownValue = () => {
    this.setState({ DropdownChange: false })
  }

  showDelete = (uniqueProcessId) => {
    if (!this.state.UniqueProcessId || this.state.UniqueProcessId?.length === 0) {
      this.setState({ UniqueProcessId: [...this.state.UniqueProcessId, ...uniqueProcessId] })
    } else {
      this.setState({ UniqueProcessId: [...uniqueProcessId] })
    }
  }
  /**
  * @method DisplayMachineRateLabel
  * @description for machine rate label with dynamic uom change
  */

  // DisplayMachineRateLabel = () => {
  //   return <>Machine Rate/{(this.state.UOM && this.state.UOM.length !== 0) ? displayUOM(this.state.UOM.label) : "UOM"} ({reactLocalStorage.getObject("baseCurrency")})</>
  // }
  DisplayMachineRateBaseCurrencyLabel = () => {
    return <>Machine Rate/{this.state.UOM && this.state.UOM.length !== 0 ? displayUOM(this.state.UOM.label) : "UOM"} ({reactLocalStorage.getObject("baseCurrency")})</>
  }
  DisplayMachineRateLabel = () => {
    const { data } = this.props;
    const { UOM } = this.state;
    let currencyLabel = '';

    if (data?.entryType === 'Domestic') {
      currencyLabel = this?.props?.fieldsObj?.plantCurrency || 'Currency';
    } else if (data?.entryType === 'Import') {
      currencyLabel = this?.state?.currency?.label || 'Currency';
    } else {
      currencyLabel = 'Currency';
    }

    return <>Machine Rate/{(UOM && UOM.length !== 0) ? displayUOM(UOM?.label) : "UOM"} ({currencyLabel})</>
  }
  DisplayMachineRatePlantCurrencyLabel = () => {
    return <>Machine Rate/{this.state.UOM && this.state.UOM.length !== 0 ? displayUOM(this.state.UOM.label) : "UOM"} ({this.props.fieldsObj.plantCurrency ? this.props.fieldsObj.plantCurrency : "Currency"})</>
  }
  DisplayMachineCostLabel = () => {
    const { UOM, entryType } = this.state;
    let currencyLabel = !entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
      (this?.state?.currency?.label || 'Currency')
    return <>Machine Cost ({currencyLabel})</>
  }
  handleChangeIncludeMachineRateDepreciation = (value) => {

    this.setState({
      IsIncludeMachineRateDepreciation: !this.state.IsIncludeMachineRateDepreciation
    }, () => {
      this.handleProcessCalculation()
    })
  }

  handleCRMHeads = (value, name) => {

    let currentCrmHead = value && value.label
    let { crmHeads } = this.state
    let obj = { ...crmHeads }
    switch (String(name)) {
      case "LoanCRMHead":
        obj.LoanCRMHead = currentCrmHead
        break;
      case "InterestCRMHead":
        obj.InterestCRMHead = currentCrmHead
        break;
      case "FuelCRMHead":
        obj.FuelCRMHead = currentCrmHead
        break;
      case "WorkingShiftCRMHead":
        obj.WorkingShiftCRMHead = currentCrmHead
        break;
      case "DepreciationCRMHead":
        obj.DepreciationCRMHead = currentCrmHead
        break;
      case "AnnualMaintanceCRMHead":
        obj.AnnualMaintanceCRMHead = currentCrmHead
        break;
      case "AnnualConsumableCRMHead":
        obj.AnnualConsumableCRMHead = currentCrmHead
        break;
      case "AnnualInsuranceCRMHead":
        obj.AnnualInsuranceCRMHead = currentCrmHead
        break;
      case "BuildingCRMHead":
        obj.BuildingCRMHead = currentCrmHead
        break;
      case "MachineFloorCRMHead":
        obj.MachineFloorCRMHead = currentCrmHead
        break;
      case "OtherYearlyCRMHead":
        obj.OtherYearlyCRMHead = currentCrmHead
        break;
      case "PowerCRMHead":
        obj.PowerCRMHead = currentCrmHead
        break;
      default:
    }
    this.setState({ crmHeads: obj })

    if (this.state.isEditFlag && !compareObjects(obj, this.state.updateCrmHeadObj)) {
      this.setState({ IsFinancialDataChanged: true })

    }
  }

  updateTourContainer = (stateName, type) => {
    if (type === 'start') {
      this.setState({ tourContainer: { [stateName]: true } })

    }
    else if (type === 'exit') {
      this.setState({ tourContainer: { [stateName]: false } })
    }
  }
  machineRateTooltip = () => {
    const { UOM, IsIncludeMachineRateDepreciation } = this.state
    const { initialConfiguration } = this.props
    let formula;
    if (IsIncludeMachineRateDepreciation) {
      formula = `Machine Rate/${this.state?.UOM?.label ? this.state?.UOM?.label : "UOM"} = (Total Cost(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Interest Value + Depreciation Amount(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Total Machine Cost/Annum(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Total Power Cost/Annum(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Total Labour Cost/Annum(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) )/No. of Working Hrs/Annum (${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`;
    } else {
      formula = `Machine Rate/${this.state?.UOM?.label ?this.state?.UOM?.label : "UOM"} = (Interest Value (${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Depreciation Amount(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Total Machine Cost/Annum(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Total Power Cost/Annum(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Total Labour Cost/Annum(${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) )/No. of Working Hrs/Annum (${!this.state.entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`;
    }

    switch (UOM.uom) {
      case "Hours":
        return formula;
      case "Minutes":
        return `${formula} / 60`;
      case "Seconds":
        return `${formula} / 3600`;
      default:
        return "Invalid UOM";
    }
  }
  ImportToggle = () => {
    this.setState({ powerIsImport: !this.state.powerIsImport }, () => {
      if (this.state?.selectedPlants?.value && this.state?.selectedPlants?.value !== null) {
        const PlantId = Array.isArray(this.state.selectedPlants) ? this.state.selectedPlants[0]?.value : this.state.selectedPlants?.value;
        let obj = {
          plantId: PlantId,
          vendorId: this.state.selectedVedor?.value ? this.state.selectedVedor?.value : '',
          customerId: this.state.selectedCustomer?.value ? this.state.selectedCustomer?.value : '',
          costingTypeId: this.state.CostingTypeId || null,
          entryType: this.state.powerIsImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
          countryId: this.state.countryId || null,
          stateId: this.state.stateId || null,
          cityId: this.state.cityId || null
        }
        this.props.getFuelByPlant(obj, () => { })
        //this.props.getFuelList(obj, () => { })
      }
      // this.props.change("MachineRate", "")
      // this.props.change("MachineRateLocalConversion", "")
      // this.props.change("MachineRateConversion", "")
      // this.callExchangeRateAPI()
    })
  }
  machineRateTitle = () => {
    return {
      tooltipTextPlantCurrency: `Machine Rate/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label} (${this.state?.currency?.label??'Currency'}) * Plant Currency Rate (${this.state?.plantCurrency})`,
      toolTipTextNetCostBaseCurrency: this.state?.hidePlantCurrency
        ? `Machine Rate/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label} (${this.state?.currency?.label ?? 'Currency'}) * Currency Rate (${this.state?.plantCurrency ?? ''})`
        : `Machine Rate/${this.state?.UOM?.label === undefined ? 'UOM' : this.state?.UOM?.label} (${this?.props?.fieldsObj?.plantCurrency ?? 'Currency'}) * Currency Rate (${this.state?.settlementCurrency ?? ''})`,
    };
  };
  getTooltipTextForCurrency = () => {
    const { fieldsObj } = this.props
    const { settlementCurrency, plantCurrency, currency } = this.state
    const currencyLabel = currency?.label ?? 'Currency';
    const plantCurrencyLabel = fieldsObj?.plantCurrency ?? 'Plant Currency';
    const baseCurrency = reactLocalStorage.getObject("baseCurrency");

    // Check the exchange rates or provide a default placeholder if undefined
    const plantCurrencyRate = plantCurrency ?? '-';
    const settlementCurrencyRate = settlementCurrency ?? '-';

    // Generate tooltip text based on the condition
    return <>
      {!this.state?.hidePlantCurrency
        ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrencyLabel}, `
        : ''}<p>{this.state?.hidePlantCurrency ? `Exchange Rate: 1 ${currencyLabel} = ${plantCurrencyRate} ${plantCurrencyLabel}` : `Exchange Rate: 1 ${plantCurrencyLabel} = ${settlementCurrencyRate} ${baseCurrency}`}</p>
    </>;
  };

  /**
   * @method render
   * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, isMachineAssociated, t, data } = this.props;
    const { isLoader, isOpenAvailability, isEditFlag, isViewMode, isOpenMachineType, isOpenProcessDrawer,
      isLoanOpen, isWorkingOpen, isDepreciationOpen, isVariableCostOpen, disableMachineType, isViewFlag, isPowerOpen, isLabourOpen, isProcessOpen, UniqueProcessId, isProcessGroupOpen, disableAllForm, UOMName, CostingTypePermission, disableSendForApproval, tourContainer, entryType } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;


    return (
      <>
        {(isLoader || this.state.finalApprovalLoader) && <LoaderCustom />}
        <div className="container-fluid">
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  {!data.isCostingDrawer && <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h2>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} More Details
                          <Button
                            id="addPower_guide"
                            variant={"ml-2"}
                            className={`guide-bulb${tourContainer.initial ? "-on" : ""} ${false ? "" : "d-none"}`}
                            onClick={() => this.updateTourContainer('initial', 'start')}
                            title='Guide'
                          />
                          {tourContainer.initial && <TourWrapper steps={Steps(t).ADD_MACHINE_MORE_RATE_DETAILS} stepsEnable={true} start={tourContainer.initial}
                            onExit={() => this.updateTourContainer('initial', 'exit')}
                          />
                          }
                        </h2>
                        <Row>
                          <Col md="4" className="switch mt-3 mb15">
                            <label className="switch-level">
                              <div className="left-title">Domestic</div>
                              <Switch
                                //onChange={this.ImportToggle}
                                checked={this.state.entryType}
                                id="normal-switch"
                                disabled={true}
                                background="#4DC771"
                                onColor="#4DC771"
                                onHandleColor="#ffffff"
                                offColor="#4DC771"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={20}
                                width={46}
                              />
                              <div className="right-title">Import</div>
                            </label>
                          </Col>
                        </Row>
                      </div >
                    </div >
                  </div >}
                  <form
                    noValidate
                    className="form"
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                  >
                    <div className="add-min-height">
                      <Row>
                        <Col md="12">
                          {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="AddMachineRate_zeroBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={
                                this?.state?.costingTypeId === ZBCTypeId ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(ZBCTypeId)
                              }
                              disabled={true}
                            />{" "}
                            <span>Zero Based</span>
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="AddMachineRate_vendorBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={
                                this?.state?.costingTypeId === VBCTypeId ? true : false
                              }

                              disabled={true}
                            />{" "}
                            <span>{VendorLabel} Based</span>
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="AddMachineRate_customerBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={
                                this?.state?.costingTypeId === CBCTypeId ? true : false
                              }

                              disabled={true}
                            />{" "}
                            <span>Customer Based</span>
                          </Label>}
                        </Col>
                      </Row >
                      <Row>
                        <Col md="12">
                          <HeaderTitle
                            title={'Machine:'}
                            customClass={'Personal-Details'} />
                        </Col>
                        {/* WILL BE USED LATER */}

                        {/* <Col md="3" className="switch mb15">
                          <label>Ownership</label>
                          <label className="switch-level">
                            <div className={'left-title'}>Purchased</div>
                            <Switch
                              onChange={this.onPressOwnership}
                              checked={this.state.IsPurchased}
                              id="normal-switch"
                              disabled={isEditFlag ? true : false}
                              background="#4DC771"
                              onColor="#4DC771"
                              onHandleColor="#ffffff"
                              offColor="#4DC771"
                              uncheckedIcon={false}
                              checkedIcon={false}
                              height={20}
                              width={46}
                            />
                            <div className={'right-title'}>Leased</div>
                          </label>
                        </Col> */}

                        <Col md="3">
                          <Field
                            name="Plant"
                            type="text"
                            label="Plant (Code)"
                            component={searchableSelect}
                            placeholder={(isEditFlag || isViewFlag) || (isMachineAssociated) ? '-' : 'Select'}
                            options={this.renderListing('plant')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            validate={(this.state.selectedPlants == null || Object.keys(this.state.selectedPlants).length === 0) ? [required] : []}
                            required={true}
                            handleChangeDescription={this.handlePlants}
                            valueDescription={this.state.selectedPlants}
                            // disabled={isEditFlag ? true : false}
                            disabled={(isEditFlag || isViewFlag || disableAllForm) || (isMachineAssociated)}

                          />
                        </Col>
                        {getConfigurationKey().IsSourceExchangeRateNameVisible && (
                          <Col md="3">
                            <Field
                              label="Exchange Rate Source"
                              name="exchangeSource"
                              placeholder="Select"
                              options={this.renderListing("ExchangeSource")}
                              handleChangeDescription={this.handleExchangeRateSource}
                              component={searchableSelect}
                              valueDescription={this.state?.ExchangeSource}

                              className="multiselect-with-border"
                              disabled={isEditFlag || isViewFlag || isViewMode}
                            />
                          </Col>
                        )}
                        <Col md="3">
                          <Field
                            label={`Machine No.`}
                            name={"MachineNumber"}
                            type="text"
                            placeholder={(isEditFlag || initialConfiguration?.IsAutoGeneratedMachineNumber) ? '-' : 'Enter'}
                            validate={initialConfiguration?.IsAutoGeneratedMachineNumber ? [] : [required]}
                            component={renderText}
                            required={initialConfiguration?.IsAutoGeneratedMachineNumber ? false : true}
                            disabled={(isEditFlag || initialConfiguration?.IsAutoGeneratedMachineNumber) ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Machine Name`}
                            name={"MachineName"}
                            type="text"
                            placeholder={this.state.isViewFlag ? '-' : 'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation]}
                            //RE SPECIFIC MACHINE NAME REQUIRED
                            //  validate={[required, acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation]}
                            component={renderText}
                            required={false}
                            disabled={this.state.isViewFlag ? true : false}
                            // disabled={(this.state.isViewFlag || this.state.isEditFlag) ? true : false}  //RE 
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Machine Specification`}
                            name={"Specification"}
                            type="text"
                            placeholder={this.state.isViewFlag ? '-' : 'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation]}
                            component={renderText}
                            // required={true}
                            disabled={this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Description`}
                            name={"Description"}
                            type="text"
                            placeholder={this.state.isViewFlag ? '-' : 'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
                            component={renderText}
                            // required={true}
                            disabled={this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>

                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <Field
                                name="MachineType"
                                type="text"
                                label="Machine Type"
                                component={searchableSelect}
                                placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                                options={this.renderListing('MachineTypeList')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.machineType == null || this.state.machineType.length === 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleMachineType}
                                valueDescription={this.state.machineType}
                                disabled={this.state.isViewFlag}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Manufacturer`}
                            name={"Manufacture"}
                            type="text"
                            placeholder={this.state.isViewFlag ? '-' : 'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, hashValidation]}
                            component={renderText}
                            //required={true}
                            disabled={this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <div className="form-group">
                            <label>
                              Year of Manufacturing
                              {/* <span className="asterisk-required">*</span> */}
                            </label>
                            <div id="AddMoreDetails_yearofManfacturing" className="inputbox date-section">
                              <DatePicker
                                // label={`Year of Manufacturing`}
                                name="YearOfManufacturing"
                                selected={this.state.manufactureYear}
                                onChange={this.handleYearChange}
                                showMonthDropdown
                                showYearDropdown
                                showYearPicker
                                dropdownMode='select'
                                dateFormat="yyyy"
                                //maxDate={new Date()}
                                placeholderText="Enter"
                                className="withBorder"
                                autoComplete={'off'}
                                disabledKeyboardNavigation
                                //onChangeRaw={(e) => e.preventDefault()}
                                disabled={this.state.isViewFlag ? true : false}
                              />
                            </div>
                          </div>
                          {/* <Field
                          label={`Year of Manufacturing`}
                          name={"YearOfManufacturing"}
                          //type="text"
                          showYearPicker
                          selected={this.state.manufactureYear}                       
                          onSelect={this.handleYearChange}
                          placeholder={disableAllForm ? '-' :'Enter'}
                          // dateFormat={'yyyy'}
                          // validate={[number]}
                          component={renderYearPicker}
                          autoComplete={'off'}
                          disabledKeyboardNavigation
                          onChangeRaw={(e) => e.preventDefault()}
                          //required={true}
                          disabled={isEditFlag ? true : false}
                          className=" "
                          customClassName="withBorder"
                        /> */}

                          {/* <RenderYearPicker
                          label={"Year of Manufacturing"}
                          name="YearOfManufacturing"
                          selected={this.state.manufactureYear}
                          handleChange={this.handleYearChange}
                          // showMonthDropdown
                          // showYearDropdown
                          showYearPicker
                          dateFormat="yyyy"
                          mandatory={false}
                          rules={{
                            required: false,
                          }}
                          //maxDate={new Date()}
                          placeholder={disableAllForm ? '-' :'Enter'}
                          className="withBorder"
                          autoComplete={'off'}
                          disabledKeyboardNavigation
                          disabled={isEditFlag ? true : false}
                        /> */}
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Machine Tonnage(Ton)`}
                            name={"TonnageCapacity"}
                            type="text"
                            placeholder={this.state.isViewFlag ? '-' : 'Enter'}
                            validate={[checkWhiteSpaces, postiveNumber, maxLength10, hashValidation, required]}
                            component={renderText}
                            disabled={this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                            required={true}
                          />
                        </Col>

                        <Col md="3">
                          <Field
                            label={this.DisplayMachineCostLabel()}
                            name={"MachineCost"}
                            type="text"
                            placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                            validate={[required, positiveAndDecimalNumber, maxLength20, decimalLengthFour, hashValidation]}
                            component={renderText}
                            required={true}
                            disabled={isEditFlag || disableAllForm ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Accessories Cost (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                              (this?.state?.currency?.label || 'Currency')})`}
                            name={"AccessoriesCost"}
                            type="text"
                            placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                            validate={[positiveAndDecimalNumber, maxLength20, decimalLengthFour, hashValidation]}
                            component={renderText}
                            //required={true}
                            disabled={isEditFlag || disableAllForm ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Installation Charges (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                              (this?.state?.currency?.label || 'Currency')})`}
                            name={"InstallationCharges"}
                            type="text"
                            placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                            validate={[positiveAndDecimalNumber, maxLength20, decimalLengthFour, hashValidation]}
                            component={renderText}
                            //required={true}
                            disabled={isEditFlag || disableAllForm ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3"> <TooltipCustom disabledIcon={true} tooltipClass={'machine-tooltip'} id="total-cost" tooltipText={"Total Cost = (Machine Cost + Accessories Cost + Installation Charges)"} />
                          <Field
                            label={`Total Cost (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                              (this?.state?.currency?.label || 'Currency')})`}
                            name={this.props.fieldsObj.TotalCost === 0 ? '' : "TotalCost"}
                            type="text"
                            id="total-cost"
                            placeholder={'-'}
                            validate={[]}
                            component={renderTextInputField}
                            required={false}
                            disabled={true}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col Col md="3" className='p-relative'>
                          {this.props.fieldsObj?.plantCurrency && !this.state.hidePlantCurrency && !this.state.entryType && <TooltipCustom id="plantCurrency" width="350px" tooltipText={`Exchange Rate: 1 ${this.props.fieldsObj?.plantCurrency} = ${this.state?.plantCurrency ?? '-'} ${reactLocalStorage.getObject("baseCurrency")}`} />}
                          <Field
                            label="Plant Currency"
                            name="plantCurrency"
                            type="text"
                            placeholder="-"
                            component={renderText}
                            disabled={true}
                            className=" "
                            customClassName="withBorder mb-1"
                          />
                          {this.state.showPlantWarning && <WarningMessage dClass="mt-1" message={`${this.props.fieldsObj.plantCurrency} rate is not present in the Exchange Master`} />}
                        </Col>

                        {this.state?.entryType && <Col md="3">
                          <TooltipCustom id="currency" width="350px" tooltipText={this.getTooltipTextForCurrency()} />
                          <Field
                            name="currency"
                            type="text"
                            label="Currency"
                            component={searchableSelect}
                            id="currency"
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
                            disabled={isEditFlag ? true : false || isViewMode || isViewFlag}
                            customClassName="mb-1"
                          >{this.state?.currency?.label && this.state.showWarning && <WarningMessage dClass="mt-1" message={`${this.state.currency.label} rate is not present in the Exchange Master`} />}
                          </Field>
                        </Col>}
                        <Col md="3">
                          <div className="form-group">
                            <div className="inputbox date-section">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                minDate={this.state.minDate || getEffectiveDateMinDate()}
                                selected={this.state.effectiveDate || null}
                                placeholder={this.state.isViewFlag || !this.state.IsFinancialDataChanged ? '-' : "Select Date"}
                                onChange={this.handleEffectiveDateChange}
                                maxDate={getEffectiveDateMaxDate()}
                                type="text"
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={this.state.isViewFlag}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col md="6" className='d-flex align-items-center mb-2'>
                          <label
                            className={`custom-checkbox w-auto ${isViewMode ? "disabled" : ""}`}
                            onChange={this.handleChangeIncludeMachineRateDepreciation}
                          > Include Total Cost in Machine Rate
                            <input
                              type="checkbox"
                              checked={this.state.IsIncludeMachineRateDepreciation}
                              disabled={isViewMode || this.state.processGrid?.length !== 0}
                            />
                            <span
                              className=" before-box"
                              checked={this.state.IsIncludeMachineRateDepreciation}
                              onChange={this.handleChangeIncludeMachineRateDepreciation}
                            />
                          </label>
                        </Col>
                      </Row>
                      {/*  LOAN AND INTREST VALUE */}
                      <Row className="mb-3 accordian-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Loan & Interest:'}
                            customClass={'Personal-Details'}
                          />
                          {isLoanOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.loanTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('loanTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.loanTour && <TourWrapper steps={Steps(t).ADD_MACHINE_LOAN_AND_INTEREST} stepsEnable={true} start={tourContainer.loanTour}
                                onExit={() => this.updateTourContainer('loanTour', 'exit')}
                              />
                              }
                            </div>)}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.loanToggle} type="button">{isLoanOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isLoanOpen &&
                          <div className="accordian-content row mx-0 w-100">
                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="LoanCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'LoanCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.LoanCRMHead, value: 1 }}
                              />
                            </Col>}

                            <Col md="4">
                              <Field
                                label={`Loan (%)`}
                                name={"LoanPercentage"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                component={renderText}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="4">
                              <TooltipCustom disabledIcon={true} width="350px" tooltipClass={'machine-tooltip'} id="EquityPercentage" tooltipText={"Equity (Owned) (%) = 100 - (Loan %)"} />
                              <Field
                                label={`Equity (Owned) (%)`}
                                name={"EquityPercentage"}
                                id="EquityPercentage"
                                type="text"
                                placeholder={'-'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                component={renderText}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="InterestCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'InterestCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.InterestCRMHead, value: 2 }}
                              />
                            </Col>}

                            <Col md="4">
                              <Field
                                label={`Rate of Interest (%) / Annum`}
                                name={this.props.fieldsObj.RateOfInterestPercentage === 0 ? '-' : "RateOfInterestPercentage"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                component={renderText}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="4">
                              <TooltipCustom disabledIcon={true} width="350px" tooltipClass={'machine-tooltip'} id="LoanValue" tooltipText={"Loan Value = (Loan %) / 100 * Total Cost"} />
                              <Field
                                label={`Loan Value`}
                                name={this.props.fieldsObj.LoanValue === 0 ? '-' : "LoanValue"}
                                type="text"
                                id="LoanValue"
                                placeholder={'-'}
                                validate={[number]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="4">
                              <TooltipCustom disabledIcon={true} width="350px" tooltipClass={'machine-tooltip'} id="EquityValue" tooltipText={"Equity Value = (Equity %) / 100 * Total Cost"} />
                              <Field
                                label={`Equity Value`}
                                name={this.props.fieldsObj.EquityValue === 0 ? '-' : "EquityValue"}
                                type="text"
                                id="EquityValue"
                                placeholder={'-'}
                                validate={[number]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>


                            <Col md="4">
                              <TooltipCustom disabledIcon={true} tooltipClass={'machine-tooltip'} id="RateOfInterestValue" width={'350px'} tooltipText={"Interest Value = (Loan %) / 100 * Total Cost * (Rate of Interest %) / 100"} />
                              <Field
                                label={`Interest Value (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={this.props.fieldsObj.RateOfInterestValue === 0 ? '-' : "RateOfInterestValue"}
                                type="text"
                                placeholder={'-'}
                                id="RateOfInterestValue"
                                validate={[number]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>

                          </div>
                        }
                      </Row>
                      {/* WORKING HOURS */}
                      <Row className="mb-3 accordian-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Working Hours:'}
                            customClass={'Personal-Details'} />
                          {isWorkingOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.workingHoursTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('workingHoursTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.workingHoursTour && <TourWrapper steps={Steps(t).ADD_MACHINE_WORKING_HOURS} stepsEnable={true} start={tourContainer.workingHoursTour}
                                onExit={() => this.updateTourContainer('workingHoursTour', 'exit')}
                              />
                              }
                            </div>)}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.workingHourToggle} type="button">{isWorkingOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isWorkingOpen &&
                          <div className="accordian-content row mx-0 w-100">
                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="WorkingShiftCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'WorkingShiftCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.WorkingShiftCRMHead, value: 3 }}
                              />
                            </Col>}

                            <Col md="3">
                              <Field
                                name="WorkingShift"
                                type="text"
                                label="No. of Shifts"
                                component={searchableSelect}
                                placeholder={'Select'}
                                options={this.renderListing('ShiftType')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.shiftType == null || this.state.shiftType.length === 0) ? [] : []}
                                required={false}
                                handleChangeDescription={this.handleShiftType}
                                valueDescription={this.state.shiftType}
                                disabled={disableAllForm}
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Working Hrs/Shift`}
                                name={"WorkingHoursPerShift"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[hashValidation, positiveAndDecimalNumber, maxValue24]}
                                component={renderText}
                                required={false}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`No. of Working days/Annum`}
                                name={"NumberOfWorkingDaysPerYear"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength3, decimalLength2, maxValue366]}
                                component={renderText}
                                required={false}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center filled-icon-inside">
                                <div className="fullinput-icon">
                                  <Field
                                    label={`Availability (%)`}
                                    name={"EfficiencyPercentage"}
                                    type="text"
                                    placeholder={disableAllForm ? '-' : 'Enter'}
                                    validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                    component={renderText}
                                    required={false}
                                    disabled={disableAllForm}
                                    className=" "
                                    customClassName="withBorder"
                                  />
                                </div>
                                {!disableAllForm &&
                                  <div
                                    onClick={this.efficiencyCalculationToggler}
                                    className={'calculate-icon mt-0 right'}>
                                  </div>
                                }
                              </div>
                            </Col>
                            <Col md="3">
                              <TooltipCustom disabledIcon={true} id="NumberOfWorkingHoursPerYear" width={'350px'} tooltipText={'No. of Working Hrs/Annum = No. of Shifts * Working Hrs/Shift * No. of Working days/Annum * (Availability %) / 100'} />
                              <Field
                                label={`No. of Working Hrs/Annum (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={this.props.fieldsObj.NumberOfWorkingHoursPerYear === 0 ? '-' : "NumberOfWorkingHoursPerYear"}
                                type="text"
                                id="NumberOfWorkingHoursPerYear"
                                placeholder={'-'}
                                // validate={[required]}
                                component={renderTextInputField}
                                // required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                          </div>
                        }
                      </Row>

                      {/* DEPRICIATION  */}
                      <Row className="mb-3 accordian-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Depreciation:'}
                            customClass={'Personal-Details'} />
                          {isDepreciationOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.depreciationTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('depreciationTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.depreciationTour && <TourWrapper steps={Steps(t).ADD_MACHINE_DEPRECIATION} stepsEnable={true} start={tourContainer.depreciationTour}
                                onExit={() => this.updateTourContainer('depreciationTour', 'exit')}
                              />
                              }
                            </div>)}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.depreciationToogle} type="button">{isDepreciationOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isDepreciationOpen &&
                          <div className="accordian-content row mx-0 w-100">

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="DepreciationCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'DepreciationCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.DepreciationCRMHead, value: 4 }}
                              />
                            </Col>}

                            <Col md="3">
                              <Field
                                name="DepreciationTypeId"
                                type="text"
                                label="Depreciation Type"
                                component={searchableSelect}
                                placeholder={disableAllForm ? '-' : 'Select'}
                                options={this.renderListing('DepreciationType')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.depreciationType == null || this.state.depreciationType.length === 0) ? [] : []}
                                required={false}
                                handleChangeDescription={this.handleDereciationType}
                                valueDescription={this.state.depreciationType}
                                disabled={disableAllForm}
                              />
                            </Col>
                            {
                              this.state.depreciationType &&
                              this.state.depreciationType.value !== SLM &&
                              <Col md="3">
                                <Field
                                  label={`Depreciation Rate (%)`}
                                  name={"DepreciationRatePercentage"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={this.state.depreciationType.value === WDM ? [required, number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation] : [hashValidation, decimalLengthThree]}
                                  component={renderText}
                                  required={this.state.depreciationType.value === WDM ? true : false}
                                  disabled={disableAllForm}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                            }
                            {this.state.depreciationType && this.state.depreciationType.value === SLM &&
                              <Col md="3">
                                <Field
                                  label={`Life of Asset(Years)`}
                                  name={"LifeOfAssetPerYear"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[required, positiveAndDecimalNumber, number]}
                                  component={renderTextInputField}
                                  required={true}
                                  disabled={disableAllForm}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>}
                            <Col md="3">
                              <Field
                                label={`Cost of Scrap (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={"CastOfScrap"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                component={renderText}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <div className="form-group">
                                <label>
                                  Date of Purchase
                                  {/* <span className="asterisk-required">*</span> */}
                                </label>
                                <div className="inputbox date-section">
                                  <DatePicker
                                    name="DateOfPurchase"
                                    selected={this.state.DateOfPurchase}
                                    onChange={this.handleDateOfPurchase}
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    dateFormat="dd/MM/yyyy"
                                    //maxDate={new Date()}
                                    id="AddDetails_DateOfPurchase"
                                    placeholderText={disableAllForm ? '-' : "Select Date"}
                                    className="withBorder"
                                    autoComplete={'off'}
                                    disabledKeyboardNavigation
                                    onChangeRaw={(e) => e.preventDefault()}
                                    disabled={disableAllForm}
                                  />
                                </div>
                              </div>
                            </Col>
                            <Col md="3">
                              <TooltipCustom disabledIcon={true} id="DepreciationAmount" width={'350px'} tooltipText={`Depreciation Amount = Total Cost - Cost of Scrap / ${this.state.depreciationType && this.state.depreciationType.value === SLM ? 'Life of Asset(Years)' : '(Depreciation Rate %) * Day of Purchase / 365'}`} />
                              <Field
                                label={`Depreciation Amount  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={this.props.fieldsObj.DepreciationAmount === 0 ? '-' : "DepreciationAmount"}
                                type="text"
                                id="DepreciationAmount"
                                placeholder={'-'}
                                // validate={[required]}
                                component={renderText}
                                // required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                          </div>
                        }
                      </Row>

                      {/* VARIABLE COST */}
                      <Row className="mb-3 accordian-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Variable Cost:'}
                            customClass={'Personal-Details'} />
                          {isVariableCostOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.variableCostTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('variableCostTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.variableCostTour && <TourWrapper steps={Steps(t).ADD_VARIABLE_COST} stepsEnable={true} start={tourContainer.variableCostTour}
                                onExit={() => this.updateTourContainer('variableCostTour', 'exit')}
                              />
                              }
                            </div>)}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.variableCostToggle} type="button">{isVariableCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isVariableCostOpen && <div className="accordian-content row mx-0 w-100">

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="AnnualMaintanceCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'AnnualMaintanceCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.AnnualMaintanceCRMHead, value: 5 }}
                              />
                            </Col>}

                            <Col md={`${this.state.IsAnnualMaintenanceFixed ? 2 : 3}`} className="switch mb15">
                              <label>Annual Maintenance</label>
                              <label className="switch-level mt-2">
                                <div className={'left-title'}>Fixed</div>
                                <Switch
                                  onChange={this.onPressAnnualMaintenance}
                                  checked={this.state.IsAnnualMaintenanceFixed}
                                  id="normal-switch"
                                  disabled={disableAllForm}
                                  background="#4DC771"
                                  onColor="#4DC771"
                                  onHandleColor="#ffffff"
                                  offColor="#4DC771"
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  height={20}
                                  width={46}
                                />
                                <div className={'right-title'}>%</div>
                              </label>
                            </Col>
                            {this.state.IsAnnualMaintenanceFixed &&
                              <Col md="1">
                                <Field
                                  label={``}
                                  name={"AnnualMaintancePercentage"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm}
                                  customClassName="withBorder pt-1"
                                />
                              </Col>}
                            <Col md="3">
                              {this.state.IsAnnualMaintenanceFixed && <TooltipCustom disabledIcon={true} width={"250px"} id="AnnualMaintanceAmount" tooltipText={`Annual Maintenance Amount = ((Machine Cost + Accessories Cost) * Annual Maintenance Percentage / 100)`} />}
                              <Field
                                label={`Annual Maintenance Amount  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={"AnnualMaintanceAmount"}
                                id="AnnualMaintanceAmount"
                                type="text"
                                placeholder={this.state.IsAnnualMaintenanceFixed ? '-' : (disableAllForm) ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={this.state.IsAnnualMaintenanceFixed ? true : (disableAllForm) ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="AnnualConsumableCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'AnnualConsumableCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.AnnualConsumableCRMHead, value: 6 }}
                              />
                            </Col>}

                            <Col md={`${this.state.IsAnnualConsumableFixed ? 2 : 3}`} className="switch mb15">
                              <label>Annual Consumable</label>
                              <label className="switch-level mt-2">
                                <div className={'left-title'}>Fixed</div>
                                <Switch
                                  onChange={this.onPressAnnualConsumable}
                                  checked={this.state.IsAnnualConsumableFixed}
                                  id="normal-switch"
                                  disabled={disableAllForm}
                                  background="#4DC771"
                                  onColor="#4DC771"
                                  onHandleColor="#ffffff"
                                  offColor="#4DC771"
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  height={20}
                                  width={46}
                                />
                                <div className={'right-title'}>%</div>
                              </label>
                            </Col>
                            {this.state.IsAnnualConsumableFixed &&
                              <Col md="1">
                                <Field
                                  label={``}
                                  name={"AnnualConsumablePercentage"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm}
                                  customClassName="withBorder pt-1"
                                />
                              </Col>}
                            <Col md="3">
                              {this.state.IsAnnualConsumableFixed && <TooltipCustom disabledIcon={true} width={"250px"} id="AnnualConsumableAmount" tooltipText={`Annual Consumable Amount = ((Machine Cost + Accessories Cost) * % / 100)`} />}

                              <Field
                                label={`Annual Consumable Amount  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={"AnnualConsumableAmount"}
                                id="AnnualConsumableAmount"
                                type="text"
                                placeholder={this.state.IsAnnualConsumableFixed ? '-' : (disableAllForm) ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                component={renderText}
                                //required={true}
                                disabled={this.state.IsAnnualConsumableFixed ? true : (disableAllForm) ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>


                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="AnnualInsuranceCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'AnnualInsuranceCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.AnnualInsuranceCRMHead, value: 7 }}
                              />
                            </Col>}

                            <Col md={`${this.state.IsInsuranceFixed ? 2 : 3}`} className="switch mb15">
                              <label>Insurance</label>
                              <label className="switch-level mt-2">
                                <div className={'left-title'}>Fixed</div>
                                <Switch
                                  onChange={this.onPressInsurance}
                                  checked={this.state.IsInsuranceFixed}
                                  id="normal-switch"
                                  disabled={disableAllForm}
                                  background="#4DC771"
                                  onColor="#4DC771"
                                  onHandleColor="#ffffff"
                                  offColor="#4DC771"
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  height={20}
                                  width={46}
                                />
                                <div className={'right-title'}>%</div>
                              </label>
                            </Col>
                            {this.state.IsInsuranceFixed &&
                              <Col md="1">
                                <Field
                                  label={``}
                                  name={"AnnualInsurancePercentage"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm}
                                  customClassName="withBorder pt-1"
                                />
                              </Col>}
                            <Col md="3">
                              {this.state.IsInsuranceFixed && <TooltipCustom disabledIcon={true} width={"250px"} id="AnnualInsuranceAmount" tooltipText={`Insurance Amount = ((Machine Cost + Accessories Cost) * % / 100)`} />}
                              <Field
                                label={`Insurance Amount  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={"AnnualInsuranceAmount"}
                                id="AnnualInsuranceAmount"
                                type="text"
                                placeholder={this.state.IsInsuranceFixed ? '-' : (disableAllForm) ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={this.state.IsInsuranceFixed ? true : (disableAllForm) ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="BuildingCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'BuildingCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.BuildingCRMHead, value: 8 }}
                              />
                            </Col>}

                            <Col md="3">
                              <Field
                                label={`Building Cost/Sq Ft/Annum`}
                                name={"BuildingCostPerSquareFeet"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[number, positiveAndDecimalNumber, decimalLengthFour]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="MachineFloorCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'MachineFloorCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.MachineFloorCRMHead, value: 9 }}
                              />
                            </Col>}

                            <Col md="3">
                              <Field
                                label={`Machine Floor Area(Sq Ft)`}
                                name={"MachineFloorAreaPerSquareFeet"}
                                type="text"
                                placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                                validate={[number, positiveAndDecimalNumber]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={isEditFlag || disableAllForm ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <TooltipCustom disabledIcon={true} width={"350px"} id="AnnualAreaCost" tooltipText={`Annual Area Cost = Building Cost * Machine Floor Area`} />

                              <Field
                                label={`Annual Area Cost  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={this.props.fieldsObj.AnnualAreaCost === 0 ? '-' : "AnnualAreaCost"}
                                type="text"
                                id="AnnualAreaCost"
                                placeholder={'-'}
                                // validate={[number, postiveNumber]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>

                            {getConfigurationKey().IsShowCRMHead && <Col md="3">
                              <Field
                                name="OtherYearlyCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={(e) => this.handleCRMHeads(e, 'OtherYearlyCRMHead')}
                                disabled={isViewFlag}
                                valueDescription={{ label: this.state.crmHeads?.OtherYearlyCRMHead, value: 10 }}
                              />
                            </Col>}

                            <Col md="3">
                              <Field
                                label={`Other Yearly Cost  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={"OtherYearlyCost"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour, number]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <TooltipCustom disabledIcon={true} width={"350px"} id="TotalMachineCostPerAnnum" tooltipText={`Total Machine Cost/Annum = Annual Maintenance Amount (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Annual Consumable Amount (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Annual Insurance Amount (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Annual Area Cost (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')}) + Other Yearly Cost (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`} />

                              <Field
                                label={`Total Machine Cost/Annum  (${!entryType ? (this.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={this.props.fieldsObj.TotalMachineCostPerAnnum === 0 ? '-' : "TotalMachineCostPerAnnum"}
                                type="text"
                                id="TotalMachineCostPerAnnum"
                                placeholder={'-'}
                                //validate={[required]}
                                component={renderTextInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                          </div>
                        }
                      </Row>

                      {/* POWER */}
                      <Row className="mb-3 accordian-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Power:'}
                            customClass={'Personal-Details'} />

                          {isPowerOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.powerTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('powerTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.powerTour && <TourWrapper steps={Steps(t).ADD_MACHINE_POWER} stepsEnable={true} start={tourContainer.powerTour}
                                onExit={() => this.updateTourContainer('powerTour', 'exit')}
                              />
                              }
                            </div>)}
                          {/* {this.state?.entryType &&  */}<Row>
                            <Col md="4" className="switch mt-4 mr-3">
                              <label className="switch-level mb-0">
                                <div className="left-title">Domestic</div>
                                <Switch
                                  onChange={this.ImportToggle}
                                  checked={this.state.powerIsImport}
                                  id="normal-switch"
                                  disabled={data.isEditFlag || isViewFlag || disableAllForm ? true : false}
                                  background="#4DC771"
                                  onColor="#4DC771"
                                  onHandleColor="#ffffff"
                                  offColor="#4DC771"
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  height={20}
                                  width={46}
                                />
                                <div className="right-title">Import</div>
                              </label>
                            </Col>
                          </Row>
                          {/* } */}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.powerToggle} type="button">{isPowerOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>

                        {isPowerOpen && <div className="accordian-content row mx-0 w-100">


                          <Col md={`3`} className="switch mb15">
                            <label>Uses Fuel</label>
                            <label className="switch-level">
                              <div className={'left-title'}>No</div>
                              <Switch
                                onChange={this.onPressUsesFuel}
                                checked={this.state.IsUsesFuel}
                                id="normal-switch"
                                disabled={disableAllForm ? true : false}
                                background="#4DC771"
                                onColor="#4DC771"
                                onHandleColor="#ffffff"
                                offColor="#4DC771"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                height={20}
                                width={46}
                              />
                              <div className={'right-title'}>Yes</div>
                            </label>
                          </Col>
                          {/* <TooltipCustom disabledIcon={true} width={"250px"} id="FuelPowerContainer" tooltipText={`Fuel data can only be fetched if the selected plant's country and city match.`} /> */}

                          {this.state.IsUsesFuel &&
                            <>
                              {getConfigurationKey().IsShowCRMHead && <Col md="3">
                                <Field
                                  name="FuelCRMHead"
                                  type="text"
                                  label="CRM Head"
                                  component={searchableSelect}
                                  placeholder={('Select')}
                                  options={CRMHeads}
                                  required={false}
                                  handleChangeDescription={(e) => this.handleCRMHeads(e, 'FuelCRMHead')}
                                  disabled={isViewFlag}
                                  valueDescription={{ label: this.state.crmHeads?.FuelCRMHead, value: 11 }}
                                />
                              </Col>}

                              <Col md="3">
                                <Field
                                  name="FuelTypeId"
                                  type="text"
                                  label="Fuel"
                                  component={searchableSelect}
                                  placeholder={isEditFlag || disableAllForm ? '-' : 'Select'}
                                  options={this.renderListing('fuel')}
                                  //onKeyUp={(e) => this.changeItemDesc(e)}
                                  validate={(this.state.fuelType == null || this.state.fuelType.length === 0) ? [required] : []}
                                  required={true}
                                  handleChangeDescription={this.handleFuelType}
                                  valueDescription={this.state.fuelType}
                                  disabled={disableAllForm ? true : false}
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  label={`Fuel Cost/${UOMName}`}
                                  name={this.props.fieldsObj.FuelCostPerUnit === 0 ? '-' : "FuelCostPerUnit"}
                                  type="text"
                                  placeholder={'-'}
                                  //validate={[required]}
                                  component={renderTextInputField}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  label={`Consumption/Annum`}
                                  name={"ConsumptionPerYear"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <TooltipCustom disabledIcon={true} width={"350px"} id="TotalFuelCostPerYear" tooltipText={`Total Power Cost/Annum (${reactLocalStorage.getObject("baseCurrency")}) = Fuel Cost (${reactLocalStorage.getObject("baseCurrency")}/${UOMName}) * Consumption/Annum (${reactLocalStorage.getObject("baseCurrency")})`} />
                                <Field
                                  label={`Total Power Cost/Annum (${reactLocalStorage.getObject("baseCurrency")})`}
                                  name={"TotalFuelCostPerYear"}
                                  type="text"
                                  id={'TotalFuelCostPerYear'}
                                  placeholder={'-'}
                                  validate={[number]}
                                  component={renderText}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                            </>}

                          {!this.state.IsUsesFuel &&
                            <>
                              {getConfigurationKey().IsShowCRMHead && <Col md="3">
                                <Field
                                  name="PowerCRMHead"
                                  type="text"
                                  label="CRM Head"
                                  component={searchableSelect}
                                  placeholder={('Select')}
                                  options={CRMHeads}
                                  required={false}
                                  handleChangeDescription={(e) => this.handleCRMHeads(e, 'PowerCRMHead')}
                                  disabled={isViewFlag}
                                  valueDescription={{ label: this.state.crmHeads?.PowerCRMHead, value: 12 }}
                                />
                              </Col>
                              }
                              <Col md="3">
                                <Field
                                  label={`Efficiency (%)`}
                                  name={"UtilizationFactorPercentage"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[number, maxPercentValue, checkWhiteSpaces, percentageLimitValidation]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  label={`Power Rating(Kw)`}
                                  name={"PowerRatingPerKW"}
                                  type="text"
                                  placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                                  validate={[number, checkWhiteSpaces, decimalNumberLimit]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm ? true : false}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              <Col md={`3`} className="switch mb15">
                                <label>Uses Solar Power</label>
                                <label className="switch-level">
                                  <div className={'left-title'}>No</div>
                                  <Switch
                                    onChange={this.onPressUsesSolarPower}
                                    checked={this.state.IsUsesSolarPower}
                                    id="normal-switch"
                                    disabled={disableAllForm ? true : false}
                                    background="#4DC771"
                                    onColor="#4DC771"
                                    onHandleColor="#ffffff"
                                    offColor="#4DC771"
                                    uncheckedIcon={false}
                                    checkedIcon={false}
                                    height={20}
                                    width={46}
                                  />
                                  <div className={'right-title'}>Yes</div>
                                </label>
                              </Col>
                              <Col md="3">
                                <Field
                                  label={`Cost/Unit`}
                                  name={"PowerCostPerUnit"}
                                  type="text"
                                  placeholder={'-'}
                                  //validate={[required]}
                                  component={renderTextInputField}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <TooltipCustom disabledIcon={true} id="TotalPowerCostPerHour" width={"350px"} tooltipText={'Power Cost/Hour = (Efficiency %) * Power Rating * Cost/Unit'} />

                                <Field
                                  label={`Power Cost/Hour  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                    (this?.state?.currency?.label || 'Currency')})`}
                                  name={this.props.fieldsObj.TotalPowerCostPerHour === 0 ? '-' : "TotalPowerCostPerHour"}
                                  type="text"
                                  placeholder={'-'}
                                  id="TotalPowerCostPerHour"
                                  //validate={[required]}
                                  component={renderTextInputField}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              <Col md="3">
                                <Field
                                  label={`Power Cost/Annum  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                    (this?.state?.currency?.label || 'Currency')})`}
                                  name={this.props.fieldsObj.TotalPowerCostPerYear === 0 ? '-' : "TotalPowerCostPerYear"}
                                  type="text"
                                  placeholder={'-'}
                                  //validate={[required]}
                                  component={renderTextInputField}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                            </>}
                        </div>
                        }
                      </Row>

                      {/* LABOUR */}
                      <Row className="mb-3 accordian-container child-form-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Labour:'}
                            customClass={'Personal-Details'} />
                          {isLabourOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.labourTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('labourTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.labourTour && <TourWrapper steps={Steps(t).ADD_MACHINE_LABOUR} stepsEnable={true} start={tourContainer.labourTour}
                                onExit={() => this.updateTourContainer('labourTour', 'exit')}
                              />
                              }
                            </div>)}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.labourToggle} type="button">{isLabourOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isLabourOpen && <div className="accordian-content row mx-0 w-100">

                            {getConfigurationKey().IsShowCRMHead && <Col md={'2'}>
                              <Field
                                name="LabourCRMHead"
                                type="text"
                                label="CRM Head"
                                component={searchableSelect}
                                placeholder={('Select')}
                                options={CRMHeads}
                                required={false}
                                handleChangeDescription={this.handleLabourCrmHead}
                                valueDescription={this.state.LabourCRMHead}
                                disabled={isViewFlag}
                              />
                            </Col>}

                            <Col md={getConfigurationKey().IsShowCRMHead ? '2' : '3'} className='p-relative'>
                              <Field
                                name="LabourTypeIds"
                                type="text"
                                label="Labour Type"
                                component={searchableSelect}
                                placeholder={'Select Labour'}
                                options={this.renderListing('labourList')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={(this.state.labourType == null || this.state.labourType.length === 0) ? [required] : []}
                                //required={true}
                                disabled={disableAllForm}
                                handleChangeDescription={this.labourHandler}
                                valueDescription={this.state.labourType}
                                required={true}
                              />
                              {this.state.errorObj.labourType && this.state.labourType.length === 0 && <div className='text-help p-absolute'>This field is required.</div>}
                            </Col>
                            <Col md="2">
                              <Field
                                label={`Cost/Annum  (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={"LabourCostPerAnnum"}
                                type="text"
                                placeholder={'-'}
                                //validate={[required]}
                                component={renderTextInputField}
                                //onChange={this.handleLabourCalculation}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="2" className='p-relative'>
                              <Field
                                label={`No. of People`}
                                name={"NumberOfLabour"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[maxLength10, number]}
                                component={renderTextInputField}
                                //onChange={this.handleLabourCalculation}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                                required={true}
                              />
                              {this.state.errorObj.peopleCount && (this.props.fieldsObj.NumberOfLabour === undefined || Number(this.props.fieldsObj.NumberOfLabour) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                            </Col>
                            <Col md="2">
                              <TooltipCustom disabledIcon={true} width="350px" id="LabourCost" tooltipText={`Total Cost = Cost/Annum * No. of People`} />
                              <Field
                                label={`Total Cost (${!entryType ? (this?.props?.fieldsObj?.plantCurrency || 'Currency') :
                                  (this?.state?.currency?.label || 'Currency')})`}
                                name={this.props.fieldsObj.LabourCost === 0 ? '-' : "LabourCost"}
                                type="text"
                                id="LabourCost"
                                placeholder={'-'}
                                component={renderText}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md={getConfigurationKey().IsShowCRMHead ? '2' : '3'} className='pt-2'>
                              {this.state.isEditLabourIndex ?
                                <>
                                  <button
                                    type="button"
                                    disabled={disableAllForm}
                                    className={'btn btn-primary mt30 pull-left mr10'}
                                    onClick={this.updateLabourGrid}
                                  >Update</button>

                                  <button
                                    type="button"
                                    disabled={disableAllForm}
                                    className={'reset-btn reset mt30 pull-left'}
                                    onClick={this.resetLabourGridData}
                                  >Cancel</button>
                                </>
                                :
                                <>
                                  <button id="AddMoreDetails_Labour_Add"
                                    type="button"
                                    disabled={disableAllForm}
                                    className={'user-btn mt30 pull-left mr15'}
                                    onClick={this.labourTableHandler}>
                                    <div className={'plus'}></div>ADD</button>
                                  <button
                                    type="button"
                                    disabled={disableAllForm}
                                    className={'reset-btn mt30 pull-left'}
                                    onClick={this.resetLabourGridData}
                                  >Reset</button>
                                </>}
                            </Col>
                            <Col md="12">
                              <Table className="table border" size="sm" >
                                <thead>
                                  <tr>
                                    {getConfigurationKey().IsShowCRMHead && <th>{`CRM Head`}</th>}
                                    <th>{`Labour Type`}</th>
                                    <th>{`Cost/Annum (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                    <th>{`No of People (All Shifts)`}</th>
                                    <th>{`Total Cost (${reactLocalStorage.getObject("baseCurrency")})`}</th>
                                    <th>{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >

                                  {
                                    this.state.labourGrid &&
                                    this.state.labourGrid.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          {getConfigurationKey().IsShowCRMHead && <td>{item.LabourCRMHead}</td>}
                                          <td>{item.labourTypeName}</td>
                                          <td>{item.LabourCostPerAnnum}</td>
                                          <td>{item.NumberOfLabour}</td>
                                          <td>{item.LabourCost}</td>
                                          <td>
                                            <button title='Edit' className="Edit mr-2" type={'button'} disabled={disableAllForm} onClick={() => this.editLabourItemDetails(index)} />
                                            <button title='Delete' className="Delete" type={'button'} disabled={disableAllForm} onClick={() => this.deleteLabourItem(index)} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                  {this.state.labourGrid?.length === 0 && <tr>
                                    <td colSpan={getConfigurationKey().IsShowCRMHead ? '6' : '5'}>
                                      <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                  </tr>}
                                </tbody>
                                {this.state.labourGrid?.length > 0 &&
                                  <tfoot>
                                    <tr className="bluefooter-butn">
                                      <td colSpan={getConfigurationKey().IsShowCRMHead ? '4' : '3'} className="text-right">{`Total Labour Cost/Annum (${reactLocalStorage.getObject("baseCurrency")}):`}</td>
                                      <td colSpan={"2"}>{this.calculateTotalLabourCost()}</td>
                                    </tr>
                                  </tfoot>}
                              </Table>
                            </Col>
                          </div>
                        }
                      </Row>

                      {/* PROCEES */}

                      <Row className="mb-3 accordian-container child-form-container">
                        <Col md="6" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Process:'}
                            customClass={'Personal-Details'} />
                          {isProcessOpen && (
                            <div>
                              <Button
                                id="addPower_guide"
                                variant={"ml-2"}
                                className={`guide-bulb${tourContainer.processTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                onClick={() => this.updateTourContainer('processTour', 'start')}
                                title='Guide'
                              />
                              {tourContainer.processTour && <TourWrapper steps={Steps(t).ADD_MACHINE_PROCESS} stepsEnable={true} start={tourContainer.processTour}
                                onExit={() => this.updateTourContainer('processTour', 'exit')}
                              />
                              }
                            </div>)}
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.processToggle} type="button">{isProcessOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isProcessOpen && <div className="accordian-content row mx-0 w-100">
                            <Col md="3">
                              <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                <div className="fullinput-icon">
                                  <Field
                                    name="ProcessName"
                                    type="text"
                                    label="Process (Code)"
                                    component={searchableSelect}
                                    placeholder={this.state.isViewMode ? '-' : 'Select'}
                                    options={this.renderListing('ProcessNameList')}
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                    required={true}
                                    handleChangeDescription={this.handleProcessName}
                                    valueDescription={this.state.processName}
                                    disabled={this.state.isViewMode || (isEditFlag && isMachineAssociated)}
                                  />
                                  {this.state.errorObj.processName && this.state.processName.length === 0 && <div className='text-help p-absolute bottom-7'>This field is required.</div>}

                                </div>
                                {!isEditFlag && <div id="AddMoreDetails_Process"
                                  onClick={this.processToggler}
                                  className={'plus-icon-square right'}>
                                </div>}
                              </div>
                            </Col>
                            <Col md="2" className='p-relative'>
                              <Field
                                name="UOM"
                                type="text"
                                label="UOM"
                                component={searchableSelect}
                                placeholder={this.state.lockUOMAndRate || this.state.isViewMode ? '-' : 'Select'}
                                options={this.renderListing('UOM')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={(this.state.UOM == null || this.state.UOM.length == 0) ? [required] : []}
                                required={true}
                                handleChangeDescription={this.handleUOM}
                                valueDescription={this.state.UOM}
                                disabled={this.state.lockUOMAndRate || this.state.isViewMode || (isEditFlag && isMachineAssociated)}
                              />
                              {this.state.errorObj.processUOM && this.state.UOM.length === 0 && <div className='text-help p-absolute'>This field is required.</div>}

                            </Col>
                            {/* COMMENT FOR NOW MAY BE USED LATER */}
                            {/* {
                              // (this.state.UOM && (this.state.UOM.label !== HOUR || this.state.UOM.length === 0)) &&.la
                              (this.state.UOM.length === 0 || this.state.UOM.label !== HOUR) &&
                              <>
                                <Col md="1">
                                  <Field
                                    label={`Output/Hr`}
                                    name={"OutputPerHours"}
                                    type="text"
                                    placeholder={disableAllForm ? '-' :'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                                    component={renderText}
                                    //required={true}
                                    disabled={this.state.lockUOMAndRate}
                                    className=" "
                                    customClassName="withBorder"
                                  />
                                </Col>
                                <Col md="1">
                                  <Field
                                    label={`Output/Yr`}
                                    name={"OutputPerYear"}
                                    type="text"
                                    placeholder={disableAllForm ? '-' :'Enter'}
                                    //validate={[required]}
                                    component={renderNumberInputField}
                                    //required={true}
                                    disabled={true}
                                    className=" "
                                    customClassName="withBorder"
                                  />
                                </Col>
                              </>

                            } */}


                            <Col md="7" className="UOM-label-container p-relative">
                              {this.state.UOM.type === TIME && <TooltipCustom disabledIcon={true} id="machineRate" tooltipClass={'machine-rate'} tooltipText={this.machineRateTooltip()} />}
                              <Row>
                                <Col md="4">
                                  <div className="machine-rate-filed pr-3">
                                    <Field
                                      label={this.DisplayMachineRateLabel()}
                                      name={"MachineRate"}
                                      type="text"
                                      validate={[positiveAndDecimalNumber, maxLength10, decimalLengthsix]}
                                      component={renderText}
                                      // onChange={this.handleMachineRate}
                                      required={true}
                                      disabled={this.state.UOM.type === TIME ? true : this.state.isViewMode || this.state.lockUOMAndRate || (isEditFlag && isMachineAssociated)}
                                      className=" "
                                      customClassName=" withBorder"
                                      id="machineRate"
                                      placeholder={this.state.UOM.type === TIME ? '-' : this.state.isViewMode || this.state.lockUOMAndRate || (isEditFlag && isMachineAssociated) ? '-' : "Enter"}
                                    />
                                    {this.state.errorObj.processMachineRate && (this.props.fieldsObj.MachineRate === undefined || this.state.UOM.type === TIME ? true : Number(this.props.fieldsObj.MachineRate) === 0) && <div className='text-help p-absolute'>This field is required.</div>}

                                  </div>
                                </Col>
                                {(this?.state?.isImport && !this?.state?.hidePlantCurrency) && <Col md="4" className='UOM-label-container p-relative'>
                                  <TooltipCustom disabledIcon={true} width="350px" id="machine-rate-plant" tooltipText={this.machineRateTitle()?.tooltipTextPlantCurrency} />
                                  <Field
                                    label={this.DisplayMachineRatePlantCurrencyLabel()}
                                    name={"MachineRateLocalConversion"}
                                    type="text"
                                    id="machine-rate-plant"
                                    placeholder={isViewMode || (isEditFlag && isMachineAssociated) ? '-' : 'Enter'}
                                    validate={[number, maxLength10, decimalLengthsix, hashValidation]}
                                    component={renderText}
                                    onChange={this.handleMachineRatePlantCurrency}
                                    required={true}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                  {this.state.errorObj?.MachineRateLocalConversion && (this.props?.fieldsObj?.MachineRateLocalConversion === undefined || Number(this.props?.fieldsObj?.MachineRateLocalConversion) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </Col>}
                                {(!(!this?.state?.isImport && this?.state?.hidePlantCurrency)) && <Col md="4" className='UOM-label-container p-relative'>
                                  <TooltipCustom disabledIcon={true} width="350px" id="machine-rate" tooltipText={this?.state?.isImport ? this.machineRateTitle()?.toolTipTextNetCostBaseCurrency : this.machineRateTitle()?.tooltipTextPlantCurrency} />
                                  <Field
                                    label={this.DisplayMachineRateBaseCurrencyLabel()}
                                    name={"MachineRateConversion"}
                                    id="machine-rate"
                                    type="text"
                                    placeholder={isViewMode || (isEditFlag && isMachineAssociated) ? '-' : 'Enter'}
                                    validate={[number, maxLength10, decimalLengthsix, hashValidation]}
                                    component={renderText}
                                    onChange={this.handleMachineRateBasicCurrency}
                                    required={true}
                                    disabled={true}
                                    className=" "
                                    customClassName=" withBorder"
                                  />
                                  {this.state?.errorObj?.MachineRateConversion && (this.props?.fieldsObj?.MachineRateConversion === undefined || Number(this.props?.fieldsObj?.MachineRateConversion) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                                </Col>}
                                <Col md="4">
                                  <div className="btn-mr-rate pt-2 pr-0 col-auto">
                                    {this.state.isEditIndex ?
                                      <>
                                        <button
                                          type="button"
                                          disabled={this.state.isViewMode || (isEditFlag && isMachineAssociated)}
                                          className={'btn btn-primary pull-left mr5'}
                                          onClick={this.updateProcessGrid}
                                        >Update</button>

                                        <button
                                          type="button"
                                          disabled={this.state.isViewMode || (isEditFlag && isMachineAssociated)}
                                          className={'reset-btn pull-left'}
                                          onClick={this.resetProcessGridData}
                                        >Cancel</button>
                                      </>
                                      :
                                      <>
                                        <button id="AddMoreDetails_Process_Add"
                                          type="button"
                                          className={'user-btn pull-left mr10'}
                                          disabled={this.state.isViewMode || (isEditFlag && isMachineAssociated)}
                                          onClick={this.processTableHandler}>
                                          <div className={'plus'}></div>ADD</button>
                                        <button
                                          type="button"
                                          disabled={this.state.isViewMode}
                                          className={'reset-btn pull-left ml5'}
                                          onClick={this.resetProcessGridData}
                                        >Reset</button> </>
                                    }
                                  </div></Col >
                              </Row >
                            </Col >

                            <Col md="12">
                              <Table className="table border mt-2" size="sm" >
                                <thead>
                                  <tr>
                                    <th>{`Process (Code)`}</th>
                                    <th>{`UOM`}</th>
                                    {/* <th>{`Output/Hr`}</th>     COMMENTED FOR NOW MAY BE USED LATER
                                    <th>{`Output/Annum`}</th> */}
                                    <th>{`Machine Rate (${this.state.entryType && this.state?.currency?.label !== undefined ? this.state?.currency.label : this.state?.isImport ? "Currency" : this.props.fieldsObj?.plantCurrency ? this.props.fieldsObj?.plantCurrency : "Currency"})`}</th>
                                    {(this?.state?.entryType && !this?.state?.hidePlantCurrency) && <th>{`Machine Rate (${this.props.fieldsObj?.plantCurrency ? this.props.fieldsObj?.plantCurrency : "Currency"})`}</th>}
                                    {(!(!this?.state?.entryType && reactLocalStorage.getObject("baseCurrency") === this.props.fieldsObj.plantCurrency)) && <th>{`Machine Rate (${reactLocalStorage.getObject("baseCurrency")})`}</th>}
                                    <th>{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >
                                  {
                                    this.state.processGrid &&
                                    this.state.processGrid.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{item.ProcessName}</td>
                                          <td className='UOM-label-container'>{displayUOM(item.UnitOfMeasurement)}</td>
                                          {/* <td>{item.OutputPerHours}</td>    COMMENTED FOR NOW MAY BE USED LATER
                                          <td>{checkForDecimalAndNull(item.OutputPerYear, initialConfiguration?.NoOfDecimalForInputOutput)}</td> */}
                                          <td>{checkForDecimalAndNull(item?.MachineRate, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                          {(this?.state?.entryType && !this?.state?.hidePlantCurrency) && <td>{checkForDecimalAndNull(item?.MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                                          {(!(!this?.state?.entryType && reactLocalStorage.getObject("baseCurrency") === this.props.fieldsObj.plantCurrency)) && <td>{checkForDecimalAndNull(item?.MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                                          <td>
                                            <button title='Edit' className="Edit mr-2" type={'button'} disabled={this.state.isViewMode || (isEditFlag && isMachineAssociated) || UniqueProcessId?.includes(item.ProcessId)} onClick={() => this.editItemDetails(index)} />
                                            <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(index) || (isEditFlag && isMachineAssociated)} disabled={UniqueProcessId?.includes(item.ProcessId) || this.state.isViewMode} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                  <tr>
                                    {this.state.processGrid?.length === 0 && <td colSpan={"6"}>
                                      <NoContentFound title={EMPTY_DATA} />
                                    </td>}
                                  </tr>
                                </tbody>
                              </Table>

                            </Col>
                          </div >
                        }
                      </Row >

                      {
                        this.state.isProcessGroup &&
                        <Row className='mb-3 accordian-container'>
                          < Col md="6" className='d-flex align-items-center' >
                            <HeaderTitle
                              title={'Process Group:'} />
                            {
                              isProcessGroupOpen && (
                                <div>
                                  <Button
                                    id="addPower_guide"
                                    variant={"ml-2"}
                                    className={`guide-bulb${tourContainer.processGroupTour ? "-on" : ""} ${false ? "" : "d-none"}`}
                                    onClick={() => this.updateTourContainer('processGroupTour', 'start')}
                                    title='Guide'
                                  />
                                  {tourContainer.processGroupTour && <TourWrapper steps={Steps(t).ADD_MACHINE_PROCESS_GROUP} stepsEnable={true} start={tourContainer.processGroupTour}
                                    onExit={() => this.updateTourContainer('processGroupTour', 'exit')}
                                  />
                                  }
                                </div>)
                            }
                          </Col >
                          <Col md="6">
                            <div className={'right-details text-right'}>
                              <button className="btn btn-small-primary-circle ml-1" onClick={this.processGroupToggle} type="button">{isProcessGroupOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                            </div>
                          </Col>
                          {
                            isProcessGroupOpen && <div className="accordian-content row mx-0 w-100">
                              <Col md="12">
                                <ProcessGroup isViewFlag={this.state.isViewFlag} isEditFlag={isEditFlag} processListing={this.state.processGrid} isListing={false} isViewMode={this.state.isViewMode} changeDropdownValue={this.changeDropdownValue} showDelete={this.showDelete} setRowData={this.setRowdata} checksFinancialDataChanged={this.checksFinancialDataChanged} />
                              </Col>
                            </div>
                          }
                        </Row >
                      }
                      < Row >
                        <Col md="12" className="filter-block">
                          <div className="mb-2">
                            <h5>{'Remarks & Attachments:'}</h5>
                          </div>
                        </Col>
                        <Col md="6">
                          <Field
                            id="AddMoreDetails_Remark"
                            label={'Remarks'}
                            name={`Remark`}
                            placeholder={this.state.isViewMode ? '-' : "Type here..."}
                            value={this.state.remarks}
                            className=""
                            customClassName=" textAreaWithBorder"
                            disabled={this.state.isViewMode}
                            onChange={this.handleMessageChange}
                            validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                            // required={true}
                            component={renderTextAreaField}
                            // maxLength="512"
                            rows="6"
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files) <AttachmentValidationInfo /></label>
                          <div className={`alert alert-danger mt-2 ${this.state.files.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div id="AddMoreDetails_UploadFiles" className={`${this.state.files.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={this.dropzone}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                              initialFiles={this.state.initialFiles}
                              maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
                              maxSizeBytes={2000000}
                              disabled={this.state.isViewFlag ? true : isViewMode}
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
                                    {/* <a href={fileURL} target="_blank" download={f.FileName}>
                                                                        <img src={fileURL} alt={f.OriginalFileName} width="104" height="142" />
                                                                    </a> */}
                                    {/* <div className={'image-viwer'} onClick={() => this.viewImage(fileURL)}>
                                                                        <img src={fileURL} height={50} width={100} />
                                                                    </div> */}

                                    {!this.state.isViewMode && <img className="float-right" alt={''} disabled={this.state.isViewMode} onClick={() => this.deleteFile(f.FileId, f.FileName)} src={imgRedcross}></img>}
                                  </div>
                                )
                              })
                            }
                          </div>
                        </Col>
                      </Row >
                    </div >
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                      <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                        {disableSendForApproval && !data.isCostingDrawer && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                        <button id="AddMoreDetails_Cancel"
                          type={'button'}
                          className=" mr15 cancel-btn"
                          onClick={this.cancelHandler} >
                          <div className={"cancel-icon"}></div> {'Cancel'}
                        </button>

                        {
                          !isViewMode && <>
                            {(!isViewMode && initialConfiguration?.IsMasterApprovalAppliedConfigure && (CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !this.state.isFinalApprovar)) || (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !CostingTypePermission) ?
                              <button id="AddMoreDetails_SendForApproval" type="submit"
                                class="user-btn approval-btn save-btn mr5"

                                disabled={this.state.isViewMode || this.state.setDisable || disableSendForApproval || this.state.showPlantWarning ||this.state.showWarning}
                              >
                                <div className="send-for-approval"></div>
                                {'Send For Approval'}
                              </button>
                              :

                              <button
                                type="submit"
                                className="user-btn mr5 save-btn"
                                disabled={this.state.isViewMode || this.state.setDisable || disableSendForApproval || this.state.showPlantWarning || this.state.showWarning}
                              >
                                <div className={"save-icon"}></div>
                                {isEditFlag ? "Update" : "Save"}
                              </button>
                            }
                          </>
                        }

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
          isOpenMachineType && <AddMachineTypeDrawer
            isOpen={isOpenMachineType}
            closeDrawer={this.closeMachineTypeDrawer}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
          />
        }
        {
          isOpenAvailability && <EfficiencyDrawer
            isOpen={isOpenAvailability}
            closeDrawer={this.closeAvailabilityDrawer}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
            NoOfWorkingHours={this.state.NoOfWorkingHours}
            NumberOfWorkingHoursPerYear={this.state.WorkingHrPrYr}
          />
        }
        {
          isOpenProcessDrawer && <AddProcessDrawer
            isOpen={isOpenProcessDrawer}
            closeDrawer={this.closeProcessDrawer}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
          />
        }


        {
          this.state.approveDrawer && (
            <MasterSendForApproval
              isOpen={this.state.approveDrawer}
              closeDrawer={this.closeApprovalDrawer}
              isEditFlag={false}
              masterId={MACHINE_MASTER_ID}
              detailEntry={true}
              type={'Sender'}
              anchor={"right"}
              approvalObj={this.state.approvalObj}
              isBulkUpload={false}
              IsImportEntry={false}
              costingTypeId={this.state.CostingTypeId}
              levelDetails={this.state.levelDetails}
              commonFunction={this.finalUserCheckAndMasterLevelCheckFunction}
              handleOperation={this.handleMachineDetailsAPI}
              isEdit={this.state.isEditFlag}
            />
          )
        }
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
  const { comman, material, machine, labour, fuel, auth, } = state;
  const fieldsObj = selector(state, 'MachineCost', 'AccessoriesCost', 'InstallationCharges', 'LabourCostPerAnnum', 'TotalCost',
    'LoanPercentage', 'LoanValue', 'EquityPercentage', 'EquityValue', 'RateOfInterestPercentage', 'RateOfInterestValue',
    'WorkingHoursPerShift', 'NumberOfWorkingDaysPerYear', 'EfficiencyPercentage', 'NumberOfWorkingHoursPerYear',
    'DepreciationRatePercentage', 'LifeOfAssetPerYear', 'CastOfScrap', 'DepreciationAmount',
    'AnnualMaintancePercentage', 'AnnualMaintanceAmount', 'AnnualConsumablePercentage', 'AnnualConsumableAmount',
    'AnnualInsurancePercentage', 'AnnualInsuranceAmount',
    'BuildingCostPerSquareFeet', 'MachineFloorAreaPerSquareFeet', 'AnnualAreaCost', 'OtherYearlyCost', 'TotalMachineCostPerAnnum',
    'UtilizationFactorPercentage', 'PowerRatingPerKW', 'PowerCostPerUnit', 'TotalPowerCostPerYear', 'TotalPowerCostPerHour',
    'FuelCostPerUnit', 'ConsumptionPerYear',
    'NumberOfLabour', 'LabourCost', 'OutputPerHours', 'OutputPerYear', 'MachineRate', 'DateOfPurchase', 'Description', 'Specification', 'LoanCRMHead',
    'InterestCRMHead', 'WorkingShiftCRMHead', 'DepreciationCRMHead', 'AnnualMaintanceCRMHead', 'AnnualConsumableCRMHead', 'AnnualInsuranceCRMHead', 'BuildingCRMHead',
    'MachineFloorCRMHead', 'OtherYearlyCRMHead', 'PowerCRMHead', 'FuelCRMHead', "MachineRateConversion", "MachineRateLocalConversion", "plantCurrency", "Currency", "ExchangeSource");

  const { technologySelectList, plantSelectList, UOMSelectList,
    ShiftTypeSelectList, DepreciationTypeSelectList, exchangeRateSourceList, currencySelectList } = comman;
  const { machineTypeSelectList, processSelectList, machineData, loading, processGroupApiData } = machine;

  const { labourTypeByMachineTypeSelectList } = labour;
  const { vendorListByVendorType } = material;
  const { fuelDataByPlant } = fuel;
  const { initialConfiguration, userMasterLevelAPI } = auth;

  let initialValues = {};
  if (machineData && machineData !== undefined) {
    initialValues = {
      MachineNumber: machineData.MachineNumber,
      MachineName: machineData.MachineName,
      TonnageCapacity: machineData.TonnageCapacity,
      Manufacture: machineData.Manufacture,
      YearOfManufacturing: machineData.YearOfManufacturing,
      MachineCost: machineData.MachineCost,
      AccessoriesCost: machineData.AccessoriesCost,
      InstallationCharges: machineData.InstallationCharges,
      Description: machineData.Description,
      Specification: machineData.Specification,
      LabourCostPerAnnum: machineData.LabourCostPerAnnum,
      TotalCost: machineData.TotalCost,
      LoanPercentage: machineData.LoanPercentage,
      LoanValue: machineData.LoanValue,
      EquityPercentage: machineData.EquityPercentage,
      EquityValue: machineData.EquityValue,
      RateOfInterestPercentage: machineData.RateOfInterestPercentage,
      RateOfInterestValue: machineData.RateOfInterestValue,
      WorkingHoursPerShift: machineData.WorkingHoursPerShift,
      NumberOfWorkingDaysPerYear: machineData.NumberOfWorkingDaysPerYear,
      EfficiencyPercentage: machineData.EfficiencyPercentage,
      NumberOfWorkingHoursPerYear: machineData.NumberOfWorkingHoursPerYear,
      DepreciationRatePercentage: machineData.DepreciationRatePercentage,
      LifeOfAssetPerYear: machineData.LifeOfAssetPerYear,
      CastOfScrap: machineData.CostOfScrap,
      DepreciationAmount: machineData.DepreciationAmount,
      AnnualMaintancePercentage: machineData.AnnualMaintancePercentage,
      AnnualMaintanceAmount: machineData.AnnualMaintanceAmount,
      AnnualConsumablePercentage: machineData.AnnualConsumablePercentage,
      AnnualConsumableAmount: machineData.AnnualConsumableAmount,
      AnnualInsurancePercentage: machineData.AnnualInsurancePercentage,
      AnnualInsuranceAmount: machineData.AnnualInsuranceAmount,
      BuildingCostPerSquareFeet: machineData.BuildingCostPerSquareFeet,
      MachineFloorAreaPerSquareFeet: machineData.MachineFloorAreaPerSquareFeet,
      AnnualAreaCost: machineData.AnnualAreaCost,
      OtherYearlyCost: machineData.OtherYearlyCost,
      TotalMachineCostPerAnnum: machineData.TotalMachineCostPerAnnum,
      UtilizationFactorPercentage: machineData.UtilizationFactorPercentage,
      PowerRatingPerKW: machineData.PowerRatingPerKW,
      PowerCostPerUnit: machineData.PowerCostPerUnit,
      TotalPowerCostPerYear: machineData.TotalPowerCostPerYear,
      TotalPowerCostPerHour: machineData.TotalPowerCostPerHour,
      FuelCostPerUnit: machineData.FuelCostPerUnit,
      ConsumptionPerYear: machineData.ConsumptionPerYear,
      TotalFuelCostPerYear: machineData.TotalFuelCostPerYear,
      Remark: machineData.Remark,
    }
  }
  return {
    vendorListByVendorType, technologySelectList, plantSelectList, UOMSelectList,
    machineTypeSelectList, processSelectList, ShiftTypeSelectList, DepreciationTypeSelectList,
    initialConfiguration, labourTypeByMachineTypeSelectList, fuelDataByPlant, fieldsObj, initialValues, loading, processGroupApiData, userMasterLevelAPI, exchangeRateSourceList, currencySelectList
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
  getMachineTypeSelectList,
  getProcessesSelectList,
  getShiftTypeSelectList,
  getDepreciationTypeSelectList,
  getLabourTypeByMachineTypeSelectList,
  getFuelByPlant,
  getFuelList,
  getFuelUnitCost,
  getLabourCost,
  getPowerCostUnit,
  createMachineDetails,
  getEffectiveDateMaxDate,
  updateMachineDetails,
  getMachineDetailsData,
  fileUploadMachine,
  checkFinalUser,
  getProcessGroupByMachineId,
  setGroupProcessList,
  setProcessList,
  getUsersMasterLevelAPI,
  checkAndGetMachineNumber,
  getPlantUnitAPI,
  getExchangeRateSource,
  getCurrencySelectList
})(reduxForm({
  form: 'AddMoreDetails',
  validate: validateForm,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  touchOnChange: true,
  enableReinitialize: true,
})(withTranslation(['MachineMaster'])(AddMoreDetails)),
)
