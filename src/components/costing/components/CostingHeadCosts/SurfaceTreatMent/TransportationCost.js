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
  const [percentageLimit, setPercentageLimit] = useState(false);

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const dispatch = useDispatch()



  useEffect(() => {

    if (props?.data && Object.keys(props.data).length > 0) {

      setValue('UOM', data && data.UOM !== undefined ? { label: data.UOM, value: data.UOMId } : [])
      setValue('Quantity', data && data.Quantity !== undefined ? data.Quantity : 0)
      setValue('Rate', data && data.Rate !== undefined ? data.Rate : 0)
      setValue('TransportationCost', data && data.TransportationCost !== undefined ? checkForDecimalAndNull(data.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : 0)
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
    }

    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }

    if (!CostingViewMode && !IsLocked) {

      if (props.IsAssemblyCalculation) {
        // props.setAssemblyTransportationCost(tempObj, Params, item)
        props.getTransportationObj({ tempObj, Params, item })
      } else {
        // props.setTransportationCost(tempObj, Params)
        props.getTransportationObj({ tempObj, Params })
      }
    }

  }, [uom, Rate, Quantity, transportCost]);

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
      setValue('TransportationCost', '')
      setTransportCost('')
      setTransportationType(newValue.value)
      setUOM(newValue)
    } else {
      setUOM([])
      setTransportationType('')
    }
  }

  const handleRateChange = (event) => {
    if (!isNaN(event.target.value)) {
      const Quantity = getValues('Quantity')

      if (TransportationType === 'Percentage') {
        setTransportCost(checkForNull(props.surfaceCost * calculatePercentage(event.target.value)))
        setValue('TransportationCost', checkForDecimalAndNull(props.surfaceCost * calculatePercentage(event.target.value), initialConfiguration.NoOfDecimalForPrice))
        setRate(event.target.value)
        if (event.target.value > 100) {
          setPercentageLimit(true)
        }
        else if (event.target.value < 100) {
          setPercentageLimit(false)
        }
      } else {
        if (Quantity !== '') {
          const cost = Quantity * event.target.value;
          setTransportCost(checkForNull(cost))
          setValue('TransportationCost', checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice))
          setRate(event.target.value)
        } else {
          setTransportCost(0)
          setValue('TransportationCost', 0)
          setRate(event.target.value)
        }
      }
    } else {
      Toaster.warning('Please enter valid number.')
      event.target.value = '';
    }
  }

  const handleQuantityChange = (event) => {
    if (!isNaN(event.target.value)) {
      const Rate = getValues('Rate')


      if (Rate !== '') {
        const cost = Rate * event.target.value;
        setTransportCost(cost)
        setValue('TransportationCost', checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice));
        setQuantity(event.target.value);
      } else {
        setTransportCost(0)
        setValue('TransportationCost', 0);
        setQuantity(event.target.value);
      }
    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  const handleTransportChange = (event) => {
    if (!isNaN(event.target.value)) {
      setTransportCost(event.target.value)
      setValue('TransportationCost', event.target.value)
    }
    else {
      Toaster.warning('Please enter valid number.')
    }
  }

  const reCalculation = () => {

    if ((props.surfaceCost === 0 || props.surfaceCost === null) && data.UOM !== 'Fixed') {
      setValue('UOM', {})
      setValue('Rate', '')
      setValue('Quantity', '')
    } else {
      setValue('UOM', { label: data.UOM, value: data.UOMId })
      setValue('Rate', checkForNull(data.Rate))
      setValue('Quantity', checkForNull(data.Quantity))
    }
    if (data.UOM === 'Rate') {
      const cost = (props.surfaceCost === 0 || props.surfaceCost === null) ? 0 : checkForNull(data.Rate) * checkForNull(data.Quantity);
      setTransportCost(cost)
      setValue('TransportationCost', checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice));
    } else if (data.UOM === 'Fixed') {
      setTransportCost(data.TransportationCost)
      setValue('TransportationCost', checkForDecimalAndNull(data.TransportationCost, initialConfiguration.NoOfDecimalForPrice));
    } else if (data.UOM === 'Percentage') {
      const cost = (props.surfaceCost === 0 || props.surfaceCost === null) ? 0 : checkForNull(props.surfaceCost * calculatePercentage(checkForNull(data.Rate)));
      setTransportCost(cost)
      setValue('TransportationCost', checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice))
      setRate((props.surfaceCost === 0 || props.surfaceCost === null) ? 0 : data.Rate)
    } else {
      setTransportCost(0)
      setRate(0)
      setValue('TransportationCost', checkForDecimalAndNull(data.TransportationCost, initialConfiguration.NoOfDecimalForPrice));
    }
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
                      pattern: {
                        //value: /^[0-9]*$/i,
                        value: /^[0-9]\d*(\.\d+)?$/i,
                        message: 'Invalid Number.'
                      },
                    }}
                    defaultValue={''}
                    className="mtn1"
                    customClassName={'withBorder'}
                    handleChange={(e) => {
                      e.preventDefault()
                      handleRateChange(e)
                    }}
                    errors={errors && errors.Rate}
                    disabled={TransportationType === 'Fixed' || (CostingViewMode || IsLocked) ? true : false}
                  />
                  {TransportationType === 'Percentage' && percentageLimit && <WarningMessage dClass={"error-message"} textClass={`${percentageLimit ? 'pt-1' : ''}`} message={"Percentage cannot be greater than 100"} />}
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
                    //required: true,
                    pattern: {
                      //value: /^[0-9]*$/i,
                      value: /^[0-9]\d*(\.\d+)?$/i,
                      message: 'Invalid Number.'
                    },
                  }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  handleChange={(e) => {
                    e.preventDefault()
                    handleQuantityChange(e)
                  }}
                  errors={errors && errors.Quantity}
                  disabled={(TransportationType === 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
                />

              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label="Cost"
                  name={`TransportationCost`}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    //required: true,
                    pattern: {
                      value: /^\d*\.?\d*$/,
                      message: 'Invalid Number.'
                    },
                  }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  handleChange={(e) => {
                    e.preventDefault()
                    handleTransportChange(e)
                  }}
                  errors={errors && errors.TransportationCost}
                  disabled={(TransportationType !== 'Fixed' || TransportationType === 'Percentage') || (CostingViewMode || IsLocked) ? true : false}
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