import { Drawer } from '@material-ui/core';
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Container, Row } from 'reactstrap';
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs';
import { CRMHeads, WACTypeId } from '../../../../../config/constants';
import { reactLocalStorage } from 'reactjs-localstorage';
import { ViewCostingContext } from '../../CostingDetails';
import OtherDiscountTable from './OtherDiscountTable';
import { calculatePercentage, checkForDecimalAndNull, checkForNull, checkWhiteSpaces, decimalNumberLimit6, hashValidation, number, percentageLimitValidation, removeBOPfromApplicability } from '../../../../../helper';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import _ from 'lodash';
import Toaster from '../../../../common/Toaster';
import { setOtherDiscountData } from '../../../actions/Costing';
import { fetchCostingHeadsAPI } from '../../../../../actions/Common';
import { IdForMultiTechnology } from '../../../../../config/masterData';

function AddOtherDiscount(props) {
    const { register, handleSubmit, formState: { errors }, control, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const CostingViewMode = useContext(ViewCostingContext);
    const { otherDiscountData } = useSelector(state => state.costing)
    const [state, setState] = useState({
        isEdit: false,
        tableData: otherDiscountData.gridData,
        discountTotalCost: otherDiscountData.totalCost,
        otherDiscountApplicabilityType: [],
    })
    const [otherCostApplicability, setOtherCostApplicability] = useState([])
    const [otherCost, setOtherCost] = useState('')
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const costingHead = useSelector(state => state.comman.costingHead)
    const headerCosts = useContext(netHeadCostContext);
    const costData = useContext(costingInfoContext);
    const [applicabilityCost, setApplicabilityCost] = useState('')
    const dispatch = useDispatch()
    const { CostingDataList, isBreakupBoughtOutPartCostingFromAPI, OverheadProfitTabData, PackageAndFreightTabData, DiscountCostData } = useSelector(state => state.costing)
    const { currencySource } = useSelector((state) => state?.costing);
    const fieldValuesForPercent = useWatch({
        control,
        name: ['PercentageOtherCost', 'OtherCostApplicability'],
    })
    const fieldValuesForFixed = useWatch({
        control,
        name: ['ApplicabilityCost'],
    })
    const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)

    useEffect(() => {
        setValue('ApplicabilityCost', '')
        if (!CostingViewMode) {
            findApplicabilityCost()
        }
    }, [fieldValuesForPercent])
    useEffect(() => {
        if (!CostingViewMode && getValues('OtherCostApplicability')?.label === 'Fixed') {
            findApplicabilityCost()
        }
    }, [fieldValuesForFixed])
    useEffect(() => {
        let request = partType ? 'multiple technology assembly' : ''
        dispatch(fetchCostingHeadsAPI(request, false, (res) => { }))
    }, [])

    const renderListing = (label) => {
        const temp = [];
        let tempList = [];
        if (label === 'Applicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0' || item.Value === '24') return false;                  // 24 IS FOR ScrapRate * NetWeight
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            if (isBreakupBoughtOutPartCostingFromAPI) {
                tempList = removeBOPfromApplicability([...temp])
            } else {
                tempList = [...temp]

            }
            return tempList;
        }
    }
    const onSubmit = () => {
        if (state.isEdit) {
            let OtherCostDescription = getValues('OtherCostDescription')
            let OtherCostApplicability = getValues('OtherCostApplicability')?.label
            let isDuplicate = false
            state.tableData && state.tableData.map((item, index) => {
                if (index !== state.editIndex) {
                    if (String(item.Description) === String(OtherCostDescription) && String(item.applicability) === String(OtherCostApplicability)) {
                        isDuplicate = true
                    }
                }
            })

            if (isDuplicate) {
                Toaster.warning("Duplicate entries are not allowed")
                return false
            }
            updateRow()
        } else {
            addRow()
        }
    }
    const addRow = () => {
        if (validation()) {
            return false
        }
        let gridData = [...state.tableData]
        let obj = {
            CRMHead: getValues('crmHeadOtherCost') ? getValues('crmHeadOtherCost').label : '',
            Description: getValues("OtherCostDescription"),
            ApplicabilityIdRef: state.otherDiscountApplicabilityType?.value,
            ApplicabilityType: state.otherDiscountApplicabilityType?.label,
            ApplicabilityCost: applicabilityCost,
            PercentageDiscountCost: getValues("PercentageOtherCost") ?? '',
            NetCost: state.otherDiscountApplicabilityType?.label === 'Fixed' ? getValues('AnyOtherCost') : otherCost,
        }

        gridData?.push(obj)
        const sumOfNetCost = gridData?.reduce((acc, obj) => acc + Number(obj.NetCost), 0);
        if ((CostingDataList[0]?.TotalCost + CostingDataList[0]?.NetOtherCost) < sumOfNetCost) {
            Toaster.warning("Discount should not be greater than Total Cost.")
            return false
        }
        resetData()
        setState(prevState => ({ ...prevState, tableData: gridData, discountTotalCost: sumOfNetCost }))
    }
    const resetData = (type) => {
        setValue('OtherCostType', "")
        setValue('OtherCostApplicability', '')
        setValue('PercentageOtherCost', '')
        setValue('OtherCostDescription', '')
        setValue('AnyOtherCost', '')
        setTimeout(() => {
            setValue('ApplicabilityCost', '')
        }, 100);
        setOtherCostApplicability([])
        setOtherCost(0)
        setState(prevState => ({ ...prevState, isEdit: false, editIndex: '' }))
        setApplicabilityCost(0)
        setValue('crmHeadOtherCost', '')
    }
    const validation = () => {
        let labels = ['OtherCostDescription', 'OtherCostApplicability', 'AnyOtherCost', 'PercentageOtherCost'];
        let count = 0
        // labels.forEach(label => {
        //     if (state.otherDiscountApplicabilityType?.label === 'Fixed' && label === 'PercentageOtherCost') {
        //         return false
        //     } else {
        //         if (!getValues(label)) {
        //             count++
        //         }
        //     }
        // })
        if (count > 0) {
            // Toaster.warning("Please fill all details")
            // return true
        } else {

            let OtherCostDescription = getValues('OtherCostDescription')
            let OtherCostApplicability = getValues('OtherCostApplicability')?.label
            let isDuplicate = false

            state.tableData && state.tableData.map((item) => {
                if (String(item.Description) === String(OtherCostDescription) && String(item.applicability) === String(OtherCostApplicability)) {
                    isDuplicate = true
                }
            })

            if (isDuplicate && !state.isEdit) {
                Toaster.warning("Duplicate entries are not allowed")
                return true

            } else {
                return false
            }
        }
    }

    const updateRow = () => {
        if (validation()) {
            return false
        }
        const obj = {
            CRMHead: getValues('crmHeadOtherCost') ? getValues('crmHeadOtherCost').label : '',
            Description: getValues("OtherCostDescription"),
            ApplicabilityIdRef: state.otherDiscountApplicabilityType?.value,
            ApplicabilityType: state.otherDiscountApplicabilityType?.label,
            ApplicabilityCost: applicabilityCost,
            PercentageDiscountCost: getValues("PercentageOtherCost") ?? '',
            NetCost: otherCostApplicability?.label === 'Fixed' ? getValues('AnyOtherCost') : otherCost,
        }

        let tempArr = Object.assign([...state.tableData], { [state.editIndex]: obj })
        const sumOfNetCost = tempArr.reduce((acc, obj) => acc + Number(obj.NetCost), 0);
        if ((CostingDataList[0]?.TotalCost + CostingDataList[0]?.NetOtherCost) < sumOfNetCost) {
            Toaster.warning("Discount should not be greater than Total Cost.")
            return false
        }
        setState(prevState => ({ ...prevState, tableData: tempArr, isEdit: false, discountTotalCost: sumOfNetCost }))
        resetData()
    }
    const editItemDetails = (index) => {
        const editObj = state.tableData[index]
        setValue('OtherCostApplicability', { label: editObj.ApplicabilityType, value: editObj.ApplicabilityIdRef })
        setValue('PercentageOtherCost', editObj.PercentageDiscountCost === '' ? 0 : editObj.PercentageDiscountCost)
        setValue('OtherCostDescription', editObj.Description)
        setValue('AnyOtherCost', editObj.NetCost)
        setValue('crmHeadOtherCost', { label: editObj.CRMHead, value: index })
        if (editObj?.ApplicabilityType === 'Fixed') {
            setTimeout(() => {
                setValue('ApplicabilityCost', editObj?.ApplicabilityCost)
                setApplicabilityCost(editObj?.ApplicabilityCost)
            }, 100);
        } else {
            setTimeout(() => {
                setValue('ApplicabilityCost', checkForDecimalAndNull(editObj?.ApplicabilityCost, initialConfiguration?.NoOfDecimalForPrice))
                setApplicabilityCost(editObj?.ApplicabilityCost)
            }, 100);
        }

        setState(prevState => ({ ...prevState, editIndex: index, isEdit: true, otherDiscountApplicabilityType: { label: editObj.ApplicabilityType, value: editObj.ApplicabilityIdRef } }))
        let applicability = editObj.ApplicabilityType !== 'Fixed' ? { label: 'Percentage', value: 'Percentage' } : editObj.ApplicabilityType
        setOtherCostApplicability(applicability)

    }

    const deleteItem = (index) => {
        let newgridData = []
        if (index >= 0 && index < state.tableData.length) {
            newgridData = [...state.tableData]; // create a copy of the array
            _.pullAt(newgridData, index);
        }
        const sumOfNetCost = newgridData?.reduce((acc, obj) => acc + obj.NetCost, 0);
        setState(prevState => ({ ...prevState, tableData: newgridData, discountTotalCost: sumOfNetCost, isEdit: false }))
        resetData()
    }
    const handleOherCostApplicabilityChange = (value) => {
        if (!CostingViewMode) {
            if (value && value !== '') {
                delete errors.ApplicabilityCost
                let applicability = value.label !== 'Fixed' ? { label: 'Percentage', value: 'Percentage' } : value
                // setState(prevState => ({ ...prevState, otherDiscountApplicabilityType: applicability }))
                setOtherCostApplicability(applicability)
                setValue('AnyOtherCost', 0)
                setValue('PercentageOtherCost', '')
                errors.AnyOtherCost = {}
                errors.PercentageOtherCost = {}

            } else {
                setState(prevState => ({ ...prevState, otherDiscountApplicabilityType: [] }))

            }
            errors.PercentageOtherCost = {}
        }
        // setOtherCostApplicability(value)
        setState(prevState => ({ ...prevState, otherDiscountApplicabilityType: value }))
        setValue('ApplicabilityCost', '')
    }
    const findApplicabilityCost = () => {
        const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly) : headerCosts?.NetProcessCost + headerCosts?.NetOperationCost
        const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + ConversionCostForCalculation
        const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
        const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation;
        const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation;
        let dataList = CostingDataList && CostingDataList.length > 0 ? CostingDataList[0] : {}
        const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost)
        const percent = getValues('PercentageOtherCost')
        const overheadAndProfitTabDataValue = OverheadProfitTabData && OverheadProfitTabData[0]?.CostingPartDetails
        const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]

        let totalCost = ''
        switch (state.otherDiscountApplicabilityType?.label) {
            case 'RM':
            case 'Part Cost':
                totalCost = headerCosts.NetRawMaterialsCost * calculatePercentage(percent)
                setApplicabilityCost(headerCosts.NetRawMaterialsCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(headerCosts.NetRawMaterialsCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'BOP':
                totalCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(percent)
                setApplicabilityCost(headerCosts.NetBoughtOutPartCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(headerCosts.NetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'RM + CC':
            case 'Part Cost + CC':
                totalCost = (RMCC) * calculatePercentage(percent)
                setApplicabilityCost(RMCC)
                setValue('ApplicabilityCost', checkForDecimalAndNull(RMCC, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'BOP + CC':
                totalCost = BOPCC * calculatePercentage(percent)
                setApplicabilityCost(BOPCC)
                setValue('ApplicabilityCost', checkForDecimalAndNull(BOPCC, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'CC':
                totalCost = (ConversionCostForCalculation) * calculatePercentage(percent)
                setApplicabilityCost(ConversionCostForCalculation)
                setValue('ApplicabilityCost', checkForDecimalAndNull(ConversionCostForCalculation, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'RM + CC + BOP':
            case 'Part Cost + CC + BOP':
                totalCost = (RMBOPCC) * calculatePercentage(percent)
                setApplicabilityCost(RMBOPCC)
                setValue('ApplicabilityCost', checkForDecimalAndNull(RMBOPCC, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'RM + BOP':
            case 'Part Cost + BOP':
                totalCost = (RMBOP) * calculatePercentage(percent)
                setApplicabilityCost(RMBOP)
                setValue('ApplicabilityCost', checkForDecimalAndNull(RMBOP, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Net Cost':
                totalCost = (totalTabCost) * calculatePercentage(percent)
                setApplicabilityCost(totalTabCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(totalTabCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Surface Treatment Cost':
                totalCost = (dataList?.NetSurfaceTreatmentCost) * calculatePercentage(percent)
                setValue('ApplicabilityCost', checkForDecimalAndNull(dataList?.NetSurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice))
                setApplicabilityCost(dataList?.NetSurfaceTreatmentCost)
                break;
            case 'Overhead Cost':
                totalCost = (overheadAndProfitTabDataValue?.OverheadCost) * calculatePercentage(percent)
                setApplicabilityCost(overheadAndProfitTabDataValue?.OverheadCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(overheadAndProfitTabDataValue?.OverheadCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Profit Cost':
                totalCost = (overheadAndProfitTabDataValue?.ProfitCost) * calculatePercentage(percent)
                setApplicabilityCost(overheadAndProfitTabDataValue?.ProfitCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(overheadAndProfitTabDataValue?.ProfitCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Rejection Cost':
                totalCost = (overheadAndProfitTabDataValue?.RejectionCost) * calculatePercentage(percent)
                setApplicabilityCost(overheadAndProfitTabDataValue?.RejectionCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(overheadAndProfitTabDataValue?.RejectionCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'ICC Cost':
                totalCost = (overheadAndProfitTabDataValue?.ICCCost) * calculatePercentage(percent)
                setApplicabilityCost(overheadAndProfitTabDataValue?.ICCCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(overheadAndProfitTabDataValue?.ICCCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Payment terms Cost':
                totalCost = (overheadAndProfitTabDataValue?.PaymentTermCost) * calculatePercentage(percent)
                setApplicabilityCost(overheadAndProfitTabDataValue?.PaymentTermCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(overheadAndProfitTabDataValue?.PaymentTermCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Packaging Cost':
                totalCost = (packageAndFreightTabData?.CostingPartDetails?.PackagingNetCost) * calculatePercentage(percent)
                setApplicabilityCost(packageAndFreightTabData?.CostingPartDetails?.PackagingNetCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(packageAndFreightTabData?.CostingPartDetails?.PackagingNetCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Freight Cost':
                totalCost = (packageAndFreightTabData?.CostingPartDetails?.FreightNetCost) * calculatePercentage(percent)
                setApplicabilityCost(packageAndFreightTabData?.CostingPartDetails?.FreightNetCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(packageAndFreightTabData?.CostingPartDetails?.FreightNetCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            case 'Tool Cost':
                totalCost = (dataList?.ToolCost) * calculatePercentage(percent)
                setApplicabilityCost(dataList?.ToolCost)
                setValue('ApplicabilityCost', checkForDecimalAndNull(dataList?.ToolCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
            default:
                totalCost = getValues('ApplicabilityCost')
                setApplicabilityCost(totalCost)
                setValue('AnyOtherCost', checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice))
                break;
        }
        setValue('AnyOtherCost', checkForDecimalAndNull(totalCost, initialConfiguration?.NoOfDecimalForPrice))
        setOtherCost(totalCost)
    }
    const onFinalSubmit = () => {
        props.closeDrawer('submit', state.discountTotalCost, state.tableData)
        dispatch(setOtherDiscountData({ gridData: state.tableData, totalCost: state.discountTotalCost }))
    }
    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={"drawer-wrapper layout-min-width-720px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{"Add Discount Cost"}</h3>
                                </div>
                                <div
                                    onClick={() => props.closeDrawer('cancel')}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className='hidepage-size'>
                                <Row>
                                    {initialConfiguration?.IsShowCRMHead && <Col md="4">
                                        <SearchableSelectHookForm
                                            name={`crmHeadOtherCost`}
                                            type="text"
                                            label="CRM Head"
                                            errors={errors.crmHeadOtherCost}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                            }}
                                            placeholder={'Select'}
                                            options={CRMHeads}
                                            required={false}
                                            handleChange={() => { }}
                                            disabled={CostingViewMode}
                                        />
                                    </Col>}

                                    <Col md="4" >
                                        <TextFieldHookForm
                                            label="Discount Description"
                                            name={"OtherCostDescription"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: true,
                                                validate: { checkWhiteSpaces, hashValidation },
                                                maxLength: 80
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={""}
                                            className=""
                                            customClassName={"withBorder"}
                                            errors={errors.OtherCostDescription}
                                            disabled={CostingViewMode ? true : false}
                                        />
                                    </Col>


                                    {
                                        <Col md="4">
                                            <SearchableSelectHookForm
                                                label={'Discount Applicability'}
                                                name={'OtherCostApplicability'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: true }}
                                                register={register}
                                                defaultValue={state.otherDiscountApplicabilityType.length !== 0 ? state.otherDiscountApplicabilityType : ''}
                                                options={renderListing('Applicability')}
                                                mandatory={true}
                                                disabled={CostingViewMode ? true : false}
                                                handleChange={handleOherCostApplicabilityChange}
                                                errors={errors.OtherCostApplicability}
                                            />
                                        </Col>
                                    }
                                    {
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label="Percentage (%)"
                                                name={"PercentageOtherCost"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: !(CostingViewMode || !(otherCostApplicability && otherCostApplicability.value === 'Percentage')),
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage cannot be greater than 100'
                                                    },
                                                }}
                                                handleChange={(e) => {
                                                    e.preventDefault();
                                                }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors.PercentageOtherCost}
                                                disabled={CostingViewMode || !(otherCostApplicability && otherCostApplicability.value === 'Percentage') ? true : false}
                                            />
                                        </Col>}
                                    {
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Applicability Cost (${currencySource?.label ?? initialConfiguration?.BaseCurrency})`}
                                                name={`ApplicabilityCost`}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: !(CostingViewMode || Object.keys(otherCostApplicability).length === 0 || (otherCostApplicability && otherCostApplicability?.value === 'Percentage')),
                                                    validate: !(CostingViewMode || Object.keys(otherCostApplicability).length === 0 || (otherCostApplicability && otherCostApplicability?.value === 'Percentage'))
                                                        ? { number, checkWhiteSpaces, decimalNumberLimit6 }
                                                        : undefined,
                                                }}
                                                handleChange={(e) => {
                                                    e.preventDefault();
                                                }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors?.ApplicabilityCost}
                                                disabled={(CostingViewMode || Object.keys(otherCostApplicability).length === 0 || (otherCostApplicability && otherCostApplicability?.value === 'Percentage')) ? true : false}
                                            />
                                        </Col>}

                                    <Col md="4">
                                        {/* {(otherCostType.value === 'Percentage' || Object.keys(otherCostType).length === 0) && <TooltipCustom disabledIcon={true} id="drawer-other-cost" tooltipText={"Other Cost = (Other Cost Applicability * Percentage / 100)"} />} */}
                                        <TextFieldHookForm
                                            label="Discount Cost"
                                            name={"AnyOtherCost"}
                                            id="drawer-other-cost"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                            }}
                                            handleChange={(e) => {
                                                e.preventDefault();
                                            }}
                                            defaultValue={""}
                                            className=""
                                            customClassName={"withBorder"}
                                            disabled={true}
                                        />

                                    </Col>
                                    <Col md="4" className={`${initialConfiguration?.IsShowCRMHead ? "mb-3" : "pt-1"} d-flex`}>
                                        {state.isEdit ? (
                                            <>
                                                <button
                                                    type="submit"
                                                    className={`btn btn-primary ${initialConfiguration?.IsShowCRMHead ? '' : 'mt30'} pull-left mr5`}
                                                    disabled={CostingViewMode}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`mr15 ml-1 ${initialConfiguration?.IsShowCRMHead ? '' : 'mt30'} add-cancel-btn cancel-btn`}
                                                    onClick={() => resetData()}
                                                    disabled={CostingViewMode}
                                                >
                                                    <div className={"cancel-icon"}></div>Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    className={`user-btn ${initialConfiguration?.IsShowCRMHead ? '' : 'mt30'} pull-left`}
                                                    disabled={CostingViewMode}
                                                >
                                                    <div className={"plus"}></div>ADD
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`mr15 ml-1 ${initialConfiguration?.IsShowCRMHead ? '' : 'mt30'} reset-btn`}
                                                    disabled={CostingViewMode}
                                                    onClick={() => resetData()}
                                                >
                                                    Reset
                                                </button>
                                            </>
                                        )}
                                    </Col>
                                </Row>
                                <OtherDiscountTable
                                    editItemDetails={editItemDetails}
                                    deleteItem={deleteItem}
                                    tableData={{ gridData: state.tableData, otherCostTotal: state.discountTotalCost }}
                                />
                            </div>
                            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0 pr-0">
                                <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                    <button
                                        type={"button"}
                                        className="reset mr15 cancel-btn"
                                        onClick={() => props.closeDrawer('cancel')}
                                    >
                                        <div className={"cancel-icon"}></div>
                                        {"Cancel"}
                                    </button>

                                    <button
                                        type="button"
                                        className="submit-button save-btn"
                                        disabled={CostingViewMode}
                                        onClick={onFinalSubmit}
                                    >
                                        <div class="save-icon"></div>
                                        {"Save"}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
        </div>
    )
}

export default AddOtherDiscount
