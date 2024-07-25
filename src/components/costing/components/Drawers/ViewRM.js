import React, { useEffect, useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from '../WeightCalculatorDrawer';
import { useDispatch, useSelector } from 'react-redux';
import Toaster from '../../../common/Toaster';
import { IsShowFreightAndShearingCostFields, checkForDecimalAndNull, getConfigurationKey, isRMDivisorApplicable } from '../../../../helper';
import NoContentFound from '../../../common/NoContentFound';
import { AWAITING_APPROVAL_ID, EMPTY_DATA, PENDING_FOR_APPROVAL_ID, REJECTEDID } from '../../../../config/constants';
import { SHEETMETAL, RUBBER, FORGING, DIE_CASTING, PLASTIC, CORRUGATEDBOX, Ferrous_Casting, MACHINING, WIREFORMING, getTechnology, ELECTRICAL_STAMPING, INSULATION } from '../../../../config/masterData'
import 'reactjs-popup/dist/index.css'
import { getRawMaterialCalculationForCorrugatedBox, getRawMaterialCalculationForDieCasting, getRawMaterialCalculationForFerrous, getRawMaterialCalculationForForging, getRawMaterialCalculationForMachining, getRawMaterialCalculationForMonoCartonCorrugatedBox, getRawMaterialCalculationForPlastic, getRawMaterialCalculationForRubber, getRawMaterialCalculationForSheetMetal, getSimulationCorrugatedAndMonoCartonCalculation, getSimulationRmFerrousCastingCalculation, getSimulationRmMachiningCalculation, getSimulationRmRubberCalculation, getRawMaterialCalculationForInsulation } from '../../actions/CostWorking'
import { Row, Col, Table } from 'reactstrap'
import TooltipCustom from '../../../common/Tooltip';
import _ from 'lodash';

function ViewRM(props) {

  const { viewRMData, rmMBDetail, isAssemblyCosting, isPDFShow, simulationMode, isSimulationDone } = props
  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const [viewCostingData, setViewCostingData] = useState([])

  const { viewCostingDetailData, viewRejectedCostingDetailData, viewCostingDetailDataForAssembly } = useSelector((state) => state.costing)

  const disabledForMonoCartonCorrugated = (viewCostingData[props.index]?.technologyId === CORRUGATEDBOX && viewCostingData[props.index]?.CalculatorType === 'CorrugatedAndMonoCartonBox')

  useEffect(() => {
    if (viewCostingDetailData && viewCostingDetailData?.length > 0 && !props?.isRejectedSummaryTable && !props?.isFromAssemblyTechnology) {
      setViewCostingData(viewCostingDetailData)
    } else if (viewRejectedCostingDetailData && viewRejectedCostingDetailData?.length > 0 && props?.isRejectedSummaryTable && !props?.isFromAssemblyTechnology) {
      setViewCostingData(viewRejectedCostingDetailData)
    } else if (viewCostingDetailDataForAssembly && viewCostingDetailDataForAssembly?.length > 0 && props?.isFromAssemblyTechnology) {
      setViewCostingData(viewCostingDetailDataForAssembly)
    }


  }, [viewCostingDetailData, viewRejectedCostingDetailData, viewCostingDetailDataForAssembly])

  const [viewRM, setViewRM] = useState(viewRMData)
  const [index, setIndex] = useState('')
  const [weightCalculatorDrawer, setWeightCalculatorDrawer] = useState(false)
  const [calciData, setCalciData] = useState({})
  const [isScrapRecoveryApplied, setIsScrapRecoveryApplied] = useState(false)
  const masterBatchList = viewCostingData[props.index]?.CostingMasterBatchRawMaterialCostResponse
  const RMDivisor = (viewCostingData[props?.index]?.CostingPartDetails?.RMDivisor !== null) ? viewCostingData[props?.index]?.CostingPartDetails?.RMDivisor : 0;
  useEffect(() => {
    setViewRM(viewRMData)
  }, [])

  useEffect(() => {
    setIsScrapRecoveryApplied((_.map(viewRM, 'IsScrapRecoveryPercentageApplied') || []).some(value => value === true));
  }, [viewRM])

  const setCalculatorData = (res, index) => {
    if (res && res.data && res.data.Data) {
      const data = res.data.Data
      setCalciData({ ...viewRM[index], WeightCalculatorRequest: data })
      setWeightCalculatorDrawer(true)
    }
  }

  const getWeightData = (index) => {
    setIndex(index)

    const tempData = viewCostingData[props.index]
    if (props.simulationMode && String(tempData.CostingHeading) === String("New Costing") && (Number(tempData.SimulationStatusId) === Number(REJECTEDID) || Number(tempData.SimulationStatusId) === Number(PENDING_FOR_APPROVAL_ID) || Number(tempData.SimulationStatusId) === Number(AWAITING_APPROVAL_ID)) && viewRM[index]?.RawMaterialCalculatorId === null && viewRM[index]?.IsCalculatorAvailable === true) {
      switch ((Number(tempData?.technologyId))) {
        case Ferrous_Casting:
          dispatch(getSimulationRmFerrousCastingCalculation(tempData.SimulationId, tempData.netRMCostView[index].CostingId, res => {

            if (Number(res.status) === Number(204)) {
              Toaster.warning('Data is not available for calculator')
            } else {
              setCalculatorData(res, index)
            }
          }))
          break;

        case RUBBER:
          dispatch(getSimulationRmRubberCalculation(tempData.SimulationId, tempData.netRMCostView[index].CostingId, res => {

            if (Number(res.status) === Number(204)) {
              Toaster.warning('Data is not available for calculator')
            } else {
              setCalculatorData(res, index)
            }
          }))
          break;
        case MACHINING:
          dispatch(getSimulationRmMachiningCalculation(tempData.SimulationId, tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, res => {

            if (Number(res.status) === Number(204)) {
              Toaster.warning('Data is not available for calculator')
            } else {
              setCalculatorData(res, index)
            }
          }))
          break;
        case CORRUGATEDBOX:
          if (viewCostingData[props.index]?.CalculatorType === 'CorrugatedAndMonoCartonBox') {
            dispatch(getSimulationCorrugatedAndMonoCartonCalculation(tempData.SimulationId, tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, res => {

              if (Number(res.status) === Number(204)) {
                Toaster.warning('Data is not available for calculator')
              } else {
                setCalculatorData(res, index)
              }
            }))
          } else {

            dispatch(getRawMaterialCalculationForCorrugatedBox(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {

              if (Number(res.status) === Number(204)) {
                Toaster.warning('Data is not available for calculator')
              } else {
                setCalculatorData(res, index)
              }
            }))
          }
          break;
        default:
          return "none";
      }
    }
    else {
      if (viewRM[index].RawMaterialCalculatorId === 0 || viewRM[index].RawMaterialCalculatorId === null) {
        Toaster.warning('Data is not available for calculator')
        return false
      }

      switch ((Number(tempData?.technologyId))) {

        case SHEETMETAL:
        case WIREFORMING:
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
        case ELECTRICAL_STAMPING:
          dispatch(getRawMaterialCalculationForPlastic(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case CORRUGATEDBOX:
          if (viewCostingData[props.index]?.CalculatorType === 'CorrugatedAndMonoCartonBox') {
            dispatch(getRawMaterialCalculationForMonoCartonCorrugatedBox(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
              setCalculatorData(res, index)
            }))
          } else {

            dispatch(getRawMaterialCalculationForCorrugatedBox(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
              setCalculatorData(res, index)
            }))
          }
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
        case MACHINING:
          dispatch(getRawMaterialCalculationForMachining(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case INSULATION:
          dispatch(getRawMaterialCalculationForInsulation(tempData.netRMCostView[index].CostingId, tempData.netRMCostView[index].RawMaterialId, tempData.netRMCostView[index].RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        default:
          return "none";
      }
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
      <Col md="6" className='mt-1'>
        <div className="left-border">Raw Material</div>
      </Col>
      {
        !isPDFShow &&
        <Col md="6" className='btn-container mt-1' >
          {viewCostingData && (viewCostingData[props.index]?.technologyId === Ferrous_Casting || viewCostingData[props.index]?.technologyId === RUBBER || disabledForMonoCartonCorrugated) && <button
            className="secondary-btn"
            type={'button'}
            disabled={viewCostingData && viewCostingData[props?.index]?.CostingPartDetails?.CostingRawMaterialsCost?.length === 0 ? true : false}
            onClick={() => { getWeightData(0) }}
          >
            <div className='CalculatorIcon cr-cl-icon '></div>Weight Calculator</button>}
        </Col>
      }
      <Col>
        <Table className="table cr-brdr-main" size="sm">
          <thead>
            <tr>
              {isAssemblyCosting && <th>{`Part No`}</th>}
              <th>{`RM Name -Grade`}</th>
              <th>{`RM Rate`}</th>
              <th>{`Scrap Rate`}</th>
              {isScrapRecoveryApplied && <th>{`Scrap Recovery (%)`}</th>}
              <th>{`Gross Weight (Kg)`}</th>
              <th>{`Finish Weight (Kg)`}</th>
              <th>{`Scrap Weight`}</th>
              {!isPDFShow && viewCostingData[props.index]?.technologyId !== Ferrous_Casting && viewCostingData[props.index]?.technologyId !== RUBBER && (getTechnology.includes(viewCostingData[props.index]?.technologyId)) && < th > {`Calculator`}</th>}
              {IsShowFreightAndShearingCostFields() && <th>{`Freight Cost`}</th>}
              {IsShowFreightAndShearingCostFields() && <th>{`Shearing Cost`}</th>}
              {viewCostingData[0]?.technologyId === (PLASTIC || ELECTRICAL_STAMPING) && <th>{`Burning Loss Weight`}</th>}
              {viewCostingData[0]?.technologyId === DIE_CASTING && <th>Casting Weight</th>}
              {viewCostingData[0]?.technologyId === DIE_CASTING && <th>Melting Loss (Loss%)</th>}
              <th >{`Net RM Cost ${isRMDivisorApplicable(viewCostingData[0]?.technology) ? '/(' + RMDivisor + ')' : ''}`}</th>
              {initialConfiguration.IsShowCRMHead && <th>{`CRM Head`}</th>}
              <th className="costing-border-right">{`Remark`}</th>

            </tr>
          </thead>
          <tbody>
            {viewRM && viewRM.length > 0 && viewRM?.map((item, index) => {
              return (
                <tr key={index}>
                  {isAssemblyCosting && <td className={`${isPDFShow ? '' : 'text-overflow'}`}> <span title={item?.PartNumber !== null || item?.PartNumber !== "" ? item?.PartNumber : ""}>{item?.PartNumber !== null || item?.PartNumber !== "" ? item?.PartNumber : ""}</span></td>}
                  <td className={`${isPDFShow ? '' : 'text-overflow'}`}><span title={item?.RMName}>{item?.RMName}</span></td>
                  <td>{checkForDecimalAndNull(item?.RMRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(item?.ScrapRate, initialConfiguration.NoOfDecimalForPrice)}</td>
                  {isScrapRecoveryApplied && <td>{checkForDecimalAndNull(item?.ScrapRecoveryPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>}
                  <td>{checkForDecimalAndNull(item?.GrossWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                  <td>{checkForDecimalAndNull(item?.FinishWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                  <td>{checkForDecimalAndNull(item?.ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                  {!isPDFShow && viewCostingData[props.index]?.technologyId !== Ferrous_Casting && viewCostingData[props.index]?.technologyId !== RUBBER && (getTechnology.includes(viewCostingData[props.index]?.technologyId)) &&
                    <td>{!(viewCostingData[props.index]?.technologyId === MACHINING && item?.UOM !== "Meter" && getConfigurationKey().IsShowMachiningCalculatorForMeter) ?
                      <button
                        className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                        type={"button"}
                        disabled={(item?.RawMaterialCalculatorId === 0 || item?.RawMaterialCalculatorId === null || disabledForMonoCartonCorrugated) ? true : false}
                        onClick={() => { getWeightData(index) }}
                      /> : '-'}</td>}
                  {IsShowFreightAndShearingCostFields() && <td>{item?.FreightCost ? checkForDecimalAndNull(item?.FreightCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                  {IsShowFreightAndShearingCostFields() && <td>{item?.ShearingCost ? checkForDecimalAndNull(item?.ShearingCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                  {viewCostingData[0]?.technologyId === (PLASTIC || ELECTRICAL_STAMPING) && <td>{item?.BurningLossWeight ? checkForDecimalAndNull(item?.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>}
                  {viewCostingData[0]?.technologyId === DIE_CASTING && <td>{item?.CastingWeight ? checkForDecimalAndNull(item?.CastingWeight, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>}
                  {viewCostingData[0]?.technologyId === DIE_CASTING && <td>{item?.MeltingLoss ? `${checkForDecimalAndNull(item?.MeltingLoss, initialConfiguration.NoOfDecimalForInputOutput)} (${item?.LossPercentage}%)` : '-'}</td>}
                  <td> <div className='w-fit d-flex'><div id={`net-rm-cost${index}`}>{checkForDecimalAndNull(item?.NetLandedCost, initialConfiguration.NoOfDecimalForPrice)}{
                    viewCostingData[props.index]?.technologyId !== INSULATION &&
                    <TooltipCustom disabledIcon={true} tooltipClass="net-rm-cost" id={`net-rm-cost${index}`} tooltipText={(viewCostingData[props.index]?.technologyId === MACHINING && item?.IsCalculatorAvailable === true) ? 'Net RM Cost = RM/Pc - ScrapCost' : `Net RM Cost =((RM Rate * Gross Weight) - (Scrap Weight * Scrap Rate${isScrapRecoveryApplied ? ' * Scrap Recovery/100' : ''})${isRMDivisorApplicable(viewCostingData[0]?.technology) ? '/(' + RMDivisor + ')' : ''})`} />}</div>{item?.RawMaterialCalculatorId === null && item?.GrossWeight !== null && viewCostingData[props.index]?.technologyId === FORGING && <TooltipCustom id={`forging-tooltip${index}`} customClass={"mt-1 ml-2"} tooltipText={`RMC is calculated on the basis of Forging Scrap Rate.`} />}</div></td>
                  {initialConfiguration.IsShowCRMHead && <td>{item?.RawMaterialCRMHead}</td>}
                  <td>
                    <div className={`${isPDFShow ? '' : 'remark-overflow'}`} title={item?.Remark}>
                      <span>{item?.Remark ? item?.Remark : "-"}</span></div>
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
      </Col >

      {
        viewCostingData[props.index]?.isApplyMasterBatch && !isAssemblyCosting &&
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
                  <td>{viewCostingData[props.index]?.masterBatchRMName}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props.index]?.masterBatchRMPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props.index]?.masterBatchPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props.index]?.masterBatchTotal, initialConfiguration.NoOfDecimalForInputOutput)}</td>
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
        </>
      }

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
                      <td>{item?.PartNumber}</td>
                      <td>{item?.MasterBatchRMName}</td>
                      <td>{checkForDecimalAndNull(item?.MasterBatchRMPrice, initialConfiguration.NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(item?.MasterBatchPercentage, initialConfiguration.NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(item?.MasterBatchTotal, initialConfiguration.NoOfDecimalForInputOutput)}</td>
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
          BackdropProps={props?.fromCostingSummary && { style: { opacity: 0 } }}>
          <div className={"drawer-wrapper drawer-1500px px-2"}>
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
                  technology={viewCostingData[props.index]?.technologyId}
                  isSummary={true}
                  rmMBDetail={rmMBDetail} // MASTER BATCH DETAIL
                  CostingViewMode={true}   // THIS KEY WILL BE USE TO OPEN CALCI IN VIEW MODE
                  fromCostingSummary={props.fromCostingSummary}
                  rmData={viewCostingData[props.index]?.technologyId === RUBBER ? calciData.WeightCalculatorRequest.CostingRubberCalculationRawMaterials : calciData.WeightCalculatorRequest.CostingFerrousCalculationRawMaterials}
                  calculatorType={viewCostingData[props.index]?.CalculatorType}

                />
              )}
            </Row>
          </div>
        </Drawer> : (viewRM.length !== 0 && <Row className='mt-1'>{tableData()}</Row>)}
    </>
  );
}

export default React.memo(ViewRM)
