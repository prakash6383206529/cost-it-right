import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, number, decimalAndNumberValidation, decimalNumberLimit8And7, positiveAndDecimalNumber, loggedInUserId, innerVsOuterValidation } from '../../../../../helper'
import Toaster from '../../../../common/Toaster'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { KG, EMPTY_DATA, DEFAULTRMPRESSURE, RM_PRESSURE_MAP } from '../../../../../config/constants'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import _, { debounce } from 'lodash'
import LoaderCustom from '../../../../common/LoaderCustom';
import TooltipCustom from '../../../../common/Tooltip'
import { reactLocalStorage } from 'reactjs-localstorage'
import { useSelector } from 'react-redux'
import { sourceCurrencyFormatter } from '../../Drawers/processCalculatorDrawer/CommonFormula'
import { saveRawMaterialCalculationForRubberStandard } from '../../../actions/CostWorking'
import { useLabels } from '../../../../../helper/core'
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper'
import { generateUnusedRMsMessage } from '../../../../common/CommonFunctions'

const gridOptions = {};
function StandardRub(props) {
    const { item } = props
    const { finishedWeightLabel, finishWeightLabel } = useLabels()

    const dispatch = useDispatch();
    const { rmRowData, rmData, CostingViewMode } = props
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;
    // const isVolumeEditable = getConfigurationKey()?.IsVolumeEditableInRubberRMWeightCalculator ?? false

    const costData = useContext(costingInfoContext)
    const [tableData, setTableData] = useState(WeightCalculatorRequest && WeightCalculatorRequest?.RawMaterialRubberStandardWeightCalculator?.length > 0 ? WeightCalculatorRequest?.RawMaterialRubberStandardWeightCalculator : [])
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
    const [showUnusedRMsPopup, setShowUnusedRMsPopup] = useState(false);
    const [unusedRMsMessage, setUnusedRMsMessage] = useState('');
    const [pendingObj, setPendingObj] = useState({});

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
        name: ['InnerDiameter', 'OuterDiameter', 'Length', 'CuttingAllowance', 'ScrapPercentage', 'NumberOfBends', 'FinishWeight', 'BendTolerance', ...(!isVolumeAutoCalculate ? ['Volume'] : []), ...(!getConfigurationKey()?.IsCalculateVolumeForPartInRubber && isVolumeAutoCalculate ? ['FinishWeight'] : [])],
    })

    useEffect(() => {
        calculateTotalLength()
        calculateVolume()
        calculateScrapWeight()
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
        const BendTolerance = Number(getValues('BendTolerance'))
        const NumberOfBends = Number(getValues('NumberOfBends'))
        let TotalAllowance = checkForNull(CuttingAllowance) + (checkForNull(BendTolerance) * checkForNull(NumberOfBends))
        let TotalLength = checkForNull(Length) + checkForNull(TotalAllowance)
        setDataToSend(prevState => ({ ...prevState, TotalLength: TotalLength, TotalAllowance: TotalAllowance }))
        setValue('TotalAllowance', checkForDecimalAndNull(TotalAllowance, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('TotalLength', checkForDecimalAndNull(TotalLength, getConfigurationKey().NoOfDecimalForInputOutput))

    }


    const calculateVolume = debounce(() => {
        const InnerDiameter = Number(getValues('InnerDiameter'))
        const OuterDiameter = Number(getValues('OuterDiameter'))
        const TotalLength = dataToSend?.TotalLength
        const ScrapPercentage = checkForNull(getValues('ScrapPercentage'))

        if ((InnerDiameter && OuterDiameter) || !isVolumeAutoCalculate) {

            let Volume = Number(getValues('Volume'));
            if (isVolumeAutoCalculate) {
                Volume = (Math.PI / 4) * (Math.pow(checkForNull(OuterDiameter), 2) - Math.pow(checkForNull(InnerDiameter), 2)) * checkForNull(TotalLength)
                setValue('Volume', checkForDecimalAndNull(Volume, getConfigurationKey().NoOfDecimalForInputOutput))
            }
            let FinishWeight = (getConfigurationKey()?.IsCalculateVolumeForPartInRubber && !isVolumeAutoCalculate) ? Volume * (checkForNull(rmRowDataState.Density) / 1000000) : getValues('FinishWeight')

            let GrossWeight = (getConfigurationKey()?.IsCalculateVolumeForPartInRubber && !isVolumeAutoCalculate) ? checkForNull(checkForNull(FinishWeight) + checkForNull(checkForNull(FinishWeight) * checkForNull(ScrapPercentage) / 100)) : checkForNull(Volume) * (checkForNull(rmRowDataState.Density) / 1000000)
            let ScrapWeight = checkForNull(GrossWeight) - checkForNull(FinishWeight)

            let NetRmCost = checkForNull(GrossWeight) * checkForNull(rmRowDataState.RMRate) - checkForNull(rmRowDataState.ScrapRate) * ScrapWeight

            // calculateScrapWeight(checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            setDataToSend(prevState => ({ ...prevState, Volume: Volume, GrossWeight: GrossWeight, FinishWeight: FinishWeight, NetRMCost: NetRmCost, ScrapWeight: ScrapWeight }))
            setValue('GrossWeight', checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue('NetRMCost', checkForDecimalAndNull(NetRmCost, getConfigurationKey().NoOfDecimalForPrice))
            setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            if ((getConfigurationKey()?.IsCalculateVolumeForPartInRubber && !isVolumeAutoCalculate)) {
                setValue('FinishWeight', checkForDecimalAndNull(FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            }
        }
    }, 500)


    const calculateScrapWeight = () => {
        const FinishWeight = Number(getValues('FinishWeight'))
        if (Number(getValues('GrossWeight'))) {
            let ScrapWeight = checkForNull(dataToSend.GrossWeight) - checkForNull(FinishWeight)
            setDataToSend(prevState => ({ ...prevState, ScrapWeight: ScrapWeight }))
            setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            let NetRmCost = checkForNull(dataToSend.GrossWeight) * checkForNull(rmRowDataState.RMRate) - checkForNull(rmRowDataState.ScrapRate) * ScrapWeight
            setDataToSend(prevState => ({ ...prevState, NetRMCost: NetRmCost }))
            setValue('NetRMCost', checkForDecimalAndNull(NetRmCost, getConfigurationKey().NoOfDecimalForPrice))
        }
    }

    const calculateArea = () => {
        const InnerDiameter = Number(getValues('InnerDiameter'))
        const OuterDiameter = Number(getValues('OuterDiameter'))
        const Area = (Math.PI / 4) * (Math.pow(checkForNull(OuterDiameter), 2) - Math.pow(checkForNull(InnerDiameter), 2)) / 100;
        return Area;
    }

    const calculateTonnage = (type) => {
        const rmName = (rmRowDataState?.RMName?.split(" - ")[0]?.trim())?.toUpperCase();
        const pressureArr = RM_PRESSURE_MAP[rmName] ? RM_PRESSURE_MAP[rmName] : [DEFAULTRMPRESSURE, DEFAULTRMPRESSURE];
        const pressure = type === "MinTonnage" ? pressureArr[0] : pressureArr[1];
        const area = calculateArea();
        const tonnage = (area * pressure) / 1000;
        return tonnage
    };


    const handleRMDropDownChange = (e) => {
        try {
            if (!e || !e.code || !Array.isArray(rmData)) return;

            const selectedRMId = e.code;
            const selectedMaterial = rmData.find(item => item.RawMaterialId === selectedRMId);

            if (!selectedMaterial) {

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
                    setValue('NumberOfBends', lastRow.NumberOfBends || '');
                    setValue('BendTolerance', lastRow.BendTolerance || '');
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
        setValue('InnerDiameter', checkForDecimalAndNull(obj?.InnerDiameter, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('OuterDiameter', checkForDecimalAndNull(obj?.OuterDiameter, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('Length', checkForDecimalAndNull(obj?.Length, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('CuttingAllowance', checkForDecimalAndNull(obj?.CuttingAllowance, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('Volume', checkForDecimalAndNull(obj?.Volume, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('GrossWeight', checkForDecimalAndNull(obj?.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('FinishWeight', checkForDecimalAndNull(obj?.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('ScrapPercentage', checkForDecimalAndNull(obj?.ScrapPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('TotalAllowance', checkForDecimalAndNull(obj?.TotalAllowance, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('NumberOfBends', checkForDecimalAndNull(obj?.NumberOfBends, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('BendTolerance', checkForDecimalAndNull(obj?.BendTolerance, getConfigurationKey().NoOfDecimalForInputOutput))
        setTimeout(() => {
            setValue('ScrapWeight', checkForDecimalAndNull(obj?.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }, 200);
        setIsVolumeAutoCalculate(obj?.IsVolumeAutoCalculate ?? false)
        setDataToSend(prevState => ({ ...prevState, GrossWeight: obj?.GrossWeight, FinishWeight: obj?.FinishWeight, Volume: obj?.Volume, ScrapWeight: obj?.ScrapWeight, TotalAllowance: obj?.TotalAllowance, NumberOfBends: obj?.NumberOfBends, BendTolerance: obj?.BendTolerance, RMCost: obj?.RMCost }))
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
            InnerDiameter: checkForNull(getValues('InnerDiameter')),
            OuterDiameter: checkForNull(getValues('OuterDiameter')),
            Length: checkForNull(getValues('Length')),
            CuttingAllowance: checkForNull(getValues('CuttingAllowance')),
            NumberOfBends: checkForNull(getValues('NumberOfBends')),
            BendTolerance: checkForNull(getValues('BendTolerance')),
            TotalAllowance: checkForNull(dataToSend?.TotalAllowance),
            TotalLength: dataToSend.TotalLength,
            Volume: isVolumeAutoCalculate ? dataToSend.Volume : checkForNull(getValues('Volume')),
            GrossWeight: dataToSend.GrossWeight,
            FinishWeight: (getConfigurationKey()?.IsCalculateVolumeForPartInRubber && !isVolumeAutoCalculate) ? checkForNull(dataToSend?.FinishWeight) : checkForNull(getValues('FinishWeight')),
            ScrapPercentage: checkForNull(getValues('ScrapPercentage')),
            ScrapWeight: dataToSend.ScrapWeight,
            NetRMCost: dataToSend.NetRMCost,
            RawMaterialId: rmRowDataState.RawMaterialId,
            IsVolumeAutoCalculate: isVolumeAutoCalculate,
            Area: calculateArea(),
            Tonnage: calculateTonnage("Tonnage"),
            MinimumTonnage: calculateTonnage("MinTonnage"),
        }
        const lastRow = tableData[tableData.length - 1]
        const validationFields = [
            ...(isVolumeAutoCalculate ? ["OuterDiameter"] : ["Volume"]),
            "FinishWeight",
            ...(isVolumeAutoCalculate && (!(tableData.length > 0) || lastRow?.InnerDiameter === 0) ? ["InnerDiameter"] : []),
            ...(isVolumeAutoCalculate && (!(tableData.length > 0) || lastRow?.CuttingAllowance === 0) ? ["CuttingAllowance"] : []),
            ...(isVolumeAutoCalculate && (!(tableData.length > 0) || lastRow?.Length === 0) ? ["Length"] : []),
            // ...((getConfigurationKey()?.IsCalculateVolumeForPartInRubber && !isVolumeAutoCalculate) && (!(tableData.length > 0) || (!isVolumeAutoCalculate && lastRow?.ScrapPercentage === 0) ? ['ScrapPercentage'] : []))
        ];
        const isValid = await trigger(validationFields);
        if (!isValid) {
            return false;
        } else if ((!isVolumeAutoCalculate && obj.Volume === 0) || (isVolumeAutoCalculate && (obj.InnerDiameter === 0 || obj.OuterDiameter === 0 || obj.Length === 0))) {
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
            RawMaterial: [],
            ScrapPercentage: "",
            TotalAllowance: "",
            NumberOfBends: "",
            BendTolerance: ""

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
            RawMaterial: [],
            ScrapPercentage: "",
            TotalAllowance: "",
            NumberOfBends: "",
            BendTolerance: ""

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
        const usedRmData = rmData.filter(rmData => tableData.find(tableData => tableData?.RawMaterialId === rmData?.RawMaterialId));
        const unUsedRmData = rmData.filter(rmData => !tableData.find(tableData => tableData?.RawMaterialId === rmData?.RawMaterialId));

        // obj.LayoutType = 'Default'
        // obj.WeightCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000"
        // obj.IsChangeApplied = true //NEED TO MAKE IT DYNAMIC how to do
        obj.PartId = costData.PartId
        obj.RawMaterialId = rmRowData.RawMaterialId
        obj.CostingId = item?.CostingId
        obj.TechnologyId = costData.TechnologyId
        // obj.CostingRawMaterialDetailId = rmRowData.RawMaterialDetailId
        // obj.NetLandedCost = grossWeights * rmRowData.RMRate - (grossWeights - getValues('finishWeight')) * rmRowData.ScrapRate
        // obj.PartNumber = costData.PartNumber
        // obj.TechnologyName = costData.TechnologyName
        obj.UOMForDimension = KG

        // obj.CalculatedRmTableData = tableData

        obj.BaseCostingId = item?.CostingId
        obj.LoggedInUserId = loggedInUserId()
        obj.RawMaterialRubberStandardWeightCalculator = tableData
        obj.MinimumMachineTonnageRequired = getConfigurationKey()?.IsMachineTonnageFilterEnabledInCosting ? Math.min(...tableData.map(item => item.MinimumTonnage)) : null;
        obj.usedRmData = usedRmData

        if (unUsedRmData.length > 0) {
            const message = generateUnusedRMsMessage(unUsedRmData)
            setUnusedRMsMessage(message)
            setShowUnusedRMsPopup(true)
            setPendingObj(obj)
        } else {
            saveRawMaterialCalculationForRubberStandardFunction(obj)
        }
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

    const saveRawMaterialCalculationForRubberStandardFunction = (obj) => {
        //APPLY NEW ACTION HERE 
        dispatch(saveRawMaterialCalculationForRubberStandard(obj, (res) => {
            if (res?.data?.Result) {
                Toaster.success("Calculation saved successfully")
                obj.CalculatorType = "Standard"
                props.toggleDrawer('Standard', obj)
            }
        }))
    }
    const closeUnusedRMsPopup = () => {
        setShowUnusedRMsPopup(false)
    }
    const confirmRemoveUnusedRMs = () => {
        setShowUnusedRMsPopup(false)
        saveRawMaterialCalculationForRubberStandardFunction(pendingObj)
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
                                                    validate: { number, decimalAndNumberValidation, innerVsOuter: innerVsOuterValidation(getValues) },
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
                                            <TextFieldHookForm
                                                label={`No. Of Bends`}
                                                name={'NumberOfBends'}
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
                                                errors={errors.NumberOfBends}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || ((tableData.length > 0 && disableCondition && (tableData[tableData.length - 1]?.CuttingAllowance !== 0)) ? true : false)}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`Bends Tolerance(mm)`}
                                                name={'BendTolerance'}
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
                                                errors={errors.BendTolerance}
                                                disabled={(props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true) || ((tableData.length > 0 && disableCondition && (tableData[tableData.length - 1]?.CuttingAllowance !== 0)) ? true : false)}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'rubber-total-allowance'} tooltipText={"Total Allowance = Cutting Allowance(mm) + (Bends Tolerance(mm) * No. Of Bends)"} />
                                            <TextFieldHookForm
                                                label={`Total Allowance`}
                                                name={'TotalAllowance'}
                                                id={'rubber-total-allowance'}
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
                                                errors={errors.TotalAllowance}
                                                disabled={true}
                                            />
                                        </Col>


                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'rubber-total-length'} tooltipText={"Total Length = Length + Total allowance "} />
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
                                                    validate: { number, decimalNumberLimit8And7 },
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

                                        {
                                            (!getConfigurationKey()?.IsCalculateVolumeForPartInRubber || isVolumeAutoCalculate) ? (
                                                <>

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
                                                </>
                                            )
                                                : (
                                                    <>


                                                        <Col md="3">
                                                            <TooltipCustom disabledIcon={true} id={`rubber-${finishWeightLabel}-weight`} tooltipText={`${finishWeightLabel} Weight = Volume * Density / 1000000`} />
                                                            <TextFieldHookForm
                                                                label={`${finishWeightLabel} Weight(Kg)`}
                                                                name={'FinishWeight'}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                id={`rubber-${finishWeightLabel}-weight`}
                                                                mandatory={(Object.keys(rmRowDataState).length > 0)}
                                                                rules={{
                                                                    required: (Object.keys(rmRowDataState).length > 0),
                                                                    validate: { number, decimalAndNumberValidation, positiveAndDecimalNumber },
                                                                    // max: {
                                                                    //     value: getValues('GrossWeight'),
                                                                    //     message: `${finishWeightLabel} weight should not be greater than gross weight.`
                                                                    // },
                                                                }}
                                                                handleChange={() => { }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.FinishWeight}
                                                                disabled={true}
                                                            />
                                                        </Col>
                                                        <Col md="3">
                                                            <TextFieldHookForm
                                                                label={`Scrap Percentage`}
                                                                name={'ScrapPercentage'}
                                                                Controller={Controller}
                                                                control={control}
                                                                register={register}
                                                                mandatory={(Object.keys(rmRowDataState).length > 0)}
                                                                rules={{
                                                                    required: (Object.keys(rmRowDataState).length > 0),
                                                                    validate: { number, decimalAndNumberValidation, positiveAndDecimalNumber, },
                                                                    max: {
                                                                        value: 100,
                                                                        message: 'Percentage value should be equal to 100'
                                                                    },
                                                                }}
                                                                handleChange={() => { }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder'}
                                                                errors={errors.ScrapPercentage}
                                                                disabled={props.isEditFlag && Object.keys(rmRowDataState).length > 0 ? false : true}
                                                            />
                                                        </Col>

                                                        <Col md="3">
                                                            <TooltipCustom disabledIcon={true} id={'rubber-gross-weight-for-part'} tooltipText={`Gross Weight = ${finishWeightLabel} Weight + ${finishWeightLabel} Weight * Scrap Percentage / 100`} />
                                                            <TextFieldHookForm
                                                                label={`Gross Weight(Kg)`}
                                                                name={'GrossWeight'}
                                                                id={'rubber-gross-weight-for-part'}
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
                                                    </>
                                                )

                                        }

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
                                                <AgGridColumn minWidth="150" field="BendTolerance" headerName="Bends Tolerance" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="NumberOfBends" headerName="Number of Bends" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="TotalAllowance" headerName="Total Allowance" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="TotalLength" headerName="Total Length" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                <AgGridColumn minWidth="150" field="Volume" headerName="Volume" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                {getConfigurationKey()?.IsCalculateVolumeForPartInRubber ?
                                                    <>

                                                        <AgGridColumn minWidth="150" field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                        <AgGridColumn minWidth="150" field="FinishWeight" headerName={`${finishWeightLabel} Weight`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                        <AgGridColumn minWidth="150" field="ScrapWeight" headerName="Scrap Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                    </>
                                                    :
                                                    <>
                                                        <AgGridColumn minWidth="150" field="ScrapWeight" headerName="Scrap Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                                        <AgGridColumn minWidth="150" field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>

                                                    </>
                                                }
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
                        {showUnusedRMsPopup && (
                            <PopupMsgWrapper
                                isOpen={showUnusedRMsPopup}
                                closePopUp={closeUnusedRMsPopup}
                                confirmPopup={confirmRemoveUnusedRMs}
                                message={unusedRMsMessage}
                            />
                        )}
                    </form>
                </Col >
            </Row >
        </Fragment >
    )
}

export default StandardRub;
