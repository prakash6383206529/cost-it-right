import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Row, Col, Table } from 'reactstrap';
import {
  required, checkForNull, number, acceptAllExceptSingleSpecialCharacter, maxLength10,
  maxLength80, checkWhiteSpaces, checkForDecimalAndNull, postiveNumber, positiveAndDecimalNumber, maxLength20, maxLength3,
  maxLength512, checkPercentageValue, decimalLengthFour, decimalLengthThree, decimalLength2, decimalLengthsix, checkSpacesInString, maxValue366, decimalAndNumberValidation
} from "../../../helper/validation";
import { renderText, renderNumberInputField, searchableSelect, renderTextAreaField, focusOnError, renderDatePicker } from "../../layout/FormInputs";
import { getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, getShiftTypeSelectList, getDepreciationTypeSelectList, } from '../../../actions/Common';
import {
  createMachineDetails, updateMachineDetails, getMachineDetailsData, getMachineTypeSelectList, getProcessesSelectList,
  getFuelUnitCost, getLabourCost, getPowerCostUnit, fileUploadMachine, fileDeleteMachine, getProcessGroupByMachineId, setGroupProcessList, setProcessList
} from '../actions/MachineMaster';
import { getLabourTypeByMachineTypeSelectList } from '../actions/Labour';
import { getFuelByPlant, } from '../actions/Fuel';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA, EMPTY_GUID, TIME } from '../../../config/constants'
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
import { calculatePercentage, CheckApprovalApplicableMaster, displayUOM, onFocus } from '../../../helper';
import EfficiencyDrawer from './EfficiencyDrawer';
import DayTime from '../../common/DayTimeWrapper'
import { AcceptableMachineUOM } from '../../../config/masterData'
import imgRedcross from '../../../assests/images/red-cross.png'
import { masterFinalLevelUser } from '../actions/Material'
import MasterSendForApproval from '../MasterSendForApproval'
import { animateScroll as scroll } from 'react-scroll';
import { ProcessGroup } from '../masterUtil';
import _ from 'lodash'
import LoaderCustom from '../../common/LoaderCustom';

const selector = formValueSelector('AddMoreDetails');

class AddMoreDetails extends Component {
  constructor(props) {

    super(props);
    this.child = React.createRef();
    this.state = {
      MachineId: '',
      isEditFlag: false,
      IsPurchased: false,
      isViewFlag: false,
      isDateChange: false,
      selectedTechnology: [],
      selectedPlants: {},
      machineType: [],
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
      effectiveDate: '',
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
      showErrorOnFocusDate: false,
      labourDetailId: '',
      IsIncludeMachineRateDepreciation: false,
      powerIdFromAPI: EMPTY_GUID,
      finalApprovalLoader: false
    }
    this.dropzone = React.createRef();
  }


  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    this.props.getPlantSelectListByType(ZBC, () => { })
    this.props.getMachineTypeSelectList(() => { })
    this.props.getUOMSelectList(() => { })
    this.props.getProcessesSelectList(() => { })
    this.props.getShiftTypeSelectList(() => { })
    this.props.getDepreciationTypeSelectList(() => { })

    if (this.state?.selectedPlants?.value && this.state?.selectedPlants?.value !== null) {
      this.props.getFuelByPlant(this.state.selectedPlants?.value, () => { })
    }
    if (!this.props?.editDetails?.isEditFlag) {
      this.props.change('EquityPercentage', 100)
    }

