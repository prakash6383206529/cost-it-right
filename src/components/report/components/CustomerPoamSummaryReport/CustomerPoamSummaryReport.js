import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Col, Row } from "reactstrap"
import { getFormGridData } from "../../actions/ReportListing"
import CostReportForm from "../CostReportForm"
import CustomerPoamListing from "./CustomerPoamListing"

function CustomerPoamSummaryReport(props) {
    const [reportListing, setReportListing] = useState(false)
    const [isDataClear, setIsDataClear] = useState(false)
    const dispatch = useDispatch()
    const gridData = useSelector(state => state.report.costReportFormGridData && state.report.costReportFormGridData.gridData ? state.report.costReportFormGridData.gridData : [])

    useEffect(() => {
        dispatch(getFormGridData({}))
    }, [])
    /**
    * @Method runReport
    * @description Run report hide current component and mount CostRatioListing component
    */
    const runReport = () => {
        setReportListing(true)
    }

    /**
    * @Method viewListingHandler
    * @description callback function from CostRatioListing component on the click cancel button to hiding current component mount CostRatioReport
    */
    const closeDrawer = (value) => {
        setReportListing(false)
        setIsDataClear(true)
    }

    return (
        <>
            {!reportListing && <div className="container-fluid ag-grid-react">
                <h1 className="mb-0">Customer Poam Summary Report</h1>
                <CostReportForm isDateMandatory={true} isDataClear={isDataClear} showVendor={false} isPlantRequired={true} customerPoamSummary={true} />
                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <Col md="12" className="text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"user-btn save-btn"} disabled={gridData?.length === 0} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </Col>
                </Row>
            </div>}
            {reportListing && <CustomerPoamListing hideListing={reportListing} closeDrawer={closeDrawer} isSaleProvision={false} />}
        </>
    )
}
export default CustomerPoamSummaryReport;