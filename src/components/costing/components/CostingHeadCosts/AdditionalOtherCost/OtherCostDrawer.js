import React, { useState, useEffect, useContext } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import { useSelector } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs';
import { EMPTY_DATA } from '../../../../../config/constants';
import { checkForDecimalAndNull, checkWhiteSpaces, number, decimalNumberLimit6, percentageLimitValidation, hashValidation, calculatePercentage, checkForNull } from '../../../../../helper';
import NoContentFound from '../../../../common/NoContentFound';
import { ViewCostingContext } from '../../CostingDetails';
import { STRINGMAXLENGTH } from '../../../../../config/masterData';
import TooltipCustom from '../../../../common/Tooltip';
import { costingInfoContext, netHeadCostContext } from '../../CostingDetailStepTwo';
import _ from 'lodash'

function OtherCostDrawer(props) {

    //FUNCTION TO GET SUM OF OTHER COST ADDED IN THE TABLE
    const calculateSumOfValues = (data) => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += Number(data[i].AnyOtherCost);
        }
        return sum;
    }


    const { register, handleSubmit, formState: { errors }, control, getValues, setValue } = useForm();

    const headerCosts = useContext(netHeadCostContext);
    const costData = useContext(costingInfoContext);
    const CostingViewMode = useContext(ViewCostingContext);

    const { CostingDataList, } = useSelector(state => state.costing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const costingHead = useSelector(state => state.comman.costingHead)

    const [isEdit, setIsEdit] = useState(false);
    const [gridData, setgridData] = useState(props?.otherCostArr?.length > 0 ? props?.otherCostArr : []);
    const [otherCostTotal, setOtherCostTotal] = useState(props?.otherCostArr?.length > 0 ? calculateSumOfValues(props?.otherCostArr) : 0)
    const [otherCostType, setOtherCostType] = useState([]);
    const [otherCostApplicability, setOtherCostApplicability] = useState([])
    const [editIndex, setEditIndex] = useState('')
    const [otherCost, setOtherCost] = useState('')

    const fieldValues = useWatch({
        control,
        name: ['PercentageOtherCost', 'OtherCostApplicability'],
    })

    useEffect(() => {
        findApplicabilityCost()
    }, [fieldValues])

    /**
    * @method renderListing
    * @description RENDER LISTING IN DROPDOWN
    */
    const renderListing = (label) => {
        const temp = [];

        // if (label === 'Description') {
        //     dataDescription && dataDescription.map(item => {
        //         temp.push({ label: item.label, value: item.value })
        //         return null;
        //     });
        //     return temp;
        // }
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
            return temp;
        }
    }


    // const handleOtherCostTypeChange = (newValue) => {
    //     if (!CostingViewMode) {
    //         if (newValue && newValue !== '') {
    //             setOtherCostType(newValue)
    //             setValue('AnyOtherCost', 0)
    //             setValue('PercentageOtherCost', 0)
    //             errors.AnyOtherCost = {}
    //             errors.PercentageOtherCost = {}

    //         } else {
    //             setOtherCostType([])
    //         }
    //         errors.PercentageOtherCost = {}
    //     }
    // }

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

        props.closeDrawer('submit', otherCostTotal, gridData)

    }


    const addRow = () => {

        const obj = {
            OtherCostType: otherCostType?.label,
            OtherCostApplicability: otherCostApplicability?.label,
            OtherCostApplicabilityId: otherCostApplicability?.value,
            PercentageOtherCost: otherCostType?.label === 'Fixed' ? '-' : getValues('PercentageOtherCost'),
            OtherCostDescription: getValues('OtherCostDescription'),
            AnyOtherCost: otherCostType?.label === 'Fixed' ? getValues('AnyOtherCost') : otherCost
        }
        setOtherCostTotal(0)
        setOtherCostTotal(calculateSumOfValues([...gridData, obj]))
        setgridData([...gridData, obj])
        resetData()

    }

    const findValueByApplicabilityLabel = (arr, labelName) => {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].label === labelName) {
                return arr[i].value;
            }
        }
    }

    const updateRow = () => {

        const obj = {
            OtherCostType: otherCostType?.label,
            OtherCostApplicability: otherCostApplicability?.label,
            OtherCostApplicabilityId: otherCostApplicability?.value,
            PercentageOtherCost: otherCostType?.label === 'Fixed' ? '-' : getValues('PercentageOtherCost'),
            OtherCostDescription: getValues('OtherCostDescription'),
            AnyOtherCost: otherCostType?.label === 'Fixed' ? getValues('AnyOtherCost') : otherCost
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
        setOtherCost([])
        setOtherCost(0)
        setEditIndex('')
        setIsEdit(false)


    }


    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setValue('OtherCostType', { label: editObj.OtherCostType, value: editObj.OtherCostType })
        setValue('OtherCostApplicability', { label: editObj.OtherCostApplicability, value: editObj.OtherCostApplicabilityId })
        setValue('PercentageOtherCost', editObj.PercentageOtherCost)
        setValue('OtherCostDescription', editObj.OtherCostDescription)
        setValue('AnyOtherCost', editObj.AnyOtherCost)
        setOtherCostType({ label: editObj.OtherCostType, value: editObj.OtherCostType })
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
        const ConversionCostForCalculation = costData.IsAssemblyPart ? checkForNull(headerCosts.NetConversionCost) - checkForNull(headerCosts.TotalOtherOperationCostPerAssembly) : headerCosts.ProcessCostTotal + headerCosts.OperationCostTotal
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
                break;
            case 'BOP':
                totalCost = headerCosts.NetBoughtOutPartCost * calculatePercentage(percent)
                break;
            case 'RM + CC':
            case 'Part Cost + CC':
                totalCost = (RMCC) * calculatePercentage(percent)
                break;
            case 'BOP + CC':
                totalCost = BOPCC * calculatePercentage(percent)
                break;
            case 'CC':
                totalCost = (ConversionCostForCalculation) * calculatePercentage(percent)
                break;
            case 'RM + CC + BOP':
            case 'Part Cost + CC + BOP':
                totalCost = (RMBOPCC) * calculatePercentage(percent)
                break;
            case 'RM + BOP':
            case 'Part Cost + BOP':
                totalCost = (RMBOP) * calculatePercentage(percent)
                break;
            case 'Net Cost':
                totalCost = (totalTabCost) * calculatePercentage(percent)
                break;
            default:
                totalCost = getValues('AnyOtherCost')
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
                                    <h3>{"Other Cost"}</h3>
                                </div>
                                <div
                                    onClick={() => props.closeDrawer('cancel')}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row>

                                <Col md="5" >
                                    <TextFieldHookForm
                                        label="Other Cost Description"
                                        name={"OtherCostDescription"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { checkWhiteSpaces, hashValidation },
                                            maxLength: STRINGMAXLENGTH
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={""}
                                        className=""
                                        customClassName={"withBorder"}
                                        errors={errors.OtherCostDescription}
                                        disabled={CostingViewMode ? true : false}
                                    />
                                </Col>

                                {/* <Col md="3">
                                    <SearchableSelectHookForm
                                        label={"Other Cost Type"}
                                        name={"OtherCostType"}
                                        placeholder={"Select"}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        defaultValue={otherCostType.length !== 0 ? otherCostType : ""}
                                        options={renderListing("OtherCostType")}
                                        mandatory={false}
                                        handleChange={handleOtherCostTypeChange}
                                        errors={errors.OtherCostType}
                                        disabled={CostingViewMode ? true : false}
                                    />

                                </Col> */}

                                {
                                    <Col md="4">
                                        <SearchableSelectHookForm
                                            label={'Other Cost Applicability'}
                                            name={'OtherCostApplicability'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            defaultValue={otherCostApplicability.length !== 0 ? otherCostApplicability : ''}
                                            options={renderListing('Applicability')}
                                            mandatory={false}
                                            disabled={CostingViewMode ? true : false}
                                            handleChange={handleOherCostApplicabilityChange}
                                            errors={errors.OtherCostApplicability}
                                        //   buttonCross={resetData("other")}
                                        />
                                    </Col>
                                }
                                {
                                    <Col className={`${otherCostType.value === 'Percentage' ? 'col-md-3' : 'col-md-4'}`}>
                                        <TextFieldHookForm
                                            label="Percentage (%)"
                                            name={"PercentageOtherCost"}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            rules={{
                                                //required: true,
                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                max: {
                                                    value: 100,
                                                    message: 'Percentage cannot be greater than 100'
                                                },
                                            }}
                                            handleChange={(e) => {
                                                e.preventDefault();
                                                // handleOtherCostPercentageChange(e);
                                            }}
                                            defaultValue={""}
                                            className=""
                                            customClassName={"withBorder"}
                                            errors={errors.PercentageOtherCost}
                                            disabled={CostingViewMode || !(otherCostType && otherCostType.value === 'Percentage') ? true : false}
                                        />
                                    </Col>}

                                <Col md="2">
                                    {(otherCostType.value === 'Percentage' || Object.keys(otherCostType).length === 0) && <TooltipCustom disabledIcon={true} id="other-cost" tooltipText={"Other Cost = (Other Cost Applicability * Percentage / 100)"} />}
                                    <TextFieldHookForm
                                        label="Other Cost"
                                        name={"AnyOtherCost"}
                                        id="other-cost"
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            //required: true,
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
                                <Col md="4" className='pt-1'>
                                    {isEdit ? (
                                        <>
                                            <button
                                                type="button"
                                                className={"btn btn-primary mt30 pull-left mr5"}
                                                onClick={updateRow}
                                                disabled={CostingViewMode}
                                            >
                                                Update
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
                                                type="button"
                                                className={"user-btn mt30 pull-left"}
                                                disabled={CostingViewMode}
                                                onClick={addRow}
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
                            <Col md="12">
                                <Table className="table mb-0 forging-cal-table" size="sm">
                                    <thead>
                                        <tr>
                                            <th>{`Other Cost Description`}</th>
                                            {/* <th>{`Other Cost Type`}</th> */}
                                            <th>{`Other Cost Applicability`}</th>
                                            <th>{'Percentage'}</th>
                                            <th>{`Cost`}</th>
                                            <th className='text-right'>{`Action`}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gridData && gridData.map((item, index) => {
                                            return (
                                                <tr key={index} >
                                                    <td>{item.OtherCostDescription}</td>
                                                    {/* <td>{item.OtherCostType}</td> */}
                                                    <td>{item?.OtherCostApplicability}</td>
                                                    <td>{item.PercentageOtherCost}</td>
                                                    <td>{checkForDecimalAndNull(item.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice)}</td>
                                                    <td className='text-right'>
                                                        <button
                                                            className="Edit"
                                                            title='Edit'
                                                            type={"button"}
                                                            disabled={CostingViewMode}
                                                            onClick={() =>
                                                                editItemDetails(index)
                                                            }
                                                        />
                                                        <button
                                                            className="Delete"
                                                            title='Delete'
                                                            type={"button"}
                                                            disabled={CostingViewMode}
                                                            onClick={() =>
                                                                deleteItem(index)
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    </tbody>

                                    {gridData.length === 0 && (
                                        <tbody className='border'>
                                            <tr>
                                                <td colSpan={"4"}> <NoContentFound title={EMPTY_DATA} /></td>
                                            </tr>
                                        </tbody>
                                    )}

                                </Table>
                            </Col>
                            <div className="col-md-12 text-right bluefooter-butn border">
                                <span className="w-50 d-inline-block">
                                    {`Total Other Cost:`}
                                    {checkForDecimalAndNull(otherCostTotal, initialConfiguration.NoOfDecimalForPrice)}
                                </span>
                            </div>
                            <Row className="justify-content-between row">
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
                                        type="submit"
                                        className="submit-button save-btn"
                                        disabled={CostingViewMode}
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