import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getToolTabData, saveToolTab, setToolTabData, getToolsProcessWiseDataListByCostingID,
  setComponentToolItemData, saveDiscountOtherCostTab, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation,
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import Switch from "react-switch";
import Tool from '../CostingHeadCosts/Tool';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

function TabToolCost(props) {

  const { handleSubmit, } = useForm();

  const dispatch = useDispatch()
  const IsToolCostApplicable = useSelector(state => state.costing.IsToolCostApplicable)

  const [IsApplicableProcessWise, setIsApplicableProcessWise] = useState(IsToolCostApplicable);
  const [IsApplicablilityDisable, setIsApplicablilityDisable] = useState(true);

  const { ToolTabData, CostingEffectiveDate, ToolsDataList, ComponentItemDiscountData,RMCCTabData,SurfaceTabData,OverheadProfitTabData,DiscountCostData,PackageAndFreightTabData } = useSelector(state => state.costing)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);

  const dispense = () => {
    setIsApplicableProcessWise(IsToolCostApplicable)
  }
  const dispenseCallback = React.useCallback(dispense, [IsToolCostApplicable])

  useEffect(() => {
    dispenseCallback()
  }, [IsToolCostApplicable])

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getToolTabData(data, true, (res) => { }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = ToolTabData && ToolTabData.length > 0 && ToolTabData[0].CostingPartDetails !== undefined ? ToolTabData[0].CostingPartDetails : null;
      //setTimeout(() => {
      let topHeaderData = {
        ToolCost: TopHeaderValues && TopHeaderValues.TotalToolCost,
        IsApplicableProcessWise: IsApplicableProcessWise,
      }
      if (props.activeTab === '5') {
        props.setHeaderCost(topHeaderData)
      }
      //}, 1500)
    }
  }, [ToolTabData]);

  /**
  * @method setOverAllApplicabilityCost
  * @description SET OVERALL APPLICABILITY DEATILS
  */
  const setOverAllApplicabilityCost = (OverAllToolObj) => {
    let arr = dispatchOverallApplicabilityCost(OverAllToolObj, ToolTabData)
    //dispatch(setToolTabData(arr, () => { }))
  }
  const onGridReady = (params) => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.paginationGoToPage(0);

  };
 
  const gridOptions = {
    clearSearch: true,
    noDataText: (ToolsDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
    // // paginationShowsTotal: renderPaginationShowsTotal(),
    // prePage: <span className="prev-page-pg"></span>, // Previous page button text
    // nextPage: <span className="next-page-pg"></span>, // Next page button text
    // firstPage: <span className="first-page-pg"></span>, // First page button text
    // lastPage: <span className="last-page-pg"></span>,
  };
  const defaultColDef = {

    resizable: true,
    filter: true,
    sortable: true,
    // headerCheckboxSelection: isFirstColumn,
    // checkboxSelection: isFirstColumn
  };

  /**
  * @method dispatchOverallApplicabilityCost
  * @description SET OVERALL APPLICABILITY DEATILS
  */
  const dispatchOverallApplicabilityCost = (OverAllToolObj, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.OverAllApplicability = OverAllToolObj;
        i.CostingPartDetails.NetToolCost = OverAllToolObj.NetToolCost;
        i.CostingPartDetails.CostingToolCostResponse = [];

        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }

  /**
* @method setToolCost
* @description SET TOOL COST
*/
  const setToolCost = (ToolGrid, IsChanged) => {
    let arr = dispatchToolCost(ToolGrid, IsChanged, ToolTabData)
    dispatch(setToolTabData(arr, () => { }))
  }

  /**
  * @method dispatchToolCost
  * @description SET TOOL COST
  */
  const dispatchToolCost = (ToolGrid, IsChanged, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.CostingToolCostResponse = ToolGrid;
        i.CostingPartDetails.TotalToolCost = getTotalCost(ToolGrid);
        //i.CostingPartDetails.OverAllApplicability = {};
        i.IsChanged = IsChanged;

        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }

  /**
  * @method getTotalCost
  * @description GET TOTAL COST
  */
  const getTotalCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetToolCost);
    }, 0)
    return cost;
  }

  /**
  * @method onPressApplicability
  * @description SET APPLICABILITY
  */
  const onPressApplicability = () => {
    setIsApplicableProcessWise(!IsApplicableProcessWise)
  }

  useEffect(() => {

    if (IsApplicableProcessWise && props.activeTab === '5') {
      dispatch(getToolsProcessWiseDataListByCostingID(costData.CostingId, () => { }))
    }

  }, [IsApplicableProcessWise, props.activeTab])

  /**
  * @method getTotal
  * @description GET TOTAL COST
  */
  const getTotal = () => {
    let cost = 0;
    cost = ToolsDataList && ToolsDataList.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetToolCost);
    }, 0)
    return cost;
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = (formData) => {
    const tabData = RMCCTabData[0]
    const surfaceTabData= SurfaceTabData[0]
    const overHeadAndProfitTabData=OverheadProfitTabData[0]
    const discountAndOtherTabData =DiscountCostData[0]
    const data = {
      "IsToolCostProcessWise": false,
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,
      "CostingNumber": costData.CostingNumber,
      "ToolCost": ToolTabData.TotalToolCost,
      "CostingPartDetails": ToolTabData && ToolTabData[0].CostingPartDetails,
      "TotalCost": netPOPrice,
    }
    if(costData.IsAssemblyPart === true){

      let assemblyRequestedData = {        
        "TopRow": {
          "CostingId":tabData.CostingId,
          "CostingNumber": tabData.CostingNumber,
          "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity+ tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "NetConversionCostPerAssembly":tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "NetRMBOPCCCost":tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
          "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
          "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
          "NetOtherCost": discountAndOtherTabData?.CostingPartDetails?.NetOtherCost,
          "NetDiscounts":discountAndOtherTabData?.CostingPartDetails?.NetDiscountsCost,
          "TotalCostINR": netPOPrice,
          "TabId":5
        },
         "WorkingRows": [],
        "LoggedInUserId": loggedInUserId()
      
    }
    console.log(assemblyRequestedData,"assemblyRequestedData");
    dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData,res =>{      }))
    }

    dispatch(saveToolTab(data, res => {
      if (res.data.Result) {
        toastr.success(MESSAGES.TOOL_TAB_COSTING_SAVE_SUCCESS);
        dispatch(setComponentToolItemData({}, () => { }))
        InjectDiscountAPICall()
      }
    }))

  }

  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, CallingFrom: 5 }, res => {
      dispatch(setComponentDiscountOtherItemData({}, () => { }))
    }))
  }

  /**
* @method renderPaginationShowsTotal
* @description Pagination
*/
  const renderPaginationShowsTotal = (start, to, total) => {
    return <GridTotalFormate start={start} to={to} total={total} />
  }

  // const options = {
  //   clearSearch: true,
  //   // noDataText: (ToolsDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
  //   paginationShowsTotal: renderPaginationShowsTotal(),
  //   prePage: <span className="prev-page-pg"></span>, // Previous page button text
  //   nextPage: <span className="next-page-pg"></span>, // Next page button text
  //   firstPage: <span className="first-page-pg"></span>, // First page button text
  //   lastPage: <span className="last-page-pg"></span>,

  // };

  const frameworkComponents = {
    // renderPlant: renderPlant,
    // renderVendor: renderVendor,
    // renderVendor: renderVendor,
    // priceFormatter: priceFormatter,
    // oldpriceFormatter: oldpriceFormatter,
    // createdOnFormatter: createdOnFormatter,
    // requestedOnFormatter: requestedOnFormatter,
    // statusFormatter: statusFormatter,
    // customLoadingOverlay: LoaderCustom,
    customNoRowsOverlay: NoContentFound,
    // linkableFormatter: linkableFormatter
  };
  const onPageSizeChanged = (newPageSize) => {
    var value = document.getElementById('page-size').value;
    gridApi.paginationSetPageSize(Number(value));
  };
  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">

              <Row className="m-0  costing-border border-bottom-0 align-items-center ">
                <Col md="9" className="px-30 py-4 border-section">
                  <span className="d-inline-block pr-2 text-dark-blue">Applicability: </span>
                  <div className="switch d-inline-flex">
                    <label className="switch-level d-inline-flex w-auto">
                      <div className={"left-title ml-2 mr-1"}>{"Overall"}</div>
                      <span className="cr-sw-level h-auto">
                        <span className="d-inline-block">
                          <Switch
                            onChange={onPressApplicability}
                            checked={IsApplicableProcessWise}
                            id="normal-switch"
                            disabled={IsApplicablilityDisable || IsApplicableProcessWise || CostingViewMode}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                            className="align-middle"
                          />
                        </span>
                      </span>
                      <div className={"right-title "}>{"Process Wise"}</div>
                    </label>
                  </div>
                </Col>
                <Col md="3" className="px-30 py-4 border-section text-dark-blue pl10">
                  {"Net Tool Cost"}
                  {IsApplicableProcessWise && <span className="d-inline-block pl-2 font-weight-500">{getTotal()}</span>}
                </Col>
              </Row>

              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >

                {!IsApplicableProcessWise && 
                  <Row>
                    <Col md="12">
                      <Table className="table cr-brdr-main" size="sm">
                        <tbody>
                          {ToolTabData && ToolTabData.map((item, index) => {
                            return (
                              <>
                                <tr className="accordian-row" key={index}>
                                  <td style={{ width: '75%' }}>
                                    <span class="cr-prt-link1">
                                      {item.PartName}
                                    </span>
                                  </td>
                                  <td className="pl10">{checkForDecimalAndNull(item.CostingPartDetails.TotalToolCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={2} className="cr-innerwrap-td pb-3">
                                    <div>
                                      <Tool
                                        index={index}
                                        IsApplicableProcessWise={item.CostingPartDetails.IsToolCostProcessWise}
                                        data={item}
                                        // headCostRMCCBOPData={props.headCostRMCCBOPData}
                                        setOverAllApplicabilityCost={setOverAllApplicabilityCost}
                                        setToolCost={setToolCost}
                                        saveCosting={saveCosting}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>}

                { IsApplicableProcessWise &&
                  <Row>
                    <Col>
                      {/* <BootstrapTable
                        data={ToolsDataList}
                        striped={false}
                        hover={false}
                        bordered={false}
                        options={options}
                        className="table cr-brdr-main table-sm tool-cost-tab-process-table"
                      //search
                      // exportCSV
                      //ignoreSinglePage
                      //ref={'table'}
                      //pagination
                      >
                        <TableHeaderColumn dataField="ToolOperationId" isKey={true} hidden width={100} dataAlign="center" searchable={false} >{''}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="BOMLevel" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'BOMLevel'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="PartNumber" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Part Number'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="ProcessOrOperation" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Process/Operation'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="ToolCategory" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Tool Category'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="ToolName" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Tool Name'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="Quantity" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Quantity'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="ToolCost" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'ToolCost'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="Life" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Life'}</TableHeaderColumn>
                        <TableHeaderColumn width={100} dataField="NetToolCost" searchable={false} columnTitle={true} dataAlign="left" dataSort={true} >{'Net Tool Cost'}</TableHeaderColumn>
                      </BootstrapTable> */}
                       {/* <----------------------START AG Grid convert on 21-10-2021---------------------------------------------> */}
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
                            rowData={ToolsDataList}
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
                            <AgGridColumn field="ToolOperationId" headerName=" "></AgGridColumn>
                            <AgGridColumn field="BOMLevel" headerName="BOMLevel"></AgGridColumn>
                            <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                            <AgGridColumn field="ProcessOrOperation" headerName="Process/Operation"></AgGridColumn>
                            <AgGridColumn field="ToolCategory" headerName="Tool Category" ></AgGridColumn>
                            <AgGridColumn field="ToolName" headerName="Tool Name"></AgGridColumn>
                            <AgGridColumn field="ToolCost" headerName="ToolCost"></AgGridColumn>
                            <AgGridColumn field="Life" headerName="Life"></AgGridColumn>
                            <AgGridColumn field="NetToolCost" headerName="Net Tool Cost"></AgGridColumn>
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
                      {/* <--------------------AG Grid convert by 21-10-2021------> */}
                    </Col>
                  </Row>}

              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(TabToolCost);