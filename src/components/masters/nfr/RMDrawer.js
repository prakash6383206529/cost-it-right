import React from 'react'
import { Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import DayTime from '../../common/DayTimeWrapper';
import { getRawMaterialByNFRPart } from './actions/nfr';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import { hyphenFormatter } from '../masterUtil';
import { PaginationWrapper, onPageSizeChanged } from '../../common/commonPagination';
import NoContentFound from '../../common/NoContentFound';

const gridOptions = {};
function RMDrawer(props) {
    const { NfrPartWiseDetailId, closeDrawer } = props
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [rowData, setRowData] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getRawMaterialByNFRPart(NfrPartWiseDetailId, (res) => {
            setRowData(res?.data?.DataList)
        }))
    }, [])

    const dateFormater = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    const onGridReady = (params) => {
        setgridApi(params.api);
        params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridApi.sizeColumnsToFit();
    }

    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        dateFormater: dateFormater,
        customNoRowsOverlay: NoContentFound,
    }

    return (
        <>
            <Drawer className="top-drawer" anchor={props.anchor} open={props.isOpen} >
                <div className="container-fluid ">
                    <div className={'drawer-wrapper layout-min-width-1020px'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col >
                                <div className={'header-wrapper left'}>
                                    <h3>{`Customer RFQ RM`}</h3>
                                </div>
                                <div
                                    onClick={(e) => closeDrawer('close')}
                                    className={'close-button right'}
                                ></div>
                            </Col>
                        </Row>

                        <Row>
                            <Col md="12">
                                <button type="button" className="user-btn mb-2" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                            </Col>
                            <Col md="12">
                                <div className={`ag-grid-react `}>
                                    <div className={`ag-theme-material p-relative ${rowData && rowData.length <= 0 ? "overlay-contain" : ""}`} >
                                        <AgGridReact
                                            style={{ height: '100%', width: '100%' }}
                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            domLayout='autoHeight'
                                            // columnDefs={c}
                                            rowData={rowData}
                                            pagination={true}
                                            paginationPageSize={defaultPageSize}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            loadingOverlayComponent={'customLoadingOverlay'}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: "imagClass"
                                            }}
                                            suppressRowClickSelection={true}
                                            frameworkComponents={frameworkComponents}
                                        // onFilterModified={onFloatingFilterChanged}
                                        >
                                            <AgGridColumn width={"230px"} field="RawMaterialCode" headerName="RM Code"></AgGridColumn>
                                            <AgGridColumn field="RawMaterialName" headerName="RM Name"></AgGridColumn>
                                            <AgGridColumn field="RawMaterialGradeName" headerName="RM Grade"></AgGridColumn>
                                            <AgGridColumn field="RawMaterialSpecificationName" headerName="RM Specification"></AgGridColumn>
                                            <AgGridColumn field="RmUom" headerName="UOM"></AgGridColumn>
                                            <AgGridColumn field="GrossWeight" headerName="Gross Weight"></AgGridColumn>
                                            <AgGridColumn field="NetWeight" headerName="Net Weight"></AgGridColumn>
                                            <AgGridColumn field="NfrPartWiseDetailIdRef" hide></AgGridColumn>
                                        </AgGridReact>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Drawer >
        </>
    )
}

export default React.memo(RMDrawer)
