import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { fetchVendorData } from './Action';
import Toaster from '../common/Toaster';
import Switch from "react-switch";
import { loggedInUserId, showTitleForActiveToggle } from '../../helper';
import LoaderCustom from '../common/LoaderCustom';
import { Col, Row } from 'reactstrap';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA } from '../../config/constants';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';

const VendorClassification = () => {
    const [renderState, setRenderState] = useState(true);
    const [isLoader, setIsLoader] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [showPopupToggle, setShowPopupToggle] = useState(false)
    const [cellValue, setCellValue] = useState('');
    const [cellData, setCellData] = useState('');
    const [ActivateAccessibility, setActivateAccessibility] = useState(false);
    const [noData, setNoData] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [gridLoad, setGridLoad] = useState(false);





    const dispatch = useDispatch();
    const vendorManagement = useSelector(state => state.vendorManagement.vendorData);


    useEffect(() => {
        dispatch(fetchVendorData());
        getTableListData()

    }, [dispatch]);
    const getTableListData = () => {
        setIsLoader(true)
        dispatch(fetchVendorData(true, (res) => {
            setIsLoader(false)
            if (res.status === 204 && res.data === '') {
                setTableData([])
                setIsLoader(false)
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList
                setTableData(Data)
                setIsLoader(false)
                setRenderState(!renderState)
                setCellValue(Data.map(row => row.updatedStatus === 'Active'));

            } else {
                setTableData([])
                setIsLoader(false)
            }
        }))
    }
    const confirmDeactivateItem = (data, cell) => {
        // dispatch(activeInactiveReasonStatus(data, res => {
        //   if (res && res.data && res.data.Result) {
        //     if (cell === true) {
        //       Toaster.success(MESSAGES.REASON_INACTIVE_SUCCESSFULLY)
        //     } else {
        //       Toaster.success(MESSAGES.REASON_ACTIVE_SUCCESSFULLY)
        //     }
        //     getTableListData()
        //     setDataCount(0)
        //   }
        // }))
        setShowPopupToggle(false)
    }
    const onPopupConfirmToggle = () => {
        // Confirm toggle and update status
        confirmDeactivateItem(cellData);
    }
    const handleChange = (cell, row, index) => {
        let data = {
            Id: row.ReasonId,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, // Toggle the status
        }
        // Update the cellData state
        let updatedCellData = [...cellData];
        updatedCellData[index] = data;
        setCellData(updatedCellData);
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
                        checked={cellValue}
                        // disabled={!ActivateAccessibility}
                        background="#ff6600"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        offColor="#FC5774"
                        id="normal-switch"
                        height={24}
                        className={cellValue ? "active-switch" : "inactive-switch"}
                    />
                </label>
            </>
        )
    }

    // const defaultColDef = {
    //     resizable: true,
    //     // filter: true,
    //     sortable: false,
    //     headerCheckboxSelectionFilteredOnly: true,
    // };
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
    const frameworkComponents = {

        statusButtonFormatter: statusButtonFormatter
    };
    return (
        <>
            <div className={`ag-grid-react container-fluid p-relative`} id='go-to-top'>
                {/* {isLoader && <LoaderCustom customClass="loader-center" />} */}
                <Row className="no-filter-row">
                    <Col md={6} className="text-right filter-block"></Col>
                </Row>
                {<div className={`ag-grid-wrapper height-width-wrapper`}>
                    <div className={`ag-theme-material`}>
                        {/* {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />} */}
                        <AgGridReact
                            // defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={vendorManagement}
                            onGridReady={onGridReady}
                            // gridOptions={gridOptions}
                            // noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass pt-3'
                            }}
                            suppressRowClickSelection={true}
                            frameworkComponents={frameworkComponents}
                        >
                            <AgGridColumn field="sno" headerName="S. NO"></AgGridColumn>
                            <AgGridColumn field="classification" headerName="Vendor Classification"></AgGridColumn>
                            <AgGridColumn field="lastUpdatedOn" headerName="Last Updated On"></AgGridColumn>
                            <AgGridColumn field="lastUpdatedBy" headerName="Last Updated By"></AgGridColumn>
                            <AgGridColumn field="status" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                        </AgGridReact>
                    </div>
                </div>}

                {
                    showPopupToggle && <PopupMsgWrapper isOpen={showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${cellValue ? MESSAGES.VENDOR_REJECTED : MESSAGES.VENDOR_APPROVED}`} />
                }
            </div>

        </>

    );
};

export default VendorClassification;
