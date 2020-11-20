import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import { getRMCCTabData, saveCostingRMCCTab } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../helper';

function TabRMCC(props) {

  const { register, handleSubmit, watch, reset } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [netProcessCost, setNetProcessCost] = useState('');
  const [netOperationCost, setNetOperationCost] = useState('');
  const [netToolsCost, setNetToolsCost] = useState('');
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
      dispatch(getRMCCTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setTabData(Data.CostingPartDetails)
        }
      }))
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

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method getGrandTotalCost
  * @description GET GRAND TOTAL COST
  */
  const getGrandTotalCost = (data) => {
    let GrandTotalCost = checkForNull(data.TotalRawMaterialsCost) + checkForNull(data.TotalBoughtOutPartCost) + checkForNull(data.TotalConversionCost)
    return GrandTotalCost;
  }

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, index) => {
    let tempObj = tabData[index];
    let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(tempObj.TotalConversionCost)

    // let data = rmGrid && rmGrid.map(el => {
    //   return {
    //     RawMaterialId: el.RawMaterialId,
    //     UOM: el.UOM,
    //     RMName: el.RMName,
    //     RMRate: el.RMRate,
    //     ScrapRate: el.ScrapRate,
    //     FinishWeight: el.FinishWeight,
    //     GrossWeight: el.GrossWeight,
    //     NetLandedCost: el.NetLandedCost,
    //     WeightCalculatorRequest: el.WeightCalculatorRequest,
    //   }
    // })

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        { GrandTotalCost: GrandTotalCost, TotalRawMaterialsCost: netRMCost(rmGrid), CostingRawMaterialsCost: rmGrid })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)

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
  const setBOPCost = (bopGrid, index) => {
    let tempObj = tabData[index];
    let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(tempObj.TotalConversionCost);

    // let data = bopGrid && bopGrid.map(el => {
    //   return {
    //     BOPPartName: el.BoughtOutPartName,
    //     BOPPartNumber: el.BoughtOutPartNumber,
    //     BoughtOutPartId: el.BoughtOutPartId,
    //     Currency: el.Currency,
    //     LandedCostINR: el.NetLandedCost,
    //     NetBoughtOutPartCost: el.NetBOPCost,
    //     Quantity: el.Quantity,
    //   }
    // })

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        { GrandTotalCost: GrandTotalCost, TotalBoughtOutPartCost: checkForDecimalAndNull(netBOPCost(bopGrid), 2), CostingBoughtOutPartCost: bopGrid })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)

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
  const setProcessCost = (conversionGrid, index) => {
    let tempObj = tabData[index];
    let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(conversionGrid && conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0);

    let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
      return el;
      // return {
      //   Cavity: el.Cavity,
      //   CycleTime: el.CycleTime,
      //   Efficiency: el.Efficiency,
      //   MHR: el.MachineRate,
      //   MachineId: el.MachineId,
      //   MachineName: el.MachineName,
      //   ProcessDescription: el.ProcessDescription,
      //   ProcessId: el.ProcessId,
      //   ProcessName: el.ProcessName,
      //   Quantity: el.Quantity,
      //   Tonnage: el.MachineTonnage,
      //   UOM: el.UOM,
      // }
    })

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          GrandTotalCost: GrandTotalCost,
          TotalConversionCost: conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0,
          CostingConversionCost: { ...conversionGrid, CostingProcessCostResponse: data }
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
      setNetProcessCost(conversionGrid.ProcessCostTotal)
    }, 200)

  }

  /**
   * @method setOperationCost
   * @description SET OPERATION COST
   */
  const setOperationCost = (operationGrid, index) => {
    let tempObj = tabData[index];
    let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)

    let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
      return el;
      // return {
      //   LabourQuantity: el.LabourQuantity,
      //   LabourRate: el.LabourRate,
      //   OperationCode: el.OperationCode,
      //   OperationCost: el.NetCost,
      //   OperationId: el.OperationId,
      //   OperationName: el.OperationName,
      //   Quantity: el.Quantity,
      //   Rate: el.Rate,
      //   UOM: el.UnitOfMeasurement,
      // }
    })

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          GrandTotalCost: GrandTotalCost,
          TotalConversionCost: operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0,
          CostingConversionCost: { ...operationGrid, CostingOperationCostResponse: data },
        })
    })
    setTimeout(() => {
      setTabData(tempArr)
      setNetOperationCost(operationGrid.OperationCostTotal)
    }, 200)
  }

  /**
  * @method netGrandToolsCost
  * @description GET GRAND TOOLS COST
  */
  const netGrandToolsCost = (item) => {
    console.log('item: ', item);
    let NetCost = 0;
    NetCost = item && item.CostingToolsCostResponse !== undefined && item.CostingToolsCostResponse.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetToolCost);
    }, 0)
    return NetCost;
  }

  /**
   * @method setToolCost
   * @description SET TOOL COST
   */
  const setToolCost = (toolGrid, index) => {

    let tempObj = tabData[index];
    let GrandTotalCost = checkForNull(tempObj.TotalRawMaterialsCost) + checkForNull(tempObj.TotalBoughtOutPartCost) + checkForNull(toolGrid.NetConversionCost)
    //let GrandTotalCost = 0;

    let data = toolGrid && toolGrid.CostingOperationCostResponse && toolGrid.CostingToolsCostResponse.map(el => {
      return el;
      // return {
      //   Life: el.Life,
      //   ProcessOrOperation: el.ProcessOrOperation,
      //   Quantity: el.Quantity,
      //   ToolCategory: el.ToolCategory,
      //   ToolCost: el.ToolCost,
      //   ToolName: el.ToolName,
      //   ToolOperationId: el.ToolOperationId,
      // }
    })

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          GrandTotalCost: GrandTotalCost,
          //TotalConversionCost: toolGrid.NetConversionCost,
          IsShowToolCost: true,
          CostingConversionCost: {
            ...toolGrid,
            //NetConversionCost: toolGrid.NetConversionCost,
            ToolsCostTotal: checkForDecimalAndNull(toolGrid.ToolsCostTotal, 2),
            CostingToolsCostResponse: data,
          },
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
      setNetToolsCost(toolGrid.ToolCostTotal)
    }, 500)
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
      NetToolCost: 0,
      DiscountsAndOtherCost: 0,
      TotalCost: getTotalCost(),
      NetPOPrice: getTotalCost(),
      LoggedInUserId: loggedInUserId(),
      CostingId: costData.CostingId,
      CostingNumber: costData.CostingNumber,
      ShareOfBusinessPercent: costData.ShareOfBusinessPercent,
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
              <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >

                <Row>
                  <Table className="table" size="sm" >
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
                    <tbody >
                      {
                        tabData && tabData.map((item, index) => {
                          return (
                            < >
                              <tr key={index} onClick={() => toggle(index)}>
                                <td>{item.PartName}</td>
                                <td>{item.Type}</td>
                                <td>{item.TotalRawMaterialsCost !== null ? checkForDecimalAndNull(item.TotalRawMaterialsCost, 2) : 0}</td>
                                <td>{item.TotalBoughtOutPartCost !== null ? checkForDecimalAndNull(item.TotalBoughtOutPartCost, 2) : 0}</td>
                                <td>{item.TotalConversionCost !== null ? checkForDecimalAndNull(item.TotalConversionCost, 2) : 0}</td>
                                <td>{item.Quantity !== null ? item.Quantity : 1}</td>
                                <td>{item.GrandTotalCost !== null ? checkForDecimalAndNull(item.GrandTotalCost, 2) : 0}</td>
                              </tr>
                              {item.IsOpen && <tr>
                                <td colSpan={7}>
                                  <div>
                                    <PartCompoment
                                      index={index}
                                      rmData={item.CostingRawMaterialsCost}
                                      bopData={item.CostingBoughtOutPartCost}
                                      ccData={item.CostingConversionCost}
                                      costData={costData}
                                      setRMCost={setRMCost}
                                      setBOPCost={setBOPCost}
                                      setProcessCost={setProcessCost}
                                      setOperationCost={setOperationCost}
                                      setToolCost={setToolCost}
                                    />
                                  </div>
                                </td>
                              </tr>}
                            </>
                          )
                        })
                      }

                    </tbody>
                  </Table>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt25">
                  <div className="col-sm-12 text-right bluefooter-butn">

                    {/* <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={cancel} >
                  <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                </button> */}

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