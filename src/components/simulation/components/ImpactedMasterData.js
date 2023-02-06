import React from 'react'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ERSimulation from './SimulationPages/ERSimulation';
import RMSimulation from './SimulationPages/RMSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import BDSimulation from './SimulationPages/BDSimulation';
import { ProcessListingSimulation } from './ProcessListingSimulation';
import MRSimulation from './SimulationPages/MRSimulation';

export function Impactedmasterdata(props) {
    const { data, masterId, viewCostingAndPartNo, customClass, lastRevision } = props;
    const renderMaster = () => {

        let rmListing = false
        let operationListing = false
        let exchangeRateListing = false
        let bopListing = false
        let machineListing = false
        let combinedProcessListing = false


        if (data?.length !== 0) {
            rmListing = data?.RawMaterialImpactedMasterDataList?.length === 0 ? false : true
            operationListing = data?.OperationImpactedMasterDataList?.length === 0 ? false : true
            exchangeRateListing = data?.ExchangeRateImpactedMasterDataList?.length === 0 ? false : true
            bopListing = data?.BoughtOutPartImpactedMasterDataList?.length === 0 || data?.BoughtOutPartImpactedMasterDataList === null ? false : true
            machineListing = data?.MachineProcessImpactedMasterDataList?.length === 0 || data?.MachineProcessImpactedMasterDataList === null ? false : true
            combinedProcessListing = data?.CombinedProcessImpactedMasterDataList?.length === 0 || data?.CombinedProcessImpactedMasterDataList === null ? false : true
        }

        return (<>
            {rmListing && <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.RawMaterialImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} />}
            {operationListing && masterId && <OperationSTSimulation isOperationMaster={true} costingAndPartNo={viewCostingAndPartNo} list={data?.OperationImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} />}
            {exchangeRateListing && <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.ExchangeRateImpactedMasterDataList} isImpactedMaster={true} />}
            {bopListing && <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.BoughtOutPartImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} />}
            {machineListing && <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.MachineProcessImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} />}
            {combinedProcessListing && <ProcessListingSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.CombinedProcessImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} />}
            {/* {surfaceTreatment && masterId && <OperationSTSimulation isSurfaceTreatmentMaster={true} costingAndPartNo={viewCostingAndPartNo} list={data?.OperationImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} />} */}
            {/* {rmListing && <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} />} */}
            {/* {machineRateListing && <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />} */}
        </>
        )

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
