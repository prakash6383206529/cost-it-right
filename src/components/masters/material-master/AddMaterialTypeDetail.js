import React, { useState, useEffect } from "react";
import { Row, Col, Table } from "reactstrap";
import { checkForDecimalAndNull, checkWhiteSpaces, percentageLimitValidation, number } from "../../../helper"
import { useDispatch, useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import Toaster from '../../common/Toaster';
import { getCommodityCustomNameSelectListByType } from "../actions/Indexation";

const AddMaterialTypeDetail = (props) => {
    const { tableData, tableDataState } = props;
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')

    const { register, formState: { errors }, control, setValue, getValues, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch();
    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        CommodityStandardName: '',
        Percentage: ''
    });
    const [isEditMode, setIsEditMode] = useState(false)
    const { customNameCommodityData } = useSelector((state) => state.indexation);
    useEffect(() => {
        dispatch(getCommodityCustomNameSelectListByType((res) => { }))
    }, [])
    useEffect(() => {
        setGridData(tableDataState)
        let percentage = tableDataState && tableDataState.map((item) => item.Percentage)
        calculateTotalPercentage(percentage)
    }, [tableDataState])
    const [percentageTotal, setPercentageTotal] = useState(0);

    const renderListing = (label) => {
        const temp = []
        if (label === 'CommodityStandardName') {
            customNameCommodityData && customNameCommodityData.map((item) => {
                if (item.Value === '--0--') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    };

    const calculateTotalPercentage = (data) => {
        console.log('data: ', data);
        let totalPercentage = 0;
        for (let i = 0; i < data.length; i++) {
            totalPercentage += parseFloat(data[i].Percentage);
        }
        console.log('totalPercentage: ', totalPercentage);
        return totalPercentage;
    }

    const handleInputChange = (selectedOption, name) => {
        const updatedFormData = { ...formData, [name]: selectedOption.value };
        setFormData(updatedFormData);
    };

    const resetData = (type = '') => {
        const commonReset = () => {
            setEditIndex('');
            setIsEditMode(false);
            reset({
                CommodityStandardName: '',
                Percentage: '',
            });
        };
        commonReset();
    };

    const addData = () => {
        if (!getValues('CommodityStandardName') || !getValues('Percentage')) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }
        if (errors.CommodityStandardName || errors.Percentage) return false;

        const newData = {
            CommodityStandardName: getValues('CommodityStandardName') ? getValues('CommodityStandardName').label : '',
            Percentage: getValues('Percentage') ? Number(getValues('Percentage')) : '',
            CommodityStandardId: getValues('CommodityStandardName') ? Number(getValues('CommodityStandardName')?.value) : '',
        };

        let isDuplicate = false;
        gridData.map((item, index) => {
            if (index !== editIndex) {
                if ((item.CommodityStandardName === newData.CommodityStandardName || item.CommodityStandardId === newData.CommodityStandardId) &&
                    item.Percentage === newData.Percentage) {
                    isDuplicate = true;
                }
            }
            return null;
        });

        if (isDuplicate) {
            Toaster.warning('Duplicate entry is not allowed.');
            return false;
        }

        const newGridData = isEditMode ? [...gridData.slice(0, editIndex), newData, ...gridData.slice(editIndex + 1)] : [...gridData, newData];
        const totalPercentage = calculateTotalPercentage(newGridData);
        if (totalPercentage <= 100) {
            setGridData(newGridData);
            setPercentageTotal(totalPercentage);
            tableData(newGridData)
            resetData();
        } else {
            Toaster.warning("Total percentage cannot exceed 100.");
        }
        setIsEditMode(false);
        setEditIndex('');
    };

    const editData = (indexValue, operation) => {
        if (operation === 'delete') {
            let temp = [];
            gridData && gridData.map((item, index) => {
                if (index !== indexValue) {
                    temp.push(item);
                }
                return null;
            });
            setGridData(temp);
            setPercentageTotal(calculateTotalPercentage(temp));
            resetData();
            tableData(temp)
        }

        if (operation === 'edit') {
            setEditIndex(indexValue);
            setIsEditMode(true);

            let Data = gridData[indexValue];
            setValue('CommodityStandardName', { label: Data.CommodityStandardName, value: Data.CommodityStandardId });
            setValue('Percentage', Data.Percentage);
        }
    };

    const handleAddUpdateButtonClick = () => {
        if (!getValues('CommodityStandardName') || !getValues('Percentage')) {
            return;
        }
        addData();
    };

    return <>
        <form >
            <Row className="pl-3">
                <Col md="4">
                    <SearchableSelectHookForm
                        label={'Commodity (In CIR)'}
                        name={'CommodityStandardName'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={''}
                        options={renderListing('CommodityStandardName')}
                        mandatory={true}
                        handleChange={(option) => handleInputChange(option, 'CommodityStandardName')}
                        errors={errors.CommodityStandardName}
                    />
                </Col>
                <Col md="4">
                    <TextFieldHookForm
                        label="Percentage (%)"
                        name={"Percentage"}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, percentageLimitValidation, checkForDecimalAndNull },
                            max: {
                                value: 100,
                                message: 'Percentage cannot be greater than 100'
                            },
                        }}
                        handleChange={() => { }}
                        defaultValue={""}
                        className=""
                        customClassName={"withBorder"}
                        errors={errors.Percentage}
                    />
                </Col>
                <Col md="4" className={`${initialConfiguration.IsShowCRMHead ? "mb-3" : "pt-1"} d-flex`}>
                    {isEdit ? (
                        <>
                            <button
                                type="button"
                                className={"btn btn-primary mt30 pull-left mr5"}
                                onClick={handleAddUpdateButtonClick}
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                                onClick={() => resetData()}
                            >
                                <div className={"cancel-icon"}></div>Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={`user-btn ${initialConfiguration.IsShowCRMHead ? '' : 'mt30'} pull-left`}
                                onClick={handleAddUpdateButtonClick}
                            >
                                <div className={"plus"}></div>ADD

                            </button>
                            <button
                                type="button"
                                className={`ml-1 ${initialConfiguration.IsShowCRMHead ? '' : 'mt30'} reset-btn`}
                                onClick={() => resetData()}
                            >
                                Reset
                            </button>
                        </>
                    )}
                </Col>
            </Row >
        </form>
        <br />
        <Col md="12" className="mb-2 pl-2 pr-3">
            <Table className="table mb-0 forging-cal-table" size="sm">
                <thead>
                    <tr>
                        <th>{`Commodity (In CIR)`}</th>
                        <th>{`Percentage (%)`}</th>
                        <th className='text-right'>{`Action`}</th>
                    </tr>
                </thead>
                <tbody >
                    {gridData.length > 0 ? (
                        <>
                            {gridData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.CommodityStandardName}</td>
                                    <td>{item.Percentage}</td>
                                    <td className='text-right'>
                                        <button
                                            className="Edit"
                                            title='Edit'
                                            type={"button"}
                                            onClick={() => editData(index, 'edit')}
                                        />
                                        <button
                                            className="Delete ml-1"
                                            title='Delete'
                                            type={"button"}
                                            onClick={() => editData(index, 'delete')}
                                        />
                                    </td>
                                </tr>
                            ))}
                            <tr className='table-footer'>
                                <td colSpan={1} className='text-left'>
                                    Total Percentage:
                                </td>
                                <td colSpan={3}>
                                    {checkForDecimalAndNull(percentageTotal, initialConfiguration.NoOfDecimalForPrice)}
                                </td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td colSpan={4}>
                                <NoContentFound title={EMPTY_DATA} />
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Col>
    </>
}
export default AddMaterialTypeDetail;