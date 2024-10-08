import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import $ from "jquery";
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { searchNocontentFilter, } from '../../../helper/util';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ScrollToTop from '../../common/ScrollToTop';
import { PaginationWrapper } from '../../common/commonPagination';
import { getSAPDetailList } from '../actions/SAPDetail';
import SAPPushDetail from './SAPPushDetail';
import { useLabels } from '../../../helper/core';



const gridOptions = {};

const SAPDetailList = (props) => {
    const [isEditFlag, setIsEditFlag] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [ID, setID] = useState('');
    const vendorLabel = useLabels()
    const [tableData, setTableData] = useState([]);
    const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLoader, setIsLoader] = useState(false);
    const [renderState, setRenderState] = useState(true);
    const [selectedRowData, setSelectedRowData] = useState(false);
    const [noData, setNoData] = useState(false);
    const [dataCount, setDataCount] = useState(0);
    const [gridLoad, setGridLoad] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {

        getTableListData()
        // applyPermission(topAndLeftMenuData)
    }, [])


    //   useEffect(() => {
    //     applyPermission(topAndLeftMenuData)
    //   }, [topAndLeftMenuData])
    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    //   const applyPermission = (topAndLeftMenuData) => {
    //     if (topAndLeftMenuData !== undefined) {
    //       setGridLoad(true)
    //       const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
    //       const accessData = Data && Data.Pages.find((el) => el.PageName === REASON)
    //       const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
    //       if (permissionData !== undefined) {
    //         setViewAccessibility(permissionData && permissionData.View ? permissionData.View : false);
    //         setAddAccessibility(permissionData && permissionData.Add ? permissionData.Add : false);
    //         setEditAccessibility(permissionData && permissionData.Edit ? permissionData.Edit : false);
    //         setDeleteAccessibility(permissionData && permissionData.Delete ? permissionData.Delete : false);
    //         setDownloadAccessibility(permissionData && permissionData.Download ? permissionData.Download : false);
    //         setActivateAccessibility(permissionData && permissionData.Activate ? permissionData.Activate : false);
    //       }
    //     }
    //   }

    /**
     * @method getTableListData
     * @description GET SAP DETAIL LIST
     */
    const getTableListData = () => {
        // setIsLoader(true)
        dispatch(getSAPDetailList((res) => {
            setIsLoader(false)
            if (res.status === 204 && res.data === '') {
                setTableData([])
                setIsLoader(false)
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList
                setTableData(Data)
                setIsLoader(false)
                setRenderState(!renderState)
                setGridLoad(true)
            } else {
                setTableData([])
                setIsLoader(false)
            }
        }))
    }

    /**
     * @method editItemDetails
     * @description confirm edit item
     */
    const editItemDetails = (cellValue, rowData) => {
        setIsEditFlag(true);
        setIsOpenDrawer(true);
        setID(rowData.SapPushDetailId);
    }

    /**
    * @method buttonFormatter
    * @description Renders Edit buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <>
                {<button title='Edit' className="Edit" type={'button'} onClick={() => editItemDetails(cellValue, rowData)} />}
            </>
        )
    };

    /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            tableData.length !== 0 && setNoData(searchNocontentFilter(value, noData))
        }, 500);
    }


    const formToggle = () => {
        $("html,body").animate({ scrollTop: 0 }, "slow");
        setIsOpenDrawer(true)
    }
    /**
     * @method closeSAPDetailDrawer
     * @description Close SAP Detail drawet
    */
    const closeSAPDetailDrawer = (type) => {
        setIsOpenDrawer(false)
        setIsEditFlag(false)
        setID('')
        if (type === 'submit') {
            getTableListData()
        }
    }

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };
    const onRowSelect = () => {
        const selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
        setDataCount(selectedRows.length)
    }


    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }


    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        gridApi.sizeColumnsToFit();
        gridApi.deselectAll()
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        floatingFilter: true
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
    };


    return (
        <>
            <div className={`ag-grid-react container-fluid p-relative ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
                <ScrollToTop pointProp="go-to-top" />
                {isLoader && <LoaderCustom customClass="loader-center" />}
                <Row className="no-filter-row">
                    <Col md={6} className="text-right filter-block"></Col>
                    <Col md="6" className="text-right search-user-block pr-0">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>

                                <button
                                    type="button"
                                    className={'user-btn mr5'}
                                    title="Add"
                                    onClick={formToggle}
                                >
                                    <div className={'plus mr-0'}></div>
                                </button>



                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>

                            </div>
                        </div>
                    </Col>
                </Row>
                {gridLoad && <div className={`ag-grid-wrapper height-width-wrapper  ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                    </div>
                    <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                        <AgGridReact
                            defaultColDef={defaultColDef}

                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={tableData}
                            pagination={true}
                            paginationPageSize={defaultPageSize}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            onFilterModified={onFloatingFilterChanged}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass pt-3'
                            }}
                            // rowSelection={'multiple'}
                            suppressRowClickSelection={true}
                            onSelectionChanged={onRowSelect}
                            frameworkComponents={frameworkComponents}
                        >
                            <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                            <AgGridColumn field="PlantCode" headerName="Plant Code"></AgGridColumn>
                            <AgGridColumn field="MaterialGroup" headerName="Material Group"></AgGridColumn>
                            <AgGridColumn field="PurchasingOrg" headerName="Purchasing Org"></AgGridColumn>
                            <AgGridColumn field="PurchasingGroup" headerName="Purchasing Group"></AgGridColumn>
                            <AgGridColumn field="VendorCode" headerName={`${vendorLabel} Code`}></AgGridColumn>
                            <AgGridColumn field="SapPushDetailId" cellClass="ag-grid-action-container" headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer'></AgGridColumn>
                        </AgGridReact>
                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                    </div>
                </div>}
            </div>
            {isOpenDrawer && (
                <SAPPushDetail
                    isOpen={isOpenDrawer}
                    closeDrawer={closeSAPDetailDrawer}
                    isEditFlag={isEditFlag}
                    id={ID}
                    anchor={'right'}
                />
            )}
        </>
    )
}


export default SAPDetailList
