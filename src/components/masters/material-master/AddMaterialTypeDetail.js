import React, { useState, useEffect } from "react";
import { Row, Col, Table } from "reactstrap";
import { checkForDecimalAndNull, checkWhiteSpaces, percentageLimitValidation, number } from "../../../helper";
import { useDispatch, useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import Toaster from '../../common/Toaster';
import { getCommodityCustomNameSelectListByType } from "../actions/Indexation";

const AddMaterialTypeDetail = (props) => {
    const { tableData, tableDataState, isViewFlag } = props;
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration);
    const [editIndex, setEditIndex] = useState('');
    const [originalPercentage, setOriginalPercentage] = useState(0);

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
    const [isEditMode, setIsEditMode] = useState(false);
    const { customNameCommodityData } = useSelector((state) => state.indexation);

    useEffect(() => {
        dispatch(getCommodityCustomNameSelectListByType((res) => { }));
    }, [dispatch]);

    useEffect(() => {
        setGridData(tableDataState);
        setPercentageTotal(calculateTotalPercentage(tableDataState));
    }, [tableDataState]);

    const [percentageTotal, setPercentageTotal] = useState(0);

    const renderListing = (label) => {
        const temp = [];
        if (label === 'CommodityStandardName') {
            customNameCommodityData && customNameCommodityData.map((item) => {
                if (item.Value === '--0--') return false;
                temp.push({ label: item.Text, value: item.Value });
                return null;
            });
            return temp;
        }
    };

    const calculateTotalPercentage = (data) => {
        return data.reduce((total, item) => {
            let percentage = (typeof item === 'object' && item.Percentage !== undefined) ? parseFloat(item.Percentage) : parseFloat(item);
            return total + (isNaN(percentage) ? 0 : percentage);
        }, 0);
    };

    const handleInputChange = (selectedOption, name) => {
        const updatedFormData = { ...formData, [name]: selectedOption.value };
        setFormData(updatedFormData);
    };

    const resetData = () => {
        setEditIndex('');
        setIsEditMode(false);
        setOriginalPercentage(0);
        reset({
            CommodityStandardName: '',
            Percentage: '',
        });
    };

    const addData = () => {
        if (!getValues('CommodityStandardName') || !getValues('Percentage')) {
            Toaster.warning("Please enter all details to add a row.");
            return false;
        }

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

        let newGridData;
        if (isEditMode) {
            const totalPercentage = calculateTotalPercentage(gridData) - originalPercentage + newData.Percentage;
            if (totalPercentage <= 100) {
                newGridData = [...gridData.slice(0, editIndex), newData, ...gridData.slice(editIndex + 1)];
                setGridData(newGridData);
                setPercentageTotal(totalPercentage);
                tableData(newGridData);
                resetData();
            } else {
                Toaster.warning("Total percentage cannot exceed 100.");
            }
        } else {
            newGridData = [...gridData, newData];
            const totalPercentage = calculateTotalPercentage(newGridData);
            if (totalPercentage <= 100) {
                setGridData(newGridData);
                setPercentageTotal(totalPercentage);
                tableData(newGridData);
                resetData();
            } else {
                Toaster.warning("Total percentage cannot exceed 100.");
            }
        }
        setIsEditMode(false);
        setEditIndex('');
    };

    const editData = (indexValue, operation) => {
        if (operation === 'delete') {
            const temp = gridData.filter((item, index) => index !== indexValue);
            setGridData(temp);
            setPercentageTotal(calculateTotalPercentage(temp));
            resetData();
            tableData(temp);
        }

        if (operation === 'edit') {
            setEditIndex(indexValue);
            setIsEditMode(true);

            const data = gridData[indexValue];
            setOriginalPercentage(data.Percentage); // Store the original percentage
            setValue('CommodityStandardName', { label: data.CommodityStandardName, value: data.CommodityStandardId });
            setValue('Percentage', data.Percentage);
        }
    };

    const handleAddUpdateButtonClick = () => {
        addData();
    };

    return <>
        <form>
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
                        disabled={isViewFlag}
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
                        disabled={isViewFlag}
                    />
                </Col>
                <Col md="4" className={`${initialConfiguration?.IsShowCRMHead ? "mb-3" : "pt-1"} d-flex`}>
                    {isEditMode ? (
                        <>
                            <button
                                type="button"
                                className={"btn btn-primary mt30 pull-left mr10"}
                                onClick={handleAddUpdateButtonClick}
                                disabled={isViewFlag}
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                className={"mr15 ml-1 mt30 add-cancel-btn cancel-btn"}
                                onClick={() => resetData()}
                                disabled={isViewFlag}
                            >
                                <div className={"cancel-icon"}></div>Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className={`user-btn ${initialConfiguration?.IsShowCRMHead ? '' : 'mt30'} pull-left mr10`}
                                onClick={handleAddUpdateButtonClick}
                                disabled={isViewFlag}
                            >

                                <div className={"plus"}></div>ADD
                            </button>
                            <button
                                type="button"
                                className={`ml-1 ${initialConfiguration?.IsShowCRMHead ? '' : 'mt30'} reset-btn`}
                                onClick={() => resetData()}
                                disabled={isViewFlag}
                            >
                                Reset
                            </button>
                        </>
                    )}
                </Col>
            </Row>
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
                <tbody>
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
                                            disabled={isViewFlag}
                                        />
                                        <button
                                            className="Delete ml-1"
                                            title='Delete'
                                            type={"button"}
                                            onClick={() => editData(index, 'delete')}
                                            disabled={isViewFlag}
                                        />
                                    </td>
                                </tr>
                            ))}
                            <tr className='table-footer'>
                                <td colSpan={1} className='text-left'>
                                    Total Percentage:
                                </td>
                                <td colSpan={3}>
                                    {checkForDecimalAndNull(percentageTotal, initialConfiguration?.NoOfDecimalForPrice)}
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
};

export default AddMaterialTypeDetail;
