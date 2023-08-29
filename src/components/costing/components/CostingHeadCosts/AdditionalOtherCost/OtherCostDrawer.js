import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs';
import { CRMHeads, EMPTY_DATA } from '../../../../../config/constants';
import { checkForDecimalAndNull, checkWhiteSpaces, number, decimalNumberLimit6, percentageLimitValidation, hashValidation, calculatePercentage, checkForNull, removeBOPfromApplicability } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { ViewCostingContext } from '../../CostingDetails';
import { STRINGMAXLENGTH } from '../../../../../config/masterData';
import TooltipCustom from '../../../../common/Tooltip';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import _ from 'lodash'
import Toaster from '../../../../common/Toaster';
import { setOtherCostData } from '../../../actions/Costing';
import OtherCostTable from './OtherCostTable';

function OtherCostDrawer(props) {

    //FUNCTION TO GET SUM OF OTHER COST ADDED IN THE TABLE
    const calculateSumOfValues = (data) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += Number(data[i].AnyOtherCost);
        }
        return sum;
    }


    const { register, handleSubmit, formState: { errors }, control, getValues, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    const { otherCostData } = useSelector(state => state.costing)


    const headerCosts = useContext(netHeadCostContext);
    const costData = useContext(costingInfoContext);
    const CostingViewMode = useContext(ViewCostingContext);

    const { CostingDataList, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const costingHead = useSelector(state => state.comman.costingHead)
    const [isEdit, setIsEdit] = useState(false);
    const [gridData, setgridData] = useState(otherCostData.gridData);
    const [otherCostTotal, setOtherCostTotal] = useState(props?.otherCostArr?.length > 0 ? calculateSumOfValues(props?.otherCostArr) : 0)
    const [otherCostType, setOtherCostType] = useState([]);
    const [otherCostApplicability, setOtherCostApplicability] = useState([])
    const [editIndex, setEditIndex] = useState('')
    const [otherCost, setOtherCost] = useState('')
    const [applicabilityCost, setApplicabilityCost] = useState('')

    const fieldValues = useWatch({
        control,
        name: ['PercentageOtherCost', 'OtherCostApplicability'],
    })

    useEffect(() => {
        if (!CostingViewMode) {
            findApplicabilityCost()
        }
    }, [fieldValues])

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        const temp = [];
        let tempList = [];
        if (label === 'OtherCostType') {
            return [
                { label: 'Fixed', value: 'Fixed' },
                { label: 'Percentage', value: 'Percentage' },
            ];
        }
        if (label === 'Applicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            if (isBreakupBoughtOutPartCostingFromAPI) {
                tempList = removeBOPfromApplicability([...temp])
            } else {
                tempList = [...temp]
            }
            return tempList;
        }
    }

    const handleOherCostApplicabilityChange = (value) => {

        if (!CostingViewMode) {
            if (value && value !== '') {
                setOtherCostType(value.label !== 'Fixed' ? { label: 'Percentage', value: 'Percentage' } : value)
                setValue('AnyOtherCost', 0)
                setValue('PercentageOtherCost', 0)
                errors.AnyOtherCost = {}
                errors.PercentageOtherCost = {}

            } else {
                setOtherCostType([])
            }
            errors.PercentageOtherCost = {}
        }

        setOtherCostApplicability(value)
    }

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = () => {
        props.closeDrawer('cancel')
    }

    const onSubmit = data => {
        if (isEdit) {
            let OtherCostDescription = getValues('OtherCostDescription')
            let OtherCostApplicability = getValues('OtherCostApplicability')?.label
            let isDuplicate = false
            gridData && gridData.map((item, index) => {
                if (index !== editIndex) {
                    if (String(item.OtherCostDescription) === String(OtherCostDescription) && String(item.OtherCostApplicability) === String(OtherCostApplicability)) {
                        isDuplicate = true
                    }
                }
            })

            if (isDuplicate) {
                Toaster.warning("Duplicate entries are not allowed")
                return false
            }
            updateRow()
        } else {
            addRow()
        }
    }

    const onFinalSubmit = () => {
        props.closeDrawer('submit', otherCostTotal, gridData)
        dispatch(setOtherCostData({ gridData: gridData, otherCostTotal: otherCostTotal }))
    }

    const validation = () => {
        let labels = ['OtherCostDescription', 'OtherCostApplicability', 'AnyOtherCost', 'PercentageOtherCost'];
        let count = 0
        labels.forEach(label => {
            if (otherCostType?.label === 'Fixed' && label === 'PercentageOtherCost') {
                return false
            } else {
                if (!getValues(label)) {
                    count++
                }
            }
        })
        if (count > 0) {
            Toaster.warning("Please fill all details")
            return true
        } else {

            let OtherCostDescription = getValues('OtherCostDescription')
            let OtherCostApplicability = getValues('OtherCostApplicability')?.label
            let isDuplicate = false

            gridData && gridData.map((item) => {
                if (String(item.OtherCostDescription) === String(OtherCostDescription) && String(item.OtherCostApplicability) === String(OtherCostApplicability)) {
                    isDuplicate = true
                }
            })

            if (isDuplicate && !isEdit) {
                Toaster.warning("Duplicate entries are not allowed")
                return true

            } else {
                return false
            }
        }
    }

    const addRow = () => {
        if (validation()) {
            return false
        }

        const obj = {
            OtherCostType: otherCostType?.label,
            OtherCostApplicability: otherCostApplicability?.label,
            OtherCostApplicabilityId: otherCostApplicability?.value,
            PercentageOtherCost: otherCostType?.label === 'Fixed' ? '-' : getValues('PercentageOtherCost'),
            OtherCostDescription: getValues('OtherCostDescription'),
            AnyOtherCost: otherCostType?.label === 'Fixed' ? getValues('AnyOtherCost') : otherCost,
            ApplicabilityCost: applicabilityCost,
            CRMHead: getValues('crmHeadOtherCost') ? getValues('crmHeadOtherCost').label : '-'
        }
        setOtherCostTotal(0)
        setOtherCostTotal(calculateSumOfValues([...gridData, obj]))
        setgridData([...gridData, obj])
        resetData()

    }


    const updateRow = () => {
        if (validation()) {
            return false
        }
        const obj = {
            OtherCostType: otherCostType?.label,
            OtherCostApplicability: otherCostApplicability?.label,
            OtherCostApplicabilityId: otherCostApplicability?.value,
            PercentageOtherCost: otherCostType?.label === 'Fixed' ? '-' : getValues('PercentageOtherCost'),
            OtherCostDescription: getValues('OtherCostDescription'),
            AnyOtherCost: otherCostType?.label === 'Fixed' ? getValues('AnyOtherCost') : otherCost,
            ApplicabilityCost: applicabilityCost,
            CRMHead: getValues('crmHeadOtherCost') ? getValues('crmHeadOtherCost').label : '-'
        }

        let tempArr = Object.assign([...gridData], { [editIndex]: obj })
        setgridData(tempArr)
        setOtherCostTotal(0)
        setOtherCostTotal(calculateSumOfValues(tempArr))
        setIsEdit(false)
        resetData()
    }

    const resetData = (type) => {
        setValue('OtherCostType', "")
        setValue('OtherCostApplicability', '')
        setValue('PercentageOtherCost', '')
        setValue('OtherCostDescription', '')
        setValue('AnyOtherCost', '')
        setOtherCostApplicability([])
        setOtherCost(0)
        setEditIndex('')
        setIsEdit(false)
        setApplicabilityCost(0)
        setValue('crmHeadOtherCost', '')
    }


    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setValue('OtherCostType', { label: editObj.OtherCostType, value: editObj.OtherCostType })
        setValue('OtherCostApplicability', { label: editObj.OtherCostApplicability, value: editObj.OtherCostApplicabilityId })
        setValue('PercentageOtherCost', editObj.PercentageOtherCost === '-' ? 0 : editObj.PercentageOtherCost)
        setValue('OtherCostDescription', editObj.OtherCostDescription)
        setValue('AnyOtherCost', editObj.AnyOtherCost)
        setValue('crmHeadOtherCost', { label: editObj.CRMHead, value: index })
        setOtherCostType({ label: editObj.OtherCostApplicability !== 'Fixed' ? 'Percentage' : editObj.OtherCostApplicability, value: editObj.OtherCostApplicability !== 'Fixed' ? 'Percentage' : editObj.OtherCostApplicability })
        setOtherCostApplicability({ label: editObj.OtherCostApplicability, value: editObj.OtherCostApplicabilityId })
        setEditIndex(index)
        setIsEdit(true)
    }

    const deleteItem = (index) => {
        let newgridData = []
        if (index >= 0 && index < gridData.length) {
            newgridData = [...gridData]; // create a copy of the array
            _.pullAt(newgridData, index);
        }
        setgridData(newgridData)
        setOtherCostTotal(calculateSumOfValues(newgridData))
    }


    const findApplicabilityCost = () => {
        const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts?.NetConversionCost) - checkForNull(headerCosts?.TotalOtherOperationCostPerAssembly) : headerCosts?.ProcessCostTotal + headerCosts?.OperationCostTotal
        const RMBOPCC = headerCosts.NetBoughtOutPartCost + headerCosts.NetRawMaterialsCost + ConversionCostForCalculation

        const RMBOP = headerCosts.NetRawMaterialsCost + headerCosts.NetBoughtOutPartCost;
        const RMCC = headerCosts.NetRawMaterialsCost + ConversionCostForCalculation;
        const BOPCC = headerCosts.NetBoughtOutPartCost + ConversionCostForCalculation;

        let dataList = CostingDataList && CostingDataList.length > 0 ? CostingDataList[0] : {}
        const totalTabCost = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(dataList.NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost)
        const percent = getValues('PercentageOtherCost')


        let totalCost = ''
        switch (otherCostApplicability?.label) {
            case 'RM':
            case 'Part Cost':
                totalCost = headerCosts.NetRawMaterialsCost * calculatePercentage(percent)
                setApplicabilityCost(headerCosts.NetRawMaterialsCost)
                break;
            case 'BOP':
                totalCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(percent)
                setApplicabilityCost(headerCosts.NetBoughtOutPartCost)
                break;
            case 'RM + CC':
            case 'Part Cost + CC':
                totalCost = (RMCC) * calculatePercentage(percent)
                setApplicabilityCost(RMCC)
                break;
            case 'BOP + CC':
                totalCost = BOPCC * calculatePercentage(percent)
                setApplicabilityCost(BOPCC)
                break;
            case 'CC':
                totalCost = (ConversionCostForCalculation) * calculatePercentage(percent)
                setApplicabilityCost(ConversionCostForCalculation)
                break;
            case 'RM + CC + BOP':
            case 'Part Cost + CC + BOP':
                totalCost = (RMBOPCC) * calculatePercentage(percent)
                setApplicabilityCost(RMBOPCC)
                break;
            case 'RM + BOP':
            case 'Part Cost + BOP':
                totalCost = (RMBOP) * calculatePercentage(percent)
                setApplicabilityCost(RMBOP)
                break;
            case 'Net Cost':
                totalCost = (totalTabCost) * calculatePercentage(percent)
                setApplicabilityCost(totalTabCost)
                break;
            default:
                totalCost = getValues('AnyOtherCost')
                setApplicabilityCost(totalCost)
                break;
        }
        setValue('AnyOtherCost', checkForDecimalAndNull(totalCost, initialConfiguration.NoOfDecimalForPrice))
        setOtherCost(totalCost)
    }


    return (
        <div>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={"drawer-wrapper layout-min-width-640px"}>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>{"Add Other Cost"}</h3>
                                </div>
                                <div
                                    onClick={() => props.closeDrawer('cancel')}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                {initialConfiguration.IsShowCRMHead && <Col md="4">
                                    <SearchableSelectHookForm
                                        name={`crmHeadOtherCost`}
                                        type="text"
                                        label="CRM Head"
                                        errors={errors.crmHeadOtherCost}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                        }}
                                        placeholder={'Select'}
                                        options={CRMHeads}
                                        required={false}
                                        handleChange={() => { }}
                                        disabled={CostingViewMode}
                                    />
                                </Col>}

                                <Col md="4" >
                                    <TextFieldHookForm
                                        label="Other Cost Description"
                                        name={"OtherCostDescription"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { checkWhiteSpaces, hashValidation },
                                            maxLength: 80
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.OtherCostDescription}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>


                                {
                                    <Col md="4">
                                        <SearchableSelectHookForm
                                            label={'Other Cost Applicability'}
                                            name={'OtherCostApplicability'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={otherCostApplicability.length !== 0 ? otherCostApplicability : ''}
                                            options={renderListing('Applicability')}
                                            mandatory={true}
                                            disabled={CostingViewMode ? true : false}
                                            handleChange={handleOherCostApplicabilityChange}
                                            errors={errors.OtherCostApplicability}
                                        />
                                    </Col>
                                }
                                {
                                    <Col md="4">
                                        <TextFieldHookForm
                                            label="Percentage (%)"
                                            name={"PercentageOtherCost"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={true}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                max: {
                                                    value: 100,
                                                    message: 'Percentage cannot be greater than 100'
                                                },
                                            }}
                                            handleChange={(e) => {
                                                e.preventDefault();
                                            }}
                                            defaultValue={""}
                                            className=""
                                            customClassName={"withBorder"}
                                            errors={errors.PercentageOtherCost}
                                            disabled={CostingViewMode || !(otherCostType && otherCostType.value === 'Percentage') ? true : false}
                                        />
                                    </Col>}

                                <Col md="4">
                                    {(otherCostType.value === 'Percentage' || Object.keys(otherCostType).length === 0) && <TooltipCustom disabledIcon={true} id="drawer-other-cost" tooltipText={"Other Cost = (Other Cost Applicability * Percentage / 100)"} />}
                                    <TextFieldHookForm
                                        label="Other Cost"
                                        name={"AnyOtherCost"}
                                        id="drawer-other-cost"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                        }}
                                        handleChange={(e) => {
                                            e.preventDefault();
                                        }}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.AnyOtherCost}
                                        disabled={CostingViewMode || otherCostType.value === 'Percentage' || Object.keys(otherCostType).length === 0 ? true : false}
                                    />

                                </Col>
                                <Col md="4" className='pt-1 d-flex'>
                                    {isEdit ? (
                                        <>
                                            <button
                                                type="submit"
                                                className={"btn btn-primary mt30 pull-left mr5"}
                                                disabled={CostingViewMode}
                                            >
                                                <div className={"plus"}></div>  Update
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                                                onClick={() => resetData()}
                                                disabled={CostingViewMode}
                                            >
                                                <div className={"cancel-icon"}></div>Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="submit"
                                                className={"user-btn mt30 pull-left"}
                                                disabled={CostingViewMode}
                                            >
                                                <div className={"plus"}></div>ADD
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr15 ml-1 mt30 reset-btn"}
                                                disabled={CostingViewMode}
                                                onClick={() => resetData()}
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                </Col>
                            </Row>
                            <OtherCostTable editItemDetails={editItemDetails} deleteItem={deleteItem} tableData={{ gridData: gridData, otherCostTotal: otherCostTotal }} />
                            <Row className="pr-0">
                                <div className="col-sm-12 text-right">
                                    <button
                                        type={"button"}
                                        className="reset mr15 cancel-btn"
                                        onClick={cancel}
                                    >
                                        <div className={"cancel-icon"}></div>
                                        {"Cancel"}
                                    </button>

                                    <button
                                        type="button"
                                        className="submit-button save-btn"
                                        disabled={CostingViewMode}
                                        onClick={onFinalSubmit}
                                    >
                                        <div class="save-icon"></div>
                                        {"Save"}
                                    </button>
                                </div>
                            </Row>
                        </form>
                    </div>
                </Container>
            </Drawer>
        </div>
    );
}

export default React.memo(OtherCostDrawer);