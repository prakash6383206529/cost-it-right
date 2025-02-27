import React, { useEffect, useState } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { Controller, useForm } from 'react-hook-form';
import TooltipCustom from '../common/Tooltip';
import { TextFieldHookForm } from '../layout/HookFormInputs';
import { number, checkWhiteSpaces, maxLength7, loggedInUserId } from '../../helper';
import { useTranslation } from 'react-i18next';
import FormFieldsRenderer from './FormFieldsRenderer';
import { Drawer } from '@material-ui/core';
import Button from '../layout/Button';
import { getTruckDimensionsById, handleTruckDimensions, saveAndUpdateTruckDimensions } from '../masters/actions/Freight';
import { useDispatch } from 'react-redux';
import { MESSAGES } from '../../config/message';
import Toaster from './Toaster';
import LoaderCustom from './LoaderCustom';

const DimensionsFieldsRenderer = ({
    cancelHandler,
    isOpen,
    truckDimensionId,
    isEditDimension
}) => {
    const { register, handleSubmit, formState: { errors }, control, setValue, getValues, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { t } = useTranslation('MasterLabels');
    const dispatch = useDispatch();
    const isSubmitting = React.useRef(false);
    const [state, setState] = useState({
        isLoader: false
    });
    const dimensionFields = [
        {
            label: t('LengthLabel', { defaultValue: 'Length (mm)' }),
            name: 'Length',
            mandatory: true,
            disabled: false,
            handleChange: (e) => {
                setValue('Length', e.target.value);
            },
            defaultValue: 0
        },
        {
            label: t('BreadthLabel', { defaultValue: 'Breadth (mm)' }),
            name: 'Breadth',
            mandatory: true,
            disabled: false,
            handleChange: (e) => {
                setValue('Breadth', e.target.value);
            },
            defaultValue: 0
        },
        {
            label: t('HeightLabel', { defaultValue: 'Height (mm)' }),
            name: 'Height',
            mandatory: true,
            disabled: false,
            handleChange: (e) => {
                setValue('Height', e.target.value);
            },
            defaultValue: 0
        }
    ];
    useEffect(() => {
        if (isEditDimension && truckDimensionId) {
            setState(prev => ({ ...prev, isLoader: true }));
            dispatch(getTruckDimensionsById(truckDimensionId, (res) => {
                setState(prev => ({ ...prev, isLoader: false }));
                let data = res?.data?.DataList[0];
                setValue('Length', data?.Length);
                setValue('Breadth', data?.Breadth);
                setValue('Height', data?.Height);
            }));
        }
    }, [isEditDimension, truckDimensionId]);

    const onSubmit = (data) => {
        // Prevent multiple submissions
        if (isSubmitting.current) return;
        isSubmitting.current = true;
        let formData = {
            ...data,
            loggedInUserId: loggedInUserId(),
            Length: data?.Length,
            Breadth: data?.Breadth,
            Height: data?.Height,
            DimensionsId: isEditDimension ? truckDimensionId : null
        }
        setState(prev => ({ ...prev, isLoader: true }));
        dispatch(saveAndUpdateTruckDimensions(formData, (res) => {
            if (res?.data?.Result) {
                formData.Id = res.data.Identity
                Toaster.success(isEditDimension ? MESSAGES.TRUCK_DIMENSIONS_UPDATE_SUCCESS : MESSAGES.TRUCK_DIMENSIONS_ADD_SUCCESS);
                cancelHandler('Save',formData);
            }else{
                Toaster.warning(res?.data?.Message)
            }
            setState(prev => ({ ...prev, isLoader: false }));
            isSubmitting.current = false;
        }));
    }

    const fieldProps = {
        control: control,
        register: register,
        errors: errors,
    }
    const buttonProps = {

    }

    return (
        <Drawer
            anchor={'right'}
            open={isOpen}
        >
            {state.isLoader && <LoaderCustom customClass={"loader-center"} />}
            <Container>
                <div className={"drawer-wrapper drawer-700px"}>
                    <form
                        noValidate
                        className="form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3> {isEditDimension ? 'Update' : 'Add'} Truck Dimensions</h3>
                                </div>
                                <div
                                    onClick={() => cancelHandler('Cancel')}
                                    className={"close-button right"}
                                ></div>
                            </Col>
                        </Row>

                        <Row className={"mb-3"}>
                            <FormFieldsRenderer
                                fieldProps={fieldProps}
                                fields={dimensionFields}
                                buttonProps={buttonProps}
                            />
                        </Row>

                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="text-right w-100 p-0">
                                <Button
                                    id="DimensionsFields_cancel"
                                    variant="mr15 cancel-btn"
                                    buttonName="CANCEL"
                                    icon="cancel-icon"
                                    onClick={() => cancelHandler('Cancel')}
                                />
                                <Button
                                    id="DimensionsFields_save"
                                    type="submit"
                                    className="save-btn"
                                    icon="save-icon"
                                    buttonName={isEditDimension ? 'UPDATE' : 'SAVE'}
                                />
                            </div>
                        </Row>

                    </form>
                </div>
            </Container>
        </Drawer>
    );
};

export default DimensionsFieldsRenderer; 