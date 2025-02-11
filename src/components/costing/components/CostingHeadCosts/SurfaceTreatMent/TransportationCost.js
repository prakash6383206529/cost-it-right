import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import Toaster from '../../../../common/Toaster';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { getUOMSelectList } from '../../../../../actions/Common'
import { ViewCostingContext } from '../../CostingDetails'
import WarningMessage from '../../../../common/WarningMessage';
import TooltipCustom from '../../../../common/Tooltip';
import { number, decimalNumberLimit6, checkWhiteSpaces, percentageLimitValidation } from "../../../../../helper/validation";
import { NUMBERMAXLENGTH } from '../../../../../config/masterData';
import { CRMHeads } from '../../../../../config/constants';

function TransportationCost(props) {

  const { data, item } = props;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const CostingViewMode = useContext(ViewCostingContext);


  const { register, control, formState: { errors }, setValue, getValues, handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [uom, setUOM] = useState([])
  const [Quantity, setQuantity] = useState('')
  const [Rate, setRate] = useState('')
  const [TransportationType, setTransportationType] = useState()
  const [transportCost, setTransportCost] = useState(checkForNull(data?.TransportationCost))
  const [reRenderComponent, setReRenderComponent] = useState(false)
  const [count, setCount] = useState(0)
  const [crmHead, setCrmHead] = useState('')

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const dispatch = useDispatch()



  useEffect(() => {

    if (props?.data && Object.keys(props.data).length > 0) {

      setValue('UOM', data && data.UOM !== undefined ? { label: data.UOM, value: data.UOMId } : [])
      setValue('Quantity', data && data.Quantity !== undefined ? data.Quantity : 0)
      setValue('Rate', data && data.Rate !== undefined ? data.Rate : 0)
      setValue('crmHeadTransportation', data && data.TransportationCRMHead !== undefined ? { label: data.TransportationCRMHead, value: 1 } : '')
      setValue('TransportationCost', data && data.TransportationCost !== undefined ? checkForDecimalAndNull(data.TransportationCost, initialConfiguration?.NoOfDecimalForPrice) : 0)
      // setRate(data && data.Rate !== undefined ? data.Rate : 0)
      // setUOM(data && data.UOMId !== undefined ? { label: data.UOM, value: data.UOMId } : [])
      // setQuantity(data && data.Quantity !== undefined ? data.Quantity : 0)
      setTransportationType(data && data.UOM !== undefined ? data.UOM : '')
      // setTransportCost(data && data.TransportationCost !== undefined ? data.TransportationCost : 0)
    }
  }, [props.data])


  useEffect(() => {
    reCalculation()
  }, [props.surfaceCost])

  useEffect(() => {
    let tempObj = {
      TransporationDetailId: '',
      UOM: getValues('UOM') ? getValues('UOM').label : '',
      UOMId: getValues('UOM') ? getValues('UOM').value : '',
      Rate: getValues('Rate'),
      Quantity: getValues('Quantity'),
      TransportationCost: transportCost,
      TransportationCRMHead: crmHead
    }

    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }

    if (!CostingViewMode && !IsLocked) {

      if (props.IsAssemblyCalculation) {
        // props.setAssemblyTransportationCost(tempObj, Params, item)
        props.getTransportationObj({ tempObj, Params, item }, errors)
      } else {
        // props.setTransportationCost(tempObj, Params)
        props.getTransportationObj({ tempObj, Params }, errors)
      }
    }

  }, [uom, Rate, Quantity, transportCost, reRenderComponent, crmHead]);

  useEffect(() => {
    dispatch(getUOMSelectList(() => { }))
  }, []);

  /**
  * @method handleUOMChange
  * @description  USED TO HANDLE UOM CHANGE
  */
  const handleUOMChange = (newValue) => {
    if (newValue && newValue !== '') {
      setValue('Rate', '')
      setValue('Quantity', '')
      setValue('TransportationCost', 0)
      setTransportCost('')
      setTransportationType(newValue.value)
      setUOM(newValue)
    } else {
      setUOM([])
      setTransportationType('')
    }
    errors.TransportationCost = {}
    errors.Rate = {}
    errors.Quantity = {}
  }

  const onCRMHeadChange = (e) => {
    setCrmHead(e?.label)
  }

  const handleRateChange = (event) => {
    if (!isNaN(event.target.value)) {
      const Quantity = getValues('Quantity')

      if (TransportationType === 'Percentage') {
        setTransportCost(checkForNull(props.surfaceCost * calculatePercentage(event.target.value)))
        setValue('TransportationCost', checkForDecimalAndNull(props.surfaceCost * calculatePercentage(event.target.value), initialConfiguration?.NoOfDecimalForPrice))
        setRate(event.target.value)
      } else {
        if (Quantity !== '') {
          const cost = Quantity * event.target.value;
          setTransportCost(checkForNull(cost))
          setValue('TransportationCost', checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice))
          setRate(event.target.value)
        } else {
          setTransportCost(0)
          setValue('TransportationCost', 0)
          setRate(event.target.value)
        }
      }
    }
  }

  const handleQuantityChange = (event) => {
    if (!isNaN(event.target.value)) {
      const Rate = getValues('Rate')


      if (Rate !== '') {
        const cost = Rate * event.target.value;
        setTransportCost(cost)
        setValue('TransportationCost', checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice));
        setQuantity(event.target.value);
      } else {
        setTransportCost(0)
        setValue('TransportationCost', 0);
        setQuantity(event.target.value);
      }
    }
  }

  const handleTransportChange = (event) => {
    if (!isNaN(event.target.value)) {
      setTransportCost(event.target.value)
      setValue('TransportationCost', event.target.value)
    }
  }


  // This function is responsible for recalculating transportation cost based on the user's inputs
  const reCalculation = () => {
    let cost = 0;
    let newTransportCost = 0;

    // If surfaceCost is not provided or is 0, and the UOM is set to Percentage, reset the UOM, Rate and Quantity fields
    if ((props.surfaceCost === 0 || props.surfaceCost === null) && data.UOM === 'Percentage') {
      setValue('UOM', {})
      setValue('Rate', '')
      setValue('Quantity', '')
    } else {
      // If this is the first time the function is being called, set UOM, Rate and Quantity fields with the initial data
      if (count === 0) {
        setValue('UOM', { label: data.UOM, value: data.UOMId })
        setValue('Rate', checkForNull(data.Rate))
        setValue('Quantity', checkForNull(data.Quantity))
      }
    }

    // Calculate transportation cost based on UOM
    switch (data.UOM) {
      // If UOM is Rate, calculate the cost as Rate * Quantity and set newTransportCost accordingly
      case 'Rate':
        cost = checkForNull(data.Rate) * checkForNull(data.Quantity);
        newTransportCost = checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice);
        break;

      // If UOM is Fixed, set newTransportCost to the value provided in the data
      case 'Fixed':
        newTransportCost = checkForDecimalAndNull(data.TransportationCost, initialConfiguration?.NoOfDecimalForPrice);
        break;

      // If UOM is Percentage, calculate the cost as surfaceCost * Rate * (percentage/100) and set newTransportCost accordingly.
      // Also, set Rate value and check if surfaceCost is provided, if not, set cost to 0
      case 'Percentage':
        cost = (props.surfaceCost === 0 || props.surfaceCost === null) ? 0 : checkForNull(props.surfaceCost * calculatePercentage(checkForNull(data.Rate)));
        newTransportCost = checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice);
        setRate((props.surfaceCost === 0 || props.surfaceCost === null) ? 0 : data.Rate);
        break;

      // If UOM is not Rate, Fixed or Percentage, set newTransportCost to the value provided in the data
      default:
        newTransportCost = checkForDecimalAndNull(data.TransportationCost, initialConfiguration?.NoOfDecimalForPrice);
        break;
    }

    // If the UOM label is present or newTransportCost is 0, update the transportation cost and set the value of TransportationCost field
    if (getValues('UOM').label || newTransportCost === 0) {
      setTransportCost(newTransportCost);
      setValue('TransportationCost', newTransportCost);
    }

    // Re-render the component and update the count by 1
    setReRenderComponent(!reRenderComponent);
    setCount(count + 1);
  }


  /**
  * @method renderListing
  * @description RENDER LISTING
  */
  const renderListing = (label) => {

    if (label === 'UOM') {
      // UOMSelectList && UOMSelectList.map(item => {
      //   if (item.Value === '0') return false;
      //   temp.push({ label: item.Text, value: item.Value })
      //   return null;
      // });
      // return temp;
      return [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Percentage', value: 'Percentage' },
        { label: 'Rate', value: 'Rate' },
      ]
    }

  }
  /**
* @method onSubmit
* @description Used to Submit the form
*/
  const onSubmit = (values) => { }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0 costing-page-drawer">
        <div>
          <form
            noValidate
            className="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Row>
              <Col md="12">
                <div className="left-border">
                  {'Extra Cost:'}
                </div>
              </Col>
            </Row>

            <Row>
              {initialConfiguration?.IsShowCRMHead && <Col md="3">
                <SearchableSelectHookForm
                  name={`crmHeadTransportation`}
                  type="text"
                  label="CRM Head"
                  errors={`${errors.crmHeadTransportation}`}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                  }}
                  defaultValue={item.TransportationCRMHead ? { label: item.TransportationCRMHead, value: 1 } : ''}
                  placeholder={'Select'}
                  options={CRMHeads}
                  className="st-crm-head"
                  required={false}
                  handleChange={onCRMHeadChange}
                  disabled={CostingViewMode}
                />
              </Col>}
              <Col md="3">
                <SearchableSelectHookForm
                  label={'Type'}
                  name={'UOM'}
                  placeholder={'Select'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: true }}
                  register={register}
                  defaultValue={uom.length !== 0 ? uom : ''}
                  options={renderListing('UOM')}
                  mandatory={false}
                  handleChange={handleUOMChange}
                  disabled={(CostingViewMode || IsLocked) ? true : false}
                  errors={errors.UOM}
                />
              </Col>
              <Col md="3">
                <div className='p-relative error-wrapper'>
                  <TextFieldHookForm
                    label={`${TransportationType === 'Percentage' ? 'Percentage' : 'Rate'}`}
                    name={`Rate`}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                      max: TransportationType === 'Percentage' ? {
                        value: 100,
                        message: 'Percentage cannot be greater than 100'
                      } : {},
                    }}
                    defaultValue={''}
                    customClassName={'withBorder'}
                    handleChange={(e) => {
                      e.preventDefault()
                      handleRateChange(e)
                    }}
                    errors={errors && errors.Rate}
                    disabled={!TransportationType || TransportationType === 'Fixed' || (CostingViewMode || IsLocked) ? true : false}
                  />
                </div>
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Quantity"
                  name={`Quantity`}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    validate: TransportationType === 'Percentage' ? { number, checkWhiteSpaces, percentageLimitValidation } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                    maxLength: NUMBERMAXLENGTH
                  }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  handleChange={(e) => {
                    e.preventDefault()
                    handleQuantityChange(e)
                  }}
                  errors={errors && errors.Quantity}
                  disabled={(!TransportationType || TransportationType === 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
                />

              </Col>
              <Col md="3">{TransportationType !== 'Fixed' && <TooltipCustom disabledIcon={true} id="operation-cost" tooltipText={TransportationType === 'Percentage' ? "Cost = (Operation Cost * Percentage)/100" : "Cost = (Rate * Quantity)"} />}
                <TextFieldHookForm
                  label="Cost"
                  id="operation-cost"
                  name={`TransportationCost`}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                  }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  handleChange={(e) => {
                    e.preventDefault()
                    handleTransportChange(e)
                  }}
                  errors={errors && errors.TransportationCost}
                  disabled={(!TransportationType || TransportationType !== 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
                />

              </Col>
            </Row>
          </form>
        </div>
      </div>
    </ >
  );
}

export default TransportationCost;