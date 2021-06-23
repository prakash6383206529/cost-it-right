import React, { Fragment, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap'
import classnames from 'classnames'
import Rubber from './Rubber'
import StandardRub from './StandardRub'


function RubberCalciTab(props) {

    const dispatch = useDispatch()
    const { rmRowData } = props


    const getTabno = (layout) => {
        switch (layout) {
            case 'Standard':
                return '1'
            case 'Coil':
                return '2'
            default:
                break;
        }
    }

    //   const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.WeightCalculationId === null ? '1' : rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')
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
                            // disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
                            >
                                Standard
              </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '2' })}
                                onClick={() => {
                                    toggle('2')
                                }}
                                disabled={true}
                            // disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '2' ? true : false}
                            >
                                Hose
              </NavLink>
                        </NavItem>


                    </Nav>
                    <TabContent activeTab={activeTab}>
                        {activeTab === '1' && (
                            <TabPane tabId="1">
                                <StandardRub rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} />
                            </TabPane>
                        )}
                        {activeTab === '2' && (
                            <TabPane tabId="2">
                                <Rubber rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} />
                            </TabPane>
                        )}

                    </TabContent>
                </Col>
            </Row>
        </Fragment>
    )
}

export default RubberCalciTab
