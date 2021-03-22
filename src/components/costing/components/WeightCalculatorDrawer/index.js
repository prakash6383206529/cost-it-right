import React, { useState, useEffect, Fragment } from 'react'
import { useDispatch } from 'react-redux'
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Container, } from 'reactstrap'
import classnames from 'classnames'
import Drawer from '@material-ui/core/Drawer'
import WeightCalculator from './sheetMetal'
import ForgingCalculator from './forging'
import Plastic from './Plastic'
import Rubber from './Rubber'

function OpenWeightCalculator(props) {
  const { rmRowData, isEditFlag } = props

  const technology = props.technology;

  /**
   * @method toggleDrawer
   * @description TOGGLE DRAWER
   */
  const toggleDrawer = (event, weightData = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    props.closeDrawer('', weightData)
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
    switch (technology) {
      case 'Sheet Metal':
        return (
          <WeightCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
          />
        )
      case 'Forgining':
        return (
          <ForgingCalculator
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
          />
        )
      case 'Plastic':
        return (
          <Plastic
            rmRowData={props.rmRowData}
            isEditFlag={props.isEditFlag}
            toggleDrawer={toggleDrawer}
          />
        )
      case 'Rubber':
        return <Rubber
          rmRowData={props.rmRowData}
          inputDiameter={props.inputDiameter}
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
        onClose={(e) => toggleDrawer(e)}
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
              <Col md="2"><span className="grey-text d-block">RM Name:</span><span className="text-dark-blue">{`${rmRowData.RMName !== undefined ? rmRowData.RMName : ''}`}</span></Col>
              <Col md="2"><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowData.MaterialType !== undefined ? rmRowData.MaterialType : ''}`}</span></Col>
              <Col md="2"><span className="grey-text d-block">Density(g/cm3):</span><span className="text-dark-blue">{`${rmRowData.Density !== undefined ? rmRowData.Density : ''}`}</span></Col>
              <Col md="2"><span className="grey-text d-block">RM Rate:</span><span className="text-dark-blue">{`${rmRowData.RMRate !== undefined ? rmRowData.RMRate : ''}`}</span></Col>
              <Col md="2"><span className="grey-text d-block">Scrap Rate:</span><span className="text-dark-blue">{`${rmRowData.ScrapRate !== undefined ? rmRowData.ScrapRate : ''}`}</span></Col>
            </Row>
            {openConditionalDrawer()}
          </div>
        </Container>
      </Drawer>
    </div>
  )
}

export default OpenWeightCalculator
