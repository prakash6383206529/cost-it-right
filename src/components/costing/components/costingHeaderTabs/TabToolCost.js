import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getToolTabData, saveToolTab, setToolTabData, getToolsProcessWiseDataListByCostingID,
  setComponentToolItemData, saveDiscountOtherCostTab, setComponentDiscountOtherItemData,
} from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import Switch from "react-switch";
import Tool from '../CostingHeadCosts/Tool';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { GridTotalFormate } from '../../../common/TableGridFunctions';

function TabToolCost(props) {

  const { handleSubmit, } = useForm();

  const dispatch = useDispatch()
  const IsToolCostApplicable = useSelector(state => state.costing.IsToolCostApplicable)

  const [IsApplicableProcessWise, setIsApplicableProcessWise] = useState(IsToolCostApplicable);
  const [IsApplicablilityDisable, setIsApplicablilityDisable] = useState(true);

  const ToolTabData = useSelector(state => state.costing.ToolTabData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const ToolsDataList = useSelector(state => state.costing.ToolsDataList)
  const ComponentItemDiscountData = useSelector(state => state.costing.ComponentItemDiscountData)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);

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
    let TopHeaderValues = ToolTabData && ToolTabData.length > 0 && ToolTabData[0].CostingPartDetails !== undefined ? ToolTabData[0].CostingPartDetails : null;
    let topHeaderData = {
      ToolCost: TopHeaderValues && TopHeaderValues.TotalToolCost,
      IsApplicableProcessWise: IsApplicableProcessWise,
    }
    props.setHeaderCost(topHeaderData)
  }, [ToolTabData]);

  /**
  * @method setOverAllApplicabilityCost
  * @description SET OVERALL APPLICABILITY DEATILS
  */
  const setOverAllApplicabilityCost = (OverAllToolObj) => {
    let arr = dispatchOverallApplicabilityCost(OverAllToolObj, ToolTabData)
    //dispatch(setToolTabData(arr, () => { }))
  }

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
    const data = {
      "IsToolCostProcessWise": false,
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "LoggedInUserId": loggedInUserId(),
      "CostingNumber": costData.CostingNumber,
      "ToolCost": ToolTabData.TotalToolCost,
      "CostingPartDetails": ToolTabData && ToolTabData[0].CostingPartDetails
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

  const options = {
    clearSearch: true,
    noDataText: (ToolsDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
    paginationShowsTotal: renderPaginationShowsTotal(),
    prePage: <span className="prev-page-pg"></span>, // Previous page button text
    nextPage: <span className="next-page-pg"></span>, // Next page button text
    firstPage: <span className="first-page-pg"></span>, // First page button text
    lastPage: <span className="last-page-pg"></span>,

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
                  <span className="d-inline-block pr-2 text-dark-blue">Applicability:</span>
                  <div className="switch d-inline-flex">
                    <label className="switch-level d-inline-flex w-auto">
                      <div className={"left-title"}>{"Overall"}</div>
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
                      <div className={"right-title"}>{"Process Wise"}</div>
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

                {IsApplicableProcessWise &&
                  <Row>
                    <Col>
                      <BootstrapTable
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
                      </BootstrapTable>
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