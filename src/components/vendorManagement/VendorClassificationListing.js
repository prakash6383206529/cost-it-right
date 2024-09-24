import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { fetchVendorData, getVendorClassificationListing, updateClassificationStatus } from './Action';
import Toaster from '../common/Toaster';
import Switch from "react-switch";
import { checkPermission, loggedInUserId, showTitleForActiveToggle } from '../../helper';
import LoaderCustom from '../common/LoaderCustom';
import { Col, Row } from 'reactstrap';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA, MASTERS, VENDOR_CLASSIFICATION, VENDOR_MANAGEMENT, VENDOR_MANAGEMENT_ROLE } from '../../config/constants';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import DayTime from '../common/DayTimeWrapper';
import { filterParams } from '../common/DateFilter';
import Button from '../layout/Button';
import { useLabels } from '../../helper/core';
const gridOptions = {};

const VendorClassificationListing = () => {
    const searchRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState('')
    const { vendorLabel } = useLabels();

    const [renderState, setRenderState] = useState(true);
    const [isLoader, setIsLoader] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showPopupToggle, setShowPopupToggle] = useState(false)
    const [cellValue, setCellValue] = useState('');
    const [cellData, setCellData] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [ActivateAccessibility, setActivateAccessibility] = useState(false);
    const [render, setRender] = useState(false)
    const [showExtraData, setShowExtraData] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridLoad, setGridLoad] = useState(false)




    const dispatch = useDispatch();
    const supplierManagement = useSelector(state => state?.supplierManagement?.vendorData) || [];
    const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData);
    useEffect(() => {
        getTableListData()
    }, [])
    useEffect(() => {
        applyPermission(topAndLeftMenuData)
        // getTableListData()

    }, [topAndLeftMenuData]);
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            setGridLoad(true)

            const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
            const accessData = Data && Data.Pages.find((el) => el.PageName === VENDOR_MANAGEMENT)
            const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permissionData !== undefined) {
                setActivateAccessibility(permissionData && permissionData.Activate ? permissionData.Activate : false);
            }
        }
    }

    const toggleExtraData = (showTour) => {

        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 100);


    }
    const getTableListData = () => {
        setIsLoader(true)
        dispatch(getVendorClassificationListing((res) => {
            if (res.errorMessage) {
                setErrorMessage(res.errorMessage);
            }
            if (res?.status === 204 && res?.data === '') {
                setTableData([])
            } else if (res && res?.data && res?.data?.DataList) {
                let Data = res?.data?.DataList
                setTableData(Data)
                setRenderState(!renderState)
                setCellValue(Data?.map(row => row.updatedStatus === 'Active'));

            }
            setTableData([])
            setIsLoader(false)

        }))
    }
    const confirmDeactivateItem = (data, cell) => {
        dispatch(updateClassificationStatus(data, res => {
            if (res && res?.data && res?.data?.Result) {
                if (cell === "Unblocked") {
                    Toaster.success(MESSAGES?.CLASSIFICATION_BLOCK_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES?.CLASSIFICATION_UNBLOCK_SUCCESSFULLY)
                }
                getTableListData()
                // setDataCount(0)
            }
        }))
        setShowPopupToggle(false)
    }
    const onPopupConfirmToggle = () => {
        confirmDeactivateItem(cellData, cellValue)
    }
    const handleChange = (cell, row, index) => {
        const status = row?.IsBlocked === true ? false : true
        let data = {
            ClassificationId: row.ClassificationId,
            LoggedInUserId: loggedInUserId(),
            IsBlocked: status, // Toggle the status
        }

        setCellData(data);
        setCellValue(cell)
        setShowPopupToggle(true);
    }
    const statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (rowData.UserId === loggedInUserId()) return null;
        showTitleForActiveToggle(props?.rowIndex, rowData?.Status, rowData?.Status);
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => handleChange(cellValue, rowData)}
                        checked={cellValue === "Blocked"}
                        disabled={!ActivateAccessibility}
                        background="#ff6600"
                        onColor="#FC5774"
                        onHandleColor="#ffffff"
                        offColor="#4DC771"
                        id="normal-switch"
                        height={24}
                        className={cellValue ? "active-switch" : "inactive-switch"}
                    />
                </label>
            </>
        )
    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };
    const onGridReady = (params) => {
        setGridApi(params.api)
        // setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        // agGridRef.current = params.api;
        params.api.sizeColumnsToFit();
    };

    const closePopUp = () => {
        setShowPopup(false)
        setShowPopupToggle(false)
    }
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        statusButtonFormatter: statusButtonFormatter,
        effectiveDateFormatter: effectiveDateFormatter
    };

    const resetState = () => {
        gridApi.setQuickFilter(null)
        gridApi.deselectAll();
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        if (searchRef.current) {
            searchRef.current.value = '';
        }
    }
    return (
        <> <div className={`ag-grid-react container-fluid p-relative`} id='go-to-top'>

            <>
                <Row className="pb-4 mb-3 no-filter-row zindex-2">
                    <Col md={3}>
                        <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />
                    </Col>
                    <Col md={9}>
                        <div className="d-flex justify-content-end bd-highlight w100 ">
                            <div className="d-flex">
                                <Button id={"vendorClassification_Listing_refresh"} className="user-btn Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                            </div>
                        </div>
                    </Col>
                </Row>
                {gridLoad && <div className={`ag-grid-wrapper height-width-wrapper`}>
                    <div className={`ag-theme-material`}>
                        {isLoader && <LoaderCustom customClass="loader-center" />}

                        {!isLoader && <AgGridReact

                            style={{ height: '100%', width: '100%' }}

                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={supplierManagement}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass pt-3'
                            }}
                            suppressRowClickSelection={true}
                            frameworkComponents={frameworkComponents}
                        >
                            <AgGridColumn field="ClassificationName" headerName={vendorLabel +"Classification"}></AgGridColumn>
                            <AgGridColumn field="LastUpdatedOn" cellRenderer='effectiveDateFormatter' headerName="Last Updated On" filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>

                            <AgGridColumn field="LastUpdatedByUser" headerName="Last Updated By"></AgGridColumn>
                            <AgGridColumn field="Status" headerName="Type" ></AgGridColumn>

                            <AgGridColumn field="Status" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>

                        </AgGridReact>}
                    </div>

                </div>}
            </>
            {
                showPopupToggle && <PopupMsgWrapper isOpen={showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${cellValue === "Blocked" ? MESSAGES.VENDOR_APPROVED : MESSAGES.VENDOR_REJECTED}`} />
            }
        </div>


        </>

    );
};

export default VendorClassificationListing;
