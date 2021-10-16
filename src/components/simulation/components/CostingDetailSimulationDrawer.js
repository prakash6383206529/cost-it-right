import React, { Component, useState } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux'
import { Redirect } from "react-router-dom";
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper'
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import { EXCHNAGERATE, RAW_MATERIAL, RMDOMESTIC } from '../../../config/constants';



function CostingDetailSimulationDrawer(props) {


    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    // table code starts here
    const { simulationDetail, pricesDetail, selectedRowData, costingArr, master } = props

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
                                <Row className="ml-0 pb-2">
                                    <Col md="12">
                                        <h6 class="left-border d-inline-block mr-4">{pricesDetail.CostingHead}</h6>
                                        <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Plant Code:</span> <span>{pricesDetail.PlantCode}</span></div>
                                        <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Costing ID:</span> <span>{pricesDetail.CostingNumber}</span></div>
                                    </Col>
                                </Row>

                                <Row className="ml-0 pb-3">
                                    {
                                        Number(master) === Number(EXCHNAGERATE) ?
                                            <>
                                                <Col md="3">
                                                    <label>PO Price Old(in Currency)</label>
                                                    <label className={`${pricesDetail.OldNetPOPriceOtherCurrency > pricesDetail.NewNetPOPriceOtherCurrency ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldNetPOPriceOtherCurrency, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>PO Price New(in Currency)</label>
                                                    <label className={`${pricesDetail.OldNetPOPriceOtherCurrency > pricesDetail.NewNetPOPriceOtherCurrency ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewNetPOPriceOtherCurrency, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </> :
                                            <>
                                                <Col md="3">
                                                    <label>PO Price Old</label>
                                                    <label className={`${pricesDetail.OldPOPrice > pricesDetail.NewPOPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldPOPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                                <Col md="3">
                                                    <label>PO Price New</label>
                                                    <label className={`${pricesDetail.OldPOPrice > pricesDetail.NewPOPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewPOPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                                </Col>
                                            </>
                                    }
                                    {
                                        Number(master) === Number(RMDOMESTIC) &&
                                        <>
                                            <Col md="3">
                                                <label>RM Cost Old</label>
                                                <label className={`${pricesDetail.OldRMPrice > pricesDetail.NewRMPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldRMPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                            </Col>
                                            <Col md="3">
                                                <label>RM Cost New</label>
                                                <label className={`${pricesDetail.OldRMPrice > pricesDetail.NewRMPrice ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewRMPrice, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                            </Col>
                                        </>
                                    }
                                    {
                                        Number(master) === Number(EXCHNAGERATE) &&
                                        <>
                                            <Col md="3">
                                                <label>Exchange Rate Old</label>
                                                <label className={`${pricesDetail.OldExchangeRate > pricesDetail.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.OldExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                            </Col>
                                            <Col md="3">
                                                <label>Exchange Rate New</label>
                                                <label className={`${pricesDetail.OldExchangeRate > pricesDetail.NewExchangeRate ? 'form-control input-form-control green-value' : 'form-control input-form-control red-value'}`}>{checkForDecimalAndNull(pricesDetail.NewExchangeRate, getConfigurationKey().NoOfDecimalForPrice)}</label>
                                            </Col>
                                        </>
                                    }
                                </Row>

                                <CostingSummaryTable customClass="ml-0" simulationMode={true} viewMode={true} simulationDrawer={true} />

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