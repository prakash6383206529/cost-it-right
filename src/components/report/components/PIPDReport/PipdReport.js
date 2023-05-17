import React, { useEffect, useState } from "react"
import CostReportForm from "../CostReportForm"
import { Col, Row } from "reactstrap"
import PipdReportListing from "./PipdReportListing"

function PipdReport() {
    const [showRatioListing, setShowRatioListing] = useState(false)
    const [isDataClear, setIsDataClear] = useState(false)

    useEffect(() => {

    }, [])
    /**
    * @Method runReport
    * @description Run report hide current component and mount CostRatioListing component
    */
    const runReport = () => {
        setShowRatioListing(true)
    }

    /**
    * @Method viewListingHandler
    * @description callback function from CostRatioListing component on the click cancel button to hiding current component mount CostRatioReport
    */
    const viewListingHandler = (value) => {
        setShowRatioListing(value)
        setIsDataClear(true)
    }

    return (
        <>
            {!showRatioListing && <div className="container-fluid ag-grid-react">
                <CostReportForm isDateMandatory={true} isDataClear={isDataClear} showVendor={true} hideAddtable={true} />
                <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                    <Col md="12" className="text-right bluefooter-butn mt-3">
                        <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                            <button type="button" className={"user-btn save-btn"} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                        </div>
                    </Col>
                </Row>
            </div>}
            {showRatioListing && <PipdReportListing hideListing={showRatioListing} viewListing={viewListingHandler} />}
        </>
    )
}

export default PipdReport;