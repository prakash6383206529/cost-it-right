import React from 'react'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
import NoContentFound from '../../common/NoContentFound';
import { useDispatch, useSelector } from 'react-redux';
import ERSimulation from './SimulationPages/ERSimulation';
import RMSimulation from './SimulationPages/RMSimulation';
import CPSimulation from './SimulationPages/CPSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import BDSimulation from './SimulationPages/BDSimulation';

const gridOptions = {};

export function Impactedmasterdata(props) {
    const { data, masterId, viewCostingAndPartNo, customClass, lastRevision } = props;

    const renderMaster = () => {
        let rmListing = data?.RawMaterialImpactedMasterDataList?.length === 0 ? false : true
        let operationListing = data?.OperationImpactedMasterDataList?.length === 0 ? false : true
        let exchangeRateListing = data?.ExchangeRateImpactedMasterDataList?.length === 0 ? false : true
        let bopListing = data?.BoughtOutPartImpactedMasterDataList?.length === 0 || data?.BoughtOutPartImpactedMasterDataList === null ? false : true
        let surfaceTreatment = data?.OperationImpactedMasterDataList?.length === 0 ? false : true
        let machineRateListing = data?.MachineRateImpactedMasterDataList?.length === 0 ? false : true

        return (<>
            {rmListing && <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.RawMaterialImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} />}
            {operationListing && masterId && <OperationSTSimulation isOperationMaster={true} costingAndPartNo={viewCostingAndPartNo} list={data?.OperationImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} />}
            {exchangeRateListing && <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.ExchangeRateImpactedMasterDataList} isImpactedMaster={true} />}
            {bopListing && <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data?.BoughtOutPartImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} />}
            {/* {surfaceTreatment && masterId && <OperationSTSimulation isSurfaceTreatmentMaster={true} costingAndPartNo={viewCostingAndPartNo} list={data?.OperationImpactedMasterDataList} isImpactedMaster={true} isbulkUpload={false} lastRevision={lastRevision} masterId={masterId} />} */}
            {/* {rmListing && <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} customClass={customClass} />} */}
            {/* {machineRateListing && <MRSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />} */}
            {/* {bopListing && <BDSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />} */}
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
