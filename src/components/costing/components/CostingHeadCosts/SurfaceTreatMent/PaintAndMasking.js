import { Drawer } from '@material-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { Col, Container, Row, Table } from 'reactstrap'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import Button from '../../../../layout/Button'
import { checkForDecimalAndNull, checkForNull, checkWhiteSpaces, loggedInUserId, maxLength7, number } from '../../../../../helper'
import TooltipCustom from '../../../../common/Tooltip'
import { useDispatch, useSelector } from 'react-redux'
import NoContentFound from '../../../../common/NoContentFound'
import { CBCTypeId, EMPTY_DATA, EMPTY_GUID, NCCTypeId, NFRTypeId, PAINTTECHNOLOGY, PFS1TypeId, PFS2TypeId, PFS3TypeId, VBCTypeId, ZBCTypeId } from '../../../../../config/constants'
import Toaster from '../../../../common/Toaster'
import { debounce } from 'lodash'
import { getPaintCoatList, getRMDrawerDataList, getSurfaceTreatmentRawMaterialCalculator, saveSurfaceTreatmentRawMaterialCalculator, setSurfaceData } from '../../../actions/Costing'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import LoaderCustom from '../../../../common/LoaderCustom'

const TABLE_HEADERS = ['Paint Coat', 'Raw Material', 'Part Surface Area', 'Consumption', 'Rejection Allowance (%)', 'Rejection Allowance', 'RM Rate', 'Paint Cost', 'Action']

const FORM_DEFAULTS = {
    mode: 'onChange',
    reValidateMode: 'onChange'
}

const INITIAL_STATE = {
    Coats: [],
    TapeCost: 0,
    PaintCost: 0,
    TotalPaintCost: 0
}

