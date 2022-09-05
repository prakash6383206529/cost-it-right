import React, { useEffect, useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from '../WeightCalculatorDrawer';
import { useDispatch, useSelector } from 'react-redux';
import Toaster from '../../../common/Toaster';
import { checkForDecimalAndNull } from '../../../../helper';
import { Container, Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA, FERROUSCASTINGID } from '../../../../config/constants';
import { SHEETMETAL, RUBBER, FORGING, DIE_CASTING, PLASTIC, CORRUGATEDBOX, Ferrous_Casting } from '../../../../config/masterData'
import 'reactjs-popup/dist/index.css'
import { getRawMaterialCalculationForCorrugatedBox, getRawMaterialCalculationForDieCasting, getRawMaterialCalculationForFerrous, getRawMaterialCalculationForForging, getRawMaterialCalculationForPlastic, getRawMaterialCalculationForRubber, getRawMaterialCalculationForSheetMetal, } from '../../actions/CostWorking'

function ViewRM(props) {

  const { viewRMData, rmMBDetail, isAssemblyCosting, isPDFShow, simulationMode, isSimulationDone } = props
  const dispatch = useDispatch()
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const [viewRM, setViewRM] = useState(viewRMData)
  const [index, setIndex] = useState('')
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  const [calciData, setCalciData] = useState({})
  const masterBatchList = viewCostingData[props.index].CostingMasterBatchRawMaterialCostResponse

  useEffect(() => {
    setViewRM(viewRMData)
  }, [])



  const setCalculatorData = (res, index) => {
    if (res && res.data && res.data.Data) {
      const data = res.data.Data
      setCalciData({ ...viewRM[index], WeightCalculatorRequest: data })
      setWeightCalculatorDrawer(true)
    }
  }

  const getWeightData = (index) => {
    setIndex(index)
    if (viewRM[index].RawMaterialCalculatorId === 0 || viewRM[index].RawMaterialCalculatorId === null) {
      Toaster.warning('Data is not avaliabe for calculator')
      return false
    }

    const tempData = viewCostingData[props.index]
    switch ((Number(tempData.technologyId))) {

      case SHEETMETAL:
        dispatch(getRawMaterialCalculationForSheetMetal(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case FORGING:
        dispatch(getRawMaterialCalculationForForging(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case Ferrous_Casting:
        dispatch(getRawMaterialCalculationForFerrous(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case PLASTIC:
        dispatch(getRawMaterialCalculationForPlastic(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case CORRUGATEDBOX:
        dispatch(getRawMaterialCalculationForCorrugatedBox(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case DIE_CASTING:
        dispatch(getRawMaterialCalculationForDieCasting(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case RUBBER:
        dispatch(getRawMaterialCalculationForRubber(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      default:
        return "none";
    }
  }

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }
  /**
   * @method closeWeightDrawer
   * @description CLOSING WEIGHT DRAWER
   */
  const closeWeightDrawer = (e = "") => {
    setWeightCalculatorDrawer(false)
  }
  const tableData = () => {
    return <>
      <Col md="12">
        <div className="left-border mt-4 mb-3">Raw Material</div>
      </Col>
      <Col md="12" className='btn-container mb-2 ' >
        {!isPDFShow && String(viewCostingData[props.index].technologyId) === FERROUSCASTINGID && <button
          className="secondary-btn"
          type={'button'}
          onClick={() => { getWeightData(0) }}
          disabled={(viewRM[0].RawMaterialCalculatorId === 0 || viewRM[0].RawMaterialCalculatorId === null) ? true : false}
        >
          <div className='CalculatorIcon cr-cl-icon '></div>Weight Calculator</button>}
      </Col>
      <Col>
        <Table className="table cr-brdr-main" size="sm">
          <thead>
            <tr>
              {isAssemblyCosting && <th>{`Part No`}</th>}
              <th>{`RM Name -Grade`}</th>
              <th>{`RM Rate`}</th>
              <th>{`Scrap Rate`}</th>
              <th>{`Scrap Recovery(%)`}</th>
              <th>{`Gross Weight (Kg)`}</th>
              <th>{`Finish Weight (Kg)`}</th>
              <th>{`Scrap Weight`}</th>
              {!isPDFShow && String(viewCostingData[props.index].technologyId) !== FERROUSCASTINGID && <th>{`Calculator`}</th>}
              <th>{`Freight Cost`}</th>
              <th>{`Shearing Cost`}</th>
              <th>{`Burning Loss Weight`}</th>
              <th >{`Net RM Cost/Pc`}</th>
              <th className="costing-border-right">{`Remark`}</th>

            </tr>
          </thead>
          <tbody>
            {viewRM && viewRM.length > 0 && viewRM.map((item, index) => {
              return (
                <tr key={index}>
                  {isAssemblyCosting && <td className={`${isPDFShow ? '' : 'text-overflow'}`}> <span title={item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</span></td>}
                  <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item.RMName}>{item.RMName}</span></td>
                  <td>{checkForDecimalAndNull(item.RMRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(item.ScrapRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(item.ScrapRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(item.GrossWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                  <td>{checkForDecimalAndNull(item.FinishWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                  <td>{checkForDecimalAndNull(item.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                  {!isPDFShow && String(viewCostingData[props.index].technologyId) !== FERROUSCASTINGID && <td><button
                    className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                    type={"button"}
                    disabled={(item.RawMaterialCalculatorId === 0 || item.RawMaterialCalculatorId === null) ? true : false}
                    onClick={() => { getWeightData(index) }}
                  /></td>}
                  <td>{item.FreightCost ? checkForDecimalAndNull(item.FreightCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                  <td>{item.ShearingCost ? checkForDecimalAndNull(item.ShearingCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                  <td>{item.BurningLossWeight ? checkForDecimalAndNull(item.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
                  <td>{checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>
                    <div className={`${isPDFShow ? '' : 'remark-overflow'}`} title={item.Remark}>
                      <span>{item?.Remark ? item.Remark : "-"}</span></div>
                  </td>
                </tr>
              )
            })}
            {viewRM?.length === 0 && (
              <tr>
                <td colSpan={13}>
                  <NoContentFound title={EMPTY_DATA} />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Col>

      {viewCostingData[props.index].isApplyMasterBatch && !isAssemblyCosting &&
        <>
          < Col md="12">
            <div className="left-border mt-4 mb-3">Master Batch</div>
          </Col>
          <Col>
            <Table className="table cr-brdr-main mb-0" size="sm">
              <thead>
                <tr>
                  <th>{`MB Name`}</th>
                  <th>{`MB Rate`}</th>
                  <th>{`Percentage`}</th>
                  <th>{`Effective MB Rate`}</th>
                </tr>
              </thead>
              <tbody>
                <tr key={index}>
                  <td>{viewCostingData[props.index].masterBatchRMName}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props.index].masterBatchRMPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props.index].masterBatchPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props.index].masterBatchTotal, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                </tr>
                {viewRM.length === 0 && (
                  <tr>
                    <td colSpan={13}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </>}

      {
        isAssemblyCosting && masterBatchList.length > 0 && (!isSimulationDone === false ? isSimulationDone : (simulationMode ? simulationMode : false)) &&
        <>
          < Col md="12">
            <div className="left-border mt-4 mb-3">Master Batch</div>
          </Col>
          <Col>
            <Table className="table cr-brdr-main mb-0" size="sm">
              <thead>
                <tr>
                  <th>{`Part Number`}</th>
                  <th>{`MB Name`}</th>
                  <th>{`MB Rate`}</th>
                  <th>{`Percentage`}</th>
                  <th>{`Effective MB Rate`}</th>

                </tr>
              </thead>
              <tbody>

                {masterBatchList.map((item, indexMB) => {
                  return (
                    < tr key={indexMB}>
                      <td>{item.PartNumber}</td>
                      <td>{item.MasterBatchRMName}</td>
                      <td>{checkForDecimalAndNull(item.MasterBatchRMPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(item.MasterBatchPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(item.MasterBatchTotal, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                    </tr>
                  )
                })
                }
                {masterBatchList.length === 0 && (
                  <tr>
                    <td colSpan={13}>
                      <NoContentFound title={EMPTY_DATA} />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </>
      }
    </>
  }
  return (
    <>
      {!isPDFShow ?
        <Drawer
          anchor={props.anchor}
          open={props.isOpen}
          className='view-rm-cost'
        >
          <Container className={`${isAssemblyCosting && "drawer-1200"}`}>
            <div className={"drawer-wrapper drawer-1500px"}>
              <Row className="drawer-heading">
                <Col className='pl-0'>
                  <div className={"header-wrapper left"}>
                    <h3>{"View RM Cost:"}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={"close-button right"}
                  ></div>
                </Col>
              </Row>
              <Row>
                {!weightCalculatorDrawer && tableData()}
                {weightCalculatorDrawer && (
                  <WeightCalculator
                    rmRowData={viewRM !== undefined ? calciData : {}}
                    anchor={`right`}
                    isEditFlag={false}
                    isOpen={weightCalculatorDrawer}
                    closeDrawer={closeWeightDrawer}
                    technology={viewCostingData[props.index].technologyId}
                    isSummary={true}
                    rmMBDetail={rmMBDetail} // MASTER BATCH DETAIL
                    CostingViewMode={true}   // THIS KEY WILL BE USE TO OPEN CALCI IN VIEW MODE
                  />
                )}
              </Row>
            </div>
          </Container>
        </Drawer> : (viewRM.length !== 0 && <Row className='mt-1'>{tableData()}</Row>)}
    </>
  );
}

export default React.memo(ViewRM)
