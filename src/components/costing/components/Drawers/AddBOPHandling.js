import React from 'react';
import { Container, Row, Col, } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form'
import Drawer from '@material-ui/core/Drawer';
import {  TextFieldHookForm } from '../../../layout/HookFormInputs';
import { ViewCostingContext } from '../CostingDetails';
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { useDispatch } from 'react-redux';
import { saveAssemblyBOPHandlingCharge, saveAssemblyPartRowCostingCalculation } from '../../actions/Costing';
import { NetPOPriceContext } from '../CostingDetailStepTwo';

function AddBOPHandling(props) {
    const CostingViewMode = useContext(ViewCostingContext);
    const { RMCCTabData,getAssemBOPCharge,SurfaceTabData,OverheadProfitTabData,PackageAndFreightTabData,ToolTabData,DiscountCostData } = useSelector(state => state.costing)
    const dispatch = useDispatch()
    const netPOPrice = useContext(NetPOPriceContext);
    

    useEffect(()=>{       

            const childPartDetail = RMCCTabData[0]?.CostingChildPartDetails
            let BOPSum=0           
            childPartDetail && childPartDetail.map((el) => {
                if(el.PartType ==='BOP'){
                    BOPSum= BOPSum+( el.CostingPartDetails.TotalBoughtOutPartCost * el.CostingPartDetails.Quantity)                 
                }else if(el.PartType ==='Sub Assembly'){
                    el.CostingChildPartDetails && el.CostingChildPartDetails.map(item =>{
                        if(item.PartType === 'BOP'){                      
                            BOPSum = BOPSum + ( item.CostingPartDetails.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity)
                
                        }
                    })
                }                
              })
              setValue('BOPCost',BOPSum)
             
              if(RMCCTabData[0].CostingPartDetails.IsApplyBOPHandlingCharges ){
                setValue('BOPHandlingPercentage',RMCCTabData[0].CostingPartDetails.BOPHandlingPercentage)
                setValue('BOPHandlingCharges',RMCCTabData[0].CostingPartDetails.BOPHandlingCharges)
            }else if(Object.keys(getAssemBOPCharge).length>0){
                  setValue('BOPHandlingPercentage',getAssemBOPCharge.BOPHandlingPercentage)
                  setValue('BOPHandlingCharges',getAssemBOPCharge.BOPHandlingCharges)

              }
              
    },[])

    const { register, handleSubmit, control, setValue, getValues,formState:{errors} } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
      })


      const handleBOPPercentageChange = (value) => {
        if (!isNaN(value)) {
    
          if (value > 100) {
            setValue('BOPHandlingPercentage', 0)
            setValue('BOPHandlingCharges', 0)
            return false;
          }
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

  const setBOPCostAssembly = (arr)=>{
    const total = arr && arr.reduce((accummlator, item) => {
      if(item.PartType ==='BOP'){
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCost * item.Quantity
      }else{
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity * item.Quantity
      }        
    }, 0)
   
    return total
  }

  const getBOPTotalCost =(tabData)=>{
      const TotalBoughtOutPartCost = setBOPCostAssembly(tabData.CostingChildPartDetails)
    return (tabData.CostingPartDetails.TotalBoughtOutPartCost * tabData.CostingPartDetails.Quantity)+ checkForNull(getValues('BOPHandlingCharges') )
  }

  const saveHandleCharge = () =>{
    const tabData = RMCCTabData[0]
    const surfaceTabData= SurfaceTabData[0]
    const overHeadAndProfitTabData=OverheadProfitTabData[0]
    const discountAndOtherTabData =DiscountCostData

    let obj={
        IsApplyBOPHandlingCharges: true,
        BOPHandlingPercentage: getValues('BOPHandlingPercentage'),
        BOPHandlingCharges:getValues('BOPHandlingCharges')
      }
      dispatch(saveAssemblyBOPHandlingCharge(obj))
      let assemblyWorkingRow=[]
      tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item)=>{
        let subAssemblyObj ={
        "CostingId":item.CostingId,
        "CostingNumber": "", // Need to find out how to get it.
        "TotalRawMaterialsCostWithQuantity": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
        "TotalBoughtOutPartCostWithQuantity": item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
        "TotalConversionCostWithQuantity": item.CostingPartDetails?.TotalConversionCostWithQuantity,
         "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +item.CostingPartDetails?.TotalBoughtOutPartCost+item.CostingPartDetails?.TotalConversionCost,
        "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
        "TotalOperationCostSubAssembly":checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
        "TotalOperationCostComponent": item.CostingPartDetails.TotalOperationCostComponent,
        "SurfaceTreatmentCostPerAssembly": 0,
        "TransportationCostPerAssembly": 0,
        "TotalSurfaceTreatmentCostPerAssembly": 0,
        "TotalCostINR": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity
        }
        assemblyWorkingRow.push(subAssemblyObj)
        return assemblyWorkingRow
      })
      let assemblyRequestedData = {
        
          "TopRow": {
          "CostingId":tabData.CostingId,
          "CostingNumber": tabData.CostingNumber,
          "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": getBOPTotalCost(tabData),
          "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity+ tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "NetBOPCostAssembly":getBOPTotalCost(tabData),
          "NetConversionCostPerAssembly":tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "NetRMBOPCCCost":tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity + getValues('BOPHandlingCharges'),
          "TotalOperationCostPerAssembly": tabData.CostingPartDetails.TotalOperationCostPerAssembly,
          "TotalOperationCostSubAssembly":checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
          "TotalOperationCostComponent": checkForNull(tabData.CostingPartDetails?.TotalOperationCostComponent),
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
          "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
          "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
          "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
          "NetDiscounts":discountAndOtherTabData?.HundiOrDiscountValue,
          "TotalCostINR": netPOPrice +getValues('BOPHandlingCharges'),
          "TabId": 1
          },
          "WorkingRows": assemblyWorkingRow,
          "BOPHandlingCharges": {
            "AssemblyCostingId": tabData.CostingId,
            "IsApplyBOPHandlingCharges": true,
            "BOPHandlingPercentage": getValues('BOPHandlingPercentage'),
            "BOPHandlingCharges": getValues('BOPHandlingCharges')
          },
          "LoggedInUserId": loggedInUserId()
        
      }
    
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData,res =>{}))
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

              < form onSubmit={()=>{}} noValidate >

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