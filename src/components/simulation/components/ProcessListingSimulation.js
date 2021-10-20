import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { CONSTANT } from '../../../helper/AllConastant'
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom'
import moment from 'moment'
import { ProcessMaster } from '../../../config/constants'
import ReactExport from 'react-export-excel';
import { PROCESSLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getCombinedProcessList } from '../../simulation/actions/Simulation'
import { Row, Col, } from 'reactstrap';

const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export function ProcessListingSimulation(props) {

    const { handleSubmit } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const [isOpenProcessDrawer, setIsOpenProcessDrawer] = useState(false)
    const [isEditFlag, setIsEditFlag] = useState(false)
    const [Id, setId] = useState('')
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [shown, setShown] = useState(false)

    const dispatch = useDispatch()
    const processCostingList = useSelector(state => state.simulation.combinedProcessList)

    useEffect(() => {

        let obj = {
            technologyId: props?.technology,
            vendorId: props?.vendorId
        }
        dispatch(getCombinedProcessList(obj, () => { }))

    }, [])

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? 'VBC' : 'ZBC';
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    }

    const processToggler = () => {
        setIsOpenProcessDrawer(true)
        setIsEditFlag(false)
        setId('')
    }

    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = (values) => { }

    const onBtExport = () => {
        let tempArr = []
        const data = gridApi && gridApi.getModel().rowsToDisplay
        data && data.map((item => {
            tempArr.push(item.data)
            return null
        }))
        return returnExcelColumn(PROCESSLISTING_DOWNLOAD_EXCEl, tempArr)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData.map((item) => {
            if (item.IsVendor === true) {
                item.IsVendor = 'Vendor Based'
            } else if (item.IsVendor === false) {
                item.IsVendor = 'Zero Based'
            } else if (item.VendorName === '-') {
                item.VendorName = ' '
            } else {
                return false
            }
            return item
        })
        return (<ExcelSheet data={temp} name={`${ProcessMaster}`}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
            }
        </ExcelSheet>);
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        window.screen.width >= 1366 && params.api.sizeColumnsToFit()
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        // window.screen.width <= 1366 ? params.columnApi.autoSizeColumns(allColumnIds) : params.api.sizeColumnsToFit()
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
        gridOptions.api.setFilterModel(null);
    }

    const statusFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // CHANGE IN STATUS IN AFTER KAMAL SIR API
        return <div className={row.Status}>{row.DisplayStatus}</div>
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,

    };

    const frameworkComponents = {
        costingHeadRenderer: costingHeadFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        effectiveDateFormatter: effectiveDateFormatter,
        statusFormatter: statusFormatter
    };

    return (
        <div className={`ag-grid-react ${props.DownloadAccessibility ? "show-table-btn" : ""}`}>
            < form onSubmit={handleSubmit(onSubmit)} noValidate >
                <Row className="pt-4">
                    <Col md="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {shown ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setShown(!shown)}>
                                        <div className="cancel-icon-white"></div></button>
                                ) : (
                                    ''
                                )}
                                {props.AddAccessibility && <button
                                    type="button"
                                    className={'user-btn mr5'}
                                    title="Add"
                                    onClick={processToggler}>
                                    <div className={'plus mr-0'}></div></button>}
                                {
                                    props.DownloadAccessibility &&
                                    <>
                                        <ExcelFile filename={ProcessMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
                                            {onBtExport()}
                                        </ExcelFile>
                                    </>
                                }

                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>

                            </div>
                        </div>
                    </Col>
                </Row>

            </form>
            <Row>
                <Col>


                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"
                        >
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                domLayout='autoHeight'
                                floatingFilter={true}
                                rowData={processCostingList}
                                pagination={true}
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: CONSTANT.EMPTY_DATA,
                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="TechnologyName" editable='false' headerName="Technology" minWidth={190}></AgGridColumn>
                                <AgGridColumn field="PlantName" editable='false' headerName="Plant" minWidth={190}></AgGridColumn>
                                <AgGridColumn suppressSizeToFit="true" editable='false' field="ConversionCost" headerName="Net CC" minWidth={190}></AgGridColumn>
                                <AgGridColumn field="RemainingTotal" editable='false' headerName="Remaining Fields Total" minWidth={190}></AgGridColumn>
                                <AgGridColumn suppressSizeToFit="true" field="TotalCost" headerName="Total" minWidth={190}></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateFormatter'></AgGridColumn>
                                <AgGridColumn field="CostingId" headerName="CostingId" hide></AgGridColumn>

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

        </div>
    );
}