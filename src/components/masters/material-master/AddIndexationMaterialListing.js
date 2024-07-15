
import React, { useEffect } from 'react'
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
import { reactLocalStorage } from 'reactjs-localstorage'
import AddOtherCostDrawer from './AddOtherCostDrawer'
import { useDispatch, useSelector } from 'react-redux'
import { setCommodityDetails } from '../actions/Indexation'

const gridOptions = {};
function AddIndexationMaterialListing(props) {

    const { isViewFlag } = props
    const { setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const dispatch = useDispatch()
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [state, setState] = useState({
        isOpenOtherCost: false,
        rowData: {},
        tableData: [],
        rowIndex: 0,
        reRender: false,
        totalBasicRate: 0,
        commodityDetailsState: [],
        isLoader: false
    })
    // 
    const { commodityDetailsArray } = useSelector((state) => state.indexation)

    useEffect(() => {
        setState(prevState => ({ ...prevState, commodityDetailsState: commodityDetailsArray }))
    }, [commodityDetailsArray])
    useEffect(() => {
        // Calculate totalBasicRate whenever commodityDetailsState changes
        const totalRate = state.commodityDetailsState && state.commodityDetailsState?.reduce((sum, row) => {
            const baseCurrency = row.TotalCostConversion ? row.TotalCostConversion + row.BasicRateConversion : row.BasicRateConversion || 0;
            const baseCurrencyBypercentage = baseCurrency * row.Percentage / 100 || 0;
            return sum + baseCurrencyBypercentage;
        }, 0);
        setState(prevState => ({ ...prevState, totalBasicRate: totalRate }))
        props.setTotalBasicRate(totalRate)
    }, [state.isLoader, state.commodityDetailsState]);

    useEffect(() => {

        setState(prevState => ({ ...prevState, commodityDetailsState: props.commodityDetails }))
    }, [props.commodityDetails])

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        // params.api?.sizeColumnsToFit();
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
    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                {cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''}
            </>
        )
    }
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
    const AddTotalCost = (cellValue, rowData, rowIndex) => {
        setState(prevState => ({ ...prevState, isOpenOtherCost: true, rowData: rowData, rowIndex: rowIndex }));
    }

    const closeOtherCostToggle = (type, RawMaterialCommodityIndexRateDetailsRequest, TotalCost, TotalCostConversion, rowIndex) => {
        if (type === 'Cancel') {
            setState(prevState => ({ ...prevState, isOpenOtherCost: false, reRender: !prevState.reRender }));
            return
        } else {
            // setState(prevState => ({ ...prevState, isLoader: true }));
            // if (RawMaterialCommodityIndexRateDetailsRequest.length >= 1) {
            let tempArray = state.commodityDetailsState;
            let tempData = tempArray[rowIndex];

            const totalCostForPercent = checkForNull(TotalCostConversion) + checkForNull(tempData?.BasicRateConversion)


            tempData = {
                ...tempData,
                TotalCostConversion, // Add BasicRateConversion to the object
                TotalCost,// Add totalCostCurrency to the object
                TotalCostPercent: totalCostForPercent * tempData.Percentage / 100,
                RawMaterialCommodityIndexRateDetailsRequest,
            };

            tempArray[rowIndex] = tempData;

            setState(prevState => ({ ...prevState, commodityDetailsState: tempArray, isLoader: true }));

            setTimeout(() => {
                setState(prevState => ({ ...prevState, isLoader: false }));
            }, 500);
            // }
            dispatch(setCommodityDetails(tempArray))
            setState(prevState => ({ ...prevState, isOpenOtherCost: false, reRender: !prevState.reRender }));
        }

    }
    /**
* @method buttonFormatter
* @description Renders buttons
*/
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = rowData?.TotalCostConversion ? rowData?.BasicRateConversion + rowData?.TotalCostConversion : rowData?.BasicRateConversion

        return (
            <>

                <div className="d-flex justify-content-between">{checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice)}
                    {<button
                        type="button"
                        className={`mr5 mt-2 ${isViewFlag ? 'View small' : 'add-out-sourcing'} `}
                        onClick={() => AddTotalCost(cellValue, rowData, props.rowIndex)}
                        title="Add"
                    >
                    </button>}
                </div>
            </>
        )
    };

    const totalCostCurrencyFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = rowData?.TotalCost ? rowData?.TotalCost + rowData?.BasicRate : rowData?.BasicRate
        return (
            <>
                {value != null ? checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice) : ''}
            </>
        )
    }
    const totalFormatter = (props) => {
        const cell = props?.data?.TotalCostConversion ? props?.data?.TotalCostConversion + props?.data?.BasicRateConversion : props?.data?.BasicRateConversion;
        const percentage = props?.data?.Percentage
        const value = percentage ? cell * percentage / 100 : cell

        return (
            <>
                {value != null ? checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const frameworkComponents = {
        // customLoadingOverlay: LoaderCustom,
        commonFormatter: commonFormatter,
        customNoRowsOverlay: NoContentFound,
        priceFormatter: priceFormatter,
        buttonFormatter: buttonFormatter,
        totalCostCurrencyFormatter: totalCostCurrencyFormatter,
        totalFormatter: totalFormatter
    };

    return (
        <>
            <div className={`ag-grid-react`}>
                <div className="container-fluid">
                    <div className="login-container signup-form">
                        <div className="row">
                            {<div className="col-md-12">
                                {props.isOpen && (
                                    <Row>
                                        <Col md="12">
                                            <div className={`ag-grid-wrapper budgeting-table  ${commodityDetailsArray && commodityDetailsArray?.length <= 0 ? "overlay-contain" : ""}`} style={{ width: '100%', height: '100%' }}>
                                                <div className="ag-theme-material" >
                                                    {state.isLoader ? (<LoaderCustom customClass="simulation-Loader" />) : (
                                                        <>
                                                            <AgGridReact
                                                                style={{ height: '100%', width: '100%' }}
                                                                defaultColDef={defaultColDef}
                                                                domLayout='autoHeight'
                                                                // columnDefs={c}
                                                                rowData={commodityDetailsArray ?? []}
                                                                // onCellValueChanged={onCellValueChanged}
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
                                                                <AgGridColumn width={200} field="CommodityStandardName" headerName="Commodity Name" editable={false}></AgGridColumn>
                                                                <AgGridColumn width={115} field="Percentage" headerName="Percentage" editable={false}></AgGridColumn>
                                                                <AgGridColumn width={150} field="ExchangeRate" headerName="Exchange Rate" editable={false}></AgGridColumn>
                                                                <AgGridColumn width={225} field="BasicRate" headerName="Basic Rate (Index Currency)" editable={false} cellRenderer='priceFormatter'></AgGridColumn>
                                                                <AgGridColumn width={150} field="BasicRateConversion" headerName={`Basic Rate (${reactLocalStorage.getObject('baseCurrency')})`} editable={false} cellRenderer='priceFormatter'></AgGridColumn>
                                                                <AgGridColumn width={190} field="BasicRate" headerName="Total Cost (Currency)" cellRenderer='totalCostCurrencyFormatter' editable={false} ></AgGridColumn>
                                                                <AgGridColumn width={180} field="BasicRateConversion" headerName={`Total Cost (${reactLocalStorage.getObject('baseCurrency')})`} cellRenderer='buttonFormatter' editable={false} ></AgGridColumn>
                                                                <AgGridColumn width={180} field="BasicRateConversion" headerName={`Total Cost (${reactLocalStorage.getObject('baseCurrency')}) by %`} cellRenderer='totalFormatter' editable={false} ></AgGridColumn>
                                                            </AgGridReact>
                                                        </>)}
                                                </div>
                                            </div>
                                        </Col >
                                    </Row >
                                )
                                }
                                {
                                    state.isOpenOtherCost &&
                                    <AddOtherCostDrawer
                                        isOpen={state.isOpenOtherCost}
                                        //tableData={state.conditionTableData}
                                        closeDrawer={closeOtherCostToggle}
                                        anchor={'right'}
                                        ViewMode={isViewFlag}
                                        isFromMaster={true}
                                        RowData={state.commodityDetailsState[state?.rowIndex]}
                                        tableData={state.commodityDetailsState[state?.rowIndex]?.RawMaterialCommodityIndexRateDetailsRequest ? state.commodityDetailsState[state?.rowIndex]?.RawMaterialCommodityIndexRateDetailsRequest : []} //commodityDetailsState[state?.rowIndex]?.data}
                                        RowIndex={state?.rowIndex}
                                    />
                                }
                            </div >}
                        </div >
                    </div >
                </div >
            </div >
        </>
    );
}

export default AddIndexationMaterialListing;
