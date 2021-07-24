import React, { useState, useEffect, Fragment } from 'react'
import moment from 'moment'
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, userDetails } from '../../helper/auth'
import { Badge } from 'reactstrap'
import NoContentFound from '../common/NoContentFound'
import { CONSTANT } from '../../helper/AllConastant'
import { REPORT_DOWNLOAD_EXCEl } from '../../config/masterData';
import { GridTotalFormate } from '../common/TableGridFunctions'
import { checkForDecimalAndNull } from '../../helper'
import { getReportListing } from '../report/actions/ReportListing'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { ReportMaster } from '../../config/constants';
import { number } from 'joi';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function ReportListing(props) {

    const loggedUser = loggedInUserId()

    const [tableData, setTableData] = useState([])

    const [shown, setshown] = useState(false)

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState(props.Ids);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [createDate, setCreateDate] = useState(Date);
    const [costingVersionChange, setCostingVersion] = useState('');
    const dispatch = useDispatch()

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const reportListingData = useSelector((state) => state.report.reportListing)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const approvalList = useSelector(state => state.approval.approvalList)

    const userList = useSelector(state => state.auth.userList)
    // const { bopDrawerList } = useSelector(state => state.costing)

    const simulatedOnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cellValue != null ? cellValue : '';
    }

    const approvedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //   return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const createDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        setCreateDate(cellValue)
    }

    const linkableFormatter = (props) => {
        let tempDate = props.data.CreatedDate
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = `${moment(tempDate).format('DD/MM/YYYY')}-${cellValue}`
        setCostingVersion(temp);
        return temp
    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = moment(cellValue).format('DD/MM/YYYY h:m:s')
        return temp
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let value;
        if (cellValue === null || cellValue === '' || cellValue === 'NA') {
            value = '-';
        }
        else {
            value = cellValue
        }
        return value
    }

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }

    const statusFormatter = (cell, row, enumObject, rowIndex) => {
        return <div className={cell}>{row.DisplayCostingStatus}</div>
    }

    // table headings start
    const renderCostingVersion = () => {
        return <>Costing <br />Version</>
    }
    const renderPOPrice = () => {
        return <>PO Price</>
    }
    const renderPartNumber = () => {
        return <>Part <br />Number</>
    }
    const renderPartName = () => {
        return <>Part <br />Name</>
    }
    const renderRMNameGrade = () => {
        return <>RM <br />Name-Grade</>
    }
    const renderGrossWeight = () => {
        return <>Gross <br />Weight</>
    }
    const renderFinishWeight = () => {
        return <>Finish <br />Weight</>
    }
    const renderScrapWeight = () => {
        return <>Scrap <br />Weight</>
    }
    const renderNetRMCost = () => {
        return <>Net <br />RM Cost</>
    }
    const renderNetBOPCost = () => {
        return <>Net <br />BOP Cost</>
    }
    const renderProcessCost = () => {
        return <>Process <br />Cost</>
    }
    const renderOperationCost = () => {
        return <>Operation <br />Cost</>
    }
    const renderSurfaceTreatment = () => {
        return <>Surface <br />Treatment</>
    }
    const renderTransportationCost = () => {
        return <>Transportation <br />Cost</>
    }
    const renderNetConversionCost = () => {
        return <>Net <br />Conversion Cost</>
    }
    const renderModelTypeForOverheadProfit = () => {
        return <>Model Type For<br /> Overhead/Profit</>
    }
    const renderPaymentTerms = () => {
        return <>Payment <br />Terms</>
    }
    const renderNetOverheadProfits = () => {
        return <>Net Overhead<br /> & Profits</>
    }
    const renderPackagingCost = () => {
        return <>Packaging <br />Cost</>
    }
    const renderNetPackagingFreight = () => {
        return <>Net Packaging<br /> & Freight</>
    }
    const renderToolMaintenanceCost = () => {
        return <>Tool <br />Maintenance Cost</>
    }
    const renderToolPrice = () => {
        return <>Tool<br /> Price</>
    }
    const renderAmortizationQuantity = () => {
        return <>Amortization <br />Quantity(Tool Life)</>
    }
    const renderNetToolCost = () => {
        return <>Net Tool<br /> Cost</>
    }
    const renderTotalCost = () => {
        return <>Total<br /> Cost</>
    }
    const renderHundiOtherDiscount = () => {
        return <>Hundi/Other<br /> Discount</>
    }
    const renderAnyOtherCost = () => {
        return <>Any Other<br /> Cost</>
    }
    const renderNetPOPrice = () => {
        return <>Net PO<br /> Price(INR)</>
    }
    const renderNetPOPrice2 = () => {
        return <>Net PO<br /> Price (USD)</>
    }

    // table headings end



    /**
   * @method getTableData
   * @description getting approval list table
   */

    const getTableData = () => {
        const filterData = {
            costingNumber: "",
            toDate: null,
            fromDate: null,
            statusId: 1,
            technologyId: 1,
            plantCode: "",
            vendorCode: "",
            userId: loggedUser,
            isSortByOrderAsc: true,
        }
        props.getReportListing(filterData, (res) => { })
    }


    useEffect(() => {
        getTableData();
    }, [])

    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
        //exportCSVText: 'Download Excel',
        //onExportToCSV: this.onExportToCSV,
        //paginationShowsTotal: true,
        //paginationShowsTotal: this.renderPaginationShowsTotal,
    }

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'PartList') {
            partSelectList &&
                partSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })

            return tempDropdownList
        }

        if (label === 'Status') {
            statusSelectList &&
                statusSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
        if (label === 'users') {
            userList && userList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };


    const onGridReady = (params) => {
        // this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        // getDataList()
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    useEffect(() => {

    }, [tableData])

    // const renderColumn = (fileName) => {
    //     return returnExcelColumn(CONSTANT.REPORT_DOWNLOAD_EXCEL, reportListingData)
    // }

    const frameworkComponents = {
        linkableFormatter: linkableFormatter,
        createDateFormatter: createDateFormatter,
        hyphenFormatter: hyphenFormatter,
        simulatedOnFormatter: simulatedOnFormatter,
        customNoRowsOverlay: NoContentFound,
        dateFormatter: dateFormatter
    };

    /**
    * @method resetHandler
    * @description Reseting all filter
    */
    const resetHandler = () => {
        setValue('partNo', '')
        setValue('createdBy', '')
        setValue('requestedBy', '')
        setValue('status', '')
        getTableData()
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
    }

    const onRowSelect = () => {

        var selectedRows = gridApi.getSelectedRows();
        console.log(JSON.stringify(selectedRows) === JSON.stringify(selectedIds), "sss", selectedRowData, "ii", selectedIds);
        if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        var selected = gridApi.getSelectedNodes()
        console.log('selected: ', selected);
        console.log(selectedRows, 'selectedRowsselectedRowsselectedRowsselectedRowsselectedRowsselectedRows')
        setSelectedRowData(selectedRows)
        // if (isSelected) {
        // } else {
        //   const BoughtOutPartId = row.BoughtOutPartId;
        //   let tempArr = selectedRowData && selectedRowData.filter(el => el.BoughtOutPartId !== BoughtOutPartId)
        //   setSelectedRowData(tempArr)
        // }

    }

    const renderColumn = (fileName) => {

        let tempData
        if (selectedRowData.length == 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumn(REPORT_DOWNLOAD_EXCEl, tempData)

    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []

        // TempData &&
        //     TempData.map((item) => {
        //         if (item.CostingNumber) {
        //             const numberdd = item.CostingNumber
        //             const datedd = moment(item.CreatedDate).format('DD/MM/YYYY')
        //             const temp = `${datedd}-${numberdd}`
        //             console.log(temp, 'temp')
        //             console.log(item.CostingNumber, 'costing nooo')

        //             item.CostingNumber = ''
        //         }
        //     })

        return (<ExcelSheet data={TempData} name={ReportMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }

    /**
    * @method onSubmit
    * @description filtering data on Apply button
    */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
        // const type_of_costing = 
        getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
    }


    return (
        <div className="container-fluid report-listing-page ag-grid-react">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>

                <Row className="pt-4 blue-before">
                    {shown &&
                        <Col lg="10" md="12" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills">
                                    <h5>{`Filter By:`}</h5>
                                </div>

                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'partNo'}
                                        placeholder={'Part No.'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('PartList')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.partNo}
                                    />
                                </div>
                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'createdBy'}
                                        placeholder={'Initiated By'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('users')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.createdBy}
                                    />
                                </div>
                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'requestedBy'}
                                        placeholder={'Requested By'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('users')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.requestedBy}
                                    />
                                </div>
                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'status'}
                                        placeholder={'Status'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                        options={renderDropdownListing('Status')}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.status}
                                    />
                                </div>


                                <div className="flex-fill filled-small hide-label">
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={resetHandler}
                                        className="reset mr10"
                                    >
                                        {'Reset'}
                                    </button>
                                    <button
                                        type="button"
                                        //disabled={pristine || submitting}
                                        onClick={onSubmit}
                                        className="apply mr5"
                                    >
                                        {'Apply'}
                                    </button>
                                </div>
                            </div>
                        </Col>
                    }

                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {(shown) ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top topminus88" onClick={() => setshown(!shown)}>
                                        <div className="cancel-icon-white"></div>
                                    </button>
                                ) : (
                                    <button type="button" className="user-btn mr5" onClick={() => setshown(!shown)}>Show Filter</button>
                                )}

                                <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                    {renderColumn(ReportMaster)}
                                </ExcelFile>

                                <button type="button" className="user-btn refresh-icon" onClick={() => resetState()}></button>

                            </div>
                        </div>

                    </Col>
                </Row>
            </form>

            {/* <BootstrapTable
                data={props.reportDataList}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                // exportCSV
                //ignoreSinglePage
                //ref={'table'}
                trClassName={'userlisting-row'}
                tableHeaderClass="my-custom-header"
                pagination
            >
                <TableHeaderColumn dataField="TokenNumber" isKey={true} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
                <TableHeaderColumn dataField="TokenNumber" width={90} columnTitle={true} dataSort={true} dataFormat={linkableFormatter} >{renderCostingVersion()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingHead" width={90} columnTitle={true} dataSort={false}>{renderPOPrice()}</TableHeaderColumn>
                <TableHeaderColumn dataField="Technology" width={90} columnTitle={true} dataSort={false}>{renderPartNumber()}</TableHeaderColumn>
                <TableHeaderColumn dataField="VendorName" width={90} columnTitle={true} dataSort={false}>{renderPartName()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactParts" width={110} columnTitle={true} dataSort={false}>{renderRMNameGrade()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedBy" width={90} columnTitle={true} dataSort={false} >{renderGrossWeight()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedOn" width={90} columnTitle={true} dataSort={false} dataFormat={simulatedOnFormatter} >{renderFinishWeight()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedBy" width={90} columnTitle={true} dataSort={false}>{renderScrapWeight()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedOn" width={90} columnTitle={true} dataSort={false}> {renderNetRMCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderNetBOPCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderProcessCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderOperationCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderSurfaceTreatment()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={120} columnTitle={true} dataSort={false} >{renderTransportationCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={130} columnTitle={true} dataSort={false} >{renderNetConversionCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={130} columnTitle={true} dataSort={false} >{renderModelTypeForOverheadProfit()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{`Overhead On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`Profit On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{`Rejection On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`ICC On`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderPaymentTerms()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderNetOverheadProfits()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{renderPackagingCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`Freight`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={120} columnTitle={true} dataSort={false} >{renderNetPackagingFreight()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={145} columnTitle={true} dataSort={false} >{renderToolMaintenanceCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderToolPrice()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={145} columnTitle={true} dataSort={false} >{renderAmortizationQuantity()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderNetToolCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{renderTotalCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderHundiOtherDiscount()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{renderAnyOtherCost()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{renderNetPOPrice()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={90} columnTitle={true} dataSort={false} >{`Currency`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={110} columnTitle={true} dataSort={false} >{renderNetPOPrice2()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={100} columnTitle={true} dataSort={false} >{`Remark`}</TableHeaderColumn> */}
            {/* <TableHeaderColumn dataAlign="right" searchable={false} width={80} dataField="SimulationId" export={false} isKey={true} dataFormat={buttonFormatter}>Actions</TableHeaderColumn> */}
            {/* </BootstrapTable> */}

            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Filter..." onChange={(e) => onFilterTextBoxChanged(e)} />
                </div>
                <div
                    className="ag-theme-material"
                    style={{ height: '100%', width: '100%' }}
                >
                    <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        defaultColDef={defaultColDef}
                        // columnDefs={c}
                        rowData={reportListingData}
                        pagination={true}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                            title: CONSTANT.EMPTY_DATA,
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                    >
                        {/* <AgGridColumn field="TokenNumber" headerName="Token No."></AgGridColumn> */}
                        {/* <AgGridColumn field="CreatedDate" headerName="Created Date"  aggFunc={'createDateFormatter'}></AgGridColumn> */}
                        <AgGridColumn field="CostingNumber" headerName="Costing Version"></AgGridColumn>
                        <AgGridColumn field="CreatedDate" headerName="Created Date" cellRenderer={'dateFormatter'}></AgGridColumn>
                        <AgGridColumn field="Status" headerName="Status" ></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" headerName="PO Price"></AgGridColumn>
                        <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                        <AgGridColumn field="Rev" headerName="Revision Number"></AgGridColumn>
                        <AgGridColumn field="ECN" headerName="ECN Number"></AgGridColumn>
                        <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                        <AgGridColumn field="VendorName" headerName="Vendor Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="VendorCode" headerName="Vendor Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RawMaterialName" headerName="RM Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RMGrade" headerName="RM Grade" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RMSpecification" headerName="RM Spec" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="FinishWeight" headerName="Finish Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ScrapWeight" headerName="Scrap Weight"></AgGridColumn>
                        <AgGridColumn field="NetRawMaterialsCost" headerName="Net RM Cost"></AgGridColumn>
                        <AgGridColumn field="NetBoughtOutPartCost" headerName="Net BOP Cost"></AgGridColumn>
                        <AgGridColumn field="NetProcessCost" headerName="Process Cost"></AgGridColumn>
                        <AgGridColumn field="NetOperationCost" headerName="Operation Cost"></AgGridColumn>
                        <AgGridColumn field="SurfaceTreatmentCost" headerName="Surface Treatment"></AgGridColumn>
                        <AgGridColumn field="TransportationCost" headerName="Transportation Cost"></AgGridColumn>
                        <AgGridColumn field="NetConversionCost" headerName="Net Conversion Cost"></AgGridColumn>
                        <AgGridColumn field="ModelTypeForOverheadAndProfit" headerName="Model Type For Overhead/Profit" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="OverheadOn" headerName="Overhead On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ProfitOn" headerName="Profit On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RejectOn" headerName="Rejection On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ICCOn" headerName="ICC On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="PaymentTermCost" headerName="Payment Terms"></AgGridColumn>
                        <AgGridColumn field="NetOverheadAndProfitCost" headerName="Net Overhead & Profits"></AgGridColumn>
                        <AgGridColumn field="PackagingCost" headerName="Packaging Cost"></AgGridColumn>
                        <AgGridColumn field="FreightCost" headerName="Freight"></AgGridColumn>
                        <AgGridColumn field="NetFreightPackagingCost" headerName="Net Packaging & Freight"></AgGridColumn>
                        <AgGridColumn field="ToolMaintenaceCost" headerName="Tool Maintenance Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ToolPrice" headerName="Tool Price" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="AmorizationQuantity" headerName="Amortization Quantity(Tool Life)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetToolCost" headerName="Net Tool Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="TotalCost" headerName="Total Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetDiscountsCost" headerName="Hundi/Other Discount" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="AnyOtherCost" headerName="Any Other Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" headerName="Net PO Price(INR)"></AgGridColumn>
                        <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                        <AgGridColumn field="NetPOPriceInCurrency" headerName="Net PO Price Currency"></AgGridColumn>
                        <AgGridColumn field="Remark" headerName="Remark" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="CreatedBy" headerName="CreatedBy" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                    </AgGridReact>
                    <div className="paging-container d-inline-block float-right">
                        <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                            <option value="10" selected={true}>10</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>

        </div>
    );
}



function mapStateToProps({ report, auth }) {
    const { reportDataList, loading } = report;
    const { initialConfiguration } = auth;
    return { reportDataList, loading, initialConfiguration, }
}

export default connect(mapStateToProps, {
    getReportListing,
})(reduxForm({
    form: 'ReportListing',
    enableReinitialize: true,
})(ReportListing));