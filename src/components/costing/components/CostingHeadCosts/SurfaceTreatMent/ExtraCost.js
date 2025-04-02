import React, { Fragment, useContext, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { useForm, Controller } from 'react-hook-form'
import { reactLocalStorage } from 'reactjs-localstorage'
import { useDispatch, useSelector } from 'react-redux'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, checkWhiteSpaces, decimalNumberLimit6, hashValidation, maxLength80, number, percentageLimitValidation } from '../../../../../helper'
import Toaster from '../../../../common/Toaster'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import NoContentFound from '../../../../common/NoContentFound'
import { COSTINGSURFACETREATMENTEXTRACOST, EMPTY_DATA, HANGER, PAINT, SURFACETREATMENTLABEL, TAPE, TAPEANDPAINT } from '../../../../../config/constants'
import { generateCombinations, getCostingConditionTypes } from '../../../../common/CommonFunctions'
import { getCostingCondition } from '../../../../../actions/Common'
import { setSurfaceData } from '../../../actions/Costing'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { ViewCostingContext } from '../../CostingDetails'

function ExtraCost(props) {
    const initialConfiguration = useSelector((state) => state?.auth?.initialConfiguration)
    const conditionTypeId = getCostingConditionTypes(COSTINGSURFACETREATMENTEXTRACOST)
    const costData = useContext(costingInfoContext);
    const CostingViewMode = useContext(ViewCostingContext);
    const dispatch = useDispatch();
    const { SurfaceTabData } = useSelector(state => state?.costing)
    let surfaceTabData = SurfaceTabData[0]
    let surfaceCostingPartDetails = surfaceTabData?.CostingPartDetails
    const { rmBasicRate, RowData, RowIndex } = props

    const [tableData, setTableData] = useState(surfaceCostingPartDetails?.TransportationDetails ?? []);

    const [disableTotalCost, setDisableTotalCost] = useState(true)
    const [disableAllFields, setDisableAllFields] = useState(true)
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [type, setType] = useState('')
    const [totalCostCurrency, setTotalCostCurrency] = useState(surfaceCostingPartDetails?.TransportationCost ?? 0)
    const [totalCostBase, setTotalCostBase] = useState('')
    const [disableCurrency, setDisableCurrency] = useState(false)

    const ExchangeRate = RowData?.ExchangeRate
    const [state, setState] = useState({
        Applicability: false,
        tableData: [],
        disableApplicability: true,
        premiumCost: '',
        disableCostCurrency: false,
        disableCostBaseCurrency: false,
        applicabilityDropdown: [],
        ApplicabilityCost: 0,
    })

    useEffect(() => {
        let tempData = [...tableData]
        tempData.map(item => {
            if (item?.CostingConditionMasterId) {
                if (item.CostingConditionNumber === TAPEANDPAINT) {
                    item.ApplicabiltyCost = surfaceCostingPartDetails?.TotalPaintCost
                    item.TransportationCost = calculatePercentageValue(surfaceCostingPartDetails?.TotalPaintCost, item?.Rate)
                } else if (item.CostingConditionNumber === HANGER) {
                    item.ApplicabiltyCost = surfaceCostingPartDetails?.HangerCostPerPart
                    item.TransportationCost = calculatePercentageValue(surfaceCostingPartDetails?.HangerCostPerPart, item?.Rate)
                } else if (item.CostingConditionNumber === SURFACETREATMENTLABEL) {
                    item.ApplicabiltyCost = surfaceCostingPartDetails?.SurfaceTreatmentCost
                    item.TransportationCost = calculatePercentageValue(surfaceCostingPartDetails?.SurfaceTreatmentCost, item?.Rate)
                } else if (item.CostingConditionNumber === TAPE) {
                    item.ApplicabiltyCost = surfaceCostingPartDetails?.TapeCost
                    item.TransportationCost = calculatePercentageValue(surfaceCostingPartDetails?.TapeCost, item?.Rate)
                } else if (item.CostingConditionNumber === PAINT) {
                    item.ApplicabiltyCost = surfaceCostingPartDetails?.PaintCost
                    item.TransportationCost = calculatePercentageValue(surfaceCostingPartDetails?.PaintCost, item?.Rate)
                }
            }
        })
        setTableData(tempData);
        // Calculate total cost from all transportation costs in table data
        const totalCost = tempData.reduce((sum, item) => {
            return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
        }, 0);
        setTotalCostCurrency(totalCost);
    }, [surfaceCostingPartDetails]);

    useEffect(() => {
        if (!CostingViewMode) {
            dispatch(getCostingCondition('', conditionTypeId, (res) => {
                if (res?.data?.DataList) {
                    const temp = res?.data?.DataList?.map((item) => ({
                        label: item?.CostingConditionNumber,
                        value: item?.CostingConditionMasterId,
                    }));
                    setState((prevState) => ({
                        ...prevState,
                        applicabilityDropdown: temp
                    }));
                }
            }));
        }
    }, [])
    const editData = (indexValue, operation) => {
        if (operation === 'delete') {
            handleDelete(indexValue);
        } else if (operation === 'edit') {
            handleEdit(indexValue);
        }
    }

    const handleEdit = (indexValue) => {
        setEditIndex(indexValue);
        setIsEditMode(true);
        let selectedData = tableData[indexValue];
        setType({ label: selectedData?.UOM, value: selectedData?.UOM })
        setValue('Type', { label: selectedData?.UOM, value: selectedData?.UOM })
        if (selectedData?.UOM === 'Percentage') {
            setValue('Applicability', { label: selectedData?.CostingConditionNumber, value: selectedData?.CostingConditionMasterId })
            setValue('ApplicabilityCost', checkForDecimalAndNull(selectedData?.ApplicabiltyCost, initialConfiguration?.NoOfDecimalForPrice))
            setValue('Percentage', checkForDecimalAndNull(selectedData?.Rate, initialConfiguration?.NoOfDecimalForPrice))
        } else {
            setType({ label: 'Fixed', value: 'Fixed' })
            setValue('Type', { label: 'Fixed', value: 'Fixed' })
        }
        setValue('CostDescription', selectedData?.Description)
        setValue('Remark', selectedData?.Remark)
        setValue('NetCost', selectedData?.TransportationCost)

        // Update UI state based on the type
        if (selectedData?.Type === 'Fixed') {
            setDisableTotalCost(false);
            setDisableCurrency(false);
            setDisableAllFields(true);
        } else {
            setState(prevState => ({ ...prevState, disableApplicability: false }));
        }
    };

    const handleDelete = (indexValue) => {
        let updatedData = tableData.filter((_, index) => index !== indexValue);
        const totalCost = updatedData.reduce((sum, item) => {
            return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
        }, 0);
        setTotalCostCurrency(totalCost);
        setTableData(updatedData);
        resetData();
    };

    const editDeleteData = (indexValue, operation) => {
        editData(indexValue, operation)
    }

    const { register, control, setValue, getValues, handleSubmit, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const toggleCondition = () => {
        let cssClass = '';
        if (type?.label === "Percentage") {
            cssClass = 'mt-4 pt-1';
        } else {
            cssClass = 'mb-3 mt-n3';
        }
        return cssClass
    }

    const applicabilityChange = (e) => {
        setState(prevState => ({ ...prevState, Applicability: e?.label }));
        // Handle Basic Rate separately
        if (e?.label === TAPE) {
            setValue('ApplicabilityCost', checkForDecimalAndNull(surfaceCostingPartDetails?.TapeCost, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, ApplicabilityCost: surfaceCostingPartDetails?.TapeCost }));
            return;
        } else if (e?.label === SURFACETREATMENTLABEL) {
            setValue('ApplicabilityCost', checkForDecimalAndNull(surfaceCostingPartDetails?.SurfaceTreatmentCost, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, ApplicabilityCost: surfaceCostingPartDetails?.SurfaceTreatmentCost }));
            return;
        } else if (e?.label === PAINT) {
            setValue('ApplicabilityCost', checkForDecimalAndNull(surfaceCostingPartDetails?.PaintCost, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, ApplicabilityCost: surfaceCostingPartDetails?.PaintCost }));
            return;
        } else if (e?.label === TAPEANDPAINT) {
            setValue('ApplicabilityCost', checkForDecimalAndNull(surfaceCostingPartDetails?.TotalPaintCost, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, ApplicabilityCost: surfaceCostingPartDetails?.TotalPaintCost }));
            return;
        } else if (e?.label === HANGER) {
            setValue('ApplicabilityCost', checkForDecimalAndNull(surfaceCostingPartDetails?.HangerCostPerPart, initialConfiguration?.NoOfDecimalForPrice));
            setState(prevState => ({ ...prevState, ApplicabilityCost: surfaceCostingPartDetails?.HangerCostPerPart }));
            return;
        }
    }

    const onPercentChange = (e) => {
        const storeValue = checkForNull(e?.target?.value)
        const calculateValue = (storeValue / 100) * checkForNull(state?.ApplicabilityCost)
        setValue('NetCost', checkForDecimalAndNull(calculateValue, initialConfiguration?.NoOfDecimalForPrice))
    }

    const cancel = () => {
        props.closeDrawer('Cancel', tableData, totalCostCurrency, totalCostBase, RowIndex)
    }

    const handleCostChangeBase = (e) => {
        if (e?.target?.value) {
            setValue('CostCurrency', checkForDecimalAndNull((checkForNull(e?.target?.value) / ExchangeRate), initialConfiguration?.NoOfDecimalForPrice))
            setState(prevState => ({ ...prevState, disableCostCurrency: true }));
        } else {
            setValue('CostCurrency', '')
            setState(prevState => ({ ...prevState, disableCostCurrency: false }));
        }
    }

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        if (label === 'Type') {
            return [
                { label: "Percentage", value: "Percentage" },
                { label: "Fixed", value: 'Fixed' }
            ]
        }
        return [];
    }

    const onSubmit = data => {
        if (isEditMode) {
            let tempData = [...tableData];
            let obj = {
                JsonStage: surfaceTabData?.JsonStage ?? null,
                PartNumber: surfaceTabData?.PartNumber ?? null,
                PartName: surfaceTabData?.PartName ?? null,
                TransportationDetailId: null,
                UOM: type?.label ?? null,
                Rate: data?.Percentage ?? null,
                TransportationCost: data?.NetCost ?? null,
                TransportationCRMHead: "",
                Description: data?.CostDescription ?? null,
                ApplicabiltyCost: data?.ApplicabilityCost ?? null,
                Remark: data?.Remark ?? null,
                CostingConditionMasterId: data?.Applicability && data?.Applicability?.value ? data?.Applicability?.value : null,
                CostingConditionNumber: data?.Applicability && data?.Applicability?.label ? data?.Applicability?.label : null
            }
            tempData[editIndex] = obj;
            setTableData(tempData);
            // Calculate total cost from all transportation costs in table data
            const totalCost = tempData.reduce((sum, item) => {
                return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
            }, 0);
            setTotalCostCurrency(totalCost);
            resetData();
            return;
        }
        // Check if CostingConditionMasterId already exists in tableData
        const existingCondition = tableData.find(item =>
            item.CostingConditionMasterId === data?.Applicability?.value
        );

        if (existingCondition) {
            Toaster.warning('Applicability already exists');
            return;
        }
        const existingFixedDescription = tableData.find(item =>
            item.Description.toLowerCase() === data?.CostDescription.toLowerCase()
        );
        if (type?.label === 'Fixed' && existingFixedDescription) {
            Toaster.warning('Data already exists');
            return;
        }
        let tempData = [...tableData]
        let obj = {
            JsonStage: surfaceTabData?.JsonStage ?? null,
            PartNumber: surfaceTabData?.PartNumber ?? null,
            PartName: surfaceTabData?.PartName ?? null,
            TransportationDetailId: null,
            UOM: type?.label ?? null,
            Rate: data?.Percentage ?? null,
            TransportationCost: data?.NetCost ?? null,
            TransportationCRMHead: "",
            Description: data?.CostDescription ?? null,
            ApplicabiltyCost: data?.ApplicabilityCost ?? null,
            Remark: data?.Remark ?? null,
            CostingConditionMasterId: data?.Applicability && data?.Applicability?.value ? data?.Applicability?.value : null,
            CostingConditionNumber: data?.Applicability && data?.Applicability?.label ? data?.Applicability?.label : null
        }
        tempData.push(obj)
        setTableData(tempData)
        // Calculate total cost from all transportation costs in table data
        const totalCost = tempData.reduce((sum, item) => {
            return sum + (item?.TransportationCost ? Number(item.TransportationCost) : 0);
        }, 0);
        setTotalCostCurrency(totalCost);
        resetData();
    }

    const resetData = (type = '') => {
        setDisableAllFields(true);
        setDisableTotalCost(true);
        setType('');
        setEditIndex('');
        setIsEditMode(false)
        reset({
            Cost: '',
            Type: '',
            Percentage: '',
            NetCost: '',
            CostBaseCurrency: '',
            CostDescription: '',
            Remark: ''
        });
    };

    const saveExtraCost = () => {
        let newData = [...SurfaceTabData];
        newData.map(item => {
            if (item?.CostingId === costData?.CostingId) {
                let CostingPartDetails = item?.CostingPartDetails
                CostingPartDetails.TransportationDetails = tableData;
                CostingPartDetails.TransportationCost = totalCostCurrency;
            }
            return null;
        })
        dispatch(setSurfaceData(SurfaceTabData, () => { }))
        props.closeDrawer('Save', totalCostCurrency)
    }

    const handleType = (type) => {
        if (type && type !== '') {
            setType(type);
            setValue('CostCurrency', '')
            setValue('CostBaseCurrency', '')
            setValue('Percentage', '')
            setValue('Applicability', '')
            setValue('ApplicabilityCostCurrency', '')
            setValue('ApplicabilityBaseCost', '')
            if (type?.label === "Percentage") {
                setState(prevState => ({ ...prevState, disableApplicability: false }));
            } else {
                setState(prevState => ({ ...prevState, disableApplicability: true }));
            }
        } else {
            setType('');
        }
    }

    return (
        <div>
            <Drawer anchor={props?.anchor} open={props?.isOpen}>
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>
                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{'Extra Cost:'}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className='hidepage-size'>
                                    <Row>
                                        <Col md={3} className='px-2'>
                                            <SearchableSelectHookForm
                                                label={`Type`}
                                                name={'Type'}
                                                placeholder={'Select'}
                                                rules={{ required: true, }}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                options={renderListing('Type')}
                                                handleChange={handleType}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors?.Type}
                                                disabled={CostingViewMode || isEditMode}
                                            />
                                        </Col>
                                        <Col md="3" className='px-2'>
                                            <TextFieldHookForm
                                                label="Cost Description"
                                                name={"CostDescription"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { checkWhiteSpaces, hashValidation, maxLength80 },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors?.CostDescription}
                                                disabled={CostingViewMode}
                                            />
                                        </Col>

                                        {
                                            type?.label === 'Percentage' &&
                                            <>
                                                <Col md="3" className='px-2'>
                                                    <SearchableSelectHookForm
                                                        label={`Applicability`}
                                                        name={'Applicability'}
                                                        placeholder={'Select'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{ required: true, }}
                                                        options={state?.applicabilityDropdown}
                                                        handleChange={applicabilityChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors?.Applicability}
                                                        disabled={false}
                                                    />
                                                </Col>

                                                <Col md={3} className={'px-2'}>
                                                    <TextFieldHookForm
                                                        label={`Applicability Cost`}
                                                        name={'ApplicabilityCost'}
                                                        id={'cost-by-percent'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{
                                                            required: false,
                                                        }}
                                                        handleChange={() => { }}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors?.ApplicabilityCost}
                                                        disabled={CostingViewMode || disableTotalCost || disableCurrency}
                                                    />
                                                </Col>
                                                <Col md={3} className='px-2'>
                                                    <TextFieldHookForm
                                                        label={`Percentage (%)`}
                                                        name={'Percentage'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={true}
                                                        rules={{
                                                            required: true,
                                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                            max: {
                                                                value: 100,
                                                                message: 'Percentage cannot be greater than 100'
                                                            },
                                                        }}
                                                        handleChange={onPercentChange}
                                                        defaultValue={''}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors?.Percentage}
                                                        disabled={CostingViewMode}
                                                    />
                                                </Col>
                                            </>
                                        }

                                        <Col md={3} className={'px-2'}>
                                            <TextFieldHookForm
                                                label={`Cost`}
                                                name={'NetCost'}
                                                id={'cost-by-percent'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={type?.label !== 'Percentage'}
                                                rules={{
                                                    required: type?.label !== 'Percentage',
                                                    validate: type?.label === 'Percentage' ? {} : { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                }}
                                                handleChange={handleCostChangeBase}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors?.NetCost}
                                                disabled={type?.label === 'Percentage' ? true : false || state?.disableCostBaseCurrency || CostingViewMode}
                                            />
                                        </Col>
                                        <Col md="3" className='px-2'>
                                            <TextFieldHookForm
                                                label="Remark"
                                                name={"Remark"}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    validate: { checkWhiteSpaces, hashValidation, maxLength80 }
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={""}
                                                className=""
                                                customClassName={"withBorder"}
                                                errors={errors?.Remark}
                                                disabled={CostingViewMode}
                                            />
                                        </Col>
                                        <Col md="3" className={toggleCondition()}>
                                            <button
                                                type="submit"
                                                className={"user-btn  pull-left mt-1"}
                                                disabled={CostingViewMode || props?.disabled}
                                            >
                                                {isEditMode ? "" : <div className={"plus"}></div>} {isEditMode ? "UPDATE" : 'ADD'}
                                            </button>
                                            <button
                                                type="button"
                                                className={"reset-btn pull-left mt-1 ml5"}
                                                onClick={() => resetData("reset")}
                                                disabled={CostingViewMode || props?.disabled}
                                            >
                                                {isEditMode ? "CANCEL" : 'RESET'}
                                            </button>
                                        </Col>
                                    </Row>
                                    <Col md={props?.hideAction ? 12 : 12}>
                                        <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                                            <tbody>
                                                <tr className='thead'>
                                                    <th>{`Type`}</th>
                                                    <th>{`Cost Description`}</th>
                                                    <th>{`Applicability`}</th>
                                                    <th>{`Applicability Cost`}</th>
                                                    <th>{`Percentage (%)`}</th>
                                                    <th>{`Cost`}</th>
                                                    <th>{`Remark`}</th>
                                                    {!props?.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item?.UOM ?? '-'}</td>
                                                            <td>{item?.Description ?? '-'}</td>
                                                            <td>{item?.CostingConditionNumber ?? '-'}</td>
                                                            <td>{item?.ApplicabiltyCost ? checkForDecimalAndNull(item?.ApplicabiltyCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.Rate ? checkForDecimalAndNull(item?.Rate, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.TransportationCost !== '-' ? checkForDecimalAndNull(item?.TransportationCost, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{item?.Remark ? item?.Remark : '-'}</td>
                                                            {
                                                                !props?.hideAction && (
                                                                    <td>
                                                                        <div className='text-right'>
                                                                            <button title='Edit' className="Edit mr-1" type='button' onClick={() => editDeleteData(index, 'edit')} disabled={CostingViewMode} />
                                                                            <button title='Delete' className="Delete mr-1" type='button' onClick={() => editDeleteData(index, 'delete')} disabled={CostingViewMode} />
                                                                        </div>
                                                                    </td>
                                                                )
                                                            }
                                                        </tr>
                                                    </Fragment>
                                                ))}

                                                {
                                                    tableData && tableData.length === 0 && (
                                                        <tr>
                                                            <td colSpan="12">
                                                                <NoContentFound title={EMPTY_DATA} />
                                                            </td>
                                                        </tr>
                                                    )
                                                }

                                                <tr className='table-footer'>
                                                    <td colSpan={5} className="text-right font-weight-600 fw-bold">{'Total Cost:'}</td>
                                                    <td colSpan={5}>{checkForDecimalAndNull(totalCostCurrency, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </div>
                                <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                    <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                        <button
                                            type={'button'}
                                            className="reset cancel-btn mr5"
                                            onClick={cancel || props?.disabled} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type={'button'}
                                            className="submit-button save-btn"
                                            onClick={() => saveExtraCost()}
                                            disabled={CostingViewMode || props?.disabled}
                                        >
                                            <div className={"save-icon"}></div>
                                            {'Save'}
                                        </button>
                                    </div>
                                </Row>
                            </form>
                        </div>
                    </Container>
                </div>
            </Drawer>
        </div>
    )
}
export default React.memo(ExtraCost)