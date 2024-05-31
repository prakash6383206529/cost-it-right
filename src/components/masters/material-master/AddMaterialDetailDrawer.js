import React, { useState , useEffect } from "react";
import { Row, Col, Table, Container } from "reactstrap";
import { useDispatch , useSelector } from "react-redux";
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { Drawer } from "@material-ui/core";
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { MESSAGES } from '../../../config/message';
import AddGrade from "./AddGrade";
import Button from '../../layout/Button';
import { getCommoditySelectListByType, getCommodityNameSelectListByType, getCommodityCustomNameSelectListByType } from '../../masters/actions/Indexation'

const AddMaterialDetailDrawer = ({ isEditFlag, isOpen, closeDrawer, anchor }) => {

    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const [isEdit, setIsEdit] = useState(false);
    const [editIndex, setEditIndex] = useState('')
    const [state, setState] = useState({
        isShowForm: false,
        MaterialTypeId: '',
        DataToChange: [],
        setDisable: false,
        showPopup: false,
    });
    const { register, formState: { errors, isDirty }, control, setValue, handleSubmit, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const dispatch = useDispatch()
    const indexCommodityData = useSelector(state => state.comman.indexCommodityData);
    const nameCommodityData = useSelector(state => state.comman.nameCommodityData);
    const customNameCommodityData = useSelector(state => state.comman.customNameCommodityData);

    useEffect(() => {
        dispatch(getCommoditySelectListByType(() => { }))
        dispatch(getCommodityNameSelectListByType(() => { }))
        dispatch(getCommodityCustomNameSelectListByType(() => { }))
    }, [])

    const [gridData, setGridData] = useState([]);
    const [formData, setFormData] = useState({
        Index: '',
        MaterialName: '',
        MaterialNameCustom: ''

    });



    const renderListing = (label) => {
        const temp = []
        if (label === 'index') {
            indexCommodityData && indexCommodityData.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item.PlantNameCode, value: item.PlantId })
                return null
            })
            return temp
        }
        if (label === 'commodityName') {
            nameCommodityData && nameCommodityData.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'commodityCustomName') {
            customNameCommodityData && customNameCommodityData.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'Applicability') {
            return [
                { label: 'Option 1', value: 'Option1' },
                { label: 'Option 2', value: 'Option2' },
                { label: 'Option 3', value: 'Option3' },
            ];
        }
    };

    const handleInputChange = (selectedOption, name) => {
        const updatedFormData = { ...formData, [name]: selectedOption.value };
        setFormData(updatedFormData);
    };

    const resetData = () => {
        setValue('Index', '');
        setValue('MaterialName', '');
        setValue('MaterialNameCustom', '');
        setIsEdit(false)
        setEditIndex('')
        setFormData({
            Index: '',
            MaterialName: '',
            MaterialNameCustom: ''
        });
    }

    const deleteItem = (index) => {
        const newGridData = [...gridData.slice(0, index), ...gridData.slice(index + 1)];
        setGridData(newGridData);
        setIsEdit(false);
        resetData();
    };

    const onSubmit = () => {
        if (isEdit) {
            updateRow()
        } else {
            addRow()
        }
    };

    const updateRow = () => {
        const obj = {
            Index: formData.Index,
            MaterialName: formData.MaterialName,
            MaterialNameCustom: formData.MaterialNameCustom
        }

        const updatedGridData = gridData.map((item, index) =>
            index === editIndex ? obj : item
        );
        setGridData(updatedGridData);

        setIsEdit(false);
        resetData();
    };


    const addRow = () => {

        const obj = {
            Index: formData.Index,
            MaterialName: formData.MaterialName,
            MaterialNameCustom: formData.MaterialNameCustom
        };
        const newGridData = [...gridData, obj];
        setGridData(newGridData);

        resetData();
    };

    const editItemDetails = (index) => {
        const editObj = gridData[index]
        setFormData({
            Index: editObj.Index,
            MaterialName: editObj.MaterialName,
            MaterialNameCustom: editObj.MaterialNameCustom
        });
        setValue('Index', { label: editObj.Index, value: editObj.Index })
        setValue('MaterialName', { label: editObj.MaterialName, value: editObj.MaterialName })
        setValue('MaterialNameCustom', { label: editObj.MaterialNameCustom, value: editObj.MaterialNameCustom })
        setEditIndex(index)
        setIsEdit(true)
    }

    const handleAddUpdateButtonClick = () => {
        if (!formData.Index || !formData.MaterialName || !formData.MaterialNameCustom) {
            return;
        }
        if (isEdit) {
            updateRow();
        } else {
            addRow();
        }
        resetData();
    };

    const toggleDrawer = (event, formData, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        closeDrawer('', formData, type);
    };
    const cancel = (type) => {
        reset();
        // dispatch(getMaterialTypeDataAPI('', res => { }));
        toggleDrawer('', '', type);
    };

    const cancelHandler = () => {
        if (isDirty) {
            setState(prevState => ({ ...prevState, showPopup: true }));
        } else {
            cancel('cancel');
        }
    };
    const onPopupConfirm = () => {
        cancel('cancel');
        setState(prevState => ({ ...prevState, showPopup: false }));
    };

    const closePopUp = () => {
        setState(prevState => ({ ...prevState, showPopup: false }));
    };
    const indexToggler = (Id = '') => {
        setState(prevState => ({ ...prevState, isOpenIndex: true }));
    }
    const closeIndex = () => {
        setState(prevState => ({ ...prevState, isOpenIndex: false }));
    }
    return (
        <div>
            <Drawer anchor={anchor} open={isOpen}>
                <Container>
                    <div className={'drawer-wrapper layout-min-width-820px'}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            Commodity Standardization
                                        </h3>
                                    </div>
                                    <div
                                        onClick={e => toggleDrawer(e)}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <Row className="pl-3">
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={'Index'}
                                        name={'Index'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        //options={renderListing('Applicability')}
                                        options={renderListing("index")}
                                        mandatory={true}
                                        handleChange={(option) => handleInputChange(option, 'Index')}
                                        errors={errors.index}
                                    />
                                </Col>
                                <Col md="4">
                                    <SearchableSelectHookForm
                                        label={'Commodity Name (In index)'}
                                        name={'MaterialName'}
                                        placeholder={'Select'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: true }}
                                        register={register}
                                        defaultValue={''}
                                        //options={renderListing('Applicability')}
                                        options={renderListing('commodityName')}
                                        mandatory={true}
                                        handleChange={(option) => handleInputChange(option, 'MaterialName')}
                                        errors={errors.MaterialName}
                                    />
                                </Col>
                                <Col md="4" className="d-flex pb-4 justify-space-between align-items-center inputwith-icon ">
                                    <div className="w-100">
                                        <SearchableSelectHookForm
                                            label={'Commodity Name (In CIR)'}
                                            name={'MaterialNameCustom'}
                                            placeholder={'Select'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: true }}
                                            register={register}
                                            defaultValue={''}
                                            // options={renderListing('Applicability')}
                                            options={renderListing('commodityCustomName')}
                                            mandatory={true}
                                            handleChange={(option) => handleInputChange(option, 'MaterialNameCustom')}
                                            errors={errors.MaterialNameCustom}
                                        />
                                    </div>
                                    <Button
                                        id="GradeId-add"
                                        className={"right mt-4 mb"}
                                        variant={"plus-icon-square"}
                                        onClick={() => indexToggler("")}
                                    />
                                </Col>

                                <Col md="12" className={`d-flex justify-content-end  `}>
                                    {isEdit ? (
                                        <>
                                            <button
                                                type="button"
                                                className={"btn btn-primary pull-left mr5"}
                                                onClick={handleAddUpdateButtonClick}
                                            >
                                                Update
                                            </button>
                                            <button
                                                type="button"
                                                className={"mr5 ml-1 mt-0 add-cancel-btn cancel-btn"}
                                                onClick={() => resetData()}
                                            >
                                                <div className={"cancel-icon"}></div>Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className={`user-btn ${initialConfiguration.IsShowCRMHead ? '' : ''} pull-left`}
                                                onClick={handleAddUpdateButtonClick}
                                            >
                                                <div className={"plus"}></div>ADD

                                            </button>
                                            <button
                                                type="button"
                                                className={`ml-1 ${initialConfiguration.IsShowCRMHead ? '' : ''} reset-btn`}
                                                onClick={() => resetData()}
                                            >
                                                Reset
                                            </button>
                                        </>
                                    )}
                                </Col>
                            </Row >
                        </form>
                    </div>

                    <br />
                    <Col md="12" className="mb-2 pl-2 pr-3">
                        <Table className="table mb-0 forging-cal-table" size="sm">
                            <thead>
                                <tr>
                                    <th>{`Index`}</th>
                                    <th>{`Commodity Name (In index)`}</th>
                                    <th>{`Commodity Name (In CIR)`}</th>
                                    <th className='text-right'>{`Action`}</th>
                                </tr>
                            </thead>
                            <tbody >
                                {gridData.length > 0 ? (
                                    <>
                                        {gridData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.Index}</td>
                                                <td>{item.MaterialName}</td>
                                                <td>{item.MaterialNameCustom}</td>
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

                    <Row className=" no-gutters justify-content-between">
                        <div className="col-md-12">
                            <div className="text-right ">
                                <button
                                    id="AddMaterialType_Cancel"
                                    type="button"
                                    onClick={cancelHandler}
                                    value="CANCEL"
                                    className="mr15 cancel-btn"
                                >
                                    <div className={"cancel-icon"}></div>
                                    CANCEL
                                </button>
                                <button
                                    id="AddMaterialType_Save"
                                    type="submit"
                                    className="user-btn save-btn"
                                >
                                    {" "}
                                    <div className={"save-icon"}></div>
                                    {isEditFlag ? "UPDATE" : "SAVE"}
                                </button>
                            </div>
                        </div>
                    </Row>
                </Container>
            </Drawer>
            {state.isOpenIndex && (
                <AddGrade
                    isOpen={state.isOpenIndex}
                    closeDrawer={closeIndex}
                    isEditFlag={isEditFlag}
                    // RawMaterial={this.state.RawMaterial}
                    // ID={this.state.Id}
                    anchor={"right"}
                    // specificationId={this.state.specificationId}
                    isShowIndex={true}

                />
            )}            {state.showPopup && (
                <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            )}
        </div>

    )
};
export default AddMaterialDetailDrawer;