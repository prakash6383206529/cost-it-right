import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey } from '../../../../helper'
import Toaster from '../../../common/Toaster'
import { setForgingCalculatorMachiningStockSection,setPlasticArray } from '../../actions/Costing';
import values from 'redux-form/lib/values'
import { sum } from 'lodash'
function MachiningStockTable(props) {
  
//   
  const { rmRowData, diableMachiningStock } = props
  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput
  const [forgingVolume, setForgingVolume] = useState('')
  const [grossWeight, setGrossWeight] = useState('')
  const [showLabel, setIsShowLabel] = useState(false)
  const dispatch = useDispatch()
  const [circularMachiningStock, setCircularMachiningStock] = useState(false)
  const [rectangularMachiningStock, setRectangularMachiningStock] = useState(false)
  const [squareMachiningStock, setSquareMachiningStock] = useState(false)
  const [irregularMachiningStock, setIrregularMachiningStock] = useState(false)
  const [disable, setDisable] = useState(true)
 console.log(diableMachiningStock,'diableMachiningStock');


  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: [ 'finishedWeight',
     'MachiningStock',
     'majorDiameter',
     'minorDiameter', 
     'Length',
     'Height', 
     'Breadth',
     'No', 

      ],
  })

  useEffect(() => {
    calculateforgingVolumeAndWeight()
    calculateTotalMachiningStock()
    
  }, [fieldValues])


  const handleVolumeChange = ()=>{
   
      calculateforgingVolumeAndWeight()
    
  }
  
  const { dropDownMenu } = props

  const [tableData, setTableData] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [oldNetWeight, setOldNetWeight] = useState('')
  const [netWeight, setNetWeight] = useState(props.netWeight !== '' ? props.netWeight : 0)

  const { forgingCalculatorMachiningStockSectionValue } = useSelector(state => state.costing)
  console.log('forgingCalculatorMachiningStockSectionValue: ', forgingCalculatorMachiningStockSectionValue);
 
  useEffect(() => {
    // console.log(forgingCalculatorMachiningStockSectionValue,'forgingCalculatorMachiningStockSectionValue');
  }, [forgingCalculatorMachiningStockSectionValue])


  useEffect(() => {
    setTableData(props.sendTable ? props.sendTable : [])

  }, [])
 

  const handleMachiningStockChange = (value) =>{
    setDisable(true)
    if((value.label==="Circular") || (value.label==="Semi Circular")|| (value.label==="Quarter Circular")){

      setCircularMachiningStock(true)
    }
    else 
    {
      setCircularMachiningStock(false)
    }
    
    if(value.label==="Square"){
      setSquareMachiningStock(true)
    }
    else{
      setSquareMachiningStock(false)
    }
    if(value.label==="Rectangular"){
      setRectangularMachiningStock(true)
    }
    else{
      setRectangularMachiningStock(false)
    }
    if(value.label==="Irregular"){
      setDisable(false)
      setIrregularMachiningStock(true)
    }
    else{
      setIrregularMachiningStock(false)
    }
  }

  const calculateforgingVolumeAndWeight = (value) => {
    const majorDiameter = checkForNull(getValues('majorDiameter'))
    
    const minorDiameter = checkForNull(getValues('minorDiameter'))
    
  
    const Length = checkForNull(getValues('Length')) 
    const Breadth = checkForNull(getValues('Breadth'))
    const Height = checkForNull(getValues('Height'))
    const No = checkForNull(getValues('No')) 
    const MachiningStock = getValues('MachiningStock')
    const forgingV=getValues('forgingVolume')
    
    let Volume = 0;
    let GrossWeight = 0;
    if ((minorDiameter > majorDiameter)){
      reset({
        minorDiameter: 0,
        majorDiameter:majorDiameter,
        Length:Length,
        Breadth:Breadth,
        Height:Height,
        No:No,
        MachiningStock:MachiningStock,
        forgingV:forgingV
    })
    return  Toaster.warning("Minor Diameter should be Smaller than Major Diameter")
      // return false;
    }


     switch(MachiningStock?.label){
      case 'Circular':
        Volume =
          (0.7857 * (Math.pow(majorDiameter,2)-Math.pow(minorDiameter,2)) * Length)
          GrossWeight = 
         ((Volume * rmRowData.Density)/1000000)
        break;
        
      case 'Semi Circular' :
        Volume = 
          (0.7857 * (Math.pow(majorDiameter,2)-Math.pow(minorDiameter,2)) * Length/2)
          GrossWeight = 
            (Volume * rmRowData.Density)/1000000 
        break;

      case 'Quarter Circular' :
        Volume = 
          (0.7857 * (Math.pow(majorDiameter,2)-Math.pow(minorDiameter,2)) * Length/4)
          GrossWeight = (Volume * rmRowData.Density)/1000000 
        break;
      case 'Square' :
        
        Volume = (Length * Length * Height)
        GrossWeight = (Volume * No * rmRowData.Density)/1000000 
           
          break;

      case 'Rectangular' :
        Volume = (Length * Breadth * Height)        
        GrossWeight =  (Volume * No * rmRowData.Density)/1000000 
         break; 
      case 'Irregular' :

  
      Volume = forgingV
      GrossWeight =  (forgingV * No * rmRowData.Density)/1000000 
            break;         
      default:
        return "none";   

    }
   
    setValue('forgingVolume', checkForDecimalAndNull(Volume, getConfigurationKey().NoOfDecimalForInputOutput))
    setForgingVolume(Volume)
    setValue('grossWeight', checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    setGrossWeight(GrossWeight)
   
    
  }
  
  const calculateTotalMachiningStock = (tableVal) =>{
    let sum = 0;
    tableVal && tableVal.map(item => {
    sum = sum + item.GrossWeight
  })
  // props.TotalMachiningStock(sum)
  return sum
  }


  /**
   * @method addRow
   * @description For updating and adding row
   */
  const addRow = () => {
    const Description = getValues('description')
    const MajorDiameter = checkForNull(getValues('majorDiameter'))
    const MinorDiameter = checkForNull(getValues('minorDiameter'))
    const Length = checkForNull(getValues('Length'))
    const Height = checkForNull(getValues('Height'))
    const Breadth = checkForNull(getValues('Breadth'))
    const No = checkForNull(getValues('No'))
    const MachiningStock = getValues('MachiningStock')
    
    const GrossWeight = checkForNull(grossWeight)  
    const Volume = checkForNull(forgingVolume)
 
    if ((GrossWeight && GrossWeight === 0 )||(Volume && Volume === 0)) {
      Toaster.warning("Please add data first.")
      return false;
    }

   // CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    if (!isEdit) {
      const isExist = tableData.findIndex(el => ( el.TypesOfMachiningStockId === MachiningStock?.value))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please select another Machining stock type.')
        return false;
      }
    }

    let tempArray = []
    let NetWeight
    if (isEdit) {
      const oldWeight = Number(netWeight) - Number(oldNetWeight)
      NetWeight = checkForNull(Number(oldWeight) + Number(GrossWeight))
      setNetWeight(Number(NetWeight))
      
    } else {

     NetWeight = checkForNull(checkForNull(netWeight) + checkForNull(GrossWeight))
     

     setTimeout(() => {
      setNetWeight(Number(NetWeight))
    }, 400);
   
     
    }

   
    const obj = {
      
         Description: Description ,
         MajorDiameter: MajorDiameter ? MajorDiameter : "-",
         MinorDiameter: MinorDiameter ? MinorDiameter: "-",
         Length: Length? Length : "-",
         Height: Height ? Height : "-",
         Breadth: Breadth? Breadth : "-",
         No: No? No : "-",
         TypesOfMachiningStock: MachiningStock?.label,
         TypesOfMachiningStockId:MachiningStock?.value,
         GrossWeight: GrossWeight,
         Volume: Volume,        
      }


      if (isEdit) {
        tempArray = Object.assign([...tableData], { [editIndex]: obj })
        setTableData(tempArray)
        setIsEdit(false)
      } else {
        // tempArray = [...tableData, obj]
        tempArray = tableData
        tempArray.push(obj)
        setTableData(tempArray)
      }
    
     props.calculation(NetWeight)
     props.tableValue(tempArray)

   
   
    reset({
      description: '',
      majorDiameter: '',
      minorDiameter: '',
      Length: '',
      Height: '',
      Breadth: '',
      No: '',
      MachiningStock:{},
      grossWeight: '',
      forgingVolume: '',
    
    })

    setValue("")
  
  }
  /**
   * @method editRow
   * @description for filling the row above table for editing
   */
  const editRow = (index) => {
    setIsEdit(true)
    setEditIndex(index)
    const tempObj = tableData[index]
    
    setOldNetWeight(tempObj.GrossWeight)
    setValue('majorDiameter', tempObj.MajorDiameter)
    setValue('minorDiameter', tempObj.MinorDiameter)
    setValue('Length', tempObj.Length)
    setValue('height', tempObj.Height)
    setValue('Breadth', tempObj.Breadth)
    setValue('No', tempObj.No)
    setValue('MachiningStock', { label:tempObj.TypesOfMachiningStock, value: tempObj.TypesOfMachiningStockId })
    setValue('grossWeight', tempObj.GrossWeight)
    setValue('forgingVolume', tempObj.Volume)
    setValue('description',tempObj.Description)
  }
  
  /**
   * @method cancelUpdate
   * @description Cancel update for edit
  */
  const cancelUpdate = () => {
    setIsEdit(false)
    setEditIndex('')
    setOldNetWeight('')
    setValue('majorDiameter', '')
    setValue('minorDiameter', '')
    setValue('Length', '')
    setValue('height', '')
    setValue('Breadth', '')
    setValue('No', '')
    setValue('MachiningStock', '')
    setValue('grossWeight', '')
    setValue('forgingVolume', '')
    setValue('description' , '')

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
      weight = netWeight - tempObj.GrossWeight 
    }


    setNetWeight(weight)
    props.calculation(weight)
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })


    props.tableValue(tempData)
    setTableData(tempData)
    
  }

  return (
    <Fragment>
      <Row className={''}>
        <Col md="12">
          <div className="header-title">
            <h5>{'Machining Stock:'}</h5>
          </div>
        </Col>
       
        <Col md="3">
          <SearchableSelectHookForm
            label={`Shape Type`}
            name={'MachiningStock'}
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
            handleChange={handleMachiningStockChange}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.MachiningStock}
            disabled={props.CostingViewMode|| diableMachiningStock ? true : false}
          />
        </Col>

       
        <Col md="2">
                      <TextFieldHookForm
                        label={`Description`}
                        name={'description'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.description}
                        disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                      />
                    </Col>
                    {!irregularMachiningStock&&
                    <>
                    <Col md="3">
                    <TextFieldHookForm
                      label={`Length(mm)`}
                      name={'Length'}
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
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Length}
                      disabled={props.CostingViewMode || diableMachiningStock ? true : false }
                    />
                  </Col>
                  </>}
              
        
                     {circularMachiningStock&&
                   <>
                    {!showLabel && (
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Major Diameter (mm)`}
                          name={'majorDiameter'}
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
                          errors={errors.majorDiameter}
                          disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                        />
                      </Col>
                    )}
                    {!showLabel && (
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Minor Diameter (mm)`}
                          name={'minorDiameter'}
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
                          errors={errors.minorDiameter}
                          disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                        />
                      </Col>
                      
                    )}
                    
                
                   </> }
                   {squareMachiningStock&&
                  <>
                  
                <Col md="3">
                    <TextFieldHookForm
                      label={`Number`}
                      name={'No'}
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
                          value: 6,
                          message: 'Length should not be more than 6'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.No}
                      disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                    />
                  </Col>
                  
                
                  <Col md="3">
                  <TextFieldHookForm
                    label={`Height(mm)`}
                    name={'Height'}
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
                    errors={errors.Height}
                    disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                  />
                </Col>
                </> }
                {rectangularMachiningStock&&
                <>
                
                <Col md="3">
                    <TextFieldHookForm
                      label={`Number`}
                      name={'No'}
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
                          value: 6,
                          message: 'Length should not be more than 6'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.No}
                      disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                    />
                  </Col>
                 
                  
                
                <Col md="3">
                    <TextFieldHookForm
                      label={`Breadth (mm)`}
                      name={'Breadth'}
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
                      errors={errors.Breadth}
                      disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                    />
                  </Col>
                  <Col md="3">
                  <TextFieldHookForm
                    label={`Height(mm)`}
                    name={'Height'}
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
                    errors={errors.Height}
                    disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                  />
                </Col>
                
                </>}
                {irregularMachiningStock&&
                <>
                <Col md="3">
                    <TextFieldHookForm
                      label={`Number`}
                      name={'No'}
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
                          value: 6,
                          message: 'Length should not be more than 6'
                        },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.No}
                      disabled={props.CostingViewMode || diableMachiningStock ? true : false}
                    />
                  </Col>
                  </>}
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Volume(mm^3)`}
                      name={'forgingVolume'}
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
                      handleChange={handleVolumeChange}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.forgingVolume}
                      disabled={disable}
                    />
                  </Col>
                  <Col md="3">
                      <TextFieldHookForm
                        label={`Gross Weight(kg)`}
                        name={'grossWeight'}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.grossWeight}
                        disabled={true}
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
                <th>{`Description`}</th>
                <th>{`Type of Machining Stock`}</th>
                <th>{`Major Diameter (mm)`}</th>
                <th>{`Minor Diameter (mm)`}</th>
                <th>{`Length (mm)`}</th>
                <th>{`Breadth (mm)`}</th>
                <th>{`Height (mm)`}</th>
                <th>{`Number`}</th>
                <th>{`Volume (mm^3)`}</th>
                <th>{`Gross Weight (Kg)`}</th>

                <th>{`Actions`}</th>
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map((item, index) => {
                  return (
                    <Fragment>
                      <tr key={index}>
                        <td>{item.Description !== null ?item.Description : '-'}</td>
                        <td>{item.TypesOfMachiningStock !== null ?item.TypesOfMachiningStock:'-'}</td>
                        <td>{checkForDecimalAndNull(item.MajorDiameter , getConfigurationKey().NoOfDecimalForInputOutput) !== null ?checkForDecimalAndNull(item.MajorDiameter , getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td> 
                        <td>{checkForDecimalAndNull(item.MinorDiameter, getConfigurationKey().NoOfDecimalForInputOutput)  !== null?checkForDecimalAndNull(item.MinorDiameter, getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.Length  , getConfigurationKey().NoOfDecimalForInputOutput)!== null?checkForDecimalAndNull(item.Length  , getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.Breadth , getConfigurationKey().NoOfDecimalForInputOutput) !== null?checkForDecimalAndNull(item.Breadth , getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.Height , getConfigurationKey().NoOfDecimalForInputOutput) !== null?checkForDecimalAndNull(item.Height , getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>
                        <td>{checkForDecimalAndNull(item.No, getConfigurationKey().NoOfDecimalForInputOutput)!== null ?checkForDecimalAndNull(item.No, getConfigurationKey().NoOfDecimalForInputOutput):'-'}</td>

                        <td>
                          {checkForDecimalAndNull(item.Volume, getConfigurationKey().NoOfDecimalForInputOutput)}
                        </td>
                        <td>
                          {checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput)}
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
           {/* {props.isPlastic &&
              // <span className="w-50 d-inline-block text-left">
              //   {`Burning Loss Weight:`}
              //   {checkForDecimalAndNull(burningWeight, trim)}
              // </span>} */}
            <span className="w-50 d-inline-block">
              {`Total Machining Stock:`}
              {checkForDecimalAndNull(calculateTotalMachiningStock(tableData),trim)}
            </span>
          </div>
        </Col>

      </Row>

    </Fragment>
  )
}

export default React.memo(MachiningStockTable)
