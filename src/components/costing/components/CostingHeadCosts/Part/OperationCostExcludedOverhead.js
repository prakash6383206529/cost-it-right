import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import AddOperation from '../../Drawers/AddOperation';
import { Col, Row, Table } from 'reactstrap';
import { TextAreaHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA, MASS } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isDataChange, setRMCCErrors, setSelectedIds } from '../../../actions/Costing';
import WarningMessagge from '../../../../common/WarningMessage'
import Popup from 'reactjs-popup';
import TooltipCustom from '../../../../common/Tooltip';
import { AcceptableOperationUOM, REMARKMAXLENGTH, STRINGMAXLENGTH, TEMPOBJECTOTHEROPERATION } from '../../../../../config/masterData';
import { number, decimalNumberLimit6, checkWhiteSpaces, noDecimal, numberLimit6 } from "../../../../../helper/validation";

let counter = 0;
function OperationCostExcludedOverhead(props) {
  const { item, rmFinishWeight } = props;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const { register, control, formState: { errors }, setValue, getValues } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()
  const [gridData, setGridData] = useState(props.data ? props.data : [])
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const CostingViewMode = useContext(ViewCostingContext);
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)

  useEffect(() => {
    const Params = {
      index: 0,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    if (!CostingViewMode && !IsLocked) {
      if (props.IsAssemblyCalculation) {
        props.setAssemblyOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false)
      } else {
        props.setOtherOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : []) ? true : false)
      }
      if (JSON.stringify(gridData) !== JSON.stringify(props?.data ? props?.data : [])) {
        dispatch(isDataChange(true))
      }
    }


    selectedIds(gridData)
  }, [gridData]);

  /**
  * @method DrawerToggle
  * @description TOGGLE DRAWER
  */
  const DrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let GridArray = gridData !== null ? gridData : [];
      let QuantityMain = 1
      let rowArray = rowData && rowData.map(el => {
        if (el.UOMType === MASS) {
          QuantityMain = rmFinishWeight ? rmFinishWeight : 1
        } else {
          QuantityMain = el.Quantity
        }
        const WithLaboutCost = checkForNull(el.Rate) * checkForNull(QuantityMain);
        const WithOutLabourCost = el.IsLabourRateExist ? checkForNull(el.LabourRate) * el.LabourQuantity : 0;
        const OperationCost = WithLaboutCost + WithOutLabourCost;

        return {
          IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
          OtherOperationId: el.OperationId,
          OtherOperationName: el.OperationName,
          OtherOperationCode: el.OperationCode,
          UOM: el.UnitOfMeasurement,
          Rate: el.Rate,
          Quantity: QuantityMain,
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          OperationCost: OperationCost,
          IsOtherOperation: true
        }
      })
      let tempArr = [...GridArray, ...rowArray]
      tempArr && tempArr.map((el, index) => {
        setValue(`${OperationGridFields}.${index}.Quantity`, checkForDecimalAndNull(el.Quantity, initialConfiguration.NoOfDecimalForInputOutput))
        return null
      })
      setGridData(tempArr)
      selectedIds(tempArr)
      dispatch(gridDataAdded(true))
    }
    setDrawerOpen(false)
  }

  const onRemarkPopUpClick = (index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      Remark: getValues(`${OperationGridFields}.${index}.remarkPopUp`)
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    // setGridData(tempArr)

    if (getValues(`${OperationGridFields}.${index}.remarkPopUp`)) {
      Toaster.success('Remark saved successfully')
    }
    setGridData(tempArr)
    var button = document.getElementById(`popUppTriggerss${index}`)
    button.click()
  }

  const onRemarkPopUpClose = (index) => {
    var button = document.getElementById(`popUppTriggerss${index}`)
    button.click()
  }

  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {
    let selectedId = Ids;
    if (tempArr && tempArr.length > 0) {
      tempArr && tempArr.map(el => {
        if (Ids.includes(el.OtherOperationId) === false) {
          selectedId.push(el.OtherOperationId)
          setIds(selectedId)
          dispatch(setSelectedIds(selectedId))
        }
        return null;
      })
    } else {
      dispatch(setSelectedIds([]))
    }
  }

  const deleteItem = (index, OperationId) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setIds(Ids && Ids.filter(item => item !== OperationId))
    setGridData(tempArr)
    dispatch(setSelectedIds(Ids && Ids.filter(item => item !== OperationId)))
  }

  const editItem = (index) => {
    let tempArr = gridData && gridData.find((el, i) => i === index)
    if (editIndex !== '') {
      let tempArr = Object.assign([...gridData], { [editIndex]: rowObjData })
      setGridData(tempArr)
    }
    setEditIndex(index)
    setRowObjData(tempArr)
  }

  const SaveItem = (index) => {

    let operationGridData = gridData[index]
    if (operationGridData.UOM === 'Number') {
      let isValid = Number.isInteger(Number(operationGridData.Quantity));
      if (operationGridData.Quantity === '0') {
        Toaster.warning('Number should not be zero')
        return false
      }
      if (!isValid) {
        Toaster.warning('Please enter numeric value')
        setTimeout(() => {
          setValue(`${OperationGridFields}[${index}].Quantity`, '')
        }, 200)
        return false
      }
    }
    setEditIndex('')
  }

  const CancelItem = (index) => {
    let tempArr = Object.assign([...gridData], { [index]: rowObjData })
    setEditIndex('')
    setGridData(tempArr)
    setRowObjData({})
  }

  const handleQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value) && event.target.value !== '') {
      const WithLaboutCost = checkForNull(tempData.Rate) * event.target.value;
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * tempData.LabourQuantity : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, Quantity: event.target.value, OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      const WithLaboutCost = checkForNull(tempData.Rate) * 0;
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * tempData.LabourQuantity : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, Quantity: 0, OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      //Toaster.warning('Please enter valid number.')
      setTimeout(() => {
        setValue(`${OperationGridFields}[${index}].Quantity`, '')
      }, 200)
    }
  }

  const handleLabourQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value) && event.target.value !== '') {
      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData.Quantity);
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * event.target.value : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, LabourQuantity: event.target.value, OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {

      const WithLaboutCost = checkForNull(tempData.Rate) * checkForNull(tempData.Quantity);
      const WithOutLabourCost = tempData.IsLabourRateExist ? checkForNull(tempData.LabourRate) * 0 : 0;
      const OperationCost = WithLaboutCost + WithOutLabourCost;
      tempData = { ...tempData, LabourQuantity: 0, OperationCost: OperationCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      //Toaster.warning('Please enter valid number.')
      setTimeout(() => {
        setValue(`${OperationGridFields}[${index}]LabourQuantity`, 0)
      }, 200)
    }
  }

  const netCost = (item) => {
    const cost = (checkForNull(item.Rate) * checkForNull(item.Quantity)) + (checkForNull(item.LabourRate) * checkForNull(item.LabourQuantity));
    return checkForDecimalAndNull(cost, initialConfiguration.NoOfDecimalForPrice);
  }

  /**
   * @method setRMCCErrors
   * @description CALLING TO SET BOP COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
   */
  if (Object.keys(errors).length > 0 && counter < 2) {
    dispatch(setRMCCErrors(errors))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    dispatch(setRMCCErrors({}))
    counter = 0
  }

  const OperationGridFields = 'OperationGridFields';

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="8">
              <div className="left-border">
                {'Other Operation Cost:'}
                <WarningMessagge dClass="ml-2 p-absolute" message="Following operation cost excluded from the conversion cost calculations" />
              </div>
            </Col>
            <Col md={'4'}>
              {(!CostingViewMode && !IsLocked) && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>OTHER OPER</button>}
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table cr-brdr-main costing-operation-cost-section" size="sm" >
                <thead className={`${initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure ? 'header-with-labour-rate' : 'header-without-labour-rate'}`}>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Operation Code`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Rate`}</th>
                    <th >{`Quantity`}</th>
                    {initialConfiguration &&
                      initialConfiguration.IsOperationLabourRateConfigure &&
                      <th>{`Labour Rate`}</th>}
                    {initialConfiguration &&
                      initialConfiguration.IsOperationLabourRateConfigure &&
                      <th>{`Labour Quantity`}</th>}
                    <th>{`Net Cost`}</th>
                    <th style={{ textAlign: 'right' }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData &&
                    gridData.map((item, index) => {
                      return (
                        editIndex === index ?
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OtherOperationName}>{item.OtherOperationName}</span> </td>
                            <td>{item.OtherOperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${OperationGridFields}[${index}].Quantity`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    validate: item.UOM === "Number" ? { number, checkWhiteSpaces, noDecimal, numberLimit6 } : { number, checkWhiteSpaces, decimalNumberLimit6 },
                                  }}
                                  defaultValue={checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput)}
                                  className=""
                                  customClassName={'withBorder hide-label-inside mb-0'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleQuantityChange(e, index)
                                  }}
                                  errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].Quantity : ''}
                                  disabled={(CostingViewMode || IsLocked) ? true : false}
                                />
                              }
                            </td>
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td>
                                {
                                  item.IsLabourRateExist ?
                                    <TextFieldHookForm
                                      label=""
                                      name={`${OperationGridFields}[${index}]LabourQuantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                      }}
                                      defaultValue={item.LabourQuantity}
                                      className=""
                                      customClassName={'withBorder hide-label-inside mb-0'}
                                      handleChange={(e) => {
                                        e.preventDefault()
                                        handleLabourQuantityChange(e, index)
                                      }}
                                      errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].LabourQuantity : ''}
                                      disabled={(CostingViewMode || IsLocked) ? true : false}
                                    />
                                    :
                                    '-'
                                }
                              </td>}
                            <td>{netCost(item)}</td>
                            <td>
                              <div className='action-btn-wrapper'>
                                <button title='Save' className="SaveIcon mb-0 align-middle" type={'button'} onClick={() => SaveItem(index)} />
                                <button title='Discard' className="CancelIcon mb-0 align-middle" type={'button'} onClick={() => CancelItem(index)} />
                              </div>
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OtherOperationName}>{item.OtherOperationName}</span> </td>
                            <td>{item.OtherOperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td>{checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>}
                            <td><div className='w-fit' id={`other-operation-cost${index}`}><TooltipCustom disabledIcon={true} id={`other-operation-cost${index}`} customClass="header-tooltip" tooltipText={initialConfiguration && initialConfiguration.IsOperationLabourRateConfigure ? "Net Cost = (Rate * Quantity) + (Labour Rate * Labour Quantity)" : "Net Cost = (Rate * Quantity)"} />  {netCost(item)}</div></td>
                            <td>
                              <div className='action-btn-wrapper'>
                                {(!CostingViewMode && !IsLocked) && <button title='Edit' className="Edit mb-0 align-middle" type={'button'} onClick={() => editItem(index)} />}
                                {(!CostingViewMode && !IsLocked) && <button title='Delete' className="Delete mb-0 align-middle" type={'button'} onClick={() => deleteItem(index, item.OtherOperationId)} />}
                                <Popup trigger={<button id={`popUppTriggerss${index}`} title="Remark" className="Comment-box align-middle" type={'button'} />}
                                  position="top right">
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${OperationGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      validate: { checkWhiteSpaces },
                                      maxLength: REMARKMAXLENGTH
                                    }}
                                    handleChange={(e) => { }}
                                    defaultValue={item.Remark ?? item.Remark}
                                    className=""
                                    customClassName={"withBorder"}
                                    errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].remarkPopUp : ''}
                                    //errors={errors && errors.remarkPopUp && errors.remarkPopUp[index] !== undefined ? errors.remarkPopUp[index] : ''}                        
                                    disabled={(CostingViewMode || IsLocked) ? true : false}
                                    hidden={false}
                                  />
                                  <Row>
                                    <Col md="12" className='remark-btn-container'>
                                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => onRemarkPopUpClick(index)} > <div className='save-icon'></div> </button>
                                      <button className='reset' onClick={() => onRemarkPopUpClose(index)} > <div className='cancel-icon'></div></button>
                                    </Col>
                                  </Row>
                                </Popup>
                              </div>
                            </td>
                          </tr>
                      )
                    })
                  }
                  {gridData && gridData.length === 0 &&
                    <tr>
                      <td colSpan={7}>
                        <NoContentFound title={EMPTY_DATA} />
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

        </div>
      </div>
      {
        isDrawerOpen && <AddOperation
          isOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
          Ids={Ids}
        />
      }
    </ >
  );
}

export default OperationCostExcludedOverhead;