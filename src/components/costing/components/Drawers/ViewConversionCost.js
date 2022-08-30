import React, { useState, useEffect } from 'react'
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
  const processGroup = getConfigurationKey().isProcessGroup
  const { viewConversionCostData } = props
  const { conversionData, netTransportationCostView, surfaceTreatmentDetails, IsAssemblyCosting } = viewConversionCostData
  const { CostingOperationCostResponse, CostingProcessCostResponse, CostingOtherOperationCostResponse } = conversionData
  const [costingProcessCost, setCostingProcessCost] = useState([])
  const [costingOperationCost, setCostingOperationCostResponse] = useState([])
  const [othercostingOperationCost, setOtherCostingOperationCostResponse] = useState([])
  const [surfaceTreatmentCost, setSurfaceTreatmentCost] = useState([])
  const [transportCost, setTransportCost] = useState([])
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

  const dispatch = useDispatch()

  useEffect(() => {
    // if (IsShowToolCost) {
    //   setIsShowToolCost(IsShowToolCost)
    // }
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

  }, [])

  const setCalculatorData = (data, list, id, parentId) => {
    if (parentId === '') {
      let tempData = viewCostingData[props.index].netConversionCostView.CostingProcessCostResponse[id]
      setCalculatorTechnology(viewCostingData[props.index].netConversionCostView.CostingProcessCostResponse[id].ProcessTechnologyId)
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
      processCalciId = tempData?.netConversionCostView?.CostingProcessCostResponse[index]?.ProcessCalculatorId
      technologyId = tempData?.netConversionCostView?.CostingProcessCostResponse[index]?.ProcessTechnologyId
      UOMType = tempData?.netConversionCostView?.CostingProcessCostResponse[index]?.UOMType

    } else {
      tempData = list[index]
      processCalciId = tempData?.ProcessCalculatorId
      technologyId = tempData?.ProcessTechnologyId
      UOMType = tempData?.UOMType

    }
    setTimeout(() => {
      dispatch(getProcessDefaultCalculation(processCalciId, res => {
        if (res && res.data && res.data.Data) {

          if ((res && res.data && res.data.Data) || (res && res.status === 204)) {
            const data = res.status === 204 ? {} : res.data.Data
            setCalculatorData(data, list, index, parentCalciIndex)
          }

        }
      }))
    }, 300);
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
            <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null) ? '-' : Math.round(item.ProductionPerHour)}</td>
            <td>{item.MHR ? item.MHR : '-'}</td>
            {!isPDFShow && <td><button
              className="CalculatorIcon cr-cl-icon mr-auto ml-0"
              type={"button"}
              disabled={item.ProcessCalculatorId === 0}
              onClick={() => { getWeightData(index, process.ProcessList, parentIndex) }}
            /></td>}
            <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
            <td>{item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, initialConfiguration.NoOfDecimalForPrice) : 0}
            </td>
            <td>{item.Remark ?? item.Remark}</td>
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
            <thead>
              <tr>
                {partNumberList.length === 0 && (IsAssemblyCosting && isPDFShow) && <th>{`Part No`}</th>}
                <th style={{ width: "150px" }}>{`Process`}</th>
                {processGroup && <th>{`Sub Process`}</th>}
                <th>{`Technology`}</th>
                <th>{`Machine Name`}</th>
                <th>{`Tonnage`}</th>
                <th>{`UOM`}</th>
                <th>{`Parts/Hour`}</th>
                <th>{`MHR`}</th>
                {!isPDFShow && <th>{`Calculator`}</th>}
                <th width="125px"><span>Quantity  {!isPDFShow && <div class="tooltip-n ml-1"><i className="fa fa-info-circle text-primary tooltip-icon"></i><span class="tooltiptext process-tooltip">{tooltipText}</span></div>}</span></th>
                <th>{`Net Cost`}</th>
                <th className="costing-border-right">{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              { }
              {costingProcessCost &&
                costingProcessCost.map((item, index) => {
                  return (
                    <>
                      <tr key={index}>
                        {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                        <td className={`${isPDFShow ? '' : 'text-overflow process-name'}`}>
                          {
                            (item?.GroupName === '' || item?.GroupName === null) ? '' :
                              <div onClick={() =>
                                processAccObj[index] === true ? setProcessAccObj(prevState => ({ ...prevState, [index]: false })) : setProcessAccObj(prevState => ({ ...prevState, [index]: true }))
                              }
                                className={`${isPDFShow ? '' : processAccObj[index] ? 'Open' : 'Close'}`}></div>
                          }
                          <span title={item.ProcessName}>
                            {item?.GroupName === '' || item?.GroupName === null ? item.ProcessName : item.GroupName}</span>
                        </td>
                        {processGroup && <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.ProcessName}>{'-'}</span></td>}
                        <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item?.Technologies}>{item?.Technologies ? item?.Technologies : '-'}</span></td>
                        <td>{item.MachineName ? item.MachineName : '-'}</td>
                        <td>{item.Tonnage ? item.Tonnage : '-'}</td>
                        <td>{item.UOM ? item.UOM : '-'}</td>
                        <td>{(item?.ProductionPerHour === '-' || item?.ProductionPerHour === 0 || item?.ProductionPerHour === null) ? '-' : Math.round(item.ProductionPerHour)}</td>
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
                        <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                        </td>
                        <td className='remark-overflow'><span title={item.Remark ?? item.Remark}>{item.Remark ?? item.Remark}</span></td>
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
              {
                costingProcessCost && costingProcessCost.length === 0 && (
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
  const operationTableData = () => {
    return <>
      <Row>
        <Col md="8">
          <div className="left-border">{'Operation Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*OPERATION COST GRID */}

        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <thead>
              <tr>
                {partNumberList.length === 0 && IsAssemblyCosting && <th>{`Part No`}</th>}
                <th>{`Operation Name`}</th>
                <th>{`Operation Code`}</th>
                <th>{`UOM`}</th>
                <th>{`Rate`}</th>
                <th>{`Quantity`}</th>
                {/* make it configurable after deployment */}
                {/* <th>{`Labour Rate`}</th>
                      <th>{`Labour Quantity`}</th> */}
                <th>{`Net Cost`}</th>
                <th className="costing-border-right">{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {costingOperationCost &&
                costingOperationCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                      <td>
                        {item.OperationName ? item.OperationName : '-'}
                      </td>
                      <td>
                        {item.OperationCode ? item.OperationCode : '-'}
                      </td>
                      <td>{item.UOM ? item.UOM : '-'}</td>
                      <td>{item.Rate ? item.Rate : '-'}</td>
                      <td>{item.Quantity ? item.Quantity : '-'}</td>
                      {/* <td>
                              {item.IsLabourRateExist
                                ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice)
                                : '-'}
                            </td>
                            <td>
                              {item.LabourQuantity
                                ? item.LabourQuantity
                                : '-'}
                            </td> */}
                      {/* <td>{netCost(item.OperationCost)}</td> */}
                      <td>
                        {item.OperationCost ? checkForDecimalAndNull(item.OperationCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                      </td>
                      <td>
                        {item.Remark !== null ? item.Remark : '-'}
                      </td>
                    </tr>
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
  const otherOperTableData = () => {
    return <>
      <Row>
        <Col md="8">
          <div className="left-border">{'Other Operation Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*OTHER OPERATION COST GRID */}

        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <thead>
              <tr>
                {partNumberList.length === 0 && IsAssemblyCosting && <th>{`Part No`}</th>}
                <th>{`Operation Name`}</th>
                <th>{`Operation Code`}</th>
                <th>{`UOM`}</th>
                <th>{`Rate`}</th>
                <th>{`Quantity`}</th>
                {/* make it configurable after deployment */}
                {/* <th>{`Labour Rate`}</th>
                      <th>{`Labour Quantity`}</th> */}
                <th>{`Net Cost`}</th>
                <th className="costing-border-right">{`Remark`}</th>
              </tr>
            </thead>
            <tbody>
              {othercostingOperationCost &&
                othercostingOperationCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                      <td>
                        {item.OtherOperationName ? item.OtherOperationName : '-'}
                      </td>
                      <td>
                        {item.OtherOperationCode ? item.OtherOperationCode : '-'}
                      </td>
                      <td>{item.UOM ? item.UOM : '-'}</td>
                      <td>{item.Rate ? item.Rate : '-'}</td>
                      <td>{item.Quantity ? item.Quantity : '-'}</td>
                      {/* <td>
                              {item.IsLabourRateExist
                                ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice)
                                : '-'}
                            </td>
                            <td>
                              {item.LabourQuantity
                                ? item.LabourQuantity
                                : '-'}
                            </td> */}
                      {/* <td>{netCost(item.OperationCost)}</td> */}
                      <td>
                        {item.OperationCost ? checkForDecimalAndNull(item.OperationCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                      </td>
                      <td>
                        {item.Remark !== null ? item.Remark : '-'}
                      </td>
                    </tr>
                  )
                })}
              {othercostingOperationCost && othercostingOperationCost.length === 0 && (
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
            <thead>
              <tr>
                {partNumberList.length === 0 && IsAssemblyCosting && <th>{`Part No`}</th>}
                <th>{`Operation Name`}</th>
                <th>{`Surface Area`}</th>
                <th>{`UOM`}</th>
                <th>{`Rate/UOM`}</th>
                <th className="costing-border-right">{`Cost`}</th>
              </tr>
            </thead>
            <tbody>
              {surfaceTreatmentCost &&
                surfaceTreatmentCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {IsAssemblyCosting && partNumberList.length === 0 && <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>}
                      <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.OperationName}>{item.OperationName ? item.OperationName : '-'}</span></td>
                      <td>{item.SurfaceArea ? item.SurfaceArea : '-'}</td>
                      <td>{item.UOM ? item.UOM : '-'}</td>
                      <td>{item.RatePerUOM ? checkForDecimalAndNull(item.RatePerUOM, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                      <td>{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>

                    </tr>
                  )
                })}
              {surfaceTreatmentCost && surfaceTreatmentCost.length === 0 && (
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
  const extraCostTableData = () => {
    return <>
      <Row>
        <Col md="12" className='mt-1'>
          <div className="left-border">{'Extra Cost:'}</div>
        </Col>
      </Row>
      <Row>
        {/*TRANSPORTATION COST GRID */}
        <Col md="12" className='mb-3'>
          <Table className="table cr-brdr-main mb-0" size="sm">
            <thead>
              <tr>
                {/* {partNumberList.length ===0 && <th>{`Part No`}</th>}  */}
                <th>{`Type`}</th>
                <th>{`Rate`}</th>
                <th>{`Quantity`}</th>
                <th className="costing-border-right">{`Cost`}</th>
              </tr>
            </thead>
            <tbody>

              {transportCost &&
                transportCost.map((item, index) => {
                  return (
                    <tr key={index}>
                      {/* <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td> */}
                      <td>{item.UOM ? item.UOM : '-'}</td>
                      <td>{item.Rate ? item.Rate : '-'}</td>
                      <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.TransportationCost ? checkForDecimalAndNull(item.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>

                    </tr>
                  )
                })}
              {transportCost && transportCost.length === 0 && (
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
  //  checkMultiplePart()
  return (
    <>
      {!isPDFShow ? <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        className="conversion-cost"
      >
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
                  {!props.viewConversionCostData.isSurfaceTreatmentCost &&   // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED
                    <>
                      {processTableData()}
                    </>
                  }


                  {!props.viewConversionCostData.isSurfaceTreatmentCost && <br />}

                  {!props.viewConversionCostData.isSurfaceTreatmentCost &&    // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED

                    <div>
                      {operationTableData()}
                    </div>
                  }

                  {!props.viewConversionCostData.isSurfaceTreatmentCost && <br />}

                  {!props.viewConversionCostData.isSurfaceTreatmentCost &&    // SHOW ONLY WHEN NETCONVERSION COST EYE BUTTON IS CLICKED
                    <div>
                      {otherOperTableData()}
                    </div>
                  }

                  {!props.viewConversionCostData.isSurfaceTreatmentCost && <br />}



                  {props.viewConversionCostData.isSurfaceTreatmentCost &&                   // SHOW ONLY WHEN NETSURFACETREATMENT COST EYE BUTTON IS CLICKED
                    <>
                      {stTableData()}
                    </>
                  }
                  <br />
                  {props.viewConversionCostData.isSurfaceTreatmentCost &&    // SHOW ONLY WHEN NETSURFACETREATMENT COST EYE BUTTON IS CLICKED
                    <>{extraCostTableData()} </>
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
        {!stCostShow && costingProcessCost.length !== 0 && processTableData()}
        {!stCostShow && costingOperationCost.length !== 0 && operationTableData()}
        {!stCostShow && othercostingOperationCost.length !== 0 && otherOperTableData()}
        {/* {costingToolsCost.length != 0 && toolCostTableData()} */}
        {stCostShow && surfaceTreatmentCost.length !== 0 && stTableData()}
        {stCostShow && transportCost.length !== 0 && extraCostTableData()}
      </>}

    </>
  )
}

export default React.memo(ViewConversionCost)
