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
import { BOPDOMESTIC, COMBINED_PROCESS, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants';
import RMSimulation from './SimulationPages/RMSimulation';
import CPSimulation from './SimulationPages/CPSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import MRSimulation from './SimulationPages/MRSimulation';

const gridOptions = {};

export function Impactedmasterdata(props) {
    const { isbulkUpload, data, masterId, viewCostingAndPartNo,isSimulationImpactMaster } = props;
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const [showImpactedData, setshowImpactedData] = useState(false)
    const [costingAndPartNo, setCostingAndPartNo] = useState(false)


    const [id, setId] = useState('')
    const dispatch = useDispatch()

    // all formatters
    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell !== null ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell !== null ? cell : '-'
    }

    const oldPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.BasicRate} </span>
            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.ScrapRate}</span>
            </>
        )
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
    }
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
    }

    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const NewcostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }
    // all formaters end

    const rawMaterailFormat = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? `${cell}- ${row.RMGrade}` : '-';
    }



    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
    }

    const frameworkComponents = {
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldRMFormatter: oldRMFormatter,
        newRMFormatter: newRMFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        rawMaterailFormat: rawMaterailFormat

    };

    const renderMaster = () => {
        switch (String(masterId)) {
            case EXCHNAGERATE:
                return <ERSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} />
            case RMDOMESTIC:
                return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} />
            case RMIMPORT:
                return <RMSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} isSimulationImpactMaster={isSimulationImpactMaster} />
            case COMBINED_PROCESS:
                    return <CPSimulation costingAndPartNo={viewCostingAndPartNo} list={data} isImpactedMaster={true} isbulkUpload={false} isSimulationImpactMaster={isSimulationImpactMaster} />
             
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
