import React, { useState } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { ViewCostingContext } from '../CostingDetails';
import { useContext } from 'react';
import { useEffect } from 'react';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { useDispatch, useSelector } from 'react-redux';
import { isDataChange } from '../../actions/Costing';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function AddBOPHandling(props) {
  const { item, isAssemblyTechnology } = props
  const CostingViewMode = useContext(ViewCostingContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const dispatch = useDispatch()
  const [BOPHandling, setBOPHandling] = useState(subAssemblyTechnologyArray ? subAssemblyTechnologyArray[0]?.BOPHandlingCharges : 0);
  const [percentage, setPercentage] = useState(subAssemblyTechnologyArray ? subAssemblyTechnologyArray[0]?.BOPHandlingPercentage : 0);

  const { register, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {

    if (isAssemblyTechnology) {
      // THIS BLOCK WILL GET EXECUTED WHEN TECHNOLOGY OF COSTING WILL BE ASSEMBLY
      let totalBOP = calcTotalBOP()
      setValue('BOPCost', totalBOP)
      setValue('BOPHandlingPercentage', subAssemblyTechnologyArray && checkForNull(subAssemblyTechnologyArray[0]?.BOPHandlingPercentage))
      setValue('BOPHandlingCharges', subAssemblyTechnologyArray && checkForNull(subAssemblyTechnologyArray[0]?.BOPHandlingCharges))

    }
    else {
      const childPartDetail = JSON.parse(localStorage.getItem('costingArray'))
      let BOPSum = 0
      BOPSum = childPartDetail && childPartDetail.reduce((accummlator, el) => {
        if (el.PartType === 'BOP') {
          return checkForNull(accummlator) + (checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost) * checkForNull(el.CostingPartDetails.Quantity))
        } else {
          return accummlator
        }
      }, 0)

      setValue('BOPCost', checkForDecimalAndNull(BOPSum, getConfigurationKey().NoOfDecimalForPrice))
      let obj = childPartDetail && childPartDetail.filter(assyItem => assyItem.PartNumber === item.PartNumber && assyItem.AssemblyPartNumber === item.AssemblyPartNumber && (assyItem.PartType === 'Sub Assembly' || assyItem.PartType === 'Assembly'))
      setValue('BOPCost', obj[0].CostingPartDetails.IsApplyBOPHandlingCharges ? checkForDecimalAndNull(obj[0].CostingPartDetails.BOPHandlingChargeApplicability, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(BOPSum, getConfigurationKey().NoOfDecimalForPrice))
      setValue('BOPHandlingPercentage', checkForNull(obj[0]?.CostingPartDetails.BOPHandlingPercentage))
      setValue('BOPHandlingCharges', checkForNull(obj[0]?.CostingPartDetails.BOPHandlingCharges))
    }
  }, [])

  const calcTotalBOP = () => {
    let totalBOP = 0
    // CALCULATE TOTAL BOP COST
    totalBOP = subAssemblyTechnologyArray && subAssemblyTechnologyArray[0]?.CostingChildPartDetails.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return checkForNull(accummlator) + checkForNull(el?.CostingPartDetails?.CostPerAssemblyBOP)
      } else {
        return accummlator
      }
    }, 0)
    return totalBOP
  }

  const handleBOPPercentageChange = (value) => {
    let totalBOP = calcTotalBOP()
    if (!isNaN(value)) {
      if (value > 100) {
        setValue('BOPHandlingPercentage', 0)
        setValue('BOPHandlingCharges', 0)
        return false;
      }
      dispatch(isDataChange(true))
      setPercentage(value)
      setBOPHandling(totalBOP * calculatePercentage(value))
      setValue('BOPHandlingCharges', checkForDecimalAndNull(totalBOP * calculatePercentage(value), getConfigurationKey().NoOfDecimalForPrice))
    } else {
      setValue('BOPHandlingCharges', 0)
      setValue('BOPHandlingPercentage', 0)
      Toaster.warning('Please enter valid number.')
    }
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
    let obj = {}
    // WILL BE EXECUTED WHEN COSTING TECHNOLOGY IS ASSEMBLY FOR OTHER TECHNOLOGIES ELSE WILL GET EXECUTED
    if (isAssemblyTechnology) {
      let totalBOP = calcTotalBOP()
      let tempSubAssemblyTechnologyArray = subAssemblyTechnologyArray
      tempSubAssemblyTechnologyArray[0].BOPHandlingPercentage = percentage
      tempSubAssemblyTechnologyArray[0].BOPHandlingCharges = BOPHandling
      dispatch(setSubAssemblyTechnologyArray(tempSubAssemblyTechnologyArray, res => { }))
      obj = {
        IsApplyBOPHandlingCharges: true,
        BOPHandlingChargeApplicability: totalBOP,
        BOPHandlingPercentage: percentage,
        BOPHandlingCharges: BOPHandling
      }
      dispatch(isDataChange(true))
    } else {
      obj = {
        IsApplyBOPHandlingCharges: true,
        BOPHandlingChargeApplicability: getValues('BOPCost'),
        BOPHandlingPercentage: getValues('BOPHandlingPercentage'),
        BOPHandlingCharges: getValues('BOPHandlingCharges')
      }
    }
    props.setBOPCostWithAsssembly(obj, item)
    setTimeout(() => {
      props.closeDrawer('')
    }, 500);
  }

  return (
    <div>
      <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        < div className={`ag-grid-react`}>
          <Container className="add-bop-drawer">
            <div className={'drawer-wrapper'}>

              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{'ADD BOP Handling Charge'}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>

              < form onSubmit={() => { }} noValidate >

                <div className="filter-row">
                  <Row>
                    <Col md="12">
                      <TextFieldHookForm
                        label="BOP Cost"
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

                    <Col md="12" >
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
                        disabled={CostingViewMode ? true : false}
                      />
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
                    disabled={CostingViewMode ? true : false}
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