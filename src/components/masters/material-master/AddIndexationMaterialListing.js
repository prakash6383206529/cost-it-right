import React from 'react'
import { Row, Col } from 'reactstrap'
import { checkForDecimalAndNull, checkForNull } from '../../../helper/validation'
import { getConfigurationKey } from '../../../helper/auth'
import LoaderCustom from '../../common/LoaderCustom'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA } from '../../../config/constants'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import NoContentFound from '../../common/NoContentFound'

const gridOptions = {};
function AddIndexationMaterialListing(props) {
    console.log('props: ', props);
    const CommodityDetails = props.commodityDetails
    console.log('CommodityDetails: ', CommodityDetails);
    const { setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const [tableData, setTableData] = useState([]);
    const initialTableData = [
        {
            materialName: "Steel",
            Percentage: 50,
            BasicRate: 50
        },
        {
            materialName: "Aluminum",
            Percentage: 20,
            BasicRate: 20
        },
        {
            materialName: "Copper",
            Percentage: 20,
            BasicRate: 20
        },
        {
            materialName: "Plastic",
            Percentage: 10,
            BasicRate: 20
        }
    ];

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLoader, setIsLoader] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [totalSum, setTotalSum] = useState(0);
    const [currencyExchangeRate, setCurrencyExchangeRate] = useState(1);

    const onCellValueChanged = (value) => {

        let temp = []
        tableData && tableData.map((item) => {
            if (item.Text == value.data.Text) {
                item.Sum = Number(checkForNull(value?.data?.January)) + Number(checkForNull(value?.data?.February)) + Number(checkForNull(value?.data?.March)) + Number(checkForNull(value?.data?.April)) + Number(checkForNull(value?.data?.May)) + Number(checkForNull(value?.data?.June)) + Number(checkForNull(value?.data?.July)) + Number(checkForNull(value?.data?.August)) + Number(checkForNull(value?.data?.September)) + Number(checkForNull(value?.data?.October)) + Number(checkForNull(value?.data?.November)) + Number(checkForNull(value?.data?.December))
            }
            temp.push(item)
        })
        let total = 0
        temp.map((item, ind) => {
            total = Number(total) + Number(checkForNull(item.Sum))
        })
        setTotalSum((total + currentPrice))
        setValue('totalSum', checkForDecimalAndNull(total + currentPrice, getConfigurationKey().NoOfDecimalForPrice))
        if (currencyExchangeRate > 1) {
            setValue('totalSumCurrency', checkForDecimalAndNull((total + currentPrice) / currencyExchangeRate, getConfigurationKey().NoOfDecimalForPrice))
        }
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api?.sizeColumnsToFit();
        params.api.paginationGoToPage(0);
        setTimeout(() => {
        }, 100);
    };

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        editable: true
    };
    const commonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                {
                    <span id={`newBasicRate-${props.rowIndex}`} className='form-control'>{cell}</span>
                }
            </>
        )
    }
    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        commonFormatter: commonFormatter,
        customNoRowsOverlay: NoContentFound,
    };

    return (
        <>
            <div className={`ag-grid-react`}>
                <div className="container-fluid">
                    <div className="login-container signup-form">
                        <div className="row">
                            <div className="col-md-12">
                                {props.isOpen && (
                                    <Row>
                                        <Col md="12">
                                            {console.log('CommodityDetails: ', CommodityDetails)}
                                            <div className={`ag-grid-wrapper budgeting-table  ${CommodityDetails && CommodityDetails?.length <= 0 ? "overlay-contain" : ""}`} style={{ width: '100%', height: '100%' }}>
                                                <div className="ag-theme-material" >
                                                    <AgGridReact
                                                        style={{ height: '100%', width: '100%' }}
                                                        defaultColDef={defaultColDef}
                                                        domLayout='autoHeight'
                                                        // columnDefs={c}
                                                        rowData={CommodityDetails}
                                                        onCellValueChanged={onCellValueChanged}
                                                        pagination={true}
                                                        paginationPageSize={12}
                                                        onGridReady={onGridReady}
                                                        gridOptions={gridOptions}
                                                        loadingOverlayComponent={'customLoadingOverlay'}
                                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                                        noRowsOverlayComponentParams={{
                                                            title: EMPTY_DATA,
                                                        }}
                                                        frameworkComponents={frameworkComponents}
                                                        suppressColumnVirtualisation={true}
                                                        stopEditingWhenCellsLoseFocus={true}
                                                    >
                                                        <AgGridColumn width={115} field="materialName" headerName="Material Name" editable={false}></AgGridColumn>
                                                        <AgGridColumn width={115} field="Percentage" headerName="Percentage" editable={false}></AgGridColumn>
                                                        <AgGridColumn width={115} field="BasicRate" headerName="Basic Rate" editable={false}></AgGridColumn>
                                                        <AgGridColumn width={115} field="ProcessingCost" headerName="Premium Charges" cellRenderer='commonFormatter'></AgGridColumn>
                                                        <AgGridColumn width={115} field="ProcessingCost" headerName="Processing Cost" cellRenderer='commonFormatter'></AgGridColumn>
                                                        <AgGridColumn width={115} field="ImportFreight" headerName="Import Freight" cellRenderer='commonFormatter'></AgGridColumn>
                                                        <AgGridColumn width={115} field="OtherCost" headerName="Other Cost" cellRenderer='commonFormatter'></AgGridColumn>
                                                        <AgGridColumn width={115} field="CustomDuty" headerName="Custom Duty" cellRenderer='commonFormatter'></AgGridColumn>
                                                        <AgGridColumn width={115} field="ShippingLineChanges" headerName="Shipping Line Charges" cellRenderer='commonFormatter'></AgGridColumn>
                                                        <AgGridColumn width={115} field="Total" headerName="Total" editable={false} valueGetter='(Number(data.ProcessingCost?data.ProcessingCost:0)+ Number(data.ImportFreight?data.ImportFreight:0)+ Number(data.OtherCost?data.OtherCost:0)+ Number(data.CustomDuty?data.CustomDuty:0)+ Number(data.ShippingLineChanges?data.ShippingLineChanges:0))'></AgGridColumn>
                                                    </AgGridReact>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}

export default AddIndexationMaterialListing;
