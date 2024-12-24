import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA, EXCHNAGERATE } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { getExchangeRateDataList, deleteExchangeRate } from '../actions/ExchangeRateMaster';
import AddExchangeRate from './AddExchangeRate';
import { ADDITIONAL_MASTERS, ExchangeMaster, EXCHANGE_RATE } from '../../../config/constants';
import { checkPermission, getLocalizedCostingHeadValue, searchNocontentFilter } from '../../../helper/util';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import { EXCHANGERATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { filterParams } from '../../common/DateFilter'
import ScrollToTop from '../../common/ScrollToTop';
import { getListingForSimulationCombined } from '../../simulation/actions/Simulation';
import { PaginationWrapper } from '../../common/commonPagination';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel } from '../../common/CommonFunctions';
import { getConfigurationKey, loggedInUserId } from '../../../helper';
import Button from '../../layout/Button';
import { screenWidth, useLabels, useWithLocalization } from '../../../helper/core';
import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter';
import { setResetCostingHead } from '../../../actions/Common';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const ExchangeRateListing = (props) => {

    const dispatch = useDispatch();
    const myRef = useRef(null);
    const [state, setState] = useState({
        tableData: [],
        currency: [],
        toggleForm: false,
        shown: false,
        data: { isEditFlag: false, ID: '' },
        ViewAccessibility: false,
        AddAccessibility: false,
        EditAccessibility: false,
        DeleteAccessibility: false,
        BulkUploadAccessibility: false,
        DownloadAccessibility: false,
        gridApi: null,
        gridColumnApi: null,
        rowData: null,
        isLoader: false,
        showPopup: false,
        deletedId: '',
        selectedRowData: false,
        noData: false,
        dataCount: 0

    });
    const { exchangeRateDataList } = useSelector((state) => state.exchangeRate);
    const { topAndLeftMenuData } = useSelector((state) => state.auth);
    const { filteredRMData } = useSelector((state) => state.material);
    const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
    const { costingHeadFilter } = useSelector((state) => state?.comman);
    useEffect(() => {
        applyPermission(topAndLeftMenuData);
        setState((prevState) => ({ ...prevState, isLoader: true }));

        const fetchData = async () => {
            if (props.isSimulation) {
                if (props.selectionForListingMasterAPI === 'Combined') {
                    props?.changeSetLoader(true);
                    dispatch(getListingForSimulationCombined(
                        props.objectForMultipleSimulation,
                        EXCHNAGERATE,
                        (res) => {
                            props?.changeSetLoader(false);
                        }
                    ));
                }
                setState((prevState) => ({ ...prevState, isLoader: false }));
                if (props.selectionForListingMasterAPI === 'Master') {
                    getTableListData();
                }
            } else {
                getTableListData();
            }
        };

        const timer = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(timer);

    }, []);
    //for static dropdown
    useEffect(() => {

        if (costingHeadFilter && costingHeadFilter?.data) {
            const matchedOption = costingHeadFilter?.CostingHeadOptions?.find(option => option?.value === costingHeadFilter?.data?.value);
            if (matchedOption) {
                state.gridApi?.setQuickFilter(matchedOption?.label);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [costingHeadFilter]);
    useEffect(() => {
        if (topAndLeftMenuData !== undefined) {
            applyPermission(topAndLeftMenuData);
        }
    }, [topAndLeftMenuData]);
    useEffect(() => {
        return () => {
            dispatch(setResetCostingHead(true, "costingHead"))
        }
    }, [])
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === EXCHANGE_RATE)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                setState((prevState) => ({
                    ...prevState,
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                }),
                )
            }
        }
    }


    /**
    * @method getTableListData
    * @description Get list data
    */
    const getTableListData = (currencyId = 0) => {
        let filterData = { currencyId: currencyId, costingHeadId: currencyId, vendorId: filteredRMData?.VendorId ? filteredRMData?.VendorId : '', customerId: filteredRMData?.CustomerId ? filteredRMData?.CustomerId : '', isBudgeting: currencyId, currency: '', isRequestForSimulation: props.isSimulation ? true : false, }
        if (props.isSimulation) {
            props?.changeTokenCheckBox(false)
        }
        dispatch(getExchangeRateDataList(true, filterData, res => {
            if (props.isSimulation) {
                props?.changeTokenCheckBox(true)
            }
            if (res.status === 204 && res.data === '') {
                setState((prevState) => ({ ...prevState, tableData: [], isLoader: false }))
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                setState((prevState) => ({ ...prevState, tableData: Data, isLoader: false }))

            }
        }));
    }


    /**
    * @method viewOrEditItemDetails
    * @description confirm edit or view  item
    */
    const viewOrEditItemDetails = (Id, isViewMode) => {
        setState((prevState) => ({ ...prevState, data: { isEditFlag: true, ID: Id, isViewMode: isViewMode }, toggleForm: true, }))
    }
    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    const deleteItem = (Id) => {
        setState((prevState) => ({ ...prevState, showPopup: true, deletedId: Id }))
    }
    /**
        * @method confirmDeleteItem
        * @description confirm delete item
        */
    const confirmDeleteItem = (ID) => {
        const loggedInUser = loggedInUserId()
        dispatch(deleteExchangeRate(ID, loggedInUser, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_EXCHANGE_SUCCESS);
                getTableListData()
                setState((prevState) => ({ ...prevState, dataCount: 0 }))
            }
        }));
        setState((prevState) => ({ ...prevState, showPopup: false }))
    }

    const onPopupConfirm = () => {
        confirmDeleteItem(state.deletedId);
    }
    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }))
    }

    const effectiveDateFormatter = (props) => {
        let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (cellValue?.includes('T')) {
            cellValue = DayTime(cellValue).format('DD/MM/YYYY')
        }
        return (!cellValue ? '-' : cellValue)
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    /**
    * @method commonCostFormatter
    */
    const commonCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }
    const floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter,
        onFilterChange: (originalValue, value) => {
            setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, CostingHead: value } }));
            setState((prevState) => ({ ...prevState, disableFilter: false }));
        }
    };
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.value;
        const { DeleteAccessibility, ViewAccessibility } = state;
        return (
            <>
                {ViewAccessibility && <Button id={`exchangeRatecListing_view${props.rowIndex}`} className={"View mr-2"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, true)} title={"View"} />}
                {DeleteAccessibility && <Button id={`exchangeRatecListing_delete${props.rowIndex}`} className={"Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
            </>
        )
    };

    const formToggle = () => {
        if (checkMasterCreateByCostingPermission()) {
            setState((prevState) => ({ ...prevState, toggleForm: true }))
        }
    }

    const hideForm = (type) => {
        setState((prevState) => ({ ...prevState, currency: [], data: { isEditFlag: false, ID: '' }, toggleForm: false, }))

        if (type === 'submit') {
            getTableListData();
        }
    };

    /**
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            exchangeRateDataList.length !== 0 && setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData) }))
        }, 500);
    }

    const onGridReady = (params) => {
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        params.api.paginationGoToPage(0);
        myRef.current = params.api
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });
    };

    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onRowSelect = () => {
        const selectedRows = state.gridApi?.getSelectedRows()
        // props?.apply(selectedRows, selectedRows?.length)
        if (props.isSimulation) {

            props.apply(selectedRows, selectedRows?.length)
        }
        setState((prevState) => ({ ...prevState, selectedRowData: selectedRows, dataCount: selectedRows.length }))
    }
    const EXCHANGERATE_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(EXCHANGERATE_DOWNLOAD_EXCEl, "MasterLabels")
    const onBtExport = () => {

        let tempArr = []
        tempArr = state.gridApi && state.gridApi?.getSelectedRows()
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (exchangeRateDataList ? exchangeRateDataList : [])
        return returnExcelColumn(EXCHANGERATE_DOWNLOAD_EXCEl_LOCALIZATION, tempArr)
    };


    const returnExcelColumn = (data = [], TempData) => {
        let tempList = [...TempData]
        let excelData = hideCustomerFromExcel(data, "customerWithCode")
        let temp = []
        temp = tempList && tempList.map((item) => {
            let obj = {}
            if (item.BankRate === null) {
                obj.BankRate = ' '
            } else if (item.BankCommissionPercentage === null) {
                obj.BankCommissionPercentage = ' '
            } else if (item.CustomRate === null) {
                obj.CustomRate = ' '
            } else if (item?.EffectiveDate?.includes('T') || item?.DateOfModification?.includes('T')) {
                obj.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
                obj.DateOfModification = DayTime(item.DateOfModification).format('DD/MM/YYYY')
            }
            temp.push(obj)
            return item
        })
        return (
            <ExcelSheet data={temp} name={ExchangeMaster}>
                {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const onFilterTextBoxChanged = (e) => {
        state?.gridApi?.setQuickFilter(e.target.value);
    }


    const resetState = () => {
        const searchBox = document.getElementById("filter-text-box");
        if (searchBox) {
            searchBox.value = ""; // Reset the input field's value
        }
        state.gridApi.setQuickFilter(null)
        setState((prevState) => ({ ...prevState, isExchangeForm: false, isPowerForm: false, currency: [], data: {}, selectedRowData: [], dataCount: 0, stopApiCallOnCancel: false, noData: false }))
        state?.gridApi?.deselectAll()
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    const combinedCostingHeadRenderer = (props) => {
        // Call the existing checkBoxRenderer

        // Get and localize the cell value
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

        // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
        return localizedValue;
    };

    const frameworkComponents = {
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        totalValueRenderer: buttonFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        commonCostFormatter: commonCostFormatter,
        statusFilter: CostingHeadDropdownFilter,
    };

    /**
    * @method render
    * @description Renders the component
    */

    const { toggleForm, data, AddAccessibility, DownloadAccessibility, noData } = state;

    if (toggleForm) {
        return (<AddExchangeRate hideForm={hideForm} data={data} />)
    }
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

    return (
        <>
            <div className={`ag-grid-react grid-parent-wrapper exchange-rate ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
                <div className="container-fluid">
                    <ScrollToTop pointProp="go-to-top" />
                    {state.isLoader && <LoaderCustom />}
                    <form noValidate>
                        <Row className={`blue-before zindex-0 ${(props.isSimulation && screenWidth < 1600) ? 'mt-5' : ''}`}>
                            <Col md="6">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            </Col>
                            <Col md="6" className=" mb-3">
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    <div>
                                        {(AddAccessibility && !props.isSimulation) && <Button id="exchangeRateListing_add" className={"user-btn mr5"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />}
                                        {
                                            DownloadAccessibility &&
                                            <>
                                                <ExcelFile filename={ExchangeMaster} fileExtension={'.xls'} element={<Button id={"Excel-Downloads-exchangeRateListing"} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button" className={'user-btn mr5'} icon={"download mr-1"} buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} />
                                                }>
                                                    {onBtExport()}
                                                </ExcelFile>
                                            </>

                                        }
                                        <Button id={"exchangeRateListing_refresh"} className="Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </form>

                    <div className={`ag-grid-wrapper mt-2 ${props.isSimulation ? 'simulation-height' : 'height-width-wrapper'} ${(exchangeRateDataList && exchangeRateDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>

                        <div className="ag-theme-material">
                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                            {!state.isLoader && <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                ref={myRef}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={exchangeRateDataList}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                onFilterModified={onFloatingFilterChanged}
                                noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                                rowSelection={'multiple'}
                                onSelectionChanged={onRowSelect}
                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                            >
                                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'combinedCostingHeadRenderer'} floatingFilterComponentParams={floatingFilterStatus}
                                    floatingFilterComponent="statusFilter" ></AgGridColumn>
                                <AgGridColumn field="vendorWithCode" headerName={`${vendorLabel} (Code)`}></AgGridColumn>
                                {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="customerWithCode" headerName="Customer (Code)" ></AgGridColumn>}
                                <AgGridColumn field="FromCurrency" headerName="From Currency" minWidth={135}></AgGridColumn>
                                <AgGridColumn field="ToCurrency" headerName="To Currency" minWidth={135}></AgGridColumn>
                                {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source" minWidth={135}></AgGridColumn>}
                                <AgGridColumn suppressSizeToFit="true" field="CurrencyExchangeRate" headerName={`Exchange Rate (${reactLocalStorage.getObject("baseCurrency")}) `} minWidth={160} cellRenderer={'commonCostFormatter'}></AgGridColumn>
                                <AgGridColumn field="BankRate" headerName={`Bank Rate (${reactLocalStorage.getObject("baseCurrency")})`} minWidth={150} cellRenderer={'commonCostFormatter'}></AgGridColumn>
                                <AgGridColumn suppressSizeToFit="true" field="BankCommissionPercentage" headerName="Bank Commission (%) " minWidth={160} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="CustomRate" headerName={`Custom Rate (${reactLocalStorage.getObject("baseCurrency")})`} minWidth={160} cellRenderer={'commonCostFormatter'}></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams} minWidth={160}></AgGridColumn>
                                <AgGridColumn suppressSizeToFit="true" field="DateOfModification" headerName="Date of Modification" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams} minWidth={160}></AgGridColumn>
                                <AgGridColumn field="IsBudgeting" headerName="Is Budgeting" minWidth={135}></AgGridColumn>
                                {!props.isSimulation && <AgGridColumn suppressSizeToFit="true" field="ExchangeRateId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer' minWidth={160} ></AgGridColumn>}
                            </AgGridReact>}
                            {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
                        </div>
                    </div>
                </div>
            </div>
            {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={MESSAGES.EXCHANGE_DELETE_ALERT} />}
        </ >
    );
}

export default ExchangeRateListing
