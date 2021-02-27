import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getOverheadProfitTabData, setOverheadProfitData, saveCostingOverheadProfitTab, } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import OverheadProfit from '../CostingHeadCosts/OverheadProfit';
import Switch from "react-switch";
import PartOverheadProfit from '../CostingHeadCosts/OverheadProfit/PartOverheadProfit';
import AssemblyOverheadProfit from '../CostingHeadCosts/OverheadProfit/AssemblyOverheadProfit';
import { LEVEL0 } from '../../../../helper/AllConastant';

function TabOverheadProfit(props) {

  const { handleSubmit, } = useForm();

  const [IsApplicableForChildParts, setIsApplicableForChildParts] = useState(false);
  const [tabData, setTabData] = useState([]);

  const [OverheadCost, setOverheadCost] = useState(0);
  const [ProfitCost, setProfitCost] = useState(0);
  const [RejectionCost, setRejectionCost] = useState('');
  const [ICCCost, setICCCost] = useState('');
  const [PaymentTermCostValue, setPaymentTermCost] = useState('');

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getOverheadProfitTabData(data, (res) => { }))
    }
  }, [costData]);

  const OverheadProfitTabData = useSelector(state => state.costing.OverheadProfitTabData)

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {

    setTimeout(() => {
      let topHeaderData = {
        NetOverheadProfitCost: checkForNull(OverheadCost) + checkForNull(ProfitCost) + checkForNull(RejectionCost) + checkForNull(ICCCost) + checkForNull(PaymentTermCostValue),
      }
      props.setHeaderCost(topHeaderData)
    }, 1000)

  }, [tabData]);

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method toggleAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const toggleAssembly = (params, Children = {}) => {
    let arr = setAssembly(params, Children, OverheadProfitTabData)
    console.log('toggleAssembly  Sunday: ', params, arr);
    dispatch(setOverheadProfitData(arr, () => { }))
  }

  /**
  * @method setAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const setAssembly = (params, Children, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = Children;

        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(CostingChildPartDetails, params.BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = CostingPartDetails;

          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;

        } else {
          setAssembly(params, Children, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;

  }

  /**
  * @method ChangeBOMLeveL
  * @description INCREASE BOM LEVEL BY 1 
  */
  const ChangeBOMLeveL = (item, level) => {
    let tempArr = [];
    const ChangedLevel = parseInt(level.substr(1, level.length - 1)) + 1;
    tempArr = item && item.map(i => {
      i.BOMLevel = "L" + ChangedLevel;
      return i;
    });
    return tempArr;
  }

  /**
  * @method setOverheadDetail
  * @description SET OVERHEAD DEATILS
  */
  const setOverheadDetail = (data, index) => {

    const { overheadObj, profitObj, modelType } = data;

    let OverheadNetCost = checkForDecimalAndNull(overheadObj.OverheadRMTotalCost, 2) + checkForDecimalAndNull(overheadObj.OverheadBOPTotalCost, 2)
      + checkForDecimalAndNull(overheadObj.OverheadCCTotalCost, 2);

    let ProfitNetCost = checkForDecimalAndNull(profitObj.ProfitRMTotalCost, 2) + checkForDecimalAndNull(profitObj.ProfitBOPTotalCost, 2)
      + checkForDecimalAndNull(profitObj.ProfitCCTotalCost, 2);

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          CostingOverheadDetail: overheadObj,
          CostingProfitDetail: profitObj,
          OverheadNetCost: OverheadNetCost,
          ProfitNetCost: ProfitNetCost,
          NetOverheadAndProfitCost: OverheadNetCost + ProfitNetCost,
          OverheadProfitNetCost: OverheadNetCost + ProfitNetCost,
          ModelType: modelType.label,
          ModelTypeId: modelType.value,
        })
    })

    setTimeout(() => {
      setOverheadCost(overheadObj ? checkForDecimalAndNull(OverheadNetCost, 2) : 0)
      setProfitCost(profitObj ? checkForDecimalAndNull(ProfitNetCost, 2) : 0)
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method setProfitDetail
  * @description SET PROFIT DETAIL COST
  */
  const setProfitDetail = (profitObj, index) => {
    let tempObj = tabData[index];

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          CostingProfitDetail: profitObj,
          ProfitNetCost: '',
          NetOverheadAndProfitCost: '',
          OverheadProfitNetCost: '',
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method setRejectionDetail
  * @description SET REJECTION DETAIL 
  */
  const setRejectionDetail = (rejectionObj, index) => {

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          CostingRejectionDetail: rejectionObj,
          RejectionNetCost: rejectionObj.RejectionTotalCost,
        })
    })

    setTimeout(() => {
      setRejectionCost(checkForDecimalAndNull(rejectionObj ? rejectionObj.RejectionTotalCost : 0, 2))
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method setICCDetail
  * @description SET ICC DETAIL 
  */
  const setICCDetail = (ICCObj, index) => {

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          ICCCost: ICCObj ? ICCObj.NetCost : 0,
          CostingInterestRateDetail: {
            ...tabData[index].CostingInterestRateDetail,
            ICCApplicabilityDetail: ICCObj,
            IsInventoryCarringCost: ICCObj ? true : false,
            NetICC: ICCObj ? ICCObj.NetCost : 0,
          },
        })
    })

    setTimeout(() => {
      setICCCost(checkForDecimalAndNull(ICCObj && ICCObj.NetCost !== null ? ICCObj.NetCost : 0, 2))
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method setPaymentTermsDetail
  * @description SET PAYMENT TERMS DETAIL 
  */
  const setPaymentTermsDetail = (PaymentTermObj, index) => {

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          PaymentTermCost: PaymentTermObj ? PaymentTermObj.NetCost : 0,
          CostingInterestRateDetail: {
            ...tabData[index].CostingInterestRateDetail,
            PaymentTermDetail: PaymentTermObj,
            IsPaymentTerms: PaymentTermObj ? true : false,
            NetPaymentTermCost: PaymentTermObj ? PaymentTermObj.NetCost : 0,
          },
        })
    })

    setTimeout(() => {
      setPaymentTermCost(checkForDecimalAndNull(PaymentTermObj && PaymentTermObj.NetCost !== null ? PaymentTermObj.NetCost : 0, 2))
      setTabData(tempArr)
    }, 200)

  }

  /**
  * @method onPressApplicability
  * @description SET ASSEMBLY LEVEL APPLICABILITY
  */
  const onPressApplicability = () => {
    setIsApplicableForChildParts(!IsApplicableForChildParts)
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": props.netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      "IsApplicableForChildParts": IsApplicableForChildParts,
      "NetOverheadAndProfitCost": OverheadCost + ProfitCost,
      "OverheadNetCost": OverheadCost,
      "ProfitNetCost": ProfitCost,
      "RejectionNetCost": RejectionCost,
      "ICCCost": ICCCost,
      "PaymentTermCost": PaymentTermCostValue,
      "CostingPartDetails": tabData
    }

    dispatch(saveCostingOverheadProfitTab(data, res => {
      console.log('saveCostingOverheadProfitTab: ', res);
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
                    <div className={"left-title"}>{" Assembly Level"}</div>
                    <span className="cr-sw-level">
                      <span className="cr-switch-icon">
                        <Switch
                          onChange={onPressApplicability}
                          checked={IsApplicableForChildParts}
                          id="normal-switch"
                          disabled={false}
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
                      <div className={"right-title"}>
                        {"Sub Assembly Level"}
                      </div>
                    </span>
                  </label>
                </Col>
              </Row>

              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: "100px" }}>{``}</th>
                          <th style={{ width: '100px' }}>{`Type`}</th>
                          <th style={{ width: "100px" }}>{`Net Overheads`}</th>
                          <th style={{ width: "150px" }}>{`Net Profit`}</th>
                          <th style={{ width: "150px" }}>{`Net Rejection`}</th>
                          <th style={{ width: "150px" }}>{`Net ICC`}</th>
                          <th style={{ width: "150px" }}>{`Payment Terms`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {OverheadProfitTabData && OverheadProfitTabData.map((item, index) => {

                          if (item && item.PartType === 'Component') {

                            return (
                              < >
                                <PartOverheadProfit
                                  index={index}
                                  item={item}
                                  OverheadCost={OverheadCost}
                                  ProfitCost={ProfitCost}
                                  setOverheadDetail={setOverheadDetail}
                                  setProfitDetail={setProfitDetail}
                                  setRejectionDetail={setRejectionDetail}
                                  setICCDetail={setICCDetail}
                                  setPaymentTermsDetail={setPaymentTermsDetail}
                                  saveCosting={saveCosting}
                                />
                              </>
                            )

                          } else {
                            return (
                              < >
                                <AssemblyOverheadProfit
                                  index={index}
                                  item={item}
                                  children={item.CostingChildPartDetails}
                                  toggleAssembly={toggleAssembly}
                                  OverheadCost={OverheadCost}
                                  ProfitCost={ProfitCost}
                                  setOverheadDetail={setOverheadDetail}
                                  setProfitDetail={setProfitDetail}
                                  setRejectionDetail={setRejectionDetail}
                                  setICCDetail={setICCDetail}
                                  setPaymentTermsDetail={setPaymentTermsDetail}
                                  saveCosting={saveCosting}
                                />
                              </>
                            )
                          }

                          // return (
                          //   <>
                          //     <tr key={index} onClick={() => toggle(index)}>
                          //       <td>
                          //         <span class="cr-prt-nm cr-prt-link">
                          //           {item.PartName}
                          //         </span>
                          //       </td>
                          //       <td>{item.OverheadNetCost !== null ? checkForDecimalAndNull(item.OverheadNetCost, 2) : 0}</td>
                          //       <td>{item.ProfitNetCost !== null ? checkForDecimalAndNull(item.ProfitNetCost, 2) : 0}</td>
                          //       <td>{item.RejectionNetCost !== null ? checkForDecimalAndNull(item.RejectionNetCost, 2) : 0}</td>
                          //       <td>{item.ICCCost !== null ? checkForDecimalAndNull(item.ICCCost, 2) : 0}</td>
                          //       <td>{item.PaymentTermCost !== null ? checkForDecimalAndNull(item.PaymentTermCost, 2) : 0}</td>
                          //     </tr>
                          //     {item.IsOpen && (
                          //       <tr>
                          //         <td colSpan={6}>
                          //           <div>
                          //             <OverheadProfit
                          //               index={index}
                          //               tabData={item}
                          //               headCostRMCCBOPData={props.headCostRMCCBOPData}
                          //               OverheadCost={OverheadCost}
                          //               ProfitCost={ProfitCost}
                          //               setOverheadDetail={setOverheadDetail}
                          //               setProfitDetail={setProfitDetail}
                          //               setRejectionDetail={setRejectionDetail}
                          //               setICCDetail={setICCDetail}
                          //               setPaymentTermsDetail={setPaymentTermsDetail}
                          //               saveCosting={saveCosting}
                          //             />
                          //           </div>
                          //         </td>
                          //       </tr>
                          //     )}
                          //   </>
                          // );

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

export default React.memo(TabOverheadProfit);