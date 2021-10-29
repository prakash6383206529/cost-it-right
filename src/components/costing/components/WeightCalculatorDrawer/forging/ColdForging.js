import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import {
  checkForDecimalAndNull,
  getConfigurationKey,
} from '../../../../../helper'
import Switch from 'react-switch'
import NoContentFound from '../../../../common/NoContentFound'
import { CONSTANT } from '../../../../../helper/AllConastant'
import { deleteVendorPowerDetail } from '../../../../masters/actions/Fuel'

function ColdForging(props) {

  const { rmRowData } = props
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  const [tableData, setTableData] = useState([])
  const [isChecked, setIsChecked] = useState(false)
  const [showLabel, setIsShowLabel] = useState(false)
  const [forgingWeight, setNetForgingWeight] = useState(0)
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setIsEditIndex] = useState('')
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: [
      'forgingOuterDiameter',
      'forgingLength',
      'breadth',
      'height',
      'number',
    ],
  })

  const fieldValueForInput = useWatch({
    control,
    name: ['inputOuterDiameter', 'inputLength', 'flash'],
  })

  useEffect(() => {
    calculateInputVolumeAndDensity()
    calculateRmWeight()
  }, [fieldValueForInput])
  useEffect(() => {
    if (showLabel) {
      calculateforgingVolumeWeight()
    } else {
      calculateforgingVolumeAndWeight()
    }
  }, [fieldValues])

  /**
   * @method onSubmit
   * @description For Add value in table
   */
  const onSubmit = (values) => {

    const grossForgingWeight = values.grossForgingWeight
    const weight = forgingWeight + grossForgingWeight
    setNetForgingWeight(weight)
    setValue('netForgingWeight', weight)
    const obj = {
      Description: values.description,
      ForgingOuterDiameter: values.forgingOuterDiameter,
      ForgingLength: values.forgingLength,
      Breadth: values.breadth,
      Height: values.height,
      Number: values.number,
      ForgingVolume: values.forgingVolume,
      ForgingWeight: values.grossForgingWeight,
    }
    if (isEdit) {
      const tempArray = Object.assign([...tableData], { [editIndex]: obj })
      setTableData(tempArray)
      setIsEdit(false)
    } else {
      const tempArray = [...tableData, obj]
      setTableData(tempArray)
    }

    setIsShowLabel(false)
    setIsChecked(false)
    setValue('description', '')
    setValue('forgingOuterDiameter', '')
    setValue('forgingLength', '')
    setValue('breadth', '')
    setValue('height', '')
    setValue('number', '')
    setValue('forgingVolume', '')
    setValue('grossForgingWeight', '')
  }
  /**
   * @method onCancel
   * @description on cancel close the drawer
   */
  const onCancel = () => {
    props.toggleDrawer('')
  }

  const onCancelRow = () => {
    setIsShowLabel(false)
    setIsChecked(false)
    setValue('description', '')
    setValue('forgingOuterDiameter', '')
    setValue('forgingLength', '')
    setValue('breadth', '')
    setValue('height', '')
    setValue('number', '')
    setValue('forgingVolume', '')
    setValue('forgingWeight', '')
  }
  /**
   * @method onToggleChange
   * @description Changing toggle for length,breadth,height and diameter
   */
  const onToggleChange = () => {
    setIsShowLabel(!showLabel)
    setIsChecked(!isChecked)
    setValue('description', '')
    setValue('forgingOuterDiameter', '')
    setValue('forgingLength', '')
    setValue('breadth', '')
    setValue('height', '')
    setValue('number', '')
    setValue('forgingVolume', '')
    setValue('forgingWeight', '')
  }
  /**
   * @method calculateInputVolumeAndDensity
   * @description Calculate volume and density
   */
  const calculateInputVolumeAndDensity = () => {
    const inputOuterDiameter = getValues('inputOuterDiameter')
    const inputLength = getValues('inputLength')
    if (!inputOuterDiameter || !inputLength) {
      return ''
    }
    const inputVolume = checkForDecimalAndNull(
      Math.PI * Math.pow(inputOuterDiameter / 2, 2) * inputLength,
      trim,
    )
    const inputWeight = checkForDecimalAndNull(
      inputVolume * rmRowData.Density,
      trim,
    )
    setValue('inputVolume', inputVolume)
    setValue('inputWeight', inputWeight)
  }
  /**
   * @method calculateRmWeight
   * @description Calculate RM Weight
   */
  const calculateRmWeight = () => {
    const inputWeight = getValues('inputWeight')
    const flash = getValues('flash')
    if (!inputWeight || !flash) {
      return ''
    }
    const rmWeight = checkForDecimalAndNull(
      inputWeight + (inputWeight * flash) / 100,
      trim,
    )
    setValue('rmWeight', rmWeight)
  }
  /**
   * @method calculateforgingVolumeAndWeight
   * @description Calaulate volume and density based on outerdiameter and length
   */
  const calculateforgingVolumeAndWeight = () => {
    const forgingOuterDiameter = getValues('forgingOuterDiameter')
    const forgingLength = getValues('forgingLength')

    if (!forgingOuterDiameter || !forgingLength) {
      return ''
    }

    const forgingVolume = checkForDecimalAndNull(
      Math.PI * Math.pow(forgingOuterDiameter / 2, 2) * forgingLength,
      trim,
    )

    const grossForgingWeight = checkForDecimalAndNull(
      forgingVolume * rmRowData.Density,
      trim,
    )
    setValue('forgingVolume', forgingVolume)
    setValue('grossForgingWeight', grossForgingWeight)
  }
  /**
   * @method calculateforgingVolumeWeight
   * @description Calculate volume and weight based on length,breadth and height
   */
  const calculateforgingVolumeWeight = () => {

    const forgingLength = getValues('forgingLength')
    const breadth = getValues('breadth')
    const height = getValues('height')
    const number = getValues('number')
    if (!forgingLength || !breadth || !height || !number) {
      return ''
    }
    const forgingVolume = checkForDecimalAndNull(
      forgingLength * breadth * height * number,
      trim,
    )
    const grossForgingWeight = checkForDecimalAndNull(
      forgingVolume * rmRowData.Density,
      trim,
    )
    setValue('forgingVolume', forgingVolume)
    setValue('grossForgingWeight', grossForgingWeight)
  }

  /**
   * @method editRow
   * @description Editing Row ,to give value in upper row
   */
  const editRow = (index) => {
    setIsEdit(true)
    setIsEditIndex(index)
    const tempObj = tableData[index]
    if (!tempObj.Breadth && !tempObj.Height) {
      setIsShowLabel(false)
      setIsChecked(false)
      setValue('description', tempObj.Description)

      setValue('forgingLength', tempObj.ForgingLength)
      setValue('breadth', '')
      setValue('height', '')
      setValue('number', '')
      setTimeout(() => {
        setValue('forgingOuterDiameter', tempObj.ForgingOuterDiameter)
        setValue('forgingVolume', tempObj.ForgingVolume)
        setValue('forgingWeight', tempObj.forgingWeight)
      }, 100)
    } else {

      setIsShowLabel(true)
      setIsChecked(true)
      setValue('description', tempObj.Description)
      setValue('forgingOuterDiameter', '')
      setValue('forgingLength', tempObj.ForgingLength)
      setTimeout(() => {
        setValue('breadth', tempObj.Breadth)
        setValue('height', tempObj.Height)
        setValue('number', tempObj.Number)
      }, 100)

      setValue('forgingVolume', tempObj.ForgingVolume)
      setValue('forgingWeight', tempObj.ForgingWeight)
    }
  }
  /**
   * @method deleteRow
   * @description Deleting single row from table
   */
  const deleteRow = (index) => {
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })
    setTableData(tempData)
  }

  const onSave = () => {
    const grossForgingWeight = getValues('grossForgingWeight')
    const weight = forgingWeight + grossForgingWeight
    setValue('netForgingWeight', weight)
    // let totalForgingWeight = 0
    // tableData.forEach((element) => {
    //   totalForgingWeight = totalForgingWeight + element.ForgingWeight
    // })
    // 
  }
  return (
    <Fragment>
      <Row>
        <Col>
          <Col md="12" className={'mt25'}>
            <div className="border pl-3 pr-3 pt-3">
              <Col md="10">
                <div className="left-border">{'Input Weight Calculator:'}</div>
              </Col>

              <Col md="12">
                <Row className={'mt15'}>
                  <Col md="2" className="m-height-44-label-inside">
                    <TextFieldHookForm
                      label={`Outer Diameter(UOM)`}
                      name={'inputOuterDiameter'}
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
                      errors={errors.inputOuterDiameter}
                      disabled={props.CostingViewMode ? props.CostingViewMode : false}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
                    <TextFieldHookForm
                      label={`Length(UOM)`}
                      name={'inputLength'}
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
                      errors={errors.inputLength}
                      disabled={props.CostingViewMode ? props.CostingViewMode : false}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
                    <TextFieldHookForm
                      label={`Volume`}
                      name={'inputVolume'}
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
                      errors={errors.inputVolume}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
                    <TextFieldHookForm
                      label={`Weight(UOM)`}
                      name={'inputWeight'}
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.inputWeight}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2" className="m-height-44-label-inside">
                    <TextFieldHookForm
                      label={`Flash in %`}
                      name={'flash'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
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
                      errors={errors.flash}
                      disabled={props.CostingViewMode ? props.CostingViewMode : false}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.rmWeight}
                      disabled={true}
                    />
                  </Col>
                </Row>
              </Col>
              <Col md="10 mt-25">
                <div className="left-border">
                  {'Forging Weight Calculator:'}
                </div>
              </Col>
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Col md="4" className="switch mb15">
                  <label className="switch-level">
                    <div className={'left-title'}>With Diameter</div>
                    <Switch
                      onChange={onToggleChange}
                      checked={isChecked}
                      id="normal-switch"
                      disabled={props.CostingViewMode ? props.CostingViewMode : false}
                      background="#4DC771"
                      onColor="#4DC771"
                      onHandleColor="#ffffff"
                      offColor="#4DC771"
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={20}
                      width={46}
                    />
                    <div className={'right-title'}>Without Diameter</div>
                  </label>
                </Col>

                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Description`}
                        name={'description'}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.description}
                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                      />
                    </Col>
                    {!showLabel && (
                      <Col md="2" className="m-height-44-label-inside">
                        <TextFieldHookForm
                          label={`Outer Diameter(UOM)`}
                          name={'forgingOuterDiameter'}
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
                          errors={errors.forgingOuterDiameter}
                          disabled={props.CostingViewMode ? props.CostingViewMode : false}
                        />
                      </Col>
                    )}

                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Length`}
                        name={'forgingLength'}
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
                        errors={errors.forgingLength}
                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                      />
                    </Col>
                    {showLabel && (
                      <Fragment>
                        <Col md="2" className="m-height-44-label-inside">
                          <TextFieldHookForm
                            label={`Breadth`}
                            name={'breadth'}
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
                            errors={errors.breadth}
                            disabled={props.CostingViewMode ? props.CostingViewMode : false}
                          />
                        </Col>
                        <Col md="2" className="m-height-44-label-inside">
                          <TextFieldHookForm
                            label={`Height`}
                            name={'height'}
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
                            errors={errors.height}
                            disabled={props.CostingViewMode ? props.CostingViewMode : false}
                          />
                        </Col>
                        <Col md="2" className="m-height-44-label-inside">
                          <TextFieldHookForm
                            label={`No`}
                            name={'number'}
                            Controller={Controller}
                            control={control}
                            register={register}
                            mandatory={true}
                            rules={{
                              required: true,
                              pattern: {
                                value: /^[0-9]*$/i,
                                //value: /^[0-9]\d*(\.\d+)?$/i,
                                message: 'Invalid Number.',
                              },
                              // maxLength: 4,
                            }}
                            handleChange={() => { }}
                            defaultValue={''}
                            className=""
                            customClassName={'withBorder'}
                            errors={errors.number}
                            disabled={props.CostingViewMode ? props.CostingViewMode : false}
                          />
                        </Col>
                      </Fragment>
                    )}

                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Volume`}
                        name={'forgingVolume'}
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
                        errors={errors.forgingVolume}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2" className="m-height-44-label-inside">
                      <TextFieldHookForm
                        label={`Gross Weight(UOM)`}
                        name={'grossForgingWeight'}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.grossForgingWeight}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2">
                      <div>
                        {isEdit ? (
                          <>
                            <button
                              type="submit"
                              className={'btn btn-primary mt30 pull-left mr5'}
                              onClick={() => { }}
                            >
                              Update
                            </button>

                            <button
                              type="button"
                              className={'cancel-btn mt30 pull-left mr5'}
                              onClick={onCancelRow}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="submit"
                            disabled={props.CostingViewMode ? props.CostingViewMode : false}
                            className={'user-btn mt30 pull-left'}
                            onClick={() => { }}
                          >
                            <div className={'plus'}></div>ADD
                          </button>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Col>
              </form>
              {/* Table starts from here */}

              <Col>
                <Table className="table" size="sm">
                  <thead>
                    <tr>
                      <th>{`Description`}</th>
                      <th>{`Outer Diameter(UOM)`}</th>
                      <th>{`Length`}</th>

                      <th>{`Breadth`}</th>
                      <th>{`Height`}</th>

                      <th>{`Volume`}</th>
                      <th>{`Gross Weight(UOM)`}</th>
                      <th>{`Actions`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData &&
                      tableData.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.Description}</td>
                            <td>
                              {item.ForgingOuterDiameter
                                ? item.ForgingOuterDiameter
                                : '-'}
                            </td>
                            <td>
                              {item.ForgingLength ? item.ForgingLength : '-'}
                            </td>
                            <td>{item.Breadth ? item.Breadth : '-'}</td>
                            <td>{item.Height ? item.Height : '-'}</td>
                            <td>
                              {item.ForgingVolume ? item.ForgingVolume : '-'}
                            </td>
                            <td>
                              {item.ForgingWeight ? item.ForgingWeight : '-'}
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
                        )
                      })}
                    {tableData.length === 0 && (
                      <tr>
                        <td colspan="8">
                          <NoContentFound title={CONSTANT.EMPTY_DATA} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>

              <Col md="12">
                <Row className={'mt15'}>
                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.netForgingWeight}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.rawMaterialCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.scrapWeightRecovery}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.scrapCost}
                      disabled={true}
                    />
                  </Col>

                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.materialCost}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2" className="m-height-44-label-inside">
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
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.rmWeight}
                      disabled={true}
                    />
                  </Col>
                </Row>
              </Col>
            </div>
          </Col>
          <div className="mt25 col-md-12 text-right">
            <button
              onClick={onCancel} // Need to change this cancel functionality
              type="submit"
              value="CANCEL"
              className="reset mr15 cancel-btn"
            >
              <div className={'cancel-icon'}></div>
              CANCEL
            </button>
            <button
              type="submit"
              // disabled={isSubmitted ? true : false}
              disabled={props.CostingViewMode ? props.CostingViewMode : false}
              onClick={onSave}
              className="btn-primary save-btn"
            >
              <div className={'save-icon'}></div>
              {'SAVE'}
            </button>
          </div>
        </Col>
      </Row>
    </Fragment>
  )
}

export default ColdForging
