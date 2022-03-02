import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../../common/Toaster'
import { saveRawMaterialCalciData } from '../../../actions/CostWorking'
import { costingInfoContext } from '../../CostingDetailStepTwo'

import {

  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import {
  checkForDecimalAndNull,
  checkForNull,
  findLostWeight,
  getConfigurationKey,
  checkPercentageValue,
  loggedInUserId

} from '../../../../../helper'
import MachiningStockTable from '../MachiningStockTable'
import LossStandardTable from '../LossStandardTable'
import { data } from 'react-dom-factories'
import { KG } from '../../../../../config/constants'





function ColdForging(props) {
  const { rmRowData } = props
  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput
  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
  const defaultValues = {
    finishedWeight: WeightCalculatorRequest &&
    WeightCalculatorRequest.FinishWeight !== undefined
    ? WeightCalculatorRequest.FinishWeight
    : '',
    forgedWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.ForgedWeight !== undefined
      ? WeightCalculatorRequest.ForgedWeight
      : '',
    BilletDiameter: WeightCalculatorRequest &&
      WeightCalculatorRequest.BilletDiameter !== undefined
      ? WeightCalculatorRequest.BilletDiameter
      : '',
    BilletLength: WeightCalculatorRequest &&
     WeightCalculatorRequest.BilletLength !== undefined
      ? WeightCalculatorRequest.BilletLength
      : '',
    InputLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.InputLength !== undefined
      ? WeightCalculatorRequest.InputLength
      : '',
    NoOfPartsPerLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.NoOfPartsPerLength !== undefined
      ? WeightCalculatorRequest.NoOfPartsPerLength
      : '',
    EndBitLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.EndBitLength !== undefined
      ? WeightCalculatorRequest.EndBitLength
      : '',
    EndBitLoss: WeightCalculatorRequest &&
      WeightCalculatorRequest.EndBitLoss !== undefined
      ? WeightCalculatorRequest.EndBitLoss
      : '',
    TotalInputWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.InputWeight !== undefined
      ? WeightCalculatorRequest.InputWeight
      : '',
    ScrapWeight: WeightCalculatorRequest &&
      WeightCalculatorRequest.ScrapWeight !== undefined
      ? WeightCalculatorRequest.ScrapWeight
      : '',
    ScrapCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.ScrapCost !== undefined
      ? WeightCalculatorRequest.ScrapCost
      : '', 
    ScrapRecoveryPercentage: WeightCalculatorRequest &&
      WeightCalculatorRequest.RecoveryPercentage !== undefined
      ? WeightCalculatorRequest.RecoveryPercentage
      : '',
    NetRMCostComponent: WeightCalculatorRequest &&
      WeightCalculatorRequest.NetRMCost !== undefined
      ? WeightCalculatorRequest.NetRMCost
      : ''
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const { forgingCalculatorMachiningStockSectionValue } = useSelector(state => state.costing)


  useEffect(() => {
  
  }, [forgingCalculatorMachiningStockSectionValue])
  const fieldValues = useWatch({
    control,
    name: ['finishedWeight', 'BilletDiameter' , 'BilletLength' , 'ScrapRecoveryPercentage'],
  })

  const dispatch = useDispatch()
  const [inputWeightValue, setInputWeightValue] = useState(0)
  const [forgeWeightValue, setForgeWeightValue] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ForgedWeight ? WeightCalculatorRequest.ForgedWeight : 0)
  const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
  const [inputLengthValue, setInputLengthValue] = useState(WeightCalculatorRequest && WeightCalculatorRequest.InputLength ? WeightCalculatorRequest.InputLength : 0)
  const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
  const [tableV, setTableV] = useState(WeightCalculatorRequest && WeightCalculatorRequest.CostingRawMaterialForgingWeightCalculators !== null ? WeightCalculatorRequest.CostingRawMaterialForgingWeightCalculators : [])
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const [dataSend, setDataSend] = useState({})
  const [totalMachiningStock, setTotalMachiningStock] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningStock ? WeightCalculatorRequest.TotalMachiningStock : 0)
  const [disableAll , setDisableAll] = useState(WeightCalculatorRequest && WeightCalculatorRequest.finishedWeight !== null ? false : true)

  const costData = useContext(costingInfoContext)
  useEffect(() => {
    calculateForgeWeight()
    calculateInputLength()
    calculateNoOfPartsPerLength()
    calculateEndBitLength() 
    calculateEndBitLoss()
    calculateTotalInputWeight()
    calculateScrapWeight()
    calculateScrapCost()
    calculateNetRmCostComponent()

  }, [fieldValues,lostWeight])

  /**
   * @method calculateForgeWeight
   * @description calculate forge weight
   */
  const calculateForgeWeight = () => {
    
    
    const finishedWeight = checkForNull(getValues('finishedWeight'))
    
    
    
    const forgedWeight =  finishedWeight + totalMachiningStock
    

    

    let obj = dataSend
    obj.forgedWeight = forgedWeight
    setDataSend(obj)
    setValue('forgedWeight', checkForDecimalAndNull(forgedWeight, initialConfiguration.NoOfDecimalForInputOutput))

    setForgeWeightValue(forgedWeight)
    

  }

 
/**
   * @method calculateInputLength
   * @description calculate Input Length
   */

  const calculateInputLength = () =>{
    
    const BilletDiameter = getValues('BilletDiameter')
    
    const forgedWeight = forgeWeightValue
    
    const InputLength = (forgedWeight + lostWeight)/(0.7857 * Math.pow(BilletDiameter, 2) * rmRowData.Density/1000000)
    
    let obj = dataSend
    obj.InputLength = InputLength
    setDataSend(obj)
     setValue('InputLength', checkForDecimalAndNull(InputLength, getConfigurationKey().NoOfDecimalForInputOutput))

    //setInputLengthValue(InputLength)
  }
  /**
   * @method calculateNoOfPartsPerLength
   * @description calculate No Of Parts Per Length
   */

  const calculateNoOfPartsPerLength = () =>{
    const BilletLength = checkForDecimalAndNull(getValues('BilletLength'), getConfigurationKey().NoOfDecimalForInputOutput)
    const InputLength = dataSend.InputLength
    const NoOfPartsPerLength = parseInt(BilletLength/InputLength)
    
    let obj = dataSend
    obj.NoOfPartsPerLength = NoOfPartsPerLength
      
   setDataSend(obj)

    setValue('NoOfPartsPerLength', checkForDecimalAndNull(NoOfPartsPerLength, getConfigurationKey().NoOfDecimalForPrice))

  }

   /**
   * @method calculateEndBitLength
   * @description calculate EndBit Length 
   */
    const calculateEndBitLength = () => {
      const BilletLength = checkForNull(getValues('BilletLength'))
      const InputLength = dataSend.InputLength
      const NoOfPartsPerLength = dataSend.NoOfPartsPerLength
      const EndBitLength = BilletLength-(InputLength*NoOfPartsPerLength)
      let obj = dataSend
      obj.EndBitLength = EndBitLength
      setDataSend(obj)
      setValue('EndBitLength', checkForDecimalAndNull(EndBitLength, getConfigurationKey().NoOfDecimalForPrice))

    }

    
   /**
   * @method calculateEndBitLoss
   * @description calculate End BitLoss
   */
  const calculateEndBitLoss= () =>{
    const BilletDiameter = checkForNull(getValues('BilletDiameter'))
 
    const EndBitLength = dataSend.EndBitLength
  
    const NoOfPartsPerLength = dataSend.NoOfPartsPerLength
 
    const EndBitLoss = (0.7857*BilletDiameter*BilletDiameter*EndBitLength*(rmRowData.Density/1000000)/NoOfPartsPerLength)
  
 
    let obj = dataSend
    obj.EndBitLoss = EndBitLoss
  
      
      setDataSend(obj)
   
      
 setValue('EndBitLoss', checkForDecimalAndNull(EndBitLoss, getConfigurationKey().NoOfDecimalForPrice))

  }

   /**
   * @method calculateTotalInputWeight
   * @description Calculate Total Input Weight
   */

    const calculateTotalInputWeight = () => {
      
      
      const forgedWeight = forgeWeightValue  
      
      const EndBitLoss =  dataSend.EndBitLoss  
      const TotalInputWeight = forgedWeight + lostWeight + EndBitLoss
      
    let obj = dataSend
    obj.TotalInputWeight = TotalInputWeight
      
      setDataSend(obj)
  
     setValue('TotalInputWeight', checkForDecimalAndNull(TotalInputWeight, initialConfiguration.NoOfDecimalForInputOutput))  

    }
 
  /**
   * @method calculateScrapWeight
   * @description Calculate Scrap Weight
   *
   */
  const calculateScrapWeight = () => {
    const TotalInputWeight =  dataSend.TotalInputWeight
    const finishedWeight = checkForNull(getValues('finishedWeight'))
    if (!finishedWeight || !TotalInputWeight) {
      return ''
    }
    const ScrapWeight = TotalInputWeight - finishedWeight
    let obj = dataSend
    obj.ScrapWeight = ScrapWeight
      
      setDataSend(obj)
  
     setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, initialConfiguration.NoOfDecimalForInputOutput))

  }
  /**
   * @method calculateScrapCost
   * @description Calculate Scrap Cost
   */
  const calculateScrapCost = () => {
    const ScrapRecoveryPercentage = checkForNull(getValues('ScrapRecoveryPercentage'))
    const ScrapWeight = dataSend.ScrapWeight
    const ScrapCost = (ScrapWeight * ScrapRecoveryPercentage* rmRowData.ScrapRate)/100
    let obj = dataSend
    obj.ScrapCost = ScrapCost
      
      setDataSend(obj)
    
     setValue('ScrapCost', checkForDecimalAndNull(ScrapCost, getConfigurationKey().NoOfDecimalForPrice))

    
  }
  
  /**
   * @method calculateNetRmCostComponent
   * @description calculate Net Rm Cost/Component
   */

