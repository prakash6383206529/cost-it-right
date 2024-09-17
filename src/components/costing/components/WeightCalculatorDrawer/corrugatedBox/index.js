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
import CorrugatedBox from './CorrugatedBox'
import MeshCalculation from './MeshCalculation'
import BodySeperate from './BodySeperate'
import Flap from './Flap'
import Plastic from '../Plastic'

function CorrugatedBoxCalculator(props) {
    const { rmRowData, item } = props

    const getTabno = (layout) => {
        switch (layout) {
            case 'Corrugated':
                return '1'
            case 'Mesh':
                return '2'
            case 'BodySeparator':
                return '3'
            case 'Flap':
                return '4'
            case 'Plastic':
                return '5'
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
                                Corrugated Box
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
                                Mesh Calculation
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
                                Body Separator
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
                                Flap
                            </NavLink>
                        </NavItem>
                        {/* <NavItem>  //UNCOMMENT THE CODE ONCE DONE FROM BACKEND
                            <NavLink
                                className={classnames({ active: activeTab === '5' })}
                                onClick={() => {
                                    toggle('5')
                                }}
                                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '5' ? true : false}
                            >
                                EPS Cushion
                            </NavLink>
                        </NavItem> */}
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        {activeTab === '1' && (
                            <TabPane tabId="1">
                                <CorrugatedBox
                                    rmRowData={props.rmRowData}
                                    isEditFlag={props.isEditFlag}
                                    toggleDrawer={props.toggleDrawer}
                                    item={item}
                                    CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                                />
                            </TabPane>
                        )}
                        {activeTab === '2' && (
                            <TabPane tabId="2">
                                <MeshCalculation
                                    rmRowData={props.rmRowData}
                                    isEditFlag={props.isEditFlag}
                                    toggleDrawer={props.toggleDrawer}
                                    item={item}
                                    CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                                />
                            </TabPane>
                        )}
                        {activeTab === '3' && (
                            <TabPane tabId="3">
                                <BodySeperate
                                    rmRowData={props.rmRowData}
                                    isEditFlag={props.isEditFlag}
                                    toggleDrawer={props.toggleDrawer}
                                    item={item}
                                    CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                                />
                            </TabPane>
                        )}
                        {activeTab === '4' && (
                            <TabPane tabId='4'>
                                <Flap
                                    rmRowData={props.rmRowData}
                                    isEditFlag={props.isEditFlag}
                                    toggleDrawer={props.toggleDrawer}
                                    item={item}
                                    CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                                />
                            </TabPane>
                        )}
                        {activeTab === '5' && (
                            <TabPane tabId='5'>
                                <Plastic
                                    rmRowData={props.rmRowData}
                                    isEditFlag={props.isEditFlag}
                                    item={item}
                                    toggleDrawer={props.toggleDrawer}
                                    isSummary={false}
                                    CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                                    DisableMasterBatchCheckbox={true}
                                />
                            </TabPane>
                        )}
                    </TabContent>
                </Col>
            </Row>
        </Fragment>
    )
}
export default CorrugatedBoxCalculator
