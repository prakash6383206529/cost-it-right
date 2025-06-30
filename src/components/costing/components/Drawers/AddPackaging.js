import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { Container, Row, Col, } from 'reactstrap';
import { costingInfoContext, netHeadCostContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey, removeBOPfromApplicability, } from '../../../../helper';
//MINDA
// import { removeBOPFromList } from '../../../../helper';
import { useDispatch, useSelector } from 'react-redux';
import WarningMessage from '../../../common/WarningMessage';
import { number, percentageLimitValidation, checkWhiteSpaces, hashValidation, decimalNumberLimit6, decimalAndNumberValidationBoolean, NoSignNoDecimalMessage, isNumber } from "../../../../helper/validation";
import { IdForMultiTechnology, LOGISTICS, PACK_AND_FREIGHT_PER_KG, STRINGMAXLENGTH } from '../../../../config/masterData';
import _ from 'lodash';
import { MESSAGES } from '../../../../config/message';
import TooltipCustom from '../../../common/Tooltip';
import { CRMHeads, WACTypeId } from '../../../../config/constants';
import { fetchCostingHeadsAPI } from '../../../../actions/Common';
import Toaster from '../../../common/Toaster';
import PackagingCalculator from '../WeightCalculatorDrawer/PackagingCalculator';
import { filterBOPApplicability } from '../../../common/CommonFunctions';
// import PackagingCalculator from '../WeightCalculatorDrawer/PackagingCalculator';

function IsolateReRender(control) {
  const values = useWatch({
    control,
    name: 'PackagingCostPercentage',
  });

  return values;
}

