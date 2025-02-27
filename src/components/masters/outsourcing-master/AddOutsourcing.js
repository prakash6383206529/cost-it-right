import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { debounce } from 'lodash';
import Drawer from '@material-ui/core/Drawer';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from '../../../helper/auth';
import LoaderCustom from '../../common/LoaderCustom';
import Toaster from '../../common/Toaster';
import { acceptAllExceptSingleSpecialCharacter, checkSpacesInString, checkWhiteSpaces, hashValidation, maxLength25, required, maxLength9 } from '../../../helper/validation';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from "react-hook-form";
import { createOutsourcing, getOutsourcing, updateOutsourcing } from '../actions/Outsourcing';
import Button from '../../layout/Button';
const AddOutsourcing = (props) => {
    const { isEditMode, outsourcing_Id, isViewMode } = props;
    const dispatch = useDispatch();
    const [outsourcingId, setOutsourcingId] = useState('');
    const [dataToCheck, setDataToCheck] = useState([]);
    const [setDisable, setSetDisable] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoader, setIsLoader] = useState(false);

    useEffect(() => {
        getDetail();
    }, []);
    const { register, handleSubmit, formState: { errors }, control, setValue } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const getDetail = () => {
        if (isEditMode || isViewMode) {
            setIsLoader(true);
            setOutsourcingId(outsourcing_Id);
            setTimeout(() => {
                dispatch(getOutsourcing(outsourcing_Id, (res) => {
                    if (res?.data?.Data) {
                        const data = res.data.Data;
                        setDataToCheck(data);
                        setValue('OutsourcingName', data.OutSourcingName);
                        setValue('OutsourcingShortName', data.OutSourcingShortName);
                    }
                }));
                setIsLoader(false);
            }, 300);
        }
    };

    const toggleDrawer = (event, type) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', type);
    };

    /**
    * @method cancel
    * @description used to Reset form
    */
    const cancel = (type, values) => {
        setSetDisable(false);
        toggleDrawer('', type);
    };

    const cancelHandler = () => {
        cancel('cancel');
    };

    const onPopupConfirm = () => {
        cancel('cancel');
        setShowPopup(false);
    };

    const closePopUp = () => {
        setShowPopup(false);
    };
    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    const onSubmit = debounce((values) => {
        const { isEditMode } = props;
        if (isEditMode) {
            if (dataToCheck.OutSourcingName === values?.OutsourcingName && dataToCheck.OutSourcingShortName === values?.OutsourcingShortName) {
                Toaster.warning('Please change the data to save Out Sourcing Details');
                return false;
            }
            setSetDisable(true);
            const formData = {
                OutSourcingId: outsourcingId,
                OutSourcingName: values.OutsourcingName,
                OutSourcingShortName: values?.OutsourcingShortName,
                LoggedInUserId: loggedInUserId(),
            };
            dispatch(updateOutsourcing(formData, (res) => {
                setSetDisable(false);
                if (res?.Result === true) {
                    Toaster.success(MESSAGES.UPDATE_OUTSOURCING_SUCESS);
                }
                cancel('submit');
            }));
        } else {
            setSetDisable(true);
            const formData = {
                OutSourcingName: values.OutsourcingName,
                OutSourcingShortName: values?.OutsourcingShortName,
                LoggedInUserId: loggedInUserId(),
            };
            dispatch(createOutsourcing(formData, (res) => {
                setSetDisable(false);
                if (res?.data?.Result === true) {
                    Toaster.success(MESSAGES.OUTSOURCING_ADD_SUCCESS);
                    cancel('submit');
                }
            }));
        }
    }, 500);
    /**
    * @method render
    * @description Renders the component
    */

    return (
        <>
            <Drawer
                anchor={props.anchor}
                open={props.isOpen}
            // onClose={(e) => toggleDrawer(e)}
            >
                {isLoader && <LoaderCustom />}
                <Container>
                    <div className={"drawer-wrapper"}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Row className="drawer-heading">
                                <Col>
                                    <div className={"header-wrapper left"}>
                                        <h3>{isEditMode ? "Update Out Sourcing" : "Add Out Sourcing"}</h3>
                                    </div>
                                    <div
                                        onClick={cancel}
                                        className={"close-button right"}
                                    ></div>
                                </Col>
                            </Row>
                            <Row className="pl-3">
                                <Col md="12">
                                    <TextFieldHookForm
                                        label={`Outsourcing Name`}
                                        name={"OutsourcingName"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: true,
                                            validate: { required, checkWhiteSpaces, maxLength25, acceptAllExceptSingleSpecialCharacter, checkSpacesInString, hashValidation }
                                        }}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.OutsourcingName}
                                        disabled={isViewMode}
                                        placeholder={isEditMode ? '-' : "Enter"}
                                    />
                                </Col>
                                <Col md="12">
                                    <TextFieldHookForm
                                        label={`Outsourcing Short Name`}
                                        name={"OutsourcingShortName"}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: true,
                                            validate: { required, checkWhiteSpaces, maxLength9, acceptAllExceptSingleSpecialCharacter, checkSpacesInString, hashValidation }
                                        }}
                                        mandatory={true}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.OutsourcingShortName}
                                        disabled={isViewMode}
                                        placeholder={isEditMode ? '-' : "Enter"}
                                    />
                                </Col>
                            </Row>

                            <Row className="sf-btn-footer no-gutters justify-content-between px-3">
                                <div className="col-sm-12 text-right px-3">
                                    <Button
                                        id="addOutsourcing_cancel"
                                        className=" mr15 cancel-btn mt-0"
                                        variant={"cancel-btn"}
                                        disabled={setDisable}
                                        onClick={cancelHandler}
                                        icon={"cancel-icon"}
                                        buttonName={"Cancel"}
                                    />
                                    <Button
                                        id="addOutsourcing_updateSave"
                                        type="submit"
                                        className="mr5"
                                        disabled={setDisable || isViewMode}
                                        icon={"save-icon"}
                                        buttonName={isEditMode ? "Update" : "Save"}
                                    />
                                </div>
                            </Row>
                            {
                                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.CANCEL_MASTER_ALERT}`} />
                            }
                        </form>
                    </div>
                </Container>
            </Drawer>
        </>
    );
}

export default AddOutsourcing