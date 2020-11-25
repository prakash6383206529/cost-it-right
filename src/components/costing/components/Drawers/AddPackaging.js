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

function AddPackaging(props) {

  const { rowObjData, isEditFlag } = props;

  const defaultValues = {
    ToolOperationId: rowObjData && rowObjData.ToolOperationId !== undefined ? rowObjData.ToolOperationId : '',
    ProcessOrOperation: rowObjData && rowObjData.ProcessOrOperation !== undefined ? rowObjData.ProcessOrOperation : '',
    ToolCategory: rowObjData && rowObjData.ToolCategory !== undefined ? { label: rowObjData.ToolCategory, value: rowObjData.ToolCategory } : [],
    ToolName: rowObjData && rowObjData.ToolName !== undefined ? rowObjData.ToolName : '',
    Quantity: rowObjData && rowObjData.Quantity !== undefined ? rowObjData.Quantity : '',
    ToolCost: rowObjData && rowObjData.ToolCost !== undefined ? rowObjData.ToolCost : '',
    Life: rowObjData && rowObjData.Life !== undefined ? rowObjData.Life : '',
    TotalToolCost: rowObjData && rowObjData.TotalToolCost !== undefined ? rowObjData.TotalToolCost : '',
  }

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const headCostData = useContext(netHeadCostContext)

  const [applicability, setApplicability] = useState([]);
  const [IsFixed, setIsFixed] = useState(false);
  //const [formData, setFormData] = useState({});

  const fieldValues = useWatch({
    control,
    name: ['PackagingPercentage'],
  });

  useEffect(() => {
    if (applicability) {
      calculateApplicabilityCost(applicability.value)
    }
  }, [fieldValues]);

  useEffect(() => {
    if (!IsFixed) {
      setValue('PackagingPercentage', 'Fixed')
    } else {
      setValue('PackagingPercentage', '')
    }
  }, [IsFixed]);

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
  * @method handleApplicabilityChange
  * @description  APPLICABILITY CHANGE HANDLE
  */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setApplicability(newValue)
      calculateApplicabilityCost(newValue.value)
    } else {
      setApplicability([])
    }
  }

  /**
   * @method calculateApplicabilityCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateApplicabilityCost = (Text) => {
    const { NetRawMaterialsCost, NetBoughtOutPartCost, NetConversionCost, NetTotalRMBOPCC } = headCostData;
    const PackagingPercentage = getValues('PackagingPercentage');

    switch (Text) {
      case 'RM':
        if (!IsFixed) {
          setValue('PackagingCost', checkForDecimalAndNull(NetRawMaterialsCost, 2))
        } else {
          setValue('PackagingCost', checkForDecimalAndNull(NetRawMaterialsCost * calculatePercentage(PackagingPercentage), 2))
        }
        break;

      case 'RM + CC':
        if (!IsFixed) {
          setValue('PackagingCost', checkForDecimalAndNull(NetRawMaterialsCost + NetConversionCost, 2))
        } else {
          setValue('PackagingCost', checkForDecimalAndNull((NetRawMaterialsCost + NetConversionCost) * calculatePercentage(PackagingPercentage), 2))
        }
        break;

      case 'CC':
        if (!IsFixed) {
          setValue('PackagingCost', checkForDecimalAndNull(NetConversionCost, 2))
        } else {
          setValue('PackagingCost', checkForDecimalAndNull(NetConversionCost * calculatePercentage(PackagingPercentage), 2))
        }
        break;

      default:
        break;
    }
  }

  /**
    * @method IsFixedToggle
    * @description PACKAGING TYPE 
    */
  const IsFixedToggle = () => {
    setIsFixed(!IsFixed)
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

  const onSubmit = data => {
    let formData = {
      PackagingId: isEditFlag ? rowObjData.PackagingId : '',
      PackagingDescription: data.PackagingDescription,
      PackagingPercentage: data.PackagingPercentage,
      Applicability: data.Applicability,
      PackagingCost: data.PackagingCost,
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
                  <h3>{'ADD Packaging'}</h3>
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
                      <div className={'left-title'}>{'Packaging Type'}</div>
                    </label>
                  </Col>
                  <Col md="12" className="switch mb15">
                    <label className="switch-level">
                      <div className={'left-title'}>{'Fixed'}</div>
                      <Switch
                        onChange={IsFixedToggle}
                        checked={IsFixed}
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
                      <div className={'right-title'}>{'Percentage'}</div>
                    </label>
                  </Col>
                  <Col md="12">
                    <TextFieldHookForm
                      label="Packaging Description"
                      name={'PackagingDescription'}
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
                      errors={errors.PackagingDescription}
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>
                  <Col md="12">
                    <TextFieldHookForm
                      label="Packaging Percentage"
                      name={'PackagingPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: IsFixed ? /^[0-9]*$/i : '',
                          message: IsFixed ? 'Invalid Number.' : '',
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PackagingPercentage}
                      disabled={isEditFlag || !IsFixed ? true : false}
                    />
                  </Col>

                  <Col md="12">
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
                      disabled={isEditFlag ? true : false}
                    />
                  </Col>

                  <Col md="12">
                    <TextFieldHookForm
                      label="Packaging Cost"
                      name={'PackagingCost'}
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
                      errors={errors.PackingCost}
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
                      className="submit-button mr5 save-btn"
                      onClick={addRow} >
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

export default React.memo(AddPackaging);