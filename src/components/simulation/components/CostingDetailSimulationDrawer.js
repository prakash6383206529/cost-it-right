import React, { Component, useState } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux'
import { Redirect } from "react-router-dom";
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper'
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, OPERATIONS, RAW_MATERIAL, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants';



function CostingDetailSimulationDrawer(props) {


    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    // table code starts here
    const { simulationDetail, pricesDetail, selectedRowData, costingArr, master, isReport } = props

    const dispatch = useDispatch()

    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
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

    const sendForApprovalData = () => {
        setIsApprovalDrawer(true)
    }


    const cancel = (e = '') => {
        toggleDrawer(e)
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
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper drawer-1500px simulation-costing-details-drawers"}>
                            <form noValidate className="form">
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {" Old Costing Details"}
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
                                            <h6 class="left-border d-inline-block mr-4">{pricesDetail.CostingHead}</h6>
                                            <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Plant Code:</span> <span>{pricesDetail.PlantCode}</span></div>
                                            <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Costing ID:</span> <span>{pricesDetail.CostingNumber}</span></div>
                                        </Col>
                                    </Row>
                                }

                                {!isReport &&
                                    <Row className="ml-0 pb-3">
                                        {
                                            Number(master) === Number(EXCHNAGERATE) ?
                                                <>
                                                    <Col md="3">
                                                        <label>Old PO Price(in Currency)</label>
                                                        <label className={`${pricesDetail.OldNetPOPriceOtherCurrency > pricesDetail.NewNetPOPriceOtherCurrency ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldNetPOPriceOtherCurrency, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                    <Col md="3">
                                                        <label>New PO Price(in Currency)</label>
                                                        <label className={`${pricesDetail.OldNetPOPriceOtherCurrency > pricesDetail.NewNetPOPriceOtherCurrency ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewNetPOPriceOtherCurrency, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                </> :
                                                <>
                                                    <Col md="3">
                                                        <label>Old PO Price</label>
                                                        <label className={`${pricesDetail.OldPOPrice > pricesDetail.NewPOPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldPOPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                    <Col md="3">
                                                        <label>New PO Price</label>
                                                        <label className={`${pricesDetail.OldPOPrice > pricesDetail.NewPOPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewPOPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                    </Col>
                                                </>
                                        }
                                        {
                                            (Number(master) === Number(RMDOMESTIC) || Number(master) === Number(RMIMPORT)) &&
                                            <>
                                                <Col md="3">
                                                    <label>Old RM Cost</label>
                                                    <label className={`${pricesDetail.OldRMPrice > pricesDetail.NewRMPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldRMPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>New RM Cost</label>
                                                    <label className={`${pricesDetail.OldRMPrice > pricesDetail.NewRMPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewRMPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            Number(master) === Number(EXCHNAGERATE) &&
                                            <>
                                                <Col md="3">
                                                    <label>Old Exchange Rate</label>
                                                    <label className={`${pricesDetail.OldExchangeRate > pricesDetail.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>New Exchange Rate</label>
                                                    <label className={`${pricesDetail.OldExchangeRate > pricesDetail.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            Number(master) === Number(SURFACETREATMENT) &&
                                            <>
                                                <Col md="3">
                                                    <label>Old Surface Treatment</label>
                                                    <label className={`${pricesDetail.OldNetSurfaceTreatmentCost > pricesDetail.NewNetSurfaceTreatmentCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldNetSurfaceTreatmentCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>New Surface Treatment</label>
                                                    <label className={`${pricesDetail.OldNetSurfaceTreatmentCost > pricesDetail.NewNetSurfaceTreatmentCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewNetSurfaceTreatmentCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            Number(master) === Number(OPERATIONS) &&
                                            <>
                                                <Col md="3">
                                                    <label>Old Operation Cost</label>
                                                    <label className={`${pricesDetail.OldOperationCost > pricesDetail.NewOperationCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldOperationCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>New Operation Cost</label>
                                                    <label className={`${pricesDetail.OldOperationCost > pricesDetail.NewOperationCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewOperationCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                        {
                                            (Number(master) === Number(BOPDOMESTIC) || Number(master) === Number(BOPIMPORT)) &&
                                            <>
                                                <Col md="3">
                                                    <label>Old BOP Cost</label>
                                                    <label className={`${pricesDetail.OldBOPCost > pricesDetail.NewBOPCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldBOPCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>New BOP Cost</label>
                                                    <label className={`${pricesDetail.OldBOPCost > pricesDetail.NewBOPCost ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewBOPCost, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                        }
                                    </Row>
                                }
                                <CostingSummaryTable customClass="ml-0" simulationDrawer={true} simulationMode={true} viewMode={true} master={master} />
                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 px-3">
                                    <div className="text-right px-3">

                                        <button type={"button"} className="cancel-btn" onClick={cancel}>
                                            <div className={"cancel-icon"}></div>{" "}
                                            {"CANCEL"}
                                        </button>
                                    </div>
                                </div>
                            </Row>
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
                    master={master}
                    closeDrawer={closeShowApproval}
                    isSimulation={true}
                />
            }
        </div>
    );
}

export default CostingDetailSimulationDrawer;