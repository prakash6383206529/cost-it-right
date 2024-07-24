import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getComparisionSimulationData, getSimulatedAssemblyWiseImpactDate } from '../actions/Simulation';
import { checkForDecimalAndNull, formViewData } from '../../../helper';
// import ReactExport from 'react-export-excel';
import { ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl } from '../../../config/masterData'
import { AssemblyWiseImpactt } from '../../../config/constants'
import { PaginationWrapper } from '../../common/commonPagination';
import WarningMessage from '../../common/WarningMessage';
import { setCostingViewData } from '../../costing/actions/Costing';
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer';

const gridOptions = {};
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function AssemblyWiseImpact(props) {
    const { impactType, dataForAssemblyImpact, isPartImpactAssembly, isImpactDrawer, simulationId } = props;
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [loader, setloader] = useState(false);
    const [count, setCount] = useState(0);
    const [textFilterSearch, setTextFilterSearch] = useState('')
    const [showCostingSummaryTable, setShowCostingSummaryTable] = useState(false)
    const [technology, setTechnology] = useState('')
    const dispatch = useDispatch();

    const simulationAssemblyList = useSelector((state) => state.simulation.simulationAssemblyList)
    const { initialConfiguration } = useSelector(state => state.auth)

    useEffect(() => {
        setloader(true)
        if (dataForAssemblyImpact !== undefined && (Object.keys(dataForAssemblyImpact).length !== 0 || dataForAssemblyImpact.length > 0) && count === 0) {
            let requestData = []
            let isAssemblyInDraft = true
            if (isPartImpactAssembly) {
                let obj = {
                    CostingId: dataForAssemblyImpact?.CostingId,
                    delta: isImpactDrawer ? dataForAssemblyImpact?.Variance : dataForAssemblyImpact.POVariance,
                    IsSinglePartImpact: true,
                    SimulationId: simulationId
                }
                requestData = [obj]

            } else {
                dataForAssemblyImpact && dataForAssemblyImpact.map(item => {
                    requestData.push({ CostingId: item.CostingId, delta: isImpactDrawer ? item.Variance : item.POVariance, IsSinglePartImpact: false, SimulationId: simulationId })
                    return null
                })
            }
            setCount(1)
            dispatch(getSimulatedAssemblyWiseImpactDate(requestData, isAssemblyInDraft, (res) => { }))
        }
        setloader(false)

    }, [dataForAssemblyImpact])


    const onBtExport = () => {

        let tempArr = []
        tempArr = simulationAssemblyList


        return returnExcelColumn(ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl, tempArr)
    };


    const returnExcelColumn = (data = [], TempData) => {


        // return (

        //     <ExcelSheet data={TempData} name={AssemblyWiseImpactt}>
        //         {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        //     </ExcelSheet>);
    }






    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const viewCosting = (id, data, rowIndex) => {
        let obj = {
            simulationId: simulationId,
            costingId: data.CostingId
        }
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)

            dispatch(setCostingViewData(obj1))
            setShowCostingSummaryTable(true)
            setTechnology(obj1[0].technology)

        }))
    }

    const closeDrawer = () => {
        setShowCostingSummaryTable(false)
    }

    /**
    * @method costFormatter
    */
    const costFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice) : '-';
    }

    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <button className="View" title='View' type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />
        )
    }

    const onGridReady = (params) => {
        setgridApi(params.api);

        window.screen.width >= 1366 && params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    }

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const resetState = () => {
        gridApi?.setQuickFilter('');
        setTextFilterSearch('')
        gridOptions.columnApi?.resetColumnState();
        gridOptions.api?.setFilterModel(null);
    }
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
        setTextFilterSearch(e.target.value)
    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        costFormatter: costFormatter,
        buttonFormatter: buttonFormatter
    };

    return (
        <div className={`ag-grid-react ${props.customClass}`}>
            {/* { this.props.loading && <Loader />} */}
            <Row>
                <Col>
                    <div className="ag-grid-header assembly-wise-impact-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} value={textFilterSearch} onChange={(e) => onFilterTextBoxChanged(e)} />
                        <button type="button" className={`user-btn`} title="Reset Grid" onClick={() => resetState()}>
                            <div className="refresh mr-0"></div>
                        </button>
                        {/* <ExcelFile filename={'AssemblyWise Impact'} fileExtension={'.xls'} element={
                            <button type="button" className={'user-btn'}><div className="download mr-0" title="Download"></div>
                            </button>}>
                            {onBtExport()}
                        </ExcelFile> */}
                        <WarningMessage dClass="mt-2" message={"Some of the parts are present at different BOM levels (child part, sub-assemblies)."} />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    {(loader) && <LoaderCustom />}
                    <div className={`ag-grid-wrapper height-width-wrapper  ${simulationAssemblyList && simulationAssemblyList?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div
                            className="ag-theme-material"
                        >
                            <AgGridReact
                                style={{ height: '100%', width: '100%' }}
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={simulationAssemblyList}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'
                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="PartNumber" headerName='Assembly Number' cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="RevisionNumber" headerName='Revision No.' cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="PartName" headerName='Name' cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="Level" headerName="Child's Level" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                {impactType === 'Assembly' && <AgGridColumn field="Quantity" headerName='Applicable Quantity' cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                <AgGridColumn field="OldPrice" headerName='Existing Net Cost/Assembly' cellRenderer={'costFormatter'}></AgGridColumn>
                                {impactType === 'AssemblySummary' && <AgGridColumn field="NewPrice" headerName='Revised Net Cost/Assembly' cellRenderer={'costFormatter'}></AgGridColumn>}
                                <AgGridColumn field="Variance" headerName='Variance/Assembly (w.r.t. Existing)' cellRenderer={'costFormatter'}></AgGridColumn>
                                <AgGridColumn width={120} field="CostingId" headerName='Actions' type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter' pinned="right"></AgGridColumn>
                            </AgGridReact>
                            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                        </div>
                    </div>
                </Col>
            </Row>
            {showCostingSummaryTable && <CostingDetailSimulationDrawer
                isOpen={showCostingSummaryTable}
                closeDrawer={closeDrawer}
                anchor={"right"}
                isReport={true}
                isSimulation={true}
                simulationDrawer={true}
                isOldCosting={true}
                isSummaryDrawer={true}
                selectedTechnology={technology}
            />}
        </div >
    );
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default AssemblyWiseImpact;

