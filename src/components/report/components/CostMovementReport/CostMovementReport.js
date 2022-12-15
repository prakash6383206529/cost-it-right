import React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Row } from "reactstrap"

import CostMovementGraph from "./CostMovementGraph"
import CostReportForm from "../CostReportForm"
import { getFormGridData } from "../../actions/ReportListing"

function CostMovementReport(props) {

    const [reportListing, setReportListing] = useState(true)
    const [graphListing, setGraphListing] = useState(false)
    const costReportFormData = useSelector(state => state.report.costReportFormGridData)
    let gridData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getFormGridData({}))
    }, [])

    const runReport = () => {
        setReportListing(false)
        setGraphListing(true)
    }

    const closeGraph = () => {
        setReportListing(true)
        setGraphListing(false)
    }

    return (
        <>{reportListing &&
            <div className="container-fluid ag-grid-react">
                <h1 className="mb-0">Cost Movement Report</h1>
                <CostReportForm />
                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <div className="col-sm-12 text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"user-btn save-btn"} disabled={gridData?.length === 0} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </div>
                </Row>
            </div >}
            {graphListing && <CostMovementGraph closeDrawer={closeGraph} />}
        </>
    )
}
export default CostMovementReport