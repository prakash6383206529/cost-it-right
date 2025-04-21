import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CRMHeads, EMPTY_DATA, customHavellsChanges, WACTypeId } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, removeBOPfromApplicability } from '../../../../../helper';
//MINDA
// import {removeBOPFromList } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';
import { isToolDataChange, setComponentToolItemData, setToolsErrors } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';
import _, { debounce } from 'lodash';
import { IdForMultiTechnology } from '../../../../../config/masterData';
import TooltipCustom from '../../../../common/Tooltip';
import { errorCheckObject } from '../../../CostingUtil';
import { number, decimalNumberLimit6, checkWhiteSpaces, percentageLimitValidation, decimalIntegerNumberLimit, decimalNumberLimit13 } from "../../../../../helper/validation";
import { useLabels } from '../../../../../helper/core';

let counter = 0;
function Tool(props) {

  const { IsApplicableProcessWise, data } = props;
  const headerCosts = useContext(netHeadCostContext);
  const dispatch = useDispatch();

  const ObjectForOverAllApplicability = data?.CostingPartDetails && data?.CostingPartDetails?.CostingToolCostResponse && data?.CostingPartDetails?.CostingToolCostResponse[0];

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const costingHead = useSelector(state => state.comman.costingHead)
  const { CostingDataList, ErrorObjTools, IsIncludedToolCost, includeToolCostIcc } = useSelector(state => state.costing)

  // BELOW CODE NEED TO BE USED WHEN OVERALL APPLICABILITY TREATED INSIDE GRID.
  const defaultValues = {
    ToolMaintenanceCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenanceCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolMaintenanceCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    ToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    Life: ObjectForOverAllApplicability && ObjectForOverAllApplicability.Life !== undefined ? ObjectForOverAllApplicability.Life : '',
    NetToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.NetToolCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.NetToolCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    toolCostType: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCostType !== undefined ? { label: ObjectForOverAllApplicability.ToolCostType, value: ObjectForOverAllApplicability.ToolCostTypeId } : [],
    maintanencePercentage: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenancePercentage !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolMaintenancePercentage, initialConfiguration?.NoOfDecimalForPrice) : '',
    MaintananceCostApplicability: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolApplicabilityCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    ToolAmortizationCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolAmortizationCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolAmortizationCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    maintanenceToolCost: (ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenanceCost !== undefined && ObjectForOverAllApplicability.ToolCostType === 'Fixed') ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolMaintenanceCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    ToolMaintenanceCostPerPc: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenanceCostPerPiece !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolMaintenanceCostPerPiece, initialConfiguration?.NoOfDecimalForPrice) : '',
    crmHeadTool: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCRMHead && { label: ObjectForOverAllApplicability.ToolCRMHead, value: 1 },
    ToolInterestRatePercent: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolInterestRatePercent !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolInterestRatePercent, initialConfiguration?.NoOfDecimalForPrice) : '',
    ToolInterestCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolInterestCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolInterestCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    ToolInterestCostPerPiece: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolInterestCostPerPiece !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolInterestCostPerPiece, initialConfiguration?.NoOfDecimalForPrice) : '',
  }

  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  });

  const [gridData, setGridData] = useState(data && data?.CostingPartDetails?.CostingToolCostResponse.length > 0 ? data?.CostingPartDetails?.CostingToolCostResponse : [])
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [applicability, setApplicability] = useState(data && data?.CostingPartDetails?.CostingToolCostResponse.length > 0 && data?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType !== null ? { label: data?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType, value: data?.CostingPartDetails?.CostingToolCostResponse[0].ToolApplicabilityTypeId } : [])
  const [valueByAPI, setValueByAPI] = useState(data && data?.CostingPartDetails?.CostingToolCostResponse.length > 0 && data?.CostingPartDetails?.CostingToolCostResponse[0].ToolCostType !== null ? true : false)
  const { costingData, isBreakupBoughtOutPartCostingFromAPI, getToolTabData } = useSelector(state => state.costing)

  const [toolObj, setToolObj] = useState(data?.CostingPartDetails?.CostingToolCostResponse[0])
  const CostingViewMode = useContext(ViewCostingContext);
  const costData = useContext(costingInfoContext);
  const [percentageLimit, setPercentageLimit] = useState(false);
  const [state, setState] = useState({
    ToolInterestCost: 0,
    ToolInterestCostPerPc: 0,
    ToolMaintenanceCostPerPc: 0
  })
  const partType = (IdForMultiTechnology.includes(String(costingData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const { toolMaintenanceCostLabel, toolMaintenanceCostPerPcLabel, toolInterestRatePercentLabel, toolInterestCostLabel, toolInterestCostPerPcLabel } = useLabels();

  const fieldValues = useWatch({
    control,
    name: ['ToolCost','Life','ToolInterestRatePercent','MaintenancePercentage','MaintananceCostApplicability'],
  });
  useEffect(() => {
    let isDataChanged = false;
    if (IsApplicableProcessWise) {
      // Use the original approach for process-wise applicability
      isDataChanged = JSON.stringify(gridData) !== JSON.stringify(
        getToolTabData && getToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse?.length > 0
          ? getToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse
          : []
        );
       
    } else {
      // Define the keys we want to compare for overall applicability
      const keysToCompare = [
         'ProcessOrOperation', 'ToolCategory', 'ToolName',
        'Quantity', 'ToolCost', 'Life', 'NetToolCost',
        'ToolMaintenanceCost', 'ToolCostType', 'ToolApplicabilityTypeId',
        'ToolMaintenancePercentage', 'ToolApplicabilityCost', 'ToolAmortizationCost',
        'IsCostForPerAssembly', 'ToolCRMHead','ToolInterestRatePercent','ToolInterestCost','ToolInterestCostPerPiece','ToolMaintenanceCostPerPiece'
      ];
     
      // Use Lodash to pick only the specified keys from each array
      const filteredGridData = gridData.map(item => _.pick(item, keysToCompare));
      const filteredResponseData = getToolTabData[0]?.CostingPartDetails?.CostingToolCostResponse?.length > 0
        ? getToolTabData[0].CostingPartDetails.CostingToolCostResponse.map(item => _.pick(item, keysToCompare))
        : [];
     // Compare the filtered arrays using _.isEqual
      isDataChanged = !_.isEqual(filteredGridData, filteredResponseData);
     
    }
    props.setToolCost(gridData, isDataChanged);
  }, [gridData, getValues('maintanenceToolCost'), getValues('maintanencePercentage')]);

  useEffect(() => {
    const updatedToolTabData = _.cloneDeep(data)
    dispatch(setComponentToolItemData(updatedToolTabData, () => { }))
  }, [data && data?.CostingPartDetails?.CostingToolCostResponse])

  useEffect(() => {
    let request = partType ? 'multiple technology assembly' : 'toolcost'
    let isRequestForMultiTechnology = partType ? true : false
    dispatch(fetchCostingHeadsAPI(request, false, isRequestForMultiTechnology, (res) => { }))
  }, [])

  useEffect(() => {
    if (checkForNull(getValues('NetToolCost')) !== 0) {
      props.disableToggle(true)
    } else {
      props.disableToggle(false)
    }
  }, [getValues('NetToolCost')])





  /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let rowArray = {
        ToolOperationId: rowData.ToolOperationId,
        ProcessOrOperation: rowData.ProcessOrOperation,
        ToolCategory: rowData.ToolCategory,
        ToolName: rowData.ToolName,
        Quantity: rowData.Quantity,
        ToolCost: rowData.ToolCost,
        Life: rowData.Life,
        TotalToolCost: rowData.TotalToolCost,
      }
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowArray })
        setGridData(tempArr)
      } else {
        let tempArr = [...gridData, rowArray]
        setGridData(tempArr)
      }
    }
    setDrawerOpen(false)
  }

  const deleteItem = (index) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    setEditIndex(index)
    setIsEditFlag(true)
    setRowObjData(tempArr)
    setDrawerOpen(true)
  }

  /**
  * @method handleToolCostChange
  * @description HANDLE TOOL COST CHANGE
  */
  const onCRMHeadChange = (event) => {
    if ((event?.label)) {
      const zeroIndex = 0;
      let rowArray = gridData[zeroIndex]
      rowArray.ToolCRMHead = event?.label
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setGridData(tempArr)
      dispatch(isToolDataChange(true))
    }
  }

  const handleToolCostChange = (event) => {

    if (!isNaN(event.target.value)) {

      // setValue('ToolCost', event.target.value)

      // const ToolMaintenanceCost = checkForNull(toolObj?.ToolMaintenanceCost)
      // const ToolCost = checkForNull(event.target.value);
      // const Life = checkForNull(getValues('Life'))
      // const ToolAmortizationCost = checkForNull(ToolCost / Life)

      // setValue('ToolAmortizationCost', checkForDecimalAndNull(ToolAmortizationCost, initialConfiguration?.NoOfDecimalForPrice))
      // setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)+state.ToolInterestCost), initialConfiguration?.NoOfDecimalForPrice))

      // const zeroIndex = 0;
      // let rowArray = {
      //   "ToolOperationId": null,
      //   "ProcessOrOperation": null,
      //   "ToolCategory": null,
      //   "ToolName": null,
      //   "Quantity": null,
      //   "ToolCost": ToolCost,
      //   "Life": Life,
      //   "NetToolCost": checkForNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)+state.ToolInterestCost)),
      //   "TotalToolCost": null,
      //   "ToolMaintenanceCost": toolObj?.ToolMaintenanceCost,
      //   "ToolCostType": toolObj?.ToolApplicability,
      //   "ToolApplicabilityTypeId": toolObj?.ToolApplicabilityId,
      //   "ToolMaintenancePercentage": toolObj?.MaintanencePercentage,
      //   "ToolApplicabilityCost": toolObj?.ToolApplicabilityCost,
      //   "ToolAmortizationCost": ToolAmortizationCost,
      //   "IsCostForPerAssembly": null,
      //   "ToolCRMHead": getValues('crmHeadTool') ? getValues('crmHeadTool').label : '',
      //   "ToolInterestRatePercent": getValues('ToolInterestRatePercent'),
      //   "ToolInterestCost": state.ToolInterestCost,
      //   "ToolInterestCostPerPiece": state.ToolInterestCostPerPc,
      //   "ToolMaintenanceCostPerPiece": ToolMaintenanceCost / Life
      // }
      // let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      // setGridData(tempArr)
      dispatch(isToolDataChange(true))
    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
    * @method handleToolLifeChange
    * @description HANDLE TOOL LIFE CHANGE
    */
  const handleToolLifeChange = (event) => {

    if (!isNaN(event.target.value)) {

      // setValue('Life', event.target.value)
      // const ToolMaintenanceCost = checkForNull(toolObj?.ToolMaintenanceCost)
      // const ToolCost = checkForNull(getValues('ToolCost'));
      // const Life = checkForNull(event.target.value)
      // const ToolAmortizationCost = ToolCost / Life

      // setValue('ToolAmortizationCost', checkForDecimalAndNull(ToolAmortizationCost, initialConfiguration?.NoOfDecimalForPrice))
      // setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)+state.ToolInterestCost), initialConfiguration?.NoOfDecimalForPrice))

      // const zeroIndex = 0;
      // let rowArray = {
      //   "ToolOperationId": null,
      //   "ProcessOrOperation": null,
      //   "ToolCategory": null,
      //   "ToolName": null,
      //   "Quantity": null,
      //   "ToolCost": ToolCost,
      //   "Life": Life,
      //   "NetToolCost": checkForNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)+state.ToolInterestCost)),
      //   "TotalToolCost": null,
      //   "ToolMaintenanceCost": toolObj.ToolMaintenanceCost,
      //   "ToolCostType": toolObj.ToolApplicability,
      //   "ToolApplicabilityTypeId": toolObj.ToolApplicabilityId,
      //   "ToolMaintenancePercentage": toolObj.MaintanencePercentage,
      //   "ToolApplicabilityCost": toolObj.ToolApplicabilityCost,
      //   "ToolAmortizationCost": ToolAmortizationCost,
      //   "IsCostForPerAssembly": null,
      //   "ToolCRMHead": getValues('crmHeadTool') ? getValues('crmHeadTool').label : '',
      //   "ToolInterestRatePercent": getValues('ToolInterestRatePercent'),
      //   "ToolInterestCost": state.ToolInterestCost,
      //   "ToolInterestCostPerPiece": state.ToolInterestCostPerPc,
      //   "ToolMaintenanceCostPerPiece": ToolMaintenanceCost / Life
      // }
      // let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      // setGridData(tempArr)
      dispatch(isToolDataChange(true))
    }
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = debounce(handleSubmit((values) => {
    
    if (errorCheckObject(ErrorObjTools)) return false;
    if (applicability.label !== "Fixed" && percentageLimit) {
      return false
    }
    props.saveCosting(values)
  }), 500);

  /**
* @method renderListing
* @description RENDER LISTING (NEED TO BREAK THIS)
*/
  const renderListing = (label) => {
    const temp = [];
    let tempList = [];

    if (label === 'Applicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0') return false;
        if (IsIncludedToolCost || includeToolCostIcc) {
          if (item.Text === 'Fixed') {
            temp.push({ label: item.Text, value: item.Value })
          }
        } else {
          temp.push({ label: item.Text, value: item.Value })
        }
        return null;
      });
      if (isBreakupBoughtOutPartCostingFromAPI) {
        tempList = removeBOPfromApplicability([...temp])
        //MINDA
        // tempList = removeBOPFromList([...temp])
      } else {
        tempList = [...temp]
      }
      return tempList;
    }
  }


  const handleToolApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setValue('ToolMaintainancePerentage', '')
      setValueByAPI(false)
      setApplicability(newValue)

      dispatch(isToolDataChange(true))

      // setIsChangedApplicability(!IsChangedApplicability)
    } else {
      setApplicability([])
      setValueOfToolCost('')
      setToolObj({})
      setValue('MaintananceCostApplicability', 0)
      setValue('ToolMaintenanceCost', 0)
      setValue('maintanencePercentage', 0)
      setValue('toolCostType', '')
      setValue('ToolCost', 0)
      setValue('Life', 0)
      setValue('ToolAmortizationCost', 0)
      setValue('NetToolCost', 0)
      setValue('crmHeadTool', '')
    }
    setValue('maintanencePercentage', 0)
    setValue('maintanenceToolCost', 0)
  }

  const toolFieldValue = useWatch({
    control,
    name: ['maintanencePercentage', 'maintanenceToolCost','ToolInterestRatePercent'],
  });


  useEffect(() => {
    setValueOfToolCost(applicability.label)
  }, [valueByAPI, applicability,toolFieldValue])


  const setValueOfToolCost = (Text) => {
    if (!headerCosts || Text === '' || valueByAPI) return;
  
    const ConversionCostForCalculation = costData.IsAssemblyPart
      ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly)
      : checkForNull(headerCosts.NetProcessCost) + checkForNull(headerCosts.NetOperationCost);
  
    const RMBOPCC = checkForNull(headerCosts.NetRawMaterialsCost) + checkForNull(headerCosts.NetBoughtOutPartCost) + ConversionCostForCalculation;
    const RMBOP = checkForNull(headerCosts.NetRawMaterialsCost) + checkForNull(headerCosts.NetBoughtOutPartCost);
    const RMCC = checkForNull(headerCosts.NetRawMaterialsCost) + ConversionCostForCalculation;
    const BOPCC = checkForNull(headerCosts.NetBoughtOutPartCost) + ConversionCostForCalculation;
  
    const maintanencePercentage = getValues('maintanencePercentage');
    const maintanenceToolCost = getValues('maintanenceToolCost');
    const toolRate = getValues('ToolCost');
    const life = checkForNull(getValues('Life'));
    const noOfDecimal = initialConfiguration?.NoOfDecimalForPrice;
  
    let dataList = CostingDataList?.length ? CostingDataList[0] : {};
    const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) +
      checkForNull(dataList.NetSurfaceTreatmentCost) +
      checkForNull(dataList.NetOverheadAndProfitCost) +
      checkForNull(dataList.NetPackagingAndFreight);
  
    const applyToolValues = (baseCost) => {
      const toolCost = checkForNull(baseCost * calculatePercentage(maintanencePercentage));
      const costPerPc = toolCost / life;
  
      setValue('MaintananceCostApplicability', checkForDecimalAndNull(baseCost, noOfDecimal));
      setValue('ToolMaintenanceCost', checkForDecimalAndNull(toolCost, noOfDecimal));
      setValue('ToolMaintenanceCostPerPc', checkForDecimalAndNull(costPerPc, noOfDecimal));
  
      setToolObj({
        ...toolObj,
        ToolApplicabilityId: applicability.value,
        ToolApplicability: applicability.label,
        MaintanencePercentage: maintanencePercentage,
        ToolApplicabilityCost: baseCost,
        ToolMaintenanceCost: toolCost,
        ToolMaintenanceCostPerPiece: costPerPc
      });
    };
  
    switch (Text) {
      case 'RM':
      case 'Part Cost':
        applyToolValues(checkForNull(headerCosts.NetRawMaterialsCost));
        break;
  
      case 'BOP':
        applyToolValues(checkForNull(headerCosts.NetBoughtOutPartCost));
        break;
  
      case 'CC':
        applyToolValues(checkForNull(ConversionCostForCalculation));
        break;
  
      case 'RM + CC + BOP':
      case 'Part Cost + CC + BOP':
        applyToolValues(RMBOPCC);
        break;
  
      case 'RM + BOP':
      case 'Part Cost + BOP':
        applyToolValues(RMBOP);
        break;
  
      case 'RM + CC':
      case 'Part Cost + CC':
        applyToolValues(RMCC);
        break;
  
      case 'BOP + CC':
        applyToolValues(BOPCC);
        break;
  
      case 'Net Cost':
        applyToolValues(totalTabCost);
        break;
  
      case 'Tool Rate': {
        const toolCost = checkForNull(toolRate * calculatePercentage(maintanencePercentage));
        const costPerPc = toolCost / life;
        setValue('MaintananceCostApplicability', checkForDecimalAndNull(toolRate, noOfDecimal));
        setValue('ToolMaintenanceCost', checkForDecimalAndNull(toolCost, noOfDecimal));
        setValue('ToolMaintenanceCostPerPc', checkForDecimalAndNull(costPerPc, noOfDecimal));
  
        setToolObj({
          ...toolObj,
          ToolApplicabilityId: applicability.value,
          ToolApplicability: applicability.label,
          MaintanencePercentage: maintanencePercentage,
          ToolApplicabilityCost: toolRate,
          ToolMaintenanceCost: toolCost,
          ToolMaintenanceCostPerPiece: costPerPc
        });
        break;
      }
  
      case 'Fixed':
        setValue('MaintananceCostApplicability', '-');
        setValue('ToolMaintenanceCost', checkForDecimalAndNull(maintanenceToolCost, noOfDecimal));
        setToolObj({
          ...toolObj,
          ToolApplicabilityId: applicability.value,
          ToolApplicability: applicability.label,
          MaintanencePercentage: maintanencePercentage,
          ToolApplicabilityCost: maintanenceToolCost,
          ToolMaintenanceCost: checkForNull(maintanenceToolCost)
        });
        break;
  
      default:
        break;
    }
  };

  useEffect(() => {
    calculateNetToolCost()
  }, [toolObj,fieldValues])

  const calculateNetToolCost = () => {

    const ToolMaintenanceCostPerPiece = checkForNull(toolObj?.ToolMaintenanceCostPerPiece)
    const ToolCost = checkForNull(getValues('ToolCost'));
    const Life = checkForNull(getValues('Life'))
    const ToolAmortizationCost = ToolCost / Life
    const toolInterestRatePercent = checkForNull(getValues('ToolInterestRatePercent'))
    const toolInterestCost= ToolCost * toolInterestRatePercent / 100
    const toolInterestCostPerPc = toolInterestCost / checkForNull(getValues('Life'))
    setValue('ToolInterestCost', checkForDecimalAndNull(toolInterestCost, initialConfiguration?.NoOfDecimalForPrice))
    setValue('ToolInterestCostPerPc', checkForDecimalAndNull(toolInterestCostPerPc, initialConfiguration?.NoOfDecimalForPrice))
    setState(prevState => ({
      ...prevState,
      ToolInterestCost: toolInterestCost,
      ToolInterestCostPerPc: toolInterestCostPerPc
    }))
    const netToolValue = checkForNull(ToolMaintenanceCostPerPiece) + checkForNull(ToolAmortizationCost) + checkForNull(fieldValues.ToolInterestCostPerPc)
    if (netToolValue) {
      setValue('ToolAmortizationCost', checkForDecimalAndNull(ToolAmortizationCost, initialConfiguration.NoOfDecimalForPrice))
      setValue('NetToolCost', checkForDecimalAndNull(netToolValue, initialConfiguration.NoOfDecimalForPrice))
      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": netToolValue,
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCostPerPiece,
        "ToolCostType": applicability.label,
        "ToolApplicabilityTypeId": applicability.value,
        "ToolMaintenancePercentage": getValues('maintanencePercentage'),
        "ToolApplicabilityCost": getValues('MaintananceCostApplicability'),
        "ToolAmortizationCost": ToolAmortizationCost,
        "IsCostForPerAssembly": null,
        "ToolCRMHead": getValues('crmHeadTool') ? getValues('crmHeadTool').label : '',
        "ToolInterestRatePercent": getValues('ToolInterestRatePercent'),
        "ToolInterestCost": toolInterestCost,
        "ToolInterestCostPerPiece": toolInterestCostPerPc,
        "ToolMaintenanceCostPerPiece": toolObj?.ToolMaintenanceCost / Life,
      }
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      dispatch(isToolDataChange(true))
      setTimeout(() => {
        setGridData(tempArr)
      }, 200)
    } 
  }

  const resetData = () => {
    setToolObj({})
    setTimeout(() => {
      setValue('MaintananceCostApplicability', 0)
    }, 100);
    setValue('ToolMaintenanceCost', 0)
    setValue('maintanencePercentage', 0)
    setValue('toolCostType', '')
    setValue('ToolCost', 0)
    setValue('Life', 0)
    setValue('ToolAmortizationCost', 0)
    setValue('NetToolCost', 0)
    setValue('crmHeadTool', '')

  }

  if (Object.keys(errors).length > 0 && counter < 2) {
    counter = counter + 1;
    dispatch(setToolsErrors(errors))
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    counter = 0
    dispatch(setToolsErrors({}))
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page tool-cost-container p-0">
        <div>

          <form noValidate className="form" >
            <Row>

              {/* BELOW CONDITION RENDER WHEN APPLICABILITY IS PROCESS WISE */}
              {IsApplicableProcessWise &&
                <Col md="12">
                  <Table className="table" size="sm" >
                    <thead>
                      <tr>
                        <th>{`Process/Operation`}</th>
                        <th>{`Tool Category`}</th>
                        <th>{`Name`}</th>
                        <th style={{ width: 200 }}>{`Quantity`}</th>
                        <th>{`Tool Cost`}</th>
                        <th>{`Life`}</th>
                        <th>{`Net Tool Cost`}</th>
                        <th>{`Action`}</th>
                      </tr>
                    </thead>
                    <tbody >

                      {
                        gridData && gridData.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.ProcessOrOperation}</td>
                              <td>{item.ToolCategory}</td>
                              <td>{item.ToolName}</td>
                              <td style={{ width: 200 }}>{item.Quantity}</td>
                              <td>{item.ToolCost}</td>
                              <td>{item.Life}</td>
                              <td>{item.TotalToolCost ? checkForDecimalAndNull(item.TotalToolCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
                              <td>
                                <button title='Edit' className="Edit mt15 mr-2" type={'button'} onClick={() => editItem(index)} />
                                <button title='Delete' className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                              </td>
                            </tr>
                          )
                        })
                      }

                      {gridData && gridData.length === 0 &&
                        <tr>
                          <td colSpan={8}>
                            <NoContentFound title={EMPTY_DATA} />
                          </td>
                        </tr>
                      }

                    </tbody>
                  </Table>
                </Col>}


              {/* BELOW CONDITION RENDER WHEN APPLICABILITY IS OVERALL */}
              {!IsApplicableProcessWise &&
                <>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Tool Rate"
                      name={`ToolCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        validate: { number, checkWhiteSpaces, decimalIntegerNumberLimit: decimalIntegerNumberLimit(10,6) }
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolCostChange(e)
                      }}
                      errors={errors && errors.ToolCost}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Amortization Quantity (Tool Life)"
                      name={`Life`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        validate: { number, checkWhiteSpaces, decimalNumberLimit13 }
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolLifeChange(e)
                      }}
                      errors={errors && errors.Life}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TooltipCustom disabledIcon={true} id={"tool-amortization"} tooltipText={"Tool Amortization = (Tool Cost / Amortization Quantity)"} />
                    <TextFieldHookForm
                      label="Tool Amortization Cost"
                      name={`ToolAmortizationCost`}
                      id={"tool-amortization"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => { }}
                      errors={errors && errors.ToolAmortizationCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <SearchableSelectHookForm
                      label={"Tool Maintenance Applicability"}
                      name={"toolCostType"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: false }}
                      isClearable={true}
                      register={register}
                      defaultValue={applicability.length !== 0 ? applicability : ""}
                      options={renderListing("Applicability")}
                      mandatory={false}
                      handleChange={handleToolApplicabilityChange}
                      errors={errors.toolCostType}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    {applicability.label !== 'Fixed' ?

                      <div className='mb-2'>
                        <TextFieldHookForm
                          label={`Maintenance Tool Cost (%)`}
                          name={'maintanencePercentage'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={(e) => {
                            e.preventDefault()
                            dispatch(isToolDataChange(true))
                            setValueByAPI(false)
                          }}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.maintanencePercentage}
                          disabled={CostingViewMode ? true : false}
                        />
                      </div>
                      :
                      //THIS FIELD WILL RENDER WHEN APPLICABILITY TYPE FIXED
                      <div className='mb-2'>
                        <TextFieldHookForm
                          label={`Maintenance Tool Cost`}
                          name={'maintanenceToolCost'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: false,
                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                          }}
                          handleChange={(e) => {
                            e.preventDefault()
                            setValueByAPI(false)
                            dispatch(isToolDataChange(true))

                          }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.maintanenceToolCost}
                          disabled={CostingViewMode ? true : false}

                        />

                      </div>

                    }


                  </Col>


                  {applicability.label !== 'Fixed' &&
                    <Col md="3">
                      <TextFieldHookForm
                        label="Cost (Applicability)"
                        name={'MaintananceCostApplicability'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.MaintananceCostApplicability}
                        disabled={true}
                      />
                    </Col>}
                  <Col md="3">{applicability.label !== 'Fixed' && <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-maintanence"} tooltipText={`${toolMaintenanceCostLabel}= (Maintenance Cost (%) * Cost (Applicability) / 100)`} />}
                    <TextFieldHookForm
                      label={toolMaintenanceCostLabel}
                      name={`ToolMaintenanceCost`}
                      id={"tool-maintanence"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                      }}
                      errors={errors && errors.ToolMaintenanceCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">{applicability.label !== 'Fixed' && <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-maintanence-per-pc"} tooltipText={`${toolMaintenanceCostPerPcLabel}= (${toolMaintenanceCostLabel} / Amortization Quantity (Tool Life) `} />}
                    <TextFieldHookForm
                      label={toolMaintenanceCostPerPcLabel}
                      name={`ToolMaintenanceCostPerPc`}
                      id={"tool-maintanence-per-pc"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                      }}
                      errors={errors && errors.ToolMaintenanceCostPerPc}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                  <TextFieldHookForm
                          label={toolInterestRatePercentLabel}
                          name={'ToolInterestRatePercent'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={(e) => {
                            e.preventDefault()
                            dispatch(isToolDataChange(true))
                            setValueByAPI(false)
                          }}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.maintanencePercentage}
                          disabled={!getValues('ToolCost')|| CostingViewMode ? true : false}
                        />
                  </Col>
                  <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-interest-cost"} tooltipText={`${toolInterestCostLabel}= (Tool Rate * ${toolInterestRatePercentLabel} / 100)`} />
                  <TextFieldHookForm
                          label={toolInterestCostLabel}
                          Controller={Controller}
                          name={'ToolInterestCost'}
                          id={"tool-interest-cost"}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{required: false}}
                          handleChange={(e) => {}}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ToolInterestCost}
                          disabled={ true }

                        />
                  </Col>
                  <Col md="3">{ <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-interest-cost-per-pc"} tooltipText={`${toolInterestCostPerPcLabel}= (${toolInterestCostLabel} / Amortization Quantity (Tool Life) `} />}
                    <TextFieldHookForm
                      label={toolInterestCostPerPcLabel}
                      name={`ToolInterestCostPerPc`}
                      id={"tool-interest-cost-per-pc"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => { }}
                      errors={errors && errors.ToolInterestCostPerPc}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id="tool-cost" tooltipText={`Net Tool Cost = (${toolMaintenanceCostLabel}+ Tool Amortization)`} />
                    <TextFieldHookForm
                      label="Net Tool Cost"
                      name={`NetToolCost`}
                      id="tool-cost"
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        //handleRateChange(e)
                      }}
                      errors={errors && errors.NetToolCost}
                      disabled={true}
                    />
                  </Col>
                  {/* // check here @ashok */}
                  {
                    initialConfiguration?.IsShowCRMHead && <Col md="3">
                      <SearchableSelectHookForm
                        name={`crmHeadTool`}
                        type="text"
                        label="CRM Head"
                        errors={`${errors.crmHeadTool}`}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                        }}
                        //defaultValue={item.RawMaterialCRMHead ? { label: item.RawMaterialCRMHead, value: index } : ''}
                        placeholder={'Select'}
                        options={CRMHeads}
                        required={false}
                        handleChange={onCRMHeadChange}
                        disabled={CostingViewMode}
                      />
                    </Col>
                  }
                </>
              }

            </Row >

            <Row className="sf-btn-footer no-gutters justify-content-between mt25 sticky-btn-footer tab-tool-cost-footer">
              <div className="col-sm-12 text-right bluefooter-butn">

                {!CostingViewMode && <button
                  type={'button'}
                  onClick={onSubmit}
                  className="submit-button mr5 save-btn">
                  <div className={"save-icon"}></div>
                  {'Save'}
                </button>}
              </div>
            </Row>
          </form >
        </div >
      </div >

      {isDrawerOpen && <AddTool
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={isEditFlag}
        ID={''}
        editIndex={editIndex}
        rowObjData={rowObjData}
        anchor={'right'}
        partType={partType}
      />}

    </ >
  );
}

export default React.memo(Tool);