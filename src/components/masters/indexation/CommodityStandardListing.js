import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { deleteCommodityStandard, getCommodityStandardList } from "../actions/Indexation";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { searchNocontentFilter } from "../../../helper";
import Button from "../../layout/Button";
import { ApplyPermission } from ".";
import { useTranslation } from "react-i18next";
// import { COMMODITYSTANDARD_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { RmMaterial } from "../../../config/constants";
import ReactExport from "react-export-excel";
import { disabledClass } from '../../../actions/Common';
import WarningMessage from '../../common/WarningMessage';
import { resetStatePagination, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import PaginationControls from "../../common/Pagination/PaginationControls";
import BulkUpload from "../../massUpload/BulkUpload";
import Toaster from "../../common/Toaster";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import _ from "lodash";
import { COMMODITYSTANDARD_DOWNLOAD_EXCEl } from "../../../config/masterData";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const CommodityStandardListing = (props) => {
    const dispatch = useDispatch();
    const { commodityStandardDataList } = useSelector((state) => state?.indexation);
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
        selectedRowData: false,
        render: false,
        showExtraData: false
    });

    const [warningMessage, setWarningMessage] = useState(false)
    const [disableDownload, setDisableDownload] = useState(false)
    const [floatingFilterData, setFloatingFilterData] = useState({ IndexExchangeName: '' })
    const [isLoader, setIsLoader] = useState(false);
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [filterModel, setFilterModel] = useState({});
    const { globalTakes } = useSelector((state) => state?.pagination)
    const [gridApi, setGridApi] = useState(null);
    const [dataCount, setDataCount] = useState(0)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true)
    const [noData, setNoData] = useState(false)
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    useEffect(() => {
        getTableListData();
    }, []);
    useEffect(() => {
        if (commodityStandardDataList?.length > 0) {
            setTotalRecordCount(commodityStandardDataList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }

    }, [commodityStandardDataList])
    const getTableListData = (skip = 0, take = 10, isPagination = true) => {
        if (isPagination === true || isPagination === null) setIsLoader(true)
        let dataObj = { ...floatingFilterData }
        dispatch(getCommodityStandardList(dataObj, isPagination, skip, take, (res) => {
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
                    let button = document.getElementById('Excel-Downloads-comodityStandard')
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

    const closeDrawer = (e = "", formData, type) => {
        setState((prevState) => ({
            ...prevState, isOpen: false, isLoader: type === "submit" ? true : prevState.isLoader, dataCount: type === "submit" ? 0 : prevState.dataCount,
        }));
        if (type === "submit") {
            getTableListData();
        }
    };
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (commodityStandardDataList?.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
        setDisableFilter(false)
        const model = gridOptions?.api?.getFilterModel();
        setFilterModel(model)
        if (!isFilterButtonClicked) {
            setWarningMessage(true)
        }

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            let isFilterEmpty = true
            if (model !== undefined && model !== null) {
                if (Object.keys(model).length > 0) {
                    isFilterEmpty = false
                    for (var property in floatingFilterData) {
                        if (property === value.column.colId) {
                            floatingFilterData[property] = ""
                        }
                    }
                    setFloatingFilterData(floatingFilterData)
                }

                if (isFilterEmpty) {
                    setWarningMessage(false)
                    for (var prop in floatingFilterData) {
                        floatingFilterData[prop] = ""
                    }
                    setFloatingFilterData(floatingFilterData)
                }
            } else {
                setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
            }

        } else {

            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }

    const toggleExtraData = (showTour) => {
        setState((prevState) => ({ ...prevState, render: true, showExtraData: showTour }));
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, render: false }));
        }, 100);
    }
    const onPopupConfirm = () => {
        confirmDelete(state?.deletedId);
    };
    const confirmDelete = (ID) => {
        dispatch(
            deleteCommodityStandard(ID, (res) => {
                if (res.status === 417 && res.data.Result === false) {
                    Toaster.error(res.data.Message);
                } else if (res && res.data && res.data.Result === true) {
                    Toaster.success(MESSAGES.INDEX_DELETE_SUCCESS);
                    setState((prevState) => ({ ...prevState, dataCount: 0 }));
                    getTableListData();
                }
            })
        );
        setState((prevState) => ({ ...prevState, showPopup: false }));
    };
    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }));
    };

    const openModel = () => {
        setState((prevState) => ({
            ...prevState, isOpen: true, isEditFlag: false,
        }));
    };

    const deleteItem = (Id) => {
        setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
    };
    const buttonFormatter = (props) => {

        const { showExtraData } = state
        const cellValue = props?.valueFormatted
            ? props.valueFormatted
            : props?.value;
        const rowData = props?.data?.CommodityStandardId
        let isEditbale = false
        let isDeleteButton = false
        isEditbale = permissions.Edit;
        isDeleteButton = (showExtraData && props.rowIndex === 0) || (permissions.Delete && !props?.data.IsAssociated);

        return (
            <>

                {isDeleteButton && (
                    <Button
                        title="Delete"
                        variant="Delete"
                        className={"Tour_List_Delete"}
                        id={`rmDetailList_delete${props?.rowIndex}`}
                        onClick={() => deleteItem(rowData)}
                    />
                )}
            </>
        );
    };
    /**
     * @method hyphenFormatter
     */
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
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }));
        params.api.paginationGoToPage(0);
    };


    const onRowSelect = (event) => {
        let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
        var selectedRows = gridApi && gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        }
        // else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA
        //     let finalData = []
        //     if (event.node?.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

        //         for (let i = 0; i < selectedRowForPagination.length; i++) {
        //             if (selectedRowForPagination[i].CommodityIndexRateDetailId === event.data.CommodityIndexRateDetailId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
        //                 continue;
        //             }
        //             finalData.push(selectedRowForPagination[i])
        //         }

        //     } else {
        //         finalData = selectedRowForPagination
        //     }
        //     selectedRows = [...selectedRows, ...finalData]

        // }
        let uniqeArray = _.uniqBy(selectedRows, "CommodityStandardId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray }) //SETTING CHECKBOX STATE DATA IN LOCAL STORAGE
        setDataCount(uniqeArray.length)
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER

    }
    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.CommodityStandardId === props.node.data.CommodityStandardId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    };

    const resetState = () => {
        setNoData(false)
        setIsFilterButtonClicked(false)
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""

        }
        setFloatingFilterData(floatingFilterData)
        dispatch(updateCurrentRowIndex(0))

        setWarningMessage(false)
        dispatch(resetStatePagination())
        // getTableListData(0, globalTakes, true)
        getTableListData(0, defaultPageSize, true)
        dispatch(updateGlobalTake(10))
        setDataCount(0)
        dispatch(setSelectedRowForPagination([]))
        reactLocalStorage.setObject('selectedRow', {})
        gridApi.deselectAll()
    }
    const { isOpen, isEditFlag, ID, showExtraData, render, isBulkUpload } = state;
    const onSearch = () => {
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(10))
        gridOptions?.columnApi?.resetColumnState();
        getTableListData(0, globalTakes, true)
    }
    const bulkToggle = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: true }));
    };
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
        checkBoxRenderer: checkBoxRenderer
    };

    const onBtExport = () => {
        let tempArr = [];
        tempArr = gridApi && gridApi?.getSelectedRows();
        tempArr =
            tempArr && tempArr.length > 0
                ? tempArr
                : commodityStandardDataList
                    ? commodityStandardDataList
                    : [];

        return returnExcelColumn(COMMODITYSTANDARD_DOWNLOAD_EXCEl, tempArr);
    };
    const closeBulkUploadDrawer = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: false }));
        resetState()
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
    const onExcelDownload = () => {
        setDisableDownload(true)
        dispatch(disabledClass(true))
        //let tempArr = gridApi && gridApi?.getSelectedRows()
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-comodityStandard')
                button && button.click()
            }, 400);


        } else {

            getTableListData(0, globalTakes, false) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }
    return (

        <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} `}>

            {isLoader && <LoaderCustom />}
            <Row className="pt-4">
                <Col md={9} className="search-user-block mb-3 pl-0">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            <Button id="rmDetailList_filter" className={"mr5"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
                        </div>
                        {permissions.BulkUpload && (<Button id="rmDetail_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}

                        {/* {permissions.Add && (
                            <Button id="rmDetailList_addCommodity" className="mr5 Tour_List_AdCommodity" onClick={openModel} title="Add" icon={"plus"} />
                        )} */}
                        {permissions.Download && (
                            
                                <>

                                    <Button
                                        className="mr5 Tour_List_Download"
                                        id={"comodityStandard_excel_download"}
                                        onClick={onExcelDownload}
                                        title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                        icon={"download mr-1"}
                                        buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                    />
                                    <ExcelFile filename={"Commodity Name (Standard)"}

                                        fileExtension={'.xls'} element={
                                            <Button id={"Excel-Downloads-comodityStandard"} className="p-absolute" />

                                        }>
                                        {onBtExport()}
                                    </ExcelFile>
                                </>
                            
                        )}
                        <Button id={"rmDetail_refresh"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
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
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className={`ag-theme-material ${isLoader && "max-loader-height"
                                }`}
                        >
                            {noData && (
                                <NoContentFound
                                    title={EMPTY_DATA}
                                    customClassName="no-content-found"
                                />
                            )}
                            {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout="autoHeight"
                                // columnDefs={c}
                                rowData={commodityStandardDataList}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
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
                                <AgGridColumn cellClass='has-checkbox' cellRenderer={checkBoxRenderer} field="CommodityStandardName" headerName="Commodity Name (Standard)"></AgGridColumn>
                                <AgGridColumn field="MaterialId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
                            </AgGridReact>}

                            <div className={`button-wrapper`}>
                                {!isLoader && <PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="IndexData" />}
                                <PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="IndexData" />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* {isOpen && (<AddStandardization isEditFlag={isEditFlag} isOpen={isOpen} closeDrawer={closeDrawer} anchor={"right"} />)} */}

            {state?.showPopup && (
                <PopupMsgWrapper
                    isOpen={state?.showPopup}
                    closePopUp={closePopUp}
                    confirmPopup={onPopupConfirm}
                    message={`${MESSAGES.DELETE}`}
                />
            )}
            {isBulkUpload && (
                <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={"Commodity Standard"}
                    messageLabel={"Commodity Standard"}
                    anchor={"right"}
                />
            )}
        </div>
    );
};

export default CommodityStandardListing;
