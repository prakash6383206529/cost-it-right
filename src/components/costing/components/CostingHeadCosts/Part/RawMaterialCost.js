import React, { useState, useContext, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Col, Row, Table } from 'reactstrap'
import AddRM from '../../Drawers/AddRM'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import NoContentFound from '../../../../common/NoContentFound'
import { useDispatch, useSelector } from 'react-redux'
import { CONSTANT } from '../../../../../helper/AllConastant'
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { toastr } from 'react-redux-toastr'
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper'
import OpenWeightCalculator from '../../WeightCalculatorDrawer'
import { getRawMaterialCalculationByTechnology, } from '../../../actions/CostWorking'
import { ViewCostingContext } from '../../CostingDetails'
import { G, KG, MG } from '../../../../../config/constants'

function RawMaterialCost(props) {

  const { register, handleSubmit, control, setValue, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const costData = useContext(costingInfoContext)
  const CostingViewMode = useContext(ViewCostingContext);

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(false)
  const [isWeightDrawerOpen, setWeightDrawerOpen] = useState(false)
  const [inputDiameter, setInputDiameter] = useState('')
  const [gridLength, setGridLength] = useState(0)
  const [gridData, setGridData] = useState(props.data)

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  const dispatch = useDispatch()

  useEffect(() => {
    switch (costData.TechnologyName) {
      case 'Sheet Metal':
        return setGridLength(0)
      case 'Plastic':
        return setGridLength(0)
      case 'Rubber':
        return setGridLength(3)
      case 'Forgining':
        return setGridLength(0)
      default:
        return setGridLength(0)
    }
  }, [])

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
        UOMId: rowData.UOMId,
        ScrapRate: rowData.ScrapRate,
        FinishWeight: '',
        GrossWeight: '',
        NetLandedCost: '',
        RawMaterialId: rowData.RawMaterialId,
        RawMaterialCategory: rowData.Category
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

    if (tempData.Density === undefined && tempData.Density === null && tempData.Density === "" || Number(tempData.Density) === 0) {
      toastr.warning("This Material's density is not available for weight calculation. Please add density for this material in RM Master > Manage Material.")
      return false
    }
    dispatch(getRawMaterialCalculationByTechnology(costData.CostingId, tempData.RawMaterialId, tempData.WeightCalculationId, costData.TechnologyId, res => {
      // if (res && res.data && res.data.Data) {
      const data = res && res.data && res.data.Data ? res.data.Data : {}
      tempData = { ...tempData, WeightCalculatorRequest: data, }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setTimeout(() => {
        setGridData(tempArr)
        setWeightDrawerOpen(true)
      }, 100)
      // }
    }))
    // setWeightDrawerOpen(true)
  }

  /**
   * @method closeWeightDrawer
   * @description HIDE WEIGHT CALCULATOR DRAWER
   */
  const closeWeightDrawer = (e = '', weightData = {}, originalWeight = {}) => {
    setInputDiameter(weightData.Diameter)
    setWeight(weightData, originalWeight)
    setWeightDrawerOpen(false)
  }

  /**
   * @method handleGrossWeightChange
   * @description HANDLE GROSS WEIGHT CHANGE
   */
  const handleGrossWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (Number(event.target.value)) {

      if (IsFinishWeightValid(event.target.value, tempData.FinishWeight)) {
        const GrossWeight = checkForNull(event.target.value)
        const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0

        const ApplicableFinishWeight = (FinishWeight !== 0) ? (GrossWeight - FinishWeight) * tempData.ScrapRate : 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
        tempData = { ...tempData, GrossWeight: GrossWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, WeightCalculationId: "00000000-0000-0000-0000-000000000000", IsCalculatedEntry: false, }
        tempArr = Object.assign([...gridData], { [index]: tempData })
        setGridData(tempArr)
        setValue(`${rmGridFields}[${index}]GrossWeight`, event.target.value)
      } else {
        const GrossWeight = checkForNull(event.target.value)
        const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0

        // const ApplicableFinishWeight = (FinishWeight !== 0) ? (GrossWeight - FinishWeight) * tempData.ScrapRate : 0;
        const ApplicableFinishWeight = 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
        tempData = { ...tempData, GrossWeight: GrossWeight, FinishWeight: 0, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, WeightCalculationId: "00000000-0000-0000-0000-000000000000", IsCalculatedEntry: false, }
        tempArr = Object.assign([...gridData], { [index]: tempData })
        setGridData(tempArr)
        setValue(`${rmGridFields}[${index}]GrossWeight`, event.target.value)
        setValue(`${rmGridFields}[${index}]FinishWeight`, 0)
        toastr.warning('Gross Weight should not be less than Finish Weight')
      }

    }
  }

  /**
   * @method handleFinishWeightChange
   * @description HANDLE FINISH WEIGHT CHANGE
   */
  const handleFinishWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (Number(event.target.value) <= 0) {

      const FinishWeight = checkForNull(event.target.value);
      const GrossWeight = tempData.GrossWeight !== undefined ? tempData.GrossWeight : 0;
      const ApplicableFinishWeight = (FinishWeight !== 0) ? (GrossWeight - FinishWeight) * tempData.ScrapRate : 0;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
      tempData = { ...tempData, FinishWeight: FinishWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, WeightCalculationId: "00000000-0000-0000-0000-000000000000", IsCalculatedEntry: false, }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      setValue(`${rmGridFields}[${index}]FinishWeight`, FinishWeight)
      //toastr.warning('Please enter valid weight.')

    } else {
      const FinishWeight = checkForNull(event.target.value);
      const GrossWeight = tempData.GrossWeight !== undefined ? tempData.GrossWeight : 0;

      if (IsFinishWeightValid(GrossWeight, FinishWeight)) {
        const ApplicableFinishWeight = (FinishWeight !== 0) ? (GrossWeight - FinishWeight) * tempData.ScrapRate : 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
        tempData = { ...tempData, FinishWeight: FinishWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, WeightCalculationId: "00000000-0000-0000-0000-000000000000", IsCalculatedEntry: false, }
        tempArr = Object.assign([...gridData], { [index]: tempData })
        setGridData(tempArr)
        setValue(`${rmGridFields}[${index}]FinishWeight`, FinishWeight)

      } else {

        const NetLandedCost = (GrossWeight * tempData.RMRate) - 0;
        //const NetLandedCost = 0;
        tempData = { ...tempData, FinishWeight: 0, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, }
        tempArr = Object.assign([...gridData], { [index]: tempData })
        setGridData(tempArr)
        toastr.warning('Finish weight should not be greater then gross weight.')
        setTimeout(() => {
          setValue(`${rmGridFields}[${index}]FinishWeight`, 0)
        }, 200)

      }
    }
  }

  /**
   * @method IsFinishWeightValid
   * @description CHECK IS FINISH WEIGHT LESS THEN GROSS WEIGHT
   */
  const IsFinishWeightValid = (GrossWeight, FinishWeight) => {
    return GrossWeight > FinishWeight ? true : false;
  }

  /**
   * @method setWeight
   * @description SET WEIGHT IN RM
   */
  const setWeight = (weightData, originalWeight) => {

    let tempArr = []
    let tempData = gridData[editIndex]
    let grossWeight
    let finishWeight

    if (Object.keys(weightData).length > 0) {
      if (weightData.UOMForDimension === G) {
        grossWeight = weightData.GrossWeight / 1000
        finishWeight = weightData.FinishWeight / 1000
      } else if (weightData.UOMForDimension === KG) {
        grossWeight = weightData.GrossWeight
        finishWeight = weightData.FinishWeight
      } else if (weightData.UOMForDimension === MG) {
        grossWeight = checkForDecimalAndNull(weightData.GrossWeight / 1000000, initialConfiguration.NoOfDecimalForPrice)
        finishWeight = checkForDecimalAndNull(weightData.FinishWeight / 1000000, initialConfiguration.NoOfDecimalForPrice)
      }
      const FinishWeight = finishWeight
      const GrossWeight = grossWeight
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ((GrossWeight - FinishWeight) * tempData.ScrapRate);

      tempData = {
        ...tempData,
        FinishWeight: FinishWeight,
        GrossWeight: GrossWeight,
        NetLandedCost: NetLandedCost,
        WeightCalculatorRequest: weightData,
        WeightCalculationId: weightData.WeightCalculationId,
        IsCalculatedEntry: true
      }

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
  const onSubmit = (values) => { }
  console.log('RM Errors', errors)

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
              {!CostingViewMode && gridData && gridData.length <= gridLength &&
                <button
                  type="button"
                  className={'user-btn'}
                  onClick={DrawerToggle}
                >
                  <div className={'plus'}></div>ADD RM
                </button>
              }
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-raw-material-section" size="sm">
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
                                // disabled={(item.Density === undefined || item.Density === "" || item.Density === null) ? true : false}
                                onClick={() => toggleWeightCalculator(index)}
                              />
                            </td>
                            <td>
                              <NumberFieldHookForm
                                label=""
                                name={`${rmGridFields}[${index}]GrossWeight`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: true,
                                  pattern: {
                                    // value: /[0-9]\d*(\.\d+)?$/i,
                                    value: /^\d*\.?\d*$/,
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
                                disabled={CostingViewMode ? true : false}
                              />
                            </td>
                            <td>
                              {/* //TODO FINISH WEIGHT NOT GREATER THAN GROSS WEIGHT */}
                              <NumberFieldHookForm
                                label=""
                                name={`${rmGridFields}[${index}]FinishWeight`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: true,
                                  pattern: {
                                    // value: /^[0-9]\d*(\.\d+)?$/i,
                                    value: /^\d*\.?\d*$/,
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
                                disabled={CostingViewMode ? true : false}
                              />
                            </td>
                            <td>
                              {item?.NetLandedCost !== undefined ? checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                            </td>
                            <td>
                              {!CostingViewMode && <button
                                className="Delete "
                                type={'button'}
                                onClick={() => deleteItem(index)}
                              />}
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
          isEditFlag={CostingViewMode ? false : true}
          inputDiameter={inputDiameter}
          technology={costData.ETechnologyType}
          ID={''}
          anchor={'right'}
          rmRowData={gridData[editIndex]}
        />
      )}
    </>
  )
}

export default RawMaterialCost
