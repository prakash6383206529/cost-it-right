import React, { Component, } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, isDirty, clearFields } from "redux-form";
import { Row, Col, Table, Label } from 'reactstrap';
import {
  required, checkForNull, postiveNumber, checkForDecimalAndNull, acceptAllExceptSingleSpecialCharacter,
  checkWhiteSpaces, maxLength80, maxLength10, maxLength512, checkSpacesInString, decimalLengthsix, hashValidation, getNameBySplitting, number,
  validateFileName
} from "../../../helper/validation";
import { renderText, searchableSelect, renderTextAreaField, focusOnError, renderDatePicker, validateForm } from "../../layout/FormInputs";
import { getPlantSelectListByType, getPlantBySupplier, getUOMSelectList, getVendorNameByVendorSelectList, getExchangeRateSource, getCurrencySelectList } from '../../../actions/Common';
import {
  createMachine, updateMachine, updateMachineDetails, getMachineTypeSelectList, getProcessesSelectList, fileUploadMachine,
  checkAndGetMachineNumber, getMachineData, getProcessGroupByMachineId, setGroupProcessList, setProcessList
} from '../actions/MachineMaster';
import Toaster from '../../common/Toaster';
import { AttachmentValidationInfo, MESSAGES } from '../../../config/message';
import { CBCTypeId, EMPTY_DATA, EMPTY_GUID, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, OPERATIONS_ID, GUIDE_BUTTON_SHOW, SPACEBAR, VBCTypeId, VBC_COSTING, VBC_VENDOR_TYPE, ZBCTypeId, searchCount } from '../../../config/constants'
import { getConfigurationKey, IsFetchExchangeRateVendorWiseForParts, loggedInUserId, userDetails } from "../../../helper/auth";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import { FILE_URL, ZBC, MACHINE_MASTER_ID } from '../../../config/constants';
import HeaderTitle from '../../common/HeaderTitle';
import AddMachineTypeDrawer from './AddMachineTypeDrawer';
import AddProcessDrawer from './AddProcessDrawer';
import NoContentFound from '../../common/NoContentFound';
import { AcceptableMachineUOM, LOGISTICS } from '../../../config/masterData'
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import attachClose from '../../../assests/images/red-cross.png'
import MasterSendForApproval from '../MasterSendForApproval'
import { debounce } from 'lodash';
import { CheckApprovalApplicableMaster, displayUOM, getExchangeRateParams, userTechnologyDetailByMasterId } from '../../../helper'
import AsyncSelect from 'react-select/async';
import { ProcessGroup } from '../masterUtil';
import _ from 'lodash'
import { getCostingSpecificTechnology, getExchangeRateByCurrency } from '../../costing/actions/Costing'
import { getClientSelectList, } from '../actions/Client';
import { autoCompleteDropdown, convertIntoCurrency, costingTypeIdToApprovalTypeIdFunction, getCostingTypeIdByCostingPermission, getEffectiveDateMinDate, getEffectiveDateMaxDate } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { checkFinalUser } from '../../../components/costing/actions/Costing'
import { getUsersMasterLevelAPI } from '../../../actions/auth/AuthActions';
import WarningMessage from '../../common/WarningMessage';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';
import Button from '../../layout/Button';
import { subDays } from 'date-fns';
import { labels, LabelsClass } from '../../../helper/core';
import { getPlantUnitAPI } from '../actions/Plant';
import Switch from 'react-switch'
import TooltipCustom from '../../common/Tooltip';

const selector = formValueSelector('AddMachineRate');


