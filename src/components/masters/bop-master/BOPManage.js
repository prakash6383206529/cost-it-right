import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import { getManageBOPSOBDataList, getViewBoughtOutPart } from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { BOP_SOBLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ManageSOBDrawer from './ManageSOBDrawer';
import LoaderCustom from '../../common/LoaderCustom';
import { searchNocontentFilter, setLoremIpsum, showBopLabel } from '../../../helper';
import { Sob } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../../common/commonPagination';
import DayTime from '../../common/DayTimeWrapper';
import { useContext } from 'react';
import { useState } from 'react';
import { ApplyPermission } from '.';
import { useRef } from 'react';
import Button from '../../layout/Button';
import { reactLocalStorage } from 'reactjs-localstorage';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels } from '../../../helper/core';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const BOPManage = (props) => {
    const { vendorLabel } = useLabels();
    const dispatch = useDispatch();
    const searchRef = useRef(null);
    const { t } = useTranslation("common")
    const { getViewBoughtOutParts } = useSelector((state) => state.boughtOutparts);
    const permissions = useContext(ApplyPermission);
    const [state, setState] = useState({
        isOpen: false,
        isEditFlag: false,
        ID: '',
        tableData: [],
        shown: false,
        costingHead: [],
        BOPCategory: [],
        plant: [],
        vendor: [],
        gridApi: null,
        gridColumnApi: null,
        rowData: null,
        sideBar: { toolPanels: ['columns'] },
        showData: false,
        isLoader: false,
        selectedRowData: false,
        noData: false,
        dataCount: 0,
        showExtraData: false,
        render: false,
    });

    useEffect(() => {
        getDataList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
    * @method getDataList
    * @description GET DATALIST OF IMPORT BOP
    */

    const getDataList = (bought_out_part_id = null) => {
        const filterData = {
            entryType: "",
            bopCategory: "",
            bopName: "",
            bopNumber: "",
        };
        setState((prevState) => ({ ...prevState, isLoader: true }));
        dispatch(getViewBoughtOutPart(filterData, (res) => {
            setState((prevState) => ({ ...prevState, isLoader: false }));
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                setState((prevState) => ({ ...prevState, tableData: Data }));
            } else if (res && res.response && res.response.status === 412) {
                setState((prevState) => ({ ...prevState, tableData: [] }));
            } else {
                setState((prevState) => ({ ...prevState, tableData: [] }));
            }
        }));
    };

    /**
   * @method editItemDetails
   * @description edit material type
   */
    const editItemDetails = (Id) => {
        setState((prevState) => ({
            ...prevState,
            isEditFlag: true,
            ID: Id,
            isOpen: true,
        }));
    };
    /**
       * @method onFloatingFilterChanged
       * @description Filter data when user type in searching input
       */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            getViewBoughtOutParts.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData) }));
        }, 500);
    };



    /**
     * @method costingHeadFormatter
     * @description Renders Costing head
     */
    const costingHeadFormatter = (cell, row, enumObject, rowIndex) => {
        return cell ? `${vendorLabel} Based` : 'Zero Based';
    }




    /**
    * @method closeDrawer
    * @description Filter listing
    */
    const closeDrawer = (e = '', type) => {
        setState((prevState) => ({ ...prevState, isOpen: false, isEditFlag: false, ID: '', }))
        if (type === 'submit') {
            getDataList();
        }

    };


    /**
      * @method hyphenFormatter
      */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    const onGridReady = (params) => {
        params.api.sizeColumnsToFit()
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onRowSelect = () => {
        const selectedRows = state.gridApi?.getSelectedRows()
        setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
    }

    const onBtExport = () => {
        let tempArr = []
        tempArr = state.gridApi && state.gridApi?.getSelectedRows()
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (getViewBoughtOutParts ? getViewBoughtOutParts : [])
        return returnExcelColumn(BOP_SOBLISTING_DOWNLOAD_EXCEl, tempArr)
    };

    var filterParams = {
        date: "",
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString =
                cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
            if (dateAsString == null) return -1;
            var dateParts = dateAsString.split("/");
            var cellDate = new Date(
                Number(dateParts[2]),
                Number(dateParts[1]) - 1,
                Number(dateParts[0])
            );
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            }
        },
        browserDatePicker: true,
        minValidYear: 2000,
    };
    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.Specification === null) {
                item.Specification = ' '
            } if (item.Plants === '-') {
                item.Plants = ' '
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={Sob}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }
    /**
                * @method toggleExtraData
                * @description Handle specific module tour state to display lorem data
                */
    const toggleExtraData = (showTour) => {
        setState((prevState) => ({ ...prevState, render: true }));
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
        }, 100);
    }
    const onFilterTextBoxChanged = (e) => {
        state.gridApi.setQuickFilter(e.target.value);
    }

    /**
     * @method effectiveDateFormatter
     * @description Renders buttons
     */
    const effectiveDateFormatter = (props) => {
        if (state?.showExtraData && props?.rowIndex === 0) {
            return "Lorem Ipsum";
        } else {
            const cellValue = props?.valueFormatted
                ? props.valueFormatted
                : props?.value;

            return cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
        }
    };


    const resetState = () => {
        state.gridApi.setQuickFilter(null)
        state.gridApi.deselectAll()
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        if (searchRef.current) {
            searchRef.current.value = '';
        }
        setState((prevState) => ({ ...prevState, noData: false }))
    }
    const handleShown = () => {
        setState((prevState) => ({ ...prevState, shown: !state.shown }))
    }

    const commonCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }

    const { isOpen, isEditFlag, noData } = state;

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    }
    /**
        * @method buttonFormatter
        * @description Renders buttons
        */
    const buttonFormatter = (params) => {

        const cellValue = params?.valueFormatted ? params.valueFormatted : params?.value;
        return (
            <>
                {permissions.Edit && <Button id={`clientListing_edit${props.rowIndex}`} className={"Edit Tour_List_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue)} title={"Edit"} />
                }
            </>
        );
    };
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        costingHeadFormatter: costingHeadFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        commonCostFormatter: commonCostFormatter
    };

    return (
        <div className={`ag-grid-react ${permissions.Download ? "show-table-btn" : ""} min-height100vh`}>
            {state.isLoader && <LoaderCustom />}
            <form noValidate>
                <Row className="pt-4 ">


                    <Col md="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            {state.shown ? (
                                <button type="button" className="user-btn filter-btn-top" onClick={handleShown()} >
                                    <div className="cancel-icon-white"></div></button>
                                // <Button id={"sobListing_close"} className="user-btn filter-btn-top" onClick={handleShown()} icon={"cancel-icon-white"} />
                            ) : (
                                <>
                                </>
                            )}
                            {
                                permissions.Download &&
                                <>
                                    <ExcelFile filename={Sob} fileExtension={'.xls'}
                                        element={
                                            <Button id={"Excel-Downloads-sobListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                                        }>
                                        {onBtExport()}
                                    </ExcelFile>
                                </>
                            }
                            <Button
                                id={"sobListing_refresh"} className="user-btn Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                        </div>
                    </Col>
                </Row>

            </form>
            <Row>
                <Col>
                    <div className={`ag-grid-wrapper height-width-wrapper ${(getViewBoughtOutParts && getViewBoughtOutParts?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                        <div className="ag-grid-header">
                            <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            <TourWrapper
                                buttonSpecificProp={{ id: "SOB_listing_Tour", onClick: toggleExtraData }}
                                stepsSpecificProp={{
                                    steps: Steps(t, { addLimit: false, filterButton: false, addButton: false, bulkUpload: false, downloadButton: true, viewButton: false, EditButton: true, DeleteButton: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                }} />
                        </div>
                        <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={state.showExtraData && getViewBoughtOutParts ? [...setLoremIpsum(getViewBoughtOutParts[0]), ...getViewBoughtOutParts] : getViewBoughtOutParts}
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
                                rowSelection={'multiple'}
                                onSelectionChanged={onRowSelect}
                                onFilterModified={onFloatingFilterChanged}
                                suppressRowClickSelection={true}
                            >
                                {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                <AgGridColumn field="BoughtOutPartNumber" headerName={`${showBopLabel()} Part No.`}></AgGridColumn>
                                <AgGridColumn field="BoughtOutPartName" headerName={`${showBopLabel()} Part Name`}></AgGridColumn>
                                <AgGridColumn field="BoughtOutPartCategoryName" headerName={`${showBopLabel()} Category`}></AgGridColumn>
                                <AgGridColumn field="BoughtOutPartEntryType" headerName="Entry Type" cellRenderer={'hyphenFormatter'}></AgGridColumn>

                            </AgGridReact>
                            {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
                        </div>
                    </div>

                </Col>
            </Row>


        </div >
    );
};

export default BOPManage