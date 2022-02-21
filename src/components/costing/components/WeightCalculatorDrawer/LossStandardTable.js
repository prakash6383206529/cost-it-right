import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey , checkPercentageValue} from '../../../../helper'
import Toaster from '../../../common/Toaster'
import { setForgingCalculatorMachiningStockSection, setPlasticArray } from '../../actions/Costing'; 


function LossStandardTable(props) {
  const { rmRowData , LossMachineFunction ,isLossStandard} = props
  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput
  const [lossWeight, setLossWeight] = useState('')
  
  const dispatch = useDispatch()



  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: defaultValues,
  })

  const fieldValues = useWatch({
    control,
    name: ['LossOfType', 'LossPercentage', 'FlashLength', 'FlashThickness' ,'FlashWidth', 'BarDiameter', 'BladeThickness', 'FlashLoss' ],
  })

  useEffect(() => {
    calculateLossWeight()
    calculateForgeLossWeight()
  }, [fieldValues])

  const { dropDownMenu } = props

  const [tableData, setTableData] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [oldNetWeight, setOldNetWeight] = useState('')
  const [netWeight, setNetWeight] = useState(props.netWeight !== '' ? props.netWeight : 0)
  const [burningWeight, setBurningWeight] = useState(props.burningValue !== '' ? props.burningValue : '')
  const [scaleandBiletLossType, setScaleandBiletLossType] = useState(false)
  const [barCuttingAllowanceLossType, setBarCuttingAllowanceLossType] = useState(false)
  const [flashLossType, setFlashLossType] = useState(false)
  const [useFormula , setUseformula] = useState(false)
  const [percentage , setPercentage] = useState(false)
  const [isDisable , setIsDisable] = useState(false)
  const [isBarBlade, setIsBarBlade] = useState(false)
  const [isFlashParametersDisable, setIsFlashParametersDisable] = useState(false)


  useEffect(() => {
    
    setTableData(props.sendTable ? props.sendTable : [])
    
    if(props?.sendTable?.length===0){
      dispatch(setForgingCalculatorMachiningStockSection(false))
    }
    else{
      dispatch(setForgingCalculatorMachiningStockSection(true))
    }
  }, [])

  const handleLossOfType = (value) =>{
    setPercentage(false)
    setUseformula(false)
    
    if((value.label==="Scale Loss") || (value.label==="Bilet Heating Loss")){

      setScaleandBiletLossType(true)
      setIsDisable(true)
    }
    else 
    {
      setScaleandBiletLossType(false)
    }
    if((value.label==="Bar Cutting Allowance")){
      setBarCuttingAllowanceLossType(true) 
     setIsDisable(false)
    }
    else
    {
      setBarCuttingAllowanceLossType(false) 
    }
   if((value.label==="Flash Loss")){

     setFlashLossType(true)
     setIsDisable(false)
   }
   else{
     setFlashLossType(false)
   }
  }
  const handleFlashloss = (value) =>{
    if((value.label==="Use Formula")){

      setUseformula(true)
      setIsDisable(true)
    }
    else 
    {
      setUseformula(false)
    }
    if((value.label==="Percentage")){
      setPercentage(true)
      setIsDisable(true)
    }
    else
    {
      setPercentage(false) 
    }
  }

  /**
   * @method calculateLossWeight
   * @description for calculating loss weight  and net loss weight
   */
  const calculateLossWeight = () => {
    const LossPercentage = checkForNull(getValues('LossPercentage'))

    const inputWeight = props.weightValue
    const LossWeight = (inputWeight * LossPercentage) / 100

    

    setValue('LossWeight', checkForDecimalAndNull(LossWeight, getConfigurationKey().NoOfDecimalForInputOutput))

    setLossWeight(LossWeight)
  }

  const calculateForgeLossWeight = (value) => {
   
    const LossPercentage = checkForNull(getValues('LossPercentage'))
    
    const FlashLength = checkForNull(getValues('FlashLength'))
    const FlashThickness = checkForNull(getValues('FlashThickness'))
    const FlashWidth = checkForNull(getValues('FlashWidth'))
    const BarDiameter = checkForNull(getValues('BarDiameter'))
    const BladeThickness = checkForNull(getValues('BladeThickness'))
    const LossOfType = getValues('LossOfType')
    
    if((LossOfType?.label==="Scale Loss") || (LossOfType?.label==="Bilet Heating Loss")){
      setIsDisable(true)
    }
    else{
    if((BarDiameter !== undefined && BarDiameter !==0) || (BladeThickness !== undefined && BladeThickness !==0) ){
      setIsBarBlade(false)
      setIsDisable(true)
    }else{
      
      setIsDisable(false)
      if(getValues('LossWeight') !==undefined && getValues('LossWeight') !== 0){

        setIsBarBlade(true)
      }else{
        setIsBarBlade(false)
      }
    }
    
    if((FlashLength !== undefined && FlashLength !==0) || (FlashThickness !== undefined && FlashThickness !==0)  || (FlashWidth !== undefined && FlashWidth !==0)){
      setIsDisable(true)
      setIsFlashParametersDisable(false)
    }else{ 
      setIsDisable(false)
      if(getValues('LossWeight') !==undefined && getValues('LossWeight') !== 0){
        setIsFlashParametersDisable(true)
      }else{
        setIsFlashParametersDisable(false)
      }
    }
  }
    const FlashLoss = getValues('FlashLoss')
    
    const forgeWeight = props.forgeValue
    let LossWeight = 0;
    switch (LossOfType?.label){
    case 'Scale Loss' :
      LossWeight = ((forgeWeight * LossPercentage)/100)
    break;
    case 'Bilet Heating Loss' :
      LossWeight = ((forgeWeight * LossPercentage)/100)
    break;
    case 'Flash Loss' :
      switch(FlashLoss?.label){
        case 'Use Formula':
          LossWeight = ((FlashLength * FlashThickness * FlashWidth * rmRowData.Density)/1000000)
        break;
        case 'Percentage':
          LossWeight = ((forgeWeight * LossPercentage)/100)
        break;
        default:

      }
    break;
    case 'Bar Cutting Allowance' :
      LossWeight = (((0.7857 * (Math.pow(BarDiameter,2)) * BladeThickness * rmRowData.Density)/1000000))
    break;
    default:
      return "none";  
    }
    
    setValue('LossWeight', checkForDecimalAndNull(LossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    
    setLossWeight(LossWeight)
    
  }

  const flashLossdropdown = [
    {
      label: 'Use Formula',
      value: 11,
    },
    {
      label: 'Percentage',
      value: 12,
    },

  ]
  /**
   * @method addRow
   * @description For updating and adding row
   */
  const addRow = () => {
    const LossPercentage = checkForNull(getValues('LossPercentage'))   
    const LossOfType = getValues('LossOfType').label
    const FlashLength = checkForNull(getValues('FlashLength'))  
    const FlashThickness = checkForNull(getValues('FlashThickness'))    
    const FlashWidth = checkForNull(getValues('FlashWidth'))    
    const BarDiameter = checkForNull(getValues('BarDiameter'))  
    const BladeThickness = checkForNull(getValues('BladeThickness'))
    const LossWeight = lossWeight
    
  console.log(lossWeight,'lossWeight');

    if (LossWeight && LossWeight === 0  ) {
      Toaster.warning("Please add data first.")
      return false;
    }
    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    if (!isEdit) {
      const isExist = tableData.findIndex(el => (el.LossOfType === LossOfType))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please select another loss type.')
        return false;
      }
    }


    let tempArray = []
    let NetWeight
    if (isEdit) {
      const oldWeight = netWeight - checkForNull(oldNetWeight)
      NetWeight = checkForNull(oldWeight + LossWeight)
      setNetWeight(NetWeight)
    } else {

      NetWeight = checkForNull(checkForNull(netWeight) + LossWeight)

      setTimeout(() => {
        setNetWeight(NetWeight)
      }, 400);

    }
   
    const obj = {
      LossPercentage: LossPercentage ? LossPercentage : "-",
      FlashLength: FlashLength ? FlashLength : "-",
      FlashWidth: FlashWidth ? FlashWidth : "-",
      FlashThickness: FlashThickness ? FlashThickness : "-",
      BarDiameter: BarDiameter ? BarDiameter : "-",
      BladeThickness: BladeThickness ? BladeThickness : "-",
      LossOfType: LossOfType,
      LossWeight: LossWeight,
      FlashLoss:getValues('FlashLoss')?.label,
      FlashLossId:getValues('FlashLoss')?.value
    }
    if (isEdit) {
      tempArray = Object.assign([...tableData], { [editIndex]: obj })
      setTableData(tempArray)
      if(isLossStandard===true){
      if(tempArray.length===0){
        LossMachineFunction(false)
      }
      else{
        LossMachineFunction(true)
      }
    } 
     
      
      setIsEdit(false)
    } else {
      // tempArray = [...tableData, obj]
      tempArray = tableData
      tempArray.push(obj)
      setTableData(tempArray)
      if(isLossStandard===true){
        if(tempArray.length===0){
          LossMachineFunction(false)
        }
        else{
          LossMachineFunction(true)
        }
      } 
   
      
    
    }

    if (LossOfType === 2) {
      setBurningWeight(LossWeight)
      props.burningLoss(LossWeight)
    }
    dispatch(setPlasticArray(tempArray))
    props.calculation(NetWeight)
    if(tempArray.length >0){
      dispatch(setForgingCalculatorMachiningStockSection(true))
    }else{
      dispatch(setForgingCalculatorMachiningStockSection(false))
    }
    props.tableValue(tempArray)

    reset({
      LossPercentage: '',
      FlashLength: '',
      FlashThickness: '',
      FlashWidth: '',
      BarDiameter: '',
      BladeThickness: '',
      LossOfType: '',
      LossWeight: '',
      FlashLoss:'',
    })
  }
  /**
   * @method editRow
   * @description for filling the row above table for editing
   */
  const editRow = (index) => {
    setIsEdit(true)
    setEditIndex(index)
    const tempObj = tableData[index]
    setOldNetWeight(tempObj.LossWeight)
    setValue('LossPercentage', tempObj.LossPercentage)
    setValue('FlashLength', tempObj.FlashLength)
    setValue('FlashThickness', tempObj.FlashThickness)
    setValue('FlashWidth', tempObj.FlashWidth)
    setValue('BarDiameter', tempObj.BarDiameter)
    setValue('BladeThickness', tempObj.BladeThickness)
    setValue('LossOfType', { label: getLossTypeName(tempObj.LossOfType), value: tempObj.LossOfType })
    setValue('LossWeight', tempObj.LossWeight)
    setValue('FlashLoss', { label:tempObj.FlashLoss, value: tempObj.FlashLossId })
    
    if((tempObj.LossOfType ===7 && tempObj.FlashLoss==="Use Formula")){
      setFlashLossType(true)
      setUseformula(true)
      setPercentage(false)
    }
    else if((tempObj.LossOfType.value===7 && tempObj.FlashLoss==="Percentage"))
    {
      setPercentage(true)
      setUseformula(false)
    }
    else{
      setFlashLossType(false)
    }
  }

  /**
   * @method cancelUpdate
   * @description Cancel update for edit
  */
  const cancelUpdate = () => {
    setIsEdit(false)
    setEditIndex('')
    setOldNetWeight('')
    setValue('LossPercentage', '')
    setValue('FlashLength', '')
    setValue('FlashThickness', '')
    setValue('FlashWidth', '')
    setValue('BarDiameter', '')
    setValue('BladeThickness', '')
    setValue('LossOfType', '')
    setValue('LossWeight', '')

  }
  /**
   * @method deleteRow
   * @description Deleting single row from table
   */
  const deleteRow = (index) => {
    const tempObj = tableData[index]
    let weight
    if (tableData.length === 1) {
      weight = 0
    } else {
      weight = netWeight - tempObj.LossWeight //FIXME Calculation going wrong need to ask Harish sir.
    }


    setNetWeight(weight)
    props.calculation(weight)
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })



    if (Number(tempObj.LossOfType) === 2) {
      setBurningWeight(0)
      props.burningLoss(0)
    }

    dispatch(setPlasticArray(tempData))
    if(tempData.length >0){
      dispatch(setForgingCalculatorMachiningStockSection(true))
    }else{
      dispatch(setForgingCalculatorMachiningStockSection(false))
    }
    props.tableValue(tempData)

    setTableData(tempData)
    if(isLossStandard===true){
      if(tempData.length===0){
      LossMachineFunction(false)
      }
      else{
        LossMachineFunction(true)
      }
    } 
      else{
      isLossStandard(false)
      }
      
  
  }

  const getLossTypeName = (number) => {
    const name = dropDownMenu && dropDownMenu.find(item => item.value === Number(number))
    return name?.label
  }
  
