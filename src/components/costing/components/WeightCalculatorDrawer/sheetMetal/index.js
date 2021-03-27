import React, { Fragment, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Container, } from 'reactstrap'
import { getRawMaterialCalculationByTechnology, saveRawMaterialCalciData } from '../../../actions/CostWorking'
import classnames from 'classnames'
import Drawer from '@material-ui/core/Drawer'
import Pipe from './Pipe'
import Plate from './Plate'
import Bracket from './Bracket'
import SectionL from './SectionL'
import SectionC from './SectionC'
import SectionZ from './SectionZ'
import { toastr } from 'react-redux-toastr'

function WeightCalculator(props) {

  const dispatch = useDispatch()
  const { rmRowData } = props
  console.log(rmRowData, "RM");
  const getTabno = (layout) => {
    switch (layout) {
      case 'Pipe':
        return '1'
      case 'Braket':
        return '2'
      default:
        break;
    }
  }

  const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')
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
  const toggleDrawer = (event, weightData = {}) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }

    props.toggleDrawer('', weightData)
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
              >
                Bracket
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '3' })}
                onClick={() => {
                  toggle('3')
                }}
              >
                Plate
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '4' })}
                onClick={() => {
                  toggle('4')
                }}
              >
                L Section
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '5' })}
                onClick={() => {
                  toggle('5')
                }}
              >
                C Section
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === '6' })}
                onClick={() => {
                  toggle('6')
                }}
              >
                Z Section
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            {activeTab === '1' && (
              <TabPane tabId="1">
                <Pipe rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} />
              </TabPane>
            )}
            {activeTab === '2' && (
              <TabPane tabId="2">
                <Bracket />
              </TabPane>
            )}
            {activeTab === '3' && (
              <TabPane tabId="3">
                <Plate />
              </TabPane>
            )}
            {activeTab === '4' && (
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
            )}
          </TabContent>
        </Col>
      </Row>
    </Fragment>
  )
}

export default WeightCalculator
