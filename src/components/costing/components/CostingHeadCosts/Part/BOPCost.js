import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import AddBOP from '../../Drawers/AddBOP';
import { SearchableSelectHookForm, TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CRMHeads, EMPTY_DATA, EMPTY_GUID } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, decimalAndNumberValidationBoolean, getConfigurationKey, NoSignNoDecimalMessage, showBopLabel } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isDataChange, setRMCCErrors } from '../../../actions/Costing';
import { INR } from '../../../../../config/constants';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';
import TooltipCustom from '../../../../common/Tooltip';
import { number, decimalNumberLimit6, percentageLimitValidation, checkWhiteSpaces, numberLimit6, noDecimal, isNumber } from "../../../../../helper/validation";
import Button from '../../../../layout/Button';
import TourWrapper from '../../../../common/Tour/TourWrapper';
import { Steps } from '../../TourMessages';
import { useTranslation } from 'react-i18next';
import { reactLocalStorage } from 'reactjs-localstorage';
import { REMARKMAXLENGTH } from '../../../../../config/masterData';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { IsNFRContext } from '../../CostingDetailStepTwo';
import { isLockRMAndBOPForCostAppliacabilityProcess } from '../../../CostingUtil';

let counter = 0;
function BOPCost(props) {
  const { item, data } = props;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const { register, handleSubmit, control, formState: { errors }, setValue, clearErrors, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      BOPHandlingPercentage: item?.CostingPartDetails?.BOPHandlingPercentage,
      BOPHandlingCharges: item?.CostingPartDetails?.BOPHandlingCharges,         // TEST
      // BOPHandlingFixed: item?.CostingPartDetails?.BOPHandlingFixed,
    }
  });

  const dispatch = useDispatch()

  const [gridData, setGridData] = useState(data)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [IsApplyBOPHandlingCharges, setIsApplyBOPHandlingCharges] = useState(item?.CostingPartDetails?.IsApplyBOPHandlingCharges)
  const [oldGridData, setOldGridData] = useState(data)
  const [BOPHandlingType, setBOPHandlingType] = useState(item?.CostingPartDetails?.BOPHandlingChargeType)
  const [fixedLimit, setFixedLimit] = useState(false)
  const [headerPinned, setHeaderPinned] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [singleProcessRemark, setSingleProcessRemark] = useState(true)
  const [remarkAccept, setRemarkAccept] = useState(false)
  const [currentRemarkIndex, setCurrentRemarkIndex] = useState(null)
  const [remark, setRemark] = useState("")
  const [tourState, setTourState] = useState(
    {
      steps: []
    }
  )
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, ErrorObjRMCC } = useSelector(state => state.costing)
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext);
  const { t } = useTranslation("Costing")
  const { currencySource, exchangeRateData } = useSelector((state) => state?.costing);
  const processArr = item && Object.keys(item).length>0 ? item?.CostingPartDetails?.CostingConversionCost?.CostingProcessCostResponse:[]
  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      let totalBOPCost = netBOPCost(gridData)
      let bopHandlingPercentage = BOPHandlingType === 'Percentage' ? item?.CostingPartDetails?.BOPHandlingPercentage : 0
      let BOPHandlingCharges = BOPHandlingType === 'Percentage' ? calculatePercentageValue(totalBOPCost, bopHandlingPercentage) : item?.CostingPartDetails?.BOPHandlingCharges
      setValue('BOPHandlingType', item?.CostingPartDetails?.BOPHandlingChargeType ? { label: item?.CostingPartDetails?.BOPHandlingChargeType, value: item?.CostingPartDetails?.BOPHandlingChargeType } : {})
      if (BOPHandlingType === 'Percentage') {
        setValue('BOPHandlingCharges', checkForDecimalAndNull((gridData?.length !== 0) ? calculatePercentageValue(totalBOPCost, bopHandlingPercentage) : 0, initialConfiguration?.NoOfDecimalForPrice))
        setValue('BOPHandlingPercentage', checkForDecimalAndNull(((gridData?.length !== 0) ? bopHandlingPercentage : 0), initialConfiguration?.NoOfDecimalForPrice))
      } else {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(((gridData?.length !== 0) ? item?.CostingPartDetails?.BOPHandlingCharges : 0), initialConfiguration?.NoOfDecimalForPrice))
        setValue('BOPHandlingFixed', checkForDecimalAndNull(((gridData?.length !== 0) ? item?.CostingPartDetails?.BOPHandlingCharges : 0), initialConfiguration?.NoOfDecimalForPrice))
      }
      if (!CostingViewMode && !IsLocked) {
        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
          BOPHandlingPercentage: bopHandlingPercentage,
          BOPHandlingCharges: gridData?.length !== 0 ? BOPHandlingCharges : 0,
          // BOPHandlingFixed: (gridData?.length !== 0 && BOPHandlingType === 'Fixed') ? item?.CostingPartDetails?.BOPHandlingFixed : 0,
          BOPHandlingChargeType: BOPHandlingType
        }

        if (gridData?.length === 0) {
          setIsApplyBOPHandlingCharges(false)
        }
        
        props.setBOPCost(gridData, Params, item, BOPHandlingFields)
        if (JSON.stringify(gridData) !== JSON.stringify(oldGridData)) {
          dispatch(isDataChange(true))
        }
      }
    }, 100)
    selectedIds(gridData)
  }, [gridData]);

  /**
   * @method netBOPCost
   * @description GET BOP COST
   */
  const netBOPCost = (grid) => {
    let NetCost = 0
    NetCost = grid && grid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetBoughtOutPartCost)
    }, 0)
    return NetCost
  }

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
  const closeDrawer = (e = '', rowData = []) => {

    if (rowData.length > 0) {

      let rowArray = rowData && rowData.map(el => {
        return {
          BoughtOutPartId: el.BoughtOutPartId,
          BOPPartNumber: el.BoughtOutPartNumber,
          BOPPartName: el.BoughtOutPartName,
          Currency: el.Currency !== '-' ? el.Currency : INR,
          LandedCostINR: el.NetLandedCost,
          Quantity: 1,
          NetBoughtOutPartCost: el.NetLandedCost,
          BoughtOutPartUOM: el.UOM,
          ConvertedExchangeRateId: el.ConvertedExchangeRateId === EMPTY_GUID ? null : el.ConvertedExchangeRateId,
          CurrencyExchangeRate: el.CurrencyExchangeRate
        }
      })

      let tempArr = [...gridData, ...rowArray]
      tempArr && tempArr.map((el, index) => {
        setValue(`${bopGridFields}.${index}.Quantity`, el.Quantity)
        return null
      })
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
    tempArr && tempArr.map(el => {
      if (Ids.includes(el.BoughtOutPartId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.BoughtOutPartId)
        setIds(selectedIds)
      }
      return null;
    })
  }

  const deleteItem = (index) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)

    let selectedIds = []
    tempArr.map(el => (selectedIds.push(el.BoughtOutPartId)))
    setIds(selectedIds)
    if (tempArr?.length === 0) {

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
    if (errors?.bopGridFields && (errors?.bopGridFields[index]?.Quantity !== undefined && Object.keys(errors?.bopGridFields[index]?.Quantity).length !== 0)) {
      return false
    }
    let bopGridData = gridData[index]
    if (gridData && gridData.filter(e => e?.Quantity === 0)?.length > 0) {
      Toaster.warning('Quantity cannot be zero')
      return false
    }
    if (bopGridData.BoughtOutPartUOM === 'Number') {

      let isValid = Number.isInteger(bopGridData.Quantity);
      if (bopGridData.Quantity === 0) {
        Toaster.warning('Number should not be zero')
        return false
      }
      if (!isValid) {
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
    setValue(`${bopGridFields}.${index}.Quantity`, tempArr[index]?.Quantity)
    errors.bopGridFields = {}
  }

  const handleQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value) && event.target.value !== '') {
      const NetBoughtOutPartCost = tempData.LandedCostINR * checkForNull(event.target.value);
      tempData = { ...tempData, Quantity: checkForNull(event.target.value), NetBoughtOutPartCost: NetBoughtOutPartCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    }
  }

  const onCRMHeadChange = (e, index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      BoughtOutPartCRMHead: e?.label
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setGridData(tempArr)
  }

  /**
  * @method onPressApplyBOPCharges
  * @description ON PRESS APPLY BOP HANDLING CHARGES
  */
  const onPressApplyBOPCharges = () => {
    setIsApplyBOPHandlingCharges(!IsApplyBOPHandlingCharges)
    setValue('BOPHandlingPercentage', 0)
    setValue('BOPHandlingCharges', 0)
    setValue('BOPHandlingFixed', 0)

    let bopHandlingPercentage = item?.CostingPartDetails?.BOPHandlingPercentage
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      let totalBOPCost = netBOPCost(gridData)

      if (BOPHandlingType === 'Percentage') {
        if (bopHandlingPercentage > 100) {
          setValue('BOPHandlingPercentage', 0)
          setValue('BOPHandlingCharges', 0)
          return false;
        }
        setValue('BOPHandlingCharges', checkForDecimalAndNull(calculatePercentageValue(netBOPCost(gridData), bopHandlingPercentage), initialConfiguration?.NoOfDecimalForPrice))
        setValue('BOPHandlingPercentage', checkForDecimalAndNull(item?.CostingPartDetails?.BOPHandlingPercentage, initialConfiguration?.NoOfDecimalForPrice))     //////////
      } else {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(item?.CostingPartDetails?.BOPHandlingCharges, initialConfiguration?.NoOfDecimalForPrice))     //////////
        setValue('BOPHandlingFixed', checkForDecimalAndNull(item?.CostingPartDetails?.BOPHandlingCharges, initialConfiguration?.NoOfDecimalForPrice))     //////////
      }
      if (!CostingViewMode && !IsLocked) {
        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: !IsApplyBOPHandlingCharges,
          BOPHandlingPercentage: bopHandlingPercentage,
          BOPHandlingCharges: BOPHandlingType === 'Percentage' ? calculatePercentageValue(totalBOPCost, bopHandlingPercentage) : item?.CostingPartDetails?.BOPHandlingCharges,         // TEST
          BOPHandlingFixed: (gridData?.length !== 0 && BOPHandlingType === 'Fixed') ? item?.CostingPartDetails?.BOPHandlingCharges : 0,
          BOPHandlingChargeType: BOPHandlingType
        }
        
        props.setBOPCost(gridData, Params, item, BOPHandlingFields)
      }
    }, 100)


    dispatch(isDataChange(true))
  }

  /**
  * @method handleBOPPercentageChange
  * @description HANDLE BOP % CHANGE
  */
  const handleBOPPercentageChange = (value) => {
    if (!isNaN(value)) {
      let BOPHandling = 0
      if (BOPHandlingType === 'Percentage') {
        BOPHandling = calculatePercentageValue(netBOPCost(gridData), value)
      } else {
        let message = ''
        if (decimalAndNumberValidationBoolean(value)) {
          setFixedLimit(true)
          errors.BOPHandlingPercentage = {
            "type": "max",
            "message": "Percentage cannot be greater than 100",
            "ref": {
              "name": "BOPHandlingPercentage",
              "value": ""
            }
          }
          message = MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE
        } else {
          setFixedLimit(false)
          errors.BOPHandlingPercentage = {}
          message = ''
        }
        BOPHandling = value
        setErrorMessage(message)
      }
      setValue('BOPHandlingCharges', checkForDecimalAndNull(BOPHandling, initialConfiguration?.NoOfDecimalForPrice))
      setTimeout(() => {
        const Params = {
          BOMLevel: item.BOMLevel,
          PartNumber: item.PartNumber,
        }

        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
          BOPHandlingPercentage: BOPHandlingType === 'Percentage' ? value : 0,
          BOPHandlingCharges: BOPHandling,         // TEST
          // BOPHandlingFixed: (gridData?.length !== 0 && BOPHandlingType === 'Fixed') ? value : 0,
          BOPHandlingChargeType: BOPHandlingType
        }
        if (!CostingViewMode && !IsLocked) {
          
          props.setBOPCost(gridData, Params, item, BOPHandlingFields)
          dispatch(isDataChange(true))
        }

      }, 200)

    } else {
      let message = ''
      if (!isNumber(value)) {
        setFixedLimit(true)
        errors.BOPHandlingPercentage = {
          "type": "max",
          "message": "Percentage cannot be greater than 100",
          "ref": {
            "name": "BOPHandlingPercentage",
            "value": ""
          }
        }
        message = NoSignNoDecimalMessage
      } else {
        errors.BOPHandlingPercentage = {}
        setFixedLimit(false)
        message = ''
      }
      setErrorMessage(message)
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {
    if (label === 'BOPHandlingType') {
      return [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Percentage', value: 'Percentage' },
      ];
    }
  }

  /**
    * @method handleBOPHandlingType
    * @description  HANDLE OTHER COST TYPE CHANGE
    */
  const handleBOPHandlingType = (newValue) => {
    setFixedLimit(false)
    setTimeout(() => {
      setBOPHandlingType(newValue?.label)
      setValue('BOPHandlingPercentage', '')
      setValue('BOPHandlingFixed', '')
      setValue('BOPHandlingCharges', 0)
    }, 200);
    const Params = {
      index: props.index,
      BOMLevel: props.item?.BOMLevel,
      PartNumber: props.item?.PartNumber,
    }
    const BOPHandlingFields = {
      IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
      BOPHandlingPercentage: 0,
      BOPHandlingCharges: 0,
      // BOPHandlingFixed: 0,
      BOPHandlingChargeType: newValue?.label
    }
    
    props.setBOPCost(gridData, Params, item, BOPHandlingFields)
    clearErrors('');
  }

  const bopGridFields = 'bopGridFields';
  
  /**
   * @method popupInputData
   * @description Handle input data from the popup
   */
  const popupInputData = (data) => {
    setRemark(data);
  };

  /**
   * @method onRemarkButtonClick
   * @description Open remark popup for a specific BOP item
   */
  const onRemarkButtonClick = (index) => {
    setCurrentRemarkIndex(index);
    setRemark(gridData[index]?.Remark || "");
    setRemarkAccept(true);
  };

  /**
   * @method onRemarkPopUpClose
   * @description Handle remark popup close
   */
  const onRemarkPopUpClose = () => {
    setRemarkAccept(false);
    setCurrentRemarkIndex(null);
    setRemark("");
    if (errors && errors?.bopGridFields && currentRemarkIndex !== null && errors.bopGridFields[currentRemarkIndex]?.remarkPopUp) {
      delete errors.bopGridFields[currentRemarkIndex].remarkPopUp;
      setSingleProcessRemark(false);
    }
  };

  /**
   * @method handleRemarkPopupConfirm
   * @description Handle remark popup confirm
   */
  const handleRemarkPopupConfirm = () => {
    if (currentRemarkIndex === null) {
      onRemarkPopUpClose();
      return;
    }
    
    let tempData = gridData[currentRemarkIndex];
    tempData = {
      ...tempData,
      Remark: remark,
    };

    let gridTempArr = Object.assign([...gridData], { [currentRemarkIndex]: tempData });
    setGridData(gridTempArr);

    if (remark) {
      Toaster.success('Remark saved successfully');
    }
    
    onRemarkPopUpClose();
  };

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }
  /**
   * @method setRMCCErrors
   * @description CALLING TO SET BOP COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
   */

  let temp = ErrorObjRMCC ? ErrorObjRMCC : {}
  if (Object.keys(errors).length > 0 && counter < 2) {
    temp.bopGridFields = errors.bopGridFields;
    dispatch(setRMCCErrors(temp))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    temp.bopGridFields = {};
    dispatch(setRMCCErrors(temp))
    counter = 0
  }

  const tourStart = () => {

  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">
                {`${showBopLabel()} Cost:`}{gridData && gridData.length !== 0 &&
                  <TourWrapper
                    buttonSpecificProp={{ id: "Costing_RM_Cost", onClick: tourStart }}
                    stepsSpecificProp={{
                      steps: Steps(t).BOP_COST
                    }} />}
              </div>
            </Col>
            <Col md={'2'}>
              {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) &&
                <Button
                  id="Costing_addBOP"
                  onClick={DrawerToggle}
                  icon={"plus"}
                  buttonName={`${showBopLabel()}`}
                />}
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>
              {/*BOP COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-bop-cost-section p-relative" size="sm" >
                  <thead className={`${headerPinned ? 'sticky-headers' : ''} table-header`}>
                    <tr>
                      <th>{`${showBopLabel()} Part No.`}</th>
                      <th>{`${showBopLabel()} Part Name`}</th>
                      <th>{`UOM`}</th>
                      <th>{`${showBopLabel()} Cost (${currencySource?.label ? currencySource?.label : initialConfiguration?.BaseCurrency})`}</th>
                      <th>{`Quantity`}</th>
                      <th>{`Net ${showBopLabel()} Cost`}</th>
                      {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                      <th><div className='pin-btn-container'><span>Action</span><button onClick={() => setHeaderPinned(!headerPinned)} className='pinned' title={headerPinned ? 'pin' : 'unpin'}><div className={`${headerPinned ? '' : 'unpin'}`}></div></button></div></th>
                    </tr>
                  </thead>
                  <tbody className='rm-table-body'>
                    {
                      gridData &&
                      gridData.map((item, index) => {
                        return (
                          editIndex === index ?
                            <tr key={index}>
                              <td className='text-overflow'><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span></td>
                              <td className='text-overflow'><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                              <td>{item.BoughtOutPartUOM}</td>
                              <td>{checkForDecimalAndNull(item.LandedCostINR, initialConfiguration?.NoOfDecimalForPrice)}</td>
                              <td style={{ width: 200 }}>
                                {
                                  item.BoughtOutPartUOM === 'Number' ?
                                    <>
                                      <TextFieldHookForm
                                        label={false}
                                        name={`${bopGridFields}.${index}.Quantity`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                          validate: { number, checkWhiteSpaces, noDecimal, numberLimit6 },
                                        }}
                                        defaultValue={item.Quantity}
                                        className=""
                                        customClassName={'withBorder error-label'}
                                        handleChange={(e) => {
                                          e.preventDefault()
                                          handleQuantityChange(e, index)
                                        }}
                                        errors={errors && errors.bopGridFields && errors.bopGridFields[index] !== undefined ? errors.bopGridFields[index].Quantity : ''}
                                        disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                      />
                                    </>
                                    :
                                    <TextFieldHookForm
                                      label={false}
                                      name={`${bopGridFields}.${index}.Quantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                      }}
                                      defaultValue={item.Quantity}
                                      className=""
                                      customClassName={'withBorder error-label'}
                                      handleChange={(e) => {
                                        e.preventDefault()
                                        handleQuantityChange(e, index)
                                      }}
                                      errors={errors && errors.bopGridFields && errors.bopGridFields[index] !== undefined ? errors.bopGridFields[index].Quantity : ''}
                                      disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                                    />
                                }
                              </td>
                              <td><div className='w-fit' id={`bop-cost${index}`}><TooltipCustom disabledIcon={true} id={`bop-cost${index}`} tooltipText={`Net ${showBopLabel()} Cost = (${showBopLabel()} Cost * Quantity)`} />{item.NetBoughtOutPartCost !== undefined ? checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</div></td>
                              {initialConfiguration?.IsShowCRMHead && <td>
                                <SearchableSelectHookForm
                                  name={`crmHeadBop${index}`}
                                  type="text"
                                  label="CRM Head"
                                  errors={`${errors.crmHeadBop}${index}`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: false,
                                  }}
                                  defaultValue={item.BoughtOutPartCRMHead ? { label: item.BoughtOutPartCRMHead, value: index } : ''}
                                  placeholder={'Select'}
                                  customClassName="costing-selectable-dropdown"
                                  options={CRMHeads}
                                  required={false}
                                  handleChange={(e) => { onCRMHeadChange(e, index) }}
                                  disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                                />
                              </td>}
                              <td>
                                <div className='action-btn-wrapper'>
                                  {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && <button title='Save' className="SaveIcon" type={'button'} onClick={() => SaveItem(index)} />}
                                  {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && <button title='Discard' className="CancelIcon" type={'button'} onClick={() => CancelItem(index)} />}
                                  <button id={`bop_remark_btn_${index}`} title="Remark" className="Comment-box" type='button' onClick={() => onRemarkButtonClick(index)} />
                                </div>
                              </td>
                            </tr>
                            :
                            <tr key={index}>
                              <td className='text-overflow'><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span> </td>
                              <td className='text-overflow'><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                              <td>{item.BoughtOutPartUOM}</td>
                              <td>{item.LandedCostINR ? checkForDecimalAndNull(item.LandedCostINR, initialConfiguration?.NoOfDecimalForPrice) : ''}</td>
                              <td style={{ width: 200 }}>{checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                              <td><div className='w-fit' id={`bop-cost${index}`}><TooltipCustom disabledIcon={true} id={`bop-cost${index}`} tooltipText={`Net ${showBopLabel()} Cost = (${showBopLabel()} Cost * Quantity)`} />{item.NetBoughtOutPartCost ? checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</div></td>
                              {initialConfiguration?.IsShowCRMHead && <td>
                                <SearchableSelectHookForm
                                  name={`crmHeadBop${index}`}
                                  type="text"
                                  label="CRM Head"
                                  errors={`${errors.crmHeadBop}${index}`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: false,
                                  }}
                                  defaultValue={item.BoughtOutPartCRMHead ? { label: item.BoughtOutPartCRMHead, value: index } : ''}
                                  placeholder={'Select'}
                                  customClassName="costing-selectable-dropdown"
                                  options={CRMHeads}
                                  required={false}
                                  handleChange={(e) => { onCRMHeadChange(e, index) }}
                                  disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                                />
                              </td>}
                              <td>
                                <div className='action-btn-wrapper'>
                                  {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) && <button title='Edit' id={`bopCost_edit${index}`} className="Edit" type={'button'} onClick={() => editItem(index)} />}
                                   {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) && <button title='Delete' id={`bopCost_delete${index}`} className="Delete " type={'button'} onClick={() => deleteItem(index)} />} 
                                  <button id={`bop_remark_btn_${index}`} title="Remark" className="Comment-box" type='button' onClick={() => onRemarkButtonClick(index)} />
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
            <Row className='handling-charge'>
              <div className="pl-3">
                <span className="d-inline-block" id="bop_handling_charge">
                  <label
                    className={`custom-checkbox mb-0`}
                    onChange={onPressApplyBOPCharges}
                  >
                    Apply {showBopLabel()} Handling Charges
                    <input
                      type="checkbox"
                      checked={IsApplyBOPHandlingCharges}
                      disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsApplyBOPHandlingCharges}
                      onChange={onPressApplyBOPCharges}
                    />
                  </label>
                </span>
              </div>
              {IsApplyBOPHandlingCharges &&
                <Col md="2" >
                  <SearchableSelectHookForm
                    label={`${showBopLabel()} Handling Type`}
                    name={"BOPHandlingType"}
                    placeholder={"Select"}
                    Controller={Controller}
                    control={control}
                    rules={{ required: false }}
                    register={register}
                    // defaultValue={BOPHandlingType.length !== 0 ? BOPHandlingType : ""}
                    options={renderListing("BOPHandlingType")}
                    mandatory={false}
                    handleChange={handleBOPHandlingType}
                    errors={errors.BOPHandlingType}
                    disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                    isClearable={true}
                  />
                </Col>}
              {IsApplyBOPHandlingCharges && BOPHandlingType &&
                <Col md="2" >
                  {BOPHandlingType === 'Fixed' ?
                    <div className='p-relative error-wrapper'>
                      <TextFieldHookForm
                        label={'Fixed'}
                        name={"BOPHandlingFixed"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: true,
                          pattern: {
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.'
                          }
                        }}
                        handleChange={(e) => {
                          e.preventDefault();
                          handleBOPPercentageChange(e.target.value);
                        }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        // errors={errors.BOPHandlingPercentage}
                        disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                      />
                      {fixedLimit && <WarningMessage dClass={"error-message fixed-error"} message={errorMessage} />}           {/* //MANUAL CSS FOR ERROR VALIDATION MESSAGE */}
                    </div>
                    :
                    <TextFieldHookForm
                      label={'Percentage'}
                      name={"BOPHandlingPercentage"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                        max: {
                          value: 100,
                          message: 'Percentage cannot be greater than 100'
                        },
                      }}
                      disableErrorOverflow={true}
                      handleChange={(e) => {
                        e.preventDefault();
                        handleBOPPercentageChange(e.target.value);
                      }}
                      defaultValue={""}
                      className=""
                      customClassName={"withBorder"}
                      errors={errors.BOPHandlingPercentage}
                      disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                    />}
                </Col>
              }

              {IsApplyBOPHandlingCharges &&
                <Col md="2">
                  {BOPHandlingType !== 'Fixed' && <TooltipCustom disabledIcon={true} id={'bop-handling-charges'} tooltipText={`Handling Charges = Net ${showBopLabel()} Cost * Percentage / 100`} />}
                  <TextFieldHookForm
                    label="Handling Charges"
                    name={'BOPHandlingCharges'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{}}
                    handleChange={() => { }}
                    defaultValue={""}
                    className=""
                    id={'bop-handling-charges'}
                    customClassName={'withBorder'}
                    errors={errors.BOPHandlingCharges}
                    disabled={true}
                  />
                </Col>}

            </Row>
          </form>
        </div>
      </div >
      {remarkAccept && 
        <PopupMsgWrapper
          setInputData={popupInputData}
          isOpen={remarkAccept}
          closePopUp={onRemarkPopUpClose}
          confirmPopup={handleRemarkPopupConfirm}
          header={"Remark"}
          isInputField={true}
          defaultValue={remark}
          isDisabled={IsLocked || CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
        />
      }
      {isDrawerOpen && <AddBOP
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        Ids={Ids}
      />}
    </ >
  );
}

export default BOPCost;