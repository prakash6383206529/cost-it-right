import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getImpactedDataList } from '../../actions/Simulation'
import { loggedInUserId } from '../../../../helper'
import { AgGridColumn, AgGridReact } from 'ag-grid-react'
import { Row, Col, Container } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound'
import LoaderCustom from '../../../common/LoaderCustom'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { EMPTY_DATA, defaultPageSize } from '../../../../config/constants'
import SingleDropdownFloationFilter from '../../../masters/material-master/SingleDropdownFloationFilter'
import { PaginationWrapper } from '../../../common/commonPagination'
import Button from '../../../layout/Button'
import ViewImpactedDataDrawer from './ViewImpactedDataDrawer'

const ImpactedDataList = () => {
    const [loader, setLoader] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [impactedData, setImpactedData] = useState([])
    const [drawerRowData, setDrawerRowData] = useState([])
    const [noData, setNoData] = useState(false)
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const dispatch = useDispatch()

    useEffect(() => {
        fetchImpactedData()
    }, [])

    const fetchImpactedData = () => {
        setLoader(true)
        const obj = {
            LoggedInUserId: loggedInUserId(),
            statusId: 1,
        }
        dispatch(getImpactedDataList(obj, (res) => {
            if (res?.data?.DataList) {
                setImpactedData(res.data.DataList)
                setNoData(false)
            } else {
                setImpactedData([])
                setNoData(true)
            }
            setLoader(false)
        }))
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        floatingFilter: true
    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }

    const renderPlant = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }

    const renderCustomer = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }

    const impactedMastersRenderer = (props) => {
        const impactedMasters = props.value || []
        if (impactedMasters.length === 0) return '-'

        return impactedMasters.map(master => (
            `${master.Technology} - ${master.MasterName} (${master.Code}): ${master.OldRate} → ${master.NewRate}`
        )).join(', ')
    }
    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.CostingSimulationStatus}</div>
    }

    const viewDetails = (rowData) => {
        setDrawerRowData(rowData?.ImpactedMasters)
        setTimeout(() => {
            setIsOpen(true)
        }, 200);
    }

    const buttonRenderer = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <Button
            id={`impactedDataList_view${props.rowIndex}`}
            className={"mr-1 Tour_List_View"}
            variant="View"
            onClick={() => viewDetails(rowData)}
            title={"View"}
        />
    }

    const frameworkComponents = {
        renderVendor,
        renderPlant,
        renderCustomer,
        impactedMastersRenderer,
        statusFormatter,
        buttonRenderer,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value)
    }
    const gridProps = {
        defaultColDef: defaultColDef,
        rowData: drawerRowData,
        onGridReady: onGridReady,
        frameworkComponents: frameworkComponents,
        domLayout: 'autoHeight',
    }
    return (
        <Container fluid>
            <div className={`approval-listing-page ${loader ? 'dashboard-loader' : ''}`}>
                {loader ? (
                    <LoaderCustom customClass="loader-center" />
                ) : (
                    <div>
                        <Row className="pt-4">
                            <Col>
                                <div className="ag-grid-react grid-parent-wrapper">
                                    <div className="ag-grid-header">
                                        <input
                                            type="text"
                                            className="form-control table-search"
                                            placeholder="Search"
                                            onChange={onFilterTextBoxChanged}
                                        />
                                    </div>
                                    <div className={`ag-theme-material ${impactedData?.length <= 0 ? 'overlay-contain' : ''}`}>
                                        {/* {noData && (
                                            <NoContentFound
                                                title={EMPTY_DATA}
                                                customClassName="no-content-found"
                                            />
                                        )} */}
                                        <AgGridReact
                                            defaultColDef={defaultColDef}
                                            rowData={impactedData}
                                            onGridReady={onGridReady}
                                            frameworkComponents={frameworkComponents}
                                            domLayout='autoHeight'
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: 'imagClass'
                                            }}
                                            enableBrowserTooltips={true}
                                            paginationPageSize={globalTake}
                                        >
                                            <AgGridColumn
                                                field="SimulationTechnology"
                                                headerName="Simulation Head"
                                            />
                                            <AgGridColumn
                                                field="CostingNumber"
                                                headerName="Costing Number"
                                            />
                                            <AgGridColumn
                                                field="PartNumber"
                                                headerName="Part Number"
                                            />
                                            <AgGridColumn
                                                field="PartName"
                                                headerName="Part Name"
                                            />
                                            <AgGridColumn
                                                field="TokenNumber"
                                                headerName="Token Number"
                                            />
                                            <AgGridColumn
                                                field="Vendor"
                                                headerName="Vendor (Code)"
                                                cellRenderer="renderVendor"
                                            />
                                            <AgGridColumn
                                                field="Plant"
                                                headerName="Plant (Code)"
                                                cellRenderer="renderPlant"
                                            />
                                            <AgGridColumn
                                                field="Customer"
                                                headerName="Customer (Code)"
                                                cellRenderer="renderCustomer"
                                            />
                                            <AgGridColumn
                                                field="CostingSimulationStatus"
                                                headerName="Status"
                                                cellClass="text-center"
                                                cellRenderer='statusFormatter'
                                            />
                                            <AgGridColumn width={160} field="CostingSimulationStatus" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'buttonRenderer'}></AgGridColumn>
                                        </AgGridReact>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </div>
            {isOpen && <ViewImpactedDataDrawer anchor="right" isOpen={isOpen} setIsOpen={setIsOpen} gridProps={gridProps} onFilterTextBoxChanged={onFilterTextBoxChanged} />}
        </Container>
    )
}

export default ImpactedDataList