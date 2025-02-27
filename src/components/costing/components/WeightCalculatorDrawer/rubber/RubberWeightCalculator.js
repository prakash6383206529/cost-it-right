import React, { useState, useEffect, Fragment } from 'react'
import { Col, Row, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { NumberFieldHookForm, SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import { saveRawMaterialCalculationForRubberCompound } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'
import _, { debounce, trim } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalAndNumberValidation } from "../../../../../helper/validation";
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA, hideDetailOfRubbercalci } from '../../../../../config/constants'
import { toast } from 'react-toastify'
import { calculateTotalPercentage } from '../../../CostingUtil'

function RubberWeightCalculator(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const dispatch = useDispatch()

    const defaultValues = {
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.RawMaterialGrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialGrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.RawMaterialFinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialFinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapRecoveryPercentage: WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        rejectionType: WeightCalculatorRequest && WeightCalculatorRequest.RejectionType !== undefined ? { label: WeightCalculatorRequest.RejectionType, value: 5 } : '',
        rejectionValue: WeightCalculatorRequest && WeightCalculatorRequest.RejectionValue !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RejectionValue, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        netRmc: WeightCalculatorRequest && WeightCalculatorRequest.NetRawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetRawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        NetScrapRate: WeightCalculatorRequest && WeightCalculatorRequest.NetScrapRate !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetScrapRate, getConfigurationKey().NoOfDecimalForPrice) : '',
        scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    }

    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })
    const { rmRowData, rmData, CostingViewMode, item } = props
    const [isEdit, setIsEdit] = useState(false)
    const [editIndex, setEditIndex] = useState('')
    const [tableData, setTableData] = useState([])
    const [disableAdditionalFields, setDisableAdditionalFields] = useState(true)
    const [additionalCostType, setAdditionalCostType] = useState('')
    const [totalAdditionalRmCost, setTotalAdditionalRmCost] = useState('')
    const [rejectionCostType, setRejectionCostType] = useState('')
    const [disablePercentFields, setDisablePercentFields] = useState(false)
    const [reRender, setRerender] = useState(false)
    const [fieldsEnabled, setFieldsEnabled] = useState(false);
    const [percentage, setPercentage] = useState(0)

    const rmGridFields = 'rmGridFields';
    const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    useEffect(() => {
        if (WeightCalculatorRequest) {
            setTableData(WeightCalculatorRequest.CostingRubberAdditionalRawMaterial ? WeightCalculatorRequest.CostingRubberAdditionalRawMaterial : [])
            setRejectionCostType({ label: WeightCalculatorRequest.RejectionType, value: 5 })
            const rawMaterials = WeightCalculatorRequest?.CostingRubberCalculationRawMaterials || [];
            const result = calculateTotalPercentage(0, 0, rawMaterials, getValues, true);
            setFieldsEnabled(result?.total !== 0)
            setPercentage(result?.total)
            setTimeout(() => {
                setValue('grossRMRate', WeightCalculatorRequest.GrossRMRate ? checkForDecimalAndNull(WeightCalculatorRequest.GrossRMRate, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('applicablityAdditional', WeightCalculatorRequest.RawMaterialCost ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('netTotalRmRate', WeightCalculatorRequest.NetRMRate ? checkForDecimalAndNull(WeightCalculatorRequest.NetRMRate, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('scrapCost', WeightCalculatorRequest.ScrapCost ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('rmCost', WeightCalculatorRequest.RawMaterialCost ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('scrapWeight', WeightCalculatorRequest.RawMaterialScrapWeight ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialScrapWeight, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('NetScrapRate', WeightCalculatorRequest && WeightCalculatorRequest.NetScrapRate !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetScrapRate, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('rejectionCost', WeightCalculatorRequest && WeightCalculatorRequest.RejectionCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RejectionCost, getConfigurationKey().NoOfDecimalForPrice) : '')
                setValue('netRmc', WeightCalculatorRequest && WeightCalculatorRequest.NetRawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetRawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',)
                setDataToSend(WeightCalculatorRequest)
            }, 500);
        }
    }, [])


    useEffect(() => {
        let total = tableData && tableData.reduce((accummlator, el) => {
            return accummlator + checkForNull(el.NetCost)
        }, 0)

        setTotalAdditionalRmCost(Number(checkForNull(total)))
        let grossRmRate = checkForNull(Number(getValues('grossRMRate')))
        setValue('netTotalRmRate', checkForDecimalAndNull(Number(grossRmRate), getConfigurationKey().NoOfDecimalForPrice))
        let obj = { ...dataToSend }
        obj.NetRMRate = Number(grossRmRate)
        setDataToSend(obj)

        if (tableData && tableData.length === 0) {
            setDisablePercentFields(false)
        } else {
            setDisablePercentFields(true)
        }

        checkRejection()
    }, [tableData])


    const fieldValues = useWatch({
        control,
        name: ['finishedWeight', 'grossWeight', 'scrapRecoveryPercentage', 'netTotalRmRate'],
    })

    const dropDown = [
        {
            label: 'Fixed',
            value: 5,
        },
        {
            label: 'Percentage',
            value: 6,
        },
    ]

    useEffect(() => {
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest)?.length > 0 && WeightCalculatorRequest?.CostingRubberCalculationRawMaterials?.length > 0) {
            WeightCalculatorRequest.CostingRubberCalculationRawMaterials && WeightCalculatorRequest.CostingRubberCalculationRawMaterials.map((item, index) => (
                setValue(`${rmGridFields}.${index}.Percentage`, checkForDecimalAndNull(item.Percentage, getConfigurationKey().NoOfDecimalForInputOutput))
            ))
        }
    }, [WeightCalculatorRequest])

    useEffect(() => {
        if (!CostingViewMode) {
            calculateScrapWeight()
            checkRejection()
        }
    }, [fieldValues])


    const calculateScrapWeight = () => {

        let grossWeight = checkForNull(Number(getValues('grossWeight')))
        let finishedWeight = checkForNull(Number(getValues('finishedWeight')))
        let scrapRecoveryPercentage = checkForNull(Number(getValues('scrapRecoveryPercentage'))) / 100
        let scrapRate = checkForNull(Number(getValues('NetScrapRate')))
        let netRmRate = checkForNull(Number(getValues('netTotalRmRate')))

        if (grossWeight) {
            let scrapWeight = grossWeight - finishedWeight
            setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForPrice))

            let scrapCost = scrapWeight * scrapRecoveryPercentage * scrapRate
            setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))

            let rmCost = ((grossWeight * netRmRate) - checkForNull(Number(scrapCost)))
            setValue('rmCost', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))
            setValue('applicablityAdditional', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))

            let obj = dataToSend
            obj.ScrapCost = scrapCost
            obj.RawMaterialScrapWeight = scrapWeight
            obj.RawMaterialCost = rmCost
            setDataToSend(obj)
        }

    }


    const percentageChange = (percentage, index) => {

        const result = calculateTotalPercentage(percentage, index, rmData, getValues, false);
        setPercentage(result?.total);

        if (!result?.isValid) {
            Toaster.warning(result?.message);
            setFieldsEnabled(false);
            setValue(`rmGridFields.${index}.Percentage`, '');
            return false;
        }

        setFieldsEnabled(result?.total === 100);
        calculateNetSCrapRate(percentage, index);
        calculateNetRmRate(percentage, index);
    };

    const calculateNetRmRate = (percentageValue, indexTemp) => {

        let grossRMRate = 0;
        grossRMRate = rmData && rmData.reduce((acc, val, index) => {
            const Percentage = (indexTemp === index) ? percentageValue : getValues(`rmGridFields.${index}.Percentage`)
            return acc + (checkForNull(Percentage) * checkForNull(val.RMRate) / 100)

        }, 0)
        let obj = { ...dataToSend }
        obj.GrossRMRate = grossRMRate
        obj.NetRMRate = Number(grossRMRate)
        setDataToSend(obj)
        setValue('grossRMRate', checkForDecimalAndNull(grossRMRate, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('applicablityAdditional', checkForDecimalAndNull(obj.RawMaterialCost, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('netTotalRmRate', checkForDecimalAndNull(Number(grossRMRate), getConfigurationKey().NoOfDecimalForPrice))
    }

    const calculateNetSCrapRate = (percentageValue, indexTemp) => {
        let NetScrapRate = 0;
        NetScrapRate = rmData && rmData.reduce((acc, val, index) => {
            const Percentage = (indexTemp === index) ? percentageValue : getValues(`rmGridFields.${index}.Percentage`)
            return acc + (checkForNull(Percentage) * checkForNull(val.ScrapRate) / 100)

        }, 0)
        let obj = { ...dataToSend }
        obj.NetScrapRate = NetScrapRate
        setDataToSend(obj)
        setValue('NetScrapRate', checkForDecimalAndNull(NetScrapRate, getConfigurationKey().NoOfDecimalForInputOutput))
    }


    const calcForOutside = () => {
        let temp = [...rmData]
        temp && temp.map((item, index) => {
            item.GrossWeight = calculatePercentageValue(getValues('grossWeight'), getValues(`rmGridFields.${index}.Percentage`))
            item.ScrapWeight = calculatePercentageValue(dataToSend?.RawMaterialScrapWeight, getValues(`rmGridFields.${index}.Percentage`))
            item.FinishWeight = calculatePercentageValue(getValues('finishedWeight'), getValues(`rmGridFields.${index}.Percentage`))
            return item
        })
        return temp
    }

    const onSubmit = debounce(handleSubmit((values) => {

        let obj = {}
        obj.RubberWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.RubberWeightCalculatorId ? WeightCalculatorRequest.RubberWeightCalculatorId : "0"
        obj.BaseCostingIdRef = item.CostingId
        obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
        obj.LoggedInUserId = loggedInUserId()
        obj.RawMaterialIdRef = rmRowData?.RawMaterialId
        obj.GrossRMRate = dataToSend.GrossRMRate
        obj.AdditionalRMRate = totalAdditionalRmCost
        obj.NetRMRate = dataToSend.NetRMRate ? dataToSend.NetRMRate : 0
        obj.NetScrapRate = checkForNull(Number(getValues('NetScrapRate')))
        obj.ScrapCost = dataToSend.ScrapCost ? dataToSend.ScrapCost : 0
        obj.RecoveryPercentage = checkForNull(Number(getValues('scrapRecoveryPercentage')))
        obj.RawMaterialGrossWeight = checkForNull(Number(getValues('grossWeight')))
        obj.RawMaterialFinishWeight = checkForNull(Number(getValues('finishedWeight')))
        obj.RawMaterialScrapWeight = dataToSend.RawMaterialScrapWeight ? dataToSend.RawMaterialScrapWeight : 0
        obj.RawMaterialCost = dataToSend.RawMaterialCost ? dataToSend.RawMaterialCost : 0
        obj.NetRawMaterialCost = dataToSend.NetRawMaterialCost ? dataToSend.NetRawMaterialCost : 0
        obj.RejectionValue = checkForNull(Number(getValues('rejectionValue')))
        obj.RejectionType = rejectionCostType ? rejectionCostType.label : ''
        obj.RejectionCost = dataToSend.RejectionCost
        obj.CostingRubberAdditionalRawMaterial = tableData

        let tempArray = []
        calcForOutside().map((item, index) => {
            tempArray.push({
                RMName: item.RMName, RMRate: item.RMRate, ScrapRate: item.ScrapRate, CostingCalculationDetailId: "00000000-0000-0000-0000-000000000000", Percentage: getValues(`${rmGridFields}.${index}.Percentage`)
                , GrossWeight: item.GrossWeight, ScrapWeight: item.ScrapWeight, FinishWeight: item.FinishWeight, RawMaterialId: item.RawMaterialId,
            })
            return null
        })
        obj.CostingRubberCalculationRawMaterials = tempArray

        dispatch(saveRawMaterialCalculationForRubberCompound(obj, res => {
            if (res?.data?.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                obj.RawMaterialCost = obj.NetRawMaterialCost
                props.toggleDrawer('rubber', obj)
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

    const handleType = (e) => {
        if (e) {
            setDisableAdditionalFields(false)
            setAdditionalCostType(e)

            let value = checkForNull(Number(getValues('valueAdditional')))
            let applicablityCost = checkForNull(Number(getValues('applicablityAdditional')))

            if (value && applicablityCost) {
                if (String(e.label) === String('Fixed')) {
                    setValue('netCostAdditional', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
                } else {
                    setValue('netCostAdditional', checkForDecimalAndNull(((value * applicablityCost) / 100), getConfigurationKey().NoOfDecimalForPrice))
                }
            }
        }
    }


    const handleValueChange = (e) => {

        let value = checkForNull(Number(e.target.value))
        let applicablityCost = checkForNull(Number(getValues('applicablityAdditional')))

        if (String(additionalCostType.label) === String('Fixed')) {
            setValue('netCostAdditional', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))

        } else {

            if (value > 100) {
                Toaster.warning('Percentage value should not be greater than 100')
                setTimeout(() => {
                    setValue('valueAdditional', 0)
                    handleValueChange({ target: { value: 0 } })
                }, 100);
                return false

            } else {
                setValue('netCostAdditional', checkForDecimalAndNull(((value * applicablityCost) / 100), getConfigurationKey().NoOfDecimalForPrice))
            }
        }
    }


    const handleTypeRejection = (e) => {
        if (e) {

            setRejectionCostType(e)

            let value = checkForNull(Number(getValues('rejectionValue')))
            let rmCost = checkForNull(Number(getValues('rmCost')))
            let totalTableCost = checkForNull(getTotal(tableData))

            let obj = { ...dataToSend }

            if (value && rmCost) {
                if (String(e.label) === String('Fixed')) {
                    setValue('netRmc', checkForDecimalAndNull(value + rmCost + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
                    setValue('rejectionCost', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
                    obj.NetRawMaterialCost = value + rmCost + totalTableCost
                    obj.RejectionCost = value
                } else {

                    if (value > 100) {
                        Toaster.warning('Percentage value should not be greater than 100')
                        setTimeout(() => {
                            setValue('rejectionValue', 0)
                            handleValueChangeRejection({ target: { value: 0 } })
                        }, 100);
                        return false
                    } else {
                        setValue('netRmc', checkForDecimalAndNull(rmCost + ((value / 100) * rmCost) + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
                        setValue('rejectionCost', checkForDecimalAndNull((value / 100) * rmCost, getConfigurationKey().NoOfDecimalForPrice))
                        obj.NetRawMaterialCost = rmCost + ((value / 100) * rmCost) + totalTableCost
                        obj.RejectionCost = ((value / 100) * rmCost)
                    }
                }
                setDataToSend(obj)
            }
        }
    }


    const handleValueChangeRejection = (e) => {

        let value = checkForNull(Number(e.target.value))
        let rmCost = checkForNull(Number(getValues('rmCost')))
        let totalTableCost = checkForNull(getTotal(tableData))

        let obj = { ...dataToSend }

        if (rejectionCostType) {

            if (String(rejectionCostType.label) === String('Fixed')) {
                setValue('netRmc', checkForDecimalAndNull(value + rmCost + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
                setValue('rejectionCost', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
                obj.NetRawMaterialCost = value + rmCost + totalTableCost
                obj.RejectionCost = value

            } else {

                if (value > 100) {
                    Toaster.warning('Percentage value should not be greater than 100')
                    setTimeout(() => {
                        setValue('rejectionValue', 0)
                        handleValueChangeRejection({ target: { value: 0 } })
                    }, 100);
                    return false
                } else {
                    setValue('rejectionCost', checkForDecimalAndNull((value / 100) * rmCost, getConfigurationKey().NoOfDecimalForPrice))
                    setValue('netRmc', checkForDecimalAndNull(rmCost + ((value / 100) * rmCost) + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
                    obj.NetRawMaterialCost = rmCost + ((value / 100) * rmCost) + totalTableCost
                    obj.RejectionCost = ((value / 100) * rmCost)
                }
            }
            setDataToSend(obj)
        }
    }


    const checkRejection = () => {

        let value = checkForNull(Number(getValues('rejectionValue')))
        let rmCost = checkForNull(Number(getValues('rmCost')))
        let totalTableCost = checkForNull(getTotal(tableData))

        let obj = dataToSend

        if (value && rmCost && rejectionCostType) {
            if (String(rejectionCostType.label) === String('Fixed')) {
                setValue('netRmc', checkForDecimalAndNull(value + rmCost + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
                setValue('rejectionCost', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
                obj.NetRawMaterialCost = value + rmCost + totalTableCost
                obj.RejectionCost = value
            } else {
                if (value > 100) {
                    Toaster.warning('Percentage value should not be greater than 100')
                    setTimeout(() => {
                        setValue('rejectionValue', 0)
                        handleValueChangeRejection({ target: { value: 0 } })
                    }, 100);
                    return false
                } else {
                    setValue('netRmc', checkForDecimalAndNull(rmCost + ((value / 100) * rmCost) + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
                    setValue('rejectionCost', checkForDecimalAndNull((value / 100) * rmCost, getConfigurationKey().NoOfDecimalForPrice))
                    obj.NetRawMaterialCost = rmCost + ((value / 100) * rmCost) + totalTableCost
                    obj.RejectionCost = ((value / 100) * rmCost)
                }
            }
            setDataToSend(obj)
        } else {

            setValue('netRmc', checkForDecimalAndNull(rmCost + totalTableCost, getConfigurationKey().NoOfDecimalForPrice))
            obj.NetRawMaterialCost = rmCost + totalTableCost
        }
    }

    const resetTable = (e) => {
        delete errors.valueAdditional
        setValue('description', '')
        setValue('additionalCostType', '')
        setValue('valueAdditional', '')
        setValue('netCostAdditional', '')
        setIsEdit(false)
        setRerender(!reRender)
    }

    const addRow = () => {
        if (errors.valueAdditional) {
            return false
        }
        let temp = tableData ? [...tableData] : []
        let obj = {}

        obj.Description = getValues('description')
        obj.Type = getValues('additionalCostType')?.label
        obj.Value = Number(getValues('valueAdditional'))
        obj.ApplicabilityCost = Number(getValues('applicablityAdditional'))
        obj.NetCost = Number(getValues('netCostAdditional'))
        obj.CostingCalculationDetailId = "00000000-0000-0000-0000-000000000000"

        if (getValues('description') && getValues('additionalCostType') && getValues('valueAdditional')) {

            if (isEdit) {
                let newTemp = Object.assign([...tableData], { [editIndex]: obj })
                setTableData(newTemp)
                resetTable()
            } else {
                temp.push(obj)
                setTableData(temp)
                resetTable()
            }
        } else {
            toast.warning('Please enter mandatory details')
        }

    }


    const deleteRow = (index) => {
        let temp = []
        tableData && tableData.map((item, ind) => {
            if (Number(ind) !== Number(index)) {
                temp.push(item)
            }
        })
        setTableData(temp)
        resetTable()
    }


    const getTotal = (data) => {

        let total = data && data.reduce((accummlator, el) => {
            return Number(accummlator) + Number(checkForNull(el.NetCost))
        }, 0)

        return checkForDecimalAndNull(total, getConfigurationKey().NoOfDecimalForPrice)
    }

    const editRow = (index) => {
        setIsEdit(true)
        setEditIndex(index)

        let obj = tableData[index]
        setValue('description', obj.Description)
        setValue('additionalCostType', { label: obj.Type, value: 5 })
        setValue('valueAdditional', obj.Value)
        setValue('netCostAdditional', obj.NetCost)
    }

    const handleFinishWeight = (e) => {
        if (e) {
            let finishWeight = checkForNull(Number(e?.target?.value))
            let grossWeight = checkForNull(Number(getValues('grossWeight')))

            if (finishWeight < grossWeight) {
                delete errors.grossWeight
            }
        }
    }

    const handleGrossWeight = (e) => {
        if (e) {
            let grossWeight = Number(checkForNull(e.target.value))
            let finishedWeight = checkForNull(Number(getValues('finishedWeight')))

            if (grossWeight > finishedWeight) {
                delete errors.finishedWeight
            }
        }
    }

    return (
        <Fragment>
            <Row>
                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>

                    <Col md="12" className='mt-3'>
                        <div className="header-title mt12">
                            <h5>{'Raw Material:'}</h5>
                        </div>
                        <Col md="12">
                            <tbody className='rm-table-body'></tbody>
                        </Col>
                        <div className="costing-border ferrous-calculator">
                            <Table className="table cr-brdr-main ferrous-table" size="sm">
                                <thead>
                                    <tr>
                                        <th className='rm-name-head'>{`RM Name`}</th>
                                        <th>{`RM Rate`}</th>
                                        <th>{`Scrap Rate`}</th>
                                        {!hideDetailOfRubbercalci && <th style={{ width: "190px" }}>{`Percentage (${percentage}%)`}</th>}
                                    </tr>
                                </thead>
                                <tbody className='rm-table-body'>
                                    {rmData &&
                                        rmData.map((item, index) => {

                                            return (
                                                <tr key={index} className=''>
                                                    <td className='rm-part-name'><span title={item.RMName}>{item.RMName}</span></td>
                                                    <td>{item.RMRate}</td>
                                                    <td>{item.ScrapRate}</td>
                                                    {
                                                        !hideDetailOfRubbercalci &&
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
                                                                handleChange={(e) => { percentageChange(e.target.value, index) }}
                                                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].Percentage : ''}
                                                                disabled={props.CostingViewMode || disablePercentFields}
                                                            />
                                                        </td>
                                                    }
                                                </tr>
                                            )
                                        })
                                    }

                                </tbody>
                            </Table>
                            {!hideDetailOfRubbercalci && <Row className={"mx-0"}>
                                <Col md="3">
                                    <TooltipCustom width={"240px"} disabledIcon={true} id={'rm-rate-ferrous'} tooltipText={'Net RM Rate = (RM1 Rate * Percentage / 100) + (RM2 Rate * Percentage / 100) + ....'} />
                                    <TextFieldHookForm
                                        label={`Gross RM Rate`}
                                        name={'grossRMRate'}
                                        Controller={Controller}
                                        control={control}
                                        id={'rm-rate-ferrous'}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.grossRMRate}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>
                            }
                            <Row className={'mt25 mx-0'}>
                                {
                                    !hideDetailOfRubbercalci &&
                                    <>
                                        <Col md="3" >
                                            <TooltipCustom disabledIcon={true} width={"240px"} id={'netTotalRmRate'} tooltipText={`Net RM Rate = Gross RM Rate + Total Additional RM Cost`} />
                                            <TextFieldHookForm
                                                label={`Net RM Rate`}
                                                name={'netTotalRmRate'}
                                                id={'netTotalRmRate'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {

                                                        value: /^[0-9]\d*(\.\d+)?$/i,
                                                        message: 'Invalid Number.',
                                                    },

                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.netTotalRmRate}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3" >
                                            <TooltipCustom width={"240px"} disabledIcon={true} id={'NetScrapRate'} tooltipText={'Net Scrap Rate = (RM1 Scrap Rate * Percentage / 100) + (RM2 Scrap Rate * Percentage / 100) + ....'} />
                                            <TextFieldHookForm
                                                label={`Net Scrap Rate`}
                                                name={'NetScrapRate'}
                                                id={'NetScrapRate'}
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
                                                label={`Gross Weight (Kg)`}
                                                name={'grossWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { number, decimalAndNumberValidation },
                                                    min: {
                                                        value: getValues('finishedWeight'),
                                                        message: 'Gross weight should not be lesser than finish weight.'
                                                    },
                                                }}
                                                handleChange={handleGrossWeight}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.grossWeight}
                                                disabled={props.CostingViewMode || !fieldsEnabled}
                                            />
                                        </Col>


                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Finished Weight (Kg)`}
                                                name={'finishedWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { number, decimalAndNumberValidation },
                                                    max: {
                                                        value: getValues('grossWeight'),
                                                        message: 'Finish weight should not be greater than gross weight.'
                                                    },
                                                }}
                                                handleChange={handleFinishWeight}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.finishedWeight}
                                                disabled={props.CostingViewMode || !fieldsEnabled}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'scrap-weight'} tooltipText={'Scrap weight = (Gross weight - Finish weight)'} />
                                            <TextFieldHookForm
                                                label={`Scrap Weight (Kg)`}
                                                name={'scrapWeight'}
                                                id={'scrap-weight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.scrapWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Scrap Recovery Percentage`}
                                                name={'scrapRecoveryPercentage'}
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
                                                errors={errors.scrapRecoveryPercentage}
                                                disabled={props.CostingViewMode || !fieldsEnabled}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'scrapcost'} tooltipText={'Scrap cost = (Net Scrap Rate*Scrap Weight*Scrap Recovery Percentage)/100'} />
                                            <TextFieldHookForm
                                                label={`Scrap Cost`}
                                                name={'scrapCost'}
                                                id={'scrapcost'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.scrapCost}
                                                disabled={true}
                                            />
                                        </Col>
                                    </>
                                }
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'rmcost'} tooltipText={'RM Cost = (Gross Weight *Net RM Rate)-Scrap Cost '} />
                                    <TextFieldHookForm
                                        label={`RM Cost`}
                                        name={'rmCost'}
                                        id={'rmcost'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rmCost}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>

                            <Fragment>
                                <Row className={`mb-3 ${true ? 'mx-0' : ''}`}>
                                    <Col md="12">
                                        <div className="header-title">
                                            <h5>{'Additional RM Costs:'}</h5>
                                        </div>
                                    </Col>

                                    <Col md="3">
                                        <TextFieldHookForm
                                            label={`Description`}
                                            name={'description'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: false,
                                                validate: { checkWhiteSpaces },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.description}
                                            disabled={props.CostingViewMode || !fieldsEnabled}
                                        />
                                    </Col>

                                    <Col md="3">
                                        <SearchableSelectHookForm
                                            label={`Type`}
                                            name={'additionalCostType'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            options={dropDown}
                                            handleChange={handleType}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.additionalCostType}
                                            disabled={props.CostingViewMode || !fieldsEnabled}
                                        />
                                    </Col>

                                    <Col md="3">
                                        <TextFieldHookForm
                                            label={`Value`}
                                            id={'valueAdditional'}
                                            name={'valueAdditional'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: false,
                                                validate: { number, decimalAndNumberValidation },
                                            }}
                                            handleChange={handleValueChange}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.valueAdditional}
                                            disabled={disableAdditionalFields}
                                        />
                                    </Col>

                                    <Col md="3">
                                        <TooltipCustom disabledIcon={true} width={"230px"} id={'applicablityAdditional'} tooltipText={`Applicability Cost = Gross RM Cost`} />
                                        <TextFieldHookForm
                                            label={`Applicability Cost`}
                                            id={'applicablityAdditional'}
                                            name={'applicablityAdditional'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.applicablityAdditional}
                                            disabled={true}
                                        />
                                    </Col>

                                    <Col md="3">
                                        <TooltipCustom disabledIcon={true} id={'netCostAdditional'} tooltipText={`Net Cost = Value${additionalCostType.label === 'Fixed' ? "" : " * Applicability Cost / 100"}`} />
                                        <TextFieldHookForm
                                            label={`Net Cost`}
                                            id={'netCostAdditional'}
                                            name={'netCostAdditional'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.netCostAdditional}
                                            disabled={true}
                                        />
                                    </Col>

                                    <Col md="3" className="pr-0 mt-4">
                                        <div className='mt8'>
                                            {isEdit ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={'btn btn-primary pull-left mr5'}
                                                        onClick={() => addRow()}
                                                    >
                                                        Update
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={'reset-btn  pull-left mr5'}
                                                        onClick={() => resetTable()}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={'user-btn  pull-left'}
                                                        onClick={addRow}
                                                        disabled={props.CostingViewMode || !fieldsEnabled}
                                                    >
                                                        <div className={'plus'}></div>ADD
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={"mr15 ml-1  reset-btn"}
                                                        disabled={props.CostingViewMode || !fieldsEnabled}
                                                        onClick={resetTable}
                                                    >
                                                        Reset
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </Col>

                                    <Col md="12">
                                        <Table className="table border" size="sm">
                                            <thead>
                                                <tr>
                                                    <th>{`Description`}</th>
                                                    {<th>{`Type`}</th>}
                                                    {<th>{`Value`}</th>}
                                                    {<th>{`Net Cost`}</th>}
                                                    <th>{`Actions`}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData &&
                                                    tableData.map((item, index) => {
                                                        return (
                                                            <Fragment>
                                                                <tr key={index}>
                                                                    <td>{item.Description ? item.Description : '-'} </td>
                                                                    {<td>{item.Type ? item.Type : '-'}</td>}
                                                                    {<td>{checkForDecimalAndNull(item.Value, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.Value, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                                                                    {<td>{checkForDecimalAndNull(item.NetCost, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.NetCost, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}

                                                                    <td>
                                                                        {
                                                                            <React.Fragment>
                                                                                <button
                                                                                    className="Edit mr-2"
                                                                                    type={'button'}
                                                                                    title='Edit'
                                                                                    disabled={props.CostingViewMode}
                                                                                    onClick={() => editRow(index)}
                                                                                />
                                                                                <button
                                                                                    className="Delete"
                                                                                    title='Delete'
                                                                                    type={'button'}
                                                                                    disabled={props.CostingViewMode}
                                                                                    onClick={() => deleteRow(index)}
                                                                                />
                                                                            </React.Fragment>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            </Fragment>
                                                        )
                                                    })}
                                                {tableData && tableData.length === 0 ? (
                                                    <tr>
                                                        <td colspan="15">
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>
                                                    </tr>
                                                ) : <tr className='table-footer font-weight-500'>
                                                    <td colspan="3" className="text-right">
                                                        Total Additional RM Cost :
                                                    </td>
                                                    <td colspan="2">
                                                        {(getTotal(tableData))}
                                                    </td>
                                                </tr>}
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Fragment>

                            <Row className={`mb-3 ${true ? 'mx-0' : ''}`}>
                                <Col md="12">
                                    <div className="header-title">
                                        <h5>{'Rejection:'}</h5>
                                    </div>
                                </Col>

                                <Col md="3">
                                    <SearchableSelectHookForm
                                        label={`Rejection type`}
                                        name={'rejectionType'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        options={dropDown}
                                        handleChange={handleTypeRejection}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rejectionType}
                                        disabled={props.CostingViewMode || !fieldsEnabled}
                                    />
                                </Col>

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Rejection value`}
                                        id={'rejectionValue'}
                                        name={'rejectionValue'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, decimalAndNumberValidation },
                                        }}
                                        handleChange={handleValueChangeRejection}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rejectionValue}
                                        disabled={props.CostingViewMode || !fieldsEnabled}
                                    />
                                </Col>


                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'rejectionCost'} tooltipText={`Rejection Cost = Rejection Value${rejectionCostType === 'Fixed' ? "" : " * RM Cost / 100"}`} />
                                    <TextFieldHookForm
                                        label={`Rejection Cost`}
                                        id={'rejectionCost'}
                                        name={'rejectionCost'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {
                                                value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                message: 'Maximum length for integer is 4 and for decimal is 7',
                                            },
                                        }}
                                        handleChange={handleValueChangeRejection}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rejectionCost}
                                        disabled={true}
                                    />
                                </Col>


                                <Col md="3">
                                    <TooltipCustom width={"240px"} disabledIcon={true} id={'netRmc'} tooltipText={'Net RMC = RM Cost + Rejection Cost + Additional RM Cost'} />
                                    <TextFieldHookForm
                                        label={`Net RMC`}
                                        id={'netRmc'}
                                        name={'netRmc'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            pattern: {

                                                value: /^[0-9]\d*(\.\d+)?$/i,
                                                message: 'Invalid Number.',
                                            },

                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.netRmc}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>

                        </div>
                    </Col>
                    <div className=" col-md-12 text-right">
                        <button
                            onClick={onCancel}
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
                            disabled={props.CostingViewMode || !fieldsEnabled}
                            className="btn-primary save-btn"
                        >
                            <div className={'save-icon'}>
                            </div>
                            {'SAVE'}
                        </button>
                    </div>
                </form>

            </Row>
        </Fragment>
    );
}

export default RubberWeightCalculator;