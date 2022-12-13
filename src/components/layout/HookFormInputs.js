import React from "react";
import Select, { createFilter } from "react-select";
import "./formInputs.css";
import ReactDatePicker from 'react-datepicker'
import AsyncSelect from 'react-select/async';
import LoaderCustom from "../common/LoaderCustom";
import { SPACEBAR } from "../../config/constants";

export const TextFieldHooks = (input) => {

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
          {...input}
          name={name}
          ref={register}
          className={InputClassName}
          disabled={isDisabled}
          value={value}
          rules={rules}
          {...inputProps}
          autoComplete={'off'}
        />
        {errors && (errors.message || errors.type) ? <div className="text-help">{(errors.message || errors.type)}</div> : ""}
      </div>
    </>
  )
}

const errorFunc = (errors, field) => {
  switch (errors?.type) {
    case "maxLength":
      return <div className="text-help">Maximum length is {field?.rules?.maxLength}</div>

    case "required":
      return <div className="text-help">This field is required</div>

    default:
      return <div className="text-error-title"><div className="text-help">{(errors?.message || errors?.type)}</div>
        <div className="error-overflow">{(errors?.message || errors?.type)}</div> </div>
  }
}

export const TextFieldHookForm = (field) => {
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange, hidden, isLoading, disableErrorOverflow, id } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""}`;
  const isDisabled = field.disabled === true ? true : false;
  let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  let loaderClass = isLoading && isLoading?.isLoader ? isLoading?.loaderClass !== undefined ? isLoading?.loaderClass : '' : '';

  return (
    <>
      <div className={className}>
        {
          !hidden &&
          <label>
            {label}
            {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
          </label>
        }
        <div id={id}>
          <Controller
            name={name}
            control={control}
            rules={rules}
            // ref={reg}
            {...register}
            defaultValue={defaultValue}
            hidden={hidden}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <div className={`${isLoader ? "p-relative" : ''}`}>
                  <input
                    {...field}
                    {...register}
                    name={name}
                    className={InputClassName}
                    disabled={isDisabled}
                    placeholder={isDisabled ? '-' : 'Enter'}
                    value={value}
                    onChange={(e) => {
                      handleChange(e);
                      onChange(e)
                    }}
                    hidden={hidden}
                    autoComplete={'off'}
                  />
                  {isLoader && <LoaderCustom customClass={`input-loader ${loaderClass}`} />}
                </div>
              )
            }
            }
          />
        </div>
        {errorFunc(errors, field)}
      </div>
    </>
  )
}


export const PasswordFieldHookForm = (field) => {
  const { label, Controller, control, register, name, defaultValue, mandatory, errors, rules, handleChange, hidden, isLoading, active, touched, error, input, disableErrorOverflow } = field
  // //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  // const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
  // const InputClassName = `form-control ${field.className ? field.className : ""}`;
  // const isDisabled = field.disabled === true ? true : false;
  // let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  // let loaderClass = isLoading && isLoading?.isLoader ? isLoading?.loaderClass !== undefined ? isLoading?.loaderClass : '' : '';



  const inputbox = `inputbox input-group ${active ? "active" : ""}`;
  const className = `form-group ${field.customClassName ? field.customClassName : ""
    } ${touched && error ? "has-danger" : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""
    }`;
  const placeholder = field.placeholder ? field.placeholder : "";
  const isPwdVisible = field.isShowHide === true ? "text" : "password";
  const eyeIcon = field.isShowHide === true ? "fa-eye" : "fa-eye-slash";




  return (
    <>
      <div className={className}>
        {
          !hidden &&
          <label>
            {label}
            {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
          </label>
        }
        <Controller
          name={name}
          control={control}
          rules={rules}
          // ref={reg}
          {...register}
          defaultValue={defaultValue}
          hidden={hidden}
          render={({ field: { onChange, onBlur, value } }) => {

            return (
              <div className={className}>
                <div className={inputbox}>
                  <input
                    maxLength={field.maxLength}
                    onChange={(e) => {
                      handleChange(e);
                      onChange(e)
                    }}
                    value={value}
                    {...field}
                    {...register}
                    name={name}
                    className={InputClassName}

                    type={isPwdVisible}
                    {...input}
                    id={"password"}
                    placeholder={placeholder}
                    autoComplete={field.autoComplete}
                  />
                  {field.isEyeIcon === true && (
                    <div
                      className={`input-group-prepend ${field.isShowHide === true ? "hide" : "show"
                        }`}
                    >
                      <span
                        onClick={field.showHide}
                        className="input-group-text bg-white"
                      >
                        <i className={`fas ${eyeIcon}`} />
                      </span>
                    </div>
                  )}

                  {field.isEyeIcon === false && (
                    <div className="input-group-prepend">
                      <span className="input-group-text bg-white">
                        <i className="fas fa-lock" />
                      </span>
                    </div>
                  )}

                  {field.isVarificationForm === true && (
                    <div className="input-group-prepend">
                      <span className="input-group-text bg-white"></span>
                    </div>
                  )}
                </div>
                <div className="text-help mb-2">{touched ? error : ""}</div>
              </div>
            );

          }
          }
        />
        {errors && errors.type === 'required' ? <div className="text-help">This field is required</div>
          : errors && errors.type !== 'required' ? <div className={`${disableErrorOverflow ? '' : "text-error-title"}`}><div className="text-help">{(errors.message || errors.type)}</div>{!disableErrorOverflow && <div className="error-overflow">{(errors.message || errors.type)}</div>} </div> : ''}
      </div>
    </>
  )
}





export const NumberFieldHookForm = (field) => {
  const { label, Controller, control, register, defaultValue, mandatory, errors, rules, handleChange, name, placeholder, disableErrorOverflow, id } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""}`;
  const InputClassName = `form-control ${field.className ? field.className : ""}`;
  const isDisabled = field.disabled === true ? true : false;

  return (
    <>
      <div className={className} >
        <label>
          {label}
          {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <div id={id}>
          <Controller
            name={name}
            control={control}
            rules={rules}
            {...register}
            defaultValue={defaultValue}
            render={({ field: { onChange, onBlur, value, name } }) => {
              return (
                <input
                  {...field}
                  {...register}
                  type={'number'}
                  name={name}
                  className={InputClassName}
                  disabled={isDisabled}
                  value={value}
                  placeholder={placeholder ? placeholder : isDisabled ? '-' : 'Enter'}
                  autoComplete={'off'}
                  onChange={(e) => {
                    handleChange(e);
                    onChange(e)
                  }}
                />
              )
            }
            }
          />
        </div>


        {errors && errors.type === 'required' ? <div className="text-help">This field is required</div>
          : errors && errors.type !== 'required' ? <div className={`${disableErrorOverflow ? '' : "text-error-title"}`}><div className="text-help">{(errors.message || errors.type)}</div>{!disableErrorOverflow && <div className="error-overflow">{(errors.message || errors.type)}</div>} </div> : ''}
      </div>
    </>
  )
}

