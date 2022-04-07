import React, { useState } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { ViewCostingContext } from '../CostingDetails';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { useDispatch } from 'react-redux';
import { isDataChange, saveAssemblyBOPHandlingCharge } from '../../actions/Costing';
import { NetPOPriceContext } from '../CostingDetailStepTwo';

function AddBOPHandling(props) {
  const CostingViewMode = useContext(ViewCostingContext);
  const { RMCCTabData, getAssemBOPCharge } = useSelector(state => state.costing)
  const dispatch = useDispatch()

  const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })


  useEffect(() => {

    const childPartDetail = JSON.parse(localStorage.getItem('costingArray'))
    console.log('childPartDetail: ', childPartDetail);
    let BOPSum = 0
    childPartDetail && childPartDetail.map((el) => {
      if (el.PartType === 'BOP') {
        BOPSum = BOPSum + (el.CostingPartDetails.TotalBoughtOutPartCost * el.CostingPartDetails.Quantity)
      }
    })
    setValue('BOPCost', BOPSum)
    if (RMCCTabData[0].CostingPartDetails.IsApplyBOPHandlingCharges) {
      setValue('BOPHandlingPercentage', RMCCTabData[0].CostingPartDetails.BOPHandlingPercentage)
      setValue('BOPHandlingCharges', RMCCTabData[0].CostingPartDetails.BOPHandlingCharges)
    } else if (getAssemBOPCharge && Object.keys(getAssemBOPCharge).length > 0) {
      setValue('BOPHandlingPercentage', getAssemBOPCharge && getAssemBOPCharge.BOPHandlingPercentage)
      setValue('BOPHandlingCharges', getAssemBOPCharge && getAssemBOPCharge.BOPHandlingCharges)

    }

  }, [])




  const handleBOPPercentageChange = (value) => {
    if (!isNaN(value)) {

      if (value > 100) {
        setValue('BOPHandlingPercentage', 0)
        setValue('BOPHandlingCharges', 0)
        return false;
      }
      dispatch(isDataChange(true))
      setValue('BOPHandlingCharges', checkForDecimalAndNull(getValues('BOPCost') * calculatePercentage(value), getConfigurationKey().NoOfDecimalForPrice))

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
    // props.setBOPCostWithAsssembly()
  };

  const setBOPCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'BOP') {
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCost * item.Quantity
      } else {
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity * item.Quantity
      }
    }, 0)

    return total
  }

  const getBOPTotalCost = (tabData) => {
    const TotalBoughtOutPartCost = setBOPCostAssembly(tabData.CostingChildPartDetails)
    return (tabData.CostingPartDetails.TotalBoughtOutPartCost * tabData.CostingPartDetails.Quantity) + checkForNull(getValues('BOPHandlingCharges'))
  }

  const saveHandleCharge = () => {


    let obj = {
      IsApplyBOPHandlingCharges: true,
      BOPHandlingPercentage: getValues('BOPHandlingPercentage'),
      BOPHandlingCharges: getValues('BOPHandlingCharges')
    }
    dispatch(saveAssemblyBOPHandlingCharge(obj))

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
                    <h3>{'ADD Insert Handling Charge'}</h3>
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