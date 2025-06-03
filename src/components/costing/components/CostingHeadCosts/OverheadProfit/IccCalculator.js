import React, { useState, useEffect, useContext } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Container, Row } from 'reactstrap'
import { saveRawMaterialCalculationForSheetMetal } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation, calculateScrapWeight, calculatePercentage, getConfigurationKey } from '../../../../../helper'
import { getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG, G } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'
import { debounce } from 'lodash'
import { maxLength7, nonZero } from '../../../../../helper/validation'
import { useLabels } from '../../../../../helper/core'
import TooltipCustom from '../../../../common/Tooltip'
import { Drawer } from '@material-ui/core'
import { getIccCalculation, saveIccCalculation } from '../../../actions/Costing'
import TableRenderer from '../../../../common/TableRenderer'
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo'
import InventoryDetails from './InventoryTable'
import Button from '../../../../layout/Button'

function IccCalculator(props) {
    const { CostingViewMode } = props
    const headerCosts = useContext(netHeadCostContext);
    const costData = useContext(costingInfoContext);
    const { SurfaceTabData, PackageAndFreightTabData, IsIncludedSurfaceInOverheadProfit, OverheadProfitTabData, includeOverHeadProfitIcc, includeToolCostIcc, ToolTabData } = useSelector(state => state.costing)
    const { costingData, IsCalculatorExist } = useSelector(state => state.costing)
    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: '-',
        })

    const [state, setState] = useState({
        inventoryTypeDetails: [],
        wipCompositionMethodDetails: [],
        annualInterestPercent: 0,
        totalWipCost: 0,
        totalIccReceivable: 0,
        calculatorData: {}
    })


    const fieldValues = useWatch({
        control,
        name: ['InterestOnReceivables'],
    })

    const dispatch = useDispatch()

    useEffect(() => {

        dispatch(getIccCalculation(props.iccInterestRateId, !IsCalculatorExist ? null : costingData?.CostingId, (response) => {
            let data = response?.data?.Data
            setValue("InterestOnReceivables", data?.CreditBasedAnnualICCPercent)
            setValue('MarkupFactor', data?.MarkupFactor)
            setState(prev => ({
                ...prev,
                inventoryTypeDetails: data?.CostingInterestRateInventoryTypeDetails,
                wipCompositionMethodDetails: data?.CostingInterestRateWIPCompositionMethodDetails,
                annualInterestPercent: data?.CreditBasedAnnualICCPercent,
                calculatorData: data
            }))
            checkInventoryApplicability(data?.CostingInterestRateWIPCompositionMethodDetails, data?.CreditBasedAnnualICCPercent)
        }))
    }, [])

    useEffect(() => {
        if (state?.wipCompositionMethodDetails?.length > 0) {
            let totalWipCost = state.wipCompositionMethodDetails?.reduce((acc, item) => acc + item.ApplicabilityCost, 0);
            let totalIccReceivable = state.wipCompositionMethodDetails?.reduce((acc, item) => acc + item.NetCost, 0);
            setState(prev => ({
                ...prev,
                totalWipCost: totalWipCost,
                totalIccReceivable: totalIccReceivable
            }))
            calculateInventoryCarryingCost(totalIccReceivable, 0)
            const updatedInventoryTypeDetails = state.inventoryTypeDetails?.map(item => {
                if (item?.InventoryType === 'WIP') {
                    return {
                        ...item,
                        ApplicabilityCost: totalWipCost,
                        NetCost: checkForNull((totalWipCost * item?.NumberOfDays * state?.annualInterestPercent) / 36500)
                    };
                }
                return item;
            });

            setState(prev => ({
                ...prev,
                inventoryTypeDetails: updatedInventoryTypeDetails
            }));
        }
    }, [state.wipCompositionMethodDetails])

    /**
     * @method checkInventoryApplicability
     * @description Calculates inventory applicability and net costs
     */
    const checkInventoryApplicability = (data, annualInterestPercent) => {
        if (!headerCosts || Text === '' || CostingViewMode || !Array.isArray(data)) {
            return;
        }
        // Calculate net raw materials cost
        const NetRawMaterialsCost = props.isNetWeight && !costData?.IsAssemblyPart && !props.isPartApplicability
            ? (JSON.parse(sessionStorage.getItem('costingArray'))?.[0]?.CostingPartDetails?.CostingRawMaterialsCost[0]?.RMRate || 0) *
            (JSON.parse(sessionStorage.getItem('costingArray'))?.[0]?.CostingPartDetails?.CostingRawMaterialsCost[0]?.FinishWeight || 0)
            : headerCosts.NetRawMaterialsCost;



        const updatedData = data.map(item => {
            const getApplicabilityCost = () => {
                switch (item.InventoryType) {
                    case 'RM':
                        return NetRawMaterialsCost
                    case 'BOP':
                        return headerCosts.NetBoughtOutPartCost
                    case 'Total Paint Cost':
                        return SurfaceTabData[0]?.CostingPartDetails?.TotalPaintCost;
                    case 'Packaging':
                        return PackageAndFreightTabData[0]?.CostingPartDetails?.PackagingNetCost;
                    case 'Tooling':
                        return ToolTabData[0]?.CostingPartDetails?.TotalToolCost;
                    default:
                        return checkForNull(item?.ApplicabilityCost);
                }
            };

            const applicabilityCost = getApplicabilityCost();
            const netCost = item.InventoryType === 'default'
                ? checkForNull(item?.NetCost)
                : checkForNull((applicabilityCost * item?.InterestDays * annualInterestPercent) / 36500);

            return {
                ...item,
                ApplicabilityCost: applicabilityCost,
                NetCost: netCost
            };
        });

        setState(prev => ({
            ...prev,
            wipCompositionMethodDetails: updatedData
        }));
    };

    useEffect(() => {
        if (!CostingViewMode) {
        }
    }, [fieldValues])


    /**
     * @method cancel
     * @description used to Reset form
     */
    const cancel = () => {
        props.closeCalculator(state?.calculatorData, IsCalculatorExist)
    }

    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = debounce(((values) => {
        let formData = {
            "IccDetailId": null,
            "BaseCostingId": costingData?.CostingId,
            "LoggedInUserId": loggedInUserId(),
            "CreditBasedAnnualICCPercent": values?.InterestOnReceivables,
            "MarkupFactor": values?.MarkupFactor,
            "ICCReceivableFromSupplierCost": state?.totalIccReceivable,
            "ICCPayableToSupplierCost": state?.totalIccPayable,
            "NetICC": values?.InventoryCarryingCost,
            "CostingInterestRateInventoryTypeDetails": state?.inventoryTypeDetails,
            "CostingInterestRateWIPCompositionMethodDetails": state?.wipCompositionMethodDetails,
            "InterestRateId": props.iccInterestRateId
        }
        dispatch(saveIccCalculation(formData, (response) => {
            setState(prev => ({ ...prev, calculatorData: formData }))
            props.closeCalculator(formData, true)
        }))
    }), 500)


    const handleApplicabilityCostChange = (e, data) => {
        let val = checkForNull(e.target.value);
        let netCost = 0;
        const updatedwipCompositionMethodDetails = state.wipCompositionMethodDetails.map(item => {
            if (item.InventoryType === data?.InventoryType) {
                netCost = checkForNull((val * item?.InterestDays * state?.annualInterestPercent) / 36500);
                return { ...item, ApplicabilityCost: val, NetCost: netCost };
            }
            return item;
        });
        setState(prev => ({ ...prev, wipCompositionMethodDetails: updatedwipCompositionMethodDetails }));
        checkInventoryApplicability(updatedwipCompositionMethodDetails, state?.annualInterestPercent)
    }
    const wipCompositionColumns = [
        {
            columnHead: "WIP Head",
            key: "InventoryType",
            identifier: "text",
        },
        {
            columnHead: "Applicability Cost",
            key: "ApplicabilityCost",
            identifier: "cost",
            fieldKey: "ApplicabilityCost",
            valueKey: "ApplicabilityCost",
            mandatory: true,
            validate: { number, checkWhiteSpaces, maxLength7 },
            handleChangeFn: handleApplicabilityCostChange,
            type: "textField",
            disabled: (item) => !["Other", "Gases & Welding"].includes(item.InventoryType)
        },
        {
            columnHead: "Inventory Days",
            key: "NumberOfDays",
            identifier: "inputOutput",
        },
        {
            columnHead: "Supplier Credit Days",
            key: "CreditDays",
            identifier: "inputOutput",
        },
        {
            columnHead: "Interest Days",
            key: "InterestDays",
            identifier: "text",
        },
        {
            columnHead: "Interest Cost Per Unit",
            key: "NetCost",
            identifier: "cost",
        },
    ]
    const calculateInventoryCarryingCost = (totalIccReceivable, totalIccPayable) => {
        let totalInventoryCarryingCost = checkForNull(totalIccPayable - totalIccReceivable);
        setValue('InventoryCarryingCost', checkForDecimalAndNull(totalInventoryCarryingCost, getConfigurationKey()?.NoOfDecimalForPrice));
        setState(prev => ({ ...prev, totalIccPayable: totalIccPayable }));
    }
    const setInventoryDetail = (data) => {
        setState(prev => ({ ...prev, inventoryTypeDetails: data }));
    }
    return (

        <div>
            <Drawer anchor={props.anchor} open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>

                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'ICC Details'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <div className='hidepage-size'>
                                <Row>
                                    <Col md="3">
                                        <TextFieldHookForm
                                            name="InterestOnReceivables"
                                            label="Interest on Receivables (%)/ Annual ICC"
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            placeholder="-"
                                            mandatory={false}
                                            handleChange={() => { }}
                                            errors={errors.InterestOnReceivables}
                                            disabled={true}
                                            defaultValue={''}
                                            customClassName={"withBorder"}
                                        />
                                    </Col>

                                </Row >
                                <Row>
                                    <Col md="12">
                                        <TableRenderer
                                            data={state.wipCompositionMethodDetails}
                                            columns={wipCompositionColumns}
                                            register={register}
                                            Controller={Controller}
                                            control={control}
                                            errors={errors}
                                            isViewMode={CostingViewMode}
                                            setValue={setValue}
                                            isWipInventory={true}
                                            totalIccReceivable={state?.totalIccReceivable}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <InventoryDetails
                                        register={register}
                                        Controller={Controller}
                                        control={control}
                                        errors={errors}
                                        isViewMode={CostingViewMode}
                                        setValue={setValue}
                                        inventoryTypeDetails={state?.inventoryTypeDetails}
                                        totalWipCost={state?.totalWipCost}
                                        annualInterestPercent={state.annualInterestPercent}
                                        getValues={getValues}
                                        totalIccReceivable={state?.totalIccReceivable}
                                        calculateInventoryCarryingCost={calculateInventoryCarryingCost}
                                        wipCompositionMethodDetails={state?.wipCompositionMethodDetails}
                                        setInventoryDetail={setInventoryDetail}
                                    />
                                </Row>

                            </div >
                            <Row>
                                <Col md="3">
                                    <TextFieldHookForm
                                        name="InventoryCarryingCost"
                                        label="Inventory Carrying Cost"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        placeholder="-"
                                        mandatory={false}
                                        handleChange={() => { }}
                                        errors={errors.InventoryCarryingCost}
                                        disabled={true}
                                        defaultValue={''}
                                        customClassName={"withBorder"}
                                    />
                                </Col>

                            </Row >
                            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                    <button
                                        type={'button'}
                                        className="reset cancel-btn mr15"
                                        onClick={cancel || props?.disabled} >
                                        <div className={'cancel-icon'}></div> {'Cancel'}
                                    </button>
                                    <button
                                        id="AddOperation_Save"
                                        type="submit"
                                        className="user-btn mr5 save-btn"
                                        disabled={CostingViewMode}
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        <div className={"save-icon"}></div>
                                        {"Save"}
                                    </button>


                                </div>
                            </Row>
                        </div >
                    </Container >
                </div >
            </Drawer >
        </div >

    )
}

export default IccCalculator
