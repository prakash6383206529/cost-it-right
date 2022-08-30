import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected } from '../../../../../helper';
import AddSurfaceTreatment from '../../Drawers/AddSurfaceTreatment';
import { gridDataAdded } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails'

function SurfaceTreatmentCost(props) {
  const { item } = props
  const tempArray = JSON.parse(localStorage.getItem('surfaceCostingArray'))
  let surfaceData = tempArray && tempArray.find(surfaceItem => surfaceItem.PartNumber === item.PartNumber && surfaceItem.AssemblyPartNumber === item.AssemblyPartNumber)

  const CostingViewMode = useContext(ViewCostingContext);
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const { register, control, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch()

  const [gridData, setGridData] = useState(surfaceData.CostingPartDetails.SurfaceTreatmentDetails)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)

  useEffect(() => {
    // setTimeout(() => {
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }

    if (!CostingViewMode && !IsLocked) {
      const isEqual = JSON.stringify(gridData) !== JSON.stringify(surfaceData.CostingPartDetails.SurfaceTreatmentDetails) ? true : false
      props.setSurfaceData({ gridData, Params, isEqual, item })
      // if (props.IsAssemblyCalculation) {
      //   props.setAssemblySurfaceCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false, props.item)
      // } else {
      //   props.setSurfaceCost(gridData, Params, JSON.stringify(gridData) !== JSON.stringify(OldGridData) ? true : false)
      // }
    }
    // }, 100)
    selectedIds(gridData)
  }, [gridData]);


  // useEffect(() => {
  //   if (!props.IsAssemblyCalculation && props?.data && props.data.length > 0) {

  //     setGridData(props.data)
  //   }
  // }, [props.data])

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

      let rowArray = rowData && rowData.map(el => {
        return {
          OperationId: el.OperationId,
          OperationName: el.OperationName,
          SurfaceArea: 1,
          UOM: el.UnitOfMeasurement,
          RatePerUOM: el.Rate,
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          SurfaceTreatmentCost: el.Rate * 1,
          SurfaceTreatmentDetailsId: '',
        }
      })

      let tempArr = [...gridData, ...rowArray]
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

  const handleSurfaceAreaChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {

      const SurfaceTreatmentCost = (checkForNull(event.target.value) * checkForNull(tempData.RatePerUOM)) + (checkForNull(tempData.LabourRate) * tempData.LabourQuantity);
      tempData = { ...tempData, SurfaceArea: event.target.value, SurfaceTreatmentCost: SurfaceTreatmentCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  const handleLabourQuantityChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {
      const SurfaceTreatmentCost = (checkForNull(tempData.SurfaceArea) * checkForNull(tempData.RatePerUOM)) + (checkForNull(tempData.LabourRate) * event.target.value);
      tempData = { ...tempData, LabourQuantity: event.target.value, SurfaceTreatmentCost: SurfaceTreatmentCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      Toaster.warning('Please enter valid number.')
    }
  }

  const OperationGridFields = 'OperationGridFields';

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0 costing-page-drawer">
        <div>
          <Row className="align-items-center">
            <Col md="8">
              <div className="left-border">
                {'Surface Treatment Cost:'}
              </div>
            </Col>
            <Col md="4">
              <button
                type="button"
                className={'user-btn'}
                disabled={(CostingViewMode || IsLocked) ? true : false}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>SURFACE T.</button>
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="cr-brdr-main costing-surface-section" size="sm" >
                <thead>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Surface Area`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Rate/UOM`}</th>
                    {initialConfiguration &&
                      initialConfiguration.IsOperationLabourRateConfigure && <th>{`Labour Rate/UOM`}</th>}
                    {initialConfiguration &&
                      initialConfiguration.IsOperationLabourRateConfigure && <th>{`Labour Quantity`}</th>}
                    <th>{`Cost`}</th>
                    <th style={{ textAlign: "right" }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData && gridData.map((item, index) => {
                      return (
                        editIndex === index ?
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OperationName}>{item.OperationName}</span> </td>
                            <td style={{ width: 200 }}>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${OperationGridFields}.${index}.SurfaceArea`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    //required: true,
                                    pattern: {
                                      //value: /^[0-9]*$/i,
                                      value: /^[0-9]\d*(\.\d+)?$/i,
                                      message: 'Invalid Number.'
                                    },
                                  }}
                                  defaultValue={item.SurfaceArea}
                                  className=""
                                  customClassName={'withBorder mn-height-auto mb-0 hide-label'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleSurfaceAreaChange(e, index)
                                  }}
                                  errors={errors && errors.OperationGridFields && errors.OperationGridFields[index] !== undefined ? errors.OperationGridFields[index].SurfaceArea : ''}
                                  disabled={CostingViewMode ? true : false}
                                />
                              }
                            </td>
                            <td>{item.UOM}</td>
                            <td>{item.RatePerUOM}</td>
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure && <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure && <td style={{ width: 200 }}>
                                {
                                  item.IsLabourRateExist ?
                                    <TextFieldHookForm
                                      label=""
                                      name={`${OperationGridFields}.${index}.LabourQuantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        //required: true,
                                        pattern: {
                                          value: /^[0-9]*$/i,
                                          //value: /^[0-9]\d*(\.\d+)?$/i,
                                          message: 'Invalid Number.'
                                        },
                                      }}
                                      defaultValue={item.LabourQuantity}
                                      className=""
                                      customClassName={'withBorder'}
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
                            <td>{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                            <td>
                              <div className='action-btn-wrapper'>
                                <button className="SaveIcon" type={'button'} disabled={CostingViewMode ? true : false} onClick={() => SaveItem(index)} />
                                <button className="CancelIcon" type={'button'} onClick={() => CancelItem(index)} />
                              </div>
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OperationName}>{item.OperationName}</span></td>
                            <td style={{ width: 200 }}>{item.SurfaceArea}</td>
                            <td>{item.UOM}</td>
                            <td>{item.RatePerUOM}</td>
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure && <td style={{ width: 200 }}>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration.IsOperationLabourRateConfigure && <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>}
                            <td>{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                            <td>
                              <div className='action-btn-wrapper'>
                                <button className="Edit" type={'button'} disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => editItem(index)} />
                                <button className="Delete" type={'button'} disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => deleteItem(index, item.OperationId)} />
                              </div>
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
            </Col>
          </Row>

        </div>
      </div>
      {isDrawerOpen && <AddSurfaceTreatment
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

export default SurfaceTreatmentCost;