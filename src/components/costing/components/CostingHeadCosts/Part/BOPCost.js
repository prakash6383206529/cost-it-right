import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Col, Row, Table } from 'reactstrap';
import AddBOP from '../../Drawers/AddBOP';
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import NoContentFound from '../../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../../config/constants';
import Toaster from '../../../../common/Toaster';
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, decimalAndNumberValidationBoolean } from '../../../../../helper';
import { ViewCostingContext } from '../../CostingDetails';
import { gridDataAdded, isDataChange, setRMCCErrors } from '../../../actions/Costing';
import { INR } from '../../../../../config/constants';
import WarningMessage from '../../../../common/WarningMessage';
import { MESSAGES } from '../../../../../config/message';

let counter = 0;
function BOPCost(props) {
  const { item, data } = props;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)

  const { register, handleSubmit, control, formState: { errors }, setValue, getValues, clearErrors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      BOPHandlingPercentage: item?.CostingPartDetails?.BOPHandlingPercentage,
      BOPHandlingCharges: item?.CostingPartDetails?.BOPHandlingCharges,         // TEST
      // BOPHandlingFixed: item?.CostingPartDetails?.BOPHandlingFixed,
    }
  });

  const dispatch = useDispatch()

  const [gridData, setGridData] = useState(data)
  const [rowObjData, setRowObjData] = useState({})
  const [editIndex, setEditIndex] = useState('')
  const [Ids, setIds] = useState([])
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [IsApplyBOPHandlingCharges, setIsApplyBOPHandlingCharges] = useState(item.CostingPartDetails.IsApplyBOPHandlingCharges)
  const [oldGridData, setOldGridData] = useState(data)
  const [BOPHandlingType, setBOPHandlingType] = useState(item?.CostingPartDetails?.BOPHandlingChargeType)
  const [percentageLimit, setPercentageLimit] = useState(false)

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)

  const CostingViewMode = useContext(ViewCostingContext);

  // useEffect(() => {
  //   setValue('BOPHandlingCharges', item?.CostingPartDetails?.BOPHandlingCharges)
  // }, [])

  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      let totalBOPCost = netBOPCost(gridData)
      let bopHandlingPercentage = BOPHandlingType === 'Percentage' ? item?.CostingPartDetails?.BOPHandlingPercentage : 0
      let BOPHandlingCharges = BOPHandlingType === 'Percentage' ? calculatePercentageValue(totalBOPCost, bopHandlingPercentage) : item?.CostingPartDetails?.BOPHandlingCharges
      setValue('BOPHandlingType', item?.CostingPartDetails?.BOPHandlingChargeType ? { label: item?.CostingPartDetails?.BOPHandlingChargeType, value: item?.CostingPartDetails?.BOPHandlingChargeType } : {})
      if (BOPHandlingType === 'Percentage') {
        setValue('BOPHandlingCharges', checkForDecimalAndNull((gridData?.length !== 0) ? calculatePercentageValue(totalBOPCost, bopHandlingPercentage) : 0, initialConfiguration.NoOfDecimalForPrice))
        setValue('BOPHandlingPercentage', checkForDecimalAndNull(((gridData?.length !== 0) ? bopHandlingPercentage : 0), initialConfiguration.NoOfDecimalForPrice))
      } else {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(((gridData?.length !== 0) ? item?.CostingPartDetails?.BOPHandlingCharges : 0), initialConfiguration.NoOfDecimalForPrice))
        setValue('BOPHandlingFixed', checkForDecimalAndNull(((gridData?.length !== 0) ? item?.CostingPartDetails?.BOPHandlingCharges : 0), initialConfiguration.NoOfDecimalForPrice))
      }
      if (!CostingViewMode && !IsLocked) {
        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
          BOPHandlingPercentage: bopHandlingPercentage,
          BOPHandlingCharges: gridData?.length !== 0 ? BOPHandlingCharges : 0,
          // BOPHandlingFixed: (gridData?.length !== 0 && BOPHandlingType === 'Fixed') ? item?.CostingPartDetails?.BOPHandlingFixed : 0,
          BOPHandlingChargeType: BOPHandlingType
        }

        if (gridData?.length === 0) {
          setIsApplyBOPHandlingCharges(false)
        }
        props.setBOPCost(gridData, Params, item, BOPHandlingFields)
        if (JSON.stringify(gridData) !== JSON.stringify(oldGridData)) {
          dispatch(isDataChange(true))
        }
      }
    }, 100)
    selectedIds(gridData)
  }, [gridData]);

  // useEffect(() => {
  //   let bopHandlingPercentage = getValues('BOPHandlingPercentage')
  //   setTimeout(() => {
  //     const Params = {
  //       index: props.index,
  //       BOMLevel: props.item.BOMLevel,
  //       PartNumber: props.item.PartNumber,
  //     }
  //     let totalBOPCost = netBOPCost(gridData)
  //     if (!CostingViewMode && !IsLocked) {
  //       const BOPHandlingFields = {
  //         IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
  //         BOPHandlingPercentage: bopHandlingPercentage,
  //         BOPHandlingCharges: BOPHandlingType?.label === 'Percentage' ? (totalBOPCost + calculatePercentageValue(totalBOPCost, bopHandlingPercentage)) : totalBOPCost,         // TEST
  //         BOPHandlingType: BOPHandlingType
  //       }
  //       props.setBOPCost(gridData, Params, item, BOPHandlingFields)
  //       if (JSON.stringify(gridData) !== JSON.stringify(oldGridData)) {
  //         dispatch(isDataChange(true))
  //       }
  //     }
  //   }, 100)


  //   if (BOPHandlingType?.label === 'Percentage') {
  //     if (bopHandlingPercentage > 100) {
  //       setValue('BOPHandlingPercentage', 0)
  //       setValue('BOPHandlingCharges', 0)
  //       return false;
  //     }

  //     setValue('BOPHandlingCharges', checkForDecimalAndNull(calculatePercentageValue(netBOPCost(gridData), bopHandlingPercentage), initialConfiguration.NoOfDecimalForPrice))
  //   } else {
  //     setValue('BOPHandlingCharges', checkForDecimalAndNull(bopHandlingPercentage, initialConfiguration.NoOfDecimalForPrice))     //////////
  //   }
  // }, [IsApplyBOPHandlingCharges]);

  // useEffect(() => {
  //   if (IsApplyBOPHandlingCharges) {
  //     handleBOPPercentageChange(getValues('BOPHandlingPercentage'))
  //   }
  // }, [item.CostingPartDetails.TotalBoughtOutPartCost])

  /**
   * @method netBOPCost
   * @description GET BOP COST
   */
  const netBOPCost = (grid) => {
    let NetCost = 0
    NetCost = grid && grid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetBoughtOutPartCost)
    }, 0)
    return NetCost
  }

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
          BoughtOutPartId: el.BoughtOutPartId,
          BOPPartNumber: el.BoughtOutPartNumber,
          BOPPartName: el.BoughtOutPartName,
          Currency: el.Currency !== '-' ? el.Currency : INR,
          LandedCostINR: el.Currency === '-' ? el.NetLandedCost : el.NetLandedCostConversion,
          Quantity: 1,
          NetBoughtOutPartCost: el.Currency === '-' ? el.NetLandedCost * 1 : el.NetLandedCostConversion * 1,
          BoughtOutPartUOM: el.UOM
        }
      })

      let tempArr = [...gridData, ...rowArray]
      tempArr && tempArr.map((el, index) => {
        setValue(`${bopGridFields}.${index}.Quantity`, el.Quantity)
        return null
      })
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
      if (Ids.includes(el.BoughtOutPartId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.BoughtOutPartId)
        setIds(selectedIds)
      }
      return null;
    })
  }

  const deleteItem = (index) => {
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)

    let selectedIds = []
    tempArr.map(el => (selectedIds.push(el.BoughtOutPartId)))
    setIds(selectedIds)
    if (tempArr?.length === 0) {

    }
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
    let bopGridData = gridData[index]
    if (gridData && gridData.filter(e => e?.Quantity === 0)?.length > 0) {
      Toaster.warning('Please enter number not 0')
      return false
    }
    if (bopGridData.BoughtOutPartUOM === 'Number') {

      let isValid = Number.isInteger(bopGridData.Quantity);
      if (!isValid) {
        Toaster.warning('Please enter numeric value')
        setTimeout(() => {
          setValue(`${bopGridFields}.${index}.Quantity`, '')
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
      const NetBoughtOutPartCost = tempData.LandedCostINR * checkForNull(event.target.value);
      tempData = { ...tempData, Quantity: checkForNull(event.target.value), NetBoughtOutPartCost: NetBoughtOutPartCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    } else {
      const NetBoughtOutPartCost = tempData.LandedCostINR * 0;
      tempData = { ...tempData, Quantity: 0, NetBoughtOutPartCost: NetBoughtOutPartCost }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      setTimeout(() => {
        setValue(`${bopGridFields}.${index}.Quantity`, '')
      }, 200)
      //Toaster.warning('Please enter valid number.')
    }
  }

  /**
  * @method onPressApplyBOPCharges
  * @description ON PRESS APPLY BOP HANDLING CHARGES
  */
  const onPressApplyBOPCharges = () => {
    setIsApplyBOPHandlingCharges(!IsApplyBOPHandlingCharges)
    setValue('BOPHandlingPercentage', 0)
    setValue('BOPHandlingCharges', 0)
    setValue('BOPHandlingFixed', 0)

    let bopHandlingPercentage = item?.CostingPartDetails?.BOPHandlingPercentage
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      let totalBOPCost = netBOPCost(gridData)

      if (BOPHandlingType === 'Percentage') {
        if (bopHandlingPercentage > 100) {
          setValue('BOPHandlingPercentage', 0)
          setValue('BOPHandlingCharges', 0)
          return false;
        }
        setValue('BOPHandlingCharges', checkForDecimalAndNull(calculatePercentageValue(netBOPCost(gridData), bopHandlingPercentage), initialConfiguration.NoOfDecimalForPrice))
        setValue('BOPHandlingPercentage', checkForDecimalAndNull(item?.CostingPartDetails?.BOPHandlingPercentage, initialConfiguration.NoOfDecimalForPrice))     //////////
      } else {
        setValue('BOPHandlingCharges', checkForDecimalAndNull(item?.CostingPartDetails?.BOPHandlingCharges, initialConfiguration.NoOfDecimalForPrice))     //////////
        setValue('BOPHandlingFixed', checkForDecimalAndNull(item?.CostingPartDetails?.BOPHandlingCharges, initialConfiguration.NoOfDecimalForPrice))     //////////
      }
      if (!CostingViewMode && !IsLocked) {
        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: !IsApplyBOPHandlingCharges,
          BOPHandlingPercentage: bopHandlingPercentage,
          BOPHandlingCharges: BOPHandlingType === 'Percentage' ? calculatePercentageValue(totalBOPCost, bopHandlingPercentage) : item?.CostingPartDetails?.BOPHandlingCharges,         // TEST
          BOPHandlingFixed: (gridData?.length !== 0 && BOPHandlingType === 'Fixed') ? item?.CostingPartDetails?.BOPHandlingCharges : 0,
          BOPHandlingChargeType: BOPHandlingType
        }
        props.setBOPCost(gridData, Params, item, BOPHandlingFields)
      }
    }, 100)


    dispatch(isDataChange(true))
  }

  /**
  * @method handleBOPPercentageChange
  * @description HANDLE BOP % CHANGE
  */
  const handleBOPPercentageChange = (value) => {
    if (!isNaN(value)) {
      let BOPHandling = 0
      if (BOPHandlingType === 'Percentage') {
        if (value > 100) {
          setValue('BOPHandlingPercentage', 0)
          setValue('BOPHandlingCharges', 0)
          return false;
        }
        BOPHandling = calculatePercentageValue(netBOPCost(gridData), value)
      } else {
        setPercentageLimit(decimalAndNumberValidationBoolean(value))
        BOPHandling = value
      }
      setValue('BOPHandlingCharges', checkForDecimalAndNull(BOPHandling, initialConfiguration.NoOfDecimalForPrice))
      setTimeout(() => {
        const Params = {
          BOMLevel: item.BOMLevel,
          PartNumber: item.PartNumber,
        }

        const BOPHandlingFields = {
          IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
          BOPHandlingPercentage: BOPHandlingType === 'Percentage' ? value : 0,
          BOPHandlingCharges: BOPHandling,         // TEST
          // BOPHandlingFixed: (gridData?.length !== 0 && BOPHandlingType === 'Fixed') ? value : 0,
          BOPHandlingChargeType: BOPHandlingType
        }
        if (!CostingViewMode && !IsLocked) {
          props.setBOPCost(gridData, Params, item, BOPHandlingFields)
          dispatch(isDataChange(true))
        }

      }, 200)

    } else {
      setValue('BOPHandlingCharges', 0)
      setValue('BOPHandlingPercentage', 0)
      Toaster.warning('Please enter valid number.')
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
    setTimeout(() => {
      setBOPHandlingType(newValue.label)
      setValue('BOPHandlingPercentage', '')
      setValue('BOPHandlingFixed', '')
      setValue('BOPHandlingCharges', 0)
    }, 200);
    const Params = {
      index: props.index,
      BOMLevel: props.item.BOMLevel,
      PartNumber: props.item.PartNumber,
    }
    const BOPHandlingFields = {
      IsApplyBOPHandlingCharges: IsApplyBOPHandlingCharges,
      BOPHandlingPercentage: 0,
      BOPHandlingCharges: 0,
      // BOPHandlingFixed: 0,
      BOPHandlingChargeType: newValue
    }
    props.setBOPCost(gridData, Params, item, BOPHandlingFields)
    clearErrors('');
  }

  const bopGridFields = 'bopGridFields';

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }

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

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">
                {'Insert Cost:'}
              </div>
            </Col>
            <Col md={'2'}>
              {!CostingViewMode && !IsLocked && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>Insert</button>}
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>
              {/*BOP COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-bop-cost-section" size="sm" >
                  <thead className='table-header'>
                    <tr>
                      <th>{`Insert Part No.`}</th>
                      <th>{`Insert Part Name`}</th>
                      <th>{`UOM`}</th>
                      <th>{`Insert Cost (INR)`}</th>
                      <th>{`Quantity`}</th>
                      <th>{`Net Insert Cost`}</th>
                      <th>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody className='rm-table-body'>
                    {
                      gridData &&
                      gridData.map((item, index) => {
                        return (
                          editIndex === index ?
                            <tr key={index}>
                              <td className='text-overflow'><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span></td>
                              <td className='text-overflow'><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                              <td>{item.BoughtOutPartUOM}</td>
                              <td>{checkForDecimalAndNull(item.LandedCostINR, initialConfiguration.NoOfDecimalForPrice)}</td>
                              <td style={{ width: 200 }}>
                                {
                                  item.BoughtOutPartUOM === 'Number' ?
                                    <>
                                      <NumberFieldHookForm
                                        label=""
                                        name={`${bopGridFields}.${index}.Quantity`}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                          //required: true,
                                          pattern: {
                                            value: /^[1-9]\d*$/,
                                            message: 'Invalid Number.'
                                          },
                                        }}
                                        defaultValue={item.Quantity}
                                        className=""
                                        customClassName={'withBorder'}
                                        handleChange={(e) => {
                                          e.preventDefault()
                                          handleQuantityChange(e, index)
                                        }}
                                        errors={errors && errors.bopGridFields && errors.bopGridFields[index] !== undefined ? errors.bopGridFields[index].Quantity : ''}
                                        disabled={(CostingViewMode || IsLocked) ? true : false}
                                      />
                                    </>
                                    :
                                    <NumberFieldHookForm
                                      label=""
                                      name={`${bopGridFields}.${index}.Quantity`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        //required: true,
                                        pattern: {
                                          value: /^\d*\.?\d*$/,
                                          message: 'Invalid Number.'
                                        },
                                      }}
                                      defaultValue={item.Quantity}
                                      className=""
                                      customClassName={'withBorder'}
                                      handleChange={(e) => {
                                        e.preventDefault()
                                        handleQuantityChange(e, index)
                                      }}
                                      errors={errors && errors.bopGridFields && errors.bopGridFields[index] !== undefined ? errors.bopGridFields[index].Quantity : ''}
                                      disabled={(CostingViewMode || IsLocked) ? true : false}
                                    />
                                }
                              </td>
                              <td>{item.NetBoughtOutPartCost !== undefined ? checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                              <td>
                                <div className='action-btn-wrapper'>
                                  {!CostingViewMode && !IsLocked && <button className="SaveIcon" type={'button'} onClick={() => SaveItem(index)} />}
                                  {!CostingViewMode && !IsLocked && <button className="CancelIcon" type={'button'} onClick={() => CancelItem(index)} />}
                                </div>
                              </td>
                            </tr>
                            :
                            <tr key={index}>
                              <td className='text-overflow'><span title={item.BOPPartNumber}>{item.BOPPartNumber}</span> </td>
                              <td className='text-overflow'><span title={item.BOPPartName}>{item.BOPPartName}</span></td>
                              <td>{item.BoughtOutPartUOM}</td>
                              <td>{item.LandedCostINR ? checkForDecimalAndNull(item.LandedCostINR, initialConfiguration.NoOfDecimalForPrice) : ''}</td>
                              <td style={{ width: 200 }}>{checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                              <td>{item.NetBoughtOutPartCost ? checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                              <td>
                                <div className='action-btn-wrapper'>
                                  {!CostingViewMode && !IsLocked && <button className="Edit" type={'button'} onClick={() => editItem(index)} />}
                                  {!CostingViewMode && !IsLocked && <button className="Delete " type={'button'} onClick={() => deleteItem(index)} />}
                                </div>
                              </td>
                            </tr>

                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={12}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Row className='handling-charge'>
              <div className="pl-3">
                <span className="d-inline-block">
                  <label
                    className={`custom-checkbox mb-0`}
                    onChange={onPressApplyBOPCharges}
                  >
                    Apply Insert Handling Charges
                    <input
                      type="checkbox"
                      checked={IsApplyBOPHandlingCharges}
                      disabled={(CostingViewMode || IsLocked) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsApplyBOPHandlingCharges}
                      onChange={onPressApplyBOPCharges}
                    />
                  </label>
                </span>
              </div>
              {IsApplyBOPHandlingCharges &&
                <Col md="2" >
                  <SearchableSelectHookForm
                    label={"BOP Handling Type"}
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
                    disabled={(CostingViewMode || IsLocked) ? true : false}
                  />
                </Col>}
              {IsApplyBOPHandlingCharges &&
                <Col md="2" >
                  {BOPHandlingType === 'Fixed' ?
                    <div className='p-relative error-wrapper'>
                      <NumberFieldHookForm
                        label={'Fixed'}
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
                        // errors={errors.BOPHandlingPercentage}
                        disabled={(CostingViewMode || IsLocked) ? true : false}
                      />
                      {percentageLimit && <WarningMessage dClass={"error-message fixed-error"} message={MESSAGES.OTHER_VALIDATION_ERROR_MESSAGE} />}           {/* //MANUAL CSS FOR ERROR VALIDATION MESSAGE */}
                    </div>
                    :
                    <NumberFieldHookForm
                      label={'Percentage'}
                      name={"BOPHandlingPercentage"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^\d{0,3}(\.\d{0,6})?$/i,
                          message: 'Maximum length for decimal is 6.'
                        },
                        max: {
                          value: 100,
                          message: 'Percentage cannot be greater than 100'
                        },
                      }}
                      disableErrorOverflow={true}
                      handleChange={(e) => {
                        e.preventDefault();
                        handleBOPPercentageChange(e.target.value);
                      }}
                      defaultValue={""}
                      className=""
                      customClassName={"withBorder"}
                      errors={errors.BOPHandlingPercentage}
                      disabled={(CostingViewMode || IsLocked) ? true : false}
                    />}
                </Col>
              }

              {IsApplyBOPHandlingCharges &&
                <Col md="2">
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
                </Col>}

            </Row>
          </form>
        </div>
      </div >
      {isDrawerOpen && <AddBOP
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

export default BOPCost;