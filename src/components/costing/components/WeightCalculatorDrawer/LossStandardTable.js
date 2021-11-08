import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey } from '../../../../helper'
import { toastr } from 'react-redux-toastr'
import { setPlasticArray } from '../../actions/Costing'

function LossStandardTable(props) {
  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput

  const [lossWeight, setLossWeight] = useState('')
  const dispatch = useDispatch()



  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: defaultValues,
  })

  const fieldValues = useWatch({
    control,
    name: ['LossOfType', 'LossPercentage',],
  })

  useEffect(() => {
    calculateLossWeight()
  }, [fieldValues])

  const { dropDownMenu } = props

  const [tableData, setTableData] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [oldNetWeight, setOldNetWeight] = useState('')
  const [netWeight, setNetWeight] = useState(props.netWeight !== '' ? props.netWeight : 0)
  const [burningWeight, setBurningWeight] = useState(props.burningValue !== '' ? props.burningValue : '')

  useEffect(() => {
    setTableData(props.sendTable ? props.sendTable : [])
  }, [])
  /**
   * @method calculateLossWeight
   * @description for calculating loss weight  and net loss weight
   */
  const calculateLossWeight = () => {
    const LossPercentage = Number(getValues('LossPercentage'))

    const inputWeight = props.weightValue
    const LossWeight = (inputWeight * LossPercentage) / 100

    setValue('LossWeight', checkForDecimalAndNull(LossWeight, getConfigurationKey().NoOfDecimalForInputOutput))

    setLossWeight(LossWeight)


  }
  /**
   * @method addRow
   * @description For updating and adding row
   */
  const addRow = () => {
    const LossPercentage = Number(getValues('LossPercentage'))
    const LossOfType = getValues('LossOfType').value
    const LossWeight = Number(lossWeight)

    if (LossPercentage === 0 || LossOfType === '' || LossWeight === 0) {
      toastr.warning("Please add data first.")
      return false;
    }

    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    if (!isEdit) {
      const isExist = tableData.findIndex(el => (el.LossOfType === LossOfType))
      if (isExist !== -1) {
        toastr.warning('Already added, Please select another loss type.')
        return false;
      }
    }


    let tempArray = []
    let NetWeight
    if (isEdit) {
      const oldWeight = netWeight - Number(oldNetWeight)
      NetWeight = checkForNull(oldWeight + LossWeight)
      setNetWeight(NetWeight)
    } else {

      NetWeight = checkForNull(checkForNull(netWeight) + LossWeight)

      setTimeout(() => {
        setNetWeight(NetWeight)
      }, 400);

    }
    const obj = {
      LossPercentage: LossPercentage,
      LossOfType: LossOfType,
      LossWeight: LossWeight,
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
    if (LossOfType === 2) {
      setBurningWeight(LossWeight)
      props.burningLoss(LossWeight)
    }
    dispatch(setPlasticArray(tempArray))
    props.calculation(NetWeight)
    props.tableValue(tempArray)

    reset({
      LossPercentage: '',
      LossOfType: '',
      LossWeight: '',
    })
  }
  /**
   * @method editRow
   * @description for filling the row above table for editing
   */
  const editRow = (index) => {
    setIsEdit(true)
    setEditIndex(index)
    const tempObj = tableData[index]
    setOldNetWeight(tempObj.LossWeight)
    setValue('LossPercentage', tempObj.LossPercentage)
    setValue('LossOfType', { label: getLossTypeName(tempObj.LossOfType), value: tempObj.LossOfType })
    setValue('LossWeight', tempObj.LossWeight)
  }
  /**
   * @method cancelUpdate
   * @description Cancel update for edit
  */
  const cancelUpdate = () => {
    setIsEdit(false)
    setEditIndex('')
    setOldNetWeight('')
    setValue('LossPercentage', '')
    setValue('LossOfType', '')
    setValue('LossWeight', '')

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
      weight = netWeight - tempObj.LossWeight //FIXME Calculation going wrong need to ask Harish sir.
    }

    setNetWeight(weight)
    props.calculation(weight)
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })

    dispatch(setPlasticArray(tempData))
    props.tableValue(tempData)
    setTableData(tempData)
  }

  const getLossTypeName = (number) => {
    const name = dropDownMenu && dropDownMenu.find(item => item.value === Number(number))
    return name?.label
  }

  return (
    <Fragment>
      <Row className={''}>
        <Col md="12">
          <div className="header-title">
            <h5>{'Loss Percentage:'}</h5>
          </div>
        </Col>
        <Col md="3">
          <SearchableSelectHookForm
            label={`Type of Loss`}
            name={'LossOfType'}
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
            handleChange={() => { }}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossOfType}
            disabled={props.CostingViewMode}
          />
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label={`Loss(%)`}
            name={'LossPercentage'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            rules={{
              required: false,
              pattern: {
                //value: /^[0-9]*$/i,
                value: /^[0-9]\d*(\.\d+)?$/i,
                message: 'Invalid Number.',
              },
              // maxLength: 4,
            }}
            handleChange={() => { }}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossPercentage}
            disabled={props.CostingViewMode}
          />
        </Col>
        <Col md="3">
          <TextFieldHookForm
            label={`Loss Weight`}
            name={'LossWeight'}
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
            handleChange={() => { }}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossWeight}
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
          <Table className="table mb-0" size="sm">
            <thead>
              <tr>
                <th>{`Type of Loss`}</th>
                <th>{`Lost(%)`}</th>
                <th>{`Loss Weight`}</th>
                <th>{`Actions`}</th>
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map((item, index) => {
                  return (
                    <Fragment>
                      <tr key={index}>
                        <td>{getLossTypeName(item.LossOfType)}</td>
                        <td>{item.LossPercentage}</td>
                        <td>
                          {checkForDecimalAndNull(item.LossWeight, trim)}
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
                      {/* <tr>
                          <td></td>

                          <td>{`Net Loss Weight:`}</td>
                          <td>{checkForDecimalAndNull(netWeight, trim)}</td>
                          <td></td>
                        </tr> */}
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
            {props.isPlastic &&
              <span className="w-50 d-inline-block text-left">
                {`Burning Loss Weight:`}
                {checkForDecimalAndNull(burningWeight, trim)}
              </span>}
            <span className="w-50 d-inline-block">
              {`${props.isPlastic ? 'Other' : 'Net'} Loss Weight:`}
              {checkForDecimalAndNull(findLostWeight(tableData), trim)}
            </span>
          </div>
        </Col>

        {/* <Row>
            <Col md="12">
              <Row className={'mt15'}>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Net Forging Weight(UOM)`}
                    name={'netForgingWeight'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.netForgingWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Raw Material Cost/Component`}
                    name={'rawMaterialCost'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.rawMaterialCost}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Scrap Weight Recovery`}
                    name={'scrapWeightRecovery'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapWeightRecovery}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Scrap Cost`}
                    name={'scrapCost'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapCost}
                    disabled={true}
                  />
                </Col>

                <Col md="3">
                  <TextFieldHookForm
                    label={`Material Cost`}
                    name={'materialCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    // rules={{
                    //   required: false,
                    //   pattern: {
                    //     //value: /^[0-9]*$/i,
                    //     value: /^[0-9]\d*(\.\d+)?$/i,
                    //     message: 'Invalid Number.',
                    //   },
                    //   // maxLength: 4,
                    // }}
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.materialCost}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Input RM Weight(UOM)`}
                    name={'rmWeight'}
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
                    handleChange={() => {}}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.rmWeight}
                    disabled={true}
                  />
                </Col>
              </Row>
            </Col>
          </Row> */}
      </Row>

    </Fragment>
  )
}

export default React.memo(LossStandardTable)
