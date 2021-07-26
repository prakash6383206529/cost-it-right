import React, { useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'

function Rubber(props) {
    const trimValue = getConfigurationKey()
    const trim = trimValue.NumberOfDecimalForWeightCalculation
    const density = props.rmRowData.Density
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const defaultValues = {
        inputDiameter: WeightCalculatorRequest &&
            WeightCalculatorRequest.InputDiameter !== undefined
            ? WeightCalculatorRequest.InputDiameter
            : '',
        thickness: WeightCalculatorRequest &&
            WeightCalculatorRequest.Thickness !== undefined
            ? WeightCalculatorRequest.Thickness
            : '',
        outerDiameter: WeightCalculatorRequest &&
            WeightCalculatorRequest.OuterDiameter !== undefined
            ? WeightCalculatorRequest.OuterDiameter
            : '',
        length: WeightCalculatorRequest &&
            WeightCalculatorRequest.Length !== undefined
            ? WeightCalculatorRequest.Length
            : '',
        cuttingAllowance: WeightCalculatorRequest &&
            WeightCalculatorRequest.CuttingAllowance !== undefined
            ? WeightCalculatorRequest.CuttingAllowance
            : '',
        totalLength: WeightCalculatorRequest &&
            WeightCalculatorRequest.TotalLength !== undefined
            ? WeightCalculatorRequest.TotalLength
            : '',
        volume: WeightCalculatorRequest &&
            WeightCalculatorRequest.Volume !== undefined
            ? WeightCalculatorRequest.Volume
            : '',
        density: WeightCalculatorRequest &&
            WeightCalculatorRequest.Density !== undefined
            ? WeightCalculatorRequest.Density
            : '',
        finishWeight: WeightCalculatorRequest &&
            WeightCalculatorRequest.FinishWeight !== undefined
            ? WeightCalculatorRequest.FinishWeight
            : '',
        grossWeight: WeightCalculatorRequest &&
            WeightCalculatorRequest.GrossWeight !== undefined
            ? WeightCalculatorRequest.GrossWeight
            : '',
        inputDiameter: WeightCalculatorRequest &&
            WeightCalculatorRequest.InputDiameter !== undefined
            ? WeightCalculatorRequest.InputDiameter
            : ''
    }
    const { register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['thickness', 'length', 'cuttingAllowance'],
    })

    useEffect(() => {

        setValue('density', density)
        if (props.inputDiameter && !WeightCalculatorRequest) {
            setValue('inputDiameter', props.inputDiameter)
        }
    }, [])
    useEffect(() => {
        onInputDiameter()
        calculateTotalLengthAndVolume()
        calculateGrossAndInputRMWeight()
    }, [fieldValues])
    const onSubmit = (value) => {

        let obj = {}
        obj.InputDiameter = value.inputDiameter
        obj.Thickness = value.thickness
        obj.OuterDiameter = value.outerDiameter
        obj.Length = value.length
        obj.CuttingAllowance = value.cuttingAllowance
        obj.TotalLength = value.totalLength
        obj.Volume = value.volume
        obj.Density = value.density
        obj.FinishWeight = value.grossWeight
        obj.GrossWeight = value.grossWeight
        obj.Diameter = value.outerDiameter
        props.toggleDrawer('', obj)
    }


    /**
     * @method onInputDiameter
     * @description For finding outer diameter
    */
    const onInputDiameter = (e = {}) => {
        let inputDiameter = ''
        if (Object.keys(e).length === 0 && e.constructor === Object) {
            inputDiameter = Number(getValues('inputDiameter'))
        } else {
            inputDiameter = Number(e.target.value)
        }

        const thickness = Number(getValues('thickness'))
        if (!inputDiameter || !thickness) {
            return ''
        }
        const outerDiameter = checkForDecimalAndNull(inputDiameter + thickness, trim)
        setValue('outerDiameter', outerDiameter)
    }
    /**
     * @method calculateTotalLengthAndVolume
     * @description Calculating total length and volume 
    */
    const calculateTotalLengthAndVolume = () => {
        const inputDiameter = Number(getValues('inputDiameter'))
        const outerDiameter = Number(getValues('outerDiameter'))
        const length = Number(getValues('length'))
        const cuttingAllowance = Number(getValues('cuttingAllowance'))
        if (!length || !cuttingAllowance) {
            return ''
        }
        const totalLength = checkForDecimalAndNull(length + cuttingAllowance, trim)
        if (!inputDiameter || !outerDiameter || !totalLength) {
            return ''
        }
        const volume = checkForDecimalAndNull(((Math.pow(outerDiameter, 2) - Math.pow(inputDiameter, 2)) / 4) * Math.PI * totalLength / 1000, trim)
        setValue('totalLength', totalLength)
        setValue('volume', volume)
    }
    /**
     * @method calculateGrossAndInputRMWeight
     * @description Calculate gross and input rm weight of fkm and eco
    */
    const calculateGrossAndInputRMWeight = () => {
        // const density = Number(getValues('density'))
        const volume = Number(getValues('volume'))
        if (!density || !volume) {
            return ''
        }
        const grossWeight = checkForDecimalAndNull(volume * density, trim)
        setValue('grossWeight', grossWeight)
    }
    /**
     * @method onCancel
     * @description on cancel close the drawer
     */
    const onCancel = () => {
        props.toggleDrawer('')
    }
    return (
        <Fragment>
            <Row>
                <Col>
                    <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
                        <Col md="12" className={'mt25'}>
                            <div className="border pl-3 pr-3 pt-3">
                                <Col md="12">
                                    <div className="left-border">
                                        {'Input Weight:'}
                                    </div>
                                </Col>
                                <Col md="12">
                                    <Row className={'mt15'}>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Input Diameter`}
                                                name={'inputDiameter'}
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
                                                handleChange={onInputDiameter}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.inputDiameter}
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Thickness`}
                                                name={'thickness'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.thickness}
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Outer Diameter`}
                                                name={'outerDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.outerDiameter}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Length`}
                                                name={'length'}
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
                                                errors={errors.length}
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Cutting Allowance`}
                                                name={'cuttingAllowance'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^[0-9\b]+$/i,
                                                        //value: /^[0-9]\d*(\.\d+)?$/i,
                                                        message: 'Invalid Number.',
                                                    },
                                                    // maxLength: 4,
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingAllowance}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Total Length`}
                                                name={'totalLength'}
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
                                                errors={errors.totalLength}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Volume`}
                                                name={'volume'}
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
                                                errors={errors.volume}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Density`}
                                                name={'density'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
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
                                                errors={errors.density}
                                                disabled={true}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Gross Weight`}
                                                name={'grossWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                //   rules={{
                                                //     required: true,
                                                //     pattern: {
                                                //       //value: /^[0-9]*$/i,
                                                //       value: /^[0-9]\d*(\.\d+)?$/i,
                                                //       message: 'Invalid Number.',
                                                //     },
                                                //     // maxLength: 4,
                                                //   }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
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
                                <div className={'cross-icon'}>
                                    <img
                                        src={require('../../../../../assests/images/times.png')}
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
                                <div className={'check-icon'}>
                                    <i class="fa fa-check" aria-hidden="true"></i>
                                </div>
                                {'SAVE'}
                            </button>
                        </div>
                    </form>
                </Col>
            </Row>
        </Fragment>
    )
}

export default Rubber
