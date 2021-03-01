import React, { useState, useContext, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Col, Row, Table } from 'reactstrap'
import AddRM from '../../Drawers/AddRM'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import NoContentFound from '../../../../common/NoContentFound'
import { useDispatch, useSelector } from 'react-redux'
import { CONSTANT } from '../../../../../helper/AllConastant'
import { TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { toastr } from 'react-redux-toastr'
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper'
import WeightCalculator from '../../WeightCalculatorDrawer'
import OpenWeightCalculator from '../../WeightCalculatorDrawer'
import { getRawMaterialCalculationByTechnology } from '../../../actions/CostWorking'

function RawMaterialCost(props) {

  const { register, handleSubmit, control, setValue, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const technology = props.technology ? props.technology : 'Sheet Metal'
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(false)
  const [isWeightDrawerOpen, setWeightDrawerOpen] = useState(false)
  const [inputDiameter, setInputDiameter] = useState('')
  const [gridLength, setGridLength] = useState(0)
  const [gridData, setGridData] = useState(props.data)

  const dispatch = useDispatch()

  useEffect(() => {
    switch (technology) {
      case 'Sheet Metal':
        return setGridLength(0)
      case 'Plastic':
        return setGridLength(0)
      case 'Rubber':
        return setGridLength(3)
      case 'Forging':
        return setGridLength(0)
      default:
        return setGridLength(0)
    }
  }, [])

  const costData = useContext(costingInfoContext)

  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      props.setRMCost(gridData, Params)
    }, 100)
  }, [gridData]);

  /**
   * @method DrawerToggle
   * @description TOGGLE DRAWER
   */
  const DrawerToggle = () => {
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0) {
      let tempObj = {
        RMName: rowData.RawMaterial,
        RMRate: rowData.BasicRatePerUOM,
        MaterialType: rowData.MaterialType,
        Density: rowData.Density,
        UOM: rowData.UOM,
        ScrapRate: rowData.ScrapRate,
        FinishWeight: '',
        GrossWeight: '',
        NetLandedCost: '',
        RawMaterialId: rowData.RawMaterialId,
      }

      setGridData([...gridData, tempObj])
    }
    setDrawerOpen(false)
  }

  /**
   * @method toggleWeightCalculator
   * @description TOGGLE WEIGHT CALCULATOR DRAWER
   */
  const toggleWeightCalculator = (index) => {
    setEditIndex(index)
    let tempArr = []
    let tempData = gridData[index]
    dispatch(getRawMaterialCalculationByTechnology(technology, 'default', res => {
      if (res && res.data && res.data.Data) {
        const data = res.data.Data
        tempData = { ...tempData, WeightCalculatorRequest: data, }

        tempArr = Object.assign([...gridData], { [editIndex]: tempData })
        setTimeout(() => {
          setGridData(tempArr)
        }, 100)
      }
    }))

    setWeightDrawerOpen(true)
  }

  /**
   * @method closeWeightDrawer
   * @description HIDE WEIGHT CALCULATOR DRAWER
   */
  const closeWeightDrawer = (e = '', weightData = {}) => {
    setInputDiameter(weightData.Diameter)
    setWeight(weightData)
    setWeightDrawerOpen(false)
  }

  /**
   * @method handleGrossWeightChange
   * @description HANDLE GROSS WEIGHT CHANGE
   */
  const handleGrossWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const GrossWeight = checkForNull(event.target.value)
      const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0
      if (!GrossWeight || !FinishWeight) {
        return ''
      }
      const NetLandedCost = GrossWeight * tempData.RMRate - (GrossWeight - FinishWeight) * tempData.ScrapRate;
      tempData = { ...tempData, GrossWeight: GrossWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
    } else {
      toastr.warning('Please enter valid weight.')
    }
  }

  /**
   * @method handleFinishWeightChange
   * @description HANDLE FINISH WEIGHT CHANGE
   */
  const handleFinishWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (!isNaN(event.target.value)) {
      const FinishWeight = checkForNull(event.target.value);
      const GrossWeight = tempData.GrossWeight !== undefined ? tempData.GrossWeight : 0;

      //if (IsFinishWeightValid(GrossWeight, FinishWeight)) {
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ((GrossWeight - FinishWeight) * tempData.ScrapRate);
      tempData = { ...tempData, FinishWeight: FinishWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      //} else {
      // const NetLandedCost = 0;
      // tempData = { ...tempData, FinishWeight: '', NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, }
      // tempArr = Object.assign([...gridData], { [index]: tempData })
      // setGridData(tempArr)
      // setValue(`${rmGridFields}[${index}]FinishWeight`, '')
      //   toastr.warning('Finish weight should not be greater then gross weight.')
      // }

    } else {
      toastr.warning('Please enter valid weight.')
    }
  }

  /**
   * @method IsFinishWeightValid
   * @description CHECK IS FINISH WEIGHT LESS THEN GROSS WEIGHT
   */
  const IsFinishWeightValid = (GrossWeight, FinishWeight) => {
    return GrossWeight >= FinishWeight ? true : false;
  }

  /**
   * @method setWeight
   * @description SET WEIGHT IN RM
   */
  const setWeight = (weightData) => {
    let tempArr = []
    let tempData = gridData[editIndex]

    if (Object.keys(weightData).length > 0) {
      const FinishWeight = weightData.FinishWeight
      const GrossWeight = weightData.GrossWeight
      const NetLandedCost = GrossWeight * tempData.RMRate - (GrossWeight - FinishWeight) * tempData.ScrapRate;

      tempData = { ...tempData, FinishWeight: FinishWeight, GrossWeight: GrossWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: weightData, }

      tempArr = Object.assign([...gridData], { [editIndex]: tempData })
      setTimeout(() => {
        setGridData(tempArr)
        setValue(`${rmGridFields}[${editIndex}]GrossWeight`, GrossWeight)
        setValue(`${rmGridFields}[${editIndex}]FinishWeight`, FinishWeight)
      }, 100)

    }
  }

  const deleteItem = (index) => {
    setGridData([])
  }

  const rmGridFields = 'rmGridFields'

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => {

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
              <div className="left-border">{'Raw Material Cost:'}</div>
            </Col>
            <Col md={'2'}>
              {gridData && gridData.length <= gridLength && (
                <button
                  type="button"
                  className={'user-btn'}
                  onClick={DrawerToggle}
                >
                  <div className={'plus'}></div>ADD RM
                </button>
              )}
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main" size="sm">
                  <thead>
                    <tr>
                      <th>{`RM Name`}</th>
                      <th>{`RM Rate`}</th>
                      <th>{`Scrap Rate`}</th>
                      <th style={{ width: "220px" }} className="text-center">{`Weight Calculator`}</th>
                      <th style={{ width: "220px" }}>{`Gross Weight`}</th>
                      <th style={{ width: "220px" }}>{`Finish Weight`}</th>
                      <th style={{ width: "220px" }}>{`Net RM Cost`}</th>
                      <th style={{ width: "145px" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData &&
                      gridData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.RMName}</td>
                            <td>{item.RMRate}</td>
                            <td>{item.ScrapRate}</td>
                            <td className="text-center">
                              <button
                                className="CalculatorIcon cr-cl-icon "
                                type={'button'}
                                onClick={() => toggleWeightCalculator(index)}
                              />
                            </td>
                            <td>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${rmGridFields}[${index}]GrossWeight`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    //required: true,
                                    pattern: {
                                      value: /^[0-9]\d*(\.\d+)?$/i,
                                      message: 'Invalid Number.',
                                    },
                                  }}
                                  defaultValue={item.GrossWeight}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleGrossWeightChange(e, index)
                                  }}
                                  errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].GrossWeight : ''}
                                  disabled={false}
                                />
                              }
                            </td>
                            <td>
                              {
                                <TextFieldHookForm
                                  label=""
                                  name={`${rmGridFields}[${index}]FinishWeight`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    //required: true,
                                    pattern: {
                                      value: /^[0-9]\d*(\.\d+)?$/i,
                                      message: 'Invalid Number.',
                                    },
                                  }}
                                  defaultValue={item.FinishWeight}
                                  className=""
                                  customClassName={'withBorder'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleFinishWeightChange(e, index)
                                  }}
                                  errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].FinishWeight : ''}
                                  disabled={false}
                                />
                              }
                            </td>
                            <td>
                              {item.NetLandedCost
                                ? checkForDecimalAndNull(item.NetLandedCost, 2)
                                : ''}
                            </td>
                            <td>
                              <button
                                className="Delete "
                                type={'button'}
                                onClick={() => deleteItem(index)}
                              />
                            </td>
                          </tr>
                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={8}>
                          <NoContentFound title={CONSTANT.EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </form>
        </div>
      </div>
      {isDrawerOpen && (
        <AddRM
          isOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
        />
      )}
      {isWeightDrawerOpen && (
        <OpenWeightCalculator
          isOpen={isWeightDrawerOpen}
          closeDrawer={closeWeightDrawer}
          isEditFlag={false}
          inputDiameter={inputDiameter}
          technology={technology}
          ID={''}
          anchor={'right'}
          rmRowData={gridData[editIndex]}
        />
      )}
    </>
  )
}

export default RawMaterialCost
