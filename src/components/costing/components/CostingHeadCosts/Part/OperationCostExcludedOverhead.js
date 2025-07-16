import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import AddOperation from '../../Drawers/AddOperation';
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CRMHeads, EMPTY_DATA, EMPTY_GUID, MASS, maxCharsToShow } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isDataChange, setRMCCErrors, setSelectedIds } from '../../../actions/Costing';
import WarningMessagge from '../../../../common/WarningMessage'
import Popup from 'reactjs-popup';
import TooltipCustom from '../../../../common/Tooltip';
import { AcceptableOperationUOM, REMARKMAXLENGTH, STRINGMAXLENGTH, TEMPOBJECTOTHEROPERATION } from '../../../../../config/masterData';
import { number, decimalNumberLimit6, checkWhiteSpaces, noDecimal, numberLimit6 } from "../../../../../helper/validation";
import { swappingLogicCommon } from '../../../CostingUtil';
import Button from '../../../../layout/Button';
import ViewDetailedForms from '../../Drawers/ViewDetailedForms';
import { IsNFRContext } from '../../CostingDetailStepTwo';

let counter = 0;
function OperationCostExcludedOverhead(props) {
  const { item, rmFinishWeight, rmGrossWeight } = props;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  let dragEnd;

  const dispatch = useDispatch()
  const [gridData, setGridData] = useState(props.data ? props.data : [])
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [otherOperationRemark, setOtherOperationRemark] = useState(true)
  const [headerPinned, setHeaderPinned] = useState(true)
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, ErrorObjRMCC, currencySource, exchangeRateData } = useSelector(state => state.costing)
  const [openOperationForm, setOpenOperationForm] = useState(false)

  useEffect(() => {
    const Params = {
      index: 0,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    if (!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) {
      if (props.IsAssemblyCalculation) {
        props.setAssemblyOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false)
      } else {
        props.setOtherOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false)
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
      let QuantityMain = 1
      let rowArray = rowData && rowData.map(el => {
        if (el.UOMType === MASS) {
          QuantityMain = rmFinishWeight ? rmFinishWeight : 1
        } else {
          QuantityMain = el.Quantity
        }
        const WithLaboutCost = checkForNull(el.Rate) * checkForNull(QuantityMain);
        const WithOutLabourCost = el.IsLabourRateExist ? checkForNull(el.LabourRate) * el.LabourQuantity : 0;
        const OperationCost = WithLaboutCost + WithOutLabourCost;

        return {
          IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
          OtherOperationId: el.OperationId,
          OtherOperationName: el.OperationName,
          OtherOperationCode: el.OperationCode,
          Description: el?.Description,
          UOM: el.UnitOfMeasurement,
          Rate: el.Rate,
          Quantity: Number(QuantityMain),
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          OperationCost: OperationCost,
          IsOtherOperation: true,
          UOMType: el.UOMType,
          ConvertedExchangeRateId: el.ConvertedExchangeRateId === EMPTY_GUID ? null : el.ConvertedExchangeRateId,
          CurrencyExchangeRate: el.CurrencyExchangeRate
        }
      })
      let tempArr = [...GridArray, ...rowArray]
      tempArr && tempArr.map((el, index) => {
        setValue(`${OperationGridFields}.${index}.Quantity`, checkForDecimalAndNull(el.Quantity, initialConfiguration?.NoOfDecimalForInputOutput))
        return null
      })
      setGridData(tempArr)
      selectedIds(tempArr)
      dispatch(gridDataAdded(true))
    }
    setDrawerOpen(false)
  }

  const onRemarkPopUpClick = (index) => {
    setOtherOperationRemark(true)
    if (errors.OperationGridFields && errors.OperationGridFields[index]?.remarkPopUp !== undefined) {
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
    var button = document.getElementById(`popUppTriggerss${index}`)
    button.click()
  }


  const onCRMHeadChange = (e, index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      OtherOperationCRMHead: e?.label
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setGridData(tempArr)
  }

  const onRemarkPopUpClose = (index) => {
    var button = document.getElementById(`popUppTriggerss${index}`)
    if (errors && errors.OperationGridFields && errors.OperationGridFields[index].remarkPopUp) {
      delete errors.OperationGridFields[index].remarkPopUp;
      setOtherOperationRemark(false)
    }
    button.click()
  }

  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {
    let selectedId = Ids;
    if (tempArr && tempArr.length > 0) {
      tempArr && tempArr.map(el => {
        if (Ids.includes(el.OtherOperationId) === false) {
          selectedId.push(el.OtherOperationId)
          setIds(selectedId)
          dispatch(setSelectedIds(selectedId))
        }
        return null;
      })
    } else {
      dispatch(setSelectedIds([]))
    }
  }

  const deleteItem = (index, OperationId) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setIds(Ids && Ids.filter(item => item !== OperationId))
    setValue(`${OperationGridFields}.${index}.remarkPopUp`, '')
    setGridData(tempArr)
    tempArr && tempArr.map((el, i) => {
      setValue(`${OperationGridFields}.${i}.remarkPopUp`, el.Remark)
    })

    dispatch(setSelectedIds(Ids && Ids.filter(item => item !== OperationId)))
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
    let operationGridData = gridData[index]
    if (operationGridData.UOM === 'Number') {
      if (operationGridData.Quantity === '0') {
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
      return false
    }
    if (!isNaN(event.target.value) && event.target.value !== '') {
      const WithLaboutCost = checkForNull(tempData.Rate) * event.target.value;
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * tempData.LabourQuantity : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, Quantity: Number(event.target.value), OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    }
  }

  const handleLabourQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value) && event.target.value !== '') {
      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData.Quantity);
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * event.target.value : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, LabourQuantity: event.target.value, OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {

      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData.Quantity);
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * 0 : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, LabourQuantity: 0, OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      //Toaster.warning('Please enter valid number.')
      setTimeout(() => {
        setValue(`${OperationGridFields}[${index}]LabourQuantity`, 0)
      }, 200)
    }
  }

  const netCost = (item) => {
    const cost = (checkForNull(item.Rate) * checkForNull(item.Quantity)) + (checkForNull(item.LabourRate) * checkForNull(item.LabourQuantity));
    return checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice);
  }

  /**
   * @method setRMCCErrors
   * @description CALLING TO SET BOP COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
   */
  let temp = ErrorObjRMCC ? ErrorObjRMCC : {}
  if (Object.keys(errors).length > 0 && counter < 2) {
    temp.OperationGridFields = errors.OperationGridFields;
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

  const onDragComplete = (e) => {   //SWAPPING ROWS LOGIC FOR PROCESS
    let dragStart = e?.target?.title

    if (dragEnd && dragStart && (String(dragStart) !== String(dragEnd))) {

      let finalTemp = swappingLogicCommon(gridData, dragStart, dragEnd, e) //COMMON SWAPPING LOGIC
      setGridData(finalTemp)
      finalTemp && finalTemp.map((el, index) => {
        // Update field values
        setValue(`crmHeadOtherOperation${index}`, { label: el.OtherOperationCRMHead, value: index })
        return null
      })
    }
  }


  const OperationGridFields = 'OperationGridFields';
  const quantityTooltipText = <div>If the Operation is Welding, please enter <b>Welding Length/No. of Spot</b> <div>For all other Operatios, please enter the actual <b>Quantity</b>.</div></div>;

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="8">
              <div className="left-border">
                {'Other Operation Cost:'}
                <WarningMessagge dClass="ml-2 p-absolute" message="Following operation cost excluded from the conversion cost calculations" />
              </div>
            </Col>
            <Col md={'4'}>
              {(!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) &&
                <div>

                  <Button
                    id="Costing_addOtherOperation"
                    onClick={DrawerToggle}
                    icon={"plus"}
                    buttonName={"OTHER OPER"}
                  />
                </div>
              }
              <TooltipCustom customClass="mt-2 mr-2" id={`other-operation-defination`} width="350px" tooltipText={"'Other operations' are tasks or activities within a business process where the costs associated with overhead and profit are not taken into consideration when determining the financial outcomes or profitability."} />
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table cr-brdr-main costing-operation-cost-section p-relative" size="sm" onDragOver={onMouseLeave} onDragEnd={onDragComplete} >
                <thead className={`${initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure ? 'header-with-labour-rate' : 'header-without-labour-rate'} ${headerPinned ? 'sticky-headers' : ''}`}>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Operation Code`}</th>
                    <th>{`Description`}</th>
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
                            <td className='text-overflow'><span title={item.OtherOperationName + index} draggable={(CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ) ? false : true}>{item.OtherOperationName}</span> </td>
                            <td>{item.OtherOperationCode}</td>
                            <td>
                              {item?.Description?.length > maxCharsToShow && <TooltipCustom id={`item_other_cost_description${index}`} tooltipText={item?.Description} disabledIcon={true}/>}
                              <span id={`item_other_cost_description${index}`}>{item?.Description?.length > maxCharsToShow ? item?.Description.slice(0, maxCharsToShow) + '...' : item?.Description}</span>
                            </td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td>
                              {
                                <TextFieldHookForm
                                  label={false}
                                  name={`${OperationGridFields}[${index}].Quantity`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: true,
                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                  }}
                                  defaultValue={checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}
                                  className=""
                                  customClassName={'withBorder error-label mb-0'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleQuantityChange(e, index)
                                  }}
                                  errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].Quantity : ''}
                                  disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                />
                              }
                            </td>
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td>
                                {
                                  item.IsLabourRateExist ?
                                    <TextFieldHookForm
                                      label={false}
                                      name={`${OperationGridFields}[${index}].LabourQuantity`}
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
                                      errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].LabourQuantity : ''}
                                      disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                    />
                                    :
                                    '-'
                                }
                              </td>}
                            <td>{netCost(item)}</td>
                            {initialConfiguration?.IsShowCRMHead && <td>
                              <SearchableSelectHookForm
                                name={`crmHeadOtherOperation${index}`}
                                type="text"
                                label="CRM Head"
                                errors={`${errors.crmHeadOtherOperation}${index}`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: false,
                                }}
                                placeholder={'Select'}
                                customClassName="costing-selectable-dropdown"
                                defaultValue={item.OtherOperationCRMHead ? { label: item.OtherOperationCRMHead, value: index } : ''}
                                options={CRMHeads}
                                required={false}
                                handleChange={(e) => { onCRMHeadChange(e, index) }}
                                disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                              />
                            </td>}
                            <td>
                              <div className='action-btn-wrapper'>
                                <button title='Save' className="SaveIcon mb-0 align-middle" type={'button'} onClick={() => SaveItem(index)} />
                                <button title='Discard' className="CancelIcon mb-0 align-middle" type={'button'} onClick={() => CancelItem(index)} />
                              </div>
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OtherOperationName + index} draggable={(CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ) ? false : true} onClick={() => setOpenOperationForm({ isOpen: true, id: item.OtherOperationId })} className='link'>{item.OtherOperationName}</span> </td>
                            <td>{item.OtherOperationCode}</td>
                            <td>
                              {item?.Description?.length > maxCharsToShow && <TooltipCustom id={`item_other_cost_description${index}`} tooltipText={item?.Description} disabledIcon={true}/>}
                              <span id={`item_other_cost_description${index}`}>{item?.Description?.length > maxCharsToShow ? item?.Description.slice(0, maxCharsToShow) + '...' : item?.Description}</span>
                            </td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td>{checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>}
                            <td><div className='w-fit' id={`other-operation-cost${index}`}><TooltipCustom disabledIcon={true} id={`other-operation-cost${index}`} customClass="header-tooltip" tooltipText={initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure ? "Net Cost = (Rate * Quantity) + (Labour Rate * Labour Quantity)" : "Net Cost = (Rate * Quantity)"} />  {netCost(item)}</div></td>
                            {initialConfiguration?.IsShowCRMHead && <td>
                              <SearchableSelectHookForm
                                name={`crmHeadOtherOperation${index}`}
                                type="text"
                                label="CRM Head"
                                errors={`${errors.crmHeadOtherOperation}${index}`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: false,
                                }}
                                placeholder={'Select'}
                                customClassName="costing-selectable-dropdown"
                                defaultValue={item.OtherOperationCRMHead ? { label: item.OtherOperationCRMHead, value: index } : ''}
                                options={CRMHeads}
                                required={false}
                                handleChange={(e) => { onCRMHeadChange(e, index) }}
                                disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                              />
                            </td>}
                            <td>
                              <div className='action-btn-wrapper'>
                                {(!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) && <button title='Edit' className="Edit mb-0 align-middle" type={'button'} onClick={() => editItem(index)} />}
                                {(!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ) && <button title='Delete' className="Delete mb-0 align-middle" type={'button'} onClick={() => deleteItem(index, item.OtherOperationId)} />}
                                <Popup trigger={<button id={`popUppTriggerss${index}`} title="Remark" className="Comment-box align-middle" type={'button'} />}
                                  position="top right">
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${OperationGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      maxLength: otherOperationRemark && REMARKMAXLENGTH
                                    }}
                                    handleChange={(e) => { setOtherOperationRemark(true) }}
                                    defaultValue={item.Remark ?? item.Remark}
                                    className=""
                                    customClassName={"withBorder"}
                                    errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].remarkPopUp : ''}
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
      {
        isDrawerOpen && <AddOperation
          isOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
          Ids={Ids}
          isFromOtherOperation={true}
        />
      }
      {openOperationForm && <ViewDetailedForms data={openOperationForm} formName="Operation" cancel={() => setOpenOperationForm({ isOpen: false, id: '' })} />}
    </ >
  );
}

export default OperationCostExcludedOverhead;