
import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect } from 'react';
import { EMPTY_DATA, MASTER_MOVEMENT_REPORT, defaultPageSize } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import _ from 'lodash'
import { useDispatch } from 'react-redux';
import { getBOPCostMovement, getMachineProcessMovement, getOperationMovement, getRMCostMovement } from '../../actions/ReportListing';
import { PaginationWrapper } from '../../../common/commonPagination';
import ReactExport from 'react-export-excel';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

function CostMovementByMasterReportListing(props) {

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);;
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([])

    const [isData, setIsData] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const [headersState, setHeadersState] = useState([]);
    const dispatch = useDispatch();


    useEffect(() => {
        getTableData(props?.formData)
    }, [])


    const mergeCategory = (apiRes, masterCategory) => {
        // Groups the response data by category using the lodash library
        let grouped_data = _.groupBy(apiRes.Data, masterCategory)

        let data = []

        // Loops through each group of data
        for (let x in grouped_data) {
            // Gets the data for the current group
            let seprateData = grouped_data[x]

            // Adds a new property to show the category name in the middle row
            seprateData[seprateData.length >= 10 ? 5 : Math.round(seprateData.length / 2) - 1].CategoryShow = x;

            // Adds a new property to mark the last row
            seprateData[seprateData.length - 1].LastRow = true;


            // Adds a new property to mark the margin of the middle row if necessary
            seprateData[Math.round(seprateData.length / 2) - 1].RowMargin = seprateData.length >= 2 && seprateData.length % 2 === 0 && 'padding-top';

            // Adds the modified data to the data array
            data.push(seprateData)
        }

        // Combines all the separate data arrays into one
        let newArray = [];
        data.map((item) => {
            newArray = [...newArray, ...item]
            return null;
        })

        // Sets the row data in state
        setRowData(newArray)
        let temp = apiRes.TableHeads;
        let newTemp = []
        temp.map((item) => {
            if (item.field === masterCategory) {
                item.field = 'CategoryShow';
                item.cellClass = cellClass;
            } else {
                item.cellRenderer = dashFormatter
            }

            // if (typeof item.field === 'string' && !isNaN(Date.parse(item.field))) {

            // } else {

            // }
            newTemp.push(item)
            return null
        })
        setColumnDefs(newTemp)
        setIsLoader(false)
    }


    const getTableData = (formData) => {

        switch (Number(props.masterData)) {
            case 1:
            case 2:
                setIsLoader(true)
                dispatch(getRMCostMovement(formData, res => {
                    if (res.status === 200) {
                        setIsData(true)
                        setRowData(res.data.Data.Data)
                        setHeadersState(res.data.Data.TableHeads)
                        setIsLoader(false)
                        mergeCategory(res.data.Data, 'Category')
                    }
                    else {
                        setIsData(false)
                        setIsLoader(false)
                    }
                }))
                break;
            case 4:
            case 5:
                setIsLoader(true)
                dispatch(getBOPCostMovement(formData, res => {
                    if (res.status === 200) {
                        setIsData(true)
                        setRowData(res.data.Data.Data)
                        setHeadersState(res.data.Data.TableHeads)
                        let temp = res.data.Data.TableHeads;
                        let newTemp = []
                        temp.map((item) => {
                            item.cellRenderer = dashFormatter
                            newTemp.push(item)
                            return null
                        })
                        setColumnDefs(newTemp)
                        setIsLoader(false)
                    }
                    else {
                        setIsData(false)
                        setIsLoader(false)
                    }
                }))
                break;
            case 6:
            case 7:
                setIsLoader(true)
                dispatch(getOperationMovement(formData, res => {
                    if (res.status === 200) {
                        setIsData(true)
                        setRowData(res.data.Data.Data)
                        setHeadersState(res.data.Data.TableHeads)
                        let temp = res.data.Data.TableHeads;
                        let newTemp = []
                        temp.map((item) => {
                            item.cellRenderer = dashFormatter
                            newTemp.push(item)
                            return null
                        })
                        setColumnDefs(newTemp)
                        setIsLoader(false)
                    }
                    else {
                        setIsData(false)
                        setIsLoader(false)
                    }
                }))
                break;
            case 9:
                setIsLoader(true)
                dispatch(getMachineProcessMovement(formData, res => {
                    if (res.status === 200) {
                        setIsData(true)
                        setRowData(res.data.Data.Data)
                        setHeadersState(res.data.Data.TableHeads)
                        let temp = res.data.Data.TableHeads;
                        let newTemp = []
                        temp.map((item) => {
                            item.cellRenderer = dashFormatter
                            newTemp.push(item)
                            return null
                        })
                        setColumnDefs(newTemp)
                        setIsLoader(false)
                    }
                    else {
                        setIsData(false)
                        setIsLoader(false)
                    }
                }))
                break;
            default:
                break;
        }

    }

    // Defines a function that returns a string of class names for the table cell based on the row data properties
    const cellClass = (props) => {
        return `${props?.data?.LastRow ? `border-color` : ''} ${props?.data?.RowMargin} colorWhite`
    }

    const dashFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-';
    }

    const defaultColDef = {

        resizable: true,
        filter: true,
        sortable: false,
        floatingFilter: true,
    };
    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        window.screen.width >= 1440 && params.api.sizeColumnsToFit();

    };
    const cancelReport = () => {
        props?.viewList(false)
    }


    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };


    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };
    const renderColumn = () => {
        return returnExcelColumn(rowData, headersState);
    };

    const returnExcelColumn = (rowData) => {
        // Get the stored headers
        const headers = [...headersState];

        // Map the header names to the corresponding field in rowData
        const headersMap = {};
        headers.forEach((header) => {
            headersMap[header.headerName] = header.field;
        });

        // Extract data from the response
        const data = rowData.map((row) => {
            const obj = {};
            headers.forEach((header) => {
                const fieldName = headersMap[header.headerName];
                obj[header.headerName] = row[fieldName] || '';
            });
            return obj;
        });

        return (
            <ExcelSheet data={data} name={MASTER_MOVEMENT_REPORT}>
                {headers.map((header, index) => (
                    <ExcelColumn key={index} label={header.headerName} value={header.headerName} />
                ))}
            </ExcelSheet>
        );
    };
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
    }
    return <div className='p-relative'>
        <div className='w-100 mb-2 d-flex justify-content-end'>
            <ExcelFile filename={MASTER_MOVEMENT_REPORT} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                {renderColumn()}
            </ExcelFile>
            <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                <div className="refresh mr-0"></div>
            </button>
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div>
        {isLoader && <LoaderCustom customClass="loader-center" />}
        {isData ? <div className="ag-grid-react">
            <div className={`ag-grid-wrapper height-width-wrapper ${rowData && rowData?.length <= 0 ? "overlay-contain" : ""}`}>
                <div
                    className="ag-theme-material">
                    <AgGridReact
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        domLayout='autoHeight'
                        gridOptions={gridOptions}
                        columnDefs={columnDefs}
                        rowData={rowData}
                        pagination={true}
                        paginationPageSize={defaultPageSize}
                        onGridReady={onGridReady}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                            title: EMPTY_DATA,
                            imagClass: 'imagClass'
                        }}
                        frameworkComponents={frameworkComponents}
                        suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                    >
                    </AgGridReact>
                    <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />
                </div>
            </div>
        </div> : <NoContentFound title={EMPTY_DATA} />}
    </div>
}
export default CostMovementByMasterReportListing;