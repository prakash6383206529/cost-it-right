import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { reactLocalStorage } from 'reactjs-localstorage';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA, EMPTY_GUID_0, ZBC } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { PaginationWrapper } from '../../../common/commonPagination';
import { agGridStatus, getPlantSelectListByType, isResetClick } from '../../../../actions/Common';
import { searchNocontentFilter } from '../../../../helper';

const gridOptions = {};
function NFRInsightStatusDetailsDrawer(props) {

    const [data, setData] = useState({});
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [DestinationPlant, setDestinationPlant] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [noData, setNoData] = useState(false);

    const dispatch = useDispatch()

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { nfrInsightStatusDetails } = useSelector(state => state.report);

    useEffect(() => {
        const { vbcVendorGrid } = props;
        dispatch(getPlantSelectListByType(ZBC, 'NFR', '', () => { }))

        let tempArr = [];
        vbcVendorGrid && vbcVendorGrid.map(el => {
            tempArr.push(el.VendorId)
            return null;
        })
        initialConfiguration?.IsDestinationPlantConfigure === false && setSelectedVendors(tempArr)
        return () => {
            reactLocalStorage?.setObject('vendorData', [])
        }
    }, []);

    /**
    * @method toggleDrawer
    * @description TOGGLE DRAWER
    */
    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('',
            {
                ...data,
                DestinationPlantCode: initialConfiguration && initialConfiguration?.IsDestinationPlantConfigure ? DestinationPlant.PlantCode : '',
                DestinationPlantId: initialConfiguration && initialConfiguration?.IsDestinationPlantConfigure ? DestinationPlant.value : EMPTY_GUID_0,
                DestinationPlantName: initialConfiguration && initialConfiguration?.IsDestinationPlantConfigure ? DestinationPlant.label : '',                 //PlantName
                DestinationPlant: DestinationPlant,
                VendorName: `${data.VendorName} (${data.VendorCode})`
            })
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
    };

    /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            nfrInsightStatusDetails.length !== 0 && setNoData(searchNocontentFilter(value, noData))
        }, 500);
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }

    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        statusFormatter: statusFormatter
    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        gridApi.deselectAll()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
    }

    /**
    * @method render
    * @description Renders the component
    */
    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            >
                <Container className='drawer-wrapper layout-min-width-920px'>
                    <Row className="drawer-heading">
                        <Col>
                            <div className={'header-wrapper left mt-2'}>
                                <h3>NFR Insight Status Details</h3>
                            </div>
                            <div
                                onClick={(e) => toggleDrawer(e)}
                                className={'close-button right'}
                            ></div>
                        </Col>
                    </Row>
                    <div className={'ag-grid-react'}>
                        <Row className={`filter-row-large pt-2 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>
                            <Col md="3" lg="3" className='mb-2'>
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            </Col>
                            <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                            </Col>
                        </Row>
                        <div className={`ag-grid-wrapper  ${(nfrInsightStatusDetails && nfrInsightStatusDetails?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                            <div className={`ag-theme-material`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                <AgGridReact
                                    style={{ height: '100%', width: '100%' }}
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    rowData={nfrInsightStatusDetails}
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
                                    rowSelection={'multiple'}
                                    suppressRowClickSelection={true}
                                    onFilterModified={onFloatingFilterChanged}
                                    enableBrowserTooltips={true}
                                >
                                    <AgGridColumn field="NfrNumber" headerName="NFR Number"></AgGridColumn>
                                    <AgGridColumn field="NfrRefNumber" headerName="NFR Ref Number"></AgGridColumn>
                                    <AgGridColumn field="NfrVersion" headerName="NFR Version"></AgGridColumn>
                                    <AgGridColumn field="PlantCode" headerName="Plant Code"></AgGridColumn>
                                    <AgGridColumn field="Status" headerName="Status" cellRenderer='statusFormatter' ></AgGridColumn>
                                </AgGridReact>
                                <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                            </div>
                        </div>
                    </div>
                </Container>
            </Drawer>
        </div >
    );
}

export default React.memo(NFRInsightStatusDetailsDrawer)