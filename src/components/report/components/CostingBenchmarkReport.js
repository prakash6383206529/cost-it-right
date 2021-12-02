import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import RMDomesticListing from '../../masters/material-master/RMDomesticListing'
import RMImportListing from '../../masters/material-master/RMImportListing'
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters, setMasterForSimulation, setTechnologyForSimulation } from '../../simulation/actions/Simulation'
import { useDispatch, useSelector } from 'react-redux';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT } from '../../../config/constants'
import { getCostingTechnologySelectList } from '../../costing/actions/Costing'
import MachineRateListing from '../../masters/machine-master/MachineRateListing'
import BOPDomesticListing from '../../masters/bop-master/BOPDomesticListing'
import BOPImportListing from '../../masters/bop-master/BOPImportListing'
import ExchangeRateListing from '../../masters/exchange-rate-master/ExchangeRateListing'
import OperationListing from '../../masters/operation/OperationListing'
import { setFilterForRM } from '../../masters/actions/Material'
import Insights from '../../masters/material-master/Insights';
import MachineInsights from '../../masters/machine-master/MachineInsights'
import InsightsBop from '../../masters/bop-master/InsightsBop'
import OperationInsights from '../../masters/operation/OperationInsights';



function NewReport(props) {


    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
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

    const dispatch = useDispatch()

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

    const masterList = useSelector(state => state.simulation.masterSelectList)


    const handleMasterChange = (value) => {
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))

        setShowInsight(false)

        dispatch(setMasterForSimulation(value))

        setRunReportButton(true)
        setblueDivison(true)

        setShowMasterList(true)
        setMaster(value)

    }



    const renderModule = (value) => {
        switch (value.value) {
            case RMDOMESTIC:
                return (<RMDomesticListing isSimulation={false} technology={technology.value} />)
            case RMIMPORT:
                return (<RMImportListing isSimulation={false} technology={0} />)
            case MACHINERATE:
                return (<MachineRateListing isSimulation={true} technology={0} />)
            case BOPDOMESTIC:
                return (<BOPDomesticListing isSimulation={true} technology={technology.value} />)
            case BOPIMPORT:
                return (<BOPImportListing isSimulation={true} technology={technology.value} />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} />)
            case OPERATIONS:
                return (<OperationListing isSimulation={true} technology={null} />)
            default:
                return <div className="empty-table-paecholder" />;
        }
    }



    const renderInsights = (value) => {

        switch (value.value) {
            case RMDOMESTIC:
                return (<Insights />)
            case RMIMPORT:
                return (<Insights />)
            case MACHINERATE:
                return (<MachineInsights />)
            case BOPDOMESTIC:
                return (<InsightsBop />)
            case BOPIMPORT:
                return (<InsightsBop />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} />)
            case OPERATIONS:
                return (<OperationInsights />)
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
                temp.push({ label: item.Text, value: item.Value })
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
                        <Col md="12" className="filter-block zindex-12">
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
                                    {runReportButton && <button type="button" className={"user-btn mr5 save-btn"} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>}

                                </div>

                            </div>
                        </Row>
                    }



                </div >
            }

        </div >
    );
}

export default NewReport;
