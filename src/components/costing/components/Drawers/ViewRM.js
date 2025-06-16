import React, { useEffect, useState } from 'react'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from '../WeightCalculatorDrawer';
import { useDispatch, useSelector } from 'react-redux';
import Toaster from '../../../common/Toaster';
import { IsShowFreightAndShearingCostFields, checkForDecimalAndNull, checkTechnologyIdAndRfq, getChangeHighlightClass, getConfigurationKey, isRMDivisorApplicable, showRMScrapKeys } from '../../../../helper';
import NoContentFound from '../../../common/NoContentFound';
import { AWAITING_APPROVAL_ID, EMPTY_DATA, PENDING_FOR_APPROVAL_ID, REJECTEDID, TOOLING } from '../../../../config/constants';
import { SHEETMETAL, RUBBER, FORGING, DIE_CASTING, PLASTIC, CORRUGATEDBOX, Ferrous_Casting, MACHINING, WIREFORMING, getTechnology, ELECTRICAL_STAMPING, INSULATION } from '../../../../config/masterData'
import 'reactjs-popup/dist/index.css'
import { getRawMaterialCalculationForCorrugatedBox, getRawMaterialCalculationForDieCasting, getRawMaterialCalculationForFerrous, getRawMaterialCalculationForForging, getRawMaterialCalculationForMachining, getRawMaterialCalculationForMonoCartonCorrugatedBox, getRawMaterialCalculationForPlastic, getRawMaterialCalculationForRubber, getRawMaterialCalculationForRubberStandard, getRawMaterialCalculationForSheetMetal, getSimulationCorrugatedAndMonoCartonCalculation, getSimulationRmFerrousCastingCalculation, getSimulationRmMachiningCalculation, getSimulationRmRubberCalculation, getRawMaterialCalculationForInsulation, getRawMaterialCalculationForLamination, getSimulationLaminationCalculation } from '../../actions/CostWorking'
import { Row, Col, Table, Nav, NavItem, NavLink } from 'reactstrap'
import TooltipCustom from '../../../common/Tooltip';
import _ from 'lodash';
import { useLabels } from '../../../../helper/core';
import DayTime from '../../../common/DayTimeWrapper';
import classnames from 'classnames';

