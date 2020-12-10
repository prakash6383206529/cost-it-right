import React from "react";
import Select from "react-select";
import "./formInputs.css";

export const TextFieldHooks = (input) => {
  console.log('input: ', input);
  const { register, rules, name, label, mandatory, errors, disabled, value, ...inputProps } = input;
  const isDisabled = disabled === true ? true : false;
  const className = `form-group inputbox ${input.customClassName ? input.customClassName : ""}`;
  const InputClassName = `form-control ${input.className ? input.className : ""}`;
  return (
    <>
      <div className={className}>
        <label>
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <input
          name={name}
          ref={register}
          className={InputClassName}
          disabled={isDisabled}
          value={value}
          rules={rules}
          {...inputProps}
        />
        {errors && (errors.message || errors.type) ? <div className="text-help">{(errors.message || errors.type)}</div> : ""}
      </div>
    </>
  )
}

export const TextFieldHookForm = (field) => {
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange } = field
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
          render={({ onChange, onBlur, value, name }) => {
            return (
              <input
                {...field}
                name={name}
                className={InputClassName}
                disabled={isDisabled}
                value={value}
                onChange={(e) => {
                  handleChange(e);
                  onChange(e)
                }}
              />
            )
          }
          }
        />
        {errors && (errors.message || errors.type) ? <div className="text-help">{(errors.message || errors.type)}</div> : ""}
      </div>
    </>
  )
}

export const SearchableSelectHookForm = (field) => {
  const { name, label, Controller, mandatory, disabled, options, handleChange, rules, placeholder, defaultValue,
    isClearable, control, errors, register } = field;
  let isDisable = (disabled && disabled === true) ? true : false;
  console.log(defaultValue,"hook form");

  return (
    <div className="w-100 mb-15">
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
      {errors && errors.type === 'required' ? <div className="text-help">'This field is required'</div> : ""}
      {/* {errors && errors.type === 'required' ? '<div className="text-help">This field is required</div>' : ""} */}
    </div>
  )
}


/*
@method: renderTextAreaField
@desc: Render textarea input
*/
export const TextAreaHookForm = (field) => {
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange } = field
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
          render={({ onChange, onBlur, value, name }) => {
            return (
              <textarea
                {...field}
                name={name}
                className={InputClassName}
                disabled={isDisabled}
                value={value}
                onChange={(e) => {
                  handleChange(e);
                  onChange(e)
                }}
              />
            )
          }
          }
        />
        {errors && (errors.message || errors.type) ? <div className="text-help">{(errors.message || errors.type)}</div> : ""}
      </div>
    </>
  )
}


/**
* @method:RadioHookForm
* @desc: render radio button
*/
// import Typography from "../typography";
// import "./radioButtons.less";
export const RadioHookForm = ({
    dataArray = [],
    label = "label",
    optionsValue = "optionsValue",
    labelElement = '',
    className,
    selectedValue = "",
    register,
    name,
    onChange = null,
    // disable = false
}) => {
    const onChangeSelect = (val) => {
        onChange && onChange(val);
    };
    const flexContainer = {
     display: 'flex',
     flexDirection: 'row',
     padding: '10px 30px'
   };
    return (
        <div className={`te-radio-button ${className}`}>
          <div>
               {dataArray && dataArray.length !== 0 && (
                 <ul style={flexContainer} className={"radio-button-list"}>
                    {dataArray.map((data, index) => {
                      return (
                            <li style={{padding:'10px'}} key={index}>
                               <label className="radio-button-wrapper">
                                    <input
                                        name={name}
                                        type="radio"
                                        value={data[optionsValue]}
                                        ref={register}
                                        onChange={e =>
                                            onChangeSelect(
                                                e.target.value
                                            )
                                        }
                                    />
                                    {" "}
                                    {data[label]}
                                    {/* {data[labelElement] && data[labelElement]} */}
                                    <span className="radio-label"></span>
                                </label>
                            </li>)
                      })
                    }
                 </ul>
                )}
            </div>
        </div>
    );
};




// export const RadioHookForm = (field) => {
//   const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange } = field
//   const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
//   const InputClassName = `form-control ${field.className ? field.className : ""}`;
//   const isDisabled = field.disabled === true ? true : false;
//   return (
//     <>
//       <div 
//       //className={className}
//       >
//         <label>
//           {label}
//           {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
//         </label>
//         <Controller
//           name={name}
//           control={control}
//           rules={rules}
//           ref={register}
//           defaultValue={defaultValue}
//           render={({ onChange, onBlur, value, name }) => {
//             return (
//               <input
//                 {...field}
//                 type="radio"
//                 name={name}
//                 // className={InputClassName}
//                 disabled={isDisabled}
//                 value={value}
//                 onChange={(e) => {
//                   handleChange(e);
//                   onChange(e)
//                 }}
//               />
//             )
//           }
//           }
//         />
//         {errors && (errors.message || errors.type) ? <div className="text-help">{(errors.message || errors.type)}</div> : ""}
//       </div>
//     </>
//   )
// }