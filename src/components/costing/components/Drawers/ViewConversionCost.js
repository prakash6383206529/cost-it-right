import React, { useState, useEffect, Fragment } from 'react'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../../../src/helper'
import { Container, Row, Col, Table, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { COSTAPPLICABILITYBASIS, EMPTY_DATA, HANGEROVERHEAD, TIME } from '../../../../config/constants'
import { useSelector, useDispatch } from 'react-redux'
import classnames from 'classnames';
import LoaderCustom from '../../../common/LoaderCustom'
import VariableMhrDrawer from '../Drawers/processCalculatorDrawer/VariableMhrDrawer'
import { getProcessDefaultCalculation, getProcessMachiningCalculation } from '../../actions/CostWorking'
import { MACHINING } from '../../../../config/masterData'
import { getCostingLabourDetails, getSurfaceTreatmentRawMaterialCalculator } from '../../actions/Costing'
import ViewDetailedForms from './ViewDetailedForms'
import { useLabels } from '../../../../helper/core'
import Hanger from '../CostingHeadCosts/SurfaceTreatMent/Hanger'
import { viewAddButtonIcon } from '../../CostingUtil'
import Button from '../../../layout/Button'
import PaintAndMasking from '../CostingHeadCosts/SurfaceTreatMent/PaintAndMasking'
import DayTime from '../../../common/DayTimeWrapper'
import _ from 'lodash'

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

  const { conversionData, netTransportationCostView, surfaceTreatmentDetails, IsAssemblyCosting, viewCostingDataObj, HangerCostDetails, PaintAndTapeDetails, LabourCostDetails } = viewConversionCostData
  const { CostingOperationCostResponse, CostingProcessCostResponse, CostingOtherOperationCostResponse } = conversionData

  const [costingProcessCost, setCostingProcessCost] = useState([])
  const [hangerCostDetails, setHangerCostDetails] = useState([])
  const [paintAndTapeDetails, setPaintAndTapeDetails] = useState([])
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
  const [coats, setCoats] = useState([])
  const PartSurfaceAreaWithUOM = <span>Part Surface Area (dm<sup>2</sup>)</span>
  const ConsumptionWithUOM = <span>Consumption (ml/ dm<sup>2</sup>)</span>
  const dispatch = useDispatch()
  const { technologyLabel } = useLabels();

  useEffect(() => {
    if (IsAssemblyCosting === true && isPDFShow === false) {
      let temp = [];

      CostingProcessCostResponse?.forEach(item => temp.push(item?.PartNumber));
      CostingOperationCostResponse?.forEach(item => temp.push(item?.PartNumber));
      CostingOtherOperationCostResponse?.forEach(item => temp.push(item?.PartNumber));
      netTransportationCostView?.forEach(item => temp.push(item?.PartNumber));
      surfaceTreatmentDetails?.forEach(item => temp.push(item?.PartNumber));
      PaintAndTapeDetails?.forEach(item => temp.push(item?.PartNumber));
      HangerCostDetails?.forEach(item => temp.push(item?.PartNumber));
      LabourCostDetails?.forEach(item => temp.push(item?.PartNumber));


      const uniqueTemp = Array.from(new Set(temp));
      setPartNumberList(uniqueTemp);

      const partNo = uniqueTemp[index];

      const processCost = CostingProcessCostResponse?.filter(item => item.PartNumber === partNo);
      const operationCost = CostingOperationCostResponse?.filter(item => item.PartNumber === partNo);
      const otherOperationCost = CostingOtherOperationCostResponse?.filter(item => item.PartNumber === partNo);
      const transportCost = netTransportationCostView?.filter(item => item.PartNumber === partNo);
      const HangerCostDetailsTemp = HangerCostDetails?.filter(item => item.PartNumber === partNo);
      const PaintAndTapeDetailsTemp = PaintAndTapeDetails?.filter(item => item.PartNumber === partNo);
      const surfaceCost = surfaceTreatmentDetails?.filter(item => item.PartNumber === partNo);
      const labourCost = LabourCostDetails?.filter(item => item.PartNumber === partNo);

      setCostingProcessCost(processCost);
      setHangerCostDetails(HangerCostDetailsTemp?.[0] || []);
      setPaintAndTapeDetails(PaintAndTapeDetailsTemp?.[0] || []);
      setCostingOperationCostResponse(operationCost);
      setOtherCostingOperationCostResponse(otherOperationCost);
      setTransportCost(transportCost?.[0] || []);
      setSurfaceTreatmentCost(surfaceCost); // ✅ Full list, not just first item
      setLabourTable(labourCost || []);
    }

    else if (IsAssemblyCosting === true && isPDFShow === true) {
      setCostingProcessCost(CostingProcessCostResponse || []);
      setCostingOperationCostResponse(CostingOperationCostResponse || []);
      setOtherCostingOperationCostResponse(CostingOtherOperationCostResponse || []);
      setTransportCost(netTransportationCostView || []);
      setHangerCostDetails(HangerCostDetails || []);
      setPaintAndTapeDetails(PaintAndTapeDetails || []);
      setSurfaceTreatmentCost(surfaceTreatmentDetails || []);
      setLabourTable(LabourCostDetails || []);
    }

    else {
      setHangerCostDetails(HangerCostDetails?.[0] || []);
      setPaintAndTapeDetails(PaintAndTapeDetails?.[0] || []);
      setCostingProcessCost(CostingProcessCostResponse || []);
      setCostingOperationCostResponse(CostingOperationCostResponse || []);
      setOtherCostingOperationCostResponse(CostingOtherOperationCostResponse || []);
      setTransportCost(netTransportationCostView?.[0] || []);
      setSurfaceTreatmentCost(surfaceTreatmentDetails || []);
      setLabourTable(LabourCostDetails || []);
    }

    // if (showLabourData) {
    //   dispatch(getCostingLabourDetails(
    //     viewCostingData[0]?.costingId || "00000000-0000-0000-0000-000000000000",
    //     (res) => {
    //       if (res) {
    //         const Data = res?.data?.Data;
    //         setLabourTable(Data?.CostingLabourDetailList);
    //       }
    //     }
    //   ));
    // }
  }, [isPDFShow, conversionData, netTransportationCostView, surfaceTreatmentDetails, IsAssemblyCosting, viewCostingDataObj, HangerCostDetails, PaintAndTapeDetails]);

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
    setActiveTab(index);
    setIndex(index);

    let partNo = partNumberList[index];

    const processCost = CostingProcessCostResponse?.filter(item => item.PartNumber === partNo);
    const operationCost = CostingOperationCostResponse?.filter(item => item.PartNumber === partNo);
    const otherOperationCost = CostingOtherOperationCostResponse?.filter(item => item.PartNumber === partNo);

    const transportCost = netTransportationCostView?.filter(item => item.PartNumber === partNo);
    const HangerCostDetailsTemp = HangerCostDetails?.filter(item => item.PartNumber === partNo);
    const PaintAndTapeDetailsTemp = PaintAndTapeDetails?.filter(item => item.PartNumber === partNo);

    // ✅ FIX: return all matching surfaceCost entries (not just the first one)
    const surfaceCost = surfaceTreatmentDetails?.filter(item => item.PartNumber === partNo);
    const labourCost = LabourCostDetails?.filter(item => item.PartNumber === partNo);

    setCostingProcessCost(processCost);
    setCostingOperationCostResponse(operationCost);
    setOtherCostingOperationCostResponse(otherOperationCost);
    setTransportCost(transportCost?.[0] || []);
    setHangerCostDetails(HangerCostDetailsTemp?.[0] || []);
    setPaintAndTapeDetails(PaintAndTapeDetailsTemp?.[0] || []);
    setSurfaceTreatmentCost(surfaceCost);
    setLabourTable(labourCost || []);
  };
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
            <td>{item.Type ?? '-'}</td>
            <td>{item.UOM ? item.UOM : '-'}</td>
            <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === '' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null) ? '-' : Math.round(item.ProductionPerHour)}</td>
            <td>{item?.Type === COSTAPPLICABILITYBASIS ? item?.Applicability : '-'}</td>
            <td>{item?.Type === COSTAPPLICABILITYBASIS ? item?.Percentage : '-'}</td>
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
    const tooltipText = <div><div>If UOM is in hours/minutes/seconds, quantity/cycle time is in seconds.</div> <div>For all others UOMs, quantity/cycle time is actual.</div></div>;
    const mhrTooltipText = <div><div>If Type is Cost Applicability Basis, then Machine Rate is calculated based on the selected Process Cost Applicability.</div></div>;

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
                <th>{`Cavity`}</th>
                <th>{`Tonnage`}</th>
                <th>{`Type`}</th>
                <th>{`UOM`}</th>
                <th>{`Parts/Hour`}</th>
                <th >{`Process Cost Applicability`}</th>
                <th >{`Percentage`}</th>
                <th><span className='d-flex'>MHR  {!isPDFShow && <div class="tooltip-n ml-1"><i className="fa fa-info-circle text-primary tooltip-icon"></i><span class="tooltiptext process-tooltip">{mhrTooltipText}</span></div>}</span></th>

                {!isPDFShow && <th>{`Calculator`}</th>}
                <th><span className='d-flex'>Quantity/Cycle time  {!isPDFShow && <div class="tooltip-n ml-1"><i className="fa fa-info-circle text-primary tooltip-icon"></i><span class="tooltiptext process-tooltip">{tooltipText}</span></div>}</span></th>
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
                        <td>{item.Cavity ? item.Cavity : '-'}</td>
                        <td>{item.Tonnage ? item.Tonnage : '-'}</td>
                        <td>{item.Type ?? '-'}</td>
                        <td>{item.UOM ? item.UOM : '-'}</td>
                        <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === '' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null) ? '-' : Math.round(item.ProductionPerHour)}</td>
                        <td>{item?.Type === COSTAPPLICABILITYBASIS ? item?.Applicability : '-'}</td>
                        <td>{item?.Type === COSTAPPLICABILITYBASIS ? item?.Percentage : '-'}</td>
                        <td>{checkForDecimalAndNull(item?.MHR, initialConfiguration?.NoOfDecimalForPrice) ?? '-'}</td>
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
                          <span onClick={() => setOpenOperationForm({ isOpen: true, id: item.OperationId })} className='link'>{/* {item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""} */} {item.OperationName ? item.OperationName : '-'}</span>
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
                <th>{`Labour Type`}</th>
                <th>{`Description`}</th>
                <th>{`No. of Labour`}</th>
                <th>{`Absentism Percentage`}</th>
                <th>{`No. of Days`}</th>
                <th>{`Rate per Person/Month`}</th>
                <th>{`Rate per Person/Annum`}</th>
                <th>{`Rate per Person/Shift`}</th>
                <th>{`Working Time`}</th>
                <th>{`Efficiency`}</th>
                <th>{`Cycle Time`}</th>
                <th>{`Labour Cost ${viewCostingData[index]?.CostingCurrency}/Pcs`}</th>
              </tr>
            </thead>
            <tbody>
              {labourTable &&
                labourTable.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {item?.LabourType ? item?.LabourType : '-'}
                      </td>
                      <td>
                        {item?.Description ? item?.Description : '-'}
                      </td>
                      <td>
                        {item.NumberOfLabour ? checkForDecimalAndNull(item.NumberOfLabour, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}
                      </td>
                      <td>
                        {item?.AbsentismPercentage ? checkForDecimalAndNull(item?.AbsentismPercentage, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}
                      </td>
                      <td>
                        {item?.NoOfDays ? checkForDecimalAndNull(item?.NoOfDays, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}
                      </td>
                      <td>
                        {item?.LabourRatePerMonth ? checkForDecimalAndNull(item?.LabourRatePerMonth, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      <td>
                        {item?.LabourRate ? checkForDecimalAndNull(item?.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      <td>
                        {item?.LabourRatePerShift ? checkForDecimalAndNull(item?.LabourRatePerShift, initialConfiguration?.NoOfDecimalForPrice) : '-'}
                      </td>
                      <td>{item?.WorkingTime ? item?.WorkingTime : '-'}</td>
                      <td>{item?.Efficiency ? checkForDecimalAndNull(item?.Efficiency, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}</td>
                      <td>{item?.CycleTime ? checkForDecimalAndNull(item?.CycleTime, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}</td>
                      <td>{item?.LabourCost ? checkForDecimalAndNull(item?.LabourCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
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
                {initialConfiguration?.IsOperationLabourRateConfigure && <th>{`Labour Rate/UOM`}</th>}
                {initialConfiguration?.IsOperationLabourRateConfigure && <th>{`Labour Quantity`}</th>}
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
                      {initialConfiguration?.IsOperationLabourRateConfigure && <td>{checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice)}</td>}
                      {initialConfiguration?.IsOperationLabourRateConfigure && <td>{checkForDecimalAndNull(item.LabourQuantity, initialConfiguration?.NoOfDecimalForPrice)}</td>}
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
              {<tr className='table-footer'>
                <td colSpan={partNumberList.length === 0 && IsAssemblyCosting ? 7 : 6} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                { }
                <td colSpan={2}>{checkForDecimalAndNull(_.sum(surfaceTreatmentCost?.map(item => item?.SurfaceTreatmentCost)), initialConfiguration?.NoOfDecimalForPrice)}</td>
              </tr>}
            </tbody >
          </Table >
        </Col >
      </Row >
    </>
  }
  const renderTransportationRows = (transportCostArray) => {
    if (!Array.isArray(transportCostArray)) {
      transportCostArray = [transportCostArray]; // Normalize single object to array
    }

    const rows = [];

    transportCostArray.forEach((costItem) => {
      if (
        costItem?.TransportationDetails &&
        costItem.TransportationDetails.length > 0
      ) {
        costItem.TransportationDetails.forEach((item, index) => {
          rows.push(
            <tr key={`${costItem.PartNumber}-${index}`}>
              {IsAssemblyCosting && isPDFShow && <td>{item?.PartNumber ?? '-'}</td>}
              <td>{item?.UOM ?? '-'}</td>
              <td>{item?.Description ?? '-'}</td>
              <td>{item?.CostingConditionNumber ?? '-'}</td>
              <td>
                {item?.ApplicabiltyCost
                  ? checkForDecimalAndNull(
                    item.ApplicabiltyCost,
                    initialConfiguration?.NoOfDecimalForPrice
                  )
                  : '-'}
              </td>
              <td>
                {item?.UOM === 'Percentage' && item?.Rate
                  ? checkForDecimalAndNull(
                    item.Rate,
                    initialConfiguration?.NoOfDecimalForPrice
                  )
                  : '-'}
              </td>
              <td>
                {item?.UOM === HANGEROVERHEAD && item?.Rate
                  ? checkForDecimalAndNull(
                    item.Rate,
                    initialConfiguration?.NoOfDecimalForPrice
                  )
                  : '-'}
              </td>
              <td>
                {item?.Quantity
                  ? checkForDecimalAndNull(
                    item.Quantity,
                    initialConfiguration?.NoOfDecimalForPrice
                  )
                  : '-'}
              </td>
              <td>
                {item?.TransportationCost !== '-'
                  ? checkForDecimalAndNull(
                    item.TransportationCost,
                    initialConfiguration?.NoOfDecimalForPrice
                  )
                  : '-'}
              </td>
              <td>{item?.Remark || '-'}</td>
            </tr>
          );
        });
      }
    });

    if (rows.length === 0) {
      rows.push(
        <tr key="no-data">
          <td colSpan="12">
            <NoContentFound title={EMPTY_DATA} />
          </td>
        </tr>
      );
    }

    return rows;
  };
  const extraCostTableData = () => {
    const normalizedTransportCost =
      Array.isArray(transportCost) || !transportCost
        ? transportCost
        : [transportCost];

    return (
      <>
        <Row>
          <Col md="12" className="mt-3">
            <div className="left-border">{'Other Cost:'}</div>
          </Col>
        </Row>
        <Row>
          <Col md="12" className="mb-3">
            <Table className="table cr-brdr-main" size="sm">
              <tbody>
                <tr className="thead">
                  {IsAssemblyCosting && isPDFShow && <th>{`Part No`}</th>}
                  <th>{`Type`}</th>
                  <th>{`Cost Description`}</th>
                  <th>{`Applicability`}</th>
                  <th>{`Applicability Cost`}</th>
                  <th>{`Percentage (%)`}</th>
                  <th>{'Rate'}</th>
                  <th>{'Quantity'}</th>
                  <th>{`Cost`}</th>
                  <th>{`Remark`}</th>
                </tr>

                {renderTransportationRows(normalizedTransportCost)}

                {/* {
                  transportCost && transportCost?.TransportationDetails && transportCost?.TransportationDetails?.length === 0 && (
                    <tr>
                      <td colSpan="12">
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  )
                } */}

                {<tr className='table-footer'>
                  <td colSpan={IsAssemblyCosting && isPDFShow ? 8 : 7} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                  { }
                  <td colSpan={7}>{checkForDecimalAndNull(_.sum(normalizedTransportCost?.map(item => item?.TotalTransportationCost)), initialConfiguration?.NoOfDecimalForPrice)}</td>
                </tr>}
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    );
  };
  //  checkMultiplePart()
  const hangerTableData = () => {
    return <>
      <Row>
        <Col md="12">
          <Hanger ViewMode={true} isSummary={true} viewCostingDataObj={hangerCostDetails} item={viewCostingDataObj} />
        </Col>
      </Row>
    </>
  }
  const hangerTableforPDF = () => {
    // Normalize input: always treat as an array
    const hangerData = Array.isArray(hangerCostDetails)
      ? hangerCostDetails
      : hangerCostDetails && typeof hangerCostDetails === 'object'
        ? [hangerCostDetails]
        : [];

    const filteredData = hangerData.filter(item =>
      item?.HangerRate != null &&
      item?.NumberOfPartsPerHanger != null &&
      item?.HangerCostPerPart != null
    );

    if (filteredData.length === 0) return null;

    return (
      <>
        <Row>
          <Col md="12">
            <div className="left-border">{'Hanger Cost:'}</div>
          </Col>
          <Col md="12" className='mb-3'>
            <Table className="table cr-brdr-main" size="sm">
              <tbody>
                <tr className='thead'>
                  {IsAssemblyCosting && <th>Part No</th>}
                  <th>Hanger Factor (Rate)</th>
                  <th>No. of Parts per Hanger</th>
                  <th>Hanger Cost per Part</th>
                  <th>Remark</th>
                </tr>

                {filteredData.map((item, index) => (
                  <tr key={index}>
                    {IsAssemblyCosting && <td>{item?.PartNumber ?? '-'}</td>}
                    <td>{item?.HangerRate ?? '-'}</td>
                    <td>{item?.NumberOfPartsPerHanger ?? '-'}</td>
                    <td>
                      {item?.HangerCostPerPart != null
                        ? checkForDecimalAndNull(item?.HangerCostPerPart, initialConfiguration?.NoOfDecimalForPrice)
                        : '-'}
                    </td>
                    <td>{item?.HangerRemark ?? '-'}</td>
                  </tr>
                ))}
                {<tr className='table-footer'>
                  <td colSpan={IsAssemblyCosting ? 3 : 2} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                  { }
                  <td colSpan={2}>{checkForDecimalAndNull(_.sum(filteredData?.map(item => item?.HangerCostPerPart)), initialConfiguration?.NoOfDecimalForPrice)}</td>
                </tr>}
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    );
  };
  const paintAndMaskingTableData = () => {
    const renderPaintTable = (details) => {
      const {
        Coats = [],
        PartNumber,
        TapeCost,
        TotalPaintCost,
        PaintCost,
        PaintConsumptionCost,
      } = details || {};

      // Don't render if Coats is empty or undefined
      if (!Coats || Coats.length === 0) return null;
      let parentRowSpan = Coats?.length || 0

      return (
        <Row className="firefox-spaces mb-4">
          <Col md="12">
            <div className="left-border">{`Paint and Masking:`}</div>
          </Col>
          <Col md="12">
            <Table className="table cr-brdr-main table-bordered" size="sm">
              <tbody>
                <tr className="thead">
                  {IsAssemblyCosting && isPDFShow && <th>Part No</th>}
                  <th>Paint Coat</th>
                  <th>Raw Material</th>
                  <th>UOM</th>
                  <th>{PartSurfaceAreaWithUOM}</th>
                  <th>{ConsumptionWithUOM}</th>
                  <th>Rejection Allowance (%)</th>
                  <th>Rejection Allowance</th>
                  <th>RM Rate (Currency)</th>
                  <th>Paint Cost</th>
                  <th>Remark</th>
                  {isPDFShow && <th>Masking/Tape Cost</th>}
                  {isPDFShow && <th>Total Paint & Masking Cost</th>}
                  <th>Effective Date</th>
                </tr>

                {Coats.map((coat, parentIndex) =>
                  coat?.RawMaterials?.map((rm, childIndex) => (
                    <tr key={`${PartNumber}-${parentIndex}-${childIndex}`}>
                      {IsAssemblyCosting && isPDFShow && childIndex === 0 && (
                        <td rowSpan={coat?.RawMaterials?.length}>{PartNumber ?? '-'}</td>
                      )}
                      {childIndex === 0 && (
                        <td rowSpan={coat?.RawMaterials?.length}>
                          {coat?.PaintCoat || '-'}
                        </td>
                      )}
                      <td>{rm?.RawMaterial || '-'}</td>
                      <td>{rm?.UOM || '-'}</td>
                      <td>{checkForDecimalAndNull(rm?.SurfaceArea, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                      <td>{checkForDecimalAndNull(rm?.Consumption, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                      <td>{checkForDecimalAndNull(rm?.RejectionAllowancePercentage, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                      <td>{checkForDecimalAndNull(rm?.RejectionAllowance, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                      <td>{checkForDecimalAndNull(rm?.BasicRatePerUOM, getConfigurationKey().NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(rm?.NetCost, getConfigurationKey().NoOfDecimalForPrice)}</td>
                      <td>{rm?.Remark ?? "-"}</td>
                      {isPDFShow && childIndex === 0 && (
                        <td rowSpan={coat?.RawMaterials?.length}>
                          {checkForDecimalAndNull(TapeCost, getConfigurationKey().NoOfDecimalForPrice)}
                        </td>
                      )}
                      {/* {isPDFShow && childIndex === 0 && (
                        <td rowSpan={coat?.RawMaterials?.length}>
                          {checkForDecimalAndNull(TotalPaintCost, getConfigurationKey().NoOfDecimalForPrice)}
                        </td>
                      )} */}
                      {isPDFShow && parentIndex === 0 && (
                        <td rowSpan={parentRowSpan}>
                          {checkForDecimalAndNull(TotalPaintCost, getConfigurationKey().NoOfDecimalForPrice)}
                        </td>
                      )}
                      <td>{rm?.EffectiveDate != null ? DayTime(rm.EffectiveDate).format('DD/MM/YYYY') : ''}</td>
                    </tr>
                  ))
                )}

                {/* Totals when PDF is not shown */}
                {(!IsAssemblyCosting && !isPDFShow) || (IsAssemblyCosting && !isPDFShow) ? (
                  <tr className="table-footer">
                    <td colSpan={!isPDFShow ? 3 : 11} className="text-right">
                      <strong>Total Norm (Consumption) Cost:</strong>
                    </td>
                    <td colSpan={!isPDFShow ? 2 : 0}>
                      {checkForDecimalAndNull(PaintConsumptionCost, getConfigurationKey().NoOfDecimalForPrice)}
                    </td>
                    <td colSpan={!isPDFShow ? 3 : 11} className="text-right">
                      <strong>Total Paint Cost:</strong>
                    </td>
                    <td colSpan={!isPDFShow ? 3 : 0}>
                      {checkForDecimalAndNull(PaintCost, getConfigurationKey().NoOfDecimalForPrice)}
                    </td>
                  </tr>
                ) : null}
                {/* {IsAssemblyCosting && isPDFShow && <tr className='table-footer'>
                  <td colSpan={IsAssemblyCosting && isPDFShow ? 7 : 6} className="text-right font-weight-600 fw-bold">{'Total Paint & Masking Cost:'}</td>
                  {console.log(details)}
                  <td colSpan={2}>{checkForDecimalAndNull(_.sum(details?.map(item => item?.TotalPaintCost)), getConfigurationKey().NoOfDecimalForPrice)}</td>
                </tr>} */}
              </tbody>
            </Table>

            {/* Masking/Total input fields (non-PDF mode) */}
            {!isPDFShow && (
              <Row className="mb-4">
                <Col md="4">
                  <label>Masking/Tape Cost</label>
                  <input
                    type="text"
                    className="form-control"
                    value={checkForDecimalAndNull(TapeCost, getConfigurationKey().NoOfDecimalForPrice)}
                    disabled
                  />
                </Col>
                <Col md="4">
                  <label>Total Paint & Masking Cost</label>
                  <input
                    type="text"
                    className="form-control"
                    value={checkForDecimalAndNull(TotalPaintCost, getConfigurationKey().NoOfDecimalForPrice)}
                    disabled
                  />
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      );
    };

    if (Array.isArray(paintAndTapeDetails)) {
      const filtered = paintAndTapeDetails.filter((item) => item?.Coats?.length > 0);



      return filtered.map((item, index) => {
        // item?.PartNumber == 0
        return (
          <div key={index}>{renderPaintTable(item)}</div>
        )
      })
    }
    return paintAndTapeDetails?.Coats?.length > 0 ? renderPaintTable(paintAndTapeDetails) : null;
  };
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
                      {paintAndMaskingTableData()}
                      {hangerTableData()}
                      {extraCostTableData()}
                    </>
                  }

                  {(labourTable?.length > 0 && showLabourData && !props.viewConversionCostData?.labourHide && props.viewConversionCostData?.IsAssemblyCosting && !props.viewConversionCostData?.isSurfaceTreatmentCost) && <>
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
        </Container>
      </Drawer> : <>
        {!stCostShow && costingProcessCost.length !== 0 && !props?.processShow && !props?.operationShow && processTableData()}
        {!stCostShow && costingOperationCost.length !== 0 && !props?.processShow && !props?.operationShow && operationTableData()}
        {!stCostShow && othercostingOperationCost.length !== 0 && !props?.processShow && !props?.operationShow && otherOperTableData()}
        {!stCostShow && showLabourData && labourTable.length !== 0 && labourTableData()}
        {/* {costingToolsCost.length != 0 && toolCostTableData()} */}
        {stCostShow && surfaceTreatmentCost.length !== 0 && !props?.processShow && !props?.operationShow && stTableData()}
        {stCostShow && HangerCostDetails.length !== 0 && !props?.processShow && !props?.operationShow && hangerTableforPDF()}
        {stCostShow && paintAndTapeDetails.length !== 0 && !props?.processShow && !props?.operationShow && paintAndMaskingTableData()}
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
