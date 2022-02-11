import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import 'react-input-range/lib/css/index.css'
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getSimulatedAssemblyWiseImpactDate } from '../actions/Simulation';
import _ from 'lodash'
import { checkForDecimalAndNull } from '../../../helper';

const gridOptions = {};

function AssemblyWiseImpactSummary(props) {
    const { impactType, dataForAssemblyImpact, isPartImpactAssembly,isImpactDrawer } = props;
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [loader, setloader] = useState(false);
    const [showTableData, setShowTableData] = useState(false);
    const [count, setCount] = useState(0);
    const [textFilterSearch, setTextFilterSearch] = useState('')
    const dispatch = useDispatch();

    const simulationAssemblyListSummary = useSelector((state) => state.simulation.simulationAssemblyListSummary)
    const { initialConfiguration } = useSelector(state => state.auth)

    useEffect(() => {
        setloader(true)
        if (dataForAssemblyImpact !== undefined && (Object.keys(dataForAssemblyImpact).length !== 0 || dataForAssemblyImpact.length > 0) && count === 0) {
            let requestData = []
            let isAssemblyInDraft = false
            if (isPartImpactAssembly) {
                let obj = {
                    CostingId: dataForAssemblyImpact?.CostingId,
                    delta: dataForAssemblyImpact?.Variance,
                    IsSinglePartImpact: true
                }
                requestData = [obj]

            } else {
                let uniqueArr = _.uniqBy(dataForAssemblyImpact, function (o) {
                    return o.CostingId;
                });
            
                uniqueArr && uniqueArr.map(item => {
                    requestData.push({ CostingId: item.CostingId, delta: isImpactDrawer?item.Variance:item.POVariance, IsSinglePartImpact: false })
                    return null
                })

            }
            setCount(1)
            dispatch(getSimulatedAssemblyWiseImpactDate(requestData, isAssemblyInDraft, (res) => {

                if (res && res.data && res.data.DataList && res.data.DataList.length !== 0) {
                    setShowTableData(true)
                }
                else if (res && res?.data && res?.data?.DataList && res?.data?.DataList?.length === 0) {
                    setShowTableData(false)
                }
            }))

        }
        setloader(false)

    }, [dataForAssemblyImpact])

    const onGridReady = (params) => {
        setgridApi(params.api);

        window.screen.width >= 1366 && params.api.sizeColumnsToFit()
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
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
                <Col className="mb-3">
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " value={textFilterSearch} onChange={(e) => onFilterTextBoxChanged(e)} />
                        <button type="button" className={`user-btn`} title="Reset Grid" onClick={() => resetState()}>
                            <div className="refresh mr-0"></div>
                        </button>
                    </div>
                    <div>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    {(loader) && <LoaderCustom />}
                    <div className={`ag-grid-wrapper height-width-wrapper ${simulationAssemblyListSummary && simulationAssemblyListSummary?.length <=0 ?"overlay-contain": ""}`}>
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
                                paginationPageSize={10}
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
                            <div className="paging-container d-inline-block float-right">
                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                    <option value="10" selected={true}>10</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
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

