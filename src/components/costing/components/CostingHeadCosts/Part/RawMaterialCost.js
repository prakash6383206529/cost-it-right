import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Col, Row, Table } from 'reactstrap';
import AddRM from '../../Drawers/AddRM';
import { costingInfoContext } from '../../CostingDetailStepTwo';
import NoContentFound from '../../../../common/NoContentFound';
import { CONSTANT } from '../../../../../helper/AllConastant';
import { TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { toastr } from 'react-redux-toastr';
import { checkForDecimalAndNull, checkForNull } from '../../../../../helper';
import WeightCalculator from '../../WeightCalculatorDrawer';

function RawMaterialCost(props) {

  const { register, handleSubmit, control, setValue, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(false)
  const [isWeightDrawerOpen, setWeightDrawerOpen] = useState(false)
  const [gridData, setGridData] = useState(props.data)

  const costData = useContext(costingInfoContext)

  useEffect(() => {
    setTimeout(() => {
      props.setRMCost(gridData, props.index)
    }, 200)
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
    console.log('rowData: ', rowData);
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
      setGridData([tempObj])
    }
    setDrawerOpen(false)
  }

  /**
  * @method toggleWeightCalculator
  * @description TOGGLE WEIGHT CALCULATOR DRAWER
  */
  const toggleWeightCalculator = (index) => {
    setEditIndex(index)
    setWeightDrawerOpen(true)
  }

  /**
  * @method closeWeightDrawer
  * @description HIDE WEIGHT CALCULATOR DRAWER
  */
  const closeWeightDrawer = (e = '', weightData = {}) => {
    setWeight(weightData)
    setWeightDrawerOpen(false)
  }

  /**
  * @method handleGrossWeightChange
  * @description HANDLE GROSS WEIGHT CHANGE
  */
  const handleGrossWeightChange = (event, index) => {
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {
      const GrossWeight = checkForNull(event.target.value);
      const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ((GrossWeight - FinishWeight) * tempData.ScrapRate);
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
    let tempArr = [];
    let tempData = gridData[index];

    if (!isNaN(event.target.value)) {
      const FinishWeight = checkForNull(event.target.value);
      const GrossWeight = tempData.GrossWeight !== undefined ? tempData.GrossWeight : 0;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ((GrossWeight - FinishWeight) * tempData.ScrapRate);
      tempData = { ...tempData, FinishWeight: FinishWeight, NetLandedCost: NetLandedCost, WeightCalculatorRequest: {}, }
      console.log('tempData: ', tempData);
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)

    } else {
      toastr.warning('Please enter valid weight.')
    }
  }

  /**
  * @method setWeight
  * @description SET WEIGHT IN RM
  */
  const setWeight = (weightData) => {
    let tempArr = [];
    let tempData = gridData[editIndex];

    if (Object.keys(weightData).length > 0) {

      const FinishWeight = weightData.FinishWeight;
      const GrossWeight = weightData.GrossWeight;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ((GrossWeight - FinishWeight) * tempData.ScrapRate);

      tempData = {
        ...tempData,
        FinishWeight: FinishWeight,
        GrossWeight: GrossWeight,
        NetLandedCost: NetLandedCost,
        WeightCalculatorRequest: weightData,
      }

      tempArr = Object.assign([...gridData], { [editIndex]: tempData })

      setTimeout(() => {
        console.log('called from bottom')
        setGridData(tempArr)
        setValue(`${rmGridFields}[${editIndex}]GrossWeight`, GrossWeight)
        setValue(`${rmGridFields}[${editIndex}]FinishWeight`, FinishWeight)
      }, 100)

    }
  }

  const deleteItem = (index) => {
    setGridData([])
  }

  const rmGridFields = 'rmGridFields';

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {
    console.log('values >>>', values);
  }

  /**
  * @method render
  * @description Renders the component
  */
  return (
    <>
      <div className="user-page p-0">
        <div>

          <Row>
            <Col md="10">
              <div className="left-border">
                {'Raw Material Cost:'}
              </div>
            </Col>
            <Col col={'2'}>
              {gridData.length === 0 && <button
                type="button"
                className={'user-btn'}
                onClick={DrawerToggle}>
                <div className={'plus'}></div>ADD RM</button>}
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)} >
            <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table" size="sm" >
                  <thead>
                    <tr>
                      <th>{`RM Name`}</th>
                      <th>{`RM Rate`}</th>
                      <th>{`Scrap Rate`}</th>
                      <th>{`Weight Calculator`}</th>
                      <th>{`Gross Weight`}</th>
                      <th>{`Finish Weight`}</th>
                      <th>{`Net RM Cost`}</th>
                      <th>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      gridData &&
                      gridData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.RMName}</td>
                            <td>{item.RMRate}</td>
                            <td>{item.ScrapRate}</td>
                            <td><button className="CalculatorIcon mt15" type={'button'} onClick={() => toggleWeightCalculator(index)} /></td>
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
                                      message: 'Invalid Number.'
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
                                      message: 'Invalid Number.'
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
                            <td>{item.NetLandedCost ? checkForDecimalAndNull(item.NetLandedCost, 2) : ''}</td>
                            <td>
                              <button className="Delete mt15" type={'button'} onClick={() => deleteItem(index)} />
                            </td>
                          </tr>
                        )
                      })
                    }
                    {gridData.length === 0 &&
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
      </div >
      {isDrawerOpen && <AddRM
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
      />}
      {isWeightDrawerOpen && <WeightCalculator
        isOpen={isWeightDrawerOpen}
        closeDrawer={closeWeightDrawer}
        isEditFlag={false}
        ID={''}
        anchor={'right'}
        rmRowData={gridData[0]}
      />}
    </ >
  );
}

export default RawMaterialCost;