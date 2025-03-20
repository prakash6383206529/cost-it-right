import React from 'react'
import { Row, Col, Container, } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from './sheetMetal'
import InsulationCalculator from './Insulation/Insulation'
import ForgingCalculator from './forging'
import { SHEETMETAL, RUBBER, PLASTIC, FORGING, DIE_CASTING, CORRUGATEDBOX, Ferrous_Casting, MACHINING, WIREFORMING, ELECTRICAL_STAMPING, INSULATION } from '../../../../config/masterData'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper'
import NonFerrousCalculator from './dieCasting'
import Ferrous from './Ferrous'
import CorrugatedBoxCalculator from './corrugatedBox/index'
import RubberCalciTab from './rubber'
//MINDA
// import RubberCalciTab from './rubber/Rubber'
import Machining from './MachiningCalculator'
import Pipe from './sheetMetal/Pipe'
import { reactLocalStorage } from 'reactjs-localstorage'
import Stamping from './Stamping'
import { showPaperCorrugatedBox } from '../../../../config/constants'
import { useSelector } from 'react-redux'
import { sourceCurrencyFormatter } from '../Drawers/processCalculatorDrawer/CommonFormula'
import MonoCartoon from './corrugatedBox/monoCartoon'
import PlasticCalculator from './plastic/index'

