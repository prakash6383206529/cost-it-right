import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Label } from 'reactstrap';
import { getFreigtFullTruckCapacitySelectList, getRateCriteriaByCapacitySelectList, getRateByCapacityCriteria } from '../../actions/Costing';
import { netHeadCostContext } from '../CostingDetailStepTwo';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, } from '../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../helper';
import Switch from "react-switch";
import { Fixed, FullTruckLoad, PartTruckLoad, Percentage } from '../../../../config/constants';

function AddFreight(props) {

  const { rowObjData, isEditFlag } = props;

  const defaultValues = {
    FreightDetailId: rowObjData && rowObjData.FreightDetailId !== undefined ? rowObjData.FreightDetailId : '',
    FreightId: rowObjData && rowObjData.FreightId !== undefined ? rowObjData.FreightId : '',
    Capacity: rowObjData && rowObjData.Capacity !== undefined ? { label: rowObjData.Capacity, value: rowObjData.Capacity } : [],
    Criteria: rowObjData && rowObjData.Criteria !== undefined ? { label: rowObjData.Criteria, value: rowObjData.Criteria } : '',
    Rate: rowObjData && rowObjData.Rate !== undefined ? rowObjData.Rate : '',
    Quantity: rowObjData && rowObjData.Quantity !== undefined ? rowObjData.Quantity : '',
    FreightCost: rowObjData && rowObjData.FreightCost !== undefined ? rowObjData.FreightCost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const headCostData = useContext(netHeadCostContext)

  const [capacity, setCapacity] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [IsPartTruckLoad, setIsPartTruckLoad] = useState(isEditFlag ? rowObjData.IsPartTruckLoad : false);

  const [freightType, setfreightType] = useState(isEditFlag ? rowObjData.EFreightLoadType : '');
  const [applicability, setApplicability] = useState(isEditFlag ? { label: rowObjData.Criteria, value: rowObjData.Criteria } : []);

  useEffect(() => {
    setTimeout(() => {
      setfreightType(isEditFlag ? rowObjData.EFreightLoadType : '')
    }, 200)
  }, [rowObjData]);

  useEffect(() => {
    dispatch(getFreigtFullTruckCapacitySelectList())
  }, []);

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
    if (applicability) {
      calculateCost(applicability.label)
    }
  }, [RateFieldValue]);

  const freightFullTruckCapacitySelectList = useSelector(state => state.freight.freightFullTruckCapacitySelectList)
  const rateCriteriaByCapacitySelectList = useSelector(state => state.costing.rateCriteriaByCapacitySelectList)


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

    if (label === 'Capacity') {
      freightFullTruckCapacitySelectList && freightFullTruckCapacitySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'RateCriteria') {
      rateCriteriaByCapacitySelectList && rateCriteriaByCapacitySelectList.map(item => {
        if (item.Value === '0') return false;
        temp.push({ label: item.Text, value: item.Value })
        return null;
      });
      return temp;
    }

    if (label === 'Applicability') {
      return [
        { label: 'RM', value: 'RM' },
        { label: 'CC', value: 'CC' },
        { label: 'RM + CC', value: 'RM + CC' },
        { label: 'RM + BOP', value: 'RM + BOP' },
        { label: 'RM + CC + BOP', value: 'RM + CC + BOP' },
      ];
    }

  }

  /**
  * @method handleCapacityChange
  * @description  CAPACITY CHANGE HANDLE
  */
  const handleCapacityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setCapacity(newValue)
      dispatch(getRateCriteriaByCapacitySelectList(newValue.value, res => { }))
    } else {
      setCapacity([])
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
      const data = { Capacity: capacity.value, Criteria: newValue.value }
      dispatch(getRateByCapacityCriteria(data, res => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.DynamicData;
          setValue('Rate', Data.Rate)
        }
      }))
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
      calculateCost(newValue.value)
    } else {
      setApplicability([])
    }
  }

  /**
   * @method calculateCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateCost = (Text) => {
    const { NetRawMaterialsCost, NetBoughtOutPartCost, NetConversionCost, NetTotalRMBOPCC } = headCostData;
    const RateAsPercentage = getValues('Rate');

    switch (Text) {
      case 'RM':
        setValue('FreightCost', checkForDecimalAndNull(NetRawMaterialsCost * calculatePercentage(RateAsPercentage), 2))
        break;

      case 'RM + CC':
        setValue('FreightCost', checkForDecimalAndNull((NetRawMaterialsCost + NetConversionCost) * calculatePercentage(RateAsPercentage), 2))
        break;

      case 'CC':
        setValue('FreightCost', checkForDecimalAndNull(NetConversionCost * calculatePercentage(RateAsPercentage), 2))
        break;

      case 'RM + CC + BOP':
        setValue('FreightCost', checkForDecimalAndNull((NetTotalRMBOPCC) * calculatePercentage(RateAsPercentage), 2))
        break;

      case 'RM + BOP':
        setValue('FreightCost', checkForDecimalAndNull((NetRawMaterialsCost + NetBoughtOutPartCost) * calculatePercentage(RateAsPercentage), 2))
        break;

      default:
        break;
    }
  }

  const handleQuantityChange = (event) => {
    if (!isNaN(event.target.value)) {
      const Rate = getValues('Rate')
      if (Rate !== '') {
        const cost = Rate * event.target.value;
        setValue('FreightCost', checkForDecimalAndNull(cost, 2));
      } else {
        setValue('FreightCost', 0);
      }
    } else {
      toastr.warning('Please enter valid number.')
    }
  }

  /**
   * @method calculateApplicabilityCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateApplicabilityCost = (Text) => {

  }

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
    setValue('Applicability', '')
    setValue('Criteria', '')
    setValue('Rate', '')
    setValue('Quantity', '')
    setValue('FreightCost', '')
    setApplicability([])
    setfreightType(FreightFlag)
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
    if (freightType === FullTruckLoad) freightTypeText = 'FTL';
    if (freightType === PartTruckLoad) freightTypeText = 'PTL';

    let formData = {
      FreightDetailId: isEditFlag ? rowObjData.FreightDetailId : '',
      FreightId: isEditFlag ? rowObjData.FreightId : '',
      IsPartTruckLoad: freightTypeText,
      Capacity: freightType === Fixed || freightType === Percentage ? '' : (!IsPartTruckLoad ? data.Capacity.value : ''),
      Criteria: freightType === Fixed ? '' : (freightType === Percentage ? applicability.label : data.Criteria.value),
      Rate: freightType === Fixed ? '' : data.Rate,
      Quantity: freightType === Fixed || freightType === Percentage ? '' : data.Quantity,
      FreightCost: data.FreightCost,
      Freight: '',
      EFreightLoadType: freightType,
      FreightType: freightTypeText,
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
          <div className={'drawer-wrapper'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{isEditFlag ? 'Update Freight' : 'ADD Freight'}</h3>
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
                    <Label className={'pl0 pr-3 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={freightType === FullTruckLoad ? true : false}
                        onClick={() => onPressHeads(FullTruckLoad)}
                        disabled={true}
                      />{' '}
                      <span>Full Truck Load</span>
                    </Label>
                    <Label className={'pl0 pr-3 w-auto radio-box mb-0 pb-3'} check>
                      <input
                        type="radio"
                        name="freightType"
                        register={register}
                        checked={freightType === PartTruckLoad ? true : false}
                        onClick={() => onPressHeads(PartTruckLoad)}
                        disabled={true}
                      />{' '}
                      <span>Part Truck Load</span>
                    </Label>
                    <Label className={'pl0 pr-3 w-auto radio-box mb-0 pb-3'} check>
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
                    <Label className={'pl0 w-auto radio-box mb-0 pb-3'} check>
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
                  </Col>
                  {/* <Col md="12">
                    <SearchableSelectHookForm
                      label={'Capacity'}
                      name={'Capacity'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: (freightType !== Fixed && freightType !== Percentage) ? true : false }}
                      register={register}
                      defaultValue={capacity.length !== 0 ? capacity : ''}
                      options={renderListing('Capacity')}
                      mandatory={freightType !== Fixed && freightType !== Percentage ? true : false}
                      handleChange={handleCapacityChange}
                      errors={errors.Capacity}
                      disabled={(isEditFlag || freightType === Fixed || freightType === Percentage) ? true : false}
                    />
                  </Col> */}
                  <Col md="12">
                    {freightType === Percentage ?
                      <SearchableSelectHookForm
                        label={'Applicability'}
                        name={'Applicability'}
                        placeholder={'-Select-'}
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
                      :
                      <SearchableSelectHookForm
                        label={'Rate Criteria'}
                        name={'Criteria'}
                        placeholder={'-Select-'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: freightType !== Fixed ? true : false }}
                        register={register}
                        defaultValue={criteria.length !== 0 ? criteria : ''}
                        options={renderListing('RateCriteria')}
                        mandatory={freightType !== Fixed ? true : false}
                        handleChange={handleCriteriaChange}
                        errors={errors.Criteria}
                        disabled={(isEditFlag || freightType === Fixed) ? true : false}
                      />}
                  </Col>
                  <Col md="12">
                    <NumberFieldHookForm
                      label={`${freightType === Percentage ? 'Percentage' : 'Rate'}`}
                      name={'Rate'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={freightType !== Fixed ? true : false}
                      rules={{
                        required: freightType !== Fixed ? true : false,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
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
                      disabled={freightType !== Percentage ? true : false}
                    />
                  </Col>
                  {/* <Col md="12">
                    <TextFieldHookForm
                      label="Quantity"
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={freightType !== Fixed && freightType !== Percentage ? true : false}
                      rules={{
                        required: freightType !== Fixed && freightType !== Percentage ? true : false,
                        pattern: {
                          value: !isEditFlag ? /^[0-9]*$/i : '',
                          message: !isEditFlag ? 'Invalid Number.' : '',
                        },
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
                  </Col> */}

                  <Col md="12">
                    <TextFieldHookForm
                      label="Cost"
                      name={'FreightCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.FreightCost}
                      disabled={freightType !== Fixed ? true : false}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={"cancel-icon"}></div> {'Cancel'}
                    </button>

                    <button
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