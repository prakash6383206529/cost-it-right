import { Col, Row, Table } from "reactstrap";
import Button from "../../../../layout/Button";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { SearchableSelectHookForm, TextFieldHookForm } from "../../../../layout/HookFormInputs";
import { Controller, useForm, useWatch } from "react-hook-form";
import HeaderTitle from "../../../../common/HeaderTitle";
import { checkForDecimalAndNull, checkForNull, checkWhiteSpaces, maxLength7 } from "../../../../../helper";
import { number } from "joi";
import NoContentFound from "../../../../common/NoContentFound";
import { EMPTY_DATA } from "../../../../../config/constants";
import TooltipCustom from "../../../../common/Tooltip";
import { useSelector } from "react-redux";
import _ from "lodash";
const tableheaders = ['Raw Material', 'Mic', 'Density', 'GSM', 'Weight', 'Rate', 'Rate Per Kg']
export default function Lamination(props) {
    const [state, setState] = useState({
        showAccordion: true,
        tableData: [],
        RmContainer: [],
        totalGSM: 0,
        totalRatePerKg: 0,
        exactValues: {}
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
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const fieldsToWatch = useMemo(() => {
        if (!state.tableData?.length) return [];

        let tempGSM = [];
        let tempMic = [];
        for (let i = 0; i < state.tableData.length; i++) {
            tempGSM.push(`GSM${state.tableData[i]?.value}${i}`);
            tempMic.push(`Mic${state.tableData[i]?.value}${i}`);
        }
        return [...tempGSM, ...tempMic];
    }, [state.tableData]);
    const tableInputsValues = useWatch({
        control: controlCalculatorForm,
        name: fieldsToWatch,
    });
    const handleAccordion = () => {
        setState((prevState) => ({ ...prevState, showAccordion: !prevState.showAccordion }))
    }
    const calculateValues = useCallback(() => {
        if (!state.tableData?.length) return;

        let totalGSM = 0;
        let totalRatePerKg = 0;
        let updates = {};
        let exactValues = {}; // Store exact values for calculations

        // First pass - calculate total GSM using exact values
        for (let i = 0; i < state.tableData.length; i++) {
            const gsmKey = `GSM${state.tableData[i]?.value}${i}`;
            const ratePerKgKey = `RatePerKg${state.tableData[i]?.value}${i}`;
            // Get the exact value if it exists, otherwise use the form value
            const singleGSMValue = exactValues[gsmKey] || checkForNull(getValuesCalculatorForm(gsmKey));
            const singleRatePerKg = exactValues[ratePerKgKey] || checkForNull(getValuesCalculatorForm(ratePerKgKey));
            totalGSM += singleGSMValue;
            totalRatePerKg += singleRatePerKg;
        }

        // Second pass - calculate updates
        for (let i = 0; i < state.tableData.length; i++) {
            const micKey = `Mic${state.tableData[i]?.value}${i}`;
            const gsmKey = `GSM${state.tableData[i]?.value}${i}`;
            const weightKey = `weight${state.tableData[i]?.value}${i}`;
            const ratePerKgKey = `RatePerKg${state.tableData[i]?.value}${i}`;

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

            const ratePerKg = state.tableData[i]?.RawMaterialRate * exactValues[weightKey];
            // Store exact rate per kg value
            exactValues[ratePerKgKey] = ratePerKg;
            // Store rounded value for display
            updates[ratePerKgKey] = checkForDecimalAndNull(ratePerKg, NoOfDecimalForInputOutput);
        }
        props.getRatePerKg(totalRatePerKg)
        return {
            updates,  // Rounded values for display
            exactValues, // Exact values for calculations
            totalGSM: totalGSM, // Using exact total
            totalRatePerKg: totalRatePerKg // Using exact total
        };
    }, [state.tableData, getValuesCalculatorForm, tableInputsValues, state.totalGSM, state.totalRatePerKg]);
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
    const rmHandleChange = (e) => {
        let temp = state.RmContainer;
        temp.push(e);
        setState((prevState) => ({ ...prevState, RmContainer: temp }))
    }
    const onSubmit = (data) => {
        // console.log(data);
        setState((prevState) => ({ ...prevState, tableData: state.RmContainer }))
    }
    const resetTable = () => {
        state.tableData.length !== 0 && state.tableData.map((item, index) => {
            setValueCalculatorForm(`GSM${item?.value}${index}`, '')
            setValueCalculatorForm(`Mic${item?.value}${index}`, '')
            setValueCalculatorForm(`weight${item?.value}${index}`, '')
            setValueCalculatorForm(`RatePerKg${item?.value}${index}`, '')
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
    const headerInputDisabled = props?.CostingViewMode ? props?.CostingViewMode : state.tableData?.length !== 0 ? true : false
    return <>
        <Row>
            <Col md={10}>
                <HeaderTitle
                    title={'Laminations:'} />
            </Col>
            <Col md={2}>
                <Button variant="btn-small-primary-circle " className="ml-1 float-right" onClick={handleAccordion}>
                    <i className={`${state.showAccordion ? 'fa fa-minus' : 'fa fa-plus'}`}></i>
                </Button>
            </Col>
        </Row>
        {state.showAccordion && <> <form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mx-0 align-items-center">
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
                        options={props.renderListing('RawMaterial')}
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
            <Row>
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

                            {state.tableData?.length !== 0 ? <>
                                {state.tableData?.map((item, index) => <tr key={item?.RawMaterialId}>
                                    <td>{item?.label}</td>
                                    <td> <TextFieldHookForm
                                        label={false}
                                        name={`Mic${item?.value}${index}`}
                                        Controller={Controller}
                                        control={controlCalculatorForm}
                                        register={registerCalculatorForm}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: {},
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                        errors={errorsCalculatorForm[`Mic${item?.value}${index}`]}
                                        disabled={props?.CostingViewMode || item?.Density === 0 ? true : false}
                                    /></td>
                                    <td>
                                        {item?.Density}
                                    </td>
                                    <td> <TextFieldHookForm
                                        label={false}
                                        name={`GSM${item?.value}${index}`}
                                        Controller={Controller}
                                        control={controlCalculatorForm}
                                        register={registerCalculatorForm}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: {},
                                        }}
                                        handleChange={(e) => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                        errors={errorsCalculatorForm[`GSM${item?.value}${index}`]}
                                        disabled={props?.CostingViewMode || item?.Density !== 0 ? true : false}
                                    /></td>
                                    <td> <TextFieldHookForm
                                        label={false}
                                        name={`weight${item?.value}${index}`}
                                        Controller={Controller}
                                        control={controlCalculatorForm}
                                        register={registerCalculatorForm}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, maxLength7 },
                                        }}
                                        // handleChange={(e) => { calculateFluteValue(item.value, index, e.target.value, checkForNull(getValuesCalculatorForm(`flutePercentage${item.value}${index}`))) }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                        errors={errorsCalculatorForm[`weight${item?.value}${index}`]}
                                        disabled={true}
                                    /></td>
                                    <td>{item?.RawMaterialRate}</td>
                                    <td><TextFieldHookForm
                                        label={false}
                                        name={`RatePerKg${item?.value}${index}`}
                                        Controller={Controller}
                                        control={controlCalculatorForm}
                                        register={registerCalculatorForm}
                                        mandatory={false}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, maxLength7 },
                                        }}
                                        // handleChange={(e) => { calculateFluteValue(item.value, index, e.target.value, checkForNull(getValuesCalculatorForm(`flutePercentage${item.value}${index}`))) }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder paper-corrugated-box-flute mb-0'}
                                        errors={errorsCalculatorForm[`RatePerKg${item?.value}${index}`]}
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
                                    <TooltipCustom id="totalRatePerKg" disabledIcon={true} tooltipText={`Layer 1 Rate Per Kg + (Layer 2 Rate Per Kg +Flute)+Layer 3 Rate Per Kg...`} /> <div className='w-fit' id="totalRatePerKg">{checkForDecimalAndNull(state.totalRatePerKg, 2)}</div>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>}
    </>
}