
import { AgGridReact } from 'ag-grid-react';
import React, { Fragment, useState, useEffect } from 'react';
import { EMPTY_DATA } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import _ from 'lodash'



function CostMovementByMasterReportListing(props) {

    const dummyData = [{
        RMName: 'RM1',
        RMGrade: 'RMGrade1',
        RMSpec: 'RMSpec1',
        Category: 'Category1',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM2',
        RMGrade: 'RMGrade2',
        RMSpec: 'RMSpec2',
        Category: 'Category2',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM3',
        RMGrade: 'RMGrade3',
        RMSpec: 'RMSpec3',
        Category: 'Category2',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM4',
        RMGrade: 'RMGrade4',
        RMSpec: 'RMSpec4',
        Category: 'Category3',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM5',
        RMGrade: 'RMGrade5',
        RMSpec: 'RMSpec5',
        Category: 'Category2',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',

        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM6',
        RMGrade: 'RMGrade6',
        RMSpec: 'RMSpec6',
        Category: 'Category4',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM7',
        RMGrade: 'RMGrade7',
        RMSpec: 'RMSpec7',
        Category: 'Category5',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },
    {
        RMName: 'RM8',
        RMGrade: 'RMGrade8',
        RMSpec: 'RMSpec8',
        Category: 'Category4',
        effectiveDate1: '03/02/2023',
        effectiveDate2: '03/06/2023',
        effectiveDate3: '11/09/2023',
        effectiveDate4: '09/02/2023',
    },

    ]



    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);;
    const [rowData, setRowData] = useState([]);

    useEffect(() => {

        // Groups the response data by category using the lodash library
        let grouped_data = _.groupBy(dummyData, 'Category')

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
            seprateData[Math.round(seprateData.length / 2) - 1].RowMargin = seprateData.length >= 2 && seprateData.length % 2 === 0 && 'margin-top';

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
    }, [])

    // Defines a function that returns a string of class names for the table cell based on the row data properties
    const cellClass = (props) => {
        return `${props?.data?.LastRow ? `border-color` : ''} ${props?.data?.RowMargin} colorWhite`
    }


    const columnDefs = [
        { field: 'RMName', headerName: 'RM Name' },
        { field: 'RMGrade', headerName: 'RM Grade' },
        { field: 'RMSpec', headerName: 'RM Spec' },
        { field: 'CategoryShow', headerName: 'Category', cellClass: cellClass },
        { field: 'effectiveDate1', headerName: '03/02/2023' },
        { field: 'effectiveDate1', headerName: '03/06/2023' },
        { field: 'effectiveDate1', headerName: '11/09/2023' },
        { field: 'effectiveDate1', headerName: '09/02/2023' },
    ];
    const gridOptions = {
    };



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

    };
    const cancelReport = () => {
        props?.viewList(false)
    }
    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };
    return <Fragment>

        <div className='w-100 mb-2 d-flex justify-content-end'>
            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
        </div>
        <div className="ag-grid-react">
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

                    <div className='button-wrapper'>
                        <div className="paging-container d-inline-block float-right">
                            {/* <select className="form-control paging-dropdown" defaultValue={globalTake} onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                <option value="10" selected={true}>10</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select> */}
                        </div>
                        {/* <div className="d-flex pagination-button-container">
                            <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                            {pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                            {pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                            {pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                            <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>


    </Fragment>
}
export default CostMovementByMasterReportListing;