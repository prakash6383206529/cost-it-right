import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { activeInactiveStatus, deletePlantAPI, getFilteredPlantList } from '../actions/Plant';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA, ZBCTypeId } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import { getConfigurationKey, handleDepartmentHeader, loggedInUserId } from '../../../helper/auth';
import AddZBCPlant from './AddZBCPlant';
import LoaderCustom from '../../common/LoaderCustom';
import { PlantZbc } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { ZBCPLANT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { searchNocontentFilter, setLoremIpsum } from '../../../helper';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { divisionApplicableFilter } from '../masterUtil';
import BulkDelete from '../../../helper/BulkDelete';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const ZBCPlantListing = (props) => {
    const dispatch = useDispatch();
    const plantDataList = useSelector((state) => state.plant.plantDataList);
    const { AddAccessibility, DownloadAccessibility, EditAccessibility, DeleteAccessibility, ViewAccessibility, ActivateAccessibility } = props;
    const { t } = useTranslation("common")



    const [state, setState] = useState({
        isEditFlag: false,
        isOpenVendor: false,
        shown: false,
        ID: '',
        tableData: [],
        city: [],
        country: [],
        state: [],
        showPopup: false,
        deletedId: '',
        cellData: {},
        cellValue: '',
        showPopupToggle: false,
        isViewMode: false,
        isLoader: false,
        selectedRowData: false,
        noData: false,
        dataCount: 0,
        type: '',
        render: false,
        showExtraData: false,
        totalRecordCount: 0,
        globalTake: defaultPageSize
    });

    useEffect(() => {
        filterList();
    }, []);

    useEffect(() => {
        if (state.isOpenVendor === false && state.type === 'submit') {
            filterList();
        }
    }, [state.isOpenVendor, state.type]);

    const viewOrEditItemDetails = useCallback((Id, isViewMode) => {
        setState(prevState => ({
            ...prevState,
            isOpenVendor: true,
            isEditFlag: true,
            ID: Id,
            isViewMode: isViewMode
        }));
    }, []);


    /**
    * @method deleteItem
    * @description confirm delete part
    */
    const deleteItem = useCallback((Id) => {
        setState(prevState => ({
            ...prevState,
            showPopup: true,
            deletedId: Id
        }));
    }, []);

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    const confirmDeleteItem = (ID) => {
        const loggedInUser = loggedInUserId(); // Assuming loggedInUserId is a function that returns the ID of the logged-in user
        dispatch(deletePlantAPI(ID, loggedInUser, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.PLANT_DELETE_SUCCESSFULLY);
                setState(prevState => ({
                    ...prevState,
                    dataCount: prevState.dataCount > 0 ? prevState.dataCount - 1 : 0
                }));
                filterList(); // Assuming filterList is a function that updates the data list after confirming deletion
            }
        }));
        setState(prevState => ({
            ...prevState,
            showPopup: false
        }));
    };
    const onPopupConfirm = () => {
        confirmDeleteItem(state.deletedId);
    };
    const closePopUp = () => {
        setState(prevState => ({
            ...prevState,
            showPopup: false,
            showPopupToggle: false
        }));
    };
    const onPopupConfirmToggle = () => {
        confirmDeactivateItem(state?.cellData, state?.cellValue);
    };
    /**
  * @method buttonFormatter
  * @description Renders buttons
  */
    const buttonFormatter = (props) => {
        const cellValue = props?.value;
        return (
            <>
                {ViewAccessibility && (
                    <button title="View" className="View mr-2 Tour_List_View" type="button" onClick={() => viewOrEditItemDetails(cellValue, true)} />
                )}
                {EditAccessibility && (
                    <button title="Edit" className="Edit mr-2 Tour_List_Edit" type="button" onClick={() => viewOrEditItemDetails(cellValue, false)} />
                )}
                {DeleteAccessibility && (
                    <button title="Delete" className="Delete Tour_List_Delete" type="button" onClick={() => deleteItem(cellValue)} />
                )}
            </>
        );
    };
    const handleChange = (cell, row) => {
        let data = {
            Id: row.PlantId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell //Status of the user.
        };
        setState(prevState => ({ ...prevState, showPopupToggle: true, cellData: data, cellValue: cell }));
    };

    const confirmDeactivateItem = (data, cell) => {
        dispatch(activeInactiveStatus(data, res => {
            if (res && res.data && res.data.Result) {
                Toaster.success(cell ? MESSAGES.PLANT_INACTIVE_SUCCESSFULLY : MESSAGES.PLANT_ACTIVE_SUCCESSFULLY);
                filterList(); // Re-fetch or update the list to reflect changes
            }
        }));
        setState(prevState => ({ ...prevState, showPopupToggle: false }));
    };

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */

    const statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <label htmlFor="normal-switch" className="normal-switch Tour_List_Status">
                <Switch
                    onChange={() => handleChange(cellValue, rowData)}
                    checked={cellValue}
                    disabled={!ActivateAccessibility}
                    background="#ff6600"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#FC5774"
                    id="normal-switch"
                    height={24}
                    className={cellValue ? "active-switch" : "inactive-switch"}
                />
            </label>
        );
    };

    /**
                   @method toggleExtraData
                   @description Handle specific module tour state to display lorem data
                  */
    const toggleExtraData = (showTour) => {
        setState((prevState) => ({ ...prevState, render: true }));
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
        }, 100);
    }

    /**
    * @method filterList
    * @description FILTER DATALIST
    */
    const filterList = () => {
        setState(prevState => ({ ...prevState, isLoader: true }));

        let filterData = {
            country: state.country && state.country.hasOwnProperty('value') ? state.country.value : '',
            state: state.state && state.state.hasOwnProperty('value') ? state.state.value : '',
            city: state.city && state.city.hasOwnProperty('value') ? state.city.value : '',
            CostingTypeId: ZBCTypeId
        };

        dispatch(getFilteredPlantList(filterData, (res) => {
            setState(prevState => ({ ...prevState, isLoader: false }));
            if (res.status === 204 && res.data === '') {
                setState(prevState => ({ ...prevState, tableData: [], isLoader: false }));
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;

                setState(prevState => ({ ...prevState, tableData: Data, isLoader: false, totalRecordCount: Data?.length }));
            }
        }));
    };

    const formToggle = () => {
        setState(prevState => ({
            ...prevState,
            isOpenVendor: true,
            isViewMode: false
        }));
    };

    const closeVendorDrawer = (e = '', type) => {
        setState(prevState => ({
            ...prevState,
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
            type: type
        }));
    };
    /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (plantDataList.length !== 0) {
                setState(prevState => ({ ...prevState, noData: searchNocontentFilter(value, prevState.noData), totalRecordCount: state?.gridApi?.getDisplayedRowCount() }));
            }
        }, 500);

    };





    const onGridReady = (params) => {

        window.screen.width >= 1600 && params.api.sizeColumnsToFit();
        setState(prevState => ({
            ...prevState,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
        params.api.paginationGoToPage(0);
    };
    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
        setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
    };
    const onRowSelect = () => {
        const selectedRows = state.gridApi?.getSelectedRows();
        setState(prevState => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }));
    };
    const onBtExport = () => {
        let tempArr = state.gridApi && state.gridApi.getSelectedRows();
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (plantDataList ? plantDataList : []);
        return returnExcelColumn(divisionApplicableFilter(ZBCPLANT_DOWNLOAD_EXCEl, "IsDivisionApplied"), tempArr);
    };

    const returnExcelColumn = (data = [], TempData) => {
        return (
            <ExcelSheet data={TempData} name={PlantZbc}>
                {data && data.map((ele, index) => (
                    <ExcelColumn
                        key={index}
                        label={(ele.label === "Company Name") ? `${handleDepartmentHeader()} Name` : ele.label}
                        value={ele.value}
                        style={ele.style}
                    />
                ))}
            </ExcelSheet>
        );
    };

    const onFilterTextBoxChanged = (event) => {
        state.gridApi.setQuickFilter(event.target.value);
    };


    const resetState = () => {
        const searchBox = document.getElementById("filter-text-box");
        if (searchBox) {
            searchBox.value = ""; // Reset the input field's value
        }
        state.gridApi.setQuickFilter(null)
        state.gridApi.deselectAll();
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null); // Reset any header filters
        if (window.screen.width >= 1600) {
            state.gridApi.sizeColumnsToFit();
        }
        setState(prevState => ({ ...prevState, noData: false, globalTake: defaultPageSize }));
        filterList();
    };




    const isFirstColumn = (params) => {

        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;

    }
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
        statusButtonFormatter: statusButtonFormatter
    };

    return (
        <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
            {state.isLoader && <LoaderCustom customClass="loader-center" />}
            <form noValidate>
                <Row className="pt-4">

                    <Col md="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                               <BulkDelete {...props} type={'Plant'} deletePermission={DeleteAccessibility} dataCount={state?.dataCount} bulkDeleteData={state?.selectedRowData}/>
                                {AddAccessibility && (
                                    <button
                                        type="button"
                                        className={"user-btn mr5 Tour_List_Add"}
                                        onClick={formToggle}
                                        title="Add"
                                    >
                                        <div className={"plus mr-0"}></div>
                                    </button>
                                )}
                                {
                                    DownloadAccessibility &&
                                    <>
                                        <ExcelFile filename={PlantZbc} fileExtension={'.xls'} element={<button title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" disabled={state?.totalRecordCount === 0} className={'user-btn mr5 Tour_List_Download'} ><div className="download mr-1"></div>
                                            {`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}</button>}>
                                            {state?.totalRecordCount !== 0 ? onBtExport() : null}
                                        </ExcelFile>
                                    </>
                                    //   <button type="button" className={"user-btn mr5"} onClick={onBtExport}><div className={"download"} ></div>Download</button>
                                }

                                <button type="button" className="user-btn Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>

                            </div>
                        </div>
                    </Col>
                </Row>
            </form>


            <div className={`ag-grid-wrapper height-width-wrapper ${(plantDataList && plantDataList?.length <= 0) || state.noData ? "overlay-contain" : ""}`}>
                <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                    <TourWrapper
                        buttonSpecificProp={{
                            id: "ZBCPlant_listing_Tour", onClick: toggleExtraData
                        }}
                        stepsSpecificProp={{
                            steps: Steps(t, { addLimit: false, filterButton: false, costMovementButton: false, bulkUpload: false, copyButton: false, viewBOM: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                        }} />
                </div>
                < div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                    {state.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                    {state.isLoader ? <LoaderCustom customClass="loader-center" /> :
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={state.showExtraData && plantDataList ? [...setLoremIpsum(plantDataList[0]), ...plantDataList] : plantDataList}

                            pagination={true}
                            paginationPageSize={defaultPageSize}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                            rowSelection={'multiple'}
                            suppressRowClickSelection={true}
                            onSelectionChanged={onRowSelect}
                            onFilterModified={onFloatingFilterChanged}
                            frameworkComponents={frameworkComponents}
                        >
                            <AgGridColumn field="PlantName" headerName="Plant Name"></AgGridColumn>
                            <AgGridColumn field="PlantCode" headerName="Plant Code"></AgGridColumn>
                            <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                            {/* THIS IS COMMENTED IN //RE  */}
                            {/* <AgGridColumn field="Purchase Group" headerName="Company Name"></AgGridColumn> */}
                            {getConfigurationKey().IsCompanyConfigureOnPlant && <AgGridColumn field="CompanyName" headerName={`${handleDepartmentHeader()} Name`}></AgGridColumn>}
                            <AgGridColumn field="CountryName" headerName="Country"></AgGridColumn>
                            <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
                            <AgGridColumn field="CityName" headerName="City"></AgGridColumn>
                            {getConfigurationKey().IsDivisionAllowedForDepartment && <AgGridColumn field="IsDivisionApplied" headerName="Divison Applicable" cellRenderer={"ApplicableFormatter"}></AgGridColumn>}
                            <AgGridColumn field="PlantId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                            <AgGridColumn width="130" pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                        </AgGridReact>
                    }

                    {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake} />}
                </div>
            </div>

            {state.isOpenVendor && (<AddZBCPlant isOpen={state.isOpenVendor} closeDrawer={closeVendorDrawer} isEditFlag={state.isEditFlag} isViewMode={state.isViewMode} ID={state.ID} anchor={"right"} />)
            }
            {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.PLANT_DELETE_ALERT}`} />
            }
            {state.showPopupToggle && <PopupMsgWrapper isOpen={state.showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${state.cellValue ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`} />}
        </div >
    );

}





export default ZBCPlantListing
