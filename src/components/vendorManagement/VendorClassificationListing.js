import React, { useEffect, useState } from 'react';
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
import { EMPTY_DATA, VENDOR_CLASSIFICATION, VENDOR_MANAGEMENT } from '../../config/constants';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import DayTime from '../common/DayTimeWrapper';
const gridOptions = {};

const VendorClassificationListing = () => {
    const [renderState, setRenderState] = useState(true);
    const [isLoader, setIsLoader] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showPopupToggle, setShowPopupToggle] = useState(false)
    const [cellValue, setCellValue] = useState('');
    const [cellData, setCellData] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const [noData, setNoData] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [ActivateAccessibility, setActivateAccessibility] = useState(false);
    const [render, setRender] = useState(false)
    const [showExtraData, setShowExtraData] = useState(false)





    const dispatch = useDispatch();
    const supplierManagement = useSelector(state => state?.supplierManagement?.vendorData) || [];

    useEffect(() => {
        applyPermission()
        dispatch(getVendorClassificationListing());
        getTableListData()

    }, [dispatch]);
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            setIsLoader(true)
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === VENDOR_MANAGEMENT);
            const accessData = Data && Data.Pages.find((el) => el.PageName === VENDOR_CLASSIFICATION)
            const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permissionData !== undefined) {
                setActivateAccessibility(permissionData && permissionData.Activate ? permissionData.Activate : false);
            }
            setIsLoader(false)
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
        dispatch(getVendorClassificationListing(true, (res) => {
            setIsLoader(false)
            if (res?.status === 204 && res?.data === '') {
                setTableData([])
                setIsLoader(false)
            } else if (res && res?.data && res?.data?.DataList) {
                let Data = res?.data?.DataList
                setTableData(Data)
                setIsLoader(false)
                setRenderState(!renderState)
                setCellValue(Data?.map(row => row.updatedStatus === 'Active'));

            } else {
                setTableData([])
                setIsLoader(false)
            }
        }))
    }
    const confirmDeactivateItem = (data, cell) => {


        dispatch(updateClassificationStatus(data, res => {
            setIsLoader(false)
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
        const statusId = row?.IsBlocked === true ? 0 : 1
        let data = {
            ClassificationId: row.ClassificationId,
            LoggedInUserId: loggedInUserId(),
            StatusId: statusId, // Toggle the status
        }
        setCellData(data);
        setCellValue(cell)
        setShowPopupToggle(true);
    }
    const statusButtonFormatter = (props) => {

        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        // if (rowData.UserId === loggedInUserId()) return null;
        showTitleForActiveToggle(props?.rowIndex)
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => handleChange(cellValue, rowData)}
                        checked={cellValue === "Blocked"}
                        // disabled={!ActivateAccessibility}
                        background="#ff6600"
                        onColor="#FC5774"
                        onHandleColor="#ffffff"
                        offColor="#4DC771"
                        id="normal-switch"
                        height={24}
                        className={cellValue ? "blocked-switch" : "unblocked-switch"}
                    />
                </label>
            </>
        )
    }
    const defaultColDef = {
        resizable: true,
        // filter: true,
        sortable: false,
    };
    const onGridReady = (params) => {
        // setGridApi(params.api)
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


    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,

        statusButtonFormatter: statusButtonFormatter,
        effectiveDateFormatter: effectiveDateFormatter
    };
    return (
        <>
            {/* {(isLoader) ? <LoaderCustom customClass="loader-center" /> : */}
            <div className={`ag-grid-react container-fluid p-relative`} id='go-to-top'>
                <>
                    <Row className="no-filter-row">
                        <Col md={6} className="text-right filter-block"></Col>
                    </Row>
                    {<div className={`ag-grid-wrapper height-width-wrapper`}>
                        <div className={`ag-theme-material`}>
                            {/* {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />} */}
                            {noData ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

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
                                <AgGridColumn field="ClassificationName" headerName="Supplier Classification"></AgGridColumn>
                                <AgGridColumn field="LastUpdatedOn" cellRenderer='effectiveDateFormatter' headerName="Last Updated On"></AgGridColumn>
                                <AgGridColumn field="LastUpdatedByUser" headerName="Last Updated By"></AgGridColumn>
                                <AgGridColumn field="Status" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                            </AgGridReact>}
                            {!isLoader && (!supplierManagement || supplierManagement?.length === 0) &&
                                <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />
                            }
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
