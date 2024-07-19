import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { deleteIndexCommodityLinking, getCommodityInIndexDataListAPI } from "../actions/Indexation";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { searchNocontentFilter } from "../../../helper";
import Button from "../../layout/Button";
import { ApplyPermission } from ".";
import { useRef } from "react";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { COMMODITYININDEXlISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { RmMaterial } from "../../../config/constants";
import WarningMessage from '../../common/WarningMessage';
import ReactExport from "react-export-excel";
import BulkUpload from "../../massUpload/BulkUpload";
import { resetStatePagination, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import { disabledClass } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import PaginationControls from "../../common/Pagination/PaginationControls";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import _ from "lodash";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const CommodityInIndexListing = (props) => {
    const dispatch = useDispatch();
    const searchRef = useRef(null);
    const { commodityInIndexDataList } = useSelector((state) => state.indexation);
    const { selectedRowForPagination } = useSelector((state => state.simulation))

    const permissions = useContext(ApplyPermission);
    const { t } = useTranslation("common")

    const [state, setState] = useState({
        isOpen: false,
        isEditFlag: false,
        ID: "",
        gridColumnApi: null,
        rowData: null,
        showPopup: false,
        deletedId: "",
        selectedRowData: false,
        render: false,
        showExtraData: false,
        isBulkUpload: false,
    });
    const [floatingFilterData, setFloatingFilterData] = useState({ IndexExchangeName: '', CommodityName: '' })
    const [isLoader, setIsLoader] = useState(false);
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [filterModel, setFilterModel] = useState({});
    const [warningMessage, setWarningMessage] = useState(false)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [noData, setNoData] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true)
    const [disableDownload, setDisableDownload] = useState(false)
    const { globalTakes } = useSelector((state) => state.pagination)
    const [gridApi, setGridApi] = useState(null);
    const [dataCount, setDataCount] = useState(0)

    useEffect(() => {
        if (commodityInIndexDataList?.length > 0) {
            setTotalRecordCount(commodityInIndexDataList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }

    }, [commodityInIndexDataList])
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (commodityInIndexDataList?.length !== 0) {
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

    const editItemDetails = (Id) => {
        setState((prevState) => ({
            ...prevState, isEditFlag: true, isOpen: true, ID: Id,
        }));
    };

    const deleteItem = (Id) => {
        setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
    };

    const confirmDelete = (ID) => {
        dispatch(
            deleteIndexCommodityLinking(ID, (res) => {
                if (res.data.Result === false) {
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


    const buttonFormatter = (props) => {
        const { showExtraData } = state
        const rowData = props?.data;

        let isEditbale = false
        let isDeleteButton = false
        isEditbale = permissions.Edit;
        isDeleteButton = (showExtraData && props.rowIndex === 0) || (permissions.Delete && !rowData.IsAssociated);

        return (
            <>
                {isDeleteButton && (
                    <Button
                        title="Delete"
                        variant="Delete"
                        className={"Tour_List_Delete"}
                        id={`addSpecificationList_delete${props?.rowIndex}`}
                        onClick={() => deleteItem(rowData?.IndexExchangeCommodityLinkingId)}
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

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
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
        //             if (selectedRowForPagination[i].IndexExchangeCommodityLinkingId === event.data.IndexExchangeCommodityLinkingId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
        //                 continue;
        //             }
        //             finalData.push(selectedRowForPagination[i])
        //         }

        //     } else {
        //         finalData = selectedRowForPagination
        //     }
        //     selectedRows = [...selectedRows, ...finalData]

        // }
        let uniqeArray = _.uniqBy(selectedRows, "IndexExchangeCommodityLinkingId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray }) //SETTING CHECKBOX STATE DATA IN LOCAL STORAGE
        setDataCount(uniqeArray.length)
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER

    }
    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.IndexExchangeCommodityLinkingId === props.node.data.IndexExchangeCommodityLinkingId) {
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
    useEffect(() => {
        getTableListData(0, defaultPageSize, true)
        return () => {
            ///dispatch(setSelectedRowForPagination([]))
            dispatch(resetStatePagination());

        }
    }, [])


    const resetState = () => {
        setNoData(false)
        setIsFilterButtonClicked(false)
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""

        }
        dispatch(updateCurrentRowIndex(10))
        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        dispatch(resetStatePagination())
        getTableListData(0, 10, true)
        dispatch(updateGlobalTake(10))
        setDataCount(0)
        reactLocalStorage.setObject('selectedRow', {})
        dispatch(setSelectedRowForPagination([]))
        gridApi.deselectAll()
    }

    const { isOpen, isEditFlag, ID, showExtraData, render, isBulkUpload } = state;

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    };

    const getTableListData = (skip = 0, take = 10, isPagination = true) => {
        if (isPagination === true || isPagination === null) setIsLoader(true)
        let dataObj = { ...floatingFilterData }
        dispatch(getCommodityInIndexDataListAPI(dataObj, isPagination, skip, take, (res) => {
            if (isPagination === true || isPagination === null) { setIsLoader(false) }
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
                : commodityInIndexDataList
                    ? commodityInIndexDataList
                    : [];
        return returnExcelColumn(COMMODITYININDEXlISTING_DOWNLOAD_EXCEl, tempArr);
    };

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
        getTableListData(0, defaultPageSize, true)
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

            getTableListData(0, globalTakes, false)// FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }
    return (

        <div className={`ag-grid-react {permissions.Download ? "show-table-btn" : ""
                } ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} `}>

            {isLoader && <LoaderCustom />}
            <Row className="pt-4">
                <Col md={9} className="search-user-block mb-3 pl-0">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            <Button id="outsourcingListing_filter" className={"mr5"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
                        </div>
                        {permissions.BulkUpload && (<Button id="rmSpecification_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}

                        {permissions.Download && (
                            <>
                                <>
                                    <ExcelFile
                                        filename={"Index Commodity"}
                                        fileExtension={".xls"}
                                        element={
                                            <Button onClick={onExcelDownload} id={"Excel-Downloads-Rm Material"} title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} type="button" className={'user-btn mr5 Tour_List_Download'} icon={"download mr-1"} buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} />
                                        }
                                    >
                                        {onBtExport()}
                                    </ExcelFile>
                                </>
                            </>
                        )}
                        <Button id={"rmSpecification_refresh"} className={" Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
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
                            <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                            <TourWrapper
                                buttonSpecificProp={{ id: "RM_Listing_Tour", onClick: toggleExtraData }}
                                stepsSpecificProp={{
                                    steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, bulkUpload: false, addButton: false, filterButton: false, costMovementButton: false, viewButton: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                }}
                            />
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
                                rowData={commodityInIndexDataList}
                                // pagination={true}
                                // paginationPageSize={globalTakes}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                // loadingOverlayComponent={'customLoadingOverlay'}
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
                                <AgGridColumn cellClass='has-checkbox' field="IndexExchangeName" cellRenderer={checkBoxRenderer} headerName="Index"></AgGridColumn>
                                <AgGridColumn field="CommodityName" headerName="Commodity name"></AgGridColumn>
                                <AgGridColumn field="MaterialId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>
                            </AgGridReact>}
                            <div className='button-wrapper'>
                                {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="CommodityInIndex" />}
                                {!isLoader &&
                                    <PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="CommodityInIndex" />

                                }

                            </div>

                        </div>
                    </div>
                </Col>
            </Row>

            {state.showPopup && (
                <PopupMsgWrapper
                    isOpen={state.showPopup}
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
                    fileName={"Commodity (In Index)"}
                    messageLabel={"Commodity (In Index)"}
                    anchor={"right"}
                />
            )}
        </div>
    );
};

export default CommodityInIndexListing;