const calculateNetRmCostComponent = () =>{
  const TotalInputWeight = dataSend.TotalInputWeight
  const ScrapCost = dataSend.ScrapCost
  const NetRMCostComponent = (TotalInputWeight * rmRowData.RMRate-ScrapCost)
  let obj = dataSend
  obj.NetRMCostComponent = NetRMCostComponent
    
    setDataSend(obj)
  
 
  setValue('NetRMCostComponent', checkForDecimalAndNull(NetRMCostComponent, getConfigurationKey().NoOfDecimalForPrice))

}

  /**
   * @method onSubmit
   * @description Form submission Function
   */
  const onSubmit = (values) => {
    let obj = {}
  
    obj.LayoutType = 'Cold'
    obj.WeightCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000"
    obj.IsChangeApplied = true //Need to make it dynamic
    obj.PartId = costData.PartId
    obj.RawMaterialId = rmRowData.RawMaterialId
    obj.CostingId = costData.CostingId
    obj.TechnologyId = costData.TechnologyId
    obj.CostingRawMaterialDetailId = rmRowData.RawMaterialDetailId
    obj.RawMaterialName = rmRowData.RMName
    obj.RawMaterialType = rmRowData.MaterialType
    obj.BasicRatePerUOM = rmRowData.RMRate
    obj.ScrapRate = rmRowData.ScrapRate
    obj.PartNumber = costData.PartNumber
    obj.TechnologyName = costData.TechnologyName
    obj.Density = rmRowData.Density
    obj.UOMId = rmRowData.UOMId
    obj.UOM = rmRowData.UOM
    obj.UOMForDimension = KG
    obj.FinishWeight = getValues('finishedWeight')
    obj.ForgedWeight = dataSend.forgedWeight
    obj.BilletDiameter = getValues('BilletDiameter')
    obj.BilletLength = getValues('BilletLength')
    obj.InputLength = dataSend.InputLength
    obj.NoOfPartsPerLength = dataSend.NoOfPartsPerLength
    obj.EndBitLength = dataSend.EndBitLength
    obj.EndBitLoss = dataSend.EndBitLoss
    obj.InputWeight = dataSend.TotalInputWeight // BIND IT WITH GROSS WEIGHT KEY
    obj.GrossWeight = dataSend.TotalInputWeight
    obj.ScrapWeight = dataSend.ScrapWeight
    obj.RecoveryPercentage = getValues('ScrapRecoveryPercentage')
    obj.ScrapCost = dataSend.ScrapCost
    obj.NetRMCost = dataSend.NetRMCostComponent // BIND IT WITH NETLANDED COST
    obj.NetLandedCost = dataSend.NetRMCostComponent 


    obj.LoggedInUserId = loggedInUserId()

    let tempArr = []
    tableVal && tableVal.map(item => {
        tempArr.push({ LossOfType: item.LossOfType,FlashLoss: item.FlashLoss,FlashLossId: item.FlashLossId, LossPercentage: item.LossPercentage, FlashLength: item.FlashLength, FlashThickness: item.FlashThickness, FlashWidth: item.FlashWidth, BarDiameter: item.BarDiameter, BladeThickness: item.BladeThickness, LossWeight: item.LossWeight, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000" })
    })
    obj.LossOfTypeDetails = tempArr
    obj.NetLossWeight = lostWeight

    let tempArray = []
    
    tableV && tableV.map(item => {
      tempArray.push({ TypesOfMachiningStock: item.TypesOfMachiningStock,TypesOfMachiningStockId: item.TypesOfMachiningStockId, Description: item.Description, MajorDiameter: item.MajorDiameter, MinorDiameter: item.MinorDiameter, Length: item.Length, Breadth: item.Breadth, Height: item.Height, No: item.No,GrossWeight: item.GrossWeight, Volume: item.Volume, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000" })
  })
  obj.CostingRawMaterialForgingWeightCalculators = tempArray
  obj.TotalMachiningStock = totalMachiningStock
   
  
    dispatch(saveRawMaterialCalciData(obj, res => {
      if (res.data.Result) {
        obj.WeightCalculationId = res.data.Identity
        Toaster.success("Calculation saved successfully")
        props.toggleDrawer('', obj)
      }
    }))
  }
   const TotalMachiningStock = (value) =>{
     

    setTotalMachiningStock(value)
   }

   useEffect(()=>{
    calculateForgeWeight()
   },[totalMachiningStock])

  /**
   * @method onCancel
   * @description on cancel close the drawer
   */
  const onCancel = () => {
    props.toggleDrawer('')
  }

  const tableData = (value = []) => {

    setTableVal(value)
  }

  const setLoss = (value)=>{
    
    
    setLostWeight(value)
  }
  const dropDown = [
  
    {
      label: 'Bilet Heating Loss',
      value: 6,
    },
    {
      label: 'Flash Loss',
      value: 7,
    },
    {
      label: 'Bar Cutting Allowance',
      value: 8,
    },
  ]
  
  const tableData1 = (value = []) => {

    setTableV(value)
    
  }
  const machineDropDown = [
    {
      label: 'Circular',
      value: 1,
    },
    {
      label: 'Semi Circular',
      value: 2,
    },
    {
      label: 'Quarter Circular',
      value: 3,
    },
    {
      label: 'Square',
      value: 4,
    },
    {
      label: 'Rectangular',
      value: 9,
    },
    {
      label: 'Irregular',
      value: 10,
    },
  ]
  const handleFinishWeight = (value)=>{
    
    
    if(value.target.value===0 || value.target.value===''){
      setDisableAll(true)
    }
    else{
    setDisableAll(false)
    }
  }


  return (
    <Fragment>
      <Row>
        <Col> 
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Col md="12" className='px-0'>
              <div className="border px-3 pt-3">
                <Row>
                  
                  <Col md="12">
                    <Row className={'mt15'}>
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Finished Weight(kg)`}
                          name={'finishedWeight'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{
                            required: true,
                            pattern: {
                              value: /^\d{0,4}(\.\d{0,7})?$/i,
                              message: 'Maximum length for interger is 4 and for decimal is 7',
                            },

                          }}
                          handleChange={handleFinishWeight}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.finishedWeight}
                          disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue ? true : false} 
                        />
                      </Col>
                      
                    </Row>
                    <MachiningStockTable
                      dropDownMenu={machineDropDown}
                      CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                      netWeight={WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningStock !== null ? WeightCalculatorRequest.TotalMachiningStock : ''}
                      sendTable={WeightCalculatorRequest ? (WeightCalculatorRequest.CostingRawMaterialForgingWeightCalculators?.length > 0 ? WeightCalculatorRequest.CostingRawMaterialForgingWeightCalculators : []) : []}
                      tableValue={tableData1}
                      rmRowData={props.rmRowData}
                      calculation = {TotalMachiningStock}
                      hotcoldErrors={errors}
                      disableAll ={disableAll}
                      
                    />
                  </Col>
                </Row>
               
                <Col md="3">
                  <TextFieldHookForm
                      label={`Forged Weight (Kg)`}
                      name={'forgedWeight'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.forgedWeight}
                      disabled={true}
                    />
                  </Col>
                <LossStandardTable
                  dropDownMenu={dropDown}
                  CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                  forgeValue = {forgeWeightValue}
                  calculation={setLoss}
                  netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                  sendTable={WeightCalculatorRequest ? (WeightCalculatorRequest.LossOfTypeDetails?.length > 0 ? WeightCalculatorRequest.LossOfTypeDetails : []) : []}
                  tableValue={tableData}
                  rmRowData={props.rmRowData}
                  isPlastic={false}
                  isLossStandard = {true}
                  isNonFerrous={false}
                  disableAll ={disableAll}


                />
                
              </div>
            </Col>
            <Row>
            <Col md="3">
                    <TextFieldHookForm
                      label={`Billet Diameter(mm)`}
                      name={'BilletDiameter'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^\d{0,3}(\.\d{0,5})?$/i,
                          message: 'Maximum length for interger is 3 and for decimal is 5',
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.BilletDiameter}
                      disabled={props.CostingViewMode|| disableAll ? true : false}

                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Billet Length(mm)`}
                      name={'BilletLength'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^\d{0,3}(\.\d{0,5})?$/i,
                          message: 'Maximum length for interger is 3 and for decimal is 5',
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.BilletLength}
                      disabled={props.CostingViewMode|| disableAll ? true : false}

                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Input Length(mm)`}
                      name={'InputLength'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InputLength}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                  <TextFieldHookForm
                      label={`No Of Parts Per Length`}
                      name={'NoOfPartsPerLength'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.NoOfPartsPerLength}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                  <TextFieldHookForm
                      label={`End Bit Length`}
                      name={'EndBitLength'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.EndBitLength}
                      disabled={true}
                    />
                  </Col>

                  <Col md="3">
                  <TextFieldHookForm
                      label={`End Bit Loss (Kg)`}
                      name={'EndBitLoss'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.EndBitLoss}
                      disabled={true}
                    />
                  </Col>
 
                  </Row>
                  <Row>
                  <Col md="3">
                  <TextFieldHookForm
                      label={`Total Input Weight (Kg)`}
                      name={'TotalInputWeight'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.TotalInputWeight}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                  <TextFieldHookForm
                      label={`Scrap Weight (Kg)`}
                      name={'ScrapWeight'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ScrapWeight}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Scrap Recovery Percentage`}
                      name={'ScrapRecoveryPercentage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.',
                        },
                        max: {
                          value: 100,
                          message: 'Percentage cannot be greater than 100'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={()=>{}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ScrapRecoveryPercentage}
                      disabled={props.CostingViewMode|| disableAll ? true : false}
                    />
                  </Col>
                  <Col md="3">
                  <TextFieldHookForm
                      label={`Scrap Cost`}
                      name={'ScrapCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ScrapCost}
                      disabled={true}
                    />
                  </Col>
                  
                  <Col md="3">
                  <TextFieldHookForm
                      label={`Net RM Cost/ Component`}
                      name={'NetRMCostComponent'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: true,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.NetRMCostComponent}
                      disabled={true}
                    />
                  </Col>
                  </Row>
               
            <div className="mt25 col-md-12 text-right">
              <button
                onClick={onCancel} // Need to change this cancel functionality
                type="submit"
                value="CANCEL"
                className="reset mr15 cancel-btn"
              >
                <div className={'cancel-icon'}></div>
                CANCEL
              </button>
              <button
                type="submit"
                // onClick={(e)=>{handleSubmit(onSubmit)}}
                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                className="btn-primary save-btn"
              >
                <div className={'check-icon'}>
                  <i class="fa fa-check" aria-hidden="true"></i>
                </div>
                {'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default ColdForging
