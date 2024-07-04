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
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'

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
    const [percentage, setPercentage] = useState(0)
    const [inputFinishWeight, setInputFinishWeight] = useState(0)
    const { rmRowData, rmData, CostingViewMode, item } = props
    const [ selectedRm, setSelectedRm ] = useState([])
    const[unSelectedRm, setUnSelectedRm] = useState([])
    const [tableRawMaterials, setTableRawMaterials] = useState([]);
    const [binderRawMaterials, setBinderRawMaterials] = useState([]);
    const [binderRm, setBinderRm] = useState([]);

const [calculatedValues, setCalculatedValues] = useState([]);
const [calculatedCost , setCalculatedCost] = useState([])
const [totalCostCalculated, setTotalCostCalculated] = useState(0);

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

    useEffect(() => {
        if (WeightCalculatorRequest && Object.keys(WeightCalculatorRequest)?.length > 0 && WeightCalculatorRequest?.CostingFerrousCalculationRawMaterials?.length > 0) {
            WeightCalculatorRequest.CostingFerrousCalculationRawMaterials && WeightCalculatorRequest.CostingFerrousCalculationRawMaterials.map((item, index) => (
                setValue(`${rmGridFields}.${index}.Percentage`, checkForDecimalAndNull(item.Percentage, getConfigurationKey().NoOfDecimalForInputOutput))
            ))
        }
    }, [WeightCalculatorRequest])

    // useEffect(() => {
    //     if (!CostingViewMode) {
    //         calculateRemainingCalculation(lostWeight)
    //     }
    // }, [fieldValues])

    const totalPercentageValue = () => {
        let sum = 0
        rmData && rmData.map((item, index) => {
            sum = sum + checkForNull(getValues(`rmGridFields.${index}.Percentage`))
            return null
        })
        setPercentage(sum)
        return checkForDecimalAndNull(sum, getConfigurationKey().NoOfDecimalForInputOutput);
    }

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
        }, 300);
    };
  const calculateNetRmRate = () => {
    let NetRMRate = tableRawMaterials.reduce((acc, item, index) => {
        const Percentage = parseFloat(getValues(`rmGridFields.${index}.Percentage`) || 0);
        const BasicRate = parseFloat(item.RawMaterialRate || 0);
        return acc + (Percentage * BasicRate) / 100;
    }, 0);
    setValue('NetRMRate', checkForDecimalAndNull(NetRMRate, getConfigurationKey().NoOfDecimalForInputOutput));
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
    setValue('NetScrapRate', checkForDecimalAndNull(NetScrapRate, getConfigurationKey().NoOfDecimalForInputOutput));
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
    // Preserve current values
    const currentNetRMRate = getValues('NetRMRate');
    const currentNetScrapRate = getValues('NetScrapRate');
    const currentCastingWeight = getValues('castingWeight');

    setBinderRm(prev => [...prev, ...binderRawMaterials]);
    setUnSelectedRm([]);
    setValue('RawMaterialBinders', []);

    // Only reset the RawMaterialBinders field, not the entire form
    setValue('RawMaterialBinders', []);

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
};const calculateNetRMCost = (grossWeight, netRMRate, scrapCost, totalCostCalculated, otherCost, castingWeight) => {
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

        // Calculate scrap weight
        const scrapWeight = calculateScrapWeight(castingWeight, finishedWeight);

        // Calculate scrap cost
        const scrapCost = calculateScrapCost(scrapWeight, recovery, NetScrapRate);

        // Calculate Net RM Cost
        const NetRMCost = calculateNetRMCost(grossWeight, NetRMRate, scrapCost, totalCostCalculated, otherCost, castingWeight);

        // Update state and form values
        setDataToSend(prev => ({
            ...prev,
            totalGrossWeight: grossWeight,
            scrapWeight: scrapWeight,
            scrapCost: scrapCost,
            NetRMCost: NetRMCost
        }));

        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput));
        setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice));
        setValue('NetRMCost', checkForDecimalAndNull(NetRMCost, getConfigurationKey().NoOfDecimalForPrice));

        setLostWeight(totalLossWeight);

        // Update loss weights in tableVal
        setTableVal(lossWeights);
    }

    // Always preserve these values
    setValue('NetRMRate', NetRMRate);
    setValue('NetScrapRate', NetScrapRate);
    setValue('castingWeight', castingWeight);
}, [getValues, setValue, tableVal, totalCostCalculated]);






