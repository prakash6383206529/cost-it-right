import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Table, } from 'reactstrap'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { number, checkWhiteSpaces, maxLength7, checkForNull, checkForDecimalAndNull, loggedInUserId, percentageLimitValidation, maxLength200, nonZero, maxPercentageValue } from '../../../../../helper'
import Button from '../../../../layout/Button'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import Toaster from '../../../../common/Toaster'
import { useDispatch, useSelector } from 'react-redux'
import HeaderTitle from '../../../../common/HeaderTitle'
import TooltipCustom from '../../../../common/Tooltip'
import { debounce } from 'lodash'
import { saveRawMaterialCalculationForMonoCartonCorrugatedBox } from '../../../actions/CostWorking'
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper'
const tableheaders = ['Paper Layer', 'Type of Paper (Raw Material)', 'RM Rate', 'GSM', 'Flute %', 'Flute Value',]
function PaperCorrugatedBox(props) {

    const { rmRowData, rmData, item } = props
    const [state, setState] = useState({
        tableData: [],
        totalGSM: 0,
        showPopup: false
    })
    const [calculationState, setCalculationState] = useState({
        SheetDeclePerInch: 0,
        SheetCutPerInch: 0,
        Area: 0,
        Wastage: 0,
        TotalArea: 0,
        Weight: 0,
        BoardCost: 0,
        RMCost: 0
    })
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const { NoOfDecimalForPrice } = useSelector((state) => state.auth.initialConfiguration)
    const dispatch = useDispatch()
    const {
        register: registerTableForm,
        handleSubmit: handleSubmitTableForm,
        control: controlTableForm,
        setValue: setValueTableForm,
        getValues: getValuesTableForm,
        formState: { errors: errorsTableForm },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const {
        register: registerCalculatorForm,
        handleSubmit: handleSubmitCalculatorForm,
        control: controlCalculatorForm,
        setValue: setValueCalculatorForm,
        getValues: getValuesCalculatorForm,
        formState: { errors: errorsCalculatorForm },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const areaCalclulationFieldValues = useWatch({
        control: controlCalculatorForm, // Pass controlCalculatorForm here
        name: ['SheetDecle', 'SheetCut'],
    });
    const watchFields = (data) => {
        let tempGSM = [];
        let tempFlute = [];
        for (let i = 0; i < data.length; i++) {
            tempGSM.push(`GSM${data[i].value}`)
            if (i % 2 !== 0) {
                tempFlute.push(`fluteValue${data[i].value}`)
            }
        }
        return [...tempGSM, ...tempFlute]
    }
    const tableInputsValues = useWatch({
        control: controlTableForm,
        name: watchFields(state.tableData),
    });
    const areaCalculateWatch = useWatch({
        control: controlCalculatorForm,
        name: ['TotalArea'],
    })


    useEffect(() => {
        if (rmRowData && rmRowData?.WeightCalculatorRequest && rmRowData?.WeightCalculatorRequest?.CorrugatedAndMonoCartonBoxWeightCalculatorId) {
            const { WeightCalculatorRequest } = rmRowData
            boxDetailsInputFields.map((item) => {
                setValueCalculatorForm(item.name, checkForDecimalAndNull(WeightCalculatorRequest[item.name], NoOfDecimalForPrice))
            })

            let tableDataTemp = []
            WeightCalculatorRequest?.CostingCorrugatedAndMonoCartonBoxAdditionalRawMaterial?.length !== 0 && WeightCalculatorRequest?.CostingCorrugatedAndMonoCartonBoxAdditionalRawMaterial?.map(item => {
                setValueTableForm(`GSM${item.RawMaterialIdRef}`, checkForDecimalAndNull(item.GSM, NoOfDecimalForPrice))
                setValueCalculatorForm(`flutePercentage${item.RawMaterialIdRef}`, checkForDecimalAndNull(item.FlutePercentage, NoOfDecimalForPrice))
                setValueTableForm(`fluteValue${item.RawMaterialIdRef}`, checkForDecimalAndNull(item.FluteValue, NoOfDecimalForPrice))
                tableDataTemp.push({ label: item.RawMaterialNameAndGrade, value: item.RawMaterialIdRef, RawMaterialRate: item.RawMaterialRate })
            })
            setValueCalculatorForm('NosOfPly', WeightCalculatorRequest.NosOfPly)
            setValueCalculatorForm('TypeOfBox', WeightCalculatorRequest.TypeOfBox)
            setValueTableForm('RawMaterial', tableDataTemp)
            setState((prevState) => ({
                ...prevState, totalGSM: WeightCalculatorRequest.TotalGsmAndFluteValue, tableData: tableDataTemp
            }))
            setCalculationState(prevState => ({
                ...prevState,
                SheetDeclePerInch: WeightCalculatorRequest.SheetDeclePerInch,
                SheetCutPerInch: WeightCalculatorRequest.SheetCutPerInch,
                Area: WeightCalculatorRequest.Area,
                Wastage: WeightCalculatorRequest.Wastage,
                TotalArea: WeightCalculatorRequest.TotalArea,
                Weight: WeightCalculatorRequest.Weight,
                BoardCost: WeightCalculatorRequest.BoardCost,
                RMCost: WeightCalculatorRequest.RMCost
            }));
        }
        if (!props.CostingViewMode) {
            setValueCalculatorForm('NosOfPly', props?.rmData?.length)
        }
    }, [])
    useEffect(() => {
        calculateGSM()
        calculateWeightAndBoardCost()
    }, [tableInputsValues, areaCalculateWatch, state.tableData, state.totalGSM])

    useEffect(() => {
        calculateCalulatorValue()
    }, [areaCalclulationFieldValues])

    const calculateWeightAndBoardCost = () => {
        let calculation = state.totalGSM * calculationState.TotalArea / 1000


        setValueCalculatorForm('Weight', checkForDecimalAndNull(calculation, NoOfDecimalForPrice))
        setCalculationState((prevState) => ({ ...prevState, Weight: calculation }))
    }
    const renderListing = (label) => {
        let temp = []
        switch (label) {
            case 'RawMaterial':
                rmData && rmData.map((item) => {
                    temp.push({ label: item.RMName, value: item.RawMaterialId, RawMaterialRate: item.RMRate })
                    return null
                })
                return temp;

            default:
                return temp;
        }
    }

    const addDataOnTable = (data) => {
        const getNoofPly = checkForNull(getValuesCalculatorForm('NosOfPly'))
        if (getNoofPly !== data.RawMaterial.length) {
            Toaster.warning('Number of RM should be equal to nos of ply')
            return false;
        }
        setState((prevState) => ({ ...prevState, tableData: data.RawMaterial }))
    }
    const calculateFluteValue = (index, gsmVal, flutePer) => {
        const calculation = gsmVal * flutePer / 100
        setValueTableForm(`fluteValue${index}`, checkForDecimalAndNull(calculation, NoOfDecimalForPrice))
    }
    const calculateGSM = () => {
        let totalGSM = 0;
        let BoardCost = 0

        for (let i = 0; i < state.tableData.length; i++) {
            const singleGSMValue = checkForNull(getValuesTableForm(`GSM${state.tableData[i].value}`));
            const singleFluteValue = checkForNull(getValuesTableForm(`fluteValue${state.tableData[i].value}`));
            totalGSM += singleGSMValue + singleFluteValue;
            let singleGSM = singleGSMValue + singleFluteValue;
            BoardCost += ((singleGSM * checkForNull(state.tableData[i].RawMaterialRate)) / 1000)
            // totalGSM += checkForNull(getValuesTableForm(`GSM${state.tableData[i].value}`)) + checkForNull(getValuesTableForm(`fluteValue${state.tableData[i].value}`))
        }
        setValueCalculatorForm('BoardCost', checkForDecimalAndNull(BoardCost, NoOfDecimalForPrice))
        setValueCalculatorForm('RMCost', checkForDecimalAndNull(BoardCost * calculationState.TotalArea, NoOfDecimalForPrice))
        setState((prevState) => ({ ...prevState, totalGSM }))
        setCalculationState((prevState) => ({ ...prevState, BoardCost: BoardCost, RMCost: BoardCost * calculationState.TotalArea }))
    }
    const sheetDecleHandle = (inputName, value) => {
        setValueCalculatorForm(inputName, checkForDecimalAndNull(value / 25.4, NoOfDecimalForPrice))
        setCalculationState((prevState) => ({ ...prevState, [inputName]: value / 25.4 }))
    }
    const calculateWatagePercent = (value) => {
        let Wastage = value * checkForNull(calculationState.Area) / 100
        setValueCalculatorForm('Wastage', checkForDecimalAndNull(Wastage, NoOfDecimalForPrice))
        const TotalArea = Wastage + checkForNull(calculationState.Area)
        setValueCalculatorForm('TotalArea', checkForDecimalAndNull(TotalArea, NoOfDecimalForPrice))
        setValueCalculatorForm('RMCost', checkForDecimalAndNull(calculationState.BoardCost * TotalArea, NoOfDecimalForPrice))
        setCalculationState((prevState) => ({ ...prevState, Wastage: Wastage, TotalArea: TotalArea, RMCost: calculationState.BoardCost * TotalArea }))
    }

    const boxDetailsInputFields = [
        { label: 'Length (Box)(mm)', name: 'BoxLength', mandatory: true, searchable: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Width (Box)(mm)', name: 'BoxWidth', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Height (Box)(mm)', name: 'BoxHeight', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Sheet Decle (mm)', name: 'SheetDecle', mandatory: true, handleChange: (e) => { sheetDecleHandle('SheetDeclePerInch', e.target.value) }, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Sheet Cut (mm)', name: 'SheetCut', mandatory: true, handleChange: (e) => { sheetDecleHandle('SheetCutPerInch', e.target.value) }, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Sheet Decle (inch)', name: 'SheetDeclePerInch', disabled: true, tooltip: { text: 'Sheet Decle (mm) / 25.4' } },
        { label: 'Sheet Cut (inch)', name: 'SheetCutPerInch', disabled: true, tooltip: { text: 'Sheet Cut (mm) / 25.4' } },
        { label: 'Area (Sq. Mt)', name: 'Area', disabled: true, tooltip: { text: 'Sheet Decle (mm) * Sheet Cut (mm) / 1000000', width: '250px' } },
        { label: 'Wastage %', name: 'WastagePercentage', mandatory: true, percentageLimit: true, handleChange: (e) => { calculateWatagePercent(e.target.value) }, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Wastage (Sq. Mt)', name: 'Wastage', disabled: true, tooltip: { text: 'Area (Sq. Mt) * Wastage / 100', width: '250px' } },
        { label: 'Total Area (Sq. Mt)', name: 'TotalArea', disabled: true, tooltip: { text: 'Area (Sq. Mt) + Wastage (Sq. Mt)', width: '250px' } },
        { label: 'Weight (Kg)', name: 'Weight', disabled: true, tooltip: { text: 'Total Area (Sq. Mt) * Total GSM of Board (Including Flute) / 1000', width: '320px' } },
        { label: 'Board Cost', name: 'BoardCost', disabled: true, tooltip: { text: '(Layer 1 GSM * RM Rate) / 1000 + ((Layer 2 GSM +Flute) * RM Rate) / 1000 ...', width: '350px' } },
        { label: 'RM Cost', name: 'RMCost', disabled: true, tooltip: { text: 'Board Cost * Total Area (Sq. Mt)' } },
    ]
    const calculateCalulatorValue = () => {
        const calculation = (checkForNull(getValuesCalculatorForm('SheetDecle')) * checkForNull(getValuesCalculatorForm('SheetCut'))) / 1000000
        setValueCalculatorForm('Area', checkForDecimalAndNull(calculation, NoOfDecimalForPrice))
        setCalculationState((prevState) => ({ ...prevState, Area: calculation }))
    }
    const onSubmit = (value) => {
        if (getValuesCalculatorForm('RMCost') === 0 || getValuesCalculatorForm('RMCost') === undefined || getValuesCalculatorForm('RMCost') === null) {
            Toaster.warning("Please add the Type of Paper (Raw Material) detail to save the data")
            return false
        }
        const RMgsmAndFluteValue = [];
        state.tableData !== 0 && state.tableData.map((item, index) => {
            RMgsmAndFluteValue.push({
                "CorrugatedAndMonoCartonBoxAdditionalDetailId": 0,
                "CostingRawMaterialCorrugatedAndMonoCartonBoxCalculationDetailIdRef": 0,
                "RawMaterialIdRef": item.value,
                "LayerNo": index + 1,
                "GSM": getValuesTableForm(`GSM${item.value}`) ?? 0,
                "FlutePercentage": getValuesCalculatorForm(`flutePercentage${item.value}`) ?? 0,
                "FluteValue": getValuesTableForm(`fluteValue${item.value}`) ?? 0
            })
            return null;
        })
        let formData = {
            "CorrugatedAndMonoCartonBoxWeightCalculatorId": 0,
            "BaseCostingIdRef": item.CostingId,
            "CostingRawMaterialDetailsIdRef": rmRowData.RawMaterialDetailId,
            "LoggedInUserId": loggedInUserId(),
            "NosOfPly": value.NosOfPly,
            "TypeOfBox": value.TypeOfBox,
            "BoxLength": value.BoxLength,
            "BoxWidth": value.BoxWidth,
            "BoxHeight": value.BoxHeight,
            "SheetDecle": value.SheetDecle,
            "SheetCut": value.SheetCut,
            "SheetDeclePerInch": calculationState.SheetDeclePerInch,
            "SheetCutPerInch": calculationState.SheetCutPerInch,
            "Area": calculationState.Area,
            "WastagePercentage": value.WastagePercentage,
            "Wastage": calculationState.Wastage,
            "TotalArea": calculationState.TotalArea,
            "Weight": calculationState.Weight,
            "BoardCost": calculationState.BoardCost,
            "RMCost": calculationState.RMCost,
            "TotalGsmAndFluteValue": state.totalGSM,
            "CostingCorrugatedAndMonoCartonBoxAdditionalRawMaterial": RMgsmAndFluteValue
        }
        dispatch(saveRawMaterialCalculationForMonoCartonCorrugatedBox(formData, (res) => {
            if (res?.data?.Result) {
                formData.WeightCalculationId = res.data.Identity
                formData.CalculatorType = 'CorrugatedAndMonoCartonBox'
                formData.RawMaterialCost = calculationState.RMCost
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', formData)
            }
        }))
    }
    const cancelHandler = () => {
        props.toggleDrawer((rmRowData && rmRowData?.WeightCalculatorRequest && rmRowData?.WeightCalculatorRequest?.CorrugatedAndMonoCartonBoxWeightCalculatorId) ? 'CorrugatedAndMonoCartonBox' : '')
    }
    const resetTable = () => {
        state.tableData.length !== 0 && state.tableData.map((item, index) => {
            setValueTableForm(`GSM${item.value}`, '')
            if (index % 2 !== 0) {
                setValueCalculatorForm(`flutePercentage${item.value}`, '')
                setValueTableForm(`fluteValue${item.value}`, '')
            }
        })
    }
    const resetData = () => {

        if (getValuesCalculatorForm('RMCost') === 0 || getValuesCalculatorForm('RMCost') === undefined || getValuesCalculatorForm('RMCost') === null) {
            setState((prevState) => ({ ...prevState, tableData: [] }))
            resetTable()
            return false
        } else {
            setState((prevState) => ({ ...prevState, showPopup: true }))
        }
    }

    const onPopupConfirm = () => {
        setState((prevState) => ({ ...prevState, tableData: [], showPopup: false }))
        resetTable()
    }
    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }))
    }
    return (
        <Fragment>
            <Row className={'mt-3'}>
                <form onSubmit={handleSubmitTableForm(addDataOnTable)}>
                    <Row>
                        <Col md="2">
                            <TextFieldHookForm
                                label={`Nos of Ply`}
                                name={'NosOfPly'}
                                Controller={Controller}
                                control={controlCalculatorForm}
                                register={registerCalculatorForm}
                                mandatory={true}
                                rules={{
                                    required: true,
                                    validate: { number, checkWhiteSpaces, maxLength7, nonZero },
                                }}
                                handleChange={() => { }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errorsCalculatorForm.NosOfPly}
                                disabled={props.CostingViewMode ? props.CostingViewMode : state.tableData.length !== 0 ? true : false}
                            />
                        </Col>
                        <Col md="3">

                            <TextFieldHookForm
                                label={`Type of Box`}
                                name={'TypeOfBox'}
                                Controller={Controller}
                                control={controlCalculatorForm}
                                register={registerCalculatorForm}
                                mandatory={true}
                                rules={{
                                    required: true,
                                    validate: { checkWhiteSpaces, maxLength200 },
                                }}
                                handleChange={() => { }}
                                defaultValue={''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errorsCalculatorForm.TypeOfBox}
                                disabled={props.CostingViewMode ? props.CostingViewMode : state.tableData.length !== 0 ? true : false}
                            />
                        </Col>
                        <Col md="7">
                            <Row className={"align-items-center"}>
                                <Col md="7">
                                    <TooltipCustom id="typeOfBox" tooltipText="Please add RM in sequence to the Flute." />
                                    {state.tableData.length !== 0 && <TooltipCustom tooltipClass="show-multi-dropdown-data" id="RawMaterial" placement="bottom" tooltipText={state.tableData.map((item, index) => <p>{index + 1}. {item.label
                                    }</p>)} />}
                                    <SearchableSelectHookForm
                                        label={"Type of Paper (Raw Material)"}
                                        name={"RawMaterial"}
                                        tooltipId={"RawMaterial"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={controlTableForm}
                                        rules={{ required: true }}
                                        register={registerTableForm}
                                        defaultValue={""}
                                        options={renderListing('RawMaterial')}
                                        mandatory={true}
                                        isMulti={true}
                                        errors={errorsTableForm.RawMaterial}
                                        disabled={props?.CostingViewMode ? props?.CostingViewMode : state.tableData.length !== 0 ? true : false}
                                        handleChange={() => { }}
                                    />
                                </Col>
                                <Col md="5">
                                    <div className='d-flex'>
                                        {/* <Button
                                            id="PaperCorrugatedBox_cancel"
                                            className="mr-2 mt-0"
                                            variant={"cancel-btn"}
                                            // disabled={setDisable}
                                            // onClick={this.cancelHandler}
                                            icon={""}
                                            buttonName={"Reset"}
                                        /> */}
                                        <Button
                                            id="PaperCorrugatedBox_save"
                                            type="submit"
                                            className="mr5 mb-2"
                                            icon={"plus"}
                                            disabled={props.CostingViewMode ? props.CostingViewMode : state.tableData.length !== 0 ? true : false}
                                            buttonName={"Add"}
                                        />
                                    </div></Col>
                            </Row>
                        </Col>

                    </Row>
                </form>
                <Col md="12 text-right">
                    <Button
                        id="PaperCorrugatedBox_cancel"
                        className="mt-0"
                        variant={"cancel-btn"}
                        disabled={props?.CostingViewMode ? props?.CostingViewMode : false}
                        onClick={resetData}
                        icon={""}
                        buttonName={"Reset Table"}
                    />
                </Col>
                <Col md="12">
                    <Table responsive bordered className={'table-with-input-data'}>
                        <thead>
                            <tr>
                                {tableheaders.map((item, index) => {
                                    return <th key={index}>{item}</th>
                                })}
                            </tr>
                        </thead>
                        <tbody>

                            {state.tableData.length !== 0 ? <>
                                {state.tableData.map((item, index) => <tr key={item.RawMaterialId}>
                                    <td>{index + 1}</td>
                                    <td>{item.label}</td>
                                    <td>{item.RawMaterialRate}</td>
                                    <td> <TextFieldHookForm
                                        label={false}
                                        name={`GSM${item.value}`}
                                        Controller={Controller}
                                        control={controlTableForm}
                                        register={registerTableForm}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, maxLength7 },
                                        }}
                                        handleChange={(e) => { calculateFluteValue(item.value, e.target.value, checkForNull(getValuesCalculatorForm(`flutePercentage${item.value}`))) }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder mb-0'}
                                        errors={errorsTableForm[`GSM${item.value}`]}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    /></td>
                                    <td>{index % 2 !== 0 ? <TextFieldHookForm
                                        label={false}
                                        name={`flutePercentage${item.value}`}
                                        Controller={Controller}
                                        control={controlCalculatorForm}
                                        register={registerCalculatorForm}
                                        mandatory={false}
                                        rules={{
                                            required: !(props.CostingViewMode ? props.CostingViewMode : !getValuesTableForm(`GSM${item.value}`)),
                                            validate: { number, checkWhiteSpaces, maxPercentageValue, maxLength7 },
                                            max: {
                                                value: 100,
                                                message: 'Percentage value should be equal to 100'
                                            },
                                        }}
                                        handleChange={(e) => { calculateFluteValue(item.value, checkForNull(getValuesTableForm(`GSM${item.value}`)), e.target.value) }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder mb-0 paper-corrugated-box-flute'}
                                        errors={errorsCalculatorForm[`flutePercentage${item.value}`]}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : !getValuesTableForm(`GSM${item.value}`)}
                                    /> : '-'}</td>
                                    <td>{index % 2 !== 0 ? <>
                                        <TooltipCustom id={`fluteValue${item.value}`} disabledIcon={true} tooltipText={`Flute Value = GSM * Flute Percentage / 100`} />
                                        <TextFieldHookForm
                                            label={false}
                                            name={`fluteValue${item.value}`}
                                            id={`fluteValue${item.value}`}
                                            Controller={Controller}
                                            control={controlTableForm}
                                            register={registerTableForm}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, maxLength7 },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={0}
                                            className=""
                                            customClassName={'withBorder mb-0'}
                                            errors={errorsTableForm.fluteValue}
                                            disabled={true}
                                        /></> : '-'}</td>
                                    {/* <td>
                                        <button
                                            className="Edit mr-2"
                                            type={'button'}
                                            title='Edit'
                                            disabled={props.CostingViewMode}
                                            onClick={() => editRow(index)}
                                        />
                                    </td> */}
                                </tr>
                                )}

                            </>
                                : <tr>
                                    <td colSpan={tableheaders.length}><NoContentFound title={EMPTY_DATA} /></td>
                                </tr>}
                            <tr className='table-footer'>
                                <td colSpan={tableheaders.length - 1} className='text-right'>
                                    Total GSM of Board (Including Flute):
                                </td>
                                <td colSpan={tableheaders.length - (tableheaders.length + 1)}>
                                    <TooltipCustom id="totalGSM" disabledIcon={true} tooltipText={`Layer 1 GSM + (Layer 2 GSM +Flute)+Layer 3 GSM...`} /> <div className='w-fit' id="totalGSM">{checkForDecimalAndNull(state.totalGSM, NoOfDecimalForPrice)}</div>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <HeaderTitle
                        title={'Box Details:'} />
                </Col>
                <form onSubmit={handleSubmitCalculatorForm(onSubmit)}>
                    <Row>
                        {boxDetailsInputFields.map(item => {
                            const { tooltip, name, label } = item ?? {};
                            return <Col md="3">
                                {item.tooltip && <TooltipCustom width={tooltip.width} tooltipClass={tooltip.className ?? ''} disabledIcon={true} id={item.name} tooltipText={`${item.label} = ${tooltip.text ?? ''}`} />}
                                <TextFieldHookForm
                                    label={label}
                                    id={name}
                                    name={name}
                                    Controller={Controller}
                                    control={controlCalculatorForm}
                                    register={registerCalculatorForm}
                                    mandatory={item.mandatory}
                                    rules={{
                                        required: item.mandatory,
                                        validate: { number, checkWhiteSpaces, maxLength7, ...(item.disabled ? {} : { nonZero }) },
                                        max: item.percentageLimit ? {
                                            value: 100,
                                            message: 'Percentage value should be equal to 100'
                                        } : {},
                                    }}
                                    handleChange={item.handleChange ? item.handleChange : () => { }}
                                    defaultValue={item.disabled ? 0 : ''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errorsCalculatorForm[name]}
                                    disabled={item.disabled} />
                            </Col>
                        })}
                    </Row>
                    {!props.CostingViewMode && <Row className={"sticky-footer"}>
                        <Col md="12" className={"text-right bluefooter-butn d-flex align-items-center justify-content-end"}>
                            <Button
                                id="paperCorrugatedBox_cancel"
                                className="mr-2"
                                variant={"cancel-btn"}
                                disabled={false}
                                onClick={cancelHandler}
                                icon={"cancel-icon"}
                                buttonName={"Cancel"} />
                            <Button
                                id="paperCorrugatedBox_submit"
                                type="submit"
                                disabled={props.CostingViewMode}
                                icon={"save-icon"}
                                buttonName={"Save"} />
                        </Col>
                    </Row>}
                </form>
            </Row>
            {
                state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`RM Cost will get reset. Do you want to continue?`} />
            }
        </Fragment >
    )
}
export default PaperCorrugatedBox