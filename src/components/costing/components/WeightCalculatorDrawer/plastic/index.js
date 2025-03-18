import React, { Fragment, useState } from 'react'
import {
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap'
import classnames from 'classnames'
import Plastic from './Plastic'




function PlasticCalculator(props) {
  const { rmRowData, item } = props

  const getTabno = (layout) => {
    switch (layout) {
      case 'Injection Molding':
        return '1'
      case 'Blow Molding':
        return '2'
      default:
        break;
    }
  }
  const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.WeightCalculationId === null ? '1' : rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')

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
                Injection Molding
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
                Blow Molding
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === '1' && (
              <TabPane tabId="1">
                <Plastic
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                  activeTab={activeTab}
                  isInjectionMolding={true}
                  item={item}
                  isEditFlag={props.isEditFlag}
                  DisableMasterBatchCheckbox={props.DisableMasterBatchCheckbox}
                />
              </TabPane>
            )}
            {activeTab === '2' && (
              <TabPane tabId="2">
                <Plastic
                  rmRowData={props.rmRowData}
                  toggleDrawer={props.toggleDrawer}
                  CostingViewMode={props.CostingViewMode}
                  activeTab={activeTab}
                  isInjectionMolding={false}
                  item={item}
                  isEditFlag={props.isEditFlag}
                  DisableMasterBatchCheckbox={props.DisableMasterBatchCheckbox}
                />
              </TabPane>
            )}
          </TabContent>
        </Col>
      </Row>
    </Fragment>
  )
}
export default PlasticCalculator
