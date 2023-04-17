import { Drawer } from "@material-ui/core";
import React from "react";
import { Col, Row, Table } from "reactstrap";
import LoaderCustom from "../../common/LoaderCustom";
import { useState } from "react";
import ApprovalWorkFlow from "../../costing/components/approval/ApprovalWorkFlow";
import { Fragment } from "react";
import ApprovalDrawer from "./ApprovalDrawer";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";


function NfrSummaryDrawer(props) {

    const [loader, setLoader] = useState(true)
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [tableData, setTableData] = useState([])
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)

    const toggleDrawer = (event, type = 'cancel') => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', type)
    };

    const closeDrawer = () => {
        setApprovalDrawer(false)
        setRejectDrawer(false)
    }

    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`NFR Summary (Token No.${props.rowData.TokenNo})`}</h3>
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
                                <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={props.rowData.NfrNo} />
                            </Col>
                            <Col md="12">
                                <Table className='table cr-brdr-main'>
                                    <thead>
                                        <tr>
                                            <th>{"Vendor"}</th>
                                            <th>{"Plant"}</th>
                                            <th>{"Costing"}</th>
                                            <th>{"Net PO"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {tableData && tableData.map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{data.vendor}</td>
                                                    <td>{data.plant}</td>
                                                    <td>{data.costing}</td>
                                                    <td>{data.netPO}</td>
                                                </tr>
                                            )
                                        })}
                                        {tableData && tableData.length === 0 && <tr>
                                            <td colSpan={4}><NoContentFound title={EMPTY_DATA} /></td>
                                        </tr>}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        {

                            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between">
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
            {approvalDrawer && <ApprovalDrawer isOpen={approvalDrawer} anchor="right" closeDrawer={closeDrawer} hideTable={true} />}
            {rejectDrawer && <ApprovalDrawer isOpen={rejectDrawer} anchor="right" closeDrawer={closeDrawer} hideTable={true} rejectDrawer={true} />}
        </div >
    );
}
export default NfrSummaryDrawer