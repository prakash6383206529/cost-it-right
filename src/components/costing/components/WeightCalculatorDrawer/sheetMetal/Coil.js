import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalciData } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import Switch from 'react-switch'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, convertmmTocm, setValueAccToUOM, } from '../../../../../helper'
import { getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import { toastr } from 'react-redux-toastr'
import { G, KG, MG, STD, } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'



function Coil(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;


    const { rmRowData, isEditFlag } = props

    const costData = useContext(costingInfoContext)

    const defaultValues = {
        StripWidth: WeightCalculatorRequest && WeightCalculatorRequest.StripWidth !== null ? WeightCalculatorRequest.StripWidth : '',
        Thickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== null ? WeightCalculatorRequest.Thickness : '',
        Pitch: WeightCalculatorRequest && WeightCalculatorRequest.Pitch !== null ? WeightCalculatorRequest.Pitch : '',
        Cavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== undefined ? WeightCalculatorRequest.Cavity : 1,
        NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest.NetSurfaceArea !== null ? WeightCalculatorRequest.NetSurfaceArea : '',
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '',
    }

    const {
        register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })


    const localStorage = reactLocalStorage.getObject('InitialConfiguration');

    const [isOneSide, setIsOneSide] = useState(WeightCalculatorRequest && WeightCalculatorRequest.IsOneSide ? WeightCalculatorRequest.IsOneSide : false)
    const [UOMDimension, setUOMDimension] = useState(
        WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== null
            ? {
                label: WeightCalculatorRequest.UOMForDimension,
                value: WeightCalculatorRequest.UOMForDimensionId,
            }
            : [],
    )
    let extraObj = {}
    const [dataToSend, setDataToSend] = useState({})
    const [isChangeApplies, setIsChangeApplied] = useState(true)
    const [unit, setUnit] = useState(WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId ? WeightCalculatorRequest.UOMForDimension !== null : G) //Need to change default value after getting it from API
    const tempOldObj = WeightCalculatorRequest
    const [GrossWeight, setGrossWeights] = useState('')
    const [FinishWeight, setFinishWeights] = useState('')
    const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)



    const fieldValues = useWatch({
        control,
        name: ['StripWidth', 'Thickness', 'Pitch', 'Cavity'],
    })

    const dispatch = useDispatch()

    useEffect(() => {
        //UNIT TYPE ID OF DIMENSIONS
        dispatch(getUOMSelectList(res => {
            const Data = res.data.Data
            const kgObj = Data.find(el => el.Text === G)
            setTimeout(() => {
                setValue('UOMDimension', WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== null
                    ? {
                        label: WeightCalculatorRequest.UOMForDimension,
                        value: WeightCalculatorRequest.UOMForDimensionId,
                    }
                    : { label: kgObj.Text, value: kgObj.Value })
                setUOMDimension(WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== null
                    ? {
                        label: WeightCalculatorRequest.UOMForDimension,
                        value: WeightCalculatorRequest.UOMForDimensionId,
                    }
                    : { label: kgObj.Text, value: kgObj.Value })
            }, 100);

        }))
    }, [])

    const setFinishWeight = (e) => {
        const FinishWeight = e.target.value
        switch (UOMDimension.label) {
            case G:
                setTimeout(() => {
                    setFinishWeights(FinishWeight)
                }, 200);
                break;
            case KG:
                setTimeout(() => {
                    setFinishWeights(FinishWeight * 1000)
                }, 200);
                break;
            case MG:
                setTimeout(() => {
                    setFinishWeights(FinishWeight / 1000)
                }, 200);
                break;
            default:
                break;
        }
    }
    useEffect(() => {
        // calculateNetSurfaceArea()
        setGrossWeight()
    }, [fieldValues])


    /**
     * @method setGrossWeight
     * @description SET GROSS WEIGHT
     */
    const setGrossWeight = () => {

        let grossWeight
        let data = {
            density: rmRowData.Density,
            stripWidth: checkForNull(getValues('StripWidth')),
            thickness: convertmmTocm(getValues('Thickness')),
            pitch: checkForNull(getValues('Pitch')),
            cavity: getValues('Cavity')
        }
        grossWeight = calculateWeight(data.density, data.stripWidth, data.thickness, data.pitch) / data.cavity
        setGrossWeights(setValueAccToUOM(grossWeight, UOMDimension.label))
        setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, UOMDimension.label), localStorage.NoOfDecimalForInputOutput))
        // switch (UOMDimension.label) {
        //     case G:
        //         // setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight }))
        //         setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
        //         break;
        //     case KG:
        //         // setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight / 1000 }))
        //         setValue('GrossWeight', checkForDecimalAndNull(grossWeight / 1000, localStorage.NoOfDecimalForInputOutput))
        //         break;
        //     case MG:
        //         //      setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight * 1000 }))
        //         setValue('GrossWeight', checkForDecimalAndNull(grossWeight * 1000, localStorage.NoOfDecimalForInputOutput))
        //         break;
        //     default:
        //         break;
        // }
    }


    /**
     * @method onSideToggle
     * @description SIDE TOGGLE
     */
    const onSideToggle = () => {
        setIsOneSide(!isOneSide)
    }

    /**
     * @method renderListing
     * @description Used show listing of unit of measurement
     */
    const renderListing = (label) => {
        const temp = []

        if (label === 'UOM') {
            UOMSelectList &&
                UOMSelectList.map((item) => {
                    const accept = AcceptableSheetMetalUOM.includes(item.Text)
                    if (accept === false) return false
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
            return temp
        }
    }


    /**
     * @method cancel
     * @description used to Reset form
     */
    const cancel = () => {
        props.toggleDrawer('')
    }

    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = (values) => {


        if (WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId !== "00000000-0000-0000-0000-000000000000") {
            if (tempOldObj.GrossWeight !== dataToSend.GrossWeight || tempOldObj.FinishWeight !== dataToSend.FinishWeight || tempOldObj.NetSurfaceArea !== dataToSend.NetSurfaceArea || tempOldObj.UOMForDimensionId !== UOMDimension.value) {
                setIsChangeApplied(true)
            } else {
                setIsChangeApplied(false)
            }
        }
        let data = {
            LayoutType: 'Coil',
            WeightCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000",
            IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
            PartId: costData.PartId,
            RawMaterialId: rmRowData.RawMaterialId,
            CostingId: costData.CostingId,
            TechnologyId: costData.TechnologyId,
            CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
            RawMaterialName: rmRowData.RMName,
            RawMaterialType: rmRowData.MaterialType,
            BasicRatePerUOM: rmRowData.RMRate,
            ScrapRate: rmRowData.ScrapRate,
            NetLandedCost: dataToSend.GrossWeight * rmRowData.RMRate - (dataToSend.GrossWeight - dataToSend.FinishWeight) * rmRowData.ScrapRate,
            PartNumber: costData.PartNumber,
            TechnologyName: costData.TechnologyName,
            Density: rmRowData.Density,
            UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
            UOMForDimension: UOMDimension ? UOMDimension.label : '',
            // UOMDimension: values.UOMDimension,  where it is
            OuterDiameter: values.OuterDiameter,
            Thickness: values.Thickness,
            InnerDiameter: dataToSend.InnerDiameter,
            LengthOfSheet: values.SheetLength,
            LengthOfPart: values.PartLength,
            NumberOfPartsPerSheet: dataToSend.NumberOfPartsPerSheet,
            LengthOfScrap: dataToSend.ScrapLength,
            WeightOfSheetInUOM: dataToSend.WeightofSheet,
            WeightOfPartInUOM: dataToSend.WeightofPart,
            WeightOfScrapInUOM: dataToSend.WeightofScrap
            ,
            // Side: isOneSide, why and where
            UOMId: rmRowData.UOMId,
            UOM: rmRowData.UOM,
            IsOneSide: isOneSide,
            SurfaceAreaSide: isOneSide ? 'Both Side' : 'One  Side',
            NetSurfaceArea: dataToSend.NetSurfaceArea,
            GrossWeight: (dataToSend.newGrossWeight === undefined || dataToSend.newGrossWeight === 0) ? GrossWeight : dataToSend.newGrossWeight,
            FinishWeight: getValues('FinishWeight'),
            LoggedInUserId: loggedInUserId()
        }

        let obj = {
            originalGrossWeight: GrossWeight,
            originalFinishWeight: FinishWeight !== '' ? FinishWeight : getValues('FinsihWeight')
        }

        dispatch(saveRawMaterialCalciData(data, res => {
            if (res.data.Result) {
                data.WeightCalculationId = res.data.Identity
                toastr.success("Calculation saved successfully")
                props.toggleDrawer('', data, obj)
            }
        }))
    }

    const handleUnit = (value) => {
        setValue('UOMDimension', { label: value.label, value: value.value })
        setUOMDimension(value)
        let grossWeight = GrossWeight
        // let finishWeight = FinishWeightOfSheet
        setUnit(value.label)
        setDataToSend(prevState => ({ ...prevState, newGrossWeight: setValueAccToUOM(grossWeight, value.label), newFinishWeight: setValueAccToUOM(FinishWeight, value.label) }))
        setTimeout(() => {
            setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, value.label), localStorage.NoOfDecimalForInputOutput))
            setValue('FinishWeight', checkForDecimalAndNull(setValueAccToUOM(FinishWeight, value.label), localStorage.NoOfDecimalForInputOutput))
        }, 500);
        //         setTimeout(() => {
        //             setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
        //             setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
        //         }, 100);
        // switch (value.label) {
        //     case KG:
        //         grossWeight = grossWeight / 1000
        //         finishWeight = finishWeight / 1000
        //         setFinishWeights(FinishWeight * 1000)
        //         setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight, newFinishWeight: finishWeight }))
        //         setTimeout(() => {
        //             setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
        //             setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
        //         }, 100);
        //         break;
        //     case G:

        //         grossWeight = grossWeight
        //         finishWeight = finishWeight
        //         setFinishWeights(FinishWeight * 1000)
        //         setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight, newFinishWeight: finishWeight }))
        //         setTimeout(() => {
        //             setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
        //             setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
        //         }, 100);
        //         break;
        //     case MG:
        //         grossWeight = grossWeight * 1000
        //         finishWeight = finishWeight * 1000
        //         setFinishWeights(FinishWeight / 1000)
        //         setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight, newFinishWeight: finishWeight }))
        //         setTimeout(() => {
        //             setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
        //             setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
        //         }, 100);
        //         break;
        //     default:
        //         break;
        // }
    }

    const UnitFormat = () => {
        return <>Net Surface Area (cm<sup>2</sup>)</>
        // return (<sup>2</sup>)
    }

    /**
     * @method render
     * @description Renders the component
     */
    return (
        <>
            <div className="user-page p-0">
                <div>
                    <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
                        <div className="costing-border border-top-0 px-4">
                            <Row>
                                <Col md="12" className={'mt25'}>
                                    <HeaderTitle className="border-bottom"
                                        title={'Sheet Specification'}
                                        customClass={'underLine-title'}
                                    />
                                </Col>
                            </Row>
                            <Row className={'mt15'}>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Strip Width(cm)`}
                                        name={'StripWidth'}
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
                                        errors={errors.StripWidth}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Thickness(mm)`}
                                        name={'Thickness'}
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
                                        errors={errors.Thickness}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Pitch(cm)`}
                                        name={'Pitch'}
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
                                        errors={errors.Pitch}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Cavity`}
                                        name={'Cavity'}
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
                                        errors={errors.Cavity}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                            </Row>
                            <hr className="mx-n4 w-auto" />
                            <Row>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={UnitFormat()}
                                        name={'NetSurfaceArea'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.'
                                            },
                                            // maxLength: 3,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.NetSurfaceArea}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={'Weight Unit'}
                                        name={'UOMDimension'}
                                        placeholder={'-Select-'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={UOMDimension.length !== 0 ? UOMDimension : ''}
                                        options={renderListing('UOM')}
                                        mandatory={true}
                                        handleChange={handleUnit}
                                        errors={errors.UOMDimension}
                                        disabled={isEditFlag ? false : true}
                                    />

                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Gross Weight(${UOMDimension.label})`}
                                        name={'GrossWeight'}
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
                                            // maxLength: 3,
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.GrossWeight}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Finish Weight(${UOMDimension.label})`}
                                        name={'FinishWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            pattern: {
                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.'
                                            },
                                            // maxLength: 4,
                                        }}
                                        handleChange={setFinishWeight}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.FinishWeight}
                                        disabled={isEditFlag ? false : true}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <div className="col-sm-12 text-right px-0 mt-4">
                            <button
                                type={'button'}
                                className="reset mr15 cancel-btn"
                                onClick={cancel} >
                                <div className={'cross-icon'}><img src={require('../../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
                            </button>
                            <button
                                type={'submit'}
                                className="submit-button save-btn">
                                <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                                {'Save'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    )
}

export default Coil