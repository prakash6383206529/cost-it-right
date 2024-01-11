import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { searchableSelect } from '../../layout/FormInputs';
import Drawer from '@material-ui/core/Drawer';
import { required } from '../../../helper';
import { getRawMaterialNameChild, createAssociation, getRMGradeSelectListByRawMaterial, getMaterialTypeSelectList, getUnassociatedRawMaterail, clearGradeSelectList } from '../actions/Material';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { debounce } from 'lodash';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import Button from '../../layout/Button';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form';
import { TextFieldHookForm } from '../../layout/HookFormInputs';

const Association = ({ isEditFlag, ID, isOpen, closeDrawer, anchor }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch()

    const [state, setState] = useState({
        RawMaterial: [],
        RMGrade: [],
        material: [],
        setDisable: false,
        showPopup: false,
        isDropDownChanged: false,
    })
    const {
        register,
        control,
        setValue,
        handleSubmit,
        getValues,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });


    useEffect(() => {
        const fetchData = () => {
            dispatch(getRawMaterialNameChild(() => { }))
            dispatch(getMaterialTypeSelectList(() => { }))
            dispatch(getUnassociatedRawMaterail(() => { }))
        }
        fetchData()
    }, [])

    const { gradeSelectList, MaterialSelectList, unassociatedMaterialList } = useSelector(state => state.material);
    useEffect(() => {
        dispatch(clearGradeSelectList([]))
    }, [])


    const renderListing = (label) => {
        const temp = [];
        if (label === 'RawMaterialName') {
            unassociatedMaterialList && unassociatedMaterialList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'RMGrade') {
            gradeSelectList && gradeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'material') {
            MaterialSelectList && MaterialSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
 * @method handleRawMaterial
 * @description  used to raw material change
 */
    const handleRawMaterial = (newValue, actionMeta) => {

        if (newValue && newValue !== '') {

            setState({ RawMaterial: newValue, RMGrade: [], isDropDownChanged: true }, () => {
                const { RawMaterial } = state;

                dispatch(getRMGradeSelectListByRawMaterial(RawMaterial.value, false, res => { }));
            });
        } else {
            setState({ RawMaterial: [], RMGrade: [], });
            dispatch(getRMGradeSelectListByRawMaterial(0, false, res => { }));
        }
    }

    const handleGrade = (newValue) => {
        if (newValue && newValue !== '') {
            setState({ RMGrade: newValue })
        } else {
            setState({ RMGrade: [] })
        }
    }

    const handleMaterialChange = (newValue) => {
        if (newValue && newValue !== '') {
            setState({ material: newValue, isDropDownChanged: true })
        } else {
            setState({ material: [] })
        }
    }

    /**
 * @method onSubmit
 * @description Used to Submit the form
 */
    const onSubmit = debounce((values) => {
        const { RawMaterial, material, RMGrade, } = state;
        setState({ setDisable: true })
        let formData = {
            RawMaterialId: RawMaterial.value,
            GradeId: RMGrade.value,
            MaterialId: material.value,
        }

        dispatch(createAssociation(formData, (res) => {
            setState({ setDisable: false })
            if (res?.data?.Result) {
                Toaster.success(MESSAGES.ASSOCIATED_ADDED_SUCCESS);
                toggleDrawer('')
            }
        }));

    }, 500)
    const toggleDrawer = (event, data) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        closeDrawer('')
    };
    const cancel = () => {
        if (state.isDropDownChanged) {
            setState({ showPopup: true })
        } else {
            closeDrawer('')
        }
    }
    const onPopupConfirm = () => {
        closeDrawer('')
        setState({ showPopup: false })
    }
    const closePopUp = () => {
        setState({ showPopup: false })
    }

    const { setDisable } = state

    return (
        <div>
            <Drawer
                anchor={anchor}
                open={isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                <Container>
                    <div className={"drawer-wrapper spec-drawer"}>
                        <form
                            noValidate
                            className="form"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>
                                            {"Add Association"}
                                            <TourWrapper
                                                buttonSpecificProp={{ id: "Association_form" }}
                                                stepsSpecificProp={{
                                                    steps: Steps(t).ADD_RM_ASSOCIATION
                                                }} />
                                        </h3>
                                    </div>
                                    <div
                                        onClick={(e) => toggleDrawer(e)}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <div className="ml-3">
                                <Row>
                                    <Col md="12">
                                        <div className="d-flex">

                                            <TextFieldHookForm
                                                label="Raw Material"
                                                Controller={Controller}
                                                control={control}
                                                register={{ required: 'This field is required' }}
                                                name="RawMaterialName"
                                                defaultValue=""
                                                customClassName={"withBorder"}

                                                mandatory={true}
                                                errors={errors}
                                                rules={{ required: 'This field is required' }}
                                                handleChange={(e) => console.log('Handle Change:', e)}
                                                hidden={false}
                                                isLoading={{ isLoader: false, loaderClass: '' }}
                                                id="RawMaterialName"
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <div className="d-flex justify-space-between align-items-center inputwith-icon">
                                            <div className="fullinput-icon">
                                                <TextFieldHookForm
                                                    name="GradeId"
                                                    type="text"
                                                    Controller={Controller}
                                                    label="Grade"
                                                    customClassName={"withBorder"}

                                                    control={control}
                                                    register={register} placeholder={"Select"}
                                                    options={renderListing("RMGrade")}
                                                    //onKeyUp={(e) => changeItemDesc(e)}
                                                    validate={
                                                        state.RMGrade == null || state.RMGrade.length === 0 ? [required] : []}
                                                    required={true}
                                                    handleChangeDescription={handleGrade}
                                                    valueDescription={state.RMGrade}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="12">
                                        <div className="d-flex">
                                            <TextFieldHookForm
                                                name="MaterialTypeId"
                                                type="text"
                                                label="Material"
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                component={searchableSelect}
                                                customClassName={"withBorder"}

                                                placeholder={"Select"}
                                                options={renderListing("material")}
                                                //onKeyUp={(e) => changeItemDesc(e)}
                                                validate={state.material == null || state.material.length === 0 ? [required] : []} required={true}
                                                handleChangeDescription={handleMaterialChange}
                                                valueDescription={state.material}
                                            />

                                        </div>
                                    </Col>

                                </Row>
                                <Row className="sf-btn-footer no-gutters justify-content-between">
                                    <div className="col-md-12 pr-3">
                                        <div className="text-right ">

                                            <Button
                                                id="rmAssociation_cancel"
                                                className="mr-2 mt-0"
                                                variant={"cancel-btn"}
                                                onClick={cancel}
                                                icon={"cancel-icon"}
                                                buttonName={"Cancel"}
                                            />

                                            <Button
                                                id="rmAssociation_Save"
                                                type="submit"
                                                className="mr5"
                                                disabled={setDisable}
                                                icon={"save-icon"}
                                                buttonName={"Save"}
                                            />

                                        </div>
                                    </div>
                                </Row>
                            </div>
                        </form>
                    </div>
                </Container>
            </Drawer>
            {
                state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
            }
        </div>
    );
}


export default Association
