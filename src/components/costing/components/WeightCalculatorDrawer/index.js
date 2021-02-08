import React, { useState } from 'react'
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
import Pipe from './Pipe'
import Plate from './Plate'
import Bracket from './Bracket'
import SectionL from './SectionL'
import SectionC from './SectionC'
import SectionZ from './SectionZ'

function WeightCalculator(props) {
  const { rmRowData, isEditFlag } = props
  const [activeTab, setActiveTab] = useState('1')

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
    props.closeDrawer('', weightData)
  }

  const dispatch = useDispatch()

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <div>
      <Drawer
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

            <Row>
              <Col md="2">{`RM Name: ${
                rmRowData.RMName !== undefined ? rmRowData.RMName : ''
              }`}</Col>
              <Col md="2">{`Material: ${
                rmRowData.MaterialType !== undefined
                  ? rmRowData.MaterialType
                  : ''
              }`}</Col>
              <Col md="2">{`Density(g/cm2) ${
                rmRowData.Density !== undefined ? rmRowData.Density : ''
              }`}</Col>
            </Row>

            <Row>
              <Col>
              {/* Conditional rendering based on edit and view mode */}
                {!isEditFlag ? (
                  <Nav tabs className="subtabs">
                    {rmRowData.WeightCalculatorRequest.LayoutingType ===
                      'PIPE' && (
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
                    )}

                    {rmRowData.WeightCalculatorRequest.LayoutingType ===
                      'BRACKET' && (
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
                    )}

                    {rmRowData.WeightCalculatorRequest.LayoutingType ===
                      'PLATE' && (
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
                    )}
                    {rmRowData.WeightCalculatorRequest.LayoutingType ===
                      'L SECTION' && (
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
                    )}
                    {rmRowData.WeightCalculatorRequest.LayoutingType ===
                      'C SECTION' && (
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
                    )}
                    {rmRowData.WeightCalculatorRequest.LayoutingType ===
                      'Z SECTION' && (
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
                    )}
                  </Nav>
                ) : (
                  <Nav tabs className="subtabs">
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
                )}

                <TabContent activeTab={activeTab}>
                  {activeTab === '1' && (
                    <TabPane tabId="1">
                      <Pipe
                        rmRowData={props.rmRowData}
                        toggleDrawer={toggleDrawer}
                        isEditFlag={isEditFlag}
                      />
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
          </div>
        </Container>
      </Drawer>
    </div>
  )
}

export default WeightCalculator
