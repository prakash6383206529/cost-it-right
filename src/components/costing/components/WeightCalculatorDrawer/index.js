import React from 'react'
import { Row, Col, Container, } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from './sheetMetal'
import ForgingCalculator from './forging'
import Plastic from './Plastic'
import { SHEETMETAL, RUBBER, PLASTIC, FORGING, DIE_CASTING, CORRUGATEDBOX, Ferrous_Casting, MACHINING, WIREFORMING, ELECTRICAL_STAMPING } from '../../../../config/masterData'
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
import PaperCorrugatedBox from './corrugatedBox/PaperCorrugatedBox'

function OpenWeightCalculator(props) {
  const { rmRowData, item, isSummary, rmMBDetail, CostingViewMode, rmData, technology, DisableMasterBatchCheckbox, calculatorType } = props

  let appyMasterBatch;
  let totalRM;
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
    props.closeDrawer(event, weightData, originalWeight)
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
          <Plastic
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
        if (calculatorType === 'CorrugatedAndMonoCartonBox') {
          return (
            <PaperCorrugatedBox
              rmRowData={props.rmRowData}
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
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            {Number(technology) !== Number(RUBBER) && Number(technology) !== Number(Ferrous_Casting) && (showPaperCorrugatedBox && Number(technology) !== Number(CORRUGATEDBOX)) &&
              <Row className="mt-4 mb-4 pb-2">
                <Col md="12 d-flex weight-calculator-headings">
                  <div className="d-inline-block overflow"><span className="grey-text d-block">RM Name:</span><span className="text-dark-blue one-line-overflow" title={rmRowData.RMName}>{`${rmRowData.RMName !== undefined ? rmRowData.RMName : ''}`}</span></div>
                  <div className="d-inline-block "><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowData.MaterialType !== undefined ? rmRowData.MaterialType : ''}`}</span></div>
                  {(Number(technology) === Number(SHEETMETAL) || Number(technology) === Number(FORGING) || Number(technology) === Number(MACHINING)) && <div className="d-inline-block "><span className="grey-text d-block">Density(g/cm){<sup>3</sup>}:</span><span className="text-dark-blue">{`${rmRowData.Density !== undefined ? rmRowData.Density : ''}`}</span></div>}
                  <div className="d-inline-block "><span className="grey-text d-block">RM Rate ({reactLocalStorage.getObject("baseCurrency")}):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? checkForDecimalAndNull(rmRowData.RMRate, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>
                  {appyMasterBatch && < div className="d-inline-block "><span className="grey-text d-block">RM Rate(including Master Batch):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? checkForDecimalAndNull(totalRM, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>}
                  {Number(technology) === Number(MACHINING) && <div className="d-inline-block "><span className="grey-text d-block">{`Scrap Rate Per Scrap UOM(${reactLocalStorage.getObject("baseCurrency")}/${rmRowData.ScrapUnitOfMeasurement}):`}</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? Number(technology) === Number(MACHINING) ? (rmRowData.ScrapRatePerScrapUOMConversion ? checkForDecimalAndNull(rmRowData.ScrapRatePerScrapUOMConversion, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(rmRowData.ScrapRatePerScrapUOM, getConfigurationKey().NoOfDecimalForPrice)) : checkForDecimalAndNull(rmRowData.ScrapRate, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>}
                  <div className="d-inline-block "><span className="grey-text d-block">{Number(technology) === Number(FORGING) ? 'Forging Scrap' : 'Scrap'} Rate({reactLocalStorage.getObject("baseCurrency")}/{rmRowData?.UOMSymbol}):</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? checkForDecimalAndNull(rmRowData.ScrapRate, getConfigurationKey().NoOfDecimalForPrice) : ''}`}</span></div>
                  {Number(technology) === Number(FORGING) && <div className="d-inline-block "><span className="grey-text d-block">Machining Scrap Rate({reactLocalStorage.getObject("baseCurrency")}/{rmRowData.UOMSymbol}):</span><span className="text-dark-blue">{`${rmRowData.MachiningScrapRate ? checkForDecimalAndNull(rmRowData.MachiningScrapRate, getConfigurationKey().NoOfDecimalForPrice) : 0}`}</span></div>}
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
