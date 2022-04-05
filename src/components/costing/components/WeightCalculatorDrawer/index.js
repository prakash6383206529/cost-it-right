import React from 'react'
import { Row, Col, Container, } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from './sheetMetal'
import ForgingCalculator from './forging'
import Plastic from './Plastic'
import { SHEETMETAL, RUBBER, PLASTIC, FORGING, DIE_CASTING, CORRUGATEDBOX, Ferrous_Casting } from '../../../../config/masterData'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper'
import RubberCalciTab from './rubber'
import CorrugatedBox from './CorrugatedBox';
import NonFerrousCalculator from './dieCasting'
import Ferrous from './Ferrous'



function OpenWeightCalculator(props) {
  const { rmRowData, item, isSummary, rmMBDetail, CostingViewMode, rmData, technology } = props
  let appyMasterBatch;
  let totalRM;
  if (!isSummary) {
    const { CostingPartDetails } = item
    const { IsApplyMasterBatch, MasterBatchTotal, MasterBatchPercentage } = CostingPartDetails
    appyMasterBatch = (IsApplyMasterBatch === null || IsApplyMasterBatch === false) ? false : true

    if (appyMasterBatch) {

      const RMRate = calculatePercentageValue(rmRowData.RMRate, (100 - MasterBatchPercentage));
      const RMRatePlusMasterBatchRate = RMRate + checkForNull(MasterBatchTotal)
      totalRM = RMRatePlusMasterBatchRate

    } else {
      totalRM = Number(rmRowData.RMRate)

    }
  } else {
    const { IsApplyMasterBatch, MasterBatchTotal, MasterBatchPercentage } = rmMBDetail
    appyMasterBatch = (IsApplyMasterBatch === null || IsApplyMasterBatch === false) ? false : true
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
    props.closeDrawer('', weightData, originalWeight)
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
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
          />
        )
      case FORGING:
        return (
          <ForgingCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
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
          />
        )
      case RUBBER:
        return (<RubberCalciTab
          rmRowData={props.rmRowData}
          inputDiameter={props.inputDiameter}
          isEditFlag={props.isEditFlag}
          toggleDrawer={toggleDrawer}
          CostingViewMode={CostingViewMode ? CostingViewMode : false}
        />)
      case DIE_CASTING:
        return (<NonFerrousCalculator

          rmRowData={props.rmRowData}
          isEditFlag={props.isEditFlag}
          toggleDrawer={toggleDrawer}
          CostingViewMode={CostingViewMode ? CostingViewMode : false}
        />
        )

      case CORRUGATEDBOX:
        return (
          <CorrugatedBox
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
            CostingViewMode={CostingViewMode ? CostingViewMode : false}
          />
        )
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

      default:
        break;
    }
  }

  return (
    <div>
      <Drawer
        className="weight-drawer-costing calculator-drawer"
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Weight Calculator'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>
            <Row className="mt-4 mb-4 pb-2">
              <Col md="12 d-flex weight-calculator-headings">
                <div className="d-inline-block "><span className="grey-text d-block">RM Name:</span><span className="text-dark-blue one-line-overflow" title={rmRowData.RMName}>{`${rmRowData.RMName !== undefined ? rmRowData.RMName : ''}`}</span></div>
                <div className="d-inline-block "><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowData.MaterialType !== undefined ? rmRowData.MaterialType : ''}`}</span></div>
                <div className="d-inline-block "><span className="grey-text d-block">Density(g/cm){<sup>3</sup>}):</span><span className="text-dark-blue">{`${rmRowData.Density !== undefined ? rmRowData.Density : ''}`}</span></div>
                <div className="d-inline-block "><span className="grey-text d-block">RM Rate(INR):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? rmRowData.RMRate : ''}`}</span></div>
                {appyMasterBatch && < div className="d-inline-block "><span className="grey-text d-block">RM Rate(including Master Batch):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? checkForDecimalAndNull(totalRM, getConfigurationKey().NoOfDecimalForInputOutput) : ''}`}</span></div>}
                <div className="d-inline-block "><span className="grey-text d-block">Scrap Rate(INR):</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? rmRowData.ScrapRate : ''}`}</span></div>
                <div className="d-inline-block"><span className="grey-text d-block">Category:</span><span className="text-dark-blue">{`${rmRowData.RawMaterialCategory !== undefined ? rmRowData.RawMaterialCategory : ''}`}</span></div>

              </Col>
            </Row>
            {openConditionalDrawer()}
          </div>
        </Container>
      </Drawer>
    </div >
  )
}

export default OpenWeightCalculator
