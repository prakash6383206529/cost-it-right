import React, { Fragment, useState } from 'react'
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap'
import classnames from 'classnames'
import Pipe from './Pipe'
import SectionL from './SectionL'
import SectionC from './SectionC'
import SectionZ from './SectionZ'
import Coil from './Coil'
import Sheet from './Sheet'
import SheetDetails from './SheetDetails'
import Bar from './Bar'

function WeightCalculator(props) {

  // const dispatch = useDispatch()
  const { rmRowData } = props


  const getTabno = (layout) => {
    switch (layout) {
      case 'Pipe':
        return '1'
      case 'Coil':
        return '2'
      case 'SheetDetailed':
        return '3'
      case 'Bar':
        return '4'
      case 'Sheet':
        return '5'
      default:
        break;
    }
  }

  const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.WeightCalculationId === null ? '1' : rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')
  // const [activeTab, setActiveTab] = useState('1')
  /**
   * @method toggle
   * @description toggling the tabs
   */
  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab)
    }
  }

  /**
   * @method toggleDrawer
   * @description TOGGLE DRAWER
   */
  const toggleDrawer = (event, weightData = {}, originalWeight = {}) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }

    props.toggleDrawer('', weightData, originalWeight)
  }


  /**
   * @method render
   * @description Renders the component
   */
  return (
    <Fragment>
      <Row>
        <Col>
          <Nav tabs className="subtabs cr-subtabs-head ">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '1' })}
                onClick={() => {
                  toggle('1')
                }}
                //  disabled={rmRowData.WeightCalculatorRequest.LayoutType && rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
              >
                Pipe
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
                Coil
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
                Sheet (Detailed)
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '5' })}
                onClick={() => {
                  toggle('5')
                }}
                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '5' ? true : false}
              >
                Sheet
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '4' })}
                onClick={() => {
                  toggle('4')
                }}
                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '4' ? true : false}
              >
                Bar
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === '1' && (
              <TabPane tabId="1">
                <Pipe rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} CostingViewMode={props.CostingViewMode} />
              </TabPane>
            )}
            {activeTab === '2' && (
              <TabPane tabId="2">
                <Coil rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} CostingViewMode={props.CostingViewMode} />
              </TabPane>
            )}
            {/* THIS IS FOR SHEET  */}
            {activeTab === '3' && (
              <TabPane tabId="3">
                <SheetDetails rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} CostingViewMode={props.CostingViewMode} />
              </TabPane>
            )}
            {activeTab === '4' && (
              <TabPane tabId="4">
                <Bar rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} CostingViewMode={props.CostingViewMode} />
              </TabPane>
            )}
            {activeTab === '5' && (
              <TabPane tabId="5">
                <Sheet rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} CostingViewMode={props.CostingViewMode} />
              </TabPane>
            )}
            {/* {activeTab === '4' && (
              <TabPane tabId="4">
                <SectionL />
              </TabPane>
            )}
            {activeTab === '5' && (
              <TabPane tabId="5">
                <SectionC />
              </TabPane>
            )}
            {activeTab === '6' && (
              <TabPane tabId="6">
                <SectionZ />
              </TabPane>
            )} */}
          </TabContent>
        </Col>
      </Row>
    </Fragment>
  )
}

export default WeightCalculator
