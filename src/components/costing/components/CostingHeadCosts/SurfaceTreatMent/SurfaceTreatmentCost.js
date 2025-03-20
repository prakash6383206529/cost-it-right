import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { ASSEMBLYNAME, CRMHeads, EMPTY_DATA, MASS } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected } from '../../../../../helper';
import AddSurfaceTreatment from '../../Drawers/AddSurfaceTreatment';
import { gridDataAdded } from '../../../actions/Costing';
import { ViewCostingContext } from '../../CostingDetails'
import { reactLocalStorage } from 'reactjs-localstorage';
import TooltipCustom from '../../../../common/Tooltip';
import { number, checkWhiteSpaces, decimalNumberLimit6, noDecimal, numberLimit6 } from "../../../../../helper/validation";
import { swappingLogicCommon } from '../../../CostingUtil';
import Button from '../../../../layout/Button';

function SurfaceTreatmentCost(props) {
  const { item, index } = props
  const tempArray = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
  let surfaceData = tempArray && tempArray.find(surfaceItem => surfaceItem.PartNumber === item.PartNumber && surfaceItem.AssemblyPartNumber === item.AssemblyPartNumber)

  const CostingViewMode = useContext(ViewCostingContext);
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const { register, control, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  let dragEnd;
  const dispatch = useDispatch()

  const [gridData, setGridData] = useState(surfaceData && surfaceData?.CostingPartDetails?.SurfaceTreatmentDetails)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [rmFinishWeight, setRmFinishWeight] = useState('')
  const [rmGrossWeight, setRmGrossWeight] = useState('')

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const { RMCCTabData, currencySource,exchangeRateData } = useSelector(state => state.costing)

  useEffect(() => {
    if (RMCCTabData?.length > 0 && RMCCTabData[index]?.CostingPartDetails?.CostingRawMaterialsCost?.length > 0) {
      let totalFinishWeight = 0;
      let totalGrossWeight = 0;
      let list = RMCCTabData && RMCCTabData[index]?.CostingPartDetails?.CostingRawMaterialsCost && RMCCTabData[0]?.CostingPartDetails?.CostingRawMaterialsCost

      totalFinishWeight = list && list.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.FinishWeight)
      }, 0)

      totalGrossWeight = list && list.reduce((accummlator, el) => {
        return accummlator + checkForNull(el.GrossWeight)
      }, 0)

      setRmFinishWeight(totalFinishWeight)
      setRmGrossWeight(totalGrossWeight)
    }
  }, []);

  useEffect(() => {
    // setTimeout(() => {
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }

    if (!CostingViewMode && !IsLocked) {
      const isEqual = JSON.stringify(gridData) !== JSON.stringify(surfaceData?.CostingPartDetails?.SurfaceTreatmentDetails) ? true : false
      props.setSurfaceData({ gridData, Params, isEqual, item }, errors)
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
    if (CheckIsCostingDateSelected(CostingEffectiveDate, currencySource,exchangeRateData)) return false;
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {

      let rowArray = rowData && rowData.map(el => {
        let finalQuantity = 1
        if (RMCCTabData[0]?.PartType !== ASSEMBLYNAME) {
          if (el?.UOMType === MASS) {
            finalQuantity = rmFinishWeight ? rmFinishWeight : 1
          } else {
            finalQuantity = 1
          }
        }
        return {
          OperationId: el.OperationId,
          OperationName: el.OperationName,
          SurfaceArea: finalQuantity,
          UOM: el.UnitOfMeasurement,
          RatePerUOM: el.Rate,
          LabourRate: el.IsLabourRateExist ? el.LabourRate : '-',
          LabourQuantity: el.IsLabourRateExist ? el.LabourQuantity : '-',
          IsLabourRateExist: el.IsLabourRateExist,
          SurfaceTreatmentCost: (checkForNull(el.Rate) * checkForNull(finalQuantity)) + (checkForNull(el?.LabourRate) * checkForNull(el?.LabourQuantity)),
          SurfaceTreatmentDetailsId: '',
          UOMType: el.UOMType
        }
      })

      let tempArr = gridData ? [...gridData, ...rowArray] : [rowArray]
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
    if (errors?.OperationGridFields && errors?.OperationGridFields?.length > 0) {
      return false
    }
    if (getValues(`${OperationGridFields}.${index}.SurfaceArea`) === '') {
      return false
    }
    let operationGridData = gridData[index]
    if (operationGridData.UOM === 'Number') {
      let isValid = Number.isInteger(Number(operationGridData.SurfaceArea));
      if (operationGridData.SurfaceArea === '0') {
        Toaster.warning('Number should not be zero')
        return false
      }
      if (!isValid) {
        Toaster.warning('Please enter numeric value')
        setTimeout(() => {
          setValue(`${OperationGridFields}[${index}].SurfaceArea`, '')
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
    setValue(`${OperationGridFields}.${index}.SurfaceArea`, tempArr?.Quantity)
    errors.OperationGridFields = {}
  }

  const handleSurfaceAreaChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];
    if (checkForNull(rmGrossWeight) !== 0 && tempData?.UOMType === MASS && event?.target?.value > rmGrossWeight) {
      Toaster.warning("Enter value less than gross weight.")
      setTimeout(() => {
        setValue(`${OperationGridFields}.${index}.SurfaceArea`, '')
      }, 50);
      return false
    }
    if (!isNaN(event.target.value)) {

      const SurfaceTreatmentCost = (checkForNull(event.target.value) * checkForNull(tempData.RatePerUOM)) + (checkForNull(tempData.LabourRate) * tempData.LabourQuantity);
      tempData = { ...tempData, SurfaceArea: Number(event.target.value), SurfaceTreatmentCost: SurfaceTreatmentCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

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

    }
  }

  const onCRMHeadChange = (e, index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      SurfaceTreatmentCRMHead: e?.label
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setGridData(tempArr)
  }

  const onMouseLeave = (e) => {
    dragEnd = e?.target?.title

  }

  const onDragComplete = (e) => {   //SWAPPING ROWS LOGIC FOR PROCESS
    let dragStart = e?.target?.title

    if (dragEnd && dragStart && (String(dragStart) !== String(dragEnd))) {
      let finalTemp = swappingLogicCommon(gridData, dragStart, dragEnd, e) //COMMON SWAPPING LOGIC
      setGridData(finalTemp)
      finalTemp && finalTemp.map((el, index) => {
        // Update field values
        setValue(`crmHeadSurface${index}`, { label: el.SurfaceTreatmentCRMHead, value: index })
        return null
      })
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
              <Button
                id="Costing_addST"
                disabled={(CostingViewMode || IsLocked) ? true : false}
                onClick={DrawerToggle}
                icon={"plus"}
                buttonName={"SURFACE T."}
              />
            </Col>
          </Row>
          <Row>
            {/*OPERATION COST GRID */}

            <Col md="12">
              <Table className="cr-brdr-main costing-surface-section" size="sm" onDragOver={onMouseLeave} onDragEnd={onDragComplete} >
                <thead>
                  <tr>
                    <th>{`Operation Name`}</th>
                    <th>{`Quantity`}</th>
                    <th>{`UOM`}</th>
                    <th>{`Rate/UOM`}</th>
                    {initialConfiguration &&
                      initialConfiguration?.IsOperationLabourRateConfigure && <th>{`Labour Rate/UOM`}</th>}
                    {initialConfiguration &&
                      initialConfiguration?.IsOperationLabourRateConfigure && <th>{`Labour Quantity`}</th>}
                    <th>{`Cost`}</th>
                    {initialConfiguration?.IsShowCRMHead && <th>{`CRM Head`}</th>}
                    <th style={{ textAlign: "right" }}>{`Action`}</th>
                  </tr>
                </thead>
                <tbody >
                  {
                    gridData && gridData.map((item, index) => {
                      return (
                        editIndex === index ?
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OperationName + index} draggable={CostingViewMode ? false : true}>{item.OperationName}</span> </td>
                            <td style={{ width: 200 }}>
                              {
                                <TextFieldHookForm
                                  label={false}
                                  name={`${OperationGridFields}.${index}.SurfaceArea`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                  }}
                                  defaultValue={item.SurfaceArea}
                                  className=""
                                  customClassName={'withBorder mn-height-auto mb-0 error-label surface-treament'}
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
                              initialConfiguration?.IsOperationLabourRateConfigure && <td>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure && <td style={{ width: 200 }}>
                                {
                                  item.IsLabourRateExist ?
                                    <TextFieldHookForm
                                      label={false}
                                      name={`${OperationGridFields}.${index}.LabourQuantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        validate: { number, checkWhiteSpaces, noDecimal }
                                      }}
                                      defaultValue={item.LabourQuantity}
                                      className=""
                                      customClassName={'withBorder error-label mn-height-auto mb-0 surface-treament'}
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
                            <td>{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</td>
                            {initialConfiguration?.IsShowCRMHead && <td width={220}>
                              <SearchableSelectHookForm
                                name={`crmHeadSurface${index}`}
                                type="text"
                                label={false}
                                errors={`${errors.crmHeadSurface}${index}`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: false,
                                }}
                                placeholder={'Select'}
                                customClassName="costing-selectable-dropdown"
                                defaultValue={item.SurfaceTreatmentCRMHead ? { label: item.SurfaceTreatmentCRMHead, value: index } : ''}
                                options={CRMHeads}
                                className="st-crm-head"
                                required={false}
                                handleChange={(e) => { onCRMHeadChange(e, index) }}
                                disabled={CostingViewMode}
                              />
                            </td>}
                            <td>
                              <div className='action-btn-wrapper'>
                                <button title='Save' className="SaveIcon" type={'button'} disabled={CostingViewMode ? true : false} onClick={() => SaveItem(index)} />
                                <button title='Discard' className="CancelIcon" type={'button'} onClick={() => CancelItem(index)} />
                              </div>
                            </td>
                          </tr>
                          :
                          <tr key={index}>
                            <td className='text-overflow'><span title={item.OperationName + index} draggable={CostingViewMode ? false : true}>{item.OperationName}</span></td>
                            <td style={{ width: 200 }}>{item.SurfaceArea}</td>
                            <td>{item.UOM}</td>
                            <td>{item.RatePerUOM}</td>
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure && <td style={{ width: 200 }}>{item.IsLabourRateExist ? checkForDecimalAndNull(item.LabourRate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>}
                            {initialConfiguration &&
                              initialConfiguration?.IsOperationLabourRateConfigure && <td>{item.IsLabourRateExist ? item.LabourQuantity : '-'}</td>}
                            <td><div className='w-fit' id={`surface-cost${index}`}><TooltipCustom disabledIcon={true} customClass="header-tooltip" id={`surface-cost${index}`} tooltipText={initialConfiguration && initialConfiguration?.IsOperationLabourRateConfigure ? "Net Cost = (Quantity * Rate) + (Labour Rate * Labour Quantity)" : "Net Cost = (Quantity * Rate)"} />{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice) : 0}</div></td>
                            {initialConfiguration?.IsShowCRMHead && <td width={220}>
                              <SearchableSelectHookForm
                                name={`crmHeadSurface${index}`}
                                type="text"
                                label={false}
                                errors={`${errors.crmHeadSurface}${index}`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: false,
                                }}
                                placeholder={'Select'}
                                customClassName={'withBorder error-label mn-height-auto mb-0 surface-treament'}
                                defaultValue={item.SurfaceTreatmentCRMHead ? { label: item.SurfaceTreatmentCRMHead, value: index } : ''}
                                options={CRMHeads}
                                required={false}
                                handleChange={(e) => { onCRMHeadChange(e, index) }}
                                disabled={CostingViewMode}
                              />
                            </td>}
                            <td>
                              <div className='action-btn-wrapper'>
                                <button title='Edit' className="Edit" type={'button'} disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => editItem(index)} />
                                <button title='Delete' className="Delete" type={'button'} disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => deleteItem(index, item.OperationId)} />
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