import { Drawer } from "@material-ui/core";
import React, { useEffect } from "react";
import { Col, Row } from "reactstrap";
import LoaderCustom from "../../common/LoaderCustom";
import { useState } from "react";
import ApprovalWorkFlow from "../../costing/components/approval/ApprovalWorkFlow";
import { Fragment } from "react";
import ApprovalDrawer from "./ApprovalDrawer";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA, ERRORID, NFRTypeId, defaultPageSize } from "../../../config/constants";
import { useDispatch } from "react-redux";
import { getNFRApprovalSummary, pushNfrOnSap } from "./actions/nfr";
import { checkForDecimalAndNull, formViewData, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDetails, userTechnologyLevelDetails } from "../../../helper";
import { costingTypeIdToApprovalTypeIdFunction } from "../../common/CommonFunctions";
import { checkFinalUser, getSingleCostingDetails, setCostingViewData } from "../../costing/actions/Costing";
import { getUsersTechnologyLevelAPI } from "../../../actions/auth/AuthActions";
import CostingDetailSimulationDrawer from "../../simulation/components/CostingDetailSimulationDrawer";
import { AgGridReact } from "ag-grid-react/lib/agGridReact";
import { AgGridColumn } from "ag-grid-react/lib/agGridColumn";
import { PaginationWrapper } from "../../common/commonPagination";
import WarningMessage from "../../common/WarningMessage";
import Toaster from "../../common/Toaster";
import OutsourcingDrawer from "./OutsourcingDrawer";
import { MESSAGES } from "../../../config/message";
const gridOptions = {};