const changeinLossWeight = (value)=>{
   
if(value !== undefined && value !==0  && value !==''){
  setIsBarBlade(true)
  setLossWeight(value)
  setIsFlashParametersDisable(true)
}else{
  setIsBarBlade(false)
  setIsFlashParametersDisable(false)
}

}


  return (
    <Fragment>
      <Row className={''}>
        <Col md="12">
          <div className="header-title">
            <h5>{'Loss :'}</h5>
          </div>
        </Col>
        <Col md="3">
          <SearchableSelectHookForm
            label={`Type of Loss`}
            name={'LossOfType'}
            placeholder={'-Select-'}
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
            options={dropDownMenu}
            handleChange={handleLossOfType}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossOfType}
            disabled={props.CostingViewMode}
          />
        </Col>
        {scaleandBiletLossType&&
        <>
        <Col md="3">
          <TextFieldHookForm
            label={`Loss(%)`}
            name={'LossPercentage'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            rules={{
              required: false,
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
            errors={errors.LossPercentage}
            disabled={props.CostingViewMode}
          />
        </Col>
        </>}
        {barCuttingAllowanceLossType&&
        <>
        <Col md="3">
                    <TextFieldHookForm
                      label={`Bar Diameter(mm)`}
                      name={'BarDiameter'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.',
                        },
                        maxLength: {
                          value: 11,
                          message: 'Length should not be more than 11'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={()=>{}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.BarDiameter}
                      disabled={props.CostingViewMode ? props.CostingViewMode : isBarBlade}
                    />
                  </Col>
                 
                  
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Blade Thickness(mm)`}
                      name={'BladeThickness'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.',
                        },
                        maxLength: {
                          value: 11,
                          message: 'Length should not be more than 11'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={()=>{}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.BladeThickness}
                      disabled={props.CostingViewMode ? props.CostingViewMode : isBarBlade}
                    />
                  </Col>
                  </>}
         {flashLossType&&
         <>       
        <Col md="3">
          <SearchableSelectHookForm
            label={`Flash loss`}
            name={'FlashLoss'}
            placeholder={'-Select-'}
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
            options={flashLossdropdown}
            handleChange={handleFlashloss}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.FlashLoss}
            disabled={props.CostingViewMode}
          />
        </Col>
        </>}
        {useFormula&&
        <>
                <Col md="3">
                    <TextFieldHookForm
                      label={`Flash Length(mm)`}
                      name={'FlashLength'}
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
                        maxLength: {
                          value: 11,
                          message: 'Length should not be more than 11'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.FlashLength}
                      disabled={props.CostingViewMode ? props.CostingViewMode : isFlashParametersDisable}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Flash Thickness(mm)`}
                      name={'FlashThickness'}
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
                        maxLength: {
                          value: 11,
                          message: 'Length should not be more than 11'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.FlashThickness}
                      disabled={props.CostingViewMode ? props.CostingViewMode : isFlashParametersDisable}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Flash Width(mm)`}
                      name={'FlashWidth'}
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
                        maxLength: {
                          value: 11,
                          message: 'Length should not be more than 11'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.FlashWidth}
                      disabled={props.CostingViewMode ? props.CostingViewMode : isFlashParametersDisable}
                    />
                  </Col>
                  </>}
                  {percentage&&
                  <>
                  <Col md="3">
          <TextFieldHookForm
            label={`Loss(%)`}
            name={'LossPercentage'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            rules={{
              required: false,
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
            errors={errors.LossPercentage}
            disabled={props.CostingViewMode}
          />
        </Col>
        </>}
            
        <Col md="3">
          <TextFieldHookForm
            label={`Loss Weight`}
            name={'LossWeight'}
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
            handleChange={(e) =>changeinLossWeight(e.target.value)}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossWeight}
            disabled={isDisable}
          />
        </Col>
        <Col md="3" className="pr-0">
          <div>
            {isEdit ? (
              <>
                <button
                  type="submit"
                  className={'btn btn-primary mt30 pull-left mr5'}
                  onClick={() => addRow()}
                >
                  Update
                </button>

                <button
                  type="button"
                  className={'reset-btn mt30 pull-left mr5'}
                  onClick={() => cancelUpdate()}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="submit"
                className={'user-btn mt30 pull-left'}
                onClick={addRow}
                disabled={props.CostingViewMode}
              >
                <div className={'plus'}></div>ADD
              </button>
            )}
          </div>
        </Col>

        <Col md="12">
          <Table className="table mb-0 forging-cal-table" size="sm">
            <thead>
              <tr>
                <th>{`Type of Loss`}</th>
                <th>{`Flash Length`}</th>
                <th>{`Flash Thickness`}</th>
                <th>{`Flash Width`}</th>
                <th>{`Bar Diameter`}</th>
                <th>{`Blade Thickness`}</th>
                <th>{`Loss(%)`}</th>
                <th>{`Loss Weight`}</th>
                <th>{`Actions`}</th>
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map((item, index) => {
                  return (
                    <Fragment>
                      <tr key={index}>
                        <td>{getLossTypeName(item.LossOfType)!== null ?item.LossOfType:'-'}</td>
                        <td>{checkForDecimalAndNull(item.FlashLength,getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.FlashLength,getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.FlashThickness,getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.FlashThickness,getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.FlashWidth,getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.FlashWidth,getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.BarDiameter,getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.BarDiameter,getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.BladeThickness,getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.BladeThickness,getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.LossPercentage,getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.LossPercentage,getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>
                          {checkForDecimalAndNull(item.LossWeight,getConfigurationKey().NoOfDecimalForInputOutput)}
                        </td>
                        <td>
                          {
                            <React.Fragment>
                              <button
                                className="Edit mr-2"
                                type={'button'}
                                disabled={props.CostingViewMode}
                                onClick={() => editRow(index)}
                              />
                              <button
                                className="Delete"
                                type={'button'}
                                disabled={props.CostingViewMode}
                                onClick={() => deleteRow(index)}
                              />
                            </React.Fragment>
                          }
                        </td>
                      </tr>
                      {/* <tr>
                          <td></td>

                          <td>{`Net Loss Weight:`}</td>
                          <td>{checkForDecimalAndNull(netWeight, trim)}</td>
                          <td></td>
                        </tr> */}
                    </Fragment>
                  )
                })}
              {tableData && tableData.length === 0 && (
                <tr>
                  <td colspan="4">
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>

            {/* <span className="col-sm-4 ">{'30'}</span> */}
          </Table>
          <div className="col-md-12 text-right bluefooter-butn border">
            {props.isPlastic &&
              <span className="w-50 d-inline-block text-left">
                {`Burning Loss Weight:`}
                {checkForDecimalAndNull(burningWeight, trim)}
              </span>}
            <span className="w-50 d-inline-block">
              {`${props.isPlastic ? 'Other' : 'Net'} Loss Weight:`}
              {checkForDecimalAndNull(findLostWeight(tableData), trim)}
            </span>
          </div>
        </Col>

        {/* <Row>
            <Col md="12">
              <Row className={'mt15'}>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Net Forging Weight(UOM)`}
                    name={'netForgingWeight'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.netForgingWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Raw Material Cost/Component`}
                    name={'rawMaterialCost'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.rawMaterialCost}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Scrap Weight Recovery`}
                    name={'scrapWeightRecovery'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapWeightRecovery}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Scrap Cost`}
                    name={'scrapCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    // rules={{
                    //   required: false,
                    //   pattern: {
                    //     value: /^[0-9\b]+$/i,
                    //     //value: /^[0-9]\d*(\.\d+)?$/i,
                    //     message: 'Invalid Number.',
                    //   },
                    //   // maxLength: 4,
                    // }}
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapCost}
                    disabled={true}
                  />
                </Col>

                <Col md="3">
                  <TextFieldHookForm
                    label={`Material Cost`}
                    name={'materialCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    // rules={{
                    //   required: false,
                    //   pattern: {
                    //     //value: /^[0-9]*$/i,
                    //     value: /^[0-9]\d*(\.\d+)?$/i,
                    //     message: 'Invalid Number.',
                    //   },
                    //   // maxLength: 4,
                    // }}
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.materialCost}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Input RM Weight(UOM)`}
                    name={'rmWeight'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.rmWeight}
                    disabled={true}
                  />
                </Col>
              </Row>
            </Col>
          </Row> */}
      </Row>

    </Fragment>
  )
}

export default React.memo(LossStandardTable)
