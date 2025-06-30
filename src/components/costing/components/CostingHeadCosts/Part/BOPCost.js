import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import AddBOP from '../../Drawers/AddBOP';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CRMHeads, EMPTY_DATA, EMPTY_GUID } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, loggedInUserId, NoSignNoDecimalMessage, showBopLabel, showDifferentBOPType } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isDataChange, setRMCCErrors } from '../../../actions/Costing';
import { INR } from '../../../../../config/constants';
import WarningMessage from '../../../../common/WarningMessage';
import TooltipCustom from '../../../../common/Tooltip';
import { number, decimalNumberLimit6, percentageLimitValidation, checkWhiteSpaces, numberLimit6, noDecimal, isNumber } from "../../../../../helper/validation";
import Button from '../../../../layout/Button';
import TourWrapper from '../../../../common/Tour/TourWrapper';
import { Steps } from '../../TourMessages';
import { useTranslation } from 'react-i18next';
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { IsNFRContext } from '../../CostingDetailStepTwo';
import { isLockRMAndBOPForCostAppliacabilityProcess } from '../../../CostingUtil';
import BOPHandlingDrawer from './BOPHandlingDrawer';
import { saveBOPHandlingChargesDetails, setBopAddEditDeleteDisable } from '../../../actions/CostWorking';
import { feTurbulence } from 'react-dom-factories';

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
  const [headerPinned, setHeaderPinned] = useState(true)
  const [singleProcessRemark, setSingleProcessRemark] = useState(true)
  const [remarkAccept, setRemarkAccept] = useState(false)
  const [currentRemarkIndex, setCurrentRemarkIndex] = useState(null)
  const [remark, setRemark] = useState("")
  const [tourState, setTourState] = useState(
    {
      steps: []
    }
  )
  const [state, setState] = useState({
    openBOPHandlingDrawer: false,
    totalBOPHandlingCharges: item?.CostingPartDetails?.BOPHandlingCharges,
    showHandlingWarning: false,
    bopDomesticCost: checkForNull(item?.CostingPartDetails?.NetBOPDomesticCost),
    bopCKDCost: checkForNull(item?.CostingPartDetails?.NetBOPImportCost),
    bopV2VCost: checkForNull(item?.CostingPartDetails?.NetBOPSourceCost),
    bopOSPCost: checkForNull(item?.CostingPartDetails?.NetBOPOutsourcedCost),
    bopDomesticHandlingCost: item?.CostingPartDetails?.NetBOPDomesticHandlingCost,
    bopCKDHandlingCost: item?.CostingPartDetails?.NetBOPImportHandlingCost,
    bopV2VHandlingCost: item?.CostingPartDetails?.NetBOPSourceHandlingCost,
    bopOSPHandlingCost: item?.CostingPartDetails?.NetBOPOutsourcedHandlingCost,
  })
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, ErrorObjRMCC } = useSelector(state => state.costing)
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext);
  const { t } = useTranslation("Costing")
  const { currencySource, exchangeRateData } = useSelector((state) => state?.costing);
  const processArr = item && Object.keys(item).length > 0 ? item?.CostingPartDetails?.CostingConversionCost?.CostingProcessCostResponse : []
  const { bopAddEditDeleteDisable } = useSelector(state => state.costWorking)

  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      setValue('BOPHandlingCharges', checkForDecimalAndNull(state.totalBOPHandlingCharges, initialConfiguration?.NoOfDecimalForPrice))
      setValue('bopDomesticHandlingCharges', checkForDecimalAndNull(state.bopDomesticHandlingCost, initialConfiguration?.NoOfDecimalForPrice))
      setValue('bopCKDHandlingCharges', checkForDecimalAndNull(state.bopCKDHandlingCost, initialConfiguration?.NoOfDecimalForPrice))
      setValue('bopV2VHandlingCharges', checkForDecimalAndNull(state.bopV2VHandlingCost, initialConfiguration?.NoOfDecimalForPrice))
      setValue('bopOSPHandlingCharges', checkForDecimalAndNull(state.bopOSPHandlingCost, initialConfiguration?.NoOfDecimalForPrice))
      if (!CostingViewMode && !IsLocked) {


        if (gridData?.length === 0) {
          setIsApplyBOPHandlingCharges(false);
          setValue('BOPHandlingCharges', 0)
          setState(prevState => ({
            ...prevState,
            bopDomesticCost: 0,
            bopCKDCost: 0,
            bopV2VCost: 0,
            bopOSPCost: 0
          }));
        } else {
          // Initialize variables outside the loop
          let bopDomesticCost = 0;
          let bopCKDCost = 0;
          let bopV2VCost = 0;
          let bopOSPCost = 0;
          let bopDomesticHandling=IsApplyBOPHandlingCharges ? checkForNull(state.bopDomesticHandlingCost) : 0
          let bopCKDHandling=IsApplyBOPHandlingCharges ? checkForNull(state.bopCKDHandlingCost) : 0
          let bopV2Vhandling=IsApplyBOPHandlingCharges ? checkForNull(state.bopV2VHandlingCost) : 0
          let bopOSPHandling=IsApplyBOPHandlingCharges ? checkForNull(state.bopOSPHandlingCost) : 0

          gridData.forEach(el => {
            const cost = el.NetBoughtOutPartCost || 0;
            switch (el.BOPType) {
              case "BOP Domestic":
                bopDomesticCost += cost  ;
                break;
              case "BOP CKD":
                bopCKDCost += cost;
                break;
              case "BOP V2V":
                bopV2VCost += cost;
                break;
              case "BOP OSP":
                bopOSPCost += cost;
                break;
              default:
                break;
            }
          });
       
          setState(prevState => ({
            ...prevState,
            bopDomesticCost: checkForNull(bopDomesticCost) + bopDomesticHandling,
            bopCKDCost: bopCKDCost + bopCKDHandling,
            bopV2VCost: bopV2VCost + bopV2Vhandling,
            bopOSPCost: bopOSPCost + bopOSPHandling
          }));
        }
        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
          BOPHandlingCharges: state.totalBOPHandlingCharges,
          NetBOPDomesticHandlingCost: state.bopDomesticHandlingCost,
          NetBOPImportHandlingCost: state.bopCKDHandlingCost,
          NetBOPSourceHandlingCost: state.bopV2VHandlingCost,
          NetBOPOutsourcedHandlingCost: state.bopOSPHandlingCost
        }
        props.setBOPCost(gridData, Params, item, BOPHandlingFields)
        if (JSON.stringify(gridData) !== JSON.stringify(oldGridData)) {
          dispatch(isDataChange(true))
        }
      }
    }, 100)
    selectedIds(gridData)
    if (IsApplyBOPHandlingCharges && gridData && gridData?.length > 0) {

      dispatch(setBopAddEditDeleteDisable(true))
    } else if (!IsApplyBOPHandlingCharges && gridData && gridData?.length > 0) {
      let data = {
        "BaseCostingId": item?.CostingId,
        "LoggedInUserId": loggedInUserId(),
        "CostingPartWiseDetailsId": item?.CostingPartDetails?.CostingDetailId,
        "CostingBoughtOutPartHandlingCharges": []
      }
      dispatch(saveBOPHandlingChargesDetails(data, (res) => { }))
      setValue('BOPHandlingCharges', 0)

      setState(prevState => ({
        ...prevState,
        bopDomesticCost: state.bopDomesticCost - state.bopDomesticHandlingCost,
        bopCKDCost: state.bopCKDCost - state.bopCKDHandlingCost,
        bopV2VCost: state.bopV2VCost - state.bopV2VHandlingCost,
        bopOSPCost: state.bopOSPCost - state.bopOSPHandlingCost,
        totalBOPHandlingCharges: 0,
        bopDomesticHandlingCost: 0,
        bopCKDHandlingCost: 0,
        bopV2VHandlingCost: 0,
        bopOSPHandlingCost: 0,
      }))

      dispatch(setBopAddEditDeleteDisable(false))
    } else if (!IsApplyBOPHandlingCharges && gridData && gridData?.length === 0) {
      dispatch(setBopAddEditDeleteDisable(false))
    }
  }, [gridData, IsApplyBOPHandlingCharges]);


  /**1
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
          CurrencyExchangeRate: el.CurrencyExchangeRate,
          BOPType: el.BOPType
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
    // Filter out the item at the given index
    const tempArr = gridData.filter((_, i) => i !== index);
    setGridData(tempArr);

    // Update selected IDs
    const selectedIds = tempArr.map(el => el.BoughtOutPartId);
    setIds(selectedIds);
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
    setValue('BOPHandlingCharges', 0)

    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      if (!CostingViewMode && !IsLocked) {
        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: !IsApplyBOPHandlingCharges,
          BOPHandlingCharges: state.totalBOPHandlingCharges,
          NetBOPDomesticHandlingCost: state.bopDomesticHandlingCost,
          NetBOPImportHandlingCost: state.bopCKDHandlingCost,
          NetBOPSourceHandlingCost: state.bopV2VHandlingCost,
          NetBOPOutsourcedHandlingCost: state.bopOSPHandlingCost
        }

        props.setBOPCost(gridData, Params, item, BOPHandlingFields)
      }
    }, 100)


    dispatch(isDataChange(true))
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
  const addBOPHandlingCharges = () => {
    setState(prev => ({
      ...prev,
      openBOPHandlingDrawer: true
    }))
  }
  const closeBOPHandlingDrawer = (type, totalBOPHandlingCharges, tableData) => {
    // Get handling charges for each BOP type from the new tableData
    const bopDomesticHandling = tableData?.find(item => item.BOPType === 'BOP Domestic')?.BOPHandlingCharges || 0;
    const bopCKDHandling = tableData?.find(item => item.BOPType === 'BOP CKD')?.BOPHandlingCharges || 0;
    const bopV2VHandling = tableData?.find(item => item.BOPType === 'BOP V2V')?.BOPHandlingCharges || 0;
    const bopOSPHandling = tableData?.find(item => item.BOPType === 'BOP OSP')?.BOPHandlingCharges || 0;

    // Calculate total costs by adding base cost and handling charges
    // Base costs come from state but exclude previous handling charges
    const bopDomesticCost = (state?.bopDomesticCost - state?.bopDomesticHandlingCost) + checkForNull(bopDomesticHandling);
    const bopCKDCost = (state?.bopCKDCost - state?.bopCKDHandlingCost) + checkForNull(bopCKDHandling);
    const bopV2VCost = (state?.bopV2VCost - state?.bopV2VHandlingCost) + checkForNull(bopV2VHandling);
    const bopOSPCost = (state?.bopOSPCost - state?.bopOSPHandlingCost) + checkForNull(bopOSPHandling);

    // Set form values
    setValue('bopCKDHandlingCharges', checkForDecimalAndNull(bopCKDHandling, initialConfiguration.NoOfDecimalForPrice));
    setValue('bopDomesticHandlingCharges', checkForDecimalAndNull(bopDomesticHandling, initialConfiguration.NoOfDecimalForPrice));
    setValue('bopV2VHandlingCharges', checkForDecimalAndNull(bopV2VHandling, initialConfiguration.NoOfDecimalForPrice));
    setValue('bopOSPHandlingCharges', checkForDecimalAndNull(bopOSPHandling, initialConfiguration.NoOfDecimalForPrice));
    setValue('BOPHandlingCharges', checkForDecimalAndNull(totalBOPHandlingCharges, initialConfiguration.NoOfDecimalForPrice))

    // Update state with new values
    setState(prev => ({
      ...prev,
      openBOPHandlingDrawer: false,
      totalBOPHandlingCharges: totalBOPHandlingCharges,
      bopDomesticHandlingCost: bopDomesticHandling,
      bopCKDHandlingCost: bopCKDHandling,
      bopV2VHandlingCost: bopV2VHandling,
      bopOSPHandlingCost: bopOSPHandling,
      bopDomesticCost: bopDomesticCost,
      bopCKDCost: bopCKDCost,
      bopV2VCost: bopV2VCost,
      bopOSPCost: bopOSPCost
    }))
    const Params = {
      index: props.index,
      BOMLevel: props.item?.BOMLevel,
      PartNumber: props.item?.PartNumber,
    }
    const BOPHandlingFields = {
      IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
      BOPHandlingCharges: totalBOPHandlingCharges,
      NetBOPDomesticHandlingCost: bopDomesticHandling,
      NetBOPImportHandlingCost: bopCKDHandling,
      NetBOPSourceHandlingCost: bopV2VHandling,
      NetBOPOutsourcedHandlingCost: bopOSPHandling
    }
    props.setBOPCost(gridData, Params, item, BOPHandlingFields)
    clearErrors('');
  }
  const bopHandlingfields = [
    { label: `${showBopLabel()} Domestic handling Charges`, name: 'bopDomesticHandlingCharges', mandatory: false, disabled: true },
    { label: `${showBopLabel()} CKD handling Charges`, name: 'bopCKDHandlingCharges', mandatory: false, disabled: true },
    { label: `${showBopLabel()} V2V handling Charges`, name: 'bopV2VHandlingCharges', mandatory: false, disabled: true },
    { label: `${showBopLabel()} OSP handling Charges`, name: 'bopOSPHandlingCharges', mandatory: false, disabled: true },
  ]

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="3">
              <div className="left-border">
                {`${showBopLabel()} Cost:`}{gridData && gridData.length !== 0 &&
                  <TourWrapper
                    buttonSpecificProp={{ id: "Costing_RM_Cost", onClick: tourStart }}
                    stepsSpecificProp={{
                      steps: Steps(t).BOP_COST
                    }} />}
              </div>
            </Col>
            <Col md="8">
              {bopAddEditDeleteDisable && <WarningMessage dClass={'d-flex justify-content-end'} message={'To add, edit and delete BOP, please remove BOP handling charges by unticking "Apply BOP Handling Charges" checkbox.'} />}
            </Col>
            <Col md={'1'}>
              {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) &&
                <Button
                  id="Costing_addBOP"
                  onClick={DrawerToggle}
                  icon={"plus"}
                  buttonName={`${showBopLabel()}`}
                  disabled={bopAddEditDeleteDisable}
                />}
            </Col>
          </Row>
          <div className={'cr-process-costwrap'}>
            {showDifferentBOPType() && <Row className="cr-innertool-cost">
              <Col className=" col-md-15 cr-costlabel d-flex align-items-start justify-content-start"> <span className="d-inline-block align-middle">{`${showBopLabel()} Domestic Cost: ${state.bopDomesticCost !== null ? checkForDecimalAndNull(state.bopDomesticCost, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span> <div className='ml-2 mt-1'><TooltipCustom id='domestichandling' width="350px" tooltipText={`${showBopLabel()} Domestic Cost (Without Handling Charges): ${state.bopDomesticCost !== null ? checkForDecimalAndNull(state.bopDomesticCost - checkForNull(state.bopDomesticHandlingCost), initialConfiguration?.NoOfDecimalForPrice) : 0}`} /></div></Col>
              <Col className="col-md-15 cr-costlabel d-flex align-items-start justify-content-start"> <span className="d-inline-block align-middle">{`${showBopLabel()} CKD Cost: ${state.bopCKDCost !== null ? checkForDecimalAndNull(state.bopCKDCost, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span><div className='ml-2 mt-1'><TooltipCustom id='ckdhandling' width="350px" tooltipText={`${showBopLabel()} CKD Cost (Without Handling Charges): ${state.bopCKDCost !== null ? checkForDecimalAndNull(state.bopCKDCost - checkForNull(state.bopCKDHandlingCost), initialConfiguration?.NoOfDecimalForPrice) : 0}`} /></div></Col>
              <Col className="col-md-15 cr-costlabel d-flex align-items-start justify-content-start"> <span className="d-inline-block align-middle">{`${showBopLabel()} V2V Cost: ${state.bopV2VCost !== null ? checkForDecimalAndNull(state.bopV2VCost, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span><div className='ml-2 mt-1'><TooltipCustom id='v2vhandling' width="350px" tooltipText={`${showBopLabel()} V2V Cost (Without Handling Charges): ${state.bopV2VCost !== null ? checkForDecimalAndNull(state.bopV2VCost - checkForNull(state.bopV2VHandlingCost), initialConfiguration?.NoOfDecimalForPrice) : 0}`} /></div ></Col>
              <Col className="col-md-15 cr-costlabel d-flex align-items-start justify-content-start"> <span className="d-inline-block align-middle">{`${showBopLabel()} OSP Cost: ${state.bopOSPCost !== null ? checkForDecimalAndNull(state.bopOSPCost, initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span><div className='ml-2 mt-1'><TooltipCustom id='osphandling' width="350px" tooltipText={`${showBopLabel()} OSP Cost (Without Handling Charges): ${state.bopOSPCost !== null ? checkForDecimalAndNull(state.bopOSPCost - checkForNull(state.bopOSPHandlingCost), initialConfiguration?.NoOfDecimalForPrice) : 0}`} /></div ></Col>
              <Col className="col-md-15 cr-costlabel d-flex align-items-start justify-content-start"><span className="d-inline-block align-middle">{`${showBopLabel()} Cost: ${netBOPCost(gridData) !== null ? checkForDecimalAndNull(netBOPCost(gridData) + checkForNull(state.totalBOPHandlingCharges), initialConfiguration?.NoOfDecimalForPrice) : 0}`}</span><div className='ml-2 mt-1'><TooltipCustom id='handling' width="350px" tooltipText={`${showBopLabel()} Cost (Without Handling Charges): ${netBOPCost(gridData) !== null ? checkForDecimalAndNull(netBOPCost(gridData), initialConfiguration?.NoOfDecimalForPrice) : 0}`} /></div ></Col>
            </Row>}
            <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
              {showDifferentBOPType() ?
                <>
                  {['Domestic', 'CKD', 'V2V', 'OSP'].map(bopType => (
                    <React.Fragment key={bopType}>
                      <Row className="align-items-center">
                        <Col md="10">
                          <div className="left-border">{`${showBopLabel()} ${bopType} Cost:`}{gridData && gridData.length !== 0 &&
                            <TourWrapper
                              buttonSpecificProp={{ id: "Costing_RM_Cost", onClick: tourStart }}
                              stepsSpecificProp={{
                                steps: Steps(t).BOP_COST
                              }} />}</div>
                        </Col>
                      </Row>
                      <Row>
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
                                gridData.filter(item => item.BOPType === `BOP ${bopType}`).map((item, index) => {
                                  // Get the actual index in the full gridData array
                                  const fullDataIndex = gridData.findIndex(el => el.BoughtOutPartId === item.BoughtOutPartId);
                                  return (
                                    editIndex === fullDataIndex ?
                                      <tr key={fullDataIndex}>
                                        <td className='text-overflow'><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span></td>
                                        <td className='text-overflow'><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                                        <td>{item.BoughtOutPartUOM}</td>
                                        <td>{checkForDecimalAndNull(item.LandedCostINR, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                        <td style={{ width: 200 }}>
                                          <TextFieldHookForm
                                            label={false}
                                            name={`${bopGridFields}.${fullDataIndex}.Quantity`}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                              validate: {
                                                ...(item.BoughtOutPartUOM === 'Number' ?
                                                  { number, checkWhiteSpaces, noDecimal, numberLimit6 } :
                                                  { number, checkWhiteSpaces, decimalNumberLimit6 })
                                              },
                                            }}
                                            defaultValue={item.Quantity}
                                            className=""
                                            customClassName={'withBorder error-label'}
                                            handleChange={(e) => {
                                              e.preventDefault()
                                              handleQuantityChange(e, fullDataIndex)
                                            }}
                                            errors={errors && errors.bopGridFields && errors.bopGridFields[fullDataIndex] !== undefined ? errors.bopGridFields[fullDataIndex].Quantity : ''}
                                            disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ)}
                                          />
                                        </td>
                                        <td><div className='w-fit' id={`bop-cost${fullDataIndex}`}><TooltipCustom disabledIcon={true} id={`bop-cost${fullDataIndex}`} tooltipText={`Net ${showBopLabel()} Cost = (${showBopLabel()} Cost * Quantity)`} />{item.NetBoughtOutPartCost !== undefined ? checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</div></td>
                                        {initialConfiguration?.IsShowCRMHead && <td>
                                          <SearchableSelectHookForm
                                            name={`crmHeadBop${fullDataIndex}`}
                                            type="text"
                                            label="CRM Head"
                                            errors={`${errors.crmHeadBop}${fullDataIndex}`}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                              required: false,
                                            }}
                                            defaultValue={item.BoughtOutPartCRMHead ? { label: item.BoughtOutPartCRMHead, value: fullDataIndex } : ''}
                                            placeholder={'Select'}
                                            customClassName="costing-selectable-dropdown"
                                            options={CRMHeads}
                                            required={false}
                                            handleChange={(e) => { onCRMHeadChange(e, fullDataIndex) }}
                                            disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                                          />
                                        </td>}
                                        <td>
                                          <div className='action-btn-wrapper'>
                                            {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && <button title='Save' className="SaveIcon" type={'button'} onClick={() => SaveItem(fullDataIndex)} disabled={bopAddEditDeleteDisable} />}
                                            {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && <button title='Discard' className="CancelIcon" type={'button'} onClick={() => CancelItem(fullDataIndex)} disabled={bopAddEditDeleteDisable} />}
                                            <button id={`bop_remark_btn_${fullDataIndex}`} title="Remark" className="Comment-box" type='button' onClick={() => onRemarkButtonClick(fullDataIndex)} />
                                          </div>
                                        </td>
                                      </tr>
                                      :
                                      <tr key={fullDataIndex}>
                                        <td className='text-overflow'><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span> </td>
                                        <td className='text-overflow'><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                                        <td>{item.BoughtOutPartUOM}</td>
                                        <td>{item.LandedCostINR ? checkForDecimalAndNull(item.LandedCostINR, initialConfiguration?.NoOfDecimalForPrice) : ''}</td>
                                        <td style={{ width: 200 }}>{checkForDecimalAndNull(item.Quantity, initialConfiguration?.NoOfDecimalForInputOutput)}</td>
                                        <td><div className='w-fit' id={`bop-cost${fullDataIndex}`}><TooltipCustom disabledIcon={true} id={`bop-cost${fullDataIndex}`} tooltipText={`Net ${showBopLabel()} Cost = (${showBopLabel()} Cost * Quantity)`} />{item.NetBoughtOutPartCost ? checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</div></td>
                                        {initialConfiguration?.IsShowCRMHead && <td>
                                          <SearchableSelectHookForm
                                            name={`crmHeadBop${fullDataIndex}`}
                                            type="text"
                                            label="CRM Head"
                                            errors={`${errors.crmHeadBop}${fullDataIndex}`}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                              required: false,
                                            }}
                                            defaultValue={item.BoughtOutPartCRMHead ? { label: item.BoughtOutPartCRMHead, value: fullDataIndex } : ''}
                                            placeholder={'Select'}
                                            customClassName="costing-selectable-dropdown"
                                            options={CRMHeads}
                                            required={false}
                                            handleChange={(e) => { onCRMHeadChange(e, fullDataIndex) }}
                                            disabled={CostingViewMode || IsLockTabInCBCCostingForCustomerRFQ}
                                          />
                                        </td>}
                                        <td>
                                          <div className='action-btn-wrapper'>
                                            {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) && <button title='Edit' id={`bopCost_edit${fullDataIndex}`} className="Edit" type={'button'} onClick={() => editItem(fullDataIndex)} disabled={bopAddEditDeleteDisable} />}
                                            {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) && <button title='Delete' id={`bopCost_delete${fullDataIndex}`} className="Delete " type={'button'} onClick={() => deleteItem(fullDataIndex)} disabled={bopAddEditDeleteDisable} />}
                                            <button id={`bop_remark_btn_${fullDataIndex}`} title="Remark" className="Comment-box" type='button' onClick={() => onRemarkButtonClick(fullDataIndex)} />
                                          </div>
                                        </td>
                                      </tr>
                                  )
                                })
                              }
                              {(!gridData || gridData.filter(item => item.BOPType === `BOP ${bopType}`).length === 0) &&
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
                    </React.Fragment>
                  ))}
                </> :
                <Row>
                  <>
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
                                      <TextFieldHookForm
                                        label={false}
                                        name={`${bopGridFields}.${index}.Quantity`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                          validate: {
                                            ...(item.BoughtOutPartUOM === 'Number' ?
                                              { number, checkWhiteSpaces, noDecimal, numberLimit6 } :
                                              { number, checkWhiteSpaces, decimalNumberLimit6 })
                                          },
                                        }}
                                        defaultValue={item.Quantity}
                                        className=""
                                        customClassName={'withBorder error-label'}
                                        handleChange={(e) => {
                                          e.preventDefault()
                                          handleQuantityChange(e, index)
                                        }}
                                        errors={errors && errors.bopGridFields && errors.bopGridFields[index] !== undefined ? errors.bopGridFields[index].Quantity : ''}
                                        disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ)}
                                      />
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
                                        {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && <button title='Save' className="SaveIcon" type={'button'} onClick={() => SaveItem(index)} disabled={bopAddEditDeleteDisable} />}
                                        {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && <button title='Discard' className="CancelIcon" type={'button'} onClick={() => CancelItem(index)} disabled={bopAddEditDeleteDisable} />}
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
                                        {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) && <button title='Edit' id={`bopCost_edit${index}`} className="Edit" type={'button'} onClick={() => editItem(index)} disabled={bopAddEditDeleteDisable} />}
                                        {!CostingViewMode && !IsLocked && !IsLockTabInCBCCostingForCustomerRFQ && !isLockRMAndBOPForCostAppliacabilityProcess(processArr) && <button title='Delete' id={`bopCost_delete${index}`} className="Delete " type={'button'} onClick={() => deleteItem(index)} disabled={bopAddEditDeleteDisable} />}
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
                  </>
                </Row>}
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
                        disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ || gridData?.length === 0) ? true : false}
                      />
                      <span
                        className=" before-box"
                        checked={IsApplyBOPHandlingCharges}
                        onChange={onPressApplyBOPCharges}
                      />
                    </label>
                  </span>
                </div>

                {IsApplyBOPHandlingCharges && (
                  <>
                    <Col md="2">
                      <div className='d-flex align-items-center'>
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
                        <Button
                          id="addBOPHandlingCharges"
                          onClick={addBOPHandlingCharges}
                          className={" mt-3 mb-2 "}
                          variant={CostingViewMode ? "view-icon-primary" : "plus-icon-square"}
                          title={CostingViewMode ? "View" : "Add"}
                          disabled={false}
                        />
                      </div>
                    </Col>

                    {showDifferentBOPType() && bopHandlingfields.map(item => {
                      const { name, label } = item ?? {};
                      return (
                        <Col md="2" key={name}>
                          <TextFieldHookForm
                            label={label}
                            name={name}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{}}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors[name]}
                            disabled={true}
                          />
                        </Col>
                      );
                    })}
                  </>
                )}
              </Row>
            </form>
          </div>
        </div >
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
      {
        state.openBOPHandlingDrawer && <BOPHandlingDrawer
          isOpen={state.openBOPHandlingDrawer}
          closeDrawer={closeBOPHandlingDrawer}
          isEditFlag={false}
          anchor={'right'}
          applicabilityCost={state}
          ViewMode={CostingViewMode}
          item={item}
          bopData={gridData}
          netBOPCost={netBOPCost(gridData)}
        />
      }
    </ >
  );
}

export default BOPCost;