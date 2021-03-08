import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getFreigtFullTruckCapacitySelectList, getRateCriteriaByCapacitySelectList, getRateByCapacityCriteria } from '../../actions/Costing';
import { netHeadCostContext } from '../CostingDetailStepTwo';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../helper';
import Switch from "react-switch";

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

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const headCostData = useContext(netHeadCostContext)

  const [capacity, setCapacity] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [IsPartTruckLoad, setIsPartTruckLoad] = useState(isEditFlag ? rowObjData.IsPartTruckLoad : false);

  useEffect(() => {
    dispatch(getFreigtFullTruckCapacitySelectList())
  }, []);

  const fieldValues = useWatch({
    control,
    name: ['PackagingPercentage'],
  });

  useEffect(() => {
    if (criteria) {
      calculateApplicabilityCost(criteria.value)
    }
  }, [fieldValues]);

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
  * @method cancel
  * @description used to Reset form
  */
  const cancel = () => {
    reset({ Applicability: '' })
    props.closeDrawer('', {})
  }

  const onSubmit = data => {
    let formData = {
      FreightDetailId: isEditFlag ? rowObjData.FreightDetailId : '',
      FreightId: isEditFlag ? rowObjData.FreightId : '',
      IsPartTruckLoad: IsPartTruckLoad,
      Capacity: !IsPartTruckLoad ? data.Capacity.value : '',
      Criteria: data.Criteria.value,
      Rate: data.Rate,
      Quantity: data.Quantity,
      FreightCost: data.FreightCost,
      Freight: '',
    }
    toggleDrawer('', formData)
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <Container>
          <div className={'drawer-wrapper'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'ADD Freight'}</h3>
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
                  <Col md="12" className="switch">
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
                  </Col>
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Capacity'}
                      name={'Capacity'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={capacity.length !== 0 ? capacity : ''}
                      options={renderListing('Capacity')}
                      mandatory={true}
                      handleChange={handleCapacityChange}
                      errors={errors.Capacity}
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>
                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Rate Criteria'}
                      name={'Criteria'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={criteria.length !== 0 ? criteria : ''}
                      options={renderListing('RateCriteria')}
                      mandatory={true}
                      handleChange={handleCriteriaChange}
                      errors={errors.Criteria}
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>
                  <Col md="12">
                    <TextFieldHookForm
                      label="Rate"
                      name={'Rate'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Rate}
                      disabled={true}
                    />
                  </Col>
                  <Col md="12">
                    <TextFieldHookForm
                      label="Quantity"
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^[0-9]*$/i,
                          message: 'Invalid Number.',
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
                      disabled={false}
                    />
                  </Col>



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
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.FreightCost}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                    </button>

                    <button
                      type={'submit'}
                      className="submit-button save-btn">
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                      {'Save'}
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