export const SearchableSelectHookForm = (field) => {
  const { name, label, Controller, mandatory, disabled, options, handleChange, rules, placeholder, defaultValue,
    control, errors, register, isLoading, customClassName, isMulti, buttonCross, title, dropdownHeight, dropDownClass, onFocus } = field;
  let isDisable = (disabled && disabled === true) ? true : false;
  let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  let isMultiple = (isMulti === true) ? true : false;
  const className = `${isLoader ? 'p-relative' : ''} ${buttonCross ? 'cross-btn-container' : ''}`
  let temp = 300;
  if (dropdownHeight < 6) {
    if (dropdownHeight === 0) {
      temp = 128
    }
    else {
      temp = dropdownHeight * 39;
    }
  }
  const onFocusChange = () => {
    onFocus && onFocus()
  }
  const customStyles = {
    menuList: (provided) => ({
      ...provided,
      maxHeight: temp,
      left: 0,
      overflowX: 'hidden'
    }),
    menu: (provided) => ({
      ...provided,
      marginTop: "7px",
      left: 0,
      top: 44,
      marginRight: "5px",
      marginLeft: "5px",
      width: 'calc(100% - 10px)',
    }),
  };
  const filterConfig = {
    stringify: option => `${option.label}`,
  };
  return (
    <div className={`w-100 mb-15 form-group-searchable-select ${customClassName}`}>
      <label>
        {label}
        {mandatory && mandatory === true ? <span className="asterisk-required">*</span> : ''}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        {...register}
        defaultValue={defaultValue}
        render={({ field: { onChange, onBlur, value, name, } }) => {
          return (
            <div className={className} title={title}>
              <Select
                {...field}
                {...register}
                name={name}
                placeholder={placeholder ? placeholder : isDisable ? '-' : 'Select'}
                isDisabled={isDisable}
                onChange={(e, action) => {
                  handleChange(e, action);
                  onChange(e)

                }}
                menuPlacement="auto"
                styles={dropDownClass && customStyles}
                onFocus={onFocusChange}
                options={options}
                onBlur={onBlur}
                selected={value}
                value={value}
                isLoading={isLoader}
                isMulti={isMultiple}
                onKeyDown={(onKeyDown) => {
                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                }}
                filterOption={createFilter(filterConfig)}
              />
              {isLoader && <LoaderCustom customClass={"input-loader"} />}
              {buttonCross && <button type="button" className={'btn-cross'} disabled={isDisable} onClick={buttonCross}>
                <div className='cross-light'></div>
              </button>}
            </div>
          )

        }}
      />

      {/* {errors && errors.type === 'required' ? <div className="text-help">'This field is required'</div> : ""} */}
      {/* {errors && errors.type === 'required' ? '<div className="text-help">This field is required</div>' : ""} */}
      {errors && errors.type === 'required' ? <div className="text-help">This field is required</div>
        : errors && errors.type !== 'required' ? <div className="text-help">{(errors.message || errors.type)}</div> : ''}

    </div>
  )
}

