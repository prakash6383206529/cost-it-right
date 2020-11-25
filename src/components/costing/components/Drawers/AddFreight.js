import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getOperationDrawerDataList } from '../../actions/Costing';
import { netHeadCostContext } from '../CostingDetailStepTwo';
import { toastr } from 'react-redux-toastr';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, } from '../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../helper';
import Switch from "react-switch";

function AddFreight(props) {

  const { rowObjData, isEditFlag } = props;

  const defaultValues = {
    FreightId: rowObjData && rowObjData.FreightId !== undefined ? rowObjData.FreightId : '',
    RateCriteria: rowObjData && rowObjData.RateCriteria !== undefined ? rowObjData.RateCriteria : '',
    //ToolCategory: rowObjData && rowObjData.ToolCategory !== undefined ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : [],
    Quantity: rowObjData && rowObjData.Quantity !== undefined ? rowObjData.Quantity : '',
    Rate: rowObjData && rowObjData.Rate !== undefined ? rowObjData.Rate : '',
    Cost: rowObjData && rowObjData.Cost !== undefined ? rowObjData.Cost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const headCostData = useContext(netHeadCostContext)

  const [rateCriteria, setRateCriteria] = useState([]);
  const [IsPartTruckLoad, setIsPartTruckLoad] = useState(isEditFlag ? rowObjData.IsPartTruckLoad : false);

  const fieldValues = useWatch({
    control,
    name: ['PackagingPercentage'],
  });

  useEffect(() => {
    if (rateCriteria) {
      calculateApplicabilityCost(rateCriteria.value)
    }
  }, [fieldValues]);


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

    if (label === 'Applicability') {
      return [
        { label: 'RM', value: 'RM' },
        { label: 'CC', value: 'CC' },
        { label: 'RM + CC', value: 'RM + CC' },
      ];
    }

  }

  /**
  * @method handleRateCriteriaChange
  * @description  RATE CRITERIA CHANGE HANDLE
  */
  const handleRateCriteriaChange = (newValue) => {
    if (newValue && newValue !== '') {
      setRateCriteria(newValue)
      calculateApplicabilityCost(newValue.value)
    } else {
      setRateCriteria([])
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
      FreightId: isEditFlag ? rowObjData.FreightId : '',
      IsPartTruckLoad: IsPartTruckLoad,
      RateCriteria: data.RateCriteria,
      Quantity: data.Quantity,
      Rate: data.Rate,
      Cost: data.Cost,
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
                <Row>
                  <Col md="12" className="switch mb15">
                    <label className="switch-level">
                      <div className={'left-title'}>{'Freight Type'}</div>
                    </label>
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
                      label={'Rate Criteria'}
                      name={'RateCriteria'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: true }}
                      register={register}
                      defaultValue={rateCriteria.length !== 0 ? rateCriteria : ''}
                      options={renderListing('RateCriteria')}
                      mandatory={true}
                      handleChange={handleRateCriteriaChange}
                      errors={errors.RateCriteria}
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
                      handleChange={() => { }}
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
                      name={'Cost'}
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
                      errors={errors.Cost}
                      disabled={true}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt15">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                    </button>

                    <button
                      type={'submit'}
                      className="submit-button mr5 save-btn">
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