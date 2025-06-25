import React, { useEffect } from "react";
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from "react-hook-form";

function GraphOptionsList(props) {
  const { register, control, setValue } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    setValue('singleDropDown', { label: props?.dropDownOptions?.[0]?.label, value: props?.dropDownOptions?.[0]?.value })
  }, [])

  const valueChanged = (event) => {
    props.valueChanged(event)
  }

  return (
    <div className="ag-grid-multi">
      <SearchableSelectHookForm
        label={false}
        name={"singleDropDown"}
        placeholder={"Select"}
        Controller={Controller}
        control={control}
        rules={{ required: false }}
        register={register}
        options={props?.dropDownOptions}
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

export default GraphOptionsList;