function PaintAndMasking({ anchor, isOpen, closeDrawer, ViewMode, CostingViewMode }) {
    const [state, setState] = useState({
        editMode: false,
        rawMaterialList: [],
        loader: false
    })
    const dispatch = useDispatch()
    const costData = useContext(costingInfoContext);
    const { CostingEffectiveDate, paintCoatList, SurfaceTabData } = useSelector(state => state.costing)
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [calculateState, setCalculateState] = useState(INITIAL_STATE)
    const { NoOfDecimalForInputOutput, NoOfDecimalForPrice } = useSelector(state => state.auth.initialConfiguration)

    const {
        register: registerInitialForm,
        handleSubmit: handleSubmitInitialForm,
        control: controlInitialForm,
        formState: { errors: errorsInitialForm },
        reset: resetInitialForm
    } = useForm(FORM_DEFAULTS)

    const {
        register: registerTableForm,
        handleSubmit: handleSubmitTableForm,
        control: controlTableForm,
        setValue: setValueTableForm,
        getValues: getValuesTableForm,
        formState: { errors: errorsTableForm },
    } = useForm(FORM_DEFAULTS)

    useEffect(() => {
        getDetails()
        if (!ViewMode) {
            dispatch(getPaintCoatList(() => { }))
            const data = {
                VendorId: costData?.VendorId ? costData?.VendorId : EMPTY_GUID,

                PlantId: (initialConfiguration?.IsDestinationPlantConfigure && (costData.CostingTypeId === VBCTypeId || costData.CostingTypeId === NCCTypeId || costData.CostingTypeId === NFRTypeId || costData.CostingTypeId === PFS1TypeId
                    || costData.CostingTypeId === PFS2TypeId || costData.CostingTypeId === PFS3TypeId)) || costData.CostingTypeId === CBCTypeId ? costData.DestinationPlantId : (costData.CostingTypeId === ZBCTypeId) ? costData.PlantId : EMPTY_GUID,

                TechnologyId: PAINTTECHNOLOGY,
                VendorPlantId: initialConfiguration?.IsVendorPlantConfigurable ? costData?.VendorPlantId : EMPTY_GUID,
                EffectiveDate: CostingEffectiveDate,
                CostingId: costData?.CostingId,
                material_id: null,
                grade_id: null,

                CostingTypeId: (Number(costData.CostingTypeId) === NFRTypeId || Number(costData.CostingTypeId) === VBCTypeId || Number(costData.CostingTypeId) === PFS1TypeId
                    || Number(costData.CostingTypeId) === PFS2TypeId || Number(costData.CostingTypeId) === PFS3TypeId) ? VBCTypeId : costData.CostingTypeId,

                CustomerId: costData?.CustomerId,
                PartId: costData?.PartId,
                IsRFQ: false,
                QuotationPartId: null
            }
            dispatch(getRMDrawerDataList(data, false, [], true, (res) => {

                if (res && res.status === 200) {
                    let Data = res?.data?.DataList;
                    setState(prev => ({
                        ...prev,
                        rawMaterialList: Data
                    }))
                } else if (res && res.status === 204) {
                    setState(prev => ({
                        ...prev,
                        rawMaterialList: []
                    }))
                }
            }))
        }
    }, [costData])
    const getDetails = () => {
        setState(prev => ({
            ...prev,
            loader: true
        }))
        dispatch(getSurfaceTreatmentRawMaterialCalculator({ BaseCostingId: costData.CostingId, LoggedInUserId: loggedInUserId() }, (res) => {
            setState(prev => ({
                ...prev,
                loader: false
            }))
            if (res && res.status === 200) {
                let Data = res.data.Data;
                setCalculateState(prev => ({
                    ...prev,
                    Coats: Data?.Coats,
                    TapeCost: checkForNull(Data?.TapeCost),
                    PaintCost: checkForNull(Data?.PaintCost),
                    TotalPaintCost: checkForNull(Data?.TotalPaintCost)
                }))
                setTimeout(() => {
                    Data.Coats.map((item, parentIndex) => {
                        item.RawMaterials.map((rm, childIndex) => {
                            setValueTableForm(`SurfaceArea${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(rm?.SurfaceArea, NoOfDecimalForInputOutput))
                            setValueTableForm(`Consumption${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(rm?.Consumption, NoOfDecimalForInputOutput))
                            setValueTableForm(`RejectionAllowancePercentage${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(rm?.RejectionAllowancePercentage, NoOfDecimalForInputOutput))
                            setValueTableForm(`RejectionAllowance${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(rm?.RejectionAllowance, NoOfDecimalForInputOutput))
                            setValueTableForm(`NetCost${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(rm?.NetCost, NoOfDecimalForPrice))
                        })

                    })
                    setState(prev => ({
                        ...prev,
                        loader: false
                    }))
                }, 100)
                setValueTableForm(`TotalPaintCost`, checkForDecimalAndNull(Data?.TotalPaintCost, NoOfDecimalForPrice))
                setValueTableForm(`TapeCost`, checkForDecimalAndNull(Data?.TapeCost, NoOfDecimalForPrice))
            } else {
                setState(prev => ({
                    ...prev,
                    loader: false
                }))
            }
        }))
    }
    const deleteItem = (item, parentIndex) => {
        setCalculateState(prev => ({
            ...prev,
            Coats: prev.Coats.filter((_, i) => i !== parentIndex)
        }))
        calculateTotalCost(calculateState.Coats.filter((_, i) => i !== parentIndex))
    }

    const addData = data => {
        const existingPaintCoat = calculateState?.Coats?.find(item => item?.PaintCoat === data?.PaintCoat?.label)

        if (existingPaintCoat) {
            Toaster.warning("Paint Coat already exist")
            return
        }
        let paintCoatSequence = calculateState?.Coats?.length + 1
        let rawMaterialSequence = data?.RawMaterial?.length + 1
        setCalculateState(prev => ({
            ...prev,
            Coats: [...prev.Coats, {
                PaintCoat: data?.PaintCoat?.label,
                PaintCoatSequence: paintCoatSequence,
                RawMaterials: data?.RawMaterial?.map(item => ({
                    ...item,
                    RawMaterialSequence: rawMaterialSequence
                }))
            }]
        }))

        resetInitialForm({
            PaintCoat: null,
            RawMaterial: null
        })
    }

    const renderList = (type) => {
        let temp = []
        if (type === 'RawMaterial') {
            temp = state.rawMaterialList && state.rawMaterialList?.length !== 0 && state.rawMaterialList?.map(item => ({
                ...item,
                label: item?.RawMaterial,
                value: item?.RawMaterialId
            }))
        }
        if (type === 'PaintCoat') {
            paintCoatList && paintCoatList?.length !== 0 && paintCoatList?.map(item => {
                if (item?.Value === '--0--') return false
                temp.push({ label: item?.Text, value: item?.Value })
                return null
            })
        }
        return temp
    }
    const onSubmit = (data) => {
        let obj = {
            ...calculateState,
            LoggedInUserId: loggedInUserId(),
            BaseCostingId: costData?.CostingId
        }
        dispatch(saveSurfaceTreatmentRawMaterialCalculator(obj, (response) => {
            if (response && response?.status === 200) {
                Toaster.success("Data saved successfully")
                closeDrawer(checkForNull(calculateState?.TotalPaintCost))
                let newData = [...SurfaceTabData];
                newData.map(item => {
                    if (item?.CostingId === costData?.CostingId) {
                        let CostingPartDetails = item?.CostingPartDetails
                        CostingPartDetails.TotalPaintCost = checkForNull(calculateState?.TotalPaintCost)
                        CostingPartDetails.PaintCost = checkForNull(calculateState?.PaintCost)
                        CostingPartDetails.TapeCost = checkForNull(calculateState?.TapeCost)
                    }
                })
                dispatch(setSurfaceData(newData, () => { }))
            }
        }))
    }

    const calculateTotalCost = (tableData) => {
        let totalPaintCost = 0
        const getTapValue = checkForNull(getValuesTableForm(`TapeCost`))
        const totalNetCost = tableData?.reduce((total, paintData) => {
            return total + paintData?.RawMaterials?.reduce((rmTotal, rmItem) => {
                return rmTotal + (rmItem?.NetCost || 0);
            }, 0);
        }, 0);
        totalPaintCost = totalNetCost + checkForNull(getTapValue)
        setCalculateState(prev => ({
            ...prev,
            PaintCost: totalNetCost,
            TotalPaintCost: totalPaintCost
        }));
        setValueTableForm(`TotalPaintCost`, checkForDecimalAndNull(totalPaintCost, NoOfDecimalForPrice))
    }
    const calculateValues = debounce((surfaceArea, consumption, rejectionAllowancePercentage, parentIndex, childIndex, rm) => {
        const surfaceAreaAndConsumption = surfaceArea * consumption
        const rejectionAllowance = surfaceAreaAndConsumption * rejectionAllowancePercentage / 100
        const netCost = (surfaceAreaAndConsumption + rejectionAllowance) * rm?.BasicRatePerUOM
        let paintDataListTemp = [...calculateState.Coats];
        if (paintDataListTemp[parentIndex]?.RawMaterials[childIndex]) {
            paintDataListTemp[parentIndex].RawMaterials[childIndex] = {
                ...paintDataListTemp[parentIndex].RawMaterials[childIndex],
                RejectionAllowance: checkForNull(rejectionAllowance),
                NetCost: checkForNull(netCost),
                SurfaceArea: checkForNull(surfaceArea),
                Consumption: checkForNull(consumption),
                RejectionAllowancePercentage: checkForNull(rejectionAllowancePercentage),
                id: rm?.RawMaterialId
            }

            // Calculate total NetCost across all items
            calculateTotalCost(paintDataListTemp)

        }

        setCalculateState(prev => ({
            ...prev,
            Coats: paintDataListTemp,
        }))

        setValueTableForm(`RejectionAllowance${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(rejectionAllowance, NoOfDecimalForInputOutput))
        setValueTableForm(`NetCost${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`, checkForDecimalAndNull(netCost, NoOfDecimalForPrice))
    }, 300)
    const renderInputBox = ({ item, name, coat, parentIndex, childIndex, disabled, onHandleChange }) => {
        return (
            <TextFieldHookForm
                label={false}
                name={`${name}${item?.RawMaterialId}${coat}${parentIndex}${childIndex}`}
                Controller={Controller}
                control={controlTableForm}
                register={registerTableForm}
                rules={{
                    required: true,
                    validate: { number, checkWhiteSpaces, maxLength7 }
                }}
                handleChange={onHandleChange ?? (() => { })}
                defaultValue={''}
                customClassName={'withBorder mb-0'}
                errors={errorsTableForm[`${item?.RawMaterialId}${coat}${parentIndex}${childIndex}`]}
                disabled={disabled}
            />
        )
    }

    const renderTableRows = () => {
        if (!calculateState?.Coats?.length) {
            return (
                <tr>
                    <td colSpan={TABLE_HEADERS.length}>
                        <NoContentFound title={EMPTY_DATA} />
                    </td>
                </tr>
            )
        }

        return calculateState?.Coats?.map((item, parentIndex) => {
            if (!item?.RawMaterials?.length) return null

            return item?.RawMaterials?.map((rm, childIndex) => (
                <tr key={`${parentIndex}-${childIndex}`}>
                    {childIndex === 0 && (
                        <td width="90" rowSpan={item?.RawMaterials?.length}>
                            {item?.PaintCoat || '-'}
                        </td>
                    )}
                    <td>{rm?.RawMaterial || '-'}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'SurfaceArea',
                        coat: rm?.RawMaterial,
                        parentIndex,
                        childIndex,
                        onHandleChange: e => calculateValues(
                            e.target.value,
                            checkForNull(getValuesTableForm(`Consumption${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`)),
                            checkForNull(getValuesTableForm(`RejectionAllowancePercentage${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`)),
                            parentIndex,
                            childIndex,
                            rm
                        )
                    })}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'Consumption',
                        coat: rm?.RawMaterial,
                        parentIndex,
                        childIndex,
                        onHandleChange: e => calculateValues(
                            checkForNull(getValuesTableForm(`SurfaceArea${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`)),
                            e.target.value,
                            checkForNull(getValuesTableForm(`RejectionAllowancePercentage${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`)),
                            parentIndex,
                            childIndex,
                            rm
                        )
                    })}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'RejectionAllowancePercentage',
                        coat: rm?.RawMaterial,
                        parentIndex,
                        childIndex,
                        onHandleChange: e => calculateValues(
                            checkForNull(getValuesTableForm(`SurfaceArea${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`)),
                            checkForNull(getValuesTableForm(`Consumption${rm?.RawMaterialId}${rm?.RawMaterial}${parentIndex}${childIndex}`)),
                            e.target.value,
                            parentIndex,
                            childIndex,
                            rm
                        )
                    })}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'RejectionAllowance',
                        coat: rm?.RawMaterial,
                        parentIndex,
                        childIndex,
                        disabled: true
                    })}</td>
                    <td>{checkForDecimalAndNull(rm?.BasicRatePerUOM, NoOfDecimalForInputOutput) || ''}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'NetCost',
                        coat: rm?.RawMaterial,
                        parentIndex,
                        childIndex,
                        disabled: true
                    })}</td>
                    {childIndex === 0 && (
                        <td width="50" rowSpan={item.RawMaterials.length}>
                            <Button
                                id={`PaintAndMasking_delete${parentIndex}-${childIndex}`}
                                className="mr-1 Tour_List_Delete"
                                variant="Delete"
                                onClick={() => deleteItem(item, parentIndex)}
                                title="Delete"
                            />
                        </td>
                    )}
                </tr>
            ))
        })
    }
    const handleTapeCostChange = (e) => {
        const value = (e && e?.target && e?.target?.value) ? Number(e?.target?.value) : 0
        let calculateCost = checkForNull(value) + checkForNull(calculateState.PaintCost)
        setCalculateState(prev => ({
            ...prev,
            TapeCost: value,
            TotalPaintCost: calculateCost
        }))
        setValueTableForm(`TotalPaintCost`, checkForDecimalAndNull(calculateCost, NoOfDecimalForPrice))
    }
    return (
        <Drawer anchor={anchor} open={isOpen}>
            <div className="ag-grid-react hidepage-size">
                <Container className="add-bop-drawer">
                    <div className="drawer-wrapper layout-min-width-1000px">
                        <Row className="drawer-heading">
                            <Col className="pl-0">
                                <div className="header-wrapper left">
                                    <h3>Paint and Masking:</h3>
                                </div>
                                <div onClick={() => closeDrawer(calculateState.TotalPaintCost)} className="close-button right" />
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmitInitialForm(addData)}>
                            <Row>
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label="Paint Coat"
                                        name="PaintCoat"
                                        placeholder="Select"
                                        Controller={Controller}
                                        control={controlInitialForm}
                                        register={registerInitialForm}
                                        mandatory
                                        rules={{ required: true }}
                                        options={renderList('PaintCoat')}
                                        handleChange={() => { }}
                                        defaultValue=""
                                        customClassName="withBorder"
                                        errors={errorsInitialForm.PaintCoat}
                                        disabled={ViewMode || state.editMode}
                                    />
                                </Col>
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label="Raw Material"
                                        name="RawMaterial"
                                        placeholder="Select"
                                        Controller={Controller}
                                        control={controlInitialForm}
                                        register={registerInitialForm}
                                        mandatory
                                        rules={{ required: true }}
                                        options={renderList('RawMaterial')}
                                        isMulti
                                        handleChange={() => { }}
                                        defaultValue=""
                                        customClassName="withBorder"
                                        errors={errorsInitialForm.RawMaterial}
                                        disabled={ViewMode || state.editMode}
                                    />
                                </Col>
                                <Col md="4">
                                    <div className="d-flex mt-4 pt-2">
                                        <Button
                                            id="PaintAndMasking_save"
                                            type="submit"
                                            className="mr5 mb-2"
                                            icon="plus"
                                            buttonName="Add"
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </form>
                    </div>

                    {state.loader ? <LoaderCustom /> : <form onSubmit={handleSubmitTableForm(onSubmit)}>
                        <Table responsive bordered className="table-with-input-data">
                            <thead>
                                <tr>
                                    {TABLE_HEADERS.map((item, index) => (
                                        <th key={index}>{item}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {renderTableRows()}
                                <tr className="table-footer">
                                    <td colSpan={TABLE_HEADERS.length - 2} className="text-right">
                                        Total Cost
                                    </td>
                                    <td colSpan={2}>
                                        {/* <TooltipCustom
                                            id="totalGSM"
                                            disabledIcon
                                            tooltipText="Layer 1 GSM + (Layer 2 GSM +Flute)+Layer 3 GSM..."
                                        /> */}
                                        <div className="w-fit" id="totalGSM">
                                            {checkForDecimalAndNull(calculateState?.PaintCost, NoOfDecimalForInputOutput)}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <Row className="mb-2">
                            <Col md="4">
                                <TextFieldHookForm
                                    label="Masking/ Tape"
                                    name="TapeCost"
                                    Controller={Controller}
                                    control={controlTableForm}
                                    register={registerTableForm}
                                    rules={{
                                        validate: { number, checkWhiteSpaces, maxLength7 }
                                    }}
                                    handleChange={(e) => handleTapeCostChange(e)}
                                    defaultValue=""
                                    customClassName="withBorder mb-0"
                                    errors={errorsTableForm.TapeCost}
                                />
                            </Col>
                            <Col md="4">
                                <TextFieldHookForm
                                    label="Total Paint cost"
                                    name="TotalPaintCost"
                                    Controller={Controller}
                                    control={controlTableForm}
                                    register={registerTableForm}
                                    handleChange={() => { }}
                                    defaultValue=""
                                    customClassName="withBorder mb-0"
                                    errors={errorsTableForm.TotalPaintCost}
                                    disabled
                                />
                            </Col>
                        </Row>

                        {!CostingViewMode && (
                            <Row className="sticky-footer">
                                <Col md="12" className="text-right bluefooter-butn d-flex align-items-center justify-content-end">
                                    <Button
                                        id="PaintAndMasking_cancel"
                                        className="mr-2"
                                        variant="cancel-btn"
                                        onClick={() => {
                                            closeDrawer(calculateState.TotalPaintCost)
                                        }}
                                        icon="cancel-icon"
                                        buttonName="Cancel"
                                    />
                                    <Button
                                        id="PaintAndMasking_submit"
                                        type="submit"
                                        disabled={CostingViewMode}
                                        icon="save-icon"
                                        buttonName="Save"
                                    />
                                </Col>
                            </Row>
                        )}
                    </form>}
                </Container>
            </div>
        </Drawer>
    )
}

export default PaintAndMasking