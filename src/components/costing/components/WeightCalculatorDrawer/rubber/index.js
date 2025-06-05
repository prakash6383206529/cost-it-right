import React, { Fragment, useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap'
import classnames from 'classnames'
import Rubber from './Rubber'
import StandardRub from './StandardRub'
import RubberWeightCalculator from './RubberWeightCalculator'
import { parseConfigurationString } from '../../../../../helper/validation'
import { useTranslation } from 'react-i18next'

function RubberCalciTab(props) {
    const configData = parseConfigurationString()
    const { t } = useTranslation('CostingLabels');
    //   const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.WeightCalculationId === null ? '1' : rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')
    // const [activeTab, setActiveTab] = useState('1')
    const [activeTab, setActiveTab] = useState(props?.calculatorType === 'Standard' ? '2' : '1')
    useEffect(() => {
        if (configData && !configData?.RubberCompound && configData?.isDataFromWebConfig) {
            setActiveTab('2');
        }
    }, [configData])
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

        props.toggleDrawer(event, weightData, originalWeight)
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
                        {configData && configData?.RubberCompound && (
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === '1' })}
                                    onClick={() => {
                                        toggle('1')
                                    }}
                                    disabled={props.rmRowData && Object.keys(props.rmRowData?.WeightCalculatorRequest).length === 0 ? false : props.rmRowData && props.rmRowData?.CalculatorType === "Standard" ? true : false}
                                // disabled={props.rmRowData && props.rmRowData?.CalculatorType === "Standard"}
                                //  disabled={rmRowData.WeightCalculatorRequest.LayoutType && rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
                                // disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
                                >
                                    Rubber Compound
                                </NavLink>
                            </NavItem>
                        )}
                        {configData && configData?.Standard && (
                            <NavItem>
                                <NavLink
                                    className={classnames({ active: activeTab === '2' })}
                                    onClick={() => {
                                        toggle('2')
                                    }}
                                    disabled={props.rmRowData && Object.keys(props.rmRowData?.WeightCalculatorRequest).length === 0 ? false : props.rmRowData && props.rmRowData?.CalculatorType === "Compound" ? true : false}
                                // disabled={props.rmRowData && props.rmRowData?.CalculatorType === "Compound"}
                                // disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '2' ? true : false}
                                >
                                    {t('Standard', { defaultValue: 'Standard' })}
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        {activeTab === '1' && (
                            <TabPane tabId="1">
                                <RubberWeightCalculator rmRowData={props.rmRowData}
                                    inputDiameter={props.inputDiameter}
                                    isEditFlag={props.isEditFlag}
                                    toggleDrawer={toggleDrawer}
                                    rmData={props.rmData}
                                    item={props.item}
                                    appyMasterBatch={props.appyMasterBatch}
                                    CostingViewMode={props.CostingViewMode} />
                            </TabPane>
                        )}
                        {activeTab === '2' && (
                            <TabPane tabId="2">
                                <StandardRub rmRowData={props.rmRowData}
                                    inputDiameter={props.inputDiameter}
                                    isEditFlag={props.isEditFlag}
                                    toggleDrawer={toggleDrawer}
                                    rmData={props.rmData}
                                    item={props.item}
                                    appyMasterBatch={props.appyMasterBatch}
                                    CostingViewMode={props.CostingViewMode} />
                                {/* <Rubber rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} /> */}
                            </TabPane>
                        )}

                    </TabContent>
                </Col>
            </Row>
        </Fragment>
    )
}

export default RubberCalciTab
