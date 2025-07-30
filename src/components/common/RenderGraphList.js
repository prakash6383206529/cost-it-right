import React, { useEffect, useState } from "react";
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from "react-hook-form";
import { Col, Row } from "reactstrap";

function RenderGraphList(props) {

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dropdownOptions = [
        { label: "Line Chart", value: "1" },
        { label: "Bar Chart", value: "2" },
        { label: "List", value: "3" },
    ]

    useEffect(() => {
        setValue('singleDropDown', { label: "Line Chart", value: "1" })
    }, [])

    const valueChanged = (event) => {
        props?.valueChanged?.(event)
    }

    return (
        <div className="ag-grid-multi">
            <SearchableSelectHookForm
                label={""}
                name={"singleDropDown"}
                placeholder={"Select"}
                Controller={Controller}
                control={control}
                rules={{ required: false }}
                // onFocus={onFocus}
                register={register}
                options={dropdownOptions}
                isMulti={false}
                mandatory={false}
                dropDownClass={true}
                handleChange={(e) => {
                    valueChanged(e)
                }}
                customClassName={'mb-0'}
            />
        </div>

    )
}

export default RenderGraphList;