import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getToolTabData, saveToolTab, setToolTabData } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import Switch from "react-switch";
import Tool from '../CostingHeadCosts/Tool';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';

function TabToolCost(props) {

  const { handleSubmit, } = useForm();

  const [IsApplicableProcessWise, setIsApplicableProcessWise] = useState(false);
  const [IsApplicablilityDisable, setIsApplicablilityDisable] = useState(true);

  const dispatch = useDispatch()
  const ToolTabData = useSelector(state => state.costing.ToolTabData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const costData = useContext(costingInfoContext);

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
    let TopHeaderValues = ToolTabData && ToolTabData !== undefined && ToolTabData[0].CostingPartDetails !== undefined ? ToolTabData[0].CostingPartDetails : null;
    let topHeaderData = {
      ToolCost: TopHeaderValues && TopHeaderValues.TotalToolCost,
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
      console.log('error: ', error);
    }
    return tempArr;

  }

  /**
* @method setToolCost
* @description SET TOOL COST
*/
  const setToolCost = (ToolGrid) => {
    let arr = dispatchToolCost(ToolGrid, ToolTabData)
    dispatch(setToolTabData(arr, () => { }))
  }

  /**
  * @method dispatchToolCost
  * @description SET TOOL COST
  */
  const dispatchToolCost = (ToolGrid, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.CostingToolCostResponse = ToolGrid;
        i.CostingPartDetails.TotalToolCost = getTotalCost(ToolGrid);
        //i.CostingPartDetails.OverAllApplicability = {};

        return i;
      });

    } catch (error) {
      console.log('error: ', error);
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
      }
    }))

  }

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
              {/* <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{""}</h2>
                  </div>
                </Col>
              </Row> */}

              <Row className="m-0  costing-border border-bottom-0 align-items-center ">
                <Col md="9" className="px-30 py-4 ">
                  <span className="d-inline-block pr-2 text-dark-blue">Applicability:</span>
                  <div className="switch d-inline-flex">
                    <label className="switch-level d-inline-flex w-auto">
                      <div className={"left-title"}>{"Overall"}</div>
                      <span className="cr-sw-level">
                        <span className="cr-switch-icon">
                          <Switch
                            onChange={onPressApplicability}
                            checked={IsApplicableProcessWise}
                            id="normal-switch"
                            disabled={IsApplicablilityDisable}
                            background="#4DC771"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#CCC"
                            uncheckedIcon={false}
                            checkedIcon={false}
                            height={20}
                            width={46}
                          />
                        </span>
                        <div className={"right-title"}>{"Process Wise"}</div>
                      </span>
                    </label>
                  </div>
                </Col>
                <Col md="3" className="px-30 py-4 text-dark-blue pl10">{"Net Tool Cost"}</Col>
              </Row>

              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      {/* <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '150px' }}>{`200`}</th>
                        </tr>
                      </thead> */}
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
                                <td className="pl10">{checkForDecimalAndNull(item.CostingPartDetails.TotalToolCost, initialConfiguration.NumberOfDecimalForTransaction)}</td>
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
                </Row>
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(TabToolCost);