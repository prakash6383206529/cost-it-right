import React from 'react';
import { Row, Col } from 'reactstrap';
import { Controller } from 'react-hook-form';
import TooltipCustom from '../common/Tooltip';
import { SearchableSelectHookForm, TextFieldHookForm } from '../layout/HookFormInputs';
import { number, checkWhiteSpaces, decimalIntegerNumberLimit, nonZero } from '../../helper';

const FormFieldsRenderer = ({ fields, fieldProps, buttonProps,children }) => {
    const { control, register, errors, containerClassName = "", colSize } = fieldProps;
    // const { buttonProps } = buttonProps;
    return (
        <Row className={containerClassName}>
            {fields.map(item => {
                const { tooltip, name, label } = item || {};
                return (
                    <Col md={colSize ?? '4'} key={name}>
                        {item?.tooltip && (
                            <TooltipCustom
                                width={tooltip?.width}
                                tooltipClass={tooltip?.className ?? ''}
                                disabledIcon={tooltip?.disabled ?? true}
                                id={item.name}
                                tooltipText={!tooltip?.disabled ? tooltip.text : `${item.label} = ${tooltip.text ?? ''}`}
                            />
                        )}
                        {item?.searchable ? (
                            <SearchableSelectHookForm
                                label={label}
                                id={name}
                                name={name}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={item.mandatory}
                                rules={{ required: item.mandatory }}
                                placeholder={'Select'}
                                options={item.options || []}
                                handleChange={item.handleChange ? item.handleChange : () => { }}
                                value={item.value}
                                disabled={item.disabled}
                                errors={errors[name]}
                            />
                        ) : (
                            <TextFieldHookForm
                                label={label}
                                id={name}
                                name={name}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={item.mandatory}
                                rules={{
                                    required: item.mandatory,
                                    validate: item.disabled ? {} : { nonZero, decimalIntegerNumberLimit: decimalIntegerNumberLimit(10, 2), number, checkWhiteSpaces },
                                    max: item.percentageLimit ? {
                                        value: 100,
                                        message: 'Percentage value should be equal to 100'
                                    } : {},
                                }}
                                handleChange={item.handleChange ? item.handleChange : () => { }}
                                defaultValue={item.disabled ? 0 : ''}
                                className=""
                                customClassName={'withBorder'}
                                errors={errors[name]}
                                disabled={item.disabled}
                            />
                        )}
                    </Col>
                );
            })}
            {children}
        </Row>
    );
};

export default FormFieldsRenderer; 