class AddMachineRate extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    // ********* INITIALIZE REF FOR DROPZONE ********
    this.dropzone = React.createRef();
    this.initialState = {
      MachineID: EMPTY_GUID,
      isEditFlag: false,
      isFormHide: false,
      IsVendor: false,
      IsCopied: false,
      IsDetailedEntry: false,
      isViewFlag: this.props?.data?.isViewMode ? true : false,
      approveDrawer: false,
      isViewMode: this.props?.editDetails?.isViewMode ? true : false,
      minEffectiveDate: '',
      isDateChange: false,
      oldDate: '',
      disableMachineType: false,
      selectedTechnology: [],
      isVendorNameNotSelected: false,
      vendorName: [],
      selectedPlants: [],
      isFinalApprovar: false,
      approvalObj: {},
      IsSendForApproval: false,
      machineType: [],
      isOpenMachineType: false,
      costingHead: 'zero',
      processName: [],
      isOpenProcessDrawer: false,
      client: [],
      processGrid: [],
      processGridEditIndex: '',
      isEditIndex: false,
      machineRate: '',
      IsFinancialDataChanged: true,

      remarks: '',
      files: [],

      machineFullValue: {},
      DataToChange: [],
      DropdownChange: true,
      effectiveDate: '',
      uploadAttachements: true,
      updatedObj: {},
      setDisable: false,
      inputLoader: false,
      lockUOMAndRate: false,
      isProcessGroup: getConfigurationKey().IsMachineProcessGroup,// UNCOMMENT IT AFTER DONE FROM BACKEND AND REMOVE BELOW CODE
      // isProcessGroup: false,// UNCOMMENT IT AFTER DONE FROM BACKEND AND REMOVE BELOW CODE
      UniqueProcessId: [],
      attachmentLoader: false,
      rowData: [],
      errorObj: {
        processName: false,
        processUOM: false,
        machineRate: false
      },
      finalApprovalLoader: getConfigurationKey().IsDivisionAllowedForDepartment || !(getConfigurationKey().IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) ? false : true,
      costingTypeId: ZBCTypeId,
      levelDetails: {},
      vendorFilterList: [],
      CostingTypePermission: false,
      disableSendForApproval: false,
      tourContainer: {
        initial: false,
        processTour: false,
      },
      ExchangeSource: '',
      showWarning: false,
      currencyValue: 1,
      isImport: false,
      currency: [],
      hidePlantCurrency: false,
      settlementCurrency: 1,
      plantExchangeRateId: '',
      settlementExchangeRateId: '',
      plantCurrencyID: '',
      plantCurrency: 1,
      showPlantWarning: false,
      UOM: [],
      resetProcessGroup: false,
      disableEffectiveDate: false
    }
    this.state = { ...this.initialState };

  }

  /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
  componentDidMount() {
    const { data, editDetails, initialConfiguration } = this.props;
    this.props.getExchangeRateSource((res) => { })
    this.setState({ costingTypeId: getCostingTypeIdByCostingPermission() })

    // For Showing form in view mode if data is added in add more detail form
    if (data.isViewFlag === true || editDetails.isViewFlag === true) {
      this.setState({
        isViewMode: true,
        isViewFlag: true,
        rowData: data?.rowData,
        hidePlantCurrency: data?.hidePlant,
        settlementCurrency: data?.ExchangeRate,
        settlementExchangeRateId: data?.ExchangeRateId,
        isImport: data?.MachineEntryType === ENTRY_TYPE_IMPORT ? true : false,
        currency: data?.Currency ? { label: data?.Currency, value: data?.CurrencyId } : [],
        plantCurrency: data?.MachineEntryType === ENTRY_TYPE_IMPORT ? data?.LocalCurrencyExchangeRate : data?.ExchangeRate,
        plantCurrencyID: data?.MachineEntryType === ENTRY_TYPE_IMPORT ? data?.LocalCurrencyId : data?.CurrencyId,
        plantExchangeRateId: data?.MachineEntryType === ENTRY_TYPE_IMPORT ? data?.LocalExchangeRateId : data?.ExchangeRateId,
      })
      this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
      setTimeout(() => {
        this.props.change('plantCurrency', data?.MachineEntryType === ENTRY_TYPE_IMPORT ? data?.LocalCurrency : data?.Currency)
        if (data?.MachineProcessRates) {
          this.setState({
            processGrid: data?.MachineProcessRates
          })
        }

      }, 600);

    }

    /*WHEN ADD MORE DETAIL FORM IS CANCELLED in ADD FORMAT*/
    // if (data.cancelFlag) {
    //   this.props.checkAndGetMachineNumber('', res => {
    //     let Data = res.data.DynamicData;
    //     this.props.change('MachineNumber', Data.MachineNumber)
    //   })

    //   this.setState({ isFinalApprovar: data?.isFinalApprovar, finalApprovalLoader: false })
    //   return true
    // }

    if (!editDetails.isViewMode) {
      this.props.getUOMSelectList(() => { })
      this.props.getProcessesSelectList(() => { })
      this.props.getMachineTypeSelectList(() => { })
      if (!getConfigurationKey().IsDivisionAllowedForDepartment && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
        this.finalUserCheckAndMasterLevelCheckFunction(EMPTY_GUID)
      }
    }
    else {
      this.setState({ finalApprovalLoader: false })
    }

    if (!(editDetails.isEditFlag || editDetails.isViewMode)) {

      this.props.getCostingSpecificTechnology(loggedInUserId(), () => { })
      this.props.getPlantSelectListByType(ZBC, "MASTER", '', () => { })
      this.props.getClientSelectList(() => { })
    }

    if (initialConfiguration?.IsAutoGeneratedMachineNumber && editDetails && editDetails.isEditFlag === false) {
      this.props.checkAndGetMachineNumber('', res => {
        let Data = res.data.DynamicData;
        this.props.change('MachineNumber', Data.MachineNumber)
      })
    }

    // For reseting form  if cancel the add more detail form
    // if (data.cancelFlag) {
    //   const { reset } = this.props;
    //   reset();
    //   this.setState({
    //     remarks: '',
    //     //isFormHide: true,
    //     IsVendor: false,
    //     isEditFlag: false,
    //   })
    // }

    //USED TO SET PREVIOUS VALUES OF FORM AFTER SUCCESS OR CANCEL OF ADD MORE DETAILS FORM
    if (data && data !== undefined && Object.keys(data).length > 0 && data.constructor === Object) {
      this.showFormData()
      this.setOldValue(data)
    }
    // } else if (Object.keys(data).length > 0 && data.constructor === Object) {
    //     this.showFormData()
    // }


    //GET MACHINE VALUES IN EDIT MODE
    this.getDetails()
    this.props.getCurrencySelectList(() => { })
  }
  callExchangeRateAPI = (costingTypeId, plantCurrency, currency, isImport, ExchangeSource, effectiveDate, client, vendorName, selectedPlants) => {

    const fromCurrency = isImport ? currency?.label : plantCurrency;
    const toCurrency = reactLocalStorage.getObject("baseCurrency");
    const hasCurrencyAndDate = Boolean(plantCurrency && effectiveDate);

    return new Promise((resolve) => {
      if (!hasCurrencyAndDate) {
        resolve(null);
        return;
      }
      if (IsFetchExchangeRateVendorWiseForParts() && (costingTypeId !== ZBCTypeId && vendorName?.length === 0 && client?.length === 0)) {
        return false;
      }
      const callAPI = (from, to, costingHeadTypeId, vendorId, clientId) => {

        return new Promise((resolveAPI) => {
          this.props.getExchangeRateByCurrency(
            from,
            costingHeadTypeId,
            DayTime(effectiveDate).format('YYYY-MM-DD'),
            vendorId,
            clientId,
            false,
            to,
            ExchangeSource?.label ?? null,
            res => {
              resolveAPI({
                rate: checkForNull(res.data.Data.CurrencyExchangeRate),
                exchangeRateId: res?.data?.Data?.ExchangeRateId,
                showWarning: Object.keys(res.data.Data).length === 0,
                showPlantWarning: Object.keys(res.data.Data).length === 0
              });
            }
          );
        });
      };

      if (isImport && fromCurrency !== undefined) {
        if (plantCurrency === reactLocalStorage?.getObject("baseCurrency")) {
          // Make only one API call
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });

          callAPI(fromCurrency, plantCurrency, costingHeadTypeId, vendorId, clientId)
            .then(result => {
              resolve({
                plantCurrency: result.rate,
                settlementCurrency: 1,
                plantExchangeRateId: result.exchangeRateId,
                settlementExchangeRateId: null,
                showPlantWarning: result.showPlantWarning,
                showWarning: result.showWarning
              });
            });
        } else {
          const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: plantCurrency, defaultCostingTypeId: costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });
          // Make two API calls as currencies are different
          callAPI(fromCurrency, plantCurrency, costingHeadTypeId, vendorId, clientId)
            .then(result1 => {
              const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });

              callAPI(plantCurrency, toCurrency, costingHeadTypeId, vendorId, clientId)
                .then(result2 => {
                  resolve({
                    plantCurrency: result1.rate,
                    settlementCurrency: result2.rate,
                    plantExchangeRateId: result1.exchangeRateId,
                    settlementExchangeRateId: result2.exchangeRateId,
                    showPlantWarning: result1.showPlantWarning,
                    showWarning: result2.showWarning
                  });
                });
            });
        }
      } else if (!isImport && plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
        const { costingHeadTypeId, vendorId, clientId } = getExchangeRateParams({ fromCurrency: fromCurrency, toCurrency: toCurrency, defaultCostingTypeId: costingTypeId, vendorId: this.state.vendorName?.value, clientValue: client?.value, plantCurrency: this?.props?.fieldsObj?.plantCurrency });

        callAPI(fromCurrency, toCurrency, costingHeadTypeId, vendorId, clientId)
          .then(result => {
            resolve({
              plantCurrency: result.rate,
              plantExchangeRateId: result.exchangeRateId,
              showPlantWarning: result.showPlantWarning,
              showWarning: result.showWarning
            });
          });
      }
    });
  }
  handleCalculation = (rate) => {

    const { fieldsObj, initialConfiguration } = this.props
    const { plantCurrency, settlementCurrency, isImport } = this.state
    if (isImport) {
      const MachineRateLocalConversion = convertIntoCurrency(fieldsObj?.MachineRate, plantCurrency)
      this.props.change('MachineRateLocalConversion', checkForDecimalAndNull(MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice));
      const MachineRateConversion = convertIntoCurrency(checkForDecimalAndNull(MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice), settlementCurrency)
      this.props.change('MachineRateConversion', checkForDecimalAndNull(MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice));
    } else {
      const MachineRateConversion = convertIntoCurrency(fieldsObj?.MachineRate, plantCurrency)
      this.props.change('MachineRateConversion', checkForDecimalAndNull(MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice));
    }
  }

  finalUserCheckAndMasterLevelCheckFunction = (plantId, isDivision = false) => {
    const { initialConfiguration } = this.props
    if (!this.state.isViewMode && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
      this.props.getUsersMasterLevelAPI(loggedInUserId(), MACHINE_MASTER_ID,null, (res) => {
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
    levelDetailsTemp = userTechnologyDetailByMasterId(this.state.costingTypeId, MACHINE_MASTER_ID, this.props.userMasterLevelAPI)
    this.setState({ levelDetails: levelDetailsTemp })

    let obj = {
      TechnologyId: MACHINE_MASTER_ID,
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
    this.setState({ finalApprovalLoader: false, CostingTypePermission: false })
  }

  componentDidUpdate(prevProps, prevState) {
    const { initialConfiguration } = this.props
    if (!this.props.data.isViewFlag) {
      if (!getConfigurationKey().IsDivisionAllowedForDepartment && (prevState?.costingTypeId !== this.state.costingTypeId) && initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true) {
        this.commonFunction(this.state.selectedPlants.value)
      }
    }
    if (this.props.fieldsObj !== prevProps.fieldsObj) {
      this.handleCalculation()
    }
    if (prevProps.processGroupApiData !== this.props.processGroupApiData) {

      this.setState({ DataToChange: true });
    }


  }

  componentWillUnmount() {
    const { selectedPlants, effectiveDate, machineType, selectedTechnology, isFormHide, client, vendorName, costingTypeId } = this.state;
    const { fieldsObj } = this.props;
    let data = {
      fieldsObj: fieldsObj,
      selectedTechnology: selectedTechnology,
      selectedPlants: selectedPlants,
      machineType: machineType,
      selectedCustomer: client,
      selectedVedor: vendorName,
      costingTypeId: costingTypeId,
      vendorName: vendorName,
      client: client,
      machineNo: fieldsObj?.MachineNumber,
      effectiveDate: effectiveDate,
      currency: this.state.currency,
      entryType: this.state.isImport ? "Import" : "Domestic",
      ExchangeRate: this.state.ExchangeSource || null,
      plantCurrencyRate: this.state.plantCurrency,
      settlementCurrencyRate: this.state.settlementCurrency,
      plantExchangeRateId: this.state.plantExchangeRateId,
      settlementExchangeRateId: this.state.settlementExchangeRateId,
      plantCurrencyID: this.state.plantCurrencyID,
      callExchangeRateAPI: this.callExchangeRateAPI,
      handleCalculation: this.handleCalculation,
    }
    setTimeout(() => {
      this.setState({ selectedPlants: selectedPlants, effectiveDate: effectiveDate })
    }, 500);
    if (!isFormHide) {
      this.props.setData(data)
    } else {
      this.props.setData()
    }
    reactLocalStorage?.setObject('vendorData', [])
  }

  /**
  * @method setOldValue
  * @description USED TO SET OLD VALUES
  */
  setOldValue = (data) => {
    this.setState({
      selectedTechnology: data.selectedTechnology,
      machineType: data.machineType,
      effectiveDate: data.EffectiveDate,
      remarks: data.Remark,
      client: data.selectedCustomer,
      vendorName: data.selectedVedor
    })

    setTimeout(() => {
      this.setState({ vendorName: data.selectedVedor })
    }, 300);

    this.props.change('MachineName', data && data.fieldsObj && data.fieldsObj.MachineName)
    this.props.change('MachineNumber', data && data.fieldsObj && data.fieldsObj.MachineNumber)
    this.props.change('TonnageCapacity', data && data.fieldsObj && data.fieldsObj.TonnageCapacity)
    this.props.change('Description', data && data.fieldsObj && data.fieldsObj.Description)
    this.props.change('Specification', data && data.fieldsObj && data.fieldsObj.Specification)
    this.props.change('vendorName', data && data.selectedVedor)
    this.props.change('clientName', data && data.selectedCustomer)
    this.props.change('Description', data && data.fieldsObj && data.fieldsObj.Description)
    setTimeout(() => {
      this.setState({ selectedPlants: data.selectedPlants })
      this.props.change('EffectiveDate', DayTime(data.EffectiveDate).isValid() ? DayTime(data.EffectiveDate) : '')
      this.props.change('Remark', data.Remark ? data.Remark : "")
    }, 200);
  }


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
    const { editDetails } = this.props


    if (editDetails && editDetails.isEditFlag) {
      this.setState({
        isEditFlag: false,
        isLoader: true,
        MachineID: editDetails.Id,
      })
      this.props.getMachineData(editDetails.Id, res => {
        if (res && res.data && res.data.Result) {

          const Data = res.data.Data;
          const vendorData = Data?.VendorId && Data?.VendorName ? {
            value: Data?.VendorId,
            label: Data?.VendorName
          } : [];

          const clientData = Data?.CustomerId && Data?.CustomerName ? {
            value: Data?.CustomerId,
            label: Data?.CustomerName
          } : [];
          if (Data?.MachineLabourRates && Data?.MachineLabourRates?.length !== 0) {
            this.setState({ disableMachineType: true })
          }
          this.props.getProcessGroupByMachineId(Data.MachineId, res => {
            this.props.setGroupProcessList(res?.data?.DataList)
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

          this.setState({ DataToChange: Data })
          // this.props.getVendorListByVendorType(Data.IsVendor, () => { this.setState({ inputLoader: false }) })
          // if (Data.IsVendor) {
          //   this.props.getPlantBySupplier(Data.VendorId, () => { })
          // }
          this.props.change('EffectiveDate', DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '')
          this.props.change('Specification', Data.Specification)
          this.props.change('plantCurrency', Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrency : Data?.Currency ?? Data?.LocalCurrency)
          this.setState({ minEffectiveDate: Data.EffectiveDate })
          this.finalUserCheckAndMasterLevelCheckFunction(Data.Plant[0].PlantId)
          setTimeout(() => {
            let MachineProcessArray = Data && Data.MachineProcessRates.map(el => {
              return {
                processName: el.ProcessName,
                ProcessId: el.ProcessId,
                UnitOfMeasurement: el.UnitOfMeasurement,
                UnitOfMeasurementId: el.UnitOfMeasurementId,
                MachineRate: el.MachineRate,
                MachineRateLocalConversion: el.MachineRateLocalConversion,
                MachineRateConversion: el.MachineRateConversion
              }
            })
            if (Data?.LocalCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
              this.setState({ hidePlantCurrency: false })
            } else {
              this.setState({ hidePlantCurrency: true })
            }
            let plantObj;
            if (Data && Data?.Plant?.length > 0) {
              plantObj = Data?.Plant?.map(plant => ({ label: plant?.PlantName, value: plant?.PlantId }));
            }

            this.setState({
              isEditFlag: true,
              IsFinancialDataChanged: false,
              costingTypeId: (Data.CostingTypeId),
              client: clientData,  // Updated
              // vendorName: vendorData,  // Updated
              // client: Data.CustomerName !== undefined ? { label: Data?.CustomerName ?? '', value: Data?.CustomerId ?? '' } : [],
              IsCopied: Data.IsCopied,
              IsDetailedEntry: Data.IsDetailedEntry,
              selectedTechnology: Data.Technology[0].Technology !== undefined ? { label: Data.Technology[0].Technology, value: Data.Technology[0].TechnologyId } : [],
              selectedPlants: plantObj ?? [],
              vendorName: Data.VendorName !== undefined ? { label: Data.VendorName, value: Data.VendorId } : [],
              machineType: Data.MachineType !== undefined ? { label: Data.MachineType, value: Data.MachineTypeId } : [],
              processGrid: MachineProcessArray ?? [],
              remarks: Data.Remark,
              files: Data.Attachements,
              effectiveDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              oldDate: DayTime(Data.EffectiveDate).isValid() ? DayTime(Data.EffectiveDate) : '',
              UOM: (this.state.isProcessGroup && !this.state.isViewMode) ? { label: Data.MachineProcessRates[0].UnitOfMeasurement, value: Data.MachineProcessRates[0].UnitOfMeasurementId } : [],
              lockUOMAndRate: (this.state.isProcessGroup && !this.state.isViewMode),
              ExchangeSource: Data?.ExchangeRateSourceName !== undefined ? { label: Data?.ExchangeRateSourceName, value: Data?.ExchangeRateSourceName } : [],
              plantCurrency: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRate : Data?.ExchangeRate,
              plantExchangeRateId: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyExchangeRateId : Data?.ExchangeRateId,
              settlementCurrency: Data?.ExchangeRate,
              settlementExchangeRateId: Data?.ExchangeRateId,
              plantCurrencyID: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? Data?.LocalCurrencyId : Data?.CurrencyId,
              currency: Data?.Currency && { label: Data?.Currency, value: Data?.CurrencyId },
              isImport: Data?.MachineEntryType === ENTRY_TYPE_IMPORT ? true : false
            }, () => {
              this.setState({ isLoader: false })
              this.props.change('MachineRate', (this.state.isProcessGroup && !this.state.isViewMode) ? Data.MachineProcessRates[0].MachineRate : '')
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
          }, 100)
        }
      })
    } else {
      this.props.getMachineData('', res => { })
    }
  }

  setRowdata = (array = []) => {
    this.setState({ rowData: array })
  }

  /**
    * @method onPressVendor
    * @description Used for Vendor checked
    */

  onPressVendor = (costingHeadFlag) => {
    // Store current isImport value
    const currentIsImport = this.state.isImport;
    const currentMachineNumber = this?.props?.fieldsObj?.MachineNumber;
    this.props.reset();
    this.setState({
      ...this.initialState,
      // MachineNumber: this?.props?.fieldsObj?.MachineNumber,
      costingTypeId: costingHeadFlag,
      isImport: currentIsImport // Preserve isImport value
    }, () => {
      if (costingHeadFlag === CBCTypeId) {
        this.props.getClientSelectList(() => { })
      }
      this.props.change('MachineNumber', currentMachineNumber)
    });
  };
  /**
  * @method handleTechnology
  * @description Used handle technology
  */
  handleTechnology = (e) => {
    this.setState({ selectedTechnology: e })
    this.setState({ DropdownChange: false })
  }
  /**
* @method handleClient
* @description called
*/
  handleClient = (newValue, actionMeta) => {
    const { costingTypeId, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants, vendorName } = this.state;
    const { fieldsObj } = this.props
    if (newValue && newValue !== '') {
      this.setState({ client: newValue }
        , () => {
          if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
            this.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, isImport, ExchangeSource, effectiveDate, newValue, vendorName, selectedPlants).then(result => {
              if (result) {
                this.setState({
                  ...result,
                  showWarning: result?.showWarning
                }, () => {
                  this.handleCalculation(this.fieldsObj?.MachineRate);
                });
              }
            });
          }
        }
      );
    }
    else {
      this.setState({ client: [] })
    }
  };

  handleMachineSpecification = () => {
    this.setState({ DropdownChange: false })
  }
  /**
  * @method handleMessageChange
  * @description used remarks handler
  */
  handleMessageChange = (e) => {
    this.setState({
      remarks: e?.target?.value,
      DropdownChange: false
    })
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
    const { plantSelectList, UOMSelectList, machineTypeSelectList, processSelectList, costingSpecifiTechnology, clientSelectList, exchangeRateSourceList, currencySelectList } = this.props;
    const temp = [];
    if (label === 'technology') {
      costingSpecifiTechnology && costingSpecifiTechnology.map(item => {
        if (item.Value === '0' || (item.Value === String(LOGISTICS))) return false;
        temp.push({ label: item.Text, value: item.Value })
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
    if (label === 'UOM') {
      UOMSelectList && UOMSelectList.map(item => {
        const accept = AcceptableMachineUOM.includes(item.Type)
        if (accept === false) return false
        if (item.Value === '0') return false;
        temp.push({ label: item.Display, value: item.Value })
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
  }

  /**
  * @method handleVendorName
  * @description called
  */
  handleVendorName = (newValue, actionMeta) => {
    const { costingTypeId, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants } = this.state;
    const { fieldsObj } = this.props
    if (newValue && newValue !== '') {
      this.setState({ vendorName: newValue, isVendorNameNotSelected: false, vendorLocation: [] }, () => {
        const { vendorName } = this.state;
        this.props.getPlantBySupplier(vendorName.value, () => { })
      });
      if (this.props.fieldsObj?.plantCurrency !== reactLocalStorage?.getObject("baseCurrency")) {
        this.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, isImport, ExchangeSource, effectiveDate, client, newValue, selectedPlants).then(result => {
          if (result) {
            this.setState({
              ...result,
              showWarning: result?.showWarning
            }, () => {
              this.handleCalculation(this.fieldsObj?.MachineRate);
            });
          }
        });
      }
    } else {
      this.setState({ vendorName: [], vendorLocation: [] })
      this.props.getPlantBySupplier('', () => { })
    }
  };

  /**
  * @method handlePlants
  * @description called
  */
  handlePlants = (newValue, actionMeta) => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants } = this.state;
    if (!this.state.isViewMode && getConfigurationKey()?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && getConfigurationKey()?.IsDivisionAllowedForDepartment) {
      this.commonFunction(newValue ? newValue.value : '')
    }
    if (newValue && newValue !== '') {
      this.setState({ selectedPlants: newValue, })
      this.props.getPlantUnitAPI(newValue?.value, (res) => {
        let Data = res?.data?.Data
        this.props.change('plantCurrency', Data?.Currency)
        this.setState({ plantCurrencyID: Data?.CurrencyId })
        this.callExchangeRateAPI(costingTypeId, Data?.Currency, currency, isImport, ExchangeSource, effectiveDate, client, vendorName, selectedPlants).then(result => {
          if (result) {

            this.setState({
              ...result,
              showWarning: result.showWarning
            }, () => {
              this.handleCalculation(this.fieldsObj?.MachineRate);
              // if (result.plantCurrency) {
              // }
              // if (this.state.entryType) {
              //   this.handleCalculation(this.props.fieldsObj?.MachineRate);
              // }
            });
          }
        });
        if (Data?.Currency !== reactLocalStorage?.getObject("baseCurrency")) {
          this.setState({ hidePlantCurrency: false })
        } else {
          this.setState({ hidePlantCurrency: true })
        }
      })
    } else {
      this.setState({ selectedPlants: [] })
    }
  };

  /**
  * @method handleMachineType
  * @description called
  */
  handleMachineType = (newValue, actionMeta) => {
    if (newValue && newValue !== '') {
      this.setState({ machineType: newValue });
    } else {
      this.setState({ machineType: [], })
    }
  };

  machineTypeToggler = () => {
    this.setState({ isOpenMachineType: true })
  }

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

  /**
  * @method moreDetailsToggler
  * @description called
  */
  moreDetailsToggler = (Id, editFlag) => {
    const { selectedTechnology, vendorName, costingTypeId, client, machineType, plantCurrency, settlementCurrency, plantExchangeRateId, settlementExchangeRateId, plantCurrencyID, isImport, currency } = this.state;

    if (selectedTechnology == null || selectedTechnology.length === 0 || Object.keys(selectedTechnology).length < 0) {
      Toaster.warning(`${this.props.t('Technology', { ns: 'MasterLabels', defaultValue: 'Technology' })} should not be empty.`)
      return false;
    }
    // else if (this.state.isImport && this.state.currency.length === 0) {
    //   Toaster.warning(`Currency should not be empty.`)
    //   return false;
    // }
    if (costingTypeId === VBCTypeId && vendorName.length === 0) {
      Toaster.warning(`Vendor and ${this.props.t('Technology', { ns: 'MasterLabels', defaultValue: 'Technology' })} should not be empty.`)
      return false;
    }
    let data = {
      isEditFlag: editFlag,
      Id: Id,
      isIncompleteMachine: (this.state.isEditFlag && !this.state.IsDetailedEntry) ? true : false,
      isViewMode: this.state.isViewMode || this.state.isViewFlag,
      costingTypeId: costingTypeId,
      selectedTechnology: selectedTechnology,
      vendorName: vendorName ?? [],
      selectedPlants: this.state.selectedPlants,
      selectedEffectiveDate: this.props.fieldsObj.EffectiveDate,
      selectedCustomer: client ?? [],
      fieldsObj: this.props.fieldsObj,
      ExchangeSource: this.state.ExchangeSource || null,
      plantCurrency: plantCurrency,
      settlementCurrency: settlementCurrency,
      plantExchangeRateId: plantExchangeRateId,
      settlementExchangeRateId: settlementExchangeRateId,
      plantCurrencyID: plantCurrencyID,
      entryType: isImport,
      currency: currency,
      callExchangeRateAPI: this.callExchangeRateAPI,
      handleCalculation: this?.handleCalculation,
      machineType: machineType
    }
    this.props.displayMoreDetailsForm(data)
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
    if (!this.state.isViewMode) {
      this.setState({ isOpenProcessDrawer: true })
    }
  }

  /**
   * @method closeProcessDrawer
   * @description FOR CLOSING PROCESS DRAWER
  */
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
      this.setState({ UOM: newValue });
    } else {
      this.setState({ UOM: [] })
    }
  };

  handleMachineRate = (e) => {
    const value = e.target.value;
    this.setState({ machineRate: value })
  }
  // handleMachineRatePlantCurrency = (e) => {
  //   const value = e.target.value;
  //   this.setState({ machineRatePlantCurrency: value })
  // }
  // MachineRateConversion = (e) => {
  //   const value = e.target.value;
  //   this.setState({ MachineRateConversion: value })
  // }
  HandleMachineRateSelectedCurrency = (e) => {
    const value = e.target.value;
    this.setState({ currency: value })
  }
  /**
   * @method processTableHandler
   * @description ADDIN PROCESS ROW IN TABLE GRID
  */
  processTableHandler = () => {
    const { processName, UOM, processGrid, isProcessGroup } = this.state;

    const { fieldsObj } = this.props;
    const tempArray = [];

    let count = 0;
    setTimeout(() => {

      if (processName.length === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, processName: true } })
        count++;
      }
      if (UOM === undefined || (UOM && UOM.length === 0)) {
        this.setState({ errorObj: { ...this.state.errorObj, processUOM: true } })
        count++;
      }
      if (fieldsObj.MachineRate === undefined || Number(fieldsObj.MachineRate) === 0) {
        this.setState({ errorObj: { ...this.state.errorObj, machineRate: true } })
        count++;
      }

      if (count > 0) {
        return false;
      }
      if (maxLength10(fieldsObj.MachineRate) || decimalLengthsix(fieldsObj.MachineRate)) {
        return false
      }
      //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
      const isExist = processGrid.findIndex(el => (el.ProcessId === processName.value))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please check the values.')
        return false;
      }

      // const MachineRate = fieldsObj && fieldsObj.MachineRate !== undefined ? checkForNull(fieldsObj.MachineRate) : 0;

      const MachineRate = fieldsObj.MachineRate
      const MachineRateConversion = fieldsObj.MachineRateConversion
      const MachineRateLocalConversion = fieldsObj.MachineRateLocalConversion ?? fieldsObj.MachineRate


      tempArray.push(...processGrid, {
        processName: processName?.label,
        ProcessId: processName?.value,
        UnitOfMeasurement: UOM?.label,
        UnitOfMeasurementId: UOM.value,
        MachineRate: MachineRate,
        MachineRateConversion: MachineRateConversion,
        MachineRateLocalConversion: MachineRateLocalConversion,
      })


      this.setState({ IsFinancialDataChanged: true })
      this.setState({
        processGrid: tempArray,
        processName: [],
        UOM: isProcessGroup ? UOM : [],
        lockUOMAndRate: isProcessGroup,
      }, () => this.props.change('MachineRate', isProcessGroup ? MachineRate : ''));
      this.setState({ DropdownChange: false, errorObj: { processName: false, processUOM: false, machineRate: false, machineRatePlantCurrency: false } })
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
    const { processName, UOM, processGrid, processGridEditIndex, isProcessGroup } = this.state;
    const { fieldsObj } = this.props;
    let tempArray = [];

    //CONDITION TO SKIP DUPLICATE ENTRY IN GRID
    let skipEditedItem = processGrid.filter((el, i) => {
      if (i === processGridEditIndex) return false;
      return true;
    })

    //CONDITION TO CHECK DUPLICATE ENTRY EXCEPT EDITED RECORD
    const isExist = skipEditedItem.findIndex(el => (el.ProcessId === processName.value && el.UnitOfMeasurementId === UOM.value))
    if (isExist !== -1) {
      Toaster.warning('Already added, Please check the values.')
      return false;
    }

    if (this.props.invalid === true) {
      return false;
    }
    const MachineRate = fieldsObj.MachineRate
    const MachineRateConversion = fieldsObj.MachineRateConversion
    const MachineRateLocalConversion = fieldsObj.MachineRateLocalConversion ?? fieldsObj.MachineRate

    // CONDITION TO CHECK MACHINE RATE IS NEGATIVE OR NOT A NUMBER
    if (MachineRate <= 0 || isNaN(MachineRate)) {
      return false;
    }

    let tempData = processGrid[processGridEditIndex];
    if (MachineRate !== tempData.MachineRate || UOM.value !== tempData.UnitOfMeasurementId || processName.value !== tempData.ProcessId) {
      this.setState({ IsFinancialDataChanged: true, DataToChange: true })
      this.setState({ DropdownChange: false })
    }
    tempData = {
      processName: processName?.label,
      ProcessId: processName.value,
      UnitOfMeasurement: UOM?.label,
      UnitOfMeasurementId: UOM?.value,
      MachineRate: MachineRate,
      MachineRateConversion: MachineRateConversion,
      MachineRateLocalConversion: MachineRateLocalConversion,
    }

    tempArray = Object.assign([...processGrid], { [processGridEditIndex]: tempData })

    this.setState({
      processGrid: tempArray,
      processName: [],
      UOM: isProcessGroup ? UOM : [],
      lockUOMAndRate: isProcessGroup,
      processGridEditIndex: '',
      isEditIndex: false,

    }, () => this.props.change('MachineRate', isProcessGroup ? MachineRate : ''),
      // this.props.change("MachineRateLocalConversion", isProcessGroup ? MachineRateLocalConversion : ''),
      // this.props.change("MachineRateConversion", isProcessGroup ? MachineRateConversion : '')
    );
  };

  /**
* @method resetProcessGridData
* @description Used to handle setTechnologyLevel
*/
  resetProcessGridData = () => {
    const { isProcessGroup, UOM } = this.state

    const { fieldsObj } = this.props;
    const MachineRate = fieldsObj.MachineRate
    const MachineRateLocalConversion = fieldsObj.MachineRateLocalConversion ?? fieldsObj.MachineRate
    const MachineRateConversion = fieldsObj.MachineRateConversion
    this.setState({
      processName: [],
      UOM: isProcessGroup && this.state.processGrid.length !== 0 ? UOM : [],
      processGridEditIndex: '',
      isEditIndex: false,
    }, () => this.props.change('MachineRate', isProcessGroup && this.state.processGrid.length !== 0 ? MachineRate : ''),
      this.props.change("MachineRateLocalConversion", isProcessGroup && this.state.processGrid.length !== 0 ? MachineRateLocalConversion : ''),
      this.props.change("MachineRateConversion", isProcessGroup && this.state.processGrid.length !== 0 ? MachineRateConversion : '')
    );
  };

  /**
  * @method editItemDetails
  * @description used to Reset form
  */
  editItemDetails = (index) => {
    const { processGrid } = this.state;
    const tempData = processGrid[index];

    this.setState({
      processGridEditIndex: index,
      isEditIndex: true,
      processName: { label: tempData.processName, value: tempData.ProcessId },
      UOM: { label: tempData.UnitOfMeasurement, value: tempData.UnitOfMeasurementId },
    }, () => this.props.change('MachineRate', tempData.MachineRate),
      this.props.change("MachineRateLocalConversion", tempData.MachineRateLocalConversion),
      this.props.change("MachineRateConversion", tempData.MachineRateConversion)
    );
    // this.setState({ DropdownChange: false })
  }

  /**
  * @method deleteItem
  * @description DELETE ROW ENTRY FROM TABLE 
  */
  deleteItem = (index) => {
    const { processGrid, UOM, isProcessGroup } = this.state;

    let tempData = processGrid.filter((item, i) => {
      if (i === index) {
        return false;
      }
      return true;
    });
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
    }, () =>
      this.props.change('MachineRate', ''))
    this.setState({ DropdownChange: false })
  }






  /**
  * @method handleChange
  * @description Handle Effective Date
  */
  handleEffectiveDateChange = (date) => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants } = this.state;
    this.setState({
      effectiveDate: date,
      isDateChange: true,
    }, () => {
      this.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, isImport, ExchangeSource, date, client, vendorName, selectedPlants).then(result => {
        if (result) {

          this.setState({
            ...result,
            showWarning: result.showWarning
          }, () => {
            this.handleCalculation(this.fieldsObj?.MachineRate);
            // if (result.plantCurrency) {
            // }
            // if (this.state.entryType) {
            //   this.handleCalculation(this.props.fieldsObj?.MachineRate);
            // }
          });
        }
      });
    });

  };

  /**
  * @method checkUniqNumber
  * @description CHECK UNIQ MACHINE NUMBER
  */
  checkUniqNumber = (e) => {
    this.props.checkAndGetMachineNumber(e.target.value, res => {
      if (res && res.data && res.data.Result === false) {
        Toaster.warning(res.data.Message);
      }
    })
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  cancel = (type) => {
    const { reset } = this.props;
    reset();
    this.setState({
      remarks: '',
      isFormHide: true,
      IsVendor: false,
      isEditFlag: false,
    }, () => this.props.hideForm(type))

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
      if (!validateFileName(file.name)) {
        this.dropzone.current.files.pop()
        this.setDisableFalseFunction()
        return false;
      }
      this.props.fileUploadMachine(data, (res) => {
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
  handleMachineOperation = (formData, isEditFlag) => {
    const operation = isEditFlag ? this.props.updateMachine : this.props.createMachine;
    const successMessage = isEditFlag ? MESSAGES.UPDATE_MACHINE_DETAILS_SUCCESS : MESSAGES.MACHINE_ADD_SUCCESS;

    operation(formData, (res) => {
      this.setState({ setDisable: false });
      if (res?.data?.Result) {
        Toaster.success(successMessage);
        if (isEditFlag) {
          if (!this.state.isEditBtnClicked) {
            this.cancel('submit');
          } else {
            this.getDetails();
            // Add any additional state updates needed for edit mode
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
    const { MachineID, isEditFlag, IsDetailedEntry, vendorName, selectedTechnology, selectedPlants,
      remarks, machineType, files, processGrid, isViewFlag, costingTypeId, client, DropdownChange, effectiveDate, oldDate, isDateChange, IsFinancialDataChanged, DataToChange, isImport } = this.state;
    const userDetailsMachine = JSON.parse(localStorage.getItem('userDetail'))

    if (costingTypeId !== CBCTypeId && vendorName?.length <= 0) {
      if (costingTypeId === VBCTypeId) {
        this.setState({ isVendorNameNotSelected: true, setDisable: false })      // IF VENDOR NAME IS NOT SELECTED THEN WE WILL SHOW THE ERROR MESSAGE MANUALLY AND SAVE BUTTON WILL NOT BE DISABLED
        return false
      }
    }

    this.setState({ isVendorNameNotSelected: false })

    if (isViewFlag) {
      this.cancel('submit');
      return false
    }
    const { machineData } = this.props;
    const userDetail = userDetails()

    if (processGrid && processGrid.length === 0) {
      Toaster.warning('Process Rate entry required.');
      return false;
    }

    let technologyArray = [{ Technology: selectedTechnology?.label, TechnologyId: selectedTechnology?.value }]
    let updatedFiles = files.map((file) => ({ ...file, ContextId: MachineID }))

    let plantArray = Array?.isArray(selectedPlants) ? selectedPlants?.map(plant => ({ PlantId: plant?.value, PlantName: plant?.label, PlantCode: '' })) :
      selectedPlants ? [{ PlantId: selectedPlants?.value, PlantName: selectedPlants?.label, PlantCode: '' }] : [];


    // if (this.state.isEditFlag && this.state.isFinalApprovar) {
    if ((isEditFlag && (this.state.isFinalApprovar || userDetails().Role === 'SuperAdmin')) || (isEditFlag && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) !== true)) {

      // if (DropdownChange) {

      // }
      if (IsDetailedEntry) {
        // EXECUTED WHEN:- EDIT MODE && MACHINE MORE DETAILED == TRUE
        let detailedRequestData = { ...machineData, MachineId: MachineID, Remark: remarks, Attachements: updatedFiles }

        this.handleMachineOperation(detailedRequestData, true);
      } else {

        // EXECUTED WHEN:- EDIT MODE OF BASIC MACHINE && MACHINE MORE DETAILED NOT CREATED
        let requestData = {
          MachineId: MachineID,
          IsFinancialDataChanged: isDateChange ? true : false,
          CostingTypeId: costingTypeId,
          IsDetailedEntry: false,
          VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
          MachineNumber: values.MachineNumber,
          MachineName: values.MachineName,
          MachineTypeId: machineType.value,
          TonnageCapacity: values.TonnageCapacity,
          Specification: values.Specification,
          LoggedInUserId: loggedInUserId(),
          MachineProcessRates: processGrid,
          Technology: [{ Technology: selectedTechnology?.label ? selectedTechnology?.label : selectedTechnology[0]?.label, TechnologyId: selectedTechnology.value ? selectedTechnology.value : selectedTechnology[0].value }],
          Plant: plantArray,
          Remark: remarks,
          Attachements: updatedFiles,
          IsForcefulUpdated: true,
          EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
          MachineProcessGroup: this.props.processGroupApiData,
          VendorPlant: [],
          CustomerId: costingTypeId === CBCTypeId && client ?
            (client.value || null) :
            null,
          DestinationPlantId: '',
          MachineEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
          ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
          LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
          LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
          ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
          LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
          CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
          Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
          ExchangeRateId: isImport ? this.state?.settlementExchangeRateId : this.state?.plantExchangeRateId,
          LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null
        }

        if (IsFinancialDataChanged) {
          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.handleMachineOperation(requestData, true);
            return false
          } else {

            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }
        }

        if (isEditFlag) {

          if (DropdownChange && (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements)) &&
            (DataToChange.Specification ? DataToChange.Specification : '') === (values.Specification ? values.Specification : '') &&
            (DataToChange.MachineName ? DataToChange.MachineName : '') === (values.MachineName ? values.MachineName : '') &&
            (DataToChange?.MachineTypeId ? String(DataToChange?.MachineTypeId) : '') === (machineType?.value ? String(machineType?.value) : '') &&
            (DataToChange?.TonnageCapacity ? String(DataToChange?.TonnageCapacity) : '') === (values?.TonnageCapacity ? String(values?.TonnageCapacity) : '') &&
            DataToChange?.Remark === values?.Remark) {
            Toaster.warning('Please change data to save Machine Details');
            return false
          }

          this.setState({ setDisable: true })
          this.props.updateMachine(requestData, (res) => {
            this.setState({ setDisable: false })
            if (res?.data?.Result) {
              Toaster.success(MESSAGES.UPDATE_MACHINE_DETAILS_SUCCESS);
              this.cancel('submit')
            }
          });
        }


      }
    } else {

      if (CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && (!this.state.isFinalApprovar || !userDetails().Role === 'SuperAdmin')) {
        this.setState({ IsSendForApproval: true })
      } else {
        this.setState({ IsSendForApproval: false })
      }
      let plantArray = Array?.isArray(selectedPlants) ? selectedPlants?.map(plant => ({ PlantId: plant?.value, PlantName: plant?.label, PlantCode: '' })) :
        selectedPlants ? [{ PlantId: selectedPlants?.value, PlantName: selectedPlants?.label, PlantCode: '' }] : [];
      // EXECUTED WHEN:- NEW MACHINE WITH BASIC DETAILS
      // this.setState({ setDisable: true })

      const formData = {
        IsSendForApproval: this.state.IsSendForApproval,
        IsFinancialDataChanged: isDateChange ? true : false,
        MachineId: MachineID,
        CostingTypeId: costingTypeId,
        VendorId: costingTypeId === VBCTypeId ? vendorName.value : userDetail.ZBCSupplierInfo.VendorId,
        IsDetailedEntry: false,
        MachineNumber: values.MachineNumber,
        MachineName: values.MachineName,
        MachineTypeId: machineType.value,
        TonnageCapacity: values.TonnageCapacity,
        Specification: values.Specification,
        LoggedInUserId: loggedInUserId(),
        MachineProcessRates: processGrid,
        Technology: (technologyArray.length > 0 && technologyArray[0]?.Technology !== undefined) ? technologyArray : [{ Technology: selectedTechnology?.label ? selectedTechnology?.label : selectedTechnology[0]?.label, TechnologyId: selectedTechnology.value ? selectedTechnology.value : selectedTechnology[0].value }],
        Plant: plantArray ?? [],
        DestinationPlantId: '',
        Remark: remarks,
        Attachements: files,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        MachineProcessGroup: this.props.processGroupApiData,
        VendorPlant: [],
        CustomerId: costingTypeId === CBCTypeId ? client.value : '',
        MachineEntryType: isImport ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC,
        ExchangeRateSourceName: this.state.ExchangeSource?.label || null,
        LocalCurrencyId: isImport ? this.state?.plantCurrencyID : null,
        LocalCurrency: isImport ? this.props?.fieldsObj?.plantCurrency : null,
        ExchangeRate: isImport ? this.state?.settlementCurrency : this.state?.plantCurrency,
        LocalCurrencyExchangeRate: isImport ? this.state?.plantCurrency : null,
        CurrencyId: isImport ? this.state.currency?.value : this.state?.plantCurrencyID,
        Currency: isImport ? this.state?.currency?.label : this.props.fieldsObj?.plantCurrency,
        ExchangeRateId: isImport ? this.state?.settlementExchangeRateId : this.state?.plantExchangeRateId,
        LocalExchangeRateId: isImport ? this.state?.plantExchangeRateId : null
      }

      let finalObj = {
        ...formData,
        MachineProcessRates: processGrid,
        EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
        MachineId: MachineID,
        CostingTypeId: costingTypeId,
      }

      if (CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && (!this.state.isFinalApprovar || !userDetails().Role === 'SuperAdmin')) {

        if (IsFinancialDataChanged) {

          if (isDateChange && (DayTime(oldDate).format("DD/MM/YYYY") !== DayTime(effectiveDate).format("DD/MM/YYYY"))) {
            this.setState({ approveDrawer: true, approvalObj: finalObj })
            return false
          } else {
            this.setState({ setDisable: false })
            Toaster.warning('Please update the effective date')
            return false
          }
        }

        if (isEditFlag) {
          if (DropdownChange && (JSON.stringify(files) === JSON.stringify(DataToChange.Attachements)) &&
            (DataToChange.Specification ? DataToChange.Specification : '') === (values.Specification ? values.Specification : '') &&
            (DataToChange.MachineName ? DataToChange.MachineName : '') === (values.MachineName ? values.MachineName : '') &&
            (DataToChange?.MachineTypeId ? String(DataToChange?.MachineTypeId) : '') === (machineType?.value ? String(machineType?.value) : '') &&
            (DataToChange?.TonnageCapacity ? String(DataToChange?.TonnageCapacity) : '') === (values?.TonnageCapacity ? String(values?.TonnageCapacity) : '') &&
            DataToChange?.Remark === values?.Remark) {
            Toaster.warning('Please change data to send machine for approval')
            return false
          } else {

            this.setState({ setDisable: true })
            this.setState({ approveDrawer: true, approvalObj: finalObj })
          }
        }

      } else {
        this.handleMachineOperation(formData, false);
      }
    }
  }, 500)

  /**
   * @method showFormData
   * @description SHOW FORM DATA ENTRY FROM ADD MORE DETAIL FORM
  */
  showFormData = () => {
    const { data } = this.props
    // if (data?.CostingTypeId === VBCTypeId) {
    //   this.props.getVendorWithVendorCodeSelectList(this.state.vendorName, () => { })
    // }
    // if (data?.CostingTypeId) {
    //   this.props.getPlantBySupplier(data.VendorId, () => { })
    // }
    let technologyArray = [{ label: data.Technology && data.Technology[0].Technology, value: data.Technology && data.Technology[0].TechnologyId }]
    setTimeout(() => {
      const { vendorWithVendorCodeSelectList, machineTypeSelectList, plantSelectList, } = this.props;
      const currency = data?.Currency && { label: data?.Currency, value: data?.CurrencyId }

      // let technologyArray = data && data.Technology.map((item) => ({ Text: item.Technology, Value: item.TechnologyId }))
      this.props.change('plantCurrency', data?.LocalCurrency)
      this.props.change('Currency', currency)

      let MachineProcessArray = data && data.MachineProcessRates && data.MachineProcessRates.map(el => {
        return {
          processName: el.processName,
          ProcessId: el.ProcessId,
          UnitOfMeasurement: el.UnitOfMeasurement,
          UnitOfMeasurementId: el.UnitOfMeasurementId,
          MachineRate: el.MachineRate,
        }
      })
      this.props.change('MachineName', data.MachineName)
      this.props.change('MachineNumber', data.MachineNumber)
      this.props.change('TonnageCapacity', data.TonnageCapacity)
      this.props.change('Specification', data.Specification)
      const vendorObj = vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.find(item => item.Value === data.VendorId)
      const plantObj = data.IsVendor === false && plantSelectList && plantSelectList.find(item => item.PlantId === data.Plant[0]?.PlantId)

      const machineTypeObj = machineTypeSelectList && machineTypeSelectList.find(item => item.Value === data.MachineTypeId)

      this.setState({
        isEditFlag: false,
        //IsDetailedEntry:false,
        // isLoader: false,
        costingTypeId: data.CostingTypeId,
        IsCopied: data.IsCopied,
        IsDetailedEntry: false,
        selectedTechnology: technologyArray,
        selectedPlants: plantObj && plantObj !== undefined ? { label: plantObj.Text, value: plantObj.Value } : [],
        vendorName: vendorObj && vendorObj !== undefined ? { label: vendorObj.Text, value: vendorObj.Value } : [],
        machineType: machineTypeObj && machineTypeObj !== undefined ? { label: machineTypeObj.Text, value: machineTypeObj.Value } : [],
        processGrid: MachineProcessArray ?? [],
        remarks: data.Remark,
        files: data.Attachements,
        effectiveDate: data.EffectiveDate,
        isImport: data.MachineEntryType === ENTRY_TYPE_IMPORT ? true : false,
        currency: data?.Currency && { label: data?.Currency, value: data?.CurrencyId },
        ExchangeSource: data?.ExchangeRateSourceName !== undefined ? { label: data?.ExchangeRateSourceName, value: data?.ExchangeRateSourceName } : [],
      }, () => this.setState({ isLoader: false }))
    }, 100)
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

  DisplayMachineRateBaseCurrencyLabel = () => {
    return <>Machine Rate/{this.state?.UOM && this.state?.UOM.length !== 0 ? displayUOM(this.state?.UOM?.label) : "UOM"} ({reactLocalStorage.getObject("baseCurrency")})</>
  }
  DisplayMachineRateDynamicLabel = () => {
    return (
      <>
        Machine Rate/{this.state?.UOM && this.state?.UOM.length !== 0 ? displayUOM(this.state?.UOM?.label) : "UOM"} (
        {this.state.isImport && this.state.currency?.label !== undefined
          ? this.state.currency.label
          : this.state.isImport
            ? "Currency"
            : this.props.fieldsObj.plantCurrency
              ? this.props.fieldsObj.plantCurrency
              : "Currency"}
        )
      </>
    );
  }
  DisplayMachineRatePlantCurrencyLabel = () => {
    return <>Machine Rate/{this.state?.UOM && this.state?.UOM.length !== 0 ? displayUOM(this.state?.UOM?.label) : "UOM"} ({this.props.fieldsObj.plantCurrency ? this.props.fieldsObj.plantCurrency : "Currency"})</>
  }


  checksFinancialDataChanged = (data) => {

    this.setState({ IsFinancialDataChanged: data })
  }
  handleExchangeRateSource = (newValue) => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants } = this.state;
    this.setState({ ExchangeSource: newValue }
      , () => {
        this.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, isImport, newValue, effectiveDate, client, vendorName, selectedPlants).then(result => {
          if (result) {
            this.setState({
              ...result,
              showWarning: result.showWarning
            }, () => {
              this.handleCalculation(this.fieldsObj?.MachineRate);

            });
          }
        });

      }
    );
  };
  ImportToggle = () => {
    const { fieldsObj } = this.props
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants } = this.state;
    this.setState({ isImport: !this.state.isImport }, () => {
      this.props.change("MachineRate", "")
      this.props.change("MachineRateLocalConversion", "")
      this.props.change("MachineRateConversion", "")
      // this.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, currency, isImport, ExchangeSource, effectiveDate, client, vendorName, selectedPlants).then(result => {
      //   if (result) {
      //     this.setState({
      //       ...result,
      //       showWarning: result.showWarning
      //     }, () => {
      //       this.handleCalculation(this.fieldsObj?.MachineRate);
      //       // if (result.plantCurrency) {
      //       // }
      //       // if (this.state.entryType) {
      //       //   this.handleCalculation(this.props.fieldsObj?.MachineRate);
      //       // }
      //     });
      //   }
      // });
    })
  };

  handleCurrency = (newValue) => {
    const { fieldsObj } = this.props;
    const { costingTypeId, vendorName, client, effectiveDate, ExchangeSource, currency, isImport, selectedPlants } = this.state;
    if (newValue && newValue !== '') {
      this.setState({ currency: newValue }, () => {
        this.callExchangeRateAPI(costingTypeId, fieldsObj?.plantCurrency, newValue, isImport, ExchangeSource, effectiveDate, client, vendorName, selectedPlants).then(result => {
          if (result) {
            this.setState({
              ...result,
              showWarning: result?.showWarning
            }, () => {
              this.handleCalculation(this.fieldsObj?.MachineRate);
            });
          }
        });
      })
    } else {
      this.setState({ currency: [] })
    }
  };
  machineRateTitle = () => {
    return {
      tooltipTextPlantCurrency: `Machine Rate * Plant Currency Rate (${this.state?.plantCurrency ?? ''})`,
      toolTipTextNetCostBaseCurrency: this.state?.hidePlantCurrency
        ? `Machine Rate * Currency Rate (${this.state?.plantCurrency ?? ''})`
        : `Machine Rate * Currency Rate (${this.state?.settlementCurrency ?? ''})`,
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
    const { handleSubmit, AddAccessibility, EditAccessibility, initialConfiguration, isMachineAssociated, t } = this.props;
    const { isEditFlag, isOpenMachineType, isOpenProcessDrawer, disableMachineType, IsCopied, isViewFlag, isViewMode, setDisable, lockUOMAndRate, UniqueProcessId, costingTypeId, IsDetailedEntry, CostingTypePermission, disableSendForApproval, tourContainer } = this.state;
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
    const filterList = async (inputValue) => {
      const { vendorFilterList } = this.state
      if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
        inputValue = inputValue.trim();
      }
      const resultInput = inputValue.slice(0, searchCount)
      if (inputValue?.length >= searchCount && vendorFilterList !== resultInput) {
        // this.setState({ inputLoader: true })
        let res
        res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
        // this.setState({ inputLoader: false })
        this.setState({ vendorFilterList: resultInput })
        let vendorDataAPI = res?.data?.SelectList
        if (inputValue) {
          // this.setState({ inputLoader: false })
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
          <div className="login-container signup-form">
            <div className="row">
              <div className="col-md-12">
                <div className="shadow-lgg login-formg">
                  {!this.props.data.isCostingDrawer && <div className="row">
                    <div className="col-md-6">
                      <div className="form-heading mb-0">
                        <h2> {isViewMode ? "View" : isEditFlag ? "Update" : "Add"} Machine Rate
                          {!isViewMode && <TourWrapper
                            buttonSpecificProp={{ id: "Add_Machine_Rate_Form" }}
                            stepsSpecificProp={{
                              steps: Steps(t, {
                                isMachineAssociated: isMachineAssociated,
                                showSendForApproval: !this.state.isFinalApprovar,
                                isEditFlag: isEditFlag,
                                vendorField: (costingTypeId === VBCTypeId),
                                customerField: (costingTypeId === CBCTypeId)
                              }
                              ).ADD_MACHINE_RATE
                            }} />}

                        </h2>
                        <Row>
                          <Col md="4" className="switch mt-3 mb15">
                            <label className="switch-level">
                              <div className="left-title">Domestic</div>
                              <Switch
                                onChange={this.ImportToggle}
                                checked={this.state.isImport}
                                id="normal-switch"
                                disabled={isEditFlag || isViewFlag}
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
                    <div class="add-min-height">
                      <Row>
                        <Col md="12">
                          {reactLocalStorage.getObject('CostingTypePermission').zbc && <Label id="AddMachineRate_zeroBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={
                                costingTypeId === ZBCTypeId ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(ZBCTypeId)
                              }
                              disabled={(isEditFlag || isViewMode) ? true : false}
                            />{" "}
                            <span>Zero Based</span>
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').vbc && <Label id="AddMachineRate_vendorBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3  pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={
                                costingTypeId === VBCTypeId ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(VBCTypeId)
                              }
                              disabled={(isEditFlag || isViewMode) ? true : false}
                            />{" "}
                            <span>{VendorLabel} Based</span>
                          </Label>}
                          {reactLocalStorage.getObject('CostingTypePermission').cbc && <Label id="AddMachineRate_customerBased" className={"d-inline-block align-middle w-auto pl0 pr-4 mb-3 pt-0 radio-box"} check>
                            <input
                              type="radio"
                              name="costingHead"
                              checked={
                                costingTypeId === CBCTypeId ? true : false
                              }
                              onClick={() =>
                                this.onPressVendor(CBCTypeId)
                              }
                              disabled={(isEditFlag || isViewMode) ? true : false}
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
                        <Col md="3">
                          <Field
                            label={t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })}
                            name="technology"
                            placeholder={isViewFlag || isEditFlag ? '-' : "Select"}
                            // selection={(this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0) ? [] : this.state.selectedTechnology}
                            options={this.renderListing('technology')}
                            handleChangeDescription={this.handleTechnology}
                            // optionValue={option => option.Value}
                            // optionLabel={option => option.Text}
                            component={searchableSelect}
                            mendatory={true}
                            required
                            validate={(this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0 ? [required] : [])}
                            className="multiselect-with-border"
                            valueDescription={this.state.selectedTechnology}
                            disabled={isViewFlag || isEditFlag ? true : false}
                          //disabled={(this.state.IsVendor || isEditFlag) ? true : false}
                          />
                        </Col>
                        {costingTypeId === VBCTypeId &&
                          <Col md="3">
                            <label>{VendorLabel} (Code)<span className="asterisk-required">*</span></label>
                            <div className='p-relative'>
                              {this.state.inputLoader && <LoaderCustom customClass={`input-loader`} />}
                              <AsyncSelect
                                name="vendorName"
                                id="AddMachineRate_vendorName"
                                ref={this.myRef}
                                key={this.state.updateAsyncDropdown}
                                loadOptions={filterList}
                                onChange={(e) => this.handleVendorName(e)}
                                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN : "No results found"}
                                value={this.state.vendorName}
                                isDisabled={(isEditFlag || this.state.inputLoader || isViewFlag) ? true : false}
                                onKeyDown={(onKeyDown) => {
                                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                                }}
                              />
                              {this.state.isVendorNameNotSelected && <div className='text-help'>This field is required.</div>}
                            </div>
                          </Col>}

                        {((costingTypeId === ZBCTypeId) || (costingTypeId === VBCTypeId && getConfigurationKey().IsDestinationPlantConfigure) || (costingTypeId === CBCTypeId && getConfigurationKey().IsCBCApplicableOnPlant)) && (
                          <Col md="3">
                            <Field
                              name="Plant"
                              type="text"
                              label={costingTypeId === VBCTypeId ? 'Destination Plant (Code)' : 'Plant (Code)'}
                              component={searchableSelect}
                              placeholder={(isEditFlag || isViewMode || isViewFlag) ? '-' : 'Select'}
                              options={this.renderListing('plant')}
                              //onKeyUp={(e) => this.changeItemDesc(e)}
                              validate={(this.state.selectedPlants == null || this.state.selectedPlants.length === 0) ? [required] : []}
                              required={true}
                              handleChangeDescription={this.handlePlants}
                              valueDescription={this.state.selectedPlants}
                              disabled={(isEditFlag || isViewMode || isViewFlag) ? (IsCopied ? false : true) : this.state.isViewFlag ? true : false}
                            />
                          </Col>)}
                        {getConfigurationKey().IsSourceExchangeRateNameVisible && (
                          <Col md="3">
                            <Field
                              label="Exchange Rate Source"
                              name="ExchangeSource"
                              placeholder="Select"
                              options={this.renderListing("ExchangeSource")}
                              handleChangeDescription={this.handleExchangeRateSource}
                              component={searchableSelect}
                              className="multiselect-with-border"
                              valueDescription={this?.state?.ExchangeSource}
                              disabled={isEditFlag || isViewMode || isViewFlag}
                            />
                          </Col>
                        )}
                        {costingTypeId === CBCTypeId && (
                          <Col md="3">
                            <Field
                              name="clientName"
                              id="AddMachineRate_customerName"
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
                              disabled={(isEditFlag || isViewMode || isViewFlag) ? true : false}
                            />
                          </Col>
                        )}

                        <Col md="3">
                          <Field
                            label={`Machine No.`}
                            name={"MachineNumber"}
                            type="text"
                            placeholder={isEditFlag ? '-' : 'Enter'}
                            validate={initialConfiguration?.IsAutoGeneratedMachineNumber ? [] : [required, checkSpacesInString]}
                            component={renderText}
                            required={initialConfiguration?.IsAutoGeneratedMachineNumber ? false : true}
                            onBlur={initialConfiguration?.IsAutoGeneratedMachineNumber ? this.checkUniqNumber : () => { }}
                            disabled={(isEditFlag || initialConfiguration?.IsAutoGeneratedMachineNumber) ? true : this.state.isViewFlag ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>

                        <Col md="3">
                          <Field
                            label={`Machine Specification`}
                            name={"Specification"}
                            type="text"
                            placeholder={isViewMode ? '-' : 'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation]}
                            component={renderText}
                            // required={true}
                            onChange={this.handleMachineSpecification}
                            disabled={(isViewMode || (isEditFlag && IsDetailedEntry)) ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>

                        <Col md="3">
                          <Field
                            label={`Machine Name`}
                            name={"MachineName"}
                            type="text"
                            placeholder={isViewMode ? '-' : 'Enter'}
                            validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, checkSpacesInString, hashValidation]}
                            component={renderText}
                            required={false}
                            disabled={(isViewMode || (isEditFlag && IsDetailedEntry)) ? true : false}
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
                                placeholder={isEditFlag ? '-' : 'Select'}
                                options={this.renderListing('MachineTypeList')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                validate={(this.state.machineType == null || this.state.machineType.length === 0) ? [] : []}
                                required={false}
                                handleChangeDescription={this.handleMachineType}
                                valueDescription={this.state.machineType}
                                disabled={(disableMachineType || isViewMode || (isEditFlag && IsDetailedEntry))}
                              />
                            </div>
                          </div>
                        </Col>
                        <Col md="3">
                          <Field
                            label={`Machine Tonnage (Ton)`}
                            name={"TonnageCapacity"}
                            type="text"
                            placeholder={isViewMode ? '-' : 'Enter'}
                            validate={[checkWhiteSpaces, postiveNumber, maxLength10, checkSpacesInString, hashValidation]}
                            component={renderText}
                            required={false}
                            disabled={(isViewMode || (isEditFlag && IsDetailedEntry)) ? true : false}
                            className=" "
                            customClassName="withBorder"
                          />
                        </Col>
                        <Col Col md="3" className='p-relative'>
                          {this.props.fieldsObj?.plantCurrency && !this.state.hidePlantCurrency && !this.state.isImport && <TooltipCustom width="350px" id="plantCurrency" tooltipText={`Exchange Rate: 1 ${this.props.fieldsObj?.plantCurrency} = ${this.state?.plantCurrency ?? '-'} ${reactLocalStorage.getObject("baseCurrency")}`} />}
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

                        {this.state?.isImport && <Col md="3">
                          <TooltipCustom id="currency" width="350px" tooltipText={this.getTooltipTextForCurrency()} />
                          <Field
                            name="Currency"
                            type="text"
                            label="Currency"
                            id="currency"
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
                            disabled={isEditFlag ? true : false || isViewMode || isViewFlag}
                            customClassName="mb-1"
                          >
                            {this.state?.currency?.label && this.state?.showWarning && <WarningMessage dClass="mt-1" message={`${this.state?.currency?.label} rate is not present in the Exchange Master`} />}
                          </Field>
                        </Col>}
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
                                autoComplete={'off'}
                                minDate={isEditFlag ? this.state.minEffectiveDate : getEffectiveDateMinDate()}
                                maxDate={getEffectiveDateMaxDate()}

                                required={true}
                                changeHandler={(e) => {
                                  //e.preventDefault()
                                }}
                                component={renderDatePicker}
                                placeholder={isViewMode || !this.state.IsFinancialDataChanged ? '-' : "Enter"}
                                className="form-control"
                                disabled={isViewMode || !this.state.IsFinancialDataChanged || (isEditFlag && IsDetailedEntry) || this.state.disableEffectiveDate}
                              />
                            </div>

                          </div>
                        </Col>

                        {(costingTypeId === ZBCTypeId || getConfigurationKey().IsShowDetailMachineForAll) &&
                          <Col md="12">
                            <div>
                              {
                                this.state.IsDetailedEntry ?

                                  EditAccessibility &&
                                  <button
                                    type="button"
                                    className={'user-btn'}
                                    onClick={() => this.moreDetailsToggler(this.state.MachineID, true)}>
                                    <div className={`${isViewMode ? 'fa fa-eye' : 'edit_pencil_icon'}  d-inline-block mr5`}></div> {isViewMode ? "View" : "Edit"} MORE MACHINE DETAILS</button>
                                  :
                                  AddAccessibility && !isEditFlag &&
                                  <button id="addMoreMachine_Details"
                                    type="button"
                                    className={this.state.isViewFlag ? 'disabled-button user-btn' : 'user-btn'}
                                    disabled={this.state.isViewFlag || (isEditFlag && !IsDetailedEntry) ? true : false}
                                    onClick={() => this.moreDetailsToggler(isEditFlag ? this.state.MachineID : '', isEditFlag ? true : false)}>
                                    <div className={'plus'}></div>ADD MORE MACHINE DETAILS</button>
                              }

                            </div>
                          </Col>}
                        <Col md="12"><hr /></Col>
                      </Row>

                      <Row className='child-form-container'>
                        <Col md="12" className='d-flex align-items-center'>
                          <HeaderTitle
                            title={'Process:'}
                            customClass={'Personal-Details'} />
                          {/* <TourWrapper
                            buttonSpecificProp={{ id: "addMachineRate_Process" }}
                            stepsSpecificProp={{
                              steps: Steps(t).ADD_MACHINERATE_MORE_PROCESS
                            }} /> */}
                        </Col>
                        <Col md="3">
                          <div className="d-flex justify-space-between align-items-center inputwith-icon">
                            <div className="fullinput-icon">
                              <Field
                                name="ProcessName"
                                type="text"
                                label="Process (Code)"
                                component={searchableSelect}
                                placeholder={isEditFlag ? '-' : 'Select'}
                                options={this.renderListing('ProcessNameList')}
                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                required={true}
                                validate={[acceptAllExceptSingleSpecialCharacter, checkWhiteSpaces, maxLength80, hashValidation]}
                                handleChangeDescription={this.handleProcessName}
                                valueDescription={this.state.processName}
                                disabled={isViewMode || (isEditFlag && isMachineAssociated) || (isEditFlag && IsDetailedEntry)}
                              />
                              {this.state.errorObj?.processName && (this.state.processName && this.state.processName?.length === 0) && <div className='text-help p-absolute bottom-7'>This field is required.</div>}
                            </div>
                            <div id="Add_Machine_Process"
                              onClick={this.processToggler}
                              className={`${isViewMode ? 'disabled' : ''} plus-icon-square mr5 right`}>
                            </div>
                          </div >
                        </Col >
                        <Col md="3" className='p-relative'>
                          <Field
                            name="UOM"
                            type="text"
                            label="UOM"
                            component={searchableSelect}
                            placeholder={isEditFlag || lockUOMAndRate || (isEditFlag && isMachineAssociated) ? '-' : 'Select'}
                            options={this.renderListing('UOM')}
                            //onKeyUp={(e) => this.changeItemDesc(e)}
                            required={true}
                            handleChangeDescription={this.handleUOM}
                            valueDescription={this.state?.UOM}
                            disabled={isViewMode || lockUOMAndRate || (isEditFlag && isMachineAssociated)}
                          />
                          {this.state.errorObj.processUOM && (this.state?.UOM === undefined) && <div className='text-help p-absolute'>This field is required.</div>}
                        </Col>
                        <Col md="3" className='UOM-label-container p-relative'>
                          <Field
                            label={this.DisplayMachineRateDynamicLabel()}
                            name={"MachineRate"}
                            type="text"
                            placeholder={isViewMode || lockUOMAndRate || (isEditFlag && isMachineAssociated) ? '-' : 'Enter'}
                            validate={[number, maxLength10, decimalLengthsix, hashValidation]}
                            component={renderText}
                            onChange={this.handleMachineRate}
                            required={true}
                            disabled={isViewMode || lockUOMAndRate || (isEditFlag && isMachineAssociated) || (isEditFlag && IsDetailedEntry)}
                            className=" "
                            customClassName=" withBorder"
                          />
                          {this.state.errorObj.machineRate && (this.props.fieldsObj.MachineRate === undefined || Number(this.props.fieldsObj.MachineRate) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                        </Col>
                        {(this?.state?.isImport && !this?.state?.hidePlantCurrency) && <Col md="3" className='UOM-label-container p-relative'>
                          <TooltipCustom disabledIcon={true} width="350px" id="machine-rate-plant" tooltipText={this.machineRateTitle()?.tooltipTextPlantCurrency} />
                          <Field
                            label={this.DisplayMachineRatePlantCurrencyLabel()}
                            name={"MachineRateLocalConversion"}
                            id="machine-rate-plant"
                            type="text"
                            placeholder={isViewMode || lockUOMAndRate || (isEditFlag && isMachineAssociated) ? '-' : 'Enter'}
                            validate={[]}
                            component={renderText}
                            onChange={() => { }}
                            disabled={true}
                            className=" "
                            customClassName=" withBorder"
                          />
                          {this.state?.errorObj?.MachineRateLocalConversion && (this.props?.fieldsObj?.MachineRateLocalConversion === undefined || Number(this.props?.fieldsObj?.MachineRateLocalConversion) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                        </Col>}

                        {(!(!this?.state?.isImport && this?.state?.hidePlantCurrency)) && <Col md="3" >
                          <TooltipCustom disabledIcon={true} width="350px" id="machine-rate" tooltipText={this?.state?.isImport ? this.machineRateTitle()?.toolTipTextNetCostBaseCurrency : this.machineRateTitle()?.tooltipTextPlantCurrency} />
                          <Field
                            label={this.DisplayMachineRateBaseCurrencyLabel()}
                            name={"MachineRateConversion"}
                            id="machine-rate"
                            type="text"
                            placeholder={isViewMode || lockUOMAndRate || (isEditFlag && isMachineAssociated) ? '-' : 'Enter'}
                            component={renderText}
                            validate={[]}
                            onChange={() => { }}
                            disabled={true}
                            className=" "
                            customClassName=" withBorder"
                          />
                          {this.state?.errorObj?.MachineRateConversion && (this.props?.fieldsObj?.MachineRateConversion === undefined || Number(this.props?.fieldsObj?.MachineRateConversion) === 0) && <div className='text-help p-absolute'>This field is required.</div>}
                        </Col>}
                        <Col md="3" className='mb-3 d-flex align-items-center'>
                          <div>
                            {this.state.isEditIndex ?
                              <>
                                <button
                                  disabled={isViewMode || (isEditFlag && isMachineAssociated) || (isEditFlag && IsDetailedEntry)}
                                  type="button"
                                  className={'btn btn-primary pull-left mr5'}
                                  onClick={this.updateProcessGrid}
                                >Update</button>

                                <button
                                  type={'button'}
                                  disabled={isViewMode || (isEditFlag && isMachineAssociated) || (isEditFlag && IsDetailedEntry)}
                                  className="reset-btn "
                                  onClick={this.resetProcessGridData}>{'Cancel'}
                                </button>
                              </>
                              :
                              // !this.state.IsDetailedEntry &&
                              <>
                                <button id="AddMachineRate_addmore"
                                  type="button"
                                  className={`${isViewFlag ? 'disabled-button user-btn' : 'user-btn'} pull-left mr15`}
                                  disabled={(this.state.isViewFlag || (isEditFlag && isMachineAssociated) || isViewMode || (isEditFlag && IsDetailedEntry)) ? true : false}
                                  onClick={this.processTableHandler}>
                                  <div className={'plus'}></div>ADD</button>
                                <button
                                  type="button"
                                  id="AddMachineRate_reset"
                                  disabled={isViewMode || (isEditFlag && isMachineAssociated) || (isEditFlag && IsDetailedEntry)}
                                  className={`${isViewFlag ? 'disabled-button reset-btn' : 'reset-btn'} pull-left`}
                                  onClick={this.resetProcessGridData}
                                >Reset</button>
                              </>
                            }
                          </div>
                        </Col>
                        <Col md="12">
                          <Table className="table border mt-3" size="sm" >
                            <thead>
                              <tr>
                                <th>{`Process (Code)`}</th>
                                <th>{`UOM`}</th>
                                <th>{`Machine Rate (${this.state.isImport && this.state.currency?.label !== undefined ? this.state.currency.label : this.state.isImport ? "Currency" : this.props.fieldsObj.plantCurrency ? this.props.fieldsObj.plantCurrency : "Currency"})`}</th>
                                {(this?.state?.isImport && !this?.state?.hidePlantCurrency) && <th>{`Machine Rate (${this.props.fieldsObj.plantCurrency ? this.props.fieldsObj.plantCurrency : "Currency"})`}</th>}
                                {(!(!this?.state?.isImport && reactLocalStorage.getObject("baseCurrency") === this.props.fieldsObj.plantCurrency)) && <th>{`Machine Rate (${reactLocalStorage.getObject("baseCurrency")})`}</th>}
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
                                      <td>{checkForDecimalAndNull(item.MachineRate, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                      {(this?.state?.isImport && !this?.state?.hidePlantCurrency) && <td>{checkForDecimalAndNull(item?.MachineRateLocalConversion, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                                      {(!(!this?.state?.isImport && reactLocalStorage.getObject("baseCurrency") === this.props?.fieldsObj?.plantCurrency)) && <td>{checkForDecimalAndNull(item?.MachineRateConversion, initialConfiguration?.NoOfDecimalForPrice)}</td>}

                                      <td>
                                        {/* {!this.state.IsDetailedEntry && */}
                                        <>
                                          <button title='Edit' className="Edit mr-2" type={'button'} disabled={(isViewFlag === true || this.state.IsDetailedEntry === true || isViewMode === true || (isEditFlag && isMachineAssociated) || (UniqueProcessId.includes(item.ProcessId))) ? true : false} onClick={() => this.editItemDetails(index)} />
                                          <button title='Delete' className="Delete" type={'button'} disabled={(isViewFlag === true || this.state.IsDetailedEntry === true || isViewMode === true || (isEditFlag && isMachineAssociated) || (UniqueProcessId.includes(item.ProcessId))) ? true : false} onClick={() => this.deleteItem(index)} />
                                        </>
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
                      </Row >
                      {
                        this.state.isProcessGroup &&
                        <Row>
                          <Col md="12" className='mt-2'>
                            <HeaderTitle
                              title={'Process Group:'} />
                          </Col>
                          <Col md="12">
                            <ProcessGroup isEditFlag={isEditFlag} processListing={this.state.processGrid} isListing={false} isViewFlag={isViewMode || (isEditFlag && IsDetailedEntry)} changeDropdownValue={this.changeDropdownValue} showDelete={this.showDelete} rowData={this.state.rowData} setRowData={this.setRowdata} checksFinancialDataChanged={this.checksFinancialDataChanged} />
                          </Col>
                        </Row>
                      }

                      < Row >
                        <Col md="12" >
                          <div className="header-title">
                            <h5>{'Remarks & Attachments:'}</h5>
                          </div>
                        </Col>
                        <Col md="6">
                          <Field
                            label={'Remarks'}
                            name={`Remark`}
                            placeholder={isViewMode ? '-' : "Type here..."}
                            value={this.state.remarks}
                            className=""
                            customClassName=" textAreaWithBorder"
                            onChange={this.handleMessageChange}
                            validate={[maxLength512, acceptAllExceptSingleSpecialCharacter]}
                            //required={true}
                            component={renderTextAreaField}
                            rows="6"
                            disabled={this.state.isViewFlag || (isEditFlag && IsDetailedEntry) ? true : isViewMode}
                          />
                        </Col>
                        <Col md="3">
                          <label>Upload Files (upload up to {getConfigurationKey().MaxMasterFilesToUpload} files) <AttachmentValidationInfo /></label>
                          <div className={`alert alert-danger mt-2 ${this.state.files?.length === getConfigurationKey().MaxMasterFilesToUpload ? '' : 'd-none'}`} role="alert">
                            Maximum file upload limit reached.
                          </div>
                          <div id="AddMachineRate_UploadFiles" className={`${this.state.files?.length >= getConfigurationKey().MaxMasterFilesToUpload ? 'd-none' : ''}`}>
                            <Dropzone
                              ref={this.dropzone}
                              onChangeStatus={this.handleChangeStatus}
                              PreviewComponent={this.Preview}
                              accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                              initialFiles={this.state.initialFiles}
                              maxFiles={getConfigurationKey().MaxMasterFilesToUpload}
                              maxSizeBytes={2000000}
                              disabled={this.state.isViewFlag || (isEditFlag && IsDetailedEntry) ? true : isViewMode}
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

                                    {!isViewMode && <img className="float-right" alt={''} onClick={() => this.deleteFile(f.FileId, f.FileName)} src={attachClose}></img>}
                                  </div>
                                )
                              })
                            }
                          </div>
                        </Col>
                      </Row >
                    </div >
                    {!this.props.data.isCostingDrawer && <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                      <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                        {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={'This user is not in the approval cycle'} />}
                        {
                          !isViewFlag ?
                            <>
                              <button id="AddMachineRate_Cancel"
                                type={'button'}
                                className=" mr15 cancel-btn"
                                onClick={this.cancelHandler}
                                disabled={setDisable}
                              >
                                <div className={"cancel-icon"}></div> {'Cancel'}
                              </button>
                              {!isViewMode && <>

                                {!(userDetails().Role === 'SuperAdmin') && ((!isViewMode && (CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !this.state.isFinalApprovar) && initialConfiguration?.IsMasterApprovalAppliedConfigure) || (initialConfiguration?.IsMasterApprovalAppliedConfigure && CheckApprovalApplicableMaster(MACHINE_MASTER_ID) === true && !CostingTypePermission)) ?
                                  <button id="AddMachineRate_SendForApproval" type="submit"
                                    class="user-btn approval-btn save-btn mr5"
                                    disabled={isViewMode || setDisable || disableSendForApproval || (isEditFlag && IsDetailedEntry)}
                                  >
                                    <div className="send-for-approval"></div>
                                    {'Send For Approval'}
                                  </button>
                                  :

                                  <button
                                    id="AddMachineRate_Save"
                                    type="submit"
                                    className="user-btn mr5 save-btn"
                                    disabled={isViewMode || setDisable || disableSendForApproval}
                                  >
                                    <div className={"save-icon"}></div>
                                    {isEditFlag ? "Update" : "Save"}
                                  </button>
                                }
                              </>}



                            </>
                            :
                            <button
                              type="submit"
                              className="submit-button mr5 save-btn"
                              disabled={setDisable}
                            >
                              <div className={'save-icon'}></div>
                              {'Exit'}
                              {/* Need to change name of button for view flag */}
                            </button>
                        }
                      </div>

                    </Row>}
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
          isOpenProcessDrawer && <AddProcessDrawer
            isOpen={isOpenProcessDrawer}
            closeDrawer={this.closeProcessDrawer}
            isEditFlag={false}
            isMachineShow={false}
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
              detailEntry={false}
              type={'Sender'}
              anchor={"right"}
              approvalObj={this.state.approvalObj}
              isBulkUpload={false}
              IsImportEntry={false}
              costingTypeId={this.state.costingTypeId}
              levelDetails={this.state.levelDetails}
              commonFunction={this.finalUserCheckAndMasterLevelCheckFunction}
              handleOperation={this.handleMachineOperation}
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
  const { comman, machine, auth, costing, client, supplier } = state;
  const fieldsObj = selector(state, 'MachineNumber', 'MachineName', 'TonnageCapacity', 'MachineRate', 'Description', 'EffectiveDate', 'Specification', 'vendorName', "plantCurrency", "currency", "MachineRateConversion", "MachineRateLocalConversion", "ExchangeSource", "MachineType");
  const { plantList, plantSelectList, filterPlantList, UOMSelectList, exchangeRateSourceList, currencySelectList } = comman;
  const { machineTypeSelectList, processSelectList, machineData, loading, processGroupApiData } = machine;
  const { initialConfiguration, userMasterLevelAPI } = auth;
  const { costingSpecifiTechnology } = costing
  const { clientSelectList } = client;
  const { vendorWithVendorCodeSelectList } = supplier;

  let initialValues = {};

  if (machineData && machineData !== undefined) {
    initialValues = {
      MachineNumber: machineData.MachineNumber,
      MachineName: machineData.MachineName,
      TonnageCapacity: machineData.TonnageCapacity,
      Specification: machineData.Specification,
      Remark: machineData.Remark,
    }
  }

  return {
    plantList, plantSelectList, filterPlantList, UOMSelectList,
    machineTypeSelectList, processSelectList, vendorWithVendorCodeSelectList, clientSelectList, fieldsObj, machineData, initialValues, loading, initialConfiguration, processGroupApiData, costingSpecifiTechnology, userMasterLevelAPI, exchangeRateSourceList, currencySelectList
  }

}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
  dirty: isDirty('AddMachineRate'),
  getPlantSelectListByType,
  getPlantBySupplier,
  getUOMSelectList,
  getMachineTypeSelectList,
  getProcessesSelectList,
  fileUploadMachine,
  checkAndGetMachineNumber,
  createMachine,
  updateMachine,
  updateMachineDetails,
  checkFinalUser,
  getMachineData,
  getProcessGroupByMachineId,
  setGroupProcessList,
  setProcessList,
  getCostingSpecificTechnology,
  getClientSelectList,
  getUsersMasterLevelAPI,
  getVendorNameByVendorSelectList,
  getPlantUnitAPI,
  getExchangeRateSource,
  getExchangeRateByCurrency,
  getCurrencySelectList,
})(reduxForm({
  form: 'AddMachineRate',
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true,
  onSubmitFail: errors => {
    focusOnError(errors);
  },
})(withTranslation(['MachineMaster', 'MasterLabels'])(AddMachineRate)),
)
