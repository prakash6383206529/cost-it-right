import React from 'react';
import { useState, useEffect, } from 'react';
import { useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { checkForDecimalAndNull } from '../../../helper';
import { ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl } from '../../../config/masterData'
import { AssemblyWiseImpactt } from '../../../config/constants'
import ReactExport from 'react-export-excel';
import { PaginationWrapper } from '../../common/commonPagination';
import WarningMessage from '../../common/WarningMessage';

const gridOptions = {};
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function AssemblyWiseImpactSummary(props) {
    const { impactType } = props;
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [textFilterSearch, setTextFilterSearch] = useState('')

    const simulationAssemblyListSummary = useSelector((state) => state.simulation.simulationAssemblyListSummary)
    const { initialConfiguration } = useSelector(state => state.auth)

    // useEffect(() => {
    //     setloader(true)
    //     if (dataForAssemblyImpact !== undefined && (Object.keys(dataForAssemblyImpact).length !== 0 || dataForAssemblyImpact.length > 0) && count === 0) {
    //         let requestData = []
    //         let isAssemblyInDraft = false

    //     }
    //     setloader(false)

    // }, [dataForAssemblyImpact])

    const onGridReady = (params) => {
        setgridApi(params.api);

        window.screen.width >= 1366 && params.api.sizeColumnsToFit()
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

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
        sortable: true,
    };


    const onBtExport = () => {
        let tempArr = []
        tempArr = simulationAssemblyListSummary

        return returnExcelColumn(ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl, tempArr)
    };


    const returnExcelColumn = (data = [], TempData) => {


        return (

            <ExcelSheet data={TempData} name={AssemblyWiseImpactt}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }



    /**
* @method hyphenFormatter
*/
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    /**
* @method costFormatter
*/
    const costFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice) : '-';
    }

    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        costFormatter: costFormatter
    };

    return (
        <div className={`ag-grid-react `}>
            {/* { this.props.loading && <Loader />} */}
            <Row>
                <Col>
                    <div className="ag-grid-header assembly-wise-impact-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " value={textFilterSearch} onChange={(e) => onFilterTextBoxChanged(e)} />
                        <button type="button" className={`user-btn`} title="Reset Grid" onClick={() => resetState()}>
                            <div className="refresh mr-0"></div>
                        </button>
                        <ExcelFile filename={'AssemblyWise Impact'} fileExtension={'.xls'} element={
                            <button type="button" className={'user-btn'}><div className="download mr-0" title="Download"></div>
                                {/* DOWNLOAD */}
                            </button>}>
                            {onBtExport()}
                        </ExcelFile>
                        <WarningMessage dClass="mt-2" message={"Some of the parts are present at different BOM levels. (child part, sub-assemblies)"} />

                    </div>

                </Col>
            </Row>
            <Row>
                <Col>
                    <div className={`ag-grid-wrapper height-width-wrapper ${simulationAssemblyListSummary && simulationAssemblyListSummary?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div
                            className="ag-theme-material"
                        >
                            <AgGridReact
                                style={{ height: '100%', width: '100%' }}
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={simulationAssemblyListSummary}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                loadingOverlayComponent={'customLoadingOverlay'}
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
                                <AgGridColumn field="OldPrice" headerName='Old PO Price/Assembly' cellRenderer={'costFormatter'}></AgGridColumn>
                                {impactType === 'AssemblySummary' && <AgGridColumn field="NewPrice" headerName='New PO Price/Assembly' cellRenderer={'costFormatter'}></AgGridColumn>}
                                <AgGridColumn field="Variance" headerName='Variance/Assembly' cellRenderer={'costFormatter'}></AgGridColumn>
                            </AgGridReact>
                            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                        </div>
                    </div>
                </Col>
            </Row>
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
export default AssemblyWiseImpactSummary;

