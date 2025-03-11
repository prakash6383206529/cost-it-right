import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import OperationCost from './OperationCost';
import { TextFieldHookForm, TextAreaHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs';
import AddProcess from '../../Drawers/AddProcess';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { APPLICABILITY_OVERHEAD, APPLICABILITY_OVERHEAD_EXCL, APPLICABILITY_OVERHEAD_PROFIT, APPLICABILITY_PROFIT, APPLICABILITY_PROFIT_EXCL, ApplicabilityTypes, CRMHeads, DISPLAY_HOURS, DISPLAY_MICROSECONDS, DISPLAY_MILISECONDS, DISPLAY_MINUTES, DISPLAY_SECONDS, EMPTY_DATA, EMPTY_GUID, HOUR, MASS, MICROSECONDS, MILLISECONDS, MINUTES, SECONDS, TIME, defaultPageSize } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import VariableMhrDrawer from '../../Drawers/processCalculatorDrawer/VariableMhrDrawer'
import { getProcessMachiningCalculation, getProcessDefaultCalculation } from '../../../actions/CostWorking';
import { gridDataAdded, isDataChange, setIdsOfProcess, setIdsOfProcessGroup, setIsToolCostUsed, setProcessGroupGrid, setRMCCErrors, setSelectedDataOfCheckBox } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import Popup from 'reactjs-popup';
import OperationCostExcludedOverhead from './OperationCostExcludedOverhead';
import { MACHINING, REMARKMAXLENGTH, } from '../../../../../config/masterData'
import { findProcessCost, findProductionPerHour, swappingLogicCommon } from '../../../CostingUtil';
import { debounce } from 'lodash';
import TooltipCustom from '../../../../common/Tooltip';
import { number, decimalNumberLimit6, checkWhiteSpaces, noDecimal, numberLimit6 } from "../../../../../helper/validation";
import Button from '../../../../layout/Button';
import TourWrapper from '../../../../common/Tour/TourWrapper';
import { Steps } from '../../TourMessages';
import { useTranslation } from 'react-i18next';
import ViewDetailedForms from '../../Drawers/ViewDetailedForms';

let counter = 0;
function ProcessCost(props) {
  const { data, item, isAssemblyTechnology } = props
  const IsLocked = (item?.IsLocked ? item?.IsLocked : false) || (item?.IsPartLocked ? item?.IsPartLocked : false)
  const processGroup = getConfigurationKey().IsMachineProcessGroup
  // const processGroup = false
  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [gridData, setGridData] = useState(data && data?.CostingProcessCostResponse ? data && data?.CostingProcessCostResponse : [])
  const trimValue = getConfigurationKey()
  const trimForCost = trimValue.NoOfDecimalForPrice
  const [calciIndex, setCalciIndex] = useState('')
  const [parentCalciIndex, setParentCalciIndex] = useState('')
  const [listData, setListData] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [Ids, setIds] = useState([])
  const [MachineIds, setMachineIds] = useState([])
  const [tabData, setTabData] = useState(props.data)
  console.log("tabData",tabData)
  const [isCalculator, setIsCalculator] = useState(false)
  const [processAccObj, setProcessAccObj] = useState({});
  const [calculatorTechnology, setCalculatorTechnology] = useState('')
  const [calculatorData, setCalculatorDatas] = useState({})
  const [isFromApi, setIsFromApi] = useState(true)
  const [singleProcessRemark, setSingleProcessRemark] = useState(true)
  const [groupProcessRemark, setGroupProcessRemark] = useState(true)
  const [headerPinned, setHeaderPinned] = useState(true)
  const [groupNameMachine, setGroupNameMachine] = useState('')
  const [groupNameIndex, setGroupNameIndex] = useState('')
  const [tableUpdate, setTableUpdate] = useState(true)
  const [isProcessSequenceChanged, setIsProcessSequenceChanged] = useState(false)
  const dispatch = useDispatch()
  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, selectedProcessId, selectedProcessGroupId, processGroupGrid, ErrorObjRMCC, currencySource, exchangeRateData } = useSelector(state => state.costing)
  const { rmFinishWeight, rmGrossWeight } = props
  const [openMachineForm, setOpenMachineForm] = useState(false)

  let dragEnd;
  const [tourState, setTourState] = useState(
    { step: [] }
  )
  const { t } = useTranslation("Costing")
  const formatMainArr = (arr) => {
    let apiArr = []
    arr && arr.map((item) => {
      if (item.GroupName === '' || item.GroupName === null) {
        apiArr.push(item)
      } else if (item?.IsChild) {                 //  THIS CONDITION STOP MULTIPLE TIMES ADDING SAME CHILD AS PARENT AT TIME OF OPENING-CLOSING ACCORDION
        return false
      } else {
        apiArr.push(item)
        item.ProcessList && item.ProcessList.map(processItem => {
          processItem.GroupName = item.GroupName
          processItem.IsChild = true              // IsChild KEY ADDED TO IDENTIFY CHILD-PARENT OBJECT
          apiArr.push(processItem)
          return null
        })
      }
      return null
    })
    return apiArr
  }

  /**
   *
   * @param {*} arr

  useEffect(() => {
    setTimeout(() => {
      data?.CostingProcessCostResponse && data?.CostingProcessCostResponse.map((item, index) => {
        setValue(`${ProcessGridFields}.${index}.Quantity`, item.Quantity)
        setValue(`${ProcessGridFields}.${index}.ProcessCost`, item.ProcessCost)
      })

    }, 500);

  }, [])
  let dragEnd;

  const formatMainArr = (arr) => {
    let apiArr = []
    arr && arr.map((item) => {
      if (item.GroupName === '' || item.GroupName === null) {
        apiArr.push(item)
      } else if (item?.IsChild) {                 //  THIS CONDITION STOP MULTIPLE TIMES ADDING SAME CHILD AS PARENT AT TIME OF OPENING-CLOSING ACCORDION
        return false
      } else {
        apiArr.push(item)
        item.ProcessList && item.ProcessList.map(processItem => {
          processItem.GroupName = item.GroupName
          processItem.IsChild = true              // IsChild KEY ADDED TO IDENTIFY CHILD-PARENT OBJECT
          apiArr.push(processItem)
          return null
        })
      }
      return null
    })
    return apiArr
  }

  /**
   * 
   * @param {*} arr 
   * @returns ARRAY HAVING ONLY PARENT OBJECT | USED TO SET REDUCER EVERY TIME
   */
  const formatReducerArray = (arr) => {
    let apiArr = []
    arr && arr.map((item) => {
      if (item?.IsChild) {
        return false
      } else {
        apiArr.push(item)
      }
      return null
    })
    return apiArr
  }

  // ****************** SPECIFICALLY WHEN ACCORDION IS OPENED WITHOUT API CALL ******************
  useEffect(() => {
    dispatch(setProcessGroupGrid(formatReducerArray(data && data.CostingProcessCostResponse)))
  }, [data && data.CostingProcessCostResponse])

  useEffect(() => {
    const Params = {
      index: props.index,
      BOMLevel: props?.item?.BOMLevel,
      PartNumber: props?.item?.PartNumber,
    }
    if (!CostingViewMode && !IsLocked) {
      selectedIds(gridData)
      if (JSON.stringify(gridData) !== JSON.stringify(data && data.CostingProcessCostResponse)) {
        dispatch(isDataChange(true))
      }
      if (isFromApi && tabData) {
        let apiArr = formatMainArr(tabData && tabData?.CostingProcessCostResponse)
        tabData.CostingProcessCostResponse = apiArr
      }

      if ((JSON.stringify(tabData) !== JSON.stringify(props.data)) || isProcessSequenceChanged) {
        if (isAssemblyTechnology) {
          props.getValuesOfProcess(tabData, tabData?.ProcessCostTotal)
        } else {
          props.setConversionCost(tabData, Params, item)
        }
      }
    }
  }, [tabData]);



  const setCalculatorData = (data, list, id, parentId) => {
    if (parentId === '') {
      let tempArr = []
      let tempData = gridData[id]
      setCalculatorTechnology(tempData.ProcessTechnologyId)
      tempData = { ...tempData, WeightCalculatorRequest: data, }
      setCalculatorDatas(tempData)
      tempArr = Object.assign([...gridData], { [id]: tempData })
      setTimeout(() => {
        setGridData(tempArr)
        dispatch(setProcessGroupGrid(formatReducerArray(tempArr)))
        setIsCalculator(true)
      }, 100)
    } else {
      let parentTempArr = []
      let parentTempData = gridData[parentId]
      let tempArr = []
      let tempData = list[id]

      setCalculatorTechnology(tempData.ProcessTechnologyId)
      tempData = { ...tempData, WeightCalculatorRequest: data, }
      setCalculatorDatas(tempData)
      tempArr = Object.assign([...list], { [id]: tempData })
      parentTempData = { ...parentTempData, ProcessList: tempArr }
      parentTempArr = Object.assign([...gridData], { [parentId]: parentTempData })

      setTimeout(() => {
        setGridData(parentTempArr)
        dispatch(setProcessGroupGrid(formatReducerArray(parentTempArr)))
        setIsCalculator(true)
      }, 100);
    }
  }

  /**
   * @method toggleWeightCalculator
   * @description For opening weight calculator
  */
  const toggleWeightCalculator = debounce((id, list = [], parentIndex = '') => {
    setCalciIndex(id)
    setParentCalciIndex(parentIndex)
    setListData(list)
    let tempData
    if (parentIndex === '') {
      tempData = gridData[id]
    } else {
      tempData = list[id]
    }
    // const calciData = list[id]
    /****************************FOR GETING CALCULATED VALUE IN CALCULATOR**************************/
    //WAS COMMENTED ON MINDA
    if (tempData.ProcessTechnologyId === MACHINING && tempData.UOMType === TIME) {
      //getProcessDefaultCalculation
      dispatch(getProcessMachiningCalculation(tempData.ProcessCalculatorId, res => {

        if ((res && res.data && res.data.Data) || (res && res.status === 204)) {
          const data = res.status === 204 ? {} : res.data.Data
          setCalculatorData(data, list, id, parentIndex)
        }
      }))

    } else {
      dispatch(getProcessDefaultCalculation(tempData.ProcessCalculatorId, res => {

        if ((res && res.data && res.data.Data) || (res && res.status === 204)) {
          const data = res.status === 204 ? {} : res.data.Data
          setCalculatorData(data, list, id, parentIndex)
        }
      }))
    }

    dispatch(getProcessDefaultCalculation(tempData.ProcessCalculatorId, res => {
      if ((res && res.data && res.data.Data) || (res && res.status === 204)) {
        const data = res.status === 204 ? {} : res.data.Data
        setCalculatorData(data, list, id, parentIndex)
      }
    }))
    // setCalculatorData(calciData)
  }, 500);

  const closeCalculatorDrawer = (e, value, weightData = {}) => {

    setIsCalculator(false)
    if (Object.keys(weightData).length === 0) return false;
    if (parentCalciIndex === '') {
      let tempData = gridData[calciIndex]
      let tempArray
      let tempArr2 = [];
      tempData = {
        ...tempData,
        Quantity: tempData.UOMType === TIME ? checkForNull(weightData.CycleTime) : weightData.Quantity,
        ProductionPerHour: tempData.UOMType === TIME ? checkForNull(weightData.PartPerHour) : '',
        ProcessCost: weightData.ProcessCost,
        IsCalculatedEntry: true,
        ProcessCalculationId: EMPTY_GUID,
        ProcessCalculatorId: weightData.ProcessCalculationId,
        WeightCalculatorRequest: weightData
      }
      tempArray = Object.assign([...gridData], { [calciIndex]: tempData })
      let ProcessCostTotal = 0
      ProcessCostTotal = tempArray && tempArray.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)
      let apiArr = formatMainArr(tempArray)
      tempArr2 = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }
      setTimeout(() => {
        setIsFromApi(false)
        setTabData(tempArr2)
        setGridData(tempArray)
        dispatch(setProcessGroupGrid(formatReducerArray(tempArray)))
        setValue(`${ProcessGridFields}.${calciIndex}.Quantity`, tempData.UOMType === TIME ? checkForNull(weightData.CycleTime) : weightData.Quantity)
        setValue(`${ProcessGridFields}.${calciIndex}.ProcessCost`, checkForDecimalAndNull(weightData.ProcessCost, getConfigurationKey().NoOfDecimalForPrice))
        // setValue(`${ProcessGridFields}.${calciIndex}.ProductionPerHour`, weightData.UOMType === TIME ? checkForDecimalAndNull(weightData.PartsPerHour, getConfigurationKey().NoOfDecimalForInputOutput) : '-')
      }, 100)
    } else {
      // PROCESS UNDER THE GROUP IS UPDATING
      let tempArr = []
      let processTempData = gridData[parentCalciIndex]
      let tempData = listData[calciIndex]
      tempData = {
        ...tempData,
        Quantity: tempData.UOMType === TIME ? checkForNull(weightData.CycleTime) : weightData.Quantity,
        ProductionPerHour: tempData.UOMType === TIME ? checkForNull(weightData.PartPerHour) : '',
        ProcessCost: weightData.ProcessCost,
        IsCalculatedEntry: true,
        ProcessCalculationId: EMPTY_GUID,
        ProcessCalculatorId: weightData.ProcessCalculationId,
        WeightCalculatorRequest: weightData
      }
      let gridTempArr = Object.assign([...listData], { [calciIndex]: tempData })


      setValue(`${SingleProcessGridField}.${calciIndex}${parentCalciIndex}${tempData.ProcessName}.Quantity`, tempData.UOMType === TIME ? checkForDecimalAndNull(weightData.CycleTime, getConfigurationKey().NoOfDecimalForInputOutput) : checkForDecimalAndNull(weightData.Quantity, getConfigurationKey().NoOfDecimalForInputOutput))
      setValue(`${SingleProcessGridField}.${calciIndex}.${parentCalciIndex}.ProcessCost`, checkForDecimalAndNull(weightData.ProcessCost, initialConfiguration?.NoOfDecimalForPrice))
      //MAIN PROCESS ROW WITH GROUP
      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)
      let totalQuantity = 0
      totalQuantity = gridTempArr && gridTempArr.reduce((accummlator, el) => {

        return accummlator + checkForNull(el.Quantity)
      }, 0)
      let ProductionPerHour = findProductionPerHour(totalQuantity)
      processTempData = {
        ...processTempData,
        Quantity: totalQuantity,
        ProductionPerHour: tempData.UOMType !== TIME ? '' : ProductionPerHour,
        ProcessCost: ProcessCostTotal,
        ProcessList: gridTempArr
      }
      let processTemparr = Object.assign([...gridData], { [parentCalciIndex]: processTempData })

      setValue(`${ProcessGridFields}.${parentCalciIndex}.Quantity`, checkForDecimalAndNull(totalQuantity, getConfigurationKey().NoOfDecimalForInputOutput))
      setValue(`${ProcessGridFields}.${parentCalciIndex}.ProcessCost`, checkForDecimalAndNull(ProcessCostTotal, initialConfiguration?.NoOfDecimalForPrice))

      let apiArr = []
      processTemparr && processTemparr.map((item) => {
        if (item.GroupName === '' || item.GroupName === null) {
          apiArr.push(item)
        } else {
          apiArr.push(item)
          item.ProcessList && item.ProcessList.map(processItem => {
            processItem.GroupName = item.GroupName
            apiArr.push(processItem)
            return null
          })
        }
        return null
      })

      let finalProcessCostTotal = processTemparr && processTemparr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)


      tempArr = {
        ...tabData,
        NetConversionCost: finalProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: finalProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }
      setIsFromApi(false)
      setTabData(tempArr)
      setGridData(processTemparr)

      dispatch(setProcessGroupGrid(formatReducerArray(processTemparr)))
    }
  }


  const onRemarkPopUpClick = (index) => {
    if (errors.ProcessGridFields && errors.ProcessGridFields[index]?.remarkPopUp !== undefined) {
      return false
    }
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      Remark: getValues(`${ProcessGridFields}.${index}.remarkPopUp`),
    }

    let gridTempArr = Object.assign([...gridData], { [index]: tempData })
    let apiArr = formatMainArr(gridTempArr)

    tempArr = {
      ...tabData,
      CostingProcessCostResponse: apiArr,
    }
    setIsFromApi(false)
    setTabData(tempArr)
    setGridData(gridTempArr)

    dispatch(setProcessGroupGrid(formatReducerArray(gridTempArr)))
    if (getValues(`${ProcessGridFields}.${index}.remarkPopUp`)) {
      Toaster.success('Remark saved successfully')
    }
    // setTabData(tempArr)
    var button = document.getElementById(`process_popUpTriggers${index}`)
    button.click()
  }

  const onRemarkPopUpClose = (index) => {
    var button = document.getElementById(`process_popUpTriggers${index}`)
    setValue(`${ProcessGridFields}.${index}.remarkPopUp`, gridData[index]?.Remark)
    if (errors && errors?.ProcessGridFields && errors.ProcessGridFields[index]?.remarkPopUp) {
      delete errors.ProcessGridFields[index].remarkPopUp;
      setSingleProcessRemark(false)
    }
    button.click()
  }

  const onRemarkPopUpClickGroup = (index, parentIndex, list) => {
    if (errors.SingleProcessGridField && errors.SingleProcessGridField[`${index}${parentIndex}`].remarkPopUp !== undefined) {
      return false
    }
    let tempArr = []
    let processTempData = gridData[parentIndex]
    let tempData = list[index]

    tempData = {
      ...tempData,
      Remark: getValues(`${SingleProcessGridField}.${index}${parentIndex}.remarkPopUp`),
    }
    let gridTempArr = Object.assign([...list], { [index]: tempData })


    processTempData = {
      ...processTempData,
      ProcessList: gridTempArr,
    }
    let processTemparr = Object.assign([...gridData], { [parentIndex]: processTempData })
    let apiArr = formatMainArr(processTemparr)
    tempArr = {
      ...tabData,
      CostingProcessCostResponse: apiArr,

    }
    setIsFromApi(false)
    setTabData(tempArr)
    setGridData(processTemparr)
    dispatch(setProcessGroupGrid(formatReducerArray(processTemparr)))

    if (getValues(`${SingleProcessGridField}.${index}.${parentIndex}.ProcessCost`)) {
      Toaster.success('Remark saved successfully')
    }
    let button = document.getElementById(`popUpTriggers${index}.${parentIndex}`)
    button.click()

  }

  const onRemarkPopUpCloseGroup = (index, parentIndex) => {
    let button = document.getElementById(`popUpTriggers${index}.${parentIndex}`)
    if (errors && errors.SingleProcessGridField && errors.SingleProcessGridField[`${index}${parentIndex}`].remarkPopUp) {
      delete errors.SingleProcessGridField[`${index}${parentIndex}`].remarkPopUp
      setGroupProcessRemark(false)
    }
    button.click()
  }

  useEffect(() => {
    dispatch(setIsToolCostUsed(data && data.IsShowToolCost))
  }, [data && data.IsShowToolCost])

  /**
   * @method DrawerToggle
   * @description TOGGLE DRAWER
   */
  const DrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = []) => {

    // TO CALCULATE SUM OF ALL PROCESS'S PROCESS COST OF A PARTICULAR GROUP
    const calculateRowProcessCost = (arr) => {
      let ProcessCostTotal = arr && arr.reduce((accummlator, el) => {
        return accummlator + el.ProcessCost
      }, 0)
      return ProcessCostTotal
    }
    // TO CALCULATE SUM OF ALL PROCESS'S QUANTITY OF A PARTICULAR GROUP
    const calculateRowQuantity = (arr) => {
      let quantityTotal = arr && arr.reduce((accummlator, el) => {
        return accummlator + el.Quantity
      }, 0)
      return quantityTotal
    }

    const productionPerHrs = (rowArray, UOMType, processQuantityMain) => {
      // IF GROUP NAME IS THERE ,THEN QUAMTITY WILL BE SUM OF THE QUANTITY OF PROCESSESS OF THAT GROUP,OTHERWISE MAIN QUANTITY
      return rowArray.length > 0 ? (UOMType !== TIME ? '' : (3600 / calculateRowQuantity(rowArray))) : (UOMType !== TIME ? '' : (3600 / processQuantityMain))
    }


    const setDataInGridAndApi = (tempArr) => {
      tempArr && tempArr.map((el, index) => {
        setValue(`${ProcessGridFields}.${index}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue(`${ProcessGridFields}.${index}.Quantity`, checkForDecimalAndNull(el.Quantity, getConfigurationKey().NoOfDecimalForInputOutput))
        return null
      })

      let ProcessCostTotal = 0
      ProcessCostTotal = tempArr && tempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      let apiArr = formatMainArr(tempArr)
      let ProcessCostTotalAssemblytechnology = 0
      ProcessCostTotalAssemblytechnology = apiArr && apiArr.reduce((accummlator, el) => {
        if (!(el?.IsChild === true)) {
          return checkForNull(accummlator) + checkForNull(el.ProcessCost)
        }
        return checkForNull(accummlator)
      }, 0)

      let tempArr2 = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData?.OperationCostTotal !== null ? tabData?.OperationCostTotal : 0,) + checkForNull(tabData?.OtherOperationCostTotal !== null ? tabData?.OtherOperationCostTotal : 0),
        ProcessCostTotal: isAssemblyTechnology ? ProcessCostTotalAssemblytechnology : ProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }
      setIsFromApi(false)
      setGridData(tempArr)
      dispatch(setProcessGroupGrid(formatReducerArray(tempArr)))
      setTabData(tempArr2)
      selectedIds(tempArr)
      dispatch(gridDataAdded(true))
      dispatch(setSelectedDataOfCheckBox([]))
    }

    if (groupNameIndex === '') {
      if (rowData.length > 0) {
        let rowArr = []
        rowArr = rowData && rowData.map((item) => {
          let processQuantityMain = 1
          if (item.UOMType === MASS) {
            processQuantityMain = rmFinishWeight ? rmFinishWeight : 1

          }
          // THIS IS FOR GROUP PROCESS
          let rowArray = item.ProcessList && item.ProcessList.map((el) => {

            let processQuantity = 1
            let productionPerHour = ''
            if (el.UOMType === MASS) {
              processQuantity = rmFinishWeight ? rmFinishWeight : 1
            }
            productionPerHour = el.UOMType !== TIME ? '-' : findProductionPerHour(processQuantity)
            return {
              ProcessId: el.ProcessId,
              ProcessDetailId: '',
              MachineId: el.MachineId,
              MachineRateId: el.MachineRateId,
              MHR: el.MachineRate,
              ProcessName: el.ProcessName,
              ProcessDescription: el.Description,
              MachineName: el.MachineName,
              UOM: el.UOM,
              UnitOfMeasurementId: el.UnitOfMeasurementId,
              Tonnage: el.Tonnage,
              Quantity: processQuantity,
              ProcessCost: el.UOMType !== TIME ? el.MachineRate * processQuantity : findProcessCost(el.UOM, el.MachineRate, productionPerHour),
              UOMType: el.UOMType,
              UOMTypeId: el.UnitTypeId,
              ProductionPerHour: productionPerHour,
              ProcessTechnologyId: el.ProcessTechnologyId,
              Technologies: el.Technologies,
              ConvertedExchangeRateId: el.ConvertedExchangeRateId === EMPTY_GUID ? null : el.ConvertedExchangeRateId,
              CurrencyExchangeRate: el.CurrencyExchangeRate
            }
          })
          return {
            GroupName: item.GroupName,
            ProcessId: item.ProcessId ? item.ProcessId : '',
            ProcessDetailId: '',
            MachineId: item.MachineId,
            MachineRateId: item.MachineRateId,
            MHR: item.MachineRate,
            ProcessName: item.ProcessName,
            ProcessDescription: item.Description,
            MachineName: item.MachineName,
            UOM: item.UOM,
            UnitOfMeasurementId: item.UnitOfMeasurementId,
            Tonnage: item.Tonnage,
            Quantity: rowArray.length > 0 ? calculateRowQuantity(rowArray) : processQuantityMain,
            // HERE IF GROUP NAME IS THERE THEN PROCESS COST WILL BE SUM UP OF ALL PROCESS'S PROCESS COST OF THAT GROUP,OTHERWISE WE WILL CHECK  UOMTYPE ON THAT BASIS ,PROCESS COST WILL BE CALCULATED
            ProcessCost: rowArray.length > 0 ? calculateRowProcessCost(rowArray) : item.UOMType !== TIME ? item.MachineRate * processQuantityMain : findProcessCost(item.UOM, item.MachineRate, productionPerHrs(rowArray, item.UOMType, processQuantityMain)),
            UOMType: item.UOMType,
            UOMTypeId: item.UnitTypeId,
            ProductionPerHour: productionPerHrs(rowArray, rowArray.length > 0 ? rowArray[0].UOMType : item.UOMType, processQuantityMain),
            ProcessTechnologyId: item.ProcessTechnologyId,
            Technologies: item.Technologies,
            ProcessList: rowArray,
            ConvertedExchangeRateId: item.ConvertedExchangeRateId === EMPTY_GUID ? null : item.ConvertedExchangeRateId,
            CurrencyExchangeRate: item.CurrencyExchangeRate

          }
        })

        let tempArr = [...gridData, ...rowArr]
        setDataInGridAndApi(tempArr)
        dispatch(setProcessGroupGrid(formatReducerArray(tempArr)))

      }
    } else {
      if (rowData.length > 0) {
        let parentTempData = processGroupGrid[groupNameIndex]
        let parentProcessList = parentTempData.ProcessList
        let rowArr = []
        rowArr = rowData && rowData.map((el) => {
          let processQuantityMain = 1
          let productionPerHourMain = ''
          if (item?.UOMType === MASS) {
            processQuantityMain = rmFinishWeight ? rmFinishWeight : 1
          }
          productionPerHourMain = el.UOMType !== TIME ? '-' : findProductionPerHour(processQuantityMain)
          return {
            ProcessId: el.ProcessId,
            ProcessDetailId: '',
            MachineId: el.MachineId,
            MachineRateId: el.MachineRateId,
            MHR: el.MachineRate,
            ProcessName: el.ProcessName,
            ProcessDescription: el.Description,
            MachineName: el.MachineName,
            UOM: el.UOM,
            UnitOfMeasurementId: el.UnitOfMeasurementId,
            Tonnage: el.Tonnage,
            Quantity: processQuantityMain,
            ProcessCost: el.UOMType !== TIME ? el.MachineRate * processQuantityMain : findProcessCost(el.UOM, el.MachineRate, productionPerHourMain),
            UOMType: el.UOMType,
            UOMTypeId: el.UnitTypeId,
            ProductionPerHour: productionPerHourMain,
            ProcessTechnologyId: el.ProcessTechnologyId,
            Technologies: el.Technologies,
            ConvertedExchangeRateId: item.ConvertedExchangeRateId === EMPTY_GUID ? null : item.ConvertedExchangeRateId,
            CurrencyExchangeRate: el.CurrencyExchangeRate
          }

        })
        let arr = [...parentProcessList, ...rowArr]
        parentTempData = {
          ...parentTempData,
          ProcessList: arr,
          ProductionPerHour: productionPerHrs(arr, arr[0].UOMType, calculateRowQuantity(arr)),
          Quantity: calculateRowQuantity(arr),
          ProcessCost: calculateRowProcessCost(arr)
        }
        let mainArr = Object.assign([...processGroupGrid], { [groupNameIndex]: parentTempData })
        setDataInGridAndApi(mainArr)
        dispatch(setProcessGroupGrid(formatReducerArray(mainArr)))
      }
    }

    setGroupNameIndex('')
    setGroupNameMachine('')
    setDrawerOpen(false)
  }

  /**
   * @method selectedIds
   * @description SELECTED IDS
   */
  const selectedIds = (tempArr) => {
    let procssArr = []
    let processGroupArr = []
    tempArr && tempArr.map((el) => {

      if (Ids.includes(el.ProcessId) === false) {
        let selectedIds = Ids
        selectedIds.push(el.ProcessId)
        setIds(selectedIds)
      }
      if (MachineIds.includes(el.MachineRateId) === false) {
        let MachineRateselectedIds = MachineIds
        MachineRateselectedIds.push(el.MachineRateId)
        setMachineIds(MachineRateselectedIds)
      }

      if (el.GroupName === '' || el.GroupName === null || el.GroupName === undefined) {
        procssArr.push({ MachineRateId: el.MachineRateId, ProcessId: el.ProcessId })
      } else {
        processGroupArr.push({ MachineId: el.MachineId, GroupName: el.GroupName })
      }
      return null
    })


    dispatch(setIdsOfProcess(procssArr))
    dispatch(setIdsOfProcessGroup(processGroupArr))
  }

  const deleteItem = (index) => {
    let tempArr2 = [];
    let tempArrAfterDelete = processGroupGrid && processGroupGrid.filter((el, i) => {
      if (i === index) return false;
      return true
    })
    setTimeout(() => {
      let ProcessCostTotal = 0
      ProcessCostTotal = tempArrAfterDelete && tempArrAfterDelete.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)
      let apiArr = formatMainArr(tempArrAfterDelete)
      tempArr2 = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }

      let selectedIds = []
      let selectedMachineIds = []
      tempArrAfterDelete.map(el => {
        selectedIds.push(el.ProcessId)
        selectedMachineIds.push(el.MachineRateId)
        return null

      })
      setGridData(tempArrAfterDelete)
      dispatch(setProcessGroupGrid(formatReducerArray(tempArrAfterDelete)))
      setIds(selectedIds)
      setMachineIds(selectedMachineIds)
      setTabData(tempArr2)
      setValue(`${ProcessGridFields}.${index}.remarkPopUp`, '')
      tempArrAfterDelete && tempArrAfterDelete.map((el, i) => {
        setValue(`${ProcessGridFields}.${i}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration?.NoOfDecimalForPrice))
        setValue(`${ProcessGridFields}.${i}.Quantity`, checkForDecimalAndNull(el.Quantity, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${ProcessGridFields}.${i}.remarkPopUp`, el.Remark)
        return null
      })
    }, 200)


    if (gridData[index]?.ProcessList?.length > 0) {
      let tempArr = selectedProcessGroupId
      let newArr = []
      // tempArr = tempArr.filter((el) => { return (el.GroupName !== gridData[index].GroupName && el.MachineId !== gridData[index].MachineId) })
      tempArr && tempArr.map((el) => {
        if (el.GroupName === gridData[index].GroupName && el.MachineId === gridData[index].MachineId) {
          return false
        } else {
          newArr.push(el)
        }
        return null
      })

      dispatch(setIdsOfProcessGroup(newArr))
    } else {
      let tempArr1 = selectedProcessId
      tempArr1 = tempArr1.filter((el) => el.ProcessId !== gridData[index].ProcessId)
      dispatch(setIdsOfProcess(tempArr1))
    }
  }

  const deleteGroupProcess = (index, parentIndex, list) => {
    let parentTempData = processGroupGrid[parentIndex]
    let tempArr2 = [];
    let tempArrAfterDelete = list && list.filter((el, i) => {
      if (i === index) return false;
      return true
    })
    let ProcessCostTotal = 0
    ProcessCostTotal = tempArrAfterDelete && tempArrAfterDelete.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ProcessCost)
    }, 0)

    let QuantityTotal = tempArrAfterDelete && tempArrAfterDelete.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.Quantity)
    }, 0)

    let ProductionPerHourTotal = findProductionPerHour(QuantityTotal)

    setValue(`${ProcessGridFields}.${parentIndex}.ProcessCost`, checkForDecimalAndNull(ProcessCostTotal, initialConfiguration?.NoOfDecimalForPrice))
    setValue(`${ProcessGridFields}.${parentIndex}.Quantity`, checkForDecimalAndNull(QuantityTotal, initialConfiguration?.NoOfDecimalForPrice))

    setValue(`${SingleProcessGridField}.${index}.${parentIndex}.remarkPopUp`, '')
    setValue(`${SingleProcessGridField}.${index}.remarkPopUp`, '')


    parentTempData = {
      ...parentTempData,
      ProcessList: tempArrAfterDelete,
      ProcessCost: ProcessCostTotal,
      ProductionPerHour: tempArrAfterDelete.length > 0 && tempArrAfterDelete[0].UOMType !== TIME ? '' : ProductionPerHourTotal,
      Quantity: QuantityTotal
    }
    tempArr2 = Object.assign([...processGroupGrid], { [parentIndex]: parentTempData })
    let apiArr = formatMainArr(tempArr2)
    let ProcessCost = 0
    ProcessCost = tempArr2 && tempArr2.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ProcessCost)
    }, 0)
    let tempArr3 = {
      ...tabData,
      CostingProcessCostResponse: apiArr,
      ProcessCost: ProcessCost
    }
    setGridData(tempArr2)
    dispatch(setProcessGroupGrid(formatReducerArray(tempArr2)))
    setTabData(tempArr3)

    tempArrAfterDelete && tempArrAfterDelete.map((el, i) => {
      setValue(`${SingleProcessGridField}.${i}.${parentIndex}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration?.NoOfDecimalForPrice))
      setValue(`${SingleProcessGridField}.${i}${parentIndex}${el.ProcessName}.Quantity`, checkForDecimalAndNull(el.Quantity, getConfigurationKey().NoOfDecimalForInputOutput))
      setValue(`${SingleProcessGridField}.${index}.${parentIndex}.remarkPopUp`, el.Remark)
      setValue(`${SingleProcessGridField}.${index}.remarkPopUp`, el.Remark)
      return null
    })

  }

  const openProcessDrawer = (index, item) => {
    setDrawerOpen(true)
    setGroupNameMachine(item.MachineId)
    setGroupNameIndex(index)
  }

  const handleQuantityChange = (event, index) => {
    if (checkForNull(rmGrossWeight) !== 0 && processGroupGrid && processGroupGrid[index]?.UOMType === MASS && event?.target?.value > rmGrossWeight) {
      Toaster.warning("Enter value less than gross weight.")
      setTimeout(() => {
        setValue(`${ProcessGridFields}.${index}.Quantity`, '')
      }, 50);
      return false
    }
    let tempArr = []
    let tempData = processGroupGrid[index]

    if (!isNaN(event.target.value) && event.target.value !== '') {
      let processCost = 0
      let productionPerHour = 0
      if (tempData.UOMType !== TIME) {
        processCost = tempData.MHR * event.target.value
      } else {
        productionPerHour = findProductionPerHour(event.target.value)
        processCost = findProcessCost(tempData.UOM, tempData.MHR, productionPerHour)
      }
      const netCosts = calculateNetCosts(processCost, tempData?.Applicability);
      tempData = {
        ...tempData,
        Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProductionPerHour: tempData.UOMType !== TIME ? '-' : productionPerHour,
        ProcessCost: processCost,
        ...netCosts
      }

      let gridTempArr = Object.assign([...processGroupGrid], { [index]: tempData })

      // Calculate totals
      const totals = calculateProcessTotals(gridTempArr);
      let apiArr = formatMainArr(gridTempArr)

      tempArr = {
        ...tabData,
        NetConversionCost: totals?.ProcessCostTotal + checkForNull(tabData?.OperationCostTotal !== null ? tabData?.OperationCostTotal : 0,) + checkForNull(tabData?.OtherOperationCostTotal !== null ? tabData?.OtherOperationCostTotal : 0),
        ...totals,
        CostingProcessCostResponse: apiArr,
      }
      setIsFromApi(false)
      setTabData(tempArr)
      if (isAssemblyTechnology) {
        // props.setProcessCostFunction(tempArr?.ProcessCostTotal)
      }
      setGridData(gridTempArr)
      dispatch(setProcessGroupGrid(formatReducerArray(gridTempArr)))
      setValue(`${ProcessGridFields}.${index}.ProcessCost`, checkForDecimalAndNull(processCost, initialConfiguration?.NoOfDecimalForPrice))
    }
    //  else {

    //   const ProcessCost = tempData.MHR * 0
    //   tempData = {
    //     ...tempData,
    //     Quantity: 0,
    //     IsCalculatedEntry: false,
    //     ProcessCost: ProcessCost,
    //   }
    //   let gridTempArr = Object.assign([...processGroupGrid], { [index]: tempData })

    //   let ProcessCostTotal = 0
    //   ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
    //     return accummlator + checkForNull(el.ProcessCost)
    //   }, 0)

    //   let apiArr = formatMainArr(gridTempArr)

    //   tempArr = {
    //     ...tabData,
    //     NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
    //     ProcessCostTotal: ProcessCostTotal,
    //     CostingProcessCostResponse: apiArr,
    //   }
    //   setIsFromApi(false)
    //   setTabData(tempArr)
    //   setGridData(gridTempArr)
    //   dispatch(setProcessGroupGrid(formatReducerArray(gridTempArr)))
    //   setTimeout(() => {
    //     setValue(`${ProcessGridFields}.${index}.Quantity`, "")
    //     setValue(`${ProcessGridFields}.${index}.ProcessCost`, "")
    //   }, 200)
    //   //Toaster.warning('Please enter valid number.')
    // }
  }

  const onCRMHeadChange = (e, index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      ProcessCRMHead: e?.label
    }
    let gridTempArr = Object.assign([...gridData], { [index]: tempData })
    let apiArr = formatMainArr(gridTempArr)

    tempArr = {
      ...tabData,
      CostingProcessCostResponse: apiArr,
    }
    setIsFromApi(false)
    setTabData(tempArr)
    setGridData(gridTempArr)
    dispatch(setProcessGroupGrid(formatReducerArray(gridTempArr)))
  }
  const calculateNetCosts = (processCost, applicabilityType) => {
    return {
      NetProcessCostForOverhead: [APPLICABILITY_OVERHEAD, APPLICABILITY_OVERHEAD_PROFIT].includes(applicabilityType) ? processCost : 0,
      NetProcessCostForOverheadExcl: applicabilityType === APPLICABILITY_OVERHEAD_EXCL ? processCost : 0,
      NetProcessCostForProfit: [APPLICABILITY_PROFIT, APPLICABILITY_OVERHEAD_PROFIT].includes(applicabilityType) ? processCost : 0,
      NetProcessCostForProfitExcl: applicabilityType === APPLICABILITY_PROFIT_EXCL ? processCost : 0,
      NetProcessCostForOverheadAndProfit: applicabilityType === APPLICABILITY_OVERHEAD_PROFIT ? processCost : 0
    };
  };
  
  const calculateProcessTotals = (gridData) => {
    return {
      ProcessCostTotal: gridData.reduce((acc, el) => acc + checkForNull(el?.ProcessCost), 0),
      NetProcessCostForOverhead: gridData.reduce((acc, el) => acc + checkForNull(el?.NetProcessCostForOverhead), 0),
      NetProcessCostForOverheadExcl: gridData.reduce((acc, el) => acc + checkForNull(el?.NetProcessCostForOverheadExcl), 0),
      NetProcessCostForProfit: gridData.reduce((acc, el) => acc + checkForNull(el?.NetProcessCostForProfit), 0),
      NetProcessCostForProfitExcl: gridData.reduce((acc, el) => acc + checkForNull(el?.NetProcessCostForProfitExcl), 0),
      NetProcessCostForOverheadAndProfit: gridData.reduce((acc, el) => acc + checkForNull(el?.NetProcessCostForOverheadAndProfit), 0)
    };
  };

  const onHandleChangeApplicability = (e, index) => {
    let tempArr = []
    let tempData = processGroupGrid[index]

    // Calculate net costs based on new applicability
    const netCosts = calculateNetCosts(tempData.ProcessCost, e.value);

    tempData = {
      ...tempData,
      Applicability: e.value,
      ...netCosts
    }

    let gridTempArr = Object.assign([...processGroupGrid], { [index]: tempData })

    // Calculate totals
    const totals = calculateProcessTotals(gridTempArr);
    let apiArr = formatMainArr(gridTempArr)

    tempArr = {
      ...tabData,
      NetConversionCost: totals.ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
      ...totals,
      CostingProcessCostResponse: apiArr,
    }

    setIsFromApi(false)
    setTabData(tempArr)
    setGridData(gridTempArr)
    dispatch(setProcessGroupGrid(formatReducerArray(gridTempArr)))
  }

  const handleQuantityChangeOfGroupProcess = (event, index, list, parentIndex, processName) => {

    let tempArr = []
    let processTempData = processGroupGrid[parentIndex]
    let tempData = list[index]

    if (!isNaN(event.target.value) && event.target.value !== '') {
      let processCost = 0
      let productionPerHour = 0
      if (tempData.UOMType !== TIME) {
        processCost = tempData.MHR * event.target.value
      } else {
        productionPerHour = findProductionPerHour(event.target.value)
        processCost = findProcessCost(tempData.UOM, tempData.MHR, productionPerHour)
      }

      tempData = {
        ...tempData,
        Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProductionPerHour: productionPerHour,
        ProcessCost: processCost
      }
      let gridTempArr = Object.assign([...list], { [index]: tempData })
      setValue(`${SingleProcessGridField}.${index}.${parentIndex}.ProcessCost`, checkForDecimalAndNull(processCost, getConfigurationKey().NoOfDecimalForInputOutput))

      //MAIN PROCESS ROW WITH GROUP
      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      let quantityTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.Quantity)
      }, 0)

      let groupProductionPerHour = findProductionPerHour(quantityTotal)

      processTempData = {
        ...processTempData,
        Quantity: quantityTotal,
        ProductionPerHour: tempData.UOMType !== TIME ? '' : groupProductionPerHour,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCostTotal,
        ProcessList: gridTempArr
      }
      let processTemparr = Object.assign([...processGroupGrid], { [parentIndex]: processTempData })
      let apiArr = formatMainArr(processTemparr)


      let finalProcessCostTotal = processTemparr && processTemparr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      setValue(`${ProcessGridFields}.${parentIndex}.ProcessCost`, checkForDecimalAndNull(ProcessCostTotal, initialConfiguration?.NoOfDecimalForPrice))
      setValue(`${ProcessGridFields}.${parentIndex}.Quantity`, checkForDecimalAndNull(quantityTotal, getConfigurationKey().NoOfDecimalForInputOutput))

      tempArr = {
        ...tabData,
        NetConversionCost: finalProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: finalProcessCostTotal,
        CostingProcessCostResponse: apiArr,

      }
      setIsFromApi(false)
      setTabData(tempArr)
      setGridData(processTemparr)

      dispatch(setProcessGroupGrid(formatReducerArray(processTemparr)))
    }
  }

  /**
   * @method setOperationCost
   * @description SET BOP COST
   */
  const setOperationCost = (operationGrid, params, index) => {
    let OperationCostTotal = 0
    OperationCostTotal = operationGrid && operationGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.OperationCost)
    }, 0)
    let apiArr = formatMainArr(gridData)
    // gridData && gridData.map((item) => {
    //   if (item.GroupName === '' || item.GroupName === null) {
    //     apiArr.push(item)
    //   } else {
    //     apiArr.push(item)
    //     item.ProcessList && item.ProcessList.map(processItem => {
    //       processItem.GroupName = item.GroupName
    //       apiArr.push(processItem)
    //     })
    //   }
    // })
    let tempArr = {
      ...tabData,
      NetConversionCost: OperationCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0) + checkForNull(tabData && tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0,),
      OperationCostTotal: OperationCostTotal,
      CostingOperationCostResponse: operationGrid,
      CostingProcessCostResponse: apiArr
    }

    setIsFromApi(false)
    setTabData(tempArr)
  }

  const setOtherOperationCost = (otherOperationGrid, params, index) => {
    let OtherOperationCostTotal = 0
    OtherOperationCostTotal = otherOperationGrid && otherOperationGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.OperationCost)
    }, 0)
    let apiArr = formatMainArr(gridData)
    // gridData && gridData.map((item) => {
    //   if (item.GroupName === '' || item.GroupName === null) {
    //     apiArr.push(item)
    //   } else {
    //     apiArr.push(item)
    //     item.ProcessList && item.ProcessList.map(processItem => {
    //       processItem.GroupName = item.GroupName
    //       apiArr.push(processItem)
    //     })
    //   }
    // })
    let tempArr = {
      ...tabData,
      NetConversionCost: (OtherOperationCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0) + checkForNull(tabData && tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,)).toFixed(10),
      OtherOperationCostTotal: OtherOperationCostTotal,
      CostingOtherOperationCostResponse: otherOperationGrid,
      CostingProcessCostResponse: apiArr
    }
    setIsFromApi(false)
    setTabData(tempArr)
    if (isAssemblyTechnology) {
      // props.setProcessCostFunction(tempArr?.ProcessCostTotal)
    }
  }

  /**
   * @method setRMCCErrors
   * @description CALLING TO SET BOP COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
  */
  let temp = ErrorObjRMCC ? ErrorObjRMCC : {}
  if (Object.keys(errors).length > 0 && counter < 2) {
    temp.ProcessGridFields = errors.ProcessGridFields;
    dispatch(setRMCCErrors(temp))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    temp.ProcessGridFields = {};
    dispatch(setRMCCErrors(temp))
    counter = 0
  }
  const ProcessGridFields = 'ProcessGridFields'
  const SingleProcessGridField = 'SingleProcessGridField'

  const processNetCostFormula = (value) => {
    let processNetCostFormulaText;
    switch (value) {
      case HOUR:
        processNetCostFormulaText = 'Net Cost = Machine Rate / Part per Hour'
        break;
      case MINUTES:
        processNetCostFormulaText = 'Net Cost = (Machine Rate * 60) / Part per Hour'
        break;
      case SECONDS:
        processNetCostFormulaText = 'Net Cost = (Machine Rate * 3600) / Part per Hour'
        break;
      case MILLISECONDS:
        processNetCostFormulaText = 'Net Cost = (Machine Rate * 3600000) / Part per Hour'
        break;
      case MICROSECONDS:
        processNetCostFormulaText = 'Net Cost = (Machine Rate * 3600000000) / Part per Hour'
        break;
      case undefined:
        processNetCostFormulaText = 'Net Cost = Total cost of the sub process net cost'
        break;
      case null:
        processNetCostFormulaText = 'Net Cost = Total cost of the sub process net cost'
        break;
      default:
        processNetCostFormulaText = 'Net Cost = (Quantity * Machine Rate)'
        break;
    }
    return processNetCostFormulaText
  }
  const renderSingleProcess = (process, parentIndex) => {
    return (
      process.ProcessList && process.ProcessList.map((item, index) => {
        return (
          <tr>
            <td>{'-'}</td>
            <td className='text-overflow'><span title={`${item.ProcessName}-group-${process?.GroupName}`} draggable={CostingViewMode ? false : true}>{item.ProcessName}</span></td>
            <td>{item.Tonnage}</td>
            <td>{item.MHR}</td>
            <td>{item.UOM}</td>
            <td><div className='w-fit' id={`part-hour${index}`}><TooltipCustom disabledIcon={true} id={`part-hour${index}`} tooltipText={"Parts/Hour = (3600 / Quantity)"} />{(item?.ProductionPerHour === '' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null || item?.ProductionPerHour === undefined || item.ProductionPerHour === '-') ? '-' : Math.round(checkForNull(item.ProductionPerHour))}</div></td>
            <td>
              <div className='d-flex align-items-center'>
                <span className="d-inline-block  mr-2">
                  { }

                  {
                    <TextFieldHookForm
                      label=""
                      name={`${SingleProcessGridField}.${index}${parentIndex}${item.ProcessName}.Quantity`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                      }}
                      errors={errors && errors.SingleProcessGridField ? errors.SingleProcessGridField[`${index}${parentIndex}${item.ProcessName}`] && errors.SingleProcessGridField[`${index}${parentIndex}${item.ProcessName}`].Quantity : ''}
                      defaultValue={item.Quantity ? checkForDecimalAndNull(item.Quantity, getConfigurationKey().NoOfDecimalForInputOutput) : '1'}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleQuantityChangeOfGroupProcess(e, index, process.ProcessList, parentIndex, item.ProcessName)
                      }}

                      // errors={ }
                      disabled={(CostingViewMode || IsLocked) ? true : false}
                    />

                  }

                </span>
                <div className='min15'>
                  <button
                    className="CalculatorIcon cr-cl-icon calc-icon-middle"
                    type={'button'}
                    onClick={() => toggleWeightCalculator(index, process.ProcessList, parentIndex)}
                  />
                </div>
              </div>
            </td>
            <td style={{ width: 100 }}>
              {
                <>
                  <TooltipCustom disabledIcon={true} id={`process-net-cost-single${index}`} tooltipText={processNetCostFormula(item.UOM)} />
                  <TextFieldHookForm
                    label=""
                    name={`${SingleProcessGridField}.${index}.${parentIndex}.ProcessCost`}
                    Controller={Controller}
                    id={`process-net-cost-single${index}`}
                    control={control}
                    register={register}
                    mandatory={false}
                    defaultValue={item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, trimForCost) : '0.00'}
                    className=""
                    customClassName={'withBorder'}
                    handleChange={(e) => {
                      e.preventDefault()
                    }}
                    // errors={}
                    disabled={true}
                  />
                </>
              }
            </td>
            <td>
              <div className='action-btn-wrapper'>
                {(!CostingViewMode && !IsLocked) && <button title='Delete' className="Delete" type={'button'} onClick={() => deleteGroupProcess(index, parentIndex, process.ProcessList)} />}
                <Popup trigger={<button id={`popUpTriggers${index}.${parentIndex}`} title="Remark" className="Comment-box" type={'button'} />}
                  position="top right">
                  <TextAreaHookForm
                    label="Remark:"
                    name={`${SingleProcessGridField}.${index}${parentIndex}.remarkPopUp`}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      maxLength: groupProcessRemark && REMARKMAXLENGTH
                    }}
                    handleChange={(e) => {
                      setGroupProcessRemark(true)
                    }}
                    defaultValue={item.Remark ?? item.Remark}
                    className=""
                    customClassName={"withBorder"}
                    errors={errors && errors.SingleProcessGridField && errors.SingleProcessGridField[`${index}${parentIndex}`] !== undefined ? errors.SingleProcessGridField[`${index}${parentIndex}`].remarkPopUp : ''}
                    //errors={errors && errors.remarkPopUp && errors.remarkPopUp[index] !== undefined ? errors.remarkPopUp[index] : ''}                        
                    disabled={(CostingViewMode || IsLocked) ? true : false}
                    hidden={false}
                  />
                  <Row>
                    <Col md="12" className='remark-btn-container'>
                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => onRemarkPopUpClickGroup(index, parentIndex, process.ProcessList)} > <div className='save-icon'></div> </button>
                      <button className='reset' onClick={() => onRemarkPopUpCloseGroup(index, parentIndex)} > <div className='cancel-icon'></div></button>
                    </Col>
                  </Row>
                </Popup>
              </div>
            </td>
          </tr>
        )
      })
    )
  }

  const onMouseLeave = (e) => {
    dragEnd = e?.target?.title

  }

  const onDragComplete = (e) => {   //SWAPPING ROWS LOGIC FOR PROCESS
    let dragStart = e?.target?.title


    if (dragEnd && dragStart && (String(dragStart) !== String(dragEnd))) {


      const swappingLogicGroup = (groupProcess, processArray) => {

        // Check if dragStart and dragEnd are the same, if so return false
        if (String(dragStart) === String(dragEnd)) {
          return false
        }

        // Initialize temporary arrays and variables
        let temp = []
        let finalTemp = []
        let addingIndex = 0
        let dragStartIndex = 0

        // Loop over the items in processGroupGrid and update the temporary arrays and variables
        processArray.map((item, index) => {
          if ((item.ProcessName !== null ? (item.ProcessName !== dragStart) : (item.GroupName !== dragStart))) {
            // if the item is not the same as dragStart, add it to the temp array
            temp.push(item)
          } else {
            // if the item is the same as dragStart, update the dragStartIndex variable
            dragStartIndex = index
          }

          if (item.ProcessName === dragEnd) {
            // if the item is the same as dragEnd, update the addingIndex variable
            addingIndex = index
          }
          return null
        })

        // Check if the item after dragStart is dragEnd, if so return false
        if (String(processArray[dragStartIndex + 1]?.ProcessName) === String(dragEnd)) {
          return false
        }

        // Loop over the items in temp and update the finalTemp array
        temp.map((item, index) => {
          if (addingIndex === index) {
            // if the index is the same as addingIndex, add the dragStart item to the finalTemp array
            finalTemp.push(processArray[dragStartIndex])
          }
          // add the current item to the finalTemp array
          finalTemp.push(item)
          return null
        })

        // Check if the finalTemp array is the same length as the processGroupGrid array
        if (finalTemp.length !== processArray.length) {
          // if not, reset the finalTemp array and loop over the temp array again
          finalTemp = []
          temp.map((item, index) => {
            if (index === temp.length - 1) {
              // if at the end of the temp array, add the dragStart item to the finalTemp array
              finalTemp.push(processArray[dragStartIndex])
            }
            // add the current item to the finalTemp array
            finalTemp.push(item)
            return null
          })
        }

        setIsProcessSequenceChanged(true)
        return finalTemp
      }


      const setTabDataCommon = (processArray) => {
        let apiArr = formatMainArr(processArray)
        let obj = {
          ...tabData,
          CostingProcessCostResponse: apiArr
        }
        setTabData(obj)
      }

      const setGridDataCommon = (processArray) => {
        dispatch(setProcessGroupGrid(formatReducerArray(processArray)))
        setGridData(processArray)
      }

      if (dragStart?.includes('-group') && dragEnd?.includes('-group')) {       //LOGIC STARTS FOR GROUP PROCESS

        let finalGroupArray = []
        let groupIndex = 0
        let groupProcessList = []

        let parts = dragStart.split('-')
        let groupName = parts[parts.length - 1]
        dragStart = parts[0]
        parts = dragEnd.split('-')
        dragEnd = parts[0]

        // Find the group that the dragged process belongs to and get the index and process list for that group
        processGroupGrid.map((item, index) => {
          if (String(item.GroupName) === String(groupName)) {
            groupIndex = index
            groupProcessList = item.ProcessList
          }
          return null
        })

        ////////////////////////////////////////////////////////

        let finalTemp = swappingLogicGroup(true, groupProcessList) //COMMON SWAPPING LOGIC

        // Update the processGroupGrid with the new process list order for the group
        finalGroupArray = processGroupGrid
        finalGroupArray[groupIndex].ProcessList = finalTemp
        setGridDataCommon(finalGroupArray)

        // Update field values
        finalTemp && finalTemp.map((el, index) => {
          setTimeout(() => {
            setValue(`${SingleProcessGridField}.${index}.${groupIndex}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue(`${SingleProcessGridField}.${index}${groupIndex}${el.ProcessName}.Quantity`, checkForDecimalAndNull(el.Quantity, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${SingleProcessGridField}.${index}${groupIndex}.remarkPopUp`, (el.Remark))
          }, 200);

          return null
        })

        setTabDataCommon(finalGroupArray)

      } else if (dragStart && dragEnd && !dragStart?.includes('-group') && !dragEnd?.includes('-group')) {   // LOGIC STARTS FOR NORMAL PROCESS

        let finalTemp = swappingLogicCommon(processGroupGrid, dragStart, dragEnd, e) //COMMON SWAPPING LOGIC
        setGridDataCommon(finalTemp)

        finalTemp && finalTemp.map((el, index) => {
          // Update field values
          setValue(`${ProcessGridFields}.${index}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration?.NoOfDecimalForPrice))
          setValue(`${ProcessGridFields}.${index}.Quantity`, checkForDecimalAndNull(el.Quantity, getConfigurationKey().NoOfDecimalForInputOutput))
          setValue(`${ProcessGridFields}.${index}.remarkPopUp`, (el.Remark))
          setValue(`crmHeadProcess${index}`, { label: el.ProcessCRMHead, value: 1 })
          return null
        })

        setTabDataCommon(finalTemp)
      }
    }
  }

  const tourStart = () => {

  }
  /**
   * @method render
   * @description Renders the component
   */
  const tooltipText = <div><div>If UOM is in hours/minutes/seconds, please enter the quantity in seconds.</div> <div>For all others UOMs, please enter the actual quantity.</div></div>;
  return (
    <>
      <div className="user-page p-0">
        {!isAssemblyTechnology && <Row>
          <Col md="12">
            <div className="left-border">{'Conversion Cost:'}</div>
          </Col>
        </Row>}
        <div className={isAssemblyTechnology ? '' : 'cr-process-costwrap'}>
          <Row className="cr-innertool-cost">

            <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Process Cost: ${tabData && tabData.ProcessCostTotal !== null ? checkForDecimalAndNull(tabData.ProcessCostTotal, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span></Col>
            {!isAssemblyTechnology && <>
              <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Operation Cost: ${tabData && tabData.OperationCostTotal !== null ? checkForDecimalAndNull(tabData.OperationCostTotal, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span></Col>
              <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Other Operation Cost: ${tabData && tabData.OtherOperationCostTotal !== null ? checkForDecimalAndNull(tabData.OtherOperationCostTotal, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span></Col>
              <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Net Conversion Cost: ${tabData && tabData.NetConversionCost !== null ? checkForDecimalAndNull(tabData.NetConversionCost, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span></Col>
            </>}
          </Row>

          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">{'Process Cost:'}{gridData && gridData.length !== 0 &&
                <TourWrapper
                  buttonSpecificProp={{ id: "Costing_RM_Cost", onClick: tourStart }}
                  stepsSpecificProp={{
                    steps: Steps(t).PROCESS_COST
                  }} />}</div>
            </Col>
            <Col md={'2'}>
              {(!CostingViewMode && !IsLocked) &&
                <Button
                  id="Costing_addProcess"
                  onClick={DrawerToggle}
                  icon={"plus"}
                  buttonName={"PROCESS"}
                />
              }
              <TooltipCustom tooltipClass="process-defination" customClass="mt-2 mr-2" id={`process-defination`} width="350px" tooltipText={"It's a process where machines do the main work to finish tasks. These tasks can be anything from making products to moving things around in a factory. Basically, machines handle most of the job."} />
            </Col>
          </Row>

          <Row>
            {/*OPERATION COST GRID */}
            <Col md="12">
              {tableUpdate && < Table className="table cr-brdr-main costing-process-cost-section p-relative" size="sm" onDragOver={onMouseLeave} onDragEnd={onDragComplete}>
                <thead className={`${headerPinned ? 'sticky-headers' : ''}`}>
                  <tr>
                    <th style={{ width: "220px" }}>{`Process`}</th>
                    {processGroup && <th style={{ width: "150px" }}>{`Sub Process`}</th>}
                    <th style={{ width: "150px" }}>{`Machine Tonnage`}</th>
                    <th style={{ width: "150px" }}>{`Machine Rate`}</th>
                    <th style={{ width: "160px" }}>{`UOM`}</th>
                    <th style={{ width: "160px" }}>{`Parts/Hour`}</th>
                    <th style={{ width: "180px" }}><span>Quantity <TooltipCustom customClass="float-unset" tooltipClass="process-quatity-tooltip" id={`quantity-info`} tooltipText={tooltipText} /></span></th>
                    <th style={{ width: "110px" }} >{`Net Cost`}</th>
                    {initialConfiguration?.IsShowCRMHead && <th style={{ width: "110px" }} >{`CRM Head`}</th>}
                    <th style={{ width: "110px" }} >{`Applicability`}</th>
                    <th style={{ width: "145px" }}><div className='pin-btn-container'><span>Action</span><button onClick={() => setHeaderPinned(!headerPinned)} className='pinned' title={headerPinned ? 'pin' : 'unpin'}><div className={`${headerPinned ? '' : 'unpin'}`}></div></button></div></th>
                  </tr>
                </thead>
                <tbody>
                  {processGroupGrid &&
                    processGroupGrid.map((item, index) => {
                      return (
                        <>
                          <tr key={index}>
                            <td className={`text-overflow ${(item?.GroupName === '' || item?.GroupName === null) ? '' : 'process-name no-border'}`} >
                              {
                                (item?.GroupName === '' || item?.GroupName === null) ? '' :
                                  <div onClick={() => {
                                    processAccObj[index] === true ? setProcessAccObj(prevState => ({ ...prevState, [index]: false })) : setProcessAccObj(prevState => ({ ...prevState, [index]: true }))
                                  }}
                                    className={`${processAccObj[index] ? 'Open' : 'Close'}`}></div>

                              }
                              <span className='link' onClick={() => setOpenMachineForm({ isOpen: true, id: item.MachineId })} title={item?.GroupName === '' || item?.GroupName === null ? item.ProcessName + index : item.GroupName + index} draggable={CostingViewMode ? false : true}>
                                {item?.GroupName === '' || item?.GroupName === null ? item.ProcessName : item.GroupName}</span>
                            </td>
                            {processGroup && <td className='text-overflow'><span title={item.ProcessName}>{'-'}</span></td>}
                            <td>{item.Tonnage ? checkForNull(item.Tonnage) : '-'}</td>
                            <td>{item.MHR}</td>
                            <td>{item.UOM}</td>
                            <td><div className='w-fit' id={`part-hour${index}`}><TooltipCustom disabledIcon={true} id={`part-hour${index}`} tooltipText={"Parts/Hour = (3600 / Quantity)"} />{(item?.ProductionPerHour === '' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null || item?.ProductionPerHour === undefined) ? '-' : Math.round(item.ProductionPerHour)}</div></td>
                            <td >
                              {

                                < div className='d-flex align-items-center'>
                                  <span className="d-inline-block mr-2">
                                    {
                                      <TextFieldHookForm
                                        label=""
                                        name={`${ProcessGridFields}.${index}.Quantity`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                          required: true,
                                          validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                        }}
                                        errors={errors && errors.ProcessGridFields && errors.ProcessGridFields[index] !== undefined ? errors.ProcessGridFields[index].Quantity : ''}
                                        defaultValue={item.Quantity ? checkForDecimalAndNull(item.Quantity, getConfigurationKey().NoOfDecimalForInputOutput) : '1'}
                                        className=""
                                        customClassName={'withBorder'}
                                        handleChange={(e) => {
                                          e.preventDefault()
                                          handleQuantityChange(e, index)
                                        }}

                                        disabled={(CostingViewMode || IsLocked || (item.GroupName !== '' && item.GroupName !== null)) ? true : false}
                                      />
                                    }

                                  </span>
                                  <div className='min15'>
                                    {
                                      (item.GroupName === '' || item.GroupName === null) &&
                                      <button
                                        id={`process_Calculator${index}`}
                                        className="CalculatorIcon cr-cl-icon calc-icon-middle"
                                        type={'button'}
                                        onClick={() => toggleWeightCalculator(index)}
                                      />
                                    }
                                  </div>
                                </div >
                              }
                            </td >
                            <td>
                              {
                                <>
                                  <TooltipCustom disabledIcon={true} id={`process-net-cost${index}`} tooltipText={processNetCostFormula(item.UOM)} />
                                  <TextFieldHookForm
                                    label=""
                                    name={`${ProcessGridFields}.${index}.ProcessCost`}
                                    Controller={Controller}
                                    id={`process-net-cost${index}`}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    defaultValue={item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, trimForCost) : '0.00'}
                                    className=""
                                    customClassName={'withBorder'}
                                    handleChange={(e) => {
                                      e.preventDefault()
                                    }}
                                    // errors={}
                                    disabled={true}
                                  />
                                </>
                              }
                            </td>
                            {
                              initialConfiguration?.IsShowCRMHead && <td>
                                <SearchableSelectHookForm
                                  name={`crmHeadProcess${index}`}
                                  type="text"
                                  label="CRM Head"
                                  errors={`${errors.crmHeadProcess}${index}`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: false,
                                  }}
                                  placeholder={'Select'}
                                  customClassName="costing-selectable-dropdown"
                                  defaultValue={item.ProcessCRMHead ? { label: item.ProcessCRMHead, value: index } : ''}
                                  options={CRMHeads}
                                  required={false}
                                  handleChange={(e) => { onCRMHeadChange(e, index) }}
                                  disabled={CostingViewMode}
                                />
                              </td>
                            }

                            <td>
                              <SearchableSelectHookForm
                                name={`Applicability${index}`}
                                type="text"
                                label="Applicability"
                                errors={`${errors.Applicability}${index}`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                placeholder={'Select'}
                                customClassName="costing-selectable-dropdown"
                                defaultValue={item.Applicability ? {
                                  label: ApplicabilityTypes.find(type => type.value === item.Applicability)?.label,
                                  value: item.Applicability
                                } : ''}
                                options={ApplicabilityTypes}
                                required={false}
                                handleChange={(e) => { onHandleChangeApplicability(e, index) }}
                                disabled={CostingViewMode}
                              />
                            </td>

                            <td>
                              <div className='action-btn-wrapper'>
                                {(!CostingViewMode && !IsLocked) && <button title='Delete' id={`process_delete${0}`} className="Delete" type={'button'} onClick={() => deleteItem(index)} />}
                                {(item?.GroupName === '' || item?.GroupName === null) && <Popup trigger={<button id={`process_popUpTriggers${index}`} title="Remark" className="Comment-box" type={'button'} />}
                                  position="top right">
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${ProcessGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      maxLength: singleProcessRemark && REMARKMAXLENGTH
                                    }}
                                    handleChange={(e) => { setSingleProcessRemark(true) }}
                                    defaultValue={item.Remark ?? item.Remark}
                                    className=""
                                    customClassName={"withBorder"}
                                    errors={errors && errors.ProcessGridFields && errors.ProcessGridFields[index] !== undefined ? errors.ProcessGridFields[index].remarkPopUp : ''}
                                    //errors={errors && errors.remarkPopUp && errors.remarkPopUp[index] !== undefined ? errors.remarkPopUp[index] : ''}                        
                                    disabled={(CostingViewMode || IsLocked) ? true : false}
                                    hidden={false}
                                  />
                                  <Row>
                                    <Col md="12" className='remark-btn-container'>
                                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => onRemarkPopUpClick(index)} > <div className='save-icon'></div> </button>
                                      <button className='reset' onClick={() => onRemarkPopUpClose(index)} > <div className='cancel-icon'></div></button>
                                    </Col>
                                  </Row>
                                </Popup>}
                                {

                                  (item?.GroupName === '' || item?.GroupName === null) || (CostingViewMode || IsLocked) ? '' : <button className="additional-add" type={"button"} title={"Add Process"} onClick={() => openProcessDrawer(index, item)} />
                                }
                              </div>
                            </td>
                          </tr >
                          {
                            processAccObj[index] && <>
                              {
                                renderSingleProcess(item, index)
                              }
                            </>
                          }
                        </>
                      )
                      // }
                    })}
                  {
                    processGroupGrid && processGroupGrid.length === 0 && (
                      <tr>
                        <td colSpan={12}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    )
                  }
                </tbody >
              </Table >}
            </Col >
          </Row >

          {
            !isAssemblyTechnology &&
            <>
              <OperationCost
                data={props.data && props.data.CostingOperationCostResponse}
                setOperationCost={setOperationCost}
                item={props.item}
                IsAssemblyCalculation={false}
                rmFinishWeight={rmFinishWeight}
                rmGrossWeight={rmGrossWeight}
              />

              <OperationCostExcludedOverhead
                data={props.data && props.data.CostingOtherOperationCostResponse}
                setOtherOperationCost={setOtherOperationCost}
                item={props.item}
                IsAssemblyCalculation={false}
                rmFinishWeight={rmFinishWeight}
                rmGrossWeight={rmGrossWeight}
              />
            </>
          }

        </div >
      </div >
      {
        isDrawerOpen && (
          <AddProcess
            isOpen={isDrawerOpen}
            closeDrawer={closeDrawer}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
            Ids={Ids}
            MachineIds={MachineIds}
            groupMachineId={groupNameMachine}
          />
        )
      }
      {
        isCalculator && (
          <VariableMhrDrawer
            technology={calculatorTechnology}
            calculatorData={calculatorData}
            isOpen={isCalculator}
            item={item}
            CostingViewMode={CostingViewMode || IsLocked}
            rmFinishWeight={props.rmFinishWeight}
            closeDrawer={closeCalculatorDrawer}
            anchor={'right'}
          />
        )
      }
      {openMachineForm && <ViewDetailedForms data={openMachineForm} formName="Machine" cancel={() => setOpenMachineForm({ isOpen: false, id: '' })} />}
    </>
  )
}

export default ProcessCost

