
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { getFormGridData } from '../../actions/ReportListing';
import CostReportForm from '../CostReportForm';
import GotGivenListing from './GotGivenListing';

function HeadWiseCostingGotGiven(props) {
    const dispatch = useDispatch()

    const [reportListing, setReportListing] = useState(false)

    const [isDataClear, setIsDataClear] = useState(false)
    const gridData = useSelector(state => state.report.costReportFormGridData && state.report.costReportFormGridData.gridData ? state.report.costReportFormGridData.gridData : [])

    useEffect(() => {
        dispatch(getFormGridData({}))
    }, [])
    const runReport = () => {
        setReportListing(true)
    }
    const closeDrawer = (value) => {
        setReportListing(false)
        setIsDataClear(true)
    }

    return (<>

        {!reportListing && <div className="container-fluid ag-grid-react">
            <h1 className="mb-0">Head Wise Costing Got Given</h1>
            <CostReportForm isDateMandatory={true} isDataClear={isDataClear} showVendor={false} isPlantRequired={true} />
            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                <Col md="12" className="text-right bluefooter-butn mt-3">
                    <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                        <button type="button" className={"user-btn save-btn"} disabled={gridData?.length === 0} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
                    </div>
                </Col>
            </Row>
        </div>
        }
        {reportListing && <GotGivenListing hideListing={reportListing} closeDrawer={closeDrawer} />}
    </>)
}
export default HeadWiseCostingGotGiven;