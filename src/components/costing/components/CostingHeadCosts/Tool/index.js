import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller,useWatch } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import AddTool from '../../Drawers/AddTool';
import { isToolDataChange, setComponentToolItemData } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';

function Tool(props) {

  const { IsApplicableProcessWise, data } = props;
  const headerCosts = useContext(netHeadCostContext);
  const dispatch = useDispatch();

  const ObjectForOverAllApplicability = data.CostingPartDetails && data.CostingPartDetails.CostingToolCostResponse && data.CostingPartDetails.CostingToolCostResponse[0];

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const costingHead = useSelector(state => state.comman.costingHead)
  const { CostingDataList } = useSelector(state => state.costing)

  // BELOW CODE NEED TO BE USED WHEN OVERALL APPLICABILITY TREATED INSIDE GRID.
  const defaultValues = {
    ToolMaintenanceCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenanceCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolMaintenanceCost,initialConfiguration.NoOfDecimalForPrice) : '',
    ToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolCost,initialConfiguration.NoOfDecimalForPrice) : '',
    Life: ObjectForOverAllApplicability && ObjectForOverAllApplicability.Life !== undefined ? ObjectForOverAllApplicability.Life : '',
    NetToolCost: ObjectForOverAllApplicability && ObjectForOverAllApplicability.NetToolCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.NetToolCost,initialConfiguration.NoOfDecimalForPrice) : '',
    toolCostType:ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolCostType !== undefined ? {label:ObjectForOverAllApplicability.ToolCostType,value:ObjectForOverAllApplicability.ToolCostTypeId}:[],
    maintanencePercentage:ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolMaintenancePercentage !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolMaintenancePercentage,initialConfiguration.NoOfDecimalForPrice):'',
    MaintananceCostApplicability:ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolApplicabilityCost !== undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolApplicabilityCost,initialConfiguration.NoOfDecimalForPrice):'',
    ToolAmortizationCost:ObjectForOverAllApplicability && ObjectForOverAllApplicability.ToolAmortizationCost !==undefined ? checkForDecimalAndNull(ObjectForOverAllApplicability.ToolAmortizationCost,initialConfiguration.NoOfDecimalForPrice):''
  }

  const { register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: (IsApplicableProcessWise === false || IsApplicableProcessWise === null) ? defaultValues : {},
  });

  const [gridData, setGridData] = useState(data && data?.CostingPartDetails?.CostingToolCostResponse.length > 0 ? data?.CostingPartDetails?.CostingToolCostResponse : [])
  const [OldGridData, setOldGridData] = useState(data && data?.CostingPartDetails?.CostingToolCostResponse.length > 0 ? data?.CostingPartDetails?.CostingToolCostResponse : [])
  const [isEditFlag, setIsEditFlag] = useState(false)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)
 const [applicability, setApplicability] = useState(data && data.CostingPartDetails.CostingToolCostResponse.length > 0 && data.CostingPartDetails.CostingToolCostResponse[0].ToolCostType !==null ? { label: data.CostingPartDetails.CostingToolCostResponse[0].ToolCostType, value: data.CostingPartDetails.CostingToolCostResponse[0].ToolApplicabilityTypeId } : [])
  const[valueByAPI,setValueByAPI] = useState(data && data.CostingPartDetails.CostingToolCostResponse.length > 0 && data.CostingPartDetails.CostingToolCostResponse[0].ToolCostType !==null ?true:false)
 
  const [toolObj,setToolObj]=useState(data.CostingPartDetails.CostingToolCostResponse[0])
  const CostingViewMode = useContext(ViewCostingContext);
  const costData = useContext(costingInfoContext);


  useEffect(() => {
    props.setToolCost(gridData, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)

  }, [gridData]);

  useEffect(() => {
    dispatch(setComponentToolItemData(data, () => { }))
  }, [data && data?.CostingPartDetails?.CostingToolCostResponse])

  useEffect(() => {
    dispatch(fetchCostingHeadsAPI('--Costing Heads--', (res) => { }))
}, [])

  /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let rowArray = {
        ToolOperationId: rowData.ToolOperationId,
        ProcessOrOperation: rowData.ProcessOrOperation,
        ToolCategory: rowData.ToolCategory,
        ToolName: rowData.ToolName,
        Quantity: rowData.Quantity,
        ToolCost: rowData.ToolCost,
        Life: rowData.Life,
        TotalToolCost: rowData.TotalToolCost,
      }
      if (editIndex !== '' && isEditFlag) {
        let tempArr = Object.assign([...gridData], { [editIndex]: rowArray })
        setGridData(tempArr)
      } else {
        let tempArr = [...gridData, rowArray]
        setGridData(tempArr)
      }
    }
    setDrawerOpen(false)
  }

  const deleteItem = (index) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    setEditIndex(index)
    setIsEditFlag(true)
    setRowObjData(tempArr)
    setDrawerOpen(true)
  }

  /**
  * @method handleToolMaintanenceChange
  * @description HANDLE TOOL MAINTANENCE CHANGE
  */
  const handleToolMaintanenceChange = (event) => {

    if (!isNaN(event.target.value)) {
      setValue('ToolMaintenanceCost', event.target.value)

      const ToolMaintenanceCost = checkForNull(event.target.value)
      
      const ToolCost = checkForNull(getValues('ToolCost'));
      const Life = checkForNull(getValues('Life'))
      const ToolAmortizationCost = checkForNull(ToolCost/Life)

      setValue('ToolAmortizationCost',checkForDecimalAndNull(ToolAmortizationCost,initialConfiguration.NoOfDecimalForPrice))
      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForNull((ToolMaintenanceCost + checkForNull(ToolCost / Life))),
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCost,
        "ToolCostType":toolObj.ToolApplicability,
        "ToolApplicabilityTypeId":toolObj.ToolApplicabilityId,
        "ToolMaintenancePercentage":toolObj.MaintanencePercentage,
        "ToolApplicabilityCost":toolObj.ToolApplicabilityCost,
        "ToolAmortizationCost":ToolAmortizationCost,
        "IsCostForPerAssembly": null
      }

      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      dispatch(isToolDataChange(true))
      setTimeout(() => {
        setGridData(tempArr)
      }, 200)

    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
  * @method handleToolCostChange
  * @description HANDLE TOOL COST CHANGE
  */
  const handleToolCostChange = (event) => {

    if (!isNaN(event.target.value)) {

      setValue('ToolCost', event.target.value)

      const ToolMaintenanceCost = checkForNull(toolObj.ToolMaintenanceCost)
      const ToolCost = checkForNull(event.target.value);
      const Life = checkForNull(getValues('Life'))
      const ToolAmortizationCost = checkForNull(ToolCost/Life)

      setValue('ToolAmortizationCost',checkForDecimalAndNull(ToolAmortizationCost,initialConfiguration.NoOfDecimalForPrice))
      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForNull((ToolMaintenanceCost + checkForNull(ToolCost / Life))),
        "TotalToolCost": null,
        "ToolMaintenanceCost": toolObj.ToolMaintenanceCost,
        "ToolCostType":toolObj.ToolApplicability,
        "ToolApplicabilityTypeId":toolObj.ToolApplicabilityId,
        "ToolMaintenancePercentage":toolObj.MaintanencePercentage,
        "ToolApplicabilityCost":toolObj.ToolApplicabilityCost,
        "ToolAmortizationCost":ToolAmortizationCost,
        "IsCostForPerAssembly": null
      }
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setGridData(tempArr)
      dispatch(isToolDataChange(true))
    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
    * @method handleToolLifeChange
    * @description HANDLE TOOL LIFE CHANGE
    */
  const handleToolLifeChange = (event) => {

    if (!isNaN(event.target.value)) {

      setValue('Life', event.target.value)
      const ToolMaintenanceCost = checkForNull(toolObj.ToolMaintenanceCost)
      const ToolCost = checkForNull(getValues('ToolCost'));
      const Life = checkForNull(event.target.value)
      const ToolAmortizationCost = ToolCost/Life

      setValue('ToolAmortizationCost',checkForDecimalAndNull(ToolAmortizationCost,initialConfiguration.NoOfDecimalForPrice))
      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolCost / Life)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForNull((ToolMaintenanceCost + checkForNull(ToolCost / Life))),
        "TotalToolCost": null,
        "ToolMaintenanceCost": toolObj.ToolMaintenanceCost,
        "ToolCostType":toolObj.ToolApplicability,
        "ToolApplicabilityTypeId":toolObj.ToolApplicabilityId,
        "ToolMaintenancePercentage":toolObj.MaintanencePercentage,
        "ToolApplicabilityCost":toolObj.ToolApplicabilityCost,
        "ToolAmortizationCost":ToolAmortizationCost,
        "IsCostForPerAssembly": null
      }
      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      setGridData(tempArr)
      dispatch(isToolDataChange(true))
    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    props.saveCosting(values)
  }

      /**
 * @method renderListing
 * @description RENDER LISTING (NEED TO BREAK THIS)
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


    const handleToolApplicabilityChange=(newValue) =>{
      if (newValue && newValue !== '') {
        setValue('ToolMaintainancePerentage', '')
        setValueByAPI(false)
        setApplicability(newValue)
       
        dispatch(isToolDataChange(true))
      
        // setIsChangedApplicability(!IsChangedApplicability)
    } else {
        setApplicability([])
        setValueOfToolCost('')
    }
    }

    const toolFieldValue = useWatch({
        control,
        name: ['maintanencePercentage',],
    }); 

    useEffect(()=>{
        setValueOfToolCost(applicability.label)
    },[toolFieldValue])


    useEffect(()=>{
      setValueOfToolCost(applicability.label)
    },[valueByAPI,applicability])
    

    
    /**
      * @method checkRejectionApplicability
      * @description REJECTION APPLICABILITY CALCULATION
      */
     const setValueOfToolCost = (Text) => {
      if (headerCosts && Text !== '' && valueByAPI === false) {
          const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly): headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
          const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost +ConversionCostForCalculation

          const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
          const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation;
          const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation;
          const maintanencePercentage = getValues('maintanencePercentage')
        
          let dataList =CostingDataList && CostingDataList.length >0 ? CostingDataList[0]:{}
           const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight)

          // const netCostForTool = 

          switch (Text) {
              case 'RM':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull((headerCosts.NetRawMaterialsCost * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: headerCosts.NetRawMaterialsCost,
                      ToolMaintenanceCost: checkForNull((headerCosts.NetRawMaterialsCost * calculatePercentage(maintanencePercentage)))
                  })

                  break;

              case 'BOP':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: headerCosts.NetBoughtOutPartCost,
                      ToolMaintenanceCost: checkForNull((headerCosts.NetBoughtOutPartCost * calculatePercentage(maintanencePercentage)))
                  })
                  break;

              case 'CC':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(ConversionCostForCalculation, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull(((ConversionCostForCalculation) * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: ConversionCostForCalculation,
                      ToolMaintenanceCost: checkForNull(((ConversionCostForCalculation) * calculatePercentage(maintanencePercentage)))
                  })
                  break;

              case 'RM + CC + BOP':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(RMBOPCC, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull((RMBOPCC * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: RMBOPCC,
                      ToolMaintenanceCost: checkForNull((RMBOPCC * calculatePercentage(maintanencePercentage)))
                  })
                  break;

              case 'RM + BOP':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(RMBOP, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull((RMBOP * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: RMBOP,
                      ToolMaintenanceCost: checkForNull((RMBOP * calculatePercentage(maintanencePercentage)))
                  })
                  break;

              case 'RM + CC':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(RMCC, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull((RMCC * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: RMCC,
                      ToolMaintenanceCost: checkForNull((RMCC * calculatePercentage(maintanencePercentage)))
                  })
                  break;

              case 'BOP + CC':
                  setValue('MaintananceCostApplicability', checkForDecimalAndNull(BOPCC, initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull((BOPCC * calculatePercentage(maintanencePercentage)), initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage: maintanencePercentage,
                      ToolApplicabilityCost: BOPCC,
                      ToolMaintenanceCost: checkForNull((BOPCC * calculatePercentage(maintanencePercentage)))
                  })
                  break;

              case 'Fixed':
            
                  setValue('MaintananceCostApplicability', '-')
                  setValue('ToolMaintenanceCost', checkForDecimalAndNull(maintanencePercentage, initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                      ...toolObj,
                      ToolApplicabilityId: applicability.value,
                      ToolApplicability: applicability.label,
                      MaintanencePercentage:maintanencePercentage,
                      ToolApplicabilityCost: maintanencePercentage,
                      ToolMaintenanceCost: checkForNull(maintanencePercentage)
                  })
                  break;
                
                case 'Net Cost':
                  setValue('MaintananceCostApplicability',checkForDecimalAndNull(totalTabCost,initialConfiguration.NoOfDecimalForPrice))
                  setValue('ToolMaintenanceCost',checkForDecimalAndNull(totalTabCost * calculatePercentage(maintanencePercentage),initialConfiguration.NoOfDecimalForPrice))
                  setToolObj({
                    ...toolObj,
                    ToolApplicabilityId: applicability.value,
                    ToolApplicability: applicability.label,
                    MaintanencePercentage: maintanencePercentage,
                    ToolApplicabilityCost: checkForNull(totalTabCost),
                    ToolMaintenanceCost: checkForNull((totalTabCost * calculatePercentage(maintanencePercentage)))
                })
                  break;
              default:
                  break;
          }

        // setTimeout(() => {
        //   calculateNetToolCost()
        // }, 500);
      }
  }

  useEffect(()=>{

calculateNetToolCost()
  },[toolObj])

  const calculateNetToolCost = ()=>{

      const ToolMaintenanceCost = checkForNull(toolObj.ToolMaintenanceCost)
      
      const ToolCost = checkForNull(getValues('ToolCost'));
      const Life = checkForNull(getValues('Life'))
      const ToolAmortizationCost = ToolCost/Life

      const maintanencePercentage = getValues('maintanencePercentage')
    //  const applicabilityCost =  getValues('MaintananceCostApplicability')
     const applicabilityCost =  toolObj.ToolApplicabilityCost
     
      setValue('ToolAmortizationCost',checkForDecimalAndNull(ToolAmortizationCost,initialConfiguration.NoOfDecimalForPrice))
      setValue('NetToolCost', checkForDecimalAndNull((ToolMaintenanceCost + checkForNull(ToolAmortizationCost)), initialConfiguration.NoOfDecimalForPrice))

      const zeroIndex = 0;
      let rowArray = {
        "ToolOperationId": null,
        "ProcessOrOperation": null,
        "ToolCategory": null,
        "ToolName": null,
        "Quantity": null,
        "ToolCost": ToolCost,
        "Life": Life,
        "NetToolCost": checkForNull((ToolMaintenanceCost + checkForNull(ToolCost / Life))),
        "TotalToolCost": null,
        "ToolMaintenanceCost": ToolMaintenanceCost,
        "ToolCostType":applicability.label,
        "ToolApplicabilityTypeId":applicability.value,
        "ToolMaintenancePercentage":maintanencePercentage,
        "ToolApplicabilityCost":applicabilityCost,
        "ToolAmortizationCost":ToolAmortizationCost,
        "IsCostForPerAssembly": null
      }

      let tempArr = Object.assign([...gridData], { [zeroIndex]: rowArray })
      dispatch(isToolDataChange(true))
      setTimeout(() => {
        setGridData(tempArr)
      }, 200)

    
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>

          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>

              {/* BELOW CONDITION RENDER WHEN APPLICABILITY IS PROCESS WISE */}
              {IsApplicableProcessWise &&
                <Col md="12">
                  <Table className="table" size="sm" >
                    <thead>
                      <tr>
                        <th>{`Process/Operation`}</th>
                        <th>{`Tool Category`}</th>
                        <th>{`Name`}</th>
                        <th style={{ width: 200 }}>{`Quantity`}</th>
                        <th>{`Tool Cost`}</th>
                        <th>{`Life`}</th>
                        <th>{`Net Tool Cost`}</th>
                        <th>{`Action`}</th>
                      </tr>
                    </thead>
                    <tbody >

                      {
                        gridData && gridData.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.ProcessOrOperation}</td>
                              <td>{item.ToolCategory}</td>
                              <td>{item.ToolName}</td>
                              <td style={{ width: 200 }}>{item.Quantity}</td>
                              <td>{item.ToolCost}</td>
                              <td>{item.Life}</td>
                              <td>{item.TotalToolCost ? checkForDecimalAndNull(item.TotalToolCost, 2) : 0}</td>
                              <td>
                                <button className="Edit mt15 mr-2" type={'button'} onClick={() => editItem(index)} />
                                <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                              </td>
                            </tr>
                          )
                        })
                      }

                      {gridData && gridData.length === 0 &&
                        <tr>
                          <td colSpan={8}>
                            <NoContentFound title={EMPTY_DATA} />
                          </td>
                        </tr>
                      }

                    </tbody>
                  </Table>
                </Col>}


              {/* BELOW CONDITION RENDER WHEN APPLICABILITY IS OVERALL */}
              {!IsApplicableProcessWise &&
                <>
                   <Col md="3">
                      <SearchableSelectHookForm
                        label={"Tool Maintenance Applicability"}
                        name={"toolCostType"}
                        placeholder={"-Select-"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: false }}
                        register={register}
                        defaultValue={applicability.length !== 0 ? applicability : ""}
                        options={renderListing("Applicability")}
                        mandatory={false}
                        handleChange={handleToolApplicabilityChange}
                        errors={errors.toolCostType}
                        disabled={CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                    {applicability.label !== 'Fixed' ?
                        <NumberFieldHookForm
                            label={`Maintanence Tool Cost (%)`}
                            name={'maintanencePercentage'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: { value: /^\d*\.?\d*$/, message: 'Invalid Number.' },
                                max: { value: 100, message: 'Percentage cannot be greater than 100' },
                            }}
                            handleChange={(e) => {
                              e.preventDefault()
                              dispatch(isToolDataChange(true))
                              setValueByAPI(false)
                             }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.maintanencePercentage}
                            disabled={CostingViewMode ? true : false}
                        />
                        :
                        //THIS FIELD WILL RENDER WHEN APPLICABILITY TYPE FIXED
                        <NumberFieldHookForm
                            label={`Maintanence Tool Cost`}
                            name={'maintanencePercentage'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            rules={{
                                required: false,
                                pattern: { value: /^\d*\.?\d*$/, message: 'Invalid Number.' },
                            }}
                            handleChange={(e) => { 
                              e.preventDefault()
                              setValueByAPI(false)
                            }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            //errors={errors.maintanencePercentage}
                            disabled={CostingViewMode ? true : false}
                        />}
                </Col>
                  {applicability.label !== 'Fixed' &&
                      <Col md="3">
                        <TextFieldHookForm
                            label="Cost (Applicability)"
                            name={'MaintananceCostApplicability'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={false}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.MaintananceCostApplicability}
                            disabled={true}
                        />
                    </Col>}
                  <Col md="3">
                    <TextFieldHookForm
                      label="Tool Maintanence Cost"
                      name={`ToolMaintenanceCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolMaintanenceChange(e)
                      }}
                      errors={errors && errors.ToolMaintenanceCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Tool Cost"
                      name={`ToolCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolCostChange(e)
                      }}
                      errors={errors && errors.ToolCost}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Amortization Quantity (Tool Life)"
                      name={`Life`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleToolLifeChange(e)
                      }}
                      errors={errors && errors.Life}
                      disabled={CostingViewMode ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label="Tool Amortization Cost"
                      name={`ToolAmortizationCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        pattern: {
                          //value: /^[0-9]*$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.'
                        },
                      }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {}}
                      errors={errors && errors.ToolAmortizationCost}
                      disabled={true}
                    />
                  </Col>

                  <Col md="3">
                    <TextFieldHookForm
                      label="Net Tool Cost"
                      name={`NetToolCost`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      handleChange={(e) => {
                        e.preventDefault()
                        //handleRateChange(e)
                      }}
                      errors={errors && errors.NetToolCost}
                      disabled={true}
                    />
                  </Col>
                </>
              }

            </Row>

            <Row className="sf-btn-footer no-gutters justify-content-between mt25 sticky-btn-footer tab-tool-cost-footer">
              <div className="col-sm-12 text-right bluefooter-butn">

                {!CostingViewMode && <button
                  type={'submit'}
                  className="submit-button mr5 save-btn">
                  <div className={"save-icon"}></div>
                  {'Save'}
                </button>}
              </div>
            </Row>
          </form>
        </div>
      </div >

      {isDrawerOpen && <AddTool
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={isEditFlag}
        ID={''}
        editIndex={editIndex}
        rowObjData={rowObjData}
        anchor={'right'}
      />}

    </ >
  );
}

export default React.memo(Tool);