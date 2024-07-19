import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Label } from 'reactstrap';
import { getFreigtFullTruckCapacitySelectList, getRateCriteriaByCapacitySelectList, getRateByCapacityCriteria } from '../../actions/Costing';
import { costingInfoContext, netHeadCostContext } from '../CostingDetailStepTwo';
import Toaster from '../../../common/Toaster';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey, removeBOPfromApplicability } from '../../../../helper';
import { removeBOPFromList } from '../../../../helper';
import { CRMHeads, Fixed, FullTruckLoad, PartTruckLoad, Per_Kg_Load, Percentage, WACTypeId } from '../../../../config/constants';
import { number, percentageLimitValidation, checkWhiteSpaces, decimalNumberLimit6 } from "../../../../helper/validation";
import { fetchCostingHeadsAPI } from '../../../../actions/Common';
import { IdForMultiTechnology } from '../../../../config/masterData';
import _ from 'lodash';
import { getFreigtRateCriteriaSelectList } from '../../../masters/actions/Freight';

function AddFreight(props) {

  const { rowObjData, isEditFlag } = props;

  const defaultValues = {
    FreightDetailId: rowObjData && rowObjData.FreightDetailId !== undefined ? rowObjData.FreightDetailId : '',
    FreightId: rowObjData && rowObjData.FreightId !== undefined ? rowObjData.FreightId : '',
    Capacity: rowObjData && rowObjData.Capacity !== undefined ? { label: rowObjData.Capacity, value: rowObjData.Capacity } : [],
    Criteria: rowObjData && rowObjData.Criteria !== undefined ? { label: rowObjData.Criteria, value: rowObjData.Criteria } : '',
    Rate: rowObjData && rowObjData.Rate !== undefined ? rowObjData.Rate : '',
    Quantity: rowObjData && rowObjData.Quantity !== undefined ? checkForNull(rowObjData.Quantity) : '',
    FreightCost: rowObjData && rowObjData.FreightCost !== undefined ? rowObjData.FreightCost : '',
    crmHeadFreight: rowObjData && rowObjData.FreightCRMHead !== undefined ? { label: rowObjData.FreightCRMHead, value: 1 } : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const dispatch = useDispatch()

  const headCostData = useContext(netHeadCostContext)
  const costData = useContext(costingInfoContext);

  const costingHead = useSelector(state => state.comman.costingHead)
  const { CostingDataList, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)

  const [capacity, setCapacity] = useState(isEditFlag ? { label: rowObjData.Capacity, value: rowObjData.Capacity } : []);
  const [criteria, setCriteria] = useState(isEditFlag ? { label: rowObjData.Criteria, value: rowObjData.Criteria } : []);
  const [IsPartTruckLoad, setIsPartTruckLoad] = useState(isEditFlag ? rowObjData.IsPartTruckLoad : false);

  const [freightType, setfreightType] = useState(isEditFlag ? rowObjData.EFreightLoadType : FullTruckLoad);
  const [applicability, setApplicability] = useState(isEditFlag ? { label: rowObjData.Criteria, value: rowObjData.Criteria } : []);
  const [showFields, setShowFields] = useState({});
  const [fullTruckLoadId, setFullTruckLoadId] = useState('');

  const { RMCCTabData, CostingEffectiveDate } = useSelector(state => state.costing)

  const [freightCost, setFreightCost] = useState('')
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)

  useEffect(() => {
    setTimeout(() => {
      setfreightType(isEditFlag ? rowObjData.EFreightLoadType : FullTruckLoad)
    }, 200)
  }, [rowObjData]);

  useEffect(() => {
    dispatch(getFreigtRateCriteriaSelectList())
    dispatch(getFreigtFullTruckCapacitySelectList())
  }, []);

  useEffect(() => {
    if (!isEditFlag && (freightType === FullTruckLoad || freightType === PartTruckLoad)) {
      let arr = _.map(RMCCTabData, 'CostingPartDetails.CostingRawMaterialsCost')
      let totalFinishWeight = 0
      arr && arr?.map(item => {
        totalFinishWeight = item && item?.reduce((accummlator, el) => {
          return accummlator + checkForNull(el?.FinishWeight)
        }, 0)
      })
      // setTotalFinishWeight(totalFinishWeight)
      setValue("Quantity", totalFinishWeight)

    }
  }, [RMCCTabData, applicability])

  useEffect(() => {
    let request = partType ? 'multiple technology assembly' : ''
    dispatch(fetchCostingHeadsAPI(request, false, (res) => { }))
    if (isEditFlag) {
      showFieldsFunction(rowObjData.EFreightLoadType)
    }
    if (!isEditFlag) {
      showFieldsFunction(FullTruckLoad)
    }
  }, [])
  const fieldValues = useWatch({
    control,
    name: ['PackagingPercentage'],
  });

  const RateFieldValue = useWatch({
    control,
    name: ['Rate'],
  });

  useEffect(() => {
    if (criteria) {
      calculateApplicabilityCost(criteria.value)
    }
  }, [fieldValues]);

  useEffect(() => {
    if (freightType === FullTruckLoad || freightType === PartTruckLoad) {
      calculateCostForPerKg()
    } else {
      calculateCost(applicability.label)
    }
  }, [RateFieldValue]);

  const freightFullTruckCapacitySelectList = useSelector(state => state.freight.freightFullTruckCapacitySelectList)
  const rateCriteriaByCapacitySelectList = useSelector(state => state.costing.rateCriteriaByCapacitySelectList)
  const freightRateCriteriaSelectList = useSelector(state => state.freight.freightRateCriteriaSelectList)

  const showFieldsFunction = (freightFlag) => {
    let obj = {
      Capacity: false,
      Applicability: false,
      Criteria: false,
      Rate: false,
      Quantity: false,
    }
    switch (freightFlag) {
      case FullTruckLoad:
        obj.Capacity = true
        obj.Criteria = true
        obj.Rate = true
        obj.Quantity = true

        break;
      case PartTruckLoad:
        obj.Criteria = true
        obj.Rate = true
        obj.Quantity = true

        break;
      case Fixed:

        break;
      case Percentage:
        obj.Applicability = true
        obj.Rate = true

        break;

      default:
        break;
    }
    setShowFields(obj)
  }

  const toggleDrawer = (event, formData = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('', formData)
  };


  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

    const temp = [];
    let tempList = [];

    if (label === 'Capacity') {
      freightFullTruckCapacitySelectList && freightFullTruckCapacitySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      tempList = [...temp]
      return tempList;
    }

    if (label === 'RateCriteria') {
      freightRateCriteriaSelectList && freightRateCriteriaSelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      tempList = [...temp]
      return tempList;
    }

    if (label === 'Applicability') {
      costingHead && costingHead.map(item => {
        if (item.Value === '0' || item.Text === 'Fixed') return false;
        temp.push({ label: item.Text, value: item.Value })
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

  // WILL BE USED LATER FOR OTHER RADIO BUTON CALCULATION
  /**
  * @method handleCapacityChange
  * @description  CAPACITY CHANGE HANDLE
  */
  const handleCapacityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCapacity(newValue)
      callFreightAPI(newValue, criteria)
    } else {
      setCapacity([])
    }
  }

  const callFreightAPI = (capacityValue, criteriaValue) => {
    if (Object.keys(capacityValue)?.length > 0 && Object.keys(criteriaValue)?.length > 0) {
      const data = {
        Capacity: capacityValue?.value ? capacityValue?.value : null,
        Criteria: criteriaValue?.value ? criteriaValue?.value : null,
        PlantId: costData?.PlantId ? costData?.PlantId : null,
        VendorId: costData?.VendorId ? costData?.VendorId : null,
        CustomerId: costData?.CustomerId ? costData?.CustomerId : null,
        EffectiveDate: CostingEffectiveDate ? CostingEffectiveDate : null,
        EFreightLoadType: freightType ? freightType : null,
        CostingTypeId: costData?.CostingTypeId ? costData?.CostingTypeId : null,
      }
      dispatch(getRateByCapacityCriteria(data, res => {
        if (res && res?.data && res?.data?.Result) {
          let Data = res?.data?.Data;
          setValue('Rate', Data?.Rate)
          setFullTruckLoadId(Data?.FullTruckLoadId)
          errors.Rate = {}
        } else {
          setValue('Rate', '')
        }
      }))
    }
  }

  /**
  * @method handleCriteriaChange
  * @description  CRITERIA CHANGE HANDLE
  */
  const handleCriteriaChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCriteria(newValue)
      calculateApplicabilityCost(newValue.value)
      callFreightAPI(capacity, newValue)
    } else {
      setCriteria([])
      setValue('Rate', '')
    }
  }


  /**
  * @method handleApplicabilityChange
  * @description  APPLICABILITY CHANGE HANDLE
  */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setApplicability(newValue)
      calculateCost(newValue.label)
    } else {
      setApplicability([])
    }
  }

  const calculateCostForPerKg = () => {
    const RateAsPercentage = getValues('Rate');
    let arr = _.map(RMCCTabData, 'CostingPartDetails.CostingRawMaterialsCost')
    let perKgFinishWeight = 0
    arr && arr?.map(item => {
      perKgFinishWeight = item && item?.reduce((accummlator, el) => {
        return accummlator + checkForNull(el?.FinishWeight)
      }, 0)
    })
    // setTotalFinishWeight(perKgFinishWeight)
    let totalFreightCost = checkForNull(perKgFinishWeight) * checkForNull(RateAsPercentage)
    setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
    errors.FreightCost = {}
    setFreightCost(totalFreightCost)
  }

  /**
   * @method calculateCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateCost = (Text) => {
    const { NetRawMaterialsCost, NetBoughtOutPartCost } = headCostData;

    const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headCostData.NetConversionCost) - checkForNull(headCostData.TotalOtherOperationCostPerAssembly) : headCostData.ProcessCostTotal + headCostData.OperationCostTotal
    const RMBOPCC = checkForNull(NetRawMaterialsCost) + checkForNull(NetBoughtOutPartCost) + ConversionCostForCalculation
    const RMBOP = checkForNull(NetRawMaterialsCost) + checkForNull(NetBoughtOutPartCost);
    const RMCC = checkForNull(NetRawMaterialsCost) + checkForNull(ConversionCostForCalculation);
    const BOPCC = checkForNull(NetBoughtOutPartCost) + checkForNull(ConversionCostForCalculation)
    const RateAsPercentage = getValues('Rate');
    let dataList = CostingDataList && CostingDataList.length > 0 ? CostingDataList[0] : {}
    const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost)


    let totalFreightCost = ''
    switch (Text) {
      case 'RM':
      case 'Part Cost':
        totalFreightCost = checkForNull(NetRawMaterialsCost) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;

      case 'BOP':
        totalFreightCost = checkForNull(NetBoughtOutPartCost) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;

      case 'RM + CC':
      case 'Part Cost + CC':
        totalFreightCost = checkForNull(RMCC) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;

      case 'BOP + CC':
        totalFreightCost = checkForNull(BOPCC) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;
      case 'CC':
        totalFreightCost = checkForNull(ConversionCostForCalculation) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;

      case 'RM + CC + BOP':
      case 'Part Cost + CC + BOP':
        totalFreightCost = checkForNull(RMBOPCC) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;

      case 'RM + BOP':
      case 'Part Cost + BOP':
        totalFreightCost = checkForNull(RMBOP) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;
      case 'Net Cost':
        totalFreightCost = checkForNull(totalTabCost) * calculatePercentage(RateAsPercentage)
        setValue('FreightCost', totalFreightCost ? checkForDecimalAndNull(totalFreightCost, getConfigurationKey().NoOfDecimalForPrice) : '')
        setFreightCost(totalFreightCost)
        break;

      default:
        break;
    }
    errors.FreightCost = {}
  }

  // MAY BE USED LATER 
  const handleQuantityChange = (event) => {
    if (!isNaN(event.target.value)) {
      const Rate = getValues('Rate')
      if (Rate !== '') {
        const cost = checkForNull(Rate) * checkForNull(event.target.value);
        setValue('FreightCost', cost ? checkForDecimalAndNull(cost, getConfigurationKey().NoOfDecimalForPrice) : '');
      } else {
        setValue('FreightCost', '');
      }
    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
   * @method calculateApplicabilityCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateApplicabilityCost = (Text) => {

  }

  // WILL BE USED LATER FOR OTHER RADIO BUTON CALCULATION
  /**
    * @method IsPartTruckToggle
    * @description FREIGHT TYPE 
    */
  const IsPartTruckToggle = () => {
    setIsPartTruckLoad(!IsPartTruckLoad)
  }

  /**
  * @method onPressHeads
  * @description FREIGHT FLAG
  */
  const onPressHeads = (FreightFlag) => {
    setfreightType(FreightFlag)
    showFieldsFunction(FreightFlag)
    setValue('Applicability', '')
    setValue('Criteria', '')
    setValue('Rate', '')
    setValue('Quantity', '')
    setValue('FreightCost', '')
    setValue('Capacity', '')
    setApplicability([])
    setCapacity('')
    errors.FreightCost = {}
    errors.Rate = {}
  }

  /**
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({ Applicability: '' })
    props.closeDrawer('', {})
  }

  const onSubmit = data => {
    let freightTypeText = '';

    if (freightType === Fixed) freightTypeText = 'Fixed';
    if (freightType === Percentage) freightTypeText = 'Percentage';
    if (freightType === FullTruckLoad) freightTypeText = 'Full Truck Load';
    if (freightType === PartTruckLoad) freightTypeText = 'Part Truck Load';

    let formData = {
      FreightDetailId: isEditFlag ? rowObjData?.FreightDetailId : '',
      FreightId: isEditFlag ? rowObjData.FreightId : '',
      IsPartTruckLoad: freightTypeText,
      Capacity: data?.Capacity?.value,
      Criteria: freightType === Percentage ? applicability?.label : data?.Criteria?.value,
      Rate: data?.Rate,
      Quantity: checkForNull(data?.Quantity),
      FreightCost: freightType === Percentage ? freightCost : data?.FreightCost,
      Freight: '',
      EFreightLoadType: freightType,
      FreightType: freightTypeText,
      FreightCRMHead: data?.crmHeadFreight ? data?.crmHeadFreight?.label : '',
      FullTruckLoadId: isEditFlag ? rowObjData?.FullTruckLoadId : fullTruckLoadId,
    }
    toggleDrawer('', formData)
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
          <div className={'drawer-wrapper freight-drawer'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{isEditFlag ? 'Update Freight' : 'Add Freight'}</h3>
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
                    <label className={'left-title'}>{'Freight Type'}</label>
                  </Col>
                  <Col md="12" className="switch mb15">
                    <label className="switch-level">
                      <div className={'left-title'}>{'Full Truck Load'}</div>
                      <Switch
                        onChange={IsPartTruckToggle}
                        checked={IsPartTruckLoad}
                        id="normal-switch"
                        disabled={false}
                        background="#4DC771"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        offColor="#4DC771"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        height={20}
                        width={46}
                      />
                      <div className={'right-title'}>{'Part Truck Load'}</div>
                    </label>
                  </Col> */}
                  <Col md="12">
                    <Label id="Add_FreightType_Full_Truck" className={'pl0 pr-3 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={(freightType === FullTruckLoad) ? true : false}
                        onClick={() => onPressHeads(FullTruckLoad)}
                        disabled={isEditFlag ? true : false}
                      />{' '}
                      <span>Full Truck Load</span>
                    </Label>
                    <Label id="Add_FreightType_Part_Truck" className={'pl0 pr-3 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={freightType === PartTruckLoad ? true : false}
                        onClick={() => onPressHeads(PartTruckLoad)}
                        disabled={isEditFlag ? true : false}
                      />{' '}
                      <span>Part Truck Load</span>
                    </Label>
                    <Label id="Add_FreightType_Fixed_Truck" className={'pl0 pr-3 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={freightType === Fixed ? true : false}
                        onClick={() => onPressHeads(Fixed)}
                        disabled={isEditFlag ? true : false}
                      />{' '}
                      <span>Fixed</span>
                    </Label>
                    <Label id="Add_FreightType_Percentage_Truck" className={'pl0 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={freightType === Percentage ? true : false}
                        onClick={() => onPressHeads(Percentage)}
                        disabled={isEditFlag ? true : false}
                      />{' '}
                      <span>Percentage</span>
                    </Label>
                    {/* <Label id="Add_FreightType_Per_Kg_Truck" className={'pl0 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={freightType === Per_Kg_Load ? true : false}
                        onClick={() => onPressHeads(Per_Kg_Load)}
                        disabled={isEditFlag ? true : false}
                      />{' '}
                      <span>Per Kg</span>
                    </Label> */}
                  </Col>
                  {showFields?.Capacity && <Col md="12">
                    <SearchableSelectHookForm
                      label={'Capacity'}
                      name={'Capacity'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={capacity.length !== 0 ? capacity : ''}
                      options={renderListing('Capacity')}
                      mandatory={true}
                      handleChange={handleCapacityChange}
                      errors={errors.Capacity}
                      disabled={false}
                    />
                  </Col>}
                  {showFields?.Applicability && <Col md="12">
                    <SearchableSelectHookForm
                      label={'Applicability'}
                      name={'Applicability'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={applicability.length !== 0 ? applicability : ''}
                      options={renderListing('Applicability')}
                      mandatory={true}
                      handleChange={handleApplicabilityChange}
                      errors={errors.Applicability}
                      disabled={false}
                    />
                  </Col>}
                  {showFields?.Criteria && <Col md="12">
                    <SearchableSelectHookForm
                      label={'Rate Criteria'}
                      name={'Criteria'}
                      placeholder={'Select'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={criteria.length !== 0 ? criteria : ''}
                      options={renderListing('RateCriteria')}
                      mandatory={true}
                      handleChange={handleCriteriaChange}
                      errors={errors.Criteria}
                      disabled={false}
                    />
                  </Col>}
                  {showFields?.Rate && <Col md="12">
                    <TextFieldHookForm
                      label={`${(freightType === Percentage) ? 'Percentage' : 'Rate'}`}
                      name={'Rate'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={freightType !== Fixed ? true : false}
                      rules={{
                        required: freightType !== Fixed ? true : false,
                        validate: freightType !== Fixed ? { number, checkWhiteSpaces, percentageLimitValidation } : {},
                        max: {
                          value: 100,
                          message: 'Percentage should be less than 100'
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Rate}
                      disabled={(freightType !== Percentage) ? true : false}
                    // disabled={(freightType !== Percentage  ) ? true : false} OPEN WHEN API INTEGRATED
                    />
                  </Col>}
                  {showFields?.Quantity && <Col md="12">
                    <TextFieldHookForm
                      label="Quantity"
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={freightType !== Fixed && freightType !== Percentage ? true : false}
                      rules={{
                        required: freightType !== Fixed && freightType !== Percentage ? true : false,
                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                        // maxLength: 4,
                      }}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleQuantityChange(e)
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Quantity}
                      disabled={(freightType === Fixed || freightType === Percentage) ? true : false}
                    />
                  </Col>}

                  <Col md="12">
                    <TextFieldHookForm
                      label="Cost"
                      name={'FreightCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      rules={{
                        required: true,
                        validate: freightType === Fixed ? { number, checkWhiteSpaces, decimalNumberLimit6 } : {}
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.FreightCost}
                      disabled={freightType !== Fixed ? true : false}
                    />
                  </Col>

                  {initialConfiguration.IsShowCRMHead && <Col md="12">
                    <SearchableSelectHookForm
                      name={`crmHeadFreight`}
                      type="text"
                      label="CRM Head"
                      errors={`${errors.crmHeadFreight}`}
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
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      id="AddFreight_Cancel"
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={"cancel-icon"}></div> {'Cancel'}
                    </button>

                    <button
                      id="AddFreight_Save"
                      type={'submit'}
                      className="submit-button save-btn">
                      <div className={"save-icon"}></div>
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

export default React.memo(AddFreight);