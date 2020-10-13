import React from "react";
import "./formInputs.css";

export function TextFieldHookForm(field) {
  const { label, register, name, defaultValue, required, errors } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""}`;
  console.log('field: ', field);
  return (
    <>
      <div className={className}>
        <label>
          {label}
          {required && required === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <input
          name={name}
          ref={register}
          defaultValue={defaultValue}
          className={InputClassName}
        />
        <div className="text-help">{errors ? errors.message : ""}</div>
      </div>
    </>
  )
}