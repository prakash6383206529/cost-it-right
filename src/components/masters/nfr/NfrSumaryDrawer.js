import { Drawer } from "@material-ui/core";
import React, { useEffect } from "react";
import { Col, Row, Table } from "reactstrap";
import LoaderCustom from "../../common/LoaderCustom";
import { useState } from "react";
import ApprovalWorkFlow from "../../costing/components/approval/ApprovalWorkFlow";
import { Fragment } from "react";
import ApprovalDrawer from "./ApprovalDrawer";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA, NFRTypeId } from "../../../config/constants";
import { useDispatch } from "react-redux";
import { getNFRApprovalSummary } from "./actions/nfr";
import { formViewData, loggedInUserId, userDetails, userTechnologyLevelDetails } from "../../../helper";
import { costingTypeIdToApprovalTypeIdFunction } from "../../common/CommonFunctions";
import { checkFinalUser, getSingleCostingDetails, setCostingViewData } from "../../costing/actions/Costing";
import { getUsersTechnologyLevelAPI } from "../../../actions/auth/AuthActions";
import CostingDetailSimulationDrawer from "../../simulation/components/CostingDetailSimulationDrawer";


function NfrSummaryDrawer(props) {
    const { rowData } = props
    const [loader, setLoader] = useState(true)
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [tableData, setTableData] = useState([])
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [nfrData, setNFRData] = useState({})
    const [finalLevelUser, setFinalLevelUser] = useState(true)
    const [levelDetails, setLevelDetails] = useState({})
    const [sendForApprovalButtonShow, setSendForApprovalButtonShow] = useState(true)
    const [isFinalLevelUser, setIsFinalLevelUser] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isCostingDrawerLoader, setIsCostingDrawerLoader] = useState(false)
    const [viewCostingData, setViewCostingData] = useState({})
    const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getNFRApprovalSummary(rowData?.NfrGroupId, loggedInUserId(), (res) => {

            if (res?.data?.Result === true) {
                setNFRData(res?.data?.Data)
                setIsApprovalDone(res?.data?.Data?.IsSent)
            }

            // let obj = {
            //     DepartmentId: DepartmentId,
            //     UserId: loggedInUserId(),
            //     TechnologyId: technologyId,
            //     Mode: 'costing',
            //     approvalTypeId: costingTypeIdToApprovalTypeIdFunction(CostingTypeId)
            // }
            // dispatch(checkFinalUser(obj, res => {
            //     if (res && res.data && res.data.Result) {
            //         setFinalLevelUser(res.data.Data.IsFinalApprover)
            //     }
            // }))
            let levelDetailsTemp = ''
            if (res?.data?.Data?.CostingData) {
                let technologyId = res?.data?.Data?.CostingData[0]?.TechnologyId
                dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), technologyId, (res) => {
                    levelDetailsTemp = userTechnologyLevelDetails(NFRTypeId, res?.data?.Data?.TechnologyLevels)
                    if (Number(levelDetailsTemp?.length) === 0) {
                        setSendForApprovalButtonShow(false)
                    } else {
                        let obj = {}
                        obj.DepartmentId = userDetails().DepartmentId
                        obj.UserId = loggedInUserId()
                        obj.TechnologyId = technologyId
                        obj.Mode = 'costing'
                        obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(NFRTypeId)
                        dispatch(checkFinalUser(obj, (res) => {
                            if (res?.data?.Result) {
                                setSendForApprovalButtonShow(true)
                                setIsFinalLevelUser(res?.data?.Data?.IsFinalApprover)
                            }
                        }))
                    }
                    setLevelDetails(levelDetailsTemp)
                }))

            }
        }))
    }, [])

    const toggleDrawer = (event, type = 'cancel') => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', type)
    };

    const closeDrawer = (type) => {
        if (type === "submit") {
            props.closeDrawer('', "submit")
        } else {
            setApprovalDrawer(false)
            setRejectDrawer(false)
        }
    }

    const viewCosting = (costingNumber) => {
        console.log(nfrData?.CostingData, "CostingData");
        setIsCostingDrawerLoader(true)
        dispatch(getSingleCostingDetails(costingNumber, (res) => {
            setIsCostingDrawerLoader(false)
            if (res.data.Data) {
                let dataFromAPI = res.data.Data
                const tempObj = formViewData(dataFromAPI)
                dispatch(setCostingViewData(tempObj))
            }
        },
            setIsOpen(true)
        ))
    }

    const closeCostingDrawer = () => {
        setIsOpen(false)
    }
    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`NFR Summary (Token No.${nfrData?.ApprovalToken ?? ''})`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        {/* {loader && <LoaderCustom />} */}
                        <Row className="mx-0 mb-3">
                            <Col>
                                {nfrData?.ApprovalSteps && <ApprovalWorkFlow approvalLevelStep={nfrData?.ApprovalSteps} approvalNo={nfrData?.ApprovalToken} />}
                            </Col>
                            <Col md="12">
                                <Table className='table cr-brdr-main'>
                                    <thead>
                                        <tr>
                                            {/* <th>{"Group Name"}</th> */}
                                            <th>{"Vendor"}</th>
                                            <th>{"Plant"}</th>
                                            <th>{"Costing"}</th>
                                            <th>{"Net PO"}</th>
                                            <th className="text-right">{"Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {nfrData?.CostingData && nfrData?.CostingData?.map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{`${data.VendorName} (${data.VendorCode})`}</td>
                                                    <td>{`${data.PlantName} (${data.PlantCode})`}</td>
                                                    <td>{data.CostingNumber}</td>
                                                    <td>{data.NetPOPrice}</td>
                                                    <td> <button
                                                        type="button"
                                                        title='View'
                                                        className="float-right mb-0 View "
                                                        onClick={() => viewCosting(data.CostingId)}
                                                    >
                                                    </button></td>
                                                </tr>
                                            )
                                        })}
                                        {nfrData?.CostingData && nfrData?.CostingData?.length === 0 && <tr>
                                            <td colSpan={4}><NoContentFound title={EMPTY_DATA} /></td>
                                        </tr>}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        {!isApprovalDone && sendForApprovalButtonShow && <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn mx-0">
                                <Fragment>
                                    <button type={'button'} className="mr5 approve-reject-btn"
                                        onClick={() => setRejectDrawer(true)}
                                    >
                                        <div className={'cancel-icon-white mr5'}></div>
                                        {'Reject'}
                                    </button>
                                    <button type="button" className="approve-button mr5 approve-hover-btn"

                                        onClick={() => setApprovalDrawer(true)}
                                    >
                                        <div className={'save-icon'}></div>
                                        {'Approve'}
                                    </button>
                                </Fragment>
                            </div>
                        </Row>
                        }
                    </div>
                </div>
            </Drawer >
            {isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeCostingDrawer}
                    anchor={"right"}
                    isReport={isOpen}
                    isSimulation={false}
                    simulationDrawer={false}
                    isReportLoader={isCostingDrawerLoader}
                />}
            {approvalDrawer && sendForApprovalButtonShow && <ApprovalDrawer isOpen={approvalDrawer} anchor="right" closeDrawer={closeDrawer} hideTable={true} nfrData={nfrData} type='Approve' isFinalLevelUser={isFinalLevelUser} />}
            {rejectDrawer && sendForApprovalButtonShow && <ApprovalDrawer isOpen={rejectDrawer} anchor="right" closeDrawer={closeDrawer} hideTable={true} nfrData={nfrData} rejectDrawer={true} isFinalLevelUser={isFinalLevelUser} />}
        </div >
    );
}
export default NfrSummaryDrawer