import React, { useState, useEffect, Fragment, useRef } from 'react'
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
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper'
import { MESSAGES } from '../../../../config/message'

function Ferrous(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const [resetLossTable, setResetLossTable] = useState(false);
    const dispatch = useDispatch()
    const { ferrousCalculatorReset } = useSelector(state => state.costing)
    const [addError, setAddError] = useState('');
    const [binderError, setBinderError] = useState('');
    const defaultValues = {
        castingWeight: WeightCalculatorRequest && WeightCalculatorRequest.CastingWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CastingWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        recovery: WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        NetRMRate: WeightCalculatorRequest && WeightCalculatorRequest.NetRMRate !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetRMRate, getConfigurationKey().NoOfDecimalForPrice) : '',
        NetScrapRate: WeightCalculatorRequest && WeightCalculatorRequest.NetScrapRate !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetScrapRate, getConfigurationKey().NoOfDecimalForPrice) : '',
        scrapCost: WeightCalculatorRequest && checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        NetRMCost: WeightCalculatorRequest && checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        BinderOrAdditivesTotalCost: WeightCalculatorRequest && WeightCalculatorRequest.BinderOrAdditivesTotalCost !== undefined
            ? checkForDecimalAndNull(WeightCalculatorRequest.BinderOrAdditivesTotalCost, getConfigurationKey().NoOfDecimalForPrice)
            : '',
    }
    const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
    const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
    const [dataToSend, setDataToSend] = useState(WeightCalculatorRequest)
    const [percentage, setPercentage] = useState(0)
    const [inputFinishWeight, setInputFinishWeight] = useState(0)
    const { rmRowData, rmData, CostingViewMode, item } = props
    const [selectedRm, setSelectedRm] = useState([])
    const [unSelectedRm, setUnSelectedRm] = useState([])
    const [tableRawMaterials, setTableRawMaterials] = useState([]);
    const [binderRawMaterials, setBinderRawMaterials] = useState([]);
    const [binderRm, setBinderRm] = useState([]);
    const [fieldsEnabled, setFieldsEnabled] = useState(false);
    const [showResetPopup, setShowResetPopup] = useState(false);
    const [showUnusedRMsPopup, setShowUnusedRMsPopup] = useState(false);
    const [unusedRMs, setUnusedRMs] = useState([]);
    const [calculatedValues, setCalculatedValues] = useState([]);
    const [calculatedCost, setCalculatedCost] = useState([])
    const [totalCostCalculated, setTotalCostCalculated] = useState(0);
    const [unusedRMsMessage, setUnusedRMsMessage] = useState('');

    const rmGridFields = 'rmGridFields';

    const { register, control, setValue, handleSubmit, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const [netRMCost, setNetRMCost] = useState(0);


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
    const setWeightCalculatorData = (data) => {


        // Set form values
        setValue('castingWeight', checkForDecimalAndNull(data.CastingWeight, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('recovery', checkForDecimalAndNull(data.RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('grossWeight', checkForDecimalAndNull(data.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('finishedWeight', checkForDecimalAndNull(data?.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('scrapWeight', checkForDecimalAndNull(data.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('NetRMRate', checkForDecimalAndNull(data.NetRMRate, getConfigurationKey().NoOfDecimalForPrice));
        setValue('NetScrapRate', checkForDecimalAndNull(data.NetScrapRate, getConfigurationKey().NoOfDecimalForPrice));
        setValue('scrapCost', checkForDecimalAndNull(data.ScrapCost, getConfigurationKey().NoOfDecimalForPrice));
        setValue('NetRMCost', checkForDecimalAndNull(data.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice));
        setValue('otherCost', checkForDecimalAndNull(data.OtherCost, getConfigurationKey().NoOfDecimalForPrice));

        // Set state variables
        setTableVal(data.LossOfTypeDetails || []);
        setLostWeight(data.NetLossWeight || 0);
        setDataToSend(data);
        setTotalCostCalculated(data.BinderOrAdditivesTotalCost || 0);

        // Handle raw materials
        const rawMaterials = data.CostingFerrousCalculationRawMaterials
            .filter(rm => !rm.IsBinders && rm.Percentage > 0)
            .map(rm => ({
                label: rm.RMName,
                value: rm.RawMaterialId,
                RawMaterialRate: rm.RMRate,
                ScrapRate: rm.ScrapRate,
                Percentage: rm.Percentage,
                CostingCalculationDetailId: rm.CostingCalculationDetailId,
                IsBinders: false
            }));

        setTableRawMaterials(rawMaterials);
        rawMaterials.forEach((item, index) => {
            setValue(`rmGridFields.${index}.Percentage`, checkForDecimalAndNull(item.Percentage, getConfigurationKey().NoOfDecimalForInputOutput));
        });

        const binders = data.CostingFerrousCalculationRawMaterials
            .filter(rm => rm.IsBinders)
            .map(rm => ({
                label: rm.RMName,
                value: rm.RawMaterialId,
                RawMaterialRate: rm.RMRate,
                ScrapRate: rm.ScrapRate,
                quantity: rm.BinderQuantity,
                calculatedBindersBasicValue: rm.RMCost || 0,
                CostingCalculationDetailId: rm.CostingCalculationDetailId,
                IsBinders: true
            }));

        setBinderRm(binders);
        setCalculatedCost(binders);

        // Set binder quantities
        binders.forEach((binder, index) => {
            setValue(`binderQuantity.${index}`, checkForDecimalAndNull(binder.quantity, getConfigurationKey().NoOfDecimalForInputOutput));
        });

        // Update calculated values
        const updatedCalculatedValues = rawMaterials.map(item => ({
            ...item,
            calculatedBasicValue: (item.Percentage / 100) * item.RawMaterialRate,
            calculatedScrapValue: (item.Percentage / 100) * item.ScrapRate,
        }));
        setCalculatedValues(updatedCalculatedValues);

        // Set fields enabled if total percentage is 100
        const totalPercentage = rawMaterials.reduce((sum, item) => sum + (item.Percentage || 0), 0);
        setFieldsEnabled(totalPercentage === 100);
        setValue('BinderOrAdditivesTotalCost', checkForDecimalAndNull(data.BinderOrAdditivesTotalCost, getConfigurationKey().NoOfDecimalForPrice));

        // Recalculate Net RM Rate and Net Scrap Rate
        calculateNetRmRate();
        calculateNetScrapRate();
    };
    useEffect(() => {
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length > 0) {
            setWeightCalculatorData(WeightCalculatorRequest);
        }
    }, [WeightCalculatorRequest]);


    const totalPercentageValue = () => {
        let sum = 0;
        tableRawMaterials.forEach((item, index) => {
            sum += parseFloat(getValues(`rmGridFields.${index}.Percentage`) || 0);
        });
        setPercentage(sum);
        setFieldsEnabled(sum === 100 && tableRawMaterials.length > 0);
        return checkForDecimalAndNull(sum, getConfigurationKey().NoOfDecimalForInputOutput);
    };
    const percentageChange = (percentage, index) => {
        setValue(`rmGridFields.${index}.Percentage`, percentage);

        setTimeout(() => {
            const totalPercentage = totalPercentageValue();
            if (totalPercentage > 100) {
                Toaster.warning(`Total percentage is ${totalPercentage}%, must be 100% to save the values`);
                return false;
            }

            const updatedItems = tableRawMaterials.map((item, idx) => {
                const currentPercentage = parseFloat(getValues(`rmGridFields.${idx}.Percentage`) || 0);
                return {
                    ...item,
                    Percentage: currentPercentage,
                    calculatedBasicValue: (currentPercentage / 100) * item.RawMaterialRate,
                    calculatedScrapValue: (currentPercentage / 100) * item.ScrapRate,
                };
            });

            setCalculatedValues(updatedItems);
            calculateNetRmRate();
            calculateNetScrapRate();
            calculateRemainingCalculation();
        }, 300);
    };

    const calculateNetRmRate = () => {
        let NetRMRate = tableRawMaterials.reduce((acc, item, index) => {
            const Percentage = parseFloat(getValues(`rmGridFields.${index}.Percentage`) || 0);
            const BasicRate = parseFloat(item.RawMaterialRate || 0);
            return acc + (Percentage * BasicRate) / 100;
        }, 0);
        setValue('NetRMRate', checkForDecimalAndNull(NetRMRate, getConfigurationKey().NoOfDecimalForPrice));
    };
    useEffect(() => {
        const totalCost = calculateTotalCost();
        setTotalCostCalculated(totalCost);
        calculateRemainingCalculation();
    }, [calculatedCost]);

    const calculateNetScrapRate = () => {
        let NetScrapRate = tableRawMaterials.reduce((acc, item, index) => {
            const Percentage = parseFloat(getValues(`rmGridFields.${index}.Percentage`) || 0);
            const ScrapRate = parseFloat(item.ScrapRate || 0);
            return acc + (Percentage * ScrapRate) / 100;
        }, 0);
        setValue('NetScrapRate', checkForDecimalAndNull(NetScrapRate, getConfigurationKey().NoOfDecimalForPrice));
    };
    const calculateLossWeight = (castingWeight, lossPercentage) => {
        return (castingWeight * lossPercentage) / 100;
    };

    const calculateGrossWeight = (castingWeight, totalLossWeight) => {
        return castingWeight + totalLossWeight;
    };

    const calculateScrapWeight = (castingWeight, finishWeight) => {
        return castingWeight - finishWeight;
    };

    const calculateScrapCost = (scrapWeight, recovery, netScrapRate) => {
        return (scrapWeight * recovery * netScrapRate) / 100;
    };
    const handleAddBinderMaterialsToTable = () => {
        if (binderRawMaterials.length === 0) {
            setBinderError('Please select binders before adding.');
            return;
        }
    
        setBinderError('');
        // Preserve current values
        const currentNetRMRate = getValues('NetRMRate');
        const currentNetScrapRate = getValues('NetScrapRate');
        const currentCastingWeight = getValues('castingWeight');

        // Add selected binders to the table
        setBinderRm(prev => [...prev, ...binderRawMaterials]);
        // Remove the added binders from the main raw materials list
        setTableRawMaterials(prev => prev.filter(item =>
            !binderRawMaterials.some(binder => binder.value === item.value)
        ));
        // Clear the unselected raw materials
        setUnSelectedRm([]);
        setUnSelectedRm(prev => prev.filter(item =>
            !binderRawMaterials.some(binder => binder.value === item.RawMaterialId)
        ));
        // Clear the form value for RawMaterialBinders
        setValue('RawMaterialBinders', []);

        // Clear the searchable select field for binders
        setValueTableForm('RawMaterialBinders', []); // Add this line

        // Clear the selected binder raw materials
        setBinderRawMaterials([]); // Add this line

        // Restore the preserved values
        setValue('NetRMRate', currentNetRMRate);
        setValue('NetScrapRate', currentNetScrapRate);
        setValue('castingWeight', currentCastingWeight);

        // Recalculate total cost
        const newCalculatedCost = [...calculatedCost, ...binderRawMaterials.map(item => ({
            ...item,
            calculatedBindersBasicValue: 0 // Initialize with 0, will be updated when quantity is entered
        }))];
        setCalculatedCost(newCalculatedCost);

        // Trigger recalculation
        calculateRemainingCalculation();
    };
    const calculateNetRMCost = (grossWeight, netRMRate, scrapCost, totalCostCalculated, otherCost, castingWeight) => {
        return ((grossWeight * netRMRate) - scrapCost + totalCostCalculated + otherCost) / castingWeight;
    };

    const calculateRemainingCalculation = React.useCallback(() => {
        const castingWeight = checkForNull(getValues("castingWeight"));
        const finishedWeight = checkForNull(getValues('finishedWeight'));
        const recovery = checkForNull(getValues('recovery'));
        const NetRMRate = checkForNull(getValues('NetRMRate'));
        const NetScrapRate = checkForNull(getValues('NetScrapRate'));
        const otherCost = checkForNull(getValues('otherCost'));

        if (castingWeight) {
            // Calculate loss weight for each type of loss
            const lossWeights = tableVal?.map(loss => ({
                ...loss,
                LossWeight: calculateLossWeight(castingWeight, loss.LossPercentage)
            }));

            // Calculate total loss weight
            const totalLossWeight = lossWeights?.reduce((sum, loss) => sum + loss.LossWeight, 0) || 0;

            // Calculate gross weight
            const grossWeight = calculateGrossWeight(castingWeight, totalLossWeight);

            // Update gross weight in the form and state
            setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput));
            setDataToSend(prev => ({
                ...prev,
                totalGrossWeight: grossWeight,
            }));

            // Set lost weight
            setLostWeight(totalLossWeight);

            // Update loss weights in the table
            setTableVal(prevTableVal => prevTableVal?.map(loss => ({
                ...loss,
                LossWeight: calculateLossWeight(castingWeight, loss.LossPercentage)
            })));

            if (finishedWeight !== undefined && recovery !== undefined && NetScrapRate !== undefined && NetRMRate !== undefined) {
                // Calculate scrap weight
                const scrapWeight = calculateScrapWeight(castingWeight, finishedWeight);

                // Calculate scrap cost
                const scrapCost = calculateScrapCost(scrapWeight, recovery, NetScrapRate);

                // Calculate Net RM Cost
                const NetRMCost = calculateNetRMCost(grossWeight, NetRMRate, scrapCost, totalCostCalculated, otherCost, castingWeight);

                // Update additional state and form values
                setDataToSend(prev => ({
                    ...prev,
                    scrapWeight: scrapWeight,
                    scrapCost: scrapCost,
                    NetRMCost: NetRMCost,
                    RecoveryPercentage: recovery
                }));

                setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput));
                setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice));
                setValue('NetRMCost', checkForDecimalAndNull(NetRMCost, getConfigurationKey().NoOfDecimalForPrice));
                setValue('recovery', checkForDecimalAndNull(recovery, getConfigurationKey().NoOfDecimalForInputOutput));
                setValue('BinderOrAdditivesTotalCost', checkForDecimalAndNull(totalCostCalculated, getConfigurationKey().NoOfDecimalForPrice));
            }
        }

        // Always preserve these values
        setValue('NetRMRate', NetRMRate);
        setValue('NetScrapRate', NetScrapRate);
        setValue('castingWeight', castingWeight);
    }, [getValues, setValue, tableVal, totalCostCalculated]);
    const watchedValues = useWatch({
        control,
        name: ['castingWeight', 'finishedWeight', 'recovery', 'otherCost'],
    });
    useEffect(() => {
        const recovery = getValues('recovery');
        if (recovery !== undefined) {
            calculateRemainingCalculation();
        }
    }, [getValues('recovery')]);
    useEffect(() => {
        if (!CostingViewMode) {
            const debouncedCalculation = debounce(() => {
                calculateRemainingCalculation();
            }, 300);

            debouncedCalculation();

            return () => {
                debouncedCalculation.cancel();
            };
        }
    }, [watchedValues, CostingViewMode]);


    const getUnusedRawMaterials = () => {
        const usedRMs = [
            ...tableRawMaterials.filter((_, index) => checkForNull(getValues(`rmGridFields.${index}.Percentage`)) > 0),
            ...binderRm.filter((_, index) => checkForNull(getValues(`binderQuantity.${index}`)) > 0)
        ].map(rm => rm.value);

        return rmData.filter(rm => !usedRMs.includes(rm.RawMaterialId));
    };

    const closeUnusedRMsPopup = () => {
        setShowUnusedRMsPopup(false);
        setUnusedRMs([]);
    };

    const generateUnusedRMsMessage = (unusedRMs) => {
        const rmStrings = unusedRMs.map(rm => `${rm.RMName}-${rm.RMGrade}`);
        const rmList = rmStrings.join(', ');
        return `Raw materials (${rmList}) are not used in the weight calculator. Remove the unused raw materials to save the calculator. Click "OK" to remove.`;
    };

    const confirmRemoveUnusedRMs = () => {
        setShowUnusedRMsPopup(false);

        // Get the IDs of used raw materials
        const usedRMIds = [
            ...tableRawMaterials.map(rm => rm.value),
            ...binderRm.map(rm => rm.value)
        ];

        // Filter out unused raw materials
        setUnSelectedRm(prev => prev.filter(rm => usedRMIds.includes(rm.RawMaterialId)));

        // If you need to inform the parent component about removed RMs
        if (props.removeUnusedRawMaterials) {
            const removedRMIds = unusedRMs.map(rm => rm.RawMaterialId);
            props.removeUnusedRawMaterials(removedRMIds);
        }

        setUnusedRMs([]);

        // Call the saveRawMaterialCalculation function with only used raw materials
        saveRawMaterialCalculation(usedRMIds);
    };
    const saveCalculation = () => {
        const unusedRMs = getUnusedRawMaterials();


        if (unusedRMs.length > 0) {
            const message = generateUnusedRMsMessage(unusedRMs);


            setUnusedRMs(unusedRMs);
            setShowUnusedRMsPopup(true);
            setUnusedRMsMessage(message);

        } else {
            // All RMs are used, proceed with saving
            saveRawMaterialCalculation();
        }
    };
    const saveRawMaterialCalculation = (usedRMIdsParam) => {
        const formValues = getValues();
        const usedRMIds = usedRMIdsParam || [
            ...tableRawMaterials.map(rm => rm.value),
            ...binderRm.map(rm => rm.value)
        ];
        let obj = {
            FerrousCastingWeightCalculatorId: WeightCalculatorRequest?.WeightCalculationId || 0,
            BaseCostingIdRef: item.CostingId || "00000000-0000-0000-0000-000000000000",
            CostingRawMaterialDetailsIdRef: rmRowData.RawMaterialDetailId || "00000000-0000-0000-0000-000000000000",
            RawMaterialIdRef: rmRowData?.RawMaterialId || "00000000-0000-0000-0000-000000000000",
            LoggedInUserId: loggedInUserId() || "00000000-0000-0000-0000-000000000000",
            FinishWeight: checkForNull(formValues.finishedWeight),
            GrossWeight: checkForNull(dataToSend.totalGrossWeight),
            ScrapWeight: checkForNull(dataToSend.scrapWeight),
            ScrapCost: checkForNull(dataToSend.scrapCost),
            RecoveryPercentage: checkForNull(formValues.recovery),
            NetRMRate: checkForNull(formValues.NetRMRate),
            NetScrapRate: checkForNull(formValues.NetScrapRate),
            CastingWeight: checkForNull(formValues.castingWeight),
            NetLossWeight: checkForNull(lostWeight),
            RawMaterialCost: checkForNull(dataToSend.NetRMCost),
            OtherCost: checkForNull(formValues.otherCost),
            OtherCostDescription: "",
            BinderOrAdditivesTotalCost: checkForNull(totalCostCalculated),
            LossOfTypeDetails: tableVal.map(item => ({
                LossOfTypeId: item.LossOfType,
                LossOfType: item.LossOfType,
                FlashLossId: 0,
                FlashLoss: "",
                FlashLength: 0,
                FlashThickness: 0,
                FlashWidth: 0,
                BarDiameter: 0,
                BladeThickness: 0,
                LossPercentage: item.LossPercentage,
                LossWeight: item.LossWeight,
                CostingCalculationDetailId: item.CostingCalculationDetailId || 0
            })),
            CostingFerrousCalculationRawMaterials: [
                ...tableRawMaterials
                    .filter(item => usedRMIds.includes(item.value))
                    .map((item, index) => {
                        const percentage = checkForNull(getValues(`rmGridFields.${index}.Percentage`));
                        if (percentage > 0) {
                            return {
                                RMName: item.label,
                                RMRate: item.RawMaterialRate,
                                ScrapRate: item.ScrapRate,
                                Percentage: percentage,
                                CostingCalculationDetailId: item.CostingCalculationDetailId || 0,
                                RawMaterialId: item.value,
                                IsBinders: false,
                                BinderQuantity: 0,
                                RMCost: item.calculatedBasicValue,
                                ScrapRateCost: item.calculatedScrapValue
                            };
                        }
                        return null;
                    }).filter(Boolean),
                ...binderRm
                    .filter(item => usedRMIds.includes(item.value))
                    .map((item, index) => {
                        const quantity = checkForNull(getValues(`binderQuantity.${index}`));
                        if (quantity > 0) {
                            return {
                                RMName: item.label,
                                RMRate: item.RawMaterialRate,
                                ScrapRate: item.ScrapRate,
                                Percentage: 0,
                                CostingCalculationDetailId: item.CostingCalculationDetailId || 0,
                                RawMaterialId: item.value,
                                IsBinders: true,
                                BinderQuantity: quantity,
                                RMCost: item.calculatedBindersBasicValue,
                                ScrapRateCost: 0
                            };
                        }
                        return null;
                    }).filter(Boolean)
            ]
        };

        dispatch(saveRawMaterialCalculationForFerrous(obj, res => {
            if (res?.data?.Result) {
                obj.WeightCalculationId = res.data.Identity;
                Toaster.success("Calculation saved successfully");
                props.toggleDrawer('ferrous', obj);
            }
        }));
    };
    const onSubmit = debounce(handleSubmit((values) => {
        if (!fieldsEnabled) {
            Toaster.warning('Please add raw materials and ensure their percentages sum up to 100% before saving.');
            return false;
        }
        if (totalPercentageValue() !== 100) {
            Toaster.warning(`Total percentage is ${totalPercentageValue()}%, must be 100% to save the values`)
            return false;
        }

        saveCalculation();
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

    const {
        register: registerTableForm,
        control: controlTableForm,
        setValue: setValueTableForm,
        getValues: getValuesTableForm,
        formState: { errors: errorsTableForm },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });




    const rawMaterialHandler = (newValue) => {

        if (Array.isArray(newValue) && newValue.some(item => item?.value === 'select_all')) {
            const allOptions = rmData
                .filter(item => item.RawMaterialId !== 'select_all' && !tableRawMaterials.some(tableItem => tableItem.value === item.RawMaterialId))
                .map(({ RMName, RawMaterialId, RMRate, ScrapRate }) => ({
                    label: RMName,
                    value: RawMaterialId,
                    RawMaterialRate: RMRate,
                    ScrapRate: ScrapRate
                }));
            setSelectedRm(allOptions);
            setUnSelectedRm([]);
            setValue('RawMaterial', allOptions);
            setValueTableForm('RawMaterial', allOptions);
        } else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
            setSelectedRm(newValue);
            const newUnselectedRm = rmData.filter(rm =>
                !newValue.some(selected => selected.value === rm.RawMaterialId) &&
                !tableRawMaterials.some(tableItem => tableItem.value === rm.RawMaterialId) &&
                !binderRm.some(binderItem => binderItem.value === rm.RawMaterialId)
            );
            setUnSelectedRm(newUnselectedRm);
            setValue('RawMaterial', newValue);
            setValueTableForm('RawMaterial', newValue);
        } else {
            setSelectedRm([]);
            setUnSelectedRm(rmData.filter(rm => !tableRawMaterials.some(tableItem => tableItem.value === rm.RawMaterialId)));
            setValue('RawMaterial', []);
            setValueTableForm('RawMaterial', []);
        }
    };

    const renderListing = React.useMemo(() => {
        return (label) => {
            switch (label) {
                case 'RawMaterial':
                    if (rmData) {
                        const temp = [
                            { label: "Select All", value: 'select_all' },
                            ...rmData
                                .filter(item =>
                                    !tableRawMaterials.some(tableItem => tableItem.value === item.RawMaterialId) &&
                                    !binderRm.some(binderItem => binderItem.value === item.RawMaterialId)
                                )
                                .map((item) => ({
                                    label: item.RMName,
                                    value: item.RawMaterialId,
                                    RawMaterialRate: item.RMRate,
                                    ScrapRate: item.ScrapRate
                                }))
                        ];

                        // If in edit mode, remove the "Select All" option
                        if (props.isEditFlag) {
                            return temp.filter(item => item.value !== 'select_all');
                        }

                        return temp;
                    }
                    return [];
                case 'RawMaterialBinders':
                    return unSelectedRm
                        .filter(item =>
                            !tableRawMaterials.some(tableItem => tableItem.value === item.RawMaterialId) &&
                            !binderRm.some(binderItem => binderItem.value === item.RawMaterialId)
                        )
                        .map((item) => ({
                            label: item.RMName,
                            value: item.RawMaterialId,
                            RawMaterialRate: item.RMRate,
                            ScrapRate: item.ScrapRate
                        }));
                default:
                    return [];
            }
        };
    }, [rmData, unSelectedRm, props.isEditFlag, tableRawMaterials, binderRm]);
    const rawMaterialBinderHandler = (newValue, action) => {


        const selectedOptions = unSelectedRm?.map(({ RMName, RawMaterialId, RMRate, ScrapRate }) => ({
            label: RMName,
            value: RawMaterialId,
            RawMaterialRate: RMRate,
            ScrapRate: ScrapRate,
        }));

        if (Array.isArray(newValue) && (newValue[0]?.value === 'select_all' || newValue?.some(item => item?.value === 'select_all'))) {
            setBinderRawMaterials(selectedOptions);
            setTimeout(() => {
                setValue('RawMaterialBinders', selectedOptions);
            }, 100);
        } else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
            setBinderRawMaterials(newValue);
        } else {
            setBinderRawMaterials([]);
        }
    };

    const handleAddToTable = () => {
        if (selectedRm.length === 0) {
            setAddError('Please select raw materials before adding.');
            return;
        }

        if (percentage >= 100) {
            setAddError('Total percentage is already 100%. Cannot add more raw materials.');
            return;
        }

        setAddError('');

        const newItems = selectedRm.map(item => ({
            ...item,
            Percentage: 0,
            calculatedBasicValue: 0,
            calculatedScrapValue: 0,
        }));

        setTableRawMaterials(prev => [...prev, ...newItems]);

        // Initialize form fields for new items
        newItems.forEach((_, index) => {
            const newIndex = tableRawMaterials.length + index;
            setValue(`rmGridFields.${newIndex}.Percentage`, 0);
        });

        setSelectedRm([]);
        setValue('RawMaterial', []);
        setValueTableForm('RawMaterial', []); // Add this line

        // Update unSelectedRm to remove the newly added items
        setUnSelectedRm(prev => prev.filter(item => !newItems.some(newItem => newItem.value === item.RawMaterialId)));

        // Recalculate all values
        setTimeout(() => {
            const updatedItems = [...tableRawMaterials, ...newItems].map((item, idx) => {
                const currentPercentage = parseFloat(getValues(`rmGridFields.${idx}.Percentage`) || 0);
                return {
                    ...item,
                    Percentage: currentPercentage,
                    calculatedBasicValue: (currentPercentage / 100) * item.RawMaterialRate,
                    calculatedScrapValue: (currentPercentage / 100) * item.ScrapRate,
                };
            });

            setCalculatedValues(updatedItems);
            calculateNetRmRate();
            calculateNetScrapRate();
            calculateRemainingCalculation();
            totalPercentageValue();
        }, 300);
    };

    const quantityChange = (quantity, index) => {
        const newValues = binderRm.map((item, idx) => {
            if (idx === index) {
                const basicValue = quantity * item.RawMaterialRate;
                return {
                    ...item,
                    quantity: parseFloat(quantity),
                    calculatedBindersBasicValue: basicValue
                };
            }
            return item;
        });
        setBinderRm(newValues);
        setCalculatedCost(newValues);

        // Update the form value
        setValue(`binderQuantity.${index}`, quantity);

        // Calculate and update total cost
        const newTotalCost = calculateTotalCost();
        setTotalCostCalculated(newTotalCost);

        calculateRemainingCalculation();
    };
    const calculateTotalCost = () => {
        return calculatedCost.reduce((acc, item) => acc + (item?.calculatedBindersBasicValue || 0), 0);
    };
    const resetMainRawMaterials = () => {
        setShowResetPopup(true);
    };

    const closeResetPopup = () => {
        setShowResetPopup(false);
    };

    // const confirmResetMainRawMaterials = () => {
    //     // Reset table data and related state variables
    //     setTableRawMaterials([]);
    //     setCalculatedValues([]);
    //     setPercentage(0);
    //     setFieldsEnabled(false);

    //     // Reset form values
    //     setValue('NetRMRate', '');
    //     setValue('NetScrapRate', '');
    //     // ... reset other form fields as needed

    //     // Recalculate values
    //     calculateNetRmRate();
    //     calculateNetScrapRate();
    //     calculateRemainingCalculation();

    //     closeResetPopup();
    // };
    const confirmResetMainRawMaterials = () => {
        // Reset table data and related state variables
        setTableRawMaterials([]);
        setCalculatedValues([]);
        setPercentage(0);
        setFieldsEnabled(false);

        // Reset binders table
        setBinderRm([]);
        setCalculatedCost([]);
        setTotalCostCalculated(0);

        // Reset form values related to main raw materials
        setValue('NetRMRate', '');
        setValue('NetScrapRate', '');
        setValue('castingWeight', '');
        setValue('grossWeight', '');
        setValue('finishedWeight', '');
        setValue('scrapWeight', '');
        setValue('recovery', '');
        setValue('scrapCost', '');
        setValue('NetRMCost', '');
        setValue('otherCost', '');
        setValue('BinderOrAdditivesTotalCost', '');

        // Reset rmGridFields
        tableRawMaterials.forEach((_, index) => {
            setValue(`rmGridFields.${index}.Percentage`, '');
        });

        // Reset loss calculations
        setTableVal([]);
        setLostWeight(0);
        setResetLossTable(prev => !prev); // Toggle this value to trigger the useEffect in LossStandardTable


        // Reset binder quantities
        binderRm.forEach((_, index) => {
            setValue(`binderQuantity.${index}`, '');
        });

        // Clear the searchable select field for main raw materials
        setSelectedRm([]);
        setValue('RawMaterial', []);
        setValueTableForm('RawMaterial', []);

        // Clear the searchable select field for binders
        setBinderRawMaterials([]);
        setValue('RawMaterialBinders', []);
        setValueTableForm('RawMaterialBinders', []);

        // Reset data to send
        setDataToSend(prevData => ({
            ...prevData,
            totalGrossWeight: 0,
            scrapWeight: 0,
            scrapCost: 0,
            NetRMCost: 0,
            BinderOrAdditivesTotalCost: 0
        }));

        // Reset lost weight
        setLostWeight(0);

        // Reset table values for LossStandardTable
        setTableVal([]);

        // Reset loss calculations
        dropDown.forEach(loss => {
            setValue(`loss_${loss.value}`, '');
            setValue(`lossWeight_${loss.value}`, '');
        });

        // Recalculate values
        calculateNetRmRate();
        calculateNetScrapRate();
        calculateRemainingCalculation();

        // Show success message
        Toaster.success("All raw materials, loss calculations, and related data have been reset successfully.");

        closeResetPopup();
    };

    const deleteMainRawMaterial = (index) => {
        const updatedMaterials = tableRawMaterials.filter((_, idx) => idx !== index);
        setTableRawMaterials(updatedMaterials);

        // Recalculate percentages and update form values
        let totalPercentage = 0;
        updatedMaterials.forEach((item, idx) => {
            const currentPercentage = parseFloat(getValues(`rmGridFields.${idx}.Percentage`) || 0);
            totalPercentage += currentPercentage;
            setValue(`rmGridFields.${idx}.Percentage`, currentPercentage);
        });

        // Update calculated values
        const newCalculatedValues = updatedMaterials.map((item, idx) => {
            const currentPercentage = parseFloat(getValues(`rmGridFields.${idx}.Percentage`) || 0);
            return {
                ...item,
                Percentage: currentPercentage,
                calculatedBasicValue: (currentPercentage / 100) * item.RawMaterialRate,
                calculatedScrapValue: (currentPercentage / 100) * item.ScrapRate,
            };
        });
        setCalculatedValues(newCalculatedValues);

        // Update percentage state
        setPercentage(totalPercentage);

        // Enable/disable fields based on total percentage
        setFieldsEnabled(totalPercentage === 100 && updatedMaterials.length > 0);

        // Recalculate other values
        calculateNetRmRate();
        calculateNetScrapRate();
        calculateRemainingCalculation();

        // Update unselected raw materials
        const deletedItem = tableRawMaterials[index];
        setUnSelectedRm(prev => [...prev, {
            RMName: deletedItem.label,
            RawMaterialId: deletedItem.value,
            RMRate: deletedItem.RawMaterialRate,
            ScrapRate: deletedItem.ScrapRate
        }]);

        // Clear the deleted item from the form
        setValue(`rmGridFields.${index}.Percentage`, '');

        // Reorder the remaining form fields
        for (let i = index; i < updatedMaterials.length; i++) {
            setValue(`rmGridFields.${i}.Percentage`, getValues(`rmGridFields.${i + 1}.Percentage`));
        }
        setValue(`rmGridFields.${updatedMaterials.length}.Percentage`, '');
    };

    const resetBinderMaterials = () => {
        setBinderRm([]);
        setCalculatedCost([]);
        setTotalCostCalculated(0);
        calculateRemainingCalculation();
    };

    const deleteBinderMaterial = (index) => {
        const updatedBinders = binderRm.filter((_, idx) => idx !== index);
        setBinderRm(updatedBinders);
        setCalculatedCost(updatedBinders);
        const newTotalCost = calculateTotalCost();
        setTotalCostCalculated(newTotalCost);
        calculateRemainingCalculation();
    };
    const editMainRawMaterial = (index) => {
        const item = tableRawMaterials[index];
        setSelectedRm([item]);
        setValue('RawMaterial', [{ label: item.label, value: item.value }]);
        setValue(`rmGridFields.${index}.Percentage`, item.Percentage);
        // Add any other fields that need to be set for editing
    };

    const editBinderMaterial = (index) => {
        const item = binderRm[index];
        setBinderRawMaterials([item]);
        setValue('RawMaterialBinders', [{ label: item.label, value: item.value }]);
        setValue(`binderQuantity.${index}`, item.quantity);
        // Add any other fields that need to be set for editing
    };


    return (
        <Fragment>
            <Row>
                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit?.bind(this)); }}>

                    <Col md="12" className='mt-3'>
                        <div className="header-title mt12">
                            <h5>{'Raw Material'}</h5>
                        </div>
                        <Row className={"mx-0 raw-material-dropdown"}>
                            <Col md="6">
                                <SearchableSelectHookForm
                                    label={"Raw Material"}
                                    name={"RawMaterial"}
                                    tooltipId={"RawMaterial"}
                                    placeholder={"Select"}
                                    Controller={Controller}
                                    control={controlTableForm}
                                    rules={{ required: true }}
                                    value={selectedRm}
                                    register={registerTableForm}
                                    defaultValue={""}
                                    options={renderListing('RawMaterial')}
                                    mandatory={true}
                                    isMulti={true}
                                    errors={errorsTableForm.RawMaterial}
                                    disabled={props?.CostingViewMode}
                                    handleChange={rawMaterialHandler}

                                />
                                {addError && <div className="text-help mt-2">{addError}</div>}


                            </Col>
                            <Col md="3">
                                <div class="d-flex pt-2 mt-4">
                                    <button
                                        type="button"
                                        className={'user-btn pull-left'}
                                        onClick={handleAddToTable}
                                        disabled={props.CostingViewMode || percentage >= 100}
                                    >
                                        <div className={'plus'}></div>ADD
                                    </button>
                                    <button
                                        type="button"
                                        className={"mr15 ml-2 reset-btn"}
                                        disabled={props.CostingViewMode || !fieldsEnabled || tableRawMaterials.length === 0}
                                        onClick={resetMainRawMaterials}
                                    >
                                        Reset
                                    </button>
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
                                        <th style={{ width: "190px" }}>
                                            {`Percentage`}
                                            <span style={{ marginLeft: '10px', minWidth: '40px', display: 'inline-block' }}>
                                                {percentage > 0 ? `(${checkForDecimalAndNull(percentage, getConfigurationKey().NoOfDecimalForInputOutput)}%)` : '0%'}
                                            </span>
                                        </th>
                                        <th>{`Basic Rate`}</th>
                                        <th>{`Value`}</th>
                                        <th>{`Scrap Rate`}</th>
                                        <th>{`Value`}</th>
                                    </tr>
                                </thead>
                                <tbody className='rm-table-body'>
                                    {tableRawMaterials.length > 0 ? (
                                        tableRawMaterials.map((item, index) => {
                                            const calculatedItem = calculatedValues?.find(calcItem => calcItem.value === item.value) || item;
                                            return (
                                                <tr key={index} className=''>
                                                    <td className='rm-part-name'><span title={item.label}>{item.label}</span></td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <TextFieldHookForm
                                                                label=""
                                                                name={`rmGridFields.${index}.Percentage`}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                rules={{
                                                                    validate: {
                                                                        number,
                                                                        checkWhiteSpaces,
                                                                        percentageLimitValidation
                                                                    },
                                                                    max: {
                                                                        value: 100,
                                                                        message: 'Percentage should be less than 100'
                                                                    },
                                                                }}
                                                                defaultValue={calculatedItem.Percentage || ''}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                handleChange={(e) => { percentageChange(e.target.value, index) }}
                                                                errors={errors?.rmGridFields?.[index]?.Percentage || ''}
                                                                disabled={props.isEditFlag ? false : true}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>{item.RawMaterialRate}</td>
                                                    {/* <td>{checkForDecimalAndNull(calculatedItem.calculatedBasicValue, getConfigurationKey().NoOfDecimalForInputOutput)}</td> */}
                                                    <td>
                                                        <TooltipCustom
                                                            disabledIcon={true}
                                                            id={`rm-value-${index}`}
                                                            tooltipText={'Value = (Percentage * Basic Rate) / 100'}
                                                        />
                                                        <div className='w-fit' id={`rm-value-${index}`}>
                                                            {checkForDecimalAndNull(calculatedItem.calculatedBasicValue, getConfigurationKey().NoOfDecimalForInputOutput)}
                                                        </div>
                                                    </td>
                                                    <td>{item.ScrapRate}</td>
                                                    <td>
                                                        <TooltipCustom
                                                            disabledIcon={true}
                                                            id={`scrap-value-${index}`}
                                                            tooltipText={'Value = (Percentage * Scrap Rate) / 100'}
                                                        />
                                                        <div className='w-fit' id={`scrap-value-${index}`}>
                                                            {checkForDecimalAndNull(calculatedItem.calculatedScrapValue, getConfigurationKey().NoOfDecimalForInputOutput)}
                                                        </div>
                                                    </td>
                                                    {/* <td>{checkForDecimalAndNull(calculatedItem.calculatedScrapValue, getConfigurationKey().NoOfDecimalForInputOutput)}</td> */}
                                                    <td>
                                                        <React.Fragment>

                                                            <button
                                                                className="Delete"
                                                                title='Delete'
                                                                type={'button'}
                                                                disabled={props.CostingViewMode || !fieldsEnabled}
                                                                onClick={() => deleteMainRawMaterial(index)}
                                                            />
                                                        </React.Fragment>                        </td>
                                                </tr>
                                            );
                                        })

                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                <NoContentFound title={EMPTY_DATA} />
                                            </td>
                                        </tr>

                                    )}
                                </tbody>
                            </Table>
                            <div className="text-right mt-2">

                            </div>

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
                                    // disabled={!fieldsEnabled || props.isEditFlag ? false : true}
                                    disabled={!fieldsEnabled || props?.CostingViewMode}

                                />
                            </Col>
                        </Row>
                        <div class="header-title mt12"><h5>Binders/Additives Detail</h5></div>
                        <Row className={"mx-0 align-items-center"}>
                            <Col md="6">
                                <SearchableSelectHookForm
                                    label={"Raw Material"}
                                    name={"RawMaterialBinders"}
                                    tooltipId={"RawMaterial"}
                                    placeholder={"Select"}
                                    Controller={Controller}

                                    control={controlTableForm}
                                    rules={{ required: true }}
                                    register={registerTableForm}
                                    defaultValue={""}
                                    options={renderListing('RawMaterialBinders')}
                                    mandatory={true}
                                    isMulti={true}
                                    errors={errorsTableForm.RawMaterialBinders}
                                    disabled={!fieldsEnabled}
                                    // disabled={!fieldsEnabled || props?.CostingViewMode ? props?.CostingViewMode : state.tableData.length !== 0 ? true : false}
                                    handleChange={(selected, action) => rawMaterialBinderHandler(selected, 'binders')}
                                    value={getValuesTableForm('RawMaterialBinders')} // Add this line

                                />
                                        {binderError && <div className="text-help mt-2">{binderError}</div>}

                            </Col>
                            <Col md="3">
                                <div class="d-flex mb-2">
                                    <button
                                        type="button"
                                        className={'user-btn pull-left'}
                                        onClick={handleAddBinderMaterialsToTable}
                                        disabled={!fieldsEnabled}
                                    >
                                        <div className={'plus'}></div>ADD
                                    </button>
                                    <button
                                        type="button"
                                        className={"mr15 ml-2 reset-btn"}
                                        disabled={!fieldsEnabled}
                                        onClick={resetBinderMaterials}
                                    >
                                        Reset
                                    </button>                                                         </div>
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
                                        <th>{`Actions`}</th>
                                    </tr>
                                </thead>
                                {binderRm.length > 0 ? (
                                    <tbody className='rm-table-body'>
                                        {binderRm.map((item, index) => (
                                            <tr key={index} className=''>
                                                <td className='rm-part-name'><span title={item.label}>{item.label}</span></td>
                                                <td>
                                                    <TextFieldHookForm
                                                        label=""
                                                        name={`binderQuantity.${index}`}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        rules={{
                                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                                        }}
                                                        defaultValue={item.quantity || ''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        handleChange={(e) => { quantityChange(e.target.value, index) }}
                                                        errors={errors?.binderQuantity?.[index] || ''}
                                                        disabled={!fieldsEnabled}
                                                    />
                                                </td>
                                                <td>{item?.RawMaterialRate}</td>

                                                <td><TooltipCustom
                                                    disabledIcon={true}
                                                    id={`cost-${index}`}
                                                    tooltipText={'Cost = Quantity * Basic Rate'}
                                                />
                                                    <div className='w-fit' id={`cost-${index}`}>
                                                        {checkForDecimalAndNull(item.calculatedBindersBasicValue, getConfigurationKey().NoOfDecimalForPrice)}
                                                    </div></td>
                                                <td>
                                                    <React.Fragment>

                                                        <button
                                                            className="Delete"
                                                            title='Delete'
                                                            type={'button'}
                                                            disabled={props.CostingViewMode || !fieldsEnabled}
                                                            onClick={() => deleteBinderMaterial(index)}
                                                        />
                                                    </React.Fragment>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className='bluefooter-butn'>
                                            <td colSpan={3} className="text-right"><strong>Binder/Additives Total Cost:</strong>
                                            </td>
                                            <td colSpan={2}>
                                                <TooltipCustom id="totalGSM" disabledIcon={true} tooltipText={`Sum of all binder/additive costs`} /> <div className='w-fit' id="totalGSM">{checkForDecimalAndNull(totalCostCalculated, getConfigurationKey().NoOfDecimalForPrice)}</div>


                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tr>
                                    <td colSpan={6}>
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                                )}
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
                            fieldsEnabled={fieldsEnabled}
                            resetTrigger={resetLossTable}

                        />

                        <Row className={'mt25 mx-0'}>
                            <Col md="3" >
                                <TextFieldHookForm
                                    label={`Other Cost`}
                                    name={'otherCost'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    rules={{
                                        required: true,
                                        validate: { number, checkWhiteSpaces, decimalAndNumberValidation },

                                    }}
                                    handleChange={() => { }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    // errors={errors.otherCost}
                                    disabled={!fieldsEnabled || props?.CostingViewMode}
                                />
                            </Col>
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
                                    disabled={!fieldsEnabled || props?.CostingViewMode}
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
                                    handleChange={() => {
                                        calculateRemainingCalculation();
                                    }}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.recovery}
                                    disabled={!fieldsEnabled || props?.CostingViewMode}
                                />
                            </Col>


                            <Col md="3">
                                <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'scrap-cost-ferrous'} tooltipText={'Scrap Cost = (Scrap Weight * Scrap Recovery Percentage * Net Scrap Rate / 100)'} />
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
                                <TooltipCustom disabledIcon={true} id={'net-rm-ferrous'} tooltipText={'Net RM Cost = ((Gross Weight * Net RM Rate) - Scrap Cost + Binder/Additives Total Cost + Other Cost)/ Casting Weight'} />

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
                            disabled={props.CostingViewMode ? true : false || !fieldsEnabled}
                            className="btn-primary save-btn"
                        >
                            <div className={'save-icon'}>
                            </div>
                            {'SAVE'}
                        </button>
                    </div>
                    {showResetPopup && (
                        <PopupMsgWrapper
                            isOpen={showResetPopup}
                            closePopUp={closeResetPopup}
                            confirmPopup={confirmResetMainRawMaterials}
                            message={MESSAGES.FERROUSCALCULATOR_RESET_RM}
                        />
                    )}

                    {showUnusedRMsPopup && (
                        <PopupMsgWrapper
                            isOpen={showUnusedRMsPopup}
                            closePopUp={closeUnusedRMsPopup}
                            confirmPopup={confirmRemoveUnusedRMs}
                            message={unusedRMsMessage}
                        />
                    )}
                </form >

            </Row>
        </Fragment >
    );
}

export default Ferrous;