const errorAreaFunc = (errors, field) => {
  switch (errors?.type) {
    case "maxLength":
      return <div className="text-help">Maximum length is {field?.rules?.maxLength}</div>

    case "required":
      return <div className="text-help">This field is required</div>

    default:
      return <div className="text-error-title"><div className="text-help">{(errors?.message || errors?.type)}</div>
        <div className="error-overflow">{(errors?.message || errors?.type)}</div> </div>
  }
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
          {...register}
          defaultValue={defaultValue}
          render={({ field: { onChange, onBlur, value, name } }) => {
            return (
              <textarea
                {...field}
                {...register}
                name={name}
                className={InputClassName}
                disabled={isDisabled}
                value={value}
                autoComplete={'off'}
                onChange={(e) => {
                  handleChange(e);
                  onChange(e)
                }}
              />
            )
          }
          }
        />
        {errorAreaFunc(errors, field)}
      </div>
    </>
  )
}

/*
@method: YearPickerHookForm
@desc: Render yearPicker input
*/
export const DatePickerHookForm = (field) => {
  const {
    label, Controller, control, register, name, defaultValue, mandatory, errors, rules, placeholder, handleChange } = field
  //const className = `form-group inputbox ${field.customClassName ? field.customClassName : ""} ${touched && error ? "has-danger" : ""}`;
  const className = `form-group inputbox ${field.customClassName ? field.customClassName : ''}`
  const isDisabled = field.disabled === true ? true : false
  return (
    <React.Fragment>
      <div className={className}>
        <label>
          {label} {mandatory && mandatory === true ? (<span className="asterisk-required">*</span>) : ("")}{" "}
        </label>
        <Controller
          name={name}
          control={control}
          rules={rules}
          {...register}
          defaultValue={defaultValue}
          render={({ field: { onChange, onBlur, value, name } }) => (

            // return (
            <ReactDatePicker
              {...field}
              {...register}
              name={name}
              value={value}
              dateFormat="dd/MM/yyyy"
              placeholderText={placeholder}
              //maxDate={new Date()}
              //minDate={new Date()}
              showMonthDropdown
              showYearDropdown
              readonly="readonly"
              onBlur={() => null}
              selected={value}
              className={field.className}
              onChange={(e) => {
                onChange(e)
                handleChange(e)
                // onselect(e)
              }}
              autoComplete={field.autoComplete}
              disabledKeyboardNavigation
              disabled={isDisabled}
            />
            // )
          )}
        />
        {errors && errors.type === 'required' ? <div className="text-help">This field is required</div>
          : errors && errors.type !== 'required' ? <div className="text-help">{(errors.message || errors.type)}</div> : ''}
      </div>
    </React.Fragment>
  )
}

