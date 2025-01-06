import React, { useEffect, useState } from "react"
import { Drawer } from "@material-ui/core"
import { Col, Container, Row } from "reactstrap"
import NoContentFound from "../../../common/NoContentFound"
import { EMPTY_DATA } from "../../../../config/constants"
import { AgGridColumn, AgGridReact } from "ag-grid-react"
import { updateGlobalTake } from "../../../common/Pagination/paginationAction"
import LoaderCustom from "../../../common/LoaderCustom"

const ViewImpactedDataDrawer = (props) => {
    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    }
    return (
        <div>
            <Drawer anchor={props.anchor} open={props.isOpen}>
                <div className={`hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-560px'}>
                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Impacted Data:'}</h3>
                                    </div>
                                    <div
                                        onClick={() => props.setIsOpen(false)}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className="ag-grid-react">
                                        <div className="ag-grid-react grid-parent-wrapper custom-pagination">
                                            <div className="ag-grid-header">
                                                <input
                                                    type="text"
                                                    className="form-control table-search"
                                                    placeholder="Search"
                                                    onChange={props.onFilterTextBoxChanged}
                                                />
                                            </div>
                                            <div className={`ag-theme-material ${props.gridProps?.rowData?.length <= 0 ? 'overlay-contain' : ''}`}>

                                                <AgGridReact
                                                    {...props.gridProps}
                                                    frameworkComponents={frameworkComponents}
                                                    domLayout='autoHeight'
                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                        imagClass: 'imagClass'
                                                    }}
                                                    enableBrowserTooltips={true}
                                                    pagination={true}
                                                    paginationPageSize={updateGlobalTake}
                                                >
                                                    <AgGridColumn
                                                        field="MasterName"
                                                        headerName="Master Name"
                                                    />
                                                    <AgGridColumn
                                                        field="Code"
                                                        headerName="Code"
                                                    />
                                                    <AgGridColumn
                                                        field="Technology"
                                                        headerName="Technology"
                                                    />
                                                    <AgGridColumn
                                                        field="NewRate"
                                                        headerName="New Rate"
                                                    />
                                                    <AgGridColumn
                                                        field="OldRate"
                                                        headerName="Old Rate"
                                                    />
                                                </AgGridReact>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Container>
                </div>
            </Drawer>
        </div>
    )
}

export default ViewImpactedDataDrawer