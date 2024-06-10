import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { fetchLPSRatingData, getLPSRatingListing, updateLPSRatingStatus } from './Action';
import { checkPermission, loggedInUserId, showTitleForActiveToggle } from '../../helper';
import Switch from "react-switch";
import { Col, Row } from 'reactstrap';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA, LPS, LPS_RATING, MASTERS, VENDOR_MANAGEMENT } from '../../config/constants';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import LoaderCustom from '../common/LoaderCustom';
import Toaster from '../common/Toaster';
import DayTime from '../common/DayTimeWrapper';
import { filterParams } from '../common/DateFilter';

const LpsRatingListing = () => {
    const searchRef = useRef(null);
    const [isLoader, setIsLoader] = useState(false);
    const [showPopupToggle, setShowPopupToggle] = useState(false);
    const [cellValue, setCellValue] = useState('');
    const [cellData, setCellData] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const [ActivateAccessibility, setActivateAccessibility] = useState(false);
    const [noData, setNoData] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridLoad, setGridLoad] = useState(false);
    const dispatch = useDispatch();
    const lpsRatingData = useSelector(state => state.supplierManagement.lpsRatingData);
    const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData);

    useEffect(() => {
        setIsLoader(true);
        applyPermission(topAndLeftMenuData)
        dispatch(getLPSRatingListing((res) => {
            if (res.errorMessage) {
                setErrorMessage(res.errorMessage);
                setIsLoader(false);
            }
            else {
                setErrorMessage(null);

                if (res.status === 204 && res.data === '') {
                    setCellValue([]);
                    setIsLoader(false);
                } else if (res?.status === 200 && res?.data && res?.data?.DataList) {
                    setIsLoader(false);
                    let data = res?.data?.DataList;
                    setCellValue(data.map(row => row.status));
                }
                else {
                    setIsLoader(false)
                }
            }

        }));
    }, [dispatch]);
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    const applyPermission = (topAndLeftMenuData) => {

        if (topAndLeftMenuData !== undefined) {
            setIsLoader(true)
            setGridLoad(true)
            const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
            const accessData = Data && Data.Pages.find((el) => el.PageName === LPS)
            const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permissionData !== undefined) {
                setActivateAccessibility(permissionData && permissionData.Activate ? permissionData.Activate : false);
            }
            setIsLoader(false);

        }
    }


    const onPopupConfirmToggle = () => {
        // Handle popup confirmation toggle
        confirmDeactivateItem(cellData, cellValue)
    }

    const confirmDeactivateItem = (data, cell) => {
        dispatch(updateLPSRatingStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === "Unblocked") {
                    Toaster.success(MESSAGES.LPSRATING_BLOCKED_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.LPSRATING_UNBLOCKED_SUCCESSFULLY)
                }
                dispatch(getLPSRatingListing(true))                // setDataCount(0)
            }
        }))
        setShowPopupToggle(false)
    }

    const handleChange = (cell, row, index) => {
        const status = row?.IsBlocked === true ? false : true
        let data = {
            LPSRatingId: row.LPSRatingId,
            IsBlocked: status, // Toggle the status
            LoggedInUserId: loggedInUserId(),
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
        sortable: false,
        filter: true
    };

    const closePopUp = () => {
        setShowPopupToggle(false);
    }
    const onGridReady = (params) => {
        setGridApi(params.api)
        // setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        // agGridRef.current = params.api;
        params.api.sizeColumnsToFit();
    };
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        statusButtonFormatter: statusButtonFormatter,
        effectiveDateFormatter: effectiveDateFormatter
    };

    return (
        <>
            {/* {(isLoader) ? <LoaderCustom customClass="loader-center" /> : */}

            <div className={`ag-grid-react container-fluid p-relative`} id='go-to-top'>
                <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={"off"} onChange={(e) => onFilterTextBoxChanged(e)} />

                <Row className="no-filter-row">
                    <Col md={6} className="text-right filter-block"></Col>
                </Row>
                {gridLoad && <div className={`ag-grid-wrapper height-width-wrapper`}>
                    <div className={`ag-theme-material`}>
                        {isLoader && <LoaderCustom customClass="loader-center" />}
                        {!isLoader && lpsRatingData && lpsRatingData?.length > 0 &&
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={lpsRatingData}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                onGridReady={onGridReady}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass pt-3'
                                }}
                                rowSelection={'multiple'}
                                suppressRowClickSelection={true}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="LPSRatingName" headerName="LPS Rating"></AgGridColumn>
                                <AgGridColumn field="LastUpdatedOn" cellRenderer='effectiveDateFormatter' headerName="Last Updated On" filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                <AgGridColumn field="LastUpdatedByUser" headerName="Last Updated By" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="Status" headerName="Type" ></AgGridColumn>
                                <AgGridColumn field="Status" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>

                            </AgGridReact>
                        }

                    </div>
                </div>}

                {showPopupToggle &&
                    <PopupMsgWrapper isOpen={showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${cellValue === "Blocked" ? MESSAGES.LPS_RATING_UNBLOCK : MESSAGES.LPS_RATING_BLOCK}`} />
                }
            </div>

        </>

    );
};

export default LpsRatingListing;