function ViewRM(props) {

  const { viewRMData, rmMBDetail, isAssemblyCosting, isPDFShow, simulationMode, isSimulationDone } = props

  const dispatch = useDispatch()
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { finishWeightLabel } = useLabels()

  const [viewCostingData, setViewCostingData] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [partNumberList, setPartNumberList] = useState([])

  const [selectedPartData, setSelectedPartData] = useState([])

  const { viewCostingDetailData, viewRejectedCostingDetailData, viewCostingDetailDataForAssembly } = useSelector((state) => state.costing)
  const disabledForMonoCartonCorrugated = (viewCostingData[props.index]?.technologyId === CORRUGATEDBOX && (viewCostingData[props.index]?.CalculatorType === 'CorrugatedAndMonoCartonBox' || viewCostingData[props.index]?.CalculatorType === 'Laminate'))
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
    if (isAssemblyCosting && viewRMData) {
      const uniquePartNumbers = [...new Set(viewRMData.map(item => item?.PartNumber))].filter(Boolean);
      setPartNumberList(uniquePartNumbers);
      if (uniquePartNumbers.length > 0) {
        setSelectedPartData(viewRMData.filter(item => item?.PartNumber === uniquePartNumbers[0]));
      }
    }
  }, [viewRMData, isAssemblyCosting])

  useEffect(() => {
    setIsScrapRecoveryApplied((_.map(viewRM, 'IsScrapRecoveryPercentageApplied') || []).some(value => value === true));
  }, [viewRM])

  const setPartDetail = (index, partNumber) => {
    setActiveTab(index);
    setSelectedPartData(viewRM.filter(item => item?.PartNumber === partNumber));
  }

  const setCalculatorData = (res, index, type = '') => {
    if (res && res.data && res.data.Data) {
      const data = res.data.Data
      setCalciData({ ...viewRM[index], WeightCalculatorRequest: data, ...(type && { CalculatorType: type }) })
      setWeightCalculatorDrawer(true)
    }
  }

  const getWeightData = (index) => {
    setIndex(index)
    const tempData = viewCostingData[props.index]
    const selectedItem = isAssemblyCosting ? selectedPartData[index] : viewRM[index];
    // Find the calculator details for the selected part, checking both Assembly and SubAssembly
    const calculatorDetails = tempData?.CostingPartDetails?.CostingCalculatorDetails?.find(
      calc =>
        calc.PartNumber === selectedItem?.PartNumber &&
        calc.CostingId === selectedItem?.CostingId &&
        (
          (selectedItem?.IsChildPart && calc?.SubAssemblyCostingId === selectedItem?.SubAssemblyCostingId) ||
          (!selectedItem?.IsChildPart && calc?.AssemblyCostingId === selectedItem?.AssemblyCostingId)
        )
    );

    if (props?.simulationMode && String(tempData?.CostingHeading) === String("New Costing") &&
      (Number(tempData?.SimulationStatusId) === Number(REJECTEDID) ||
        Number(tempData?.SimulationStatusId) === Number(PENDING_FOR_APPROVAL_ID) ||
        Number(tempData?.SimulationStatusId) === Number(AWAITING_APPROVAL_ID)) &&
      selectedItem?.RawMaterialCalculatorId === null &&
      selectedItem?.IsCalculatorAvailable === true) {

      switch ((Number(tempData?.technologyId))) {
        case Ferrous_Casting:
          dispatch(getSimulationRmFerrousCastingCalculation(tempData?.SimulationId, selectedItem?.CostingId, res => {
            if (Number(res.status) === Number(204)) {
              Toaster.warning('Data is not available for calculator')
            } else {
              setCalculatorData(res, index)
            }
          }))
          break;

        case RUBBER:
          dispatch(getSimulationRmRubberCalculation(tempData?.SimulationId, selectedItem?.CostingId, res => {
            if (Number(res.status) === Number(204)) {
              Toaster.warning('Data is not available for calculator')
            } else {
              setCalculatorData(res, index)
            }
          }))
          break;
        case MACHINING:
          dispatch(getSimulationRmMachiningCalculation(tempData?.SimulationId, selectedItem?.CostingId, selectedItem?.RawMaterialId, res => {
            if (Number(res.status) === Number(204)) {
              Toaster.warning('Data is not available for calculator')
            } else {
              setCalculatorData(res, index)
            }
          }))
          break;
        case CORRUGATEDBOX:
          if (viewCostingData[props.index]?.CalculatorType === 'CorrugatedAndMonoCartonBox' || viewCostingData[props.index]?.CalculatorType === 'Laminate') {
            if (viewCostingData[props.index]?.CalculatorType === 'Laminate') {
              dispatch(getSimulationLaminationCalculation(tempData?.SimulationId, selectedItem?.CostingId, selectedItem?.RawMaterialId, res => {
                if (Number(res.status) === Number(204)) {
                  Toaster.warning('Data is not available for calculator')
                } else {
                  setCalculatorData(res, index)
                }
              }))
            } else {
              dispatch(getSimulationCorrugatedAndMonoCartonCalculation(tempData?.SimulationId, selectedItem?.CostingId, selectedItem?.RawMaterialId, res => {
                if (Number(res.status) === Number(204)) {
                  Toaster.warning('Data is not available for calculator')
                } else {
                  setCalculatorData(res, index)
                }
              }))
            }
          } else {
            if (selectedItem?.LayoutType === 'Plastic') {
              dispatch(getRawMaterialCalculationForPlastic(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
                if (Number(res.status) === Number(204)) {
                  Toaster.warning('Data is not available for calculator')
                } else {
                  setCalculatorData(res, index)
                }
              }))
            } else {
              dispatch(getRawMaterialCalculationForCorrugatedBox(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
                if (Number(res.status) === Number(204)) {
                  Toaster.warning('Data is not available for calculator')
                } else {
                  setCalculatorData(res, index)
                }
              }))
            }
          }
          break;
        default:
          return "none";
      }
    } else {
      if ((selectedItem.RawMaterialCalculatorId === 0 || selectedItem.RawMaterialCalculatorId === null) &&
        !(calculatorDetails?.CalculatorType === 'Standard')) {
        Toaster.warning('Data is not available for calculator')
        return false
      }

      switch ((Number(tempData?.technologyId))) {
        case SHEETMETAL:
        case WIREFORMING:
          dispatch(getRawMaterialCalculationForSheetMetal(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case FORGING:
          dispatch(getRawMaterialCalculationForForging(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case Ferrous_Casting:
          dispatch(getRawMaterialCalculationForFerrous(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case PLASTIC:
        case ELECTRICAL_STAMPING:
          dispatch(getRawMaterialCalculationForPlastic(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case CORRUGATEDBOX:
          if (calculatorDetails?.CalculatorType === 'CorrugatedAndMonoCartonBox') {
            dispatch(getRawMaterialCalculationForMonoCartonCorrugatedBox(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
              setCalculatorData(res, index)
            }))
          }
          else if (calculatorDetails?.CalculatorType === 'Laminate') {
            dispatch(getRawMaterialCalculationForLamination(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
              setCalculatorData(res, index)
            }))
          } else {
            if (selectedItem?.LayoutType === 'Plastic') {
              dispatch(getRawMaterialCalculationForPlastic(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
                setCalculatorData(res, index)
              }))
            } else {
              dispatch(getRawMaterialCalculationForCorrugatedBox(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
                setCalculatorData(res, index)
              }))
            }
          }
          break;
        case DIE_CASTING:
          dispatch(getRawMaterialCalculationForDieCasting(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case RUBBER:
          if (calculatorDetails?.CalculatorType === 'Standard') {
            dispatch(getRawMaterialCalculationForRubberStandard(selectedItem?.CostingId, res => {
              if (Number(res.status) === Number(204)) {
                Toaster.warning('Data is not available for calculator')
              } else {
                setCalculatorData(res, index, 'Standard')
              }
            }))
          } else {
            dispatch(getRawMaterialCalculationForRubber(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
              setCalculatorData(res, index, 'Compound')
            }))
          }
          break;
        case MACHINING:
          dispatch(getRawMaterialCalculationForMachining(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
          break;
        case INSULATION:
          dispatch(getRawMaterialCalculationForInsulation(selectedItem?.CostingId, selectedItem?.RawMaterialId, selectedItem?.RawMaterialCalculatorId, res => {
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
    const dataToShow = isAssemblyCosting ? selectedPartData : viewRM;
    return <>
      <div className="row">
        {isAssemblyCosting && partNumberList?.length > 0 && (
          <Nav tabs className="subtabs cr-subtabs-head view-conversion-header col-md-1">
            {partNumberList?.map((item, index) => (
              <NavItem key={index}>
                <NavLink
                  className={classnames({ active: activeTab === index })}
                  onClick={() => setPartDetail(index, item)}
                >
                  <div className='drawer-part-name'>
                    <span title={item}>{item}</span>
                  </div>
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        )}
        <div className="col-md-11">
          <Row>
            <Col md="12" className='mt-1'>
              <div className="left-border">Raw Material</div>
            </Col>
            {!isPDFShow && (
              <Col md="12" className='btn-container mt-1'>
                {viewCostingData && (viewCostingData[props?.index]?.technologyId === Ferrous_Casting || viewCostingData[props.index]?.technologyId === RUBBER || disabledForMonoCartonCorrugated) && (
                  <button
                    className="secondary-btn"
                    type={'button'}
                    disabled={viewCostingData && viewCostingData[props?.index]?.CostingPartDetails?.CostingRawMaterialsCost?.length === 0}
                    onClick={() => { getWeightData(0) }}
                  >
                    <div className='CalculatorIcon cr-cl-icon'></div>Weight Calculator
                  </button>
                )}
              </Col>
            )}
          </Row>
          <Row>
            <Col md="12">
              <Table className="table cr-brdr-main conversion-cost" size="sm">
                <thead>
                  <tr>
                    {isAssemblyCosting && <th>{`Part No`}</th>}
                    <th>{`RM Name -Grade`}</th>
                    {checkTechnologyIdAndRfq(viewCostingData) && <th>{`Updated RM Name`}</th>}
                    <th>{`RM Code`}</th>
                    <th>{`RM Rate`}</th>
                    <th>{showRMScrapKeys(viewCostingData && Number(viewCostingData[props.index]?.technologyId))?.name}</th>
                    {isScrapRecoveryApplied && <th>{`Scrap Recovery (%)`}</th>}
                    <th>{`Gross Weight (Kg)`}</th>
                    <th>{`${finishWeightLabel} Weight (Kg)`}</th>
                    <th>{`Scrap Weight`}</th>
                    {viewCostingData[0]?.technologyId === SHEETMETAL && (
                      <>
                        <th>{`RM Base (Effective Date)`}</th>
                        <th>{`Yield %`}</th>
                      </>
                    )}
                    {!isPDFShow && viewCostingData[props.index]?.technologyId !== Ferrous_Casting && viewCostingData[props.index]?.technologyId !== RUBBER && (getTechnology.includes(viewCostingData[props.index]?.technologyId)) && <th>{`Calculator`}</th>}
                    {IsShowFreightAndShearingCostFields() && <th>{`Freight Cost`}</th>}
                    {IsShowFreightAndShearingCostFields() && <th>{`Shearing Cost`}</th>}
                    {viewCostingData[0]?.technologyId === (PLASTIC || ELECTRICAL_STAMPING) && <th>{`Burning Loss Weight`}</th>}
                    {viewCostingData[0]?.technologyId === DIE_CASTING && <th>Casting Weight</th>}
                    {viewCostingData[0]?.technologyId === DIE_CASTING && <th>Melting Loss (Loss%)</th>}
                    <th>{`Net RM Cost ${isRMDivisorApplicable(viewCostingData[0]?.technology) ? '/(' + RMDivisor + ')' : ''}`}</th>
                    {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                    <th>{`Effective Date`}</th>
                    <th className="costing-border-right">{`Remark`}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataToShow && dataToShow?.length > 0 && dataToShow?.map((item, index) => (
                    <tr key={index}>
                      {isAssemblyCosting && (
                        <td className={`${isPDFShow ? '' : 'text-overflow'}`}>
                          <span title={item?.PartNumber || ""}>{item?.PartNumber || ""}</span>
                        </td>
                      )}
                      <td className={`${isPDFShow ? '' : 'text-overflow'}`}>
                        <span title={item?.RMName}>{item?.RMName}</span>
                      </td>
                      {checkTechnologyIdAndRfq(viewCostingData) && (
                        <td>
                          <div className={getChangeHighlightClass(item?.RMName, item?.UpdatedRawMaterialName)}>
                            {item?.UpdatedRawMaterialName || '-'}
                          </div>
                        </td>
                      )}
                      <td>{item?.RawMaterialCode || '-'}</td>
                      <td>{checkForDecimalAndNull(item?.RMRate, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      <td>{checkForDecimalAndNull(item?.ScrapRate, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      {isScrapRecoveryApplied && (
                        <td>{checkForDecimalAndNull(item?.ScrapRecoveryPercentage, initialConfiguration?.NoOfDecimalForPrice)}</td>
                      )}
                      <td>{checkForDecimalAndNull(item?.GrossWeight, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                      <td>{checkForDecimalAndNull(item?.FinishWeight, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                      <td>{checkForDecimalAndNull(item?.ScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                      {viewCostingData[0]?.technologyId === SHEETMETAL && (
                        <>
                          <td>{DayTime(item?.EffectiveDate).isValid() ? DayTime(item?.EffectiveDate).format('YYYY-MM-DD') : '-'}</td>
                          <td>{checkForDecimalAndNull(item?.YieldPercentage, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                        </>
                      )}
                      {!isPDFShow && viewCostingData[props.index]?.technologyId !== Ferrous_Casting && viewCostingData[props.index]?.technologyId !== RUBBER && (getTechnology.includes(viewCostingData[props.index]?.technologyId)) && (
                        <td>
                          {!(viewCostingData[props.index]?.technologyId === MACHINING && item?.UOM !== "Meter" && getConfigurationKey().IsShowMachiningCalculatorForMeter) ? (
                            <button
                              className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                              type="button"
                              disabled={(item?.RawMaterialCalculatorId === 0 || item?.RawMaterialCalculatorId === null || disabledForMonoCartonCorrugated)}
                              onClick={() => { getWeightData(index) }}
                            />
                          ) : '-'}
                        </td>
                      )}
                      {IsShowFreightAndShearingCostFields() && (<td>{item?.FreightCost ? checkForDecimalAndNull(item?.FreightCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      )}
                      {IsShowFreightAndShearingCostFields() && (<td>{item?.ShearingCost ? checkForDecimalAndNull(item?.ShearingCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                      )}
                      {viewCostingData[0]?.technologyId === (PLASTIC || ELECTRICAL_STAMPING) && (<td>{item?.BurningLossWeight ? checkForDecimalAndNull(item?.BurningLossWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}</td>
                      )}
                      {viewCostingData[0]?.technologyId === DIE_CASTING && (<td>{item?.CastingWeight ? checkForDecimalAndNull(item?.CastingWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '-'}</td>
                      )}
                      {viewCostingData[0]?.technologyId === DIE_CASTING && (<td>{item?.MeltingLoss ? `${checkForDecimalAndNull(item?.MeltingLoss, initialConfiguration?.NoOfDecimalForInputOutput)} (${item?.LossPercentage}%)` : '-'}</td>
                      )}
                      <td>
                        <div className='w-fit d-flex'>
                          <div id={`net-rm-cost${index}`}>
                            {checkForDecimalAndNull(item?.NetLandedCost, initialConfiguration?.NoOfDecimalForPrice)}
                            {viewCostingData[props.index]?.technologyId !== INSULATION && (
                              <TooltipCustom
                                disabledIcon={true}
                                tooltipClass="net-rm-cost"
                                id={`net-rm-cost${index}`}
                                tooltipText={(viewCostingData[props.index]?.technologyId === MACHINING && item?.IsCalculatorAvailable === true)
                                  ? 'Net RM Cost = RM/Pc - ScrapCost'
                                  : `Net RM Cost =((RM Rate * Gross Weight) - (Scrap Weight * Scrap Rate${isScrapRecoveryApplied ? ' * Scrap Recovery/100' : ''})${isRMDivisorApplicable(viewCostingData[0]?.technology) ? '/(' + RMDivisor + ')' : ''})`}
                              />
                            )}
                          </div>
                          {item?.RawMaterialCalculatorId === null && item?.GrossWeight !== null && viewCostingData[props.index]?.technologyId === FORGING && (
                            <TooltipCustom
                              id={`forging-tooltip${index}`}
                              customClass={"mt-1 ml-2"}
                              tooltipText={`RMC is calculated on the basis of Forging Scrap Rate.`}
                            />
                          )}
                        </div>
                      </td>
                      {initialConfiguration?.IsShowCRMHead && <td>{item?.RawMaterialCRMHead}</td>}
                      <td>{item?.EffectiveDate ? DayTime(item?.EffectiveDate).format('DD/MM/YYYY') : '-'}</td>
                      <td>
                        <div className={`${isPDFShow ? '' : 'remark-overflow'}`} title={item?.Remark}>
                          <span>{item?.Remark ? item?.Remark : "-"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {dataToShow?.length === 0 && (
                    <tr>
                      <td colSpan={13}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </Row>
        </div>
      </div>

      {viewCostingData[props?.index]?.isApplyMasterBatch && !isAssemblyCosting && (
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
                  <td>{viewCostingData[props?.index]?.masterBatchRMName}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props?.index]?.masterBatchRMPrice, initialConfiguration?.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props?.index]?.masterBatchPercentage, initialConfiguration?.NoOfDecimalForPrice)}</td>
                  <td>{checkForDecimalAndNull(viewCostingData[props?.index]?.masterBatchTotal, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                </tr>
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
        </>
      )}

      {
        isAssemblyCosting && masterBatchList?.length > 0 && !simulationMode/* (!isSimulationDone === false ? isSimulationDone : (simulationMode ? simulationMode : false)) */ &&(
        <>
          <Col md="12">
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
                {masterBatchList.map((item, indexMB) => (
                  <tr key={indexMB}>
                    <td>{item?.PartNumber}</td>
                    <td>{item?.MasterBatchRMName}</td>
                    <td>{checkForDecimalAndNull(item?.MasterBatchRMPrice, initialConfiguration?.NoOfDecimalForPrice)}</td>
                    <td>{checkForDecimalAndNull(item?.MasterBatchPercentage, initialConfiguration?.NoOfDecimalForPrice)}</td>
                    <td>{checkForDecimalAndNull(item?.MasterBatchTotal, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                  </tr>
                ))}
                {masterBatchList?.length === 0 && (
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
      )}
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
                  rmData={viewCostingData[props.index]?.technologyId === RUBBER ? (viewCostingData[props.index]?.CalculatorType === "Standard" ? calciData.WeightCalculatorRequest.RawMaterialRubberStandardWeightCalculator : calciData.WeightCalculatorRequest.CostingRubberCalculationRawMaterials) : calciData.WeightCalculatorRequest.CostingFerrousCalculationRawMaterials}
                  calculatorType={viewCostingData[props.index]?.CalculatorType ? viewCostingData[props.index]?.CalculatorType : '' }

                />
              )}
            </Row>
          </div>
        </Drawer> : (viewRM.length !== 0 && <Row className='mt-1'>{tableData()}</Row>)}
    </>
  );
}

export default React.memo(ViewRM)
