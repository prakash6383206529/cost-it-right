import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getOverheadProfitTabData, saveCostingOverheadProfitTab, } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, } from '../../../../helper';
import OverheadProfit from '../CostingHeadCosts/OverheadProfit';

function TabOverheadProfit(props) {

  const { register, handleSubmit, reset } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [tabData, setTabData] = useState([]);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        PlantId: costData.PlantId,
      }
      dispatch(getOverheadProfitTabData(data, (res) => {
        console.log('res: >>>>>>>>> ', res);
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
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
  * @method setSurfaceCost
  * @description SET SURFACE TREATMENT COST
  */
  const setSurfaceCost = (surfaceGrid, index) => {
    let tempObj = tabData[index];
    let NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(tempObj.TransporationCost)

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          //GrandTotalCost: tempObj.GrandTotalCost + NetSurfaceTreatmentCost,
          NetSurfaceTreatmentCost: NetSurfaceTreatmentCost,
          SurfaceTreatmentCost: surfaceCost(surfaceGrid),
          SurfaceTreatmentZBCDetails: surfaceGrid
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method surfaceCost
  * @description GET SURFACE TREATMENT COST
  */
  const surfaceCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost);
    }, 0)

    return cost;
  }

  /**
  * @method setTransportationCost
  * @description SET TRANSPORTATION COST
  */
  const setTransportationCost = (transportationObj, index) => {
    let tempObj = tabData[index];
    let NetSurfaceTreatmentCost = checkForNull(tempObj.SurfaceTreatmentCost) + checkForNull(transportationObj.TransporationCost)

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          //GrandTotalCost: tempObj.GrandTotalCost + NetSurfaceTreatmentCost,
          NetSurfaceTreatmentCost: NetSurfaceTreatmentCost,
          TransporationCost: transportationObj.TransporationCost,
          TransporationZBCDetails: transportationObj,
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      "CostingId": "00000000-0000-0000-0000-000000000000",
      "OverheadProfitDetailId": "00000000-0000-0000-0000-000000000000",
      "PartId": "00000000-0000-0000-0000-000000000000",
      "PartNumber": "string",
      "NetPOPrice": 0,
      "LoggedInUserId": "00000000-0000-0000-0000-000000000000",
      "NetOverheadAndProfitCost": 0,
      "IsApplicableForChildParts": true,
      "OverheadNetCost": 0,
      "ProfitNetCost": 0,
      "RejectionNetCost": 0,
      "OverheadProfitNetCost": 0,
      "ModelTypeId": "00000000-0000-0000-0000-000000000000",
      "ModelType": "string",
      "CostingOverheadDetail": {
        "OverheadId": "00000000-0000-0000-0000-000000000000",
        "IsOverheadCombined": true,
        "OverheadApplicabilityId": "00000000-0000-0000-0000-000000000000",
        "OverheadApplicability": "string",
        "OverheadPercentage": 0,
        "OverheadCombinedCost": 0,
        "OverheadCombinedTotalCost": 0,
        "OverheadCCPercentage": 0,
        "OverheadCCCost": 0,
        "OverheadCCTotalCost": 0,
        "IsOverheadCCApplicable": true,
        "OverheadBOPPercentage": 0,
        "OverheadBOPCost": 0,
        "OverheadBOPTotalCost": 0,
        "IsOverheadBOPApplicable": true,
        "OverheadRMPercentage": 0,
        "OverheadRMCost": 0,
        "OverheadRMTotalCost": 0,
        "IsOverheadRMApplicable": true,
        "OverheadFixedPercentage": 0,
        "OverheadFixedCost": 0,
        "OverheadFixedTotalCost": 0,
        "IsOverheadFixedApplicable": true,
        "IsSurfaceTreatmentApplicable": true
      },
      "CostingProfitDetail": {
        "ProfitId": "00000000-0000-0000-0000-000000000000",
        "ProfitApplicabilityId": "00000000-0000-0000-0000-000000000000",
        "ProfitApplicability": "string",
        "IsProfitCombined": true,
        "ProfitPercentage": 0,
        "ProfitCombinedCost": 0,
        "ProfitCombinedTotalCost": 0,
        "ProfitCCPercentage": 0,
        "ProfitCCCost": 0,
        "ProfitCCTotalCost": 0,
        "IsProfitCCApplicable": true,
        "ProfitBOPPercentage": 0,
        "ProfitBOPCost": 0,
        "ProfitBOPTotalCost": 0,
        "IsProfitBOPApplicable": true,
        "ProfitRMPercentage": 0,
        "ProfitRMCost": 0,
        "ProfitRMTotalCost": 0,
        "IsProfitRMApplicable": true,
        "ProfitFixedPercentage": 0,
        "ProfitFixedCost": 0,
        "ProfitFixedTotalCost": 0,
        "IsProfitFixedApplicable": true,
        "IsSurfaceTreatmentApplicable": true
      },
      "CostingRejectionDetail": {
        "RejectionApplicabilityId": "00000000-0000-0000-0000-000000000000",
        "RejectionApplicability": "string",
        "RejectionPercentage": 0,
        "RejectionCost": 0,
        "RejectionTotalCost": 0,
        "IsSurfaceTreatmentApplicable": true
      }

    }

    dispatch(saveCostingOverheadProfitTab(data, res => {
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
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="4" className="mb15">

                </Col>
              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Table className="table" size="sm" >
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>{``}</th>
                        <th style={{ width: '100px' }}>{`Net Overheads`}</th>
                        <th style={{ width: '150px' }}>{`Net Profit`}</th>
                        <th style={{ width: '150px' }}>{`Net Rejection`}</th>
                        <th style={{ width: '150px' }}>{`Net ICC`}</th>
                        <th style={{ width: '150px' }}>{`Payment Terms`}</th>
                      </tr>
                    </thead>
                    <tbody >
                      {
                        tabData && tabData.map((item, index) => {
                          return (
                            < >
                              <tr key={index} onClick={() => toggle(index)}>
                                <td>{item.PartName}</td>
                                <td>{''}</td>
                                <td>{''}</td>
                                <td>{''}</td>
                                <td>{''}</td>
                                <td>{''}</td>
                              </tr>
                              {item.IsOpen &&
                                <tr>
                                  <td colSpan={6}>
                                    <div>
                                      <OverheadProfit
                                        index={index}
                                        tabData={item}
                                        headCostRMCCBOPData={props.headCostRMCCBOPData}
                                      // setSurfaceCost={setSurfaceCost}
                                      // setTransportationCost={setTransportationCost}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              }
                            </>
                          )
                        })
                      }

                    </tbody>
                  </Table>
                </Row>

                {/* <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}>
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
                    </button>
                  </div>
                </Row> */}

              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};

export default TabOverheadProfit;