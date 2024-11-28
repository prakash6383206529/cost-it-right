import React from 'react'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ERSimulation from './SimulationPages/ERSimulation';
import RMSimulation from './SimulationPages/RMSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import BDSimulation from './SimulationPages/BDSimulation';
import { ProcessListingSimulation } from './ProcessListingSimulation';
import MRSimulation from './SimulationPages/MRSimulation';
import { AgGridColumn } from 'ag-grid-react';
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper';

export function Impactedmasterdata(props) {
    const { data, masterId, viewCostingAndPartNo, customClass, lastRevision } = props;

    const renderMaster = () => {

        let rmListing = false
        let operationListing = false
        let exchangeRateListing = false
        let bopListing = false
        let machineListing = false
        let combinedProcessListing = false
        let surfaceTreatmentListing = false


        if (data?.length !== 0) {
            rmListing = data?.RawMaterialImpactedMasterDataList?.length === 0 ? false : true
            operationListing = data?.OperationImpactedMasterDataList?.length === 0 ? false : true
            surfaceTreatmentListing = data?.SurfaceTreatmentImpactedMasterDataList?.length === 0 ? false : true
            exchangeRateListing = data?.ExchangeRateImpactedMasterDataList?.length === 0 ? false : true
            bopListing = data?.BoughtOutPartImpactedMasterDataList?.length === 0 || data?.BoughtOutPartImpactedMasterDataList === null ? false : true
            machineListing = data?.MachineProcessImpactedMasterDataList?.length === 0 || data?.MachineProcessImpactedMasterDataList === null ? false : true
            combinedProcessListing = (data?.CombinedProcessImpactedMasterDataList?.length > 0) ? true : false
        }
        const commonGridColumns = <>
            <AgGridColumn width={140} field="PreviousMinimum" cellRenderer={'nullHandler'} headerName={"Previous Min."} suppressSizeToFit={true}></AgGridColumn>
            <AgGridColumn width={140} field="PreviousMaximum" cellRenderer={'nullHandler'} headerName={"Previous Max."} suppressSizeToFit={true} ></AgGridColumn>
            <AgGridColumn width={140} field="PreviousAverage" cellRenderer={'nullHandler'} headerName={"Previous Avg."} suppressSizeToFit={true}></AgGridColumn>
            <AgGridColumn width={140} field="Minimum" cellRenderer={'nullHandler'} headerName={"Current Min."} suppressSizeToFit={true}></AgGridColumn>
            <AgGridColumn width={140} field="Maximum" cellRenderer={'nullHandler'} headerName={"Current Max."} suppressSizeToFit={true}></AgGridColumn>
            <AgGridColumn width={140} field="Average" cellRenderer={'nullHandler'} headerName={"Current Avg."} suppressSizeToFit={true}></AgGridColumn>
        </>

        const nullHandler = (props) => {
            const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
            return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
        }
        return (<>
            {rmListing && <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.RawMaterialImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} lastRevision={lastRevision} nullHandler={nullHandler} masterId={masterId}>
                {commonGridColumns}
            </RMSimulation>}
            {operationListing && masterId && <OperationSTSimulation isOperationMaster={true} costingAndPartNo={viewCostingAndPartNo} list={data?.OperationImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} nullHandler={nullHandler}>{commonGridColumns}</OperationSTSimulation>}
            {surfaceTreatmentListing && masterId && <OperationSTSimulation isOperationMaster={true} costingAndPartNo={viewCostingAndPartNo} list={data?.SurfaceTreatmentImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} nullHandler={nullHandler}>{commonGridColumns}</OperationSTSimulation>}
            {exchangeRateListing && <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.ExchangeRateImpactedMasterDataList} isImpactedMaster={true} lastRevision={lastRevision} nullHandler={nullHandler}>{commonGridColumns}</ERSimulation>}
            {bopListing && masterId && <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.BoughtOutPartImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} nullHandler={nullHandler}>
                {commonGridColumns}
            </BDSimulation>}
            {machineListing && <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.MachineProcessImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} nullHandler={nullHandler}>{commonGridColumns}</MRSimulation>}
            {combinedProcessListing && <ProcessListingSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.CombinedProcessImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} />}
        </>
        )

    }

    //     switch (String(masterId)) {
    //         case EXCHNAGERATE:
    //             return <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} />
    //         case RMDOMESTIC:
    //             return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} />
    //         case RMIMPORT:
    //             return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} />
    //         case SURFACETREATMENT:
    //             return <OperationSTSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} />
    //         case OPERATIONS:
    //             return <OperationSTSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} />
    //         case MACHINERATE:
    //             return <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
    //         case BOPDOMESTIC:
    //             return <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
    //         case BOPIMPORT:
    //             return <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />


    //         default:
    //             break;
    //     }
    // }

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
