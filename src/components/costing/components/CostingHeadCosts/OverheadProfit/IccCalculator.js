import React, { useState, useEffect, useContext } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Container, Row } from 'reactstrap'
import { saveRawMaterialCalculationForSheetMetal } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, loggedInUserId, calculateWeight, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation, calculateScrapWeight, calculatePercentage } from '../../../../../helper'
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
import { getIccCalculation } from '../../../actions/Costing'
import TableRenderer from '../../../../common/TableRenderer'
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo'

function IccCalculator(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    const { rmRowData, item, CostingViewMode } = props
    const localStorage = reactLocalStorage.getObject('InitialConfiguration');
    const { finishWeightLabel } = useLabels()
    const headerCosts = useContext(netHeadCostContext);
    const costData = useContext(costingInfoContext);
    const { SurfaceTabData, PackageAndFreightTabData, IsIncludedSurfaceInOverheadProfit, OverheadProfitTabData, includeOverHeadProfitIcc, includeToolCostIcc, ToolTabData } = useSelector(state => state.costing)


    const defaultValues = {
        StripWidth: WeightCalculatorRequest && WeightCalculatorRequest?.StripWidth !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.StripWidth, localStorage.NoOfDecimalForInputOutput) : '',
        Thickness: WeightCalculatorRequest && WeightCalculatorRequest?.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, localStorage.NoOfDecimalForInputOutput) : '',
        Pitch: WeightCalculatorRequest && WeightCalculatorRequest?.Pitch !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Pitch, localStorage.NoOfDecimalForInputOutput) : '',
        Cavity: WeightCalculatorRequest && WeightCalculatorRequest?.Cavity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Cavity, localStorage.NoOfDecimalForInputOutput) : 1,
        NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest?.NetSurfaceArea !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetSurfaceArea, localStorage.NoOfDecimalForInputOutput) : '',
        GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest?.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',
        FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, localStorage.NoOfDecimalForInputOutput) : '',
        scrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest?.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '',
    }

    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
            defaultValues: defaultValues,
        })

    const [state, setState] = useState({
        inventoryTypeDetails: [],
        wipCompositionMethodDetails: [],
        annualInterestPercent: 0,
        totalWipCost: 0,
    })


    const fieldValues = useWatch({
        control,
        name: ['InterestOnReceivables'],
    })

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getIccCalculation(props.iccInterestRateId, props.costingId, (response) => {
            let data = response?.data?.Data
            setValue("InterestOnReceivables", data?.CreditBasedAnnualICCPercent)
            setState({
                inventoryTypeDetails: data?.CostingInterestRateInventoryTypeDetails,
                wipCompositionMethodDetails: data?.CostingInterestRateWIPCompositionMethodDetails,
                annualInterestPercent: data?.CreditBasedAnnualICCPercent
            })
            checkInventoryApplicability(data?.CostingInterestRateWIPCompositionMethodDetails,data?.CreditBasedAnnualICCPercent)
        }))
    }, [])

    useEffect(() => {
        setState(prev => ({
            ...prev,
            totalWipCost: state.wipCompositionMethodDetails?.reduce((acc, item) => acc + item.ApplicabilityCost, 0)
        }))
    }, [state.wipCompositionMethodDetails])
    console.log(state?.totalWipCost,'state?.totalWipCost');
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
                    case 'Paint':
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
     * @method renderListing
     * @description Used show listing of unit of measurement
     */
    const renderListing = (label) => {
        const temp = []


    }


    /**
     * @method cancel
     * @description used to Reset form
     */
    const cancel = () => {
        props.closeCalculator()
    }

    /**
     * @method onSubmit
     * @description Used to Submit the form
     */
    const onSubmit = debounce(handleSubmit((values) => {

    }), 500)

    const handleInventoryDayTypeChange = (value) => {
        console.log("value", value)
    }
    const handleApplicabilityCostChange = (e, data) => {
        let val = checkForNull(e.target.value);
        let netCost = 0;
        const updatedwipCompositionMethodDetails = state.wipCompositionMethodDetails.map(item => {
            if (item.InventoryType === data?.InventoryType) {
                netCost = checkForNull((val * item?.InterestDays * state?.annualInterestPercent)/365);
                console.log(netCost,'netCost');
                return { ...item, ApplicabilityCost: val, NetCost: netCost };
            }
            return item;
        });
        setState(prev => ({ ...prev, wipCompositionMethodDetails: updatedwipCompositionMethodDetails }));
        checkInventoryApplicability(updatedwipCompositionMethodDetails,state?.annualInterestPercent)
    }
    const wipCompositionColumns = [
        {
            columnHead: "WIP Head",
            key: "InventoryType",
            identifier: "text",
        },
        {
            columnHead: "Applicabilty Cost",
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
    const inventoryTypeColumns = [
        {
            columnHead: "Inventory Day Type",
            key: "InventoryType",
            identifier: "text",
        },
        {
            columnHead: "No of Days",
            key: "NumberOfDays",
            identifier: "inputOutput",
        },
        {
            columnHead: "Applicabilty Cost",
            key: "ApplicabilityCost",
            identifier: "cost",
        },
        {
            columnHead: "Net Cost",
            key: "NetCost",
            identifier: "cost",
        }
    ]

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
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="3">
                                        <TextFieldHookForm
                                            label={`Markup Factor`}
                                            name={'MarkupFactor'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                required: false,
                                                validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.MarkupFactor}
                                            disabled={CostingViewMode ? true : false}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <TableRenderer
                                            data={state.inventoryTypeDetails}
                                            columns={inventoryTypeColumns}
                                            register={register}
                                            Controller={Controller}
                                            control={control}
                                            errors={errors}
                                            isViewMode={CostingViewMode}
                                            setValue={setValue}
                                        />
                                    </Col>
                                </Row>

                                {/* <NpvCost showAddButton={false} tableData={tableData} hideAction={false} editData={editData} /> */}
                            </div >
                            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                    <button
                                        type={'button'}
                                        className="reset cancel-btn mr15"
                                        onClick={cancel || props?.disabled} >
                                        <div className={'cancel-icon'}></div> {'Cancel'}
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
