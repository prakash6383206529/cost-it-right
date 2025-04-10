import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { TextFieldHookForm, NumberFieldHookForm } from '../../../layout/HookFormInputs'
import { checkForNull, getConfigurationKey, getWeightFromDensity, loggedInUserId } from '../../../../helper'
import { saveRawMaterialCalculationForMachining } from '../../actions/CostWorking'
import Toaster from '../../../common/Toaster'
import { debounce } from 'lodash'
import { checkForDecimalAndNull, decimalNumberLimit, positiveAndDecimalNumber, number, nonZero } from '../../../../helper/validation'
import TooltipCustom from '../../../common/Tooltip'
import { reactLocalStorage } from 'reactjs-localstorage'
import classnames from 'classnames'
import Bar from './sheetMetal/Bar'
import { sourceCurrencyFormatter } from '../Drawers/processCalculatorDrawer/CommonFormula'
import { useLabels } from '../../../../helper/core'

function Machining(props) {
    const { item, rmRowData, CostingViewMode } = props
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const dispatch = useDispatch()
    const { currencySource } = useSelector((state) => state?.costing);

    const defaultValues = {
        outerDiameter: WeightCalculatorRequest && WeightCalculatorRequest.OuterDiameter !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.OuterDiameter, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        thickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        partingMargin: WeightCalculatorRequest && WeightCalculatorRequest.PartingMargin !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.PartingMargin, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        netLength: WeightCalculatorRequest && WeightCalculatorRequest.NetLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetLength, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        grossLength: WeightCalculatorRequest && WeightCalculatorRequest.GrossLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossLength, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        piecePerMeter: WeightCalculatorRequest && WeightCalculatorRequest.PiecePerMeter !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.PiecePerMeter, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        rmPerPiece: WeightCalculatorRequest && WeightCalculatorRequest.RMPerPiece !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RMPerPiece, getConfigurationKey().NoOfDecimalForPrice) : '',
        netRm: WeightCalculatorRequest && WeightCalculatorRequest.RMPerPiece !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RMPerPiece, getConfigurationKey().NoOfDecimalForPrice) : '',
        ScrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        ScrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        InnerDiameter: WeightCalculatorRequest && WeightCalculatorRequest.InnerDiameter !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.InnerDiameter, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    }
    const [grossLength, setGrossLength] = useState(0)
    const [piecePerMeter, setPiecePerMeter] = useState(0)
    const [rmPerPiece, setRmPerPiece] = useState(0)
    const { finishWeightLabel } = useLabels()

    const [dataToSend, setDataToSend] = useState({
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : ''
    })
    const { register, control, setValue, getValues, handleSubmit, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['partingMargin', 'netLength', 'outerDiameter', 'thickness', 'finishedWeight'],
    })

    useEffect(() => {
        if (rmRowData && rmRowData.UOM === 'Meter') {
            setActiveTab(getTabno(rmRowData.WeightCalculatorRequest ? rmRowData.WeightCalculatorRequest.LayoutType ?? 'Traub' : 'Traub'))
        } else {
            setActiveTab('2')
        }
    }, [rmRowData])
    useEffect(() => {
        if (!CostingViewMode) {
            calculateAll()
            calculateInnerDiameter()
            calculateGrossWeight()
            calculateFinishWeight()
            calculateScrapWeight()
            calculateScrapCost()
        }
        calculateNetRm()
    }, [fieldValues])


    const calculateAll = () => {
        const netLength = getValues('netLength')
        const partingMargin = getValues('partingMargin')
        const grossLength = checkForNull(netLength) + checkForNull(partingMargin)
        setValue('grossLength', checkForDecimalAndNull(grossLength, getConfigurationKey().NoOfDecimalForInputOutput))
        setGrossLength(grossLength)
        const piecePerMeter = 1000 / grossLength
        setValue('piecePerMeter', checkForDecimalAndNull(piecePerMeter, getConfigurationKey().NoOfDecimalForInputOutput))
        setPiecePerMeter(piecePerMeter)
        const rmPerPiece = checkForNull(rmRowData.RMRate / piecePerMeter)
        setValue('rmPerPiece', checkForDecimalAndNull(rmPerPiece, getConfigurationKey().NoOfDecimalForInputOutput))
        setRmPerPiece(rmPerPiece)
    }
    const calculateNetRm = () => {
        const rmPerPiece = getValues('rmPerPiece')
        const scrapCost = getValues('ScrapCost')
        if (checkForNull(rmPerPiece) < checkForNull(scrapCost)) {
            Toaster.warning('RM/Pc should not be less than scrap cost/piece. Please verify the values for "Thickness", "Net length", and "Parting Margin".')
        }
        const netRm = rmPerPiece - scrapCost
        setValue('netRm', checkForDecimalAndNull(netRm, getConfigurationKey().NoOfDecimalForPrice))
    }
    /**
 * @method calculateInnerDiameter
 * @description CALCULATE INNER DIAMETER
 */
    const calculateInnerDiameter = () => {
        const outerDiameter = getValues('outerDiameter')
        const thickness = getValues('thickness')
        let innerDiameter = checkForNull(outerDiameter) - 2 * checkForNull(thickness);
        setValue('InnerDiameter', checkForDecimalAndNull(innerDiameter, getConfigurationKey().NoOfDecimalForInputOutput))
        const updatedValue = dataToSend
        updatedValue.InnerDiameter = innerDiameter
        setDataToSend(updatedValue)
    }
    /**
     * @method calculateGrossWeight
     * @description CALCULATE WEIGHT OF PART
     */
    const calculateGrossWeight = () => {
        const data = {
            Density: props.rmRowData.Density / 1000,
            OuterDiameter: getValues('outerDiameter'),
            InnerDiameter: getValues('InnerDiameter'),
            GrossLength: getValues('grossLength'),
        }
        const GrossWeight = (getWeightFromDensity(data.Density, data.InnerDiameter, data.OuterDiameter, data.GrossLength) / 1000)
        const updatedValue = dataToSend
        updatedValue.GrossWeight = GrossWeight
        setDataToSend(updatedValue)
        setValue('GrossWeight', checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    }
    /**
   * @method calculateGrossWeight
   * @description CALCULATE WEIGHT OF PART
   */
    const calculateFinishWeight = () => {
        const data = {
            Density: props.rmRowData.Density / 1000,
            OuterDiameter: checkForNull(getValues('outerDiameter')),
            InnerDiameter: checkForNull(getValues('InnerDiameter')),
            NetLength: checkForNull(getValues('netLength')),
        }
        const FinishWeight = (getWeightFromDensity(data.Density, data.InnerDiameter, data.OuterDiameter, data.NetLength) / 1000)
        const updatedValue = dataToSend
        updatedValue.FinishWeight = FinishWeight
        setDataToSend(updatedValue)
        setValue('FinishWeight', checkForDecimalAndNull(FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    }
    /**
     * @method calculateWeightOfScrap
     * @description CALCULATE WEIGHT OF SCRAP
     */
    const calculateScrapWeight = () => {
        const GrossWeight = checkForNull(getValues('GrossWeight'))
        const FinishWeight = checkForNull(getValues('FinishWeight'))
        const ScrapWeight = GrossWeight - FinishWeight
        const updatedValue = dataToSend
        updatedValue.ScrapWeight = ScrapWeight
        setDataToSend(updatedValue)
        setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    }
    /**
   * @method calculateScrapCost
   * @description CALCULATE SCRAP COST
   */
    const calculateScrapCost = () => {
        const ScrapWeight = getValues('ScrapWeight')
        const ScrapRate = props.rmRowData.ScrapRatePerScrapUOMConversion ?? props.rmRowData.ScrapRatePerScrapUOM
        const ScrapCost = ScrapWeight * ScrapRate
        const updatedValue = dataToSend
        updatedValue.ScrapCost = ScrapCost
        setDataToSend(updatedValue)
        setValue('ScrapCost', checkForDecimalAndNull(ScrapCost, getConfigurationKey().NoOfDecimalForPrice))
    }
    /**
       * @method cancel
       * @description used to Reset form
       */
    const cancel = () => {
        props.toggleDrawer('')
    }
    const onSubmit = debounce(handleSubmit((values) => {
        if (checkForNull(getValues('netRm')) <= 0) {
            Toaster.warning('"Net RM Cost" should not be negative or zero.')
            return false
        }
        let obj = {
            MachiningCalculatorId: WeightCalculatorRequest && WeightCalculatorRequest.MachiningCalculatorId ? WeightCalculatorRequest.MachiningCalculatorId : "0",
            BaseCostingIdRef: item.CostingId,
            CostingRawMaterialDetailsIdRef: rmRowData.RawMaterialDetailId,
            RawMaterialIdRef: rmRowData?.RawMaterialId,
            LoggedInUserId: loggedInUserId(),
            OuterDiameter: getValues('outerDiameter'),
            Thickness: getValues('thickness'),
            NetLength: getValues('netLength'),
            PartingMargin: getValues('partingMargin'),
            GrossLength: grossLength,
            PiecePerMeter: piecePerMeter,
            RMPerPiece: rmPerPiece,
            InnerDiameter: dataToSend.InnerDiameter,
            GrossWeight: dataToSend.GrossWeight,
            FinishWeight: dataToSend.FinishWeight,
            ScrapWeight: dataToSend.ScrapWeight,
            ScrapCost: dataToSend.ScrapCost,
            LayoutType: 'Traub',
            NetRM: getValues('netRm'),
        }
        dispatch(saveRawMaterialCalculationForMachining(obj, res => {
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', obj)
            }
        }))

    }), 500);

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };
    const tooltipMessageForSheetWeight = (type, value) => {
        return <div>{type} Weight = (Density * (π / 4) * (Outer Diameter<sup>2</sup> - Inner Diameter<sup>2</sup>) * {value} Length)/1000/1000</div>
    }
    const handleOuterDiameterChange = (e) => {
        let outerDiameter = checkForNull(Number(e?.target?.value))
        if (Number(getValues('thickness')) < outerDiameter) {
            delete errors.thickness
        }
    }
    const handleThicknessChange = (value) => {
        let thickness = checkForNull(Number(value?.target?.value))
        if (Number(getValues('outerDiameter')) > thickness) {
            delete errors.outerDiameter
        }
    }
    const getTabno = (layout) => {
        switch (layout) {
            case 'Traub':
                return '1'
            case 'Bar':
                return '2'
            default:
                break;
        }
    }
    const [activeTab, setActiveTab] = useState(rmRowData && rmRowData.WeightCalculatorRequest && rmRowData.WeightCalculatorRequest.WeightCalculationId === null ? '1' : rmRowData.WeightCalculatorRequest.LayoutType ? getTabno(rmRowData.WeightCalculatorRequest.LayoutType) : '1')
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab)
        }
    }
    const toggleDrawer = (event, weightData = {}, originalWeight = {}) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return
        }

        props.toggleDrawer('', weightData, originalWeight)
    }

    return (
        <Fragment>
            <Row>
                <Col>
                    <Nav tabs className="subtabs cr-subtabs-head ">
                        {rmRowData && rmRowData.UOM === 'Meter' && <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '1' })}
                                onClick={() => {
                                    toggle('1')
                                }}
                                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '1' ? true : false}
                            >
                                Input Weight Calculator
                            </NavLink>
                        </NavItem>}
                        <NavItem>
                            <NavLink
                                className={classnames({ active: activeTab === '2' })}
                                onClick={() => {
                                    toggle('2')
                                }}
                                disabled={rmRowData && Object.keys(rmRowData.WeightCalculatorRequest).length === 0 ? false : rmRowData.WeightCalculatorRequest.LayoutType !== null && getTabno(rmRowData.WeightCalculatorRequest.LayoutType) !== '2' ? true : false}
                            >
                                Bar
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={activeTab}>
                        {activeTab === '1' && rmRowData && rmRowData.UOM === 'Meter' && (
                            <TabPane tabId="1">
                                <form noValidate className="form"
                                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                                    <Col md="12">
                                        <div className="costing-border px-4">
                                            <Row>
                                                <Col md="12" className={'mt25'}>
                                                    <div className="header-title">
                                                        <h5>{'Input Weight Calculator:'}</h5>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className={''}>
                                                <Col md="3" >
                                                    <TextFieldHookForm
                                                        label={`Outer Diameter (mm)`}
                                                        name={'outerDiameter'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{
                                                            required: true,
                                                            validate: { number, positiveAndDecimalNumber, decimalNumberLimit },
                                                            min: {
                                                                value: getValues('thickness'),
                                                                message: 'Outer diameter should not be  less than thickness.'
                                                            }
                                                        }}
                                                        handleChange={handleOuterDiameterChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.outerDiameter}
                                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        label={`Thickness (mm)`}
                                                        name={'thickness'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            validate: { number, positiveAndDecimalNumber, decimalNumberLimit },
                                                            max: {
                                                                value: getValues('outerDiameter'),
                                                                message: 'Thickness should not be greater than outer diameter.'
                                                            },
                                                        }}
                                                        handleChange={handleThicknessChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.thickness}
                                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} tooltipClass='inner-diameter' id={'inner-diameter'} tooltipText="Inner Diameter = Outer Diameter - (2 * Thickness)" />
                                                    <TextFieldHookForm
                                                        label={`Inner Diameter(mm)`}
                                                        name={'InnerDiameter'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        id={'inner-diameter'}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.InnerDiameter}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        label={`Net Length (mm)`}
                                                        name={'netLength'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            validate: { number, positiveAndDecimalNumber, decimalNumberLimit },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.netLength}
                                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                                    />
                                                </Col>
                                            </Row>
                                            <Row className={'mt25'}>
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        label={`Parting Margin (mm)`}
                                                        name={'partingMargin'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                            validate: { number, positiveAndDecimalNumber, decimalNumberLimit },
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.partingMargin}
                                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                                    />
                                                </Col>
                                                <Col md="3" >
                                                    <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'gross-length-machining'} tooltipText={'Gross Length (mm) = (Net Length (mm) + Parting Margin (mm))'} />
                                                    <TextFieldHookForm
                                                        label={`Gross Length (mm)`}
                                                        name={'grossLength'}
                                                        id={'gross-length-machining'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.grossLength}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3" >
                                                    <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'piece-per-meter-length'} tooltipText={'Pc/meter = (1000/Gross Length (mm))'} />
                                                    <TextFieldHookForm
                                                        label={`Pc/meter`}
                                                        name={'piecePerMeter'}
                                                        id={'piece-per-meter-length'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.grossLength}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3" >
                                                    <TextFieldHookForm
                                                        label={`RM Rate (${sourceCurrencyFormatter(currencySource?.label)})`}
                                                        name={'rmRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={rmRowData.RMRate}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.rmRate}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} id={'rm-per-piece'} tooltipText={`RM/Pc = RM Rate (${sourceCurrencyFormatter(currencySource?.label)})/(Pc/meter)`} />
                                                    <TextFieldHookForm
                                                        label={`RM/Pc`}
                                                        name={'rmPerPiece'}
                                                        Controller={Controller}
                                                        control={control}
                                                        id={'rm-per-piece'}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.rmPerPiece}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} id={'gross-weight'} tooltipText={tooltipMessageForSheetWeight('Gross', 'Gross')} />
                                                    <TextFieldHookForm
                                                        label={`Gross Weight(Kg)`}
                                                        name={'GrossWeight'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        id={'gross-weight'}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.GrossWeight}
                                                        disabled={true}
                                                    />
                                                </Col >
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} id={'finish-weight'} tooltipText={tooltipMessageForSheetWeight('Finish', 'Net')} />
                                                    <TextFieldHookForm
                                                        label={`${finishWeightLabel} Weight(Kg)`}
                                                        name={'FinishWeight'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        id={'finish-weight'}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.FinishWeight}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} id={'Scrap-weight'} tooltipText={`Scrap Weight =  Gross Weight - ${finishWeightLabel} Weight`} />
                                                    <TextFieldHookForm
                                                        label={`Scrap Weight(Kg)`}
                                                        name={'ScrapWeight'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        id={'Scrap-weight'}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.ScrapWeight}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TextFieldHookForm
                                                        label={`Scrap Rate (${sourceCurrencyFormatter(currencySource?.label)}/Kg)`}
                                                        name={'ScrapRate'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={props.rmRowData.ScrapRatePerScrapUOMConversion ?? props.rmRowData.ScrapRatePerScrapUOM}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.ScrapRate}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} id={'Scrap-Cost'} tooltipText={"Scrap Cost =  Scrap Weight * Scrap Rate"} />
                                                    <TextFieldHookForm
                                                        label={`Scrap Cost (${sourceCurrencyFormatter(currencySource?.label)})`}
                                                        name={'ScrapCost'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        id={'Scrap-Cost'}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.ScrapCost}
                                                        disabled={true}
                                                    />
                                                </Col>
                                                <Col md="3">
                                                    <TooltipCustom disabledIcon={true} id={'net-rm-cost'} tooltipText={'Net RM Cost = RM/Pc - ScrapCost'} />
                                                    <TextFieldHookForm
                                                        label={`Net RM Cost`}
                                                        name={'netRm'}
                                                        Controller={Controller}
                                                        control={control}
                                                        id={'net-rm-cost'}
                                                        register={register}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.netRm}
                                                        disabled={true}
                                                    />
                                                </Col>
                                            </Row >

                                        </div >
                                    </Col >

                                    {!CostingViewMode && <div className="col-sm-12 text-right mt-4">
                                        <button
                                            type={'button'}
                                            className="reset mr15 cancel-btn"
                                            onClick={cancel} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onSubmit}
                                            disabled={props.CostingViewMode ? true : false}
                                            className="submit-button save-btn">
                                            <div className={'save-icon'}></div>
                                            {'Save'}
                                        </button>
                                    </div>
                                    }
                                </form >
                            </TabPane>
                        )}
                        {activeTab === '2' && (
                            <TabPane tabId="2">
                                <Bar rmRowData={props.rmRowData} isEditFlag={props.isEditFlag} toggleDrawer={toggleDrawer} item={props.item} CostingViewMode={props.CostingViewMode} />
                            </TabPane>
                        )}
                    </TabContent>
                </Col>
            </Row >
        </Fragment >
    )
}

export default Machining