    let obj = {
      MasterId: MACHINE_MASTER_ID,
      DepartmentId: userDetails().DepartmentId,
      LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
      LoggedInUserId: loggedInUserId()
    }
    this.setState({ finalApprovalLoader: true })
    this.props.masterFinalLevelUser(obj, (res) => {
      if (res.data.Result) {
        this.setState({ isFinalApprovar: res.data.Data.IsFinalApprovar })
        this.setState({ finalApprovalLoader: false })
      }

    })
    this.getDetails()
  }

  closeApprovalDrawer = (e = '', type) => {
    this.setState({ approveDrawer: false })
    if (type === 'submit') {

      //this.clearForm()
      setTimeout(() => {
        let formData = this.state.formDataState
        formData.isViewFlag = true
        this.props.hideMoreDetailsForm(formData)
        //Toaster.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
        this.cancel()
        //this.cancel()
      }, 600);

    }
  }


  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      const { fieldsObj, machineType, selectedPlants, selectedTechnology } = nextProps.data;
      if (Object.keys(selectedPlants)?.length > 0) {
        this.handlePlants(selectedPlants)
        const data = {
          machineTypeId: machineType?.value ? machineType?.value : '',
          plantId: selectedPlants?.value ? selectedPlants?.value : '',
          effectiveDate: fieldsObj?.EffectiveDate ? fieldsObj.EffectiveDate : ''
        }
        this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
      }
      this.props.change('MachineName', fieldsObj.MachineName)
      this.props.change('MachineNumber', fieldsObj.MachineNumber)
      this.props.change('TonnageCapacity', fieldsObj.TonnageCapacity)
      this.props.change('Description', fieldsObj.Description)
      this.props.change('Specification', fieldsObj.Specification)
      this.props.change('EffectiveDate', fieldsObj.EffectiveDate ? fieldsObj.EffectiveDate : '')

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
        minDate: fieldsObj.EffectiveDate ? fieldsObj.EffectiveDate : ''
      }, () => {
        // if (machineType && machineType.value) {
        //   this.props.getLabourTypeByMachineTypeSelectList(machineType.value ? machineType.value : 0, () => { })
        // }
      })
    }

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
      remarks: e.target.value
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
          if (Data.MachineLabourRates.length !== 0) {
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
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.setState({ minDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '' })
          const { machineType, selectedPlants, effectiveDate } = this.state;
          const data = {
            machineTypeId: machineType?.value,
            plantId: selectedPlants?.value,
            effectiveDate: effectiveDate
          }
          this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
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
                LabourDetailId: el.LabourDetailId

              }
            })

            let MachineProcessArray = Data && Data.MachineProcessRates.map(el => {
              return {
                processName: el.ProcessName,
                ProcessId: el.ProcessId,
                UnitOfMeasurement: el.UnitOfMeasurement,
                UnitOfMeasurementId: el.UnitOfMeasurementId,
                OutputPerHours: el.OutputPerHours,
                OutputPerYear: el.OutputPerYear,
                MachineRate: el.MachineRate,
              }
            })


            this.setState({
              IsFinancialDataChanged: false,
              isEditFlag: true,
              isFinalUserEdit: this.state.isFinalApprovar ? true : false,
              isLoader: false,
              IsPurchased: Data.OwnershipIsPurchased,
              selectedTechnology: [{ label: Data.Technology && Data.Technology[0].Technology, value: Data.Technology && Data.Technology[0].TechnologyId }],
              selectedPlants: { label: Data.Plant[0].PlantName, value: Data.Plant[0].PlantId },
              machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
              shiftType: shiftObj && shiftObj !== undefined ? { label: shiftObj.Text, value: shiftObj.Value } : [],
              depreciationType: depreciationObj && depreciationObj !== undefined ? { label: depreciationObj.Text, value: depreciationObj.Value } : [],
              DateOfPurchase: DayTime(Data.DateOfPurchase).isValid() === true ? new Date(DayTime(Data.DateOfPurchase)) : '',
              IsAnnualMaintenanceFixed: Data.IsMaintanceFixed,
              IsAnnualConsumableFixed: Data.IsConsumableFixed,
              IsInsuranceFixed: Data.IsInsuranceFixed,
              IsUsesFuel: Data.IsUsesFuel,
              IsUsesSolarPower: Data.IsUsesSolarPower,
              fuelType: fuelObj && fuelObj !== undefined ? { label: fuelObj.Text, value: fuelObj.Value } : [],
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
              IsIncludeMachineRateDepreciation: Data?.IsIncludeMachineCost
            }, () => this.props.change('MachineRate', (this.state.isProcessGroup && !this.state.isViewMode) ? Data.MachineProcessRates[0].MachineRate : ''))
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
      DepreciationTypeSelectList, labourTypeByMachineTypeSelectList, fuelDataByPlant, } = this.props;

    const temp = [];
    if (label === 'technology') {
      technologySelectList && technologySelectList.map(item => {
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
  }

  /**
  * @method handlePlants
  * @description called
  */
  handlePlants = (newValue, actionMeta) => {
    const { IsUsesSolarPower, machineFullValue, effectiveDate } = this.state;
    const { initialConfiguration, editDetails } = this.props
    let editMode = editDetails.isEditFlag ? editDetails.isEditFlag : false
    if (!editMode) {
      if (newValue && newValue !== '') {
        this.setState({ selectedPlants: newValue }, () => {
          const { selectedPlants } = this.state
          this.callLabourTypeApi()
          this.props.getFuelByPlant(
            selectedPlants.value,
            (res) => { },
          )
        })
        if (effectiveDate) {
          setTimeout(() => {
            this.props.getPowerCostUnit(newValue?.value, effectiveDate, res => {
              let Data = res?.data?.DynamicData;
              if (res && res.data && res.data.Message !== '') {
                Toaster.warning(res.data.Message)
                machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
                this.setState({
                  machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue?.PowerCostPerUnit, powerId: Data?.PowerId },
                  powerIdFromAPI: Data?.PowerId
                })
                this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data?.SolarPowerRatePerUnit, initialConfiguration.NoOfDecimalForPrice))
              } else {
                //  if(IsUsesSolarPower)
                machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data?.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
                this.setState({
                  machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue?.PowerCostPerUnit, powerId: Data?.PowerId },
                  powerIdFromAPI: Data?.PowerId
                })
                this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data?.SolarPowerRatePerUnit, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
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
    if (newValue && newValue !== '') {
      this.setState({ machineType: newValue, labourGrid: [], }, () => {
        this.callLabourTypeApi()
      });
    } else {
      const data = {
        machineTypeId: 0,
        plantId: 0,
        effectiveDate: ''
      }
      this.setState({ machineType: [], labourGrid: [], })
      this.props.getLabourTypeByMachineTypeSelectList(data, () => { })
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
    const { machineType, selectedPlants, effectiveDate } = this.state;
    const data = {
      machineTypeId: machineType?.value,
      plantId: selectedPlants?.value,
      effectiveDate: effectiveDate
    }
    if (machineType && (Array.isArray(machineType) ? machineType.length > 0 : machineType) && selectedPlants && effectiveDate) {
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
        this.props.change('EfficiencyPercentage', checkForDecimalAndNull(calculatedEfficiency, initialConfiguration.NoOfDecimalForInputOutput))
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
    if (newValue && newValue !== '') {
      this.setState({ fuelType: newValue }, () => {
        const { fuelType, selectedPlants } = this.state;

        if (selectedPlants) {

          const data = {
            fuelId: fuelType.value,
            plantId: selectedPlants?.value,
            effectiveDate: DayTime(effectiveDate).isValid() ? DayTime(effectiveDate).format('DD/MM/YYYY') : ''
          }
          this.props.getFuelUnitCost(data, res => {
            let Data = res?.data?.Data;
            if (res && res?.data && res?.data?.Message !== '') {
              Toaster.warning(res.data.Message)
              machineFullValue.FuelCostPerUnit = (Data.UnitCost ? Data.UnitCost : 0)
              this.setState({
                machineFullValue: { ...machineFullValue, FuelCostPerUnit: machineFullValue.FuelCostPerUnit },
                UOMName: Data?.UOMName ? Data?.UOMName : 'UOM',
                FuelEntryId: Data?.FuelEntryId ? Data?.FuelEntryId : EMPTY_GUID
              })
              this.props.change('FuelCostPerUnit', checkForDecimalAndNull(Data.UnitCost, this.props.initialConfiguration.NoOfDecimalForPrice))
            } else {
              machineFullValue.FuelCostPerUnit = (Data.UnitCost ? Data.UnitCost : 0)
              this.setState({
                machineFullValue: { ...machineFullValue, FuelCostPerUnit: machineFullValue.FuelCostPerUnit },
                UOMName: Data?.UOMName ? Data?.UOMName : 'UOM',
                FuelEntryId: Data?.FuelEntryId ? Data?.FuelEntryId : EMPTY_GUID
              })
              this.props.change('FuelCostPerUnit', checkForDecimalAndNull(Data.UnitCost, this.props.initialConfiguration.NoOfDecimalForPrice))
            }
          })

        } else {
          Toaster.warning('Please select plant.')
        }

      });
    } else {
      this.setState({ fuelType: [], })
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
          const processObj = processSelectList && processSelectList.find(item => item.Text.split('(')[0].trim() === formData.ProcessName)

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
        this.props.change("MachineRate", 0)
      }

      this.setState({ UOM: newValue }, () => { this.handleProcessCalculation() });

    } else {
      this.setState({ UOM: [] })
    }
  };

  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    }, () => this.callLabourTypeApi());
    const { IsUsesSolarPower, machineFullValue, selectedPlants } = this.state;
    const { initialConfiguration } = this.props

    if (Object.keys(selectedPlants)?.length > 0) {
      setTimeout(() => {
        this.props.getPowerCostUnit(selectedPlants?.value, date, res => {
          let Data = res?.data?.DynamicData;
          if (res && res.data && res.data.Message !== '') {
            Toaster.warning(res.data.Message)
            machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
            this.setState({
              machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit, powerId: Data?.PowerId },
              powerIdFromAPI: Data?.PowerId
            })
            this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data.SolarPowerRatePerUnit, initialConfiguration.NoOfDecimalForPrice))
          } else {
            //  if(IsUsesSolarPower)
            machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
            this.setState({
              machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit, powerId: Data?.PowerId },
              powerIdFromAPI: Data?.PowerId
            })
            this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data.SolarPowerRatePerUnit, initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, initialConfiguration.NoOfDecimalForPrice))
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
        this.props.getFuelByPlant(this.state.selectedPlants?.value, () => { })
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
        setTimeout(() => {
          this.props.getPowerCostUnit(selectedPlants?.value, effectiveDate, res => {
            let Data = res.data.DynamicData;
            if (res && res.data && res.data.Message !== '') {
              Toaster.warning(res.data.Message)
              // this.setState
              machineFullValue.PowerCostPerUnit = Data.SolarPowerRatePerUnit
              this.setState({
                machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit },
                powerIdFromAPI: Data?.PowerId
              })
              this.props.change('PowerCostPerUnit', checkForDecimalAndNull(Data.SolarPowerRatePerUnit, this.props.initialConfiguration.NoOfDecimalForPrice))
            } else {
              machineFullValue.PowerCostPerUnit = IsUsesSolarPower ? Data.SolarPowerRatePerUnit : Data?.NetPowerCostPerUnit
              this.setState({
                machineFullValue: { ...machineFullValue, PowerCostPerUnit: machineFullValue.PowerCostPerUnit },
                powerIdFromAPI: Data?.PowerId
              })
              this.props.change('PowerCostPerUnit', IsUsesSolarPower ? checkForDecimalAndNull(Data.SolarPowerRatePerUnit, this.props.initialConfiguration.NoOfDecimalForPrice) : checkForDecimalAndNull(Data?.NetPowerCostPerUnit, this.props.initialConfiguration.NoOfDecimalForPrice))
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
        const { labourType, machineType, selectedPlants, effectiveDate } = this.state;
        const data = {
          labourTypeId: labourType.value,
          machineTypeId: machineType.value,
          plantId: selectedPlants?.value
        }
        this.props.getLabourCost(data, effectiveDate, res => {
          let Data = res.data.DynamicData;
          this.setState({ labourDetailId: Data.LabourDetailId })
          if (res && res.data && res.data.Message !== '') {
            Toaster.warning(res.data.Message)
            this.props.change('LabourCostPerAnnum', checkForDecimalAndNull(Data.LabourCost, this.props.initialConfiguration.NoOfDecimalForPrice))
          } else {
            this.props.change('LabourCostPerAnnum', checkForDecimalAndNull(Data.LabourCost, this.props.initialConfiguration.NoOfDecimalForPrice))
          }
        })
      });
    } else {
      this.setState({ labourType: [] })
    }
  };

  componentDidUpdate(prevProps) {
    const { LoanPercentage, RateOfInterestPercentage, DepreciationRatePercentage, EfficiencyPercentage, AnnualMaintancePercentage, AnnualConsumablePercentage, AnnualInsurancePercentage, UtilizationFactorPercentage } = this.props.fieldsObj
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.totalCost()
      this.calculateLoanInterest()
      this.calculateWorkingHrsPerAnnum()
      this.calculateDepreciation()
      this.calculateVariableCosts()
      this.totalMachineCost()
      this.powerCost()
      this.handleLabourCalculation()
      if (LoanPercentage) {
        checkPercentageValue(LoanPercentage, "Loan percentage should not be more than 100") ? this.props.change('LoanPercentage', LoanPercentage) : this.props.change('LoanPercentage', 0)
      }
      if (RateOfInterestPercentage) {
        checkPercentageValue(RateOfInterestPercentage, "Rate of Intrest percentage should not be more than 100") ? this.props.change('RateOfInterestPercentage', RateOfInterestPercentage) : this.props.change('RateOfInterestPercentage', 0)
      }
      if (DepreciationRatePercentage) {
        checkPercentageValue(DepreciationRatePercentage, "Depriciation percentage should not be more than 100") ? this.props.change('DepreciationRatePercentage', DepreciationRatePercentage) : this.props.change('DepreciationRatePercentage', 0)
      }
      if (EfficiencyPercentage) {
        checkPercentageValue(EfficiencyPercentage, "Avaliablity percentage should not be more than 100") ? this.props.change('EfficiencyPercentage', EfficiencyPercentage) : this.props.change('EfficiencyPercentage', 0)
      }
      if (AnnualMaintancePercentage) {
        checkPercentageValue(AnnualMaintancePercentage, "Annual Maintainance percentage should not be more than 100") ? this.props.change('AnnualMaintancePercentage', AnnualMaintancePercentage) : this.props.change('AnnualMaintancePercentage', 0)
      }
      if (AnnualConsumablePercentage) {
        checkPercentageValue(AnnualConsumablePercentage, "Consumable percentage should not be more than 100") ? this.props.change('AnnualConsumablePercentage', AnnualConsumablePercentage) : this.props.change('AnnualConsumablePercentage', 0)
      }
      if (AnnualInsurancePercentage) {
        checkPercentageValue(AnnualInsurancePercentage, "Insurance percentage should not be more than 100") ? this.props.change('AnnualInsurancePercentage', AnnualInsurancePercentage) : this.props.change('AnnualInsurancePercentage', 0)
      }
      if (UtilizationFactorPercentage) {
        checkPercentageValue(UtilizationFactorPercentage, "Utilization percentage should not be more than 100") ? this.props.change('UtilizationFactorPercentage', checkForNull(UtilizationFactorPercentage)) : this.props.change('UtilizationFactorPercentage', 0)
      }
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
    this.props.change('TotalCost', checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice))
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
    this.props.change('LoanValue', checkForDecimalAndNull(calculatePercentage(LoanPercentage) * checkForNull(totalCost), initialConfiguration.NoOfDecimalForPrice))
    this.props.change('EquityValue', checkForDecimalAndNull(calculatePercentage(EquityPercentage) * checkForNull(totalCost), initialConfiguration.NoOfDecimalForPrice))
    this.props.change('RateOfInterestValue', checkForDecimalAndNull((calculatePercentage(LoanPercentage) * checkForNull(totalCost)) * calculatePercentage(RateOfInterestPercentage), initialConfiguration.NoOfDecimalForPrice))
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
        depreciationAmount = this.state.DateOfPurchase !== '' ? ((checkForNull((TotalCost - checkForNull(CastOfScrap)) * calculatePercentage(DepreciationRatePercentage)) * checkForNull(TotalDays)) / 365) : 0
      }
      //let rateOfDep = ((1 - checkForNull(CastOfScrap)) / (machinecost)) ^ i
    }
    //this.props.change('DepreciationAmount', Math.round(depreciationAmount))
    machineFullValue.depreciationAmount = depreciationAmount
    this.setState({ machineFullValue: { ...machineFullValue, depreciationAmount: machineFullValue.depreciationAmount } })
    this.props.change('DepreciationAmount', checkForDecimalAndNull(depreciationAmount, initialConfiguration.NoOfDecimalForPrice))
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
      this.props.change('AnnualMaintanceAmount', checkForDecimalAndNull(MaintananceCost, initialConfiguration.NoOfDecimalForPrice))
    }

    if (IsAnnualConsumableFixed) {
      const ConsumableCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualConsumablePercentage)
      machineFullValue.ConsumableCost = ConsumableCost
      this.setState({
        machineFullValue: { ...machineFullValue, ConsumableCost: machineFullValue.ConsumableCost }
      })
      this.props.change('AnnualConsumableAmount', checkForDecimalAndNull(ConsumableCost, initialConfiguration.NoOfDecimalForPrice))
    }

    if (IsInsuranceFixed) {
      const InsuranceCost = (MachineCost + AccessoriesCost) * calculatePercentage(AnnualInsurancePercentage)
      machineFullValue.InsuranceCost = InsuranceCost
      this.setState({
        machineFullValue: { ...machineFullValue, InsuranceCost: machineFullValue.InsuranceCost }
      })
      this.props.change('AnnualInsuranceAmount', checkForDecimalAndNull(InsuranceCost, initialConfiguration.NoOfDecimalForPrice))
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

    this.props.change('AnnualAreaCost', checkForDecimalAndNull(annualAreaCost, initialConfiguration.NoOfDecimalForPrice))
    this.props.change('TotalMachineCostPerAnnum', checkForDecimalAndNull(TotalMachineCostPerAnnum, initialConfiguration.NoOfDecimalForPrice))
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
      this.props.change('TotalFuelCostPerYear', checkForDecimalAndNull(FuelCostPerUnit * ConsumptionPerYear, initialConfiguration.NoOfDecimalForPrice))
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
      this.setState({ machineFullValue: { ...machineFullValue, totalPowerCostPrYer: machineFullValue.totalPowerCostPrYer } })
      this.props.change('TotalPowerCostPerYear', checkForDecimalAndNull(totalPowerCostPrYer, initialConfiguration.NoOfDecimalForPrice))
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
    const { fieldsObj, initialConfiguration, } = this.props
    const { UOM, IsIncludeMachineRateDepreciation } = this.state

    let MachineRate
    const OutputPerHours = checkForNull(fieldsObj?.OutputPerHours)
    const NumberOfWorkingHoursPerYear = checkForNull(fieldsObj?.NumberOfWorkingHoursPerYear)
    // const TotalMachineCostPerAnnum = fieldsObj && fieldsObj.TotalMachineCostPerAnnum !== undefined ? checkForNull(fieldsObj.TotalMachineCostPerAnnum) : 0;
    let TotalMachineCostPerAnnum = 0
    if (IsIncludeMachineRateDepreciation) {
      TotalMachineCostPerAnnum = checkForNull(fieldsObj.TotalCost) + checkForNull(fieldsObj.RateOfInterestValue) + checkForNull(fieldsObj.DepreciationAmount) + checkForDecimalAndNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())
    } else {
      TotalMachineCostPerAnnum = checkForNull(fieldsObj.RateOfInterestValue) + checkForNull(fieldsObj.DepreciationAmount) + checkForDecimalAndNull(fieldsObj.TotalMachineCostPerAnnum) + checkForNull(fieldsObj.TotalFuelCostPerYear) + checkForNull(fieldsObj.TotalPowerCostPerYear) + checkForNull(this.calculateTotalLabourCost())
    }
    // 
    if (UOM.type === TIME) {

      if (UOM.uom === "Hours") {
        MachineRate = checkForNull(TotalMachineCostPerAnnum / NumberOfWorkingHoursPerYear) // THIS IS FOR HOUR CALCUALTION
      }

      if (UOM.uom === "Minutes") {

        MachineRate = checkForNull((TotalMachineCostPerAnnum / NumberOfWorkingHoursPerYear) / 60)   // THIS IS FOR MINUTES CALCUALTION
      } else if (UOM.uom === "Seconds") {

        MachineRate = checkForNull((TotalMachineCostPerAnnum / NumberOfWorkingHoursPerYear) / 3600)   // THIS IS FOR SECONDS CALCUALTION
      }

    } else {
      MachineRate = fieldsObj.MachineRate // THIS IS FOR ALL UOM EXCEPT HOUR
    }
    this.setState({ machineRate: MachineRate })
    this.props.change('OutputPerYear', checkForDecimalAndNull(OutputPerHours * NumberOfWorkingHoursPerYear))
    this.props.change('MachineRate', checkForDecimalAndNull(MachineRate, initialConfiguration.NoOfDecimalForPrice))
  }

  /**
  * @method labourTableHandler
  * @description ADDING VALUE IN LABOUR TABLE GRID
  */
  labourTableHandler = () => {
    const { labourType, labourGrid } = this.state;
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
      LabourDetailId: this.state.labourDetailId
    })
    if (tempArray?.length > 0) {
      this.setState({ disableMachineType: true })
    } else {
      this.setState({ disableMachineType: false })
    }

    this.setState({
      labourGrid: tempArray,
      labourType: [],
      LabourDetailId: ''
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
    const { labourType, labourGrid, labourGridEditIndex } = this.state;
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
      LabourDetailId: this.state.labourDetailId
    }

    tempArray = Object.assign([...labourGrid], { [labourGridEditIndex]: tempData })

    this.setState({
      labourGrid: tempArray,
      labourType: [],
      labourGridEditIndex: '',
      isEditLabourIndex: false,
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
      if (this.props.invalid === true) {
        return false;
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
        processName: processName.label,
        ProcessId: processName.value,
        UnitOfMeasurement: UOM.label,
        UnitOfMeasurementId: UOM.value,
        OutputPerHours: OutputPerHours,
        OutputPerYear: OutputPerYear,
        MachineRate: MachineRate,
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
        lockUOMAndRate: isProcessGroup
      }, () => {
        this.props.change('OutputPerHours', isProcessGroup ? OutputPerHours : 0)
        this.props.change('OutputPerYear', isProcessGroup ? OutputPerYear : 0)
        this.props.change('MachineRate', isProcessGroup ? checkForDecimalAndNull(MachineRate, this.props.initialConfiguration.NoOfDecimalForPrice) : 0)
      });
      if (!getConfigurationKey().IsMachineProcessGroup) {
        this.setState({ machineRate: "" })
      }
      this.setState({ errorObj: { processName: false, processUOM: false, processMachineRate: false } }) // RESETING THE STATE MACHINERATE
    }, 200);
  }

  /**
  * @method updateProcessGrid
  * @description Used to handle updateProcessGrid
  */
  updateProcessGrid = () => {
    const { processName, UOM, processGrid, processGridEditIndex } = this.state;
    const { fieldsObj } = this.props

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
      processName: processName.label,
      ProcessId: processName.value,
      UnitOfMeasurement: UOM.label,
      UnitOfMeasurementId: UOM.value,
      MachineRate: MachineRate,
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

      this.props.change('MachineRate', isProcessGroup ? checkForDecimalAndNull(MachineRate, this.props.initialConfiguration.NoOfDecimalForPrice) : 0)
    });

  };

  /**
  * @method resetProcessGridData
  * @description RESET PROCESS TABIE GRID
  */
  resetProcessGridData = () => {
    const { isProcessGroup, UOM } = this.state
    const { fieldsObj } = this.props;

    this.setState({
      processName: [],
      UOM: isProcessGroup && this.state.processGrid.length !== 0 ? UOM : [],
      processGridEditIndex: '',
      isEditIndex: false,
    }, () => {
      this.props.change('OutputPerHours', isProcessGroup ? fieldsObj.OutputPerHours : 0)
      this.props.change('OutputPerYear', isProcessGroup ? fieldsObj.OutputPerYear : 0)
      this.props.change('MachineRate', isProcessGroup && this.state.processGrid.length !== 0 ? checkForDecimalAndNull(fieldsObj.MachineRate, this.props.initialConfiguration.NoOfDecimalForPrice) : 0)
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
      this.props.change('MachineRate', tempData.MachineRate)
    })
  }

  findUOMType = (uomId) => {
    const uomObj = this.props.UOMSelectList && this.props.UOMSelectList.find(item => item.Value === uomId)
    return { type: uomObj?.Type, uom: uomObj?.Text, }
  }

  /**
  * @method deleteItem
  * @description used to Reset form
  */
  deleteItem = (index) => {
    const { processGrid, UOM } = this.state;
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

    this.setState({
      processGrid: tempData,
      lockUOMAndRate: tempData.length === 0 ? false : true,
      UOM: tempData.length === 0 ? [] : !this.state.lockUOMAndRate ? [] : UOM,
      isEditIndex: false,
      processName: [],
    }, () => {
      this.props.change('OutputPerHours', tempData.length > 0 ? fieldsObj.OutputPerHours : 0)
      this.props.change('OutputPerYear', tempData.length > 0 ? fieldsObj.OutputPerYear : 0)
      this.props.change('MachineRate', tempData.length > 0 ? fieldsObj.MachineRate : 0)
    })
  }


  handleCalculation = () => {
    const { fieldsObj } = this.props
    const NoOfPieces = checkForNull(fieldsObj.NumberOfPieces)
    const BasicRate = checkForNull(fieldsObj.BasicRate)
    const NetLandedCost = checkForNull(BasicRate / NoOfPieces)
    this.props.change('NetLandedCost', NetLandedCost)
  }

  /**
  * @method setDisableFalseFunction
  * @description setDisableFalseFunction
  */
  setDisableFalseFunction = () => {
    const loop = Number(this.dropzone.current.files.length) - Number(this.state.files.length)
    if (Number(loop) === 1) {
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
      this.props.fileUploadMachine(data, (res) => {
        let Data = res.data[0]
        const { files } = this.state;
        let attachmentFileArray = [...files]
        attachmentFileArray.push(Data)
        this.setState({ files: attachmentFileArray, attachmentLoader: false })
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
      let deleteData = {
        Id: FileId,
        DeletedBy: loggedInUserId(),
      }
      this.props.fileDeleteMachine(deleteData, (res) => {
        Toaster.success('File has been deleted successfully.')
        let tempArr = this.state.files.filter(item => item.FileId !== FileId)
        this.setState({ files: tempArr })
      })
    }
    if (FileId == null) {
      let tempArr = this.state.files.filter(item => item.FileName !== OriginalFileName)
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
    data.isViewFlag = this.state.isViewFlag
    /* IF CANCEL IS CLICKED AND MACHINE FORM IS IN EDIT FORM CONTAINING VALUE */
    if (editDetails.isIncompleteMachine || this.state.isEditFlag) {


      data.Id = this.state.MachineID ? this.state.MachineID : editDetails.Id
      data.isEditFlag = true
      this.props.hideMoreDetailsForm({}, data)
    } else {

      /*IF CANCEL IS CLICK AND MACHINE IS IN ADD FORM*/
      this.props.hideMoreDetailsForm(data)
    }
    //this.props.getRawMaterialDetailsAPI('', false, res => { })
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  onSubmit = (values) => {

    const { isEditFlag, MachineID, selectedTechnology, selectedPlants, machineType, remarks, files, DateOfPurchase,
      IsAnnualMaintenanceFixed, IsAnnualConsumableFixed, IsInsuranceFixed, IsUsesFuel, fuelType,
      labourGrid, processGrid, machineFullValue, effectiveDate, IsFinancialDataChanged, powerId, IsUsesSolarPower, powerIdFromAPI } = this.state;

    if (this.state.processGrid.length === 0) {

      Toaster.warning('Please add atleast one process')
      return false
    }

    const { editDetails, fieldsObj } = this.props;
    const { DataToChange, IsIncludeMachineRateDepreciation } = this.state

    const userDetail = userDetails()

    let technologyArray = selectedTechnology && [{ Technology: selectedTechnology.label ? selectedTechnology.label : selectedTechnology[0].label, TechnologyId: selectedTechnology.value ? selectedTechnology.value : selectedTechnology[0].value }]

    let updatedFiles = files.map((file) => ({ ...file, ContextId: MachineID }))

    let requestData = {
      MachineId: MachineID,
      Manufacture: values.Manufacture,
      YearOfManufacturing: values.YearOfManufacturing,
      MachineCost: values.MachineCost,
      AccessoriesCost: values.AccessoriesCost,
      InstallationCharges: values.InstallationCharges,
      TotalCost: machineFullValue.totalCost,
      OwnershipIsPurchased: this.state.IsPurchased,
      DepreciationTypeId: this.state.depreciationType ? this.state.depreciationType.value : '',
      DepreciationType: this.state.depreciationType ? this.state.depreciationType.value : '',
      DepreciationRatePercentage: values.DepreciationRatePercentage,
      LifeOfAssetPerYear: values.LifeOfAssetPerYear,
      CastOfScrap: values.CastOfScrap,
      DateOfPurchase: DayTime(DateOfPurchase).format('YYYY-MM-DD HH:mm:ss'),
      DepreciationAmount: machineFullValue.depreciationAmount,
      WorkingShift: this.state.shiftType ? this.state.shiftType.value : '',
      WorkingHoursPerShift: values.WorkingHoursPerShift,
      NumberOfWorkingDaysPerYear: values.NumberOfWorkingDaysPerYear,
      EfficiencyPercentage: values.EfficiencyPercentage,
      NumberOfWorkingHoursPerYear: values.NumberOfWorkingHoursPerYear,
      LoanPercentage: values.LoanPercentage,
      LoanValue: machineFullValue.LoanValue,
      EquityPercentage: values.EquityPercentage,
      EquityValue: machineFullValue.EquityValue,
      RateOfInterestPercentage: values.RateOfInterestPercentage,
      RateOfInterestValue: machineFullValue.RateOfInterestValue,
      IsMaintanceFixed: IsAnnualMaintenanceFixed,
      AnnualMaintancePercentage: values.AnnualMaintancePercentage,
      AnnualMaintanceAmount: IsAnnualMaintenanceFixed ? machineFullValue.MaintananceCost : values.AnnualMaintanceAmount,
      IsConsumableFixed: IsAnnualConsumableFixed,
      AnnualConsumablePercentage: values.AnnualConsumablePercentage,
      AnnualConsumableAmount: IsAnnualConsumableFixed ? machineFullValue.ConsumableCost : values.AnnualConsumableAmount,
      IsInsuranceFixed: IsInsuranceFixed,
      AnnualInsurancePercentage: values.AnnualInsurancePercentage,
      AnnualInsuranceAmount: IsInsuranceFixed ? machineFullValue.InsuranceCost : values.AnnualInsuranceAmount,
      BuildingCostPerSquareFeet: values.BuildingCostPerSquareFeet,
      MachineFloorAreaPerSquareFeet: values.MachineFloorAreaPerSquareFeet,
      AnnualAreaCost: machineFullValue.annualAreaCost,
      OtherYearlyCost: values.OtherYearlyCost,
      TotalMachineCostPerAnnum: machineFullValue.TotalMachineCostPerAnnum,
      IsUsesFuel: IsUsesFuel,
      PowerId: powerId ? powerId : "",
      UtilizationFactorPercentage: values.UtilizationFactorPercentage,
      PowerCostPerUnit: machineFullValue.PowerCostPerUnit,
      PowerRatingPerKW: values.PowerRatingPerKW,
      TotalPowerCostPerYear: machineFullValue.totalPowerCostPrYer,
      IsUsesSolarPower: IsUsesSolarPower,
      FuleId: fuelType ? fuelType.value : '',
      FuelCostPerUnit: machineFullValue.FuelCostPerUnit,
      FuelEntryId: this.state.FuelEntryId,
      ConsumptionPerYear: values.ConsumptionPerYear,
      TotalFuelCostPerYear: machineFullValue.TotalFuelCostPerYear,
      MachineLabourRates: labourGrid,
      TotalLabourCostPerYear: values.TotalLabourCostPerYear, // Need to look for this
      IsVendor: false,
      IsDetailedEntry: true,
      VendorId: userDetail.ZBCSupplierInfo.VendorId,
      MachineNumber: values.MachineNumber,
      MachineName: values.MachineName,
      MachineTypeId: machineType ? machineType.value : '',
      TonnageCapacity: values.TonnageCapacity,
      Description: fieldsObj.Description,
      Specification: fieldsObj.Specification,
      Remark: remarks,
      LoggedInUserId: loggedInUserId(),
      MachineProcessRates: processGrid,
      Technology: (technologyArray.length > 0 && technologyArray[0]?.Technology !== undefined) ? technologyArray : [{ Technology: selectedTechnology.label ? selectedTechnology.label : selectedTechnology[0].label, TechnologyId: selectedTechnology.value ? selectedTechnology.value : selectedTechnology[0].value }],
      Plant: [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }],
      selectedPlants: selectedPlants,
      Attachements: updatedFiles,
      VendorPlant: [],
      IsForcefulUpdated: true,
      EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
      MachineProcessGroup: this.props?.processGroupApiData,
      IsFinancialDataChanged: this.state.isDateChange ? true : false,
      IsIncludeMachineCost: IsIncludeMachineRateDepreciation,
      PowerEntryId: powerIdFromAPI
      // LabourDetailId: labourType.value
    }

    if (isEditFlag && this.state.isFinalApprovar) {               //editDetails.isIncompleteMachine &&

      // EXECUTED WHEN:- ADD MACHINE DONE AND ADD MORE DETAIL CALLED FROM ADDMACHINERATE.JS FILE


      if (IsFinancialDataChanged && isEditFlag) {

        if (this.state.isDateChange) {
          let MachineData = { ...requestData, MachineId: editDetails.Id }
          this.props.reset()
          this.props.updateMachineDetails(MachineData, (res) => {
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
              MachineData.isViewFlag = true
              this.props.hideMoreDetailsForm(MachineData)
              //this.cancel();
            }
          })         //IF THE EFFECTIVE DATE IS NOT UPDATED THEN USER SHOULD NOT BE ABLE TO SEND IT FOR APPROVAL IN EDIT MODE
        }
        else {
          this.setState({ setDisable: false })
          Toaster.warning('Please update the effective date')
        }
      } else if (((files ? JSON.stringify(files) : []) === (DataToChange.Attachements ? JSON.stringify(DataToChange.Attachements) : [])) && String(DataToChange.MachineName) === String(values.MachineName) && String(DataToChange.Specification) === String(values.Specification)
        && String(DataToChange.Description) === String(values.Description) && ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : ''))
        && ((DataToChange.TonnageCapacity ? Number(DataToChange.TonnageCapacity) : '') === (values.TonnageCapacity ? Number(values.TonnageCapacity) : ''))
        && String(DataToChange.Manufacture) === String(values.Manufacture) && String(DataToChange.MachineType) === String(this.state.machineType.label) && isEditFlag
      ) {
        this.cancel()
        return false

      } else {
        let MachineData = { ...requestData, MachineId: editDetails.Id }
        this.props.reset()
        this.props.updateMachineDetails(MachineData, (res) => {
          if (res?.data?.Result) {
            Toaster.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
            MachineData.isViewFlag = true
            this.props.hideMoreDetailsForm(MachineData)
            //this.cancel();
          }
        })
      }

    }
    //     else if (isEditFlag) {

    //       // EXECUTED WHEN:- ADD MACHINE DONE AND EDIT MORE DETAIL CALLED FROM ADDMACHINERATE.JS FILE
    //       if (isEditFlag) {

    //       }
    // } 
    else {
      // EXECUTED WHEN:- ADD MORE MACHINE DETAIL CALLED FROM ADDMACHINERATE.JS FILE

      const formData = {
        MachineId: MachineID,
        Manufacture: values.Manufacture,
        YearOfManufacturing: values.YearOfManufacturing,
        MachineCost: values.MachineCost,
        AccessoriesCost: values.AccessoriesCost,
        InstallationCharges: values.InstallationCharges,
        TotalCost: machineFullValue.totalCost,
        OwnershipIsPurchased: this.state.IsPurchased,
        DepreciationTypeId: this.state.depreciationType ? this.state.depreciationType.value : '',
        DepreciationType: this.state.depreciationType ? this.state.depreciationType.value : '',
        DepreciationRatePercentage: values.DepreciationRatePercentage,
        LifeOfAssetPerYear: values.LifeOfAssetPerYear,
        CastOfScrap: values.CastOfScrap,
        DateOfPurchase: DayTime(DateOfPurchase).format('YYYY-MM-DD HH:mm:ss'),
        DepreciationAmount: machineFullValue.depreciationAmount,
        WorkingShift: this.state.shiftType ? this.state.shiftType.value : '',
        WorkingHoursPerShift: values.WorkingHoursPerShift,
        NumberOfWorkingDaysPerYear: values.NumberOfWorkingDaysPerYear,
        EfficiencyPercentage: values.EfficiencyPercentage,
        NumberOfWorkingHoursPerYear: values.NumberOfWorkingHoursPerYear, // Round off for number
        LoanPercentage: values.LoanPercentage,
        LoanValue: machineFullValue.LoanValue,
        EquityPercentage: values.EquityPercentage,
        EquityValue: machineFullValue.EquityValue,
        RateOfInterestPercentage: values.RateOfInterestPercentage,
        RateOfInterestValue: machineFullValue.RateOfInterestValue,
        IsMaintanceFixed: IsAnnualMaintenanceFixed,
        AnnualMaintancePercentage: values.AnnualMaintancePercentage,
        AnnualMaintanceAmount: IsAnnualMaintenanceFixed ? machineFullValue.MaintananceCost : values.AnnualMaintanceAmount,
        IsConsumableFixed: IsAnnualConsumableFixed,
        AnnualConsumablePercentage: values.AnnualConsumablePercentage,
        AnnualConsumableAmount: IsAnnualConsumableFixed ? machineFullValue.ConsumableCost : values.AnnualConsumableAmount,
        IsInsuranceFixed: IsInsuranceFixed,
        AnnualInsurancePercentage: values.AnnualInsurancePercentage,
        AnnualInsuranceAmount: IsInsuranceFixed ? machineFullValue.InsuranceCost : values.AnnualInsuranceAmount,
        BuildingCostPerSquareFeet: values.BuildingCostPerSquareFeet,
        MachineFloorAreaPerSquareFeet: values.MachineFloorAreaPerSquareFeet,
        AnnualAreaCost: machineFullValue.annualAreaCost,
        OtherYearlyCost: values.OtherYearlyCost,
        TotalMachineCostPerAnnum: machineFullValue.TotalMachineCostPerAnnum,
        IsUsesFuel: IsUsesFuel,
        PowerId: powerId ? powerId : "",
        UtilizationFactorPercentage: values.UtilizationFactorPercentage,
        PowerCostPerUnit: machineFullValue.PowerCostPerUnit,
        PowerRatingPerKW: values.PowerRatingPerKW,
        TotalPowerCostPerYear: machineFullValue.totalPowerCostPrYer,
        IsUsesSolarPower: IsUsesSolarPower,
        FuleId: fuelType ? fuelType.value : '',
        FuelCostPerUnit: machineFullValue.FuelCostPerUnit,
        ConsumptionPerYear: values.ConsumptionPerYear,
        TotalFuelCostPerYear: machineFullValue.TotalFuelCostPerYear,
        MachineLabourRates: labourGrid,
        TotalLabourCostPerYear: values.TotalLabourCostPerYear, //need to ask from where it come
        IsVendor: false,
        IsDetailedEntry: true,
        VendorId: userDetail.ZBCSupplierInfo.VendorId,
        MachineNumber: values.MachineNumber,
        MachineName: values.MachineName,
        MachineTypeId: machineType ? machineType.value : '',
        TonnageCapacity: values.TonnageCapacity,
        Description: fieldsObj.Description,
        Specification: fieldsObj.Specification,
        Remark: remarks,
        LoggedInUserId: loggedInUserId(),
        MachineProcessRates: processGrid,
        Technology: (technologyArray.length > 0 && technologyArray[0]?.Technology !== undefined) ? technologyArray : [{ Technology: selectedTechnology.label ? selectedTechnology.label : selectedTechnology[0].label, TechnologyId: selectedTechnology.value ? selectedTechnology.value : selectedTechnology[0].value }],
        Plant: [{ PlantId: selectedPlants.value, PlantName: selectedPlants.label }],
        selectedPlants: selectedPlants,
        Attachements: files,
        VendorPlant: [],
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        MachineProcessGroup: this.props?.processGroupApiData,
        rowData: this.state.rowData,
        IsFinancialDataChanged: this.state.isDateChange ? true : false,
        FuelEntryId: this.state.FuelEntryId,
        IsIncludeMachineCost: IsIncludeMachineRateDepreciation,
        PowerEntryId: powerIdFromAPI
      }

      let obj = {}
      let finalObj = {

        MachineProcessRates: processGrid,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        MachineId: MachineID,
        IsVendor: false,
        MachineZBCRequest: formData,
        MachineVBCRequest: obj,

      }

      if (CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !this.state.isFinalApprovar) {
        if (IsFinancialDataChanged && isEditFlag) {

          if (this.state.isDateChange) {
            this.setState({ approveDrawer: true, approvalObj: finalObj, formDataState: formData })          //IF THE EFFECTIVE DATE IS NOT UPDATED THEN USER SHOULD NOT BE ABLE TO SEND IT FOR APPROVAL IN EDIT MODE
          }
          else {
            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
          }
        } else if (((files ? JSON.stringify(files) : []) === (DataToChange.Attachements ? JSON.stringify(DataToChange.Attachements) : [])) && String(DataToChange.MachineName) === String(values.MachineName) && String(DataToChange.Specification) === String(values.Specification)
          && String(DataToChange.Description) === String(values.Description) && ((DataToChange.Remark ? DataToChange.Remark : '') === (values.Remark ? values.Remark : ''))
          && ((DataToChange.TonnageCapacity ? Number(DataToChange.TonnageCapacity) : '') === (values.TonnageCapacity ? Number(values.TonnageCapacity) : ''))
          && String(DataToChange.Manufacture) === String(values.Manufacture) && String(DataToChange.MachineType) === String(this.state.machineType.label) && isEditFlag
        ) {

          Toaster.warning('Please change data to send Machine for approval')
          return false
        } else {

          this.setState({ approveDrawer: true, approvalObj: finalObj, formDataState: formData })
        }

      } else {

        this.props.reset()
        this.props.createMachineDetails(formData, (res) => {

          if (res.data.Result) {
            formData.isViewFlag = true
            this.props.hideMoreDetailsForm(formData)
            Toaster.success(MESSAGES.MACHINE_DETAILS_ADD_SUCCESS);
            this.cancel()
          }
        });
      }

    }

  }

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

  /**
  * @method powerToggle
  * @description POWER OPEN  AND CLOSE
  */
  powerToggle = () => {
    const { isPowerOpen, machineType, selectedPlants, effectiveDate } = this.state
    const { fieldsObj } = this.props
    if ((checkForNull(fieldsObj?.MachineCost) === 0 && isPowerOpen === false) || effectiveDate === '' || Object.keys(selectedPlants).length === 0 || machineType.length === 0) {
      Toaster.warning('Please fill all mandatory fields');
      scroll.scrollToTop();
      return false;
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
    if (this.state.UniqueProcessId?.length === 0 || this.state.UniqueProcessId === []) {
      this.setState({ UniqueProcessId: [...this.state.UniqueProcessId, ...uniqueProcessId] })
    } else {
      this.setState({ UniqueProcessId: [...uniqueProcessId] })
    }
  }
  /**
  * @method DisplayMachineRateLabel
  * @description for machine rate label with dynamic uom change
  */

  DisplayMachineRateLabel = () => {
    return <>Machine Rate/{(this.state.UOM && this.state.UOM.length !== 0) ? displayUOM(this.state.UOM.label) : "UOM"} (INR)</>
  }

  handleChangeIncludeMachineRateDepreciation = (value) => {
    this.setState({ IsIncludeMachineRateDepreciation: !this.state.IsIncludeMachineRateDepreciation })
    this.handleProcessCalculation()
  }

  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { handleSubmit, initialConfiguration, isMachineAssociated } = this.props;
    const { isLoader, isOpenAvailability, isEditFlag, isViewMode, isOpenMachineType, isOpenProcessDrawer,
      isLoanOpen, isWorkingOpen, isDepreciationOpen, isVariableCostOpen, disableMachineType, isViewFlag, isPowerOpen, isLabourOpen, isProcessOpen, UniqueProcessId, isProcessGroupOpen, disableAllForm, UOMName } = this.state;
    return (
      <>
        {(isLoader || this.state.finalApprovalLoader) && <LoaderCustom />}
        <div className="container-fluid">
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h2>{isViewMode ? "View" : isEditFlag ? "Update" : "Add"} More Details</h2>
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
                            label="Plant"
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
                        <Col md="3">
                          <Field
                            label={`Machine No.`}
                            name={"MachineNumber"}
                            type="text"
                            placeholder={(isEditFlag || initialConfiguration.IsAutoGeneratedMachineNumber) ? '-' : 'Enter'}
                            validate={initialConfiguration.IsAutoGeneratedMachineNumber ? [] : [required]}
                            component={renderText}
                            required={initialConfiguration.IsAutoGeneratedMachineNumber ? false : true}
                            disabled={(isEditFlag || initialConfiguration.IsAutoGeneratedMachineNumber) ? true : false}
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
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
                            component={renderText}
                            required={false}
                            disabled={this.state.isViewFlag ? true : false}
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
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString]}
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
                                disabled={(disableMachineType || this.state.isViewFlag || this.state.labourType.length !== 0)}
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
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80]}
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
                              Year Of Manufacturing
                              {/* <span className="asterisk-required">*</span> */}
                            </label>
                            <div className="inputbox date-section">
                              <DatePicker
                                // label={`Year Of Manufacturing`}
                                name="YearOfManufacturing"
                                selected={this.state.manufactureYear}
                                onChange={this.handleYearChange}
                                showMonthDropdown
                                showYearDropdown
                                showYearPicker
                                dateFormat="yyyy"
                                //maxDate={new Date()}
                                //dropdownMode="select"
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
                          label={`Year Of Manufacturing`}
                          name={"YearOfManufacturing"}
                          //type="text"
                          showYearPicker
                          selected={this.state.manufactureYear}
                          dropdownMode="select"
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
                          label={"Year Of Manufacturing"}
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
                          dropdownMode="select"
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
                            validate={[checkWhiteSpaces, postiveNumber, maxLength10]}
                            component={renderText}
                            disabled={this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>

                        <Col md="3">
                          <Field
                            label={`Machine Cost(INR)`}
                            name={"MachineCost"}
                            type="text"
                            placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                            validate={[required, positiveAndDecimalNumber, maxLength20, decimalLengthFour]}
                            component={renderText}
                            required={true}
                            disabled={isEditFlag || disableAllForm ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Accessories Cost(INR)`}
                            name={"AccessoriesCost"}
                            type="text"
                            placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                            validate={[positiveAndDecimalNumber, maxLength20, decimalLengthFour]}
                            component={renderText}
                            //required={true}
                            disabled={isEditFlag || disableAllForm ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Installation Charges(INR)`}
                            name={"InstallationCharges"}
                            type="text"
                            placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                            validate={[positiveAndDecimalNumber, maxLength20, decimalLengthFour]}
                            component={renderText}
                            //required={true}
                            disabled={isEditFlag || disableAllForm ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Total Cost(INR)`}
                            name={this.props.fieldsObj.TotalCost === 0 ? '' : "TotalCost"}
                            type="text"
                            placeholder={'-'}
                            validate={[]}
                            component={renderNumberInputField}
                            required={false}
                            disabled={true}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col md="3">
                          <div className="form-group">
                            <div className="inputbox date-section">
                              <Field
                                label="Effective Date"
                                name="EffectiveDate"
                                minDate={this.state.minDate}
                                selected={this.state.effectiveDate}
                                placeholder={this.state.isViewFlag || !this.state.IsFinancialDataChanged ? '-' : "Select Date"}
                                onChange={this.handleEffectiveDateChange}
                                type="text"
                                validate={[required]}
                                autoComplete={'off'}
                                required={true}
                                changeHandler={(e) => {
                                }}
                                component={renderDatePicker}
                                className="form-control"
                                disabled={this.state.isViewFlag || !this.state.IsFinancialDataChanged}
                                onFocus={() => onFocus(this, true)}
                              />
                              {this.state.showErrorOnFocusDate && (this.state.effectiveDate === '' || this.state.effectiveDate === undefined) && <div className='text-help mt-1 p-absolute bottom-7'>This field is required.</div>}
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Loan & Interest:'}
                            customClass={'Personal-Details'} />
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.loanToggle} type="button">{isLoanOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isLoanOpen &&
                          <div className="accordian-content row mx-0 w-100">
                            <Col md="4">
                              <Field
                                label={`Loan(%)`}
                                name={"LoanPercentage"}
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
                            <Col md="4">
                              <Field
                                label={`Equity (Owned)(%)`}
                                name={"EquityPercentage"}
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

                            <Col md="4">
                              <Field
                                label={`Rate Of Interest(%) / Annum`}
                                name={this.props.fieldsObj.RateOfInterestPercentage === 0 ? '-' : "RateOfInterestPercentage"}
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
                            <Col md="4">
                              <Field
                                label={`Loan Value`}
                                name={this.props.fieldsObj.LoanValue === 0 ? '-' : "LoanValue"}
                                type="text"
                                placeholder={'-'}
                                validate={[number]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="4">
                              <Field
                                label={`Equity Value`}
                                name={this.props.fieldsObj.EquityValue === 0 ? '-' : "EquityValue"}
                                type="text"
                                placeholder={'-'}
                                validate={[number]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>


                            <Col md="4">
                              <Field
                                label={`Interest Value`}
                                name={this.props.fieldsObj.RateOfInterestValue === 0 ? '-' : "RateOfInterestValue"}
                                type="text"
                                placeholder={'-'}
                                validate={[number]}
                                component={renderNumberInputField}
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Working Hours:'}
                            customClass={'Personal-Details'} />
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.workingHourToggle} type="button">{isWorkingOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isWorkingOpen &&
                          <div className="accordian-content row mx-0 w-100">
                            <Col md="3">
                              <Field
                                name="WorkingShift"
                                type="text"
                                label="No. Of Shifts"
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
                                label={`Working Hr/Shift`}
                                name={"WorkingHoursPerShift"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[decimalAndNumberValidation]}
                                component={renderText}
                                required={false}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`No. Of Working days/Annum`}
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
                                    label={`Availability(%)`}
                                    name={"EfficiencyPercentage"}
                                    type="text"
                                    placeholder={disableAllForm ? '-' : 'Enter'}
                                    validate={[positiveAndDecimalNumber, maxLength10]}
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
                              <Field
                                label={`No. Of Working Hrs/Annum`}
                                name={this.props.fieldsObj.NumberOfWorkingHoursPerYear === 0 ? '-' : "NumberOfWorkingHoursPerYear"}
                                type="text"
                                placeholder={'-'}
                                // validate={[required]}
                                component={renderNumberInputField}
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Depreciation:'}
                            customClass={'Personal-Details'} />
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.depreciationToogle} type="button">{isDepreciationOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isDepreciationOpen &&
                          <div className="accordian-content row mx-0 w-100">
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
                                  label={`Depreciation Rate(%)`}
                                  name={"DepreciationRatePercentage"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={this.state.depreciationType.value === WDM ? [required, positiveAndDecimalNumber, maxLength10, decimalLengthThree] : [decimalLengthThree]}
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
                                  label={`Life Of Asset(Years)`}
                                  name={"LifeOfAssetPerYear"}
                                  type="text"
                                  placeholder={disableAllForm ? '-' : 'Enter'}
                                  validate={[required, positiveAndDecimalNumber]}
                                  component={renderNumberInputField}
                                  required={true}
                                  disabled={disableAllForm}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>}
                            <Col md="3">
                              <Field
                                label={`Cost of Scrap(INR)`}
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
                                    dateFormat="dd/MM/yyyy"
                                    //maxDate={new Date()}
                                    dropdownMode="select"
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
                              <Field
                                label={`Depreciation Amount(INR)`}
                                name={this.props.fieldsObj.DepreciationAmount === 0 ? '-' : "DepreciationAmount"}
                                type="text"
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Variable Cost:'}
                            customClass={'Personal-Details'} />
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.variableCostToggle} type="button">{isVariableCostOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isVariableCostOpen && <div className="accordian-content row mx-0 w-100">
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
                                  validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                  component={renderText}
                                  //required={true}
                                  disabled={disableAllForm}
                                  customClassName="withBorder pt-1"
                                />
                              </Col>}
                            <Col md="3">
                              <Field
                                label={`Annual Maintenance Amount(INR)`}
                                name={"AnnualMaintanceAmount"}
                                type="text"
                                placeholder={this.state.IsAnnualMaintenanceFixed ? '-' : (disableAllForm) ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={this.state.IsAnnualMaintenanceFixed ? true : (disableAllForm) ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
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
                                  validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                  component={renderNumberInputField}
                                  //required={true}
                                  disabled={disableAllForm}
                                  customClassName="withBorder pt-1"
                                />
                              </Col>}
                            <Col md="3">
                              <Field
                                label={`Annual Consumable Amount(INR)`}
                                name={"AnnualConsumableAmount"}
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
                                  validate={[positiveAndDecimalNumber, maxLength10, decimalLengthThree]}
                                  component={renderNumberInputField}
                                  //required={true}
                                  disabled={disableAllForm}
                                  customClassName="withBorder pt-1"
                                />
                              </Col>}
                            <Col md="3">
                              <Field
                                label={`Insurance Amount(INR)`}
                                name={"AnnualInsuranceAmount"}
                                type="text"
                                placeholder={this.state.IsInsuranceFixed ? '-' : (disableAllForm) ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={this.state.IsInsuranceFixed ? true : (disableAllForm) ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Building Cost/Sq Ft/Annum`}
                                name={"BuildingCostPerSquareFeet"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[number, positiveAndDecimalNumber, decimalLengthFour]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Machine Floor Area(Sq Ft)`}
                                name={"MachineFloorAreaPerSquareFeet"}
                                type="text"
                                placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                                validate={[number, positiveAndDecimalNumber]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={isEditFlag || disableAllForm ? true : false}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Annual Area Cost(INR)`}
                                name={this.props.fieldsObj.AnnualAreaCost === 0 ? '-' : "AnnualAreaCost"}
                                type="text"
                                placeholder={'-'}
                                // validate={[number, postiveNumber]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Other Yearly Cost(INR)`}
                                name={"OtherYearlyCost"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
                                component={renderNumberInputField}
                                //required={true}
                                disabled={disableAllForm}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3">
                              <Field
                                label={`Total Machine Cost/Annum(INR)`}
                                name={this.props.fieldsObj.TotalMachineCostPerAnnum === 0 ? '-' : "TotalMachineCostPerAnnum"}
                                type="text"
                                placeholder={'-'}
                                //validate={[required]}
                                component={renderNumberInputField}
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Power:'}
                            customClass={'Personal-Details'} />
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
                          {this.state.IsUsesFuel &&
                            <>
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
                                  component={renderNumberInputField}
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
                                <Field
                                  label={`Total Power Cost/Annum(INR)`}
                                  name={this.props.fieldsObj.TotalFuelCostPerYear === 0 ? '-' : "TotalFuelCostPerYear"}
                                  type="text"
                                  placeholder={'-'}
                                  validate={[number, postiveNumber]}
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
                              <Col md="3">
                                <Field
                                  label={`Efficiency(%)`}
                                  name={"UtilizationFactorPercentage"}
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
                                <Field
                                  label={`Power Rating(Kw)`}
                                  name={"PowerRatingPerKW"}
                                  type="text"
                                  placeholder={isEditFlag || disableAllForm ? '-' : 'Enter'}
                                  validate={[positiveAndDecimalNumber, maxLength10, decimalLengthFour]}
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
                                  component={renderNumberInputField}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col>
                              {/* <Col md="3">
                                <Field
                                  label={`Power Cost/Hour(INR)`}
                                  name={this.props.fieldsObj.TotalFuelCostPerYear === 0 ? '-' : "TotalPowerCostPerHour"}
                                  type="text"
                                  placeholder={'-'}
                                  //validate={[required]}
                                  component={renderNumberInputField}
                                  //required={true}
                                  disabled={true}
                                  className=" "
                                  customClassName="withBorder"
                                />
                              </Col> */}
                              <Col md="3">
                                <Field
                                  label={`Power Cost/Annum(INR)`}
                                  name={this.props.fieldsObj.TotalPowerCostPerYear === 0 ? '-' : "TotalPowerCostPerYear"}
                                  type="text"
                                  placeholder={'-'}
                                  //validate={[required]}
                                  component={renderNumberInputField}
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Labour:'}
                            customClass={'Personal-Details'} />
                        </Col>
                        <Col md="6">
                          <div className={'right-details text-right'}>
                            <button className="btn btn-small-primary-circle ml-1" onClick={this.labourToggle} type="button">{isLabourOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                          </div>
                        </Col>
                        {
                          isLabourOpen && <div className="accordian-content row mx-0 w-100">
                            <Col md="3">
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
                                label={`Cost/Annum(INR)`}
                                name={"LabourCostPerAnnum"}
                                type="text"
                                placeholder={'-'}
                                //validate={[required]}
                                component={renderNumberInputField}
                                //onChange={this.handleLabourCalculation}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="2">
                              <Field
                                label={`No. Of People`}
                                name={"NumberOfLabour"}
                                type="text"
                                placeholder={disableAllForm ? '-' : 'Enter'}
                                validate={[maxLength10, number, postiveNumber]}
                                component={renderNumberInputField}
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
                              <Field
                                label={`Total Cost(INR)`}
                                name={this.props.fieldsObj.LabourCost === 0 ? '-' : "LabourCost"}
                                type="text"
                                placeholder={'-'}
                                component={renderText}
                                //required={true}
                                disabled={true}
                                className=" "
                                customClassName="withBorder"
                              />
                            </Col>
                            <Col md="3" className='pt-2'>
                              {this.state.isEditLabourIndex ?
                                <>
                                  <button
                                    type="button"
                                    disabled={disableAllForm}
                                    className={'btn btn-primary mt30 pull-left mr5'}
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
                                  <button
                                    type="button"
                                    disabled={disableAllForm}
                                    className={'user-btn mt30 pull-left mr5'}
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
                                    <th>{`Labour Type`}</th>
                                    <th>{`Cost/Annum(INR)`}</th>
                                    <th>{`No. Of People`}</th>
                                    <th>{`Total Cost (INR)`}</th>
                                    <th>{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >

                                  {
                                    this.state.labourGrid &&
                                    this.state.labourGrid.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{item.labourTypeName}</td>
                                          <td>{item.LabourCostPerAnnum}</td>
                                          <td>{item.NumberOfLabour}</td>
                                          <td>{item.LabourCost}</td>
                                          <td>
                                            <button className="Edit mr-2" type={'button'} disabled={disableAllForm} onClick={() => this.editLabourItemDetails(index)} />
                                            <button className="Delete" type={'button'} disabled={disableAllForm} onClick={() => this.deleteLabourItem(index)} />
                                          </td>
                                        </tr>
                                      )
                                    })
                                  }
                                  {this.state.labourGrid?.length === 0 && <tr>
                                    <td colSpan={"5"}>
                                      <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                  </tr>}
                                </tbody>
                                {this.state.labourGrid?.length > 0 &&
                                  <tfoot>
                                    <tr className="bluefooter-butn">
                                      <td colSpan={"3"} className="text-right">{'Total Labour Cost/Annum(INR):'}</td>
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
                        <Col md="6">
                          <HeaderTitle
                            title={'Process:'}
                            customClass={'Personal-Details'} />
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
                                    label="Process Name"
                                    component={searchableSelect}
                                    placeholder={this.state.isViewMode ? '-' : 'Select'}
                                    options={this.renderListing('ProcessNameList')}
                                    //onKeyUp={(e) => this.changeItemDesc(e)}
                                    //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                    required={true}
                                    handleChangeDescription={this.handleProcessName}
                                    valueDescription={this.state.processName}
                                    disabled={this.state.isViewMode}
                                  />
                                  {this.state.errorObj.processName && this.state.processName.length === 0 && <div className='text-help p-absolute bottom-7'>This field is required.</div>}

                                </div>
                                {!isEditFlag && <div
                                  onClick={this.processToggler}
                                  className={'plus-icon-square right'}>
                                </div>}
                              </div>
                            </Col>
                            <Col md="2">
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
                                disabled={this.state.lockUOMAndRate || this.state.isViewMode}
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

                            <Col className="d-flex col-auto UOM-label-container">
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
                                  placeholder={this.state.UOM.type === TIME ? '-' : this.state.isViewMode || this.state.lockUOMAndRate || (isEditFlag && isMachineAssociated) ? '-' : "Enter"}
                                />
                                {this.state.errorObj.processMachineRate && (this.props.fieldsObj.MachineRate === undefined || this.state.UOM.type === TIME ? true : Number(this.props.fieldsObj.MachineRate) === 0) && <div className='text-help p-absolute'>This field is required.</div>}

                              </div>
                              <div className="btn-mr-rate pt-2 pr-0 col-auto">
                                {this.state.isEditIndex ?
                                  <>
                                    <button
                                      type="button"
                                      disabled={this.state.isViewMode}
                                      className={'btn btn-primary pull-left mr5'}
                                      onClick={this.updateProcessGrid}
                                    >Update</button>

                                    <button
                                      type="button"
                                      disabled={this.state.isViewMode}
                                      className={'reset-btn pull-left'}
                                      onClick={this.resetProcessGridData}
                                    >Cancel</button>
                                  </>
                                  :
                                  <>
                                    <button
                                      type="button"
                                      className={'user-btn pull-left'}
                                      disabled={this.state.isViewMode}
                                      onClick={this.processTableHandler}>
                                      <div className={'plus'}></div>ADD</button>
                                    <button
                                      type="button"
                                      disabled={this.state.isViewMode}
                                      className={'reset-btn pull-left ml5'}
                                      onClick={this.resetProcessGridData}
                                    >Reset</button> </>}
                              </div>
                            </Col>
                            <Col md="12">
                              <Table className="table border" size="sm" >
                                <thead>
                                  <tr>
                                    <th>{`Process Name`}</th>
                                    <th>{`UOM`}</th>
                                    {/* <th>{`Output/Hr`}</th>     COMMENTED FOR NOW MAY BE USED LATER
                                    <th>{`Output/Annum`}</th> */}
                                    <th>{`Machine Rate(INR)`}</th>
                                    <th>{`Action`}</th>
                                  </tr>
                                </thead>
                                <tbody >
                                  {
                                    this.state.processGrid &&
                                    this.state.processGrid.map((item, index) => {
                                      return (
                                        <tr key={index}>
                                          <td>{item.processName}</td>
                                          <td className='UOM-label-container'>{displayUOM(item.UnitOfMeasurement)}</td>
                                          {/* <td>{item.OutputPerHours}</td>    COMMENTED FOR NOW MAY BE USED LATER
                                          <td>{checkForDecimalAndNull(item.OutputPerYear, initialConfiguration.NoOfDecimalForInputOutput)}</td> */}
                                          <td>{checkForDecimalAndNull(item.MachineRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                                          <td>
                                            <button className="Edit mr-2" type={'button'} disabled={this.state.isViewMode} onClick={() => this.editItemDetails(index)} />
                                            <button className="Delete" type={'button'} onClick={() => this.deleteItem(index)} disabled={UniqueProcessId?.includes(item.ProcessId) || this.state.isViewMode} />
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
                          </div>
                        }
                      </Row>

                      {
                        this.state.isProcessGroup &&
                        <Row className='mb-3 accordian-container'>
                          <Col md="6" className='mt-2'>
                            <HeaderTitle
                              title={'Process Group:'} />
                          </Col>
                          <Col md="6">
                            <div className={'right-details text-right'}>
                              <button className="btn btn-small-primary-circle ml-1" onClick={this.processGroupToggle} type="button">{isProcessGroupOpen ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}</button>
                            </div>
                          </Col>
                          {isProcessGroupOpen && <div className="accordian-content row mx-0 w-100">
                            <Col md="12">
                              <ProcessGroup isViewFlag={this.state.isViewFlag} isEditFlag={isEditFlag} processListing={this.state.processGrid} isListing={false} isViewMode={this.state.isViewMode} changeDropdownValue={this.changeDropdownValue} showDelete={this.showDelete} setRowData={this.setRowdata} />
                            </Col>
                          </div>}
                        </Row>
                      }
                      <Row>
                        <Col md="12" className="filter-block">
                          <div className="mb-2">
                            <h5>{'Remarks & Attachments:'}</h5>
                          </div>
                        </Col>
                        <Col md="6">
                          <Field
                            label={'Remarks'}
                            name={`Remark`}
                            placeholder={this.state.isViewMode ? '-' : "Type here..."}
                            value={this.state.remarks}
                            className=""
                            customClassName=" textAreaWithBorder"
                            disabled={this.state.isViewMode}
                            onChange={this.handleMessageChange}
                            validate={[maxLength512]}
                            // required={true}
                            component={renderTextAreaField}
                            maxLength="512"
                            rows="6"
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to 3 files)</label>
                          <div className={`alert alert-danger mt-2 ${this.state.files.length === 3 ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit has been reached.
                          </div>
                          <div className={`${this.state.files.length >= 3 ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={this.dropzone}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              accept="*"
                              initialFiles={this.state.initialFiles}
                              maxFiles={3}
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
                      </Row>
                    </div>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                      <div className="col-sm-12 text-right bluefooter-butn">
                        <button
                          type={'button'}
                          className=" mr15 cancel-btn"
                          onClick={this.cancel} >
                          <div className={"cancel-icon"}></div> {'Cancel'}
                        </button>



                        {
                          (CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !this.state.isFinalApprovar) ?
                            <button type="submit"
                              class="user-btn approval-btn save-btn mr5"

                              disabled={this.state.isViewMode || this.state.setDisable}
                            >
                              <div className="send-for-approval"></div>
                              {'Send For Approval'}
                            </button>
                            :

                            <button
                              type="submit"
                              className="user-btn mr5 save-btn"
                              disabled={this.state.isViewMode || this.state.setDisable}
                            >
                              <div className={"save-icon"}></div>
                              {isEditFlag ? "Update" : "Save"}
                            </button>
                        }
                      </div>
                    </Row>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </div >
        {isOpenMachineType && <AddMachineTypeDrawer
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
              type={'Sender'}
              anchor={"right"}
              approvalObj={this.state.approvalObj}
              isBulkUpload={false}
              IsImportEntery={false}
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
  const { comman, material, machine, labour, fuel, auth } = state;
  const fieldsObj = selector(state, 'MachineCost', 'AccessoriesCost', 'InstallationCharges', 'LabourCostPerAnnum', 'TotalCost',
    'LoanPercentage', 'LoanValue', 'EquityPercentage', 'EquityValue', 'RateOfInterestPercentage', 'RateOfInterestValue',
    'WorkingHoursPerShift', 'NumberOfWorkingDaysPerYear', 'EfficiencyPercentage', 'NumberOfWorkingHoursPerYear',
    'DepreciationRatePercentage', 'LifeOfAssetPerYear', 'CastOfScrap', 'DepreciationAmount',
    'AnnualMaintancePercentage', 'AnnualMaintanceAmount', 'AnnualConsumablePercentage', 'AnnualConsumableAmount',
    'AnnualInsurancePercentage', 'AnnualInsuranceAmount',
    'BuildingCostPerSquareFeet', 'MachineFloorAreaPerSquareFeet', 'AnnualAreaCost', 'OtherYearlyCost', 'TotalMachineCostPerAnnum',
    'UtilizationFactorPercentage', 'PowerRatingPerKW', 'PowerCostPerUnit', 'TotalPowerCostPerYear',
    'FuelCostPerUnit', 'ConsumptionPerYear', 'TotalFuelCostPerYear',
    'NumberOfLabour', 'LabourCost', 'OutputPerHours', 'OutputPerYear', 'MachineRate', 'DateOfPurchase', 'Description', 'Specification');

  const { technologySelectList, plantSelectList, UOMSelectList,
    ShiftTypeSelectList, DepreciationTypeSelectList, } = comman;
  const { machineTypeSelectList, processSelectList, machineData, loading, processGroupApiData } = machine;

  const { labourTypeByMachineTypeSelectList } = labour;
  const { vendorListByVendorType } = material;
  const { fuelDataByPlant } = fuel;
  const { initialConfiguration } = auth;
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
      CastOfScrap: machineData.CastOfScrap,
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
      FuelCostPerUnit: machineData.FuelCostPerUnit,
      ConsumptionPerYear: machineData.ConsumptionPerYear,
      TotalFuelCostPerYear: machineData.TotalFuelCostPerYear,
      Remark: machineData.Remark,
    }
  }

  return {
    vendorListByVendorType, technologySelectList, plantSelectList, UOMSelectList,
    machineTypeSelectList, processSelectList, ShiftTypeSelectList, DepreciationTypeSelectList,
    initialConfiguration, labourTypeByMachineTypeSelectList, fuelDataByPlant, fieldsObj, initialValues, loading, processGroupApiData
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
  getFuelUnitCost,
  getLabourCost,
  getPowerCostUnit,
  createMachineDetails,
  updateMachineDetails,
  getMachineDetailsData,
  fileUploadMachine,
  fileDeleteMachine,
  masterFinalLevelUser,
  getProcessGroupByMachineId,
  setGroupProcessList,
  setProcessList
})(reduxForm({
  form: 'AddMoreDetails',
  onSubmitFail: errors => {
    focusOnError(errors);
  },
  touchOnChange: true,
  enableReinitialize: true,
})(AddMoreDetails));
