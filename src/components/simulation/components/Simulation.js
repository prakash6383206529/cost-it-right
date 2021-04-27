import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import RMImportListing from '../../masters/material-master/RMImportListing';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getSelectListOfMasters } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';
import SimulationUploadDrawer from './SimulationUploadDrawer';
import { RMDOMESTIC, RMIMPORT } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { RMDomesticSimulation, RMImportSimulation } from '../../../config/masterData';
import { toastr } from 'react-redux-toastr';
import RMSimulation from './SimulationPages/RMSimulation';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function Simulation(props) {

    let options = {}

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
        setShowEditTable(false)
    }, [])

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const masterList = useSelector(state => state.simulation.masterSelectList)
    const rmDomesticListing = useSelector(state => state.material.rmDataList)
    const rmImportListing = useSelector(state => state.material.rmImportDataList)
    const [master, setMaster] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showUploadDrawer, setShowDrawer] = useState(false)
    const [showEditTable, setShowEditTable] = useState(false)
    const [isbulkUpload, setIsBulkUpload] = useState(false)
    const [tableData, setTableData] = useState([])
    const [rowCount, setRowCount] = useState({})

    const handleMasterChange = (value) => {
        setMaster(value)
        setShowMasterList(true)


    }
    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })

        return (<ExcelSheet data={temp} name={master.label}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const renderModule = (value) => {
        switch (value.label) {
            case RMDOMESTIC:
                return (<RMDomesticListing isSimulation={true} />)
            case RMIMPORT:
                return (<RMImportListing isSimulation={true} />)
            default:
                break;
        }
    }



    const renderColumn = (fileName) => {
        switch (fileName) {
            case RMDOMESTIC:
                return returnExcelColumn(RMDomesticSimulation, rmDomesticListing && rmDomesticListing.length > 0 ? rmDomesticListing : [])
            case RMIMPORT:
                return returnExcelColumn(RMImportSimulation, rmImportListing && rmImportListing.length > 0 ? rmImportListing : [])
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
    }

    const cancelEditPage = () => {
        setShowEditTable(false)
        setIsBulkUpload(false)
        setTableData([])
    }

    /**
   * @method closeGradeDrawer
   * @description  used to toggle grade Popup/Drawer
   */
    const closeDrawer = (e = '', tableData = {}, correctRow = 0, incorrectRow = 0) => {
        setShowDrawer(false)
        if (Object.keys(tableData).length > 0) {
            console.log(tableData, "tableData");
            setTableData(tableData)
            setRowCount({ correctRow: correctRow, incorrectRow: incorrectRow })
            setShowEditTable(true)
            setIsBulkUpload(true)
        }
    }

    const editTable = () => {
        let flag;
        setShowEditTable(true)
        // switch (master.label) {
        //     case RMDOMESTIC:
        //         console.log("COMING HERE");
        //         rmDomesticListing.forEach((element, index) => {
        //             if (element.CostingHead !== rmDomesticListing[index + 1]) {
        //                 console.log("COMING HERE");
        //                 toastr.warning('Please select either ZBC or VBC costing head at a time.')
        //                 flag = false
        //                 return false
        //             }
        //             return true
        //         });
        //         if (flag === true) {
        //             setShowEditTable(true)
        //         }
        //         break;
        //     case RMIMPORT:
        //         rmImportListing.forEach((element, index) => {
        //             if (element.CostingHead !== rmImportListing[index + 1]) {
        //                 toastr.warning('Please select either ZBC or VBC costing head at a time.')
        //                 flag = false
        //                 return false
        //             }
        //             return true
        //         })
        //         if (flag === true) {
        //             setShowEditTable(true)
        //         }
        //         break;

        //     default:
        //         break;
        // }

    }

    const editMasterPage = (page) => {
        switch (page) {
            case RMDOMESTIC:
                return <RMSimulation isDomestic={true} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : rmDomesticListing} />
            case RMIMPORT:
                return <RMSimulation isDomestic={false} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : rmImportListing} />

            default:
                break;
        }
    }



    return (
        <div className="container-fluid simulation-page">
            {
                !showEditTable &&
                <>
                    <Row>
                        <Col sm="12">
                            <h1>{`Simulation`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="12" className="filter-block zindex-12">
                            <div className="d-inline-flex justify-content-start align-items-center w100">
                                <div className="flex-fills">Masters:</div>
                                <div className="hide-label flex-fills pl-0">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'Masters'}
                                        placeholder={'Masters'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderListing('masters')}
                                        mandatory={false}
                                        handleChange={handleMasterChange}
                                        errors={errors.Masters}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {/* <RMDomesticListing isSimulation={true} /> */}
                    {
                        showMasterList && renderModule(master)
                    }
                    {
                        showMasterList &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2">
                                    <div>
                                        <button type="button" className={"edit-btn mt2 mr5"} onClick={editTable}>
                                            <div className={"cross-icon"}> <img src={require("../../../assests/images/edit-yellow.svg")} alt="delete-icon.jpg" /> </div>  {"EDIT"} </button>
                                        <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                            {renderColumn(master.label)}
                                        </ExcelFile>
                                        <button type="button" className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>UPLOAD</button>
                                        {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}
                                    </div>
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
                </>
            }
            {
                showEditTable && editMasterPage(master.label)
            }
        </div>
    );
}

export default Simulation;