function OpenWeightCalculator(props) {
  const { rmRowData, item, isSummary, rmMBDetail, CostingViewMode, rmData, technology, DisableMasterBatchCheckbox, calculatorType } = props
  let appyMasterBatch;
  let totalRM;
  const { currencySource } = useSelector((state) => state?.costing);

  if (!isSummary) {
    const { CostingPartDetails } = item
    const { IsApplyMasterBatch, MasterBatchTotal, MasterBatchPercentage } = CostingPartDetails
    appyMasterBatch = (IsApplyMasterBatch === null || IsApplyMasterBatch === undefined || IsApplyMasterBatch === false) ? false : true

    if (appyMasterBatch) {

      const RMRate = calculatePercentageValue(rmRowData.RMRate, (100 - MasterBatchPercentage));
      const RMRatePlusMasterBatchRate = RMRate + checkForNull(MasterBatchTotal)
      totalRM = RMRatePlusMasterBatchRate

    } else {
      totalRM = Number(rmRowData.RMRate)

    }
  } else {
    const { IsApplyMasterBatch, MasterBatchTotal, MasterBatchPercentage } = rmMBDetail
    appyMasterBatch = (IsApplyMasterBatch === null || IsApplyMasterBatch === undefined || IsApplyMasterBatch === false) ? false : true
    if (appyMasterBatch) {

      const RMRate = calculatePercentageValue(rmRowData.RMRate, (100 - MasterBatchPercentage));
      const RMRatePlusMasterBatchRate = RMRate + checkForNull(MasterBatchTotal)
      totalRM = RMRatePlusMasterBatchRate

    } else {
      totalRM = Number(rmRowData.RMRate)

    }
  }


  /**
   * @method toggleDrawer
   * @description TOGGLE DRAWER
   */
  const toggleDrawer = (event, weightData = {}, originalWeight = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    let calculatorType = ''
    if (!isSummary) {
      if (weightData.CalculatorType) {
        calculatorType = weightData.CalculatorType
      } else {
        calculatorType = (props.rmData[0] && props.rmData[0].CalculatorType && props.rmData[0].WeightCalculationId) ? props.rmData[0].CalculatorType : ''
      }
    }
    // props.closeDrawer((Number(technology) === Number(CORRUGATEDBOX) && !isSummary) ? calculatorType : event, weightData, originalWeight)
    props.closeDrawer((Number(technology) === Number(CORRUGATEDBOX || Number(technology) === Number(RUBBER)) && !isSummary) ? calculatorType : event, weightData, originalWeight)
  }

  /**
   * @method render
   * @description Renders the component
   */
  //   useEffect(() => {
  //     openConditionalDrawer(technology)
  //   }, [])

  const openConditionalDrawer = () => {
    switch (Number(technology)) {
      case SHEETMETAL:
        return (
          <WeightCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
            item={item}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
          />
        )
      //insulation code
      case INSULATION:
        return (
          <InsulationCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
            item={item}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
          />
        )
      case FORGING:
        return (
          <ForgingCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            item={item}
            toggleDrawer={toggleDrawer}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
          />
        )
      case PLASTIC:
        return (
          <PlasticCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            item={item}
            toggleDrawer={toggleDrawer}
            isSummary={isSummary}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
            DisableMasterBatchCheckbox={DisableMasterBatchCheckbox}
          />
        )
      case ELECTRICAL_STAMPING:
        return (
          <Stamping
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            item={item}
            toggleDrawer={toggleDrawer}
            isSummary={isSummary}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
            DisableMasterBatchCheckbox={DisableMasterBatchCheckbox}
          />
        )
      case RUBBER:
        return (<RubberCalciTab
          rmRowData={props.rmRowData}
          inputDiameter={props.inputDiameter}
          isEditFlag={props.isEditFlag}
          toggleDrawer={toggleDrawer}
          rmData={rmData}
          item={item}
          appyMasterBatch={appyMasterBatch}
          CostingViewMode={CostingViewMode ? CostingViewMode : false}
          calculatorType={calculatorType}
        />)
      case DIE_CASTING:
        return (<NonFerrousCalculator

          rmRowData={props.rmRowData}
          isEditFlag={props.isEditFlag}
          toggleDrawer={toggleDrawer}
          item={item}
          CostingViewMode={CostingViewMode ? CostingViewMode : false}
        />
        )

      case CORRUGATEDBOX:
        if (calculatorType === 'CorrugatedAndMonoCartonBox' || calculatorType === 'Laminate') {
          return (
            <MonoCartoon
              rmRowData={props.rmRowData}
              calculatorType={calculatorType}
              isEditFlag={props.isEditFlag}
              toggleDrawer={toggleDrawer}
              item={item}
              rmData={rmData}
              CostingViewMode={CostingViewMode ? CostingViewMode : false}
            />
          )
        } else {
          return (
            <CorrugatedBoxCalculator
              rmRowData={props.rmRowData}
              isEditFlag={props.isEditFlag}
              toggleDrawer={toggleDrawer}
              item={item}
              CostingViewMode={CostingViewMode ? CostingViewMode : false}
              isSummary={isSummary}
            />
          )
        }
      case Ferrous_Casting:
        return (
          <Ferrous
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
            item={item}
            rmData={rmData}
          />
        )
      case MACHINING:
        return (
          <Machining
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
            item={item}
            rmData={rmData}
          />
        )
      case WIREFORMING:
        return (
          <Pipe
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
            item={item}
          />
        )
      default:
        break;
    }
  }
  const drawerClassHandler = () => {
    switch (Number(technology)) {
      case FORGING:
        return 'forging'

      case SHEETMETAL:
        return 'sheet-metal'

      case Ferrous_Casting:
        return 'ferrous'

      case INSULATION:
        return 'insulation'
      case CORRUGATEDBOX:
        if (calculatorType === 'CorrugatedAndMonoCartonBox' || calculatorType === 'Laminate') {
          return 'paper_corrugated_box'
        } else {
          return ''
        }
      default:
        break;
    }
  }

  return (
    <div>
      <Drawer
        className={`weight-drawer-costing calculator-drawer calculator__${drawerClassHandler()}`}
        anchor={props.anchor}
        open={props.isOpen}
        // onClose={(e) => toggleDrawer(e)}
        BackdropProps={props?.fromCostingSummary && { style: { opacity: 0 } }}>
        <Container className='px-0'>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{Number(technology) !== Number(Ferrous_Casting) ? 'Weight Calculator' : 'Alloy Composition '}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(Number(technology) === Number(RUBBER) ? calculatorType : e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            {Number(technology) !== Number(RUBBER) && Number(technology) !== Number(Ferrous_Casting) && (showPaperCorrugatedBox && Number(technology) !== Number(CORRUGATEDBOX)) &&
              <Row className="mt-4 mb-4 pb-2">
                <Col md="12 d-flex weight-calculator-headings">
                  <div className="d-inline-block overflow"><span className="grey-text d-block">RM Name :</span><span className="text-dark-blue one-line-overflow" title={rmRowData.RMName}>{`${rmRowData.RMName !== undefined ? rmRowData.RMName : ''}`}</span></div>
                  <div className="d-inline-block "><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowData?.MaterialType !== null ? rmRowData?.MaterialType : '-'}`}</span></div>
                  {(Number(technology) === Number(SHEETMETAL) || Number(technology) === Number(FORGING) || Number(technology) === Number(MACHINING) || Number(technology) === Number(INSULATION)) && <div className="d-inline-block "><span className="grey-text d-block">Density(g/cm){<sup>3</sup>}:</span><span className="text-dark-blue">{`${rmRowData.Density !== undefined ? rmRowData.Density : ''}`}</span></div>}
                  <div className="d-inline-block "><span className="grey-text d-block">RM Rate ({sourceCurrencyFormatter(currencySource?.label)}):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? checkForDecimalAndNull(rmRowData.RMRate, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>
                  {appyMasterBatch && < div className="d-inline-block "><span className="grey-text d-block">RM Rate(including Master Batch):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? checkForDecimalAndNull(totalRM, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>}
                  {Number(technology) === Number(MACHINING) && <div className="d-inline-block "><span className="grey-text d-block">{`Scrap Rate Per Scrap UOM(${sourceCurrencyFormatter(currencySource?.label)}/${rmRowData.ScrapUnitOfMeasurement}):`}</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? Number(technology) === Number(MACHINING) ? (rmRowData.ScrapRatePerScrapUOMConversion ? checkForDecimalAndNull(rmRowData.ScrapRatePerScrapUOMConversion, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(rmRowData.ScrapRatePerScrapUOM, getConfigurationKey().NoOfDecimalForPrice)) : checkForDecimalAndNull(rmRowData.ScrapRate, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>}
                  <div className="d-inline-block "><span className="grey-text d-block">{Number(technology) === Number(FORGING) ? 'Forging Scrap' : 'Scrap'} Rate({sourceCurrencyFormatter(currencySource?.label)}/{rmRowData?.UOMSymbol}):</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? checkForDecimalAndNull(rmRowData.ScrapRate, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>
                  {Number(technology) === Number(FORGING) && <div className="d-inline-block "><span className="grey-text d-block">Machining Scrap Rate({sourceCurrencyFormatter(currencySource?.label)}/{rmRowData.UOMSymbol}):</span><span className="text-dark-blue">{`${rmRowData.MachiningScrapRate ? checkForDecimalAndNull(rmRowData.MachiningScrapRate, getConfigurationKey().NoOfDecimalForPrice) : 0}`}</span></div>}
                  <div className="d-inline-block"><span className="grey-text d-block">Category:</span><span className="text-dark-blue">{`${rmRowData.RawMaterialCategory !== undefined ? rmRowData.RawMaterialCategory : ''}`}</span></div>

                </Col>
              </Row>
            }
            {openConditionalDrawer()}
          </div>
        </Container>
      </Drawer>
    </div >
  )
}

export default OpenWeightCalculator
