
import { AgGridReact } from 'ag-grid-react';
import React, { Fragment, useState, useEffect } from 'react';
import { EMPTY_DATA, defaultPageSize } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import _ from 'lodash'
import { useDispatch } from 'react-redux';
import { getRMCostMovement } from '../../actions/ReportListing';
import { PaginationWrapper } from '../../../common/commonPagination';



function CostMovementByMasterReportListing(props) {

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);;
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([])
    const [isData, setIsData] = useState(false)

    const dispatch = useDispatch();


    useEffect(() => {
        getTableData(props?.formData)
    }, [])

    const getTableData = (formData) => {
        switch (Number(props.masterData)) {
            case 1:
                dispatch(getRMCostMovement(formData, res => {
                    if (res.status === 200) {
                        setIsData(true)
                        // Groups the response data by category using the lodash library
                        let grouped_data = _.groupBy(res.data.Data.Data, 'Category')

                        let data = []

                        // Loops through each group of data
                        for (let x in grouped_data) {
                            // Gets the data for the current group
                            let seprateData = grouped_data[x]

                            // Adds a new property to show the category name in the middle row
                            seprateData[Math.round(seprateData.length / 2) - 1].CategoryShow = x;

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
                        let temp = res.data.Data.TableHeads;
                        let newTemp = []
                        temp.map((item) => {
                            if (item.field === 'Category') {
                                item.field = 'CategoryShow';
                                item.cellClass = cellClass;
                            }
                            newTemp.push(item)
                            return null
                        })
                        setColumnDefs(newTemp)
                    }
                    else {
                        setIsData(false)
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

    const gridOptions = {};

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



    return <Fragment>

        <div className='w-100 mb-2 d-flex justify-content-end'>
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div>
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


    </Fragment>
}
export default CostMovementByMasterReportListing;