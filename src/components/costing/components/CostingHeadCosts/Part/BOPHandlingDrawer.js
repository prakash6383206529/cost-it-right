import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Container, Table } from 'reactstrap'
import { Drawer } from '@material-ui/core'
import { TextFieldHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'

import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { number, checkWhiteSpaces, percentageLimitValidation, decimalNumberLimit6, checkForNull, checkForDecimalAndNull } from "../../../../../helper/validation";
import Toaster from '../../../../common/Toaster'
import { debounce } from 'lodash'
import { EMPTY_DATA } from '../../../../../config/constants'
import NoContentFound from '../../../../common/NoContentFound'
import { calculatePercentageValue, loggedInUserId, showBopLabel } from '../../../../../helper'
import { getBOPHandlingChargesDetails, getBopTypeList, saveBOPHandlingChargesDetails } from '../../../actions/CostWorking'

function BOPHandlingDrawer(props) {

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const dispatch = useDispatch();

    const { item, bopData } = props
    const [tableData, setTableData] = useState([]);
    const [editIndex, setEditIndex] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)
    const [type, setType] = useState()
    const [state, setState] = useState({
        bopTypeDropdown: [],
        bopType: [],
        totalHandlingCharges: 0,
        refreshTableData: false,
        applicabilityCost: '',
        cost: '',
        allBOPType: []
    })
    useEffect(() => {
        if (tableData?.length > 0) {
            const sumHandlingCharges = tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.BOPHandlingCharges), 0);
            setState((prevState) => ({ ...prevState, totalHandlingCharges: sumHandlingCharges }));
        }
    }, [tableData]);

    useEffect(() => {
        dispatch(getBopTypeList((res) => {

            if (res?.data?.SelectList) {
                const temp = res.data.SelectList.map((item) => {
                    if (item.Value === "0") return null;
                    return {
                        label: item.Text,
                        value: item.Text,
                    }
                }).filter(Boolean);
                setState((prevState) => ({
                    ...prevState,
                    allBOPType: temp,
                    bopTypeDropdown: temp
                }));

            }
        }));
        dispatch(getBOPHandlingChargesDetails(item?.CostingId, (res) => {
            let data = res?.data?.Data
            if (data) {
                setTableData(data?.CostingBoughtOutPartHandlingCharges)
            } else {
                setTableData([])
            }
        }))
    }, [])
    useEffect(() => {
        // Only run filtering logic if we have allBOPType data
        if (state.allBOPType && state.allBOPType.length > 0) {
            if (tableData && tableData?.length > 0) {
                const hasBOPEntry = tableData.some(entry => entry.BOPType === 'BOP');
                const hasOtherBOPEntry = tableData.some(entry => ['BOP Domestic', 'BOP CKD', 'BOP V2V', 'BOP OSP'].includes(entry.BOPType));

                let filteredDropdown = [...state.allBOPType];

                if (hasBOPEntry) {
                    // If BOP entry exists, only keep the BOP option
                    filteredDropdown = filteredDropdown.filter(option => option.value === 'BOP');
                } else if (hasOtherBOPEntry) {
                    // If any other BOP type exists, remove the BOP option
                    filteredDropdown = filteredDropdown.filter(option => option.value !== 'BOP');
                }
                setState(prevState => ({
                    ...prevState,
                    bopTypeDropdown: filteredDropdown
                }));
            } else {
                setState(prevState => ({
                    ...prevState,
                    bopTypeDropdown: state.allBOPType
                }));
            }
        }
    }, [tableData, state.allBOPType])

    const editDeleteData = (indexValue, operation) => {
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
        setValue('bopType', {
            label: selectedData.BOPType,
            value: selectedData.BOPType
        });
        setValue('Type', {
            label: selectedData.BOPHandlingChargeType,
            value: selectedData.BOPHandlingChargeType
        });
        setType({
            label: selectedData.BOPHandlingChargeType,
            value: selectedData.BOPHandlingChargeType
        });
        setValue('Percentage', selectedData.BOPHandlingPercentage);
        setValue('HandlingCharges', selectedData.BOPHandlingCharges);
        setValue('ApplicabilityCost', selectedData.BOPHandlingChargeApplicability);
    };

    const handleDelete = (indexValue) => {
        let updatedData = tableData.filter((_, index) => index !== indexValue);
        setTableData(updatedData);
        resetData();
    };

    const { register, control, setValue, getValues, handleSubmit, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const bopTypeChange = (e) => {
        setState(prevState => ({ ...prevState, bopType: e?.label }));
        calculateApplicabilityCost(0)
        setType('')
        setValue('Type', '')
        setValue('ApplicabilityCost', 0)
        setValue('Percentage', '')
        setValue('HandlingCharges', '')
        setState(prevState => ({ ...prevState, cost: 0 }))
    }
    const calculateApplicabilityCost = (percentage = 0) => {
        let bopType = getValues('bopType')
        if (!bopType) return;
        let cost;
        let applicabilityCost;

        switch (bopType.label) {
            case "BOP CKD":
                if (item?.PartType !== "Part" && item?.PartType !== "Component"&& item?.PartType !== "BoughtOutPart") {
                    // Use the base cost without handling charges to avoid compounding
                    applicabilityCost = checkForNull(item?.CostingPartDetails?.TotalBOPImportCostWithOutHandlingChargeWithQuantity)
                } else {
                    applicabilityCost = props.applicabilityCost?.bopCKDCost;
                }
                break;
            case "BOP OSP":
                if (item?.PartType !== "Part" && item?.PartType !== "Component"&& item?.PartType !== "BoughtOutPart") {
                    // Use the base cost without handling charges to avoid compounding
                    applicabilityCost = checkForNull(item?.CostingPartDetails?.TotalBOPOutsourcedCostWithOutHandlingChargeWithQuantity)
                } else {
                    applicabilityCost = props.applicabilityCost?.bopOSPCost;
                }
                break;
            case "BOP Domestic":
                if (item?.PartType !== "Part" && item?.PartType !== "Component"&& item?.PartType !== "BoughtOutPart") {
                    // Use the base cost without handling charges to avoid compounding
                    applicabilityCost = checkForNull(item?.CostingPartDetails?.TotalBOPDomesticCostWithOutHandlingChargeWithQuantity)
                } else {
                    applicabilityCost = props.applicabilityCost?.bopDomesticCost;
                }
                break;
            case "BOP V2V":
                if (item?.PartType !== "Part" && item?.PartType !== "Component"&& item?.PartType !== "BoughtOutPart") {
                    // Use the base cost without handling charges to avoid compounding
                    applicabilityCost = checkForNull(item?.CostingPartDetails?.TotalBOPSourceCostWithOutHandlingChargeWithQuantity)
                } else {
                    applicabilityCost = props.applicabilityCost?.bopV2VCost;
                }
                break;
            default:
                if (item?.PartType !== "Part" && item?.PartType !== "Component"&& item?.PartType !== "BoughtOutPart") {
                    // Use the base cost without handling charges to avoid compounding
                    applicabilityCost = checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithOutHandlingChargeWithQuantity)
                } else {
                    applicabilityCost = props.netBOPCost;
                }
        }

        cost = calculatePercentageValue(applicabilityCost, percentage);
        setState(prevState => ({ ...prevState, cost: cost, applicabilityCost: applicabilityCost }));
        setValue('ApplicabilityCost', checkForDecimalAndNull(applicabilityCost, initialConfiguration?.NoOfDecimalForPrice));
        setValue('HandlingCharges', checkForDecimalAndNull(cost, initialConfiguration?.NoOfDecimalForPrice));
    }
    const onPercentChange = (e) => {
        if (e?.target?.value) {
            calculateApplicabilityCost(e.target.value)
        }
    }

    const cancel = () => {
        props.closeDrawer('Cancel', state.totalHandlingCharges, tableData,item)
    }

    const onSubmit = debounce((values) => {

        let data = {
            "BaseCostingId": item?.CostingId,
            "LoggedInUserId": loggedInUserId(),
            "CostingPartWiseDetailsId": item?.CostingPartDetails?.CostingDetailId,
            "CostingBoughtOutPartHandlingCharges": tableData
        }
        dispatch(saveBOPHandlingChargesDetails(data, (res) => {
            if (res?.data?.Result) {
                Toaster.success(`${showBopLabel()} Handling Charges saved successfully`)
                props.closeDrawer('Save', state?.totalHandlingCharges, tableData)
            }
        }))

    }, 500);

    const addData = (values) => {
        const bopType = getValues('bopType')?.label;
        const applicability = state.applicabilityCost;
        const type = getValues('Type');
        const percentage = checkForNull(getValues('Percentage'));
        const handlingCharges = getValues('Type')?.label === 'Fixed' ? checkForNull(getValues('HandlingCharges')) : state?.cost;


        // Create new data entry
        const newData = {
            "CostingConditionMasterAndTypeLinkingId": null,
            "CostingConditionNumber": null,
            "BOPType": bopType,
            "BOPHandlingChargeType": type?.label,
            "BOPHandlingPercentage": percentage,
            "BOPHandlingCharges": handlingCharges,
            "BOPHandlingChargeApplicability": applicability
        };

        // Check if CostHeaderName already exists in tableData, excluding the current item in edit mode
        const isCostValueExists = tableData && tableData.some((item, index) => {
            if (isEditMode && index === editIndex) {
                return false; // Skip the current edited item
            }
            return item.BOPType === newData.BOPType;
        });

        if (isCostValueExists) {
            // Display toaster warning if CostHeaderName already exists
            Toaster.warning(`${showBopLabel()} Type ${newData.BOPType} already exists in the table.`);
            return; // Exit function early
        }

        // Update tableData state
        if (isEditMode) {
            const updatedTableData = [...tableData];
            updatedTableData[editIndex] = newData;
            setTableData(updatedTableData);
        } else {
            setTableData([...tableData, newData]);
        }
        // Reset input fields and states
        resetData(); // Assuming resetData correctly resets form inputs
        setIsEditMode(false);
        setEditIndex('');

        // Reset dropdowns to their initial state (placeholder)
        setValue('bopType', ''); // Reset to an empty string or null to show the placeholder
        setValue('Type', ''); // Reset to an empty string or null to show the placeholder
        setValue('Percentage', ''); // Reset Percentage field
        setValue('HandlingCharges', ''); // Reset to an empty string or null to show the placeholder
    };
    const resetData = (type = '') => {
        const commonReset = () => {
            setType('');
            setEditIndex('');
            setIsEditMode(false)
            reset({
                bopType: '',
                Type: '',
                Percentage: '',
                HandlingCharges: '',
            });
        };
        commonReset();
    };

    const handleType = (type) => {
        if (type && type !== '') {
            setType(type);
            calculateApplicabilityCost(0)
            setValue('Percentage', '')
            setValue('HandlingCharges', 0)
            delete errors.HandlingCharges
        } else {
            setType('');
        }
    }
    return (

        <div>
            <Drawer anchor={props.anchor} open={props.isOpen}
            >
                <div className={`ag-grid-react hidepage-size`}>
                    <Container className="add-bop-drawer">
                        <div className={'drawer-wrapper layout-min-width-1000px'}>

                            <Row className="drawer-heading">
                                <Col className="pl-0">
                                    <div className={'header-wrapper left'}>
                                        <h3>{`${showBopLabel()} Handling Cost:`}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <form noValidate>
                                <div className='hidepage-size'>

                                    <Row>
                                        <Col md="3" className='px-2'>
                                            <SearchableSelectHookForm
                                                label={`${showBopLabel()} Type`}
                                                name={'bopType'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{ required: true }}
                                                options={state.bopTypeDropdown}
                                                handleChange={bopTypeChange}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.bopType}
                                                disabled={props.ViewMode}
                                            />
                                        </Col>
                                        <Col md={3} className='px-2'>
                                            <SearchableSelectHookForm
                                                label={`Type`}
                                                name={'Type'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{ required: true }}
                                                options={[
                                                    { label: "Percentage", value: "Percentage" },
                                                    { label: "Fixed", value: 'Fixed' }
                                                ]}
                                                handleChange={handleType}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.Type}
                                                disabled={props.ViewMode}
                                            />

                                        </Col>


                                        {
                                            type?.label === 'Percentage' &&
                                            <>
                                                <Col md={3} className='px-2'>
                                                    <TextFieldHookForm
                                                        label={'Percentage (%)'}
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
                                                        errors={errors.Percentage}
                                                        disabled={props.ViewMode}
                                                    />
                                                </Col >
                                                <Col md={3} className={'px-2'}>

                                                    <TextFieldHookForm
                                                        label={`Applicability Cost`}
                                                        name={'ApplicabilityCost'}
                                                        id={'cost-by-percent'}
                                                        Controller={Controller}
                                                        control={control}
                                                        register={register}
                                                        mandatory={false}
                                                        rules={{}}
                                                        handleChange={() => { }}
                                                        defaultValue={checkForDecimalAndNull(props.applicabilityCost, initialConfiguration?.NoOfDecimalForPrice)}
                                                        className=""
                                                        customClassName={'withBorder'}
                                                        errors={errors.ApplicabilityCost}
                                                        disabled={true}
                                                    />
                                                </Col>

                                            </>}
                                        <Col md={3} className={'px-2'}>
                                            <TextFieldHookForm
                                                label={`Handling Charges`}
                                                name={'HandlingCharges'}
                                                id={'cost-by-percent'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={type?.label === 'Percentage' ? false : true}
                                                rules={{
                                                    required: type?.label === 'Percentage' ? false : true,
                                                    validate: type?.label === 'Percentage' ? {} : { number, checkWhiteSpaces, decimalNumberLimit6 },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.HandlingCharges}
                                                disabled={type?.label === 'Percentage' ? true : props.ViewMode}
                                            />
                                        </Col>

                                        <Col md="3" className='mt-2'>

                                            <button
                                                type="submit"
                                                className={"user-btn pull-left mt-4"}
                                                onClick={handleSubmit(addData)}
                                                disabled={props.ViewMode}
                                            >
                                                {isEditMode ? "" : <div className={"plus"}></div>} {isEditMode ? "UPDATE" : 'ADD'}
                                            </button>
                                            <button
                                                type="button"
                                                className={"reset-btn pull-left mt-4 ml-2"}
                                                onClick={() => resetData("reset")}
                                                disabled={props.ViewMode}
                                            >
                                                {isEditMode ? "CANCEL" : 'RESET'}
                                            </button>
                                        </Col >
                                    </Row >
                                    <Col md={props.hideAction ? 12 : 12}>
                                        <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                                            <tbody>
                                                <tr className='thead'>
                                                    <th>{`${showBopLabel()} Type`}</th>
                                                    <th>{`Type`}</th>
                                                    <th>{`Percentage (%)`}</th>
                                                    <th>{`Applicability Cost`}</th>
                                                    <th>{`Handling Charges`}</th>
                                                    {!props.hideAction && <th className='text-right'>{`Action`}</th>}
                                                </tr>

                                                {tableData && tableData.map((item, index) => (
                                                    <Fragment key={index}>
                                                        <tr>
                                                            <td>{item?.BOPType}</td>
                                                            <td>{item?.BOPHandlingChargeType}</td>
                                                            <td>{item?.BOPHandlingPercentage ?? '-'}</td>
                                                            <td>{item?.BOPHandlingChargeType === 'Percentage' ? checkForDecimalAndNull(item?.BOPHandlingChargeApplicability, initialConfiguration?.NoOfDecimalForPrice) : '-'}</td>
                                                            <td>{checkForDecimalAndNull(item?.BOPHandlingCharges, initialConfiguration?.NoOfDecimalForPrice)}</td>
                                                            {!props.hideAction && (
                                                                <td>
                                                                    <div className='text-right'>
                                                                        <button title='Edit' className="Edit mr-1" type='button' onClick={() => editDeleteData(index, 'edit')} disabled={props.ViewMode} />
                                                                        <button title='Delete' className="Delete mr-1" type='button' onClick={() => editDeleteData(index, 'delete')} disabled={props.ViewMode} />
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    </Fragment>
                                                ))}

                                                {tableData && tableData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="10">
                                                            <NoContentFound title={EMPTY_DATA} />
                                                        </td>
                                                    </tr>
                                                )}

                                                <tr className='table-footer'>
                                                    <td colSpan={4} className="text-right font-weight-600 fw-bold">{'Total Handling Charges:'}</td>
                                                    <td colSpan={3} className="text-left">
                                                        <div className='d-flex align-items-center'>
                                                            {checkForDecimalAndNull(state.totalHandlingCharges, initialConfiguration?.NoOfDecimalForPrice)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>

                                </div >
                                <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between mx-0">
                                    <div className="col-sm-12 text-left bluefooter-butn d-flex justify-content-end">
                                        <button
                                            type={'button'}
                                            className="reset cancel-btn mr5"
                                            onClick={cancel} >
                                            <div className={'cancel-icon'}></div> {'Cancel'}
                                        </button>
                                        <button
                                            type={'button'}
                                            className="submit-button save-btn"
                                            onClick={onSubmit}
                                            disabled={props.ViewMode}
                                        >
                                            <div className={"save-icon"}></div>
                                            {'Save'}
                                        </button>
                                    </div>
                                </Row>
                            </form>
                        </div >
                    </Container >
                </div >
            </Drawer >
        </div >
    )
}
export default React.memo(BOPHandlingDrawer)
