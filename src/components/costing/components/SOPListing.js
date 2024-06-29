import React from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Col, Row } from 'reactstrap';
import { EMPTY_DATA } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import NoContentFound from '../../common/NoContentFound';

const SOPListing = ({  rowData}) => {
    console.log('defaultColDef, rowData, onGridReady, frameworkComponents: ', defaultColDef, rowData, onGridReady, frameworkComponents);
    
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        floatingFilter: true,
    };

    const onGridReady = (params) => {
        // setGridApi(params.api);
        // setGridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
        params.api.sizeColumnsToFit();
    };

    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };
    return (
        <Row>
              { rowData?.length <= 0 ? (
                                <LoaderCustom customClass="loader-center" />
                            ) : (
            <Col>
                <div className="ag-grid-react">
                    <div className={`ag-grid-wrapper height-width-wrapper ${rowData?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div className="ag-theme-material">
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={false}
                                domLayout='autoHeight'
                                rowData={rowData}
                                onGridReady={onGridReady}
                                gridOptions={{}}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'
                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn width={"230px"} field="YearName" headerName="Production Year" cellRenderer={'sopFormatter'}></AgGridColumn>
                                <AgGridColumn width={"230px"} field="Quantity" headerName="Annual Forecast Quantity" headerComponent={'quantityHeader'} cellRenderer={'afcFormatter'} colId="Quantity"></AgGridColumn>
                            </AgGridReact>
                        </div>
                    </div>
                </div>
                
            </Col>
            )}
        </Row>
    );
};

export default SOPListing;
