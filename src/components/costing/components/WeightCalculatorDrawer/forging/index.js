import React, { Fragment, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Container,
} from 'reactstrap'
import classnames from 'classnames'
import Drawer from '@material-ui/core/Drawer'
import ColdForging from './ColdForging'
import HotForging from './HotForging'

function ForgingCalculator(props) {
  const { rmRowData } = props
  const [activeTab, setActiveTab] = useState('1')
  /**
   * @method toggleDrawer
   * @description TOGGLE DRAWER
   */
  const toggleDrawer = (event, weightData = {}) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('', weightData)
  }

  /**
   * @method toggle
   * @description toggling the tabs
   */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab)
    }
  }

  return (
    <Fragment>
      {/* <Row>
        <Col md="2">{`RM Name: ${
          rmRowData.RMName !== undefined ? rmRowData.RMName : ''
        }`}</Col>
        <Col md="2">{`Material: ${
          rmRowData.MaterialType !== undefined ? rmRowData.MaterialType : ''
        }`}</Col>
        <Col md="2">{`Density(g/cm2): ${
          rmRowData.Density !== undefined ? rmRowData.Density : ''
        }`}</Col>
      </Row> */}

      <Row>
        <Col>
          <Nav tabs className="subtabs">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => {
                  toggle('1')
                }}
              >
                Hot Forging
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => {
                  toggle('2')
                }}
              >
                Cold Forging
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === '1' && (
              <TabPane tabId="1">
                <HotForging
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                />
              </TabPane>
            )}
            {activeTab === '2' && (
              <TabPane tabId="2">
                <ColdForging
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                />
              </TabPane>
            )}
          </TabContent>
        </Col>
      </Row>
    </Fragment>
  )
}
export default ForgingCalculator
