import React, { Component, useEffect, useState } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
// import { runSimulation } from '../actions/Simulation'
import { useDispatch, useSelector } from 'react-redux'
import {
    setCostingViewData, setCostingApprovalData, createZBCCosting, createVBCCosting, getZBCCostingByCostingId,
    storePartNumber, getSingleCostingDetails
} from '../../costing/actions/Costing'
import { useHistory } from "react-router-dom";
import ViewBOP from '../../../components/costing/components/Drawers/ViewBOP'
import ViewConversionCost from '../../../components/costing/components/Drawers/ViewConversionCost'
import ViewRM from '../../../components/costing/components/Drawers/ViewRM'
import ViewOverheadProfit from '../../../components/costing/components/Drawers/ViewOverheadProfit'
import ViewPackagingAndFreight from '../../../components/costing/components/Drawers/ViewPackagingAndFreight'
import ViewToolCost from '../../../components/costing/components/Drawers/viewToolCost'
import { checkForDecimalAndNull, formViewData, loggedInUserId, userDetails } from '../../../helper'
import Attachament from '../../../components/costing/components/Drawers/Attachament'
import { DRAFT, FILE_URL, REJECTED, VBC, ZBC } from '../../../config/constants'
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer';
import { getComparisionSimulationData } from '../actions/Simulation';



function CostingDetailSimulationDrawer(props) {


    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    // table code starts here
    const { viewMode, showDetail, technologyId, costingID, showWarningMsg, pricesDetail } = props
    let history = useHistory();

    const dispatch = useDispatch()
    const [addComparisonToggle, setaddComparisonToggle] = useState(false)
    const [isEditFlag, setIsEditFlag] = useState(false)
    const [editObject, setEditObject] = useState({})




    const [multipleCostings, setMultipleCostings] = useState([])
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)

    const [flag, setFlag] = useState(false)
    const [isAttachment, setAttachment] = useState(false)


    const [index, setIndex] = useState('')

    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)

    const viewApprovalData = useSelector((state) => state.costing.costingApprovalData)
    const partInfo = useSelector((state) => state.costing.partInfo)
    const partNumber = useSelector(state => state.costing.partNo);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

    // const [showWarningMsg, setShowWarningMsg] = useState(false)
    useEffect(() => {

    }, [multipleCostings])




    /**
     * @method closeShowApproval
     * @description FOR CLOSING APPROVAL DRAWER
     */
    const closeShowApproval = (e = '', type) => {
        setIsApprovalDrawer(false)

        // setMultipleCostings([])

        if (type === 'Submit') {
            // dispatch(storePartNumber(''))
            props.resetData()
        }
    }







    const sendForApprovalData = (costingIds) => {

        let temp = viewApprovalData
        // costingIds &&
        //     costingIds.map((id) => {
        //         let index = viewCostingData.findIndex((data) => data.costingId == id)
        //         if (index !== -1) {
        //             let obj = {}
        //             // add vendor key here
        //             obj.typeOfCosting = viewCostingData[index].zbc
        //             obj.plantCode = viewCostingData[index].plantCode
        //             obj.plantName = viewCostingData[index].plantName
        //             obj.plantId = viewCostingData[index].plantId
        //             obj.vendorId = viewCostingData[index].vendorId
        //             obj.vendorName = viewCostingData[index].vendorName
        //             obj.vendorCode = viewCostingData[index].vendorCode
        //             obj.vendorPlantId = viewCostingData[index].vendorPlantId
        //             obj.vendorPlantName = viewCostingData[index].vendorPlantName
        //             obj.vendorPlantCode = viewCostingData[index].vendorPlantCode
        //             obj.costingName = viewCostingData[index].CostingNumber
        //             obj.costingId = viewCostingData[index].costingId
        //             obj.oldPrice = viewCostingData[index].oldPoPrice
        //             obj.revisedPrice = viewCostingData[index].poPrice
        //             obj.variance = Number(viewCostingData[index].poPrice && viewCostingData[index].poPrice !== '-' ? viewCostingData[index].poPrice : 0) - Number(viewCostingData[index].oldPoPrice && viewCostingData[index].oldPoPrice !== '-' ? viewCostingData[index].oldPoPrice : 0)
        //             obj.consumptionQty = ''
        //             obj.remainingQty = ''
        //             obj.annualImpact = ''
        //             obj.yearImpact = ''
        //             obj.reason = ''
        //             obj.ecnNo = ''
        //             obj.effectiveDate = viewCostingData[index].effectiveDate
        //             obj.partNo = viewCostingData[index].partId
        //             temp.push(obj)
        //         }
        //         dispatch(setCostingApprovalData(temp))
        //     })
        setIsApprovalDrawer(true)
    }



    useEffect(() => {
        // if (viewCostingData !== undefined && viewCostingData.length === 0) {
        //   setShowWarningMsg(true)
        // } else {
        //   setShowWarningMsg(false)
        // }
    }, [viewCostingData])

    useEffect(() => {
        if (costingID && Object.keys(costingID).length > 0) {
            dispatch(getComparisionSimulationData(costingID, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data
                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                }
            },
            ))
        }
    }, [costingID])
    // table code ends here

    return (
        <div>
            {<>
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper drawer-md simulation-costing-details-drawers"}>
                            <form noValidate className="form">
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {"Costing Details"}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>
                                <Row className="ml-0 pb-3">
                                    <Col md="12">
                                        <h6 class="left-border d-inline-block mr-4">ZBC</h6>
                                        <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Plant Code:</span> <span>{pricesDetail.PlantCode}</span></div>
                                        <div class=" d-inline-block mr-4"><span class="grey-textpr-2">Costing ID:</span> <span>{pricesDetail.CostingId}</span></div>
                                    </Col>
                                </Row>

                                <Row className="ml-0 pb-3">
                                    <Col md="3">
                                        <label>PO Price Old</label>
                                        <label className="form-control input-form-control green-value">{pricesDetail.OldPOPrice}</label>
                                    </Col>
                                    <Col md="3">
                                        <label>PO Price New</label>
                                        <label className="form-control input-form-control green-value">{pricesDetail.NewPOPrice}</label>
                                    </Col>
                                    <Col md="3">
                                        <label>RM Cost Old</label>
                                        <label className="form-control input-form-control red-value">{pricesDetail.OldRMPrice}</label>
                                    </Col>
                                    <Col md="3">
                                        <label>RM Cost New</label>
                                        <label className="form-control input-form-control red-value">{pricesDetail.NewRMPrice}</label>
                                    </Col>
                                </Row>

                                <Row className="ml-0 pb-3">
                                    <Col md="12">
                                        <CostingSummaryTable simulationMode={true} viewMode={true} />
                                    </Col>
                                </Row>

                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 px-3">
                                    <div className="text-right px-3">
                                        <button class="user-btn approval-btn mr5 float-none" onClick={sendForApprovalData}>
                                            <img class="mr-1" src={require('../../../assests/images/send-for-approval.svg')}></img>{' '}
                                            {'Send For Approval'}
                                        </button>
                                        <button type="submit" className="user-btn float-none">
                                            <div className={"check-icon"}>
                                                <img
                                                    src={require("../../../assests/images/check.png")}
                                                    alt="check-icon.jpg"
                                                />
                                            </div>{" "}
                                            {"Save Simulation"}
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
                    type={'Approve'}
                    closeDrawer={closeShowApproval}
                    isSimulation={true}
                />
            }
        </div>
    );
}

export default CostingDetailSimulationDrawer;