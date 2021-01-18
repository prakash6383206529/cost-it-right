import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import { getRMCCTabData, saveCostingRMCCTab, setRMCCData } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';

function TabRMCC(props) {

  const { netPOPrice } = props;

  const { handleSubmit, } = useForm();

  const [netProcessCost, setNetProcessCost] = useState('');
  const [netOperationCost, setNetOperationCost] = useState('');
  const [netToolsCost, setNetToolsCost] = useState(0);
  const [tabData, setTabData] = useState([]);
  const [costingData, setCostingData] = useState({});

  const dispatch = useDispatch()

  const RMCCTabData = useSelector(state => state.costing.RMCCTabData)

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getRMCCTabData(data, true, (res) => { }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let topHeaderData = {
      NetRawMaterialsCost: getGrandNetRMCost(),
      NetBoughtOutPartCost: getGrandNetBOPCost(),
      NetConversionCost: getGrandNetConversionCost(),
      NetOperationCost: netOperationCost,
      NetProcessCost: netProcessCost,
      NetToolsCost: netToolsCost,
      NetTotalRMBOPCC: getGrandNetRMCost() + getGrandNetBOPCost() + getGrandNetConversionCost(),
    }
    props.setHeaderCost(topHeaderData)
  }, [tabData]);

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, params) => {
    console.log('rmGrid: ', rmGrid, params);
    setRMCostInDataList(rmGrid, params, RMCCTabData)
    // let tempObj = tabData[index];
    // let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(tempObj.TotalConversionCost)

    // let tempArr = Object.assign([...tabData], {
    //   [index]: Object.assign({}, tabData[index],
    //     { GrandTotalCost: GrandTotalCost, TotalRawMaterialsCost: netRMCost(rmGrid), CostingRawMaterialsCost: rmGrid })
    // })

    // setTimeout(() => {
    //   setTabData(tempArr)
    // }, 200)

  }

  const setRMCostInDataList = (rmGrid, params, arr) => {
    try {

      let tempArr = [];
      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          // let tempObj = tabData[index];
          let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(i.TotalBoughtOutPartCost) + checkForNull(i.TotalConversionCost)

          // let tempArr = Object.assign([...tabData], {
          //   [index]: Object.assign({}, tabData[index],
          //     { GrandTotalCost: GrandTotalCost, TotalRawMaterialsCost: netRMCost(rmGrid), CostingRawMaterialsCost: rmGrid })
          // })

          //i.CostingChildPartDetails = params.BOMLevel !== "L0" ? ChangeBOMLeveL(Children, BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          i.GrandTotalCost = GrandTotalCost;
          i.TotalRawMaterialsCost = netRMCost(rmGrid);
          //i.IsOpen = !i.IsOpen;

        } else {
          setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
      console.log('tempArr: ', tempArr);
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
  * @method netRMCost
  * @description GET RM COST
  */
  const netRMCost = (item) => {
    let NetRMCost = 0;
    NetRMCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetLandedCost);
    }, 0)
    return NetRMCost;
  }

  /**
   * @method setBOPCost
   * @description SET BOP COST
   */
  const setBOPCost = (bopGrid, params) => {
    setBOPCostInDataList(bopGrid, params, RMCCTabData)
    // let tempObj = tabData[index];
    // let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(tempObj.TotalConversionCost);

    // let tempArr = Object.assign([...tabData], {
    //   [index]: Object.assign({}, tabData[index],
    //     { GrandTotalCost: GrandTotalCost, TotalBoughtOutPartCost: checkForDecimalAndNull(netBOPCost(bopGrid), 2), CostingBoughtOutPartCost: bopGrid })
    // })

    // setTimeout(() => {
    //   setTabData(tempArr)
    // }, 200)

  }

  const setBOPCostInDataList = (bopGrid, params, arr) => {
    try {

      let tempArr = [];
      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(i.TotalConversionCost);

          i.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          i.GrandTotalCost = GrandTotalCost;
          i.TotalBoughtOutPartCost = netBOPCost(bopGrid);
          //i.IsOpen = !i.IsOpen;

        } else {
          setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
      console.log('tempArr: ', tempArr);
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
  * @method netBOPCost
  * @description GET BOP COST
  */
  const netBOPCost = (item) => {
    let NetCost = 0;
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetBoughtOutPartCost);
    }, 0)
    return NetCost;
  }

  /**
   * @method setProcessCost
   * @description SET PROCESS COST
   */
  const setProcessCost = (conversionGrid, params) => {
    setProcessCostInDataList(conversionGrid, params, RMCCTabData)
    // let tempObj = tabData[index];
    // let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(conversionGrid && conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0);

    // let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
    //   return el;
    // })

    // let tempArr = Object.assign([...tabData], {
    //   [index]: Object.assign({}, tabData[index],
    //     {
    //       GrandTotalCost: GrandTotalCost,
    //       TotalConversionCost: conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0,
    //       CostingConversionCost: { ...conversionGrid, CostingProcessCostResponse: data }
    //     })
    // })

    // setTimeout(() => {
    //   setTabData(tempArr)
    //   setNetProcessCost(conversionGrid.ProcessCostTotal)
    // }, 200)

  }

  const setProcessCostInDataList = (conversionGrid, params, arr) => {
    try {

      let tempArr = [];
      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) + checkForNull(i.TotalBoughtOutPartCost) + checkForNull(conversionGrid && conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0);
          let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
            return el;
          })

          i.CostingPartDetails.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: data };
          i.GrandTotalCost = GrandTotalCost;
          i.TotalConversionCost = conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0;
          //i.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: data }
          //i.IsOpen = !i.IsOpen;

        } else {
          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
   * @method setOperationCost
   * @description SET OPERATION COST
   */
  const setOperationCost = (operationGrid, params) => {
    setOperationCostInDataList(operationGrid, params, RMCCTabData)
    // let tempObj = tabData[index];
    // let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)

    // let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
    //   return el;
    // })

    // let tempArr = Object.assign([...tabData], {
    //   [index]: Object.assign({}, tabData[index],
    //     {
    //       GrandTotalCost: GrandTotalCost,
    //       TotalConversionCost: operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0,
    //       CostingConversionCost: { ...operationGrid, CostingOperationCostResponse: data },
    //     })
    // })
    // setTimeout(() => {
    //   setTabData(tempArr)
    //   setNetOperationCost(operationGrid.OperationCostTotal)
    // }, 200)
  }

  const setOperationCostInDataList = (operationGrid, params, arr) => {
    try {

      let tempArr = [];
      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) + checkForNull(i.TotalBoughtOutPartCost) + checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)
          let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.CostingPartDetails.CostingConversionCost = { ...operationGrid, CostingOperationCostResponse: data };
          i.TotalConversionCost = operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0;
          //i.IsOpen = !i.IsOpen;

        } else {
          setProcessCostInDataList(operationGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
   * @method setToolCost
   * @description SET TOOL COST
   */
  const setToolCost = (toolGrid, params) => {
    setToolCostInDataList(toolGrid, params, RMCCTabData)
    // let tempObj = tabData[index];
    // let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(toolGrid.NetConversionCost)

    // let data = toolGrid && toolGrid.CostingOperationCostResponse && toolGrid.CostingToolsCostResponse.map(el => {
    //   return el;
    // })

    // let tempArr = Object.assign([...tabData], {
    //   [index]: Object.assign({}, tabData[index],
    //     {
    //       GrandTotalCost: GrandTotalCost,
    //       IsShowToolCost: true,
    //       CostingConversionCost: {
    //         ...toolGrid,
    //         CostingToolsCostResponse: data,
    //       },
    //     })
    // })

    // setTimeout(() => {
    //   setNetToolsCost(checkForDecimalAndNull(toolGrid.ToolsCostTotal, 2))
    //   setTabData(tempArr)
    // }, 500)
  }

  const setToolCostInDataList = (toolGrid, params, arr) => {
    try {

      let tempArr = [];
      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) + checkForNull(i.TotalBoughtOutPartCost) + checkForNull(toolGrid.NetConversionCost)

          let data = toolGrid && toolGrid.CostingOperationCostResponse && toolGrid.CostingToolsCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.IsShowToolCost = true;
          i.CostingPartDetails.CostingConversionCost = { ...toolGrid, CostingToolsCostResponse: data };
          //i.IsOpen = !i.IsOpen;

        } else {
          setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }
  }

  /**
  * @method getGrandNetRMCost
  * @description GET GRAND TOTAL RM COST
  */
  const getGrandNetRMCost = () => {
    let NetCost = 0;
    NetCost = tabData && tabData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalRawMaterialsCost);
    }, 0)
    return NetCost;
  }

  /**
  * @method getGrandNetBOPCost
  * @description GET GRAND TOTAL BOP COST
  */
  const getGrandNetBOPCost = () => {
    let NetCost = 0;
    NetCost = tabData && tabData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalBoughtOutPartCost);
    }, 0)
    return NetCost;
  }

  /**
  * @method getGrandNetConversionCost
  * @description GET GRAND TOTAL CONVERSION COST
  */
  const getGrandNetConversionCost = () => {
    let NetCost = 0;
    NetCost = tabData && tabData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalConversionCost);
    }, 0)
    return NetCost;
  }

  /**
  * @method getTotalCost
  * @description GET TOTAL COST
  */
  const getTotalCost = () => {
    return getGrandNetRMCost() + getGrandNetBOPCost() + getGrandNetConversionCost();
  }

  /**
  * @method toggleAssembly
  * @description SET PART DETAILS
  */
  const toggleAssembly = (BOMLevel, PartName, Children = []) => {
    setAssembly(BOMLevel, PartName, Children, RMCCTabData)
  }

  /**
  * @method formatData
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartName, Children, RMCCTabData) => {

    try {

      let tempArr = [];
      tempArr = RMCCTabData && RMCCTabData.map(i => {
        if (i.PartName === PartName && i.BOMLevel === BOMLevel) {
          i.CostingChildPartDetails = BOMLevel !== "L0" ? ChangeBOMLeveL(Children, BOMLevel) : i.CostingChildPartDetails;
          i.IsOpen = !i.IsOpen;
        } else {
          setAssembly(BOMLevel, PartName, Children, i.CostingChildPartDetails)
        }
        return i;
      });
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }

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
  * @method setPartDetails
  * @description SET PART DETAILS
  */
  const setPartDetails = (BOMLevel, PartNumber, Data) => {
    formatData(BOMLevel, PartNumber, Data, RMCCTabData)
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (BOMLevel, PartNumber, Data, RMCCTabData) => {

    try {
      let tempArr = [];

      tempArr = RMCCTabData && RMCCTabData.map(i => {
        if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          i.CostingPartDetails = Data;
          i.IsOpen = !i.IsOpen;
        } else {
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)
        }
        return i;
      });
      console.log('tempArr: AA', tempArr);
      dispatch(setRMCCData(tempArr, () => { }))

    } catch (error) {
      console.log('error: ', error);
    }

  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      NetRawMaterialsCost: getGrandNetRMCost(),
      NetBoughtOutPartCost: getGrandNetBOPCost(),
      NetConversionCost: getGrandNetConversionCost(),
      NetOperationCost: netOperationCost,
      NetProcessCost: netProcessCost,
      NetToolsCost: netToolsCost,
      NetTotalRMBOPCC: getGrandNetRMCost() + getGrandNetBOPCost() + getGrandNetConversionCost(),
      NetSurfaceTreatmentCost: 0,
      NetOverheadAndProfitCost: 0,
      NetPackagingAndFreight: 0,
      NetToolCost: netToolsCost,
      DiscountsAndOtherCost: 0,
      TotalCost: getTotalCost(),
      NetPOPrice: netPOPrice,
      LoggedInUserId: loggedInUserId(),
      CostingId: costData.CostingId,
      CostingNumber: costData.CostingNumber,
      ShareOfBusinessPercent: costData.ShareOfBusinessPercent,
      PartId: costData.PartId,
      PartNumber: costData.PartNumber,
      Version: costingData.Version,
      CostingPartDetails: tabData,
    }

    dispatch(saveCostingRMCCTab(data, res => {
      console.log('saveCostingRMCCTab: ', res);
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
              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm" >
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '100px' }}>{`Type`}</th>
                          <th style={{ width: '150px' }}>{`RM Cost`}</th>
                          <th style={{ width: '150px' }}>{`BOP Cost`}</th>
                          <th style={{ width: '200px' }}>{`Conversion Cost`}</th>
                          <th style={{ width: '200px' }}>{`Quantity`}</th>
                          <th style={{ width: '200px' }}>{`RM + CC Cost/Part`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          RMCCTabData && RMCCTabData.map((item, index) => {
                            if (item.CostingPartDetails && item.CostingPartDetails.PartType === 'Component') {

                              return (
                                < >
                                  <PartCompoment
                                    index={index}
                                    item={item}
                                    rmData={item.CostingPartDetails.CostingRawMaterialsCost}
                                    bopData={item.CostingPartDetails.CostingBoughtOutPartCost}
                                    ccData={item.CostingPartDetails.CostingConversionCost}
                                    setPartDetails={setPartDetails}
                                    setRMCost={setRMCost}
                                    setBOPCost={setBOPCost}
                                    setProcessCost={setProcessCost}
                                    setOperationCost={setOperationCost}
                                    setToolCost={setToolCost}
                                  />
                                </>
                              )

                            } else {
                              console.log('Assembly from parent')
                              return (
                                < >
                                  <AssemblyPart
                                    index={index}
                                    item={item}
                                    children={item.CostingChildPartDetails}
                                    setPartDetails={setPartDetails}
                                    toggleAssembly={toggleAssembly}
                                    setRMCost={setRMCost}
                                    setBOPCost={setBOPCost}
                                    setProcessCost={setProcessCost}
                                    setOperationCost={setOperationCost}
                                    setToolCost={setToolCost}
                                  />
                                </>
                              )
                            }
                          })
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}>
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
                    </button>
                  </div>
                </Row>

              </form>
            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};


export default TabRMCC;
//export default React.memo(TabRMCC);