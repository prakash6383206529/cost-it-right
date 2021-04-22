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
    PackagingDetailId: rowObjData && rowObjData.PackagingDetailId !== undefined ? rowObjData.PackagingDetailId : '',
    PackagingDescription: rowObjData && rowObjData.PackagingDescription !== undefined ? rowObjData.PackagingDescription : '',
    PackagingCostPercentage: rowObjData && rowObjData.PackagingCostPercentage !== undefined ? rowObjData.PackagingCostPercentage : 0,
    Applicability: rowObjData && rowObjData.Applicability !== undefined ? { label: rowObjData.Applicability, value: rowObjData.Applicability } : [],
    PackagingCost: rowObjData && rowObjData.PackagingCost !== undefined ? rowObjData.PackagingCost : 0,
  }

  const { register, handleSubmit, control, setValue, getValues, reset, errors } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const dispatch = useDispatch()

  const headCostData = useContext(netHeadCostContext)

  const [applicability, setApplicability] = useState(isEditFlag ? { label: rowObjData.Applicability, value: rowObjData.Applicability } : []);
  const [PackageType, setPackageType] = useState(isEditFlag ? rowObjData.IsPackagingCostFixed : true);
  //const [formData, setFormData] = useState({});

  const fieldValues = useWatch({
    control,
    name: ['PackagingCostPercentage'],
  });

  useEffect(() => {
    if (applicability && applicability.value !== undefined) {
      calculateApplicabilityCost(applicability.value)
    }
  }, [fieldValues]);

  useEffect(() => {
    if (!PackageType) {
      setValue('PackagingCostPercentage', 'Fixed')
    } else {
      setValue('PackagingCostPercentage', '')
    }
  }, [PackageType]);

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
        { label: 'RM + BOP', value: 'RM + BOP' },
        { label: 'RM + CC + BOP', value: 'RM + CC + BOP' },
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
    console.log('Text: ', Text);
    const { NetRawMaterialsCost, NetBoughtOutPartCost, NetConversionCost, NetTotalRMBOPCC } = headCostData;
    const PackagingCostPercentage = getValues('PackagingCostPercentage');

    switch (Text) {
      case 'RM':
        if (!PackageType) {
          console.log('ifffff')
          setValue('PackagingCost', '')
        } else {
          console.log('ellllssee')
          setValue('PackagingCost', checkForDecimalAndNull(NetRawMaterialsCost * calculatePercentage(PackagingCostPercentage), 2))
        }
        break;

      case 'RM + CC':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          setValue('PackagingCost', checkForDecimalAndNull((NetRawMaterialsCost + NetConversionCost) * calculatePercentage(PackagingCostPercentage), 2))
        }
        break;

      case 'CC':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          setValue('PackagingCost', checkForDecimalAndNull(NetConversionCost * calculatePercentage(PackagingCostPercentage), 2))
        }
        break;

      case 'RM + CC + BOP':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          setValue('PackagingCost', checkForDecimalAndNull((NetTotalRMBOPCC) * calculatePercentage(PackagingCostPercentage), 2))
        }
        break;

      case 'RM + BOP':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          setValue('PackagingCost', checkForDecimalAndNull((NetRawMaterialsCost + NetBoughtOutPartCost) * calculatePercentage(PackagingCostPercentage), 2))
        }
        break;

      default:
        break;
    }
  }

  /**
    * @method PackageTypeToggle
    * @description PACKAGING TYPE 
    */
  const PackageTypeToggle = () => {
    setValue('PackagingDescription', '')
    setValue('PackagingCost', '')
    setValue('PackagingCostPercentage', '')
    setValue('Applicability', '')
    setPackageType(!PackageType)
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
      PackagingDetailId: isEditFlag ? rowObjData.PackagingDetailId : '',
      IsPackagingCostFixed: PackageType,
      PackagingDescription: data.PackagingDescription,
      PackagingCostFixed: 0,
      PackagingCostPercentage: PackageType ? data.PackagingCostPercentage : 0,
      PackagingCost: data.PackagingCost,
      Applicability: applicability ? data.Applicability.value : '',
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
                  <h3>{isEditFlag ? 'Update Packaging' : 'ADD Packaging'}</h3>
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
                    <label className={'left-title'}>{'Packaging Type'}</label>
                  </Col>
                  <Col md="12" className="switch mb15">
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
                      name={'PackagingCostPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={PackageType ? true : false}
                      rules={{
                        required: PackageType ? true : false,
                        pattern: {
                          value: PackageType ? /^[0-9]\d*(\.\d+)?$/i : '',
                          message: PackageType ? 'Invalid Number.' : '',
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PackagingCostPercentage}
                      disabled={!PackageType ? true : false}
                    />
                  </Col>

                  <Col md="12">
                    <SearchableSelectHookForm
                      label={'Applicability'}
                      name={'Applicability'}
                      placeholder={'-Select-'}
                      Controller={Controller}
                      control={control}
                      rules={{ required: PackageType ? true : false }}
                      register={register}
                      defaultValue={applicability.length !== 0 ? applicability : ''}
                      options={renderListing('Applicability')}
                      mandatory={PackageType ? true : false}
                      handleChange={handleApplicabilityChange}
                      errors={errors.Applicability}
                      disabled={!PackageType ? true : false}
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
                        pattern: {
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PackagingCost}
                      disabled={PackageType ? true : false}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                  <div className="col-sm-12 text-right px-3">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cross-icon'}><img src={require('../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                    </button>

                    <button
                      type={'submit'}
                      className="submit-button  save-btn"
                      onClick={addRow} >
                      <div className={'check-icon'}><img src={require('../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
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

export default React.memo(AddPackaging);