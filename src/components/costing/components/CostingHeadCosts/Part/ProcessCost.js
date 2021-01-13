import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { Col, Row, Table } from 'reactstrap'
import Switch from 'react-switch'
import OperationCost from './OperationCost'
import { TextFieldHookForm } from '../../../../layout/HookFormInputs'
import ToolCost from './ToolCost'
import AddProcess from '../../Drawers/AddProcess'
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper'
import NoContentFound from '../../../../common/NoContentFound'
import { CONSTANT } from '../../../../../helper/AllConastant'
import { toastr } from 'react-redux-toastr'
import VariableMhrDrawer from '../../Drawers/processCalculatorDrawer/VariableMhrDrawer'

function ProcessCost(props) {
  const { data } = props
  console.log(data)

  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  // const [gridData, setGridData] = useState(
  //   data && data.CostingProcessCostResponse,
  // )
  // temporary purpose
  const [gridData, setGridData] = useState([
    {
      ProcessId: '',
      ProcessDetailId: '',
      MachineId: '',
      MachineRateId: '',
      ProcessName: 'Facing',
      ProcessDescription: 'LoreumIpsum',
      MachineName: 'Machine 1',
      UOM: 'Hours',
      Quantity: '0.00',
      MachineRate: '123.023',
      NetCost: '',
    },
    {
      ProcessId: '',
      ProcessDetailId: '',
      MachineId: '',
      MachineRateId: '',
      ProcessName: 'Face Milling',
      ProcessDescription: 'LoreumIpsum',
      MachineName: 'Machine 1',
      UOM: 'Hours',
      Quantity: '0.00',
      MachineRate: '125.023',
      NetCost: '',
    },
  ])
  console.log('grid data', gridData)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [calciIndex, setCalciIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const [Ids, setIds] = useState([])
  const [isOpen, setIsOpen] = useState(data && data.IsShowToolCost)
  const [tabData, setTabData] = useState(props.data)
  const [isCalculator, setIsCalculator] = useState(false)
  const [calculatorData, setCalculatorData] = useState({})
  const fieldValues = useWatch({
    control,
    name: ['ProcessGridFields'],
    //defaultValue: 'default' // default value before the render
  })

  // This is for temporary
  // useEffect(() => {
  //   props.setProcessCost(tabData, props.index)
  // }, [tabData])
  const toggleWeightCalculator = (id) => {
    console.log(id, 'id of calculator')
    setCalciIndex(id)
    const calciData = gridData[id]
    console.log(calciData, 'Calaci Data')
    setCalculatorData(calciData)
    setIsCalculator(true)
  }

  const closeCalculatorDrawer = (e, formValue) => {
    setIsCalculator(false)
    console.log(formValue, 'Form Value', calciIndex)
    let tempData = gridData[calciIndex]
    let time
    let netCost
    let tempArray
    if (tempData.UOM === 'Hours') {
      time = formValue / 60
      netCost =
        formValue === '0.00' ? '0.00' : time * Number(tempData.MachineRate)
    } else {
      time = formValue
      netCost =
        formValue === '0.00' ? '0.00' : time * Number(tempData.MachineRate)
    }
    tempData = {
      ...tempData,
      Quantity: time,
      NetCost: netCost,
      // ProcessId: tempData.ProcessId,
      // ProcessDetailId: tempData.ProcessDetailId,
      // MachineId: tempData.MachineId,
      // MachineRateId: tempData.MachineRateId,
      // ProcessName: tempData.ProcessName,
      // UOM: tempData.UOM,
      // ProcessDescription: tempData.ProcessDescription,
      // MachineName: tempData.MachineName,
      // Quantity: time,
      // MachineRate: tempData.MachineRate,

      // NetCost: netCost,
    }
    console.log(tempData, 'TEmpSata')
    tempArray = Object.assign([...gridData], { [calciIndex]: tempData })
    console.log(tempArray, 'Temporary Array')
    setGridData(tempArray)
  }
  /**
   * @method onToolToggle
   * @description TOOL COST TOGGLE
   */
  const onToolToggle = () => {
    setIsOpen(!isOpen)
  }

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
    if (Object.keys(rowData).length > 0) {
      let rowArray =
        rowData &&
        rowData.map((el) => {
          return {
            ProcessId: el.ProcessId,
            ProcessDetailId: '',
            MachineId: el.MachineId,
            MachineRateId: el.MachineRateId,
            MachineRate: '123.023',
            ProcessName: el.ProcessName,
            ProcessDescription: el.Description,
            MachineName: el.MachineName,
            UOM: el.UnitOfMeasurement,

            ProcessCost: '',
          }
        })

      let tempArr = [...gridData, ...rowArray]
      setGridData(tempArr)
      selectedIds(tempArr)
    }
    setDrawerOpen(false)
  }

  /**
   * @method selectedIds
   * @description SELECTED IDS
   */
  const selectedIds = (tempArr) => {
    tempArr &&
      tempArr.map((el) => {
        if (Ids.includes(el.MachineRateId) === false) {
          let selectedIds = Ids
          selectedIds.push(el.MachineRateId)
          setIds(selectedIds)
        }
        return null
      })
  }

  const deleteItem = (index) => {
    let tempArr =
      gridData &&
      gridData.filter((el, i) => {
        if (i === index) return false
        return true
      })
    selectedIds(tempArr)
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
      const Cavity =
        tempData.Cavity !== undefined ? checkForNull(tempData.Cavity) : 0
      const Efficiency =
        tempData.Efficiency !== undefined
          ? checkForNull(tempData.Efficiency)
          : 0
      const Quantity =
        (((event.target.value / 3600) * 100) / Efficiency) * Cavity
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
      const Cavity =
        tempData.Cavity !== undefined ? checkForNull(tempData.Cavity) : 0
      const Quantity =
        (((tempData.CycleTime / 3600) * 100) / event.target.value) * Cavity
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
      const Efficiency =
        tempData.Efficiency !== undefined
          ? checkForNull(tempData.Efficiency)
          : 0
      const CycleTime =
        tempData.CycleTime !== undefined ? checkForNull(tempData.CycleTime) : 0

      const Quantity =
        (((CycleTime / 3600) * 100) / Efficiency) * event.target.value
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

  const handleQuantityChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const ProcessCost = tempData.MHR / parseInt(event.target.value)
      tempData = {
        ...tempData,
        Quantity: parseInt(event.target.value),
        ProcessCost: ProcessCost,
      }
      let gridTempArr = Object.assign([...gridData], { [index]: tempData })

      let ProcessCostTotal = 0
      ProcessCostTotal =
        gridTempArr &&
        gridTempArr.reduce((accummlator, el) => {
          return accummlator + checkForNull(el.ProcessCost)
        }, 0)

      tempArr = {
        ...tabData,
        NetConversionCost:
          ProcessCostTotal +
          checkForNull(
            tabData.OperationCostTotal !== null
              ? tabData.OperationCostTotal
              : 0,
          ),
        ProcessCostTotal: ProcessCostTotal,
        CostingProcessCostResponse: gridTempArr,
      }

      setTabData(tempArr)
      setGridData(gridTempArr)
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
    OperationCostTotal =
      operationGrid &&
      operationGrid.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.OperationCost)
      }, 0)

    let tempArr = {
      ...tabData,
      NetConversionCost:
        OperationCostTotal +
        checkForNull(
          tabData && tabData.ProcessCostTotal !== null
            ? tabData.ProcessCostTotal
            : 0,
        ),
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
  const setToolCost = (toolGrid, index) => {
    let ToolsCostTotal = 0
    ToolsCostTotal =
      toolGrid &&
      toolGrid.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.TotalToolCost)
      }, 0)

    let tempArr = {
      ...tabData,
      //NetConversionCost: ToolsCostTotal + checkForNull(tabData && tabData.ProcessCostTotal !== null ? tabData.ProcessCostTotal : 0),
      IsShowToolCost: true,
      ToolsCostTotal: checkForDecimalAndNull(ToolsCostTotal, 2),
      CostingToolsCostResponse: toolGrid,
    }

    setTabData(tempArr)
    props.setToolCost(tempArr, props.index)
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
            <Col md="3" className="cr-costlabel">{`Process Cost: ${
              tabData && tabData.ProcessCostTotal !== null
                ? checkForDecimalAndNull(tabData.ProcessCostTotal, 2)
                : 0
            }`}</Col>
            <Col md="3" className="cr-costlabel">{`Operation Cost: ${
              tabData && tabData.OperationCostTotal !== null
                ? checkForDecimalAndNull(tabData.OperationCostTotal, 2)
                : 0
            }`}</Col>
            <Col md="3" className="cr-costlabel">{`Net Conversion Cost: ${
              tabData && tabData.NetConversionCost !== null
                ? checkForDecimalAndNull(tabData.NetConversionCost, 2)
                : 0
            }`}</Col>
            <Col md="3" className="switch cr-costlabel">
              <label className="switch-level">
                <div className={'left-title'}>{''}</div>
                <Switch
                  onChange={onToolToggle}
                  checked={isOpen}
                  id="normal-switch"
                  disabled={false}
                  background="#4DC771"
                  onColor="#4DC771"
                  onHandleColor="#ffffff"
                  offColor="#4DC771"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={46}
                />
                <div className={'right-title'}>Show Tool Cost</div>
              </label>
            </Col>
          </Row>

          <Row>
            <Col md="10">
              <div className="left-border">{'Process Cost:'}</div>
            </Col>
            <Col col={'2'}>
              <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}
              >
                <div className={'plus'}></div>ADD PROCESS
              </button>
            </Col>
          </Row>

          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table cr-brdr-main" size="sm">
                <thead>
                  <tr>
                    <th>{`Process Name`}</th>
                    <th>{`Process Description`}</th>
                    <th>{`Machine Name`}</th>
                    <th>{`Machine Rate`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Quantity`}</th>
                    <th>{`Net Cost`}</th>
                    <th>{`Action`}</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData &&
                    gridData.map((item, index) => {
                      return editIndex === index ? (
                        <tr key={index}>
                          <td>{item.ProcessName}</td>
                          <td>{item.ProcessDescription}</td>
                          <td>{item.MachineName}</td>
                          <td>{item.MachineRate}</td>
                          <td>{item.UOM}</td>
                          {/* <td>{item.Time ? item.Time : '0.00'}</td> */}
                          {/* <td>{item.NetCost? item.NetCost : '0.00'}</td> */}

                          <td style={{ width: 200 }}>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${ProcessGridFields}[${index}]Time`}
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
                                defaultValue={item.Time ? item.Time : '0.00'}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  // handleCycleTimeChange(e, index)
                                }}
                                // errors={}
                                disabled={true}
                              />
                            }
                          </td>

                          <td style={{ width: 200 }}>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${ProcessGridFields}[${index}]NetCost`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                // rules={{
                                //   //required: true,
                                //   pattern: {
                                //     value: /^[1-9]*$/i,
                                //     //value: /^[0-9]\d*(\.\d+)?$/i,
                                //     message: 'Invalid Number.',
                                //   },
                                // }}
                                defaultValue={
                                  item.NetCost ? item.NetCost : '0.00'
                                }
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  // handleEfficiencyChange(e, index)
                                }}
                                // errors={}
                                disabled={true}
                              />
                            }
                          </td>
                          {/* 
                          <td style={{ width: 200 }}>
                            {
                              <TextFieldHookForm
                                label=""
                                name={`${ProcessGridFields}[${index}]Cavity`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  //required: true,
                                  pattern: {
                                    value: /^[1-9]*$/i,
                                    //value: /^[0-9]\d*(\.\d+)?$/i,
                                    message: 'Invalid Number.',
                                  },
                                }}
                                defaultValue={item.Cavity}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleCavityChange(e, index)
                                }}
                                errors={
                                  errors &&
                                  errors.ProcessGridFields &&
                                  errors.ProcessGridFields[index] !== undefined
                                    ? errors.ProcessGridFields[index]
                                        .GrossWeight
                                    : ''
                                }
                                disabled={true}
                              />
                            }
                          </td>
                          <td style={{ width: 200 }}>
                            {
                              <TextFieldHookForm
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
                                defaultValue={item.Quantity}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleQuantityChange(e, index)
                                }}
                                errors={
                                  errors &&
                                  errors.ProcessGridFields &&
                                  errors.ProcessGridFields[index] !== undefined
                                    ? errors.ProcessGridFields[index].Quantity
                                    : ''
                                }
                                disabled={false}
                              />
                            }
                          </td>

  */}

                          {/* <td>
                            {item.ProcessCost
                              ? checkForDecimalAndNull(item.ProcessCost, 2)
                              : 0}
                          </td> */}
                          <td>
                            <button
                              className="SaveIcon mt15 mr-2"
                              type={'button'}
                              onClick={() => SaveItem(index)}
                            />
                            <button
                              className="CancelIcon mt15"
                              type={'button'}
                              onClick={() => CancelItem(index)}
                            />
                          </td>
                        </tr>
                      ) : (
                        <tr key={index}>
                          <td>{item.ProcessName}</td>
                          <td>{item.ProcessDescription}</td>
                          <td>{item.MachineName}</td>
                          <td>{item.MachineRate}</td>
                          <td>{item.UOM}</td>
                          <td style={{ width: 50 }}>
                            <span>
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
                                  defaultValue={item.Quantity}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    // handleCycleTimeChange(e, index)
                                  }}
                                  // errors={}
                                  disabled={true}
                                />
                              }
                            </span>
                            <button
                              className="CalculatorIcon cr-cl-icon "
                              type={'button'}
                              onClick={() => toggleWeightCalculator(index)}
                            />
                          </td>
                          {/* <td>
                            <span className={'mr-2'}>
                              {item.Quantity
                                ? checkForDecimalAndNull(item.Quantity, 4)
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
                                name={`${ProcessGridFields}[${index}]NetCost`}
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
                                defaultValue={
                                  item.NetCost ? item.NetCost : '0.00'
                                }
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  // handleCycleTimeChange(e, index)
                                }}
                                // errors={}
                                disabled={true}
                              />
                            }
                            {/* {item.NetCost
                              ? checkForDecimalAndNull(item.NetCost, 2)
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
                            <button
                              className="Delete mt15"
                              type={'button'}
                              onClick={() => deleteItem(index)}
                            />
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

          <hr />
          {/* <OperationCost
            data={props.data && props.data.CostingOperationCostResponse}
            setOperationCost={setOperationCost}
          /> */}
          {/* {isOpen && (
            <ToolCost
              data={props.data && props.data.CostingToolsCostResponse}
              setToolCost={setToolCost}
            />
          )} */}
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
          technology={'Machining'}
          calculatorData={calculatorData}
          process={'Facing'}
          isOpen={isCalculator}
          closeDrawer={closeCalculatorDrawer}
          anchor={'right'}
        />
      )}
    </>
  )
}

export default ProcessCost
