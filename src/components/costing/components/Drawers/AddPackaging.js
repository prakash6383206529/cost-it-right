import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch, } from "react-hook-form";
import { Container, Row, Col, } from 'reactstrap';
import { costingInfoContext, netHeadCostContext } from '../CostingDetailStepTwo';
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm, SearchableSelectHookForm, NumberFieldHookForm, } from '../../../layout/HookFormInputs';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey, } from '../../../../helper';
import Switch from "react-switch";
import { useSelector } from 'react-redux';

function IsolateReRender(control) {
  const values = useWatch({
    control,
    name: 'PackagingCostPercentage',
  });

  return values;
}

function AddPackaging(props) {

  const { rowObjData, isEditFlag } = props;

  const defaultValues = {
    PackagingDetailId: rowObjData && rowObjData.PackagingDetailId !== undefined ? rowObjData.PackagingDetailId : '',
    PackagingDescription: rowObjData && rowObjData.PackagingDescription !== undefined ? rowObjData.PackagingDescription : '',
    PackagingCostPercentage: rowObjData && rowObjData.PackagingCostPercentage !== undefined ? checkForDecimalAndNull(rowObjData.PackagingCostPercentage,getConfigurationKey().NoOfDecimalForPrice) : 0,
    Applicability: rowObjData && rowObjData.Applicability !== undefined ? { label: rowObjData.Applicability, value: rowObjData.Applicability } : [],
    PackagingCost: rowObjData && rowObjData.PackagingCost !== undefined ? checkForDecimalAndNull(rowObjData.PackagingCost,getConfigurationKey().NoOfDecimalForPrice) : 0,
  }

  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: isEditFlag ? defaultValues : {},
  });

  const headCostData = useContext(netHeadCostContext)
  const costData = useContext(costingInfoContext);


  const [applicability, setApplicability] = useState(isEditFlag ? { label: rowObjData.Applicability, value: rowObjData.Applicability } : []);
  // const [PackageType, setPackageType] = useState(isEditFlag ? rowObjData.IsPackagingCostFixed : false);
  const [PackageType, setPackageType] = useState(true);
  const [packagingCost, setPackagingCost] =useState('')
  const costingHead = useSelector(state => state.comman.costingHead)
  const { CostingDataList } = useSelector(state => state.costing)

  const fieldValues = IsolateReRender(control)

  useEffect(() => {
    if (applicability && applicability.value !== undefined) {
      calculateApplicabilityCost(applicability.label)
    }
  }, [fieldValues]);

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
  };

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {

      const temp = [];

      if (label === 'Applicability') {
          costingHead && costingHead.map(item => {
              if (item.Value === '0') return false;
              temp.push({ label: item.Text, value: item.Value })
              return null;
          });
          return temp;
      }
  


  }

  /**
  * @method handleApplicabilityChange
  * @description  APPLICABILITY CHANGE HANDLE
  */
  const handleApplicabilityChange = (newValue) => {
    if (newValue && newValue !== '') {
      setApplicability(newValue)
      calculateApplicabilityCost(newValue.label)
    } else {
      setApplicability([])
    }
  }

  /**
   * @method calculateApplicabilityCost
   * @description APPLICABILITY CALCULATION
   */
  const calculateApplicabilityCost = (Text) => {

    const { NetRawMaterialsCost, NetBoughtOutPartCost, } = headCostData;
    
    const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headCostData.NetConversionCost) - checkForNull(headCostData.TotalOtherOperationCostPerAssembly) : headCostData.ProcessCostTotal + headCostData.OperationCostTotal
    const RMBOPCC = checkForNull(NetRawMaterialsCost) + checkForNull(NetBoughtOutPartCost) +ConversionCostForCalculation
    const RMBOP = checkForNull(NetRawMaterialsCost) + checkForNull(NetBoughtOutPartCost);
    const RMCC = checkForNull(NetRawMaterialsCost) +ConversionCostForCalculation;
    const BOPCC = checkForNull(NetBoughtOutPartCost) + ConversionCostForCalculation
    const PackagingCostPercentage = getValues('PackagingCostPercentage');
  
      let dataList =CostingDataList && CostingDataList.length >0 ? CostingDataList[0]:{}
      const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) 
 

    let totalPackagingCost=0
    switch (Text) {
      case 'RM':
        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = NetRawMaterialsCost * calculatePercentage(PackagingCostPercentage)
          console.log("COMING HERE",totalPackagingCost);
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;
        case 'BOP':
          if (!PackageType) {
            setValue('PackagingCost', '')
            setPackagingCost('')
          } else {
            totalPackagingCost = NetBoughtOutPartCost * calculatePercentage(PackagingCostPercentage)
            console.log("COMING HERE",totalPackagingCost);
            setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
            setPackagingCost(totalPackagingCost)
          }
          break;

      case 'RM + CC':
        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = RMCC * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'BOP + CC':
        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = BOPCC * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;

      case 'CC':
        if (!PackageType) {
          setValue('PackagingCost', '')
          setPackagingCost('')
        } else {
          totalPackagingCost = (ConversionCostForCalculation) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;

      case 'RM + CC + BOP':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = (RMBOPCC) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;

      case 'RM + BOP':
        if (!PackageType) {
          setValue('PackagingCost', '')
        } else {
          totalPackagingCost = (RMBOP) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'Net Cost':
        if(!PackageType){
          setValue('PackagingCost','')
        }else{
          totalPackagingCost = (totalTabCost) * calculatePercentage(PackagingCostPercentage)
          setValue('PackagingCost', checkForDecimalAndNull(totalPackagingCost, getConfigurationKey().NoOfDecimalForPrice))
          setPackagingCost(totalPackagingCost)
        }
        break;
      case 'Fixed':
        if(!PackageType){
          setValue('PackagingCost',PackagingCostPercentage)
        }else{
          totalPackagingCost = getValues('PackagingCost')
          // setValue('PackagingCost',PackagingCostPercentage)
          setPackagingCost(totalPackagingCost)
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
      IsPackagingCostFixed: applicability.label ==='Fixed' ? false :true,
      PackagingDescription: data.PackagingDescription,
      PackagingCostFixed: 0,
      PackagingCostPercentage: PackageType ? data.PackagingCostPercentage : 0,
      PackagingCost: applicability.label === 'Fixed'?getValues('PackagingCost') :packagingCost,
      Applicability: applicability ? data.Applicability.label : '',
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
                  {
                    applicability.label  !== 'Fixed' &&

                  <Col md="12">
                    <NumberFieldHookForm
                      label="Packaging Percentage"
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
                        max: {
                          value: 100,
                          message: 'Percentage should be less than 100'
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
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PackagingCost}
                      disabled={applicability.label === 'Fixed' ? false : true}
                    />
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between ml-0">
                  <div className="col-sm-12 text-right px-3">
                    <button
                      type={'button'}
                      className="reset mr15 cancel-btn"
                      onClick={cancel} >
                      <div className={'cancel-icon'}></div> {'Cancel'}
                    </button>

                    <button
                      type={'submit'}
                      className="submit-button  save-btn"
                      onClick={addRow} >
                      <div className={'save-icon'}></div>
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