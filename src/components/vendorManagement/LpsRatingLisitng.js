import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { fetchLPSRatingData, getlpsratingListing, updateLPSRatingStatus } from './Action';
import { loggedInUserId, showTitleForActiveToggle } from '../../helper';
import Switch from "react-switch";
import { Col, Row } from 'reactstrap';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA } from '../../config/constants';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { MESSAGES } from '../../config/message';
import LoaderCustom from '../common/LoaderCustom';
import Toaster from '../common/Toaster';

const LpsRatingListing = () => {
    const [isLoader, setIsLoader] = useState(false);
    const [showPopupToggle, setShowPopupToggle] = useState(false);
    const [cellValue, setCellValue] = useState('');
    const [cellData, setCellData] = useState('');



    const dispatch = useDispatch();
    const lpsRatingData = useSelector(state => state.supplierManagement.lpsRatingData);


    useEffect(() => {
        // setIsLoader(true);
        dispatch(fetchLPSRatingData(true, (res) => {
            setIsLoader(false);
            if (res.status === 204 && res.data === '') {
                setCellValue([]);
            } else if (res && res.data && res.data.DataList) {
                let data = res.data.DataList;
                setCellValue(data.map(row => row.status));
            }
        }));
    }, [dispatch]);

    const confirmApprovalStatus = (data) => {
        // Handle confirm approval status
        setShowPopupToggle(false);
    }

    const onPopupConfirmToggle = () => {
        // Handle popup confirmation toggle
        confirmDeactivateItem(cellData);
    }
    const getTableListData = () => {
        setIsLoader(true)
        dispatch(getlpsratingListing(true, (res) => {
            console.log('res: ', res)
            setIsLoader(false)
        }))
    }
    const confirmDeactivateItem = (data, cell) => {
        dispatch(updateLPSRatingStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    Toaster.success(MESSAGES.REASON_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.REASON_ACTIVE_SUCCESSFULLY)
                }
                getTableListData()
                // setDataCount(0)
            }
        }))
        setShowPopupToggle(false)
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
    };

    const closePopUp = () => {
        setShowPopupToggle(false);
    }
    const onGridReady = (params) => {
        // setGridApi(params.api)
        // setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        // agGridRef.current = params.api;
        params.api.sizeColumnsToFit();
    };

    const frameworkComponents = {

        statusButtonFormatter: statusButtonFormatter
    };

    return (
        <>
            <div className={`ag-grid-react container-fluid p-relative`} id='go-to-top'>
                <Row className="no-filter-row">
                    <Col md={6} className="text-right filter-block"></Col>
                </Row>
                {<div className={`ag-grid-wrapper height-width-wrapper`}>
                    <div className={`ag-theme-material`}>
                        {isLoader && <LoaderCustom customClass="loader-center" />}
                        {!isLoader && lpsRatingData && lpsRatingData.length > 0 &&
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
                                {/* <AgGridColumn field="sno" headerName="S. NO"></AgGridColumn> */}
                                <AgGridColumn field="lpsRating" headerName="LPS Rating"></AgGridColumn>
                                <AgGridColumn field="lastUpdatedOn" headerName="Last Updated On"></AgGridColumn>
                                <AgGridColumn field="lastUpdatedBy" headerName="Last Updated By"></AgGridColumn>
                                <AgGridColumn field="status" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                            </AgGridReact>
                        }
                        {!isLoader && (!lpsRatingData || lpsRatingData.length === 0) &&
                            <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />
                        }
                    </div>
                </div>}

                {showPopupToggle &&
                    <PopupMsgWrapper isOpen={showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${cellValue ? MESSAGES.LPS_RATING_REJECTED : MESSAGES.LPS_RATING_APPROVED}`} />
                }
            </div>

        </>

    );
};

export default LpsRatingListing;
