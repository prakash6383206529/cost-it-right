import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../../helper'
import { saveRawMaterialCalciData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { KG } from '../../../../../config/constants'

function StandardRub(props) {

    const { rmRowData } = props
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;

    const costData = useContext(costingInfoContext)


    const defaultValues = {
        shotWeight: WeightCalculatorRequest && WeightCalculatorRequest.ShotWeight !== null ? WeightCalculatorRequest.ShotWeight : '',
        noOfCavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== undefined ? WeightCalculatorRequest.Cavity : 1,
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
        finishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '',
    }

    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })


    const dispatch = useDispatch()
    const [grossWeights, setGrossWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '')

    const fieldValues = useWatch({
        control,
        name: ['shotWeight', 'noOfCavity'],
    })

    useEffect(() => {
        grossWeight()
    }, [fieldValues])



    const grossWeight = () => {
        const shotWeight = getValues('shotWeight')
        const cavityNo = getValues('noOfCavity')
        const grossWeight = checkForNull(shotWeight / cavityNo)
        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setGrossWeight(grossWeight)
    }
    const onSubmit = () => {
        let obj = {}
        obj.LayoutType = 'Default'
        obj.WeightCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.IsChangeApplied = true //NEED TO MAKE IT DYNAMIC how to do
        obj.PartId = costData.PartId
        obj.RawMaterialId = rmRowData.RawMaterialId
        obj.CostingId = costData.CostingId
        obj.TechnologyId = costData.TechnologyId
        obj.CostingRawMaterialDetailId = rmRowData.RawMaterialDetailId
        obj.RawMaterialName = rmRowData.RMName
        obj.RawMaterialType = rmRowData.MaterialType
        obj.BasicRatePerUOM = rmRowData.RMRate
        obj.ScrapRate = rmRowData.ScrapRate
        obj.NetLandedCost = grossWeights * rmRowData.RMRate - (grossWeights - getValues('finishWeight')) * rmRowData.ScrapRate
        obj.PartNumber = costData.PartNumber
        obj.TechnologyName = costData.TechnologyName
        obj.Density = rmRowData.Density
        obj.UOMId = rmRowData.UOMId
        obj.UOM = rmRowData.UOM
        obj.UOMForDimension = KG
        obj.ShotWeight = getValues('shotWeight')
        obj.NumberOfCavity = getValues('noOfCavity')
        obj.GrossWeight = grossWeights
        obj.FinishWeight = getValues('finishWeight')

        dispatch(saveRawMaterialCalciData(obj, res => {
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', obj, obj)
            }
        }))
    }

    const cancel = () => {
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
                                                label={`Shot Weight`}
                                                name={'shotWeight'}
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
                                                errors={errors.shotWeight}
                                                disabled={props.isEditFlag ? false : true}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`No. Of Cavity`}
                                                name={'noOfCavity'}
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
                                                errors={errors.noOfCavity}
                                                disabled={props.isEditFlag ? false : true}
                                            />
                                        </Col>
                                        <Col md="2" className="m-height-44-label-inside">
                                            <TextFieldHookForm
                                                label={`Finish Weight`}
                                                name={'finishWeight'}
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
                                                errors={errors.finishWeight}
                                                disabled={props.isEditFlag ? false : true}
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
                                                disabled={props.isEditFlag ? false : true}
                                            />
                                        </Col>

                                    </Row>
                                </Col>

                            </div>
                        </Col>
                        <div className="mt25 col-md-12 text-right">
                            <button
                                onClick={cancel} // Need to change this cancel functionality
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
                                className="btn-primary save-btn"
                            >
                                <div className={'save-icon'}></div>
                                {'SAVE'}
                            </button>
                        </div>
                    </form>
                </Col>
            </Row>
        </Fragment>
    )
}

export default StandardRub;