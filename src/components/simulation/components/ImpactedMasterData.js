import React, { useState } from 'react'
import { Row, Col } from 'reactstrap'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
import NoContentFound from '../../common/NoContentFound';
import { useDispatch, useSelector } from 'react-redux';
import ERSimulation from './SimulationPages/ERSimulation';
import { BOPDOMESTIC, BOPIMPORT, COMBINED_PROCESS, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants';
import RMSimulation from './SimulationPages/RMSimulation';
import CPSimulation from './SimulationPages/CPSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import MRSimulation from './SimulationPages/MRSimulation';
import BDSimulation from './SimulationPages/BDSimulation';

const gridOptions = {};

export function Impactedmasterdata(props) {
    const { data, masterId, viewCostingAndPartNo, customClass,isSimulationImpactMaster } = props;

    const renderMaster = () => {
        switch (String(masterId)) {
            case EXCHNAGERATE:
                return <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} />
            case RMDOMESTIC:
                return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} customClass={customClass}/>
            case RMIMPORT:
                return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} isSimulationImpactMaster={isSimulationImpactMaster} customClass={customClass} />
            case COMBINED_PROCESS:
                return <CPSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} isSimulationImpactMaster={isSimulationImpactMaster}  customClass={customClass}/>
             
            case SURFACETREATMENT:
                return <OperationSTSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            case OPERATIONS:
                return <OperationSTSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false}/>
            case MACHINERATE:
                return <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false}/>
            case BOPDOMESTIC:
                return <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false}/>
            case BOPIMPORT:
                return <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false}/>


            default:
                break;
        }
    }

    return (
        <>
            <div className="mb-3 w-100">
                {/* <Col md="6"><div className="left-border">{'Impacted Master Data:'}</div></Col>
                <Col md="6" className="text-right">
                    <div className={'right-details'}>
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setshowImpactedData(!showImpactedData) }}>
                            {showImpactedData ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </div>
                </Col> */}

                <div className="accordian-content w-100">
                    {data && renderMaster(masterId)}
                </div>

            </div>
        </>
    )
}
