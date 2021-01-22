import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../layout/HookFormInputs'
import NoContentFound from '../../../common/NoContentFound'
import { CONSTANT } from '../../../../helper/AllConastant'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../helper'

function LossStandardTable(props) {
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    errors,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: defaultValues,
  })

  const fieldValues = useWatch({
    control,
    name: [
      'lossType',
      'lostPercent',
      //  'inputWeight'
    ],
  })

  useEffect(() => {
    calculateLossWeight()
  }, [fieldValues])

  const { dropDownMenu } = props

  const [tableData, setTableData] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [oldNetWeight, setOldNetWeight] = useState('')
  const [netWeight, setNetWeight] = useState(0)


  /**
   * @method calculateLossWeight
   * @description for calculating loss weight  and net loss weight
   */
  const calculateLossWeight = () => {
    const lostPercent = Number(getValues('lostPercent'))

    const inputWeight = props.weightValue //Need to Ask what to do
    if (!inputWeight || !lostPercent) {
      return ''
    }
    const lossWeight = (inputWeight * lostPercent) / 100

    setValue('lossWeight', checkForDecimalAndNull(lossWeight, trim))
  }
  /**
   * @method addRow
   * @description For updating and adding row
   */
  const addRow = () => {
    const lostPercent = Number(getValues('lostPercent'))
    const lossType = getValues('lossType').label
    const lossWeight = Number(getValues('lossWeight'))
    let NetWeight
    if (isEdit) {
      const oldWeight = netWeight - Number(oldNetWeight)
      NetWeight = checkForDecimalAndNull(oldWeight + lossWeight, trim)
      props.calculation(NetWeight)
      setNetWeight(NetWeight)
    } else {
      NetWeight = checkForDecimalAndNull(netWeight + lossWeight, trim)
      props.calculation(NetWeight)
      setNetWeight(NetWeight)
    }
    const obj = {
      lostPercent: lostPercent,
      lossType: lossType,
      lossWeight: lossWeight,
    }
    if (isEdit) {
      const tempArray = Object.assign([...tableData], { [editIndex]: obj })
      setTableData(tempArray)
      setIsEdit(false)
    } else {
      const tempArray = [...tableData, obj]
      setTableData(tempArray)
    }
    reset({
      lostPercent: '',
      lossType: '',
      lossWeight: '',
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
    setOldNetWeight(tempObj.lossWeight)
    setValue('lostPercent', tempObj.lostPercent)
    setValue('lossType', { label: tempObj.lossType })
    setValue('lossWeight', tempObj.lossWeight)
  }
  /**
   * @method cancelUpdate
   * @description Cancel update for edit
  */
  const cancelUpdate = () => {
    setIsEdit(false)
    setEditIndex('')
    setOldNetWeight('')
    setValue('lostPercent', '')
    setValue('lossType', '')
    setValue('lossWeight', '')
  }
  /**
   * @method deleteRow
   * @description Deleting single row from table
   */
  const deleteRow = (index) => {
    const tempObj = tableData[index]
    console.log(netWeight, "netWeight", tempObj.lossWeight)
    const weight = netWeight - tempObj.lossWeight //FIXME Calculation going wrong need to ask Harish sir.
    console.log(weight, "Weight");
    setNetWeight(weight)
    props.calculation(weight)
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })
    setTableData(tempData)
  }
  return (
    <Fragment>
      <Col md="10">
        <div className="left-border">{'Loss Percantage:'}</div>
      </Col>
      <Col md="12">
        <Row className={'mt15'}>
          <Col md="3">
            <SearchableSelectHookForm
              label={`Type of Loss`}
              name={'lossType'}
              placeholder={'-Select-'}
              Controller={Controller}
              control={control}
              register={register}
              mandatory={true}
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
              errors={errors.lossType}
              disabled={false}
            />
          </Col>
          <Col md="2">
            <TextFieldHookForm
              label={`Lost(%)`}
              name={'lostPercent'}
              Controller={Controller}
              control={control}
              register={register}
              mandatory={true}
              rules={{
                required: true,
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
              errors={errors.lostPercent}
              disabled={false}
            />
          </Col>
          <Col md="2">
            <TextFieldHookForm
              label={`Loss Weight`}
              name={'lossWeight'}
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
              errors={errors.lossWeight}
              disabled={true}
            />
          </Col>
          <Col md="3">
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
                    className={'cancel-btn mt30 pull-left mr5'}
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
                  >
                    <div className={'plus'}></div>ADD
                  </button>
                )}
            </div>
          </Col>

          <Col md="12">
            <Table className="table" size="sm">
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
                          <td>{item.lossType}</td>
                          <td>{item.lostPercent}</td>
                          <td>
                            {checkForDecimalAndNull(item.lossWeight, trim)}
                          </td>
                          <td>
                            {
                              <React.Fragment>
                                <button
                                  className="Edit mr-2"
                                  type={'button'}
                                  onClick={() => editRow(index)}
                                />
                                <button
                                  className="Delete"
                                  type={'button'}
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
                {tableData.length === 0 && (
                  <tr>
                    <td colspan="4">
                      <NoContentFound title={CONSTANT.EMPTY_DATA} />
                    </td>
                  </tr>
                )}
              </tbody>

              {/* <span className="col-sm-4 ">{'30'}</span> */}
            </Table>
            <div className="bluefooter-butn border row">
              <div className="col-md-12 text-right">
                <span className="col-md-12">
                  {`Net Loss Weight:`}
                  {checkForDecimalAndNull(netWeight, trim)}
                </span>
              </div>
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
      </Col>
    </Fragment>
  )
}

export default React.memo(LossStandardTable)
