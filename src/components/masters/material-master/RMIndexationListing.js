import React, { useState, useEffect, useCallback, useContext, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { MESSAGES } from "../../../config/message";
import Toaster from "../../common/Toaster";
import AddSpecification from "./AddSpecification";
import BulkUpload from "../../massUpload/BulkUpload";
import LoaderCustom from "../../common/LoaderCustom";
import { RmSpecification } from "../../../config/constants";
import { RMINDEXATION, SPECIFICATIONLISTING_DOWNLOAD_EXCEl } from "../../../config/masterData";
import ReactExport from "react-export-excel";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import PopupMsgWrapper from "../../common/PopupMsgWrapper";
import { ApplyPermission } from ".";
import {
    getRMSpecificationDataList,
    deleteRMSpecificationAPI,
} from "../actions/Material";
import { PaginationWrapper } from "../../common/commonPagination";
import { loggedInUserId, searchNocontentFilter, setLoremIpsum } from "../../../helper";
import Button from "../../layout/Button";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "../../common/Tour/TourMessages";
import { useTranslation } from "react-i18next";
import { TourStartAction } from "../../../actions/Common";
import AddRMIndexation from "./AddRMIndexation";
import { useLabels } from "../../../helper/core";

const gridOptions = {};
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const RMIndexationListing = (props) => {
    const {vendorLabel}  =useLabels()
    const dispatch = useDispatch();
    const searchRef = useRef(null);
    const tourStartData = useSelector(state => state.comman.tourStartData);
    const { rmSpecificationList } = useSelector((state) => state.material);
    const { t } = useTranslation("common")
    const permissions = useContext(ApplyPermission);
    const [state, setState] = useState({
        isOpen: false,
        shown: false,
        isEditFlag: false,
        isBulkUpload: false,
        ID: "",
        specificationData: [],
        RawMaterial: [],
        RMGrade: [],
        gridApi: null,
        gridColumnApi: null,
        rowData: null,
        showPopup: false,
        showPopup2: false,
        deletedId: "",
        isLoader: false,
        selectedRowData: false,
        noData: false,
        dataCount: 0,
        render: false,
        isAssociate: false
    });

    useEffect(() => {
        getSpecificationListData("", "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getSpecificationListData = useCallback(
        (materialId = "", gradeId = "") => {
            const data = { MaterialId: materialId, GradeId: gradeId, };

            setState((prev) => ({ ...prev, isLoader: true }));
            dispatch(
                getRMSpecificationDataList(data, (res) => {
                    if (res.status === 204 && res.data === "") {
                        setState((prev) => ({
                            ...prev,
                            specificationData: [],
                            isLoader: false,
                        }));
                    } else if (res && res.data && res.data.DataList) {
                        const Data = res.data.DataList;
                        setState((prev) => ({
                            ...prev,
                            specificationData: Data,
                            isLoader: false,
                        }));
                    }
                })
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const closeDrawer = useCallback((e = "", data, type) => {
        setState((prev) => ({ ...prev, isOpen: false, dataCount: 0, }))
        if (type === "submit") getSpecificationListData("", "");
        props.isOpen(false);
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []);

    const editItemDetails = useCallback((Id, rowData) => {
        setState((prev) => ({
            ...prev, isEditFlag: true, isOpen: true, ID: Id, isAssociate: rowData?.IsAssociated
        }));
    }, []);

    const openModel = useCallback(() => {
        setState((prev) => ({
            ...prev, isOpen: true, isEditFlag: false,
        }));
        props.isOpen(true);
    }, []);
    /**
       * @method deleteItem
       * @description confirm delete RM Indexation
       */
    const deleteItem = useCallback((Id) => {
        setState((prev) => ({ ...prev, showPopup: true, deletedId: Id }));
    }, []);
    /**
        * @method confirmDelete
        * @description confirm delete RM Indexation
        */
    const confirmDelete = useCallback(
        (ID) => {
            const loggedInUser = loggedInUserId();
            dispatch(
                deleteRMSpecificationAPI(ID, loggedInUser, (res) => {
                    if (res.status === 417 && res.data.Result === false) {
                        Toaster.error(
                            "The specification is associated in the system. Please remove the association to delete"
                        );
                    } else if (res && res.data && res.data.Result === true) {
                        Toaster.success(MESSAGES.DELETE_SPECIFICATION_SUCCESS);
                        getSpecificationListData("", "");
                        setState((prev) => ({ ...prev, dataCount: 0 }));
                    }
                    setState((prev) => ({ ...prev, showPopup: false }));
                })
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const onPopupConfirm = useCallback(() => {
        confirmDelete(state.deletedId);
    }, [confirmDelete, state.deletedId]);
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = useMemo(() => {
        return (props) => {
            const cellValue = props?.value;
            const rowData = props?.data;
            let isEditbale = false;
            let isDeleteButton = false;
            isEditbale = permissions.Edit;
            isDeleteButton =
                (tourStartData?.showExtraData && props.rowIndex === 0) ||
                (permissions.Delete && !rowData?.IsAssociated);

            return (
                <>
                    {isEditbale && (
                        <Button
                            id={`rmSpecification_edit${props.rowIndex}`}
                            className={"mr-1 Tour_List_Edit"}
                            variant="Edit"
                            onClick={() => editItemDetails(cellValue, rowData, false)}
                            title={"Edit"}
                        />
                    )}
                    {isDeleteButton && (
                        <Button
                            id={`rmSpecification_delete${props.rowIndex}`}
                            className={"mr-1 Tour_List_Delete"}
                            variant="Delete"
                            onClick={() => deleteItem(cellValue)}
                            title={"Delete"}
                        />
                    )}
                </>
            );
        };
    }, [permissions.Edit, permissions.Delete, tourStartData?.showExtraData]);


    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            rmSpecificationList.length !== 0 &&
                setState((prevState) => ({
                    ...prevState,
                    noData: searchNocontentFilter(value, state.noData),
                }));
        }, 500);
    };

    const bulkToggle = () => {
        setState((prevState) => ({ ...prevState, isBulkUpload: true }));
    };

    const closeBulkUploadDrawer = () => {
        setState(
            (prevState) => {
                return {
                    ...prevState,
                    isBulkUpload: false,
                };
            },
            () => {
                getSpecificationListData("", "");
            }
        );
    };


    const densityAlert = () => {
        setState((prevState) => ({ ...prevState, showPopup2: true }));
    };

    const confirmDensity = () => {
        props.toggle("4");
    };

    const onPopupConfirm2 = () => {
        confirmDensity(state.deletedId);
    };

    const closePopUp = () => {
        setState((propState) => ({
            ...propState,
            showPopup: false,
            showPopup2: false,
        }));
    };

    const onGridReady = (params) => {
        state.gridApi = params.api;
        setState((prevState) => ({
            ...prevState,
            gridApi: params.api,
            gridColumnApi: params.columnApi,
        }));
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onBtExport = () => {
        let tempArr = [];
        tempArr = state.gridApi && state.gridApi?.getSelectedRows();

        tempArr =
            tempArr && tempArr.length > 0
                ? tempArr
                : rmSpecificationList
                    ? rmSpecificationList
                    : [];
        return returnExcelColumn(RMINDEXATION, tempArr);
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = [];
        temp =
            TempData &&
            TempData.map((item) => {
                if (item.RMName === "-") {
                    item.RMName = " ";
                } else if (item.RMGrade === "-") {
                    item.RMGrade = " ";
                }
                return item;
            });
        return (
            <ExcelSheet data={temp} name={RmSpecification}>
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
    /**
            * @method toggleExtraData
            * @description Handle specific module tour state to display lorem data
            */
    const toggleExtraData = (showTour) => {
        dispatch(TourStartAction({
            showExtraData: showTour,
        }));
        setState((prevState) => ({ ...prevState, render: true }));
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, render: false }));
        }, 100);

    }




    const onFilterTextBoxChanged = (e) => {
        state.gridApi.setQuickFilter(e.target.value);
    };

    const resetState = () => {
        state.gridApi.setQuickFilter(null)
        state.gridApi.deselectAll();
        gridOptions.columnApi.resetColumnState(null);
        state.gridApi.setFilterModel(null);
        setState((prevState) => ({ ...prevState, noData: false }));
        if (searchRef.current) {
            searchRef.current.value = '';
        }

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

    const onRowSelect = () => {
        const selectedRows = state.gridApi?.getSelectedRows();
        setState((prevState) => ({
            ...prevState,
            selectedRowData: selectedRows,
            dataCount: selectedRows?.length,
        }));
    };

    const { isOpen, isEditFlag, ID, isBulkUpload, noData, showExtraData, render } = state;
    const isFirstColumn = (params) => {
        const displayedColumns = params.columnApi.getAllDisplayedColumns();
        const thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    };

    const defaultColDef = {
        resizable: true, filter: true, sortable: false, headerCheckboxSelectionFilteredOnly: true, checkboxSelection: isFirstColumn,
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        hyphenFormatter: hyphenFormatter,
        customNoRowsOverlay: NoContentFound,
    };
    return (
        <div
            className={`ag-grid-react grid-parent-wrapper min-height100vh ${permissions.Download ? "show-table-btn" : ""
                }`}
        >
            {state.isLoader && <LoaderCustom />}
            {!isOpen && <>
                <form noValidate>
                    <Row className="pt-4">
                        <Col md={6} className="text-right mb-3 search-user-block">
                            {permissions.Add && (<Button id="rmSpecification_filter" className={"mr5 Tour_List_Add"} onClick={openModel} title={"Add"} icon={"plus"} />)}
                            {permissions.Download && (
                                <>
                                    <>
                                        <ExcelFile
                                            filename={"RM Indexation"}
                                            fileExtension={".xls"}
                                            element={
                                                <Button className="mr5 Tour_List_Download" id={"rmSpecification_excel_download"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                                            }
                                        >
                                            {onBtExport()}
                                        </ExcelFile>
                                    </>
                                </>
                            )}
                            <Button id={"rmSpecification_refresh"} onClick={() => resetState()} title={"Reset Grid"} className={" Tour_List_Reset"} icon={"refresh"} />
                        </Col>
                    </Row>
                </form>

                <Row>
                    <Col>
                        <div
                            className={`ag-grid-wrapper height-width-wrapper ${true
                                ? "overlay-contain"
                                : ""
                                }`}
                        >
                            <div className="ag-grid-header">
                                <input
                                    ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                                <TourWrapper
                                    buttonSpecificProp={{ id: "Specification_Listing_Tour", onClick: toggleExtraData }}
                                    stepsSpecificProp={{
                                        steps: Steps(t, { addLimit: false, filterButton: false, viewButton: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                    }} />
                            </div>
                            <div
                                className={`ag-theme-material ${state.isLoader && "max-loader-height"
                                    }`}
                            >
                                {noData && (
                                    <NoContentFound
                                        title={EMPTY_DATA}
                                        customClassName="no-content-found"
                                    />
                                )}

                                {(render || state.isLoader) ? <LoaderCustom customClass="loader-center" /> : <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout="autoHeight"
                                    // columnDefs={c}
                                    rowData={[]}

                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    rowSelection={"multiple"}
                                    noRowsOverlayComponent={"customNoRowsOverlay"}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: "imagClass",
                                    }}
                                    onSelectionChanged={onRowSelect}
                                    frameworkComponents={frameworkComponents}
                                    onFilterModified={onFloatingFilterChanged}
                                    suppressRowClickSelection={true}
                                >
                                    <AgGridColumn field="CostingHead" headerName="Costing Head"></AgGridColumn>
                                    <AgGridColumn field="MaterialMain" headerName="Material Name (main)"></AgGridColumn>
                                    <AgGridColumn field="MaterialName" headerName="Material Name"></AgGridColumn>
                                    <AgGridColumn field="Plant" headerName="Plant (Code)"></AgGridColumn>
                                    <AgGridColumn field="vendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>
                                    <AgGridColumn field="clientName" headerName="Customer (Code)"></AgGridColumn>
                                    <AgGridColumn field="exchangeRate" headerName="Exchange Rate Source"></AgGridColumn>
                                    <AgGridColumn field="Index" headerName="Index (LME)"></AgGridColumn>
                                    <AgGridColumn field="FromDate" headerName="From Date"></AgGridColumn>
                                    <AgGridColumn field="ToDate" headerName="To Date"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date"></AgGridColumn>
                                    <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                                    <AgGridColumn field="Frequencyofsettlement" headerName="Frequency of settlement"></AgGridColumn>
                                    <AgGridColumn field="IndexPremium" headerName="Index Premium(Currency)"></AgGridColumn>
                                    <AgGridColumn field="ExRateSrcPremium" headerName="Exchange Rate Source Premium(Currency)"></AgGridColumn>
                                    <AgGridColumn field="indexRateCurrency" headerName="Index Rate(Currency)"></AgGridColumn>
                                    <AgGridColumn field="basicRateBaseCurrency" headerName="Basic rate(Base Currency)"></AgGridColumn>
                                    <AgGridColumn
                                        field="SpecificationId"
                                        cellClass="ag-grid-action-container"
                                        headerName="Action"
                                        type="rightAligned"
                                        floatingFilter={false}
                                        cellRenderer={"totalValueRenderer"}
                                    ></AgGridColumn>
                                </AgGridReact>}
                                {
                                    <PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />
                                }
                            </div>
                        </div>
                    </Col>
                </Row>
            </>}
            {isOpen && (
                <AddRMIndexation
                    // isOpen={isOpen}
                    closeDrawer={closeDrawer}
                // isEditFlag={isEditFlag}
                // ID={ID}
                // anchor={"right"}
                // AddAccessibilityRMANDGRADE={props.AddAccessibilityRMANDGRADE}
                // EditAccessibilityRMANDGRADE={props.EditAccessibilityRMANDGRADE}
                // isRMDomesticSpec={false}
                // isAssociate={state.isAssociate}
                />
            )}

        </div>
    );
};

export default RMIndexationListing