/**
* @method:RadioHookForm
* @desc: render radio button
*/
// import Typography from "../typography";
// import "./radioButtons.less";
export const RadioHookForm = (field) => {
  const { dataArray = [], label = "label", optionsValue = "optionsValue", labelElement = '', className, selectedValue = "", register, name, onChange = null, defaultValue } = field

  const onChangeSelect = (val) => {
    onChange && onChange(val);
  };
  const flexContainer = {
  };
  return (
    <div className={`te-radio-button ${className}`}>
      <div>
        {dataArray && dataArray.length !== 0 && (
          <ul style={flexContainer} className={"radio-button-list d-flex"}>
            {dataArray.map((data, index) => {
              return (
                <li className="p-3" key={index}>
                  <label className="radio-button-wrapper radio-box">
                    <input
                      {...field}
                      {...register}
                      name={name}
                      type="radio"
                      value={data[optionsValue]}
                      defaultValue={defaultValue}
                      checked={defaultValue}
                      onChange={e =>
                        onChangeSelect(
                          e.target.value
                        )
                      }
                    />
                    {" "}
                    {/* {data[labelElement] && data[labelElement]} */}
                    <span className="radio-label">{data[label]}</span>
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

export const AsyncSearchableSelectHookForm = (field) => {
  const { name, label, Controller, mandatory, disabled, handleChange, rules, placeholder, defaultValue,
    control, errors, register, isLoading, customClassName, asyncOptions, NoOptionMessage } = field;

  let isLoader = (isLoading && isLoading?.isLoader === true) ? true : false;
  let isLoaderClass = isLoading && isLoading?.isLoader ? isLoading?.isLoaderClass !== undefined ? isLoading?.isLoaderClass : '' : '';

  return (
    <div className={`w-100 mb-15 form-group-searchable-select ${customClassName}`}>
      <label>
        {label}
        {mandatory && mandatory === true ? <span className="asterisk-required">*</span> : ''}
      </label>
      <Controller

        name={name}
        control={control}
        rules={rules}
        {...register}
        defaultValue={defaultValue}
        render={({ field: { onChange, onBlur, value, name } }) => {
          return (
            <div className={`${isLoader ? "p-relative" : ''}`}>
              <AsyncSelect
                {...field}
                {...register}
                name={name}
                placeholder={placeholder}
                isDisabled={disabled}
                onChange={(e) => {
                  handleChange(e);
                  onChange(e)
                }}
                menuPlacement="auto"
                loadOptions={asyncOptions}
                onBlur={onBlur}
                selected={value}
                value={value}
                isLoading={isLoader}
                noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? NoOptionMessage : "No results found"}
                onKeyDown={(onKeyDown) => {
                  if (onKeyDown.keyCode === SPACEBAR && !onKeyDown.target.value) onKeyDown.preventDefault();
                }}
              />
              {isLoader && <LoaderCustom customClass={`input-loader ${isLoaderClass}`} />}
            </div>
          )

        }}
      />

      {/* {errors && errors.type === 'required' ? <div className="text-help">'This field is required'</div> : ""} */}
      {/* {errors && errors.type === 'required' ? '<div className="text-help">This field is required</div>' : ""} */}
      {errors && errors.type === 'required' ? <div className="text-help">This field is required</div>
        : errors && errors.type !== 'required' ? <div className="text-help">{(errors.message || errors.type)}</div> : ''}

    </div>
  )
}
