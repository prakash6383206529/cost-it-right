import { Col, Row, Table } from "reactstrap";
import Button from "../../../../../layout/Button";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { SearchableSelectHookForm, TextFieldHookForm } from "../../../../../layout/HookFormInputs";
import { Controller, useForm, useWatch } from "react-hook-form";
import { checkForDecimalAndNull, checkForNull, checkWhiteSpaces, loggedInUserId, maxLength7 } from "../../../../../../helper";
import NoContentFound from "../../../../../common/NoContentFound";
import TooltipCustom from "../../../../../common/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { saveRawMaterialCalculationForLamination } from "../../../../../rfqAuction/actions/CostWorking";
import Toaster from "../../../../../common/Toaster";
import { EMPTY_DATA } from "../../../../../../config/constants";
const tableheaders = ['Raw Material', 'Mic', 'Density', 'GSM', 'Weight', 'Rate', 'Rate Per Kg']
export default function Lamination(props) {
    const [state, setState] = useState({
        showAccordion: true,
        tableData: [],
        RmContainer: [],
        totalGSM: 0,
        totalRatePerKg: 0,
        exactValues: {},
    })
    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
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
    const { rmRowData, rmData, item } = props
    const dispatch = useDispatch()
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const fieldsToWatch = useMemo(() => {
        if (!state.tableData?.length) return [];

        let tempGSM = [];
        let tempMic = [];
        for (let i = 0; i < state.tableData.length; i++) {
            tempGSM.push(`GSM${state.tableData[i]?.RawMaterialIdRef}${i}`);
            tempMic.push(`Mic${state.tableData[i]?.RawMaterialIdRef}${i}`);
        }
        return [...tempGSM, ...tempMic];
    }, [state.tableData]);
    const tableInputsValues = useWatch({
        control: controlCalculatorForm,
        name: fieldsToWatch,
    });

    const calculateValues = useCallback(() => {
        if (!state.tableData?.length) return;

        let totalGSM = 0;
        let totalRatePerKg = 0;
        let updates = {};
        let exactValues = {}; // Store exact values for calculations

        // First pass - calculate total GSM using exact values
        for (let i = 0; i < state.tableData.length; i++) {
            const gsmKey = `GSM${state.tableData[i]?.RawMaterialIdRef}${i}`;
            const ratePerKgKey = `RatePerKg${state.tableData[i]?.RawMaterialIdRef}${i}`;
            // Get the exact value if it exists, otherwise use the form value
            const singleGSMValue = exactValues[gsmKey] || checkForNull(getValuesCalculatorForm(gsmKey));
            const singleRatePerKg = exactValues[ratePerKgKey] || checkForNull(getValuesCalculatorForm(ratePerKgKey));
            totalGSM += singleGSMValue;
            totalRatePerKg += singleRatePerKg;
        }

        // Second pass - calculate updates
        for (let i = 0; i < state.tableData.length; i++) {
            const micKey = `Mic${state.tableData[i]?.RawMaterialIdRef}${i}`;
            const gsmKey = `GSM${state.tableData[i]?.RawMaterialIdRef}${i}`;
            const weightKey = `weight${state.tableData[i]?.RawMaterialIdRef}${i}`;
            const ratePerKgKey = `RatePerKg${state.tableData[i]?.RawMaterialIdRef}${i}`;

            const singleMicValue = checkForNull(getValuesCalculatorForm(micKey));

            if (singleMicValue && state.tableData[i]?.Density) {
                const calculatedGSM = state.tableData[i]?.Density * singleMicValue;
                // Store exact GSM value
                exactValues[gsmKey] = calculatedGSM;
                // Store rounded value for display
                updates[gsmKey] = checkForDecimalAndNull(calculatedGSM, NoOfDecimalForInputOutput);
            }

            const currentGSM = exactValues[gsmKey] || checkForNull(getValuesCalculatorForm(gsmKey));
            const calculatedWeight = totalGSM > 0 ? Number(currentGSM) / totalGSM : 0;
            // Store exact weight value
            exactValues[weightKey] = calculatedWeight;
            // Store rounded value for display
            updates[weightKey] = checkForDecimalAndNull(calculatedWeight, NoOfDecimalForInputOutput);

            const ratePerKg = state.tableData[i]?.RMRateInKg * exactValues[weightKey];
            // Store exact rate per kg value
            exactValues[ratePerKgKey] = ratePerKg;
            // Store rounded value for display
            updates[ratePerKgKey] = checkForDecimalAndNull(ratePerKg, NoOfDecimalForInputOutput);
        }
        // props.getRatePerKg(totalRatePerKg)
        return {
            updates,  // Rounded values for display
            exactValues, // Exact values for calculations
            totalGSM: totalGSM, // Using exact total
            totalRatePerKg: totalRatePerKg // Using exact total
        };
    }, [state.tableData, getValuesCalculatorForm, tableInputsValues, state.totalGSM, state.totalRatePerKg]);
    useEffect(() => {
        if (rmRowData && rmRowData?.WeightCalculatorRequest && rmRowData?.WeightCalculatorRequest?.CorrugatedLaminateWeightCalculatorId) {
            const { WeightCalculatorRequest } = rmRowData
            let rmContainer = [];
            // setState((prevState) => ({ ...prevState, CorrugatedLaminateWeightCalculatorId: rmRowData?.WeightCalculatorRequest?.CorrugatedLaminateWeightCalculatorId }))
            // WeightCalculatorRequest?.CostingCorrugatedLaminateAdditionalRawMaterials?.map((item) => {
            //     rmContainer.push({ label: item?.RawMaterialNameAndGrade, value: item?.RawMaterialIdRef, })
            //     return null
            // })
            // setState((prevState) => ({ ...prevState, RmContainer: rmContainer }))
            WeightCalculatorRequest?.CostingCorrugatedLaminateAdditionalRawMaterials?.map((item, index) => {
                rmContainer.push({ label: item?.RawMaterialNameAndGrade, value: item?.RawMaterialIdRef, })
                setValueCalculatorForm(`GSM${item?.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item?.GSM, NoOfDecimalForInputOutput))
                setValueCalculatorForm(`Mic${item?.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item?.MIC, NoOfDecimalForInputOutput))
                setValueCalculatorForm(`weight${item?.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item?.Weight, NoOfDecimalForInputOutput))
                setValueCalculatorForm(`RatePerKg${item?.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item?.RMCost, NoOfDecimalForPrice))
            })
            setState((prevState) => ({ ...prevState, RmContainer: rmContainer, tableData: WeightCalculatorRequest?.CostingCorrugatedLaminateAdditionalRawMaterials }))

        }
    }, [])
    useEffect(() => {
        const result = calculateValues();
        if (!result) return;

        const { updates, exactValues, totalGSM, totalRatePerKg } = result;

        // Update form with rounded values for display
        Object.entries(updates).forEach(([key, value]) => {
            const currentValue = getValuesCalculatorForm(key);
            if (currentValue !== value) {
                setValueCalculatorForm(key, value);
            }
        });

        // Store exact values in state for future calculations
        setState(prevState => ({
            ...prevState,
            exactValues: exactValues, // Add this to your state interface
            totalGSM: totalGSM,
            totalRatePerKg: totalRatePerKg
        }));
    }, [tableInputsValues, calculateValues]);
    const removeFromList = (index) => {
        setState((prevState) => ({
            ...prevState,
            RmContainer: prevState.RmContainer?.filter((_, ind) => ind !== index)
        }));
    }
    const renderListing = (label) => {
        let temp = []
        switch (label) {
            case 'RawMaterial':
                rmData && rmData.map((item) => {
                    temp.push({ label: item?.RMName, value: item?.RawMaterialId, RawMaterialIdRef: item?.RawMaterialId, RMRateInKg: item?.RMRate, Density: item?.Density })
                    return null
                })
                return temp;

            default:
                return temp;
        }
    }
    const rmHandleChange = (e) => {
        let temp = state.RmContainer;
        temp.push(e);
        setState((prevState) => ({ ...prevState, RmContainer: temp }))
    }
    const addDataInTable = (data) => {
        setState((prevState) => ({ ...prevState, tableData: state.RmContainer }))
    }
    const resetTable = () => {
        state.tableData.length !== 0 && state.tableData.map((item, index) => {
            setValueCalculatorForm(`GSM${item?.RawMaterialIdRef}${index}`, '')
            setValueCalculatorForm(`Mic${item?.RawMaterialIdRef}${index}`, '')
            setValueCalculatorForm(`weight${item?.RawMaterialIdRef}${index}`, '')
            setValueCalculatorForm(`RatePerKg${item?.RawMaterialIdRef}${index}`, '')
        })
    }
    const resetData = () => {
        for (const key in errorsCalculatorForm) {
            if (key.startsWith('GSM')) {
                delete errorsCalculatorForm[key];
            }
        }
        if (getValuesCalculatorForm('RMCost') === 0 || getValuesCalculatorForm('RMCost') === undefined || getValuesCalculatorForm('RMCost') === null) {
            setState((prevState) => ({ ...prevState, tableData: [], RmContainer: [], totalGSM: 0, totalRatePerKg: 0 }))
            resetTable()
            return false
        } else {
            setState((prevState) => ({ ...prevState, showPopup: true, totalGSM: 0, totalRatePerKg: 0 }))
        }
    }
    const cancelHandler = () => {
        props.toggleDrawer((rmRowData && rmRowData?.WeightCalculatorRequest && rmRowData?.WeightCalculatorRequest?.CorrugatedAndMonoCartonBoxWeightCalculatorId) ? 'Laminate' : '')
    }
    const onSubmit = (data) => {

        let CostingCorrugatedLaminateAdditionalRawMaterials = []
        state.tableData.map((item, index) => {
            CostingCorrugatedLaminateAdditionalRawMaterials.push({
                "CorrugatedLaminateAdditionalDetailId": 0,
                "CostingRawMaterialCorrugatedLaminateCalculationDetailIdRef": 0,
                "RawMaterialIdRef": item?.RawMaterialIdRef,
                "MIC": checkForDecimalAndNull(getValuesCalculatorForm(`Mic${item?.RawMaterialIdRef}${index}`), NoOfDecimalForInputOutput),
                "GSM": checkForDecimalAndNull(getValuesCalculatorForm(`GSM${item?.RawMaterialIdRef}${index}`), NoOfDecimalForInputOutput),
                "Density": item?.Density,
                "Weight": checkForDecimalAndNull(getValuesCalculatorForm(`weight${item?.RawMaterialIdRef}${index}`), NoOfDecimalForInputOutput),
                "RMRateInKg": item?.RMRateInKg,
                "RMCost": checkForDecimalAndNull(getValuesCalculatorForm(`RatePerKg${item?.RawMaterialIdRef}${index}`), NoOfDecimalForInputOutput),
                "RawMaterialNameAndGrade": item?.label
            })
        })
        let formData = {
            "CorrugatedLaminateWeightCalculatorId": 0,
            "BaseCostingIdRef": item?.CostingId,
            "CostingRawMaterialDetailsIdRef": rmRowData?.RawMaterialDetailId,
            "LoggedInUserId": loggedInUserId(),
            "TotalRMCost": state.totalRatePerKg,
            "TotalGsm": state.totalGSM,
            "CostingCorrugatedLaminateAdditionalRawMaterials": CostingCorrugatedLaminateAdditionalRawMaterials
        }
        dispatch(saveRawMaterialCalculationForLamination(formData, (res) => {
            if (res?.data?.Result) {
                formData.WeightCalculationId = res.data?.Identity
                formData.CalculatorType = 'Laminate'
                formData.RawMaterialCost = state.totalRatePerKg
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', formData)
            }
        }))
    }
    const headerInputDisabled = props?.CostingViewMode ? props?.CostingViewMode : state.tableData?.length !== 0 ? true : false
    return <>

        <> <form onSubmit={handleSubmit(addDataInTable)}>
            <Row className="mx-0 align-items-center mt-2">
                <Col md={4}>
                    <SearchableSelectHookForm
                        label={"Type of Paper (Raw Material)"}
                        name={"RawMaterial"}
                        tooltipId={"RawMaterial"}
                        placeholder={"Select"}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={""}
                        options={renderListing('RawMaterial')}
                        mandatory={true}
                        isMulti={false}
                        errors={errors.RawMaterial}
                        disabled={props?.CostingViewMode ? props?.CostingViewMode : state.tableData.length !== 0 ? true : false}
                        handleChange={(e) => rmHandleChange(e)}
                    />
                </Col>
                <Col md={4}> <div className={`rm-container-input ${headerInputDisabled ? 'disabled' : ''}`}>
                    {state.RmContainer.map((item, index) => <div className='item' key={item.value}>{item.label}<button type='button' disabled={headerInputDisabled} onClick={() => removeFromList(index)} >x</button></div>)}
                </div></Col>
                <Col md={4}>
                    <Button
                        id="PaperCorrugatedBox_save"
                        type="submit"
                        className="mr5 mb-2 float-left"
                        icon={"plus"}
                        disabled={headerInputDisabled}
                        buttonName={"Add"}
                    /></Col>
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
            </Row>
        </form>
            <form>
                <Row>
                    <Col md="12">
                        <Table responsive bordered className={'table-with-input-data Laminate'}>
                            <thead>
                                <tr>
                                    {tableheaders.map((item, index) => {
                                        return <th key={index}>{item}</th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>

                                {state.tableData?.length !== 0 ? <>
                                    {state.tableData?.map((item, index) => <tr key={item?.RawMaterialId}>
                                        <td>{item?.label ? item?.label : item?.RawMaterialNameAndGrade ?? '-'}</td>
                                        <td> <TextFieldHookForm
                                            label={false}
                                            name={`Mic${item?.RawMaterialIdRef}${index}`}
                                            Controller={Controller}
                                            control={controlCalculatorForm}
                                            register={registerCalculatorForm}
                                            mandatory={false}
                                            rules={{
                                                required: item?.Density,
                                                validate: {},
                                            }}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                            errors={errorsCalculatorForm[`Mic${item?.RawMaterialIdRef}${index}`]}
                                            disabled={props?.CostingViewMode || !item?.Density ? true : false}
                                        /></td>
                                        <td>
                                            {item?.Density ?? '-'}
                                        </td>
                                        <td> <TextFieldHookForm
                                            label={false}
                                            name={`GSM${item?.RawMaterialIdRef}${index}`}
                                            Controller={Controller}
                                            control={controlCalculatorForm}
                                            register={registerCalculatorForm}
                                            mandatory={false}
                                            rules={{
                                                required: !item?.Density,
                                                validate: {},
                                            }}
                                            handleChange={(e) => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                            errors={errorsCalculatorForm[`GSM${item?.RawMaterialIdRef}${index}`]}
                                            disabled={props?.CostingViewMode || item?.Density ? true : false}
                                        /></td>
                                        <td> <TextFieldHookForm
                                            label={false}
                                            name={`weight${item?.RawMaterialIdRef}${index}`}
                                            Controller={Controller}
                                            control={controlCalculatorForm}
                                            register={registerCalculatorForm}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: {},
                                            }}
                                            // handleChange={(e) => { calculateFluteValue(item.value, index, e.target.value, checkForNull(getValuesCalculatorForm(`flutePercentage${item.value}${index}`))) }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                            errors={errorsCalculatorForm[`weight${item?.RawMaterialIdRef}${index}`]}
                                            disabled={true}
                                        /></td>
                                        <td>{item?.RMRateInKg}</td>
                                        <td><TextFieldHookForm
                                            label={false}
                                            name={`RatePerKg${item?.RawMaterialIdRef}${index}`}
                                            Controller={Controller}
                                            control={controlCalculatorForm}
                                            register={registerCalculatorForm}
                                            mandatory={false}
                                            rules={{
                                                required: true,
                                                validate: {},
                                            }}
                                            // handleChange={(e) => { calculateFluteValue(item.value, index, e.target.value, checkForNull(getValuesCalculatorForm(`flutePercentage${item.value}${index}`))) }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                            errors={errorsCalculatorForm[`RatePerKg${item?.RawMaterialIdRef}${index}`]}
                                            disabled={true}
                                        /></td>
                                    </tr>
                                    )}

                                </>
                                    : <tr>
                                        <td colSpan={tableheaders.length}><NoContentFound title={EMPTY_DATA} /></td>
                                    </tr>}
                                <tr className='table-footer'>
                                    <td colSpan={3} className='text-right'>
                                        Total GSM of Lamination:
                                    </td>
                                    <td colSpan={1}>
                                        <TooltipCustom id="totalGSM" disabledIcon={true} tooltipText={`Layer 1 GSM + (Layer 2 GSM +Flute)+Layer 3 GSM...`} /> <div className='w-fit' id="totalGSM">{checkForDecimalAndNull(state.totalGSM, NoOfDecimalForInputOutput)}</div>
                                    </td>
                                    <td colSpan={2} className='text-right'>
                                        Total Rate Per Kg:
                                    </td>
                                    <td colSpan={1}>
                                        <TooltipCustom id="totalRatePerKg" disabledIcon={true} tooltipText={`Layer 1 Rate Per Kg + (Layer 2 Rate Per Kg +Flute)+Layer 3 Rate Per Kg...`} /> <div className='w-fit' id="totalRatePerKg">{checkForDecimalAndNull(state.totalRatePerKg, NoOfDecimalForPrice)}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
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
                            type="button"
                            onClick={handleSubmitCalculatorForm(onSubmit)}
                            disabled={props.CostingViewMode}
                            icon={"save-icon"}
                            buttonName={"Save"} />
                    </Col>
                </Row>}
            </form>
        </>
    </>
}