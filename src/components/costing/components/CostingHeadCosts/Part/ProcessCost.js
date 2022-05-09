import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import OperationCost from './OperationCost';
import { NumberFieldHookForm, TextFieldHookForm, TextAreaHookForm } from '../../../../layout/HookFormInputs';
import AddProcess from '../../Drawers/AddProcess';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA, EMPTY_GUID, MASS, TIME } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import VariableMhrDrawer from '../../Drawers/processCalculatorDrawer/VariableMhrDrawer'
import { getProcessMachiningCalculation, getProcessDefaultCalculation } from '../../../actions/CostWorking';
import { gridDataAdded, isDataChange, setIdsOfProcess, setIdsOfProcessGroup, setIsToolCostUsed, setRMCCErrors, setSelectedDataOfCheckBox } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import Popup from 'reactjs-popup';
import OperationCostExcludedOverhead from './OperationCostExcludedOverhead';
import { MACHINING, } from '../../../../../config/masterData'

let counter = 0;
function ProcessCost(props) {
  const { data, item } = props
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const processGroup = getConfigurationKey().IsMachineProcessGroup
  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [gridData, setGridData] = useState(data && data.CostingProcessCostResponse)
  const trimValue = getConfigurationKey()
  const trimForMeasurment = trimValue.NoOfDecimalForInputOutput
  const trimForCost = trimValue.NoOfDecimalForPrice
  const [calciIndex, setCalciIndex] = useState('')
  const [parentCalciIndex, setParentCalciIndex] = useState('')
  const [listData, setListData] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [Ids, setIds] = useState([])
  const [MachineIds, setMachineIds] = useState([])
  const [isOpen, setIsOpen] = useState(data && data.IsShowToolCost)
  const [tabData, setTabData] = useState(props.data)
  const [oldTabData, setOldTabData] = useState(props.data)
  const [oldGridData, setOldGridData] = useState(data && data.CostingProcessCostResponse)
  const [isCalculator, setIsCalculator] = useState(false)
  const [remarkPopUpData, setRemarkPopUpData] = useState("")
  const [processAcc, setProcessAcc] = useState(false)
  const [processAccObj, setProcessAccObj] = useState({});
  const [calculatorTechnology, setCalculatorTechnology] = useState('')
  const [calculatorData, setCalculatorDatas] = useState({})
  const [isFromApi, setIsFromApi] = useState(true)


  const dispatch = useDispatch()
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, selectedProcessId, selectedProcessGroupId, selectedProcessAndGroup } = useSelector(state => state.costing)
  const { rmFinishWeight } = props

  // const fieldValues = useWatch({
  //   control,
  //   name: ['ProcessGridFields'],
  //   //defaultValue: 'default' // default value before the render
  // })

  // useEffect(() => {
  // }, [gridData])

  const formatMainArr = (arr) => {
    let apiArr = []
    arr && arr.map((item) => {
      if (item.GroupName === '' || item.GroupName === null) {
        apiArr.push(item)
      } else {
        apiArr.push(item)
        item.ProcessList && item.ProcessList.map(processItem => {
          processItem.GroupName = item.GroupName
          apiArr.push(processItem)
        })
      }
    })
    return apiArr
  }


  useEffect(() => {
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    if (!CostingViewMode && !IsLocked) {
      selectedIds(gridData)
      if (JSON.stringify(gridData) !== JSON.stringify(oldGridData)) {
        dispatch(isDataChange(true))
      }
      if (isFromApi) {
        let apiArr = formatMainArr(tabData.CostingProcessCostResponse)

        // tabData.CostingProcessCostResponse && tabData.CostingProcessCostResponse.map((item) => {

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

        tabData.CostingProcessCostResponse = apiArr
      }


      if (JSON.stringify(tabData) !== JSON.stringify(oldTabData)) {
        props.setConversionCost(tabData, Params, item)
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
        setIsCalculator(true)
      }, 100);
    }
  }

  /**
   * @method toggleWeightCalculator
   * @description For opening weight calculator
  */
  const toggleWeightCalculator = (id, list = [], parentIndex = '') => {


    setCalciIndex(id)
    setParentCalciIndex(parentIndex)
    setListData(list)
    let tempArr = []
    let tempData
    if (parentIndex === '') {
      tempData = gridData[id]
    } else {
      tempData = list[id]
    }
    // const calciData = list[id]
    /****************************FOR GETING CALCULATED VALUE IN CALCULATOR**************************/
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
    // setCalculatorData(calciData)
  }

  const closeCalculatorDrawer = (e, value, weightData = {}) => {

    setIsCalculator(false)
    if (Object.keys(weightData).length === 0) return false;
    if (parentCalciIndex === '') {

      let tempData = gridData[calciIndex]
      let tempArray
      let tempArr2 = [];

      tempData = {
        ...tempData,
        Quantity: tempData.UOMType === TIME ? checkForNull(weightData.ProcessCost / weightData.MachineRate) : weightData.Quantity,
        ProductionPerHour: tempData.UOMType === TIME ? checkForNull(weightData.PartPerHour) : '-',
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
      // tempArray && tempArray.map((item) => {
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
        setValue(`${ProcessGridFields}.${calciIndex}.Quantity`, tempData.UOMType === TIME ? checkForDecimalAndNull((weightData.ProcessCost / weightData.MachineRate), getConfigurationKey().NoOfDecimalForInputOutput) : weightData.Quantity)
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
        Quantity: tempData.UOMType === TIME ? checkForNull(weightData.ProcessCost / weightData.MachineRate) : weightData.Quantity,
        ProductionPerHour: tempData.UOMType === TIME ? checkForNull(weightData.PartPerHour) : '-',
        ProcessCost: weightData.ProcessCost,
        IsCalculatedEntry: true,
        ProcessCalculationId: EMPTY_GUID,
        ProcessCalculatorId: weightData.ProcessCalculationId,
        WeightCalculatorRequest: weightData
      }

      let gridTempArr = Object.assign([...listData], { [calciIndex]: tempData })
      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)
      let ProductionPerHour = 0
      ProductionPerHour = gridTempArr && gridTempArr.reduce((accummlator, el) => {

        return accummlator + checkForNull((el.ProductionPerHour === null || el.ProductionPerHour === '-') ? 0 : Number(el.ProductionPerHour))
      }, 0)

      setValue(`${SingleProcessGridField}.${calciIndex}.Quantity`, tempData.UOMType === TIME ? checkForDecimalAndNull((weightData.ProcessCost / weightData.MachineRate), getConfigurationKey().NoOfDecimalForInputOutput) : weightData.Quantity)
      setValue(`${SingleProcessGridField}.${calciIndex}.ProcessCost`, checkForDecimalAndNull(weightData.ProcessCost, initialConfiguration.NoOfDecimalForPrice))
      //MAIN PROCESS ROW WITH GROUP


      processTempData = {
        ...processTempData,
        // Quantity: tempData.UOMType === TIME ? checkForNull(weightData.ProcessCost / weightData.MachineRate) : weightData.Quantity,
        ProductionPerHour: ProductionPerHour,
        ProcessCost: ProcessCostTotal,
        ProcessList: gridTempArr
      }

      let processTemparr = Object.assign([...gridData], { [parentCalciIndex]: processTempData })


      let apiArr = []
      processTemparr && processTemparr.map((item) => {
        if (item.GroupName === '' || item.GroupName === null) {
          apiArr.push(item)
        } else {
          apiArr.push(item)
          item.ProcessList && item.ProcessList.map(processItem => {
            processItem.GroupName = item.GroupName
            apiArr.push(processItem)
          })
        }
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
      // setValue(`${SingleProcessGridField}.${calciIndex}.Quantity`, tempData.UOMType === TIME ? checkForDecimalAndNull((weightData.ProcessCost / weightData.MachineRate), getConfigurationKey().NoOfDecimalForInputOutput) : weightData.Quantity)
      setValue(`${ProcessGridFields}.${parentCalciIndex}.ProcessCost`, checkForDecimalAndNull(ProcessCostTotal, initialConfiguration.NoOfDecimalForPrice))
    }
  }


  const onRemarkPopUpClickk = (index) => {
    setRemarkPopUpData(getValues(`${ProcessGridFields}.${index}.remarkPopUp`))
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      Remark: getValues(`${ProcessGridFields}.${index}.remarkPopUp`)
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    // setGridData(tempArr)

    if (getValues(`${ProcessGridFields}.${index}.remarkPopUp`)) {
      Toaster.success('Remark saved successfully')
    }
    setTabData(tempArr)
    var button = document.getElementById(`popUpTriggers${index}`)
    button.click()
  }

  const onRemarkPopUpClosee = (index) => {
    var button = document.getElementById(`popUpTriggers${index}`)
    button.click()
  }

  useEffect(() => {
    dispatch(setIsToolCostUsed(isOpen))
  }, [isOpen])

  /**
   * @method DrawerToggle
   * @description TOGGLE DRAWER
   */
  const DrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {

    const calculateRowProcessCost = (arr) => {
      let ProcessCostTotal = arr && arr.reduce((accummlator, el) => {
        return accummlator + el.ProcessCost
      }, 0)
      return ProcessCostTotal
    }
    let tempArr2 = [];
    if (Object.keys(rowData).length > 0) {
      let rowArr = rowData && rowData.map((item) => {
        let processQuantityMain = 1
        if (item.UOMType === MASS) {
          processQuantityMain = rmFinishWeight ? rmFinishWeight : 1
        }
        // THIS IS FOR GROUP PROCESS
        let rowArray = item.ProcessList && item.ProcessList.map((el) => {

          let processQuantity = 1
          if (el.UOMType === MASS) {
            processQuantity = rmFinishWeight ? rmFinishWeight : 1
          }
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
            ProcessCost: el.MachineRate * processQuantity,
            UOMType: el.UOMType,
            UOMTypeId: el.UnitTypeId,
            ProductionPerHour: '-',
            ProcessTechnologyId: el.ProcessTechnologyId,
            Technologies: el.Technologies
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
          Quantity: processQuantityMain,
          ProcessCost: rowArray.length > 0 ? calculateRowProcessCost(rowArray) : item.MachineRate * processQuantityMain,
          UOMType: item.UOMType,
          UOMTypeId: item.UnitTypeId,
          ProductionPerHour: '-',
          ProcessTechnologyId: item.ProcessTechnologyId,
          Technologies: item.Technologies,
          ProcessList: rowArray
        }
      })

      let tempArr = [...gridData, ...rowArr]
      tempArr && tempArr.map((el, index) => {
        setValue(`${ProcessGridFields}.${index}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration.NoOfDecimalForPrice))
        setValue(`${ProcessGridFields}.${index}.Quantity`, el.Quantity)
        return null
      })

      let ProcessCostTotal = 0
      ProcessCostTotal = tempArr && tempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      let apiArr = formatMainArr(tempArr)
      // tempArr && tempArr.map((item) => {
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

      tempArr2 = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }
      setIsFromApi(false)
      setGridData(tempArr)
      setTabData(tempArr2)
      selectedIds(tempArr)
      dispatch(gridDataAdded(true))
      dispatch(setSelectedDataOfCheckBox([]))
    }
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
    let tempArrAfterDelete = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true
    })
    setTimeout(() => {
      let ProcessCostTotal = 0
      ProcessCostTotal = tempArrAfterDelete && tempArrAfterDelete.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      tempArr2 = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: tempArrAfterDelete,
      }

      let selectedIds = []
      let selectedMachineIds = []
      tempArrAfterDelete.map(el => {
        selectedIds.push(el.ProcessId)
        selectedMachineIds.push(el.MachineRateId)
        return null

      })
      setGridData(tempArrAfterDelete)
      setIds(selectedIds)
      setMachineIds(selectedMachineIds)
      setTabData(tempArr2)
      tempArrAfterDelete && tempArrAfterDelete.map((el, i) => {
        setValue(`${ProcessGridFields}.${i}.ProcessCost`, checkForDecimalAndNull(el.ProcessCost, initialConfiguration.NoOfDecimalForPrice))
        setValue(`${ProcessGridFields}.${i}.Quantity`, el.Quantity)
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
      })

      dispatch(setIdsOfProcessGroup(newArr))
    } else {
      let tempArr1 = selectedProcessId
      tempArr1 = tempArr1.filter((el) => el.ProcessId !== gridData[index].ProcessId)
      dispatch(setIdsOfProcess(tempArr1))
    }
  }

  const handleQuantityChange = (event, index) => {

    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value) && event.target.value !== '') {
      const ProcessCost = tempData.MHR * event.target.value
      tempData = {
        ...tempData,
        Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCost
      }
      let gridTempArr = Object.assign([...gridData], { [index]: tempData })

      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      let apiArr = formatMainArr(gridTempArr)
      // gridTempArr && gridTempArr.map((item) => {
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

      tempArr = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: apiArr,

      }
      setIsFromApi(false)
      setTabData(tempArr)
      setGridData(gridTempArr)
      setValue(`${ProcessGridFields}.${index}.ProcessCost`, checkForDecimalAndNull(ProcessCost, initialConfiguration.NoOfDecimalForPrice))
    } else {

      const ProcessCost = tempData.MHR * 0
      tempData = {
        ...tempData,
        Quantity: 0,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCost,
      }
      let gridTempArr = Object.assign([...gridData], { [index]: tempData })

      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      let apiArr = formatMainArr(gridTempArr)
      // gridTempArr && gridTempArr.map((item) => {
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

      tempArr = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }
      setIsFromApi(false)
      setTabData(tempArr)
      setGridData(gridTempArr)
      setTimeout(() => {
        setValue(`${ProcessGridFields}.${index}.Quantity`, "")
        setValue(`${ProcessGridFields}.${index}.ProcessCost`, "")
      }, 200)
      //Toaster.warning('Please enter valid number.')
    }
  }

  const handleQuantityChangeOfGroupProcess = (event, index, list, parentIndex) => {

    let tempArr = []
    let processTempData = gridData[parentIndex]
    let tempData = list[index]


    if (!isNaN(event.target.value) && event.target.value !== '') {
      const ProcessCost = tempData.MHR * event.target.value

      tempData = {
        ...tempData,
        Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCost
      }
      let gridTempArr = Object.assign([...list], { [index]: tempData })


      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {

        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      setValue(`${SingleProcessGridField}.${index}.ProcessCost`, checkForDecimalAndNull(ProcessCost, initialConfiguration.NoOfDecimalForPrice))
      //MAIN PROCESS ROW WITH GROUP

      processTempData = {
        ...processTempData,
        // Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCostTotal
      }
      let processTemparr = Object.assign([...gridData], { [parentIndex]: processTempData })
      let apiArr = formatMainArr(processTemparr)
      // processTemparr && processTemparr.map((item) => {
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
      setValue(`${ProcessGridFields}.${parentIndex}.ProcessCost`, checkForDecimalAndNull(ProcessCostTotal, initialConfiguration.NoOfDecimalForPrice))
    } else {

      const ProcessCost = tempData.MHR * 0
      tempData = {
        ...tempData,
        Quantity: 0,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCost,
      }
      let gridTempArr = Object.assign([...list], { [index]: tempData })

      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)
      setTimeout(() => {
        setValue(`${SingleProcessGridField}.${index}.Quantity`, "")
        setValue(`${SingleProcessGridField}.${index}.ProcessCost`, "")
      }, 200)

      //MAIN PROCESS ROW WITH GROUP
      processTempData = {
        ...processTempData,
        // Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCostTotal
      }
      let processTemparr = Object.assign([...gridData], { [parentIndex]: processTempData })

      let apiArr = formatMainArr(processTemparr)
      // processTemparr && processTemparr.map((item) => {
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

      tempArr = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,) + checkForNull(tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: apiArr,
      }
      setIsFromApi(false)
      setTabData(tempArr)
      setGridData(processTemparr)
      setValue(`${ProcessGridFields}.${parentIndex}.ProcessCost`, checkForDecimalAndNull(ProcessCostTotal, initialConfiguration.NoOfDecimalForPrice))



      //Toaster.warning('Please enter valid number.')
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
      NetConversionCost: OperationCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0,) + checkForNull(tabData && tabData.OtherOperationCostTotal !== null ? tabData.OtherOperationCostTotal : 0,),
      OperationCostTotal: OperationCostTotal,
      CostingOperationCostResponse: operationGrid,
      CostingProcessCostResponse: apiArr
    }

    setIsFromApi(false)
    setTabData(tempArr)
    // props.setOperationCost(tempArr, params, item)
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
      NetConversionCost: (OtherOperationCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0,) + checkForNull(tabData && tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,)).toFixed(10),
      OtherOperationCostTotal: OtherOperationCostTotal,
      CostingOtherOperationCostResponse: otherOperationGrid,
      CostingProcessCostResponse: apiArr
    }
    setIsFromApi(false)
    setTabData(tempArr)
    // props.setOtherOperationCost(tempArr, props.index, item)
  }



  /**
   * @method setRMCCErrors
   * @description CALLING TO SET BOP COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
   */
  if (Object.keys(errors).length > 0 && counter < 2) {
    dispatch(setRMCCErrors(errors))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    dispatch(setRMCCErrors({}))
    counter = 0
  }
  const ProcessGridFields = 'ProcessGridFields'
  const SingleProcessGridField = 'SingleProcessGridField'


  const renderSingleProcess = (process, parentIndex) => {
    return (
      process.ProcessList && process.ProcessList.map((item, index) => {
        return (
          <tr>
            <td>-</td>
            <td>{item.ProcessName}</td>
            <td>{item.Tonnage}</td>
            <td>{item.MHR}</td>
            <td>{item.UOM}</td>
            <td>{item.ProductionPerHour}</td>
            <td style={{ width: 150 }}>
              <span className="d-inline-block w90px mr-2">
                {
                  <NumberFieldHookForm
                    label=""
                    name={`${SingleProcessGridField}.${index}.Quantity`}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      //required: true,
                      pattern: {
                        value: /^[0-9]\d*(\.\d+)?$/i,
                        message: 'Invalid Number.',
                      },
                    }}
                    defaultValue={item.Quantity ? checkForDecimalAndNull(item.Quantity, trimForMeasurment,) : '1'}
                    className=""
                    customClassName={'withBorder'}
                    handleChange={(e) => {
                      e.preventDefault()
                      handleQuantityChangeOfGroupProcess(e, index, process.ProcessList, parentIndex)
                    }}

                    // errors={}
                    disabled={(CostingViewMode || IsLocked) ? true : false}
                  />
                }
              </span>
              <button
                className="CalculatorIcon cr-cl-icon calc-icon-middle"
                type={'button'}
                onClick={() => toggleWeightCalculator(index, process.ProcessList, parentIndex)}
              />
            </td>
            <td style={{ width: 100 }}>
              {
                <TextFieldHookForm
                  label=""
                  name={`${SingleProcessGridField}.${index}.ProcessCost`}
                  Controller={Controller}
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
              }
            </td>
            <td>
              <div className='action-btn-wrapper'>
                {/* {(!CostingViewMode && !IsLocked) && <button className="Delete" type={'button'} onClick={() => deleteItem(index)} />} */}
                <Popup trigger={<button id={`popUpTriggers${index}`} className="Comment-box" type={'button'} />}
                  position="top center">
                  <TextAreaHookForm
                    label="Remark:"
                    name={`${SingleProcessGridField}.${index}.remarkPopUp`}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      maxLength: {
                        value: 75,
                        message: "Remark should be less than 75 word"
                      },
                    }}
                    handleChange={(e) => { }}
                    defaultValue={item.Remark ?? item.Remark}
                    className=""
                    customClassName={"withBorder"}
                    errors={errors && errors.SingleProcessGridField && errors.SingleProcessGridField[index] !== undefined ? errors.SingleProcessGridField[index].remarkPopUp : ''}
                    //errors={errors && errors.remarkPopUp && errors.remarkPopUp[index] !== undefined ? errors.remarkPopUp[index] : ''}                        
                    disabled={(CostingViewMode || IsLocked) ? true : false}
                    hidden={false}
                  />
                  <Row>
                    <Col md="12" className='remark-btn-container'>
                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => onRemarkPopUpClickk(index)} > <div className='save-icon'></div> </button>
                      <button className='reset' onClick={() => onRemarkPopUpClosee(index)} > <div className='cancel-icon'></div></button>
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

  /**
   * @method render
   * @description Renders the component
   */

  return (
    <>
      <div className="user-page p-0">
        <Row>
          <Col md="12">
            <div className="left-border">{'Conversion Cost:'}</div>
          </Col>
        </Row>
        <div className="cr-process-costwrap">
          <Row className="cr-innertool-cost">

            <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Process Cost: ${tabData && tabData.ProcessCostTotal !== null ? checkForDecimalAndNull(tabData.ProcessCostTotal, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
            <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Operation Cost: ${tabData && tabData.OperationCostTotal !== null ? checkForDecimalAndNull(tabData.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
            <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Other Operation Cost: ${tabData && tabData.OtherOperationCostTotal !== null ? checkForDecimalAndNull(tabData.OtherOperationCostTotal, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
            <Col md="3" className="cr-costlabel"><span className="d-inline-block align-middle">{`Net Conversion Cost: ${tabData && tabData.NetConversionCost !== null ? checkForDecimalAndNull(tabData.NetConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
          </Row>

          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">{'Process Cost:'}</div>
            </Col>
            <Col md={'2'}>
              {(!CostingViewMode && !IsLocked) && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}
              >
                <div className={'plus'}></div>PROCESS
              </button>}
            </Col>
          </Row>

          <Row>
            {/*OPERATION COST GRID */}
            <Col md="12">
              <Table className="table cr-brdr-main costing-process-cost-section" size="sm">
                <thead>
                  <tr>
                    {processGroup && <th style={{ width: "150px" }}>{`Group Name`}</th>}
                    <th style={{ width: "150px" }}>{`Process Name`}</th>
                    <th style={{ width: "170px" }}>{`Machine Tonnage`}</th>
                    <th style={{ width: "220px" }}>{`Machine Rate`}</th>
                    <th style={{ width: "220px" }}>{`UOM`}</th>
                    <th style={{ width: "220px" }}>{`Part/Hour`}</th>
                    <th style={{ width: "220px" }}>{`Quantity`}</th>
                    <th style={{ width: "220px" }} >{`Net Cost`}</th>
                    <th style={{ width: "145px", textAlign: "right" }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData &&
                    gridData.map((item, index) => {
                      // if (item?.GroupName === '' || item?.GroupName === null) {

                      //   return (

                      //     renderSingleProcess(item)
                      //   )
                      // } else {
                      return (
                        <>
                          <tr key={index}>
                            {processGroup && <td className='text-overflow process-name'>
                              {
                                (item?.GroupName === '' || item?.GroupName === null) ? '' :
                                  <div onClick={() => {
                                    processAccObj[index] === true ? setProcessAccObj(prevState => ({ ...prevState, [index]: false })) : setProcessAccObj(prevState => ({ ...prevState, [index]: true }))
                                  }}
                                    className={`${processAccObj[index] ? 'Open' : 'Close'}`}></div>

                              }
                              <span title={item.ProcessName}>
                                {item?.GroupName === '' || item?.GroupName === null ? '-' : item.GroupName}</span>
                            </td>}
                            <td className='text-overflow'><span title={item.ProcessName}>{item.ProcessName}</span></td>
                            <td>{item.Tonnage ? checkForNull(item.Tonnage) : '-'}</td>
                            <td>{item.MHR}</td>
                            <td>{item.UOM}</td>
                            <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null || item?.ProductionPerHour === undefined) ? '-' : checkForDecimalAndNull(item.ProductionPerHour, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                            <td style={{ width: 150 }}>
                              {
                                item?.GroupName === '' || item?.GroupName === null ?
                                  <>
                                    <span className="d-inline-block w90px mr-2">
                                      {
                                        <NumberFieldHookForm
                                          label=""
                                          name={`${ProcessGridFields}.${index}.Quantity`}
                                          Controller={Controller}
                                          control={control}
                                          register={register}
                                          mandatory={false}
                                          rules={{
                                            //required: true,
                                            pattern: {
                                              value: /^[0-9]\d*(\.\d+)?$/i,
                                              message: 'Invalid Number.',
                                            },
                                          }}
                                          defaultValue={item.Quantity ? checkForDecimalAndNull(item.Quantity, trimForMeasurment,) : '1'}
                                          className=""
                                          customClassName={'withBorder'}
                                          handleChange={(e) => {
                                            e.preventDefault()
                                            handleQuantityChange(e, index)
                                          }}

                                          // errors={}
                                          disabled={(CostingViewMode || IsLocked) ? true : false}
                                        />
                                      }
                                    </span>
                                    <button
                                      className="CalculatorIcon cr-cl-icon calc-icon-middle"
                                      type={'button'}
                                      onClick={() => toggleWeightCalculator(index)}
                                    />
                                  </>
                                  : '-'

                              }
                            </td>
                            <td style={{ width: 100 }}>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${ProcessGridFields}.${index}.ProcessCost`}
                                  Controller={Controller}
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
                              }
                            </td>
                            <td>
                              <div className='action-btn-wrapper'>
                                {(!CostingViewMode && !IsLocked) && <button className="Delete" type={'button'} onClick={() => deleteItem(index)} />}
                                <Popup trigger={<button id={`popUpTriggers${index}`} className="Comment-box" type={'button'} />}
                                  position="top center">
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${ProcessGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      maxLength: {
                                        value: 75,
                                        message: "Remark should be less than 75 word"
                                      },
                                    }}
                                    handleChange={(e) => { }}
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
                                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => onRemarkPopUpClickk(index)} > <div className='save-icon'></div> </button>
                                      <button className='reset' onClick={() => onRemarkPopUpClosee(index)} > <div className='cancel-icon'></div></button>
                                    </Col>
                                  </Row>
                                </Popup>
                              </div>
                            </td>
                          </tr>
                          {processAccObj[index] && <>
                            {
                              renderSingleProcess(item, index)
                            }
                          </>}
                        </>
                      )
                      // }
                    })}
                  {gridData && gridData.length === 0 && (
                    <tr>
                      <td colSpan={12}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>

          <OperationCost
            data={props.data && props.data.CostingOperationCostResponse}
            setOperationCost={setOperationCost}
            item={props.item}
            IsAssemblyCalculation={false}
          />

          <OperationCostExcludedOverhead
            data={props.data && props.data.CostingOtherOperationCostResponse}
            setOtherOperationCost={setOtherOperationCost}
            item={props.item}
            IsAssemblyCalculation={false}
          />



        </div>
      </div>
      {isDrawerOpen && (
        <AddProcess
          isOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
          Ids={Ids}
          MachineIds={MachineIds}
        />
      )}
      {isCalculator && (
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
      )}
    </>
  )
}

export default ProcessCost

