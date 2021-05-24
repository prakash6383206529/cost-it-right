import React, { useState, useEffect, useContext, useWatch } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import Switch from "react-switch";
import OperationCost from './OperationCost';
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import ToolCost from './ToolCost';
import AddProcess from '../../Drawers/AddProcess';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import VariableMhrDrawer from '../../Drawers/processCalculatorDrawer/VariableMhrDrawer'
import { getProcessCalculation } from '../../../actions/CostWorking';
import { gridDataAdded, setIsToolCostUsed, setRMCCErrors } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import { HOUR } from '../../../../../config/constants';

let counter = 0;
function ProcessCost(props) {
  const { data } = props

  const { register, control, errors, setValue } = useForm({
    mode: 'onChange',
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
  const { CostingEffectiveDate } = useSelector(state => state.costing)

  // const fieldValues = useWatch({
  //   control,
  //   name: ['ProcessGridFields'],
  //   //defaultValue: 'default' // default value before the render
  // })

  useEffect(() => {
    selectedIds(gridData)
  }, [gridData])

  useEffect(() => {
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    if (!CostingViewMode) {
      props.setProcessCost(tabData, Params)
    }
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
    if (Object.keys(weightData).length === 0) return false;

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
      Quantity: weightData.UOM === HOUR ? checkForNull(weightData.ProcessCost / weightData.MachineRate) : weightData.Quantity,
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
      setValue(`${ProcessGridFields}[${calciIndex}]Quantity`, weightData.UOM === HOUR ? checkForDecimalAndNull((weightData.ProcessCost / weightData.MachineRate), getConfigurationKey().NoOfDecimalForPrice) : weightData.Quantity)
      setValue(`${ProcessGridFields}[${calciIndex}]ProcessCost`, checkForDecimalAndNull(weightData.ProcessCost, getConfigurationKey().NoOfDecimalForPrice))
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
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
          Tonnage: el.MachineTonnage,
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
      dispatch(gridDataAdded(true))
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
      if (i === index) return false;
      return true
    })


    setTimeout(() => {
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
      tempArr && tempArr.map((el, i) => {
        setValue(`${ProcessGridFields}[${i}]ProcessCost`, el.ProcessCost)
      })
    }, 200)
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

    if (!isNaN(event.target.value) && event.target.value !== '') {
      const ProcessCost = tempData.MHR * event.target.value
      tempData = {
        ...tempData,
        Quantity: event.target.value,
        IsCalculatedEntry: false,
        ProcessCost: checkForDecimalAndNull(ProcessCost, initialConfiguration.NoOfDecimalForPrice),
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

      const ProcessCost = tempData.MHR * 0
      tempData = {
        ...tempData,
        Quantity: 0,
        IsCalculatedEntry: false,
        ProcessCost: checkForDecimalAndNull(ProcessCost, initialConfiguration.NoOfDecimalForPrice),
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
      setTimeout(() => {
        setValue(`${ProcessGridFields}[${index}]Quantity`, 0)
        setValue(`${ProcessGridFields}[${index}]ProcessCost`, 0)
      }, 200)
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

            <Col md="4" className="cr-costlabel"><span className="d-inline-block align-middle">{`Process Cost: ${tabData && tabData.ProcessCostTotal !== null ? checkForDecimalAndNull(tabData.ProcessCostTotal, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
            <Col md="4" className="cr-costlabel"><span className="d-inline-block align-middle">{`Operation Cost: ${tabData && tabData.OperationCostTotal !== null ? checkForDecimalAndNull(tabData.OperationCostTotal, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
            <Col md="4" className="cr-costlabel"><span className="d-inline-block align-middle">{`Net Conversion Cost: ${tabData && tabData.NetConversionCost !== null ? checkForDecimalAndNull(tabData.NetConversionCost, initialConfiguration.NoOfDecimalForPrice) : 0}`}</span></Col>
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
                    <th>{`Machine Tonnage`}</th>
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
                      return (
                        <tr key={index}>
                          <td>{item.ProcessName}</td>
                          <td>{item.Tonnage ? checkForNull(item.Tonnage) : '-'}</td>
                          <td>{item.MHR}</td>
                          <td>{item.UOM}</td>
                          <td style={{ width: 150 }}>
                            <span className="d-inline-block w90px mr-2">
                              {
                                <NumberFieldHookForm
                                  label=""
                                  name={`${ProcessGridFields}[${index}]Quantity`}
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
                                  disabled={CostingViewMode ? true : false}
                                />
                              }
                            </span>
                            {!CostingViewMode && <button
                              className="CalculatorIcon cr-cl-icon calc-icon-middle"
                              type={'button'}
                              onClick={() => toggleWeightCalculator(index)}
                            />}
                          </td>

                          <td style={{ width: 100 }}>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${ProcessGridFields}[${index}]ProcessCost`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                defaultValue={item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, trimForCost,) : '0.00'}
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
                            {!CostingViewMode && <button className="Delete" type={'button'} onClick={() => deleteItem(index)} />}
                          </td>
                        </tr>
                      )
                    })}
                  {gridData && gridData.length === 0 && (
                    <tr>
                      <td colSpan={8}>
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
