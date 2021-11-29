import React from 'react'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ERSimulation from './SimulationPages/ERSimulation';
import { BOPDOMESTIC, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, BOPIMPORT } from '../../../config/constants';
import RMSimulation from './SimulationPages/RMSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import MRSimulation from './SimulationPages/MRSimulation';
// import BDSimulation from './SimulationPages/BDSimulation';

export function Impactedmasterdata(props) {
    const { data, masterId, viewCostingAndPartNo } = props;

    const renderMaster = () => {
        switch (String(masterId)) {
            case EXCHNAGERATE:
                return <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} />
            case RMDOMESTIC:
                return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            case RMIMPORT:
                return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            case SURFACETREATMENT:
                return <OperationSTSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            case OPERATIONS:
                return <OperationSTSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            case MACHINERATE:
                return <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            // case BOPDOMESTIC:
            //     return <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            // case BOPIMPORT:
            //     return <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />

            default:
                break;
        }
    }

    return (
        <>
            <div className="mb-3 w-100">
                <div className="accordian-content w-100">
                    {data && renderMaster(masterId)}
                </div>

            </div>
        </>
    )
}
