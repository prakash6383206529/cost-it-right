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
import {
    RMDomesticSimulation, RMDomesticSimulationTempData,
    RMImportSimulation
} from '../../../config/masterData';
import { toastr } from 'react-redux-toastr';
import Downloadxls from '../../massUpload/Downloadxls';
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

    /**
   * @method closeGradeDrawer
   * @description  used to toggle grade Popup/Drawer
   */
    const closeDrawer = (e = '') => {
        setShowDrawer(false)
    }

    const editTable = () => {
        setShowEditTable(true)
    }

    const editMasterPage = (page) => {
        switch (page) {
            case RMDOMESTIC:
                return <RMSimulation isDomestic={true} list={rmDomesticListing} />
            case RMIMPORT:
                return <RMSimulation isDomestic={false} list={rmImportListing} />

            default:
                break;
        }
    }



    return (
        <div>
            {
                !showEditTable &&
                <>
                    <Row>
                        <Col sm="4">
                            <h1>{`Simulation`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col md="1">
                            <div>Masters:</div>
                        </Col>
                        <Col md="3">
                            <div className="flex-fill filled-small hide-label">
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
                        </Col>
                    </Row>
                    {/* <RMDomesticListing isSimulation={true} /> */}
                    {
                        showMasterList && renderModule(master)
                    }
                    {
                        showMasterList &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Col md="12" lg="12" className="mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <div>
                                            <button type="button" className={"user-btn edit-btn mt2 mr5"} onClick={editTable}>
                                                <div className={"cross-icon"}> <img src={require("../../../assests/images/edit-yellow.svg")} alt="delete-icon.jpg" /> </div>  {"EDIT"} </button>
                                            <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary mr-2'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img>DOWNLOAD</button>}>
                                                {renderColumn(master.label)}
                                            </ExcelFile>
                                            <button type="button" className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>UPLOAD</button>
                                            {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}
                                        </div>
                                    </div>
                                </Col>
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