import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../common/NoContentFound';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import LoaderCustom from '../common/LoaderCustom';
import { AuditLisitng, EMPTY_DATA, defaultPageSize } from '../../config/constants';
import { getUserAuditLog } from './actions/AuditListing';
import { PaginationWrapper } from '../common/commonPagination';
import { Col, Row } from 'reactstrap';
import DayTime from '../common/DayTimeWrapper';
import { setSelectedRowForPagination, } from '../simulation/actions/Simulation';
import _ from 'lodash';
import { checkPermission, searchNocontentFilter } from '../../helper';
import { MESSAGES } from '../../config/message';
import WarningMessage from '../common/WarningMessage';
import { disabledClass } from '../../actions/Common';
import { AUDIT_LISTING_DOWNLOAD_EXCEl } from '../../config/masterData';
// import ReactExport from 'react-export-excel';
import Button from '../layout/Button';
import DatePicker from 'react-datepicker'
import { Steps } from './TourMessages';
import TourWrapper from "../common/Tour/TourWrapper"
import { useTranslation } from 'react-i18next';

// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

function LoginAudit(props) {
    const { t } = useTranslation("Audit");
    const [state, setState] = useState({
        // auditDataList: [],
        isLoader: false,
        noData: false,
        dataCount: 0,
        gridApi: null,
        gridColumnApi: null,
        rowData: null,
        currentRowIndex: 0,
        totalRecordCount: 0,
        filterModel: {},
        inRangeDate: [],
        sortModel: {},
        columnDefs: [],
        columnDefsForPopup: [],
        floatingFilter: true,
        disableFilter: true,
        filterText: '',
        showPopup: false,
        globalTake: defaultPageSize,
        pageNo: 1,
        pageNoNew: 1,
        isFilterButtonClicked: false,
        warningMessage: false,
        floatingFilterData: { UserName: '', UserId: 0, LoginTime: '', IPAddress: '', MacAddress: '', UserAgent: '', },
        pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
        DownloadAccessibility: false,
        fromDate: '',
        toDate: '',

    })
    const dispatch = useDispatch();
    const auditDataList = useSelector(state => state.audit.auditDataList);
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [filteredData, setFilteredData] = useState(auditDataList);
    const [searchText, setSearchText] = useState('');
    const { selectedRowForPagination } = useSelector(state => state.simulation);
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    useEffect(() => {
        getDataList(0, state.globalTake, true, state.floatingFilterData);
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        applyPermission(topAndLeftMenuData)
        dispatch(setSelectedRowForPagination([]));
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        applyPermission(topAndLeftMenuData)
    }, [topAndLeftMenuData])
    const getDataList = (skip = 0, take = 10, isPagination = true, dataObj) => {
        setState(prevState => ({ ...prevState, isLoader: true }));
        if (state.filterModel?.LoginTime) {
            if (state.filterModel.LoginTime.dateTo) {
                let temp = [];
                temp.push(DayTime(state.filterModel.LoginTime.dateFrom).format('DD/MM/YYYY[T]hh:mm:ss'));
                temp.push(DayTime(state.filterModel.LoginTime.dateTo).format('DD/MM/YYYY[T]hh:mm:ss'));
                dataObj.dateArray = temp;
            }
        }
        setState(prevState => ({ ...prevState, isLoader: true }));
        dispatch(getUserAuditLog(dataObj, skip, take, isPagination, true, '', (res) => {
            setState(prevState => ({ ...prevState, isLoader: false }));

            if (res && res.status === 200) {

                setState(prevState => ({ ...prevState, auditDataList, noData: false, isLoader: false }));
            }
            else if (res && res.response && res.response.status === 412) {
                setState(prevState => ({ ...prevState, auditDataList, noData: true, isLoader: false }));
            } else {
                setState(prevState => ({ ...prevState, auditDataList, noData: true, isLoader: false }));
            }

            if (res && isPagination === false) {
                setState(prevState => ({ ...prevState, disableDownload: false }));
                dispatch(disabledClass(false));
                setTimeout(() => {
                    let button = document.getElementById("Excel-Downloads-LoginAudit-DownloadExcel");
                    button && button.click();
                }, 500);
            }

            if (res) {

                if (res.status === 204) {
                    setState(prevState => ({ ...prevState, totalRecordCount: 0, pageNo: 0, noData: true, auditDataList }));

                }
                if (res.data && res.data.DataList.length > 0) {
                    setState(prevState => ({ ...prevState, totalRecordCount: res.data.DataList[0].TotalRecordCount }));
                }
                if (res) {
                    let isReset = true
                    setTimeout(() => {
                        for (var prop in state.floatingFilterData) {
                            if (state.floatingFilterData[prop] !== "") {
                                isReset = false
                            }
                        }
                        isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(state.filterModel))
                    }, 300);
                }

                setTimeout(() => { setState(prevState => ({ ...prevState, warningMessage: false })); }, 335);

                setTimeout(() => {
                    setState(prevState => ({ ...prevState, isFilterButtonClicked: false }));
                }, 600);
            }
        }));
    };

    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === "Audit");
            const accessData = Data && Data.Pages.find(el => el.PageName === "Login Audit")
            const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permissionData !== undefined) {
                setState((prevState) => ({ ...prevState, DownloadAccessibility: permissionData && permissionData.Download ? permissionData.Download : false, }))
            }
        }
    }
    const onBtPrevious = () => {
        let pageSize = state.globalTake;
        let previousPage = state.pageNo - 1;
        let skip = (previousPage - 1) * pageSize;
        if (state.currentRowIndex >= 10) {
            const previousNo = state.currentRowIndex - 10;
            const newPageNo = state.pageNo - 1;
            setState((prevState) => ({ ...prevState, pageNo: newPageNo >= 1 ? newPageNo : 1, pageNoNew: newPageNo >= 1 ? newPageNo : 1, currentRowIndex: previousNo, }));
            const filterDataObj = {
                ...state.floatingFilterData,
                fromDate: fromDate ? formatToDateString(fromDate) : '',
                toDate: toDate ? formatToDateString(toDate) : ''
            };
            getDataList(skip, pageSize, true, filterDataObj);
        }
    };

    const onBtNext = () => {
        let pageSize = state.globalTake;
        let nextPage = state.pageNo + 1;
        let skip = (nextPage - 1) * pageSize;
        if (state.pageSize?.pageSize50 && state.pageNo >= Math.ceil(state.totalRecordCount / 50)) {
            return false;
        }
        if (state.pageSize?.pageSize100 && state.pageNo >= Math.ceil(state.totalRecordCount / 100)) {
            return false;
        }
        if (state.currentRowIndex < state.totalRecordCount - 10) {
            setState((prevState) => ({ ...prevState, pageNo: nextPage, pageNoNew: nextPage, }));
            const nextNo = state.currentRowIndex + 10;
            const filterDataObj = {
                ...state.floatingFilterData,
                fromDate: fromDate ? formatToDateString(fromDate) : '',
                toDate: toDate ? formatToDateString(toDate) : ''
            };
            getDataList(skip, pageSize, true, filterDataObj);
            setState((prevState) => ({ ...prevState, currentRowIndex: nextNo }));
        }
    };
    const onFilterTextBoxChanged = (e) => {
        setSearchText(state.gridApi.setQuickFilter(e.target.value));
    }
    //daterangerconst handleFromDateChange = (date) => {
    const handleFromDateChange = (date) => {
        setFromDate(date);
        if (date && toDate) {
            // Enable the filter button
            setState(prevState => ({ ...prevState, disableFilter: false, }));
        } else {
            // Disable the filter button if toDate is not selected yet
            setState(prevState => ({ ...prevState, disableFilter: true }));
        }
        if (date && toDate && date > toDate) {
            setToDate(null);
        }
    };

    // Update to handleToDateChange
    const handleToDateChange = (date) => {
        setToDate(date);

        if (!date) {
            // If to date is cleared, set the warning message to false
            setState(prevState => ({ ...prevState, warningMessage: false }));
        } else if (fromDate) {
            // Enable the filter button
            setState(prevState => ({ ...prevState, disableFilter: false, warningMessage: true }));
        } else {
            // Disable the filter button if fromDate is not selected yet
            setState(prevState => ({ ...prevState, disableFilter: true }));
        }
        if (fromDate && date && date < fromDate) {
            setFromDate(null);
        }
    };
    const formatToDateString = (dateObject) => {
        const year = dateObject.getFullYear().toString();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObject.getDate().toString().padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const filterData = () => {
        let filtered = auditDataList; // Start with all data
        if (fromDate || toDate) {
            filtered = auditDataList.filter((item) => {
                const itemDate = new Date(item.date); // Make sure 'item.date' is the correct property
                return (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
            });
        }

        setFilteredData(filtered); // Now 'filteredData' will only contain data within the date range
    };

    // Call filterData whenever fromDate or toDate changes
    useEffect(() => {
        filterData();
    }, [fromDate, toDate]);






    const onFloatingFilterChanged = (value) => {

        setTimeout(() => {
            if (auditDataList?.length !== 0) {
                setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), }));
            }
        }, 500);
        setState((prevState) => ({ ...prevState, disableFilter: false }));
        const model = gridOptions?.api?.getFilterModel();
        setState((prevState) => ({ ...prevState, filterModel: { ...model } }));
        if (!state.isFilterButtonClicked) {
            setState((prevState) => ({ ...prevState, warningMessage: true }));
        }
        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            let isFilterEmpty = true;
            if (model !== undefined && model !== null) {
                if (Object.keys(model).length > 0) {
                    isFilterEmpty = false;
                    for (var property in state.floatingFilterData) {
                        if (property === value.column.colId) {
                            state.floatingFilterData[property] = "";
                        }
                    }
                    setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, }));
                }
                if (isFilterEmpty) {
                    setState((prevState) => ({ ...prevState, warningMessage: false }));
                    for (var prop in state.floatingFilterData) {
                        state.floatingFilterData[prop] = "";
                    }
                    setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, }));
                }
            }
        } else {
            if (value.column.colId === "LoginTime") {
                return false;
            }
            setState((prevState) => ({
                ...prevState, floatingFilterData: { ...prevState.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter, },
            }));
        }
    };

    const resetState = () => {
        setFromDate(null);
        setToDate(null);
        setState((prevState) => ({ ...prevState, noData: false, warningMessage: false, isFilterButtonClicked: false, }));
        setSearchText(''); // Clear the search text state
        if (state.gridApi) {
            state.gridApi.setQuickFilter(''); // Clear the Ag-Grid quick filter
        }
        state.gridApi.deselectAll();
        gridOptions?.columnApi?.resetColumnState(null);
        const val = gridOptions?.api?.setFilterModel({});
        for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
        }
        setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, warningMessage: false, pageNo: 1, pageNoNew: 1, currentRowIndex: 0, fromDate: null, toDate: null }));
        getDataList(0, state.defaultPageSize, true, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        dispatch(setSelectedRowForPagination([]));

        setState((prevState) => ({ ...prevState, globalTake: 10, dataCount: 0, pageSize: { pageSize10: true, pageSize50: false, pageSize100: false, }, }));
        setSearchText(''); // Assuming this state is bound to the input value
    };
    const onRowSelect = (event) => {
        var selectedRows = state.gridApi && state.gridApi?.getSelectedRows();

        if (selectedRows === undefined || selectedRows === null) {     //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA
            let finalData = []
            if (event.node.isSelected() === false) {  // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].UserAuditLogId === event.data.UserAuditLogId) {  // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }
            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]
        }
        let uniqeArray = _.uniqBy(selectedRows, "UserAuditLogId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        dispatch(setSelectedRowForPagination(uniqeArray))               //SETTING CHECKBOX STATE DATA IN REDUCER
        setState(prevState => ({ ...prevState, dataCount: uniqeArray.length }))
        let finalArr = selectedRows
        let length = finalArr?.length
        let uniqueArray = _.uniqBy(finalArr, "UserAuditLogId")
        if (props.isSimulation) {
            props.apply(uniqueArray, length)
        }
        setState(prevState => ({ ...prevState, selectedRowData: selectedRows }))

    }
    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.UserAuditLogId === props.node.data.UserAuditLogId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }
    }
    // const effectiveDateFormatter = (props) => {
    //     const dayjs = require('dayjs');
    //     const utc = require('dayjs/plugin/utc');
    //     const timezone = require('dayjs/plugin/timezone');
    //     dayjs.extend(utc);
    //     dayjs.extend(timezone);
    //     const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    //     if (!cellValue) return '-';
    //     const utcDate = dayjs.utc(cellValue);
    //     const browserTimeZone = dayjs.tz.guess();
    //     const localTime = utcDate.tz(browserTimeZone);
    //     const formattedDateAndTime = localTime.format('DD/MM/YYYY - HH:mm:ss');
    //     // Return the formatted date and time
    //     return formattedDateAndTime;
    // };

    const onGridReady = (params) => {
        setState(prevState => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))

        params.api.paginationGoToPage(0);
        params.api.sizeColumnsToFit()
        const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
        checkBoxInstance.forEach((checkBox, index) => {
            const specificId = `audit_Checkbox${index / 11}`;
            checkBox.id = specificId;
        })
        const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
        floatingFilterInstances.forEach((floatingFilter, index) => {
            const specificId = `audit_Floating${index}`;
            floatingFilter.id = specificId;
        });
    };

    const onSearch = () => {
        setState(prevState => ({
            ...prevState,
            warningMessage: false,
            isFilterButtonClicked: true,
            pageNo: 1,
            pageNoNew: 1,
            currentRowIndex: 0,
        }));

        // Create an updated filter object including fromDate and toDate
        const filterDataObj = {
            ...state.floatingFilterData,
            // LoginTime: loginTime ? formatToDateString(loginTime) : '',
            fromDate: fromDate ? formatToDateString(fromDate) : '',
            toDate: toDate ? formatToDateString(toDate) : ''
        };
        gridOptions?.columnApi?.resetColumnState();

        // Call the API with updated filtering options
        getDataList(0, state.globalTake, true, filterDataObj);
    };
    const onPageSizeChanged = (newPageSize) => {
        let pageSize, totalRecordCount;
        if (Number(newPageSize) === 10) {

            pageSize = 10;
        } else if (Number(newPageSize) === 50) {
            pageSize = 50;
        } else if (Number(newPageSize) === 100) {
            pageSize = 100;
        }

        totalRecordCount = Math.ceil(state.totalRecordCount / pageSize);
        const filterDataObj = {
            ...state.floatingFilterData,
            fromDate: fromDate ? formatToDateString(fromDate) : '',
            toDate: toDate ? formatToDateString(toDate) : ''
        };
        getDataList(0,
            pageSize,
            true,
            filterDataObj)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA


        setState((prevState) => ({
            ...prevState,
            globalTake: pageSize,
            auditDataList: [],
            pageNo: Math.min(state.pageNo, totalRecordCount), // Ensure pageNo is within bounds
            pageSize: {
                pageSize10: pageSize === 10,
                pageSize50: pageSize === 50,
                pageSize100: pageSize === 100,
            },
        }));
        // state.gridApi.api.sizeColumnsToFit()

        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY - HH:mm:ss') : '';
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }
    }
    const onExcelDownload = () => {
        setState(prevState => ({ ...prevState, disableDownload: true }));
        dispatch(disabledClass(true));

        if (fromDate && toDate) {
            // If a date range is selected, download data for that range
            const filterDataObj = {
                ...state.floatingFilterData,
                fromDate: formatToDateString(fromDate),
                toDate: formatToDateString(toDate),
            };

            getDataList(0, defaultPageSize, false, filterDataObj);
        } else {
            // If no date range is selected, download the selected rows or the entire data
            let tempArr = selectedRowForPagination;
            if (tempArr?.length > 0) {
                setTimeout(() => {
                    dispatch(disabledClass(false));
                    setState(prevState => ({ ...prevState, disableDownload: false }));
                    let button = document.getElementById('Excel-Downloads-LoginAudit-DownloadExcel');
                    button && button.click();
                }, 400);
            } else {
                getDataList(0, defaultPageSize, false, state.floatingFilterData);
            }
        }
    }
    const onBtExport = () => {
        let tempArr = []
        //tempArr = state.gridApi && state.gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (auditDataList ? auditDataList : [])

        return returnExcelColumn(AUDIT_LISTING_DOWNLOAD_EXCEl, tempArr)
    };
    const excelDateFormatter = (value) => {
        if (!value) return '-'; // Or any placeholder you prefer for empty values
        const moment = require('moment'); // Assuming you're using the moment.js library for date formatting.
        return moment(value).format('DD/MM/YYYY hh:mm:ss '); // Specify your format
    };
    const returnExcelColumn = (data = [], tempData) => {
        // Map through TempData to format the LoginTime for each item
        const formattedData = tempData.map(item => ({
            ...item,
            LoginTime: excelDateFormatter(item.LoginTime),
        }));

        // Now export formattedData instead of tempData
        // return (
        //     <ExcelSheet data={formattedData} name={AuditLisitng}>
        //         {data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        //     </ExcelSheet>
        // );
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    const handleDate = (newDate) => {
        let temp = state.inRangeDate
        temp.push(newDate)
        setState(prevState => ({ ...prevState, inRangeDate: temp }))
        if (props?.benchMark) {
            props?.handleDate(state.inRangeDate)
        }
        setTimeout(() => {
            var y = document.getElementsByClassName('ag-radio-button-input');
            var radioBtn = y[0];
            radioBtn?.click()

        }, 300);
    }


    const setDate = (date) => {
        setState(prevState => ({ ...prevState, floatingFilterData: { ...state.floatingFilterData, LoginTime: date } }))
    }

    const filterParams = {
        date: "",
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';

            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('YYYY/MM/DD') : '';

            setDate(newDate)
            handleDate(newDate)
            if (dateAsString == null) return -1;
            var dateParts = dateAsString.split('/');
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

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        effectiveDateFormatter: effectiveDateFormatter,
        hyphenFormatter: hyphenFormatter,
        checkBoxRenderer: checkBoxRenderer

    };

    return (
        <>
            {
                (state.isLoader) ? <LoaderCustom customClass="loader-center" /> :
                    <div className={`ag-grid-react custom-pagination ${state.DownloadAccessibility ? "show-table-btn" : ""}`}>
                        {state.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
                        <div className={`ag-grid-react ? "custom-pagination" : ""} ${state.DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
                            <Row className={`filter-row-large blue-before pb-3`}>
                                <Col md="7" lg="7" className='d-flex'>
                                    <input type="text" value={searchText} className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />

                                    <div className='date-range-container'>

                                        <div className="d-flex align-items-center">
                                            <label>From Date:</label>
                                            <div className="inputbox date-section ml-2">
                                                <DatePicker
                                                    id="Audit_List_FromDate"
                                                    selected={fromDate}
                                                    onChange={handleFromDateChange}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    isClearable
                                                    maxDate={toDate}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="select date"
                                                    className="form-control"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center">
                                            <label>To Date:</label>
                                            <div className="inputbox date-section ml-2">
                                                <DatePicker
                                                    id="Audit_List_ToDate"
                                                    selected={toDate}
                                                    onChange={handleToDateChange}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    isClearable
                                                    minDate={fromDate}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="select date"
                                                    className="form-control"
                                                    autoComplete="off"
                                                    disabled={!fromDate} // Disable if fromDate is not selected
                                                />

                                            </div>
                                        </div>
                                        <TourWrapper
                                            buttonSpecificProp={{ id: "Login_Audit_Page" }}
                                            stepsSpecificProp={{
                                                steps: Steps(t).AUDIT_LISTING
                                            }} />
                                    </div>

                                </Col>

                                <Col md="5" lg="5" className="d-flex justify-content-end">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <div className="warning-message d-flex align-items-center">
                                            {state.warningMessage && !state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                            <button id="Audit_List_Filter" disabled={state.disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                            {state.DownloadAccessibility &&
                                                <>
                                                    <button title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`} type="button"
                                                        onClick={onExcelDownload}
                                                        id="Audit_List_Download"
                                                        className={'user-btn mr5'}><div className="download mr-1" ></div>
                                                        {/* DOWNLOAD */}
                                                        {`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                                                    </button>
                                                    {/* <ExcelFile filename={'LoginAudit'} fileExtension={'.xls'} element={
                                                        <button id={'Excel-Downloads-LoginAudit-DownloadExcel'} className="p-absolute" type="button" >
                                                        </button>}>
                                                        {onBtExport()}
                                                    </ExcelFile> */}
                                                </>
                                            }
                                            <button type="button" id="Audit_List_Reset" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>  <div className="refresh mr-0"></div> </button>
                                        </div>

                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className={`ag-grid-wrapper ${(props?.isDataInMaster && !state.noData) ? 'master-approval-overlay' : ''} ${(auditDataList && auditDataList.length <= 0) || state.noData ? 'overlay-contain' : ''} `}>
                                        <div className={`ag-theme-material ${(state.isLoader && !props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                                            {state.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                            {!state.isLoader && <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                domLayout='autoHeight'
                                                rowData={auditDataList}
                                                pagination={true}
                                                paginationPageSize={state.globalTake}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                                                frameworkComponents={frameworkComponents}
                                                rowSelection={'multiple'}
                                                onRowSelected={onRowSelect}
                                                suppressRowClickSelection={true}
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                            >
                                                <AgGridColumn field="UserName" headerName="User Name" cellRenderer={'checkBoxRenderer'}></AgGridColumn>
                                                <AgGridColumn field="IPAddress" headerName="IP Address" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn field="UserAgent" headerName="User Agent" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn field="LoginTime" headerName="Login Time (Local Time)" filter="agDateColumnFilter" cellRenderer={'effectiveDateFormatter'} filterParams={filterParams} ></AgGridColumn>
                                            </AgGridReact>}
                                            <div className='button-wrapper'>
                                                {!state.isLoader && <PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} globalTake={state.globalTake} />}
                                                {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                                    <div className="d-flex pagination-button-container">
                                                        <p><Button id="auditListing_previous" variant="previous-btn" onClick={() => onBtPrevious()} /></p>
                                                        {state.pageSize?.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{state.pageNo}</span> of {Math.ceil(state.totalRecordCount / 10)}</p>}
                                                        {state.pageSize?.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{state.pageNo}</span> of {Math.ceil(state.totalRecordCount / 50)}</p>}
                                                        {state.pageSize?.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{state.pageNo}</span> of {Math.ceil(state.totalRecordCount / 100)}</p>}
                                                        <p><Button id="auditListing_next" variant="next-btn" onClick={() => onBtNext()} /></p>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div >
            }
        </>
    )
}

export default LoginAudit
