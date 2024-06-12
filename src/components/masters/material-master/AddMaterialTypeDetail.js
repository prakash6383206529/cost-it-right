import React, { useState } from "react";
import { Row, Col, Table } from "reactstrap";
import { checkForDecimalAndNull, checkWhiteSpaces, percentageLimitValidation, number } from "../../../helper"
import { useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import Toaster from '../../common/Toaster';

const AddMaterialTypeDetail = () => {

    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')
    const [percentageTotal, setPercentageTotal] = useState(0);

    const { register, formState: { errors }, control, setValue, handleSubmit } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        MaterialIndex: '',
        Percentage: ''
    });

    const handleMaterialIndexChange = (selectedOption) => {
        setFormData({ ...formData, MaterialIndex: selectedOption.value });
    };

    const renderListing = (label) => {
        if (label === 'Applicability') {
            return [
                { label: 'Option 1', value: 'Option1' },
                { label: 'Option 2', value: 'Option2' },
                { label: 'Option 3', value: 'Option3' },
            ];
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetData = () => {
        setValue('MaterialIndex', '');
        setValue('Percentage', '');
        setIsEdit(false)
        setEditIndex('')
    }

    const deleteItem = (index) => {
        const newGridData = [...gridData.slice(0, index), ...gridData.slice(index + 1)];
        setGridData(newGridData);
        setPercentageTotal(calculateTotalPercentage(newGridData));
        setIsEdit(false);
        resetData();
    };

    const calculateTotalPercentage = (data) => {
        let totalPercentage = 0;
        for (let i = 0; i < data.length; i++) {
            totalPercentage += parseFloat(data[i].Percentage);
        }
        return totalPercentage;
    }

    const onSubmit = () => {
        if (isEdit) {
            updateRow()
        } else {
            addRow()
        }
    };

    const updateRow = () => {
        const obj = {
            MaterialIndex: formData.MaterialIndex,
            Percentage: formData.Percentage
        }

        const isDuplicate = gridData.some((data, index) => {
            if (index !== editIndex) {
                return (
                    data.MaterialIndex === obj.MaterialIndex &&
                    data.Percentage === obj.Percentage
                );
            }
            return false;
        });

        if (isDuplicate) {
            Toaster.warning("Duplicate entries are not allowed.");
            return;
        }

        let tempArr = [...gridData];
        tempArr[editIndex] = obj;
        const totalPercentage = calculateTotalPercentage(tempArr);
        if (totalPercentage <= 100) {
            setGridData(tempArr);
            setPercentageTotal(totalPercentage);
            setIsEdit(false);
            resetData();
        }
        else {
            Toaster.warning("Total percentage cannot exceed 100.");
        }
    };

    const addRow = () => {
        const isDuplicate = gridData.some(item =>
            item.MaterialIndex === formData.MaterialIndex &&
            item.Percentage === formData.Percentage
        );

        if (!isDuplicate) {
            const obj = {
                MaterialIndex: formData.MaterialIndex,
                Percentage: formData.Percentage,
            };
            const newGridData = [...gridData, obj];
            const totalPercentage = calculateTotalPercentage(newGridData);
            if (totalPercentage <= 100) {
                setGridData(newGridData);
                setPercentageTotal(calculateTotalPercentage(newGridData));
                resetData();
            }
            else {
                Toaster.warning("Total percentage cannot exceed 100.");
            }
        } else {
            Toaster.warning("Duplicate entries are not allowed.");
        }
    };

    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setValue('MaterialIndex', { label: editObj.MaterialIndex, value: editObj.MaterialIndex })
        setValue('Percentage', editObj.Percentage)
        setEditIndex(index)
        setIsEdit(true)
    }

    const handleAddUpdateButtonClick = () => {
        if (!formData.MaterialIndex || !formData.Percentage) {
            return;
        }
        if (isEdit) {
            updateRow();
        } else {
            addRow();
        }
        resetData();
    };
    return <>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Row className="pl-3">
                <Col md="4">
                    <SearchableSelectHookForm
                        label={'Commodity (In CIR)'}
                        name={'MaterialIndex'}
                        placeholder={'Select'}
                        Controller={Controller}
                        control={control}
                        rules={{ required: true }}
                        register={register}
                        defaultValue={''}
                        options={renderListing('Applicability')}
                        mandatory={true}
                        handleChange={handleMaterialIndexChange}
                        errors={errors.MaterialIndex}
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
                        handleChange={handleInputChange}
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
                                    <td>{item.MaterialIndex}</td>
                                    <td>{item.Percentage}</td>
                                    <td className='text-right'>
                                        <button
                                            className="Edit"
                                            title='Edit'
                                            type={"button"}
                                            onClick={() => editItemDetails(index)}
                                        />
                                        <button
                                            className="Delete ml-1"
                                            title='Delete'
                                            type={"button"}
                                            onClick={() => deleteItem(index)}
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