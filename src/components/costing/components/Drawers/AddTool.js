import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getAssemblyChildPartbyAsmCostingId, getProcessAndOperationbyAsmAndChildCostingId, getToolCategoryList } from '../../actions/Costing';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper';
import { checkWhiteSpaces, number, decimalNumberLimit6, alphaNumericValidation } from "../../../../helper/validation";
import { STRINGMAXLENGTH } from '../../../../config/masterData';
import { costingInfoContext } from '../CostingDetailStepTwo';
import TooltipCustom from '../../../common/Tooltip';
import { CRMHeads } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';

function AddTool(props) {

  const { rowObjData, isEditFlag, gridData, CostingViewMode } = props;
  const costData = useContext(costingInfoContext)
  const { RMCCTabData } = useSelector(state => state.costing)

  const defaultValues = {
    ToolOperationId: rowObjData?.ToolOperationId ? rowObjData.ToolOperationId : '',
    ProcessOrOperation: rowObjData?.ProcessOrOperation ? { label: rowObjData.ProcessOrOperation, value: rowObjData.ProcessOrOperation } : [],
    ToolCategory: rowObjData?.ToolCategory ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : [],
    ToolName: rowObjData?.ToolName ? rowObjData.ToolName : '',
    Quantity: rowObjData?.Quantity ? rowObjData.Quantity : '',
    ToolCost: rowObjData?.ToolCost ? rowObjData.ToolCost : '',
    Life: rowObjData?.Life ? rowObjData.Life : '',
    TotalToolCost: rowObjData?.TotalToolCost ? rowObjData.TotalToolCost : '',
    PartNumber: rowObjData?.PartNumber ? { label: rowObjData?.PartNumber, value: rowObjData?.PartId } : '',
    BOMLevel: rowObjData?.BOMLevel ? { label: rowObjData?.BOMLevel, value: rowObjData?.BOMLevel } : '',
    partType: rowObjData?.PartType ? rowObjData?.PartType : '',
    partQuantity: rowObjData?.PartQuantity ? rowObjData?.PartQuantity : '',
    type: rowObjData?.ProcessOrOperationType ? rowObjData?.ProcessOrOperationType : '',
    // processOrOperationQuantity: 1,
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


  const fieldValues = useWatch({
    control,
    name: ['Quantity', 'ToolCost', 'Life'],
  });

  useEffect(() => {
    dispatch(getToolCategoryList(res => { }))
    if (RMCCTabData) {
      dispatch(getAssemblyChildPartbyAsmCostingId(RMCCTabData[0]?.AssemblyCostingId, false, res => {
        setPartNumberArray(res?.data?.DataList)
      }))
    }
  }, [])

  useEffect(() => {
    getNetToolCost(partNumberDetail?.partQuantity)
    setValue('TotalToolCost', checkForDecimalAndNull(getNetToolCost(partNumberDetail?.partQuantity), getConfigurationKey().NoOfDecimalForPrice))
  }, [fieldValues]);

  const toggleDrawer = (event, formData = []) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', formData)
  };

  /**
  * @method getNetToolCost
  * @description GET NET TOOL COST
  */
  const getNetToolCost = (partQuantity = '') => {
    const cost = checkForNull(getValues("Quantity")) * checkForNull(getValues("ToolCost")) / checkForNull(getValues("Life")) * checkForNull(partQuantity)
    setDataToSend(prevState => ({ ...prevState, netToolCost: cost }))
    return cost
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
    let formData = {
      IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
      ToolOperationId: isEditFlag ? rowObjData.ToolOperationId : '',
      // ToolOperationId: getValues('type') === 'Operation'?ToolForProcessOperation?.value:EMPTY_GUID,
      ProcessOrOperation: ToolForProcessOperation.label,
      ToolCategory: tool.label,
      ToolName: getValues('ToolName'),
      Quantity: getValues('Quantity'),
      ToolCost: getValues('ToolCost'),
      Life: getValues('Life'),
      NetToolCost: dataToSend.netToolCost,
      PartType: getValues('partType'),
      PartQuantity: getValues('partQuantity'),
      ProcessOrOperationType: getValues('type'),
      ProcessOrOperationQuantity: 1,
      BOMLevel: partNumberDetail?.bomLevel,
      PartNumber: costData?.PartNumber,
      PartId: costData?.PartId,
      OperationChildIdRef: getValues('type') === 'Operation' ? ToolForProcessOperation?.value : null,
      ProcessIdRef: getValues('type') === 'Process' ? ToolForProcessOperation?.value : null,
      MachineIdRef: getValues('type') === 'Process' ? ToolForProcessOperation?.machineId : null,
      ParentPartCostingIdRef: partNumberDetail?.parentPartCostingId,
      ChildPartCostingIdRef: partNumberDetail?.childPartCostingId,
      ToolCRMHead: getValues('crmHead')?.label
    }

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
      const totalToolCost = getNetToolCost(item?.Quantity)
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
        ProcessOrOperationQuantity: 1,
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
        ParentPartNumber: item?.ParentPartNumber
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
          const totalToolCost = getNetToolCost(item?.PartQuantity)
          // Update the item with the new TotalToolCost (or any other updates you need)
          item.TotalToolCost = totalToolCost;

          item.Quantity = getValues('Quantity')
          item.ToolCost = getValues('ToolCost')
          item.Life = getValues('Life')
          item.NetToolCost = totalToolCost
          item.ToolCRMHead = getValues('crmHead')?.label
          // Here you can add any other property updates as needed
        } else if (rowObjData?.ProcessOrOperationType === 'Process' && item.ProcessIdRef === ProcessIdRef && item.ToolName === ToolName) {

          // Calculate the new TotalToolCost based on the item's Quantity
          const totalToolCost = getNetToolCost(item?.PartQuantity)
          // Update the item with the new TotalToolCost (or any other updates you need)
          item.TotalToolCost = totalToolCost;

          item.Quantity = getValues('Quantity')
          item.ToolCost = getValues('ToolCost')
          item.Life = getValues('Life')
          item.NetToolCost = totalToolCost
          item.ToolCRMHead = getValues('crmHead')?.label
          // Here you can add any other property updates as needed
        }
      }

    });
    return list
  };


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
          <div className={'drawer-wrapper'}>

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
                  {
                    getConfigurationKey().IsShowCRMHead && <Col md="6">
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
                  <Col md="6">
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
                  <Col md="6">
                    <SearchableSelectHookForm
                      label={'BOM Level'}
                      name={'BOMLevel'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={bomLevel}
                      options={renderListing('BOMLevel')}
                      mandatory={true}
                      handleChange={handleBOMLevelChange}
                      errors={errors.BOMLevel}
                      disabled={isEditFlag || CostingViewMode || multipleBOMLevelCheck ? true : false}
                    />
                  </Col>

                  <Col md="6">
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
                  <Col md="6">
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
                  <Col md="6">
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
                  <Col md="6">
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
                  {/* <Col md="6">
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
                  <Col md="6">
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

                  <Col md="6">
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

                  <Col md="6">
                    <TextFieldHookForm
                      label="Quantity"
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

                  <Col md="6">
                    <TextFieldHookForm
                      label="Tool Cost"
                      name={'ToolCost'}
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
                      errors={errors.ToolCost}
                      disabled={CostingViewMode}
                    />
                  </Col>

                  <Col md="6">
                    <TextFieldHookForm
                      label="Life/Amortization"
                      name={'Life'}
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
                      errors={errors.Life}
                      disabled={CostingViewMode}
                    />
                  </Col>


                  <Col md="6">
                    <TooltipCustom disabledIcon={true} id={'total-tool-cost'} tooltipText={'Total Tool Cost = (Tool Cost * Quantity)/Life * Part Quantity'} />
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
                      {'Save'}
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