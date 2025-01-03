import React, { useState } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { Redirect } from "react-router-dom";
import { checkForDecimalAndNull, getConfigurationKey, showBopLabel } from '../../../helper'
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { APPLICABILITY_BOP_SIMULATION, APPLICABILITY_PART_SIMULATION, APPLICABILITY_RM_SIMULATION } from '../../../config/masterData';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, COMBINED_PROCESS } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import RejectedCostingSummaryTable from '../../costing/components/RejectedCostingSummaryTable';
import { reactLocalStorage } from 'reactjs-localstorage';



function CostingDetailSimulationDrawer(props) {

    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    // table code starts here
    const { simulationDetail, pricesDetail, selectedRowData, costingArr, master, isReport, isSimulation, isReportLoader, isOldCosting, IsExchangeRateSimulation } = props
    const { simulationApplicability } = useSelector(state => state.simulation)

    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [masterID, setMasterID] = useState('')
    const [showExchangeRate, setShowExchangeRate] = useState(false)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    useEffect(() => {
        let masterIDTemp = master
        if (String(master) === EXCHNAGERATE || IsExchangeRateSimulation) {
            if (simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
                masterIDTemp = RMIMPORT
            } else if (simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
                masterIDTemp = BOPIMPORT
            } else if (simulationApplicability?.value === APPLICABILITY_PART_SIMULATION) {
                masterIDTemp = EXCHNAGERATE
            }
            setShowExchangeRate(true)
        } else {
            masterIDTemp = master
        }
        setMasterID(masterIDTemp)
    }, [])

    /**
     * @method closeShowApproval
     * @description FOR CLOSING APPROVAL DRAWER
     */
    const closeShowApproval = (e = '', type) => {
        setIsApprovalDrawer(false)
        if (type === 'submit') {
            setShowApprovalHistory(true)
            // props.resetData()
        }
        else {
            setIsApprovalDrawer(false)
        }
    }

    // table code ends here
    if (showApprovalHistory === true) {

        return <Redirect to='/simulation-history' />
    }

    return (
        <div>
            {<>
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                    BackdropProps={props?.fromCostingSummary && { style: { opacity: 0 } }}>
                    <Container>
                        <div className={"drawer-wrapper drawer-1500px simulation-costing-details-drawers"}>
                            <form noValidate className="form">
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                Costing Details
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>

                                {!isReport &&
                                    <Row className="ml-0 pb-3">
                                        <Col md="12">
                                            <h6 class="left-border d-inline-block mr-4">{pricesDetail?.CostingHead}</h6>
                                            <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Plant Code:</span> <span>{pricesDetail?.PlantCode}</span></div>
                                            <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Costing Id:</span> <span>{pricesDetail?.CostingNumber}</span></div>
                                        </Col>
                                    </Row>
                                }

                                {!isReport &&
                                    <Row className="ml-0 pb-3">
                                        {
                                            Number(masterID) === Number(EXCHNAGERATE) ?
                                                <>
                                                    <Col md="3">
                                                        <label>Existing Net Cost(in Currency)</label>
                                                        <label className={`${pricesDetail?.OldNetPOPriceOtherCurrency > pricesDetail?.NewNetPOPriceOtherCurrency ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldNetPOPriceOtherCurrency, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                    <Col md="3">
                                                        <label>Revised Net Cost(in Currency)</label>
                                                        <label className={`${pricesDetail?.OldNetPOPriceOtherCurrency > pricesDetail?.NewNetPOPriceOtherCurrency ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewNetPOPriceOtherCurrency, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                </> :
                                                <>
                                                    <Col md="3">
                                                        <label>Existing Net Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                        <label className={`${pricesDetail?.OldPOPrice > pricesDetail?.NewPOPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldPOPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col >
                                                    <Col md="3">
                                                        <label>Revised Net Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                        <label className={`${pricesDetail?.OldPOPrice > pricesDetail?.NewPOPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewPOPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                </>
                                        }
                                        {
                                            (Number(masterID) === Number(RMDOMESTIC) || Number(masterID) === Number(RMIMPORT)) &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing RM Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldRMPrice > pricesDetail?.NewRMPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldRMPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised RM Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldRMPrice > pricesDetail?.NewRMPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewRMPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {/* {  Number(master) === Number(EXCHNAGERATE) &&              //RE
                                            <>
                                                        <Col md="3">
                                                            <label>Existing Exchange Rate</label>
                                                            <label className={`${pricesDetail?.OldExchangeRate > pricesDetail?.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                        </Col>
                                                        <Col md="3">
                                                            <label>Revised Exchange Rate</label>
                                                            <label className={`${pricesDetail?.OldExchangeRate > pricesDetail?.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                        </Col>
                                                    </>
                                        } */}
                                        {
                                            Number(masterID) === Number(SURFACETREATMENT) &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing Surface Treatment ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldNetSurfaceTreatmentCost > pricesDetail?.NewNetSurfaceTreatmentCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldNetSurfaceTreatmentCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised Surface Treatment ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldNetSurfaceTreatmentCost > pricesDetail?.NewNetSurfaceTreatmentCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewNetSurfaceTreatmentCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            Number(masterID) === Number(OPERATIONS) &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing Operation Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldOperationCost > pricesDetail?.NewOperationCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldOperationCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised Operation Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldOperationCost > pricesDetail?.NewOperationCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewOperationCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {Number(master) === Number(COMBINED_PROCESS) &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing CC</label>
                                                    <label className={`${pricesDetail.OldNetCC > pricesDetail.NewNetCC ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldNetCC, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised CC</label>
                                                    <label className={`${pricesDetail.OldNetCC > pricesDetail.NewNetCC ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewNetCC, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }

                                        {
                                            (Number(masterID) === Number(BOPDOMESTIC) || Number(masterID) === Number(BOPIMPORT)) &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing {showBopLabel()} Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldBOPCost > pricesDetail?.NewBOPCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldBOPCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised {showBopLabel()} Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldBOPCost > pricesDetail?.NewBOPCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewBOPCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            (Number(masterID) === Number(MACHINERATE)) &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing Machine Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldNetProcessCost > pricesDetail?.NewNetProcessCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldNetProcessCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised Machine Cost ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldNetProcessCost > pricesDetail?.NewNetProcessCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewNetProcessCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            showExchangeRate &&
                                            <>
                                                <Col md="3">
                                                    <label>Existing Exchange Rate ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldExchangeRate > pricesDetail?.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.OldExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>Revised Exchange Rate ({reactLocalStorage.getObject("baseCurrency")})</label>
                                                    <label className={`${pricesDetail?.OldExchangeRate > pricesDetail?.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail?.NewExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                    </Row >
                                }
                                {isReportLoader && <LoaderCustom customClass={"report-costing"} />}
                                <CostingSummaryTable customClass="ml-0"
                                    viewMode={true}
                                    id={pricesDetail?.CostingNumber}
                                    simulationMode={true}
                                    isApproval={isReport ? false : true}
                                    costingIdExist={true}
                                    selectedTechnology={props?.selectedTechnology}
                                    simulationId={simulationDetail?.SimulationId}
                                    simulationDrawer={props?.simulationDrawer}
                                    master={masterID}
                                    isSimulationDone={isSimulation}
                                    drawerViewMode={true}
                                    isImpactDrawer={props?.isImpactDrawer}
                                    fromCostingSummary={props?.fromCostingSummary}
                                    isRfqCosting={props?.isRfqCosting}
                                    isRejectedSummaryTable={props?.isRejectedSummaryTable} isFromAssemblyTechnology={props?.isFromAssemblyTechnology}
                                />
                            </form>
                        </div>
                    </Container>
                </Drawer>
            </>}

            {
                isApprovalDrawer &&
                <ApproveRejectDrawer
                    isOpen={isApprovalDrawer}
                    anchor={'right'}
                    approvalData={[]}
                    type={'Sender'}
                    simulationDetail={simulationDetail}
                    selectedRowData={selectedRowData}
                    costingArr={costingArr}
                    master={masterID}
                    closeDrawer={closeShowApproval}
                    isSimulation={true}
                />
            }
        </div >
    );
}

export default CostingDetailSimulationDrawer;
