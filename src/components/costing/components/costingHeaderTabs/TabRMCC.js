import React, { useState, useEffect, useContext, } from 'react';
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
  const { netPOPrice } = props.netPOPrice ? props.netPOPrice : ''

  const { handleSubmit } = useForm()

  const [netProcessCost, setNetProcessCost] = useState('')
  const [netOperationCost, setNetOperationCost] = useState('')
  const [netToolsCost, setNetToolsCost] = useState(0)
  const [tabData, setTabData] = useState([])
  const [costingData, setCostingData] = useState({})

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
  }, [costData])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let TopHeaderValues = RMCCTabData && RMCCTabData !== undefined && RMCCTabData[0].CostingPartDetails !== undefined ? RMCCTabData[0].CostingPartDetails : null;
    let topHeaderData = {
      NetRawMaterialsCost: TopHeaderValues !== null && TopHeaderValues.TotalRawMaterialsCost !== null ? TopHeaderValues.TotalRawMaterialsCost : 0,
      NetBoughtOutPartCost: TopHeaderValues !== null && TopHeaderValues.TotalBoughtOutPartCost !== null ? TopHeaderValues.TotalBoughtOutPartCost : 0,
      NetConversionCost: TopHeaderValues !== null && TopHeaderValues.TotalConversionCost !== null ? TopHeaderValues.TotalConversionCost : 0,
      NetToolsCost: TopHeaderValues !== null && TopHeaderValues.ToolsCostTotal !== null ? TopHeaderValues.ToolsCostTotal : 0,
      NetTotalRMBOPCC: TopHeaderValues !== null && TopHeaderValues.TotalCalculatedRMBOPCCCost !== null ? TopHeaderValues.TotalCalculatedRMBOPCCCost : 0,
    }
    props.setHeaderCost(topHeaderData)
  }, [RMCCTabData]);

  /**
  * @method getRMTotalCostForAssembly
  * @description GET RM TOTAL COST FOR ASSEMBLY
  */
  const getRMTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getBOPTotalCostForAssembly
  * @description GET BOP TOTAL COST FOR ASSEMBLY
  */
  const getBOPTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getCCTotalCostForAssembly
  * @description GET CC TOTAL COST FOR ASSEMBLY
  */
  const getCCTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getProcessTotalCost
  * @description GET PROCESS TOTAL COST
  */
  const getProcessTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost && el.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? el.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
   * @method getOperationTotalCost
   * @description GET OPERATION TOTAL COST
   */
  const getOperationTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost && el.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? el.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getToolTotalCostForAssembly
  * @description GET TOOL TOTAL COST FOR ASSEMBLY
  */
  const getToolTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost && el.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? el.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getTotalCostForAssembly
  * @description GET TOTAL COST FOR ASSEMBLY
  * @params flag:- Where to add Grid Total in assembly
  */
  const getTotalCostForAssembly = (arr, CostingPartDetails = {}, flag = '', GridTotalCost = 0, params = {}) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        let total = 0;
        switch (flag) {
          case 'RM':
            total = accummlator +
              GridTotalCost +
              checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) +
              checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0) +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          case 'BOP':
            total = accummlator +
              checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) +
              GridTotalCost +
              checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0) +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          case 'CC':
            total = accummlator +
              checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) +
              checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) +
              GridTotalCost +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          default:
            break;
        }
        return total;
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0);
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

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(netRMCost(rmGrid)), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'RM', checkForNull(netRMCost(rmGrid)), params) * (i.Quantity !== undefined ? i.Quantity : 1);
          setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

          i.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost * i.Quantity;;
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
    let NetRMCost = 0
    NetRMCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetLandedCost)
    }, 0)
    return NetRMCost
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

          i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'BOP', checkForNull(netBOPCost(bopGrid)), params) * (i.Quantity !== undefined ? i.Quantity : 1);
          setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(i.CostingPartDetails.TotalConversionCost);

          i.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost * i.Quantity;;
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
    let NetCost = 0
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetBoughtOutPartCost)
    }, 0)
    return NetCost
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

          i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(conversionGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalProcessCost = getProcessTotalCost(i.CostingChildPartDetails, checkForNull(conversionGrid.ProcessCostTotal), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'CC', checkForNull(conversionGrid.NetConversionCost), params) * (i.Quantity !== undefined ? i.Quantity : 1);
          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) +
            checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) +
            checkForNull(conversionGrid && conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0);

          let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
            return el;
          })

          i.CostingPartDetails.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: data };
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost * i.Quantity;
          i.CostingPartDetails.TotalConversionCost = conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0;

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

          i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(operationGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalOperationCost = getOperationTotalCost(i.CostingChildPartDetails, checkForNull(operationGrid.OperationCostTotal), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'CC', checkForNull(operationGrid.NetConversionCost), params) * (i.Quantity !== undefined ? i.Quantity : 1);
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) +
            checkForNull(i.TotalBoughtOutPartCost) +
            checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)

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

          i.CostingPartDetails.ToolsCostTotal = getToolTotalCostForAssembly(i.CostingChildPartDetails, toolGrid && toolGrid.ToolsCostTotal !== undefined ? checkForNull(toolGrid.ToolsCostTotal) : 0, params);
          setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.IsShowToolCost = true;
          i.CostingPartDetails.CostingConversionCost = toolGrid;

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
    let NetCost = 0
    NetCost = tabData && tabData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalRawMaterialsCost)
    }, 0)
    return NetCost
  }

  /**
   * @method getGrandNetBOPCost
   * @description GET GRAND TOTAL BOP COST
   */
  const getGrandNetBOPCost = () => {
    let NetCost = 0
    NetCost = tabData && tabData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalBoughtOutPartCost)
    }, 0)
    return NetCost
  }

  /**
   * @method getGrandNetConversionCost
   * @description GET GRAND TOTAL CONVERSION COST
   */
  const getGrandNetConversionCost = () => {
    let NetCost = 0
    NetCost = tabData && tabData.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalConversionCost)
    }, 0)
    return NetCost
  }

  /**
   * @method getTotalCost
   * @description GET TOTAL COST
   */
  const getTotalCost = () => {
    return (
      getGrandNetRMCost() + getGrandNetBOPCost() + getGrandNetConversionCost()
    )
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

        const { CostingChildPartDetails, CostingPartDetails } = Children;
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };

        if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {

          i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = Children.CostingPartDetails;
          i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.CostingRawMaterialsCost, params);
          i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.CostingBoughtOutPartCost, params);

          i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(CostingChildPartDetails, checkForNull(CostingPartDetails.CostingConversionCost && CostingPartDetails.CostingConversionCost.NetConversionCost !== null ? CostingPartDetails.CostingConversionCost.NetConversionCost : 0), params) +
            GetOperationCostTotal(CostingPartDetails.CostingOperationCostResponse) +
            GetToolCostTotal(CostingPartDetails.CostingToolCostResponse);

          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = (getTotalCostForAssembly(CostingChildPartDetails) +
            checkForNull(CostingPartDetails.TotalOperationCostPerAssembly)) * (i.Quantity !== undefined ? i.Quantity : 1);

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
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };
        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalConversionCost = i.CostingPartDetails.TotalConversionCost +
            //checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
            //checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +
            getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.CostingConversionCost.NetConversionCost), params);

          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = (checkForNull(i.TotalOperationCostPerAssembly) +
            checkForNull(i.TotalToolCostPerAssembly) +
            getTotalCostForAssembly(i.CostingChildPartDetails)) * (i.Quantity !== undefined ? i.Quantity : 1);

          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {

          i.CostingPartDetails = { ...Data, Quantity: i.Quantity };
          i.IsOpen = !i.IsOpen;

        } else {
          i.IsOpen = false;
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
  const setAssemblyOperationCost = (OperationGrid, params, IsGridChanged) => {
    let arr = setAssemblyOperationCostInDataList(OperationGrid, params, RMCCTabData, IsGridChanged)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr, IsGridChanged) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) +
            checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) +
            checkForNull(i.CostingPartDetails.TotalConversionCost) +
            checkForNull(IsGridChanged ? GetOperationCostTotal(OperationGrid) : 0) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) -
            (IsGridChanged ? checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) : 0); //We are already adding by operationGrid so need to substract existing value.

          i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;

          i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalConversionCost) +
            (IsGridChanged ? GetOperationCostTotal(OperationGrid) : 0) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly)
          //- (IsGridChanged ? checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) : 0);

          i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);

          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost * (i.Quantity !== undefined ? i.Quantity : 1);

          setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails)

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
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost * (i.Quantity !== undefined ? i.Quantity : 1);
          i.CostingPartDetails.TotalToolCostPerAssembly = GetToolCostTotal(ToolGrid);
          i.CostingPartDetails.IsShowToolCost = true;

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

    dispatch(
      saveCostingRMCCTab(data, (res) => {
        console.log('saveCostingRMCCTab: ', res)
      }),
    )
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
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '100px' }}>{`Type`}</th>
                          <th style={{ width: '150px' }}>{`RM Cost`}</th>
                          <th style={{ width: '150px' }}>{`BOP Cost`}</th>
                          <th
                            style={{ width: '200px' }}
                          >{`Conversion Cost`}</th>
                          <th style={{ width: '200px' }}>{`Quantity`}</th>
                          <th style={{ width: '200px' }}>{`RM + CC Cost/Part`}</th>
                          <th style={{ width: '100px' }}>{``}</th>
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

                <Row className="sf-btn-footer no-gutters justify-content-between mt25 mb-35-minus">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="submit-button mr-3 save-btn"
                      onClick={saveCosting}
                    >
                      <div className={'check-icon'}>
                        <img
                          src={require('../../../../assests/images/check.png')}
                          alt="check-icon.jpg"
                        />{' '}
                      </div>
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
