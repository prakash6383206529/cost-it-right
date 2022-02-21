import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row, } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import Toaster from '../../../../common/Toaster';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import { getUOMSelectList } from '../../../../../actions/Common'

function TransportationCost(props) {
  const { data, item } = props;
  console.log('data: ', data);

  const defaultValues = {
    UOM: data && data.UOM !== undefined ? { label: data.UOM, value: data.UOMId } : [],
    Rate: data && data.Rate !== undefined ? data.Rate : 0,
    Quantity: data && data.Quantity !== undefined ? data.Quantity : 0,
    TransportationCost: data && data.TransportationCost !== undefined ? data.TransportationCost : 0,
  }

  const { register, control, formState: { errors }, setValue, getValues, handleSubmit } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    // defaultValues: defaultValues,
  });

  const [uom, setUOM] = useState([])
  const [Quantity, setQuantity] = useState('')
  const [Rate, setRate] = useState('')
  const [OldTransportObj, setOldTransportObj] = useState(data)
  const [TransportationType, setTransportationType] = useState()
  const [transportCost,setTransportCost] = useState('')

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const dispatch = useDispatch()

  // const fieldValues = useWatch({
  //   control,
  //   name: ['TransportationCost'],
  // });

  useEffect(()=>{
    
    if(props?.data && Object.keys(props.data).length >0){
console.log(props.data,"DATA");
     setValue('UOM',data && data.UOM !== undefined ? { label: data.UOM, value: data.UOMId } : [])
     setValue('Quantity',data && data.Quantity !== undefined ? data.Quantity : 0)
     setValue('Rate', data && data.Rate !== undefined ? data.Rate : 0)
  setValue('TransportationCost',data && data.TransportationCost !== undefined ? checkForDecimalAndNull(data.TransportationCost,initialConfiguration.NoOfDecimalForPrice) : 0)
  // setRate(data && data.Rate !== undefined ? data.Rate : 0)
  // setUOM(data && data.UOMId !== undefined ? { label: data.UOM, value: data.UOMId } : [])
  // setQuantity(data && data.Quantity !== undefined ? data.Quantity : 0)
  setTransportationType(data && data.UOM !== undefined ? data.UOM : '')
  // setTransportCost(data && data.TransportationCost !== undefined ? data.TransportationCost : 0)
    }
  },[props.data])

  useEffect(() => {
    let tempObj = {
      TransporationDetailId: '',
      UOM: getValues('UOM') ? getValues('UOM').label : '',
      UOMId: getValues('UOM') ? getValues('UOM').value: '',
      Rate: getValues('Rate'),
      Quantity: getValues('Quantity'),
      TransportationCost: transportCost,
    }
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }

    if (props.IsAssemblyCalculation) {
      props.setAssemblyTransportationCost(tempObj, Params, JSON.stringify(tempObj) !== JSON.stringify(OldTransportObj) ? true : false)
    } else {
      props.setTransportationCost(tempObj, Params)
    }

  }, [uom, Rate, Quantity,transportCost]);

  useEffect(() => {
    dispatch(getUOMSelectList(() => { }))
  }, []);

  const UOMSelectList = useSelector(state => state.comman.UOMSelectList)

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
        setTransportCost(checkForNull(item.CostingPartDetails.SurfaceTreatmentCost * calculatePercentage(event.target.value)))
        setValue('TransportationCost', checkForDecimalAndNull(item.CostingPartDetails.SurfaceTreatmentCost * calculatePercentage(event.target.value), initialConfiguration.NoOfDecimalForPrice))
        setRate(event.target.value)
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

  const handleTransportChange=(event)=>{
    if(!isNaN(event.target.value)){
      setTransportCost(event.target.value)
        setValue('TransportationCost',event.target.value)
    }
    else {
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
  * @method renderListing
  * @description RENDER LISTING
  */
  const renderListing = (label) => {

    const temp = [];

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
                  placeholder={'-Select-'}
                  Controller={Controller}
                  control={control}
                  rules={{ required: true }}
                  register={register}
                  defaultValue={uom.length !== 0 ? uom : ''}
                  options={renderListing('UOM')}
                  mandatory={false}
                  handleChange={handleUOMChange}
                  errors={errors.UOM}
                />
              </Col>
              <Col md="3">
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
                  className=""
                  customClassName={'withBorder'}
                  handleChange={(e) => {
                    e.preventDefault()
                    handleRateChange(e)
                  }}
                  errors={errors && errors.Rate}
                  disabled={TransportationType === 'Fixed' ? true : false}
                />
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
                  disabled={(TransportationType === 'Fixed' || TransportationType === 'Percentage') ? true : false}
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
                  disabled={(TransportationType !== 'Fixed' || TransportationType === 'Percentage') ? true : false}
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