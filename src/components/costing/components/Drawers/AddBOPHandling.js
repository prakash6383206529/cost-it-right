import React, { useState } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import { ViewCostingContext } from '../CostingDetails';
import { useContext } from 'react';
import { useEffect } from 'react';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { isDataChange } from '../../actions/Costing';
import { reactLocalStorage } from 'reactjs-localstorage';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function AddBOPHandling(props) {
  const { item, isAssemblyTechnology } = props
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const dispatch = useDispatch()
  const [BOPHandlingType, setBOPHandlingType] = useState({})
  const [BOPHandling, setBOPHandling] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const { subAssemblyTechnologyArray } = useSelector(state => state.SubAssembly)

  const { register, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {

    if (isAssemblyTechnology) {
      let totalBOP = 0
      subAssemblyTechnologyArray && subAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
        if (item.PartType === 'BOP') {
          totalBOP = checkForNull(totalBOP) + checkForNull(item?.CostingPartDetails?.CostPerAssemblyBOP)
        }
      })
      // let BOPSum = subAssemblyTechnologyArray[0]?.CostingPartDetails?.CostPerAssemblyBOP

      setValue('BOPCost', totalBOP)

      // setValue('BOPCost', obj[0]?.CostingPartDetails?.IsApplyBOPHandlingCharges ? checkForNull(obj[0]?.CostingPartDetails?.BOPHandlingChargeApplicability) : BOPSum)
      setValue('BOPHandlingPercentage', subAssemblyTechnologyArray && checkForNull(subAssemblyTechnologyArray[0]?.BOPHandlingPercentage))
      setValue('BOPHandlingCharges', subAssemblyTechnologyArray && checkForNull(subAssemblyTechnologyArray[0]?.BOPHandlingCharges))

    }
    else {

      const childPartDetail = JSON.parse(localStorage.getItem('costingArray'))
      let BOPSum = 0
      childPartDetail && childPartDetail.map((el) => {
        if (el.PartType === 'BOP' && el.AssemblyPartNumber === item.PartNumber) {
          BOPSum = BOPSum + (checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost) * checkForNull(el.CostingPartDetails.Quantity))
        }
        return BOPSum
      })
      setValue('BOPCost', BOPSum)
      let obj = childPartDetail && childPartDetail.filter(assyItem => assyItem.PartNumber === item.PartNumber && assyItem.AssemblyPartNumber === item.AssemblyPartNumber && (assyItem.PartType === 'Sub Assembly' || assyItem.PartType === 'Assembly'))
      setValue('BOPCost', obj[0]?.CostingPartDetails?.IsApplyBOPHandlingCharges ? checkForNull(obj[0]?.CostingPartDetails?.BOPHandlingChargeApplicability) : BOPSum)
      setValue('BOPHandlingPercentage', checkForNull(obj[0]?.CostingPartDetails.BOPHandlingPercentage))
      setValue('BOPHandlingCharges', checkForNull(obj[0]?.CostingPartDetails.BOPHandlingCharges))

    }

  }, [])

  const handleBOPPercentageChange = (value) => {
    let totalBOP = 0
    subAssemblyTechnologyArray && subAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
      if (item.PartType === 'BOP') {
        totalBOP = checkForNull(totalBOP) + checkForNull(item?.CostingPartDetails?.CostPerAssemblyBOP)
      }
    })

    if (!isNaN(value)) {
      if (BOPHandlingType === 'Percentage' && value > 100) {
        setValue('BOPHandlingPercentage', 0)
        setValue('BOPHandlingCharges', 0)
        return false;
      }
      if (BOPHandlingType === 'Percentage') {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(getValues('BOPCost') * calculatePercentage(value), getConfigurationKey().NoOfDecimalForPrice))
      } else {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
      }
      dispatch(isDataChange(true))
    } else {
      setValue('BOPHandlingCharges', 0)
      setValue('BOPHandlingPercentage', 0)
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
  * @method renderListing
  * @description Used show listing of unit of measurement
  */
  const renderListing = (label) => {
    if (label === 'BOPHandlingType') {
      return [
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Percentage', value: 'Percentage' },
      ];
    }
  }

  /**
    * @method handleBOPHandlingType
    * @description  HANDLE OTHER COST TYPE CHANGE
    */
  const handleBOPHandlingType = (newValue) => {
    setBOPHandlingType(newValue.label)
    setTimeout(() => {
      setValue('BOPHandlingPercentage', 0)
      setValue('BOPHandlingFixed', 0)
      setValue('BOPHandlingCharges', 0)
    }, 200);
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    // const BOPHandlingFields = {
    //   IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
    //   BOPHandlingPercentage: 0,
    //   BOPHandlingCharges: 0,
    //   BOPHandlingFixed: 0,
    //   BOPHandlingType: newValue
    // }
    // props.setBOPCost(gridData, Params, item, BOPHandlingFields)
    // clearErrors('');
  }

  /**
* @method toggleDrawer
* @description TOGGLE DRAWER
*/
  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    props.closeDrawer('')
  };

  const saveHandleCharge = () => {
    // WILL BE EXECUTED WHEN COSTING TECHNOLOGY IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE WILL GET EXECUTED
    let percentage = getValues('BOPHandlingPercentage')
    let obj = {
      IsApplyBOPHandlingCharges: true,
      // BOPHandlingChargeApplicability: BOPCost,  
      // BOPHandlingPercentage: percentage,  
      // BOPHandlingCharges: BOPHandling  

      BOPHandlingChargeApplicability: getValues('BOPCost'),
      BOPHandlingPercentage: getValues('BOPHandlingPercentage'),
      BOPHandlingCharges: getValues('BOPHandlingCharges'),
      BOPHandlingChargeType: BOPHandlingType
    }
    props.setBOPCostWithAsssembly(obj, item)
    setTimeout(() => {
      props.closeDrawer('')
    }, 500);
  }

  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}>
        < div className={`ag-grid-react`}>
          <Container className="add-bop-drawer">
            <div className={'drawer-wrapper'}>
              <Row className="drawer-heading">
                <Col className='pl-0'>
                  <div className={'header-wrapper left'}>
                    <h3>{'Add Insert Handling Charge'}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>
              <form onSubmit={() => { }} noValidate >
                <div className="filter-row">
                  <Row>
                    <Col md="12">
                      <TextFieldHookForm
                        label="Insert Cost"
                        name={'BOPCost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.BOPCost}
                        disabled={true}
                      />
                    </Col>


                    <Col md="12">
                      <SearchableSelectHookForm
                        label={"BOP Handling Type"}
                        name={"BOPHandlingType"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        // defaultValue={BOPHandlingType.length !== 0 ? BOPHandlingType : ""}
                        options={renderListing("BOPHandlingType")}
                        mandatory={false}
                        handleChange={handleBOPHandlingType}
                        errors={errors.BOPHandlingType}
                        disabled={(CostingViewMode || IsLocked) ? true : false}
                      />
                    </Col>

                    <Col md="12">
                      {BOPHandlingType === 'Fixed' ?
                        <NumberFieldHookForm
                          label={'Fixed'}
                          name={"BOPHandlingFixed"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: true,
                            pattern: {
                              value: /^[0-9]\d*(\.\d+)?$/i,
                              message: 'Invalid Number.'
                            }
                          }}
                          handleChange={(e) => {
                            e.preventDefault();
                            handleBOPPercentageChange(e.target.value);
                          }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          // errors={errors.BOPHandlingPercentage}
                          disabled={(CostingViewMode || IsLocked) ? true : false}
                        /> :
                        <TextFieldHookForm
                          label="Percentage"
                          name={"BOPHandlingPercentage"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: true,
                            pattern: {
                              value: /^[0-9]\d*(\.\d+)?$/i,
                              message: 'Invalid Number.'
                            },
                            max: {
                              value: 100,
                              message: 'Percentage cannot be greater than 100'
                            },
                          }}
                          handleChange={(e) => {
                            e.preventDefault();
                            handleBOPPercentageChange(e.target.value);
                          }}
                          defaultValue={""}
                          className=""
                          customClassName={"withBorder"}
                          errors={errors.BOPHandlingPercentage}
                          disabled={(CostingViewMode || IsLocked) ? true : false}
                        />}
                    </Col>
                    <Col md="12">
                      <TextFieldHookForm
                        label="Handling Charges"
                        name={'BOPHandlingCharges'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{}}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.BOPHandlingCharges}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </div>
              </form >
              <Row className="sf-btn-footer no-gutters justify-content-between mx-0">
                <div className="col-sm-12 text-left bluefooter-butn">
                  <button
                    type={'button'}
                    disabled={(CostingViewMode || IsLocked) ? true : false}
                    className="submit-button mr5 save-btn"
                    onClick={saveHandleCharge} >
                    <div className={"save-icon"}></div>
                    {'Save'}
                  </button>

                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={props.closeDrawer} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>
                </div>
              </Row>
            </div>
          </Container>
        </div>
      </Drawer>
    </div>
  );
}

export default AddBOPHandling;