import React, { useState, useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import {
    deleteMaterialTypeAPI,
} from "../actions/Material";
import { deleteIndexData, getCommodityIndexDataListAPI } from "../actions/Indexation";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { PaginationWrapper } from "../../common/commonPagination";
import { searchNocontentFilter, setLoremIpsum } from "../../../helper";
import Button from "../../layout/Button";
import { ApplyPermission } from ".";
import { useRef } from "react";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { resetStatePagination, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import { INDEXCOMMODITYlISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { RmMaterial } from "../../../config/constants";
import ReactExport from "react-export-excel";
import BulkUpload from "../../massUpload/BulkUpload";
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import PaginationControls from "../../common/Pagination/PaginationControls";
import WarningMessage from '../../common/WarningMessage';
import { disabledClass } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import AddGrade from "../material-master/AddGrade";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const IndexListing = () => {
    const dispatch = useDispatch();
    const searchRef = useRef(null);
    const { indexCommodityDataList } = useSelector((state) => state.indexation);
    const { globalTakes } = useSelector((state) => state.pagination)
    const permissions = useContext(ApplyPermission);
    const { t } = useTranslation("common")

    const [state, setState] = useState({
        isOpen: false,
        isEditFlag: false,
        ID: "",
        gridApi: null,
        gridColumnApi: null,
        rowData: null,
        showPopup: false,
        deletedId: "",
        isLoader: false,
        selectedRowData: false,
        noData: false,
        dataCount: 0,
        render: false,
        showExtraData: false,
        isBulkUpload: false,
    });
    const [floatingFilterData, setFloatingFilterData] = useState({ commodityExchangeName: '' })
    const [isLoader, setIsLoader] = useState(false);
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [filterModel, setFilterModel] = useState({});
    const [warningMessage, setWarningMessage] = useState(false)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [noData, setNoData] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true)
    const [disableDownload, setDisableDownload] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [dataCount, setDataCount] = useState(0)
    const [gridLoad, setGridLoad] = useState(false);
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    useEffect(() => {
        getTableListData(0, defaultPageSize, true)
        return () => {
            dispatch(setSelectedRowForPagination([]))
            dispatch(resetStatePagination());

        }
    }, [])
    useEffect(() => {
        if (indexCommodityDataList?.length > 0) {
            setTotalRecordCount(indexCommodityDataList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }
    }, [indexCommodityDataList])

    const getTableListData = (skip = 0, take = 10, isPagination = true) => {
        if (isPagination === true || isPagination === null) setIsLoader(true)
        let dataObj = { ...floatingFilterData }
        dispatch(getCommodityIndexDataListAPI(dataObj, isPagination, skip, take, false, (res) => {
            if (isPagination === true || isPagination === null) setIsLoader(false)
            if ((res && res.status === 204) || res.length === 0) {
                setTotalRecordCount(0)
                dispatch(updatePageNumber(0))
                // setPageNo(0)
            }
            if (res && isPagination === false) {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-outsourcing')
                    button && button.click()
                }, 500);
            }
            if (res) {
                let isReset = true
                setTimeout(() => {
                    for (var prop in floatingFilterData) {
                        if (floatingFilterData[prop] !== "") {
                            isReset = false
                        }
                    }
                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))

                }, 300);

                setTimeout(() => {
                    setWarningMessage(false)
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }))
    }

    /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (indexCommodityDataList?.length !== 0) {
                const newNoData = searchNocontentFilter(value, noData);
                setNoData(newNoData);
            }
        }, 500);
    
        setDisableFilter(false);
    
        const model = gridOptions?.api?.getFilterModel();
        setFilterModel(model);
    
        if (!isFilterButtonClicked) {
            setWarningMessage(true);
        }
    
        // Only reset if all the filters are cleared manually, not when applying a valid filter.
        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            let isFilterEmpty = Object.keys(model).length === 0; // Check if the model is empty
    
            if (!isFilterEmpty) {
                // Update the specific floating filter data for the column being changed
                setFloatingFilterData({ 
                    ...floatingFilterData, 
                    [value.column.colId]: "" 
                });
            } else {
                setWarningMessage(false);
    
                // Reset all filters if everything is cleared
                const clearedFilters = Object.keys(floatingFilterData).reduce((acc, key) => {
                    acc[key] = ""; // Reset all floating filters
                    return acc;
                }, {});
                
                setFloatingFilterData(clearedFilters);
            }
        } else {
            setFloatingFilterData({
                ...floatingFilterData,
                [value.column.colId]: value.filterInstance.appliedModel.filter
            });
        }
    };
    
    
    const onSearch = () => {
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(10))
        gridOptions?.columnApi?.resetColumnState();
        getTableListData(0, globalTakes, true)
    }

    const deleteItem = (Id) => {
        setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
    };

    const confirmDelete = (ID) => {
        dispatch(
            deleteIndexData(ID, (res) => {
                if (res && res.data && res.data.Result === true) {
                    Toaster.success(MESSAGES.INDEX_DELETE_SUCCESS);
                    setState((prevState) => ({ ...prevState, dataCount: 0 }));
                    getTableListData();
                }
            })
        );
        setState((prevState) => ({ ...prevState, showPopup: false }));
    };

    const toggleExtraData = (showTour) => {
        setState((prevState) => ({ ...prevState, render: true, showExtraData: showTour }));
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, render: false }));
        }, 100);
    }
    const onPopupConfirm = () => {
        confirmDelete(state.deletedId);
    };

    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }));
    };

    const openModel = () => {
        setState((prevState) => ({
            ...prevState, isOpen: true, isEditFlag: false,
        }));
    };
    const editItemDetails = useCallback((Id) => {
        setState((prev) => ({
            ...prev, isEditFlag: true, isOpen: true, ID: Id
        }));
    }, []);
    const buttonFormatter = (props) => {
        const { showExtraData } = state
        const cellValue = props?.valueFormatted
            ? props.valueFormatted
            : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let isEditbale = false
        let isDeleteButton = false
        isEditbale = permissions.Edit;
        // isDeleteButton = (showExtraData && props.rowIndex === 0) || (permissions.Delete);
        if (showExtraData && props.rowIndex === 0) {
            isDeleteButton = true
        } else {
            if (permissions.Delete && !rowData.IsAssociated) {
                isDeleteButton = true
            }
        }

        return (
            <>
                {isEditbale && (
                    <Button
                        id={`rmSpecification_edit${props.rowIndex}`}
                        className={"mr-1 Tour_List_Edit"}
                        variant="Edit"
                        onClick={() => editItemDetails(cellValue)}
                        title={"Edit"}
                    />
                )}
                {isDeleteButton && (
                    <Button
                        title="Delete"
                        variant="Delete"
                        className={"Tour_List_Delete"}
                        id={`index_delete${props?.rowIndex}`}
                        onClick={() => deleteItem(cellValue)}
                    />
                )}
            </>
        );
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue !== " " &&
            cellValue !== null &&
            cellValue !== "" &&
            cellValue !== undefined
            ? cellValue
            : "-";
    };

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }));
        params.api.paginationGoToPage(0);
        setGridApi(params.api)
    };

    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onRowSelect = () => {
        const selectedRows = state.gridApi?.getSelectedRows();
        setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length, }));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        setNoData(false)
        setIsFilterButtonClicked(false)
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""

        }
        dispatch(updateCurrentRowIndex(10));

        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        dispatch(resetStatePagination())
        getTableListData(0, 10, true)
        dispatch(updateGlobalTake(10))
        setDataCount(0)
        reactLocalStorage.setObject('selectedRow', {})
        gridApi.deselectAll()
    }

    const { isOpen, isEditFlag, ID, showExtraData, render, isBulkUpload } = state;

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    };
    const defaultColDef = {
        resizable: true,
        filter: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn,
    };
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        hyphenFormatter: hyphenFormatter,
        customNoRowsOverlay: NoContentFound,
    };

    const onBtExport = () => {
        let tempArr = [];
        tempArr = state.gridApi && state.gridApi?.getSelectedRows();
        tempArr =
            tempArr && tempArr.length > 0
                ? tempArr
                : indexCommodityDataList
                    ? indexCommodityDataList
                    : [];
        return returnExcelColumn(INDEXCOMMODITYlISTING_DOWNLOAD_EXCEl, tempArr);
    };
    const bulkToggle = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: true }));
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = [];
        temp =
            TempData &&
            TempData.map((item) => {
                if (item.RMName === "-") {
                    item.RMName = " ";
                }
                if (item.RMGrade === "-") {
                    item.RMGrade = " ";
                }
                return item;
            });
        return (
            <ExcelSheet data={temp} name={RmMaterial}>
                {data &&
                    data.map((ele, index) => (
                        <ExcelColumn
                            key={index}
                            label={ele.label}
                            value={ele.value}
                            style={ele.style}
                        />
                    ))}
            </ExcelSheet>
        );
    };
    const closeBulkUploadDrawer = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: false }));
        getTableListData("", "");
    };

    const closeDrawer = (e = "", formData, type) => {
        setState((prevState) => ({
            ...prevState, isOpen: false, dataCount: type === "submit" ? 0 : prevState.dataCount,
        }));
        if (type === "submit") {
            getTableListData();
        }
    };
    const onExcelDownload = () => {
        setDisableDownload(true)
        dispatch(disabledClass(true))
        //let tempArr = gridApi && gridApi?.getSelectedRows()
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-rm-import')
                button && button.click()
            }, 400);


        } else {

            getTableListData(0, globalTakes, false) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }
    return (
        <div
            className={`ag-grid-react min-height100vh ${permissions.Download ? "show-table-btn" : ""
                }`}
        >
            {state.isLoader && <LoaderCustom customClass="loader-center" />}
            <Row className="pt-4">
                <Col md={9} className="search-user-block mb-3 pl-0">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            <Button id="indexListing_filter" className={"mr5"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
                        </div>
                        {permissions.BulkUpload && (<Button id="index_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}
                        {permissions.Add && (
                            <Button id="add_index" className="mr5 Tour_List_AdCommodity" onClick={openModel} title="Add" icon={"plus"} />
                        )}
                        {permissions.Download && (
                            <>
                                <>
                                    <ExcelFile
                                        filename={"Index"}
                                        fileExtension={".xls"}
                                        element={
                                            <Button onClick={onExcelDownload} id={"Excel-Downloads-index"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                                        }
                                    >
                                        {onBtExport()}
                                    </ExcelFile>
                                </>
                            </>
                        )}
                        <Button id={"index_refresh"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                    </div>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div
                        className={`ag-grid-wrapper height-width-wrapper ${true
                            ? "overlay-contain"
                            : ""
                            }`}
                    >
                        {/* {gridLoad && <div className={`ag-grid-wrapper height-width-wrapper  ${(indexCommodityDataList && indexCommodityDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}> */}

                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                            {noData && (
                                <NoContentFound
                                    title={EMPTY_DATA}
                                    customClassName="no-content-found"
                                />
                            )}
                            <AgGridReact

                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout="autoHeight"
                                rowData={indexCommodityDataList}
                                pagination={true}
                                paginationPageSize={globalTakes}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={"customNoRowsOverlay"}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: "imagClass",
                                }}
                                rowSelection={"multiple"}
                                frameworkComponents={frameworkComponents}
                                onSelectionChanged={onRowSelect}
                                onFilterModified={onFloatingFilterChanged}
                                suppressRowClickSelection={true}
                            >
                                <AgGridColumn field="IndexExchangeName" headerName="Name"></AgGridColumn>
                                <AgGridColumn field="IndexExchangeId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
                            </AgGridReact>

                            {<PaginationWrappers gridApi={state.gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="IndexCommodity" />}
                        </div>
                    </div>
                </Col>
            </Row>
            {state.isOpen && (
                <AddGrade
                    isOpen={state.isOpen}
                    closeDrawer={closeDrawer}
                    isEditFlag={isEditFlag}
                    // RawMaterial={this.state.RawMaterial}
                    // ID={this.state.Id}
                    anchor={"right"}
                    // specificationId={this.state.specificationId}
                    isShowIndex={true}
                    ID={state.ID}

                />
            )}
            {state.showPopup && (
                <PopupMsgWrapper
                    isOpen={state.showPopup}
                    closePopUp={closePopUp}
                    confirmPopup={onPopupConfirm}
                    message={`${MESSAGES.INDEX_DELETE_ALERT}`}
                />
            )}
            {isBulkUpload && (
                <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={"Index"}
                    messageLabel={"Index"}
                    anchor={"right"}
                />
            )}
        </div>
    );
};

export default IndexListing;
