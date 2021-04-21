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
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function Simulation(props) {

    let options = {}

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
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
    // const [fileName ,setFileName] = useState('')

    // useEffect(() => {

    // }, [rmDomesticListing, rmImportListing])
    const handleMasterChange = (value) => {
        setMaster(value)
        setShowMasterList(true)


    }
    const returnExcelColumn = (data = [], TempData) => {
        //  const { fileName, failedData, isFailedFlag } = this.props;
        console.log(data, "COMING IN EXCEL COLUMN11111111111111111", TempData);
        let temp = []
        temp = TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })
        // if (isFailedFlag) {

        //     //BELOW CONDITION TO ADD 'REASON' COLUMN WHILE DOWNLOAD EXCEL SHEET IN CASE OF FAILED
        //     let isContentReason = data.filter(d => d.label === 'Reason')
        //     if (isContentReason.length === 0) {
        //         let addObj = { label: 'Reason', value: 'Reason' }
        //         data.push(addObj)
        //     }
        // }


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

    return (
        <div className="container-fluid simulation-page">
            <Row>
                <Col sm="4">
                    <h1>{`Simulation`}</h1>
                </Col>
            </Row>
            <Row >
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
            <Row>
            <Col md="12" lg="12" className="mt-2">
                <div className="d-flex justify-content-end bd-highlight w100">
                    <div>
                        <button type="button" className={"edit-btn mt2 mr5"}>
                            <div className={"cross-icon"}> <img src={require("../../../assests/images/edit-yellow.svg")} alt="delete-icon.jpg" /> </div>  {"EDIT"} </button>
                        <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button type="button" className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img>Download File</button>}>
                            {renderColumn(master.label)}
                        </ExcelFile>
                        {/* <Downloadxls
                            isZBCVBCTemplate={false}
                            isMachineMoreTemplate={false}
                            fileName={'RMSimulationDomestic'}
                            isFailedFlag={false}
                            costingHead={''}
                        /> */}
                        {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}
                        <button type="button" className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>Bulk Upload </button>
                    </div>
                </div>
            </Col>
            </Row>

            {
                showUploadDrawer &&
                <SimulationUploadDrawer
                    isOpen={showUploadDrawer}
                    closeDrawer={closeDrawer}
                    anchor={"right"}
                />
            }
        </div>
    );
}

export default Simulation;