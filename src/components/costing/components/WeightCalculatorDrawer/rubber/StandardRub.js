import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, number, decimalAndNumberValidation, positiveAndDecimalNumber, loggedInUserId, innerVsOuterValidation } from '../../../../../helper'
import Toaster from '../../../../common/Toaster'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { KG, EMPTY_DATA } from '../../../../../config/constants'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash'
import LoaderCustom from '../../../../common/LoaderCustom';
import TooltipCustom from '../../../../common/Tooltip'
import { reactLocalStorage } from 'reactjs-localstorage'
import { useSelector } from 'react-redux'
import { sourceCurrencyFormatter } from '../../Drawers/processCalculatorDrawer/CommonFormula'
import { saveRawMaterialCalculationForRubberStandard } from '../../../actions/CostWorking'
import { useLabels } from '../../../../../helper/core'




const gridOptions = {};
function StandardRub(props) {
    const { finishedWeightLabel,finishWeightLabel } = useLabels()

    const dispatch = useDispatch();
    const { rmRowData, rmData, CostingViewMode } = props
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    // const isVolumeEditable = getConfigurationKey()?.IsVolumeEditableInRubberRMWeightCalculator ?? false

    const costData = useContext(costingInfoContext)
    const [tableData, setTableData] = useState(WeightCalculatorRequest &&WeightCalculatorRequest?.RawMaterialRubberStandardWeightCalculator?.length>0 ?WeightCalculatorRequest?.RawMaterialRubberStandardWeightCalculator:[])
    const [disableCondition, setDisableCondition] = useState(true)
    const [agGridTable, setAgGridTable] = useState(true)
    const [totalRMCost, setTotalRMCost] = useState("")
    const [rmDropDownData, setRmDropDownData] = useState([])
    const [rmRowDataState, setRmRowDataState] = useState({})
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })
    const [isDisable, setIsDisable] = useState(false)
    const [isDisableAdd, setIsDisableAdd] = useState(false)
    const [reRender, setRerender] = useState(false)
    const [isVolumeAutoCalculate, setIsVolumeAutoCalculate] = useState(false)
    const { currencySource } = useSelector((state) => state?.costing);

    const defaultValues = {
        shotWeight: WeightCalculatorRequest && WeightCalculatorRequest.ShotWeight !== null ? checkForDecimalAndNull(WeightCalculatorRequest.ShotWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        noOfCavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Cavity, getConfigurationKey().NoOfDecimalForInputOutput) : 1,
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        finishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    }

    const { register, handleSubmit, control, setValue, getValues, reset, trigger, clearErrors, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['InnerDiameter', 'OuterDiameter', 'Length', 'CuttingAllowance', 'FinishWeight', ...(!isVolumeAutoCalculate ? ['Volume']: [])],
    })

    useEffect(() => {

        calculateTotalLength()
        calculateVolume()
        setTimeout(() =>{
            calculateScrapWeight()
        }, 500)

    }, [fieldValues, isVolumeAutoCalculate])


    useEffect(() => {
        try {
            if (!Array.isArray(rmData)) return;
            
            const arr = rmData.map(item => ({
                // Only show RMName and Grade in label, but keep ID in value/code
                label: `${item.RMName || ''}${item.Grade ? ` (${item.Grade})` : ''}`,
                value: item.RawMaterialId,
                code: item.RawMaterialId,
                originalData: item
            })).filter(item => item.code);
            
            setRmDropDownData(arr);
        } catch (error) {
            console.error('Error populating RM dropdown:', error);
            setRmDropDownData([]);
        }
    }, [rmData])

    useEffect(() => {
        if (Number(getValues('FinishWeight') < dataToSend.GrossWeight)) {
            delete errors.FinishWeight
            setRerender(!reRender)
        }
    }, [dataToSend.GrossWeight])
    const handleInnerDiameter = (e) => {
        const InnerDiameter = e
        const OuterDiameter = Number(getValues('OuterDiameter'))
        if (OuterDiameter > InnerDiameter) {
            delete errors.OuterDiameter
        }
    }

    const handleOuterDiameter = (e) => {
        const InnerDiameter = Number(getValues('InnerDiameter'))
        const OuterDiameter = e
        if (InnerDiameter < OuterDiameter) {
            delete errors.InnerDiameter
        }
    }

    const calculateTotalLength = () => {

        const Length = Number(getValues('Length'))
        const CuttingAllowance = Number(getValues('CuttingAllowance'))
        let TotalLength = checkForNull(Length) + checkForNull(CuttingAllowance)
        setDataToSend(prevState => ({ ...prevState, TotalLength: TotalLength }))
        setValue('TotalLength', checkForDecimalAndNull(TotalLength, getConfigurationKey().NoOfDecimalForInputOutput))

    }


    const calculateVolume = debounce(() => {
        const InnerDiameter = Number(getValues('InnerDiameter'))
        const OuterDiameter = Number(getValues('OuterDiameter'))
        if ((InnerDiameter && OuterDiameter) || !isVolumeAutoCalculate) {
            const Length = Number(getValues('Length'))
            const CuttingAllowance = Number(getValues('CuttingAllowance'))
            let Volume = Number(getValues('Volume'));
            if(isVolumeAutoCalculate){
                Volume = (Math.PI/4 )* (Math.pow(checkForNull(OuterDiameter), 2) - Math.pow(checkForNull(InnerDiameter), 2)) * checkForNull(Length + CuttingAllowance)
                setValue('Volume', checkForDecimalAndNull(Volume, getConfigurationKey().NoOfDecimalForInputOutput))
            }
            let GrossWeight = Volume * (checkForNull(rmRowDataState.Density) / 1000000)
            setDataToSend(prevState => ({ ...prevState, Volume: Volume, GrossWeight: checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) }))
            setValue('GrossWeight', checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }
    }, 500)


    const calculateScrapWeight = () => {
        const FinishWeight = Number(getValues('FinishWeight'))
        const GrossWeight = Number(getValues('GrossWeight'))
        if (Number(getValues('GrossWeight'))) {
            let ScrapWeight = checkForNull(getValues('GrossWeight')) - checkForNull(FinishWeight)
            setDataToSend(prevState => ({ ...prevState, ScrapWeight: ScrapWeight }))
            setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            let NetRmCost = checkForNull(dataToSend.GrossWeight) * checkForNull(rmRowDataState.RMRate) - checkForNull(rmRowDataState.ScrapRate) * ScrapWeight
            setDataToSend(prevState => ({ ...prevState, NetRMCost: NetRmCost }))
            setValue('NetRMCost', checkForDecimalAndNull(NetRmCost, getConfigurationKey().NoOfDecimalForPrice))
        } else if (GrossWeight === 0 && FinishWeight === 0) {
            setDataToSend(prevState => ({ ...prevState, ScrapWeight: 0 })) 
            setValue('ScrapWeight', checkForDecimalAndNull(0, getConfigurationKey().NoOfDecimalForInputOutput))   
        }
    }


    const handleRMDropDownChange = (e) => {
        try {
            if (!e || !e.code || !Array.isArray(rmData)) return;

            const selectedRMId = e.code;
            const selectedMaterial = rmData.find(item => item.RawMaterialId === selectedRMId);

            if (!selectedMaterial) {
                console.warn('Selected material not found');
                return;
            }

            if (selectedMaterial.Density === 0) {
                setRmRowDataState({});
                setIsDisableAdd(true);
                Toaster.warning("This Material's density is not available for weight calculation. Please add density for this material in RM Master > Manage Material.");
            } else {
                setIsDisableAdd(false);
                setRmRowDataState(selectedMaterial);
            }

            // Set previous values if available
            if (tableData.length > 0) {
                const lastRow = tableData[tableData.length - 1];
                if (lastRow) {
                    setValue('InnerDiameter', lastRow.OuterDiameter || '');
                    setValue('Length', lastRow.Length || '');
                    setValue('CuttingAllowance', lastRow.CuttingAllowance || '');
                }
            }
        } catch (error) {
            setRmRowDataState({});
            setIsDisableAdd(true);
        }
    }

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForInputOutput)
    }

    const hyphenFormatterForPrice = (props) => {
        const cellValue = props?.value;
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice)
    }

    const calculateTotalRmCost = (gridData) => {
        let totalRMCost = gridData && gridData.reduce((accummlator, el) => {
            return accummlator + el.NetRMCost
        }, 0)
        // setTotalRMCost(totalRMCost)
        return checkForDecimalAndNull(totalRMCost, getConfigurationKey().NoOfDecimalForPrice)
    }


    const deleteItem = (gridData) => {
        try {
            setAgGridTable(false);

            if (!Array.isArray(gridData)) {
                console.error('Invalid grid data');
                return;
            }

            // Remove last item
            const newGridData = [...gridData];
            const removedItem = newGridData.pop();
            setTableData(newGridData);

            // Update dropdown options
            if (Array.isArray(rmData)) {
                const availableRMs = rmData
                    .filter(item => {
                        if (!item.RawMaterialId) return false;
                        return !newGridData.some(gridItem => 
                            gridItem.RawMaterialId === item.RawMaterialId
                        );
                    })
                    .map(item => ({
                        label: `${item.RMName || ''}${item.Grade ? ` (${item.Grade})` : ''}`,
                        value: item.RawMaterialId,
                        code: item.RawMaterialId,
                        originalData: item
                    }));

                setRmDropDownData(availableRMs);
            }

            setTimeout(() => {
                setAgGridTable(true);
            }, 300);
        } catch (error) {
            console.error('Error in deleteItem:', error);
            setAgGridTable(true);
        }
    }
    const editItem = (gridData) => {
        setDisableCondition(false)
        let e = gridData[gridData.length - 1]
        rmData && rmData.map((item, index) => {
            if (item.RawMaterialId === e.RawMaterialId) {
                setRmRowDataState(rmData[index])
            }
            return false
        })

        let obj = e
        setValue('InnerDiameter', checkForDecimalAndNull(obj.InnerDiameter, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('OuterDiameter', checkForDecimalAndNull(obj.OuterDiameter, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('Length', checkForDecimalAndNull(obj.Length, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('CuttingAllowance', checkForDecimalAndNull(obj.CuttingAllowance, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('Volume', checkForDecimalAndNull(obj.Volume, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('GrossWeight', checkForDecimalAndNull(obj.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('FinishWeight', checkForDecimalAndNull(obj.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setTimeout(() => {
            setValue('ScrapWeight', checkForDecimalAndNull(obj.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }, 200);
        setIsVolumeAutoCalculate(obj?.IsVolumeAutoCalculate ?? false)
        setDataToSend(prevState => ({ ...prevState, GrossWeight: obj.GrossWeight }))
    }


    const buttonFormatter = (props) => {
        // props.gridApi?.applyTransaction({ remove: gridOptions.rowData })

        let isEditable;
        if ((props?.agGridReact?.gridOptions?.rowData.length - 1) === props.rowIndex) {
            isEditable = true
        } else {
            isEditable = false
        }

        return (
            <>

                {(isEditable && !CostingViewMode) && <button title='Edit' className="Edit mr-2 align-middle" type={'button'} onClick={() => editItem(props?.agGridReact?.gridOptions.rowData)} />}
                {(isEditable && !CostingViewMode) && <button title='Delete' className="Delete align-middle" type={'button'} onClick={() => deleteItem(props?.agGridReact?.gridOptions.rowData)} />}
            </>
        )
    };


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,

    };

    const onGridReady = (params) => {

        params.api.sizeColumnsToFit();
        setGridColumnApi(params.columnApi)
        setGridApi(params.api)
        params.api.paginationGoToPage(0);
    };

    const addRow = async () => {
        if (Object.keys(errors).length > 0) {
            return false
        }
        if (Number(getValues('FinishWeight')) > dataToSend.GrossWeight) {
            Toaster.warning(`${finishWeightLabel} weight cannot be greater than gross weight`)
            return false
        }

        let obj = {
            RawMaterialName: rmRowDataState.RMName,
            InnerDiameter: Number(getValues('InnerDiameter')),
            OuterDiameter: Number(getValues('OuterDiameter')),
            Length: Number(getValues('Length')),
            CuttingAllowance: Number(getValues('CuttingAllowance')),
            TotalLength: dataToSend.TotalLength,
            Volume: isVolumeAutoCalculate ? dataToSend.Volume : Number(getValues('Volume')),
            GrossWeight: dataToSend.GrossWeight,
            FinishWeight: Number(getValues('FinishWeight')),
            ScrapWeight: dataToSend.ScrapWeight,
            NetRMCost: dataToSend.NetRMCost,
            RawMaterialId: rmRowDataState.RawMaterialId,
            IsVolumeAutoCalculate: isVolumeAutoCalculate
        }

        const lastRow = tableData[tableData.length - 1]
        const validationFields = [
            ...(isVolumeAutoCalculate ? ["OuterDiameter"] : ["Volume"]),
            "FinishWeight",
            ...(isVolumeAutoCalculate && (!(tableData.length > 0) || lastRow?.InnerDiameter === 0) ? ["InnerDiameter"] : []),
            ...(isVolumeAutoCalculate && (!(tableData.length > 0) || lastRow?.CuttingAllowance === 0) ? ["CuttingAllowance"] : []),
            ...(isVolumeAutoCalculate && (!(tableData.length > 0) || lastRow?.Length === 0) ? ["Length"] : []),
        ];
        const isValid = await trigger(validationFields);
        if(!isValid){
            return false;
        }else if((!isVolumeAutoCalculate && obj.Volume === 0) || (isVolumeAutoCalculate && (obj.InnerDiameter === 0 || obj.OuterDiameter === 0 || obj.Length === 0))   ){
            Toaster.warning("Please fill all the mandatory fields first.")
            return false;
        }

        if (disableCondition) {
            setTableData([...tableData, obj])
        } else {
            let array = [...tableData]
            array.pop()
            setTableData([...array, obj])
        }

        reset({
            InnerDiameter: "",
            OuterDiameter: "",
            Length: "",
            CuttingAllowance: "",
            TotalLength: "",
            Volume: "",
            GrossWeight: "",
            FinishWeight: "",
            ScrapWeight: "",
            NetRMCost: "",
            RawMaterial: []

        })
        setIsVolumeAutoCalculate(false);
        setRmRowDataState({})

        setTimeout(() => {
            setValue('ScrapWeight', 0)
        }, 300);


        let arr2 = rmDropDownData && rmDropDownData.filter((item) => {
            return item.code !== obj.RawMaterialId
        })
        setRmDropDownData(arr2)

        let tableDataArray = [...tableData, obj]

        // let totalRMCost = tableDataArray && tableDataArray.reduce((accummlator, el) => {
        //     return accummlator + el.NetRMCost
        // }, 0)

        // setTotalRMCost(totalRMCost)
        // calculateTotalRmCost(tableDataArray);
        setDisableCondition(true)

        try {
            if (obj && obj.RawMaterialId) {
                const updatedDropdown = rmDropDownData.filter(item => 
                    item.code !== obj.RawMaterialId
                );
                setRmDropDownData(updatedDropdown);
            }
        } catch (error) {
            console.error('Error updating dropdown after row addition:', error);
        }

    }

    const onCancel = () => {

        reset({

            InnerDiameter: "",
            OuterDiameter: "",
            Length: "",
            CuttingAllowance: "",
            TotalLength: "",
            Volume: "",
            GrossWeight: "",
            FinishWeight: "",
            ScrapWeight: "",
            NetRMCost: "",
            RawMaterial: []

        })
        setRmRowDataState({})
        setIsVolumeAutoCalculate(false);
        setTimeout(() => {
            setValue('ScrapWeight', 0)
        }, 300);
        setDisableCondition(true)


    }

    const onSubmit = debounce(handleSubmit(() => {
        setIsDisable(true)
        let obj = {}
        // obj.LayoutType = 'Default'
        // obj.WeightCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000"
        // obj.IsChangeApplied = true //NEED TO MAKE IT DYNAMIC how to do
        obj.PartId = costData.PartId
        obj.RawMaterialId = rmRowData.RawMaterialId
        obj.CostingId = costData.CostingId
        obj.TechnologyId = costData.TechnologyId
        // obj.CostingRawMaterialDetailId = rmRowData.RawMaterialDetailId
        // obj.NetLandedCost = grossWeights * rmRowData.RMRate - (grossWeights - getValues('finishWeight')) * rmRowData.ScrapRate
        // obj.PartNumber = costData.PartNumber
        // obj.TechnologyName = costData.TechnologyName
        obj.UOMForDimension = KG
        obj.RmDropDownData = rmDropDownData
        // obj.CalculatedRmTableData = tableData

        obj.BaseCostingId = costData.CostingId
        obj.LoggedInUserId = loggedInUserId()
        obj.RawMaterialRubberStandardWeightCalculator = tableData


        //APPLY NEW ACTION HERE 

        dispatch(saveRawMaterialCalculationForRubberStandard(obj, (res) => {
            if (res?.data?.Result) {
                Toaster.success("Calculation saved successfully")
                obj.CalculatorType = "Standard"
                props.toggleDrawer('Standard', obj)
            }
        }))

    }), 500)

    const cancel = () => {
        props.toggleDrawer('Standard')
    }

    const frameworkComponents = {
        hyphenFormatter: hyphenFormatter,
        totalValueRenderer: buttonFormatter,
        hyphenFormatterForPrice: hyphenFormatterForPrice
    };

    const UnitFormat = () => {
        return <>Volume(mm<sup>3</sup>)</>
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    const onPressAutoCalculateVolume = () => {
        setValue('FinishWeight', "")
        setValue('GrossWeight', "")
        setValue('ScrapWeight', "")
        setValue('Volume', "")
        setValue('NetRMCost', "")
        setIsVolumeAutoCalculate((prev) => !prev)
        clearErrors();
    }

    let volumeFormula = <div>Volume = (π/4) * (Outer Diameter<sup>2</sup> - Inner Diameter <sup>2</sup>) * Total Length</div>
    return (
        <Fragment>
            <Row>
                <Col>
                    <form noValidate className="form"
                        // onSubmit={handleSubmit(onSubmit)}
                        onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                        <Col md="12" className={'mt25'}>
                            <div className="border pl-3 pr-3 pt-3">
                                {/* <Col md="12">
                                    <div className="left-border">
                                        {'Input Weight:'}
                                    </div>
                                </Col> */}
                                <Col md="12">


                                    <Row className="mb-4 pb-2">
                                        <Col md="12 d-flex weight-calculator-headings">
                                            <div className="d-inline-block "><span className="grey-text d-block">RM Name:</span><span className="text-dark-blue one-line-overflow" title={rmRowDataState.RMName}>{`${rmRowDataState.RMName !== undefined ? rmRowDataState.RMName : ''}`}</span></div>
                                            <div className="d-inline-block "><span className="grey-text d-block">Material:</span><span className="text-dark-blue">{`${rmRowDataState.MaterialType !== undefined ? rmRowDataState.MaterialType : ''}`}</span></div>
                                            <div className="d-inline-block "><span className="grey-text d-block">Density(g/cm){<sup>3</sup>}:</span><span className="text-dark-blue">{`${rmRowDataState.Density !== undefined ? rmRowDataState.Density : ''}`}</span></div>
                                            <div className="d-inline-block "><span className="grey-text d-block">RM Rate ({sourceCurrencyFormatter(currencySource?.label)}/{rmRowDataState?.UOMSymbol ? `${rmRowDataState.UOMSymbol}` : 'UOM'}):</span><span className="text-dark-blue">{`${rmRowDataState.RMRate !== undefined ? rmRowDataState.RMRate : ''}`}</span></div>
                                            {props?.appyMasterBatch && < div className="d-inline-block "><span className="grey-text d-block">RM Rate(Including Master Batch):</span><span className="text-dark-blue">{`${rmRowDataState.RMRate !== undefined ? checkForDecimalAndNull(5, getConfigurationKey().NoOfDecimalForInputOutput) : ''}`}</span></div>}
                                            <div className="d-inline-block "><span className="grey-text d-block">Scrap Rate ({sourceCurrencyFormatter(currencySource?.label)}/{rmRowDataState?.UOMSymbol ? `${rmRowDataState.UOMSymbol}` : 'UOM'}):</span><span className="text-dark-blue">{`${rmRowDataState.ScrapRate !== undefined ? rmRowDataState.ScrapRate : ''}`}</span></div>
                                            <div className="d-inline-block"><span className="grey-text d-block">Category:</span><span className="text-dark-blue">{`${rmRowDataState.RawMaterialCategory !== undefined ? rmRowDataState.RawMaterialCategory : ''}`}</span></div>

                                        </Col>
                                    </Row>

                                    <Col md="3">
                                        <SearchableSelectHookForm
                                            label={`Raw Material`}
                                            name={'RawMaterial'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            options={rmDropDownData}
                                            handleChange={handleRMDropDownChange}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.RawMaterial}
                                            disabled={props.CostingViewMode || !disableCondition}
                                            key={rmDropDownData.length}
                                        />
                                    </Col>
                                    <Row className={'mt15'}>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Inner Diameter(mm)`}
                                                name={'InnerDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={isVolumeAutoCalculate && (!(tableData.length > 0) || (tableData[tableData.length - 1]?.InnerDiameter === 0))}
                                                rules={{
                                                    required: isVolumeAutoCalculate && (!(tableData.length > 0) || (tableData[tableData.length - 1]?.InnerDiameter === 0)),
                                                    validate: { number, decimalAndNumberValidation, innerVsOuter: innerVsOuterValidation(getValues)},
                                                    // max: {
                                                    //     value: getValues('OuterDiameter') - 0.00000001, // adjust the threshold here acc to decimal validation above,
                                                    //     message: 'Inner Diameter should not be greater than outer diameter.'
                                                    // },
                                                }}
                                                handleChange={(e) => handleInnerDiameter(e.target.value)}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.InnerDiameter}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || ((tableData.length > 0 && disableCondition && (tableData[tableData.length - 1]?.InnerDiameter !== 0)) ? true : false)}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Outer Diameter(mm)`}
                                                name={'OuterDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={isVolumeAutoCalculate}
                                                rules={{
                                                    required: isVolumeAutoCalculate,
                                                    validate: { number, decimalAndNumberValidation },
                                                    min: {
                                                        value: parseFloat(getValues('InnerDiameter')) + 0.00000001, // adjust the threshold here acc to decimal validation above
                                                        message: 'Outer Diameter should be greater than the inner diameter.'
                                                    },
                                                }}
                                                handleChange={(e) => handleOuterDiameter(e.target.value)}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.OuterDiameter}
                                                disabled={props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Length(mm)`}
                                                name={'Length'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={isVolumeAutoCalculate && (!(tableData.length > 0) || (tableData[tableData.length - 1]?.Length == 0))}
                                                rules={{
                                                    required: isVolumeAutoCalculate && (!(tableData.length > 0) || (tableData[tableData.length - 1]?.Length == 0)),
                                                    validate: { number, decimalAndNumberValidation },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Length}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || ((tableData.length > 0 && disableCondition && (tableData[tableData.length - 1]?.Length !== 0)) ? true : false)}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Cutting Allowance(mm)`}
                                                name={'CuttingAllowance'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={isVolumeAutoCalculate && (!(tableData.length > 0) || (tableData[tableData.length - 1]?.CuttingAllowance === 0))}
                                                rules={{
                                                    required: isVolumeAutoCalculate && (!(tableData.length > 0) || (tableData[tableData.length - 1]?.CuttingAllowance === 0)),
                                                    validate: { number, decimalAndNumberValidation },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.CuttingAllowance}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || ((tableData.length > 0 && disableCondition && (tableData[tableData.length - 1]?.CuttingAllowance !== 0)) ? true : false)}
                                            />
                                        </Col>


                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'rubber-total-length'} tooltipText={"Total Length = Length + Cutting allowance "} />
                                            <TextFieldHookForm
                                                label={`Total Length(mm)`}
                                                id={'rubber-total-length'}
                                                name={'TotalLength'}
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

                                        <Col md="3">
                                            <div className="mt-3">
                                            <span className="d-inline-block mt15">
                                                <label
                                                className={`custom-checkbox mb-0`}
                                                onChange={onPressAutoCalculateVolume}
                                                >
                                                Auto Calculate Volume ?
                                                <input
                                                    type="checkbox"
                                                    checked={isVolumeAutoCalculate}
                                                    disabled={CostingViewMode || (Object.keys(rmRowDataState).length > 0 ? false : true)}
                                                />
                                                <span
                                                    className=" before-box"
                                                    checked={isVolumeAutoCalculate}
                                                    onChange={onPressAutoCalculateVolume}
                                                />
                                                </label>
                                            </span>
                                            </div>
                                        </Col>

                                        <Col md="3">                                       
                                        {isVolumeAutoCalculate &&
                                            <TooltipCustom disabledIcon={true} tooltipClass={'weight-of-sheet'} id={'rubber-volume'} tooltipText={volumeFormula} />
                                        }
                                            <TextFieldHookForm
                                                label={UnitFormat()}
                                                name={'Volume'}
                                                id={'rubber-volume'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                rules={{
                                                    required: !isVolumeAutoCalculate && (Object.keys(rmRowDataState).length > 0),
                                                    validate: { number, decimalAndNumberValidation },
                                                }}
                                                mandatory={!isVolumeAutoCalculate && (Object.keys(rmRowDataState).length > 0)}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Volume}
                                                disabled={isVolumeAutoCalculate || !(Object.keys(rmRowDataState).length > 0)}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'rubber-gross-weight'} tooltipText={"Gross Weight = Volume * Density / 1000000"} />
                                            <TextFieldHookForm
                                                label={`Gross Weight(Kg)`}
                                                name={'GrossWeight'}
                                                id={'rubber-gross-weight'}
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

                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`${finishWeightLabel} Weight(Kg)`}
                                                name={'FinishWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={(Object.keys(rmRowDataState).length > 0)}
                                                rules={{
                                                    required: (Object.keys(rmRowDataState).length > 0),
                                                    validate: { number, decimalAndNumberValidation, positiveAndDecimalNumber },
                                                    max: {
                                                        value: getValues('GrossWeight'),
                                                        message: `${finishWeightLabel} weight should not be greater than gross weight.`
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.FinishWeight}
                                                disabled={props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'rubber-scrap-weight'} tooltipText={`Scrap Weight = Gross Weight - ${finishedWeightLabel} Weight`} />
                                            <TextFieldHookForm
                                                label={`Scrap Weight(Kg)`}
                                                name={'ScrapWeight'}
                                                id={'rubber-scrap-weight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.ScrapWeight}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'rubber-cost-component'} tooltipClass={'weight-of-sheet'} tooltipText={"Net RM Cost/Component = Gross Weight * RMRate - Scrap Rate * Scrap Weight"} />
                                            <TextFieldHookForm
                                                label={`Net RM Cost/Component`}
                                                name={'NetRMCost'}
                                                id={'rubber-cost-component'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.NetRMCost}
                                                disabled={true}
                                            />
                                        </Col>

                                        <button
                                            type="button"
                                            className={'user-btn mt30 pull-left ml-3'}
                                            onClick={() => addRow()}
                                            disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || isDisableAdd}
                                        >
                                            <div className={'plus'}></div>{disableCondition ? "ADD" : "UPDATE"}
                                        </button>

                                        <button
                                            onClick={onCancel} // Need to change this cancel functionality
                                            type="submit"
                                            value="CANCEL"
                                            className="reset ml-2 cancel-btn mt30"
                                            disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0) || ((!Array.isArray(getValues('RawMaterial')) && Object.keys(getValues('RawMaterial') || {}).length > 0) && isDisableAdd) ? false : true}
                                        >
                                            <div className={''}></div>
                                            RESET
                                        </button>

                                    </Row>
                                </Col>
                            </div>
                            {!agGridTable && <LoaderCustom />}

                            {agGridTable && <Row className='ag-grid-react'>
                                <Col>
                                    <div className={`ag-grid-wrapper height-width-wrapper ${tableData && tableData.length <= 0 ? "overlay-contain" : ""} `}>

                                        <div className={`ag-theme-material  max-loader-height`}>
                                            <AgGridReact
                                                defaultColDef={defaultColDef}
                                                //floatingFilter={true}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={tableData}
                                                //pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                            >
                                                <AgGridColumn minWidth="150" field="RawMaterialName" headerName="RM Name" ></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="InnerDiameter" headerName="Inner Dia" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="OuterDiameter" headerName="Outer Dia " cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="Length" headerName="Length(mm)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="CuttingAllowance" headerName="Cutting Allowance" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="TotalLength" headerName="Total Length" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="Volume" headerName="Volume" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="FinishWeight" headerName={`${finishWeightLabel} Weight`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="ScrapWeight" headerName="Scrap Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                {/* <AgGridColumn minWidth="150" field="NetRMCost" headerName="Net RM Cost/Component" cellRenderer={'hyphenFormatter'}></AgGridColumn> */}
                                                <AgGridColumn minWidth="150" field="NetRMCost" headerName="Net RM Cost/Component" cellRenderer={'hyphenFormatterForPrice'}></AgGridColumn>
                                                <AgGridColumn minWidth="120" field="ProcessId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                            </AgGridReact>

                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            }

                            <div className="bluefooter-butn text-right">
                                {/* <span className='pr-2'>Total RM Cost : <span >{checkForDecimalAndNull(totalRMCost, getConfigurationKey().NoOfDecimalForPrice)}</span></span> */}
                                <span className='pr-2'>Total RM Cost : <span >{(tableData && tableData.length > 0) ? calculateTotalRmCost(tableData) : 0}</span></span>
                            </div>

                        </Col>
                        <div className="mt25 col-md-12 text-right">
                            <button
                                onClick={cancel} // Need to change this cancel functionality
                                type="submit"
                                value="CANCEL"
                                className="reset mr15 cancel-btn"
                            >
                                <div className={'cancel-icon'}></div>
                                CANCEL
                            </button>

                            <button
                                type="button"
                                className="submit-button  save-btn"
                                onClick={onSubmit}
                                disabled={(props.CostingViewMode || isDisable || tableData?.length === 0) ? true : false}
                            >
                                <div className={'save-icon'}></div>
                                {'SAVE'}
                            </button>
                        </div>
                    </form>
                </Col >
            </Row >
        </Fragment >
    )
}

export default StandardRub;