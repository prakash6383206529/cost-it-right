import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import { getRMCCTabData, saveCostingRMCCTab, setRMCCData } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';
import { LEVEL0, SUB_ASSEMBLY } from '../../../../helper/AllConastant';

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
  * @method getRMTotalCostForAssembly
  * @description GET RM TOTAL COST FOR ASSEMBLY
  */
  const getRMTotalCostForAssembly = (arr) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === SUB_ASSEMBLY) {
        return accummlator + checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0);
      } else {
        return accummlator + checkForNull(el.TotalRawMaterialsCost !== null ? el.TotalRawMaterialsCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getBOPTotalCostForAssembly
  * @description GET BOP TOTAL COST FOR ASSEMBLY
  */
  const getBOPTotalCostForAssembly = (arr) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === SUB_ASSEMBLY) {
        return accummlator + checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0);
      } else {
        return accummlator + checkForNull(el.TotalBoughtOutPartCost !== null ? el.TotalBoughtOutPartCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getCCTotalCostForAssembly
  * @description GET CC TOTAL COST FOR ASSEMBLY
  */
  const getCCTotalCostForAssembly = (arr) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === SUB_ASSEMBLY) {
        return accummlator + checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0);
      } else {
        return accummlator + checkForNull(el.TotalConversionCost !== null ? el.TotalConversionCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getTotalCostForAssembly
  * @description GET TOTAL COST FOR ASSEMBLY
  */
  const getTotalCostForAssembly = (arr) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === SUB_ASSEMBLY) {
        return accummlator + checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0);
      } else {
        return accummlator + checkForNull(el.TotalCalculatedRMBOPCCCost !== null ? el.TotalCalculatedRMBOPCCCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, params) => {
    let arr = setRMCostInDataList(rmGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
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
    let tempArr = [];
    try {
      tempArr = arr && arr.map((i) => {
        const { CostingPartDetails, CostingChildPartDetails } = i;
        let newValue = {};
        if (i.IsAssemblyPart === true) {

          if (i.BOMLevel === LEVEL0) {

            newValue = {
              ...i, CostingPartDetails: {
                ...CostingPartDetails,
                TotalRawMaterialsCost: getRMTotalCostForAssembly(CostingChildPartDetails),
                TotalBoughtOutPartCost: '',
                TotalConversionCost: '',
                GrandTotalCost: '',
              }
            }
            console.log('Level 0', newValue)

            i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails)

          } else if (i.BOMLevel !== LEVEL0) {

            i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails)

          } else {
            console.log('Level Else')
          }

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

          i.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalRawMaterialsCost = netRMCost(rmGrid);

        } else {
          setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
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
    let arr = setBOPCostInDataList(bopGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setBOPCostInDataList = (bopGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (i.IsAssemblyPart === true) {

          if (i.BOMLevel === LEVEL0) {

            i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(i.CostingChildPartDetails);
            //i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)

          } else if (i.BOMLevel !== LEVEL0) {
            i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(i.CostingChildPartDetails);
            //i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)

          } else {
            console.log('Level Else')
          }

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(i.CostingPartDetails.TotalConversionCost);

          i.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(bopGrid);

        } else {
          setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
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
    let arr = setProcessCostInDataList(conversionGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setProcessCostInDataList = (conversionGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          if (i.BOMLevel === LEVEL0) {

            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)

          } else if (i.BOMLevel !== LEVEL0) {
            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)

          } else {
            console.log('Level Else')
          }

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(conversionGrid && conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0);
          let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
            return el;
          })

          i.CostingPartDetails.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: data };
          i.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.TotalConversionCost = conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0;

        } else {
          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
  }

  /**
   * @method setOperationCost
   * @description SET OPERATION COST
   */
  const setOperationCost = (operationGrid, params) => {
    let arr = setOperationCostInDataList(operationGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setOperationCostInDataList = (operationGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          if (i.BOMLevel === LEVEL0) {

            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)

          } else if (i.BOMLevel !== LEVEL0) {
            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)

          } else {
            console.log('Level Else')
          }

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) + checkForNull(i.TotalBoughtOutPartCost) + checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)
          let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.CostingPartDetails.CostingConversionCost = { ...operationGrid, CostingOperationCostResponse: data };
          i.TotalConversionCost = operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0;

        } else {
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)
        }
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
  const setToolCost = (toolGrid, params) => {
    let arr = setToolCostInDataList(toolGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setToolCostInDataList = (toolGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          if (i.BOMLevel === LEVEL0) {

            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)

          } else if (i.BOMLevel !== LEVEL0) {
            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails);
            setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)

          } else {
            console.log('Level Else')
          }

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(toolGrid.NetConversionCost)

          let data = toolGrid && toolGrid.CostingOperationCostResponse && toolGrid.CostingToolsCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.IsShowToolCost = true;
          i.CostingPartDetails.CostingConversionCost = { ...toolGrid, CostingToolsCostResponse: data };

        } else {
          setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });


    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
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
  const toggleAssembly = (BOMLevel, PartNumber, Children = {}) => {
    let arr = setAssembly(BOMLevel, PartNumber, Children, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData) => {
    let tempArr = [];
    try {

      tempArr = RMCCTabData && RMCCTabData.map(i => {
        if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          i.CostingChildPartDetails = BOMLevel !== "L0" ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = Children.CostingPartDetails;
          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;
        } else {
          setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
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
  * @method setPartDetails
  * @description SET PART DETAILS
  */
  const setPartDetails = (BOMLevel, PartNumber, Data) => {
    let arr = formatData(BOMLevel, PartNumber, Data, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (BOMLevel, PartNumber, Data, RMCCTabData) => {
    let tempArr = [];
    try {
      tempArr = RMCCTabData && RMCCTabData.map(i => {

        console.log('called from top', i)
        if (i.IsAssemblyPart === true) {

          if (i.BOMLevel === LEVEL0) {

            i.CostingPartDetails.TotalConversionCost = i.CostingPartDetails.TotalConversionCost + getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(i.TotalOperationCostPerAssembly) + checkForNull(i.TotalToolCostPerAssembly) + getTotalCostForAssembly(i.CostingChildPartDetails);
            formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)

          } else {
            i.CostingPartDetails.TotalConversionCost = i.CostingPartDetails.TotalConversionCost + getCCTotalCostForAssembly(i.CostingChildPartDetails);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(i.TotalOperationCostPerAssembly) + checkForNull(i.TotalToolCostPerAssembly) + getTotalCostForAssembly(i.CostingChildPartDetails);
            formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)
            console.log('Level Else')
          }

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          console.log('called ', i)
          i.CostingPartDetails = Data;
          i.IsOpen = !i.IsOpen;
        } else {
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
  }

  /**
  * @method setAssemblyOperationCost
  * @description SET RM COST
  */
  const setAssemblyOperationCost = (OperationGrid, params) => {
    let arr = setAssemblyOperationCostInDataList(OperationGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(GetOperationCostTotal(OperationGrid)) +
            checkForNull(i.TotalBoughtOutPartCost) +
            checkForNull(i.TotalConversionCost) +
            checkForNull(i.TotalToolCostPerAssembly) +
            checkForNull(i.TotalRawMaterialsCost);

          if (i.BOMLevel === LEVEL0) {

            i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
            i.CostingPartDetails.TotalConversionCost = GetOperationCostTotal(OperationGrid) + checkForNull(i.TotalToolCostPerAssembly) + checkForNull(i.TotalConversionCost);
            i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails)

          } else if (i.BOMLevel !== LEVEL0) {
            i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
            i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
            i.CostingPartDetails.TotalConversionCost = GetOperationCostTotal(OperationGrid) + checkForNull(i.TotalToolCostPerAssembly) + checkForNull(i.TotalConversionCost);
            i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails)

          } else {
            console.log('Level Else')
          }

          // } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          //   let GrandTotalCost = checkForNull(GetOperationCostTotal(OperationGrid)) +
          //     checkForNull(i.TotalBoughtOutPartCost) +
          //     checkForNull(i.TotalConversionCost) +
          //     checkForNull(i.TotalToolCostPerAssembly) +
          //     checkForNull(i.TotalRawMaterialsCost);

          //   i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
          //   i.CostingPartDetails.GrandTotalCost = GrandTotalCost;
          //   i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);

        } else {
          setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
  }

  /**
  * @method GetOperationCostTotal
  * @description GET TOTAL OPERATION COST FOR ASSEMBLY
  */
  const GetOperationCostTotal = (item) => {
    let NetCost = 0;
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.OperationCost);
    }, 0)
    return NetCost;
  }

  /**
  * @method setAssemblyToolCost
  * @description SET RM COST
  */
  const setAssemblyToolCost = (ToolGrid, params) => {
    let arr = setAssemblyToolCostInDataList(ToolGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setAssemblyToolCostInDataList = (ToolGrid, params, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = GetToolCostTotal(ToolGrid) + checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly);

          i.CostingPartDetails.CostingToolCostResponse = ToolGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalToolCostPerAssembly = GetToolCostTotal(ToolGrid);

        } else {
          setAssemblyToolCostInDataList(ToolGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
  }

  /**
  * @method GetToolCostTotal
  * @description GET TOTAL OPERATION COST FOR ASSEMBLY
  */
  const GetToolCostTotal = (item) => {
    let NetCost = 0;
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalToolCost);
    }, 0)
    return NetCost;
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
                                    setAssemblyOperationCost={setAssemblyOperationCost}
                                    setAssemblyToolCost={setAssemblyToolCost}
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