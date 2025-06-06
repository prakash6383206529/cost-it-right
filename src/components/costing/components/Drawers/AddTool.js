import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getAssemblyChildPartbyAsmCostingId, getProcessAndOperationbyAsmAndChildCostingId, getToolCategoryList } from '../../actions/Costing';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper';
import { checkWhiteSpaces, number, decimalNumberLimit6, alphaNumericValidation, percentageLimitValidation, decimalIntegerNumberLimit ,nonZero} from "../../../../helper/validation";
import { STRINGMAXLENGTH } from '../../../../config/masterData';
import { costingInfoContext } from '../CostingDetailStepTwo';
import TooltipCustom from '../../../common/Tooltip';
import { CRMHeads } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { fetchCostingHeadsAPI } from '../../../../actions/Common';
import { useLabels } from '../../../../helper/core';
import HeaderTitle from '../../../common/HeaderTitle';

function AddTool(props) {

  const { rowObjData, isEditFlag, gridData, CostingViewMode } = props;

  const costData = useContext(costingInfoContext)
  const { RMCCTabData, IsIncludedToolCost, includeToolCostIcc } = useSelector(state => state.costing)
  const { toolMaintenanceCostLabel, toolMaintenanceCostPerPcLabel, toolInterestRatePercentLabel, toolInterestCostLabel, toolInterestCostPerPcLabel } = useLabels();

  const defaultValues = {
    ToolOperationId: rowObjData?.ToolOperationId ? rowObjData.ToolOperationId : '',
    ProcessOrOperation: rowObjData?.ProcessOrOperation ? { label: rowObjData.ProcessOrOperation, value: rowObjData.ProcessOrOperation } : [],
    ToolCategory: rowObjData?.ToolCategory ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : [],
    ToolName: rowObjData?.ToolName ? rowObjData.ToolName : '',
    Quantity: rowObjData?.ProcessRunCount ? rowObjData.ProcessRunCount : '',
    ToolCost: rowObjData?.ToolCost ? rowObjData.ToolCost : '',
    Life: rowObjData?.Life ? rowObjData.Life : '',
    TotalToolCost: rowObjData?.TotalToolCost ? rowObjData.TotalToolCost : '',
    PartNumber: rowObjData?.ChildPartNumber ? { label: rowObjData?.ChildPartNumber, value: rowObjData?.PartId } : '',
    BOMLevel: rowObjData?.BOMLevel ? { label: rowObjData?.BOMLevel, value: rowObjData?.BOMLevel } : '',
    partType: rowObjData?.PartType ? rowObjData?.PartType : '',
    partQuantity: rowObjData?.PartQuantity ? rowObjData?.PartQuantity : '',
    type: rowObjData?.ProcessOrOperationType ? rowObjData?.ProcessOrOperationType : '',
    ToolAmortizationCost: rowObjData?.ToolAmortizationCost ? rowObjData?.ToolAmortizationCost : '',
    ToolMaintenanceApplicability: rowObjData?.ToolMaintenanceApplicability ? { label: rowObjData?.ToolCostType, value: rowObjData?.ToolApplicabilityTypeId } : '',
    MaintenancePercentage: rowObjData?.ToolMaintenancePercentage ? rowObjData?.ToolMaintenancePercentage : '',
    MaintananceCostApplicability: rowObjData?.ToolApplicabilityCost ? rowObjData?.ToolApplicabilityCost : '',
    ToolMaintenanceCost: rowObjData?.ToolMaintenanceCost ? rowObjData?.ToolMaintenanceCost : '',
    ToolMaintenanceCostPerPc: rowObjData?.ToolMaintenanceCostPerPiece ? rowObjData?.ToolMaintenanceCostPerPiece : '',
    ToolInterestRatePercent: rowObjData?.ToolInterestRatePercent ? rowObjData?.ToolInterestRatePercent : '',
    ToolInterestCost: rowObjData?.ToolInterestCost ? rowObjData?.ToolInterestCost : '',
    ToolInterestCostPerPc: rowObjData?.ToolInterestCostPerPiece ? rowObjData?.ToolInterestCostPerPiece : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const [tool, setTool] = useState(isEditFlag && rowObjData?.ToolCategory ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : []);
  const [ToolForProcessOperation, setToolForProcessOperation] = useState(isEditFlag ? { label: rowObjData?.ProcessOrOperation, value: rowObjData?.ProcessOrOperationType === 'Operation' ? rowObjData?.OperationChildIdRef : rowObjData?.ProcessIdRef, processOrOperationQuantity: 1, type: rowObjData?.ProcessOrOperationType, machineId: rowObjData?.MachineIdRef } : []);
  const [dataToSend, setDataToSend] = useState(isEditFlag ? { netToolCost: rowObjData?.TotalToolCost } : {});
  const [partNumberArray, setPartNumberArray] = useState([])
  const [processOperationArray, setProcessOperationArray] = useState([])
  const [partNumberDetail, setPartNumberDetail] = useState(isEditFlag && rowObjData?.ChildPartNumber ? { label: rowObjData?.ChildPartNumber, value: rowObjData?.PartId, childPartCostingId: rowObjData?.ChildPartCostingIdRef, partQuantity: rowObjData?.PartQuantity, partType: rowObjData?.PartType, bomLevel: rowObjData?.BOMLevel, parentPartCostingId: rowObjData?.ParentPartCostingIdRef } : [])
  const [tableData, setTableData] = useState(gridData && gridData?.length > 0 ? gridData : [])
  const { ToolCategoryList } = useSelector(state => state?.costing)
  const [bomLevel, setBOMLevel] = useState('')
  const [bomLevelList, setBOMLevelList] = useState([])
  const [multipleBOMLevelCheck, setMultipleBOMLevelCheck] = useState(false)
  const [state, setState] = useState({
    toolMaintenanceApplicability:isEditFlag ? { label: rowObjData?.ToolCostType, value: rowObjData?.ToolApplicabilityTypeId } : [],
    toolInterestCost: 0,
    toolInterestCostPerPc: 0,
    toolAmortizationCost: 0,
    toolMaintenanceCost: 0,
    toolMaintenanceCostPerPc: 0,
  })
  const costingHead = useSelector(state => state.comman.costingHead)

  const fieldValues = useWatch({
    control,
    name: ['Quantity', 'ToolCost', 'Life','ToolInterestRatePercent','MaintenancePercentage','MaintananceCostApplicability'],
  });
  
  useEffect(() => {
    dispatch(getToolCategoryList(res => { }))
    if (RMCCTabData) {
      dispatch(getAssemblyChildPartbyAsmCostingId(RMCCTabData[0]?.AssemblyCostingId, false, res => {
        setPartNumberArray(res?.data?.DataList)
      }))
    }
    let request = props.partType ? 'multiple technology assembly' : 'toolcost process wise'
    let isRequestForMultiTechnology = props.partType ? true : false
    dispatch(fetchCostingHeadsAPI(request, false, isRequestForMultiTechnology, (res) => { }))
  }, [])

  useEffect(() => {
    calculateAllCosts()
  }, [fieldValues,state.toolMaintenanceApplicability,getValues('MaintananceCostApplicability')]);

  useEffect(()=>{
    setValue('ToolMaintenanceApplicability', isEditFlag ? { label: rowObjData?.ToolCostType, value: rowObjData?.ToolApplicabilityTypeId } : [])
  },[isEditFlag])



  const toggleDrawer = (event, formData = []) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', formData)
  };

  const calculateAllCosts = () => {
    const interestRatePercent = checkForNull(getValues('ToolInterestRatePercent'))
    const toolCost = checkForNull(getValues('ToolCost'))
    const life = checkForNull(getValues('Life'))
    const maintenancePercentage=checkForNull(getValues('MaintenancePercentage'))
    const processRunCount=checkForNull(getValues('Quantity'))
    const partQuantity=checkForNull(getValues('partQuantity'))
    const costApplicability=checkForNull(getValues('MaintananceCostApplicability'))
    const toolAmortizationCost = (toolCost * partQuantity * processRunCount) /life
    const toolInterestCost = (toolCost * interestRatePercent * processRunCount * partQuantity) / 100
    const toolInterestCostPerPc = toolInterestCost / life
    let toolMaintenanceCost = 0
    let toolMaintenanceCostPerPc = 0

    if(state.toolMaintenanceApplicability?.label==="Fixed"){
      toolMaintenanceCost = costApplicability * processRunCount * partQuantity
      toolMaintenanceCostPerPc = toolMaintenanceCost / life
    }
    else{
      toolMaintenanceCost = (toolCost * maintenancePercentage * processRunCount * partQuantity) / 100
      toolMaintenanceCostPerPc = toolMaintenanceCost / life
    }
    const totalToolCost = toolAmortizationCost + toolInterestCostPerPc + toolMaintenanceCostPerPc
    setState(prevState => ({ ...prevState, toolAmortizationCost: toolAmortizationCost, toolInterestCost: toolInterestCost, toolInterestCostPerPc: toolInterestCostPerPc, toolMaintenanceCost: toolMaintenanceCost, toolMaintenanceCostPerPc: toolMaintenanceCostPerPc, }))
    setDataToSend(prevState => ({ ...prevState, netToolCost: totalToolCost }))
    setValue('ToolInterestCost', checkForDecimalAndNull(toolInterestCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('ToolInterestCostPerPc', checkForDecimalAndNull(toolInterestCostPerPc, getConfigurationKey().NoOfDecimalForPrice))
    setValue('ToolAmortizationCost', checkForDecimalAndNull(toolAmortizationCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('ToolMaintenanceCost', checkForDecimalAndNull(toolMaintenanceCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('ToolMaintenanceCostPerPc', checkForDecimalAndNull(toolMaintenanceCostPerPc, getConfigurationKey().NoOfDecimalForPrice))
    setValue('TotalToolCost', checkForDecimalAndNull(totalToolCost, getConfigurationKey().NoOfDecimalForPrice))
  }

  const filterList = list => {
    const partMap = {};
    list.forEach(item => {
      const { PartNumber, Level } = item;
      const currentLevelNum = parseInt(Level.substring(1), 10);
      if (!partMap[PartNumber] || currentLevelNum > parseInt(partMap[PartNumber].Level.substring(1), 10)) {
        partMap[PartNumber] = item;
      }
    });
    return Object.values(partMap);
  };

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {
    let temp = [];

    if (label === 'ToolCategory') {
      ToolCategoryList && ToolCategoryList.map((item) => {
        if (item.Value === '') return false
        temp.push({ label: item.Text, value: item.Value })
        return null
      })
      return temp
    }

    if (label === 'ToolProcessOperation') {

      processOperationArray && processOperationArray.map((item) => {
        if (item?.Value === "0") return false
        temp.push({ label: item?.Text, value: item?.Value, processOrOperationQuantity: 1, type: item?.Type, machineId: item?.MachineId })

      })
      return temp
    }
    if (label === 'PartNumber') {
      if (partNumberArray && partNumberArray.length > 0) {

        const filteredList = filterList(partNumberArray);
        filteredList && filteredList.map((item) => {
          temp.push({ label: item?.PartNumber, value: item?.PartId, asmCostingId: item?.CostingId, childPartCostingId: item?.ChildPartCostingId, partQuantity: item?.Quantity, partType: item?.Type, bomLevel: item?.Level, parentPartCostingId: item?.ParentPartCostingId, parentPartNumber: item?.ParentPartNumber })
          return null
        })
        return temp
      }
    }
    if (label === 'BOMLevel') {
      if (bomLevelList && bomLevelList.length > 0) {

        bomLevelList && bomLevelList.map((item) => {
          temp.push({ label: item?.Level, value: item?.Level })
          return null
        })
        return temp
      }
    }
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
        return null
      })
      return temp
    }
  }

  /**
  * @method handleProcessOperationChange
  * @description  FOR SETTING THE PROCESS,OPERATION,THEIR TYPE AND THEIR QUANTITY VALUE
  */
  const handleProcessOperationChange = (newValue) => {
    if (newValue && newValue !== '') {
      setToolForProcessOperation(newValue)
      setValue('type', newValue?.type)
      // setValue('processOrOperationQuantity', newValue?.processOrOperationQuantity)
    } else {
      setToolForProcessOperation([])
    }
  }

  /**
  * @method handleToolChange
  * @description  TOOL CHANGE HANDLE
  */
  const handleToolChange = (newValue) => {
    if (newValue && newValue !== '') {
      setTool(newValue)
    } else {
      setTool([])
    }
  }

  /**
  * @method addRow
  * @description ADD ROW IN TO IN THE TOOL GRID IN PARENT COMPONENT
  */
  const addRow = () => {

    if (Object.keys(errors).length > 0) return false;
    const processOrOperation = ToolForProcessOperation.value;
    const partNumber = partNumberDetail.label;
    let tempArr = []
    let finalList = []
    if (isEditFlag) {
      finalList = updateEntriesForPartNumber(partNumberDetail?.label, tableData, rowObjData?.OperationChildIdRef, rowObjData?.ProcessIdRef, rowObjData?.ToolName)
      tempArr = finalList
    }
    else {
      if (gridData && gridData.length > 0) {
        const isDuplicate = gridData.some(item => {
          return (
            (item?.OperationIdRef === processOrOperation || item?.OperationChildIdRef === processOrOperation || item?.ProcessIdRef === processOrOperation) &&
            item?.ChildPartNumber === partNumber && item?.ToolName === getValues('ToolName')
          );
        });
        if (isDuplicate) {
          // Display error message or handle duplicate case
          Toaster.warning('You cannot add multiple tools for the same part and process/operation.');
          return;
        }
      }
      finalList = generateRowsForPartNumber(partNumberDetail?.label, partNumberArray)

      tempArr = [...rowObjData, ...finalList]
    }

    props.setToolCost(tempArr, JSON.stringify(tempArr) !== JSON.stringify(rowObjData) ? true : false)
    toggleDrawer('', finalList, partNumberArray)
  }

  const handlePartNumChange = (newValue) => {
    setValue('partQuantity', newValue?.partQuantity)
    setValue('partType', newValue?.partType)
    setValue('ProcessOrOperation', "")
    // setValue('processOrOperationQuantity', '')
    setValue('type', '')
    setPartNumberDetail(newValue)
    let list = []
    partNumberArray && partNumberArray?.map(item => {
      if (item?.PartId === newValue?.value && item?.Type === 'Assembly') {
        list.push(item)
      } else if (item?.PartId === newValue?.value && item?.Type === 'Component') {
        list[0] = item
      }
    })
    if (list?.length === 1) {
      setValue("BOMLevel", { label: list[0]?.Level, value: list[0]?.Level })
      setMultipleBOMLevelCheck(true)
     delete errors.BOMLevel
    } else {
      setValue("BOMLevel", '')
      setMultipleBOMLevelCheck(false)
    }
    setBOMLevelList(list)

    dispatch(getProcessAndOperationbyAsmAndChildCostingId(newValue?.asmCostingId, newValue?.childPartCostingId, res => {
      setProcessOperationArray(res?.data?.DataList)
    }))
  }

  const handleBOMLevelChange = (newValue) => {
    setBOMLevel(newValue)
  }


  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({ ToolCategory: '' })
    props.closeDrawer('', {})
  }


  /**
   * @method generateRowsForPartNumber
   * @description This is for calculation of Tool cost on same part number which is present at different BOM Level
  */
  const generateRowsForPartNumber = (partNumber, originalList, partNumberDetailTemp) => {

    // Filter original list for entries with the selected part number
    let entriesForPartNumber = []
    if (partNumberDetailTemp?.partType === 'Assembly') {
      entriesForPartNumber = originalList.filter(item => item.PartNumber === partNumber && item.Level === partNumberDetailTemp?.bomLevel);
    } else {
      entriesForPartNumber = originalList.filter(item => item.PartNumber === partNumber);
    }


    // Map these entries to generate rows with calculated TotalToolCost
    const rows = entriesForPartNumber.map(item => {
      const totalToolCost = dataToSend.netToolCost
      return {
        IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
        ToolOperationId: isEditFlag ? rowObjData.ToolOperationId : '',
        // ToolOperationId: getValues('type') === 'Operation'?ToolForProcessOperation?.value:EMPTY_GUID,
        ProcessOrOperation: ToolForProcessOperation.label,
        ToolCategory: tool.label,
        ToolName: getValues('ToolName'),
        Quantity: getValues('Quantity'),
        ToolCost: getValues('ToolCost'),
        Life: getValues('Life'),
        NetToolCost: totalToolCost,
        PartType: item?.Type,
        PartQuantity: item?.Quantity,
        ProcessOrOperationType: getValues('type'),
        ProcessOrOperationQuantity: getValues('Quantity'),
        BOMLevel: item?.Level,
        PartNumber: costData?.PartNumber,
        PartId: costData?.PartId,
        OperationChildIdRef: getValues('type') === 'Operation' ? ToolForProcessOperation?.value : null,
        ProcessIdRef: getValues('type') === 'Process' ? ToolForProcessOperation?.value : null,
        MachineIdRef: getValues('type') === 'Process' ? ToolForProcessOperation?.machineId : null,
        ParentPartCostingIdRef: item?.ParentPartCostingId,
        ChildPartCostingIdRef: item?.ChildPartCostingId,
        ToolCRMHead: getValues('crmHead')?.label,
        TotalToolCost: totalToolCost,
        ChildPartNumber: item?.PartNumber,
        ParentPartNumber: item?.ParentPartNumber,
        ToolQuantity:getValues('Quantity'),
        ToolLife:getValues('Life'),
        ToolAmortizationCost:state.toolAmortizationCost,
        ToolApplicabilityTypeId:state.toolMaintenanceApplicability?.value,
        ToolCostType:state.toolMaintenanceApplicability?.label,
        ToolMaintenancePercentage:getValues('MaintenancePercentage'),
        ToolApplicabilityCost:getValues('MaintananceCostApplicability'),
        ToolMaintenanceCost:state.toolMaintenanceCost,
        ToolMaintenanceCostPerPiece:state.toolMaintenanceCostPerPc,
        ToolInterestRatePercent:getValues('ToolInterestRatePercent'),
        ToolInterestCost:state.toolInterestCost,
        ToolInterestCostPerPiece:state.toolInterestCostPerPc,
        ProcessRunCount: getValues('Quantity')
      };
    });

    return rows;
  }

  /**
   * @method updateEntriesForPartNumber
   * @description This is for calculation of Tool cost on same part number which is present at different BOM Level in update mode
  */
  const updateEntriesForPartNumber = (partNumber, list, OperationChildIdRef, ProcessIdRef, ToolName) => {
    // Iterate over the list and update entries matching the partNumber
    list.forEach(item => {
      if (item.ChildPartNumber === partNumber) {
        if (rowObjData?.ProcessOrOperationType === 'Operation' && item.OperationChildIdRef === OperationChildIdRef && item.ToolName === ToolName) {
          // Calculate the new TotalToolCost based on the item's Quantity
          const totalToolCost = dataToSend.netToolCost
          // Update the item with the new TotalToolCost (or any other updates you need)
          item.TotalToolCost = totalToolCost;

          item.Quantity = getValues('Quantity')
          item.ToolCost = getValues('ToolCost')
          item.Life = getValues('Life')
          item.NetToolCost = totalToolCost
          item.ToolCRMHead = getValues('crmHead')?.label
          item.ToolLife = getValues('Life')
          item.ProcessOrOperationQuantity = getValues('Quantity')
          item.ToolMaintenancePercentage = getValues('MaintenancePercentage')
          item.ToolApplicabilityCost = getValues('MaintananceCostApplicability')
          item.ToolInterestRatePercent = getValues('ToolInterestRatePercent')
          item.ToolAmortizationCost = state.toolAmortizationCost
          item.ToolApplicabilityTypeId= state.toolMaintenanceApplicability?.value
          item.ToolCostType= state.toolMaintenanceApplicability?.label
          item.ToolMaintenanceCost = state.toolMaintenanceCost
          item.ToolMaintenanceCostPerPiece = state.toolMaintenanceCostPerPc
          item.ToolInterestCost = state.toolInterestCost
          item.ToolInterestCostPerPiece = state.toolInterestCostPerPc
          item.ProcessRunCount = getValues('Quantity')
          // Here you can add any other property updates as needed
        } else if (rowObjData?.ProcessOrOperationType === 'Process' && item.ProcessIdRef === ProcessIdRef && item.ToolName === ToolName) {

          // Calculate the new TotalToolCost based on the item's Quantity
          const totalToolCost = dataToSend.netToolCost
          // Update the item with the new TotalToolCost (or any other updates you need)
          item.TotalToolCost = totalToolCost;

          item.Quantity = getValues('Quantity')
          item.ToolCost = getValues('ToolCost')
          item.Life = getValues('Life')
          item.NetToolCost = totalToolCost
          item.ToolCRMHead = getValues('crmHead')?.label
          item.ToolLife = getValues('Life')
          item.ProcessOrOperationQuantity = getValues('Quantity')
          item.ToolMaintenancePercentage = getValues('MaintenancePercentage')
          item.ToolApplicabilityCost = getValues('MaintananceCostApplicability')
          item.ToolInterestRatePercent = getValues('ToolInterestRatePercent')
          item.ToolAmortizationCost = state.toolAmortizationCost
          item.ToolApplicabilityTypeId= state.toolMaintenanceApplicability?.value
          item.ToolCostType= state.toolMaintenanceApplicability?.label
          item.ToolMaintenanceCost = state.toolMaintenanceCost
          item.ToolMaintenanceCostPerPiece = state.toolMaintenanceCostPerPc
          item.ToolInterestCost = state.toolInterestCost
          item.ToolInterestCostPerPiece = state.toolInterestCostPerPc
          item.ProcessRunCount = getValues('Quantity')
          // Here you can add any other property updates as needed
        }
      }

    });
    return list
  };

  /**
   * @method handleToolApplicabilityChange
   * @description This is for handling the tool applicability change
  */
  const handleToolApplicabilityChange = (newValue) => {        
    if(newValue?.label==='Tool Rate'){
      setValue('MaintananceCostApplicability', checkForDecimalAndNull(getValues('ToolCost'), getConfigurationKey().NoOfDecimalForPrice))
    } else {
      setValue('MaintananceCostApplicability', 0)
    }
    setValue('ToolInterestRatePercent', 0)
    setValue('MaintenancePercentage', 0)
    setValue('ToolMaintenanceCost', 0)
    setValue('MaintananceCostApplicability',0)
    setValue('ToolMaintenanceCostPerPc', 0)
    setValue('ToolInterestCost', 0)
    setValue('ToolInterestCostPerPc', 0)
    setValue('TotalToolCost', 0)
    delete errors.MaintananceCostApplicability
    delete errors.MaintenancePercentage
    delete errors.ToolInterestRatePercent
    setState(prevState => {
      const newState = {...prevState, toolMaintenanceApplicability: newValue, toolMaintenanceCost: 0, toolMaintenanceCostPerPc: 0, toolInterestCost: 0, toolInterestCostPerPc:0 }
      return newState 
    })
  }

  const handleToolRateChange = (e) => {
    if (state.toolMaintenanceApplicability?.label === "Tool Rate") {
      setValue('MaintananceCostApplicability', checkForDecimalAndNull(e.target.value, getConfigurationKey().NoOfDecimalForPrice))
    }
  }
  
  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={"drawer-wrapper layout-width-700px"}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{isEditFlag ? 'Update Tool' : 'Add Tool'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <form noValidate className="form" onSubmit={handleSubmit(addRow)}>
              <>
                <Row className="pl-3">
                <HeaderTitle className="border-bottom"
                                            title={'Process Details'}
                                            customClass={'underLine-title'}
                                        />
                  {
                    getConfigurationKey().IsShowCRMHead && <Col md="4">
                      <SearchableSelectHookForm
                        name={`crmHead`}
                        type="text"
                        label="CRM Head"
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false
                        }}
                        placeholder={'Select'}
                        options={CRMHeads}
                        customClassName="costing-selectable-dropdown"
                        required={false}
                        handleChange={() => { }}
                        disabled={CostingViewMode}
                        errors={errors.crmHead}
                      />
                    </Col >
                  }
                  <Col md="4">
                    <SearchableSelectHookForm
                      label={'Assembly/Child Part No.'}
                      name={'PartNumber'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={ToolForProcessOperation.length !== 0 ? ToolForProcessOperation : ''}
                      options={renderListing('PartNumber')}
                      mandatory={true}
                      handleChange={handlePartNumChange}
                      errors={errors.PartNumber}
                      disabled={isEditFlag || CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="4">
                    <SearchableSelectHookForm
                      label={'BOM Level'}
                      name={'BOMLevel'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required:  true }}
                      register={register}
                      defaultValue={bomLevel}
                      options={renderListing('BOMLevel')}
                      mandatory={ true}
                      handleChange={handleBOMLevelChange}
                      errors={errors.BOMLevel}
                      disabled={isEditFlag || CostingViewMode || multipleBOMLevelCheck ? true : false}
                    />
                  </Col>

                  <Col md="4">
                    <TextFieldHookForm
                      label="Part Type"
                      name={'partType'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.partType}
                      disabled={true}
                    />
                  </Col>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Part Quantity"
                      name={'partQuantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.partQuantity}
                      disabled={true}
                    />
                  </Col>
                  <Col md="4">
                    <SearchableSelectHookForm
                      label={'Process/Operation'}
                      name={'ProcessOrOperation'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={ToolForProcessOperation.length !== 0 ? ToolForProcessOperation : ''}
                      options={renderListing('ToolProcessOperation')}
                      mandatory={true}
                      handleChange={handleProcessOperationChange}
                      errors={errors.ProcessOrOperation}
                      disabled={isEditFlag || CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Process/Operation Type"
                      name={'type'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.type}
                      disabled={true}
                    />
                  </Col>
                  <Col md="4">
                    <TextFieldHookForm
                      label="Process Run Count/No. of Tools"
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Quantity}
                      disabled={CostingViewMode}
                    />
                  </Col>
                  {/* <Col md="4">
                    <TextFieldHookForm
                      label="Process/Operation Quantity"
                      name={'processOrOperationQuantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.processOrOperationQuantity}
                      disabled={true}
                    />
                  </Col> */}
                  <HeaderTitle className="border-bottom"
                                            title={'Tool Details'}
                                            customClass={'underLine-title'}
                                        />


                  {getConfigurationKey().IsShowToolCategory &&
                    <Col md="4">
                      <SearchableSelectHookForm
                        label={'Tool Category'}
                        name={'ToolCategory'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={tool.length !== 0 ? tool : ''}
                        options={renderListing('ToolCategory')}
                        mandatory={true}
                        handleChange={handleToolChange}
                        errors={errors.ToolCategory}
                        disabled={isEditFlag || CostingViewMode ? true : false}
                      />
                    </Col>
                  } 

                  <Col md="4">
                    <TextFieldHookForm
                      label="Tool Name"
                      name={'ToolName'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        validate: { checkWhiteSpaces, alphaNumericValidation },
                        maxLength: STRINGMAXLENGTH
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ToolName}
                      disabled={isEditFlag || CostingViewMode ? true : false}
                    />
                  </Col>

                  

                  <Col md="4">
                    <TextFieldHookForm
                      label="Tool Rate"
                      name={'ToolCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, decimalIntegerNumberLimit: decimalIntegerNumberLimit(10,6) }
                      }}
                      handleChange={(e) => handleToolRateChange(e)}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ToolCost}
                      disabled={CostingViewMode}
                    />
                  </Col>

                  <Col md="4">
                    <TextFieldHookForm
                      label="Life/Amortization"
                      name={'Life'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        validate: { number,nonZero, checkWhiteSpaces, decimalIntegerNumberLimit: decimalIntegerNumberLimit(10,6) }
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Life}
                      disabled={CostingViewMode}
                    />
                  </Col>
                  <Col md="4">
                    <TooltipCustom disabledIcon={true} id={'tool-amortization-cost'} tooltipText={'Tool Amortization Cost = Tool Rate * Part Quantity * Process Run Count / Tool Life'} />
                    <TextFieldHookForm
                      label="Tool Amortization Cost"
                      name={'ToolAmortizationCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ToolAmortizationCost}
                      disabled={true}
                      id={'tool-amortization-cost'}
                    />
                  </Col>
                  <Col md="4">
                    <SearchableSelectHookForm
                      label={"Tool Maintenance Applicability"}
                      name={"ToolMaintenanceApplicability"}
                      placeholder={"Select"}
                      Controller={Controller}
                      control={control}
                      rules={{ required: false }}
                      isClearable={true}
                      register={register}
                      defaultValue={state.toolMaintenanceApplicability}
                      options={renderListing("Applicability")}
                      mandatory={false}
                      handleChange={handleToolApplicabilityChange}
                      errors={errors.ToolMaintenanceApplicability}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  {state.toolMaintenanceApplicability?.label === "Tool Rate" &&
                    <>
                      <Col md="4">
                        <TextFieldHookForm
                          label={`Maintenance Tool Cost (%)`}
                          name={'MaintenancePercentage'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={() => { }}
                          rules={{
                            required: false,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.MaintenancePercentage}
                          disabled={CostingViewMode ? true : false}
                        /></Col>
                    </>}
                    <Col md="4">
                      <TextFieldHookForm
                        label="Cost (Applicability)"
                        name={'MaintananceCostApplicability'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          validate: { number, checkWhiteSpaces, decimalIntegerNumberLimit: decimalIntegerNumberLimit(10,6) }
                        }}
                        handleChange={() => { }}
                        defaultValue={state.toolMaintenanceApplicability?.label === "Tool Rate" ? getValues('ToolCost') : ''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.MaintananceCostApplicability}
                        disabled={state.toolMaintenanceApplicability?.label === "Tool Rate" ? true : CostingViewMode}
                      />
                    </Col>
                    <Col md="4">{ <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-maintanence"} tooltipText={`${toolMaintenanceCostLabel} = ${state.toolMaintenanceApplicability?.label==='Fixed'? 'Cost (Applicability) * Process Run Count * Part Quantity':'(Maintenance Cost (%) * Cost(Applicability) * Process Run Count / 100)'} `} />}
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
                      handleChange={(e) => {}}
                      errors={errors && errors.ToolMaintenanceCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="4">{state.toolMaintenanceApplicability !== 'Fixed' && <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-maintanence-per-pc"} tooltipText={`${toolMaintenanceCostPerPcLabel}= (${toolMaintenanceCostLabel}  * Process Run Count/ Amortization Quantity (Tool Life) `} />}
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
                      handleChange={(e) => {}}
                      errors={errors && errors.ToolMaintenanceCostPerPc}
                      disabled={true}
                    />
                  </Col>
                  <Col md="4">
                  <TextFieldHookForm
                          label={toolInterestRatePercentLabel}
                          name={'ToolInterestRatePercent'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          handleChange={(e) => {}}
                          rules={{
                            required: false,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ToolInterestRatePercent}
                          disabled={!getValues('ToolCost')|| CostingViewMode ? true : false}
                        />
                  </Col>
                  <Col md="4">
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-interest-cost"} tooltipText={`${toolInterestCostLabel}= (Tool Rate * ${toolInterestRatePercentLabel} / 100)`} />
                  <TextFieldHookForm
                          label={toolInterestCostLabel}
                          name={'ToolInterestCost'}
                          Controller={Controller}
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
                  <Col md="4">{ <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={"tool-interest-cost-per-pc"} tooltipText={`${toolInterestCostPerPcLabel}= (${toolInterestCostLabel} / Amortization Quantity (Tool Life) `} />}
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
                  <Col md="4">
                    <TooltipCustom disabledIcon={true} id={'total-tool-cost'} tooltipText={`Total Tool Cost = Tool Amortization Cost + ${toolInterestCostPerPcLabel} + ${toolMaintenanceCostPerPcLabel}`} />
                    <TextFieldHookForm
                      label="Total Tool Cost"
                      name={'TotalToolCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.TotalToolCost}
                      disabled={true}
                      id={'total-tool-cost'}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt15">
                  <div className="col-sm-12 text-right pr-3">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cancel-icon'}></div> {'Cancel'}
                    </button>

                    <button
                      type={'submit'}
                      className="submit-button save-btn"
                      // onClick={addRow}
                      disabled={CostingViewMode}
                    >
                      <div className={'save-icon'}></div>
                      {isEditFlag ? 'Update' : 'Save'}
                    </button>
                  </div>
                </Row>
              </>
            </form>

          </div>
        </Container>
      </Drawer>
    </div>
  );
}

export default React.memo(AddTool);