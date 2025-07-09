import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import AddOperation from '../../Drawers/AddOperation';
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CRMHeads, EMPTY_DATA, MASS, WACTypeId, ASSEMBLYNAME, EMPTY_GUID } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { calculateNetCosts, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isDataChange, setRMCCErrors, setSelectedIdsOperation } from '../../../actions/Costing';
import Popup from 'reactjs-popup';
import { costingInfoContext, IsNFRContext } from '../../CostingDetailStepTwo';
import { IdForMultiTechnology, REMARKMAXLENGTH } from '../../../../../config/masterData';
import TooltipCustom from '../../../../common/Tooltip';
import { AcceptableOperationUOM, STRINGMAXLENGTH, TEMPOBJECTOPERATION } from '../../../../../config/masterData';
import { required, maxLength15 } from "../../../../../helper/validation";
import { number, decimalNumberLimit6, checkWhiteSpaces, alphaNumericValidation, noDecimal, numberLimit6 } from "../../../../../helper/validation";
import { swappingLogicCommon, handleRemarkPopup } from '../../../CostingUtil';
import Button from '../../../../layout/Button';
import TourWrapper from '../../../../common/Tour/TourWrapper';
import { Steps } from '../../TourMessages';
import { useTranslation } from 'react-i18next';
import ViewDetailedForms from '../../Drawers/ViewDetailedForms';
import { de } from 'date-fns/locale';

