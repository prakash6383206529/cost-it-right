import classnames from 'classnames'
import React, { useState } from "react"
import { Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap"
import Lamination from "./Lamination"
import PaperCorrugatedBox from './PaperCorrugatedBox'

const MonoCartoon = (props) => {
    const { rmRowData, rmData, item, calculatorType, CostingViewMode } = props
    const [activeTab, setActiveTab] = useState(calculatorType === 'CorrugatedAndMonoCartonBox' ? '1' : '2')
    const toggle = (tab) => {
        setActiveTab(tab)
    }
    return (
        <Row>
            <Col>
                <Nav tabs className="subtabs cr-subtabs-head forging-tabs  nav nav-tabs">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === '1' })}
                            onClick={() => {
                                toggle('1')
                            }}
                            disabled={activeTab === '2' && CostingViewMode ? true : false}
                        >
                            Mono Cartoon
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === '2' })}
                            onClick={() => {
                                toggle('2')
                            }}
                            disabled={activeTab === '1' && CostingViewMode ? true : false}
                        >
                            Lamination
                        </NavLink>
                    </NavItem>

                </Nav>
                <TabContent activeTab={activeTab}>
                    {activeTab === '1' && (
                        <TabPane tabId="1">
                            <PaperCorrugatedBox
                                rmRowData={props.rmRowData}
                                isEditFlag={props.isEditFlag}
                                toggleDrawer={props.toggleDrawer}
                                item={item}
                                rmData={rmData}
                                CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                            />
                        </TabPane>
                    )}
                    {activeTab === '2' && (
                        <TabPane tabId="2">
                            <Lamination
                                rmData={rmData}
                                rmRowData={props.rmRowData}
                                item={item}
                                toggleDrawer={props.toggleDrawer}
                                CostingViewMode={props.CostingViewMode}
                                getRatePerKg={() => { }}
                            />
                        </TabPane>
                    )}

                </TabContent>
            </Col>
        </Row>
    )
}

export default MonoCartoon