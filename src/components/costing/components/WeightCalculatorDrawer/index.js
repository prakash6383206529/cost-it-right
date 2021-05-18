import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Container, } from 'reactstrap'
import classnames from 'classnames'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from './sheetMetal'
import ForgingCalculator from './forging'
import Plastic from './Plastic'
import Rubber from './Rubber'
import { SHEETMETAL, RUBBER, PLASTIC, FORGINING, Non_Ferrous_HPDC } from '../../../../config/masterData'
import HPDC from './HPDC'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper'


function OpenWeightCalculator(props) {
  const { rmRowData, isEditFlag, item } = props
  const { CostingPartDetails } = item
  const { IsApplyMasterBatch, MasterBatchTotal } = CostingPartDetails

  const technology = props.technology;


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

  const dispatch = useDispatch()

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
          />
        )
      case FORGINING:
        return (
          <ForgingCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
          />
        )
      case PLASTIC:
        return (
          <Plastic
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            item={item}
            toggleDrawer={toggleDrawer}
          />
        )
      case RUBBER:
        return <Rubber
          rmRowData={props.rmRowData}
          inputDiameter={props.inputDiameter}
          isEditFlag={props.isEditFlag}
          toggleDrawer={toggleDrawer}
        />
      case Non_Ferrous_HPDC:
        return <HPDC
          rmRowData={props.rmRowData}
          isEditFlag={props.isEditFlag}
          toggleDrawer={toggleDrawer}
        />
      default:
        break;
    }
  }

  return (
    <div>
      <Drawer
        className="weight-drawer-costing"
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
              <Col md="12 d-flex">
                <div className="d-inline-block mr-4"><span className="grey-text d-block">RM Name:</span><span className="text-dark-blue">{`${rmRowData.RMName !== undefined ? rmRowData.RMName : ''}`}</span></div>
                <div className="d-inline-block mr-4"><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowData.MaterialType !== undefined ? rmRowData.MaterialType : ''}`}</span></div>
                <div className="d-inline-block mr-4"><span className="grey-text d-block">Density(g/cm{<sup>3</sup>}):</span><span className="text-dark-blue">{`${rmRowData.Density !== undefined ? rmRowData.Density : ''}`}</span></div>
                <div className="d-inline-block mr-4"><span className="grey-text d-block">RM Rate:</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? rmRowData.RMRate : ''}`}</span></div>
                {IsApplyMasterBatch && <div className="d-inline-block mr-4"><span className="grey-text d-block">RM Rate(including<br/> Master Batch):</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? checkForDecimalAndNull(Number(rmRowData.RMRate) + Number(MasterBatchTotal), getConfigurationKey().NoOfDecimalForInputOutput) : ''}`}</span></div>}
                <div className="d-inline-block mr-4"><span className="grey-text d-block">Scrap Rate:</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? rmRowData.ScrapRate : ''}`}</span></div>
                <div className="d-inline-block mr-4"><span className="grey-text d-block">Category:</span><span className="text-dark-blue">{`${rmRowData.RawMaterialCategory !== undefined ? rmRowData.RawMaterialCategory : ''}`}</span></div>
              </Col>
            </Row>
            {openConditionalDrawer()}
          </div>
        </Container>
      </Drawer>
    </div>
  )
}

export default OpenWeightCalculator
