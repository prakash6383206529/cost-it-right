import React, { useEffect } from "react";
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { Controller, useForm } from "react-hook-form";

function GraphOptionsList(props) {

  const { register, control, setValue } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const dropdownOptions = [
    { label: "Bar Chart", value: "1" },
    { label: "Line Chart", value: "2" },
    { label: "Pie Chart", value: "3" },
  ]

  useEffect(() => {
    setValue('singleDropDown', { label: "Bar Chart", value: "1" })
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

export default GraphOptionsList;