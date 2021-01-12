import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'

function EndMill(props) {
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
    // defaultValues: defaultValues,
  })
  const { technology, process } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  useEffect(() => {
    const toothNo = 3 // Need to make it dynamic from API
    setValue('toothNo', toothNo)
  }, [])

  const onCutChange = (e) => {
    const cutLength = e.target.value
    const slotNo = getValues('slotNo')
    const removedMaterial = cutLength * slotNo
    setValue('removedMaterial', removedMaterial)
  }
  const onSpeedChange = (e) => {
    const cutterDiameter = getValues('cutterDiameter')
    const cuttingSpeed = e.target.value
    const rpm = (1000 * cuttingSpeed) / (3.14 * cutterDiameter)
    setValue('rpm', rpm)
  }
  const onToothFeedChange = (e) => {
    const toothNo = getValues('toothNo')
    const rpm = getValues('rpm')
    const cutLength = getValues('cutLength')

    const slotNo = getValues('slotNo')
    const toothFeed = e.target.value
    const feedRev = toothNo * toothFeed
    setValue('feedRev', feedRev)
    const feedMin = feedRev * rpm
    setValue('feedMin', feedMin)
    const tCut = (cutLength / feedMin) * slotNo
    setValue('cutTime', tCut)
  }

  const onClampingPercantageChange = (e) => {
    const tcut = getValues('cutTime')
    const clampingPercentage = e.target.value
    const clampingValue = tcut * clampingPercentage
    const totalMachiningTime = tcut + clampingValue
    setValue('clampingValue', clampingValue)
    // setValue('totalmachineTime', totalMachiningTime)
    setTotalMachiningTime(totalMachiningTime)
  }
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form" onSubmit={() => {}}>
            <Col md="12" className={"mt-2"}>
              <span className="d-inline-block mr-4 mb-3 pl-3">
                <span className="cr-tbl-label d-block">Process Name:</span>
                <span>Turning</span>
              </span>
              <span className="d-inline-block mr-4 mb-3">
                <span className="cr-tbl-label d-block">Material</span>
                <span>Steel</span>
              </span>
              <span className="d-inline-block mr-4 mb-3">
                <span className="cr-tbl-label d-block">Density(UOM):</span>
                <span>8.05</span>
              </span>
              <span className="d-inline-block mr-4 mb-3">
                <span className="cr-tbl-label d-block">Density(UOM):</span>
                <span>8.05</span>
              </span>
              <span className="d-inline-block mr-4 mb-3 pr-3">
                <span className="cr-tbl-label d-block">Density(UOM):</span>
                <span>8.05</span>
              </span>
            </Col>
            <Col md="12" className={"mt25"}>
              <div className="border pl-3 pr-3 pt-3">
                <Col md="10">
                  <div className="left-border">{"Distance:"}</div>
                </Col>
                <Col md="12">
                  <Row className={"mt15"}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cutter Diameter`}
                        name={"cutterDiameter"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.OuterDiameter}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Length of Area Cut`}
                        name={"cutLengthOfArea"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.Thickness}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Width of area to cut`}
                        name={"areaWidth"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.turningLength}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`No. of slots/T-nut entry`}
                        name={"slotNo"}
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
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.cutLength}
                        disabled={false}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cut Length(mm)`}
                        name={"cutLength"}
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
                        handleChange={onCutChange}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.cutLength}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Material To be removed`}
                        name={"removedMaterial"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.removedMaterial}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md="10 mt-25">
                  <div className="left-border">{"Speed:"}</div>
                </Col>
                <Col md="12">
                  <Row className={"mt15"}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cutting Speed(m/sec)`}
                        name={"cuttingSpeed"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onSpeedChange}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.cuttingSpeed}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`RPM`}
                        name={"rpm"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.rpm}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`No. of Teeth on Cutter`}
                        name={"toothNo"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          // pattern: {
                          //   value: /^[0-9]*$/i,
                          //   message: 'Invalid Number.'
                          // },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.toothNo}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/ Tooth`}
                        name={"toothFeed"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          // pattern: {
                          //   value: /^[0-9]*$/i,
                          //   message: 'Invalid Number.'
                          // },
                          // maxLength: 4,
                        }}
                        handleChange={onToothFeedChange}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.toothFeed}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/Rev`}
                        name={"feedRev"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          // pattern: {
                          //   value: /^[0-9]*$/i,
                          //   message: 'Invalid Number.'
                          // },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.feedRev}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/Min(mm/min)`}
                        name={"feedMin"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.feedMin}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md="10 mt-25">
                  <div className="left-border">{"Time"}</div>
                </Col>
                <Col md="12">
                  <Row className={"mt15"}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Total Cut time in hrs`}
                        name={"cutTime"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.cutTime}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Clamping,Tool Setting & Changing and Marking Time(%)`}
                        name={"clampingPercentage"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: "Invalid Number.",
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onClampingPercantageChange}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.clampingPercentage}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Clamping,Tool Setting`}
                        name={"clampingValue"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                          required: false,
                          // pattern: {
                          //   value: /^[0-9]*$/i,
                          //   message: 'Invalid Number.'
                          // },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.clampingValue}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3"></Col>
                  </Row>
                </Col>
                <div className="bluefooter-butn border row">
                  Total Machining Time{" "}
                  <span className="col-sm-12 text-right">
                    {totalMachiningTime}
                  </span>
                </div>
              </div>
            </Col>
            <div className="mt25 col-md-12 text-right">
              <button
                onClick={() => {}} // Need to change this cancel functionality
                type="submit"
                value="CANCEL"
                className="reset mr15 cancel-btn"
              >
                <div className={"cross-icon"}>
                  <img
                    src={require("../../../../../assests/images/times.png")}
                    alt="cancel-icon.jpg"
                  />
                </div>
                CANCEL
              </button>
              <button
                type="submit"
                // disabled={isSubmitted ? true : false}
                className="btn-primary save-btn"
              >
                <div className={"check-icon"}>
                  <i class="fa fa-check" aria-hidden="true"></i>
                </div>
                {"SAVE"}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  );
}

export default EndMill