function AddPackaging(props) {

  const { rowObjData, isEditFlag, gridData } = props;

  const defaultValues = {
    PackagingDetailId: rowObjData && rowObjData.PackagingDetailId !== undefined ? rowObjData.PackagingDetailId : '',
    PackagingDescription: rowObjData && rowObjData.PackagingDescription !== undefined ? rowObjData.PackagingDescription : '',
    PackagingCostPercentage: rowObjData && rowObjData.PackagingCostPercentage !== undefined ? checkForDecimalAndNull(rowObjData.PackagingCostPercentage, getConfigurationKey().NoOfDecimalForPrice) : '',
    Applicability: rowObjData && rowObjData.Applicability !== undefined ? { label: rowObjData.Applicability, value: rowObjData.Applicability } : [],
    PackagingCost: rowObjData && rowObjData.PackagingCost !== undefined ? checkForDecimalAndNull(rowObjData.PackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    Cost: rowObjData && rowObjData.PackagingCost !== undefined ? checkForDecimalAndNull(rowObjData.PackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    crmHeadPackaging: rowObjData && rowObjData.PackagingCRMHead !== undefined ? { label: rowObjData.PackagingCRMHead, value: 1 } : [],
    Rate: rowObjData && rowObjData.Rate !== undefined ? checkForDecimalAndNull(rowObjData.Rate, getConfigurationKey().NoOfDecimalForPrice) : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const headCostData = useContext(netHeadCostContext)
  const costData = useContext(costingInfoContext);
  const dispatch = useDispatch()

  const [applicability, setApplicability] = useState(isEditFlag ? { label: rowObjData.Applicability, value: rowObjData.Applicability } : []);
  const [freightTypeState, setFreightTypeState] = useState(isEditFlag ? { label: rowObjData.PackagingDescription, value: rowObjData.PackagingDescription } : []);
  // const [PackageType, setPackageType] = useState(isEditFlag ? rowObjData.IsPackagingCostFixed : false);
  const [PackageType, setPackageType] = useState(true);
  const [packagingCost, setPackagingCost] = useState(rowObjData?.PackagingCost ?? 0)
  const costingHead = useSelector(state => state.comman.costingHead)
  const { CostingDataList, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)
  const [packagingCostDataFixed, setPackagingCostDataFixed] = useState(getValues('PackagingCost') ? getValues('PackagingCost') : '')
  const [errorMessage, setErrorMessage] = useState('')
  const [removeApplicability, setRemoveApplicability] = useState([])
  const [totalRMGrossWeight, setTotalRMGrossWeight] = useState('')
  const [showCalculator, setShowCalculator] = useState(false)
  const [openCalculator, setOpenCalculator] = useState(false)
  const [costingPackagingCalculationDetailsId, setCostingPackagingCalculationDetailsId] = useState(rowObjData?.CostingPackagingCalculationDetailsId ?? null)
  const [totalTabCost, setTotalTabCost] = useState(checkForNull(CostingDataList.NetTotalRMBOPCC) + checkForNull(CostingDataList.NetSurfaceTreatmentCost) + checkForNull(CostingDataList.NetOverheadAndProfitCost));
  const [originalQuantity, setOriginalQuantity] = useState(rowObjData?.Quantity ?? 0)

  const fieldValues = IsolateReRender(control)
  const { costingData, ComponentItemData } = useSelector(state => state.costing)
  const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId || (costData?.PartType === 'Assembly' && IsMultiVendorCosting))

  const { RMCCTabData, OverheadProfitTabData, SurfaceTabData } = useSelector(state => state.costing)

  const freightType = [
    { label: 'Origin THC', value: 'Origin THC' },
    { label: 'Ocean/Air Freight', value: 'Ocean/Air Freight' },
    { label: 'Destination THC', value: 'Destination THC' }
  ]

  useEffect(() => {
    if (applicability?.value === PACK_AND_FREIGHT_PER_KG) {
      let arr = _.map(RMCCTabData, 'CostingPartDetails.CostingRawMaterialsCost')
      let totalFinishWeight = 0
      let totalGrossWeight = 0
      arr && arr?.map(item => {
        totalFinishWeight = item && item?.reduce((accummlator, el) => {
          return accummlator + checkForNull(el?.FinishWeight)
        }, 0)
        totalGrossWeight = item && item?.reduce((accummlator, el) => {
          return accummlator + checkForNull(el?.GrossWeight)
        }, 0)
      })

      if (applicability?.label === 'Crate/Trolley') {
        setShowCalculator(true)
      }

      setValue("Quantity", totalFinishWeight ? checkForDecimalAndNull(totalFinishWeight, getConfigurationKey().NoOfDecimalForPrice) : '')

      setOriginalQuantity(totalFinishWeight)

      setTotalRMGrossWeight(totalGrossWeight)
    }
  }, [RMCCTabData, applicability])


  useEffect(() => {
    if (applicability && applicability?.value !== undefined) {

      calculateApplicabilityCost(applicability?.label)
    }
  }, [fieldValues]);

  useEffect(() => {
    let request = partType ? 'multiple technology assembly' : 'packaging'
    let isRequestForMultiTechnology = partType ? true : false
    dispatch(fetchCostingHeadsAPI(request, true, isRequestForMultiTechnology, (res) => { }))
    const removeApplicabilityList = _.map(gridData, 'Applicability')
    setRemoveApplicability(removeApplicabilityList)
    if (applicability?.label === 'Crate/Trolley') {
      setShowCalculator(true)
    }
  }, [])

  // useEffect(() => {
  //   if (!isEditFlag) {
  //     if (!PackageType) {
  //       setValue('PackagingCostPercentage', 'Fixed')
  //     } else {
  //       setValue('PackagingCostPercentage', '')
  //     }
  //   }
  // }, [PackageType]);

  const toggleDrawer = (event, formData = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', formData)
    setApplicability([])
  };

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    const temp = [];
    let tempList = [];

    if (label === 'Applicability') {
      // Build initial list from costingHead
      costingHead && costingHead.map(item => {
        if (!isEditFlag && removeApplicability?.includes(item.Text)) return false;
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      tempList=filterBOPApplicability(costingHead,gridData,'Applicability')
      // Apply additional filters if needed
      if (isBreakupBoughtOutPartCostingFromAPI) {
        tempList = removeBOPfromApplicability([...tempList])
      }

      // Add PACK_AND_FREIGHT_PER_KG if not in removeApplicability
      if (!removeApplicability?.includes(PACK_AND_FREIGHT_PER_KG)) {
        tempList.push({ label: PACK_AND_FREIGHT_PER_KG, value: PACK_AND_FREIGHT_PER_KG })
      }

      return tempList;
    }
    if (label === 'FrieghtType') {
      freightType && freightType.map(item => {
        let array = _.map(gridData, 'PackagingDescription')
        if (item.value === '0' || array.includes(item.label)) return false;
        temp.push({ label: item.label, value: item.value })
        return null;
      });
      isEditFlag && temp.push({ label: rowObjData.PackagingDescription, value: rowObjData.PackagingDescription })
      tempList = [...temp]
      return tempList;
    }

  }

  /**
  * @method handleApplicabilityChange
  * @description  APPLICABILITY CHANGE HANDLE
  */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setApplicability(newValue)
      setValue('PackagingCost', '')
      calculateApplicabilityCost(newValue.label, true)
      if (newValue.label === 'Crate/Trolley') {
        setShowCalculator(true)
      } else {
        setShowCalculator(false)
      }
    } else {
      setApplicability([])
    }
    setErrorMessage('')
  }

  /**
  * @method handleFrieghtTypeChange
  * @description  FREIGHT CHANGE HANDLE
  */
  const handleFrieghtTypeChange = (newValue) => {
    if (newValue && newValue !== '') {
      setFreightTypeState(newValue)
      calculateApplicabilityCost(newValue.label, true)
    } else {
      setFreightTypeState([])
    }
  }

  /**
   * @method calculateApplicabilityCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateApplicabilityCost = (Text, applicablityDropDownChange = false) => {


    const { NetRawMaterialsCost, NetBoughtOutPartCost, NetBOPDomesticCost, NetBOPImportCost, NetBOPOutsourcedCost, NetBOPSourceCost, NetBOPDomesticCostWithOutHandlingCharge, NetBOPImportCostWithOutHandlingCharge, NetBOPOutsourcedCostWithOutHandlingCharge, NetBOPSourceCostWithOutHandlingCharge, NetBoughtOutPartCostWithOutHandlingCharge } = headCostData;
    let TopHeaderValues = OverheadProfitTabData && OverheadProfitTabData?.length > 0 && OverheadProfitTabData?.[0]?.CostingPartDetails !== undefined ? OverheadProfitTabData?.[0]?.CostingPartDetails : null;
    const { HangerCostPerPart, PaintCost, SurfaceTreatmentCost } = SurfaceTabData[0]?.CostingPartDetails
    const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headCostData.NetConversionCost) - checkForNull(headCostData.TotalOtherOperationCostPerAssembly) : headCostData.NetProcessCost + headCostData.NetOperationCost
    const PackagingCostPercentage = getValues('PackagingCostPercentage');

    let dataList = CostingDataList && CostingDataList.length > 0 ? CostingDataList[0] : {}
    const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost)

    setTotalTabCost(totalTabCost)
    let totalPackagingCost = 0
    switch (Text) {
      case 'RM':
      case 'Part Cost':

        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = NetRawMaterialsCost * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'BOP':

        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = NetBoughtOutPartCost * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;

      case 'CC':

        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = (ConversionCostForCalculation) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'Net Cost':

        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = (totalTabCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'BOP Domestic':

        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPDomesticCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'BOP CKD':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPImportCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'BOP V2V':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPSourceCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'BOP OSP':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPOutsourcedCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "BOP Domestic Without Handling Charge":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPDomesticCostWithOutHandlingCharge) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "BOP CKD Without Handling Charge":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPImportCostWithOutHandlingCharge) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "BOP V2V Without Handling Charge":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPSourceCostWithOutHandlingCharge) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "BOP OSP Without Handling Charge":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBOPOutsourcedCostWithOutHandlingCharge) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;

      case "BOP Without Handling Charge":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(NetBoughtOutPartCostWithOutHandlingCharge) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "Hanger Cost":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(HangerCostPerPart) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "Paint Cost":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(PaintCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "Surface Treatment Cost":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(SurfaceTreatmentCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "Overhead Cost":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(TopHeaderValues?.OverheadCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "Profit Cost":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(TopHeaderValues?.ProfitCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case "Rejection Cost":
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = checkForNull(TopHeaderValues?.RejectionCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', totalPackagingCost ? checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'Fixed':

        if (!PackageType) {
          setValue('PackagingCost', PackagingCostPercentage)
        } else {
          totalPackagingCost = getValues('PackagingCost')
          // setValue('PackagingCost',PackagingCostPercentage)
          setPackagingCost(totalPackagingCost)
          if (applicablityDropDownChange) {
            setValue('PackagingCost', '')
            setPackagingCost(0)
          }
        }
        break;
      default:
        break;
    }
    errors.PackagingCost = {}
  }

  const calculatePerKg = (rate, weight) => {
    if (checkForNull(totalRMGrossWeight) !== 0 && applicability?.label === PACK_AND_FREIGHT_PER_KG && weight > totalRMGrossWeight) {
      Toaster.warning("Enter value less than gross weight.")
      setTimeout(() => {
        setValue('Quantity', '')
      }, 50);
      return false
    }
    const packagingCost = checkForNull(rate) * checkForNull(weight)

    setValue('PackagingCost', packagingCost ? checkForDecimalAndNull(packagingCost, getConfigurationKey().NoOfDecimalForPrice) : '')
    setPackagingCost(packagingCost)
    errors.PackagingCost = {}
  }

  /**
 * @method addRow
 * @description ADD ROW IN TO RM COST GRID
 */
  const addRow = () => {
    //toggleDrawer('')
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({ Applicability: '' })
    props.closeDrawer('', {})
  }
  const packingCostHandler = (e) => {

    let message = ''
    if (decimalNumberLimit6(e.target.value)) {
      message = MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE
    } else if (!isNumber(e.target.value)) {
      message = NoSignNoDecimalMessage
    } else if (e.target.value === '') {
      message = 'This field is required'
    } else {
      setPackagingCostDataFixed(e.target.value)
      message = ''
    }
    setErrorMessage(message)
  }
  const onSubmit = data => {
    let formData
    if (costingData.TechnologyId === LOGISTICS) {
      formData = {
        PackagingDetailId: isEditFlag ? rowObjData.PackagingDetailId : '',
        IsPackagingCostFixed: true,
        PackagingDescription: freightTypeState?.label,   // Freight Type as a text
        PackagingCostFixed: getValues('Cost'),
        PackagingCostPercentage: 0,
        PackagingCost: getValues('Cost'),
        Applicability: 'Fixed',
        PackagingCRMHead: getValues('crmHeadPackaging') ? getValues('crmHeadPackaging').label : ''
      }
    } else {
      formData = {
        PackagingDetailId: isEditFlag ? rowObjData.PackagingDetailId : '',
        IsPackagingCostFixed: applicability?.label === 'Fixed' ? false : true,
        PackagingDescription: data.PackagingDescription,
        PackagingCostFixed: 0,
        PackagingCostPercentage: PackageType ? data.PackagingCostPercentage : 0,
        PackagingCost: applicability?.label === 'Fixed' ? getValues('PackagingCost') : packagingCost,
        Applicability: applicability ? data.Applicability?.label : '',
        PackagingCRMHead: getValues('crmHeadPackaging') ? getValues('crmHeadPackaging').label : '',
        Rate: getValues('Rate'),
        Quantity: originalQuantity,
        CostingPackagingCalculationDetailsId: costingPackagingCalculationDetailsId ?? null
      }
    }
    toggleDrawer('', formData)
  }
  const toggleWeightCalculator = (packingCost) => {
    setOpenCalculator(true)
  }
  const closeCalculator = (calculatorId, packingCost, type) => {

    setCostingPackagingCalculationDetailsId(calculatorId)
    if (type === 'Save') {
      setValue('PackagingCost', checkForDecimalAndNull(packingCost, getConfigurationKey().NoOfDecimalForPrice))
      setPackagingCost(packingCost)
    }
    setOpenCalculator(false)
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
          <div className={'drawer-wrapper packing-drawer'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{costingData.TechnologyId === LOGISTICS ? (isEditFlag ? 'Update Freight' : 'Add Freight')
                    : (isEditFlag ? 'Update Packaging' : 'Add Packaging')}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
              <>
                <Row className="ml-0">
                  {/* <Col md="12" className="switch">
                    <label className={'left-title'}>{'Packaging Type'}</label>
                  </Col> */}
                  {/* <Col md="12" className="switch mb15">
                    <label className="switch-level">
                      <div className={'left-title'}>{'Fixed'}</div>
                      <Switch
                        onChange={PackageTypeToggle}
                        checked={PackageType}
                        id="normal-switch"
                        disabled={isEditFlag ? true : false}
                        background="#4DC771"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        offColor="#4DC771"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={46}
                      />
                      <div className={'right-title'}>{'Percentage'}</div>
                    </label>
                  </Col> */}
                  {costingData.TechnologyId !== LOGISTICS && <Col md="12">
                    <TextFieldHookForm
                      id="Add_Packaging_Description"
                      label="Packaging Description"
                      name={'PackagingDescription'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        validate: { checkWhiteSpaces, hashValidation },
                        maxLength: 80
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PackagingDescription}
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>}
                  {costingData.TechnologyId !== LOGISTICS && <Col md="12">
                    <SearchableSelectHookForm
                      label={'Applicability'}
                      name={'Applicability'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: PackageType ? true : false }}
                      register={register}
                      defaultValue={applicability?.length !== 0 ? applicability : ''}
                      options={renderListing('Applicability')}
                      mandatory={PackageType ? true : false}
                      handleChange={handleApplicabilityChange}
                      errors={errors.Applicability}
                      disabled={!PackageType ? true : false}
                    />
                  </Col>}

                  {/* {
                    applicability.label === 'Fixed'?
                    <Col md="12">
                    <NumberFieldHookForm
                      label="Packaging Cost"
                      name={'PackagingCostPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={PackageType ? true : false}
                      rules={{
                        required: PackageType ? true : false,
                        pattern: {
                          value: PackageType ? /^\d*\.?\d*$/ : '',
                          message: PackageType ? 'Invalid Number.' : '',
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      // errors={errors.PackagingCostPercentage}
                      disabled={!PackageType ? true : false}
                    />
                  </Col>:

                  } */}
                  {applicability?.label === PACK_AND_FREIGHT_PER_KG && <><Col md="12">
                    <TextFieldHookForm
                      label={'Rate'}
                      name={'Rate'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={applicability?.label === PACK_AND_FREIGHT_PER_KG ? true : false}
                      rules={{
                        required: applicability?.label === PACK_AND_FREIGHT_PER_KG ? true : false,
                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                      }}
                      handleChange={(e) => calculatePerKg(e.target.value, getValues("Quantity"))}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Rate}
                    // disabled={(applicability?.label === PACK_AND_FREIGHT_PER_KG) ? true : false}
                    />
                  </Col>
                    <Col md="12">
                      <TextFieldHookForm
                        label={'Quantity'}
                        name={'Quantity'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={applicability?.label === PACK_AND_FREIGHT_PER_KG ? true : false}
                        rules={{
                          required: applicability?.label === PACK_AND_FREIGHT_PER_KG ? true : false,
                          validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                        }}
                        handleChange={(e) => calculatePerKg(getValues("Rate"), e.target.value)}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.Quantity}
                      // disabled={(applicability?.label === PACK_AND_FREIGHT_PER_KG) ? true : false}
                      />
                    </Col></>}

                  {costingData.TechnologyId === LOGISTICS && <>
                    <Col md="12">
                      <TooltipCustom id="freight" tooltipText="Terminal Handling Charges" />
                      <SearchableSelectHookForm
                        label={'Charges'}
                        name={'FrieghtType'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: PackageType ? true : false }}
                        register={register}
                        defaultValue={freightTypeState.length !== 0 ? freightTypeState : ''}
                        options={renderListing('FrieghtType')}
                        mandatory={PackageType ? true : false}
                        handleChange={handleFrieghtTypeChange}
                        errors={errors.FrieghtType}
                        disabled={!PackageType ? true : false}
                      />
                    </Col>

                    <Col md="12">
                      <TextFieldHookForm
                        label="Cost"
                        name={'Cost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                        }}
                        handleChange={() => { }}
                        defaultValue={0}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.Cost}
                        disabled={false}
                      />
                    </Col>
                  </>}

                  {costingData.TechnologyId !== LOGISTICS && !showCalculator &&
                    applicability?.label !== 'Fixed' && applicability?.label !== PACK_AND_FREIGHT_PER_KG &&
                    <Col md="12">
                      <TextFieldHookForm
                        id="Add_Packaging_Percentage"
                        label="Packaging Percentage"
                        name={'PackagingCostPercentage'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={PackageType ? true : false}
                        rules={{
                          required: PackageType ? true : false,
                          validate: { number, checkWhiteSpaces, percentageLimitValidation },
                          max: {
                            value: 100,
                            message: 'Percentage cannot be greater than 100'
                          },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.PackagingCostPercentage}
                        disabled={!PackageType ? true : false}
                      />
                    </Col>
                  }

                  {costingData.TechnologyId !== LOGISTICS && <Col md="12">
                    <div className="position-relative">
                      {applicability?.label == 'Net Cost' && (
                        <TooltipCustom
                          id="Add_Packaging_Cost"
                          width={"290px"}
                          tooltipText={`Net Cost = ${checkForDecimalAndNull(totalTabCost, getConfigurationKey().NoOfDecimalForPrice)} (RM+CC+BOP + Surface Treatment + Overhead & Profit)`}
                        />
                      )}
                      <div className="packaging-cost-warpper">
                        <TextFieldHookForm
                          label="Packaging Cost"
                          name={'PackagingCost'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={applicability?.label === 'Fixed' ? true : false}
                          rules={{
                            required: applicability?.label === 'Fixed' ? true : false,
                            validate: applicability?.label === 'Fixed' ? { number, checkWhiteSpaces, decimalNumberLimit6 } : {}
                          }}
                          handleChange={packingCostHandler}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder w-100 mb-0'}
                          errors={errors.PackagingCost}
                          disabled={applicability?.label === 'Fixed' ? false : true}
                        />
                        {showCalculator && <button
                          id={`RM_calculator`}
                          className={`CalculatorIcon mb-0 mt-1 ml-2 cr-cl-icon RM_calculator`}
                          type={'button'}
                          onClick={() => toggleWeightCalculator()}
                          disabled={false}
                        />}
                      </div>

                    </div>
                  </Col>}

                  {initialConfiguration?.IsShowCRMHead && <Col md="12">
                    <SearchableSelectHookForm
                      name={`crmHeadPackaging`}
                      type="text"
                      label="CRM Head"
                      errors={`${errors.crmHeadPackaging}`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                      }}
                      placeholder={'Select'}
                      options={CRMHeads}
                      required={false}
                      handleChange={() => { }}
                      disabled={false}
                    />
                  </Col>
                  }
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                  <div className="col-sm-12 text-right px-3">
                    <button
                      id="AddPackaging_Cancel"
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cancel-icon'}></div> {'Cancel'}
                    </button>

                    <button
                      id="AddPackaging_Save"
                      type={'submit'}
                      className="submit-button  save-btn"
                      onClick={addRow} >
                      <div className={'save-icon'}></div>
                      {isEditFlag ? 'Update' : 'Save'}
                    </button>
                  </div>
                </Row>
              </>

            </form >
            {openCalculator && <PackagingCalculator
              isOpen={openCalculator}
              anchor={'right'}
              closeCalculator={closeCalculator}
              rowObjData={rowObjData}
              CostingViewMode={isEditFlag ? true : false}
              costingPackagingCalculationDetailsId={costingPackagingCalculationDetailsId}
            />
            }
          </div >
        </Container >
      </Drawer >
    </div >
  );
}

export default React.memo(AddPackaging);  