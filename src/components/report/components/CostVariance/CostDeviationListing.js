import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import React, { useEffect, useState } from 'react'
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants';
import { hyphenFormatter } from '../../../masters/masterUtil';
import Button from '../../../layout/Button';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { getCostDeviationReport } from '../../actions/ReportListing';
import NoContentFound from '../../../common/NoContentFound';
import { PaginationWrapper } from '../../../common/commonPagination';
const gridOptions = {};
const CostDeviationListing = ({ formData, viewCostVariance }) => {
    const [gridDataList, setGridDataList] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const { costDeviationReportList } = useSelector(state => state.report);
    const dispatch = useDispatch();
    const [state, setState] = useState({
        isLoader: false,
        noData: false,
        totalRecordCount: 0
    });
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    useEffect(() => {
        setState((prevState) => ({ ...prevState, isLoader: true }));
        let grouped_data = _.groupBy(costDeviationReportList, 'PartNumber')                                    // GROUPING OF THE ROWS FOR SEPERATE PARTS
        let data = []
        for (let x in grouped_data) {
            let seprateData = grouped_data[x]
            seprateData[Math.round(seprateData.length / 2) - 1].PartNo = x;                                   // SHOWING PART NUMBER IN MIDDLE
            seprateData[seprateData.length - 1].LastRow = true;                                               // ADDING LASTROW KEY FOR SHOWING SEPERATE BORDER
            seprateData[Math.round(seprateData.length / 2) - 1].RowMargin = seprateData.length >= 2 && seprateData.length % 2 === 0 && 'margin-top';    // ADDING ROWMARGIN KEY IN THE GRID FOR EVEN ROW AND AS WELL AS PARTS HAVE TWO OR MORE COSTING
            data.push(seprateData)
        }
        // setGridDataList(data)
        let newArray = []
        data.map((item) => {
            newArray = [...newArray, ...item]
        })
        setGridDataList(newArray)
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, isLoader: false }));
        }, 500);
        setState((prevState) => ({ ...prevState, totalRecordCount: costDeviationReportList.length }));
    }, [formData]);
    const onGridReady = (params) => {
    }
    const getDataList = (skip, take, floatingFilterData) => {
        dispatch(getCostDeviationReport(skip, take, floatingFilterData))
    }

    const onFloatingFilterChanged = (value) => {

    }
    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
        setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
    }
    const viewDetails = (cellValue, rowData, isEdit) => {
        viewCostVariance({
            view: true,
            data: {
                TechnologyId: rowData.TechnologyId,
                PartId: rowData.PartId,
            }
        })
    }
    const buttonRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <Button
            id={`rmDomesticListing_view${props.rowIndex}`}
            className={"mr-1 Tour_List_View"}
            variant="View"
            onClick={() => viewDetails(cellValue, rowData, true)}
            title={"View"}
        />
    }
    const PartNoRenderer = (props) => {
        return <div className='row-span'>{props?.data?.PartNo}</div>
    }
    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        buttonRenderer: buttonRenderer,
        PartNoRenderer: PartNoRenderer,
        customNoRowsOverlay: NoContentFound
    }
    const cellClass = (props) => {
        return `${props?.data?.LastRow ? `border-color` : ''} ${props?.data?.RowMargin} colorWhite`          // ADD SCSS CLASSES FOR ROW MERGING
    }
    return (
        <div className="ag-grid-react ">
            <div className={`ag-grid-wrapper height-width-wrapper ${(gridDataList && gridDataList?.length <= 0) ? "overlay-contain" : ""}`}>
                <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => { }} />
                </div>
                <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                    {!state.isLoader && <AgGridReact
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        domLayout='autoHeight'
                        // columnDefs={c}
                        rowData={gridDataList}

                        pagination={true}
                        paginationPageSize={defaultPageSize}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        // noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                        noRowsOverlayComponentParams={{ title: 'No Deviations Identified', imagClass: 'imagClass' }}
                        rowSelection={'multiple'}
                        onFilterModified={onFloatingFilterChanged}
                        onSelectionChanged={() => { }}
                        frameworkComponents={frameworkComponents}
                        suppressRowClickSelection={true}
                    >
                        <AgGridColumn field="PartNo" cellClass={cellClass} cellRenderer={'PartNoRenderer'} headerName="Part Number" ></AgGridColumn>
                        <AgGridColumn width={140} field="RevisionNumber" headerName="Revision Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={220} field="VendorCode" headerName="Vendor Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={210} field="RawMaterialGrossWeight" headerName="RM Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={245} field="RawMaterialFinishWeight" headerName="RM Finish Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="RawMaterialScrapWeight" headerName="RM Scrap Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="RawMaterialRate" headerName="RM Rate" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="ScrapRate" headerName="Scrap Rate" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="NetRawMaterialsCost" headerName="Net Raw Materials Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="RawMaterialName" headerName="RM Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="RawMaterialCode" headerName="RM Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="RawMaterialGrade" headerName="RM Grade" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="RawMaterialSpecification" headerName="RM Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn width={150} field="PartNumber" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonRenderer'}></AgGridColumn>
                    </AgGridReact>}
                    {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake} />}
                </div>
            </div>
        </div>

    )
}

export default CostDeviationListing
