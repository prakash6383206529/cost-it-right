    import React, { useCallback, useMemo } from 'react';
    import { useState, useEffect, } from 'react';
    import { useDispatch, useSelector } from 'react-redux'
    import { Row, Col } from 'reactstrap';
    import { APPROVED, AWARDED, CANCELLED, DRAFT, EMPTY_DATA, FILE_URL, NON_AWARDED, PREDRAFT, RECEIVED, REJECTED, RETURNED, RFQ, RFQVendor, SENT, SUBMITTED, UNDER_APPROVAL, UNDER_REVISION, } from '../.././config/constants'
    import NoContentFound from '.././common/NoContentFound';
    import { MESSAGES } from '../.././config/message';
    import Toaster from '.././common/Toaster';
    import 'react-input-range/lib/css/index.css'
    import LoaderCustom from '.././common/LoaderCustom';
    import { AgGridColumn, AgGridReact } from 'ag-grid-react';
    import 'ag-grid-community/dist/styles/ag-grid.css';
    import 'ag-grid-community/dist/styles/ag-theme-material.css';
    import PopupMsgWrapper from '.././common/PopupMsgWrapper';
    import { getQuotationList, cancelRfqQuotation } from './actions/rfq';
    import ViewRfq from './ViewRfq';
    import AddRfq from './AddRfq';
    import { checkPermission, encodeQueryParamsAndLog, getConfigurationKey, getTimeZone, loggedInUserId, removeSpaces, RFQ_KEYS, searchNocontentFilter, setLoremIpsum, showBopLabel, userDetails } from '../../helper';
    import DayTime from '../common/DayTimeWrapper';
    import Attachament from '../costing/components/Drawers/Attachament';
    import { useRef } from 'react';
    import SingleDropdownFloationFilter from '../masters/material-master/SingleDropdownFloationFilter';
    import { agGridStatus, getGridHeight, isResetClick, showQuotationDetails } from '../../actions/Common';
    import TourWrapper from '../common/Tour/TourWrapper';
    import { Steps } from '../common/Tour/TourMessages';
    import { useTranslation } from 'react-i18next';
    import CustomCellRenderer from './CommonDropdown';
    import { useHistory, useLocation } from "react-router-dom/cjs/react-router-dom";
    import { PaginationWrappers } from '../common/Pagination/PaginationWrappers';
    import PaginationControls from '../common/Pagination/PaginationControls';
    import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from '../common/Pagination/paginationAction';
    import { reactLocalStorage } from 'reactjs-localstorage';
    import { setSelectedRowForPagination } from '../simulation/actions/Simulation';
    import WarningMessage from '../common/WarningMessage';
    import { useLabels } from '../../helper/core';
    import Button from '../layout/Button';
    import RemarkHistoryDrawer from './RemarkHistoryDrawer';
    //import { statusDropdownforRfq } from '../../config/masterData';
    export const ApplyPermission = React.createContext();
    const gridOptions = {};



    function RfqListing(props) {

        const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
        const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
        const [loader, setloader] = useState(false);
        const dispatch = useDispatch();
        const [addRfqData, setAddRfqData] = useState({});
        const [rowData, setRowData] = useState([])
        const [totalRecordCount, setTotalRecordCount] = useState(0)
        const [noData, setNoData] = useState(false)
        const [viewRfq, setViewRfq] = useState(false)
        const [closeViewRfq, setCloseViewRfq] = useState(false)
        const [viewRfqData, setViewRfqData] = useState("")
        const [addAccessibility, setAddAccessibility] = useState(false);
        const [editAccessibility, setEditAccessibility] = useState(false);
        const [viewAccessibility, setViewAccessibility] = useState(false);
        const [confirmPopup, setConfirmPopup] = useState(false);
        const [attachment, setAttachment] = useState(false);
        const [viewAttachment, setViewAttachment] = useState([])
        const [deleteId, setDeleteId] = useState('');
        const { t } = useTranslation("Common");
        const [showAddFrom, setShowAddFrom] = useState(false)
        const [showExtraData, setShowExtraData] = useState(false)
        const [render, setRender] = useState(false)
        const [permissionDataPart, setPermissionDataPart] = useState()
        const [permissionDataVendor, setPermissionDataVendor] = useState()
        const [permissionData, setPermissionData] = useState()
        const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
        const { globalTakes } = useSelector((state) => state.pagination);
        const [warningMessage, setWarningMessage] = useState(false)
        const [disableDownload, setDisableDownload] = useState(false)

        const [disableFilter, setDisableFilter] = useState(false)
        const [remarkHistoryDrawer, setRemarkHistoryDrawer] = useState(false)
        const [remarkRowData, setRemarkRowData] = useState([])
        const [floatingFilterData, setFloatingFilterData] = useState({
            QuotationNumber: "",
            PartType: "",
            PartNumber: "",
            RawMaterial: "",
            NoOfQuotationReceived: "",
            VendorName: "", // Will be mapped to vendorCode in API call
            PlantName: "", // Will be mapped to plantCode in API call
            TechnologyName: "",
            RaisedBy: "",
            RaisedOn: "",
            PartDataSentDate: "",
            VisibilityMode: "",
            VisibilityDate: "",
            VisibilityDuration: "",
            LastSubmissionDate: "",
            Status: "",
            BoughtOutPart: "", // Will be mapped to boughtOutPart in API call
            PRNumber: "",
            Notes: "",
        });

        const [filterModel, setFilterModel] = useState({});
        const { technologyLabel, vendorLabel } = useLabels();

        const { topAndLeftMenuData } = useSelector(state => state.auth);
        const agGridRef = useRef(null);
        const statusColumnData = useSelector((state) => state.comman.statusColumnData);
        const history = useHistory();
        const location = useLocation();
        const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
        const hideRemarkHistoryIcon = initialConfiguration?.IsManageSeparateUserPermissionForPartAndVendorInRaiseRFQ;


        useEffect(() => {
            return () => {
                dispatch(setSelectedRowForPagination([]))
                dispatch(resetStatePagination());
            }
        }, [])

        useEffect(() => {
            if (rowData?.length > 0) {
                setTotalRecordCount(rowData[0].TotalRecordCount)
            }
        }, [rowData])
        useEffect(() => {
            dispatch(agGridStatus("", ""))
            // setloader(true)
            getDataList()
            applyPermission(topAndLeftMenuData)
        }, [topAndLeftMenuData])
        useEffect(() => {
            // Only set filter if coming from status column and not from ViewRfq close
            if (statusColumnData?.data && !closeViewRfq && !viewRfq) {
                setDisableFilter(false);
                setWarningMessage(true);
                setFloatingFilterData(prevState => ({
                    ...prevState,
                    Status: removeSpaces(statusColumnData.data)
                }));
            }
        }, [statusColumnData, closeViewRfq]);
        useEffect(() => {
            const { source, quotationId } = location.state || {};

            if (source === 'auction') {
                if (rowData && rowData.length !== 0) {
                    const fiterRowData = rowData.find(item => item?.QuotationId === quotationId);
                    viewDetails(fiterRowData);
                }
            }
        }, [rowData])
        useEffect(() => {
            const handleBeforeUnload = (event) => {
                history.push({
                    pathname: '/rfq-listing',
                    state: { source: 'rfq' }
                })
            };
            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }, []);
        // Create base filter params
        const baseFilterParams = {
            date: "",
            inRangeInclusive: true,
            filterOptions: ['equals', 'inRange'],
            browserDatePicker: true,
            minValidYear: 2000,
        };

        // Simplified date comparator function
        const createDateComparator = (fieldName) => (filterLocalDateAtMidnight, cellValue) => {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';

            setDate(newDate, fieldName);

            // Handle radio button click
            let date = document.getElementsByClassName('ag-input-field-input')
            for (let i = 0; i < date.length; i++) {
                if (date[i].type == 'radio') {
                    date[i].click()
                }
            }

            if (dateAsString == null) return -1;
            var dateParts = dateAsString.split('/');
            var cellDate = new Date(
                Number(dateParts[2]),
                Number(dateParts[1]) - 1,
                Number(dateParts[0])
            );

            return filterLocalDateAtMidnight.getTime() === cellDate.getTime() ? 0
                : cellDate < filterLocalDateAtMidnight ? -1 : 1;
        };

        // Simplified filter params
        const raisedOnFilterParams = {
            ...baseFilterParams,
            comparator: createDateComparator('RaisedOn')
        };

        const partDataSentFilterParams = {
            ...baseFilterParams,
            comparator: createDateComparator('PartDataSentDate')
        };

        const visibilityDateFilterParams = {
            ...baseFilterParams,
            comparator: createDateComparator('VisibilityDate')
        };

        const lastSubmissionDateFilterParams = {
            ...baseFilterParams,
            comparator: createDateComparator('LastSubmissionDate')
        };

        /**
         * @method applyPermission
         * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
         */
        const applyPermission = (topAndLeftMenuData) => {
            if (topAndLeftMenuData !== undefined) {
                const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el?.ModuleName === RFQ);
                const accessData = Data && Data.Pages.find(el => el?.PageName === RFQ)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
                const accessDataVendor = Data && Data.Pages.find(el => el?.PageName === RFQVendor)
                const permmisionDataVendor = accessDataVendor && accessDataVendor.Actions && checkPermission(accessDataVendor.Actions)

                if (permmisionData !== undefined || permmisionDataVendor !== undefined) {
                    setPermissionData({
                        permissionDataPart: permmisionData,
                        permissionDataVendor: permmisionDataVendor
                    });
                    setPermissionDataPart(permmisionData);
                    setPermissionDataVendor(permmisionDataVendor)
                    setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false)
                    setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false)
                    setViewAccessibility(permmisionData && permmisionData.View ? permmisionData.View : false)
                }
            }
        }

        const setDate = (date, column) => {


            // Map column names to state fields
            const fieldMapping = {
                'RaisedOn': 'RaisedOn',
                'PartDataSentDate': 'PartDataSentDate',
                'VisibilityDate': 'VisibilityDate',
                'LastSubmissionDate': 'LastSubmissionDate'
            };

            // Get the correct field name
            const fieldName = fieldMapping[column] || column;

            setFloatingFilterData(prevState => ({
                ...prevState,
                [fieldName]: date // Use the mapped field name
            }));
        };

        const getDataList = useCallback((skip = 0, take = 10, isPagination = true) => {
            if (isPagination) {
                setloader(true)
            }


            // Construct query parameters
            const queryParams = {
                departmentCode: userDetails()?.DepartmentCode,
                loggedInUserId: loggedInUserId(),
                timeZone: getTimeZone(),
                isApplyPagination: isPagination,
                skip: skip,
                take: take,
                // Add all filter parameters
                quotationNumber: floatingFilterData.QuotationNumber || '',
                partNumber: floatingFilterData.PartNumber || '',
                rawMaterial: floatingFilterData.RawMaterial || '',
                boughtOutPart: floatingFilterData.BoughtOutPart || '',
                noOfQuotationReceived: floatingFilterData.NoOfQuotationReceived || '',
                vendorCode: floatingFilterData.VendorName || '',
                plantCode: floatingFilterData.PlantName || '',
                technologyName: floatingFilterData.TechnologyName || '',
                raisedBy: floatingFilterData.RaisedBy || '',
                raisedOn: floatingFilterData.RaisedOn || '',
                lastSubmissionDate: floatingFilterData.LastSubmissionDate || '',
                visibilityMode: floatingFilterData.VisibilityMode || '',
                visibilityDate: floatingFilterData.VisibilityDate || '',
                visibilityDuration: floatingFilterData.VisibilityDuration || '',
                status: floatingFilterData.Status || '',
                partType: floatingFilterData.PartType || '',
                partDataSentDate: floatingFilterData.PartDataSentDate || '',
                notes: floatingFilterData.Remark || ''
            };

            const encodedQueryParams = encodeQueryParamsAndLog(queryParams);

            dispatch(getQuotationList(encodedQueryParams, (res) => {
                if (res?.status === 200) {
                    const formattedData = res?.data?.DataList?.map(item => ({
                        ...item,
                        Status: item?.IsActive === false ? "Cancelled" : item.Status,
                        tooltipText: getTooltipText(item?.Status)
                    })) || [];

                    setRowData(formattedData);
                    setloader(false);

                    if (res?.data?.DataList?.[0]) {
                        setTotalRecordCount(res.data.DataList[0].TotalRecordCount);
                    }

                    // Handle filter model updates
                    if (res) {
                        const isReset = !Object.values(floatingFilterData).some(value => value !== "");
                        setTimeout(() => {
                            isReset ?
                                gridOptions?.api?.setFilterModel({}) :
                                gridOptions?.api?.setFilterModel(filterModel);
                        }, 300);
                        setWarningMessage(false);
                        setIsFilterButtonClicked(false);
                    }
                } else {
                    setloader(false);
                    setTotalRecordCount(0);
                }
            }));
        }, [floatingFilterData, filterModel, dispatch]);

        const getTooltipText = useMemo(() => (status) => {
            switch (status) {
                case APPROVED: return 'Total no. of parts for which costing has been approved from that quotation / Total no. of parts exist in that quotation'
                case RECEIVED: return 'Total no. of costing received / Total no. of expected costing in that quotation'
                case UNDER_REVISION: return 'Total no. of costing under revision / Total no. of expected costing in that quotation'
                case DRAFT: return 'The token is pending to send for approval from your side.'
                case CANCELLED: return 'Quotation has been cancelled.'
                case SENT: return 'Costing under the quotation has been sent.'
                case REJECTED: return 'Quotation has been rejected.'
                case RETURNED: return 'Quotation has been returned.'
                case PREDRAFT: return 'Quotation pre-drafted, parts details saved.'
                default: return ''
            }
        }, [])

        const onFloatingFilterChanged = useCallback((value) => {
            setDisableFilter(false);

            const model = gridOptions?.api?.getFilterModel();
            setFilterModel(model);

            // Show warning if filter changed but not applied
            if (!isFilterButtonClicked) {
                setWarningMessage(true);
            }

            // Handle filter changes
            if (value?.filterInstance?.appliedModel === null ||
                value?.filterInstance?.appliedModel?.filter === "") {
                // Clear the filter value
                setFloatingFilterData(prev => ({
                    ...prev,
                    [value.column.colId]: ""
                }));
            } else {
                // Handle date fields
                const dateFields = ['RaisedOn', 'PartDataSentDate', 'VisibilityDate', 'LastSubmissionDate'];

                if (dateFields.includes(value.column.colId)) {
                    const dateValue = value.filterInstance.appliedModel.dateFrom;
                    setFloatingFilterData(prev => ({
                        ...prev,
                        [value.column.colId]: dateValue ? DayTime(dateValue).format('DD/MM/YYYY') : ""
                    }));
                } else {
                    // Handle non-date fields
                    setFloatingFilterData(prev => ({
                        ...prev,
                        [value.column.colId]: value.filterInstance.appliedModel.filter
                    }));
                }
            }

            // Check for empty results
            setTimeout(() => {
                if (rowData.length !== 0) {
                    setNoData(searchNocontentFilter(value, noData));
                }
            }, 500);
        }, [rowData, isFilterButtonClicked, noData]);

        const resetState = () => {
            setNoData(false)
            dispatch(agGridStatus("", ""))

            // setinRangeDate([])
            setIsFilterButtonClicked(false)
            gridOptions?.columnApi?.resetColumnState(null);
            gridOptions?.api?.setFilterModel(null);

            for (var prop in floatingFilterData) {

                if (getConfigurationKey().IsCompanyConfigureOnPlant) {
                    if (prop !== "DepartmentName") {
                        floatingFilterData[prop] = ""
                    }
                } else {
                    floatingFilterData[prop] = ""
                }
            }

            setFloatingFilterData(floatingFilterData)
            setWarningMessage(false)
            dispatch(updatePageNumber(1))
            dispatch(updateCurrentRowIndex(10))
            getDataList(0, 10, true)
            dispatch(setSelectedRowForPagination([]))
            dispatch(updateGlobalTake(10))
            dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }))
            reactLocalStorage.setObject('selectedRow', {})

        }

        const onSearch = () => {
            setNoData(false)
            setWarningMessage(false)
            setIsFilterButtonClicked(true)
            dispatch(updatePageNumber(1))
            dispatch(updateCurrentRowIndex(10))
            gridOptions?.columnApi?.resetColumnState();
            getDataList(0, globalTakes, true)
        }

        /**
        * @method hideForm
        * @description HIDE DOMESTIC, IMPORT FORMS
        */

        const handleFilterChange = () => {
            if (agGridRef.current) {
                setTimeout(() => {
                    if (!agGridRef.current.rowRenderer.allRowCons.length) {
                        setNoData(true)
                        dispatch(getGridHeight({ value: 3, component: 'RFQ' }))
                    } else {
                        setNoData(false)
                    }
                }, 100);

            }
        };

        const floatingFilterRFQ = {
            maxValue: 11,
            suppressFilterButton: true,
            component: "RFQ",
            onFilterChange: handleFilterChange,
            // Add the filtered status options
            // values: getFilteredStatusDropdown
        };
        //**  HANDLE TOGGLE EXTRA DATA */
        const toggleExtraData = (showTour) => {
            setRender(true)
            setTimeout(() => {
                setShowExtraData(showTour)
                setRender(false)
            }, 100);


        }


        /**
        * @method editItemDetails
        * @description edit material type
        */
        const viewOrEditItemDetails = (Id, rowData = {}, isViewMode, isEditMode) => {

            let data = {
                isEditFlag: isEditMode,
                isViewFlag: isViewMode,
                rowData: rowData,
                Id: Id,
                isAddFlag: false // Explicitly set this to false for edit mode

            }
            setAddRfqData(data)
            setShowAddFrom(true)
        }

        const cancelItem = (id) => {
            setConfirmPopup(true)
            setDeleteId(id)
        }

        const onPopupConfirm = () => {
            dispatch(cancelRfqQuotation(deleteId, (res) => {
                if (res.status === 200) {
                    Toaster.success('Quotation has been cancelled successfully.')
                    setTimeout(() => {
                        getDataList()
                    }, 500);
                }
                setConfirmPopup(false)
            }))
        }

        const closePopUp = () => {
            setConfirmPopup(false)
        }
        const getRemarkHistory = (cell, rowData) => {
            setRemarkRowData(rowData)

            setTimeout(() => {
                setRemarkHistoryDrawer(true)
            }, 500);

        }
        /**
        * @method buttonFormatter
        * @description Renders buttons
        */
        const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let status = rowData?.Status;

        

        // Helper function to check if quotation is complete
        const isQuotationComplete = () => {
            return rowData?.CostingReceived === rowData?.TotalCostingCount && 
                rowData?.TotalCostingCount > 0;
        };

        // Helper function to check if status allows editing
        const isEditableStatus = () => {
            // Non-editable statuses
            const nonEditableStatuses = [
                APPROVED, 
                REJECTED, 
                AWARDED, 
                NON_AWARDED,
                CANCELLED
            ];
            
            // If status is in non-editable list, return false
            if (nonEditableStatuses.includes(status)) {
                return false;
            }

            // For RECEIVED status
            if (status === RECEIVED) {
                // Allow edit if submission date is valid AND quotation is not complete
                return !isQuotationComplete();
            }

            // For UNDER_REVISION status
            if (status === UNDER_REVISION) {
                // Don't allow edit if quotation is complete
                return !isQuotationComplete();
            }

            // Only allow edit for DRAFT, PREDRAFT, and SENT statuses
            return [DRAFT, PREDRAFT, SENT].includes(status);
        };

        return (
            <>
                {/* View button */}
                {(viewAccessibility || permissionData?.permissionDataVendor?.View) && 
                    <button 
                        title='View' 
                        className="View mr-1 Tour_List_View" 
                        type={'button'} 
                        onClick={() => viewOrEditItemDetails(cellValue, rowData, true, false)} 
                    />
                }

                {/* Edit button */}
                {isEditableStatus() && (editAccessibility || permissionData?.permissionDataVendor?.Edit) && 
                    <button 
                        title='Edit' 
                        className="Edit mr-1 Tour_List_Edit" 
                        type={'button'} 
                        onClick={() => viewOrEditItemDetails(cellValue, rowData, false, true)} 
                    />
                }

                {/* Cancel button */}
                {(status === DRAFT || status === PREDRAFT || status === SENT) && 
                rowData?.IsShowCancelIcon && 
                    <button 
                        title='Cancel' 
                        className="CancelIcon mr-1 Tour_List_Cancel" 
                        type={'button'} 
                        onClick={() => cancelItem(cellValue)} 
                    />
                }

                {/* Remark History button */}
                {hideRemarkHistoryIcon && 
                    <button 
                        title='Remark History' 
                        id='ViewRfq_remarkHistory' 
                        className="btn-history-remark mr-1" 
                        type={'button'} 
                        onClick={() => getRemarkHistory(cellValue, rowData)}
                    >
                        <div className='history-remark'></div>
                    </button>
                }
            </>
        );
    };
        const formToggle = () => {
            setShowAddFrom(true)
            let data = {
                isAddFlag: true,
                isEditFlag: false,
                isViewFlag: false,

            }
            setAddRfqData(data)
        }

        const closeDrawer = () => {
            setAddRfqData({})
            setShowAddFrom(false)
            // setAddRfq(false)
            getDataList()

        }


        const closeDrawerViewRfq = () => {
            dispatch(agGridStatus("", ""));
            setFloatingFilterData(prev => ({
                ...prev,
                Status: ""
            }));
            setViewRfq(false);
            setCloseViewRfq(true);
            getDataList();
        };


        const onGridReady = (params) => {
            agGridRef.current = params.api;
            setgridApi(params.api);
            setgridColumnApi(params.columnApi);
            params.api.paginationGoToPage(0);
        };



        const onFilterTextBoxChanged = (e) => {
            gridApi.setQuickFilter(e.target.value);
        }


        const linkableFormatter = (props) => {

            const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
            const row = props?.valueFormatted ? props?.valueFormatted : props?.data;

            if (row?.IsActive) {
                return (
                    <>
                        <div
                            id='showRfq_detail'
                            onClick={() => viewDetails(row)}
                            className={'link'}
                        >{cell}</div>
                    </>
                )
            } else {

                return cell ? cell : "-"

            }
        }
        const quotationReceiveFormatter = (props) => {

            const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
            const row = props?.valueFormatted ? props?.valueFormatted : props?.data;

            if (row?.IsActive) {
                return (
                    <>
                        {cell >= 1 ? <div
                            onClick={() => viewDetails(row)}
                            className={'link'}
                        >{cell}</div> : <div>{cell}</div>}
                    </>
                )
            } else {

                return cell ? cell : "-"

            }
        }
        const statusFormatter = (props) => {
            dispatch(getGridHeight({ value: agGridRef.current.rowRenderer.allRowCons.length, component: 'RFQ' }))
            const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
            const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
            let tempStatus = '-'
            if (row?.Status === APPROVED || row?.Status === UNDER_REVISION || row?.Status === RECEIVED || row?.Status === SUBMITTED || row?.Status === UNDER_APPROVAL) {
                tempStatus = row?.DisplayStatus + ' (' + row?.CostingReceived + '/' + row?.TotalCostingCount + ')'
            } else {
                tempStatus = row?.DisplayStatus ?? '-'
            }
            return <div className={cell}>{tempStatus}</div>
        }

        const viewAttachmentData = (index) => {
            setAttachment(true)
            setViewAttachment(index)
        }

        const closeAttachmentDrawer = (e = '') => {
            setAttachment(false)
        }
        const dashFormatter = (props) => {
            const cellValue = props?.value;
            return cellValue ? cellValue : '-';
        }


        const dateFormatter = (props) => {
            const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
            return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
        }

        const dateTimeFormatter = (props) => {
            const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
            return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY  hh:mm') : '-';
        }


        const attachmentFormatter = (props) => {
            const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
            let files = row?.Attachments

            return (
                <>
                    <div className={"attachment images"}>
                        {files && files.length === 1 ?
                            files.map((f) => {
                                const withOutTild = f.FileURL?.replace("~", "");
                                const fileURL = `${FILE_URL}${withOutTild}`;
                                return (
                                    <a href={fileURL} target="_blank" rel="noreferrer">
                                        {f.OriginalFileName}
                                    </a>
                                )

                            }) : <button
                                type='button'
                                title='View Attachment'
                                className='btn-a pl-0'
                                onClick={() => viewAttachmentData(row)}
                            >View Attachment</button>}
                    </div>
                </>
            )

        }


        const viewDetails = (rowData) => {

            setViewRfqData(rowData)

            setViewRfq(true)
            // this.setState({
            //     UserId: UserId,
            //     isOpen: true,
            // })

        }


        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: false,
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
        const closeRemarkDrawer = (type) => {
            setRemarkHistoryDrawer(false)
        }
        const frameworkComponents = {
            totalValueRenderer: buttonFormatter,
            linkableFormatter: linkableFormatter,
            customNoRowsOverlay: NoContentFound,
            quotationReceiveFormatter: quotationReceiveFormatter,
            attachmentFormatter: attachmentFormatter,
            statusFormatter: statusFormatter,
            dateFormatter: dateFormatter,
            dashFormatter: dashFormatter,
            dateTimeFormatter: dateTimeFormatter,
            valuesFloatingFilter: SingleDropdownFloationFilter,
            hyphenFormatter: hyphenFormatter,
            cellRendererFramework: CustomCellRenderer
        }


        return (
            <>
                {!showAddFrom && permissionData !== undefined &&
                    <div className={`ag-grid-react report-grid p-relative  ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "" : ""} ${true ? "show-table-btn" : ""} ${false ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                        {(loader ? <LoaderCustom customClass="simulation-Loader" /> : !viewRfq && (
                            <>
                                <Row className={`filter-row-large pt-2 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>

                                    <Col md="3" lg="3" className='mb-2'>

                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                        <TourWrapper
                                            buttonSpecificProp={{ id: "Rfq_listing_Tour", onClick: toggleExtraData }}
                                            stepsSpecificProp={{
                                                steps: Steps(t, { Cancel: true, showRfqDetail: true, filterButton: false, downloadButton: false, bulkUpload: false, DeleteButton: false, costMovementButton: false, addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                            }} />
                                    </Col>
                                    <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                                        {
                                            // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                            (!props?.isMasterSummaryDrawer) &&
                                            <>
                                                <div className="d-flex justify-content-end bd-highlight w100">
                                                    <>
                                                        {(props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                                            <div className="warning-message d-flex align-items-center">
                                                                {warningMessage && !disableDownload && (<><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>)}
                                                            </div>
                                                        }
                                                        {

                                                            <Button
                                                                id="rfqlisting_filter"
                                                                className={"mr5 Tour_List_Filter"}
                                                                onClick={() => onSearch()}
                                                                title={"Filtered data"}
                                                                icon={"filter"}
                                                                disabled={disableFilter}
                                                            />

                                                        }

                                                        {(addAccessibility || permissionData?.permissionDataVendor?.Add) && (<button
                                                            type="button"
                                                            className={"user-btn mr5 Tour_List_Add"}
                                                            onClick={formToggle}
                                                            title="Add"
                                                        >
                                                            <div className={"plus mr-0"}></div>
                                                            {/* ADD */}
                                                        </button>)}

                                                    </>
                                                </div>

                                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                                    <div className="refresh mr-0 Tour_List_Reset"></div>
                                                </button>
                                            </>
                                        }
                                    </Col>

                                </Row>
                                <Row>
                                    <Col>
                                        <div className={`ag-grid-wrapper ${(props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(rowData && rowData?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                            <div className={`ag-theme-material ${(loader) && "max-loader-height"}`}>
                                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}

                                                {render ? <LoaderCustom customClass="loader-center" /> :

                                                    <AgGridReact
                                                        style={{ height: '100%', width: '100%' }}
                                                        defaultColDef={defaultColDef}
                                                        floatingFilter={true}
                                                        ref={agGridRef}
                                                        domLayout='autoHeight'
                                                        rowData={showExtraData ? [...setLoremIpsum(rowData[0]), ...rowData] : rowData}
                                                        // pagination={true}
                                                        paginationPageSize={globalTakes}
                                                        onGridReady={onGridReady}
                                                        gridOptions={gridOptions}
                                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                                        noRowsOverlayComponentParams={{
                                                            title: EMPTY_DATA,
                                                            imagClass: 'imagClass'
                                                        }}
                                                        frameworkComponents={frameworkComponents}
                                                        rowSelection={'multiple'}
                                                        suppressRowClickSelection={true}
                                                        onFilterModified={onFloatingFilterChanged}
                                                        enableBrowserTooltips={true}
                                                    >
                                                        <AgGridColumn cellClass="has-checkbox" field="QuotationNumber" headerName='RFQ No.' cellRenderer={'linkableFormatter'} ></AgGridColumn>
                                                        {initialConfiguration?.RFQManditField?.IsShowNFRNo && <AgGridColumn field="NfrId" headerName='NFR Id' width={150}></AgGridColumn>}
                                                        <AgGridColumn field="PartType" headerName="Part Type" width={150} cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                                        <AgGridColumn field="PartNumber" tooltipField="PartNumber" headerName="Part No." width={150} cellRendererFramework={CustomCellRenderer} />
                                                        {RFQ_KEYS?.SHOW_RM && <AgGridColumn field="RawMaterial" tooltipField="PartNumber" headerName="Raw Material Name-Grade-Specification" width={230} cellRendererFramework={CustomCellRenderer}></AgGridColumn>}
                                                        {RFQ_KEYS?.SHOW_BOP && <AgGridColumn field="BoughtOutPart" headerName={`${showBopLabel()} Name (${showBopLabel()} No.)`} width={200} cellRendererFramework={CustomCellRenderer}></AgGridColumn>}
                                                        {initialConfiguration?.RFQManditField?.IsShowPRNumber && (RFQ_KEYS?.SHOW_BOP||RFQ_KEYS?.SHOW_TOOLING) && <AgGridColumn field="PRNumber" headerName="PR No." width={150} cellRenderer={"hyphenFormatter"}></AgGridColumn>}

                                                        <AgGridColumn field="NoOfQuotationReceived" headerName='Quotation Received (No.)' maxWidth={150} cellRenderer={'quotationReceiveFormatter'}></AgGridColumn>
                                                        <AgGridColumn field="VendorName" tooltipField="VendorName" headerName={vendorLabel + " (Code)"} cellRendererFramework={CustomCellRenderer}></AgGridColumn>
                                                        <AgGridColumn field="PlantName" tooltipField="PlantName" headerName='Plant (Code)'></AgGridColumn>
                                                        <AgGridColumn field="TechnologyName" width={"160px"} headerName={technologyLabel}></AgGridColumn>
                                                        {initialConfiguration?.IsManageSeparateUserPermissionForPartAndVendorInRaiseRFQ && <AgGridColumn field="RaisedBy" width={"160px"} headerName='Initiated By'></AgGridColumn>}
                                                        <AgGridColumn field="RaisedBy" headerName='Raised By' cellRenderer='dashFormatter' ></AgGridColumn>
                                                        <AgGridColumn field="RaisedOn" headerName="Raised On" cellRenderer="dateFormatter" filter="agDateColumnFilter" filterParams={raisedOnFilterParams} />
                                                        {initialConfiguration?.IsManageSeparateUserPermissionForPartAndVendorInRaiseRFQ && <AgGridColumn field="PartDataSentDate" headerName="RFI Date" cellRenderer="dateFormatter" filter="agDateColumnFilter" filterParams={partDataSentFilterParams} />}
                                                        <AgGridColumn field="VisibilityMode" width={"200px"} headerName='Visibility Mode' cellRenderer='dashFormatter'></AgGridColumn>
                                                        <AgGridColumn field="VisibilityDate" headerName="Visibility Date" cellRenderer="dateFormatter" filter="agDateColumnFilter" filterParams={visibilityDateFilterParams} />
                                                        <AgGridColumn field="VisibilityDuration" width={"150px"} headerName='Visibility Duration' cellRenderer='dashFormatter'></AgGridColumn>
                                                        {/* <AgGridColumn field="TimeZone" width={"150px"} headerName='Time Zone' cellRenderer='timeZoneFormatter'></AgGridColumn> */}
                                                        <AgGridColumn field="LastSubmissionDate" headerName="Last Submission Date" cellRenderer="dateFormatter" filter="agDateColumnFilter" filterParams={lastSubmissionDateFilterParams} />
                                                        <AgGridColumn field="QuotationNumber" floatingFilter={false} headerName='Attachments' cellRenderer='attachmentFormatter'></AgGridColumn>
                                                        <AgGridColumn field="Remark" tooltipField="Remark" headerName='Notes' cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                                        {/* <AgGridColumn field="Status" tooltipField="tooltipText" headerName="Status" headerClass="justify-content-center" cellClass="text-center" cellRenderer="statusFormatter" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterRFQ} /> */}
                                                        <AgGridColumn field="Status" tooltipField="tooltipText" headerName="Status" headerClass="justify-content-center" cellClass="text-center" cellRenderer="statusFormatter" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterRFQ}></AgGridColumn>
                                                        {<AgGridColumn field="QuotationId" width={180} cellClass="ag-grid-action-container rfq-listing-action" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}

                                                    </AgGridReact>}

                                                <div className='button-wrapper'>
                                                    {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RFQ" />}
                                                    {/* {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) && */}
                                                    <PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RFQ" />

                                                    {/* } */}

                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                            </>))
                        }

                        {viewRfq &&

                            <ViewRfq
                                data={viewRfqData}
                                isOpen={viewRfq}
                                getDataList={getDataList}
                                closeDrawer={closeDrawerViewRfq}
                            />

                        }

                        {
                            confirmPopup && <PopupMsgWrapper isOpen={confirmPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RFQ_DETAIL_CANCEL_ALERT}`} />
                        }

                    </div >
                }
                <ApplyPermission.Provider value={permissionData}>

                    {showAddFrom &&

                        <AddRfq
                            data={addRfqData}
                            isRMAssociated={true}
                            isOpen={showAddFrom}
                            anchor={"right"}
                            isEditFlag={addRfqData?.isEditFlag}
                            isViewFlag={addRfqData?.isViewFlag}
                            isAddFlag={addRfqData?.isAddFlag}
                            closeDrawer={closeDrawer}
                        />

                    }
                </ApplyPermission.Provider>


                {
                    attachment && (
                        <Attachament
                            isOpen={attachment}
                            index={viewAttachment}
                            closeDrawer={closeAttachmentDrawer}
                            anchor={'right'}
                            gridListing={true}
                        />
                    )
                }
                {remarkHistoryDrawer &&
                    <RemarkHistoryDrawer
                        data={remarkRowData}
                        //hideForm={hideForm}
                        AddAccessibilityRMANDGRADE={true}
                        EditAccessibilityRMANDGRADE={true}
                        isRMAssociated={true}
                        isOpen={remarkHistoryDrawer}
                        anchor={"right"}
                        isEditFlag={showAddFrom?.isEditFlag}
                        rfqListing={true}
                        closeDrawer={closeRemarkDrawer}
                    />
                }


            </>
        );
    }

    export default React.memo(RfqListing);

