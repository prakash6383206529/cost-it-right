import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import RMDomesticListing from '../masters/material-master/RMDomesticListing'
import RMImportListing from '../masters/material-master/RMImportListing'
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters, setMasterForSimulation, setTechnologyForSimulation } from '../simulation/actions/Simulation'
import { useDispatch, useSelector } from 'react-redux';
import SimulationUploadDrawer from '../simulation/components/SimulationUploadDrawer'
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT } from '../../config/constants'
import ReactExport from 'react-export-excel';
import { getTechnologyForSimulation, RMDomesticSimulation, RMImportSimulation } from '../../config/masterData'
import { toastr } from 'react-redux-toastr';
import RMSimulation from '../simulation/components/SimulationPages/RMSimulation'
import { getCostingTechnologySelectList } from '../costing/actions/Costing'
import CostingSimulation from '../simulation/components/CostingSimulation'
import WarningMessage from '../common/WarningMessage';
import MachineRateListing from '../masters/machine-master/MachineRateListing'
import BOPDomesticListing from '../masters/bop-master/BOPDomesticListing'
import BOPImportListing from '../masters/bop-master/BOPImportListing'
import ExchangeRateListing from '../masters/exchange-rate-master/ExchangeRateListing'
import OperationListing from '../masters/operation/OperationListing'
import { setFilterForRM } from '../masters/actions/Material'
import { applyEditCondSimulation, getFilteredRMData, getOtherCostingSimulation, isUploadSimulation } from '../../helper';
import ERSimulation from '../simulation/components/SimulationPages/ERSimulation'
import OtherCostingSimulation from '../simulation/components/OtherCostingSimulation'
import Insights from '../masters/material-master/Insights';
import MachineInsights from '../masters/machine-master/MachineInsights'
import InsightsBop from '../masters/bop-master/InsightsBop'
import OperationInsights from '../masters/operation/OperationInsights';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function NewReport(props) {
    const { location } = props;

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const { selectedMasterForSimulation, selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    const [master, setMaster] = useState({})
    const [technology, setTechnology] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showUploadDrawer, setShowDrawer] = useState(false)
    const [showEditTable, setShowEditTable] = useState(false)
    const [button, setButton] = useState(false)
    const [showInsight, setShowInsight] = useState(false)
    const [isbulkUpload, setIsBulkUpload] = useState(false)
    const [tableData, setTableData] = useState([])
    const [rowCount, setRowCount] = useState({})
    const [editWarning, setEditWarning] = useState(true)
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
            setEditWarning(applyEditCondSimulation(getValues('Masters').value))
            setShowMasterList(false)
        }
    }, [])

    const masterList = useSelector(state => state.simulation.masterSelectList)
    const rmDomesticListing = useSelector(state => state.material.rmDataList)

    const rmImportListing = useSelector(state => state.material.rmImportDataList)
    const technologySelectList = useSelector(state => state.costing.technologySelectList)
    const exchangeRateDataList = useSelector(state => state.exchangeRate.exchangeRateDataList)

    // useEffect(() => {
    //     editTable()
    // }, [rmDomesticListing, rmImportListing])

    const handleMasterChange = (value) => {
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))

        setShowInsight(false)

        // setShowMasterList(false)
        setTechnology({ label: '', value: '' })
        setValue('Technology', '')
        dispatch(setMasterForSimulation(value))
        if (value !== '' && (Object.keys(getValues('Technology')).length > 0 || !getTechnologyForSimulation.includes(value.value))) {
            // setEditWarning(applyEditCondSimulation(getValues('Masters').value))
            setShowMasterList(true)
        }
        setEditWarning(applyEditCondSimulation(value.value))

        setButton(true)
        setblueDivison(true)


        setShowMasterList(true)
        setMaster(value)



    }



    const handleTechnologyChange = (value) => {
        setButton(true)
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
        setTechnology(value)
        dispatch(setTechnologyForSimulation(value))

        if (value !== '' && Object.keys(master).length > 0) {
            setShowMasterList(true)
        }
    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        let temp1 = getFilteredRMData(TempData)
        temp = temp1 && temp1.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })

        // if (rmDomesticListing && rmDomesticListing.length > 0 || rmImportListing && rmImportListing.length > 0) {
        //     const edit = editTable()

        // }

        return (<ExcelSheet data={temp} name={master.label}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const renderModule = (value) => {
        switch (value.value) {
            case RMDOMESTIC:
                return (<RMDomesticListing isSimulation={false} technology={technology.value} apply={editTable} />)
            case RMIMPORT:
                return (<RMImportListing isSimulation={false} technology={0} apply={editTable} />)
            case MACHINERATE:
                return (<MachineRateListing isSimulation={true} technology={0} apply={editTable} />)
            case BOPDOMESTIC:
                return (<BOPDomesticListing isSimulation={true} technology={technology.value} apply={editTable} />)
            case BOPIMPORT:
                return (<BOPImportListing isSimulation={true} technology={technology.value} apply={editTable} />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} apply={editTable} />)
            case OPERATIONS:
                return (<OperationListing isSimulation={true} technology={null} apply={editTable} />)
            default:
                return <div className="empty-table-paecholder" />;
        }
    }



    const renderInsights = (value) => {

        switch (value.value) {
            case (RMDOMESTIC):
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
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} apply={editTable} />)
            case OPERATIONS:
                return (<OperationInsights />)
            default:
                return <div className="empty-table-paecholder" />;
        }
    }




    const runReport = () => {

        setShowInsight(true)
        setShowMasterList(false)
        setButton(false)
        setDropDown(false)
        setcancelButton(true)

    }

    const cancelReport = () => {

        setShowInsight(false)
        setShowMasterList(true)
        setButton(true)
        setDropDown(true)
        setcancelButton(false)


    }




    const renderColumn = (fileName) => {
        switch (fileName) {
            case RMDOMESTIC:
                return returnExcelColumn(RMDomesticSimulation, getFilteredRMData(tableData) && getFilteredRMData(tableData).length > 0 ? getFilteredRMData(tableData) : [])
            case RMIMPORT:
                return returnExcelColumn(RMImportSimulation, getFilteredRMData(tableData) && getFilteredRMData(tableData).length > 0 ? getFilteredRMData(tableData) : [])
            default:
                return 'foo';
        }
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

        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    const cancelEditPage = () => {
        setShowEditTable(false)
        setIsBulkUpload(false)
        // setTableData([])
        setMaster({ label: master.label, value: master.value })
        setTechnology({ label: technology.label, value: technology.value })
    }

    /**
    * @method closeGradeDrawer
    * @description  used to toggle grade Popup/Drawer
    */
    const closeDrawer = (e = '', tableData = {}, correctRow = 0, NoOfRowsWithoutChange = 0) => {
        setShowDrawer(false)
        if (Object.keys(tableData).length > 0) {
            setTableData(tableData)
            setRowCount({ correctRow: correctRow, NoOfRowsWithoutChange: NoOfRowsWithoutChange })
            setShowEditTable(true)
            setIsBulkUpload(true)
        }
    }

    const editTable = (Data) => {

        setTableData(Data)

        let flag = true;
        let vendorFlag = true;
        let plantFlag = true;
        //  setShowEditTable(true)
        switch (master.value) {
            case RMDOMESTIC:

                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            setEditWarning(true);
                            flag = false
                            return false
                        }
                        // if (element.VendorName !== rmDomesticListing[index - 1].VendorName) {
                        //     // toastr.warning('Please select one vendor at a time.')
                        //     setEditWarning(true);
                        //     vendorFlag = false
                        //     return false
                        // }
                        if (element.PlantId !== Data[index - 1].PlantId) {
                            console.log("PLANT ");
                            setEditWarning(true);
                            plantFlag = false
                            return false
                        }
                    }
                });
                if (flag === true && vendorFlag === true && plantFlag === true) {
                    // setShowEditTable(true)
                    setEditWarning(false)
                }
                //  else {
                //     setEditWarning(true)
                // }
                break;
            case RMIMPORT:
                Data && Data.forEach((element, index) => {

                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            // toastr.warning('Please select either ZBC or VBC costing head at a time.')
                            setEditWarning(true);
                            flag = false
                            return false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            // toastr.warning('Please select one vendor at a time.')
                            setEditWarning(true);
                            vendorFlag = false
                            return false
                        }
                        if (element.PlantId !== Data[index - 1].PlantId) {
                            // toastr.warning('Please select one Plant at a time.')
                            setEditWarning(true);
                            plantFlag = false
                            return false
                        }
                    }
                })
                if (flag === true && vendorFlag === true && plantFlag === true) {
                    // setShowEditTable(true)
                    setEditWarning(false);
                }
                break;

            default:
                break;
        }

    }

    const openEditPage = () => {
        setShowEditTable(true)
    }


    const editMasterPage = (page) => {
        switch (page) {
            case RMDOMESTIC:
                return <RMSimulation isDomestic={true} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredRMData(rmDomesticListing)} technology={technology.label} master={master.label} />  //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case RMIMPORT:
                return <RMSimulation isDomestic={false} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredRMData(rmImportListing)} technology={technology.label} master={master.label} />   //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case EXCHNAGERATE:
                return <ERSimulation cancelEditPage={cancelEditPage} list={exchangeRateDataList} technology={technology.label} master={master.label} />
            default:
                break;
        }
    }


    // THIS WILL RENDER WHEN CLICK FROM SIMULATION HISTORY FOR DRAFT STATUS
    if (location?.state?.isFromApprovalListing === true) {
        const simulationId = location?.state?.approvalProcessId;
        const masterId = location?.state?.master

        // THIS WILL RENDER CONDITIONALLY.(IF BELOW FUNC RETUTM TRUE IT WILL GO TO OTHER COSTING SIMULATION COMPONENT OTHER WISE COSTING SIMULATION)
        if (getOtherCostingSimulation(String(masterId))) {
            console.log(masterId, "masterIdmasterId");
            return <OtherCostingSimulation master={masterId} simulationId={simulationId} isFromApprovalListing={location?.state?.isFromApprovalListing} />
        }
        return <CostingSimulation simulationId={simulationId} master={masterId} isFromApprovalListing={location?.state?.isFromApprovalListing} />
    }



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
                            {
                                // getTechnologyForSimulation.includes(master.value) &&
                                false &&

                                < div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">Technology:</div>
                                    <div className="flex-fills hide-label pl-0">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Technology'}
                                            placeholder={'Technology'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            defaultValue={technology.length !== 0 ? technology : ''}
                                            options={renderListing('technology')}
                                            mandatory={false}
                                            handleChange={handleTechnologyChange}
                                            errors={errors.Masters}
                                        />
                                    </div>
                                </div>
                            }
                        </Col>
                    </Row>

                    {/* <RMDomesticListing isSimulation={true} /> */}
                    {showMasterList && renderModule(master)}
                    {showInsight && renderInsights(master)}

                    {blueDivison &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">


                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">
                                    {/* {editWarning && <WarningMessage dClass="mr-3" message={'Please select costing head, Plant,Vendor from the filters and click on checkbox before editing'} />}
                                    <button type="button" className={"user-btn mt2 mr5"} onClick={openEditPage} disabled={(rmDomesticListing && rmDomesticListing.length === 0 || rmImportListing && rmImportListing.length === 0 || editWarning) ? true : false}>
                                        <div className={"edit-icon"}></div>  {"EDIT"} </button>
                                    {
                                        !isUploadSimulation(master.value) &&
                                        <>
                                            <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button type="button" disabled={editWarning} className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                                {/* {true ? '' : renderColumn(master.label)} */}

                                    {cancelButton && <button type="button" className={"mr15 cancel-btn"} onClick={cancelReport}> <div className={"cancel-icon"}></div>CANCEL</button>}
                                    {button && <button type="button" className={"user-btn mr5 save-btn"} onClick={runReport}> <div className={"Run-icon"}></div>RUN REPORT</button>}



                                    {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}


                                </div>

                            </div>
                        </Row>
                    }


                    {
                        showUploadDrawer &&
                        <SimulationUploadDrawer
                            isOpen={showUploadDrawer}
                            closeDrawer={closeDrawer}
                            anchor={"right"}
                        />
                    }
                </div >
            }
            <div className="simulation-edit">
                {showEditTable && editMasterPage(master.value)}
            </div>
        </div >
    );
}

export default NewReport;