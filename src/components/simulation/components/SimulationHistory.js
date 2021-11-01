import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId } from '../../../helper/auth'
import { Badge } from 'reactstrap'
import NoContentFound from '../../common/NoContentFound'
import { CONSTANT } from '../../../helper/AllConastant'
import { GridTotalFormate } from '../../common/TableGridFunctions'
import moment from 'moment'
import { checkForDecimalAndNull } from '../../../helper'
import { getSimulationHistory } from '../actions/History'
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'


function SimulationHistory(props) {

    const simulationHistory = useSelector(state => state.history.simulationHistory)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const dispatch = useDispatch()

    const simulatedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const approvedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //   return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const linkableFormatter = (cell, row, enumObject, rowIndex) => {
        return <div onClick={() => { }} className={'link'}>{cell}</div>
    }

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }
    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    
      };
      const gridOptions = {
        clearSearch: true,
        noDataText: (simulationHistory === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
      
      };
      const defaultColDef = {

        resizable: true,
        filter: true,
        sortable: true,
        // headerCheckboxSelection: isFirstColumn,
        // checkboxSelection: isFirstColumn
      };
      const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        };
      const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
      };

    const statusFormatter = (cell, row, enumObject, rowIndex) => {
        return <div className={cell}>{row.DisplayCostingStatus}</div>
    }

    const renderVendorName = () => {
        return <>Vendor Name</>
    }
    const renderImpactCosting = () => {
        return <>Impacted Costing </>
    }
    const renderImpactParts = () => {
        return <>Impacted Parts </>
    }
    const renderSimulatedBy = () => {
        return <>Simulated By </>
    }
    const renderSimulatedOn = () => {
        return <>Simulated On </>
    }
    const renderApprovedOn = () => {
        return <>Approved On </>
    }
    const renderApprovedBy = () => {
        return <>Approved By </>
    }

    useEffect(() => {
        dispatch(getSimulationHistory(() => { }))
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
    return (
        <div className="container-fluid simulation-history-page">
            <Row>
                <Col sm="12" >
                    <h1 className="mb-4">{`Simulation History`}</h1>
                </Col>
            </Row>
            {/* <BootstrapTable
                data={simulationHistory}
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
                <TableHeaderColumn dataField="TokenNumber" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingHead" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{'Costing Head'}</TableHeaderColumn>
                <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} dataAlign="left" dataSort={false}>{'Technology'}</TableHeaderColumn>
                <TableHeaderColumn dataField="VendorName" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{renderVendorName()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactCosting" width={120} columnTitle={true} dataAlign="left" dataSort={false}>{renderImpactCosting()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactParts" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{renderImpactParts()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedBy" width={110} columnTitle={true} dataAlign="left" dataSort={false} >{renderSimulatedBy()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedOn" width={160} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={simulatedOnFormatter} >{renderSimulatedOn()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedBy" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{renderApprovedBy()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedOn" width={160} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={approvedOnFormatter}> {renderApprovedOn()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={180} dataAlign="center" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
                <TableHeaderColumn dataAlign="right" searchable={false} width={80} dataField="SimulationId" export={false} isKey={true} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable> */}
            <div className="ag-grid-react">
                      <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                          {/* <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} /> */}
                        </div>
                        <div
                          className="ag-theme-material">
                          <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter = {true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={simulationHistory}
                            pagination={true}
                            paginationPageSize={10}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            loadingOverlayComponent={'customLoadingOverlay'}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                              title: CONSTANT.EMPTY_DATA,
                              imagClass:'imagClass'
                            }}
                            frameworkComponents={frameworkComponents}
                            suppressRowClickSelection={true}
                            rowSelection={'multiple'}
                          >
                            {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                            <AgGridColumn field="TokenNumber" headerName="Token No"></AgGridColumn>
                            <AgGridColumn field="CostingHead" headerName="Costing Head"></AgGridColumn>
                            <AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
                            <AgGridColumn field="VendorName" headerName="Simulated By"></AgGridColumn>
                            <AgGridColumn field="ImpactCosting" headerName="Impacted Costing" ></AgGridColumn>
                            <AgGridColumn field="ImpactParts" headerName="Impacted Parts "></AgGridColumn>
                            <AgGridColumn field="SimulatedBy" headerName="Simulated By"></AgGridColumn>
                            <AgGridColumn field="SimulatedOn" headerName="Simulated On"></AgGridColumn>
                            <AgGridColumn field="ApprovedBy" headerName="Approved By"></AgGridColumn>
                            <AgGridColumn field="ApprovedOn" headerName="Approved On"></AgGridColumn>
                            <AgGridColumn field="CostingStatus" headerName="Status"></AgGridColumn>
                            <AgGridColumn field="SimulationId" headerName="Actions"></AgGridColumn>
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
        </div>
    );
}

export default SimulationHistory;