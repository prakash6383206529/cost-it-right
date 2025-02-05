import React, { useState, useEffect, useContext, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import LoaderCustom from "../../common/LoaderCustom";
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDetails } from "../../../helper";
import Button from "../../layout/Button";
import { ApplyPermission } from ".";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { RMMATERIALISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import { RmMaterial } from "../../../config/constants";
import ReactExport from "react-export-excel";
import BulkUpload from "../../massUpload/BulkUpload";
import { resetStatePagination, updatePageSize, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import WarningMessage from '../../common/WarningMessage';
import { disabledClass } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PaginationWrappers } from "../../common/Pagination/PaginationWrappers";
import PaginationControls from "../../common/Pagination/PaginationControls";
import { deleteIndexDetailData, getIndexDataListAPI } from "../actions/Indexation";
import AddRMDrawer from "../material-master/AddRMDrawer";
import DayTime from "../../common/DayTimeWrapper";
import { setSelectedRowForPagination } from "../../simulation/actions/Simulation";
import _ from "lodash";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
const IndexDataListing = (props) => {

    const dispatch = useDispatch();
    const { rmIndexDataList } = useSelector((state) => state?.indexation);

    const permissions = useContext(ApplyPermission);
    const { globalTakes } = useSelector((state) => state?.pagination)
    const { t } = useTranslation("common")
    const searchRef = useRef(null);

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
    const { selectedRowForPagination } = useSelector((state => state.simulation))

    const [floatingFilterData, setFloatingFilterData] = useState({
        IndexExchangeName: '',
        CommodityName: '',
        CommodityStandardName: '',
        IndexUOM: '',
        ConvertedUOM: '',
        FromCurrency: '',
        ToCurrency: '',
        RatePerIndexUOM: '',
        ExchangeRateSourceName: '',
        ExchangeRate: '',
        EffectiveDate: '',
        RatePerConvertedUOM: '',
        RateConversionPerIndexUOM: '',
        RateConversionPerConvertedUOM: ''
    });

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
    useEffect(() => {
        getTableListData(0, defaultPageSize, true)
        return () => {
            dispatch(setSelectedRowForPagination([]))

            dispatch(resetStatePagination());
            reactLocalStorage.setObject('selectedRow', {})


        }
    }, [])
    useEffect(() => {
        if (rmIndexDataList?.length > 0) {
            setTotalRecordCount(rmIndexDataList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }

    }, [rmIndexDataList])
    const getTableListData = (skip = 0, take = 10, isPagination = true) => {
        if (isPagination === true) { setIsLoader(true) }
        let dataObj = { ...floatingFilterData }
        dispatch(getIndexDataListAPI(dataObj, isPagination, skip, take, (res) => {
            if (isPagination === true || isPagination === null) setIsLoader(false)
            if ((res && res.status === 204) || res.length === 0) {
                setTotalRecordCount(0)
                dispatch(updatePageNumber(0))
            }
            if (res && !isPagination) {
                setDisableDownload(false);
                dispatch(disabledClass(false));
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-indexDataList');
                    button && button.click();
                }, 500);
            }
            if (res) {
                // Update local state if needed
                // setRmIndexDataList(res);

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
     * @method closeDrawer
     * @description  used to cancel filter form
     */
    const closeDrawer = (e = "", formData, type) => {
        setState((prevState) => ({
            ...prevState,
            isOpen: false,
            isLoader: type === "submit" ? true : prevState.isLoader,
            dataCount: type === "submit" ? 0 : prevState.dataCount,
        }));

        if (type === "submit") {
            getTableListData(0, defaultPageSize, true);
        }
    };

    /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (rmIndexDataList.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
                setTotalRecordCount(gridApi?.getDisplayedRowCount())
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
                        // Add this check if applicable to Indexation
                        // if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                        if (prop !== "DepartmentName") {
                            floatingFilterData[prop] = ""
                        }
                        // } 
                        else {
                            floatingFilterData[prop] = ""
                        }
                    }
                    setFloatingFilterData(floatingFilterData)
                }
            }
        } else {
            if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
                return false
            }
            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }

    /**
     * @method deleteItem
     * @description confirm delete Raw Material
     */
    const deleteItem = (Id) => {
        setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }));
    };

    const confirmDelete = (ID) => {
        let tempArr = [];
        let tempObj = {
            LoggedInUserId: userDetails().LoggedInUserId,
        }
        if (selectedRowForPagination && selectedRowForPagination.length > 0) {
            selectedRowForPagination.forEach(item => {
                const CommodityIndexRateDetailId = item.CommodityIndexRateDetailId;
                tempArr.push(CommodityIndexRateDetailId);
                tempObj.CommodityIndexRateDetailIds = tempArr
            });
        } else {
            tempObj.CommodityIndexRateDetailIds = [ID]
        }
        dispatch(
            deleteIndexDetailData(tempObj, (res) => {
                if (res && res.data && res.data.Result === true) {
                    Toaster.success(MESSAGES.INDEX_DELETE_SUCCESS);
                    setState((prevState) => ({ ...prevState, dataCount: 0 }));
                    // getTableListData();
                    setDataCount(0)
                    resetState()
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
        confirmDelete(state?.deletedId);
    };

    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }));
    };


    const buttonFormatter = (props) => {
        const { showExtraData } = state
        const rowData = props?.data?.CommodityIndexRateDetailId;
        let isEditable = false
        let isDeleteButton = false
        isEditable = permissions?.Edit;
        isDeleteButton = (showExtraData && props.rowIndex === 0) || (permissions?.Delete && !props?.data?.IsAssociated);

        return (
            <>
                {/* {isEditbale && (
                    <Button
                        title="Edit"
                        variant="Edit"
                        id={`rmMaterialList_edit${props?.rowIndex}`}
                        className="mr-2 Tour_List_Edit"
                        onClick={() => editItemDetails(cellValue, rowData)}
                    />
                )} */}
                {isDeleteButton && (
                    <Button
                        title="Delete"
                        variant="Delete"
                        className={"Tour_List_Delete"}
                        id={`rmMaterialList_edit_delete${props?.rowIndex}`}
                        onClick={() => deleteItem(rowData)}
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
        setGridApi(params.api);

        // params.api.sizeColumnsToFit();
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
        let uniqeArray = _.uniqBy(selectedRows, "CommodityIndexRateDetailId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray }) //SETTING CHECKBOX STATE DATA IN LOCAL STORAGE
        setDataCount(uniqeArray.length)
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
    }
    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.CommodityIndexRateDetailId === props.node.data.CommodityIndexRateDetailId) {
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
        setWarningMessage(false)
        dispatch(updateCurrentRowIndex(10));
        dispatch(setSelectedRowForPagination([]))

        dispatch(updatePageNumber(1));
        getTableListData(0, globalTakes, true)
        dispatch(updateGlobalTake(10))
        dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }));
        setDataCount(0)
        reactLocalStorage.setObject('selectedRow', {})
        if (searchRef.current) {
            searchRef.current.value = '';
        }
    }

    const onSearch = () => {
        setNoData(false)
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(10))
        gridOptions?.columnApi?.resetColumnState();
        getTableListData(0, globalTakes, true)
    }

    const { isOpen, isEditFlag, ID, showExtraData, isBulkUpload } = state;
    const isFirstColumn = (params) => {

        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }

    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: (props?.benchMark) ? isFirstColumn : false,

        checkboxSelection: isFirstColumn,
    };
    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>

                {cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''}
            </>
        )
    }
    /**
* @method effectiveDateFormatter
* @description Renders buttons
*/
    const effectiveDateFormatter = (props) => {


        if (showExtraData && props?.rowIndex === 0) {
            return "Lorem Ipsum";
        } else {
            const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
            return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
        }
    }
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        hyphenFormatter: hyphenFormatter,
        customNoRowsOverlay: NoContentFound,
        priceFormatter: priceFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        checkBoxRenderer: checkBoxRenderer,

    };
    const onBtExport = () => {
        let tempArr = selectedRowForPagination;
        let orignalCopyArr = _.cloneDeep(rmIndexDataList);
        tempArr = tempArr && tempArr.length > 0 ? tempArr : orignalCopyArr ? orignalCopyArr : [];
        return returnExcelColumn(RMMATERIALISTING_DOWNLOAD_EXCEl, tempArr);
    };
    const returnExcelColumn = (data = [], TempData) => {
        let temp = [];
        temp =
            TempData &&
            TempData.map((item) => {
                if (item.EffectiveDate?.includes('T')) {
                    item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
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
    const bulkToggle = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: true }));
    };
    const closeBulkUploadDrawer = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: false }));
        resetState()
    };
    const onExcelDownload = () => {
        setDisableDownload(true);
        dispatch(disabledClass(true));
        let tempArr = selectedRowForPagination;
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false);
                dispatch(disabledClass(false));
                let button = document.getElementById('Excel-Downloads-indexDataList');
                button && button.click();
            }, 400);
        } else {
            getTableListData(0, globalTakes, false);
        }
    };

    var setDate = (date) => {
        setFloatingFilterData((prevState) => ({ ...prevState, EffectiveDate: date }));
    };
    var filterParams = {
        date: "", comparator: function (filterLocalDateAtMidnight, cellValue) {


            var dateAsString = cellValue != null ? DayTime(cellValue).format("DD/MM/YYYY") : "";
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';

            setDate(newDate)

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

    return (
        <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} `}>

            {isLoader && <LoaderCustom customClass="loader-center" />}
            <Row className="pt-4">
                <Col md={9} className="search-user-block mb-3 pl-0">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            <Button id="rmMaerialListing_filter" className={"mr5"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
                        </div>
                        {/* {permissions?.Add && (
            <Button id="rmSpecification_addMaterial" className="mr5 Tour_List_AddMaterial" onClick={openModel} title="Add Material" icon={"plus mr-0 ml5"} buttonName="M" />
          )} */}
                        {permissions?.Delete && <Button
                            title={"Delete"}
                            // variant="Delete" 
                            className={"mr-1"}
                            icon={"delete-primary"}
                            id={`rmMaterialList_edit_delete${props?.rowIndex}`}
                            onClick={() => deleteItem(props?.rowIndex)}
                            buttonName={`${dataCount === 0 ? "" : "(" + dataCount + ")"}`}
                            disabled={dataCount === 0 ? true : false}
                        />}
                        {permissions?.BulkUpload && (<Button id="rmMaterialListing_add" className={"mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />)}
                        {permissions?.Download && (
                            <>
                                <>

                                    <Button
                                        className="mr5 Tour_List_Download"
                                        id={"indexDataListing_excel_download"}
                                        onClick={onExcelDownload}
                                        disabled={totalRecordCount === 0}
                                        title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                        icon={"download mr-1"}
                                        buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                    />
                                    <ExcelFile filename={'Index Data'} fileExtension={'.xls'} element={
                                        <Button id={"Excel-Downloads-indexDataList"} className="p-absolute" />

                                    }>
                                        {onBtExport()}
                                    </ExcelFile>
                                </>
                            </>
                        )}
                        <Button id={"rmMaterialListing_refresh"} className={" Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                    </div>
                </Col>
            </Row>

            <Row>
                <Col>
                    <div className={`ag-grid-wrapper height-width-wrapper ${(rmIndexDataList && rmIndexDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}
                    >
                        <div className="ag-grid-header">
                            <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                            <TourWrapper
                                buttonSpecificProp={{ id: "RM_Listing_Tour", onClick: toggleExtraData }}
                                stepsSpecificProp={{
                                    steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, bulkUpload: false, addButton: false, filterButton: false, costMovementButton: false, viewButton: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                }} />
                        </div>
                        <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}
                        >
                            {noData && (<NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />)}
                            {(state?.render || isLoader) ? <LoaderCustom customClass="loader-center" /> : <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout="autoHeight"
                                // columnDefs={c}
                                rowData={rmIndexDataList}
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
                                onRowSelected={onRowSelect}
                                onFilterModified={onFloatingFilterChanged}
                                suppressRowClickSelection={true}
                            >
                                <AgGridColumn cellClass='has-checkbox' field="IndexExchangeName" cellRenderer={checkBoxRenderer} headerName="Index"></AgGridColumn>
                                <AgGridColumn field="CommodityName" headerName="Commodity Name" ></AgGridColumn>
                                <AgGridColumn width={250} field="CommodityStandardName" headerName="Commodity Name (In CIR)" ></AgGridColumn>
                                <AgGridColumn field="IndexUOM" headerName="Index UOM"></AgGridColumn>
                                <AgGridColumn field="ConvertedUOM" headerName="UOM"></AgGridColumn>
                                <AgGridColumn field="FromCurrency" headerName="From Currency"></AgGridColumn>
                                <AgGridColumn field="ToCurrency" headerName="To Currency"></AgGridColumn>
                                <AgGridColumn field="RatePerIndexUOM" headerName="Index Rate (From Currency)/Index UOM" cellRenderer='priceFormatter'></AgGridColumn>
                                <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>
                                <AgGridColumn field="ExchangeRate" headerName={`Exchange Rate (${reactLocalStorage.getObject("baseCurrency")})`} cellRenderer='priceFormatter'></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer="effectiveDateFormatter" filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                <AgGridColumn field="RatePerConvertedUOM" headerName="Index Rate (From Currency)/ UOM" cellRenderer='priceFormatter'></AgGridColumn>
                                <AgGridColumn field="RateConversionPerIndexUOM" headerName="Conversion Rate/Index UOM" cellRenderer='priceFormatter'></AgGridColumn>
                                <AgGridColumn field="RateConversionPerConvertedUOM" headerName="Conversion Rate/UOM " cellRenderer='priceFormatter'></AgGridColumn>
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

            {isOpen && (<AddRMDrawer isEditFlag={isEditFlag} isOpen={isOpen} closeDrawer={closeDrawer} anchor={"right"} />)}

            {state?.showPopup && (
                <PopupMsgWrapper
                    isOpen={state?.showPopup}
                    closePopUp={closePopUp}
                    confirmPopup={onPopupConfirm}
                    message={`${dataCount === 0 ? MESSAGES.DELETE : MESSAGES.DELETE_ALL}`}
                />
            )}
            {isBulkUpload && (
                <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={"Index Data"}
                    messageLabel={"Index Data"}
                    anchor={"right"}
                />
            )}
        </div>
    );
};

export default IndexDataListing;