function NfrSummaryDrawer(props) {
    const { rowData } = props
    const [loader, setLoader] = useState(false)
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [tableData, setTableData] = useState([])
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [nfrData, setNFRData] = useState({})
    const [finalLevelUser, setFinalLevelUser] = useState(true)
    const [levelDetails, setLevelDetails] = useState({})
    const [sendForApprovalButtonShow, setSendForApprovalButtonShow] = useState(false)
    const [isFinalLevelUser, setIsFinalLevelUser] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isCostingDrawerLoader, setIsCostingDrawerLoader] = useState(false)
    const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [noData, setNoData] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [isDataCome, setIsDataCome] = useState(false);
    const [showOutsourcingDrawer, setShowOutsourcingDrawer] = useState('');
    const [OutsourcingCostingData, setOutsourcingCostingData] = useState({});
    const [disablePushButton, setDisablePushButton] = useState(false);
    const [dataForFetchingAllApprover, setDataForFetchingAllApprover] = useState({})

    const dispatch = useDispatch()

    useEffect(() => {
        setLoader(true)
        dispatch(getNFRApprovalSummary(rowData?.ApprovalProcessId, loggedInUserId(), (res) => {
            setLoader(false)
            if (res?.data?.Result === true) {
                setNFRData(res?.data?.Data)
                setIsApprovalDone(res?.data?.Data?.IsSent)
            }

            // let obj = {
            //     DepartmentId: DepartmentId,
            //     UserId: loggedInUserId(),
            //     TechnologyId: technologyId,
            //     Mode: 'costing',
            //     approvalTypeId: costingTypeIdToApprovalTypeIdFunction(CostingTypeId)
            // }
            // dispatch(checkFinalUser(obj, res => {
            //     if (res && res.data && res.data.Result) {
            //         setFinalLevelUser(res.data.Data.IsFinalApprover)
            //     }
            // }))
            let levelDetailsTemp = ''
            let Data = res?.data?.Data;
            if (res?.data?.Data?.CostingData) {
                let technologyId = res?.data?.Data?.CostingData[0]?.TechnologyId
                dispatch(getUsersTechnologyLevelAPI(loggedInUserId(), technologyId,null, (res) => {
                    levelDetailsTemp = userTechnologyLevelDetails(NFRTypeId, res?.data?.Data?.TechnologyLevels)
                    if (Number(levelDetailsTemp?.length) === 0) {
                        setSendForApprovalButtonShow(false)
                        setTimeout(() => {
                            setIsDataCome(true)
                        }, 100);
                    } else {
                        let obj = {}
                        obj.DepartmentId = userDetails().DepartmentId
                        obj.UserId = loggedInUserId()
                        obj.TechnologyId = technologyId
                        obj.Mode = 'costing'
                        obj.approvalTypeId = costingTypeIdToApprovalTypeIdFunction(NFRTypeId)
                        obj.plantId = Data?.CostingData[0]?.PlantId
                        dispatch(checkFinalUser(obj, (res) => {
                            if (res?.data?.Result) {
                                setSendForApprovalButtonShow(true)
                                setIsFinalLevelUser(res?.data?.Data?.IsFinalApprover)
                                setTimeout(() => {
                                    setIsDataCome(true)
                                }, 100);
                            }
                            setDataForFetchingAllApprover({
                                processId: rowData?.ApprovalProcessId,
                                levelId: Data.ApprovalSteps[Data.ApprovalSteps.length - 1].LevelId,
                                mode: 'nfr'
                            })
                        }))
                    }
                    setLevelDetails(levelDetailsTemp)
                }))

            }
        }))
    }, [])

    const toggleDrawer = (event, type = 'cancel') => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', type)
    };

    const closeDrawer = (type) => {
        if (type === "submit") {
            props.closeDrawer('', "submit")
        } else {
            setApprovalDrawer(false)
            setRejectDrawer(false)
        }
    }

    const viewCosting = (costingNumber) => {
        setIsCostingDrawerLoader(true)
        dispatch(getSingleCostingDetails(costingNumber, (res) => {
            setIsCostingDrawerLoader(false)
            if (res.data.Data) {
                let dataFromAPI = res.data.Data
                const tempObj = formViewData(dataFromAPI)
                dispatch(setCostingViewData(tempObj))
            }
        },
            setIsOpen(true)
        ))
    }

    const closeCostingDrawer = () => {
        setIsOpen(false)
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
        checkboxSelection: isFirstColumn
    };

    const isRowSelectable = (rowNode) => {
        return (!isApprovalDone && sendForApprovalButtonShow) ? true : false
    }

    const onGridReady = (params) => {
        setgridApi(params.api);
        params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };



    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            rowData.length !== 0 && setNoData(searchNocontentFilter(value, noData))
        }, 500);
    }



    const onAction = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;


        return (
            <>
                <button
                    type="button"
                    title='View'
                    className="float-right mb-0 View "
                    onClick={() => viewCosting(cellValue)}
                >
                </button>

            </>
        )
    }
    const vendorFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return `${cellValue} (${rowData.VendorCode})`
    }
    const plantFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return `${cellValue} (${rowData.PlantCode})`
    }
    const checkBoxRenderer = (props) => {
        var selectedRows = gridApi && gridApi?.getSelectedRows();
    }

    const viewOutsourcing = (data) => {
        setOutsourcingCostingData(data)
        setTimeout(() => {
            setShowOutsourcingDrawer(true)
        }, 300);

    }

    const outsourcingFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return cellValue ?
            (
                <div>
                    <button
                        type="button"
                        title='View'
                        className="float-right mb-0 View "
                        onClick={() => viewOutsourcing(rowData)}
                    >
                    </button>
                    {checkForDecimalAndNull(cellValue, getConfigurationKey()?.NoOfDecimalForPrice)}
                </div>
            ) : '-'
    }

    const netPOPriceFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice) : '-'
    }

    const frameworkComponents = {
        onAction: onAction,
        plantFormatter: plantFormatter,
        vendorFormatter: vendorFormatter,
        checkBoxRenderer: checkBoxRenderer,
        outsourcingFormatter: outsourcingFormatter,
        netPOPriceFormatter: netPOPriceFormatter,
    }

    const onRowSelect = (event) => {
        var selectedRows = gridApi && gridApi?.getSelectedRows();


        if (selectedRows?.length === 0) {
            setSelectedRowData([])
        } else {
            setSelectedRowData(selectedRows[0])
        }

    }
    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const approveClick = () => {
        if (selectedRowData?.length === 0) {
            Toaster.warning("Please at least one costing to send for approval.")
            return false
        }
        setApprovalDrawer(true)
    }

    const pushClick = () => {
        let pushRequest = {
            nfrGroupId: nfrData?.NfrGroupId,
            costingId: nfrData?.CostingData[0]?.CostingId
        }
        setDisablePushButton(true)
        dispatch(pushNfrOnSap(pushRequest, res => {
            if (res?.data?.Result) {
                Toaster.success(MESSAGES.NFR_PUSHED)
                setDisablePushButton(false)
                props.closeDrawer('', "submit")
            }
        }))
    }

    const closeOutsourcingDrawer = (type) => {
        setShowOutsourcingDrawer(false)
    }

    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`NFR Summary (Token No.${nfrData?.ApprovalToken ?? ''})`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        {/* {loader && <LoaderCustom />} */}
                        <Row className="mx-0 mb-3">
                            <Col>
                                {nfrData?.ApprovalSteps && <ApprovalWorkFlow approvalLevelStep={nfrData?.ApprovalSteps} approvalNo={nfrData?.ApprovalToken} approverData={dataForFetchingAllApprover} />}
                            </Col>
                            {/* <Col md="12">
                                <Table className='table cr-brdr-main'>
                                    <thead>
                                        <tr>
                                           <th>{"Group Name"}</th> 
                                            <th>{"Vendor"}</th>
                                            <th>{"Plant"}</th>
                                            <th>{"Costing"}</th>
                                            <th>{"Net PO"}</th>
                                            <th className="text-right">{"Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {nfrData?.CostingData && nfrData?.CostingData?.map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{`${data.VendorName} (${data.VendorCode})`}</td>
                                                    <td>{`${data.PlantName} (${data.PlantCode})`}</td>
                                                    <td>{data.CostingNumber}</td>
                                                    <td>{data.NetPOPrice}</td>
                                                    <td> <button
                                                        type="button"
                                                        title='View'
                                                        className="float-right mb-0 View "
                                                        onClick={() => viewCosting(data.CostingId)}
                                                    >
                                                    </button></td>
                                                </tr>
                                            )
                                        })}
                                        {nfrData?.CostingData && nfrData?.CostingData?.length === 0 && <tr>
                                            <td colSpan={4}><NoContentFound title={EMPTY_DATA} /></td>
                                        </tr>}
                                    </tbody>
                                </Table>
                            </Col> */}
                            <Col md="12">
                                <div className={`ag-grid-react container-fluid p-relative`}>
                                    <Row >
                                        <Col>
                                            <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${rowData.length <= 0 ? 'overlay-contain' : ''}`}>
                                                <div className={`ag-theme-material`}>
                                                    {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                                    {loader && <LoaderCustom />}
                                                    {isDataCome && <AgGridReact
                                                        style={{ height: '100%', width: '100%' }}
                                                        defaultColDef={defaultColDef}
                                                        floatingFilter={true}
                                                        domLayout='autoHeight'
                                                        rowData={nfrData?.CostingData}
                                                        pagination={true}
                                                        paginationPageSize={10}
                                                        onGridReady={onGridReady}
                                                        gridOptions={gridOptions}
                                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                                        noRowsOverlayComponentParams={{
                                                            title: EMPTY_DATA,
                                                            imagClass: 'imagClass'
                                                        }}
                                                        frameworkComponents={frameworkComponents}
                                                        rowSelection={'single'}
                                                        suppressRowClickSelection={true}
                                                        onFilterModified={onFloatingFilterChanged}
                                                        enableBrowserTooltips={true}
                                                        onRowSelected={onRowSelect}
                                                        isRowSelectable={isRowSelectable}

                                                    >
                                                        {/* <AgGridColumn cellClass="has-checkbox" field="Vendor" headerName='Costing Head' cellRenderer={checkBoxRenderer}></AgGridColumn> */}
                                                        {/* <AgGridColumn cellClass="has-checkbox" field="QuotationNumber" headerName='Group Name' cellRenderer={'linkableFormatter'} ></AgGridColumn> */}
                                                        <AgGridColumn field="VendorName" headerName="Vendor" cellRenderer={'vendorFormatter'}></AgGridColumn>
                                                        <AgGridColumn field="PlantName" headerName='Plant' cellRenderer={'plantFormatter'}></AgGridColumn>
                                                        <AgGridColumn field="CostingNumber" headerName='Costing' ></AgGridColumn>
                                                        <AgGridColumn field="NetPOPrice" headerName='Net PO' cellRenderer={'netPOPriceFormatter'}></AgGridColumn>
                                                        <AgGridColumn field="OutsourcingCost" headerName='Outsourcing Cost' cellRenderer={'outsourcingFormatter'}></AgGridColumn>
                                                        <AgGridColumn field="CostingId" headerName='Actions' type="rightAligned" cellRenderer={'onAction'}></AgGridColumn>

                                                    </AgGridReact>}

                                                    {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={defaultPageSize} />}
                                                </div>
                                                {!isApprovalDone && sendForApprovalButtonShow && <div className="text-right pb-3">
                                                    <WarningMessage message="Select one costing to push on SAP." />
                                                </div>}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                        {!isApprovalDone && sendForApprovalButtonShow && <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn mx-0">
                                <Fragment>
                                    <button type={'button'} className="mr5 approve-reject-btn"
                                        onClick={() => setRejectDrawer(true)}
                                    >
                                        <div className={'cancel-icon-white mr5'}></div>
                                        {'Reject'}
                                    </button>
                                    <button type="button" className="approve-button mr5 approve-hover-btn"

                                        onClick={() => approveClick()}
                                    >
                                        <div className={'save-icon'}></div>
                                        {'Approve'}
                                    </button>
                                </Fragment>
                            </div>
                        </Row>}
                        {Number(nfrData?.StatusId) === ERRORID && <Fragment>
                            <button type="button" className="user-btn mr5"
                                onClick={() => pushClick()}
                                disabled={disablePushButton}
                            >
                                <div className={'mr5'}></div>
                                {'Push'}
                            </button>
                        </Fragment>}
                    </div>
                </div>
            </Drawer >
            {isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeCostingDrawer}
                    anchor={"right"}
                    isReport={isOpen}
                    isSimulation={false}
                    simulationDrawer={false}
                    isReportLoader={isCostingDrawerLoader}
                />}
            {showOutsourcingDrawer &&
                <OutsourcingDrawer
                    isOpen={showOutsourcingDrawer}
                    closeDrawer={closeOutsourcingDrawer}
                    anchor={'right'}
                    CostingId={OutsourcingCostingData?.CostingId}
                    viewMode={true}
                />}
            {approvalDrawer && sendForApprovalButtonShow && <ApprovalDrawer isOpen={approvalDrawer} anchor="right" closeDrawer={closeDrawer} hideTable={true} nfrData={nfrData} type='Approve' isFinalLevelUser={isFinalLevelUser} pushData={selectedRowData} technologyId={nfrData?.CostingData[0]?.TechnologyId} PlantId={nfrData?.PlantId} />}
            {rejectDrawer && sendForApprovalButtonShow && <ApprovalDrawer isOpen={rejectDrawer} anchor="right" closeDrawer={closeDrawer} hideTable={true} nfrData={nfrData} rejectDrawer={true} isFinalLevelUser={isFinalLevelUser} pushData={selectedRowData} technologyId={nfrData?.CostingData[0]?.TechnologyId} />}
        </div >
    );
}
export default NfrSummaryDrawer