import React from "react";
import Select from "react-select";
import "./formInputs.css";

export const TextFieldHookForm = (field) => {
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""}`;
  const isDisabled = field.disabled === true ? true : false;
  return (
    <>
      <div className={className}>
        <label>
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <Controller
          name={name}
          control={control}
          rules={rules}
          ref={register}
          defaultValue={defaultValue}
          render={field => (
            <input
              {...field}
              className={InputClassName}
              disabled={isDisabled}
            />
          )}
        />
        <div className="text-help">{errors && (errors.message || errors.type) ? (errors.message || errors.type) : ""}</div>
      </div>
    </>
  )
}

export const SearchableSelectHookForm = (field) => {
  console.log('field: ', field);
  const { name, label, Controller, mandatory, disabled, options, handleChange, rules, placeholder, defaultValue,
    isClearable, control, errors, register } = field;
  let isDisable = (disabled && disabled === true) ? true : false;

  return (
    <div className="w-100">
      <label>
        {label}
        {mandatory && mandatory === true ? <span className="asterisk-required">*</span> : ''}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        ref={register}
        defaultValue={defaultValue}
        render={({ onChange, onBlur, value, name }) => {
          return (
            <Select
              name={name}
              placeholder={placeholder}
              disabled={isDisable}
              onChange={(e) => {
                handleChange(e);
                onChange(e)
              }}
              options={options}
              onBlur={onBlur}
              //selected={value}
              value={value}
            />
          )
        }}
      />
      <div className="text-help">{errors && errors.type === 'required' ? 'This field is required' : ""}</div>
    </div>
  )
}
