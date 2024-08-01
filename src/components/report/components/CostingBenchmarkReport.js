import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import RMDomesticListing from '../../masters/material-master/RMDomesticListing'
import RMImportListing from '../../masters/material-master/RMImportListing'
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters, setMasterForSimulation } from '../../simulation/actions/Simulation'
import { useDispatch, useSelector } from 'react-redux';
import { APPROVED_STATUS, BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants'
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
import LoaderCustom from '../../common/LoaderCustom';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
function CostingBenchmarkReport(props) {
    const { t } = useTranslation("Reports")

    const { register, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const { selectedMasterForSimulation, selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    const [master, setMaster] = useState([])
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
    const [loader, setLoader] = useState(false)

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
        setblueDivison(false)
        setShowMasterList(false)
        if ((Number(value.value) === Number(7)) || (Number(master.value) === Number(7) && Number(value.value) === Number(6))) { //SURFACE TREATMENT & OPERATION
            setTimeout(() => {
                setShowMasterList(true)
                setblueDivison(true)
            }, 100);
        } else {
            setShowMasterList(true)
            setblueDivison(true)
        }
        setMaster(value)
    }

    const handleDate = (data) => {

        let unique = data.filter((item, i, ar) => ar.indexOf(item) === i);
        setDateArray(unique)
    }


    const renderModule = (value) => {

        switch (value.value) {
            case RMDOMESTIC:
                return (<RMDomesticListing isSimulation={false} technology={technology.value} selectionForListingMasterAPI='Master' handleDate={handleDate} benchMark={true} approvalStatus={APPROVED_STATUS} />)
            case RMIMPORT:
                return (<RMImportListing isSimulation={false} technology={0} selectionForListingMasterAPI='Master' handleDate={handleDate} benchMark={true} approvalStatus={APPROVED_STATUS} />)
            case MACHINERATE:
                return (<MachineRateListing isMasterSummaryDrawer={false} isSimulation={false} technology={0} selectionForListingMasterAPI='Master' benchMark={true} handleDate={handleDate} approvalStatus={APPROVED_STATUS} />)
            case BOPDOMESTIC:
                return (<BOPDomesticListing isSimulation={false} technology={technology.value} selectionForListingMasterAPI='Master' isMasterSummaryDrawer={false} handleDate={handleDate} benchMark={true} approvalStatus={APPROVED_STATUS} />)
            case BOPIMPORT:
                return (<BOPImportListing isSimulation={false} technology={technology.value} selectionForListingMasterAPI='Master' isMasterSummaryDrawer={false} handleDate={handleDate} benchMark={true} approvalStatus={APPROVED_STATUS} />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} selectionForListingMasterAPI='Master' approvalStatus={APPROVED_STATUS} />)
            case OPERATIONS:
                return (<OperationListing isSimulation={false} technology={null} selectionForListingMasterAPI='Master' stopAPICall={false} isMasterSummaryDrawer={false} benchMark={true} handleDate={handleDate} approvalStatus={APPROVED_STATUS} />)
            case SURFACETREATMENT:
                return (<OperationListing isSimulation={false} technology={null} selectionForListingMasterAPI='Master' stopAPICall={false} isMasterSummaryDrawer={false} isOperationST={SURFACETREATMENT} benchMark={true} handleDate={handleDate} approvalStatus={APPROVED_STATUS} />)
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
                if (item.Value === '0' || item.Value === '11') return false

                if (item.Text !== 'Assembly' && item.Text !== 'Exchange Rates' && item.Text !== 'Combined Process' && item.Text !== 'Raw Materials') {
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
                <div className="simulation-main p-relative mt-3">

                    <Row>
                        <Col md="12" className="filter-block">
                            {dropDown &&
                                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">Masters:</div>
                                    <div className="hide-label flex-fills pl-0">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Masters'}
                                            placeholder={'Select'}
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
                            <TourWrapper
                                buttonSpecificProp={{
                                    id: "MasterBenchmark_Listing_Tour"
                                }}
                                stepsSpecificProp={{
                                    steps: Steps(t, { selectedMasterForSimulation }).MASTERBENCHMARK
                                }} />
                        </Col>
                    </Row>

                    {loader && < LoaderCustom />}
                    {showMasterList && renderModule(master)}
                    <div className='p-relative'>
                        <Row>
                            {cancelButton && <Col md="12" className='mb-2'>
                                <button type="button" className={`apply float-right`} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
                            </Col>}
                        </Row>
                        {showInsight && renderInsights(master)}
                    </div>
                    {blueDivison && runReportButton &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 align-items-center">
                                    <button type="button" className={"user-btn mr5 save-btn"} onClick={runReport} disabled={disableRunReport}> <div className={"Run-icon"}></div>RUN REPORT</button>
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