const watchedValues = useWatch({
    control,
    name: ['castingWeight', 'finishedWeight', 'recovery', 'NetRMRate', 'NetScrapRate', 'otherCost'],
});
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
  
   
   
    const rawMaterialHandler= (newValue) => {
        if (Array.isArray(newValue) && newValue.some(item => item?.value === 'select_all')) {
            // If "Select All" is chosen
            const allOptions = rmData.map(({ RMName, RawMaterialId, RMRate, ScrapRate }) => ({
                label: RMName,
                value: RawMaterialId,
                RawMaterialRate: RMRate,
                ScrapRate: ScrapRate
            }));
            setSelectedRm(allOptions);
            setUnSelectedRm([]);
            setValue('RawMaterial', allOptions);
        } else if (newValue && (newValue.length > 0 || Object.keys(newValue).length)) {
            // If specific items are chosen
            setSelectedRm(newValue);
            const newUnselectedRm = rmData.filter(rm => !newValue.some(selected => selected.value === rm.RawMaterialId));
            setUnSelectedRm(newUnselectedRm);
            setValue('RawMaterial', newValue);
        } else {
            // If nothing is selected
            setSelectedRm([]);
            setUnSelectedRm(rmData);
            setValue('RawMaterial', []);
        }
    };
    
    const renderListing = React.useMemo(() => {
        return (label) => {
            switch (label) {
                case 'RawMaterial':
                    if (rmData) {
                        const temp = [
                            { label: "Select All", value: 'select_all' },
                            ...rmData.map((item) => ({
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
                    return unSelectedRm.map((item) => ({
                        label: item.RMName,
                        value: item.RawMaterialId,
                        RawMaterialRate: item.RMRate,
                        ScrapRate: item.ScrapRate
                    }));
                default:
                    return [];
            }
        };
    }, [rmData, unSelectedRm, props.isEditFlag]);
        const rawMaterialBinderHandler = (newValue , action) => {
        

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
                    calculateRemainingCalculation();  // Add this line

                }, 300);
            };
    
    const quantityChange = (quantity, index) => {
        const newValues = binderRm.map((item, idx) => {
            if (idx === index) {
                const basicValue = quantity * item.RawMaterialRate;
                return { ...item, calculatedBindersBasicValue: basicValue };
            }
            return item;
        });
            setCalculatedCost(newValues);
            calculateRemainingCalculation();  // Add this line

    };
    const calculateTotalCost = () => {
        return calculatedCost?.reduce((acc, item) => acc + (item?.calculatedBindersBasicValue || 0), 0);
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
                        <Row className={"mx-0 align-items-center"}>
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
                                    disabled={props?.CostingViewMode ? props?.CostingViewMode : state.tableData.length !== 0 ? true : false}
                                    handleChange={rawMaterialHandler}
                                />

                            </Col>
                            <Col md="3">
                                <div class="d-flex">
                                <button
                  type="button"
                  className={'user-btn mt30 pull-left'}
                  onClick={handleAddToTable}
                //   disabled={props.CostingViewMode || disableAll}
                >
                  <div className={'plus'}></div>ADD
                </button>                                        </div>
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
                                {tableRawMaterials.length > 0 ? (
    <tbody className='rm-table-body'>
       {tableRawMaterials.map((item, index) => {
    const calculatedItem = calculatedValues?.find(calcItem => calcItem.value === item.value) || item;
    return (
        <tr key={index} className=''>
            <td className='rm-part-name'><span title={item.label}>{item.label}</span></td>
            <td>
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
            </td>
            <td>{item.RawMaterialRate}</td>
            <td>{checkForDecimalAndNull(calculatedItem.calculatedBasicValue, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
            <td>{item.ScrapRate}</td>
            <td>{checkForDecimalAndNull(calculatedItem.calculatedScrapValue, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
        </tr>
    );
})}
    </tbody>
) : (
    <NoContentFound title={EMPTY_DATA} />
)}

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
                                    disabled={props?.CostingViewMode ? props?.CostingViewMode : state.tableData.length !== 0 ? true : false}
                                    handleChange={(selected , action) => rawMaterialBinderHandler(selected , 'binders')}
                                />
                            </Col>
                            <Col md="3">
                                <div class="d-flex">
                                <button
                  type="button"
                  className={'user-btn mt30 pull-left'}
                  onClick={handleAddBinderMaterialsToTable}
                //   disabled={props.CostingViewMode || disableAll}
                >
                  <div className={'plus'}></div>ADD
                </button>                                                           </div>
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
                             {binderRm.length > 0 ?(   <tbody className='rm-table-body'>
                                    {
                                        binderRm.map((item, index) => {
                                            const calculatedItem = calculatedCost?.find(calcItem => calcItem.value === item.value);
                                            
                                            return (
                                                <tr key={index} className=''>
                                                    <td className='rm-part-name'><span title={item.label}>{item.label}</span></td>
                                                    <td>
                                                        <TextFieldHookForm
                                                            label=""
                                                            name={`Quantity`}
                                                            Controller={Controller}
                                                            control={control}
                                                            register={register}
                                                            rules={{
                                                                // required: true,
                                                                validate: { number, checkWhiteSpaces },
                                                                max: {
                                                                    value: 100,
                                                                    message: 'Percentage should be less than 100'
                                                                },
                                                            }}
                                                            defaultValue={''}
                                                            className=""
                                                            customClassName={'withBorder'}
                                                            handleChange={(e) => { quantityChange(e.target.value,index) }}
                                                            errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].Percentage : ''}
                                                            disabled={props.isEditFlag ? false : true}
                                                        />
                                                    </td>
                                                    <td>{item?.RawMaterialRate}</td>
                                                    <td>{calculatedItem ? calculatedItem?.calculatedBindersBasicValue : '0'}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    <tr className='bluefooter-butn'>
                                        <td colSpan={4} className='text-end'><span>Total Cost:</span>                <span>{checkForDecimalAndNull(totalCostCalculated, getConfigurationKey().NoOfDecimalForPrice)}</span>
</td>
                                    </tr>
                                </tbody>) : 
                                                                        <NoContentFound title={EMPTY_DATA} />
                                                                    }
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

                        <Row className={'mt25 mx-0'}>
                            <Col md="3" >
                                <TextFieldHookForm
                                    label={`Other Cost`}
                                    name={'otherCost'}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    // mandatory={true}
                                    // rules={{
                                    //     required: true,
                                    //     validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                    //     max: {
                                    //         value: getValues("castingWeight"),
                                    //         message: 'Finish weight should not be greater than casting weight.'
                                    //     },
                                    // }}
                                    handleChange={(e) => { handleFinishedWeight(e?.target?.value) }}
                                    defaultValue={''}
                                    className=""
                                    customClassName={'withBorder'}
                                    errors={errors.finishedWeight}
                                    disabled={props.isEditFlag ? false : true}
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