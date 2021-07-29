import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import AddOperation from '../../Drawers/AddOperation';
import { Col, Row, Table } from 'reactstrap';
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, setRMCCErrors } from '../../../actions/Costing';

let counter = 0;
function OperationCostExcludedOverhead(props) {

  const { register, control, formState: { errors }, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()

  const [gridData, setGridData] = useState(props.data ? props.data : [])
  const [OldGridData, setOldGridData] = useState(props.data ? props.data : [])
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
    if (!CostingViewMode) {
      if (props.IsAssemblyCalculation) {
        props.setAssemblyOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)
      } else {
        props.setOtherOperationCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)
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
      let rowArray = rowData && rowData.map(el => {
        const WithLaboutCost = checkForNull(el.Rate) * checkForNull(el.Quantity);
        const WithOutLabourCost = el.IsLabourRateExist ? checkForNull(el.LabourRate) * el.LabourQuantity : 0;
        const OperationCost = WithLaboutCost + WithOutLabourCost;

        return {
          IsCostForPerAssembly: props.IsAssemblyCalculation ? true : false,
          OtherOperationId: el.OperationId,
          OtherOperationName: el.OperationName,
          OtherOperationCode: el.OperationCode,
          UOM: el.UnitOfMeasurement,
          Rate: el.Rate,
          Quantity: el.Quantity,
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          OperationCost: OperationCost,
          IsOtherOperation: true
        }
      })
      let tempArr = [...GridArray, ...rowArray]
      setGridData(tempArr)
      selectedIds(tempArr)
      dispatch(gridDataAdded(true))
    }
    setDrawerOpen(false)
  }

  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {
    tempArr && tempArr.map(el => {
      if (Ids.includes(el.OperationId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.OperationId)
        setIds(selectedIds)
      }
      return null;
    })
  }

  const deleteItem = (index, OperationId) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setIds(Ids && Ids.filter(item => item !== OperationId))
    setGridData(tempArr)
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
      toastr.warning('Please enter valid number.')
      setTimeout(() => {
        setValue(`${OperationGridFields}[${index}]Quantity`, 0)
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
      //toastr.warning('Please enter valid number.')
      setTimeout(() => {
        setValue(`${OperationGridFields}[${index}]LabourQuantity`, 0)
      }, 200)
    }
  }

  const netCost = (item) => {
    const cost = checkForNull(item.Rate * item.Quantity) + checkForNull(item.LabourRate * item.LabourQuantity);
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
                <WarningMessage dClass="ml-2" message="Following operation cost excluded from the conversion cost calculations"/>
              </div>
            </Col>
            <Col md={'4'}>
              {!CostingViewMode && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD OTHER OPERATION</button>}
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="table cr-brdr-main costing-operation-cost-section" size="sm" >
                <thead>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Operation Code`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Rate`}</th>
                    <th style={{ width: "220px" }} >{`Quantity`}</th>
                    {initialConfiguration &&
                      initialConfiguration.IsOperationLabourRateConfigure &&
                      <th style={{ width: "220px" }}>{`Labour Rate`}</th>}
                    {initialConfiguration &&
                      initialConfiguration.IsOperationLabourRateConfigure &&
                      <th style={{ width: "220px" }}>{`Labour Quantity`}</th>}
                    <th style={{ width: "220px" }}>{`Net Cost`}</th>
                    <th style={{ width: "145px" }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData &&
                    gridData.map((item, index) => {
                      return (
                        editIndex === index ?
                          <tr key={index}>
                            <td>{item.OtherOperationName}</td>
                            <td>{item.OtherOperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td style={{ width: 200 }}>
                              {
                                <NumberFieldHookForm
                                  label=""
                                  name={`${OperationGridFields}[${index}]Quantity`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    //required: true,
                                    pattern: {
                                      //value: /^[0-9]*$/i,
                                      value: /^\d*\.?\d*$/,
                                      message: 'Invalid Number.'
                                    },
                                  }}
                                  defaultValue={item.Quantity}
                                  className=""
                                  customClassName={'withBorder hide-label-inside mb-0'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleQuantityChange(e, index)
                                  }}
                                  errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].Quantity : ''}
                                  disabled={CostingViewMode ? true : false}
                                />
                              }
                            </td>
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td style={{ width: 200 }}>
                                {
                                  item.IsLabourRateExist ?
                                    <NumberFieldHookForm
                                      label=""
                                      name={`${OperationGridFields}[${index}]LabourQuantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        //required: true,
                                        pattern: {
                                          //value: /^[0-9]*$/i,
                                          value: /^\d*\.?\d*$/,
                                          message: 'Invalid Number.'
                                        },
                                      }}
                                      defaultValue={item.LabourQuantity}
                                      className=""
                                      customClassName={'withBorder hide-label-inside mb-0'}
                                      handleChange={(e) => {
                                        e.preventDefault()
                                        handleLabourQuantityChange(e, index)
                                      }}
                                      errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].LabourQuantity : ''}
                                      disabled={CostingViewMode ? true : false}
                                    />
                                    :
                                    '-'
                                }
                              </td>}
                            <td>{netCost(item)}</td>
                            <td>
                              <button className="SaveIcon mb-0 mr-2 align-middle" type={'button'} onClick={() => SaveItem(index)} />
                              <button className="CancelIcon mb-0 align-middle" type={'button'} onClick={() => CancelItem(index)} />
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td>{item.OtherOperationName}</td>
                            <td>{item.OtherOperationCode}</td>
                            <td>{item.UOM}</td>
                            <td>{item.Rate}</td>
                            <td style={{ width: 200 }}>{item.Quantity}</td>
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td style={{ width: 200 }}>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure &&
                              <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>}
                            <td>{netCost(item)}</td>
                            <td>
                              {!CostingViewMode && <button className="Edit  mr-2 mb-0 align-middle" type={'button'} onClick={() => editItem(index)} />}
                              {!CostingViewMode && <button className="Delete mb-0 align-middle" type={'button'} onClick={() => deleteItem(index, item.OtherOperationId)} />}
                            </td>
                          </tr>
                      )
                    })
                  }
                  {gridData && gridData.length === 0 &&
                    <tr>
                      <td colSpan={7}>
                        <NoContentFound title={CONSTANT.EMPTY_DATA} />
                      </td>
                    </tr>
                  }
                </tbody>
              </Table>
            </Col>
          </Row>

        </div>
      </div>
      {isDrawerOpen && <AddOperation
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        Ids={Ids}
      />}
    </ >
  );
}

export default OperationCostExcludedOverhead;