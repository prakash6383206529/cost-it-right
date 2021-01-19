import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getToolTabData, saveToolTab, } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import Switch from "react-switch";
import Tool from '../CostingHeadCosts/Tool';

function TabToolCost(props) {

  const { register, handleSubmit, reset } = useForm();

  const [IsApplicableProcessWise, setIsApplicableProcessWise] = useState(false);
  const [IsApplicablilityDisable, setIsApplicablilityDisable] = useState(false);
  const [tabData, setTabData] = useState([]);
  const [toolCost, setNetToolCost] = useState('');

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      dispatch(getToolTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          if (Data.IsProcessWiseApplicability === true) {
            setIsApplicablilityDisable(Data.IsProcessWiseApplicability)
          }
          setTabData(Data.CostingPartDetails)
        }
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // let topHeaderData = {
    //   NetSurfaceTreatmentCost: surfaceTotal + transportationTotal,
    // }
    // props.setHeaderCost(topHeaderData)
  }, [tabData]);

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method setOverAllApplicabilityCost
  * @description SET OVERALL APPLICABILITY DEATILS
  */
  const setOverAllApplicabilityCost = (OverAllToolObj, index) => {
    let tempObj = tabData[index];

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          OverAllApplicability: OverAllToolObj,
          NetToolCost: OverAllToolObj.NetToolCost,
          //CostingToolsCostResponse: [],
        })
    })

    setTimeout(() => {
      setNetToolCost(OverAllToolObj.NetToolCost)
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method setToolCost
  * @description SET OVERHEAD DEATILS
  */
  const setToolCost = (ToolObj, index) => {
    let tempObj = tabData[index];

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          CostingToolsCostResponse: ToolObj,
          NetToolCost: ToolObj.NetToolCost,
          OverAllApplicability: {},
        })
    })

    setTimeout(() => {
      setNetToolCost(ToolObj.NetToolCost)
      setTabData(tempArr)
    }, 200)

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
      "IsProcessWiseApplicability": IsApplicableProcessWise,
      "NetToolsCost": toolCost,
      "NetToolCost": toolCost,
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": props.netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      //"Version": "string",
      "CostingPartDetails": tabData,

    }

    dispatch(saveToolTab(data, res => {
      console.log('saveCostingOverheadProfitTab: ', res);
    }))

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {


  }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{""}</h2>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="1">{"Applicability:"}</Col>
                <Col md="8" className="switch mb15">
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
                </Col>
                <Col md="2">{"Net Tool Cost"}</Col>
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
                        {tabData &&
                          tabData.map((item, index) => {
                            return (
                              <>
                                <tr key={index} onClick={() => toggle(index)}>
                                  <td>
                                    <span class="cr-prt-nm cr-prt-link">
                                      {item.PartName}
                                    </span>
                                  </td>
                                  <td>
                                    {checkForDecimalAndNull(
                                      item.NetToolCost,
                                      2
                                    )}
                                  </td>
                                </tr>
                                {item.IsOpen && (
                                  <tr>
                                    <td colSpan={2}>
                                      <div>
                                        <Tool
                                          index={index}
                                          IsApplicableProcessWise={
                                            IsApplicableProcessWise
                                          }
                                          data={item}
                                          // headCostRMCCBOPData={props.headCostRMCCBOPData}
                                          setOverAllApplicabilityCost={
                                            setOverAllApplicabilityCost
                                          }
                                          setToolCost={setToolCost}
                                          saveCosting={saveCosting}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                )}
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

export default TabToolCost;