import React, { useState, useEffect, Fragment } from 'react'
import { Col, Row, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper'
import LossStandardTable from './LossStandardTable'
import { saveRawMaterialCalculationForFerrous } from '../../actions/CostWorking'
import Toaster from '../../../common/Toaster'
import { debounce } from 'lodash'
import TooltipCustom from '../../../common/Tooltip'
import { number, percentageLimitValidation, checkWhiteSpaces, decimalAndNumberValidation } from "../../../../helper/validation";

function Ferrous(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const dispatch = useDispatch()
    const { ferrousCalculatorReset } = useSelector(state => state.costing)

    const defaultValues = {
        castingWeight: WeightCalculatorRequest && WeightCalculatorRequest.CastingWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CastingWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        recovery: WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        NetRMRate: WeightCalculatorRequest && WeightCalculatorRequest.NetRMRate !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetRMRate, getConfigurationKey().NoOfDecimalForPrice) : '',
        NetScrapRate: WeightCalculatorRequest && WeightCalculatorRequest.NetScrapRate !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetScrapRate, getConfigurationKey().NoOfDecimalForPrice) : '',
        scrapCost: WeightCalculatorRequest && checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        NetRMCost: WeightCalculatorRequest && checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    }
    const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
    const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
    const [dataToSend, setDataToSend] = useState(WeightCalculatorRequest)
    const [reRender, setRerender] = useState(false)
    const [percentage, setPercentage] = useState(0)
    const [inputFinishWeight, setInputFinishWeight] = useState(0)
    const { rmRowData, rmData, CostingViewMode, item } = props

    const rmGridFields = 'rmGridFields';

    const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })
    useEffect(() => {
        const castingWeight = checkForNull(getValues("castingWeight"))
        if (inputFinishWeight > castingWeight) {
            Toaster.warning('Finish Weight should not be greater than casting weight')
            setValue('finishedWeight', '')
        }
    }, [inputFinishWeight])
    useEffect(() => {
        if (ferrousCalculatorReset === true) {
            reset({
                castingWeight: '',
                recovery: '',
                grossWeight: '',
                finishedWeight: '',
                scrapWeight: '',
                NetRMRate: '',
                NetScrapRate: '',
                scrapCost: '',
                NetRMCost: '',

            })
            WeightCalculatorRequest.CostingFerrousCalculationRawMaterials && WeightCalculatorRequest.CostingFerrousCalculationRawMaterials.map((item, index) => (
                setValue(`${rmGridFields}.${index}.Percentage`, '')
            ))
            setTableVal([])
        }
    }, [ferrousCalculatorReset])

    const fieldValues = useWatch({
        control,
        name: ['finishedWeight', 'recovery', 'castingWeight', 'Percentage'],
    })

    const tableData = (value = []) => {

        setTableVal(value)
    }
    const dropDown = [

        {
            label: 'Melting Loss',
            value: 5,
        },
        {
            label: 'Fetling Loss',
            value: 6,
        },
        {
            label: 'Grinding Loss',
            value: 7,
        },
        {
            label: 'Rejection Allowance',
            value: 4,
        },
    ]

    useEffect(() => {
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest)?.length > 0 && WeightCalculatorRequest?.CostingFerrousCalculationRawMaterials?.length > 0) {
            WeightCalculatorRequest.CostingFerrousCalculationRawMaterials && WeightCalculatorRequest.CostingFerrousCalculationRawMaterials.map((item, index) => (
                setValue(`${rmGridFields}.${index}.Percentage`, checkForDecimalAndNull(item.Percentage, getConfigurationKey().NoOfDecimalForInputOutput))
            ))
        }
    }, [WeightCalculatorRequest])

    useEffect(() => {
        if (!CostingViewMode) {
            calculateRemainingCalculation(lostWeight)
        }
    }, [fieldValues])

    const totalPercentageValue = () => {
        let sum = 0
        rmData && rmData.map((item, index) => {
            sum = sum + checkForNull(getValues(`rmGridFields.${index}.Percentage`))
            return null
        })
        setPercentage(sum)
        return checkForDecimalAndNull(sum, getConfigurationKey().NoOfDecimalForInputOutput);
    }

    const percentageChange = (e) => {
        setTimeout(() => {
            if (totalPercentageValue() > 100) {
                Toaster.warning(`Total percentage is ${percentage}%, must be 100% to save the values`)
                return false
            }
            calculateNetSCrapRate()
            calculateNetRmRate()
        }, 300);
    }
    const calculateNetRmRate = () => {

        let NetRMRate = 0;
        NetRMRate = rmData && rmData.reduce((acc, val, index) => {
            const Percentage = getValues(`${rmGridFields}.${index}.Percentage`)
            return acc + checkForNull(Percentage * val.RMRate / 100)

        }, 0)
        let obj = dataToSend
        obj.NetRMRate = NetRMRate
        setDataToSend(obj)
        setValue('NetRMRate', checkForDecimalAndNull(NetRMRate, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const calculateNetSCrapRate = () => {
        let NetScrapRate = 0;
        NetScrapRate = rmData && rmData.reduce((acc, val, index) => {
            const Percentage = getValues(`${rmGridFields}.${index}.Percentage`)
            return acc + checkForNull(Percentage * val.ScrapRate / 100)

        }, 0)
        let obj = dataToSend
        obj.NetScrapRate = NetScrapRate
        setDataToSend(obj)
        setValue('NetScrapRate', checkForDecimalAndNull(NetScrapRate, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const calculateRemainingCalculation = (lostSum = 0) => {
        let scrapWeight = 0
        const castingWeight = checkForNull(getValues("castingWeight"))
        const grossWeight = checkForNull(castingWeight) + lostSum
        const finishedWeight = checkForNull(getValues('finishedWeight'))
        const NetRMRate = checkForNull(dataToSend.NetRMRate)
        const NetScrapRate = checkForNull(dataToSend.NetScrapRate)
        if (finishedWeight !== 0) {
            scrapWeight = checkForNull(castingWeight) - checkForNull(finishedWeight) //FINAL Casting Weight - FINISHED WEIGHT
        }
        const recovery = checkForNull(getValues('recovery'))
        const scrapCost = checkForNull(scrapWeight * NetScrapRate * recovery / 100)
        const NetRMCost = (checkForNull(grossWeight) * checkForNull(NetRMRate)) - checkForNull(scrapCost)
        const updatedValue = dataToSend
        updatedValue.totalGrossWeight = grossWeight
        updatedValue.scrapWeight = scrapWeight
        updatedValue.scrapCost = scrapCost
        updatedValue.NetRMCost = NetRMCost

        setDataToSend(updatedValue)

        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('scrapCost', checkForDecimalAndNull(scrapCost ?? scrapCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('NetRMCost', checkForDecimalAndNull(NetRMCost ?? NetRMCost, getConfigurationKey().NoOfDecimalForPrice))
        setLostWeight(lostSum)
    }

    const calcForOutside = () => {
        let temp = [...rmData]
        temp && temp.map((item, index) => {
            item.GrossWeight = calculatePercentageValue(dataToSend?.totalGrossWeight, getValues(`rmGridFields.${index}.Percentage`))
            item.ScrapWeight = calculatePercentageValue(dataToSend?.scrapCost, getValues(`rmGridFields.${index}.Percentage`))
            item.FinishWeight = calculatePercentageValue(getValues('finishedWeight'), getValues(`rmGridFields.${index}.Percentage`))
            return item
        })
        return temp
    }

    const onSubmit = debounce(handleSubmit((values) => {

        if (totalPercentageValue() !== 100) {
            Toaster.warning(`Total percentage is ${totalPercentageValue()}%, must be 100% to save the values`)
            return false
        }
        let obj = {}
        obj.FerrousCastingWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.ForgingWeightCalculatorId ? WeightCalculatorRequest.ForgingWeightCalculatorId : "0"
        obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
        obj.RawMaterialIdRef = rmRowData?.RawMaterialId
        obj.BaseCostingIdRef = item.CostingId
        obj.LoggedInUserId = loggedInUserId()
        obj.RawMaterialCost = dataToSend.NetRMCost
        obj.NetRMRate = dataToSend.NetRMRate
        obj.NetScrapRate = dataToSend.NetScrapRate
        obj.CastingWeight = getValues('castingWeight')
        obj.RecoveryPercentage = getValues('recovery')
        obj.GrossWeight = dataToSend.totalGrossWeight
        obj.FinishWeight = getValues('finishedWeight')
        obj.ScrapWeight = dataToSend.scrapWeight
        obj.RMCost = dataToSend.rmCost
        obj.ScrapCost = dataToSend.scrapCost
        let tempArr = []
        tableVal && tableVal.map(item => (
            tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000" })
        ))
        obj.LossOfTypeDetails = tempArr
        obj.NetLossWeight = lostWeight
        let tempArray = []
        calcForOutside().map((item, index) => {
            tempArray.push({
                RMName: item.RMName, RMRate: item.RMRate, ScrapRate: item.ScrapRate, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000", Percentage: getValues(`${rmGridFields}.${index}.Percentage`)
                , GrossWeight: item.GrossWeight, ScrapWeight: item.ScrapWeight, FinishWeight: item.FinishWeight, RawMaterialId: item.RawMaterialId
            })
            return null
        })
        obj.CostingFerrousCalculationRawMaterials = tempArray
        dispatch(saveRawMaterialCalculationForFerrous(obj, res => {
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('ferrous', obj)
            }
        }))
    }), 500);

    const onCancel = () => {
        props.toggleDrawer('cancel')
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };
    const handleFinishedWeight = (e) => {
        setInputFinishWeight(e)
    }
    // New Change for Row Material
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

    // useEffect(() => {
    //     // calculateGSM()
    //     // calculateWeightAndBoardCost()
    // }, [tableInputsValues, areaCalculateWatch, state.tableData, state.totalGSM])
    const [state, setState] = useState({
        tableData: [],
        totalGSM: 0,
        showPopup: false
    })
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
    const areaCalclulationFieldValues = useWatch({
        control: controlCalculatorForm, // Pass controlCalculatorForm here
        name: ['SheetDecle', 'SheetCut'],
    });
    const areaCalculateWatch = useWatch({
        control: controlCalculatorForm,
        name: ['TotalArea'],
    })


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


    const renderListing = (label) => {
        let temp = []
        switch (label) {
            case 'RawMaterial':
                rmData && rmData.map((item) => {
                    console.log('rmData>>>>>>>>>>>: ', rmData);
                    temp.push({ label: item.RMName, value: item.RawMaterialId, RawMaterialRate: item.RMRate, ScrapRate: item.ScrapRate })
                    return null
                })
                return temp;

            default:
                return temp;
        }
    }
    console.log('rmData>>>>>>>>>>>: ', rmData);
    return (
        <Fragment>
            <Row>
                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>

                    <Col md="12" className='mt-3'>
                        <div className="header-title mt12">
                            <h5>{'Raw Material'}</h5>
                        </div>
                        <Row className={"mx-0 align-items-center"}>
                            <Col md="6">
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
                            <Col md="3">
                                <div class="d-flex">
                                    <button class="user-btn mr5 mb-2" type="submit" title="" disabled=""><div class="plus "></div>Add</button>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </form>
            </Row>
            <Row>
                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                    <Col md="12">
                        <Col md="12">
                            <tbody className='rm-table-body'></tbody>
                        </Col>
                        <div className="costing-border ferrous-calculator border-top-0 border-bottom-0">
                            <Table className="table cr-brdr-main ferrous-table" size="sm">
                                <thead>
                                    <tr>
                                        <th className='rm-name-head'>{`RM Name`}</th>
                                        <th style={{ width: "190px" }}>{`Percentage`}</th>
                                        <th>{`Basic Rate`}</th>
                                        <th>{`Value`}</th>
                                        <th>{`Scrap Rate`}</th>
                                        <th>{`Value`}</th>

                                    </tr>
                                </thead>
                                <tbody className='rm-table-body'>
                                    {rmData &&
                                        rmData.map((item, index) => {

                                            return (
                                                <tr key={index} className=''>
                                                    <td className='rm-part-name'><span title={item.RMName}>{item.RMName}</span></td>
                                                    <td>
                                                        <TextFieldHookForm
                                                            label=""
                                                            name={`${rmGridFields}.${index}.Percentage`}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage should be less than 100'
                                                                },
                                                            }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            handleChange={(e) => { percentageChange(e) }}
                                                            errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].Percentage : ''}
                                                            disabled={props.isEditFlag ? false : true}
                                                        />
                                                    </td>
                                                    <td>{item.RMRate}</td>
                                                    <td>{item.ScrapRate}</td>
                                                    <td>{item.RMRate}</td>
                                                    <td>{item.ScrapRate}</td>
                                                </tr>
                                            )
                                        })
                                    }

                                </tbody>
                            </Table>
                        </div>
                        <Row className={"mx-0"}>
                            <Col md="3">
                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'rm-rate-ferrous'} tooltipText={'Net RM Rate = (RM1 Rate * Percentage / 100) + (RM2 Rate * Percentage / 100) + ....'} />
                                <TextFieldHookForm
                                    label={`Net RM Rate`}
                                    name={'NetRMRate'}
                                    Controller={Controller}
                                    control={control}
                                    id={'rm-rate-ferrous'}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.NetRMRate}
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3">
                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'srape-rate-ferrous'} tooltipText={'Net Scrap Rate = (RM1 Scrap Rate * Percentage / 100) + (RM2 Scrap Rate * Percentage / 100) + ....'} />
                                <TextFieldHookForm
                                    label={`Net Scrap Rate`}
                                    name={'NetScrapRate'}
                                    id={'srape-rate-ferrous'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.NetScrapRate}
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3">
                                <TextFieldHookForm
                                    label={`Casting Weight(kg)`}
                                    name={'castingWeight'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },

                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder text-nowrap'}
                                    errors={errors.castingWeight}
                                    disabled={props.isEditFlag ? false : true}
                                />
                            </Col>
                        </Row>
                        <div class="header-title mt12"><h5>Binders/Additives Detail</h5></div>
                        <Row className={"mx-0 align-items-center"}>
                            <Col md="6">
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
                            <Col md="3">
                                <div class="d-flex">
                                    <button class="user-btn mr5 mb-2" type="submit" title="" disabled=""><div class="plus "></div>Add</button>
                                </div>
                            </Col>
                        </Row>
                        <div className="costing-border ferrous-calculator border-top-0 border-bottom-0">
                            <Table className="table cr-brdr-main ferrous-table" size="sm">
                                <thead>
                                    <tr>
                                        <th className='rm-name-head'>{`RM Name`}</th>
                                        <th>{`Quantity (in Kg)`}</th>
                                        <th>{`Basic Rate`}</th>
                                        <th style={{ width: "190px" }}>{`Cost`}</th>
                                    </tr>
                                </thead>
                                <tbody className='rm-table-body'>
                                    {rmData &&
                                        rmData.map((item, index) => {

                                            return (
                                                <tr key={index} className=''>
                                                    <td className='rm-part-name'><span title={item.RMName}>{item.RMName}</span></td>
                                                    <td>
                                                        <TextFieldHookForm
                                                            label=""
                                                            name={`${rmGridFields}.${index}.Percentage`}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            rules={{
                                                                required: true,
                                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage should be less than 100'
                                                                },
                                                            }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            handleChange={(e) => { percentageChange(e) }}
                                                            errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].Percentage : ''}
                                                            disabled={props.isEditFlag ? false : true}
                                                        />
                                                    </td>
                                                    <td>{item.ScrapRate}</td>
                                                    <td>1</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={2}></td>
                                        <td><strong>Total Cost</strong></td>
                                        <td><strong>1107.2</strong></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <LossStandardTable
                            dropDownMenu={dropDown}
                            CostingViewMode={props.CostingViewMode}
                            calculation={calculateRemainingCalculation}
                            weightValue={Number(getValues('castingWeight'))}
                            netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                            sendTable={WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : []}
                            tableValue={tableData}
                            isLossStandard={false}
                            isPlastic={false}
                            isNonFerrous={false}
                            ferrousErrors={errors}
                            isFerrous={true}
                        />
                        <Row className={'my-3 px-3 pt-3'}>
                            <Col md="12"><strong className='pr-4'>Other Cost:</strong><strong>2570.4</strong></Col>
                        </Row>
                        <Row className={'mt25 mx-0'}>
                            <Col md="3" >
                                <TooltipCustom disabledIcon={true} id={'gross-weight-ferrous'} tooltipText={'Gross Weight = (Casting Weight + Net Loss Weight)'} />
                                <TextFieldHookForm
                                    label={`Gross Weight(Kg)`}
                                    id={'gross-weight-ferrous'}
                                    name={'grossWeight'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.grossWeight}
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3" >
                                <TextFieldHookForm
                                    label={`Finished Weight(Kg)`}
                                    name={'finishedWeight'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={true}
                                    rules={{
                                        required: true,
                                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        max: {
                                            value: getValues("castingWeight"),
                                            message: 'Finish weight should not be greater than casting weight.'
                                        },
                                    }}
                                    handleChange={(e) => { handleFinishedWeight(e?.target?.value) }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.finishedWeight}
                                    disabled={props.isEditFlag ? false : true}
                                />
                            </Col>

                            <Col md="3">
                                <TooltipCustom disabledIcon={true} id={'scrap-weight-ferrous'} tooltipText={'Scrap Weight = (Casting Weight - Finished Weight)'} />
                                <TextFieldHookForm
                                    label={`Scrap Weight(Kg)`}
                                    name={'scrapWeight'}
                                    id={'scrap-weight-ferrous'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={WeightCalculatorRequest &&
                                        WeightCalculatorRequest.ScrapWeight !== undefined
                                        ? WeightCalculatorRequest.ScrapWeight
                                        : ''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.scrapWeight}
                                    disabled={true}
                                />
                            </Col>
                            <Col md="3">
                                <TextFieldHookForm
                                    label={`Recovery (%)`}
                                    name={'recovery'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                        required: false,
                                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                        max: {
                                            value: 100,
                                            message: 'Percentage cannot be greater than 100'
                                        },
                                    }}
                                    handleChange={() => { }}

                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.recovery}
                                    disabled={props.isEditFlag ? false : true}
                                />
                            </Col>


                            <Col md="3">
                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'scrap-cost-ferrous'} tooltipText={'Scrap Cost = (Scrap Weight * Scrap Recovery Percentage * Scrap Rate / 100)'} />
                                <TextFieldHookForm
                                    label={`Scrap Cost`}
                                    name={'scrapCost'}
                                    id={'scrap-cost-ferrous'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={
                                        WeightCalculatorRequest.ScrapCost ?? WeightCalculatorRequest.ScrapCost}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.scrapCost}
                                    disabled={true}
                                />
                            </Col>

                            <Col md="3">
                                <TooltipCustom disabledIcon={true} id={'net-rm-ferrous'} tooltipText={'Net RM Cost = (Gross Weight * RM Rate - Scrap Cost)'} />
                                <TextFieldHookForm
                                    // Confirm this name from tanmay sir
                                    label={`Net RM Cost`}
                                    name={'NetRMCost'}
                                    id={'net-rm-ferrous'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    handleChange={() => { }}
                                    defaultValue={
                                        WeightCalculatorRequest.NetRMCost ?? WeightCalculatorRequest.NetRMCost}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.NetRMCost}
                                    disabled={true}
                                />
                            </Col>
                        </Row>


                    </Col>
                    <div className=" col-md-12 text-right">
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
                            type="button"
                            onClick={onSubmit}
                            disabled={props.CostingViewMode ? true : false}
                            className="btn-primary save-btn"
                        >
                            <div className={'save-icon'}>
                            </div>
                            {'SAVE'}
                        </button>
                    </div>
                </form >

            </Row>
        </Fragment >
    );
}

export default Ferrous;