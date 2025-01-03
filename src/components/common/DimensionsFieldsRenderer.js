import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import { Controller, useForm } from 'react-hook-form';
import TooltipCustom from '../common/Tooltip';
import { TextFieldHookForm } from '../layout/HookFormInputs';
import { number, checkWhiteSpaces, maxLength7 } from '../../helper';
import { useTranslation } from 'react-i18next';
import FormFieldsRenderer from './FormFieldsRenderer';
import { Drawer } from '@material-ui/core';
import Button from '../layout/Button';
import { handleTruckDimensions } from '../masters/actions/Freight';
import { useDispatch } from 'react-redux';
import { MESSAGES } from '../../config/message';
import Toaster from './Toaster';

const DimensionsFieldsRenderer = ({ 
    cancelHandler,
    isOpen
}) => {
    const { register, handleSubmit, formState: { errors }, control, setValue, getValues, reset } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const { t } = useTranslation('MasterLabels');
    const dispatch = useDispatch();
    const dimensionFields = [
        { 
            label: t('LengthLabel', { defaultValue: 'Length' }), 
            name: 'Length', 
            mandatory: true,
            disabled: false,
        },
        { 
            label: t('BreadthLabel', { defaultValue: 'Breadth' }), 
            name: 'Breadth', 
            mandatory: true,
            disabled: false,
        },
        { 
            label: t('HeightLabel', { defaultValue: 'Height' }), 
            name: 'Height', 
            mandatory: true,
            disabled: false,
        }
    ];

    const onSubmit = (data) => {
        let formData = {
            ...data,
            length: data?.Length,
            breadth: data?.Breadth,
            height: data?.Height
        }
        dispatch(handleTruckDimensions(formData, true, (res) => {
            if (res.data.Result) {
                Toaster.success(MESSAGES.TRUCK_DIMENSIONS_UPDATE_SUCCESS);
                cancelHandler('Save');
            }
        }));
    }

    const fieldProps = {
        fields: dimensionFields,
        control: control,
        register: register,
        errors: errors,
    }
    const buttonProps={

    }

    return (
        <Drawer
            anchor={'right'}
            open={isOpen}
        >
            <Container>
                <div className={"drawer-wrapper drawer-700px"}>
                    <form
                        noValidate
                        className="form"
                        onSubmit={handleSubmit(onSubmit)}
                        onKeyDown={(e) => { this.handleKeyDown(e, this.onSubmit.bind(this)); }}
                    >
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3> Add Dimensions</h3>
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
                                    buttonName="SAVE"
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