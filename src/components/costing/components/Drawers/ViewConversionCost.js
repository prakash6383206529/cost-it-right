import React, { useState, useEffect, Fragment } from 'react'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../src/helper'
import { Container, Row, Col, Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA, TIME } from '../../../../config/constants'
import { useSelector, useDispatch } from 'react-redux'
import classnames from 'classnames';
import LoaderCustom from '../../../common/LoaderCustom'
import VariableMhrDrawer from '../Drawers/processCalculatorDrawer/VariableMhrDrawer'
import { getProcessDefaultCalculation, getProcessMachiningCalculation } from '../../actions/CostWorking'
import { MACHINING } from '../../../../config/masterData'
import { getCostingLabourDetails } from '../../actions/Costing'
import ViewDetailedForms from './ViewDetailedForms'
import { useLabels } from '../../../../helper/core'
import Hanger from '../CostingHeadCosts/SurfaceTreatMent/Hanger'
import { viewAddButtonIcon } from '../../CostingUtil'
import Button from '../../../layout/Button'
import PaintAndMasking from '../CostingHeadCosts/SurfaceTreatMent/PaintAndMasking'

function ViewConversionCost(props) {


  /**
   * @method toggleDrawer
   * @description closing drawer
   */
  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }
  const { isPDFShow, stCostShow } = props
  const processGroup = getConfigurationKey().IsMachineProcessGroup
  const { viewConversionCostData } = props
  const { conversionData, netTransportationCostView, surfaceTreatmentDetails, IsAssemblyCosting, viewCostingDataObj } = viewConversionCostData
  const { CostingOperationCostResponse, CostingProcessCostResponse, CostingOtherOperationCostResponse } = conversionData
  const [costingProcessCost, setCostingProcessCost] = useState([])
  const [costingOperationCost, setCostingOperationCostResponse] = useState([])
  const [othercostingOperationCost, setOtherCostingOperationCostResponse] = useState([])
  const [surfaceTreatmentCost, setSurfaceTreatmentCost] = useState([])
  const [transportCost, setTransportCost] = useState([])
  const [showPaintCost, setShowPaintCost] = useState(false)
  const [activeTab, setActiveTab] = useState(0);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const [partNumberList, setPartNumberList] = useState([])
  const [index, setIndex] = useState(0)
  const [loader, setLoader] = useState(false)
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const [calciData, setCalciData] = useState({})
  const [processAcc, setProcessAcc] = useState(false)
  const [processAccObj, setProcessAccObj] = useState({});
  const [calculatorTechnology, setCalculatorTechnology] = useState('')
  const [showLabourData, setShowLabourData] = useState(initialConfiguration?.IsShowCostingLabour ? initialConfiguration?.IsShowCostingLabour : false)
  const [labourTable, setLabourTable] = useState([])
  const [openOperationForm, setOpenOperationForm] = useState(false)
  const [openMachineForm, setOpenMachineForm] = useState(false)
  const [viewExtraCost, setViewExtraCost] = useState(false)

  const dispatch = useDispatch()
  const { technologyLabel } = useLabels();
  useEffect(() => {

    if (IsAssemblyCosting === true && isPDFShow === false) {
      let temp = []
      let uniqueTemp = []
      CostingProcessCostResponse && CostingProcessCostResponse.map(item => {
        temp.push(item.PartNumber)
        return null
      })
      CostingOperationCostResponse && CostingOperationCostResponse.map(item => {
        temp.push(item.PartNumber)
        return null
      })
      CostingOtherOperationCostResponse && CostingOtherOperationCostResponse.map(item => {
        temp.push(item.PartNumber)
        return null
      })
      netTransportationCostView && netTransportationCostView.map(item => {
        temp.push(item.PartNumber)
        return null
      })
      surfaceTreatmentDetails && surfaceTreatmentDetails.map(item => {
        temp.push(item.PartNumber)
        return null
      })
      uniqueTemp = Array.from(new Set(temp))
      setPartNumberList(uniqueTemp)
      let partNo = uniqueTemp[index]
      let processCost = CostingProcessCostResponse && CostingProcessCostResponse.filter(item => item.PartNumber === partNo)
      let operationCost = CostingOperationCostResponse && CostingOperationCostResponse.filter(item => item.PartNumber === partNo)
      let otherOperationCost = CostingOtherOperationCostResponse && CostingOtherOperationCostResponse.filter(item => item.PartNumber === partNo)
      let transportCost = netTransportationCostView && netTransportationCostView.filter(item => item.PartNumber === partNo)
      let surfaceCost = surfaceTreatmentDetails && surfaceTreatmentDetails.filter(item => item.PartNumber === partNo)
      setCostingProcessCost(processCost)

      setCostingOperationCostResponse(operationCost)
      setOtherCostingOperationCostResponse(otherOperationCost)
      setTransportCost(transportCost)
      setSurfaceTreatmentCost(surfaceCost)
    }
    else if (IsAssemblyCosting === true && isPDFShow === true) {
      setCostingProcessCost(CostingProcessCostResponse ? CostingProcessCostResponse : [])
      setCostingOperationCostResponse(CostingOperationCostResponse ? CostingOperationCostResponse : [])
      // setcostingToolsCost(CostingToolsCostResponse)
      setOtherCostingOperationCostResponse(CostingOtherOperationCostResponse ? CostingOtherOperationCostResponse : [])
      setTransportCost(netTransportationCostView ? netTransportationCostView : [])
      setSurfaceTreatmentCost(surfaceTreatmentDetails ? surfaceTreatmentDetails : [])
    }

    else {
      setCostingProcessCost(CostingProcessCostResponse ? CostingProcessCostResponse : [])
      setCostingOperationCostResponse(CostingOperationCostResponse ? CostingOperationCostResponse : [])
      // setcostingToolsCost(CostingToolsCostResponse)
      setOtherCostingOperationCostResponse(CostingOtherOperationCostResponse ? CostingOtherOperationCostResponse : [])
      setTransportCost(netTransportationCostView ? netTransportationCostView : [])
      setSurfaceTreatmentCost(surfaceTreatmentDetails ? surfaceTreatmentDetails : [])
    }

    if (showLabourData) {
      dispatch(getCostingLabourDetails(viewCostingData[0].costingId !== null ? viewCostingData[0].costingId : "00000000-0000-0000-0000-000000000000", (res) => {
        if (res) {
          let Data = res?.data?.Data
          setLabourTable(Data.CostingLabourDetailList)
        }
      }))
    }
  }, [])

  const setCalculatorData = (data, list, id, parentId) => {
    if (parentId === '') {
      let tempData = costingProcessCost[id]
      setCalculatorTechnology(costingProcessCost[id].ProcessTechnologyId)
      tempData = { ...tempData, WeightCalculatorRequest: data, }
      setCalciData(tempData)
      setTimeout(() => {
        setWeightCalculatorDrawer(true)
      }, 100)
    } else {
      let tempData = list[id]
      setCalculatorTechnology(tempData.ProcessTechnologyId)
      tempData = { ...tempData, WeightCalculatorRequest: data, }
      setCalciData(tempData)
      setTimeout(() => {
        setWeightCalculatorDrawer(true)
      }, 100);
    }
  }


  const getWeightData = (index, list = [], parentCalciIndex = '') => {
    let tempData
    let processCalciId = ''
    let technologyId = ''
    let UOMType = ''
    if (parentCalciIndex === '') {
      tempData = viewCostingData[props.index]
      processCalciId = costingProcessCost[index]?.ProcessCalculatorId
      technologyId = costingProcessCost[index]?.ProcessTechnologyId
      UOMType = costingProcessCost[index]?.UOMType

    } else {
      tempData = list[index]
      processCalciId = tempData?.ProcessCalculatorId
      technologyId = tempData?.ProcessTechnologyId
      UOMType = tempData?.UOMType

    }
    setTimeout(() => {
      if (technologyId === MACHINING && UOMType === TIME) {
        dispatch(getProcessMachiningCalculation(processCalciId, res => {
          if (res && res.data && res.data.Data) {
            if ((res && res.data && res.data.Data) || (res && res.status === 204)) {
              const data = res.status === 204 ? {} : res.data.Data
              setCalculatorData(data, list, index, parentCalciIndex)
            }
          }
        }))
      } else {
        dispatch(getProcessDefaultCalculation(processCalciId, res => {
          if (res && res.data && res.data.Data) {
            if ((res && res.data && res.data.Data) || (res && res.status === 204)) {
              const data = res.status === 204 ? {} : res.data.Data
              setCalculatorData(data, list, index, parentCalciIndex)
            }
          }
        }))
      }

    }, 300);
    //MINDA
    // setTimeout(() => {
    //   if (tempData?.netConversionCostView?.CostingProcessCostResponse[index].ProcessTechnologyId === MACHINING && tempData.netConversionCostView.CostingProcessCostResponse[index].UOMType === TIME) {
    //     dispatch(getProcessMachiningCalculation(tempData?.netConversionCostView?.CostingProcessCostResponse[index].CostingId, tempData?.netConversionCostView?.CostingProcessCostResponse[index].ProcessId, tempData?.netConversionCostView?.CostingProcessCostResponse[index].ProcessCalculatorId, res => {
    //       if (res && res.data && res.data.Data) {
    //         const data = res.data.Data
    //         setCalciData({ ...costingProcessCost[index], WeightCalculatorRequest: data })
    //         setWeightCalculatorDrawer(true)
    //       }
    //     }))

    //   } else {
    //     dispatch(getProcessDefaultCalculation(tempData?.netConversionCostView?.CostingProcessCostResponse[index].CostingId, tempData?.netConversionCostView?.CostingProcessCostResponse[index].ProcessId, tempData?.netConversionCostView?.CostingProcessCostResponse[index].ProcessCalculatorId, res => {
    //       if (res && res.data && res.data.Data) {
    //         const data = res.data.Data
    //         setCalciData({ ...costingProcessCost[index], WeightCalculatorRequest: data })
    //         setWeightCalculatorDrawer(true)
    //       }
    //     }))
    //   }

    // }, 300);
  }

  const closeWeightDrawer = (e = "") => {
    setWeightCalculatorDrawer(false)
    setCalciData({})
    setCalculatorTechnology('')
  }


  const setPartDetail = (index, partNumber) => {
    setActiveTab(index)
    setIndex(index)
    let partNo = partNumberList[index]
    let processCost = CostingProcessCostResponse && CostingProcessCostResponse.filter(item => item.PartNumber === partNo)
    let operationCost = CostingOperationCostResponse && CostingOperationCostResponse.filter(item => item.PartNumber === partNo)
    let otherOperationCost = CostingOtherOperationCostResponse && CostingOtherOperationCostResponse.filter(item => item.PartNumber === partNo)
    let transportCost = netTransportationCostView && netTransportationCostView.filter(item => item.PartNumber === partNo)
    let surfaceCost = surfaceTreatmentDetails && surfaceTreatmentDetails.filter(item => item.PartNumber === partNo)
    setCostingProcessCost(processCost)
    setCostingOperationCostResponse(operationCost)
    setOtherCostingOperationCostResponse(otherOperationCost)
    setTransportCost(transportCost)
    setSurfaceTreatmentCost(surfaceCost)
  }

  useEffect(() => {
    setLoader(false)
  }, [costingProcessCost, costingOperationCost, othercostingOperationCost])

  const renderSingleProcess = (process, parentIndex) => {
    return (
      process.ProcessList && process.ProcessList.map((item, index) => {
        return (
          <tr key={index}>
            {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
            {processGroup && <td className={`${isPDFShow ? '' : 'text-overflow'}`}>
              {
                (item?.GroupName === '' || item?.GroupName === null || item.GroupName === undefined) ? '' :
                  <div onClick={() => setProcessAcc(!processAcc)} className={`${isPDFShow ? '' : processAcc ? 'Open' : 'Close'}`}></div>
              }
              <span title={item.ProcessName}>
                {item?.GroupName === '' || item?.GroupName === null ? '-' : item.GroupName}</span>
            </td>}
            <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.ProcessName}>{item.ProcessName ? item.ProcessName : '-'}</span></td>
            <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item?.Technologies}>{item?.Technologies ? item?.Technologies : '-'}</span></td>
            <td>{item.MachineName ? item.MachineName : '-'}</td>
            <td>{item.Tonnage ? item.Tonnage : '-'}</td>
            <td>{item.UOM ? item.UOM : '-'}</td>
            <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === '' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null) ? '-' : Math.round(item.ProductionPerHour)}</td>
            <td>{item.MHR ? item.MHR : '-'}</td>
            {!isPDFShow && <td><button
              className="CalculatorIcon cr-cl-icon mr-auto ml-0"
              type={"button"}
              disabled={item.ProcessCalculatorId === 0}
              onClick={() => { getWeightData(index, process.ProcessList, parentIndex) }}
            /></td>}
            <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}</td>
            <td>{item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, initialConfiguration?.NoOfDecimalForPrice) : 0}
            </td>
            <td>{item?.Remark ? item.Remark : "-"}</td>
          </tr>
        )
      })
    )
  }

  const processTableData = () => {
    const tooltipText = <div><div>If UOM is in hours/minutes/seconds, quantity is in seconds.</div> <div>For all others UOMs, quantity is actual.</div></div>;
    return <>
      <Row>
        <Col md="12" className='mt-1'>
          <div className="left-border">{'Process Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*PROCESS COST GRID */}
        <Col md="12">
          <Table className="table cr-brdr-main conversion-cost" size="sm">

            <tbody>
              <tr className='thead'>
                {partNumberList.length === 0 && (IsAssemblyCosting && isPDFShow) && <th>{`Part No`}</th>}
                <th style={{ width: "150px" }}>{`Process`}</th>
                {processGroup && <th>{`Sub Process`}</th>}
                <th>{technologyLabel}</th>
                <th>{`Machine Name`}</th>
                <th>{`Tonnage`}</th>
                <th>{`UOM`}</th>
                <th>{`Parts/Hour`}</th>
                <th>{`MHR`}</th>
                {!isPDFShow && <th>{`Calculator`}</th>}
                <th><span className='d-flex'>Quantity  {!isPDFShow && <div class="tooltip-n ml-1"><i className="fa fa-info-circle text-primary tooltip-icon"></i><span class="tooltiptext process-tooltip">{tooltipText}</span></div>}</span></th>
                <th>{`Net Cost`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th>{`Applicability`}</th>
                <th className="costing-border-right">{`Remark`}</th>
              </tr>
              {costingProcessCost &&
                costingProcessCost.map((item, index) => {
                  return (
                    <>
                      <tr key={index}>
                        {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                        <td className={`${isPDFShow ? '' : `text-overflow  ${(item?.GroupName === '' || item?.GroupName === null) ? '' : 'process-name no-border'} `}`}>
                          {
                            (item?.GroupName === '' || item?.GroupName === null) ? '' :
                              <div onClick={() =>
                                processAccObj[index] === true ? setProcessAccObj(prevState => ({ ...prevState, [index]: false })) : setProcessAccObj(prevState => ({ ...prevState, [index]: true }))
                              }
                                className={`${isPDFShow ? '' : processAccObj[index] ? 'Open' : 'Close'}`}></div>
                          }
                          <span className='link' onClick={() => {
                            setOpenMachineForm({ isOpen: true, id: item.MachineId })
                          }} title={item.ProcessName}>
                            {item?.GroupName === '' || item?.GroupName === null ? item.ProcessName : item.GroupName}</span>
                        </td>
                        {processGroup && <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.ProcessName}>{'-'}</span></td>}
                        <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item?.Technologies}>{item?.Technologies ? item?.Technologies : '-'}</span></td>
                        <td>{item.MachineName ? item.MachineName : '-'}</td>
                        <td>{item.Tonnage ? item.Tonnage : '-'}</td>
                        <td>{item.UOM ? item.UOM : '-'}</td>
                        <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === '' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null) ? '-' : Math.round(item.ProductionPerHour)}</td>
                        <td>{item.MHR ? item.MHR : '-'}</td>
                        {(!isPDFShow) && <td>
                          {
                            (item?.GroupName === '' || item?.GroupName === null) ?
                              <button
                                className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                                type={"button"}
                                disabled={item.ProcessCalculatorId === 0}
                                onClick={() => { getWeightData(index) }}
                              /> : ''
                          }
                        </td>}
                        <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, initialConfiguration?.NoOfDecimalForPrice) : 0} </td>
                        {initialConfiguration?.IsShowCRMHead && <td>{item.ProcessCRMHead}</td>}
                        <td>{item?.CostingConditionNumber ? item?.CostingConditionNumber : '-'}</td>

                        <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item?.Remark ? item.Remark : "-"}>{item?.Remark ? item.Remark : "-"}</span></td>
                      </tr>
                      {isPDFShow && renderSingleProcess(item, index)}
                      {processAccObj[index] && <>
                        {
                          renderSingleProcess(item, index)
                        }
                      </>}
                    </>
                  )
                })}
              {costingProcessCost && costingProcessCost.length === 0 && (
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
    </>
  }
  const operationTableData = () => {
    return <>
      <Row className='firefox-spaces'>
        <Col md="8">
          <div className="left-border">{'Operation Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*OPERATION COST GRID */}

        <Col md="12">
          <Table className={`table cr-brdr-main conversion-cost ${isPDFShow ? 'mt-2' : ""}`} size="sm">

            <tbody>
              <tr className='thead'>
                {partNumberList.length === 0 && IsAssemblyCosting && <th>{`Part No`}</th>}
                <th>{`Operation Name`}</th>
                <th>{`Operation Code`}</th>
                <th>{`UOM`}</th>
                <th>{`Rate`}</th>
                <th>{`Quantity`}</th>
                {/* make it configurable after deployment */}
                {initialConfiguration?.IsOperationLabourRateConfigure && costingOperationCost && costingOperationCost[0]?.IsLabourRateExist === true && <th>{`Labour Rate`}</th>}
                {initialConfiguration?.IsOperationLabourRateConfigure && costingOperationCost && costingOperationCost[0]?.IsLabourRateExist === true && <th>{`Labour Quantity`}</th>}
                <th>{`Net Cost`}</th>
                <th>{`Applicability`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th className="costing-border-right">{`Remark`}</th>
              </tr>
              {costingOperationCost &&
                costingOperationCost.map((item, index) => {
                  return (
                    <>

                      <tr key={index}>
                        {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                        <td>
                          <span onClick={() => setOpenOperationForm({ isOpen: true, id: item.OperationId })} className='link'>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""} {item.OperationName ? item.OperationName : '-'}</span>
                        </td>
                        <td>
                          {item.OperationCode ? item.OperationCode : '-'}
                        </td>
                        <td>{item.UOM ? item.UOM : '-'}</td>
                        <td>{item.Rate ? item.Rate : '-'}</td>
                        <td>{item.Quantity ? item.Quantity : '-'}</td>
                        {initialConfiguration?.IsOperationLabourRateConfigure && costingOperationCost && costingOperationCost[0]?.IsLabourRateExist === true && <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                        {initialConfiguration?.IsOperationLabourRateConfigure && costingOperationCost && costingOperationCost[0]?.IsLabourRateExist === true && <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourQuantity, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                        {/* <td>{netCost(item.OperationCost)}</td> */}
                        <td>
                          {item.OperationCost ? checkForDecimalAndNull(item.OperationCost, initialConfiguration?.NoOfDecimalForPrice) : 0}
                        </td>
                        {initialConfiguration?.IsShowCRMHead && <td>{item.OperationCRMHead}</td>}
                        <td>{item?.CostingConditionNumber ? item?.CostingConditionNumber : '-'}</td>
                        <td>
                          {item.Remark !== null ? item.Remark : '-'}
                        </td>
                      </tr>
                    </>
                  )
                })}
              {costingOperationCost && costingOperationCost.length === 0 && (
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
    </>
  }

  const labourTableData = () => {
    return <>
      <Row>
        <Col md="8">
          <div className="left-border">{'Labour Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*LABOUR COST GRID */}

        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <thead>
              <tr>
                <th>{`Description`}</th>
                <th>{`Labour Rate (Rs/Shift)`}</th>
                <th>{`Working Time`}</th>
                <th>{`Efficiency`}</th>
                <th>{`Cycle Time`}</th>
                <th>{`Labour Cost Rs/Pcs`}</th>
              </tr>
            </thead>
            <tbody>
              {labourTable &&
                labourTable.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {item.Description ? item.Description : '-'}
                      </td>
                      <td>
                        {item.LabourRate ? item.LabourRate : '-'}
                      </td>
                      <td>{item.WorkingTime ? item.WorkingTime : '-'}</td>
                      <td>{item.Efficiency ? item.Efficiency : '-'}</td>
                      <td>{item.CycleTime ? item.CycleTime : '-'}</td>
                      <td>{item.LabourCost ? checkForDecimalAndNull(item.LabourCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    </tr>
                  )
                })}
              {labourTable && labourTable.length === 0 && (
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
    </>
  }
  const otherOperTableData = () => {
    return <>
      <Row>
        <Col md="8">
          <div className="left-border">{'Other Operation Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*OTHER OPERATION COST GRID */}

        <Col md="12" className='firefox-space-bottom'>
          <Table className="table cr-brdr-main" size="sm">
            <tbody>
              <tr className='thead'>
                {partNumberList.length === 0 && IsAssemblyCosting && <th>{`Part No`}</th>}
                <th>{`Operation Name`}</th>
                <th>{`Operation Code`}</th>
                <th>{`UOM`}</th>
                <th>{`Rate`}</th>
                <th>{`Quantity`}</th>
                {initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure && othercostingOperationCost[0]?.IsLabourRateExist === true && <th>{`Labour Rate`}</th>}
                {initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure && othercostingOperationCost[0]?.IsLabourRateExist === true && <th>{`Labour Quantity`}</th>}
                <th>{`Net Cost`}</th>
                {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                <th className="costing-border-right">{`Remark`}</th>
              </tr >
              {othercostingOperationCost &&
                othercostingOperationCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                      <td>
                        <span onClick={() => setOpenOperationForm({ isOpen: true, id: item.OtherOperationId })} className='link'> {item.OtherOperationName ? item.OtherOperationName : '-'}</span>
                      </td>
                      <td>
                        {item.OtherOperationCode ? item.OtherOperationCode : '-'}
                      </td>
                      <td>{item.UOM ? item.UOM : '-'}</td>
                      <td>{item.Rate ? item.Rate : '-'}</td>
                      <td>{item.Quantity ? item.Quantity : '-'}</td>
                      {initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure && item.IsLabourRateExist && <td>{checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                      {initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure && item.IsLabourRateExist && <td>{checkForDecimalAndNull(item.LabourQuantity, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                      {/* <td>{netCost(item.OperationCost)}</td> */}
                      <td>
                        {item.OperationCost ? checkForDecimalAndNull(item.OperationCost, initialConfiguration?.NoOfDecimalForPrice) : 0}
                      </td>
                      {initialConfiguration?.IsShowCRMHead && <td>{item.OtherOperationCRMHead}</td>}
                      <td>
                        {item.Remark !== null ? item.Remark : '-'}
                      </td>
                    </tr >
                  )
                })}
              {
                othercostingOperationCost && othercostingOperationCost.length === 0 && (
                  <tr>
                    <td colSpan={12}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr>
                )
              }
            </tbody >
          </Table >
        </Col >
      </Row >
    </>
  }
  const stTableData = () => {
    return <>
      <Row>
        <Col md="12">
          <div className="left-border">{'Surface Treatment Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*PROCESS COST GRID */}
        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <tbody>
              <tr className='thead'>
                {partNumberList.length === 0 && IsAssemblyCosting && <th>{`Part No`}</th>}
                <th>{`Operation Name`}</th>
                <th>{`Quantity`}</th>
                <th>{`UOM`}</th>
                <th>{`Rate/UOM`}</th>
                {initialConfiguration?.IsOperationLabourRateConfigure && surfaceTreatmentCost && surfaceTreatmentCost[0]?.IsLabourRateExist === true && <th>{`Labour Rate/UOM`}</th>}
                {initialConfiguration?.IsOperationLabourRateConfigure && surfaceTreatmentCost && surfaceTreatmentCost[0]?.IsLabourRateExist === true && <th>{`Labour Quantity`}</th>}
                <th className={initialConfiguration?.IsShowCRMHead ? "" : 'costing-border-right'}>{`Cost`}</th>
                {initialConfiguration?.IsShowCRMHead && <th className="costing-border-right">{`CRM Head`}</th>}
              </tr >
              {surfaceTreatmentCost &&
                surfaceTreatmentCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                      <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.OperationName}>{item.OperationName ? item.OperationName : '-'}</span></td>
                      <td>{item.SurfaceArea ? item.SurfaceArea : '-'}</td>
                      <td>{item.UOM ? item.UOM : '-'}</td>
                      <td>{item.RatePerUOM ? checkForDecimalAndNull(item.RatePerUOM, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
                      {initialConfiguration?.IsOperationLabourRateConfigure && item.IsLabourRateExist === true && <td>{checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                      {initialConfiguration?.IsOperationLabourRateConfigure && item.IsLabourRateExist === true && <td>{checkForDecimalAndNull(item.LabourQuantity, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                      <td>{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      {initialConfiguration?.IsShowCRMHead && <td>{item.SurfaceTreatmentCRMHead}</td>}
                    </tr >
                  )
                })}
              {
                surfaceTreatmentCost && surfaceTreatmentCost.length === 0 && (
                  <tr>
                    <td colSpan={12}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr>
                )
              }
            </tbody >
          </Table >
        </Col >
      </Row >
    </>
  }
  const extraCostTableData = () => {
    return <>
      <Row>
        <Col md="12" className='mt-3'>
          <div className="left-border">{'Extra Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*TRANSPORTATION COST GRID */}
        <Col md="12" className='mb-3'>
          <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
            <tbody>
              <tr className='thead'>
                <th>{`Type`}</th>
                <th>{`Cost Description`}</th>
                <th>{`Applicability`}</th>
                <th>{`Applicability Cost`}</th>
                <th>{`Percentage (%)`}</th>
                <th>{`Cost`}</th>
                <th>{`Remark`}</th>
              </tr>

              {transportCost && transportCost.map((item, index) => (
                <Fragment key={index}>
                  <tr>
                    <td>{item?.UOM ?? '-'}</td>
                    <td>{item?.Description ?? '-'}</td>
                    <td>{item?.CostingConditionNumber ?? '-'}</td>
                    <td>{item?.ApplicabiltyCost ? checkForDecimalAndNull(item?.ApplicabiltyCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.Rate ? checkForDecimalAndNull(item?.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.TransportationCost !== '-' ? checkForDecimalAndNull(item?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                    <td>{item?.Remark ? item?.Remark : '-'}</td>
                  </tr>
                </Fragment>
              ))}

              {
                transportCost && transportCost.length === 0 && (
                  <tr>
                    <td colSpan="12">
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr>
                )
              }

              <tr className='table-footer'>
                <td colSpan={5} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                <td colSpan={5}>{checkForDecimalAndNull(viewCostingDataObj?.TransportationCostConversion, initialConfiguration?.NoOfDecimalForPrice)}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  }
  const closePaintAndMasking = () => {
    setShowPaintCost(false)
  }
  //  checkMultiplePart()
  return (
    <>
      {!isPDFShow ? <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className="conversion-cost"
        BackdropProps={props?.fromCostingSummary && { style: { opacity: 0 } }}>
        <Container className="view-conversion-cost-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>

                  <h3>{props.viewConversionCostData.isSurfaceTreatmentCost ? `View Surface Treatment Cost:` : `View Conversion Cost:`}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            {loader && <LoaderCustom />}

            <div className=" row">
              {IsAssemblyCosting && partNumberList[0] !== null && partNumberList.length > 0 && <Nav tabs className="subtabs cr-subtabs-head view-conversion-header col-md-1">
                {partNumberList && partNumberList.map((item, index) => {
                  return (
                    <NavItem>
                      <NavLink className={classnames({ active: activeTab === index })} onClick={() => setPartDetail(index, item)}>
                        <div className='drawer-part-name'><span title={item}> {item}</span></div>
                      </NavLink>
                    </NavItem>
                  )
                })}
              </Nav>}
              <TabContent activeTab={activeTab} className={`${IsAssemblyCosting && partNumberList[0] !== null && partNumberList.length > 0 ? 'col-md-11' : 'col-md-12'}  view-conversion-container`}>
                <TabPane tabId={index}>
                  {!props.viewConversionCostData.isSurfaceTreatmentCost && !props.viewConversionCostData.processHide && !props?.hideProcessAndOtherCostTable &&   // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED
                    <>
                      {processTableData()}
                    </>
                  }


                  {!props.viewConversionCostData.isSurfaceTreatmentCost && !props.viewConversionCostData.processHide && <br />}

                  {!props.viewConversionCostData.isSurfaceTreatmentCost && !props.viewConversionCostData.operationHide &&    // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED

                    <div>
                      {operationTableData()}
                    </div>
                  }

                  {!props.viewConversionCostData.isSurfaceTreatmentCost && <br />}

                  {!props.viewConversionCostData.isSurfaceTreatmentCost && !props.viewConversionCostData.operationHide && !props.viewConversionCostData.processHide && !props?.hideProcessAndOtherCostTable && // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED
                    <div>
                      {otherOperTableData()}
                    </div>
                  }

                  {!props.viewConversionCostData.isSurfaceTreatmentCost && <br />}



                  {props.viewConversionCostData.isSurfaceTreatmentCost &&                   // SHOW ONLY WHEN NETSURFACETREATMENT COST EYE BUTTON IS CLICKED
                    <>
                      {stTableData()}
                      <br />
                    </>
                  }

                  {props.viewConversionCostData.isSurfaceTreatmentCost &&    // SHOW ONLY WHEN NETSURFACETREATMENT COST EYE BUTTON IS CLICKED
                    <>
                      <Hanger ViewMode={true} isSummary={true} viewCostingDataObj={viewCostingDataObj} />
                      <Row>
                        <Col md="4">
                          <label>Paint and Masking</label>
                          <div className='d-flex align-items-center'>
                            <input className='form-control w-100' type="text" disabled value={viewCostingDataObj ? checkForDecimalAndNull(viewCostingDataObj?.CostingPartDetails?.TotalPaintCost, initialConfiguration?.NoOfDecimalForPrice) : '-'} />
                            <Button
                              id="viewConversion_extraCost"
                              onClick={() => setShowPaintCost(true)}
                              className={"right mt-0"}
                              variant={viewAddButtonIcon([], "className", true)}
                              title={viewAddButtonIcon([], "title", true)}
                            />
                          </div>
                        </Col>
                      </Row>
                      {extraCostTableData()} </>
                  }


                  {!props.viewConversionCostData.isSurfaceTreatmentCost && !props.viewConversionCostData.processHide && showLabourData &&  // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED
                    <>
                      {labourTableData()}
                    </>
                  }
                </TabPane>
              </TabContent>
            </div>

            {weightCalculatorDrawer && (
              <VariableMhrDrawer
                technology={calculatorTechnology}
                calculatorData={calciData}
                isOpen={weightCalculatorDrawer}
                CostingViewMode={true}
                closeDrawer={closeWeightDrawer}
                anchor={'right'}
              />
            )}
          </div>
          {showPaintCost && <PaintAndMasking isOpen={showPaintCost} ViewMode={true} anchor={'right'} CostingId={viewCostingDataObj?.costingId} closeDrawer={closePaintAndMasking} />}
        </Container>
      </Drawer> : <>
        {!stCostShow && costingProcessCost.length !== 0 && !props?.processShow && !props?.operationShow && processTableData()}
        {!stCostShow && costingOperationCost.length !== 0 && !props?.processShow && !props?.operationShow && operationTableData()}
        {!stCostShow && othercostingOperationCost.length !== 0 && !props?.processShow && !props?.operationShow && otherOperTableData()}
        {!stCostShow && showLabourData && labourTable.length !== 0 && labourTableData()}
        {/* {costingToolsCost.length != 0 && toolCostTableData()} */}
        {stCostShow && surfaceTreatmentCost.length !== 0 && !props?.processShow && !props?.operationShow && stTableData()}
        {stCostShow && transportCost.length !== 0 && !props?.processShow && !props?.operationShow && extraCostTableData()}
        {props?.processShow && costingProcessCost.length !== 0 && processTableData()}
        {props?.operationShow && costingOperationCost.length !== 0 && operationTableData()}

      </>}
      {openOperationForm && <ViewDetailedForms data={openOperationForm} formName="Operation" cancel={() => setOpenOperationForm({ isOpen: false, id: '' })} />}
      {openMachineForm && <ViewDetailedForms data={openMachineForm} formName="Machine" cancel={() => setOpenMachineForm({ isOpen: false, id: '' })} />}

    </>
  )
}

export default React.memo(ViewConversionCost)
