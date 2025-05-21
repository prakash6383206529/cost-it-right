import React, { useState } from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs';
import { ViewCostingContext } from '../CostingDetails';
import { useContext } from 'react';
import { useEffect } from 'react';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey, showBopLabel } from '../../../../helper';
import { useDispatch, useSelector } from 'react-redux';
import { isDataChange } from '../../actions/Costing';
import { reactLocalStorage } from 'reactjs-localstorage';
import { IdForMultiTechnology } from '../../../../config/masterData';
import { number, percentageLimitValidation, checkWhiteSpaces } from "../../../../helper/validation";
import Toaster from '../../../common/Toaster';
import { WACTypeId } from '../../../../config/constants';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';
import TooltipCustom from '../../../common/Tooltip';
import { IsNFRContext } from '../CostingDetailStepTwo';

function AddBOPHandling(props) {
  const { item, isAssemblyTechnology } = props
  const CostingViewMode = useContext(ViewCostingContext);
  const IsLockTabInCBCCostingForCustomerRFQ = useContext(IsNFRContext)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const [handlingChargesChange, setHandlingChargesChange] = useState(null)
  const IsLocked = (item?.IsLocked ? item?.IsLocked : false) || (item?.IsPartLocked ? item?.IsPartLocked : false)
  const dispatch = useDispatch()
  const [BOPHandling, setBOPHandling] = useState(subAssemblyTechnologyArray ? subAssemblyTechnologyArray[0]?.BOPHandlingCharges : 0);
  // const [BOPHandling, setBOPHandling] = useState(subAssemblyTechnologyArray ? subAssemblyTechnologyArray[0]?.BOPHandlingCharges : 0);    
  const [BOPHandlingType, setBOPHandlingType] = useState({})
  const [BOPCost, setBOPCost] = useState(0);
  const { costingData } = useSelector(state => state.costing)
  const partType = (IdForMultiTechnology.includes(String(costingData?.TechnologyId)) || costingData.CostingTypeId === WACTypeId)

  const { register, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    if (isAssemblyTechnology) {
      // THIS BLOCK WILL GET EXECUTED WHEN TECHNOLOGY OF COSTING WILL BE ASSEMBLY

      // CALCULATE TOTAL BOP COST
      let BOPTotalCost = 0

      subAssemblyTechnologyArray[0]?.CostingChildPartDetails && subAssemblyTechnologyArray[0]?.CostingChildPartDetails.map((item) => {
        if (item.PartType === 'BOP') {
          BOPTotalCost = checkForNull(BOPTotalCost) + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
          return null
        }
      })

      setValue('BOPCost', checkForDecimalAndNull(BOPTotalCost, getConfigurationKey().NoOfDecimalForPrice))
      setValue('BOPHandlingPercentage', subAssemblyTechnologyArray && checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingPercentage, getConfigurationKey().NoOfDecimalForPrice))
      setValue('BOPHandlingCharges', subAssemblyTechnologyArray && checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingCharges, getConfigurationKey().NoOfDecimalForPrice))
      setHandlingChargesChange(subAssemblyTechnologyArray && checkForDecimalAndNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingCharges, getConfigurationKey().NoOfDecimalForPrice))
      setValue('BOPHandlingFixed', subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingChargeType === "Fixed" ? checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingCharges) : 0)
      setValue('BOPHandlingType', subAssemblyTechnologyArray && { label: subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingChargeType, value: subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingChargeType })
      setBOPCost(BOPTotalCost)
      setBOPHandlingType(subAssemblyTechnologyArray && subAssemblyTechnologyArray[0]?.CostingPartDetails?.BOPHandlingChargeType)
    } else {
      const childPartDetail = JSON.parse(sessionStorage.getItem('costingArray'))
      let BOPSum = 0
      childPartDetail && childPartDetail.map((el) => {
        if (el.PartType === 'BOP' && el.AssemblyPartNumber === item?.PartNumber) {
          BOPSum = BOPSum + (checkForNull(el?.CostingPartDetails?.NetBoughtOutPartCost) * checkForNull(el?.CostingPartDetails?.Quantity))
        }
        return BOPSum
      })
      setValue('BOPCost', checkForDecimalAndNull(BOPSum, getConfigurationKey().NoOfDecimalForPrice))
      let obj = childPartDetail && childPartDetail.filter(assyItem => assyItem?.PartNumber === item?.PartNumber && assyItem?.AssemblyPartNumber === item?.AssemblyPartNumber && (assyItem?.PartType === 'Sub Assembly' || assyItem?.PartType === 'Assembly'))
      setValue('BOPCost', obj[0]?.CostingPartDetails?.IsApplyBOPHandlingCharges ? checkForDecimalAndNull(obj[0]?.CostingPartDetails?.BOPHandlingChargeApplicability, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(BOPSum, getConfigurationKey().NoOfDecimalForPrice))
      setValue('BOPHandlingPercentage', checkForNull(obj[0]?.CostingPartDetails?.BOPHandlingPercentage))
      setValue('BOPHandlingCharges', checkForNull(obj[0]?.CostingPartDetails?.BOPHandlingCharges))
      setHandlingChargesChange(checkForNull(obj[0]?.CostingPartDetails?.BOPHandlingCharges));
      setValue('BOPHandlingFixed', obj[0]?.CostingPartDetails?.BOPHandlingChargeType === "Fixed" ? checkForNull(obj[0]?.CostingPartDetails?.BOPHandlingCharges) : 0)
      setValue('BOPHandlingType', obj[0]?.CostingPartDetails?.BOPHandlingChargeType ? { label: obj[0]?.CostingPartDetails?.BOPHandlingChargeType, value: obj[0]?.CostingPartDetails?.BOPHandlingChargeType } : {})   // COMMENT
      setBOPHandlingType(obj[0]?.CostingPartDetails?.BOPHandlingChargeType)
    }
  }, [])

  const handleBOPPercentageChange = (value) => {
    if (!isNaN(value)) {
      if (BOPHandlingType === 'Percentage' && value > 100) {
        setValue('BOPHandlingPercentage', 0)
        setValue('BOPHandlingCharges', 0)
        return false;
      }
      if (BOPHandlingType === 'Percentage') {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(getValues('BOPCost') * calculatePercentage(value), getConfigurationKey().NoOfDecimalForPrice))
        if (partType) {
          setBOPHandling(BOPCost * calculatePercentage(value))
          setValue('BOPHandlingCharges', checkForDecimalAndNull(BOPCost * calculatePercentage(value), getConfigurationKey().NoOfDecimalForPrice))
        }
      } else {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
      }
      dispatch(isDataChange(true))
    } else {
      setValue('BOPHandlingCharges', 0)
      setValue('BOPHandlingPercentage', 0)
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
    setBOPHandlingType(newValue?.label)
    setTimeout(() => {
      setValue('BOPHandlingPercentage', 0)
      setValue('BOPHandlingFixed', 0)
      setValue('BOPHandlingCharges', 0)
    }, 200);
    const Params = {
      index: props.index,
      BOMLevel: props.item?.BOMLevel,
      PartNumber: props.item?.PartNumber,
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
    if (Object.keys(errors).length > 0) return false
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

    if (handlingChargesChange !== obj.BOPHandlingCharges) {
      Toaster.success(`${showBopLabel()} Handling charges saved successfully`)
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
                    <h3>{`Add ${showBopLabel()} Handling Charge`}</h3>
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
                        label={`${showBopLabel()} Cost`}
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
                        label={`${showBopLabel()} Handling Type`}
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
                        disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                        isClearable={true}
                      />
                    </Col>

                    <Col md="12">
                      {BOPHandlingType === 'Fixed' ?
                        <NumberFieldHookForm
                          label={'Fixed Cost'}
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
                          disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                        /> :
                        <TextFieldHookForm
                          id="BOPHandlingPercentage"
                          label="Percentage"
                          name={"BOPHandlingPercentage"}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={false}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
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
                          disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                        />}
                    </Col>
                    <Col md="12">
                      <TooltipCustom id={"bop-handling-charges"} disabledIcon={true} tooltipText={`${BOPHandlingType === 'Fixed' ? `Handling Charges = Fixed Cost` : `Handling Charges = ${showBopLabel()} Cost * Percentage / 100`}`} />
                      <TextFieldHookForm
                        label="Handling Charges"
                        name={'BOPHandlingCharges'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        id={"bop-handling-charges"}
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
                    id="AddBopHandlingCharge_Cancel"
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={props.closeDrawer} >
                    <div className={'cancel-icon'}></div> {'Cancel'}
                  </button>

                  <button
                    id="AddBopHandlingCharge_Save"
                    type={'button'}
                    disabled={(CostingViewMode || IsLocked || IsLockTabInCBCCostingForCustomerRFQ) ? true : false}
                    className="submit-button mr5 save-btn"
                    onClick={saveHandleCharge} >
                    <div className={"save-icon"}></div>
                    {'Save'}
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