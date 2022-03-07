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
import NonFerrous from './NonFerrous'


function NonFerrousCalculator(props) {
  const { rmRowData } = props
  
  const getTabno = (layout) => {
    switch (layout) {
      case 'GDC':
        return '1'
      case 'LPDC':
        return '2'
      case 'HPDC':
        return '3'
      default:
        break;
    }
    console.log(layout,'layout');
  }
  const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.WeightCalculationId === null ? '1' : rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')
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

      <Row>
        <Col>
          <Nav tabs className="subtabs cr-subtabs-head forging-tabs  nav nav-tabs">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => {
                  toggle('1')
                }}
                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
              >
                GDC
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '2' })}
                onClick={() => {
                  toggle('2')
                }}
                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '2' ? true : false}
              >
                 LPDC
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => {
                  toggle('3')
                }}
                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '3' ? true : false}

              >
                 HPDC
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === '1' && (
              <TabPane tabId="1">
                <NonFerrous
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                  activeTab={activeTab}
                  isHpdc={false}
                  isEditFlag={props.isEditFlag}
                />
              </TabPane>
            )}
             {activeTab === '2' && (
              <TabPane tabId="2">
                <NonFerrous
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                  activeTab={activeTab}
                  isHpdc={false}
                  isEditFlag={props.isEditFlag}
                />
              </TabPane>
            )}
            {activeTab === '3' && (
              <TabPane tabId="3">
                <NonFerrous
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                  activeTab={activeTab}
                  isHpdc={true}
                  isEditFlag={props.isEditFlag}
                />
              </TabPane>
            )}
          </TabContent>
        </Col>
      </Row>
    </Fragment>
  )
}
export default NonFerrousCalculator
