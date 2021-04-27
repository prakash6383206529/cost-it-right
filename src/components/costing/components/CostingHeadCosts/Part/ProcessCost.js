import React, { useState, useEffect, useContext, useWatch } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import Switch from "react-switch";
import OperationCost from './OperationCost';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import ToolCost from './ToolCost';
import AddProcess from '../../Drawers/AddProcess';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import VariableMhrDrawer from '../../Drawers/processCalculatorDrawer/VariableMhrDrawer'
import { getProcessCalculation } from '../../../actions/CostWorking';
import { setIsToolCostUsed } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';

function ProcessCost(props) {
  const { data } = props

  const { register, control, errors, setValue } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const [gridData, setGridData] = useState(data && data.CostingProcessCostResponse)

  const trimValue = getConfigurationKey()
  const trimForMeasurment = trimValue.NumberOfDecimalForWeightCalculation
  const trimForCost = trimValue.NumberOfDecimalForPOPrice
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [calciIndex, setCalciIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const [Ids, setIds] = useState([])
  const [isOpen, setIsOpen] = useState(data && data.IsShowToolCost)
  const [tabData, setTabData] = useState(props.data)
  const [tabToolData, setTabToolData] = useState(props.data)
  const [isCalculator, setIsCalculator] = useState(false)
  const [calculatorData, setCalculatorData] = useState({})

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  // const fieldValues = useWatch({
  //   control,
  //   name: ['ProcessGridFields'],
  //   //defaultValue: 'default' // default value before the render
  // })

  useEffect(() => {
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    props.setProcessCost(tabData, Params)
  }, [tabData]);

  /**
   * @method toggleWeightCalculator
   * @description For opening weight calculator
  */
  const toggleWeightCalculator = (id) => {
    setCalciIndex(id)
    let tempArr = []
    let tempData = gridData[id]
    // const calciData = gridData[id]

    /****************************FOR SENDING CALCULATED VALUE IN CALCULATOR**************************/
    dispatch(getProcessCalculation(costData.CostingId, tempData.ProcessId, tempData.ProcessCalculationId, costData.TechnologyId, 'default', res => {
      if (res && res.data && res.data.Data) {
        const data = res.data.Data
        tempData = { ...tempData, WeightCalculatorRequest: data, }
        tempArr = Object.assign([...gridData], { [id]: tempData })
        setTimeout(() => {
          setGridData(tempArr)
          setIsCalculator(true)
        }, 100)
      }
    }))
    // setCalculatorData(calciData)

  }

  const closeCalculatorDrawer = (e, value, weightData = {}) => {
    setIsCalculator(false)
    let tempData = gridData[calciIndex]
    let time
    let netCost
    let tempArray
    let tempArr2 = [];
    //********************************THIS CALCULATION IS FOR MACHINING TECHNOLOGY ,WIIL BE USED LATER DEPEND ON REQUIREMENT******************************************* */
    // if (value === '0.00' && tempData.Quantity !== '0.00') {
    //   tempData = {
    //     ...tempData,
    //     WeightCalculatorRequest: weightData
    //   }
    // } else {
    //   if (tempData.UOM === 'Hours') {
    //     time = value === '0.00' ? '0.00' : checkForDecimalAndNull(value / 60, initialConfiguration.NoOfDecimalForPrice)
    //     netCost = value === '0.00' ? '0.00' : value * Number(tempData.MHR)
    //   } else {
    //     time = value === '0.00' ? '0.00' : value
    //     netCost = value === '0.00' ? '0.00' : value * Number(tempData.MHR)
    //   }
    tempData = {
      ...tempData,
      Quantity: weightData.Quantity,
      ProcessCost: weightData.ProcessCost,
      IsCalculatedEntry: true,
      ProcessCalculationId: weightData.ProcessCalculationId,
      WeightCalculatorRequest: weightData
    }


    tempArray = Object.assign([...gridData], { [calciIndex]: tempData })

    let ProcessCostTotal = 0
    ProcessCostTotal = tempArray && tempArray.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ProcessCost)
    }, 0)

    tempArr2 = {
      ...tabData,
      NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,),
      ProcessCostTotal: ProcessCostTotal,
      CostingProcessCostResponse: tempArray,
    }

    setTimeout(() => {
      setTabData(tempArr2)
      setGridData(tempArray)
      setValue(`${ProcessGridFields}[${calciIndex}]Quantity`, weightData.Quantity)
      setValue(`${ProcessGridFields}[${calciIndex}]ProcessCost`, weightData.ProcessCost)
    }, 100)
  }

  /**
   * @method onToolToggle
   * @description TOOL COST TOGGLE
   */
  const onToolToggle = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    dispatch(setIsToolCostUsed(isOpen))
  }, [isOpen])

  /**
   * @method DrawerToggle
   * @description TOGGLE DRAWER
   */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    let tempArr2 = [];
    if (Object.keys(rowData).length > 0) {
      let rowArray = rowData && rowData.map((el) => {
        return {
          ProcessId: el.ProcessId,
          ProcessDetailId: '',
          MachineId: el.MachineId,
          MachineRateId: el.MachineRateId,
          MHR: el.MachineRate,
          ProcessName: el.ProcessName,
          ProcessDescription: el.Description,
          MachineName: el.MachineName,
          UOM: el.UnitOfMeasurement,
          UnitOfMeasurementId: el.UnitOfMeasurementId,
          MachineTonnage: el.MachineTonnage,
          ProcessCost: el.MachineRate * 1,
          UOMType: el.UnitType,
          UOMTypeId: el.UnitTypeId
        }
      })

      let tempArr = [...gridData, ...rowArray]

      let ProcessCostTotal = 0
      ProcessCostTotal = tempArr && tempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      tempArr2 = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: tempArr,
      }

      setGridData(tempArr)
      setTabData(tempArr2)
      selectedIds(tempArr)
    }
    setDrawerOpen(false)
  }

  /**
   * @method selectedIds
   * @description SELECTED IDS
   */
  const selectedIds = (tempArr) => {
    tempArr && tempArr.map((el) => {
      if (Ids.includes(el.MachineRateId) === false) {
        let selectedIds = Ids
        selectedIds.push(el.MachineRateId)
        setIds(selectedIds)
      }
      return null
    })
  }

  const deleteItem = (index) => {
    let tempArr2 = [];
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false
      return true
    })


    let ProcessCostTotal = 0
    ProcessCostTotal = tempArr && tempArr.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.ProcessCost)
    }, 0)

    tempArr2 = {
      ...tabData,
      NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,),
      ProcessCostTotal: ProcessCostTotal,
      CostingProcessCostResponse: tempArr,
    }

    let id = []
    tempArr.map(el => { id.push(el.MachineRateId) })
    setIds(id)
    setTabData(tempArr2)
    setGridData(tempArr)
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    if (editIndex !== '') {
      let tempArr = Object.assign([...gridData], { [editIndex]: rowObjData })
      setGridData(tempArr)
    }
    setEditIndex(index)
    setRowObjData(tempArr)
  }

  const SaveItem = (index) => {
    setEditIndex('')
  }

  const CancelItem = (index) => {
    let tempArr = Object.assign([...gridData], { [index]: rowObjData })
    setEditIndex('')
    setGridData(tempArr)
    setRowObjData({})
  }

  const handleCycleTimeChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const Cavity = tempData.Cavity !== undefined ? checkForNull(tempData.Cavity) : 0
      const Efficiency = tempData.Efficiency !== undefined ? checkForNull(tempData.Efficiency) : 0;
      const Quantity = (((event.target.value / 3600) * 100) / Efficiency) * Cavity;
      const ProcessCost = tempData.MHR / parseInt(Quantity)

      tempData = {
        ...tempData,
        Quantity: parseInt(Quantity),
        CycleTime: checkForNull(event.target.value),
        ProcessCost: ProcessCost,
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  const handleEfficiencyChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const Cavity = tempData.Cavity !== undefined ? checkForNull(tempData.Cavity) : 0;
      const Quantity = (((tempData.CycleTime / 3600) * 100) / event.target.value) * Cavity;
      const ProcessCost = tempData.MHR / parseInt(Quantity)

      tempData = {
        ...tempData,
        Efficiency: checkForNull(event.target.value),
        ProcessCost: ProcessCost,
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  const handleCavityChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const Efficiency = tempData.Efficiency !== undefined ? checkForNull(tempData.Efficiency) : 0
      const CycleTime = tempData.CycleTime !== undefined ? checkForNull(tempData.CycleTime) : 0

      const Quantity = (((CycleTime / 3600) * 100) / Efficiency) * event.target.value
      const ProcessCost = tempData.MHR / parseInt(Quantity)

      tempData = {
        ...tempData,
        Cavity: checkForNull(event.target.value),
        ProcessCost: ProcessCost,
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  const handleQunatity = (event, index) => {
    let tempData = gridData[index]
    let netCost = Number(event.target.value) * Number(tempData.MHR)
    tempData = {
      ...tempData,
      Quantity: event.target.value,
      ProcessCost: netCost,
    }
    let gridTempArr = Object.assign([...gridData], { [index]: tempData })
    setTimeout(() => {
      setTabData(gridTempArr)
      setGridData(gridTempArr)
      setValue(`${ProcessGridFields}[${index}]ProcessCost`, netCost)
    }, 100)
  }

  const handleQuantityChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const ProcessCost = tempData.MHR * event.target.value
      tempData = {
        ...tempData,
        Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProcessCost: ProcessCost,
      }
      let gridTempArr = Object.assign([...gridData], { [index]: tempData })

      let ProcessCostTotal = 0
      ProcessCostTotal = gridTempArr && gridTempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.ProcessCost)
      }, 0)

      tempArr = {
        ...tabData,
        NetConversionCost: ProcessCostTotal + checkForNull(tabData.OperationCostTotal !== null ? tabData.OperationCostTotal : 0,),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: gridTempArr,
      }

      setTabData(tempArr)
      setGridData(gridTempArr)
      setValue(`${ProcessGridFields}[${index}]ProcessCost`, ProcessCost)
    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
   * @method setOperationCost
   * @description SET BOP COST
   */
  const setOperationCost = (operationGrid, index) => {
    let OperationCostTotal = 0
    OperationCostTotal = operationGrid && operationGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.OperationCost)
    }, 0)

    let tempArr = {
      ...tabData,
      NetConversionCost: OperationCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0,),
      OperationCostTotal: OperationCostTotal,
      CostingOperationCostResponse: operationGrid,
    }

    setTabData(tempArr)
    props.setOperationCost(tempArr, props.index)
  }

  /**
   * @method setToolCost
   * @description SET TOOL COST
   */
  const setToolCost = (toolGrid, Params) => {
    let ToolsCostTotal = 0
    ToolsCostTotal = toolGrid && toolGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalToolCost)
    }, 0)

    let tempObj = {
      ...tabData,
      //NetConversionCost: ToolsCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0),
      IsShowToolCost: true,
      ToolsCostTotal: checkForDecimalAndNull(ToolsCostTotal, initialConfiguration.NoOfDecimalForPrice),
      CostingToolsCostResponse: toolGrid,
    }
    props.setToolCost(tempObj, Params)
  }

  const ProcessGridFields = 'ProcessGridFields'

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
            <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{`Operation Cost: ${tabData && tabData.OperationCostTotal !== null ? checkForDecimalAndNull(tabData.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
            <Col md="3" className="cr-costlabel text-center"><span className="d-inline-block align-middle">{`Net Conversion Cost: ${tabData && tabData.NetConversionCost !== null ? checkForDecimalAndNull(tabData.NetConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>

            <Col md="3" className="switch cr-costlabel text-right">
              {/* DISABLED FOR FUTURE SCOPE 03-03-2021 */}

              <label className="switch-level d-inline-flex w-auto">
                <div className={'left-title'}>{''}</div>
                <Switch
                  onChange={onToolToggle}
                  checked={isOpen}
                  id="normal-switch"
                  disabled={false}
                  background="#4DC771"
                  onColor="#4DC771"
                  onHandleColor="#ffffff"
                  offColor="#CCC"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={46}
                />
                <div className={'right-title'}>Show Tool Cost</div>
              </label>
            </Col>
          </Row>

          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">{'Process Cost:'}</div>
            </Col>
            <Col md={'2'}>
              {!CostingViewMode && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}
              >
                <div className={'plus'}></div>ADD PROCESS
              </button>}
            </Col>
          </Row>

          <Row>

            {/*OPERATION COST GRID */}
            <Col md="12">
              <Table className="table cr-brdr-main costing-process-cost-section" size="sm">
                <thead>
                  <tr>
                    <th>{`Process Name`}</th>
                    <th>{`Process Description`}</th>
                    <th>{`Machine Name`}</th>
                    <th style={{ width: "220px" }}>{`Machine Rate`}</th>
                    <th style={{ width: "220px" }}>{`UOM`}</th>
                    <th style={{ width: "220px" }}>{`Quantity`}</th>
                    <th style={{ width: "220px" }} >{`Net Cost`}</th>
                    <th style={{ width: "145px" }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData &&
                    gridData.map((item, index) => {
                      //                     return editIndex === index ? (
                      //                       <tr key={index}>
                      //                         <td>{item.ProcessName}</td>
                      //                         <td>{item.ProcessDescription}</td>
                      //                         <td>{item.MachineName}</td>
                      //                         <td>{item.MachineRate}</td>
                      //                         <td>{item.UOM}</td>
                      //                         {/* <td>{item.Time ? item.Time : '0.00'}</td> */}
                      //                         {/* <td>{item.NetCost? item.NetCost : '0.00'}</td> */}

                      //                         <td style={{ width: 200 }}>
                      //                           {
                      //                             <TextFieldHookForm
                      //                               label=""
                      //                               name={`${ProcessGridFields}[${index}]Time`}
                      //                               Controller={Controller}
                      //                               control={control}
                      //                               register={register}
                      //                               mandatory={false}
                      //                               // rules={{
                      //                               //   //required: true,
                      //                               //   pattern: {
                      //                               //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //                               //     message: 'Invalid Number.',
                      //                               //   },
                      //                               // }}
                      //                               defaultValue={item.Time ? item.Time : '0.00'}
                      //                               className=""
                      //                               customClassName={'withBorder'}
                      //                               handleChange={(e) => {
                      //                                 e.preventDefault()
                      //                                 // handleCycleTimeChange(e, index)
                      //                               }}
                      //                               // errors={}
                      //                               disabled={true}
                      //                             />
                      //                           }
                      //                         </td>

                      //                         <td style={{ width: 200 }}>
                      //                           {
                      //                             <TextFieldHookForm
                      //                               label=""
                      //                               name={`${ProcessGridFields}[${index}]NetCost`}
                      //                               Controller={Controller}
                      //                               control={control}
                      //                               register={register}
                      //                               mandatory={false}
                      //                               // rules={{
                      //                               //   //required: true,
                      //                               //   pattern: {
                      //                               //     value: /^[1-9]*$/i,
                      //                               //     //value: /^[0-9]\d*(\.\d+)?$/i,
                      //                               //     message: 'Invalid Number.',
                      //                               //   },
                      //                               // }}
                      //                               defaultValue={
                      //                                 item.NetCost ? item.NetCost : '0.00'
                      //                               }
                      //                               className=""
                      //                               customClassName={'withBorder'}
                      //                               handleChange={(e) => {
                      //                                 e.preventDefault()
                      //                                 // handleEfficiencyChange(e, index)
                      //                               }}
                      //                               // errors={}
                      //                               disabled={true}
                      //                             />
                      //                           }
                      //                         </td>

                      //                         <td style={{ width: 200 }}>
                      //                           {
                      //                             <TextFieldHookForm
                      //                               label=""
                      //                               name={`${ProcessGridFields}[${index}]NetCost`}
                      //                               Controller={Controller}
                      //                               control={control}
                      //                               register={register}
                      //                               mandatory={false}
                      //                               rules={{
                      //                                 //required: true,
                      //                                 pattern: {
                      //                                   value: /^[1-9]*$/i,
                      //                                   //value: /^[0-9]\d*(\.\d+)?$/i,
                      //                                   message: 'Invalid Number.',
                      //                                 },
                      //                               }}
                      //                               defaultValue={item.NetCost}
                      //                               className=""
                      //                               customClassName={'withBorder'}
                      //                               handleChange={(e) => {
                      //                                 e.preventDefault()
                      //                                 //handleCavityChange(e, index)
                      //                               }}
                      //                               // errors={
                      //                               //   errors &&
                      //                               //   errors.ProcessGridFields &&
                      //                               //   errors.ProcessGridFields[index] !== undefined
                      //                               //     ? errors.ProcessGridFields[index]
                      //                               //         .GrossWeight
                      //                               //     : ''
                      //                               // }
                      //                               disabled={true}
                      //                             />
                      //                           }
                      //                         </td>
                      //                         {/*
                      //                         <td style={{ width: 200 }}>
                      //                           {
                      //                             <TextFieldHookForm
                      //                               label=""
                      //                               name={`${ProcessGridFields}[${index}]Quantity`}
                      //                               Controller={Controller}
                      //                               control={control}
                      //                               register={register}
                      //                               mandatory={false}
                      //                               rules={{
                      //                                 //required: true,
                      //                                 pattern: {
                      //                                   value: /^[0-9]\d*(\.\d+)?$/i,
                      //                                   message: 'Invalid Number.',
                      //                                 },
                      //                               }}
                      //                               defaultValue={item.Quantity}
                      //                               className=""
                      //                               customClassName={'withBorder'}
                      //                               handleChange={(e) => {
                      //                                 e.preventDefault()
                      //                                 handleQuantityChange(e, index)
                      //                               }}
                      //                               errors={
                      //                                 errors &&
                      //                                 errors.ProcessGridFields &&
                      //                                 errors.ProcessGridFields[index] !== undefined
                      //                                   ? errors.ProcessGridFields[index].Quantity
                      //                                   : ''
                      //                               }
                      //                               disabled={false}
                      //                             />
                      //                           }
                      //                         </td>

                      // */}

                      //                         {/* <td>
                      //                           {item.ProcessCost
                      //                             ? checkForDecimalAndNull(item.ProcessCost, initialConfiguration.NoOfDecimalForPrice)
                      //                             : 0}
                      //                         </td> */}
                      //                         <td>
                      //                           <button
                      //                             className="SaveIcon mt15 mr-2"
                      //                             type={'button'}
                      //                             onClick={() => SaveItem(index)}
                      //                           />
                      //                           <button
                      //                             className="CancelIcon mt15"
                      //                             type={'button'}
                      //                             onClick={() => CancelItem(index)}
                      //                           />
                      //                         </td>
                      //                       </tr>
                      //                     ) :
                      return (
                        <tr key={index}>
                          <td>{item.ProcessName}</td>
                          <td>{item.ProcessDescription ? item.ProcessDescription : '-'}</td>
                          <td>{item.MachineName ? item.MachineName : '-'}</td>
                          <td>{item.MHR}</td>
                          <td>{item.UOM}</td>
                          <td style={{ width: 150 }}>
                            <span className="d-inline-block w90px mr-2">
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${ProcessGridFields}[${index}]Quantity`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  // rules={{
                                  //   //required: true,
                                  //   pattern: {
                                  //     value: /^[0-9]\d*(\.\d+)?$/i,
                                  //     message: 'Invalid Number.',
                                  //   },
                                  // }}
                                  defaultValue={item.Quantity ? checkForDecimalAndNull(item.Quantity, trimForMeasurment,) : '1'}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleQuantityChange(e, index)
                                    // handleCycleTimeChange(e, index)
                                  }}

                                  // errors={}
                                  disabled={CostingViewMode ? true : false}
                                />
                              }
                            </span>
                            <button
                              className="CalculatorIcon cr-cl-icon calc-icon-middle"
                              type={'button'}
                              onClick={() => toggleWeightCalculator(index)}
                            />
                          </td>
                          {/* <td>
                            <span className={'mr-2'}>
                              {item.Quantity
                                ? checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForPrice)
                                : '0.00'}
                            </span>
                            <button
                              className="CalculatorIcon cr-cl-icon height-auto"
                              type={'button'}
                              onClick={() => toggleWeightCalculator(index)}
                            />
                          </td> */}
                          {/* <td>{item.NetCost}</td> */}
                          {/* <td>{item.CycleTime ? item.CycleTime : '-'}</td>
                          <td>{item.Efficiency ? item.Efficiency : '-'}</td>
                          <td>{item.Cavity ? item.Cavity : '-'}</td>
                          <td>{item.Quantity}</td> */}
                          <td style={{ width: 100 }}>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${ProcessGridFields}[${index}]ProcessCost`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                // rules={{
                                //   //required: true,
                                //   pattern: {
                                //     value: /^[0-9]\d*(\.\d+)?$/i,
                                //     message: 'Invalid Number.',
                                //   },
                                // }}
                                defaultValue={item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, trimForCost,) : '0.00'}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  //handleCycleTimeChange(e, index)
                                  //closeCalculatorDrawer()
                                }}
                                // errors={}
                                disabled={true}
                              />
                            }
                            {/* {item.NetCost
                              ? checkForDecimalAndNull(item.NetCost, initialConfiguration.NoOfDecimalForPrice)
                              : '0.00'}{' '} */}
                            {/* <button
                              className="CalculatorIcon cr-cl-icon mt15"
                              type={"button"}
                              onClick={() => toggleWeightCalculator(index)}
                            /> */}
                          </td>
                          <td>
                            {/* <button
                              className="Edit mt15 mr-2"
                              type={"button"}
                              onClick={() => editItem(index)}
                            /> */}
                            {!CostingViewMode && <button className="Delete" type={'button'} onClick={() => deleteItem(index)} />}
                          </td>
                        </tr>
                      )
                    })}
                  {gridData && gridData.length === 0 && (
                    <tr>
                      <td colSpan={12}>
                        <NoContentFound title={CONSTANT.EMPTY_DATA} />
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
          {isOpen && (
            <ToolCost
              data={props.data && props.data.CostingToolsCostResponse}
              setToolCost={setToolCost}
              item={props.item}
              IsAssemblyCalculation={false}

            />
          )}
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
        />
      )}
      {isCalculator && (
        <VariableMhrDrawer
          technology={costData.ETechnologyType}
          calculatorData={gridData[calciIndex]}
          isOpen={isCalculator}
          rmFinishWeight={props.rmFinishWeight}
          closeDrawer={closeCalculatorDrawer}
          anchor={'right'}
        />
      )}
    </>
  )
}

export default ProcessCost
