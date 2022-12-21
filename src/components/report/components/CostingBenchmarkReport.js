import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import RMDomesticListing from '../../masters/material-master/RMDomesticListing'
import RMImportListing from '../../masters/material-master/RMImportListing'
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters, setMasterForSimulation } from '../../simulation/actions/Simulation'
import { useDispatch, useSelector } from 'react-redux';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants'
import { getCostingTechnologySelectList } from '../../costing/actions/Costing'
import MachineRateListing from '../../masters/machine-master/MachineRateListing'
import BOPDomesticListing from '../../masters/bop-master/BOPDomesticListing'
import BOPImportListing from '../../masters/bop-master/BOPImportListing'
import ExchangeRateListing from '../../masters/exchange-rate-master/ExchangeRateListing'
import OperationListing from '../../masters/operation/OperationListing'
import { setFilterForRM } from '../../masters/actions/Material'
import Insights from '../../report/components/BenchMarkReportPages/RMInsights'
import MachineInsights from '../../report/components/BenchMarkReportPages/MachineInsights'
import InsightsBop from '../../report/components/BenchMarkReportPages/InsightsBop'
import OperationInsights from '../../report/components/BenchMarkReportPages/OperationInsights'



function CostingBenchmarkReport(props) {


    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const { selectedMasterForSimulation, selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    const [master, setMaster] = useState({})
    const [technology, setTechnology] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showEditTable, setShowEditTable] = useState(false)
    const [runReportButton, setRunReportButton] = useState(false)
    const [showInsight, setShowInsight] = useState(false)
    const [cancelButton, setcancelButton] = useState(false)
    const [dropDown, setDropDown] = useState(true)
    const [blueDivison, setblueDivison] = useState(false)
    const [dateArray, setDateArray] = useState([])
    const [disableRunReport, setDisableRunReport] = useState(true)

    const dispatch = useDispatch()
    const { selectedRowForPagination } = useSelector((state => state.simulation))

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getCostingTechnologySelectList(() => { }))
        setShowEditTable(false)
        if (props.isRMPage) {
            setValue('Technology', { label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setValue('Masters', { label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })

            setMaster({ label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })
            setTechnology({ label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })

            setShowMasterList(false)
        }
    }, [])


    useEffect(() => {

        if (selectedRowForPagination) {

            if (selectedRowForPagination.length > 0) {
                setDisableRunReport(false)
            } else {
                setDisableRunReport(true)
            }
        }

    }, [selectedRowForPagination])

    const masterList = useSelector(state => state.simulation.masterSelectList)


    const handleMasterChange = (value) => {
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))

        setShowInsight(false)

        dispatch(setMasterForSimulation(value))

        setRunReportButton(true)
        setblueDivison(true)

        setShowMasterList(false)
        setTimeout(() => {
            setShowMasterList(true)
        }, 300);

        setMaster(value)
    }


    const handleDate = (data) => {

        let unique = data.filter((item, i, ar) => ar.indexOf(item) === i);
        setDateArray(unique)
    }


    const renderModule = (value) => {


        switch (value.value) {
            case RMDOMESTIC:
                return (<RMDomesticListing isSimulation={false} technology={technology.value} selectionForListingMasterAPI='Master' handleDate={handleDate} benchMark={true} />)
            case RMIMPORT:
                return (<RMImportListing isSimulation={false} technology={0} selectionForListingMasterAPI='Master' handleDate={handleDate} benchMark={true} />)
            case MACHINERATE:
                return (<MachineRateListing isMasterSummaryDrawer={false} isSimulation={false} technology={0} selectionForListingMasterAPI='Master' handleDate={handleDate} benchMark={true} />)
            case BOPDOMESTIC:
                return (<BOPDomesticListing isSimulation={false} technology={technology.value} selectionForListingMasterAPI='Master' isMasterSummaryDrawer={false} handleDate={handleDate} benchMark={true} />)
            case BOPIMPORT:
                return (<BOPImportListing isSimulation={false} technology={technology.value} selectionForListingMasterAPI='Master' isMasterSummaryDrawer={false} handleDate={handleDate} benchMark={true} />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} selectionForListingMasterAPI='Master' />)
            case OPERATIONS:
                return (<OperationListing isSimulation={false} technology={null} selectionForListingMasterAPI='Master' stopAPICall={false} isMasterSummaryDrawer={false} benchMark={true} handleDate={handleDate} />)
            case SURFACETREATMENT:
                return (<OperationListing isSimulation={false} technology={null} selectionForListingMasterAPI='Master' stopAPICall={false} isMasterSummaryDrawer={false} isOperationST={SURFACETREATMENT} benchMark={true} handleDate={handleDate} />)
            default:
                return <div className="empty-table-paecholder" />;
        }
    }



    const renderInsights = (value) => {


        switch (value.value) {
            case RMDOMESTIC:
                return (<Insights data={selectedRowForPagination} dateArray={dateArray} />)
            case RMIMPORT:
                return (<Insights data={selectedRowForPagination} dateArray={dateArray} />)
            case MACHINERATE:
                return (<MachineInsights data={selectedRowForPagination} dateArray={dateArray} />)
            case BOPDOMESTIC:
                return (<InsightsBop data={selectedRowForPagination} dateArray={dateArray} />)
            case BOPIMPORT:
                return (<InsightsBop data={selectedRowForPagination} dateArray={dateArray} />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} />)
            case OPERATIONS:
                return (<OperationInsights data={selectedRowForPagination} surfaceTreatMent={false} dateArray={dateArray} />)
            case SURFACETREATMENT:
                return (<OperationInsights data={selectedRowForPagination} surfaceTreatMent={true} dateArray={dateArray} />)
            default:
                return <div className="empty-table-paecholder" />;
        }
    }



    const runReport = () => {

        setShowInsight(true)
        setShowMasterList(false)
        setRunReportButton(false)
        setDropDown(false)
        setcancelButton(true)

    }

    const cancelReport = () => {

        setShowInsight(false)
        setShowMasterList(true)
        setRunReportButton(true)
        setDropDown(true)
        setcancelButton(false)


    }


    const renderListing = (label) => {
        let temp = []

        if (label === 'masters') {
            masterList && masterList.map((item) => {
                if (item.Value === '0') return false

                if (item.Text !== 'Assembly' && item.Text !== 'Exchange Rates' && item.Text !== 'Combined Process') {
                    temp.push({ label: item.Text, value: item.Value })
                }
                return null
            })
            return temp
        }

    }


    /**
  
    */


    return (
        <div className="container-fluid simulation-page">
            {
                !showEditTable &&
                <div className="simulation-main">
                    <Row>
                        <Col sm="12">
                            <h1>{`Report`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12" className="filter-block">
                            {dropDown &&
                                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">Masters:</div>
                                    <div className="hide-label flex-fills pl-0">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Masters'}
                                            placeholder={'Masters'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            defaultValue={master.length !== 0 ? master : ''}
                                            options={renderListing('masters')}
                                            mandatory={false}
                                            handleChange={handleMasterChange}
                                            errors={errors.Masters}
                                        />
                                    </div>
                                </div>
                            }

                        </Col>
                    </Row>


                    {showMasterList && renderModule(master)}
                    {showInsight && renderInsights(master)}

                    {blueDivison &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">


                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">

                                    {cancelButton && <button type="button" className={"mr15 cancel-btn"} onClick={cancelReport}> <div className={"cancel-icon"}></div>CANCEL</button>}
                                    {runReportButton && <button type="button" className={"user-btn mr5 save-btn"} onClick={runReport} disabled={disableRunReport}> <div className={"Run-icon"}></div>RUN REPORT</button>}

                                </div>

                            </div>
                        </Row>
                    }



                </div >
            }

        </div >
    );
}

export default CostingBenchmarkReport;
