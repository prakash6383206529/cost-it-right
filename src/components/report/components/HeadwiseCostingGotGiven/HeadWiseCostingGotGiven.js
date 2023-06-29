
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
    const [disableBtn, setDisableBtn] = useState(true)
    const [isDataClear, setIsDataClear] = useState(false)
    const formData = useSelector(state => state.report.costReportFormGridData);
    useEffect(() => {
        dispatch(getFormGridData({}))
        setDisableBtn(true)
    }, [])
    useEffect(() => {
        setDisableBtn(!(formData.EffectiveDate && formData.customer && formData.plant && formData.part && formData.vendor))

    }, [formData])
    const runReport = () => {
        setReportListing(true)
    }
    const closeDrawer = (value) => {
        setReportListing(false)
        dispatch(getFormGridData({}))
        setIsDataClear(true)
    }

    return (<>

        {!reportListing && <div className="container-fluid ag-grid-react">
            <h1 className="mb-2">Head Wise Costing Got Given</h1>
            <CostReportForm isDateMandatory={true} isDataClear={isDataClear} isPlantRequired={true} showVendor={true} hideAddtable={true} dateHide={true} partWithRevision={true} gotGiven={true} effectiveDate={true} />
            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                <Col md="12" className="text-right bluefooter-butn mt-3">
                    <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                        <button type="button" className={"user-btn save-btn"} disabled={disableBtn} onClick={runReport} > <div className={"Run-icon"}></div>RUN REPORT</button>
                    </div>
                </Col>
            </Row>
        </div>
        }
        {reportListing && <GotGivenListing hideListing={reportListing} closeDrawer={closeDrawer} />}
    </>)
}
export default HeadWiseCostingGotGiven;