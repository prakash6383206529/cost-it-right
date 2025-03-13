import { Drawer } from '@material-ui/core'
import React, { useState } from 'react'
import { Col, Container, Row, Table } from 'reactstrap'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { Controller, useForm } from 'react-hook-form'
import { Paint, RawMaterialForPaint } from '../../../../../helper/Dummy'
import Button from '../../../../layout/Button'
import { checkForDecimalAndNull, checkWhiteSpaces, maxLength7, number } from '../../../../../helper'
import TooltipCustom from '../../../../common/Tooltip'
import { useSelector } from 'react-redux'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import Toaster from '../../../../common/Toaster'
import { debounce } from 'lodash'

const TABLE_HEADERS = ['Paint Coat', 'Raw Material', 'Part Surface Area', 'Consumption', 'Rejection Allowance (%)', 'Rejection Allowance', 'RM Rate', 'Paint Cost', 'Action']

const FORM_DEFAULTS = {
    mode: 'onChange',
    reValidateMode: 'onChange'
}

const INITIAL_STATE = {
    editMode: false,
    paintDataList: [],
    TapeCost: 0,
    PaintCost: 0
}

function PaintAndMasking({ anchor, isOpen, closeDrawer, ViewMode, CostingViewMode }) {
    const [state, setState] = useState(INITIAL_STATE)
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

    const deleteItem = (item, parentIndex) => {
        setState(prev => ({
            ...prev,
            paintDataList: prev.paintDataList.filter((_, i) => i !== parentIndex)
        }))
    }

    const addData = data => {
        const existingPaintCoat = state.paintDataList.find(item => item.paintCoat === data.PaintCoat?.label)

        if (existingPaintCoat) {
            Toaster.warning("Paint Coat already exist")
            return
        }

        setState(prev => ({
            ...prev,
            paintDataList: [...prev.paintDataList, {
                paintCoat: data.PaintCoat?.label,
                rawMaterialList: data.RawMaterial
            }]
        }))

        resetInitialForm({
            PaintCoat: null,
            RawMaterial: null
        })
    }
    const onSubmit = (data) => {
        console.log(state.TotalPaintCost, "test test")
        closeDrawer(state.TotalPaintCost)

    }
    const calculateValues = debounce((surfaceArea, consumption, rejectionAllowancePercentage, parentIndex, childIndex, rm) => {
        const surfaceAreaAndConsumption = surfaceArea * consumption
        const rejectionAllowance = surfaceAreaAndConsumption * rejectionAllowancePercentage / 100
        const netCost = (surfaceAreaAndConsumption + rejectionAllowance) * rm?.RmRate

        let paintDataListTemp = [...state.paintDataList];
        if (paintDataListTemp[parentIndex]?.rawMaterialList[childIndex]) {
            paintDataListTemp[parentIndex].rawMaterialList[childIndex] = {
                ...paintDataListTemp[parentIndex].rawMaterialList[childIndex],
                RejectionAllowance: rejectionAllowance,
                NetCost: netCost,
                SurfaceArea: surfaceArea,
                Consumption: consumption,
                RejectionAllowancePercentage: rejectionAllowancePercentage,
                id: rm?.value
            }

            // Calculate total NetCost across all items
            const totalNetCost = paintDataListTemp.reduce((total, paintData) => {
                return total + paintData.rawMaterialList.reduce((rmTotal, rmItem) => {
                    return rmTotal + (rmItem.NetCost || 0);
                }, 0);
            }, 0);

            setState(prev => ({
                ...prev,
                PaintCost: totalNetCost,
                TotalPaintCost: totalNetCost + prev.TapeCost
            }));
        }

        setState(prev => ({
            ...prev,
            paintDataList: paintDataListTemp,
        }))

        setValueTableForm(`TotalPaintCost`, checkForDecimalAndNull(state.TotalPaintCost, NoOfDecimalForPrice))
        setValueTableForm(`RejectionAllowance${rm?.value}${rm?.label}${parentIndex}${childIndex}`, checkForDecimalAndNull(rejectionAllowance, NoOfDecimalForInputOutput))
        setValueTableForm(`NetCost${rm?.value}${rm?.label}${parentIndex}${childIndex}`, checkForDecimalAndNull(netCost, NoOfDecimalForPrice))

    }, 700)
    const renderInputBox = ({ item, name, coat, parentIndex, childIndex, disabled, onHandleChange }) => (
        <TextFieldHookForm
            label={false}
            name={`${name}${item?.value}${coat}${parentIndex}${childIndex}`}
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
            errors={errorsTableForm[`${item?.value}${coat}${parentIndex}${childIndex}`]}
            disabled={disabled}
        />
    )

    const renderTableRows = () => {
        if (!state.paintDataList?.length) {
            return (
                <tr>
                    <td colSpan={TABLE_HEADERS.length}>
                        <NoContentFound title={EMPTY_DATA} />
                    </td>
                </tr>
            )
        }

        return state.paintDataList.map((item, parentIndex) => {
            if (!item?.rawMaterialList?.length) return null

            return item.rawMaterialList.map((rm, childIndex) => (
                <tr key={`${parentIndex}-${childIndex}`}>
                    {childIndex === 0 && (
                        <td width="90" rowSpan={item.rawMaterialList.length}>
                            {item.paintCoat || '-'}
                        </td>
                    )}
                    <td>{rm?.label || '-'}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'SurfaceArea',
                        coat: rm?.label,
                        parentIndex,
                        childIndex,
                        onHandleChange: e => calculateValues(
                            e.target.value,
                            getValuesTableForm(`Consumption${rm?.value}${rm?.label}${parentIndex}${childIndex}`),
                            getValuesTableForm(`RejectionAllowancePercentage${rm?.value}${rm?.label}${parentIndex}${childIndex}`),
                            parentIndex,
                            childIndex,
                            rm
                        )
                    })}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'Consumption',
                        coat: rm?.label,
                        parentIndex,
                        childIndex,
                        onHandleChange: e => calculateValues(
                            getValuesTableForm(`SurfaceArea${rm?.value}${rm?.label}${parentIndex}${childIndex}`),
                            e.target.value,
                            getValuesTableForm(`RejectionAllowancePercentage${rm?.value}${rm?.label}${parentIndex}${childIndex}`),
                            parentIndex,
                            childIndex,
                            rm
                        )
                    })}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'RejectionAllowancePercentage',
                        coat: rm?.label,
                        parentIndex,
                        childIndex,
                        onHandleChange: e => calculateValues(
                            getValuesTableForm(`SurfaceArea${rm?.value}${rm?.label}${parentIndex}${childIndex}`),
                            getValuesTableForm(`Consumption${rm?.value}${rm?.label}${parentIndex}${childIndex}`),
                            e.target.value,
                            parentIndex,
                            childIndex,
                            rm
                        )
                    })}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'RejectionAllowance',
                        coat: rm?.label,
                        parentIndex,
                        childIndex,
                        disabled: true
                    })}</td>
                    <td>{checkForDecimalAndNull(rm?.RmRate, NoOfDecimalForInputOutput) || ''}</td>
                    <td>{renderInputBox({
                        item: rm,
                        name: 'NetCost',
                        coat: rm?.label,
                        parentIndex,
                        childIndex,
                        disabled: true
                    })}</td>
                    {childIndex === 0 && (
                        <td width="50" rowSpan={item.rawMaterialList.length}>
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
    console.log(errorsInitialForm, errorsTableForm, "test test")
    const handleTapeCostChange = (e) => {
        const value = (e && e?.target && e?.target?.value) ? Number(e?.target?.value) : 0
        let calculateCost = value + state.PaintCost
        setState(prev => ({
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
                                <div onClick={() => closeDrawer(state.TotalPaintCost)} className="close-button right" />
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
                                        options={Paint}
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
                                        options={RawMaterialForPaint}
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

                    <form onSubmit={handleSubmitTableForm(onSubmit)}>
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
                                            {checkForDecimalAndNull(state.PaintCost, NoOfDecimalForInputOutput)}
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
                                        onClick={closeDrawer}
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
                    </form>
                </Container>
            </div>
        </Drawer>
    )
}

export default PaintAndMasking