let counter = 0;
function OperationCost(props) {
  const { item, rmFinishWeight, rmGrossWeight } = props;
  // const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)


  let IsLocked = ''
  if (item?.PartType === 'Sub Assembly') {
    IsLocked = (item.IsLocked ? item.IsLocked : false)
  }
  else {
    IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  }


  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  let dragEnd;

  const dispatch = useDispatch()
  const [gridData, setGridData] = useState(props.data ? props.data : [])
  const OldGridData = props.data
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [operationCostAssemblyTechnology, setOperationCostAssemblyTechnology] = useState(item?.CostingPartDetails?.NetOperationCost)
  const [showQuantity, setShowQuantity] = useState(true)
  const [operationRemark, setOperationRemark] = useState(true)
  const [headerPinned, setHeaderPinned] = useState(true)
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, ErrorObjRMCC } = useSelector(state => state.costing)
  const costData = useContext(costingInfoContext);
  const { t } = useTranslation("Costing")
  const [openOperationForm, setOpenOperationForm] = useState(false)
  const [tourState, setTourState] = useState({
    steps: []
  })
  const { currencySource, exchangeRateData } = useSelector((state) => state?.costing);
  const { operationApplicabilitySelect } = useSelector(state => state.costing);
  const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);
  useEffect(() => {
    const Params = {
      index: 0,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
      PartType: props.item.PartType
    }
    if (!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) {
      // IF TECHNOLOGY IS ASSEMBLY FOR COSTING THIS ILL BE EXECUTED ELSE FOR PART COSTING AND ASSEMBLY COSTING
      if (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData.CostingTypeId === WACTypeId) || (costData?.PartType === 'Assembly' && IsMultiVendorCosting)) {
        // FUTURE CONDITION FROM API RESPONCE TO CHECK IF DATA IS CHANGED OR NOT
        // JSON.stringify(gridData) !== JSON.stringify(OldGridData)

        // PROP IS USED TO SET OPERATION GRID AND TOTAL OPERATION COST IN ADDASSEMBLYOPERATION
        props.getOperationGrid(gridData, operationCostAssemblyTechnology, true)
      } else {
        if (props.IsAssemblyCalculation) {
          // props.setAssemblyOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false, props.item)
          props.getOperationGrid(gridData, '', false)
          setTimeout(() => {
            props?.setAssemblyOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false, props.item)
          }, 200);

        } else {
          gridData && gridData.map((el, index) => {
            setValue(`${OperationGridFields}.${index}.Applicability`, el?.CostingConversionApplicabilityDetails?.map(item => ({
              label: item.CostingConditionNumber,
              value: item.CostingConditionMasterAndTypeLinkingId
            })))
            setValue(`${OperationGridFields}.${index}.ProcessCRMHead`, { label: el?.ProcessCRMHead, value: el?.index })
            return null
          })
          props.setOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false)
        }
      }

      if (JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : [])) {
        dispatch(isDataChange(true))
      }
    }

    selectedIds(gridData)
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource, exchangeRateData)) return false;

    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let GridArray = gridData !== null ? gridData : [];
      let finalQuantity = 1
      let rowArray = rowData && rowData.map(el => {
        if (el.UOMType === MASS) {
          finalQuantity = rmFinishWeight ? rmFinishWeight : 1
        } else {
          finalQuantity = el?.Quantity
        }
        const WithLaboutCost = checkForNull(el.Rate) * checkForNull(finalQuantity);
        const WithOutLabourCost = el.IsLabourRateExist ? checkForNull(el.LabourRate) * el.LabourQuantity : 0;
        const OperationCost = WithLaboutCost + WithOutLabourCost;
        return {
          IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
          OperationId: el.OperationId,
          OperationName: el.OperationName,
          OperationCode: el.OperationCode,
          UOM: el.UnitOfMeasurement,
          Rate: el.Rate,
          Quantity: Number(finalQuantity),
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          OperationCost: OperationCost,
          IsChecked: el.IsChecked,
          UOMType: el.UOMType,
          ConvertedExchangeRateId: el.ConvertedExchangeRateId === EMPTY_GUID ? null : el.ConvertedExchangeRateId,
          CurrencyExchangeRate: el.CurrencyExchangeRate,
          CostingConditionNumber: el.CostingConditionNumber,
          CostingConditionMasterAndTypeLinkingId: el.CostingConditionMasterAndTypeLinkingId,
          ForType: el.ForType
        }
      })
      let tempArr = [...GridArray, ...rowArray]
      let netCostTotal = 0
      tempArr && tempArr.map((el, index) => {
        netCostTotal = checkForNull(netCostTotal) + checkForNull(el.OperationCost)
        setValue(`${OperationGridFields}.${index}.Quantity`, checkForDecimalAndNull(el?.Quantity, initialConfiguration?.NoOfDecimalForInputOutput))
        setValue(`${OperationGridFields}.${index}.Applicability`, el?.CostingConversionApplicabilityDetails?.map(item => ({
          label: item.CostingConditionNumber,
          value: item.CostingConditionMasterAndTypeLinkingId
        })))
        setValue(`${OperationGridFields}.${index}.ProcessCRMHead`, { label: el?.ProcessCRMHead, value: el?.index })
        return null
      })
      setOperationCostAssemblyTechnology(netCostTotal)
      setGridData(tempArr)
      selectedIds(tempArr)
      dispatch(gridDataAdded(true))
    }
    setDrawerOpen(false)
  }

  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {

    let selectedId = Ids;
    if (tempArr && tempArr.length > 0) {
      tempArr && tempArr.map(el => {
        if (Ids.includes(el.OperationId) === false) {
          selectedId.push(el.OperationId)
          setIds(selectedId)
        }
        return null;
      })
      dispatch(setSelectedIdsOperation(selectedId))
    } else {
      dispatch(setSelectedIdsOperation([]))
    }
  }

  const onRemarkPopUpClick = (index) => {
    if (errors?.OperationGridFields && errors?.OperationGridFields?.[index]?.remarkPopUp !== undefined) {
      return false
    }
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,

      Remark: getValues(`${OperationGridFields}.${index}.remarkPopUp`)
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    // setGridData(tempArr)

    if (getValues(`${OperationGridFields}.${index}.remarkPopUp`)) {
      Toaster.success('Remark saved successfully')
    }
    setGridData(tempArr)
    var button = document.getElementById(`operationCost_popUpTriggerss${props.IsAssemblyCalculation}${index}`)
    button.click()
  }

  const onCRMHeadChange = (e, index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      OperationCRMHead: e?.label
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setGridData(tempArr)
  }

  const onHandleChangeApplicability = (e, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (e && Array.isArray(e)) {
      const labels = e.map(item => item.label.toLowerCase());
      
      // Check for duplicates using Set
      if (new Set(labels).size !== labels.length) {
        Toaster.warning(`Duplicate applicability is not allowed`);
        return false;
      }

    }
    // Handle clearing the selection
    if (!e) {
      tempData = {
        ...tempData,
        CostingConversionApplicabilityDetails: [],
        NetOperationCostForOverhead: 0,
        NetOperationCostForProfit: 0,
      };
    } else {
      // Recalculate net costs with new applicability
      //const netCosts = calculateNetCosts(tempData?.OperationCost, e?.label, 'Operation');
      tempData = {
        ...tempData,
        CostingConversionApplicabilityDetails: e && e?.map(item => ({
          CostingConditionMasterAndTypeLinkingId: item.value,
          CostingConditionNumber: item.label
        }))
        //...netCosts
      };
    }
    tempArr = Object.assign([...gridData], { [index]: tempData });
    setGridData(tempArr);
  };
  const onRemarkPopUpClose = (index) => {
    var button = document.getElementById(`operationCost_popUpTriggerss${props.IsAssemblyCalculation}${index}`)
    if (errors && errors?.OperationGridFields && errors?.OperationGridFields?.[index].remarkPopUp) {
      delete errors?.OperationGridFields?.[index].remarkPopUp;
      setOperationRemark(false)
    }
    button.click()
  }

  const deleteItem = (index, OperationId) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setIds(Ids && Ids.filter(item => item !== OperationId))
    setGridData(tempArr)
    setValue(`${OperationGridFields}.${index}.remarkPopUp`, '')
    tempArr && tempArr.map((el, i) => {
      setValue(`${OperationGridFields}.${i}.remarkPopUp`, el.Remark)
      setValue(`${OperationGridFields}.${index}.Applicability`, el?.CostingConversionApplicabilityDetails?.map(item => ({
        label: item.CostingConditionNumber,
        value: item.CostingConditionMasterAndTypeLinkingId
      })))
      setValue(`${OperationGridFields}.${i}.ProcessCRMHead`, { label: el?.ProcessCRMHead, value: el?.index })
    })
    dispatch(setSelectedIdsOperation(Ids && Ids.filter(item => item !== OperationId)))
    //let totalFinishWeight = 0
    // totalFinishWeight = tempArr && tempArr.reduce((accummlator, el) => {
    //   return accummlator + checkForNull(el.OperationCost)
    // }, 0)
    const totals = calculateOperationTotals(tempArr);
    if (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || (costData.CostingTypeId === WACTypeId) || (costData?.PartType === 'Assembly' && IsMultiVendorCosting)) {
      props.getOperationGrid(tempArr, totals?.NetOperationCost, true)
    }
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    if (editIndex !== '') {
      let tempArr = Object.assign([...gridData], { [editIndex]: rowObjData })
      setGridData(tempArr)
    }
    setEditIndex(index)
    setRowObjData(tempArr)
  }

  const SaveItem = (index) => {
    if (errors?.OperationGridFields && errors?.OperationGridFields?.length > 0) {
      return false
    }
    if (getValues(`${OperationGridFields}.${index}.Quantity`) === '') {
      return false
    }
    // Add applicability validation
    const rowData = gridData[index];
    if (!rowData?.CostingConversionApplicabilityDetails) {
      Toaster.warning('Please select Applicability');
      return false;
    }
    let operationGridData = gridData[index]
    if (operationGridData.UOM === 'Number') {
      if (operationGridData?.Quantity === '0') {
        Toaster.warning('Number should not be zero')
        return false
      }
    }
    setEditIndex('')
  }

  const CancelItem = (index) => {
    let tempArr = Object.assign([...gridData], { [index]: rowObjData })
    setEditIndex('')
    setGridData(tempArr)
    setRowObjData({})
    setValue(`${OperationGridFields}.${index}.Quantity`, tempArr?.Quantity)
    setValue(`${OperationGridFields}.${index}.Applicability`, tempArr?.CostingConversionApplicabilityDetails?.map(item => ({
      label: item.CostingConditionNumber,
      value: item.CostingConditionMasterAndTypeLinkingId
    })))
    setValue(`${OperationGridFields}.${index}.ProcessCRMHead`, { label: tempArr?.ProcessCRMHead, value: tempArr?.index })

    errors.OperationGridFields = {}
  }

  const handleQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];
    if (checkForNull(rmGrossWeight) !== 0 && tempData?.UOMType === MASS && event?.target?.value > rmGrossWeight) {
      Toaster.warning("Enter value less than gross weight.")
      setTimeout(() => {
        setValue(`${OperationGridFields}.${index}.Quantity`, '')

      }, 50);
      return false;
    }
    if (!isNaN(event.target.value) && event.target.value !== '') {
      const WithLaboutCost = checkForNull(tempData.Rate) * event.target.value;
      const WithOutLabourCost = tempData.IsLabourRateExist ?
        checkForNull(tempData.LabourRate) * tempData.LabourQuantity : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, Quantity: Number(event.target.value), OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      let value = tempArr && tempArr.length > 0 && tempArr.reduce((accummlator, el) => {
        return accummlator + checkForNull(el?.OperationCost)
      }, 0)
      setOperationCostAssemblyTechnology(value)
      setGridData(tempArr)

      //const netCosts = calculateNetCosts(OperationCost, tempData?.Applicability?.label, "Operation");
      tempData = {
        ...tempData,
        Quantity: Number(event.target.value),
        OperationCost,
        CostingConversionApplicabilityDetails: tempData?.CostingConversionApplicabilityDetails,
        //...netCosts
      };
      tempArr = Object.assign([...gridData], { [index]: tempData });
      // let value = tempArr && tempArr.length > 0 && tempArr.reduce((accumulator, el) => {
      //   return accumulator + checkForNull(el?.OperationCost);
      // }, 0);
      const totals = calculateOperationTotals(tempArr);

      setOperationCostAssemblyTechnology(totals?.NetOperationCost);
      setGridData(tempArr);
    }
  };

  const handleLabourQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];
    if (!isNaN(event?.target?.value) && event?.target?.value !== '') {
      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData?.Quantity);
      const WithOutLabourCost = tempData.IsLabourRateExist ?
        checkForNull(tempData.LabourRate) * event.target.value : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      //const netCosts = calculateNetCosts(OperationCost, tempData?.Applicability?.label, "Operation");
      tempData = {
        ...tempData,
        LabourQuantity: event.target.value,
        OperationCost,
        CostingConditionNumber: tempData?.CostingConditionNumber,
        CostingConditionMasterAndTypeLinkingId: tempData?.CostingConditionMasterAndTypeLinkingId,
        //...netCosts
      };

      tempArr = Object.assign([...gridData], { [index]: tempData });
      setGridData(tempArr);
    } else {
      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData?.Quantity);
      const OperationCost = WithLaboutCost;
      //const netCosts = calculateNetCosts(OperationCost, tempData?.Applicability?.label, "Operation");
      tempData = {
        ...tempData,
        LabourQuantity: 0,
        OperationCost,
        //...netCosts
      };

      tempArr = Object.assign([...gridData], { [index]: tempData });
      setGridData(tempArr);
    }
  };

  const netCost = (item) => {
    const cost = checkForNull(item.Rate * item?.Quantity) + checkForNull(item.LabourRate * item.LabourQuantity);
    return checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice);
  }

  /**
   * @method setRMCCErrors
   * @description CALLING TO SET BOP COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
  */
  let temp = ErrorObjRMCC ? ErrorObjRMCC : {}
  if (Object.keys(errors).length > 0 && counter < 2) {
    temp.OperationGridFields = errors?.OperationGridFields;
    dispatch(setRMCCErrors(temp))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    temp.OperationGridFields = {};
    dispatch(setRMCCErrors(temp))
    counter = 0
  }

  const onMouseLeave = (e) => {
    dragEnd = e?.target?.title

  }
  const calculateOperationTotals = (operationGrid) => {
    return operationGrid?.reduce((acc, el) => ({
      NetOperationCost: acc?.NetOperationCost + checkForNull(el?.OperationCost),
      NetOperationCostForOverhead: acc?.NetOperationCostForOverhead + checkForNull(el?.NetOperationCostForOverhead),
      NetOperationCostForProfit: acc?.NetOperationCostForProfit + checkForNull(el?.NetOperationCostForProfit)
    }), {
      NetOperationCost: 0,
      NetOperationCostForOverhead: 0,
      NetOperationCostForProfit: 0
    });
  };
  const onDragComplete = (e) => {   //SWAPPING ROWS LOGIC FOR PROCESS
    let dragStart = e?.target?.title

    if (dragEnd && dragStart && (String(dragStart) !== String(dragEnd))) {
      let finalTemp = swappingLogicCommon(gridData, dragStart, dragEnd, e) //COMMON SWAPPING LOGIC
      setGridData(finalTemp)
      finalTemp && finalTemp.map((el, index) => {
        // Update field values
        setValue(`crmHeadOperation${index}`, { label: el.OperationCRMHead, value: index })
        return null
      })
    }
  }
  const tourStart = () => {

  }
  const OperationGridFields = 'OperationGridFields';

  /**
  * @method render
  * @description Renders the component
  */
  const quantityTooltipText = <div>If the Operation is Welding, please enter <b>Welding Length/No. of Spot</b> <div>For all other Operatios, please enter the actual <b>Quantity</b>.</div></div>;

  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="8">
              <div className="left-border">
                {'Operation Cost:'}{gridData && gridData.length !== 0 &&
                  <TourWrapper
                    buttonSpecificProp={{ id: "Costing_RM_Cost", onClick: tourStart }}
                    stepsSpecificProp={{
                      steps: Steps(t).OPERATION_COST
                    }} />}
              </div>
            </Col>
            <Col md={'4'}>

              <div>

                {(!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) &&
                  <Button
                    id="Costing_addOperation"
                    onClick={DrawerToggle}
                    icon={"plus"}
                    buttonName={"OPER"}
                  />}
                {!CostingViewMode && !IsLockTabInCBCCostingForCustomerRFQ && <TooltipCustom tooltipClass="operation-defination" customClass="mt-2 mr-2" id={`operation-defination`} width="400px" tooltipText={"An operation is a detailed step within the manufacturing process involved in creating a part. It often includes tasks where human effort is added, like putting parts together, checking quality, or doing other hands-on work to complete the manufacturing process."} />}
              </div>
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table cr-brdr-main costing-operation-cost-section p-relative" size="sm" onDragOver={onMouseLeave} onDragEnd={onDragComplete}>
                <thead className={`${initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure ? 'header-with-labour-rate' : 'header-without-labour-rate'} ${headerPinned ? 'sticky-headers' : ''}`}>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Operation Code`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Rate`}</th>
                    <th><span>Quantity <TooltipCustom customClass="float-unset" tooltipClass="operation-quatity-tooltip" id={`operation-quantity-info`} tooltipText={quantityTooltipText} /></span></th>
                    {initialConfiguration &&
                      initialConfiguration?.IsOperationLabourRateConfigure &&
                      <th>{`Labour Rate`}</th>}
                    {initialConfiguration &&
                      initialConfiguration?.IsOperationLabourRateConfigure &&
                      <th>{`Labour Quantity`}</th>}
                    <th>{`Net Cost`}</th>
                    {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                    <th style={{ width: "160px" }} >{`Applicability`}<span className="asterisk-required">*</span></th>
                    <th><div className='pin-btn-container'><span>Action</span><button title={headerPinned ? 'pin' : 'unpin'} onClick={() => setHeaderPinned(!headerPinned)} className='pinned'><div className={`${headerPinned ? '' : 'unpin'}`}></div></button></div></th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData &&
                    gridData.map((item, index) => {
                      return (
                        editIndex === index ?
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OperationName + index} draggable={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? false : true} >{item.OperationName}</span> </td>
                            <td>{item.OperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td style={{ width: 130 }}>
                              {
                                <TextFieldHookForm
                                  label={false}
                                  name={`${OperationGridFields}.${index}.Quantity`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: true,
                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                  }}
                                  defaultValue={checkForDecimalAndNull(item?.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}
                                  className=""
                                  customClassName={'withBorder error-label mb-0'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleQuantityChange(e, index)
                                  }}
                                  errors={errors && errors?.OperationGridFields && errors?.OperationGridFields?.[index] !== undefined ? errors?.OperationGridFields?.[index]?.Quantity : ''}
                                  disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                />
                              }
                            </td>
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td style={{ width: 200 }}>
                                {
                                  item.IsLabourRateExist ?
                                    <TextFieldHookForm
                                      label={false}
                                      name={`${OperationGridFields}.${index}.LabourQuantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        validate: { number, checkWhiteSpaces, noDecimal },
                                      }}
                                      defaultValue={item.LabourQuantity}
                                      className=""
                                      customClassName={'withBorder error-label mb-0'}
                                      handleChange={(e) => {
                                        e.preventDefault()
                                        handleLabourQuantityChange(e, index)
                                      }}
                                      errors={errors && errors?.OperationGridFields && errors?.OperationGridFields?.[index] !== undefined ? errors?.OperationGridFields?.[index].LabourQuantity : ''}
                                      disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                    />
                                    :
                                    '-'
                                }
                              </td>}
                            <td>{netCost(item)}</td>
                            {initialConfiguration?.IsShowCRMHead && <td>
                              <SearchableSelectHookForm
                                name={`${OperationGridFields}.${index}.OperationCRMHead`}
                                type="text"
                                label="CRM Head"
                                errors={`${errors.OperationGridFields}.${index}.OperationCRMHead`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: false,
                                }}
                                placeholder={'Select'}
                                customClassName="costing-selectable-dropdown"
                                defaultValue={item.OperationCRMHead ? { label: item.OperationCRMHead, value: index } : ''}
                                options={CRMHeads}
                                required={false}
                                handleChange={(e) => { onCRMHeadChange(e, index) }}
                                disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                              />
                            </td>}
                            <td>
                              <SearchableSelectHookForm
                                name={`${OperationGridFields}.${index}.Applicability`}
                                type="text"
                                label={false}
                                errors={`${errors.OperationGridFields}.${index}.Applicability`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                placeholder={'Select'}
                                customClassName="mt-2"
                                defaultValue={item?.CostingConversionApplicabilityDetails }
                                options={operationApplicabilitySelect}
                                required={true}
                                handleChange={(e) => { onHandleChangeApplicability(e, index) }}
                                disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                isClearable={!!item?.CostingConditionMasterAndTypeLinkingId}
                                isMulti={true}
                              />
                            </td>
                            <td>
                              <div className='action-btn-wrapper'>
                                <button title='Save' className="SaveIcon mb-0 align-middle" type={'button'} onClick={() => SaveItem(index)} />
                                <button title='Discard' className="CancelIcon mb-0 align-middle" type={'button'} onClick={() => CancelItem(index)} />
                              </div>
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OperationName + index} draggable={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? false : true} onClick={() => setOpenOperationForm({ isOpen: true, id: item.OperationId })} className='link'>{item.OperationName}</span> </td>
                            <td>{item.OperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td style={{ width: 130 }}>{checkForDecimalAndNull(item?.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td style={{ width: 130 }}>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>}
                            <td><div className='w-fit' id={`operation-cost${index}`}><TooltipCustom disabledIcon={true} id={`operation-cost${index}`} tooltipText={initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure ? "Net Cost = (Rate * Quantity) + (Labour Rate * Labour Quantity)" : "Net Cost = (Rate * Quantity)"} />{netCost(item)}</div></td>
                            {initialConfiguration?.IsShowCRMHead && <td>
                              <SearchableSelectHookForm
                                name={`${OperationGridFields}.${index}.OperationCRMHead`}
                                type="text"
                                label="CRM Head"
                                errors={`${errors.OperationGridFields}.${index}.OperationCRMHead`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: false,
                                }}
                                placeholder={'Select'}
                                customClassName="costing-selectable-dropdown"
                                defaultValue={item.OperationCRMHead ? { label: item.OperationCRMHead, value: index } : ''}
                                options={CRMHeads}
                                required={false}
                                handleChange={(e) => { onCRMHeadChange(e, index) }}
                                disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                              />
                            </td>}
                            <td>
                              <SearchableSelectHookForm
                                name={`${OperationGridFields}.${index}.Applicability`}
                                type="text"
                                label={false}
                                errors={`${errors.OperationGridFields}.${index}.Applicability`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={true}
                                placeholder={'Select'}
                                customClassName="mt-2"
                                defaultValue={item?.CostingConversionApplicabilityDetails?.map(item => ({
                                  label: item.CostingConditionNumber,
                                  value: item.CostingConditionMasterAndTypeLinkingId
                                }))}
                                options={operationApplicabilitySelect}
                                required={true}
                                handleChange={(e) => { onHandleChangeApplicability(e, index) }}
                                disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                isClearable={!!item?.CostingConditionMasterAndTypeLinkingId}
                                isMulti={true}
                              />
                            </td>
                            <td>
                              <div className='action-btn-wrapper'>
                                {(!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) && <button title='Edit' id={`operationCost_edit${index}`} className="Edit mb-0 align-middle" type={'button'} onClick={() => editItem(index)} />}
                                {(!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) && <button title='Delete' id={`operationCost_delete${index}`} className="Delete mb-0 align-middle" type={'button'} onClick={() => deleteItem(index, item.OperationId)} />}
                                <Popup trigger={<button id={`operationCost_popUpTriggerss${props.IsAssemblyCalculation}${index}`} title="Remark" className="operation Comment-box align-middle" type={'button'} />}
                                  position={'top right'}
                                  onOpen={() => handleRemarkPopup("open", `${OperationGridFields}.${index}.remarkPopUp`)}
                                  onClose={() => handleRemarkPopup()}
                                >
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${OperationGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      maxLength: operationRemark && REMARKMAXLENGTH
                                    }}
                                    handleChange={(e) => { setOperationRemark(true) }}
                                    defaultValue={item.Remark ?? item.Remark}
                                    className=""
                                    customClassName={"withBorder text-area-focus"}
                                    errors={errors && errors?.OperationGridFields && errors?.OperationGridFields?.[index] !== undefined ? errors?.OperationGridFields?.[index].remarkPopUp : ''}
                                    //errors={errors && errors.remarkPopUp && errors.remarkPopUp[index] !== undefined ? errors.remarkPopUp[index] : ''}                        
                                    disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                    hidden={false}
                                    validateWithRemarkValidation={true}
                                  />
                                  <Row>
                                    <Col md="12" className='remark-btn-container'>
                                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false} onClick={() => onRemarkPopUpClick(index)} > <div className='save-icon'></div> </button>
                                      <button className='reset' onClick={() => onRemarkPopUpClose(index)} > <div className='cancel-icon'></div></button>
                                    </Col>
                                  </Row>
                                </Popup>
                              </div>
                            </td>
                          </tr>
                      )
                    })
                  }
                  {gridData && gridData.length === 0 &&
                    <tr>
                      <td colSpan={12}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

        </div>
      </div>
      {isDrawerOpen && <AddOperation
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        Ids={Ids}
      />}
      {openOperationForm && <ViewDetailedForms data={openOperationForm} formName="Operation" cancel={() => setOpenOperationForm({ isOpen: false, id: '' })} />}
    </ >
  );
}

export default OperationCost;